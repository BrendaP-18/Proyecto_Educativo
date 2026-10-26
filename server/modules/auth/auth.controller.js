import { pool } from '../../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_asistencia_escolares_2026';

/**
 * Registro de Usuario
 * Campos en tabla usuario:
 * id_usuario (UUID)
 * id_escuela (UUID)
 * nombre (VARCHAR 100)
 * apellidos (VARCHAR 150)
 * correo (VARCHAR 150, UNIQUE)
 * contrasena (VARCHAR 255)
 * rol (VARCHAR 30) - 'Docente', 'Estudiante', 'Directivo', 'Tutor'
 * estado (VARCHAR 20) - 'Activo'
 * fecha_registro (TIMESTAMP)
 */
export async function register(req, res) {
  try {
    const { nombre, apellidos, correo, contrasena, rol, id_escuela, cct } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, correo electrónico y contraseña son campos obligatorios.'
      });
    }

    // Normalizar correo
    const emailNorm = correo.trim().toLowerCase();

    // Validar si el usuario ya existe
    const userCheck = await pool.query('SELECT id_usuario FROM usuario WHERE LOWER(correo) = $1', [emailNorm]);
    if (userCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta registrada con este correo electrónico.'
      });
    }

    // Resolver id_escuela si no viene dado pero se proporcionó cct
    let escuelaId = id_escuela || null;
    if (!escuelaId && cct) {
      const escRes = await pool.query('SELECT id_escuela FROM escuelas WHERE UPPER(cct) = UPPER($1) LIMIT 1', [cct.trim()]);
      if (escRes.rows.length > 0) {
        escuelaId = escRes.rows[0].id_escuela;
      }
    }

    // Si aún no hay escuela, asociarlo a la primera escuela por defecto
    if (!escuelaId) {
      const defaultEsc = await pool.query('SELECT id_escuela FROM escuelas LIMIT 1');
      if (defaultEsc.rows.length > 0) {
        escuelaId = defaultEsc.rows[0].id_escuela;
      }
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(contrasena, salt);

    // Insertar en la tabla usuario
    const newUserQuery = `
      INSERT INTO usuario (
        id_escuela, nombre, apellidos, correo, contrasena, rol, estado, fecha_registro
      ) VALUES ($1, $2, $3, $4, $5, $6, 'Activo', NOW())
      RETURNING id_usuario, id_escuela, nombre, apellidos, correo, rol, estado, fecha_registro
    `;

    const result = await pool.query(newUserQuery, [
      escuelaId,
      nombre.trim(),
      apellidos ? apellidos.trim() : '',
      emailNorm,
      passwordHash,
      rol || 'Docente'
    ]);

    const createdUser = result.rows[0];

    // Si el rol es Docente o Estudiante, podemos opcionalmente registrar en su tabla específica
    if (createdUser.rol.toLowerCase().includes('docente') || createdUser.rol.toLowerCase().includes('profesor')) {
      try {
        await pool.query(`
          INSERT INTO docentes (id_usuario, id_escuela, especialidad, estado)
          VALUES ($1, $2, 'Educación General', 'Activo')
        `, [createdUser.id_usuario, escuelaId]);
      } catch (docErr) {
        console.warn('Nota: No se pudo auto-insertar en tabla docentes:', docErr.message);
      }
    }

    // Generar JWT Token
    const token = jwt.sign(
      { id_usuario: createdUser.id_usuario, rol: createdUser.rol, correo: createdUser.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: '¡Registro exitoso!',
      token,
      user: {
        id: createdUser.id_usuario,
        id_escuela: createdUser.id_escuela,
        name: `${createdUser.nombre} ${createdUser.apellidos}`.trim(),
        nombre: createdUser.nombre,
        apellidos: createdUser.apellidos,
        email: createdUser.correo,
        role: createdUser.rol,
        estado: createdUser.estado
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar el usuario: ' + error.message
    });
  }
}

/**
 * Inicio de Sesión (Login)
 */
export async function login(req, res) {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor ingresa tu correo electrónico y tu contraseña.'
      });
    }

    const emailNorm = identifier.trim().toLowerCase();

    // Buscar usuario en PostgreSQL con datos de su escuela asociada
    const userQuery = `
      SELECT u.id_usuario, u.id_escuela, u.nombre, u.apellidos, u.correo, u.contrasena, u.rol, u.estado,
             e.nombre_escuela, e.cct
      FROM usuario u
      LEFT JOIN escuelas e ON u.id_escuela = e.id_escuela
      WHERE LOWER(u.correo) = $1
      LIMIT 1
    `;

    const userResult = await pool.query(userQuery, [emailNorm]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'No existe una cuenta registrada con este correo electrónico.'
      });
    }

    const user = userResult.rows[0];

    // Verificar si la cuenta está inactiva
    if (user.estado && user.estado.toLowerCase() === 'inactivo') {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta se encuentra inactiva. Contacta a la dirección escolar.'
      });
    }

    // Verificar contraseña con bcrypt
    const isMatch = await bcrypt.compare(password, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta. Por favor verifícala e intenta de nuevo.'
      });
    }

    // Validar rol seleccionado si el usuario no es Administrador
    if (role && user.rol !== 'Administrador') {
      const selectedRoleNorm = role.trim().toLowerCase();
      const userRoleNorm = (user.rol || '').trim().toLowerCase();
      if (!userRoleNorm.includes(selectedRoleNorm)) {
        return res.status(403).json({
          success: false,
          message: `Esta cuenta está registrada como ${user.rol}, no como ${role}. Por favor selecciona tu rol correcto.`
        });
      }
    }

    // Generar Token JWT
    const token = jwt.sign(
      { id_usuario: user.id_usuario, rol: user.rol, correo: user.correo },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: '¡Inicio de sesión exitoso!',
      token,
      user: {
        id: user.id_usuario,
        id_escuela: user.id_escuela,
        name: `${user.nombre} ${user.apellidos || ''}`.trim(),
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.correo,
        role: user.rol,
        escuela: user.nombre_escuela || 'Escuela Registrada',
        cct: user.cct || ''
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al iniciar sesión: ' + error.message
    });
  }
}

/**
 * Obtener perfil de usuario actual con token
 */
export async function getProfile(req, res) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No se proporcionó token de autenticación.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userQuery = `
      SELECT u.id_usuario, u.id_escuela, u.nombre, u.apellidos, u.correo, u.rol, u.estado,
             e.nombre_escuela, e.cct
      FROM usuario u
      LEFT JOIN escuelas e ON u.id_escuela = e.id_escuela
      WHERE u.id_usuario = $1
    `;
    const result = await pool.query(userQuery, [decoded.id_usuario]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    const user = result.rows[0];
    return res.json({
      success: true,
      user: {
        id: user.id_usuario,
        id_escuela: user.id_escuela,
        name: `${user.nombre} ${user.apellidos || ''}`.trim(),
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.correo,
        role: user.rol,
        escuela: user.nombre_escuela,
        cct: user.cct
      }
    });
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado.' });
  }
}
