import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Gauge, ChevronDown, Square } from 'lucide-react';
import { MinerHelmet } from './SplashScreen';

const SPEEDS = [1, 1.25, 1.5];

export default function CasquitoWidget({ tts }) {
  const [open, setOpen] = useState(false);
  const { isSpeaking, isPaused, progress, rate, currentText, setRate, speak, pause, resume, stop } = tts;

  const handleToggle = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isSpeaking && isPaused) {
      resume();
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* Panel de Control denso */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="w-72 rounded-2xl bg-white dark:bg-navy-900/95 border border-sand-300 dark:border-gold-600/40 shadow-cream-panel dark:shadow-gold-glow-lg overflow-hidden backdrop-blur-md"
          >
            {/* Cabecera */}
            <div className="px-4 py-3 flex items-center gap-2.5 border-b border-sand-300/60 dark:border-slate-800 bg-cream-100 dark:bg-slate-900">
              <MinerHelmet className="w-8 h-8" glow={isSpeaking && !isPaused} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-ink dark:text-gold-300 font-display truncate">
                  El Casquito Minero
                </p>
                <p className="text-[10px] text-ink-muted dark:text-slate-400 truncate">
                  {isSpeaking ? (isPaused ? 'En pausa' : 'Dictando...') : 'Lectura por voz'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-4 space-y-3 select-none">
              {/* Barra de progreso del dictado */}
              <div className="flex items-center gap-2 text-[10px] text-ink-muted dark:text-slate-400">
                <span className="font-mono">Progreso</span>
                <div className="flex-1 h-1.5 bg-cream-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full"
                    animate={{ width: `${Math.round(progress * 100)}%` }}
                    transition={{ ease: 'linear', duration: 0.2 }}
                  />
                </div>
                <span className="font-mono">{Math.round(progress * 100)}%</span>
              </div>

              {/* Controles: Reproducir / Pausar / Detener */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleToggle}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-500 text-navy-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-gold-glow hover:from-gold-500 hover:to-gold-400 transition-all"
                >
                  {isSpeaking && !isPaused ? (
                    <><Pause className="w-4 h-4" /> Pausa</>
                  ) : isSpeaking && isPaused ? (
                    <><Play className="w-4 h-4" /> Reanudar</>
                  ) : (
                    <><Play className="w-4 h-4" /> Leer capítulo</>
                  )}
                </button>
                <button
                  onClick={stop}
                  className="p-2.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Detener"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              {/* Selector de Velocidad */}
              <div className="flex items-center gap-1.5 bg-cream-100 dark:bg-slate-800 p-1 rounded-xl border border-cream-200 dark:border-slate-700">
                <Gauge className="w-3.5 h-3.5 text-gold-600 dark:text-gold-400 ml-1.5" />
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setRate(s); if (isSpeaking) speak(currentText ?? ''); }}
                    className={`flex-1 py-1.5 text-[11px] rounded-lg transition-all ${
                      rate === s
                        ? 'bg-gold-500 text-navy-950 font-bold'
                        : 'text-ink-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Casco flotante */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.92 }}
        onClick={handleToggle}
        title="El Casquito Minero — lectura por voz"
        className="relative w-16 h-16 rounded-full bg-white dark:bg-navy-900 border-2 border-sand-300 dark:border-gold-600/50 shadow-cream-panel dark:shadow-gold-glow-lg flex items-center justify-center"
      >
        <div className={isSpeaking && !isPaused ? 'animate-float-bob' : ''}>
          <MinerHelmet className="w-10 h-10" glow={isSpeaking && !isPaused} />
        </div>
      </motion.button>

      {!supported && (
        <p className="text-[10px] text-ink-muted dark:text-slate-500 italic pointer-events-none">
          Voz no soportada en este navegador
        </p>
      )}
    </div>
  );
}