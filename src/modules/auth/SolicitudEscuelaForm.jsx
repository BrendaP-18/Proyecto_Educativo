import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { solicitudesService } from '../../services/api';

export default function SolicitudEscuelaForm({ onCancel, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre_escuela: '',
    cct: '',
    nivel_educativo: 'Secundaria',
    turno: 'Matutino',
    estado: '',
    municipio: '',
    codigo_postal: '',
    direccion: '',
    nombre_responsable: '',
    telefono_responsable: '',
    correo_institucional: '',
    contrasena: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (
      !formData.nombre_escuela.trim() ||
      !formData.cct.trim() ||
      !formData.nombre_responsable.trim() ||
      !formData.correo_institucional.trim() ||
      !formData.contrasena
    ) {
      setErrorMessage('Por favor completa todos los campos requeridos de la escuela y responsable.');
      return;
    }

    if (formData.contrasena.length < 8) {
      setErrorMessage('La contraseña debe contener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      await solicitudesService.create(formData);
      setIsLoading(false);
      onSuccess();
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Error al registrar la solicitud. Verifica que la CCT no esté duplicada.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 px-2">
      {/* Botón Volver */}
      <div className="mb-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#85162e] dark:text-slate-400 dark:hover:text-rose-400"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </button>
      </div>

      {/* Encabezado */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#85162e] dark:text-rose-400 block mb-2">
          REGISTRO INSTITUCIONAL
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Solicita acceso para tu escuela
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
          Completa la información oficial. Todos los campos serán revisados por el Administrador General antes de habilitar el acceso.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Datos de la escuela */}
        <div className="p-6 sm:p-8 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-md space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-[#6b1124] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Datos de la escuela</h3>
              <p className="text-xs text-slate-400">Información oficial del plantel</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre de la escuela
            </label>
            <input
              name="nombre_escuela"
              type="text"
              placeholder="Ej. Primaria Benito Juárez"
              value={formData.nombre_escuela}
              onChange={handleChange}
              className="custom-input pl-4"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                CCT
              </label>
              <input
                name="cct"
                type="text"
                placeholder="Clave del centro de trabajo"
                value={formData.cct}
                onChange={handleChange}
                className="custom-input pl-4"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nivel educativo
              </label>
              <select
                name="nivel_educativo"
                value={formData.nivel_educativo}
                onChange={handleChange}
                className="custom-input pl-4 bg-white dark:bg-slate-800"
              >
                <option value="Preescolar">Preescolar</option>
                <option value="Primaria">Primaria</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Telesecundaria">Telesecundaria</option>
                <option value="Bachillerato">Bachillerato / Preparatoria</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Turno
              </label>
              <select
                name="turno"
                value={formData.turno}
                onChange={handleChange}
                className="custom-input pl-4 bg-white dark:bg-slate-800"
              >
                <option value="Matutino">Matutino</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Completo">Tiempo Completo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Estado
              </label>
              <input
                name="estado"
                type="text"
                placeholder="Estado"
                value={formData.estado}
                onChange={handleChange}
                className="custom-input pl-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Municipio
              </label>
              <input
                name="municipio"
                type="text"
                placeholder="Municipio"
                value={formData.municipio}
                onChange={handleChange}
                className="custom-input pl-4"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Código postal
              </label>
              <input
                name="codigo_postal"
                type="text"
                placeholder="00000"
                value={formData.codigo_postal}
                onChange={handleChange}
                className="custom-input pl-4"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Dirección
            </label>
            <input
              name="direccion"
              type="text"
              placeholder="Calle, número y localidad"
              value={formData.direccion}
              onChange={handleChange}
              className="custom-input pl-4"
            />
          </div>
        </div>

        {/* Sección 2: Responsable y acceso */}
        <div className="p-6 sm:p-8 bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-md space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-7 h-7 rounded-full bg-[#6b1124] text-white text-xs font-bold flex items-center justify-center">
              2
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Responsable y acceso</h3>
              <p className="text-xs text-slate-400">La persona que administrará la escuela (Rol Directivo)</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nombre completo
            </label>
            <input
              name="nombre_responsable"
              type="text"
              placeholder="Nombre del responsable"
              value={formData.nombre_responsable}
              onChange={handleChange}
              className="custom-input pl-4"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Teléfono
              </label>
              <input
                name="telefono_responsable"
                type="tel"
                placeholder="Teléfono de contacto"
                value={formData.telefono_responsable}
                onChange={handleChange}
                className="custom-input pl-4"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Correo institucional
              </label>
              <input
                name="correo_institucional"
                type="email"
                placeholder="responsable@escuela.edu.mx"
                value={formData.correo_institucional}
                onChange={handleChange}
                className="custom-input pl-4"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Crea una contraseña
            </label>
            <input
              name="contrasena"
              type="password"
              placeholder="Mínimo 8 caracteres"
              value={formData.contrasena}
              onChange={handleChange}
              className="custom-input pl-4"
              required
              minLength={8}
            />
          </div>
        </div>

        {/* Footer con advertencia y botón de envío */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#85162e] dark:text-rose-400 shrink-0" />
            <span>Tus datos se guardarán en PostgreSQL para validar y administrar el acceso.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-wine w-full sm:w-auto px-8"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Registrando en base de datos...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>Enviar solicitud</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
