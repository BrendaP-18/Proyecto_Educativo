import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, FileText, School, Users, BarChart3, Bell, 
  LogOut, CheckCircle2, XCircle, Search, Filter, ChevronRight, 
  Clock, Shield, AlertTriangle, ArrowRight, Building2, Eye, RefreshCw, Sparkles, Database
} from 'lucide-react';
import { solicitudesService, escuelasService } from '../../services/api';

export default function AdminGeneralView({ userSession, onLogout }) {
  const { user } = userSession;
  const [activeMenu, setActiveMenu] = useState('resumen'); // 'resumen', 'solicitudes', 'escuelas', 'usuarios'
  const [stats, setStats] = useState({
    escuelasActivas: 0,
    totalSolicitudes: 0,
    solicitudesPendientes: 0,
    solicitudesAprobadas: 0,
    solicitudesRechazadas: 0,
    usuariosRegistrados: 0,
    alertasActivas: 0,
    asistenciaPromedio: 0,
    promedioAcademico: 0
  });

  const [solicitudes, setSolicitudes] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSol, setSelectedSol] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, solData, escData] = await Promise.all([
        solicitudesService.getAdminStats(),
        solicitudesService.getAll({ estado: filtroEstado, busqueda }),
        escuelasService.getEscuelas()
      ]);

      if (statsData.stats) setStats(statsData.stats);
      if (solData.solicitudes) setSolicitudes(solData.solicitudes);
      if (escData.escuelas) setEscuelas(escData.escuelas);
    } catch (e) {
      console.error('Error cargando datos de admin desde PostgreSQL:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filtroEstado]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleAprobar = async (id) => {
    if (!window.confirm('¿Confirmas que deseas aprobar esta solicitud? Se habilitará la escuela en la tabla escuelas y se creará la cuenta Directivo en usuario.')) return;
    setActionLoading(true);
    try {
      const res = await solicitudesService.approve(id);
      setNotification({ type: 'success', message: res.message || 'Solicitud aprobada con éxito en PostgreSQL.' });
      setSelectedSol(null);
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al aprobar la solicitud.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRechazar = async (id) => {
    const motivo = window.prompt('Indica el motivo de rechazo que se guardará en la base de datos:', 'Información institucional incompleta o inválida.');
    if (motivo === null) return;
    setActionLoading(true);
    try {
      const res = await solicitudesService.reject(id, motivo);
      setNotification({ type: 'info', message: res.message || 'Solicitud rechazada.' });
      setSelectedSol(null);
      await loadData();
    } catch (err) {
      setNotification({ type: 'error', message: err.message || 'Error al rechazar la solicitud.' });
    } finally {
      setActionLoading(false);
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date());

  return (
    <div className="w-full min-h-screen bg-[#fcf9fa] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#85162e] selection:text-white">
      
      {/* SIDEBAR (Estilo SICARA con paleta Vino) */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#1c0f13] border-r border-slate-200/80 dark:border-rose-950/60 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo Brand SICARA */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-[#6b1124] text-white flex items-center justify-center shadow-lg shadow-rose-950/25">
              <School className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                SICARA
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Control escolar</span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-3 mb-2">
              ADMINISTRACIÓN
            </span>

            <button
              onClick={() => setActiveMenu('resumen')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeMenu === 'resumen'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveMenu('solicitudes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeMenu === 'solicitudes'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4" />
                <span>Solicitudes</span>
              </div>
              {stats.solicitudesPendientes > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#85162e] text-white">
                  {stats.solicitudesPendientes}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveMenu('escuelas')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeMenu === 'escuelas'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Escuelas</span>
            </button>

            <button
              onClick={() => setActiveMenu('usuarios')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeMenu === 'usuarios'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios</span>
            </button>
          </div>
        </div>

        {/* Footer Sidebar: Perfil de Horacio */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/40 rounded-2xl border border-rose-100 dark:border-rose-900/60 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#85162e] dark:text-rose-300 mb-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Datos protegidos</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
              Separación segura por escuela y control estricto de roles.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#6b1124] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                HG
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">
                  {user.name || user.nombre || 'Horacio'}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Administrador general</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 px-6 bg-white dark:bg-[#1c0f13] border-b border-slate-200/80 dark:border-rose-950/60 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span>SICARA</span>
            <span>&gt;</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{activeMenu}</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-[#85162e] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#6b1124] text-white font-bold text-xs flex items-center justify-center">
              HG
            </div>
          </div>
        </header>

        {/* Notificaciones flotantes */}
        {notification && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
            notification.type === 'error' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
            'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="text-xs font-bold underline ml-3">Cerrar</button>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* VISTA RESUMEN (Dashboard Principal Imagen 5) */}
          {activeMenu === 'resumen' && (
            <>
              {/* Header de Bienvenida */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-medium capitalize block mb-1">
                    {todayFormatted}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Buenos días, {user.nombre || 'Horacio'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Este es el panorama general del sistema conectado a PostgreSQL.
                  </p>
                </div>

                <button
                  onClick={() => setActiveMenu('solicitudes')}
                  className="btn-wine text-xs py-2 px-4 shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Revisar solicitudes</span>
                </button>
              </div>

              {/* 4 Métricas de Tarjetas (Reales de BD) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-[#1c0f13] rounded-2xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Escuelas activas</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.escuelasActivas}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium">Tabla: escuelas</span>
                </div>

                <div className="p-5 bg-white dark:bg-[#1c0f13] rounded-2xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Usuarios registrados</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.usuariosRegistrados}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-blue-600 font-medium">Tabla: usuario</span>
                </div>

                <div className="p-5 bg-white dark:bg-[#1c0f13] rounded-2xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Solicitudes pendientes</span>
                      <span className="text-2xl font-black text-[#85162e] dark:text-rose-400">{stats.solicitudesPendientes}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveMenu('solicitudes')}
                    className="text-[11px] text-[#85162e] dark:text-rose-400 font-bold hover:underline text-left"
                  >
                    Revisar ahora
                  </button>
                </div>

                <div className="p-5 bg-white dark:bg-[#1c0f13] rounded-2xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Alertas activas</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.alertasActivas}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-rose-600 font-medium">Tabla: alerta</span>
                </div>
              </div>

              {/* Grid 2 Columnas: Solicitudes recientes y Estado del sistema */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Solicitudes recientes */}
                <div className="lg:col-span-8 p-6 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Solicitudes recientes</h3>
                      <p className="text-xs text-slate-400">Escuelas esperando validación institucional</p>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('solicitudes')}
                      className="text-xs font-bold text-[#85162e] dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <span>Ver todas</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {solicitudes.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs">
                      No hay solicitudes registradas en la tabla solicitud_escuela.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {solicitudes.slice(0, 4).map((sol) => (
                        <div 
                          key={sol.id_solicitud}
                          className="p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-800 transition-all flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-[#85162e] dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                              {sol.nombre_escuela.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sol.nombre_escuela}</h4>
                              <p className="text-xs text-slate-400">
                                {sol.cct} • {sol.municipio || sol.estado || 'México'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              sol.estado_solicitud === 'Aprobada' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              sol.estado_solicitud === 'Rechazada' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                              ● {sol.estado_solicitud}
                            </span>
                            <button
                              onClick={() => setSelectedSol(sol)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Estado del sistema con datos reales */}
                <div className="lg:col-span-4 p-6 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Estado del sistema</h3>
                      <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                        <Database className="w-3 h-3" /> PostgreSQL
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-500">Asistencia promedio real</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {stats.asistenciaPromedio > 0 ? `${stats.asistenciaPromedio}%` : 'Sin registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-[#6b1124] h-full rounded-full" style={{ width: `${stats.asistenciaPromedio || 5}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Calculado de tabla: asistencia</span>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-medium mb-1.5">
                          <span className="text-slate-500">Rendimiento académico</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {stats.promedioAcademico > 0 ? stats.promedioAcademico : 'Sin registros'}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(stats.promedioAcademico * 10) || 5}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Calculado de tabla: rendimiento_academico</span>
                      </div>
                    </div>
                  </div>

                  {/* Banner de alertas de BD */}
                  <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                      <div>
                        <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                          {stats.alertasActivas} alertas registradas
                        </h5>
                        <p className="text-[11px] text-amber-700 dark:text-amber-300">Monitoreo de inasistencias y riesgos escolares.</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </div>
                </div>

              </div>
            </>
          )}

          {/* VISTA SOLICITUDES ESCOLARES */}
          {activeMenu === 'solicitudes' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gestión de Solicitudes</h1>
                  <p className="text-xs text-slate-400">Revisa, aprueba o rechaza solicitudes de incorporación escolar.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="custom-input text-xs py-2 px-3 pl-3 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="Todas">Todas las solicitudes</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Aprobada">Aprobadas</option>
                    <option value="Rechazada">Rechazadas</option>
                  </select>

                  <button
                    onClick={loadData}
                    className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                    title="Actualizar"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre de escuela, CCT o responsable..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="custom-input text-xs"
                  />
                </div>
                <button type="submit" className="btn-wine text-xs py-2 px-5">
                  Buscar
                </button>
              </form>

              {/* Tabla de Solicitudes */}
              <div className="bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Escuela / CCT</th>
                        <th className="py-3.5 px-4">Responsable</th>
                        <th className="py-3.5 px-4">Nivel / Turno</th>
                        <th className="py-3.5 px-4">Fecha</th>
                        <th className="py-3.5 px-4">Estado</th>
                        <th className="py-3.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {solicitudes.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No se encontraron solicitudes registradas en la base de datos.
                          </td>
                        </tr>
                      ) : (
                        solicitudes.map((s) => (
                          <tr key={s.id_solicitud} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-slate-900 dark:text-white block">{s.nombre_escuela}</span>
                              <span className="text-[11px] text-slate-400 font-mono">{s.cct}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-medium text-slate-800 dark:text-slate-200 block">{s.nombre_responsable}</span>
                              <span className="text-[11px] text-slate-400">{s.correo_institucional}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                              {s.nivel_educativo || 'Secundaria'} • {s.turno || 'Matutino'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-400">
                              {s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleDateString('es-MX') : 'Reciente'}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                s.estado_solicitud === 'Aprobada' ? 'bg-emerald-100 text-emerald-800' :
                                s.estado_solicitud === 'Rechazada' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {s.estado_solicitud}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedSol(s)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-200"
                              >
                                Detalle
                              </button>
                              {s.estado_solicitud !== 'Aprobada' && (
                                <button
                                  onClick={() => handleAprobar(s.id_solicitud)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#6b1124] text-white hover:bg-[#85162e]"
                                >
                                  Aprobar
                                </button>
                              )}
                              {s.estado_solicitud !== 'Rechazada' && (
                                <button
                                  onClick={() => handleRechazar(s.id_solicitud)}
                                  disabled={actionLoading}
                                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                                >
                                  Rechazar
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISTA ESCUELAS REGISTRADAS */}
          {activeMenu === 'escuelas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white">Escuelas Registradas</h1>
                  <p className="text-xs text-slate-400">Planteles activos incorporados en la tabla escuelas de PostgreSQL.</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-rose-50 text-[#85162e] rounded-full border border-rose-200">
                  Total: {escuelas.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {escuelas.map((esc) => (
                  <div 
                    key={esc.id_escuela}
                    className="p-5 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950 text-[#6b1124] dark:text-rose-300 font-bold flex items-center justify-center">
                        <School className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {esc.estado_escuela || 'Activa'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{esc.nombre_escuela}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">CCT: {esc.cct}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                      <p>Nivel: <strong className="text-slate-700 dark:text-slate-300">{esc.nivel_educativo || 'Secundaria'}</strong></p>
                      <p>Turno: <strong className="text-slate-700 dark:text-slate-300">{esc.turno || 'Matutino'}</strong></p>
                      <p>Ubicación: <strong className="text-slate-700 dark:text-slate-300">{esc.municipio || 'General'}, {esc.estado || 'México'}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VISTA USUARIOS */}
          {activeMenu === 'usuarios' && (
            <div className="p-8 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 text-center space-y-2">
              <Users className="w-8 h-8 text-[#85162e] mx-auto mb-2" />
              <h3 className="text-lg font-bold">Gestión de Usuarios</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Los usuarios son consultados y administrados directamente desde la tabla <code>usuario</code> de PostgreSQL.
              </p>
              <p className="text-sm font-bold text-[#85162e] dark:text-rose-400 pt-2">
                Total de usuarios activos: {stats.usuariosRegistrados}
              </p>
            </div>
          )}

        </div>
      </main>

      {/* MODAL DETALLE DE SOLICITUD */}
      {selectedSol && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c0f13] rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 dark:border-rose-950">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#85162e] dark:text-rose-400">Detalle de Solicitud</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">{selectedSol.nombre_escuela}</h3>
                <span className="text-xs font-mono text-slate-400">CCT: {selectedSol.cct}</span>
              </div>
              <button onClick={() => setSelectedSol(null)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
              <p><strong>Nivel Educativo:</strong> {selectedSol.nivel_educativo || 'Secundaria'}</p>
              <p><strong>Turno:</strong> {selectedSol.turno || 'Matutino'}</p>
              <p><strong>Ubicación:</strong> {selectedSol.direccion || 'No especificada'}, {selectedSol.municipio}, {selectedSol.estado} (CP: {selectedSol.codigo_postal})</p>
              <p><strong>Responsable:</strong> {selectedSol.nombre_responsable}</p>
              <p><strong>Correo Institucional:</strong> {selectedSol.correo_institucional}</p>
              <p><strong>Teléfono:</strong> {selectedSol.telefono_responsable || 'No proporcionado'}</p>
              <p><strong>Estado Actual:</strong> <span className="font-bold">{selectedSol.estado_solicitud}</span></p>
              {selectedSol.motivo_rechazo && (
                <p className="text-rose-600"><strong>Motivo Rechazo:</strong> {selectedSol.motivo_rechazo}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSol(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                Cerrar
              </button>
              {selectedSol.estado_solicitud !== 'Aprobada' && (
                <button
                  type="button"
                  onClick={() => handleAprobar(selectedSol.id_solicitud)}
                  disabled={actionLoading}
                  className="btn-wine text-xs py-2 px-4"
                >
                  Aprobar Solicitud
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
