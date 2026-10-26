import { pool } from '../../db.js';

// Obtener datos globales o por escuela para el dashboard
export async function getDashboardStats(req, res) {
  try {
    const { id_escuela } = req.query;

    let escuelasCount = 0;
    let alumnosCount = 0;
    let docentesCount = 0;
    let gruposCount = 0;

    const escRes = await pool.query('SELECT COUNT(*) FROM escuelas');
    escuelasCount = parseInt(escRes.rows[0].count, 10);

    const alRes = await pool.query('SELECT COUNT(*) FROM alumnos');
    alumnosCount = parseInt(alRes.rows[0].count, 10);

    const docRes = await pool.query('SELECT COUNT(*) FROM docentes');
    docentesCount = parseInt(docRes.rows[0].count, 10);

    const grRes = await pool.query('SELECT COUNT(*) FROM grupo');
    gruposCount = parseInt(grRes.rows[0].count, 10);

    res.json({
      success: true,
      stats: {
        escuelas: escuelasCount,
        alumnos: alumnosCount,
        docentes: docentesCount,
        grupos: gruposCount
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
}
