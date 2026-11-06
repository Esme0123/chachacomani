import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Clock3, FileUp, ShieldAlert, ExternalLink,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import * as deudasService from '../services/deudasService.js'
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas.js'

const ESTADO_MULTA = {
  pendiente: {
    texto: 'Pendiente',
    clases: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  en_revision: {
    texto: 'En revisión',
    clases: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
  },
  cancelado: {
    texto: 'Pagada',
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
 * ============================================================================
 *  COMPONENTE: RevisarMultas.jsx (Pestaña "Revisar mis Multas")
 * ============================================================================
 *  Muestra exclusivamente las multas (Anexo I: tipo = 'multa_anexo_1') asignadas
 *  al socio en sesión activa (socio_id = usuario.id), calculando las tarjetas
 *  superiores y la tabla dinámicamente.
 */
export default function RevisarMultas() {
  const { usuario } = useAuth()
  const [multas, setMultas] = useState([])
  const [totales, setTotales] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)
  const [multaSeleccionada, setMultaSeleccionada] = useState(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (!usuario?.id) return
    if (!silencioso) {
      setCargando(true)
      setError(null)
    }
    try {
      // Filtrado estricto por socio_id del usuario logueado y tipo = multa_anexo_1
      const json = await deudasService.listarDeudas({
        socioId: usuario.id,
        tipo: deudasService.TIPO_DEUDA_MULTA,
        propias: true,
      })
      const lista = Array.isArray(json?.deudas) ? json.deudas : []
      setMultas(lista)
      setTotales(json?.totales || null)
    } catch (err) {
      if (!silencioso) {
        setError(err?.message || 'No se pudieron cargar sus multas.')
      } else {
        console.error('No se pudieron refrescar sus multas:', err)
      }
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [usuario?.id])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Refresco en vivo con polling y focus
  useRefrescoEstadisticas(() => cargar(true), { intervaloMs: 7000 })

  const alReportar = async (datos) => {
    await deudasService.reportarPago(datos)
    setMultaSeleccionada(null)
    setExito('Pago de la multa reportado. Tesorería revisará el comprobante.')
    await cargar(true)
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-[#0D0B61] dark:text-white mb-1">
          Revisar mis Multas
        </h2>
        <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
          Sanciones e infracciones disciplinarias del Anexo I asignadas exclusivamente a su cuenta.
        </p>
      </div>

      {/* Tarjetas de Resumen Dinámicas Exclusivas de Multas */}
      {totales && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              etiqueta: 'TOTAL MULTAS',
              valor: String(totales.total ?? 0),
              color: 'text-[#0D0B61] dark:text-white',
            },
            {
              etiqueta: 'PENDIENTES',
              valor: String(totales.pendientes ?? 0),
              color: 'text-amber-600 dark:text-amber-400',
            },
            {
              etiqueta: 'MONTO PENDIENTE',
              valor: formatearMonto(totales.montoPendiente),
              color: 'text-rose-600 dark:text-rose-400',
            },
            {
              etiqueta: 'MONTO PAGADO',
              valor: formatearMonto(totales.montoPagado ?? totales.montoCancelado),
              color: 'text-emerald-600 dark:text-emerald-400',
            },
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
            Cargando su historial de multas…
          </p>
        </div>
      ) : multas.length === 0 ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-10 text-center space-y-2">
          <ShieldAlert className="w-8 h-8 mx-auto text-emerald-500" />
          <p className="font-display font-semibold text-sm text-[#0D0B61] dark:text-white">
            No tiene multas registradas
          </p>
          <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
            Su cuenta no presenta sanciones pendientes ni históricas.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/92 dark:bg-[#0D0B61]/85 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#294669]/8 dark:bg-[#294669]/35 text-[#294669] dark:text-[#48B3AF] uppercase font-semibold text-[10px] tracking-wider">
                  <th className="p-3.5">Infracción / Concepto</th>
                  <th className="p-3.5">Fecha de Emisión</th>
                  <th className="p-3.5 text-right">Monto (Bs.)</th>
                  <th className="p-3.5 text-center">Estado de pago</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#294669]/10 dark:divide-[#294669]/25">
                {multas.map((multa) => {
                  const estado = ESTADO_MULTA[multa.estado] || ESTADO_MULTA.pendiente
                  return (
                    <tr key={multa.id} className="hover:bg-[#294669]/5 dark:hover:bg-[#294669]/20 transition-colors">
                      <td className="p-3.5 font-medium text-[#0D0B61] dark:text-slate-100 max-w-sm">
                        <p className="font-display font-semibold text-sm leading-snug">{multa.concepto}</p>
                        {multa.nroComprobante && (
                          <span className="block mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                            Comprobante: {multa.nroComprobante}
                            {multa.comprobanteUrl && (
                              <a
                                href={multa.comprobanteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 ml-2 text-[#48B3AF] hover:underline"
                              >
                                Ver comprobante <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 font-mono text-[#294669] dark:text-slate-300 whitespace-nowrap">
                        {formatearFecha(multa.fechaEmision)}
                      </td>
                      <td className="p-3.5 text-right font-bold text-[#0D0B61] dark:text-white whitespace-nowrap">
                        {formatearMonto(multa.monto)}
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold border ${estado.clases}`}>
                          {estado.texto}
                        </span>
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        {multa.estado === 'pendiente' && (
                          <button
                            type="button"
                            onClick={() => {
                              setExito(null)
                              setMultaSeleccionada(multa)
                            }}
                            className="inline-flex items-center gap-1 font-display font-semibold text-xs px-3 py-1.5 rounded-lg text-white shadow-sm transition-all hover:scale-[1.02]"
                            style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                          >
                            <FileUp className="w-3.5 h-3.5" /> Pagar
                          </button>
                        )}
                        {multa.estado === 'en_revision' && (
                          <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                            En validación
                          </span>
                        )}
                        {multa.estado === 'cancelado' && (
                          <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                            Cancelada
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {multas.some((m) => m.estado === 'pendiente') && (
        <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]/70">
          El plazo para el pago de toda multa es de quince (15) días calendario desde la
          notificación, conforme al Art. 73 del Reglamento Interno.
        </p>
      )}

      <AnimatePresence>
        {multaSeleccionada && (
          <ModalReportarPagoMulta
            deuda={multaSeleccionada}
            onCerrar={() => setMultaSeleccionada(null)}
            onEnviar={alReportar}
          />
        )}
      </AnimatePresence>
    </motion.section>
  )
}

function ModalReportarPagoMulta({ deuda, onCerrar, onEnviar }) {
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
      setError('El comprobante no debe superar los 5 MB.')
      return
    }

    setEnviando(true)
    try {
      await onEnviar({
        deudaId: deuda.id,
        metodoPago,
        nroComprobante: nroComprobante.trim() || undefined,
        archivo: archivo || undefined,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo enviar el reporte de pago.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
              Reportar Pago de Sanción
            </p>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mt-0.5">
              {deuda.concepto}
            </h3>
            <p className="font-display text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {formatearMonto(deuda.monto)}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        <form onSubmit={enviar} className="mt-4 space-y-3">
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Método de pago
            </label>
            <select
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
            >
              <option value="efectivo">Efectivo en Tesorería</option>
              <option value="qr">Transferencia / QR</option>
              <option value="transferencia">Transferencia bancaria</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Número de comprobante / recibo
            </label>
            <input
              type="text"
              value={nroComprobante}
              onChange={(e) => setNroComprobante(e.target.value)}
              placeholder="Ej. REC-12345 o Nro. Transacción"
              className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
              Foto o comprobante adjunto (opcional)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="w-full font-mono text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#48B3AF]/20 file:text-[#48B3AF] file:font-semibold"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-400 font-mono text-xs">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="rounded-lg border border-slate-300 px-4 py-2 font-display text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="rounded-lg px-5 py-2 font-display text-sm font-bold text-white shadow-sm disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
            >
              {enviando ? 'Enviando…' : 'Enviar Comprobante'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
