import { motion } from 'framer-motion'
import { X, Save, Receipt, AlertTriangle } from 'lucide-react'
import qrCobro from '../assets/qr-cobro.svg'

function formatearMonto(monto) {
  const numero = Number(monto)
  if (!Number.isFinite(numero)) return '0,00'
  return numero.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Modal compartido para cobro inmediato o emisión de deuda pendiente
 * para Multas (Anexo I) y Aportes (Anexo II).
 * Utilizado con idéntico flujo en TesoreriaView y CajaChicaView.
 */
export default function ModalCobroMulta({
  seleccion,
  socioElegido,
  estadoSeleccion = 'pendiente',
  metodoPago = 'efectivo',
  comprobante = '',
  guardando = false,
  error = null,
  onClose,
  onEstadoChange,
  onMetodoPagoChange,
  onComprobanteChange,
  onConfirmar,
  modulo = 'Tesorería',
}) {
  if (!seleccion) return null

  const esMulta = seleccion.tipo === 'multa'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-modal-cobro"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              {esMulta ? 'Anexo I · Multa' : 'Anexo II · Aporte'}
            </p>
            <h3
              id="titulo-modal-cobro"
              className="mt-1 font-display text-lg font-bold leading-snug text-slate-900 dark:text-white"
            >
              {seleccion.nombre}
            </h3>
            {seleccion.detalle && (
              <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                {seleccion.detalle}
              </p>
            )}
            <p className="mt-2 font-display text-2xl font-bold text-amber-700 dark:text-amber-300">
              Bs. {formatearMonto(seleccion.monto)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar modal"
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tarjeta Informativa del Socio */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/60">
          <p className="font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Socio asignado
          </p>
          <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
            {socioElegido?.nombre || 'Sin socio seleccionado'}
          </p>
          {socioElegido?.correo && (
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {socioElegido.correo}
            </p>
          )}
        </div>

        {/* Selector de Flujo: Dejar Pendiente / Cobrar Ahora */}
        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onEstadoChange('pendiente')}
            aria-pressed={estadoSeleccion === 'pendiente'}
            className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
              estadoSeleccion === 'pendiente'
                ? 'border-amber-400 bg-amber-50/80 text-amber-900 dark:border-amber-500/70 dark:bg-amber-500/15 dark:text-amber-200'
                : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5 font-display text-sm font-bold">
              <span>🟡</span> Dejar pendiente
            </span>
            <span className="mt-1 block font-mono text-[10px] leading-relaxed opacity-80 text-slate-600 dark:text-slate-300">
              Guarda el registro en estado <strong className="text-amber-700 dark:text-amber-300">pendiente</strong>, notifica al socio y no genera ingreso inmediato.
            </span>
          </button>

          <button
            type="button"
            onClick={() => onEstadoChange('inmediato')}
            aria-pressed={estadoSeleccion === 'inmediato'}
            className={`rounded-xl border-2 p-3.5 text-left transition-colors ${
              estadoSeleccion === 'inmediato'
                ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 dark:border-emerald-500/70 dark:bg-emerald-500/15 dark:text-emerald-200'
                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <span className="flex items-center gap-1.5 font-display text-sm font-bold">
              <span>🟢</span> Cobrar ahora
            </span>
            <span className="mt-1 block font-mono text-[10px] leading-relaxed opacity-80 text-slate-600 dark:text-slate-300">
              Genera la deuda en estado <strong className="text-emerald-700 dark:text-emerald-300">cancelado</strong> y registra el ingreso en el módulo de {modulo}.
            </span>
          </button>
        </div>

        {/* Sección de Pago Inmediato */}
        {estadoSeleccion === 'inmediato' && (
          <div className="mt-4 space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onMetodoPagoChange('efectivo')}
                aria-pressed={metodoPago === 'efectivo'}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-display text-sm font-bold transition-colors ${
                  metodoPago === 'efectivo'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="text-lg">💵</span> Efectivo
              </button>
              <button
                type="button"
                onClick={() => onMetodoPagoChange('qr')}
                aria-pressed={metodoPago === 'qr'}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-display text-sm font-bold transition-colors ${
                  metodoPago === 'qr'
                    ? 'border-amber-400 bg-amber-400/15 text-amber-800 dark:text-amber-200'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-amber-400/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="text-lg">📱</span> Transferencia / QR
              </button>
            </div>

            {/* Vista Transferencia / QR con Marco Blanco Fijo Estático */}
            {metodoPago === 'qr' && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-400/40 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80">
                {/* Marco blanco fijo para el QR sin deformaciones ni afectación de modo oscuro */}
                <div className="w-full flex justify-center py-1">
                  <img
                    src={qrCobro}
                    alt="Código QR estático para cobro de la Cooperativa Minera Aurífera Nevado Chachacomani R.L."
                    className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 w-56 h-56 mx-auto object-contain"
                  />
                </div>
                <p className="text-center font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  Escanee el código QR para realizar la transferencia bancaria y registre el número de comprobante.
                </p>
                <div className="w-full">
                  <label
                    htmlFor="modal-cobro-nro-comprobante"
                    className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300"
                  >
                    Número o referencia de comprobante / transferencia{' '}
                    <span className="font-normal normal-case text-slate-500 dark:text-slate-400">
                      (opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="modal-cobro-nro-comprobante"
                      type="text"
                      value={comprobante}
                      onChange={(e) => onComprobanteChange(e.target.value)}
                      placeholder="Ej. TRANS-987456321"
                      className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 pl-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Vista Efectivo: Comprobante opcional */}
            {metodoPago === 'efectivo' && (
              <div className="w-full">
                <label
                  htmlFor="modal-cobro-nro-recibo-efectivo"
                  className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300"
                >
                  Número de recibo físico o comprobante{' '}
                  <span className="font-normal normal-case text-slate-500 dark:text-slate-400">
                    (opcional)
                  </span>
                </label>
                <div className="relative">
                  <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="modal-cobro-nro-recibo-efectivo"
                    type="text"
                    value={comprobante}
                    onChange={(e) => onComprobanteChange(e.target.value)}
                    placeholder="Ej. REC-00452"
                    className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 pl-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de Error en el Modal */}
        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/10 px-3.5 py-2.5"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
            <p className="font-mono text-[11px] text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="mt-5 flex flex-wrap justify-end gap-2.5 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={guardando}
            className="rounded-lg border border-slate-300 px-4 py-2.5 font-display text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={guardando}
            className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 font-display text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-50 ${
              estadoSeleccion === 'inmediato'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
            }`}
          >
            <Save className="h-4 w-4" />
            {guardando
              ? 'Procesando…'
              : estadoSeleccion === 'inmediato'
              ? 'Confirmar cobro'
              : 'Emitir deuda pendiente'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

