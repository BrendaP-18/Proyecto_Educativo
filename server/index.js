import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes.js';
import escuelasRoutes from './modules/escuelas/escuelas.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import solicitudesRoutes from './modules/solicitudes/solicitudes.routes.js';
import { seedInitialSchool } from './modules/escuelas/escuelas.controller.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Verificación de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    database: 'asistencia_escolares',
    timestamp: new Date().toISOString()
  });
});

// Registrar rutas por módulos
app.use('/api/auth', authRoutes);
app.use('/api/escuelas', escuelasRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/solicitudes', solicitudesRoutes);

// Iniciar servidor y sembrar datos iniciales si la tabla escuelas está vacía
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
  await seedInitialSchool();
});
