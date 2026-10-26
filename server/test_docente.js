import { pool } from './db.js';

async function test() {
  const u = await pool.query("SELECT id_usuario, correo FROM usuario WHERE correo = 'palasio@gmail.com'");
  console.log('USER:', u.rows);
  const uid = u.rows[0].id_usuario;
  const d = await pool.query("SELECT * FROM docentes WHERE id_usuario = $1", [uid]);
  console.log('DOCENTE:', d.rows);
  const did = d.rows[0]?.id_docente;
  const gd = await pool.query("SELECT * FROM grupo_docente WHERE id_docente = $1", [did]);
  console.log('DOCENTE GRUPO_DOCENTE:', gd.rows);
  const allGd = await pool.query("SELECT * FROM grupo_docente");
  console.log('ALL GRUPO_DOCENTE:', allGd.rows);
  await pool.end();
}

test();
