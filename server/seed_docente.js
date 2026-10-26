import { pool } from './db.js';

export async function seedDocenteData() {
  try {
    // 1. Obtener o asegurar la escuela "Primaria Juan Escutia"
    let escuelaId;
    const escRes = await pool.query("SELECT id_escuela FROM escuelas WHERE nombre_escuela = 'Primaria Juan Escutia' LIMIT 1");
    if (escRes.rows.length > 0) {
      escuelaId = escRes.rows[0].id_escuela;
    } else {
      const anyEsc = await pool.query("SELECT id_escuela FROM escuelas LIMIT 1");
      if (anyEsc.rows.length > 0) {
        escuelaId = anyEsc.rows[0].id_escuela;
        await pool.query("UPDATE escuelas SET nombre_escuela = 'Primaria Juan Escutia' WHERE id_escuela = $1", [escuelaId]);
      } else {
        const newEsc = await pool.query(`
          INSERT INTO escuelas (nombre_escuela, cct, nivel_educativo, turno, direccion, municipio, estado, codigo_postal, telefono, correo_institucional, estado_escuela)
          VALUES ('Primaria Juan Escutia', '14EPR0012Z', 'Primaria', 'Matutino', 'Av. Niños Héroes 100', 'Guadalajara', 'Jalisco', '44100', '3331234567', 'contacto@juanescutia.edu.mx', 'Activa')
          RETURNING id_escuela;
        `);
        escuelaId = newEsc.rows[0].id_escuela;
      }
    }

    // 2. Docentes en la BD: Limpiar filas huérfanas de docentes
    await pool.query(`
      UPDATE usuario 
      SET nombre = 'Majo', apellidos = 'Hernández', id_escuela = $1 
      WHERE correo = 'palasio@gmail.com'
    `, [escuelaId]);

    // Limpiar docentes huérfanos que no estén en asistencia ni en calificacion
    await pool.query(`
      DELETE FROM docentes 
      WHERE id_docente NOT IN (
        SELECT DISTINCT id_docente FROM asistencia WHERE id_docente IS NOT NULL
        UNION
        SELECT DISTINCT id_docente FROM calificacion WHERE id_docente IS NOT NULL
      ) AND id_docente != '2f0a030d-6be9-4899-b695-7fbc9bc2d918';
    `);

    // Todos los id_docente existentes actualmente
    const allDocentes = await pool.query("SELECT id_docente, id_usuario FROM docentes");

    // 3. Materias: Español, Matemáticas, Ciencias Naturales, Historia
    const materias = ['Español', 'Matemáticas', 'Ciencias Naturales', 'Historia'];
    const materiaMap = {};
    for (const mat of materias) {
      let mRes = await pool.query("SELECT id_materia FROM materia WHERE nombre_materia = $1 LIMIT 1", [mat]);
      if (mRes.rows.length === 0) {
        mRes = await pool.query("INSERT INTO materia (nombre_materia, descripcion, estado) VALUES ($1, $2, 'Activo') RETURNING id_materia", [mat, `Materia curricular de ${mat}`]);
      }
      materiaMap[mat] = mRes.rows[0].id_materia;
    }

    // 4. Grupos: 5° A, 5° B, 6° A
    const grupos = [
      { nombre: '5° A', grado: '5' },
      { nombre: '5° B', grado: '5' },
      { nombre: '6° A', grado: '6' }
    ];
    const grupoMap = {};
    for (const g of grupos) {
      let gRes = await pool.query("SELECT id_grupo FROM grupo WHERE nombre_grupo = $1 AND id_escuela = $2 LIMIT 1", [g.nombre, escuelaId]);
      if (gRes.rows.length === 0) {
        gRes = await pool.query(
          "INSERT INTO grupo (id_escuela, nombre_grupo, grado, ciclo_escolar, estado) VALUES ($1, $2, $3, '2024-2025', 'Activo') RETURNING id_grupo",
          [escuelaId, g.nombre, g.grado]
        );
      }
      grupoMap[g.nombre] = gRes.rows[0].id_grupo;
    }

    // 5. Asignar grupos y materias a TODOS los id_docente que existen en la BD
    for (const d of allDocentes.rows) {
      for (const [matName, idMat] of Object.entries(materiaMap)) {
        for (const [grpName, idGrp] of Object.entries(grupoMap)) {
          const checkGD = await pool.query(
            "SELECT id_grupo_docente FROM grupo_docente WHERE id_grupo = $1 AND id_docente = $2 AND id_materia = $3",
            [idGrp, d.id_docente, idMat]
          );
          if (checkGD.rows.length === 0) {
            await pool.query(
              "INSERT INTO grupo_docente (id_grupo, id_docente, id_materia) VALUES ($1, $2, $3)",
              [idGrp, d.id_docente, idMat]
            );
          }
        }
      }
    }

    // 6. Alumnos para 5° A (idénticos a la maqueta de la imagen)
    const alumnosSeed = [
      { nombre: 'Sofía', apellidos: 'Hernández Cruz', curp: 'HECS130418MOCRRFO8', calif: 9.2, estado_asist: 'Presente', matricula: 'A-001' },
      { nombre: 'Diego', apellidos: 'Martínez López', curp: 'MALD130721HOCRPGO4', calif: 8.5, estado_asist: 'Presente', matricula: 'A-002' },
      { nombre: 'Valeria', apellidos: 'García Ruiz', curp: 'GARV130205MOCRZL07', calif: 7.8, estado_asist: 'Ausente', matricula: 'A-003', alerta: 'Riesgo alto - Ausencia y promedio 7.8' },
      { nombre: 'Mateo', apellidos: 'Sánchez Pérez', curp: 'SAPM131112HOCRRTO9', calif: 8.9, estado_asist: 'Retardo', matricula: 'A-004' },
      { nombre: 'Camila', apellidos: 'López Díaz', curp: 'LODC130930MOCPSMO5', calif: 9.6, estado_asist: 'Presente', matricula: 'A-005' },
      { nombre: 'Emiliano', apellidos: 'Torres Silva', curp: 'TOSE130117HOCRLM02', calif: 8.1, estado_asist: 'Presente', matricula: 'A-006', alerta: 'Seguimiento - Promedio 8.1 dar seguimiento' },
      { nombre: 'Alejandro', apellidos: 'Gómez Morales', curp: 'GOMA130315HOCRRNO1', calif: 8.7, estado_asist: 'Presente', matricula: 'A-007' },
      { nombre: 'Lucía', apellidos: 'Fernández Ramos', curp: 'FERL130622MOCRLA03', calif: 9.0, estado_asist: 'Presente', matricula: 'A-008' }
    ];

    const grp5A = grupoMap['5° A'];
    const matEspanol = materiaMap['Español'];

    for (const a of alumnosSeed) {
      let alRes = await pool.query("SELECT id_alumno FROM alumnos WHERE curp = $1 LIMIT 1", [a.curp]);
      let idAlumno;
      if (alRes.rows.length === 0) {
        const insAl = await pool.query(
          "INSERT INTO alumnos (id_escuela, nombre, apellidos, curp, estado) VALUES ($1, $2, $3, $4, 'Activo') RETURNING id_alumno",
          [escuelaId, a.nombre, a.apellidos, a.curp]
        );
        idAlumno = insAl.rows[0].id_alumno;
      } else {
        idAlumno = alRes.rows[0].id_alumno;
      }

      // Inscribir en grupo_alumno para 5° A
      const checkInsc = await pool.query(
        "SELECT id_grupo_alumno FROM grupo_alumno WHERE id_grupo = $1 AND id_alumno = $2",
        [grp5A, idAlumno]
      );
      if (checkInsc.rows.length === 0) {
        await pool.query(
          "INSERT INTO grupo_alumno (id_grupo, id_alumno, fecha_inscripcion, estado) VALUES ($1, $2, CURRENT_DATE, 'Activo')",
          [grp5A, idAlumno]
        );
      }

      // Calificaciones y Asistencias
      for (const d of allDocentes.rows) {
        const checkCal = await pool.query(
          "SELECT id_calificacion FROM calificacion WHERE id_alumno = $1 AND id_grupo = $2 AND id_materia = $3 AND periodo = '1er Periodo' AND id_docente = $4",
          [idAlumno, grp5A, matEspanol, d.id_docente]
        );
        if (checkCal.rows.length === 0) {
          await pool.query(`
            INSERT INTO calificacion (id_alumno, id_grupo, id_materia, id_docente, periodo, calificacion, observaciones, fecha_registro)
            VALUES ($1, $2, $3, $4, '1er Periodo', $5, 'Buen desempeño en clase', NOW())
          `, [idAlumno, grp5A, matEspanol, d.id_docente, a.calif]);
        }

        const checkAsist = await pool.query(
          "SELECT id_asistencia FROM asistencia WHERE id_alumno = $1 AND id_grupo = $2 AND fecha = CURRENT_DATE AND id_docente = $3",
          [idAlumno, grp5A, d.id_docente]
        );
        if (checkAsist.rows.length === 0) {
          await pool.query(`
            INSERT INTO asistencia (id_alumno, id_grupo, id_docente, fecha, estado_asistencia, observaciones)
            VALUES ($1, $2, $3, CURRENT_DATE, $4, '')
          `, [idAlumno, grp5A, d.id_docente, a.estado_asist]);
        }
      }

      // Alertas
      if (a.alerta) {
        const checkAlerta = await pool.query(
          "SELECT id_alerta FROM alerta WHERE id_alumno = $1 AND descripcion = $2",
          [idAlumno, a.alerta]
        );
        if (checkAlerta.rows.length === 0) {
          await pool.query(`
            INSERT INTO alerta (id_escuela, id_alumno, tipo_alerta, descripcion, fecha_generacion, estado_alerta)
            VALUES ($1, $2, 'Académica', $3, NOW(), 'Activa')
          `, [escuelaId, idAlumno, a.alerta]);
        }
      }
    }

    console.log('✅ Vinculaciones de Directivo completadas: Grupo, Materia y Alumnos asignados correctamente a los docentes');
  } catch (error) {
    console.error('Error sembrando datos del docente:', error);
  }
}
