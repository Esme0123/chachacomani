import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Clock3, FileUp, Receipt, X, ExternalLink, Eye, ChevronDown, ChevronUp,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import * as deudasService from '../services/deudasService.js'
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas.js'
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
    texto: 'Cancelado / Pagado',
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
 * Panel unificado «Mis Deudas y Aportes» del perfil del socio.
 *
 * Integra multas del Anexo I y aportes del Anexo II con dos barras de filtros:
 *  - Categoría: Todas | Multas (Anexo I) | Aportes (Anexo II)
 *  - Estado: Todas | Pendientes | En revisión | Pagadas / Canceladas
 * Permite realizar pagos parciales (abonos), subir foto del comprobante
 * y consultar el historial completo de pagos y abonos anteriores.
 */
export default function MisDeudas() {
  const { usuario } = useAuth()
  const [deudas, setDeudas] = useState([])
  const [totales, setTotales] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)

  // Filtros duales
  const [filtroCategoria, setFiltroCategoria] = useState('') // '' = Todas, 'multa_anexo_1', 'aporte_anexo_2'
  const [filtroEstado, setFiltroEstado] = useState('') // '' = Todas, 'pendiente', 'en_revision', 'cancelado'

  const [deudaSeleccionada, setDeudaSeleccionada] = useState(null)
  const [comprobanteModalUrl, setComprobanteModalUrl] = useState(null)
  const [historialExpandido, setHistorialExpandido] = useState({})

  const cargar = useCallback(async (silencioso = false) => {
    if (!usuario?.id) return
    if (!silencioso) {
      setCargando(true)
      setError(null)
    }
    try {
      const json = await deudasService.listarDeudas({
        socioId: usuario.id,
        tipo: filtroCategoria || undefined,
        estado: filtroEstado || undefined,
        propias: true,
      })
      setDeudas(Array.isArray(json?.deudas) ? json.deudas : [])
      setTotales(json?.totales || null)
    } catch (err) {
      if (!silencioso) {
        setError(err?.message || 'No se pudieron cargar sus deudas y aportes.')
      } else {
        console.error('No se pudieron refrescar sus deudas:', err)
      }
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [usuario?.id, filtroCategoria, filtroEstado])

  useEffect(() => {
    cargar()
  }, [cargar])

  // Sincronización en vivo cada 7 segundos
  useRefrescoEstadisticas(() => cargar(true), { intervaloMs: 7000 })

  const alReportar = async (datos) => {
    await deudasService.reportarPago(datos)
    setDeudaSeleccionada(null)
    setExito('Pago o abono reportado. Tesorería revisará el comprobante.')
    await cargar(true)
  }

  const toggleHistorial = (id) => {
    setHistorialExpandido((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h2 className="font-display font-bold text-lg text-[#0D0B61] dark:text-white mb-1">
          Mis Deudas y Aportes
        </h2>
        <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
          Multas del Anexo I y aportes del Anexo II emitidos a su cuenta. Reporte el pago o abono
          con su comprobante para que Tesorería lo apruebe.
        </p>
      </div>

      {totales && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { etiqueta: 'Pendientes', valor: String(totales.pendientes ?? 0), color: 'text-amber-600 dark:text-amber-400' },
            { etiqueta: 'En revisión', valor: String(totales.enRevision ?? 0), color: 'text-sky-600 dark:text-sky-400' },
            { etiqueta: 'Monto pendiente', valor: formatearMonto(totales.montoPendiente), color: 'text-rose-600 dark:text-rose-400' },
            { etiqueta: 'Pagadas / Canceladas', valor: String(totales.canceladas ?? 0), color: 'text-emerald-600 dark:text-emerald-400' },
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

      {/* BARRAS DE FILTROS REQUERIDAS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 space-y-3">
        {/* 1. Filtro de Categoría */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 min-w-[70px]">
            Categoría:
          </span>
          {[
            { id: '', etiqueta: 'Todas' },
            { id: deudasService.TIPO_DEUDA_MULTA, etiqueta: 'Multas (Anexo I)' },
            { id: deudasService.TIPO_DEUDA_APORTE, etiqueta: 'Aportes (Anexo II)' },
          ].map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setFiltroCategoria(opcion.id)}
              className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors ${filtroCategoria === opcion.id
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>

        {/* 2. Filtro de Estado */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 min-w-[70px]">
            Estado:
          </span>
          {[
            { id: '', etiqueta: 'Todas' },
            { id: 'pendiente', etiqueta: 'Pendientes' },
            { id: 'en_revision', etiqueta: 'En revisión' },
            { id: 'cancelado', etiqueta: 'Pagadas / Canceladas' },
          ].map((opcion) => (
            <button
              key={opcion.id}
              type="button"
              onClick={() => setFiltroEstado(opcion.id)}
              className={`rounded-lg px-3 py-1 font-mono text-xs transition-colors ${filtroEstado === opcion.id
                  ? 'bg-[#48B3AF] text-white font-bold shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
            >
              {opcion.etiqueta}
            </button>
          ))}
        </div>
      </div>

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
            No se encontraron deudas ni aportes con los filtros aplicados
          </p>
          <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
            {filtroEstado === 'cancelado'
              ? 'No tiene registros pagados en esta categoría.'
              : 'Su cuenta está al día con Tesorería y Caja Chica.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deudas.map((deuda) => {
            const estado = ESTADO_DEUDA[deuda.estado] || ESTADO_DEUDA.pendiente
            const esAporte = deuda.tipo === deudasService.TIPO_DEUDA_APORTE
            const saldo = deuda.saldoPendiente !== undefined ? deuda.saldoPendiente : deuda.monto
            const pagado = deuda.montoPagado || 0

            return (
              <article
                key={deuda.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#48B3AF]">
                        {esAporte ? <Receipt className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                        {deudasService.ETIQUETA_TIPO_DEUDA[deuda.tipo] || deuda.tipo} · #{deuda.id}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estado.clases}`}>
                        {estado.texto}
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                      {deuda.concepto}
                    </h3>
                    <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                      Emitida el {formatearFecha(deuda.fechaEmision)}
                      {deuda.fechaPago && ` · Pagada el ${formatearFecha(deuda.fechaPago)}`}
                    </p>

                    {/* Desglose de Saldos y Pagos Parciales */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-3 font-mono text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Total: <strong>{formatearMonto(deuda.monto)}</strong>
                      </span>
                      {pagado > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Abonado: <strong>{formatearMonto(pagado)}</strong>
                        </span>
                      )}
                      {deuda.estado !== 'cancelado' && (
                        <span className="text-rose-600 dark:text-rose-400">
                          Saldo pendiente: <strong>{formatearMonto(saldo)}</strong>
                        </span>
                      )}
                    </div>

                    {/* Datos de Comprobante / Miniatura con Vista Previa */}
                    {(deuda.nroComprobante || deuda.comprobanteUrl || deuda.metodoPago) && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {deuda.metodoPago && (
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            Método: <strong>{deuda.metodoPago}</strong>
                          </span>
                        )}
                        {deuda.nroComprobante && (
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            N° Recibo/Comp: <strong>{deuda.nroComprobante}</strong>
                          </span>
                        )}

                        {/* Miniatura de imagen / PDF con Lightbox */}
                        {deuda.comprobanteUrl && (
                          <div className="flex items-center gap-2">
                            {deuda.comprobanteUrl.toLowerCase().includes('.pdf') ? (
                              <button
                                type="button"
                                onClick={() => setComprobanteModalUrl(deuda.comprobanteUrl)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-mono text-[#48B3AF] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> Ver PDF
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setComprobanteModalUrl(deuda.comprobanteUrl)}
                                className="group relative flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 p-1 hover:border-[#48B3AF] transition-colors"
                                title="Haga clic para ampliar el comprobante"
                              >
                                <img
                                  src={deuda.comprobanteUrl}
                                  alt="Comprobante"
                                  className="h-9 w-9 object-cover rounded"
                                />
                                <span className="font-mono text-[10px] text-[#48B3AF] flex items-center gap-0.5 pr-1">
                                  <Eye className="w-3 h-3" /> Ampliar
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Historial de Abonos si existen */}
                    {deuda.abonos && deuda.abonos.length > 0 && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleHistorial(deuda.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-[#48B3AF]"
                        >
                          {historialExpandido[deuda.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Historial de abonos ({deuda.abonos.length})
                        </button>

                        {historialExpandido[deuda.id] && (
                          <div className="mt-2 space-y-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 border border-slate-200 dark:border-slate-800">
                            {deuda.abonos.map((ab) => (
                              <div
                                key={ab.id}
                                className="flex flex-wrap items-center justify-between text-xs py-1 border-b border-slate-200/50 dark:border-slate-700 last:border-none"
                              >
                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                  {formatearFecha(ab.creadoEn)} · {ab.metodoPago}
                                  {ab.nroComprobante ? ` (Comp: ${ab.nroComprobante})` : ''}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatearMonto(ab.monto)}
                                  </span>
                                  {ab.comprobanteUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setComprobanteModalUrl(ab.comprobanteUrl)}
                                      className="text-[#48B3AF] hover:underline text-[10px] font-mono"
                                    >
                                      [Ver foto]
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha: Monto y Botón Reportar Pago */}
                  <div className="text-right shrink-0">
                    <p className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {formatearMonto(deuda.monto)}
                    </p>
                    {deuda.estado !== 'cancelado' && saldo < deuda.monto && (
                      <p className="font-mono text-[10px] text-rose-500 font-semibold">
                        Saldo: {formatearMonto(saldo)}
                      </p>
                    )}

                    {deuda.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => setDeudaSeleccionada(deuda)}
                        className="mt-3 inline-flex items-center gap-1.5 font-display font-semibold text-xs px-3.5 py-1.5 rounded-lg text-white shadow-sm transition-all hover:scale-[1.02]"
                        style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                      >
                        <FileUp className="w-3.5 h-3.5" />
                        Reportar pago / abono
                      </button>
                    )}

                    {deuda.estado === 'en_revision' && (
                      <div className="mt-3 space-y-1">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-sky-600 dark:text-sky-400">
                          <Clock3 className="w-3 h-3" /> En verificación
                        </span>
                        <div>
                          <button
                            type="button"
                            onClick={() => setDeudaSeleccionada(deuda)}
                            className="font-mono text-[10px] text-[#48B3AF] hover:underline"
                          >
                            Reenviar / abonar más
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Modal para reportar pago o abono */}
      <AnimatePresence>
        {deudaSeleccionada && (
          <ModalReporte
            deuda={deudaSeleccionada}
            onCerrar={() => setDeudaSeleccionada(null)}
            onEnviar={alReportar}
          />
        )}
      </AnimatePresence>

      {/* Modal Lightbox para ver foto del comprobante ampliada */}
      <AnimatePresence>
        {comprobanteModalUrl && (
          <ModalVisorComprobante
            url={comprobanteModalUrl}
            onClose={() => setComprobanteModalUrl(null)}
          />
        )}
      </AnimatePresence>
    </motion.section>
  )
}

/** Modal Lightbox para ampliar comprobante */
function ModalVisorComprobante({ url, onClose }) {
  if (!url) return null
  const esPdf = url.toLowerCase().includes('.pdf')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] max-w-3xl w-full rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
            Comprobante de Pago
          </span>
          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-[#48B3AF] hover:underline px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              Abrir original <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-4 w-full flex justify-center overflow-auto max-h-[75vh]">
          {esPdf ? (
            <iframe src={url} className="w-full h-[65vh] rounded-lg border border-slate-200" title="PDF Comprobante" />
          ) : (
            <img src={url} alt="Comprobante de pago" className="max-h-[70vh] object-contain rounded-lg shadow" />
          )}
        </div>
      </div>
    </div>
  )
}

/** Modal para reportar pago parcial o total con foto de comprobante */
function ModalReporte({ deuda, onCerrar, onEnviar }) {
  const saldoPendiente = deuda.saldoPendiente !== undefined && deuda.saldoPendiente > 0
    ? deuda.saldoPendiente
    : deuda.monto

  const [montoAbono, setMontoAbono] = useState(String(saldoPendiente))
  const [metodoPago, setMetodoPago] = useState('qr')
  const [nroComprobante, setNroComprobante] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState(null)

  const manejarArchivo = (e) => {
    const file = e.target.files?.[0]
    if (!file) {
      setArchivo(null)
      setVistaPrevia(null)
      return
    }
    setArchivo(file)
    if (file.type.startsWith('image/')) {
      setVistaPrevia(URL.createObjectURL(file))
    } else {
      setVistaPrevia('pdf')
    }
  }

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    const abonoNum = Number(montoAbono)
    if (!Number.isFinite(abonoNum) || abonoNum <= 0) {
      setError('Indique un monto a abonar mayor a 0.')
      return
    }

    setEnviando(true)
    try {
      await onEnviar({
        deudaId: deuda.id,
        metodoPago,
        montoAbono: abonoNum,
        nroComprobante: nroComprobante.trim() || undefined,
        archivo,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo reportar el pago.')
      setEnviando(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 10 }}
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Reportar pago o abono
            </h3>
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {deuda.concepto}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen de saldo */}
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Saldo pendiente total
            </span>
            <span className="font-display font-bold text-base text-amber-700 dark:text-amber-300">
              {formatearMonto(saldoPendiente)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] text-slate-500 block">Total deuda</span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              {formatearMonto(deuda.monto)}
            </span>
          </div>
        </div>

        <form onSubmit={enviar} className="space-y-4">
          {/* Campo Monto a Abonar */}
          <div>
            <label htmlFor="monto-abono" className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              MONTO A ABONAR (Bs.) *
            </label>
            <input
              id="monto-abono"
              type="number"
              step="0.01"
              min="0.01"
              max={saldoPendiente}
              value={montoAbono}
              onChange={(e) => setMontoAbono(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
              required
            />
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Puede pagar la totalidad o ingresar un abono parcial menor.
            </p>
          </div>

          <div>
            <label htmlFor="metodo-pago" className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              MÉTODO DE PAGO
            </label>
            <select
              id="metodo-pago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
            >
              {deudasService.METODOS_PAGO.map((metodo) => (
                <option key={metodo.id} value={metodo.id}>
                  {metodo.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {/* Tarjeta de QR con marco blanco fijo estático */}
          {(metodoPago === 'qr' || metodoPago === 'transferencia') && (
            <div className="rounded-2xl border border-amber-400/40 bg-white dark:bg-slate-800/80 p-3.5 flex flex-col items-center gap-2">
              <div className="w-full flex justify-center py-1">
                <img
                  src={qrCobro}
                  alt="QR para el pago"
                  className="bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 w-48 h-48 mx-auto object-contain"
                />
              </div>
              <p className="font-mono text-[10px] text-center text-slate-600 dark:text-slate-300">
                Escanee el QR o realice la transferencia bancaria y adjunte la foto de su comprobante a continuación.
              </p>
            </div>
          )}

          <div>
            <label htmlFor="nro-comprobante" className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              N° DE COMPROBANTE / TRANSACCIÓN (OPCIONAL)
            </label>
            <input
              id="nro-comprobante"
              type="text"
              maxLength={100}
              value={nroComprobante}
              onChange={(e) => setNroComprobante(e.target.value)}
              placeholder="Ej. TRANS-987456321"
              className="w-full rounded-xl px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
            />
          </div>

          {/* Subida de archivo de imagen/PDF */}
          <div>
            <label htmlFor="comprobante" className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              FOTO O CAPTURA DEL COMPROBANTE (RECOMENDADO)
            </label>
            <input
              id="comprobante"
              type="file"
              accept="image/*,application/pdf"
              onChange={manejarArchivo}
              className="w-full font-mono text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:font-display file:font-semibold file:text-xs file:text-white file:cursor-pointer file:bg-[#48B3AF] hover:file:opacity-90"
            />
            {vistaPrevia && vistaPrevia !== 'pdf' && (
              <div className="mt-2 flex items-center gap-2">
                <img src={vistaPrevia} alt="Vista previa" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  {archivo?.name}
                </span>
              </div>
            )}
            <p className="font-mono text-[9px] text-slate-500 dark:text-slate-400 mt-1">
              Admite fotos JPG, PNG, WEBP o documentos PDF hasta 5 MB.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="font-display font-semibold text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2 rounded-xl text-white shadow-sm transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 bg-[#48B3AF] hover:bg-[#3ba09c]"
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
