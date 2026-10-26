import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, Building, ArrowRight, Shield, GraduationCap, UserCheck, Building2, AlertCircle } from 'lucide-react';
import { authService, escuelasService } from '../../services/api';

export default function RegisterForm({ onSwitchToLogin, onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    correo: '',
    id_escuela: '',
    cct: '',
    rol: 'Docente',
    contrasena: '',
    confirmPassword: '',
    agreeTerms: true
  });

  const [escuelas, setEscuelas] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roles = [
    { id: 'Docente', label: 'Docente', icon: GraduationCap },
    { id: 'Estudiante', label: 'Estudiante', icon: UserCheck },
    { id: 'Directivo', label: 'Directivo', icon: Building2 },
    { id: 'Tutor', label: 'Tutor / Padre', icon: Shield },
  ];

  // Cargar escuelas disponibles desde PostgreSQL
  useEffect(() => {
    async function loadEscuelas() {
      try {
        const data = await escuelasService.getEscuelas();
        if (data.escuelas && data.escuelas.length > 0) {
          setEscuelas(data.escuelas);
          setFormData((prev) => ({
            ...prev,
            id_escuela: data.escuelas[0].id_escuela,
            cct: data.escuelas[0].cct
          }));
        }
      } catch (err) {
        console.warn('No se pudieron precargar las escuelas:', err);
      }
    }
    loadEscuelas();
  }, []);

  const getPasswordStrength = (pass) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.contrasena);

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

  const handleEscuelaSelect = (e) => {
    const selectedId = e.target.value;
    const found = escuelas.find(esc => esc.id_escuela === selectedId);
    setFormData({
      ...formData,
      id_escuela: selectedId,
      cct: found ? found.cct : ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.nombre || !formData.correo || !formData.contrasena || !formData.confirmPassword) {
      setErrorMessage('Por favor completa todos los campos requeridos.');
      return;
    }

    if (formData.contrasena !== formData.confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage('Debes aceptar los términos de protección de datos escolares.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        correo: formData.correo,
        contrasena: formData.contrasena,
        rol: formData.rol,
        id_escuela: formData.id_escuela,
        cct: formData.cct
      });

      setIsLoading(false);
      onSubmitSuccess({
        type: 'register',
        user: response.user,
        token: response.token
      });
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Error al guardar usuario en la base de datos.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-2">
      {/* Encabezado */}
      <div className="mb-5 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-3 py-1 rounded-full inline-block mb-2 border border-rose-200 dark:border-rose-900">
          Base de Datos: Asistencias Escolares
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Crear Cuenta Escolar
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Los datos se almacenarán directamente en PostgreSQL con contraseña encriptada.
        </p>
      </div>

      {/* Selector de Rol */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          ¿Cuál es tu rol institucional?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {roles.map((item) => {
            const Icon = item.icon;
            const isSelected = formData.rol === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormData({ ...formData, rol: item.id })}
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

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {/* Nombres y Apellidos (Separados para coincidir exactamente con la BD) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="input-group">
            <label htmlFor="reg-nombre">Nombre(s) *</label>
            <div className="input-wrapper">
              <input
                id="reg-nombre"
                type="text"
                placeholder="Ej. María"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="custom-input"
                required
              />
              <User className="input-icon w-4 h-4" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-apellidos">Apellidos</label>
            <div className="input-wrapper">
              <input
                id="reg-apellidos"
                type="text"
                placeholder="Ej. Morales Pérez"
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                className="custom-input"
              />
              <User className="input-icon w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Correo y Escuela de la BD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="input-group">
            <label htmlFor="reg-email">Correo Institucional *</label>
            <div className="input-wrapper">
              <input
                id="reg-email"
                type="email"
                placeholder="profesor@escuela.edu.mx"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                className="custom-input"
                required
              />
              <Mail className="input-icon w-4 h-4" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-escuela">Institución Escolar</label>
            <div className="input-wrapper">
              {escuelas.length > 0 ? (
                <select
                  id="reg-escuela"
                  value={formData.id_escuela}
                  onChange={handleEscuelaSelect}
                  className="custom-input cursor-pointer"
                >
                  {escuelas.map((esc) => (
                    <option key={esc.id_escuela} value={esc.id_escuela}>
                      {esc.nombre_escuela} ({esc.cct})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id="reg-escuela"
                  type="text"
                  placeholder="Clave CCT (Ej. 14DST0001A)"
                  value={formData.cct}
                  onChange={(e) => setFormData({ ...formData, cct: e.target.value })}
                  className="custom-input"
                />
              )}
              <Building className="input-icon w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Contraseña y Confirmar Contraseña */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="input-group">
            <label htmlFor="reg-password">Contraseña *</label>
            <div className="input-wrapper">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                value={formData.contrasena}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
                className="custom-input"
                required
              />
              <Lock className="input-icon w-4 h-4" />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="reg-confirmpassword">Confirmar Contraseña *</label>
            <div className="input-wrapper">
              <input
                id="reg-confirmpassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
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

        {/* Barra de Fuerza de Contraseña */}
        {formData.contrasena && (
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

        {/* Aceptación de términos */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={formData.agreeTerms}
            onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-[#85162e] focus:ring-[#85162e] accent-[#85162e]"
          />
          <label htmlFor="terms" className="text-xs text-slate-600 dark:text-slate-400">
            Acepto el registro en la base de datos institucional de asistencias y calificaciones.
          </label>
        </div>

        {/* Botón de Enviar */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-wine w-full mt-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Guardando en PostgreSQL...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Registrarme en AstraEdu</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </button>
      </form>

      {/* Switch a Login */}
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
