import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Landmark, AlertTriangle, LogOut, Scale, Search, X, Check, Coins, Plus,
  Trash2, ShoppingCart, TrendingDown, Save,
} from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import GestionDeudas from '../components/GestionDeudas.jsx'
import ModalCobroMulta from '../components/ModalCobroMulta.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PERMISO_GESTIONAR_MULTAS } from '../services/permisosService.js'
import * as multasService from '../services/multasService.js'
import * as aportesService from '../services/aportesService.js'
import * as cobrosService from '../services/cobrosService.js'
import * as deudasService from '../services/deudasService.js'
import * as cajaChicaService from '../services/cajaChicaService.js'
import { ANEXOS_DATA } from '../data/reglamentoData'

/* -------------------------------------------------------------------------- */
/* Helpers de formato y visualización                                          */
/* -------------------------------------------------------------------------- */

function formatearMonto(monto) {
  const numero = Number(monto)
  if (!Number.isFinite(numero)) return '0,00'
  return numero.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function frecuenciaAporte(aporte) {
  const texto = `${aporte?.detalle || ''} ${aporte?.montoTexto || ''}`
  if (/mensual/i.test(texto)) return 'Mensual'
  if (/anual/i.test(texto)) return 'Anual'
  return 'Extraordinario'
}

const FILTROS_MULTAS = [
  { id: 'Todas', etiqueta: 'Todas' },
  { id: 'Leve', etiqueta: 'Leves' },
  { id: 'Grave', etiqueta: 'Graves' },
  { id: 'Muy grave', etiqueta: 'Muy Graves' },
  { id: 'Consejeros', etiqueta: 'Consejeros' },
]

function categoriaVisible(item) {
  return /consejero/i.test(item?.categoriaOriginal || '')
    ? 'Consejeros'
    : item?.categoria || 'Leve'
}

function claseCategoria(categoria) {
  const texto = String(categoria || '').toLowerCase()
  if (texto.includes('consejero')) {
    return 'border-violet-400/40 bg-violet-500/15 text-violet-700 dark:text-violet-300'
  }
  if (texto.includes('muy grave')) {
    return 'border-orange-400/40 bg-orange-500/15 text-orange-700 dark:text-orange-300'
  }
  if (texto.includes('gravísima') || texto.includes('gravisima')) {
    return 'border-rose-400/40 bg-rose-500/15 text-rose-700 dark:text-rose-300'
  }
  if (texto.includes('grave')) {
    return 'border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300'
  }
  return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
}

function claseFrecuencia(frecuencia) {
  if (frecuencia === 'Mensual') return 'border-sky-400/40 bg-sky-500/15 text-sky-700 dark:text-sky-300'
  if (frecuencia === 'Anual') return 'border-amber-400/40 bg-amber-500/15 text-amber-700 dark:text-amber-300'
  return 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-300'
}

const ANEXO_I = ANEXOS_DATA.find((a) => a?.tablas?.some((t) => t.id === 'cuadro-2')) || null
const ANEXO_II = ANEXOS_DATA.find((a) => a?.tablas?.some((t) => t.id === 'cuadro-aportes')) || null

/**
 * ============================================================================
 *  PANEL DE TESORERÍA (TesoreriaView.jsx)
 * ============================================================================
 *  - Carrito de selección múltiple (multas y aportes acumulables)
 *  - Modal unificado con "Dejar Pendiente" y "Cobrar Ahora"
 *  - Subida de foto/PDF de comprobante con previsualización
 *  - Pestaña de Gastos / Egresos restaurada
 *  - Marco blanco fijo estático para el QR
 *  - Adaptabilidad total a Modo Oscuro (dark:)
 */
export default function TesoreriaView({ dark, onNavigate, onToggleTheme }) {
  const { logout, puede } = useAuth()
  const puedeGestionar = puede(PERMISO_GESTIONAR_MULTAS)

  // Modos de catálogo: 'multas' | 'aportes' | 'gastos'
  const [modo, setModo] = useState('multas')
  const [error, setError] = useState(null)
  const [exito, setExito] = useState(null)
  const [formAbierto, setFormAbierto] = useState(true)
  const [deudasVersion, setDeudasVersion] = useState(0)

  // Padrón de socios
  const [socios, setSocios] = useState([])
  const [socioId, setSocioId] = useState('')
  const [filtroSocio, setFiltroSocio] = useState('')
  const [sociosAbierto, setSociosAbierto] = useState(false)
  const [alertaSocio, setAlertaSocio] = useState(false)
  const [cargandoSocios, setCargandoSocios] = useState(false)

  // Filtros de catálogos
  const [filtroInfraccion, setFiltroInfraccion] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('Todas')
  const [fechaInfraccion, setFechaInfraccion] = useState(hoy())
  const [filtroAporte, setFiltroAporte] = useState('')

  // Carrito de selección múltiple
  const [carrito, setCarrito] = useState([])
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false)

  // Modal de cobro compartido y comprobante
  const [estadoSeleccion, setEstadoSeleccion] = useState('pendiente')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [comprobante, setComprobante] = useState('')
  const [archivoComprobante, setArchivoComprobante] = useState(null)
  const [guardandoSeleccion, setGuardandoSeleccion] = useState(false)
  const [errorSeleccion, setErrorSeleccion] = useState(null)

  // Formulario Gastos / Egresos
  const [formGasto, setFormGasto] = useState({
    tipo: 'egreso',
    categoria: 'Otros',
    concepto: '',
    monto: '',
    fecha: hoy(),
    observaciones: '',
  })
  const [guardandoGasto, setGuardandoGasto] = useState(false)

  // Catálogos Anexo I y II
  const catalogo = useMemo(() => multasService.catalogoInfracciones(ANEXO_I), [])
  const aportesCatalogo = useMemo(() => aportesService.catalogoAportes(ANEXO_II), [])

  // Carga de socios
  useEffect(() => {
    if (!puedeGestionar) return
    let activo = true
    ;(async () => {
      setCargandoSocios(true)
      try {
        const json = await multasService.listarMultas()
        if (activo && Array.isArray(json?.socios)) setSocios(json.socios)
      } catch (err) {
        if (activo) setError(err?.message || 'No se pudo cargar el padrón de socios.')
      } finally {
        if (activo) setCargandoSocios(false)
      }
    })()
    return () => {
      activo = false
    }
  }, [puedeGestionar])

  // Catálogo de multas filtrado
  const filasMultas = useMemo(() => {
    const q = filtroInfraccion.trim().toLowerCase()
    return catalogo
      .filter((item) => item.origen === 2)
      .filter((item) => filtroCategoria === 'Todas' || categoriaVisible(item) === filtroCategoria)
      .filter((item) => {
        if (!q) return true
        return [
          item.infraccion,
          item.tituloCorto,
          item.articulo,
          item.categoria,
          item.categoriaOriginal,
          item.medida,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q)
      })
      .map((item) => ({
        id: item.clave,
        infraccion: item.infraccion,
        articulo: item.articulo,
        monto: Number(item.monto),
        categoria: item.categoria,
        categoriaOriginal: item.categoriaOriginal,
        categoriaVisible: categoriaVisible(item),
        medida: item.medida,
        item,
      }))
  }, [catalogo, filtroInfraccion, filtroCategoria])

  // Catálogo de aportes filtrado
  const filasAportes = useMemo(() => {
    const q = filtroAporte.trim().toLowerCase()
    return aportesCatalogo
      .filter((a) => !q || a.concepto.toLowerCase().includes(q) || String(a.detalle).toLowerCase().includes(q))
      .map((aporte) => ({
        id: aporte.clave,
        nombre: aporte.concepto,
        detalle: aporte.detalle,
        frecuencia: frecuenciaAporte(aporte),
        monto: Number(aporte.monto),
        item: aporte,
      }))
  }, [aportesCatalogo, filtroAporte])

  // Socios filtrados
  const sociosFiltrados = useMemo(() => {
    const q = filtroSocio.trim().toLowerCase()
    if (!q) return socios
    return socios.filter(
      (s) =>
        String(s.nombre || '').toLowerCase().includes(q) ||
        String(s.correo || '').toLowerCase().includes(q)
    )
  }, [filtroSocio, socios])

  const socioElegido = useMemo(
    () => socios.find((s) => String(s.id) === String(socioId)) || null,
    [socios, socioId]
  )

  const elegirSocio = (valor) => {
    setSocioId(valor)
    setAlertaSocio(false)
    setError(null)
    if (valor !== '') {
      setFiltroSocio('')
      setSociosAbierto(false)
    } else {
      setSociosAbierto(true)
    }
  }

  const verificarSocio = () => {
    if (socioId) return true
    setAlertaSocio(true)
    setError('Seleccione un socio primero para poder agregar multas o aportes.')
    document.getElementById('paso-socio-tesoreria')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }

  // AGREGAR AL CARRITO
  const agregarMulta = (fila) => {
    if (!verificarSocio()) return
    const monto = Number(fila.monto)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('Esta multa no tiene monto cobrable.')
      return
    }

    const item = {
      tipo: 'multa',
      carritoId: Date.now() + Math.random().toString(36).slice(2, 7),
      nombre: fila.item.tituloCorto || fila.item.infraccion,
      infraccion: fila.item.infraccion,
      articulo: fila.item.articulo,
      categoria: fila.item.categoria,
      medida: fila.item.medida || '',
      monto,
      fechaInfraccion: fechaInfraccion || hoy(),
      detalle: `${fila.item.articulo} · ${fila.item.categoria}`,
    }

    setCarrito((prev) => [...prev, item])
    setExito(`«${item.articulo}» agregada al carrito (${carrito.length + 1} ítems).`)
  }

  const agregarAporte = (fila) => {
    if (!verificarSocio()) return
    const monto = Number(fila.monto)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El monto del aporte debe ser mayor que cero.')
      return
    }

    const item = {
      tipo: 'aporte',
      carritoId: Date.now() + Math.random().toString(36).slice(2, 7),
      nombre: fila.item.concepto,
      concepto: fila.item.concepto,
      detalle: fila.item.detalle,
      monto,
    }

    setCarrito((prev) => [...prev, item])
    setExito(`«${item.concepto}» agregado al carrito (${carrito.length + 1} ítems).`)
  }

  const quitarDelCarrito = (carritoId) => {
    setCarrito((prev) => prev.filter((it) => it.carritoId !== carritoId))
  }

  const vaciarCarrito = () => {
    setCarrito([])
  }

  const totalMontoCarrito = useMemo(
    () => carrito.reduce((sum, it) => sum + Number(it.monto || 0), 0),
    [carrito]
  )

  const abrirModalCobroLote = () => {
    if (carrito.length === 0) {
      setError('El carrito está vacío: agregue al menos una multa o un aporte.')
      return
    }
    if (!verificarSocio()) return
    setModalCobroAbierto(true)
    setEstadoSeleccion('pendiente')
    setMetodoPago('efectivo')
    setComprobante('')
    setArchivoComprobante(null)
    setErrorSeleccion(null)
  }

  // CONFIRMAR LOTE
  const confirmarLote = useCallback(async () => {
    if (carrito.length === 0 || guardandoSeleccion) return
    if (!socioId) {
      setErrorSeleccion('Seleccione un socio antes de continuar.')
      return
    }

    setGuardandoSeleccion(true)
    setErrorSeleccion(null)
    setError(null)
    setExito(null)
    try {
      if (estadoSeleccion === 'pendiente') {
        const json = await deudasService.emitirLoteDeudas({
          socioId: Number(socioId),
          items: carrito,
        })
        setExito(json?.mensaje || `Lote de ${carrito.length} deudas emitidas en estado pendiente.`)
      } else {
        const referencia = [
          metodoPago === 'qr' ? 'Método de pago: Transferencia / QR' : 'Método de pago: Efectivo',
          comprobante.trim() ? `Comprobante: ${comprobante.trim()}` : '',
          'Módulo: Tesorería',
        ].filter(Boolean).join(' · ')

        const json = await cobrosService.registrarCobroGrupal({
          socioId: Number(socioId),
          items: carrito,
          fechaCobro: hoy(),
          observaciones: referencia,
          conceptoCobro: cobrosService.conceptoCobroGrupal(carrito, socioElegido?.nombre || ''),
          metodoPago,
          nroComprobante: comprobante.trim(),
          archivo: archivoComprobante,
        })
        setExito(json?.mensaje || 'Cobro registrado exitosamente en el módulo de Tesorería.')
      }

      setDeudasVersion((v) => v + 1)
      setCarrito([])
      setModalCobroAbierto(false)
      setComprobante('')
      setArchivoComprobante(null)
      setMetodoPago('efectivo')
    } catch (err) {
      setErrorSeleccion(err?.message || 'No se pudo procesar el registro del lote.')
    } finally {
      setGuardandoSeleccion(false)
    }
  }, [carrito, guardandoSeleccion, socioId, estadoSeleccion, metodoPago, comprobante, archivoComprobante, socioElegido])

  // REGISTRAR GASTO LIBRE
  const registrarGasto = async (e) => {
    e.preventDefault()
    setError(null)
    setExito(null)
    const montoNum = Number(formGasto.monto)
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setError('El monto del egreso debe ser mayor a 0.')
      return
    }
    if (!formGasto.concepto.trim()) {
      setError('Indique el concepto del egreso o gasto.')
      return
    }

    setGuardandoGasto(true)
    try {
      const res = await cajaChicaService.registrarMovimiento({
        tipo: formGasto.tipo,
        categoria: formGasto.categoria,
        concepto: formGasto.concepto.trim(),
        monto: montoNum,
        fecha: formGasto.fecha,
        observaciones: formGasto.observaciones ? `[Tesorería] ${formGasto.observaciones}` : '[Tesorería]',
      })
      setExito(res?.mensaje || 'Gasto/Egreso registrado correctamente.')
      setFormGasto({
        tipo: 'egreso',
        categoria: 'Otros',
        concepto: '',
        monto: '',
        fecha: hoy(),
        observaciones: '',
      })
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el gasto.')
    } finally {
      setGuardandoGasto(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 10%, rgba(72,179,175,.14), transparent 55%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 space-y-6">
          {/* Barra de Navegación y Sesión */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 font-display font-semibold text-sm text-[#294669] dark:text-[#48B3AF] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </button>
            <button
              onClick={async () => {
                await logout()
                onNavigate('home')
              }}
              className="inline-flex items-center gap-1.5 font-display font-semibold text-sm text-[#C0392B] dark:text-[#F27C7C] hover:underline"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>

          {/* Título de la Vista */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl md:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
                <Landmark className="w-6 h-6 text-[#48B3AF]" />
                Panel de Tesorería
              </h1>
              <p className="font-mono text-[11px] text-slate-600 dark:text-[#476EAE]">
                Emisión de deudas en lote (carrito), cobro inmediato de sanciones (Anexo I), aportes (Anexo II) y registro de egresos.
              </p>
            </div>
          </div>

          {/* Mensajes de Alerta y Éxito */}
          {error && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}
          {exito && (
            <div role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{exito}</p>
            </div>
          )}

          {/* Tarjeta Principal de Registro */}
          {puedeGestionar ? (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-glow-card bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm"
            >
              <button
                onClick={() => setFormAbierto((o) => !o)}
                aria-expanded={formAbierto}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Módulo de Cobro, Emisión de Deudas y Egresos
                </h2>
                <span className="font-mono text-[10px] text-slate-500 dark:text-[#476EAE]">
                  {formAbierto ? 'Ocultar ▲' : 'Mostrar ▼'}
                </span>
              </button>

              {/* Conmutador de Pestañas: Multas | Aportes | Gastos */}
              <div role="tablist" aria-label="Modo de registro de tesorería" className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'multas'}
                  onClick={() => {
                    setModo('multas')
                    setError(null)
                  }}
                  className={`text-left rounded-xl border-2 px-3.5 py-3 transition-colors ${
                    modo === 'multas'
                      ? 'border-amber-500/60 bg-amber-500/15'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-slate-900 dark:text-white">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ⚖️ Multas (Anexo I)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-amber-700/85 dark:text-amber-300/85">
                    Cuadro N.º 2 · Sume al carrito
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'aportes'}
                  onClick={() => {
                    setModo('aportes')
                    setError(null)
                  }}
                  className={`text-left rounded-xl border-2 px-3.5 py-3 transition-colors ${
                    modo === 'aportes'
                      ? 'border-emerald-500/60 bg-emerald-500/15'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-slate-900 dark:text-white">
                    <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    💰 Aportes (Anexo II)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-emerald-700/85 dark:text-emerald-300/85">
                    Fondo de Accidentes · Sume al carrito
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'gastos'}
                  onClick={() => {
                    setModo('gastos')
                    setError(null)
                  }}
                  className={`text-left rounded-xl border-2 px-3.5 py-3 transition-colors ${
                    modo === 'gastos'
                      ? 'border-[#48B3AF]/60 bg-[#48B3AF]/15'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-slate-900 dark:text-white">
                    <TrendingDown className="w-4 h-4 text-[#48B3AF]" />
                    💸 Gastos / Egresos
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-slate-600 dark:text-slate-400">
                    Registrar salidas de dinero
                  </span>
                </button>
              </div>

              {formAbierto && (
                <div className="mt-5 space-y-4">
                  {/* SELECCIÓN DE SOCIO (requerida para Multas y Aportes) */}
                  {modo !== 'gastos' && (
                    <div
                      id="paso-socio-tesoreria"
                      className={`rounded-2xl border-2 bg-slate-50/60 dark:bg-slate-900 p-4 shadow-sm ring-1 ring-amber-400/20 ${
                        alertaSocio
                          ? 'border-rose-400/70 ring-2 ring-rose-400/40'
                          : 'border-amber-400/50 dark:border-amber-400/40'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-mono text-[11px] font-bold text-slate-900">
                          1
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-amber-700 dark:text-amber-300">
                          1. SELECCIONAR SOCIO
                        </p>
                        <span className="font-mono text-[10px] text-amber-700/70 dark:text-amber-200/70">
                          obligatorio para el carrito
                        </span>
                      </div>

                      {alertaSocio && (
                        <div
                          role="alert"
                          className="mb-3 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                          <p className="font-mono text-[11px] text-rose-200">
                            Seleccione un socio antes de añadir ítems al carrito.
                          </p>
                        </div>
                      )}

                      {cargandoSocios ? (
                        <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">Cargando socios…</p>
                      ) : socios.length === 0 ? (
                        <p className="font-mono text-[11px] text-amber-700 dark:text-amber-300">
                          No se pudo cargar el padrón de socios.
                        </p>
                      ) : socioElegido ? (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5">
                          <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-200">
                            <Check className="mr-1 inline h-3.5 w-3.5" />
                            <strong className="text-slate-900 dark:text-white">{socioElegido.nombre}</strong>
                            {socioElegido.correo ? ` · ${socioElegido.correo}` : ''}
                          </p>
                          <button
                            type="button"
                            onClick={() => elegirSocio('')}
                            className="font-mono text-[10px] font-bold text-amber-700 underline hover:text-amber-600 dark:text-amber-300 dark:hover:text-amber-200"
                          >
                            Cambiar socio
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={filtroSocio}
                            onChange={(e) => {
                              setFiltroSocio(e.target.value)
                              setSociosAbierto(true)
                            }}
                            onFocus={() => setSociosAbierto(true)}
                            onBlur={() => window.setTimeout(() => setSociosAbierto(false), 150)}
                            placeholder="Buscar socio por nombre o correo…"
                            autoComplete="off"
                            className="w-full rounded-xl border bg-white dark:bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                          {sociosAbierto && (
                            <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                              {sociosFiltrados.length === 0 ? (
                                <li className="px-3 py-2 font-mono text-[11px] text-slate-500">
                                  No hay socios que coincidan.
                                </li>
                              ) : (
                                sociosFiltrados.map((s) => (
                                  <li key={s.id}>
                                    <button
                                      type="button"
                                      onMouseDown={() => elegirSocio(String(s.id))}
                                      className="w-full px-3 py-1.5 text-left font-mono text-xs text-slate-900 hover:bg-amber-500/10 dark:text-slate-200 dark:hover:bg-amber-500/20"
                                    >
                                      <strong>{s.nombre}</strong> · {s.correo}
                                    </button>
                                  </li>
                                ))
                              )}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* WIDGET DEL CARRITO ACUMULABLE (cuando hay ítems) */}
                  {modo !== 'gastos' && carrito.length > 0 && (
                    <div className="rounded-2xl border-2 border-amber-500/50 bg-amber-500/5 p-4 shadow-sm dark:border-amber-500/40">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            Carrito de Selección ({carrito.length} {carrito.length === 1 ? 'ítem' : 'ítems'})
                          </h3>
                        </div>
                        {socioElegido && (
                          <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                            Socio: <strong>{socioElegido.nombre}</strong>
                          </span>
                        )}
                      </div>

                      <div className="mt-3 max-h-48 overflow-y-auto space-y-1.5">
                        {carrito.map((it) => (
                          <div
                            key={it.carritoId}
                            className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700"
                          >
                            <div className="min-w-0 flex-1 truncate">
                              <span className="font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400 mr-2">
                                {it.tipo === 'multa' ? '[MULTA]' : '[APORTE]'}
                              </span>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {it.articulo ? `${it.articulo}: ` : ''}{it.concepto || it.infraccion || it.nombre}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                              Bs. {formatearMonto(it.monto)}
                            </span>
                            <button
                              type="button"
                              onClick={() => quitarDelCarrito(it.carritoId)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                              title="Quitar del carrito"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-500/20">
                        <div className="flex items-center gap-3">
                          <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                            Total: Bs. {formatearMonto(totalMontoCarrito)}
                          </span>
                          <button
                            type="button"
                            onClick={vaciarCarrito}
                            className="font-mono text-[11px] text-rose-500 hover:underline"
                          >
                            Vaciar carrito
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={abrirModalCobroLote}
                          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 font-display text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/20 transition-all hover:scale-[1.02]"
                        >
                          Confirmar y Registrar ({carrito.length} ítems)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* FORMULARIO DE GASTOS / EGRESOS */}
                  {modo === 'gastos' && (
                    <form onSubmit={registrarGasto} className="rounded-2xl border-2 border-[#48B3AF]/40 bg-white dark:bg-slate-900 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          TIPO
                        </label>
                        <select
                          value={formGasto.tipo}
                          onChange={(e) => setFormGasto((f) => ({ ...f, tipo: e.target.value }))}
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                        >
                          <option value="egreso">Egreso</option>
                          <option value="ingreso">Ingreso</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          CATEGORÍA
                        </label>
                        <select
                          value={formGasto.categoria}
                          onChange={(e) => setFormGasto((f) => ({ ...f, categoria: e.target.value }))}
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                        >
                          {cajaChicaService.CATEGORIAS_CAJA.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          CONCEPTO *
                        </label>
                        <input
                          type="text"
                          value={formGasto.concepto}
                          onChange={(e) => setFormGasto((f) => ({ ...f, concepto: e.target.value }))}
                          placeholder="Ej. Compra de suministros o pago de servicios"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          MONTO (Bs.) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formGasto.monto}
                          onChange={(e) => setFormGasto((f) => ({ ...f, monto: e.target.value }))}
                          placeholder="0.00"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                          required
                        />
                      </div>

                      <div>
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          FECHA *
                        </label>
                        <input
                          type="date"
                          value={formGasto.fecha}
                          onChange={(e) => setFormGasto((f) => ({ ...f, fecha: e.target.value }))}
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                          required
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                          OBSERVACIONES
                        </label>
                        <input
                          type="text"
                          value={formGasto.observaciones}
                          onChange={(e) => setFormGasto((f) => ({ ...f, observaciones: e.target.value }))}
                          placeholder="Detalles adicionales del egreso"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                        />
                      </div>

                      <div className="sm:col-span-2 pt-2">
                        <button
                          type="submit"
                          disabled={guardandoGasto}
                          className="inline-flex items-center gap-2 rounded-xl px-6 py-2.5 font-display font-bold text-sm text-white bg-[#48B3AF] hover:bg-[#3ba09c] shadow-sm disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {guardandoGasto ? 'Registrando…' : 'Registrar Movimiento de Tesorería'}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* TABLA DE MULTAS (ANEXO I) */}
                  {modo === 'multas' && (
                    <div className="rounded-2xl border-2 border-amber-400/50 bg-white dark:bg-slate-900 p-4 shadow-sm dark:border-amber-400/40">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-amber-700 dark:text-amber-300">
                          2. ELEGIR SANCIONES Y SUMAR AL CARRITO
                        </p>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          Cuadro N.º 2 · Anexo I
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        Haga clic en «＋ Agregar» para sumar una o más multas a la lista del socio.
                      </p>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-[240px] flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={filtroInfraccion}
                            onChange={(e) => setFiltroInfraccion(e.target.value)}
                            placeholder="Buscar infracción, artículo o medida…"
                            className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {FILTROS_MULTAS.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFiltroCategoria(cat.id)}
                              className={`rounded-lg px-2.5 py-1 font-mono text-xs transition-colors ${
                                filtroCategoria === cat.id
                                  ? 'bg-amber-600 font-bold text-white shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {cat.etiqueta}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[760px] border-collapse text-left text-xs bg-white dark:bg-slate-900">
                          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <tr className="font-display text-[10px] uppercase tracking-wider text-slate-900 dark:text-white">
                              <th className="p-3">Artículo</th>
                              <th className="p-3">Infracción tipificada</th>
                              <th className="p-3">Categoría</th>
                              <th className="p-3 text-right">Monto (Bs.)</th>
                              <th className="p-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {filasMultas.length === 0 ? (
                              <tr>
                                <td colSpan={5} className="p-6 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                  Ninguna infracción coincide con los filtros.
                                </td>
                              </tr>
                            ) : (
                              filasMultas.map((fila) => {
                                const cobrable = Number.isFinite(fila.monto) && fila.monto > 0
                                return (
                                  <tr key={fila.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                                    <td className="whitespace-nowrap p-3 font-mono font-bold text-amber-700 dark:text-amber-300">
                                      {fila.articulo}
                                    </td>
                                    <td className="max-w-[420px] p-3 text-slate-900 dark:text-white">
                                      <p className="font-display text-sm font-semibold leading-snug">
                                        {fila.item.tituloCorto || fila.infraccion}
                                      </p>
                                      {fila.item.tituloCorto && (
                                        <p className="mt-0.5 font-mono text-[10px] leading-snug text-slate-600 dark:text-slate-400">
                                          {fila.infraccion}
                                        </p>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      <span className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${claseCategoria(fila.categoriaVisible)}`}>
                                        {fila.categoriaVisible}
                                      </span>
                                    </td>
                                    <td className="whitespace-nowrap p-3 text-right font-display text-sm font-bold text-slate-900 dark:text-white">
                                      {cobrable ? `Bs. ${formatearMonto(fila.monto)}` : 'Sin multa'}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => agregarMulta(fila)}
                                        disabled={!cobrable}
                                        className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-1.5 font-display text-xs font-bold shadow-sm transition-colors ${
                                          cobrable
                                            ? 'bg-amber-600 text-white shadow-amber-600/20 hover:bg-amber-500'
                                            : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800'
                                        }`}
                                      >
                                        <Plus className="h-3.5 w-3.5" /> Agregar
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TABLA DE APORTES (ANEXO II) */}
                  {modo === 'aportes' && (
                    <div className="rounded-2xl border-2 border-emerald-400/50 bg-white dark:bg-slate-900 p-4 shadow-sm dark:border-emerald-400/40">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-emerald-700 dark:text-emerald-300">
                          2. ELEGIR APORTES Y SUMAR AL CARRITO
                        </p>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          Anexo II · Escala de Aportes
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        Haga clic en «＋ Agregar» para sumar aportes a la lista del socio.
                      </p>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={filtroAporte}
                          onChange={(e) => setFiltroAporte(e.target.value)}
                          placeholder="Buscar aporte (ej. ordinario, fondo de accidentes)…"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>

                      <div className="mt-3 max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[760px] border-collapse text-left text-xs bg-white dark:bg-slate-900">
                          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <tr className="font-display text-[10px] uppercase tracking-wider text-slate-900 dark:text-white">
                              <th className="p-3">Concepto de aporte</th>
                              <th className="p-3">Frecuencia</th>
                              <th className="p-3 text-right">Monto (Bs.)</th>
                              <th className="p-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {filasAportes.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-6 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                  Ningún aporte coincide con «{filtroAporte.trim()}».
                                </td>
                              </tr>
                            ) : (
                              filasAportes.map((fila) => (
                                <tr key={fila.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                                  <td className="max-w-[420px] p-3 text-slate-900 dark:text-white">
                                    <p className="font-display text-sm font-semibold leading-snug">
                                      {fila.nombre}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10px] leading-snug text-slate-600 dark:text-slate-400">
                                      {fila.detalle}
                                    </p>
                                  </td>
                                  <td className="p-3">
                                    <span className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${claseFrecuencia(fila.frecuencia)}`}>
                                      {fila.frecuencia}
                                    </span>
                                  </td>
                                  <td className="whitespace-nowrap p-3 text-right font-display text-sm font-bold text-emerald-700 dark:text-emerald-300">
                                    Bs. {formatearMonto(fila.monto)}
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => agregarAporte(fila)}
                                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-3.5 py-1.5 font-display text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
                                    >
                                      <Plus className="h-3.5 w-3.5" /> Agregar
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.section>
          ) : (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 font-mono text-[11px] text-amber-600 dark:text-amber-400">
              Su rol no cuenta con permisos para gestionar sanciones o aportes de Tesorería.
            </p>
          )}

          {/* Modal Compartido de Cobro / Emisión en Lote */}
          <ModalCobroMulta
            items={carrito}
            socioElegido={socioElegido}
            estadoSeleccion={estadoSeleccion}
            metodoPago={metodoPago}
            comprobante={comprobante}
            archivoComprobante={archivoComprobante}
            guardando={guardandoSeleccion}
            error={errorSeleccion}
            onClose={() => setModalCobroAbierto(false)}
            onEstadoChange={setEstadoSeleccion}
            onMetodoPagoChange={setMetodoPago}
            onComprobanteChange={setComprobante}
            onArchivoChange={setArchivoComprobante}
            onConfirmar={confirmarLote}
            modulo="Tesorería"
          />

          {/* Bandeja de Deudas y Pagos Reportados */}
          {puedeGestionar && (
            <GestionDeudas refresco={deudasVersion} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
