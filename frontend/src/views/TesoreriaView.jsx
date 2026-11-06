import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Landmark, AlertTriangle, LogOut, Scale, Search, X, Check, Coins, Plus,
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
 *  Vista unificada para el rol Tesorero con paridad total de experiencia
 *  visual, flujos y componentes respecto a Caja Chica:
 *
 *  · Catálogo interactivo de Multas (Anexo I) y Aportes (Anexo II)
 *  · Modal compartido `ModalCobroMulta` con:
 *      - 🟡 Dejar pendiente (Emitir deuda)
 *      - 🟢 Cobrar ahora (registra ingreso en Tesorería)
 *      - Marco blanco estático para el QR
 *  · Bandeja de deudas y pagos reportados con edición inline de comprobantes
 *  · Soporte completo de Modo Claro / Modo Oscuro
 */
export default function TesoreriaView({ dark, onNavigate, onToggleTheme }) {
  const { logout, puede } = useAuth()
  const puedeGestionar = puede(PERMISO_GESTIONAR_MULTAS)

  // Modos de catálogo: 'multas' | 'aportes'
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

  // Modal de cobro compartido
  const [seleccion, setSeleccion] = useState(null)
  const [estadoSeleccion, setEstadoSeleccion] = useState('pendiente')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [comprobante, setComprobante] = useState('')
  const [guardandoSeleccion, setGuardandoSeleccion] = useState(false)
  const [errorSeleccion, setErrorSeleccion] = useState(null)

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
    setError('Seleccione un socio primero para registrar una multa o un aporte.')
    document.getElementById('paso-socio-tesoreria')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return false
  }

  const abrirSeleccion = (nueva) => {
    setSeleccion(nueva)
    setEstadoSeleccion('pendiente')
    setMetodoPago('efectivo')
    setComprobante('')
    setErrorSeleccion(null)
    setError(null)
    setExito(null)
  }

  const conceptoDeuda = (sel) => {
    if (!sel) return ''
    const texto = sel.tipo === 'multa'
      ? `${sel.item.articulo} · ${sel.item.infraccion}`
      : `${sel.item.concepto}${sel.item.detalle ? ` · ${sel.item.detalle}` : ''}`
    return texto.slice(0, 255)
  }

  const agregarMulta = (fila) => {
    if (!verificarSocio()) return
    const monto = Number(fila.monto)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('Esta multa no tiene monto cobrable.')
      return
    }
    abrirSeleccion({
      tipo: 'multa',
      nombre: fila.item.tituloCorto || fila.item.infraccion,
      detalle: `${fila.item.articulo} · ${fila.item.categoria}`,
      monto,
      item: {
        tipo: 'multa',
        infraccion: fila.item.infraccion,
        articulo: fila.item.articulo,
        categoria: fila.item.categoria,
        medida: fila.item.medida || '',
        monto,
        fechaInfraccion: fechaInfraccion || hoy(),
      },
    })
  }

  const agregarAporte = (fila) => {
    if (!verificarSocio()) return
    const monto = Number(fila.monto)
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El monto del aporte debe ser mayor que cero.')
      return
    }
    abrirSeleccion({
      tipo: 'aporte',
      nombre: fila.item.concepto,
      detalle: fila.item.detalle,
      monto,
      item: {
        tipo: 'aporte',
        concepto: fila.item.concepto,
        detalle: fila.item.detalle,
        monto,
      },
    })
  }

  const confirmarSeleccion = useCallback(async () => {
    if (!seleccion || guardandoSeleccion) return
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
        const json = await deudasService.emitirDeuda({
          socioId: Number(socioId),
          tipo: seleccion.tipo === 'multa'
            ? deudasService.TIPO_DEUDA_MULTA
            : deudasService.TIPO_DEUDA_APORTE,
          concepto: conceptoDeuda(seleccion),
          monto: seleccion.monto,
          fechaEmision: hoy(),
        })
        setExito(json?.mensaje || 'Deuda emitida y notificada al socio en estado pendiente.')
      } else {
        const referencia = [
          metodoPago === 'qr' ? 'Método de pago: Transferencia / QR' : 'Método de pago: Efectivo',
          comprobante.trim() ? `Comprobante: ${comprobante.trim()}` : '',
          'Módulo: Tesorería',
        ].filter(Boolean).join(' · ')

        const json = await cobrosService.registrarCobroGrupal({
          socioId: Number(socioId),
          items: [seleccion.item],
          fechaCobro: hoy(),
          observaciones: referencia,
          conceptoCobro: cobrosService.conceptoCobroGrupal([seleccion.item], socioElegido?.nombre || ''),
          metodoPago,
          nroComprobante: comprobante.trim(),
        })
        setExito(json?.mensaje || 'Cobro registrado exitosamente en el módulo de Tesorería.')
      }

      setDeudasVersion((v) => v + 1)
      setSeleccion(null)
      setComprobante('')
      setMetodoPago('efectivo')
    } catch (err) {
      setErrorSeleccion(err?.message || 'No se pudo registrar la deuda o el cobro en Tesorería.')
    } finally {
      setGuardandoSeleccion(false)
    }
  }, [seleccion, guardandoSeleccion, socioId, estadoSeleccion, metodoPago, comprobante, socioElegido])

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
              <h1 className="font-display font-bold text-xl md:text-2xl text-[#0D0B61] dark:text-white flex items-center gap-2">
                <Landmark className="w-6 h-6 text-[#48B3AF]" />
                Panel de Tesorería
              </h1>
              <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
                Emisión de deudas pendientes y cobro inmediato de sanciones (Anexo I) y aportes (Anexo II).
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
            <p role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              {exito}
            </p>
          )}

          {/* Tarjeta Principal de Registro */}
          {puedeGestionar ? (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-glow-card bg-white dark:bg-[#0D0B61]/85 p-6 border border-slate-200 dark:border-slate-800"
              style={{ borderRadius: '20px' }}
            >
              <button
                onClick={() => setFormAbierto((o) => !o)}
                aria-expanded={formAbierto}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                  Registrar Cobro o Emisión de Sanción / Aporte
                </h2>
                <span className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                  {formAbierto ? 'Ocultar ▲' : 'Mostrar ▼'}
                </span>
              </button>

              {/* Conmutador de Pestañas: Multas (Anexo I) / Aportes (Anexo II) */}
              <div role="tablist" aria-label="Modo de registro de tesorería" className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    ⚖️ Multas y Sanciones (Anexo I)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-amber-700/85 dark:text-amber-300/85">
                    Elija la infracción del Cuadro N.º 2 y haga clic en ＋ Agregar
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
                    💰 Escala de Aportes (Anexo II)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-emerald-700/85 dark:text-emerald-300/85">
                    Elija el aporte del Fondo de Accidentes y haga clic en ＋ Agregar
                  </span>
                </button>
              </div>

              {formAbierto && (
                <div className="mt-5 space-y-4">
                  {/* Paso 1: Selección obligatoria de Socio */}
                  <div
                    id="paso-socio-tesoreria"
                    className={`rounded-2xl border-2 bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-amber-400/20 ${
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
                        obligatorio
                      </span>
                    </div>

                    {alertaSocio && (
                      <div
                        role="alert"
                        className="mb-3 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                        <p className="font-mono text-[11px] text-rose-200">
                          Seleccione un socio primero para poder emitir o cobrar la multa o aporte.
                        </p>
                      </div>
                    )}

                    {cargandoSocios ? (
                      <p className="font-mono text-[11px] text-slate-600 dark:text-slate-300">Cargando socios…</p>
                    ) : socios.length === 0 ? (
                      <p className="font-mono text-[11px] text-amber-700 dark:text-amber-300">
                        No se pudo cargar el padrón de socios. Verifique su sesión e intente nuevamente.
                      </p>
                    ) : socioElegido ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5">
                        <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-200">
                          <Check className="mr-1 inline h-3.5 w-3.5" />
                          <strong className="text-slate-900 dark:text-white">{socioElegido.nombre}</strong>
                          {socioElegido.correo ? ` · ${socioElegido.correo}` : ''}
                          {socioElegido.rol ? ` · ${socioElegido.rol}` : ''}
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
                          aria-expanded={sociosAbierto}
                          aria-controls="lista-socios-tesoreria"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                        />
                        {filtroSocio !== '' && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setFiltroSocio('')}
                            aria-label="Limpiar búsqueda de socios"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {sociosAbierto && (
                          <div
                            id="lista-socios-tesoreria"
                            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
                          >
                            {sociosFiltrados.length === 0 ? (
                              <p className="px-3 py-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                Ningún socio coincide con «{filtroSocio.trim()}».
                              </p>
                            ) : (
                              <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                                {sociosFiltrados.map((s) => (
                                  <li key={s.id}>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => elegirSocio(String(s.id))}
                                      className="flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                      <span className="font-display text-xs font-semibold text-slate-900 dark:text-white">
                                        {s.nombre}
                                      </span>
                                      <span className="truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                                        {s.correo}
                                        {s.rol ? ` · ${s.rol}` : ''}
                                      </span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Paso 2: Tabla de Multas (Anexo I) */}
                  {modo === 'multas' && (
                    <div className="rounded-2xl border-2 border-amber-400/50 bg-white dark:bg-slate-900 p-4 shadow-sm dark:border-amber-400/40 dark:shadow-xl">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-amber-700 dark:text-amber-300">
                          2. ELEGIR DE LA TABLA
                        </p>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          Cuadro N.º 2 · Infracciones Específicas
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        Busque la infracción, revise la sanción y presione «＋ Agregar».
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {FILTROS_MULTAS.map((filtro) => (
                          <button
                            key={filtro.id}
                            type="button"
                            onClick={() => setFiltroCategoria(filtro.id)}
                            aria-pressed={filtroCategoria === filtro.id}
                            className={`rounded-full border px-3 py-1.5 font-display text-[11px] font-bold transition-colors ${
                              filtroCategoria === filtro.id
                                ? 'border-amber-300 bg-amber-400 text-slate-900'
                                : 'border-slate-300 bg-white text-slate-700 hover:border-amber-400/60 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:text-amber-200'
                            }`}
                          >
                            {filtro.etiqueta}
                          </button>
                        ))}
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={filtroInfraccion}
                            onChange={(e) => setFiltroInfraccion(e.target.value)}
                            placeholder="Buscar por infracción, artículo o medida (ej. EPP, Art. 41)…"
                            className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                          {filtroInfraccion !== '' && (
                            <button
                              type="button"
                              onClick={() => setFiltroInfraccion('')}
                              aria-label="Limpiar búsqueda de multas"
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <label htmlFor="tesoreria-fecha-infraccion" className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                            Fecha de la infracción
                          </label>
                          <input
                            id="tesoreria-fecha-infraccion"
                            type="date"
                            value={fechaInfraccion}
                            onChange={(e) => setFechaInfraccion(e.target.value)}
                            className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:border-amber-400 focus:outline-none sm:w-44"
                          />
                        </div>
                      </div>

                      <div className="mt-3 max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full min-w-[980px] border-collapse text-left text-xs bg-white dark:bg-slate-900">
                          <thead className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                            <tr className="font-display text-[10px] uppercase tracking-wider text-slate-900 dark:text-white">
                              <th className="p-3">Infracción tipificada</th>
                              <th className="p-3">Artículo</th>
                              <th className="p-3 text-right">Multa (Bs.)</th>
                              <th className="p-3">Categoría</th>
                              <th className="p-3">Medida complementaria</th>
                              <th className="p-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {filasMultas.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-6 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                  Ninguna infracción coincide con los filtros aplicados.
                                </td>
                              </tr>
                            ) : (
                              filasMultas.map((fila) => {
                                const cobrable = fila.monto > 0
                                return (
                                  <tr key={fila.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                                    <td className="max-w-[360px] p-3 text-slate-900 dark:text-white">
                                      <p className="font-display text-sm font-semibold leading-snug">
                                        {fila.infraccion}
                                      </p>
                                    </td>
                                    <td className="whitespace-nowrap p-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                      {fila.articulo}
                                    </td>
                                    <td className="whitespace-nowrap p-3 text-right font-display text-sm font-bold text-amber-700 dark:text-amber-300">
                                      {cobrable ? `Bs. ${formatearMonto(fila.monto)}` : '—'}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${claseCategoria(fila.categoriaVisible)}`}
                                      >
                                        {fila.categoriaVisible}
                                      </span>
                                    </td>
                                    <td className="max-w-[280px] p-3 font-mono text-[11px] leading-snug text-slate-600 dark:text-slate-300">
                                      {fila.medida || '—'}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => agregarMulta(fila)}
                                        disabled={!cobrable}
                                        className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2 font-display text-sm font-bold shadow-sm transition-colors ${
                                          cobrable
                                            ? 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-500'
                                            : 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                                        }`}
                                      >
                                        <Plus className="h-4 w-4" />
                                        {cobrable ? 'Agregar' : 'Sin multa'}
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

                  {/* Paso 2: Tabla de Aportes (Anexo II) */}
                  {modo === 'aportes' && (
                    <div className="rounded-2xl border-2 border-emerald-400/50 bg-white dark:bg-slate-900 p-4 shadow-sm dark:border-emerald-400/40 dark:shadow-xl">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-emerald-700 dark:text-emerald-300">
                          2. ELEGIR DE LA TABLA
                        </p>
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">
                          Anexo II · Escala de Aportes
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        Busque el aporte, revise la frecuencia y presione «＋ Agregar».
                      </p>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={filtroAporte}
                          onChange={(e) => setFiltroAporte(e.target.value)}
                          placeholder="Buscar aporte (ej. ordinario, fondo de accidentes, mantenimiento)…"
                          className="w-full rounded-xl border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        />
                        {filtroAporte !== '' && (
                          <button
                            type="button"
                            onClick={() => setFiltroAporte('')}
                            aria-label="Limpiar búsqueda de aportes"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
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
                                      {fila.item.variable
                                        ? ' · importe orientativo, ajuste según la Resolución de Asamblea'
                                        : ''}
                                    </p>
                                  </td>
                                  <td className="p-3">
                                    <span
                                      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${claseFrecuencia(fila.frecuencia)}`}
                                    >
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
                                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-600 px-4 py-2 font-display text-sm font-bold text-white shadow-sm shadow-emerald-600/20 transition-colors hover:bg-emerald-500"
                                    >
                                      <Plus className="h-4 w-4" /> Agregar
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
              Su rol no cuenta con permisos suficientes para gestionar sanciones o aportes de Tesorería.
            </p>
          )}

          {/* Modal de Cobro Reutilizable Compartido */}
          <ModalCobroMulta
            seleccion={seleccion}
            socioElegido={socioElegido}
            estadoSeleccion={estadoSeleccion}
            metodoPago={metodoPago}
            comprobante={comprobante}
            guardando={guardandoSeleccion}
            error={errorSeleccion}
            onClose={() => setSeleccion(null)}
            onEstadoChange={setEstadoSeleccion}
            onMetodoPagoChange={setMetodoPago}
            onComprobanteChange={setComprobante}
            onConfirmar={confirmarSeleccion}
            modulo="Tesorería"
          />

          {/* Bandeja de Deudas y Pagos Reportados con Edición Inline de Comprobantes */}
          {puedeGestionar && (
            <GestionDeudas refresco={deudasVersion} />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}

