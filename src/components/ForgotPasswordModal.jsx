import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, CheckCircle2, ArrowRight, KeyRound } from 'lucide-react';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1000);
  };

  const handleReset = () => {
    setIsSent(false);
    setEmail('');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-[#1c0f13] rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-rose-950/60"
        >
          {/* Close button */}
          <button
            onClick={handleReset}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSent ? (
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-[#85162e] dark:text-rose-300 flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Recuperar Contraseña
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
                Ingresa el correo institucional asociado a tu cuenta escolar. Te enviaremos un enlace seguro de restauración.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="input-group">
                  <label htmlFor="forgot-email">Correo Electrónico</label>
                  <div className="input-wrapper">
                    <input
                      id="forgot-email"
                      type="email"
                      placeholder="usuario@escuela.edu.mx"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="custom-input"
                      required
                    />
                    <Mail className="input-icon w-4 h-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-wine w-full"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando enlace...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>Enviar Enlace de Recuperación</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                ¡Enlace Enviado!
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-6">
                Hemos enviado instrucciones para restablecer tu contraseña a <strong className="text-slate-700 dark:text-slate-200">{email}</strong>. Por favor revisa tu bandeja de entrada o carpeta de spam.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="btn-wine w-full"
              >
                Entendido, regresar al Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
