import { pool } from './db.js';

async function check() {
  const query = `
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('alerta', 'alumnos', 'asistencia', 'calificacion', 'docentes') 
    ORDER BY table_name, ordinal_position;
  `;
  const res = await pool.query(query);
  console.log(JSON.stringify(res.rows, null, 2));
  await pool.end();
}

check();
