import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Clock3, FileUp, Receipt, X, ExternalLink,
} from 'lucide-react'
import * as deudasService from '../services/deudasService.js'
import qrCobro from '../assets/qr-cobro.svg'

const ESTADO_DEUDA = {
  pendiente: {
    texto: 'Pendiente',
    clases: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  en_revision: {
    texto: 'En revisión',
    clases: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  cancelado: {
    texto: 'Cancelado',
    clases: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
}

function formatearFecha(fecha) {
  if (!fecha) return '—'
  const solo = String(fecha).slice(0, 10)
  const [anio, mes, dia] = solo.split('-')
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : solo
}

function formatearMonto(monto) {
  const numero = Number(monto)
  if (!Number.isFinite(numero)) return 'Bs. 0,00'
  return `Bs. ${numero.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Panel «Mis Deudas y Aportes» del perfil del socio.
 *
 * Muestra las deudas emitidas por Tesorería/Caja Chica (multas del Anexo I y
 * aportes del Anexo II) y permite reportar el pago con método, número de
 * comprobante y adjunto. La aprobación la realiza el personal autorizado.
 */
export default function MisDeudas() {
  const [deudas, setDeudas] = useState([])
  const [totales, setTotales] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)
  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null)

  const cargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const json = await deudasService.misDeudas()
      setDeudas(Array.isArray(json?.deudas) ? json.deudas : [])
      setTotales(json?.totales || null)
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar sus deudas y aportes.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargar()
  }, [cargar])

  const alReportar = async (datos) => {
    await deudasService.reportarPago(datos)
    setDeudaSeleccionada(null)
    setExito('Pago reportado. Tesorería revisará el comprobante y confirmará la cancelación.')
    await cargar()
  }

  const pendientes = deudas.filter((d) => d.estado !== 'cancelado')

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-[#0D0B61] dark:text-white mb-1">
          Mis Deudas y Aportes
        </h2>
        <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
          Multas del Anexo I y aportes del Anexo II emitidos a su cuenta. Reporte el pago
          con su comprobante para que Tesorería lo apruebe.
        </p>
      </div>

      {totales && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { etiqueta: 'Pendientes', valor: String(totales.pendientes ?? 0), color: 'text-amber-600 dark:text-amber-400' },
            { etiqueta: 'En revisión', valor: String(totales.enRevision ?? 0), color: 'text-sky-600 dark:text-sky-400' },
            { etiqueta: 'Monto pendiente', valor: formatearMonto(totales.montoPendiente), color: 'text-rose-600 dark:text-rose-400' },
            { etiqueta: 'Canceladas', valor: String(totales.canceladas ?? 0), color: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => (
            <div
              key={item.etiqueta}
              className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/80 dark:bg-[#0D0B61]/70 px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#294669]/60 dark:text-[#476EAE]/70">
                {item.etiqueta}
              </p>
              <p className={`font-display font-bold text-base mt-0.5 ${item.color}`}>{item.valor}</p>
            </div>
          ))}
        </div>
      )}

      {exito && (
        <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{exito}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {cargando ? (
        <div className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/80 dark:bg-[#0D0B61]/70 px-4 py-10 text-center">
          <p className="font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
            Cargando sus deudas y aportes…
          </p>
        </div>
      ) : deudas.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-10 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
          <p className="font-display font-semibold text-sm text-[#0D0B61] dark:text-white">
            No tiene deudas ni aportes pendientes
          </p>
          <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
            Su cuenta está al día con Tesorería y Caja Chica.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deudas.map((deuda) => {
            const estado = ESTADO_DEUDA[deuda.estado] || ESTADO_DEUDA.pendiente
            const esAporte = deuda.tipo === deudasService.TIPO_DEUDA_APORTE
            return (
              <article
                key={deuda.id}
                className="rounded-2xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/92 dark:bg-[#0D0B61]/85 p-4 md:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#48B3AF]">
                        {esAporte ? <Receipt className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {deudasService.ETIQUETA_TIPO_DEUDA[deuda.tipo] || deuda.tipo}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estado.clases}`}>
                        {estado.texto}
                      </span>
                    </div>
                    <h3 className="font-display font-semibold text-sm text-[#0D0B61] dark:text-white leading-snug">
                      {deuda.concepto}
                    </h3>
                    <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-1">
                      Emitida el {formatearFecha(deuda.fechaEmision)}
                      {deuda.estado === 'cancelado' && deuda.fechaPago
                        ? ` · Cancelada el ${formatearFecha(deuda.fechaPago)}`
                        : ''}
                    </p>
                    {deuda.nroComprobante && (
                      <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-0.5">
                        Comprobante: {deuda.nroComprobante}
                        {deuda.comprobanteUrl && (
                          <a
                            href={deuda.comprobanteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 ml-2 text-[#48B3AF] hover:underline"
                          >
                            Ver adjunto <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-lg text-[#0D0B61] dark:text-white">
                      {formatearMonto(deuda.monto)}
                    </p>
                    {deuda.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => {
                          setExito(null)
                          setDeudaSeleccionada(deuda)
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 font-display font-semibold text-xs px-3 py-1.5 rounded-lg text-white transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                      >
                        <FileUp className="w-3.5 h-3.5" /> Reportar pago
                      </button>
                    )}
                    {deuda.estado === 'en_revision' && (
                      <button
                        type="button"
                        onClick={() => {
                          setExito(null)
                          setDeudaSeleccionada(deuda)
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 font-display font-semibold text-xs px-3 py-1.5 rounded-lg border border-sky-500/40 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-colors"
                      >
                        <Clock3 className="w-3.5 h-3.5" /> Actualizar comprobante
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {pendientes.length > 0 && (
        <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]/70">
          El plazo para el pago de toda multa es de quince (15) días calendario desde la
          notificación, conforme al Art. 73 del Reglamento Interno.
        </p>
      )}

      <AnimatePresence>
        {deudaSeleccionada && (
          <ModalReportarPago
            deuda={deudaSeleccionada}
            onCerrar={() => setDeudaSeleccionada(null)}
            onEnviar={alReportar}
          />
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/* -------------------------------------------------------------------------- */
/* Modal de reporte de pago                                                    */
/* -------------------------------------------------------------------------- */

function ModalReportarPago({ deuda, onCerrar, onEnviar }) {
  const [metodoPago, setMetodoPago] = useState(deuda.metodoPago || 'efectivo')
  const [nroComprobante, setNroComprobante] = useState(deuda.nroComprobante || '')
  const [archivo, setArchivo] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setError(null)

    if (!metodoPago) {
      setError('Seleccione el método de pago.')
      return
    }
    if (archivo && archivo.size > 5 * 1024 * 1024) {
      setError('El comprobante debe pesar como máximo 5 MB.')
      return
    }

    setEnviando(true)
    try {
      await onEnviar({
        deudaId: deuda.id,
        metodoPago,
        nroComprobante: nroComprobante.trim(),
        archivo,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo reportar el pago.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-reportar-pago"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#294669]/20 dark:border-[#294669]/50 bg-white dark:bg-[#0D0B61] p-5 md:p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 id="titulo-reportar-pago" className="font-display font-bold text-base text-[#0D0B61] dark:text-white">
              Reportar pago
            </h3>
            <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-1">
              {deuda.concepto}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full border border-[#294669]/25 dark:border-[#476EAE]/50 flex items-center justify-center text-[#294669] dark:text-[#48B3AF] hover:bg-[#294669]/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl border border-[#48B3AF]/30 bg-[#48B3AF]/8 px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#294669]/70 dark:text-[#476EAE]">
            Monto a pagar
          </span>
          <span className="font-display font-bold text-lg text-[#0D0B61] dark:text-white">
            {formatearMonto(deuda.monto)}
          </span>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          <div>
            <label htmlFor="metodo-pago" className="font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5">
              MÉTODO DE PAGO
            </label>
            <select
              id="metodo-pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 font-mono text-sm text-[#0D0B61] dark:text-white bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 focus:outline-none focus:border-[#48B3AF]"
            >
              {deudasService.METODOS_PAGO.map((metodo) => (
                <option key={metodo.id} value={metodo.id}>
                  {metodo.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {(metodoPago === 'qr' || metodoPago === 'transferencia') && (
            <div className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 bg-slate-50 dark:bg-[#294669]/25 p-3 flex items-center gap-3">
              <img src={qrCobro} alt="QR para el pago" className="w-20 h-20 rounded-lg bg-white p-1 shrink-0" />
              <p className="font-mono text-[10px] leading-relaxed text-[#294669]/80 dark:text-[#476EAE]">
                Escanee el QR o realice la transferencia y luego adjunte el comprobante.
                Tesorería validará el monto antes de cancelar la deuda.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="nro-comprobante" className="font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5">
              N° DE COMPROBANTE (OPCIONAL)
            </label>
            <input
              id="nro-comprobante"
              type="text"
              maxLength={100}
              value={nroComprobante}
              onChange={(e) => setNroComprobante(e.target.value)}
              placeholder="Ej. 00012345"
              className="w-full rounded-lg px-3 py-2.5 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 focus:outline-none focus:border-[#48B3AF]"
            />
          </div>

          <div>
            <label htmlFor="comprobante" className="font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5">
              FOTO O PDF DEL COMPROBANTE (OPCIONAL)
            </label>
            <input
              id="comprobante"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="w-full font-mono text-[11px] text-[#294669] dark:text-[#476EAE] file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:font-display file:font-semibold file:text-xs file:text-white file:cursor-pointer file:bg-[#294669] dark:file:bg-[#48B3AF] dark:file:text-[#0D0B61]"
            />
            <p className="font-mono text-[9px] text-[#294669]/60 dark:text-[#476EAE]/70 mt-1">
              JPG, PNG, WEBP o PDF. Máximo 5 MB.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCerrar}
              className="font-display font-semibold text-sm px-4 py-2 rounded-lg border border-[#294669]/25 dark:border-[#476EAE]/50 text-[#294669] dark:text-[#48B3AF] hover:bg-[#294669]/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 font-display font-semibold text-sm px-4 py-2 rounded-lg text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
            >
              <FileUp className="w-4 h-4" />
              {enviando ? 'Enviando…' : 'Enviar reporte'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
