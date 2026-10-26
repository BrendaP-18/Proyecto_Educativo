import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, School, UserCheck, GraduationCap, Building2 } from 'lucide-react';

export default function LoginForm({ onSwitchToRegister, onSubmitSuccess, onForgotPassword }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    remember: true,
    role: 'profesor'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roles = [
    { id: 'profesor', label: 'Docente', icon: GraduationCap },
    { id: 'estudiante', label: 'Estudiante', icon: UserCheck },
    { id: 'tutor', label: 'Tutor / Padre', icon: Shield },
    { id: 'directivo', label: 'Directivo', icon: Building2 },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.identifier || !formData.password) {
      setErrorMessage('Por favor ingresa tu correo/matrícula y contraseña');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmitSuccess({
        type: 'login',
        user: {
          name: formData.identifier.split('@')[0] || 'Usuario',
          email: formData.identifier,
          role: formData.role
        }
      });
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {/* Title Header */}
      <div className="mb-6 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full inline-block mb-3 border border-rose-200 dark:border-rose-900">
          Bienvenido de nuevo
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Iniciar Sesión
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingresa tus credenciales para acceder al control escolar.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
          Selecciona tu Rol:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: item.id })}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-[#6b1124] text-white border-[#6b1124] shadow-md shadow-rose-950/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Identifier input */}
        <div className="input-group">
          <label htmlFor="login-identifier">Correo Institucional o Matrícula</label>
          <div className="input-wrapper">
            <input
              id="login-identifier"
              type="text"
              placeholder="ejemplo@escuela.edu.mx o A01234567"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="custom-input"
              required
            />
            <Mail className="input-icon w-4 h-4" />
          </div>
        </div>

        {/* Password input */}
        <div className="input-group">
          <div className="flex justify-between items-center">
            <label htmlFor="login-password">Contraseña</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-[#85162e] dark:text-rose-400 hover:underline focus:outline-none"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="input-wrapper">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="custom-input"
              required
            />
            <Lock className="input-icon w-4 h-4" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-btn"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me & Options */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.remember}
              onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-[#85162e] focus:ring-[#85162e] accent-[#85162e]"
            />
            Recordar mi sesión en este dispositivo
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-wine w-full mt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Ingresar al Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>

        {/* Institutional SSO divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative bg-white dark:bg-[#1c0f13] px-3 text-xs text-slate-400 uppercase tracking-wider">
            O accede con
          </span>
        </div>

        {/* Google Workspace button */}
        <button
          type="button"
          onClick={() => {
            setFormData({ ...formData, identifier: 'profesor.ejemplo@escuela.edu.mx' });
          }}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          Google Workspace Escolar
        </button>
      </form>

      {/* Switch to Register footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ¿Aún no tienes cuenta institucional?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#85162e] dark:text-rose-400 hover:underline focus:outline-none"
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
}
