import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  ClipboardList,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { temaReglamento } from '../theme/lecturaTemas';

const FORMULARIO_URL_DEFAULT =
  'https://docs.google.com/forms/d/e/1FAIpQLSe2pAtuRwfZq1NiytOHy7V5IqPokeq2Nxo7-N4XnuETHIYL9g/viewform?usp=sharing&ouid=101278048953362428823';

export default function ModalFormulario({
  isOpen,
  onClose,
  isDark,
  tema = temaReglamento,
  metadata,
  formulario = {},
  formUrl = FORMULARIO_URL_DEFAULT
}) {
  const {
    eyeCatch = 'Participación cooperativa',
    title = 'Formulario de Observaciones al Reglamento',
    texto = 'Complete el formulario oficial para emitir sus observaciones.',
    leyA = 'Ley General de Cooperativas N.º 356',
    leyB = 'Estatuto Orgánico',
    cta = 'Abrir Formulario en Google Forms',
    pie = 'Sus aportes serán valorados por el Consejo de Administración y el Consejo de Vigilancia en el marco del procedimiento de reforma previsto en la normativa vigente.',
    ariaLabel = 'Formulario de Observaciones'
  } = formulario;

  // Bloquear scroll del body y cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-navy-950/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border shadow-2xl ${
              isDark ? 'bg-navy-900 border-slate-800' : 'bg-ivory border-sand-300'
            }`}
          >
            {/* Cabecera */}
            <div
              className={`relative shrink-0 overflow-hidden px-6 py-5 sm:px-8 sm:py-6 border-b ${
                isDark ? 'bg-gradient-to-br from-navy-800 to-navy-900 border-slate-800' : tema.modalHeaderClaro
              }`}
            >
              <div
                className={`absolute top-0 right-0 p-4 opacity-10 pointer-events-none ${
                  isDark ? tema.ctaIcono : tema.ctaIconoClaro
                }`}
              >
                <ClipboardList className="w-24 h-24" />
              </div>

              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${tema.modalIcono}`}>
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`flex items-center gap-1 text-[11px] font-mono font-bold uppercase tracking-widest ${tema.modalEyebrow}`}>
                      <Sparkles className="w-3 h-3" />
                      {eyeCatch}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-white font-display leading-tight mt-1">
                      {title}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  aria-label="Cerrar formulario"
                  title="Cerrar formulario"
                  className="shrink-0 p-2 text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-white bg-cream-200/70 dark:bg-navy-800 hover:bg-cream-300 dark:hover:bg-navy-700 border border-sand-300 dark:border-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-ink-soft'
                }`}
              >
                {texto}{' '}
                {metadata?.nombre && <><span className="text-ink font-semibold">{metadata.nombre}</span>.{' '}</>}
                Con arreglo a la{' '}
                <strong className={tema.modalStrong}>
                  {leyA}
                </strong>{' '}
                y el <strong className={tema.modalStrong}>{leyB}</strong>.
              </p>

              {/* Botón principal CTA -> Google Forms */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-t text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all ${tema.modalCta}`}
                >
                  <ExternalLink className="w-4 h-4" />
                  {cta}
                </a>
                <p className="text-[11px] text-ink-muted dark:text-slate-500 leading-relaxed">
                  La nueva pestaña garantiza el registro directo y seguro de su observación.
                </p>
              </div>

              {/* Vista previa mediante iframe */}
              <div className="space-y-2">
                <label
                  className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
                    isDark ? 'text-slate-300' : 'text-ink-soft'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${tema.modalCheck}`} />
                  Vista previa del formulario
                </label>
                <div
                  className={`rounded-2xl overflow-hidden border bg-white ${
                    isDark ? 'border-slate-700' : 'border-sand-300'
                  }`}
                >
                  <iframe
                    src={formUrl}
                    title={title}
                    className="w-full h-[min(62vh,540px)] block"
                    loading="lazy"
                  />
                </div>
                <p className="text-[11px] text-ink-muted dark:text-slate-500">
                  Si la vista previa no se muestra correctamente, utilice el botón para abrir el
                  formulario en una pestaña nueva.
                </p>
              </div>
            </div>

            {/* Pie */}
            <div
              className={`shrink-0 border-t px-6 py-4 sm:px-8 ${
                isDark ? 'border-slate-800 bg-navy-950/50' : 'border-sand-200 bg-cream-100'
              }`}
            >
              <div
                className={`flex items-start gap-2 text-[11px] leading-relaxed ${
                  isDark ? 'text-slate-500' : 'text-ink-muted'
                }`}
              >
                <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${tema.modalCheck}`} />
                <p>{pie}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}