import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  AlertTriangle, CheckCircle2, Clock3, ExternalLink, Pencil, Receipt, RotateCcw,
  Save, X,
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
 * Gestión de deudas para Tesorería, Caja Chica y Administración.
 *
 * Dos bandejas:
 *   · Pagos reportados: deudas en `en_revision` con comprobante del socio.
 *   · Todas las deudas: historial filtrable por estado/tipo.
 * La emisión de nuevas deudas y el cobro inmediato viven ahora en el flujo
 * unificado de Caja Chica (tablas de multas y aportes).
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

  const [editandoComprobante, setEditandoComprobante] = useState(null)
  const [nroComprobanteEdit, setNroComprobanteEdit] = useState('')
  const [metodoPagoEdit, setMetodoPagoEdit] = useState('')
  const [guardandoComprobante, setGuardandoComprobante] = useState(false)
  const [errorComprobante, setErrorComprobante] = useState(null)

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

  // Bandeja de «Pagos reportados» en vivo: polling cada 7 s y revalidación al
  // volver a la ventana. El pago reportado por el socio aparece sin recargar.
  useRefrescoEstadisticas(() => cargar(true), { intervaloMs: 7000 })

  // Refresco inmediato cuando Caja Chica emite o cobra una deuda desde la tabla.
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
            ? `Pago aprobado. La deuda #${deuda.id} quedó cancelada y el ingreso fue registrado en Caja Chica.`
            : `La deuda #${deuda.id} quedó marcada como ya cancelada y el ingreso fue registrado en Caja Chica.`
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
    setErrorComprobante(null)
    setExito(null)
  }

  const cerrarComprobante = () => {
    setEditandoComprobante(null)
    setNroComprobanteEdit('')
    setMetodoPagoEdit('')
    setErrorComprobante(null)
  }

  const guardarComprobante = async (deuda) => {
    if (guardandoComprobante) return
    setGuardandoComprobante(true)
    setErrorComprobante(null)
    try {
      await deudasService.actualizarComprobanteDeuda(deuda.id, {
        nroComprobante: nroComprobanteEdit.trim(),
        metodoPago: metodoPagoEdit,
      })
      setExito(`Comprobante de la deuda #${deuda.id} actualizado.`)
      cerrarComprobante()
      await cargar(true)
    } catch (err) {
      setErrorComprobante(err?.message || 'No se pudo actualizar el comprobante.')
    } finally {
      setGuardandoComprobante(false)
    }
  }

  if (!puedeGestionar) return null

  const tabs = [
    { id: 'reportados', etiqueta: 'Pagos reportados', contador: reportados.length },
    { id: 'todas', etiqueta: 'Todas las deudas', contador: deudas.length },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glow-card bg-white/92 dark:bg-[#0D0B61]/85 p-6"
      style={{ borderRadius: '20px' }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#48B3AF]" />
            Deudas y pagos reportados
          </h2>
          <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-0.5">
            Apruebe comprobantes, marque deudas pendientes como ya canceladas y edite su comprobante.
          </p>
        </div>
        {totales && (
          <div className="flex flex-wrap gap-2 font-mono text-[10px]">
            <span className="px-2 py-1 rounded border border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400">
              {totales.pendientes ?? 0} pendientes
            </span>
            <span className="px-2 py-1 rounded border border-sky-500/30 bg-sky-500/8 text-sky-600 dark:text-sky-400">
              {totales.enRevision ?? 0} en revisión
            </span>
            <span className="px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400">
              {totales.canceladas ?? 0} canceladas
            </span>
          </div>
        )}
      </div>

      <div role="tablist" aria-label="Gestión de deudas" className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={panel === tab.id}
            onClick={() => {
              setPanel(tab.id)
              setFiltroEstado('')
              setFiltroTipo('')
              setExito(null)
              setError(null)
              cerrarComprobante()
            }}
            className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors ${
              panel === tab.id
                ? 'border-[#48B3AF]/60 bg-[#48B3AF]/10'
                : 'border-[#294669]/15 dark:border-[#476EAE]/35 hover:bg-[#294669]/5'
            }`}
          >
            <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
              {tab.id === 'reportados' ? (
                <Clock3 className="w-4 h-4 text-sky-500" />
              ) : (
                <Receipt className="w-4 h-4 text-[#48B3AF]" />
              )}
              {tab.etiqueta}
              {tab.contador !== null && (
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-[#294669]/15 dark:bg-[#476EAE]/30">
                  {tab.contador}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {exito && (
        <div role="status" className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{exito}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      <div className="mt-4 space-y-3">
          {panel === 'todas' && (
            <div className="flex flex-wrap gap-2">
              <select
                aria-label="Filtrar por estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                <option value="">Todos los estados</option>
                {deudasService.ESTADOS_DEUDA.map((estado) => (
                  <option key={estado} value={estado}>
                    {deudasService.ETIQUETA_ESTADO_DEUDA[estado]}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="rounded-lg px-3 py-1.5 font-mono text-[11px] text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
              >
                <option value="">Todos los tipos</option>
                {deudasService.TIPOS_DEUDA.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>{tipo.etiqueta}</option>
                ))}
              </select>
            </div>
          )}

          {cargando ? (
            <p className="px-4 py-8 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
              Cargando deudas…
            </p>
          ) : (panel === 'reportados' ? reportados : deudas).length === 0 ? (
            <p className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 px-4 py-8 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
              {panel === 'reportados'
                ? 'No hay pagos reportados pendientes de revisión.'
                : 'No hay deudas que coincidan con el filtro.'}
            </p>
          ) : (
            (panel === 'reportados' ? reportados : deudas).map((deuda) => {
              const estado = ESTADO_DEUDA[deuda.estado] || ESTADO_DEUDA.pendiente
              const esAporte = deuda.tipo === deudasService.TIPO_DEUDA_APORTE
              return (
                <article
                  key={deuda.id}
                  className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 bg-slate-50/60 dark:bg-[#294669]/20 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] uppercase tracking-wider text-[#48B3AF]">
                          {esAporte ? 'Aporte' : 'Multa'} · #{deuda.id}
                        </span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${estado.clases}`}>
                          {estado.texto}
                        </span>
                        {deuda.estado === 'en_revision' && deuda.metodoPago && (
                          <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400">
                            {deuda.metodoPago}
                          </span>
                        )}
                      </div>
                      <p className="font-display font-semibold text-sm text-[#0D0B61] dark:text-white">
                        {deuda.concepto}
                      </p>
                      <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-1">
                        {deuda.socioNombre} · emitida el {formatearFecha(deuda.fechaEmision)}
                      </p>
                      {(deuda.nroComprobante || deuda.comprobanteUrl || deuda.metodoPago) && (
                        <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE] mt-0.5">
                          {deuda.metodoPago ? `Método: ${deuda.metodoPago}` : ''}
                          {deuda.metodoPago && (deuda.nroComprobante || deuda.comprobanteUrl) ? ' · ' : ''}
                          {deuda.nroComprobante ? `Comprobante: ${deuda.nroComprobante}` : ''}
                          {!deuda.nroComprobante && deuda.comprobanteUrl ? 'Comprobante adjunto' : ''}
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

                      {editandoComprobante === deuda.id ? (
                        <div className="mt-2 max-w-md rounded-lg border border-[#294669]/15 dark:border-[#476EAE]/35 bg-white dark:bg-[#0D0B61]/60 p-2.5 space-y-2">
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
                              aria-label={`Número de comprobante de la deuda ${deuda.id}`}
                              className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white placeholder:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
                            />
                            <select
                              value={metodoPagoEdit}
                              onChange={(e) => setMetodoPagoEdit(e.target.value)}
                              aria-label={`Método de pago de la deuda ${deuda.id}`}
                              className="w-full rounded-lg px-2.5 py-1.5 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-[#48B3AF]"
                            >
                              <option value="">Sin método</option>
                              {deudasService.METODOS_PAGO.map((metodo) => (
                                <option key={metodo.id} value={metodo.id}>{metodo.etiqueta}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              disabled={guardandoComprobante}
                              onClick={() => guardarComprobante(deuda)}
                              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-display font-semibold text-[10px] text-white disabled:opacity-50"
                              style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                            >
                              <Save className="w-3 h-3" /> Guardar
                            </button>
                            <button
                              type="button"
                              onClick={cerrarComprobante}
                              className="inline-flex items-center gap-1 rounded-md border border-[#294669]/25 dark:border-[#476EAE]/55 px-2.5 py-1 font-display font-semibold text-[10px] text-[#294669] dark:text-slate-300 hover:bg-[#294669]/8"
                            >
                              <X className="w-3 h-3" /> Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirComprobante(deuda)}
                          className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] font-bold text-[#48B3AF] hover:underline"
                        >
                          <Pencil className="w-3 h-3" />
                          {deuda.nroComprobante ? 'Editar comprobante' : 'Añadir comprobante'}
                        </button>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-base text-[#0D0B61] dark:text-white">
                        {formatearMonto(deuda.monto)}
                      </p>
                      {deuda.estado === 'pendiente' && (
                        <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={procesando === deuda.id}
                            onClick={() => cambiarEstado(deuda, 'cancelado')}
                            className="inline-flex items-center gap-1 font-display font-semibold text-[11px] px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ya cancelado
                          </button>
                        </div>
                      )}
                      {deuda.estado === 'en_revision' && (
                        <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                          <button
                            type="button"
                            disabled={procesando === deuda.id}
                            onClick={() => cambiarEstado(deuda, 'cancelado')}
                            className="inline-flex items-center gap-1 font-display font-semibold text-[11px] px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar pago
                          </button>
                          <button
                            type="button"
                            disabled={procesando === deuda.id}
                            onClick={() => cambiarEstado(deuda, 'pendiente')}
                            className="inline-flex items-center gap-1 font-display font-semibold text-[11px] px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Rechazar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })
          )}
      </div>
    </motion.section>
  )
}
