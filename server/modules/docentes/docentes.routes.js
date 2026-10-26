import express from 'express';
import { 
  getDocenteDashboard, 
  getAsistenciaPorGrupo, 
  guardarAsistencia, 
  getCalificacionesPorGrupo, 
  guardarCalificaciones 
} from './docentes.controller.js';

const router = express.Router();

router.get('/dashboard', getDocenteDashboard);
router.get('/asistencia', getAsistenciaPorGrupo);
router.post('/asistencia', guardarAsistencia);
router.get('/calificaciones', getCalificacionesPorGrupo);
router.post('/calificaciones', guardarCalificaciones);

export default router;
