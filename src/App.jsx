import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, Moon, Sun, Smartphone, Heart, Database } from 'lucide-react';
import LoginForm from './modules/auth/LoginForm';
import SolicitudEscuelaForm from './modules/auth/SolicitudEscuelaForm';
import SolicitudExitosaModal from './modules/auth/SolicitudExitosaModal';
import EduIllustration from './components/EduIllustration';
import AdminGeneralView from './modules/dashboard/AdminGeneralView';
import DashboardView from './modules/dashboard/DashboardView';
import { authService } from './services/api';

export default function App() {
  // 'login', 'solicitud', 'solicitud_exitosa'
  const [viewState, setViewState] = useState('login');
  
  const [userSession, setUserSession] = useState(() => {
    const saved = authService.getCurrentUser();
    return saved ? { user: saved, type: 'login' } : null;
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const handleAuthSuccess = (session) => {
    setUserSession(session);
  };

  const handleLogout = () => {
    authService.logout();
    setUserSession(null);
    setViewState('login');
  };

  // Si hay sesión iniciada
  if (userSession) {
    const role = (userSession.user.role || '').toLowerCase();
    if (role === 'administrador') {
      return <AdminGeneralView userSession={userSession} onLogout={handleLogout} />;
    }
    return <DashboardView userSession={userSession} onLogout={handleLogout} />;
  }

  // Vista cuando se abre el formulario "Solicitar acceso para mi escuela"
  if (viewState === 'solicitud') {
    return (
      <div className="min-h-screen bg-[#f8f6f7] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex flex-col justify-between py-6 px-4 font-sans selection:bg-[#85162e] selection:text-white">
        <SolicitudEscuelaForm
          onCancel={() => setViewState('login')}
          onSuccess={() => setViewState('solicitud_exitosa')}
        />
      </div>
    );
  }

  // Vista cuando la solicitud fue enviada con éxito (Imagen 4 con diseño vino)
  if (viewState === 'solicitud_exitosa') {
    return (
      <div className="min-h-screen bg-[#f8f6f7] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-[#85162e] selection:text-white">
        <SolicitudExitosaModal onVolver={() => setViewState('login')} />
      </div>
    );
  }

  // Vista de Inicio de Sesión (Login)
  return (
    <div className="min-h-screen bg-[#f8f6f7] dark:bg-[#12090b] text-slate-800 dark:text-slate-100 flex flex-col justify-between font-sans selection:bg-[#85162e] selection:text-white">
      
      {/* Barra superior institucional */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6b1124] text-white flex items-center justify-center shadow-lg shadow-rose-950/20">
            <BookOpen className="w-5 h-5 text-rose-200" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Astra<span className="text-[#85162e] dark:text-rose-400">Edu</span></span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <Database className="w-2.5 h-2.5" />
                PostgreSQL Conectado
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Control de Asistencias & Rendimiento Escolar
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 shadow-sm hover:border-rose-400"
          title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-rose-700" />}
        </button>
      </header>

      {/* Tarjeta Principal de Login Split */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex-1 flex items-center justify-center">
        <div className="w-full bg-white dark:bg-[#1c0f13] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-rose-950/60 overflow-hidden min-h-[580px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
            
            {/* Panel Izquierdo: Educación Rural Conectada (Paleta Vino) */}
            <div className="lg:col-span-6 p-3 sm:p-4">
              <EduIllustration />
            </div>

            {/* Panel Derecho: Formulario de Inicio de Sesión */}
            <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex items-center justify-center">
              <LoginForm
                onSubmitSuccess={handleAuthSuccess}
                onSolicitarAcceso={() => setViewState('solicitud')}
                onForgotPassword={() => alert('Para restablecer tu contraseña, por favor contacta a la administración escolar o envía un correo a admin@sicara.gob.mx')}
              />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-200/60 dark:border-slate-800/60 pt-4">
          <p>© 2026 AstraEdu — Sistema de Control de Asistencias y Rendimiento Escolar.</p>
          <p className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
            Diseñado en paleta vino <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 inline" /> para escuelas educativas
          </p>
        </div>
      </footer>

    </div>
  );
}
