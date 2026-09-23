import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { temaReglamento } from '../theme/lecturaTemas';

export function MinerHelmet({ className = 'w-16 h-16', glow = false }) {
  return (
    <div className={`relative ${className}`}>
      {/* Halo de luz cuando la lámpara emite destellos */}
      <div
        className={`absolute -inset-3 rounded-full bg-gold-500/40 blur-xl ${glow ? 'animate-lamp-flash' : ''}`}
      />
      {/* Silueta de Casco Minero vectorizada */}
      <svg viewBox="0 0 64 64" className="w-full h-full relative drop-shadow-lg" fill="none">
        {/* Cuerpo del casco */}
        <path
          d="M8 30c0-13.5 10.7-24 24-24S56 16.5 56 30H49c0-9.2-7.3-16.6-16.5-17.4-10-.8-18.5 7.2-18.5 17.4H8z"
          fill="#d97706"
        />
        {/* Barra frontal */}
        <rect x="6" y="30" width="52" height="6" rx="3" fill="#b45309" />
        {/* Albera superior */}
        <path d="M22 24h20c2 4.5 2 7 0 8H22c-2-1-2-3.5 0-8z" fill="#f59e0b" />
        {/* Pico levantado */}
        <path d="M52 30 58 34l-6 3z" fill="#92400e" />
        {/* Lámpara */}
        <circle cx="20" cy="36" r="5" fill="#fcd34d" />
        <circle
          cx="20"
          cy="36"
          r="2.2"
          fill={glow ? '#ffffff' : '#fbbf24'}
          className={glow ? 'animate-pulse' : ''}
        />
      </svg>
    </div>
  );
}

export default function SplashScreen({ onComplete, tema = temaReglamento, subtitulo = 'Reglamento Interno' }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFadeOut(true), 2200);
    const t2 = setTimeout(() => onComplete(), 2950);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
          className={`fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-hidden select-none ${tema.splashFondo}`}
        >
          {/* Aura de fondo */}
          <div className={`absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-3xl ${tema.splashAura1}`} />
          <div className={`absolute -bottom-28 -left-24 w-[420px] h-[420px] rounded-full blur-3xl ${tema.splashAura2}`} />

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center"
          >
            {/* Casco animado */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="animate-float-bob"
            >
              <MinerHelmet className="w-24 h-24" glow />
            </motion.div>

            <p className="mt-6 font-display font-extrabold text-xl md:text-3xl text-ink dark:text-gold-300 tracking-tight">
              NORMAS CHACHACOMANÍ
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em] font-semibold text-ink-muted dark:text-slate-400">
              {subtitulo}
            </p>
          </motion.div>

          {/* Anillo de carga circular con gradiente */}
          <div className="relative w-16 h-16 mt-10">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="5" className={tema.splashAnillo} opacity="0.4" />
              <motion.circle
                cx="32" cy="32" r="28" fill="none"
                stroke="url(#splashGradient)" strokeWidth="5" strokeLinecap="round"
                initial={{ strokeDasharray: '176 176', strokeDashoffset: 176 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 1.9, ease: 'easeInOut' }}
              />
              <defs>
                <linearGradient id="splashGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={tema.splashGradStop1} />
                  <stop offset="100%" stopColor={tema.splashGradStop2} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <p className="mt-3 text-[11px] text-ink-muted dark:text-slate-500 select-none">
            Cargando compendio normativo...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}