import { pool } from '../../db.js';

/**
 * Obtener perfil y datos completos del docente:
 * - Grupos asignados
 * - Materias asignadas
 * - Escuela vinculada
 * - Métricas generales (alumnos inscritos, porcentaje de asistencia, promedio general, alertas)
 */
export async function getDocenteDashboard(req, res) {
  try {
    const { id_usuario } = req.query;

    if (!id_usuario) {
      return res.status(400).json({ success: false, message: 'id_usuario es requerido' });
    }

    // 1. Obtener datos del usuario docente
    const userRes = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.apellidos, u.correo, u.rol,
             e.id_escuela, e.nombre_escuela, e.cct,
             d.id_docente, d.especialidad
      FROM usuario u
      LEFT JOIN escuelas e ON u.id_escuela = e.id_escuela
      LEFT JOIN docentes d ON d.id_usuario = u.id_usuario
      WHERE u.id_usuario = $1
    `, [id_usuario]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Docente no encontrado' });
    }

    const docenteInfo = userRes.rows[0];
    const idDocente = docenteInfo.id_docente;

    // 2. Obtener grupos y materias que tiene asignadas
    const asignacionesRes = await pool.query(`
      SELECT gd.id_grupo_docente,
             g.id_grupo, g.nombre_grupo, g.grado, g.ciclo_escolar,
             m.id_materia, m.nombre_materia
      FROM grupo_docente gd
      JOIN grupo g ON gd.id_grupo = g.id_grupo
      JOIN materia m ON gd.id_materia = m.id_materia
      WHERE gd.id_docente = $1
      ORDER BY g.nombre_grupo ASC, m.nombre_materia ASC
    `, [idDocente]);

    // Grupos únicos
    const gruposMap = new Map();
    const materiasMap = new Map();

    asignacionesRes.rows.forEach(row => {
      if (!gruposMap.has(row.id_grupo)) {
        gruposMap.set(row.id_grupo, {
          id_grupo: row.id_grupo,
          nombre_grupo: row.nombre_grupo,
          grado: row.grado,
          ciclo_escolar: row.ciclo_escolar
        });
      }
      if (!materiasMap.has(row.id_materia)) {
        materiasMap.set(row.id_materia, {
          id_materia: row.id_materia,
          nombre_materia: row.nombre_materia
        });
      }
    });

    const grupos = Array.from(gruposMap.values());
    const materias = Array.from(materiasMap.values());

    // 3. Métricas para el grupo principal o default (ej. 5° A)
    const primerGrupoId = grupos[0]?.id_grupo || null;
    
    // Total alumnos del grupo principal
    let totalAlumnos = 0;
    if (primerGrupoId) {
      const alCount = await pool.query(
        "SELECT COUNT(*)::int as count FROM grupo_alumno WHERE id_grupo = $1 AND estado = 'Activo'",
        [primerGrupoId]
      );
      totalAlumnos = alCount.rows[0]?.count || 0;
    }

    // Promedio de calificaciones del grupo
    let promedioGrupo = 0;
    if (primerGrupoId) {
      const avgRes = await pool.query(
        "SELECT ROUND(AVG(calificacion), 1) as avg FROM calificacion WHERE id_grupo = $1",
        [primerGrupoId]
      );
      if (avgRes.rows[0]?.avg) {
        promedioGrupo = parseFloat(avgRes.rows[0].avg);
      }
    }

    // Porcentaje de asistencia del mes
    let asistenciaMes = 0;
    if (primerGrupoId) {
      const asistRes = await pool.query(`
        SELECT 
          COUNT(*)::int as total,
          SUM(CASE WHEN LOWER(estado_asistencia) IN ('presente', 'retardo') THEN 1 ELSE 0 END)::int as asistencias
        FROM asistencia
        WHERE id_grupo = $1
      `, [primerGrupoId]);

      if (asistRes.rows[0]?.total > 0) {
        asistenciaMes = Math.round((asistRes.rows[0].asistencias / asistRes.rows[0].total) * 100);
      }
    }

    // Alumnos en riesgo o con alertas
    const alertasRes = await pool.query(`
      SELECT al.id_alerta, al.tipo_alerta, al.descripcion, al.estado_alerta,
             a.id_alumno, a.nombre, a.apellidos, a.curp
      FROM alerta al
      JOIN alumnos a ON al.id_alumno = a.id_alumno
      ORDER BY al.fecha_generacion DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      docente: docenteInfo,
      grupos,
      materias,
      asignaciones: asignacionesRes.rows,
      stats: {
        totalAlumnos,
        asistenciaMes,
        promedioGrupo,
        alumnosEnAlerta: alertasRes.rows.length
      },
      alumnosRiesgo: alertasRes.rows
    });
  } catch (error) {
    console.error('Error al obtener dashboard docente:', error);
    res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
  }
}

/**
 * Obtener lista de alumnos por grupo con asistencia del día
 */
export async function getAsistenciaPorGrupo(req, res) {
  try {
    const { id_grupo, fecha } = req.query;
    const fechaFiltro = fecha || new Date().toISOString().split('T')[0];

    if (!id_grupo) {
      return res.status(400).json({ success: false, message: 'id_grupo es requerido' });
    }

    const query = `
      SELECT 
        a.id_alumno,
        a.nombre,
        a.apellidos,
        a.curp,
        ga.id_grupo_alumno,
        asi.id_asistencia,
        COALESCE(asi.estado_asistencia, 'Presente') as estado_asistencia,
        COALESCE(asi.observaciones, '') as observaciones
      FROM grupo_alumno ga
      JOIN alumnos a ON ga.id_alumno = a.id_alumno
      LEFT JOIN asistencia asi ON asi.id_alumno = a.id_alumno 
                               AND asi.id_grupo = ga.id_grupo 
                               AND asi.fecha = $2
      WHERE ga.id_grupo = $1 AND ga.estado = 'Activo'
      ORDER BY a.apellidos ASC, a.nombre ASC
    `;

    const result = await pool.query(query, [id_grupo, fechaFiltro]);

    // Conteo rápido
    let presentes = 0;
    let ausentes = 0;
    let retardos = 0;

    result.rows.forEach(r => {
      const est = (r.estado_asistencia || '').toLowerCase();
      if (est === 'presente') presentes++;
      else if (est === 'ausente') ausentes++;
      else if (est === 'retardo') retardos++;
    });

    res.json({
      success: true,
      fecha: fechaFiltro,
      resumen: { presentes, ausentes, retardos, total: result.rows.length },
      alumnos: result.rows
    });
  } catch (error) {
    console.error('Error al obtener asistencia:', error);
    res.status(500).json({ success: false, message: 'Error al consultar asistencia: ' + error.message });
  }
}

/**
 * Guardar o actualizar la asistencia del grupo
 */
export async function guardarAsistencia(req, res) {
  try {
    const { id_grupo, id_docente, fecha, registros } = req.body;
    const fechaOperacion = fecha || new Date().toISOString().split('T')[0];

    if (!id_grupo || !Array.isArray(registros)) {
      return res.status(400).json({ success: false, message: 'Datos incompletos para guardar asistencia' });
    }

    for (const reg of registros) {
      // Si ya existe registro de hoy, actualizar; sino insertar
      const check = await pool.query(
        "SELECT id_asistencia FROM asistencia WHERE id_alumno = $1 AND id_grupo = $2 AND fecha = $3",
        [reg.id_alumno, id_grupo, fechaOperacion]
      );

      if (check.rows.length > 0) {
        await pool.query(`
          UPDATE asistencia 
          SET estado_asistencia = $1, observaciones = $2, id_docente = COALESCE($3, id_docente)
          WHERE id_asistencia = $4
        `, [reg.estado_asistencia, reg.observaciones || '', id_docente, check.rows[0].id_asistencia]);
      } else {
        await pool.query(`
          INSERT INTO asistencia (id_alumno, id_grupo, id_docente, fecha, estado_asistencia, observaciones)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [reg.id_alumno, id_grupo, id_docente, fechaOperacion, reg.estado_asistencia, reg.observaciones || '']);
      }
    }

    res.json({ success: true, message: 'Asistencia registrada con éxito en PostgreSQL' });
  } catch (error) {
    console.error('Error al guardar asistencia:', error);
    res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
  }
}

/**
 * Obtener lista de alumnos por grupo y materia con sus calificaciones
 */
export async function getCalificacionesPorGrupo(req, res) {
  try {
    const { id_grupo, id_materia, periodo } = req.query;
    const periodoFiltro = periodo || '1er Periodo';

    if (!id_grupo || !id_materia) {
      return res.status(400).json({ success: false, message: 'id_grupo e id_materia son requeridos' });
    }

    const query = `
      SELECT 
        a.id_alumno,
        a.nombre,
        a.apellidos,
        a.curp,
        c.id_calificacion,
        COALESCE(c.calificacion, 0) as calificacion,
        COALESCE(c.observaciones, '') as observaciones,
        c.periodo
      FROM grupo_alumno ga
      JOIN alumnos a ON ga.id_alumno = a.id_alumno
      LEFT JOIN calificacion c ON c.id_alumno = a.id_alumno 
                              AND c.id_grupo = ga.id_grupo 
                              AND c.id_materia = $2
                              AND c.periodo = $3
      WHERE ga.id_grupo = $1 AND ga.estado = 'Activo'
      ORDER BY a.apellidos ASC, a.nombre ASC
    `;

    const result = await pool.query(query, [id_grupo, id_materia, periodoFiltro]);

    res.json({
      success: true,
      periodo: periodoFiltro,
      alumnos: result.rows
    });
  } catch (error) {
    console.error('Error al obtener calificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
  }
}

/**
 * Guardar o actualizar calificaciones en la base de datos
 */
export async function guardarCalificaciones(req, res) {
  try {
    const { id_grupo, id_materia, id_docente, periodo, calificaciones } = req.body;
    const per = periodo || '1er Periodo';

    if (!id_grupo || !id_materia || !Array.isArray(calificaciones)) {
      return res.status(400).json({ success: false, message: 'Datos incompletos para guardar calificaciones' });
    }

    for (const c of calificaciones) {
      const numCalif = parseFloat(c.calificacion) || 0;

      const check = await pool.query(`
        SELECT id_calificacion 
        FROM calificacion 
        WHERE id_alumno = $1 AND id_grupo = $2 AND id_materia = $3 AND periodo = $4
      `, [c.id_alumno, id_grupo, id_materia, per]);

      if (check.rows.length > 0) {
        await pool.query(`
          UPDATE calificacion
          SET calificacion = $1, observaciones = $2, fecha_registro = NOW()
          WHERE id_calificacion = $3
        `, [numCalif, c.observaciones || '', check.rows[0].id_calificacion]);
      } else {
        await pool.query(`
          INSERT INTO calificacion (id_alumno, id_grupo, id_materia, id_docente, periodo, calificacion, observaciones, fecha_registro)
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        `, [c.id_alumno, id_grupo, id_materia, id_docente, per, numCalif, c.observaciones || '']);
      }
    }

    res.json({ success: true, message: 'Calificaciones guardadas exitosamente en PostgreSQL' });
  } catch (error) {
    console.error('Error al guardar calificaciones:', error);
    res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
  }
}
