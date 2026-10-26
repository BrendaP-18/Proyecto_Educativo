import { pool } from './db.js';
import bcrypt from 'bcryptjs';

async function migrate() {
  try {
    console.log('--- Iniciando ajuste de BD ---');
    // 1. Agregar columna contrasena_responsable si no existe
    await pool.query(`
      ALTER TABLE solicitud_escuela 
      ADD COLUMN IF NOT EXISTS contrasena_responsable VARCHAR(255);
    `);
    console.log('✅ Columna contrasena_responsable asegurada en solicitud_escuela');

    // 2. Asegurar que existe el Administrador General (Horacio) en la tabla usuario
    const adminEmail = 'admin@sicara.gob.mx';
    const checkAdmin = await pool.query('SELECT id_usuario FROM usuario WHERE LOWER(correo) = $1', [adminEmail]);
    
    if (checkAdmin.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await pool.query(`
        INSERT INTO usuario (nombre, apellidos, correo, contrasena, rol, estado, fecha_registro)
        VALUES ('Horacio', 'Administrador General', $1, $2, 'Administrador', 'Activo', NOW())
      `, [adminEmail, hash]);
      console.log('✅ Usuario Administrador General creado: admin@sicara.gob.mx / admin123');
    } else {
      console.log('ℹ️ Usuario Administrador General ya existe');
    }

    // 3. Asegurar que existe un Directivo de prueba si no existe
    const dirEmail = 'directivo@escuela.edu.mx';
    const checkDir = await pool.query('SELECT id_usuario FROM usuario WHERE LOWER(correo) = $1', [dirEmail]);
    const escRes = await pool.query('SELECT id_escuela FROM escuelas LIMIT 1');
    const escId = escRes.rows.length > 0 ? escRes.rows[0].id_escuela : null;

    if (checkDir.rows.length === 0 && escId) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('director123', salt);
      await pool.query(`
        INSERT INTO usuario (id_escuela, nombre, apellidos, correo, contrasena, rol, estado, fecha_registro)
        VALUES ($1, 'Director', 'General Plantel', $2, $3, 'Directivo', 'Activo', NOW())
      `, [escId, dirEmail, hash]);
      console.log('✅ Usuario Directivo creado: directivo@escuela.edu.mx / director123');
    }

  } catch (err) {
    console.error('Error en migración:', err);
  } finally {
    await pool.end();
  }
}

migrate();
