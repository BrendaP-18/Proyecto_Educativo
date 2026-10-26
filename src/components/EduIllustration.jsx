import React from 'react';
import { Smartphone, ShieldCheck, AlertTriangle, FileText, Sparkles } from 'lucide-react';

export default function EduIllustration() {
  return (
    <div className="relative w-full h-full min-h-[520px] lg:min-h-[620px] bg-gradient-to-br from-[#420914] via-[#6b1124] to-[#9e1c38] p-8 sm:p-12 flex flex-col justify-between overflow-hidden text-white rounded-3xl shadow-2xl select-none">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

      {/* Decorative Subtle Circles */}
      <div className="absolute top-12 right-12 w-96 h-96 rounded-full border border-rose-300/10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full border border-rose-300/10 pointer-events-none" />

      {/* Top Floating App Icon */}
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner mb-10">
          <Smartphone className="w-6 h-6 stroke-[1.8] text-rose-200" />
        </div>

        {/* Badge & Main Title */}
        <span className="text-xs font-bold uppercase tracking-widest text-rose-300 block mb-3">
          EDUCACIÓN RURAL CONECTADA
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight max-w-md">
          Información clara para tomar mejores decisiones.
        </h1>
        <p className="mt-4 text-sm sm:text-base text-rose-100/80 max-w-sm leading-relaxed">
          Controla la asistencia y el rendimiento académico de cada comunidad escolar desde un solo lugar.
        </p>
      </div>

      {/* Bottom Features Cards */}
      <div className="relative z-10 pt-8 mt-auto border-t border-rose-400/20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Datos protegidos</h4>
              <p className="text-[11px] text-rose-200/80 mt-0.5">Separación segura por escuela</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Alertas oportunas</h4>
              <p className="text-[11px] text-rose-200/80 mt-0.5">Detección temprana de riesgos</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <FileText className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white">Reportes simples</h4>
              <p className="text-[11px] text-rose-200/80 mt-0.5">Indicadores fáciles de entender</p>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-rose-300/70 font-medium">
          Plataforma para comunidades educativas rurales
        </p>
      </div>
    </div>
  );
}
