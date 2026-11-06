import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Clock3, ExternalLink, Pencil, Receipt, RotateCcw,
  Save, X, Eye, Plus, Upload, ChevronDown, ChevronUp, FileText,
} from 'lucide-react'
import * as deudasService from '../services/deudasService.js'
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas.js'

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
 * Gestión de deudas para Tesorería, Caja Chica y Administración.
 *
 * Incluye:
 *   - Pagos reportados (en revisión) y Todas las deudas.
 *   - Edición inline de comprobantes y subida de archivos adjuntos.
 *   - Visualización de miniaturas con modal Lightbox para ampliar imagen/PDF.
 *   - Registro de abonos y pagos parciales con actualización en tiempo real de saldos.
 *   - Historial de abonos por cada deuda.
 *
 * @param {{onDeudaAprobada?: Function, refresco?: number}} props
 */
export default function GestionDeudas({ onDeudaAprobada, refresco = 0 }) {
  const [panel, setPanel] = useState('reportados')
  const [deudas, setDeudas] = useState([])
  const [totales, setTotales] = useState(null)
  const [puedeGestionar, setPuedeGestionar] = useState(true)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)
  const [procesando, setProcesando] = useState(null)

  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  // Edición inline de comprobante
  const [editandoComprobante, setEditandoComprobante] = useState(null)
  const [nroComprobanteEdit, setNroComprobanteEdit] = useState('')
  const [metodoPagoEdit, setMetodoPagoEdit] = useState('')
  const [archivoEdit, setArchivoEdit] = useState(null)
  const [guardandoComprobante, setGuardandoComprobante] = useState(false)
  const [errorComprobante, setErrorComprobante] = useState(null)

  // Modal de Abono
  const [deudaAbonar, setDeudaAbonar] = useState(null)
  const [historialExpandido, setHistorialExpandido] = useState({})
  const [visorUrl, setVisorUrl] = useState(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) {
      setCargando(true)
      setError(null)
    }
    try {
      const json = await deudasService.listarDeudas({
        estado: filtroEstado || undefined,
        tipo: filtroTipo || undefined,
      })
      setDeudas(Array.isArray(json?.deudas) ? json.deudas : [])
      setTotales(json?.totales || null)
      setPuedeGestionar(json?.puedeGestionar !== false)
    } catch (err) {
      if (!silencioso) {
        setError(err?.message || 'No se pudieron cargar las deudas.')
      } else {
        console.error('No se pudo refrescar la bandeja de deudas:', err)
      }
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [filtroEstado, filtroTipo])

  useEffect(() => {
    cargar()
  }, [cargar])

  useRefrescoEstadisticas(() => cargar(true), { intervaloMs: 7000 })

  const refrescoAnterior = useRef(refresco)
  useEffect(() => {
    if (refrescoAnterior.current === refresco) return
    refrescoAnterior.current = refresco
    cargar(true)
  }, [refresco, cargar])

  const reportados = deudas.filter((d) => d.estado === 'en_revision')

  const cambiarEstado = async (deuda, estado) => {
    if (procesando) return
    setProcesando(deuda.id)
    setError(null)
    setExito(null)
    try {
      await deudasService.cambiarEstadoDeuda(deuda.id, estado)
      setExito(
        estado === 'cancelado'
          ? deuda.estado === 'en_revision'
            ? `Pago aprobado. La deuda #${deuda.id} quedó cancelada y el ingreso fue registrado.`
            : `La deuda #${deuda.id} quedó marcada como cancelada y el ingreso fue registrado.`
          : `La deuda #${deuda.id} volvió a estado pendiente.`
      )
      await cargar(true)
      if (estado === 'cancelado' && onDeudaAprobada) onDeudaAprobada()
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar la deuda.')
    } finally {
      setProcesando(null)
    }
  }

  const abrirComprobante = (deuda) => {
    setEditandoComprobante(deuda.id)
    setNroComprobanteEdit(deuda.nroComprobante || '')
    setMetodoPagoEdit(deuda.metodoPago || '')
    setArchivoEdit(null)
    setErrorComprobante(null)
  }

  const cerrarComprobante = () => {
    setEditandoComprobante(null)
    setNroComprobanteEdit('')
    setMetodoPagoEdit('')
    setArchivoEdit(null)
    setErrorComprobante(null)
  }

  const guardarComprobante = async (deuda) => {
    setGuardandoComprobante(true)
    setErrorComprobante(null)
    try {
      await deudasService.actualizarComprobanteDeuda(deuda.id, {
        nroComprobante: nroComprobanteEdit.trim() || undefined,
        metodoPago: metodoPagoEdit || undefined,
        archivo: archivoEdit,
      })
      cerrarComprobante()
      await cargar(true)
    } catch (err) {
      setErrorComprobante(err?.message || 'No se pudo guardar el comprobante.')
    } finally {
      setGuardandoComprobante(false)
    }
  }

  const alRegistrarAbono = async (datos) => {
    await deudasService.registrarAbono(datos)
    setDeudaAbonar(null)
    setExito('Abono registrado exitosamente.')
    await cargar(true)
    if (onDeudaAprobada) onDeudaAprobada()
  }

  const toggleHistorial = (id) => {
    setHistorialExpandido((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const paneles = [
    { id: 'reportados', etiqueta: 'Pagos reportados', contador: reportados.length },
    { id: 'todas', etiqueta: 'Todas las deudas', contador: deudas.length },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glow-card bg-white dark:bg-[#0D0B61]/85 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#48B3AF]" />
            Bandeja de Deudas y Pagos
          </h2>
          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            Apruebe comprobantes, registre abonos o pagos parciales, y edite los comprobantes existentes.
          </p>
        </div>
      </div>

      {exito && (
        <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{exito}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* Pestañas de la bandeja */}
      <div role="tablist" aria-label="Gestión de deudas" className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {paneles.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={panel === p.id}
            onClick={() => setPanel(p.id)}
            className={`text-left rounded-xl border-2 px-3.5 py-3 transition-colors ${
              panel === p.id
                ? 'border-amber-500/60 bg-amber-500/15'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                {p.etiqueta}
              </span>
              <span className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded-full ${
                panel === p.id
                  ? 'bg-amber-500 text-slate-900'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {p.contador}
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* Filtros para la pestaña 'todas' */}
      {panel === 'todas' && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          >
            <option value="">Todos los estados</option>
            {deudasService.ESTADOS_DEUDA.map((st) => (
              <option key={st} value={st}>{deudasService.ETIQUETA_ESTADO_DEUDA[st]}</option>
            ))}
          </select>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
          >
            <option value="">Todas las categorías</option>
            {deudasService.TIPOS_DEUDA.map((t) => (
              <option key={t.id} value={t.id}>{t.etiqueta}</option>
            ))}
          </select>
        </div>
      )}

      {/* Listado de deudas */}
      <div className="space-y-3 pt-2">
        {cargando ? (
          <p className="font-mono text-xs text-center py-8 text-slate-500">Cargando deudas…</p>
        ) : (panel === 'reportados' ? reportados : deudas).length === 0 ? (
          <p className="font-mono text-xs text-center py-8 text-slate-500">
            {panel === 'reportados'
              ? 'No hay pagos reportados pendientes de revisión.'
              : 'No hay deudas que coincidan con el filtro.'}
          </p>
        ) : (
          (panel === 'reportados' ? reportados : deudas).map((deuda) => {
            const estado = ESTADO_DEUDA[deuda.estado] || ESTADO_DEUDA.pendiente
            const esAporte = deuda.tipo === deudasService.TIPO_DEUDA_APORTE
            const saldo = deuda.saldoPendiente !== undefined ? deuda.saldoPendiente : deuda.monto
            const pagado = deuda.montoPagado || 0

            return (
              <article
                key={deuda.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[#48B3AF] font-bold">
                        {esAporte ? 'Aporte' : 'Multa'} · #{deuda.id}
                      </span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estado.clases}`}>
                        {estado.texto}
                      </span>
                      {deuda.metodoPago && (
                        <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400">
                          {deuda.metodoPago}
                        </span>
                      )}
                    </div>

                    <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">
                      {deuda.concepto}
                    </p>
                    <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Socio: <strong>{deuda.socioNombre}</strong> · emitida el {formatearFecha(deuda.fechaEmision)}
                      {deuda.fechaPago && ` · saldada el ${formatearFecha(deuda.fechaPago)}`}
                    </p>

                    {/* Desglose de Saldo y Monto Pagado */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-xs">
                      <span className="text-slate-700 dark:text-slate-300">
                        Total: <strong>{formatearMonto(deuda.monto)}</strong>
                      </span>
                      {pagado > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Pagado: <strong>{formatearMonto(pagado)}</strong>
                        </span>
                      )}
                      {deuda.estado !== 'cancelado' && (
                        <span className="text-rose-600 dark:text-rose-400">
                          Saldo: <strong>{formatearMonto(saldo)}</strong>
                        </span>
                      )}
                    </div>

                    {/* Comprobante, referencia y miniatura con Lightbox */}
                    {(deuda.nroComprobante || deuda.comprobanteUrl || deuda.metodoPago) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                        {deuda.nroComprobante && (
                          <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                            Comprobante: <strong>{deuda.nroComprobante}</strong>
                          </span>
                        )}

                        {deuda.comprobanteUrl && (
                          <div className="flex items-center gap-2">
                            {deuda.comprobanteUrl.toLowerCase().includes('.pdf') ? (
                              <button
                                type="button"
                                onClick={() => setVisorUrl(deuda.comprobanteUrl)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-[#48B3AF] hover:underline"
                              >
                                <Eye className="w-3.5 h-3.5" /> Ver PDF
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setVisorUrl(deuda.comprobanteUrl)}
                                className="group relative flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 hover:border-[#48B3AF]"
                                title="Clic para ampliar foto"
                              >
                                <img
                                  src={deuda.comprobanteUrl}
                                  alt="Miniatura"
                                  className="h-8 w-8 object-cover rounded"
                                />
                                <span className="font-mono text-[10px] text-[#48B3AF] pr-1 flex items-center gap-0.5">
                                  <Eye className="w-3 h-3" /> Ampliar
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edición Inline de Comprobante / Archivo */}
                    {editandoComprobante === deuda.id ? (
                      <div className="mt-3 max-w-md rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 space-y-2">
                        {errorComprobante && (
                          <p role="alert" className="font-mono text-[10px] text-rose-600 dark:text-rose-400">
                            {errorComprobante}
                          </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={nroComprobanteEdit}
                            onChange={(e) => setNroComprobanteEdit(e.target.value)}
                            maxLength={100}
                            placeholder="N° de comprobante"
                            className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                          />
                          <select
                            value={metodoPagoEdit}
                            onChange={(e) => setMetodoPagoEdit(e.target.value)}
                            className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                          >
                            <option value="">Sin método</option>
                            {deudasService.METODOS_PAGO.map((m) => (
                              <option key={m.id} value={m.id}>{m.etiqueta}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100">
                            <Upload className="w-3.5 h-3.5 text-[#48B3AF]" />
                            <span>{archivoEdit ? archivoEdit.name : 'Subir nueva foto o PDF'}</span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => setArchivoEdit(e.target.files?.[0] || null)}
                              className="sr-only"
                            />
                          </label>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            disabled={guardandoComprobante}
                            onClick={() => guardarComprobante(deuda)}
                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1 font-display font-semibold text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
                          >
                            <Save className="w-3.5 h-3.5" /> Guardar
                          </button>
                          <button
                            type="button"
                            onClick={cerrarComprobante}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 font-display text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <X className="w-3.5 h-3.5" /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2.5 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => abrirComprobante(deuda)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#48B3AF] hover:underline"
                        >
                          <Pencil className="w-3 h-3" />
                          {deuda.nroComprobante || deuda.comprobanteUrl ? 'Editar comprobante' : 'Añadir comprobante'}
                        </button>
                      </div>
                    )}

                    {/* Historial de Abonos si existen */}
                    {deuda.abonos && deuda.abonos.length > 0 && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => toggleHistorial(deuda.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-[#48B3AF]"
                        >
                          {historialExpandido[deuda.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Historial de abonos ({deuda.abonos.length})
                        </button>

                        {historialExpandido[deuda.id] && (
                          <div className="mt-2 space-y-1 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 p-2.5 border border-slate-200 dark:border-slate-700 text-xs">
                            {deuda.abonos.map((ab) => (
                              <div key={ab.id} className="flex flex-wrap items-center justify-between py-1 border-b border-slate-200 dark:border-slate-700 last:border-none">
                                <span className="font-mono text-slate-600 dark:text-slate-400">
                                  {formatearFecha(ab.creadoEn)} · {ab.metodoPago}
                                  {ab.nroComprobante ? ` (Comp: ${ab.nroComprobante})` : ''}
                                  {ab.registradorNombre ? ` · Por: ${ab.registradorNombre}` : ''}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatearMonto(ab.monto)}
                                  </span>
                                  {ab.comprobanteUrl && (
                                    <button
                                      type="button"
                                      onClick={() => setVisorUrl(ab.comprobanteUrl)}
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

                  {/* Acciones de la Deuda */}
                  <div className="text-right shrink-0 space-y-2">
                    <p className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {formatearMonto(deuda.monto)}
                    </p>
                    {deuda.estado !== 'cancelado' && saldo < deuda.monto && (
                      <p className="font-mono text-[10px] text-rose-500 font-semibold">
                        Saldo: {formatearMonto(saldo)}
                      </p>
                    )}

                    <div className="flex flex-col items-end gap-1.5 pt-1">
                      {/* Botón Registrar Abono (si no está totalmente cancelada) */}
                      {deuda.estado !== 'cancelado' && (
                        <button
                          type="button"
                          onClick={() => setDeudaAbonar(deuda)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-display font-semibold text-xs hover:bg-amber-500/20 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Registrar Abono
                        </button>
                      )}

                      {/* Botón Aprobar / Cancelar deuda */}
                      {deuda.estado !== 'cancelado' ? (
                        <button
                          type="button"
                          disabled={procesando === deuda.id}
                          onClick={() => cambiarEstado(deuda, 'cancelado')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-display font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {deuda.estado === 'en_revision' ? 'Aprobar pago' : 'Marcar cancelada'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={procesando === deuda.id}
                          onClick={() => cambiarEstado(deuda, 'pendiente')}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" /> Reabrir deuda
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Modal para Registrar Abono por Staff */}
      <AnimatePresence>
        {deudaAbonar && (
          <ModalRegistrarAbonoStaff
            deuda={deudaAbonar}
            onCerrar={() => setDeudaAbonar(null)}
            onGuardar={alRegistrarAbono}
          />
        )}
      </AnimatePresence>

      {/* Modal Lightbox Visor de Comprobante */}
      <AnimatePresence>
        {visorUrl && (
          <ModalVisorComprobante
            url={visorUrl}
            onClose={() => setVisorUrl(null)}
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

/** Modal para registrar un abono por el personal staff */
function ModalRegistrarAbonoStaff({ deuda, onCerrar, onGuardar }) {
  const saldoPendiente = deuda.saldoPendiente !== undefined && deuda.saldoPendiente > 0
    ? deuda.saldoPendiente
    : deuda.monto

  const [montoAbono, setMontoAbono] = useState(String(saldoPendiente))
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [nroComprobante, setNroComprobante] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [archivo, setArchivo] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)

  const enviar = async (e) => {
    e.preventDefault()
    setError(null)
    const val = Number(montoAbono)
    if (!Number.isFinite(val) || val <= 0) {
      setError('Indique un monto mayor a 0.')
      return
    }

    setGuardando(true)
    try {
      await onGuardar({
        deudaId: deuda.id,
        montoAbono: val,
        metodoPago,
        nroComprobante: nroComprobante.trim() || undefined,
        observaciones: observaciones.trim() || undefined,
        archivo,
      })
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el abono.')
      setGuardando(false)
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
              Registrar Abono / Pago Parcial
            </h3>
            <p className="font-mono text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Deuda #{deuda.id} · Socio: <strong>{deuda.socioNombre}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Saldo actual
            </span>
            <span className="font-display font-bold text-base text-amber-700 dark:text-amber-300">
              {formatearMonto(saldoPendiente)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-mono text-[10px] text-slate-500 block">Monto total</span>
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              {formatearMonto(deuda.monto)}
            </span>
          </div>
        </div>

        <form onSubmit={enviar} className="space-y-3.5">
          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              MONTO A ABONAR (Bs.) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={saldoPendiente}
              value={montoAbono}
              onChange={(e) => setMontoAbono(e.target.value)}
              className="w-full rounded-xl px-3 py-2 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                MÉTODO DE PAGO
              </label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full rounded-xl px-3 py-2 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                {deudasService.METODOS_PAGO.map((m) => (
                  <option key={m.id} value={m.id}>{m.etiqueta}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                N° COMPROBANTE
              </label>
              <input
                type="text"
                value={nroComprobante}
                onChange={(e) => setNroComprobante(e.target.value)}
                placeholder="Ej. REC-00123"
                className="w-full rounded-xl px-3 py-2 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              FOTO O DOCUMENTO DEL COMPROBANTE
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              className="w-full font-mono text-xs text-slate-700 dark:text-slate-300 file:mr-3 file:px-3 file:py-1.5 file:rounded-xl file:border-0 file:font-semibold file:text-xs file:text-white file:bg-[#48B3AF]"
            />
          </div>

          <div>
            <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
              OBSERVACIONES
            </label>
            <input
              type="text"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales del abono"
              className="w-full rounded-xl px-3 py-2 font-mono text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onCerrar}
              className="font-display font-semibold text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-1.5 font-display font-bold text-sm px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando…' : 'Registrar Abono'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
