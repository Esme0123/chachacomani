import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

export default function DRMToast({ message, isVisible, onClose, variant = 'cream' }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Estilo adaptativo al tema (Warm Cream / Slate & Gold)
  const isDark = variant === 'dark';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 px-5 py-3.5 max-w-md w-[90%] rounded-2xl shadow-2xl backdrop-blur-md border ${
            isDark
              ? 'bg-navy-900/95 border-gold-500/60 text-gold-300'
              : 'bg-ivory border-gold-500/50 text-gold-800 shadow-cream-panel'
          }`}
        >
          <div className={`p-2 rounded-xl shrink-0 ${isDark ? 'bg-gold-500/10 text-gold-400' : 'bg-gold-500/15 text-gold-600'}`}>
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div className={`flex-1 text-sm font-medium ${isDark ? 'text-slate-100' : 'text-ink'}`}>
            <p className={`font-semibold text-xs tracking-wider uppercase ${isDark ? 'text-gold-400' : 'text-gold-600'}`}>
              Seguridad DRM Activa
            </p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-200' : 'text-ink-soft'}`}>{message}</p>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-ink-muted hover:text-ink'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}