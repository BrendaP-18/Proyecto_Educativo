import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, CalendarCheck, BarChart3, Users, Sparkles, LogOut, ArrowRight, ShieldCheck, QrCode } from 'lucide-react';

export default function SuccessView({ userSession, onLogout }) {
  const { user, type } = userSession;

  useEffect(() => {
    // Trigger festive burgundy/gold confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6b1124', '#9e1c38', '#d99b26', '#f3b236', '#ffffff']
    });
  }, []);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'profesor': return 'Docente Titular';
      case 'estudiante': return 'Estudiante';
      case 'tutor': return 'Padre / Tutor Escolar';
      case 'directivo': return 'Administración Directiva';
      default: return 'Usuario Registrado';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto p-6 sm:p-10 text-center bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-2xl"
    >
      {/* Dynamic Success Checkmark Illustration Container */}
      <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
        {/* Glowing aura background */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-amber-500/20 rounded-full blur-xl"
        />
        <div className="relative w-20 h-20 bg-gradient-to-tr from-[#6b1124] to-[#a11d3b] rounded-3xl shadow-xl flex items-center justify-center text-white rotate-3 hover:rotate-0 transition-transform">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <div className="absolute -top-2 -right-2 bg-amber-400 text-slate-900 p-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      {/* Greeting Header */}
      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        {type === 'register' ? '¡Bienvenido a AstraEdu!' : '¡Autenticación Exitosa!'}
      </h2>
      <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base max-w-md mx-auto">
        Hola, <strong className="text-[#85162e] dark:text-rose-300 font-bold">{user.name}</strong>. Has accedido correctamente con tu perfil institucional.
      </p>

      {/* Profile Tag */}
      <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-xs font-bold text-[#6b1124] dark:text-rose-300">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Rol: {getRoleBadge(user.role)}</span>
        <span className="text-slate-400">•</span>
        <span className="font-mono text-slate-500 dark:text-slate-400">{user.email}</span>
      </div>

      {/* Module Overview Quick Cards */}
      <div className="mt-8 text-left">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
          Módulos listos para configurar en tu escuela
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950 text-[#6b1124] dark:text-rose-300 flex items-center justify-center mb-3">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Pase de Lista QR</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Escaneo instantáneo y registro automático por aula.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Rendimiento Académico</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gráficas avanzadas y promedios por asignatura.</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between hover:border-rose-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Alertas Tempranas</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Notificaciones a tutores por inasistencias consecutivas.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => alert(`Conectando con la base de datos... El backend puede ser integrado en la siguiente fase.`)}
          className="btn-wine w-full sm:w-auto"
        >
          <span>Ir al Panel Principal</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onLogout}
          className="btn-outline-wine w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </motion.div>
  );
}
