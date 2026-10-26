import { pool } from '../../db.js';

// Seed inicial con una escuela por defecto si no existe
export async function seedInitialSchool() {
  try {
    const res = await pool.query('SELECT id_escuela, cct, nombre_escuela FROM escuelas LIMIT 1');
    if (res.rows.length === 0) {
      const defaultSchool = await pool.query(`
        INSERT INTO escuelas (
          nombre_escuela, cct, nivel_educativo, turno, direccion, municipio, estado, codigo_postal, telefono, correo_institucional, estado_escuela
        ) VALUES (
          'Escuela Secundaria Técnica No. 1', '14DST0001A', 'Secundaria', 'Matutino', 'Av. Educación 123', 'Guadalajara', 'Jalisco', '44100', '3331234567', 'contacto@est1.edu.mx', 'Activa'
        ) RETURNING id_escuela, cct, nombre_escuela;
      `);
      console.log('🏫 Escuela inicial creada con éxito:', defaultSchool.rows[0].nombre_escuela);
    }
  } catch (err) {
    console.error('⚠️ Error al verificar/crear escuela inicial:', err.message);
  }
}

// Obtener todas las escuelas activas
export async function getEscuelas(req, res) {
  try {
    const result = await pool.query(`
      SELECT id_escuela, nombre_escuela, cct, nivel_educativo, turno, municipio, estado
      FROM escuelas
      ORDER BY nombre_escuela ASC
    `);
    res.json({ success: true, escuelas: result.rows });
  } catch (error) {
    console.error('Error al obtener escuelas:', error);
    res.status(500).json({ success: false, message: 'Error interno al consultar escuelas.' });
  }
}
