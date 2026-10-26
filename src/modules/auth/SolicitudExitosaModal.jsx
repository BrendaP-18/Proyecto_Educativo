import React from 'react';
import { Check } from 'lucide-react';

export default function SolicitudExitosaModal({ onVolver }) {
  return (
    <div className="w-full max-w-md mx-auto p-8 sm:p-10 text-center bg-white dark:bg-[#1c0f13] rounded-3xl border border-slate-200/80 dark:border-rose-950/60 shadow-2xl">
      {/* Ícono circular vino/rosa suave */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-rose-50 dark:bg-rose-950/80 flex items-center justify-center text-[#85162e] dark:text-rose-300">
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#85162e] dark:text-rose-400 block mb-2">
        SOLICITUD RECIBIDA
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Revisaremos los datos de tu escuela
      </h2>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 mt-3 leading-relaxed">
        El Administrador General validará la información en el sistema. Cuando la solicitud sea aprobada, podrás ingresar con el correo institucional y contraseña registrados con permisos de <strong>Directivo</strong>.
      </p>

      <button
        type="button"
        onClick={onVolver}
        className="btn-wine w-full mt-8 text-sm"
      >
        Volver al inicio de sesión
      </button>
    </div>
  );
}
