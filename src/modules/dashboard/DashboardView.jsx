import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Check, CalendarCheck, BarChart3, Users, Sparkles, LogOut, 
  ArrowRight, ShieldCheck, QrCode, School, BookOpen, Clock, CheckCircle2, UserCheck 
} from 'lucide-react';
import { dashboardService } from '../../services/api';

export default function DashboardView({ userSession, onLogout }) {
  const { user, type } = userSession;
  const [stats, setStats] = useState({
    escuelas: 1,
    alumnos: 0,
    docentes: 0,
    grupos: 0
  });
  const [activeTab, setActiveTab] = useState('asistencias');

  useEffect(() => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#6b1124', '#9e1c38', '#d99b26', '#f3b236', '#ffffff']
    });

    async function loadStats() {
      try {
        const data = await dashboardService.getStats(user.id_escuela);
        if (data.stats) {
          setStats(data.stats);
        }
      } catch (e) {
        console.warn('Estadísticas offline:', e);
      }
    }
    loadStats();
  }, [user.id_escuela]);

  const getRoleBadge = (role) => {
    if (!role) return 'Usuario';
    return role;
  };

  return (
    <div className="min-h-screen bg-[#f8f6f7] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex flex-col p-3 sm:p-5 lg:p-6 font-sans selection:bg-[#85162e] selection:text-white">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[98%] xl:max-w-[1600px] mx-auto flex-1 flex flex-col p-5 sm:p-8 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-2xl"
      >
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6b1124] to-[#9e1c38] text-white flex items-center justify-center shadow-lg shadow-rose-950/20">
            <School className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {user.name || user.nombre || 'Usuario'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/80 text-[#6b1124] dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                {getRoleBadge(user.role)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{user.email}</span>
              {user.escuela && (
                <>
                  <span>•</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{user.escuela}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="btn-outline-wine flex items-center gap-2 py-2 px-4 text-xs font-semibold self-end sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Tarjetas de Métricas de la BD PostgreSQL */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 my-6">
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Escuelas Conectadas</span>
          <div className="text-2xl font-black text-[#6b1124] dark:text-rose-300">{stats.escuelas}</div>
          <span className="text-[11px] text-emerald-600 font-medium">PostgreSQL Activo</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Alumnos Registrados</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.alumnos}</div>
          <span className="text-[11px] text-slate-400">Tabla: alumnos</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Plantilla Docente</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.docentes}</div>
          <span className="text-[11px] text-slate-400">Tabla: docentes</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Grupos Activos</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.grupos}</div>
          <span className="text-[11px] text-slate-400">Tabla: grupo</span>
        </div>
      </div>

      {/* Selector de Pestañas / Módulos de la Base de Datos */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('asistencias')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'asistencias'
              ? 'border-[#6b1124] text-[#6b1124] dark:border-rose-400 dark:text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Módulo Asistencias</span>
        </button>
        <button
          onClick={() => setActiveTab('calificaciones')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'calificaciones'
              ? 'border-[#6b1124] text-[#6b1124] dark:border-rose-400 dark:text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Módulo Calificaciones & Rendimiento</span>
        </button>
        <button
          onClick={() => setActiveTab('alertas')}
          className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'alertas'
              ? 'border-[#6b1124] text-[#6b1124] dark:border-rose-400 dark:text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Módulo Alertas Escolares</span>
        </button>
      </div>

      {/* Contenido de cada Módulo */}
      <div className="flex-1 flex flex-col justify-start">
        {activeTab === 'asistencias' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Control de Asistencias Diario</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Mapeado a la tabla <code className="text-rose-700 dark:text-rose-300 font-mono font-semibold">asistencia</code> de PostgreSQL (id_alumno, id_grupo, fecha, estado_asistencia).
                </p>
              </div>
              <button className="btn-wine text-xs sm:text-sm py-2 px-5 whitespace-nowrap shadow-md">
                + Nuevo Pase de Lista
              </button>
            </div>

            <div className="flex-1 min-h-[360px] p-8 sm:p-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
              <UserCheck className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">Base de datos lista para capturar asistencias</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
                Las tablas relacionales <code className="font-mono">grupo</code>, <code className="font-mono">alumnos</code> y <code className="font-mono">asistencia</code> están configuradas en tu motor PostgreSQL.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'calificaciones' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Registro de Calificaciones</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Mapeado a la tabla <code className="text-amber-700 dark:text-amber-300 font-mono font-semibold">calificacion</code> y <code className="text-amber-700 dark:text-amber-300 font-mono font-semibold">rendimiento_academico</code>.
                </p>
              </div>
              <button className="btn-wine text-xs sm:text-sm py-2 px-5 whitespace-nowrap bg-amber-700 hover:bg-amber-800 border-none shadow-md">
                + Capturar Calificaciones
              </button>
            </div>

            <div className="flex-1 min-h-[360px] p-8 sm:p-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
              <BarChart3 className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">Rendimiento por materia y periodo</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
                Permite calcular promedios automáticos y porcentajes de asistencia por alumno.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'alertas' && (
          <div className="space-y-4 flex-1 flex flex-col">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Alertas Tempranas</h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Mapeado a la tabla <code className="text-emerald-700 dark:text-emerald-300 font-mono font-semibold">alerta</code> (tipo_alerta, descripcion, estado_alerta).
                </p>
              </div>
              <button className="btn-wine text-xs sm:text-sm py-2 px-5 whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 border-none shadow-md">
                + Generar Alerta
              </button>
            </div>

            <div className="flex-1 min-h-[360px] p-8 sm:p-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center">
              <CalendarCheck className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-3" />
              <h4 className="text-base sm:text-lg font-bold text-slate-700 dark:text-slate-200">Monitoreo de Ausentismo y Deserción</h4>
              <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto mt-2">
                Notificaciones automáticas ante faltas consecutivas o bajo desempeño académico.
              </p>
            </div>
          </div>
        )}
      </div>
      </motion.div>
    </div>
  );
}
