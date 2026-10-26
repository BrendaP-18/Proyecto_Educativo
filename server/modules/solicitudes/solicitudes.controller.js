import { pool } from '../../db.js';
import bcrypt from 'bcryptjs';

/**
 * 1. Crear solicitud de acceso para escuela (Público desde Login)
 */
export async function crearSolicitud(req, res) {
  try {
    const {
      nombre_escuela,
      cct,
      nivel_educativo,
      turno,
      estado,
      municipio,
      codigo_postal,
      direccion,
      nombre_responsable,
      telefono_responsable,
      correo_institucional,
      contrasena
    } = req.body;

    // Validaciones
    if (!nombre_escuela || !cct || !nombre_responsable || !correo_institucional || !contrasena) {
      return res.status(400).json({
        success: false,
        message: 'Por favor completa todos los campos requeridos.'
      });
    }

    if (contrasena.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe contener al menos 8 caracteres.'
      });
    }

    const cctNorm = cct.trim().toUpperCase();
    const emailNorm = correo_institucional.trim().toLowerCase();

    // Validar si ya existe escuela con esa CCT
    const checkEscuela = await pool.query('SELECT id_escuela FROM escuelas WHERE UPPER(cct) = $1', [cctNorm]);
    if (checkEscuela.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una escuela registrada con esa Clave de Centro de Trabajo (CCT).'
      });
    }

    // Validar si ya hay una solicitud pendiente con esa CCT o correo
    const checkSol = await pool.query(
      `SELECT id_solicitud FROM solicitud_escuela 
       WHERE (UPPER(cct) = $1 OR LOWER(correo_institucional) = $2 OR LOWER(correo_responsable) = $2) 
       AND estado_solicitud IN ('Pendiente', 'En revisión')`,
      [cctNorm, emailNorm]
    );

    if (checkSol.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una solicitud pendiente de revisión para esta escuela o correo institucional.'
      });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passHash = await bcrypt.hash(contrasena, salt);

    const insertQuery = `
      INSERT INTO solicitud_escuela (
        nombre_escuela, cct, nivel_educativo, turno, direccion, municipio, estado,
        codigo_postal, telefono, correo_institucional, nombre_responsable,
        correo_responsable, telefono_responsable, fecha_solicitud, estado_solicitud,
        contrasena_responsable
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), 'Pendiente', $14)
      RETURNING id_solicitud, nombre_escuela, cct, fecha_solicitud, estado_solicitud;
    `;

    const result = await pool.query(insertQuery, [
      nombre_escuela.trim(),
      cctNorm,
      nivel_educativo || 'Secundaria',
      turno || 'Matutino',
      direccion ? direccion.trim() : null,
      municipio ? municipio.trim() : null,
      estado ? estado.trim() : null,
      codigo_postal ? codigo_postal.trim() : null,
      telefono_responsable ? telefono_responsable.trim() : null,
      emailNorm,
      nombre_responsable.trim(),
      emailNorm,
      telefono_responsable ? telefono_responsable.trim() : null,
      passHash
    ]);

    return res.status(201).json({
      success: true,
      message: 'Solicitud registrada correctamente. El Administrador General validará la información.',
      solicitud: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar la solicitud: ' + error.message
    });
  }
}

/**
 * 2. Consultar solicitudes para Administrador General
 */
export async function obtenerSolicitudes(req, res) {
  try {
    const { estado, busqueda } = req.query;

    let query = `
      SELECT 
        id_solicitud, nombre_escuela, cct, nivel_educativo, turno,
        direccion, municipio, estado, codigo_postal, telefono,
        correo_institucional, nombre_responsable, correo_responsable,
        telefono_responsable, fecha_solicitud, estado_solicitud, motivo_rechazo
      FROM solicitud_escuela
      WHERE 1=1
    `;
    const params = [];

    if (estado && estado !== 'Todas') {
      params.push(estado);
      query += ` AND estado_solicitud = $${params.length}`;
    }

    if (busqueda && busqueda.trim()) {
      params.push(`%${busqueda.trim()}%`);
      query += ` AND (nombre_escuela ILIKE $${params.length} OR cct ILIKE $${params.length} OR nombre_responsable ILIKE $${params.length})`;
    }

    query += ' ORDER BY fecha_solicitud DESC';

    const result = await pool.query(query, params);

    return res.json({
      success: true,
      solicitudes: result.rows
    });
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar solicitudes: ' + error.message
    });
  }
}

/**
 * 3. Aprobar solicitud con Transacción Atómica
 */
export async function aprobarSolicitud(req, res) {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Consultar solicitud
    const solRes = await client.query('SELECT * FROM solicitud_escuela WHERE id_solicitud = $1 FOR UPDATE', [id]);
    if (solRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    const sol = solRes.rows[0];

    if (sol.estado_solicitud === 'Aprobada') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Esta solicitud ya ha sido aprobada previamente.' });
    }

    // 1. Insertar escuela si no existe ya esa CCT
    let idEscuela = null;
    const escExist = await client.query('SELECT id_escuela FROM escuelas WHERE UPPER(cct) = UPPER($1)', [sol.cct]);
    
    if (escExist.rows.length > 0) {
      idEscuela = escExist.rows[0].id_escuela;
    } else {
      const insEsc = await client.query(`
        INSERT INTO escuelas (
          nombre_escuela, cct, nivel_educativo, turno, direccion, municipio,
          estado, codigo_postal, telefono, correo_institucional, estado_escuela
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Activa')
        RETURNING id_escuela
      `, [
        sol.nombre_escuela,
        sol.cct,
        sol.nivel_educativo || 'Secundaria',
        sol.turno || 'Matutino',
        sol.direccion,
        sol.municipio,
        sol.estado,
        sol.codigo_postal,
        sol.telefono_responsable,
        sol.correo_institucional
      ]);
      idEscuela = insEsc.rows[0].id_escuela;
    }

    // 2. Crear usuario Directivo para el responsable
    const userExist = await client.query('SELECT id_usuario FROM usuario WHERE LOWER(correo) = LOWER($1)', [sol.correo_institucional]);
    
    if (userExist.rows.length === 0) {
      const passHash = sol.contrasena_responsable || await bcrypt.hash('director123', 10);
      await client.query(`
        INSERT INTO usuario (
          id_escuela, nombre, apellidos, correo, contrasena, rol, estado, fecha_registro
        ) VALUES ($1, $2, '', $3, $4, 'Directivo', 'Activo', NOW())
      `, [
        idEscuela,
        sol.nombre_responsable,
        sol.correo_institucional.toLowerCase(),
        passHash
      ]);
    } else {
      // Si ya existía, asegurarse de asignarle id_escuela y rol Directivo
      await client.query(`
        UPDATE usuario SET id_escuela = $1, rol = 'Directivo', estado = 'Activo'
        WHERE id_usuario = $2
      `, [idEscuela, userExist.rows[0].id_usuario]);
    }

    // 3. Actualizar solicitud a Aprobada
    await client.query(`
      UPDATE solicitud_escuela 
      SET estado_solicitud = 'Aprobada'
      WHERE id_solicitud = $1
    `, [id]);

    await client.query('COMMIT');

    return res.json({
      success: true,
      message: 'Solicitud aprobada con éxito. Se habilitó la escuela y la cuenta del Directivo en el sistema.'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al aprobar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al procesar la aprobación: ' + error.message
    });
  } finally {
    client.release();
  }
}

/**
 * 4. Rechazar solicitud
 */
export async function rechazarSolicitud(req, res) {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const result = await pool.query(`
      UPDATE solicitud_escuela
      SET estado_solicitud = 'Rechazada',
          motivo_rechazo = $1
      WHERE id_solicitud = $2
      RETURNING id_solicitud, estado_solicitud
    `, [motivo || 'No cumple con los requisitos institucionales.', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada.' });
    }

    return res.json({
      success: true,
      message: 'Solicitud rechazada.',
      solicitud: result.rows[0]
    });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud: ' + error.message
    });
  }
}

/**
 * 5. Estadísticas del Administrador General
 */
export async function obtenerEstadisticasAdmin(req, res) {
  try {
    const escRes = await pool.query("SELECT COUNT(*) FROM escuelas WHERE estado_escuela = 'Activa' OR estado_escuela IS NULL");
    const solTotal = await pool.query("SELECT COUNT(*) FROM solicitud_escuela");
    const solPend = await pool.query("SELECT COUNT(*) FROM solicitud_escuela WHERE estado_solicitud = 'Pendiente' OR estado_solicitud = 'En revisión'");
    const solAprob = await pool.query("SELECT COUNT(*) FROM solicitud_escuela WHERE estado_solicitud = 'Aprobada'");
    const solRech = await pool.query("SELECT COUNT(*) FROM solicitud_escuela WHERE estado_solicitud = 'Rechazada'");
    const userCount = await pool.query("SELECT COUNT(*) FROM usuario");
    // Consultar asistencia promedio real desde la tabla asistencia si existen registros
    const asisRes = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado_asistencia ILIKE '%asist%' OR estado_asistencia ILIKE '%presente%' THEN 1 END) as presentes
      FROM asistencia
    `);
    let asistenciaPromedio = 0;
    const totalAsis = parseInt(asisRes.rows[0].total, 10);
    if (totalAsis > 0) {
      asistenciaPromedio = Math.round((parseInt(asisRes.rows[0].presentes, 10) / totalAsis) * 100);
    }

    // Consultar rendimiento promedio real desde la tabla rendimiento_academico o calificacion
    const rendRes = await pool.query(`
      SELECT COALESCE(AVG(promedio), 0) as promedio_general
      FROM rendimiento_academico
    `);
    let promedioAcademico = parseFloat(rendRes.rows[0].promedio_general) || 0;
    if (promedioAcademico === 0) {
      const calRes = await pool.query(`SELECT COALESCE(AVG(calificacion), 0) as cal_general FROM calificacion`);
      promedioAcademico = parseFloat(calRes.rows[0].cal_general) || 0;
    }
    promedioAcademico = Number(promedioAcademico.toFixed(1));

    return res.json({
      success: true,
      stats: {
        escuelasActivas: parseInt(escRes.rows[0].count, 10),
        totalSolicitudes: parseInt(solTotal.rows[0].count, 10),
        solicitudesPendientes: parseInt(solPend.rows[0].count, 10),
        solicitudesAprobadas: parseInt(solAprob.rows[0].count, 10),
        solicitudesRechazadas: parseInt(solRech.rows[0].count, 10),
        usuariosRegistrados: parseInt(userCount.rows[0].count, 10),
        alertasActivas: parseInt(alertCount.rows[0].count, 10),
        asistenciaPromedio,
        promedioAcademico
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas de admin:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al consultar estadísticas: ' + error.message
    });
  }
}
