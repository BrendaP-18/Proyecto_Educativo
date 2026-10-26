import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Calendar, BookOpen, LogOut, Check, Search, 
  ChevronRight, AlertTriangle, ArrowRight, Download, Save, 
  Users, BarChart3, Clock, CheckCircle2, School, HelpCircle,
  Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { docenteService } from '../../services/api';

export default function DocentePortalView({ userSession, onLogout }) {
  const { user } = userSession;

  // Pestaña activa: 'resumen', 'asistencia', 'calificaciones'
  const [activeTab, setActiveTab] = useState('resumen');

  // Estados de carga y datos principales
  const [loading, setLoading] = useState(true);
  const [docenteData, setDocenteData] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [materias, setMaterias] = useState([]);

  // Filtros seleccionados
  const [selectedGrupoId, setSelectedGrupoId] = useState('');
  const [selectedMateriaId, setSelectedMateriaId] = useState('');
  const [selectedPeriodo, setSelectedPeriodo] = useState('1er Periodo');
  const [selectedFecha, setSelectedFecha] = useState(() => new Date().toISOString().split('T')[0]);

  // Datos de asistencia y calificaciones
  const [asistenciaAlumnos, setAsistenciaAlumnos] = useState([]);
  const [asistenciaResumen, setAsistenciaResumen] = useState({ presentes: 0, ausentes: 0, retardos: 0 });
  const [calificacionesAlumnos, setCalificacionesAlumnos] = useState([]);

  // Búsqueda en listas
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // 1. Cargar datos del docente al montar
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const idUsuario = user.id_usuario || user.id;
        const res = await docenteService.getDashboard(idUsuario);
        if (res.success) {
          setDocenteData(res);
          setGrupos(res.grupos || []);
          setMaterias(res.materias || []);
          if (res.grupos && res.grupos.length > 0) {
            setSelectedGrupoId(res.grupos[0].id_grupo);
          }
          if (res.materias && res.materias.length > 0) {
            setSelectedMateriaId(res.materias[0].id_materia);
          }
        }
      } catch (err) {
        console.error('Error al cargar datos del docente:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [user]);

  // 2. Cargar Asistencia cuando cambie el grupo o fecha o al entrar a la pestaña 'asistencia'
  useEffect(() => {
    if (activeTab === 'asistencia' && selectedGrupoId) {
      loadAsistenciaData();
    }
  }, [activeTab, selectedGrupoId, selectedFecha]);

  const loadAsistenciaData = async () => {
    try {
      const res = await docenteService.getAsistencia(selectedGrupoId, selectedFecha);
      if (res.success) {
        setAsistenciaAlumnos(res.alumnos || []);
        if (res.resumen) {
          setAsistenciaResumen(res.resumen);
        }
      }
    } catch (err) {
      console.error('Error cargando asistencias:', err);
    }
  };

  // 3. Cargar Calificaciones cuando cambie grupo, materia o periodo o al entrar a la pestaña 'calificaciones'
  useEffect(() => {
    if (activeTab === 'calificaciones' && selectedGrupoId && selectedMateriaId) {
      loadCalificacionesData();
    }
  }, [activeTab, selectedGrupoId, selectedMateriaId, selectedPeriodo]);

  const loadCalificacionesData = async () => {
    try {
      const res = await docenteService.getCalificaciones(selectedGrupoId, selectedMateriaId, selectedPeriodo);
      if (res.success) {
        setCalificacionesAlumnos(res.alumnos || []);
      }
    } catch (err) {
      console.error('Error cargando calificaciones:', err);
    }
  };

  // Cambiar estado de asistencia de un alumno localmente
  const handleEstadoAsistenciaChange = (idAlumno, nuevoEstado) => {
    setAsistenciaAlumnos(prev => {
      const updated = prev.map(al => al.id_alumno === idAlumno ? { ...al, estado_asistencia: nuevoEstado } : al);
      // Recalcular resumen
      let presentes = 0, ausentes = 0, retardos = 0;
      updated.forEach(a => {
        const e = (a.estado_asistencia || '').toLowerCase();
        if (e === 'presente') presentes++;
        else if (e === 'ausente') ausentes++;
        else if (e === 'retardo') retardos++;
      });
      setAsistenciaResumen({ presentes, ausentes, retardos });
      return updated;
    });
  };

  // Cambiar observación de asistencia
  const handleObservacionAsistenciaChange = (idAlumno, obs) => {
    setAsistenciaAlumnos(prev => prev.map(al => al.id_alumno === idAlumno ? { ...al, observaciones: obs } : al));
  };

  // Guardar asistencia en PostgreSQL
  const handleGuardarAsistencia = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const idDocente = docenteData?.docente?.id_docente;
      const registros = asistenciaAlumnos.map(a => ({
        id_alumno: a.id_alumno,
        estado_asistencia: a.estado_asistencia,
        observaciones: a.observaciones
      }));

      await docenteService.guardarAsistencia({
        id_grupo: selectedGrupoId,
        id_docente: idDocente,
        fecha: selectedFecha,
        registros
      });

      setSaveSuccessMsg('¡Asistencia guardada exitosamente en el sistema!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error al guardar asistencia: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Cambiar calificación localmente
  const handleCalificacionChange = (idAlumno, valor) => {
    setCalificacionesAlumnos(prev => prev.map(al => al.id_alumno === idAlumno ? { ...al, calificacion: valor } : al));
  };

  // Cambiar observación de calificación
  const handleObservacionCalificacionChange = (idAlumno, obs) => {
    setCalificacionesAlumnos(prev => prev.map(al => al.id_alumno === idAlumno ? { ...al, observaciones: obs } : al));
  };

  // Guardar calificaciones en PostgreSQL
  const handleGuardarCalificaciones = async () => {
    setIsSaving(true);
    setSaveSuccessMsg('');
    try {
      const idDocente = docenteData?.docente?.id_docente;
      const registros = calificacionesAlumnos.map(a => ({
        id_alumno: a.id_alumno,
        calificacion: parseFloat(a.calificacion) || 0,
        observaciones: a.observaciones
      }));

      await docenteService.guardarCalificaciones({
        id_grupo: selectedGrupoId,
        id_materia: selectedMateriaId,
        id_docente: idDocente,
        periodo: selectedPeriodo,
        calificaciones: registros
      });

      setSaveSuccessMsg('¡Calificaciones guardadas exitosamente en el sistema!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Error al guardar calificaciones: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Exportar a Excel usando XLSX
  const handleExportarExcel = () => {
    const grupoActual = grupos.find(g => g.id_grupo === selectedGrupoId)?.nombre_grupo || 'Grupo';
    const materiaActual = materias.find(m => m.id_materia === selectedMateriaId)?.nombre_materia || 'Materia';

    const dataExcel = calificacionesAlumnos.map((a, idx) => ({
      'No.': idx + 1,
      'Alumno': `${a.apellidos} ${a.nombre}`,
      'CURP': a.curp,
      'Grupo': grupoActual,
      'Materia': materiaActual,
      'Periodo': selectedPeriodo,
      'Calificación': Number(a.calificacion),
      'Observaciones': a.observaciones || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');

    // Auto-ajuste de anchos de columna
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 22 },
      { wch: 10 },
      { wch: 18 },
      { wch: 15 },
      { wch: 14 },
      { wch: 30 }
    ];

    XLSX.writeFile(workbook, `Calificaciones_${grupoActual}_${materiaActual}_${selectedPeriodo}.xlsx`);
  };

  // Nombre de la escuela actual
  const escuelaNombre = docenteData?.docente?.nombre_escuela || 'Primaria Juan Escutia';
  const docenteNombre = `${docenteData?.docente?.nombre || user.nombre || 'Majo'} ${docenteData?.docente?.apellidos || user.apellidos || 'Hernández'}`;
  const docenteIniciales = (docenteNombre.split(' ').map(n => n[0]).slice(0, 2).join('')).toUpperCase() || 'MH';
  const docenteEspecialidad = docenteData?.docente?.especialidad || 'Español';

  // Fecha legible en español
  const hoyStr = new Intl.DateTimeFormat('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
  const fechaHoyCapitalizada = hoyStr.charAt(0).toUpperCase() + hoyStr.slice(1);

  // Filtrado de alumnos según la búsqueda
  const filteredAsistencia = asistenciaAlumnos.filter(a => 
    `${a.nombre} ${a.apellidos} ${a.curp}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCalificaciones = calificacionesAlumnos.filter(a => 
    `${a.nombre} ${a.apellidos} ${a.curp}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentGrupo = grupos.find(g => g.id_grupo === selectedGrupoId);
  const currentMateria = materias.find(m => m.id_materia === selectedMateriaId);

  return (
    <div className="w-full min-h-screen bg-[#fcf9fa] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-[#85162e] selection:text-white">
      
      {/* SIDEBAR LATERAL (Estilo SICARA con paleta Vino institucional) */}
      <aside className="w-full lg:w-64 bg-white dark:bg-[#1c0f13] border-r border-slate-200/80 dark:border-rose-950/60 p-5 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Logo Brand SICARA */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#6b1124] text-white flex items-center justify-center shadow-lg shadow-rose-950/20">
              <School className="w-6 h-6 text-rose-200" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                SICARA
              </h2>
              <span className="text-[11px] text-slate-400 font-medium">Control escolar</span>
            </div>
          </div>

          {/* Tarjeta de Escuela */}
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#6b1124] dark:text-rose-400">
              <School className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">ESCUELA</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={escuelaNombre}>
                {escuelaNombre}
              </p>
            </div>
          </div>

          {/* Menú de Navegación del Profesor */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block px-3 mb-2">
              PORTAL DEL PROFESOR
            </span>

            <button
              onClick={() => setActiveTab('resumen')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'resumen'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Resumen</span>
            </button>

            <button
              onClick={() => setActiveTab('asistencia')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'asistencia'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Asistencia</span>
            </button>

            <button
              onClick={() => setActiveTab('calificaciones')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'calificaciones'
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Calificaciones</span>
            </button>
          </div>
        </div>

        {/* Perfil del Docente abajo */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#85162e] dark:text-rose-300 font-bold text-xs flex items-center justify-center shrink-0">
              {docenteIniciales}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{docenteNombre}</p>
              <p className="text-[11px] text-slate-400 capitalize">{user.role || 'Profesor'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* HEADER SUPERIOR CON BREADCRUMB */}
        <header className="h-16 px-6 sm:px-8 border-b border-slate-200/80 dark:border-rose-950/60 bg-white/70 dark:bg-[#1c0f13]/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span>{escuelaNombre}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 dark:text-white font-bold capitalize">
              {activeTab === 'resumen' ? 'Resumen' : activeTab === 'asistencia' ? 'Asistencia' : 'Calificaciones'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/70 text-[#6b1124] dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              Profesor
            </span>
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950 text-[#85162e] dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                {docenteIniciales}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{docenteNombre}</p>
                <p className="text-[10px] text-slate-400">{docenteEspecialidad}</p>
              </div>
            </div>
          </div>
        </header>

        {/* NOTIFICACIÓN FLOTANTE DE GUARDADO */}
        {saveSuccessMsg && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* CONTENIDO SEGÚN LA PESTAÑA */}
        <div className="p-6 sm:p-8 flex-1 flex flex-col max-w-7xl w-full mx-auto">
          
          {/* ==================== VISTA 1: RESUMEN ==================== */}
          {activeTab === 'resumen' && (
            <div className="space-y-6 flex-1 flex flex-col animate-fade-in">
              {/* Encabezado de Bienvenida */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-1">
                  {fechaHoyCapitalizada}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Buenos días, {docenteData?.docente?.nombre || user.nombre || 'Majo'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Estos son tus grupos y actividades asignadas.
                </p>
              </div>

              {/* Banner Tarjeta "CLASE DE HOY" con botón Tomar Asistencia */}
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6b1124] dark:text-rose-400 block mb-1">
                    CLASE DE HOY
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {currentMateria?.nombre_materia || 'Español'} • {currentGrupo?.nombre_grupo || '5° A'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    09:00 - 10:00 • {docenteData?.stats?.totalAlumnos ?? 0} alumnos inscritos
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('asistencia')}
                  className="btn-wine flex items-center justify-center gap-2.5 py-3 px-6 text-sm font-bold shadow-lg shadow-rose-950/20"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Tomar asistencia</span>
                </button>
              </div>

              {/* Métricas Principales (Grid de 4 tarjetas estilo imagen) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Alumnos asignados */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">Alumnos asignados</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {docenteData?.stats?.totalAlumnos ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-3 block">
                    Grupo {currentGrupo?.nombre_grupo || 'No asignado'}
                  </span>
                </div>

                {/* 2. Asistencia del mes */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">Asistencia del mes</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {docenteData?.stats?.asistenciaMes ?? 0}%
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-3 block">
                    {docenteData?.stats?.asistenciaMes > 0 ? 'Dentro de la meta' : 'Sin asistencias registradas'}
                  </span>
                </div>

                {/* 3. Promedio del grupo */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">Promedio del grupo</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {docenteData?.stats?.promedioGrupo ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-3 block">
                    Periodo actual
                  </span>
                </div>

                {/* 4. Alumnos en alerta */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">Alumnos en alerta</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {docenteData?.stats?.alumnosEnAlerta ?? 0}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#85162e] dark:text-rose-300 font-semibold mt-3 block">
                    {docenteData?.stats?.alumnosEnAlerta > 0 ? 'Requieren seguimiento' : 'Sin alertas'}
                  </span>
                </div>
              </div>

              {/* Fila Inferior: Mis Asignaciones & Alumnos en Riesgo */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                {/* Mis Asignaciones */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Mis asignaciones</h3>
                    <p className="text-xs text-slate-400">Grupos y materias habilitados por el directivo</p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {docenteData?.asignaciones && docenteData.asignaciones.length > 0 ? (
                      docenteData.asignaciones.map((asig, i) => (
                        <div 
                          key={i}
                          onClick={() => {
                            setSelectedGrupoId(asig.id_grupo);
                            setSelectedMateriaId(asig.id_materia);
                            setActiveTab('asistencia');
                          }}
                          className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900 bg-slate-50/50 dark:bg-slate-900/40 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[#6b1124] dark:text-rose-300">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#6b1124] dark:group-hover:text-rose-300 transition-colors">
                                {asig.nombre_materia}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {asig.nombre_grupo} • Ciclo {asig.ciclo_escolar || '2024-2025'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                              Activa
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">No hay asignaciones registradas.</div>
                    )}
                  </div>
                </div>

                {/* Alumnos en Riesgo */}
                <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">Alumnos en riesgo</h3>
                    <p className="text-xs text-slate-400">Asistencia o calificación requieren atención</p>
                  </div>

                  <div className="space-y-3 flex-1">
                    {docenteData?.alumnosRiesgo && docenteData.alumnosRiesgo.length > 0 ? (
                      docenteData.alumnosRiesgo.map((al, idx) => {
                        const inits = `${al.nombre[0]}${al.apellidos[0]}`.toUpperCase();
                        const isAlto = al.descripcion.toLowerCase().includes('alto');
                        return (
                          <div 
                            key={idx}
                            className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 text-[#85162e] dark:text-rose-300 font-bold text-xs flex items-center justify-center">
                                {inits}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                  {al.nombre} {al.apellidos}
                                </h4>
                                <p className="text-xs text-slate-400">{al.descripcion}</p>
                              </div>
                            </div>

                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isAlto 
                                ? 'bg-rose-100 dark:bg-rose-950 text-[#85162e] dark:text-rose-300' 
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                            }`}>
                              {isAlto ? 'Riesgo alto' : 'Seguimiento'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-400">No hay alertas activas para tus alumnos.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VISTA 2: ASISTENCIA ==================== */}
          {activeTab === 'asistencia' && (
            <div className="space-y-6 flex-1 flex flex-col animate-fade-in">
              {/* Barra Superior con Selector de Filtros */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#6b1124] dark:text-rose-400 block mb-1">
                    REGISTRO DIARIO
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Asistencia de {currentGrupo?.nombre_grupo || '5° A'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {currentMateria?.nombre_materia || 'Español'} • {fechaHoyCapitalizada}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Selector de Grupo */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c0f13] border border-slate-200 dark:border-rose-950/60 rounded-xl px-3 py-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Grupo:</label>
                    <select
                      value={selectedGrupoId}
                      onChange={(e) => setSelectedGrupoId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      {grupos.map(g => (
                        <option key={g.id_grupo} value={g.id_grupo} className="dark:bg-[#1c0f13]">
                          {g.nombre_grupo} ({g.grado}° Primaria)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Fecha */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c0f13] border border-slate-200 dark:border-rose-950/60 rounded-xl px-3 py-1.5 shadow-sm">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="date"
                      value={selectedFecha}
                      onChange={(e) => setSelectedFecha(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    />
                  </div>

                  {/* Botón Guardar Asistencia */}
                  <button
                    onClick={handleGuardarAsistencia}
                    disabled={isSaving}
                    className="btn-wine flex items-center gap-2 py-2 px-5 text-xs font-bold shadow-md shadow-rose-950/20 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar asistencia'}</span>
                  </button>
                </div>
              </div>

              {/* Contadores Resumen de Hoy (Presentes, Ausentes, Retardos) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {asistenciaResumen.presentes}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Presentes</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {asistenciaResumen.ausentes}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ausentes</span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 shadow-sm flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {asistenciaResumen.retardos}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Retardos</span>
                </div>
              </div>

              {/* Tabla de Alumnos para Tomar Asistencia */}
              <div className="bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col">
                {/* Cabecera de la tabla con barra de búsqueda */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {filteredAsistencia.length} alumnos
                    </h3>
                    <p className="text-xs text-slate-400">
                      Grupo {currentGrupo?.nombre_grupo || '5° A'} - Primaria
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:border-rose-500 dark:focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Lista de Filas */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-6">ALUMNO</th>
                        <th className="py-3 px-6">CURP</th>
                        <th className="py-3 px-6">ESTADO DE ASISTENCIA</th>
                        <th className="py-3 px-6">OBSERVACIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredAsistencia.map((al, idx) => {
                        const inits = `${al.nombre[0]}${al.apellidos[0]}`.toUpperCase();
                        const estado = al.estado_asistencia || 'Presente';

                        return (
                          <tr key={al.id_alumno} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                            {/* Alumno */}
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {inits}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-100">
                                    {al.nombre} {al.apellidos}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    A-00{idx + 1}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* CURP */}
                            <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {al.curp}
                            </td>

                            {/* Estado de Asistencia con dropdown interactivo */}
                            <td className="py-3.5 px-6">
                              <select
                                value={estado}
                                onChange={(e) => handleEstadoAsistenciaChange(al.id_alumno, e.target.value)}
                                className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none transition-all ${
                                  estado === 'Presente'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                                    : estado === 'Ausente'
                                    ? 'bg-rose-50 dark:bg-rose-950/60 text-[#85162e] dark:text-rose-300 border-rose-200 dark:border-rose-900'
                                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
                                }`}
                              >
                                <option value="Presente">Presente</option>
                                <option value="Ausente">Ausente</option>
                                <option value="Retardo">Retardo</option>
                              </select>
                            </td>

                            {/* Observaciones */}
                            <td className="py-3.5 px-6">
                              <input
                                type="text"
                                placeholder="Agregar observación..."
                                value={al.observaciones || ''}
                                onChange={(e) => handleObservacionAsistenciaChange(al.id_alumno, e.target.value)}
                                className="w-full px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-400"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VISTA 3: CALIFICACIONES ==================== */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-6 flex-1 flex flex-col animate-fade-in">
              {/* Barra Superior con Filtros y Botones */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Calificaciones de {currentGrupo?.nombre_grupo || '5° A'}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {currentMateria?.nombre_materia || 'Español'} • Captura calificaciones de 0 a 10
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Filtro Grupo */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c0f13] border border-slate-200 dark:border-rose-950/60 rounded-xl px-3 py-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Grupo:</label>
                    <select
                      value={selectedGrupoId}
                      onChange={(e) => setSelectedGrupoId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      {grupos.map(g => (
                        <option key={g.id_grupo} value={g.id_grupo} className="dark:bg-[#1c0f13]">
                          {g.nombre_grupo} ({g.grado}° Primaria)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Materia */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c0f13] border border-slate-200 dark:border-rose-950/60 rounded-xl px-3 py-1.5 shadow-sm">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Materia:</label>
                    <select
                      value={selectedMateriaId}
                      onChange={(e) => setSelectedMateriaId(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      {materias.map(m => (
                        <option key={m.id_materia} value={m.id_materia} className="dark:bg-[#1c0f13]">
                          {m.nombre_materia}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Periodo */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-[#1c0f13] border border-slate-200 dark:border-rose-950/60 rounded-xl px-3 py-1.5 shadow-sm">
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Periodo:</label>
                    <select
                      value={selectedPeriodo}
                      onChange={(e) => setSelectedPeriodo(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
                    >
                      <option value="1er Periodo" className="dark:bg-[#1c0f13]">1er Periodo</option>
                      <option value="2do Periodo" className="dark:bg-[#1c0f13]">2do Periodo</option>
                      <option value="3er Periodo" className="dark:bg-[#1c0f13]">3er Periodo</option>
                    </select>
                  </div>

                  {/* Botón Exportar a Excel */}
                  <button
                    onClick={handleExportarExcel}
                    className="btn-outline-wine flex items-center gap-2 py-2 px-4 text-xs font-bold shadow-sm"
                    title="Descargar calificaciones en Excel (.xlsx)"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportar Excel</span>
                  </button>

                  {/* Botón Guardar Calificaciones */}
                  <button
                    onClick={handleGuardarCalificaciones}
                    disabled={isSaving}
                    className="btn-wine flex items-center gap-2 py-2 px-5 text-xs font-bold shadow-md shadow-rose-950/20 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar calificaciones'}</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Alumnos para Calificaciones */}
              <div className="bg-white dark:bg-[#1c0f13] border border-slate-200/80 dark:border-rose-950/60 rounded-3xl shadow-sm overflow-hidden flex-1 flex flex-col">
                {/* Cabecera con Buscador */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      {filteredCalificaciones.length} alumnos
                    </h3>
                    <p className="text-xs text-slate-400">
                      Grupo {currentGrupo?.nombre_grupo || '5° A'} - Primaria
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar alumno..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs focus:outline-none focus:border-rose-500 dark:focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Lista de Filas */}
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                        <th className="py-3 px-6">ALUMNO</th>
                        <th className="py-3 px-6">CURP</th>
                        <th className="py-3 px-6">CALIFICACIÓN</th>
                        <th className="py-3 px-6">OBSERVACIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {filteredCalificaciones.map((al, idx) => {
                        const inits = `${al.nombre[0]}${al.apellidos[0]}`.toUpperCase();

                        return (
                          <tr key={al.id_alumno} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors">
                            {/* Alumno */}
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">
                                  {inits}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-slate-100">
                                    {al.nombre} {al.apellidos}
                                  </p>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    A-00{idx + 1}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* CURP */}
                            <td className="py-3.5 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                              {al.curp}
                            </td>

                            {/* Calificación input numérico */}
                            <td className="py-3.5 px-6">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                value={al.calificacion}
                                onChange={(e) => handleCalificacionChange(al.id_alumno, e.target.value)}
                                className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                              />
                            </td>

                            {/* Observaciones */}
                            <td className="py-3.5 px-6">
                              <input
                                type="text"
                                placeholder="Agregar observación..."
                                value={al.observaciones || ''}
                                onChange={(e) => handleObservacionCalificacionChange(al.id_alumno, e.target.value)}
                                className="w-full px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-rose-400"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
