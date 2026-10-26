import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Building2, GraduationCap, AlertCircle, FileText } from 'lucide-react';
import { authService } from '../../services/api';

export default function LoginForm({ onSubmitSuccess, onForgotPassword, onSolicitarAcceso }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    role: 'Directivo' // Opciones: Directivo o Docente
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roles = [
    { id: 'Directivo', label: 'Directivo', icon: Building2 },
    { id: 'Docente', label: 'Docente', icon: GraduationCap }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.identifier.trim() || !formData.password) {
      setErrorMessage('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({
        identifier: formData.identifier.trim(),
        password: formData.password,
        role: formData.role
      });

      setIsLoading(false);
      onSubmitSuccess({
        type: 'login',
        user: response.user,
        token: response.token
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Credenciales incorrectas o error de conexión con PostgreSQL.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-2 px-1">
      {/* Encabezado ACCESO SEGURO */}
      <div className="mb-6 text-left">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#85162e] dark:text-rose-400 block mb-1">
          ACCESO SEGURO
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Bienvenido de nuevo
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingresa tus datos para acceder al sistema escolar.
        </p>
      </div>

      {/* Selector de Rol: Directivo / Docente */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wider">
          Selecciona tu rol
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.role === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormData({ ...formData, role: item.id })}
                className={`py-3 px-3 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-[#6b1124] text-white border-[#6b1124] shadow-md shadow-rose-950/25 scale-[1.01]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-rose-400'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-rose-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Input Correo */}
        <div className="input-group">
          <label htmlFor="login-email">Correo electrónico</label>
          <div className="input-wrapper">
            <Mail className="input-icon w-4 h-4" />
            <input
              id="login-email"
              type="email"
              placeholder="nombre@correo.com"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="custom-input"
              required
            />
          </div>
        </div>

        {/* Input Contraseña */}
        <div className="input-group">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="login-pass">Contraseña</label>
            {onForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-semibold text-[#85162e] dark:text-rose-400 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon w-4 h-4" />
            <input
              id="login-pass"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ingresa tu contraseña"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="custom-input"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="toggle-password-btn"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Botón Ingresar al sistema */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-wine w-full mt-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verificando credenciales...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Ingresar al sistema</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </form>

      {/* Solicitar acceso para mi escuela */}
      <div className="mt-8 text-center space-y-3">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
            ¿Tu escuela aún no está registrada?
          </p>
          <button
            type="button"
            onClick={onSolicitarAcceso}
            className="text-sm font-bold text-[#85162e] dark:text-rose-400 hover:underline focus:outline-none"
          >
            Solicitar acceso para mi escuela
          </button>
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500">
          ¿Necesitas ayuda?{' '}
          <a
            href="#soporte"
            onClick={(e) => { e.preventDefault(); alert('Soporte institucional: admin@sicara.gob.mx'); }}
            className="font-semibold text-slate-600 dark:text-slate-300 hover:underline"
          >
            Contacta a soporte
          </a>
        </p>
      </div>
    </div>
  );
}
