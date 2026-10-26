import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Building, CheckCircle2, ArrowRight, Shield, GraduationCap, UserCheck, Building2 } from 'lucide-react';

export default function RegisterForm({ onSwitchToLogin, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    schoolCode: '',
    role: 'profesor',
    password: '',
    confirmPassword: '',
    agreeTerms: true
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

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);

  const getStrengthLabel = (s) => {
    switch (s) {
      case 0: return { label: 'Muy débil', color: 'bg-slate-300' };
      case 1: return { label: 'Débil', color: 'bg-rose-400' };
      case 2: return { label: 'Aceptable', color: 'bg-amber-400' };
      case 3: return { label: 'Buena', color: 'bg-emerald-400' };
      case 4: return { label: 'Excelente', color: 'bg-emerald-500' };
      default: return { label: '', color: 'bg-slate-300' };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage('Por favor completa todos los campos requeridos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('Debes aceptar los términos de privacidad y uso escolar');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSubmitSuccess({
        type: 'register',
        user: {
          name: formData.fullName,
          email: formData.email,
          role: formData.role,
          schoolCode: formData.schoolCode || 'CCT-DEFAULT-2026'
        }
      });
    }, 1400);
  };

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {/* Title Header */}
      <div className="mb-5 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full inline-block mb-2 border border-rose-200 dark:border-rose-900">
          Comienza Hoy Gratis
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Crear Cuenta Escolar
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Regístrate para llevar el control de asistencias y calificaciones.
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          ¿Cuál es tu rol institucional?
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
                className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected
                    ? 'bg-[#6b1124] text-white border-[#6b1124] shadow-md shadow-rose-950/20 scale-[1.02]'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-200' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Register Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Full Name */}
        <div className="input-group">
          <label htmlFor="reg-fullname">Nombre Completo</label>
          <div className="input-wrapper">
            <input
              id="reg-fullname"
              type="text"
              placeholder="Ej. Dra. María Lucía Morales"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="custom-input"
              required
            />
            <User className="input-icon w-4 h-4" />
          </div>
        </div>

        {/* Email & School Code Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="input-group">
            <label htmlFor="reg-email">Correo Electrónico</label>
            <div className="input-wrapper">
              <input
                id="reg-email"
                type="email"
                placeholder="correo@escuela.edu.mx"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="custom-input"
                required
              />
              <Mail className="input-icon w-4 h-4" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-schoolcode">Clave CCT / Escuela</label>
            <div className="input-wrapper">
              <input
                id="reg-schoolcode"
                type="text"
                placeholder="Ej. 14EPR0012Z"
                value={formData.schoolCode}
                onChange={(e) => setFormData({ ...formData, schoolCode: e.target.value })}
                className="custom-input"
              />
              <Building className="input-icon w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="input-group">
            <label htmlFor="reg-password">Contraseña</label>
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="custom-input"
                required
              />
              <Lock className="input-icon w-4 h-4" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-confirmpassword">Confirmar Contraseña</label>
            <div className="input-wrapper">
              <input
                id="reg-confirmpassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repite contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="custom-input"
                required
              />
              <Lock className="input-icon w-4 h-4" />
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
        </div>

        {/* Password Strength Meter */}
        {formData.password && (
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Fortaleza de contraseña:</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">
                {getStrengthLabel(strength).label}
              </span>
            </div>
            <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 rounded-full transition-all duration-300 ${
                    strength >= step ? getStrengthLabel(strength).color : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Terms checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#85162e] focus:ring-[#85162e] accent-[#85162e]"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
            Acepto los <a href="#privacy" className="text-[#85162e] dark:text-rose-400 underline font-medium">Términos de Servicio</a> y la <a href="#privacy" className="text-[#85162e] dark:text-rose-400 underline font-medium">Política de Protección de Datos Escolares</a>.
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
              <span>Creando Tu Cuenta...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Registrarme en AstraEdu</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </form>

      {/* Switch to Login footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          ¿Ya tienes una cuenta registrada?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#85162e] dark:text-rose-400 hover:underline focus:outline-none"
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
}
