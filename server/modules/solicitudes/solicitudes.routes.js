import express from 'express';
import { 
  crearSolicitud, 
  obtenerSolicitudes, 
  aprobarSolicitud, 
  rechazarSolicitud,
  obtenerEstadisticasAdmin
} from './solicitudes.controller.js';

const router = express.Router();

router.post('/', crearSolicitud);
router.get('/', obtenerSolicitudes);
router.get('/stats', obtenerEstadisticasAdmin);
router.put('/:id/aprobar', aprobarSolicitud);
router.put('/:id/rechazar', rechazarSolicitud);

export default router;
