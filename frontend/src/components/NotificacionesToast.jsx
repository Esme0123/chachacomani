import { motion, AnimatePresence } from 'framer-motion'
import { BellRing, X } from 'lucide-react'

/**
 * Toast flotante de nuevas notificaciones.
 *
 * Se monta una sola vez dentro de `NotificacionesProvider`, de modo que la
 * campana del Header (escritorio y móvil) comparte un único aviso aunque haya
 * dos instancias del componente renderizadas.
 */
export default function NotificacionesToast({ aviso, onCerrar }) {
  return (
    <AnimatePresence>
      {aviso && (
        <motion.div
          key={aviso.id}
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="fixed bottom-5 right-5 z-[90] w-[21rem] max-w-[calc(100vw-2.5rem)] rounded-2xl border border-[#48B3AF]/40 bg-white/97 dark:bg-[#0D0B61]/97 backdrop-blur-md px-4 py-3.5 shadow-[0_24px_60px_rgba(13,11,97,.28)]"
        >
          <div className="flex items-start gap-3">
            <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-[#48B3AF]/15 text-[#48B3AF]">
              <BellRing className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                {aviso.titulo || 'Nueva notificación'}
              </p>
              <p className="font-mono text-[10px] leading-relaxed text-[#294669]/75 dark:text-[#476EAE] mt-0.5">
                {aviso.mensaje}
              </p>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar notificación"
              className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[#294669]/60 dark:text-[#476EAE] hover:bg-[#294669]/10 dark:hover:bg-[#294669]/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
