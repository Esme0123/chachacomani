import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Save, AlertTriangle, LogOut, Scale, Search, X, Check, Sparkles, Coins, Plus, Trash2, QrCode, Receipt } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PERMISO_GESTIONAR_CAJA_CHICA, PERMISO_GESTIONAR_MULTAS } from '../services/permisosService.js'
import * as cajaChicaService from '../services/cajaChicaService.js'
import * as multasService from '../services/multasService.js'
import * as aportesService from '../services/aportesService.js'
import * as cobrosService from '../services/cobrosService.js'
import { ANEXOS_DATA } from '../data/reglamentoData'
import qrCobro from '../assets/qr-cobro.svg'

function formatearMonto(monto) {
  const numero = Number(monto);
  if (!Number.isFinite(numero)) return '0,00';
  return numero.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Periodo por defecto: el mes en curso, "YYYY-MM". */
function mesActual() {
  return new Date().toISOString().slice(0, 7);
}

/** Fecha de hoy en formato `YYYY-MM-DD`. */
function hoy() {
  return new Date().toISOString().slice(0, 10);
}

/** Identificador efímero para las filas del carrito (sólo en el cliente). */
function uidItem() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Frecuencia legible de un aporte del Anexo II. */
function frecuenciaAporte(aporte) {
  const texto = `${aporte?.detalle || ''} ${aporte?.montoTexto || ''}`;
  if (/mensual/i.test(texto)) return 'Mensual';
  if (/anual/i.test(texto)) return 'Anual';
  if (/variable|contingencia|extraordinari/i.test(texto)) return 'Extraordinario';
  return 'Extraordinario';
}

/** Filtros rápidos del Cuadro N.º 2. */
const FILTROS_MULTAS = [
  { id: 'Todas', etiqueta: 'Todas' },
  { id: 'Leve', etiqueta: 'Leves' },
  { id: 'Grave', etiqueta: 'Graves' },
  { id: 'Muy grave', etiqueta: 'Muy Graves' },
  { id: 'Consejeros', etiqueta: 'Consejeros' },
];

/** Categoría visible de una fila del Cuadro N.º 2 (conserva «Consejeros»). */
function categoriaVisible(item) {
  return /consejero/i.test(item?.categoriaOriginal || '')
    ? 'Consejeros'
    : item?.categoria || 'Leve';
}

/** Clases del badge de categoría. */
function claseCategoria(categoria) {
  const texto = String(categoria || '').toLowerCase();
  if (texto.includes('consejero')) {
    return 'border-violet-400/40 bg-violet-500/15 text-violet-300';
  }
  if (texto.includes('muy grave')) {
    return 'border-orange-400/40 bg-orange-500/15 text-orange-300';
  }
  if (texto.includes('gravísima') || texto.includes('gravisima')) {
    return 'border-rose-400/40 bg-rose-500/15 text-rose-300';
  }
  if (texto.includes('grave')) {
    return 'border-amber-400/40 bg-amber-500/15 text-amber-300';
  }
  return 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300';
}

/** Clases del badge de frecuencia de aportes. */
function claseFrecuencia(frecuencia) {
  if (frecuencia === 'Mensual') return 'border-sky-400/40 bg-sky-500/15 text-sky-300';
  if (frecuencia === 'Anual') return 'border-amber-400/40 bg-amber-500/15 text-amber-300';
  return 'border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300';
}

/** Anexo I del documento: contiene los Cuadros N.º 1 y N.º 2 de multas. */
const ANEXO_I = ANEXOS_DATA.find((anexo) => anexo?.tablas?.some((t) => t.id === 'cuadro-2')) || null;

/** Anexo II del documento: contiene la Escala de Aportes al Fondo de Accidentes. */
const ANEXO_II = ANEXOS_DATA.find((anexo) => anexo?.tablas?.some((t) => t.id === 'cuadro-aportes')) || null;

/**
 * ============================================================================
 *  PANEL DE CAJA CHICA
 * ============================================================================
 *  Especificación 3.c: el rol Caja Chica dispone de un panel especial para el
 *  registro y la consulta de ingresos y egresos menores.
 *
 *  · Registrar movimientos exige `caja_chica:gestionar` (Caja Chica y Admin).
 *  · El Tesorero tiene `contabilidad:ver`, por lo que puede consultar el panel.
 *    Tanto el Tesorero como el rol Caja Chica pueden cobrar multas del Anexo I
 *    y aportes del Anexo II desde el carrito, sin pestañas bloqueadas.
 *
 *  FLUJO GUIADO DE REGISTRO (tres pestañas)
 *  ----------------------------------------
 *  · 💸 Gastos / Egresos Generales — formulario clásico (tipo, categoría,
 *    concepto libre, monto y fecha). Requiere `caja_chica:gestionar`.
 *  · ⚖️ Multas (Anexo I) — tabla de sanciones: se elige el socio y se agregan
 *    una o varias infracciones de los Cuadros N.º 1 y N.º 2.
 *  · 💰 Aportes (Anexo II) — tabla de aportes de la Escala del Fondo de
 *    Accidentes (Aporte Ordinario, Fondo de Mantenimiento, Extraordinario…).
 *
 *  Ambos carritos comparten el socio y el mismo envío: al guardar, el backend
 *  (`POST /api/cobros`) crea las multas YA PAGADAS y UN ÚNICO movimiento de
 *  INGRESO en Caja Chica por el importe total, con categoría «Multas /
 *  Sanciones», «Aportes / Fondos» o «Cobros Anexo I y II» según la composición.
 *
 *  El Tesorero conserva su acceso a multas y ahora también cobra aportes; el rol
 *  Caja Chica registra gastos y ahora también cobra multas. El Admin puede
 *  combinar ambos anexos en un mismo cobro.
 *
 * @param {object}  [props.cobroInicial] Cobro preseleccionado al llegar desde
 *   el Anexo I («Cobrar en Caja Chica»).
 */
export default function CajaChicaView({ dark, onNavigate, onToggleTheme, cobroInicial, onCobroConsumido }) {
  const { logout, puede } = useAuth();
  const puedeGastos = puede(PERMISO_GESTIONAR_CAJA_CHICA);
  // Tanto el Tesorero como el rol Caja Chica pueden cobrar multas (Anexo I) y
  // aportes (Anexo II) desde este panel.
  const puedeCobrarAnexos =
    puede(PERMISO_GESTIONAR_MULTAS) || puede(PERMISO_GESTIONAR_CAJA_CHICA);
  const puedeMultas = puedeCobrarAnexos;
  const puedeAportes = puedeCobrarAnexos;

  const [mes, setMes] = useState(mesActual());
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [formAbierto, setFormAbierto] = useState(true);

  // Pestaña activa. El Tesorero (sólo multas) arranca en la de multas; los
  // demás, en la de gastos.
  const [modo, setModo] = useState(puedeMultas && !puedeGastos ? 'multas' : 'gastos');

  // Formulario clásico de gastos/ingresos libres.
  const [form, setForm] = useState({
    tipo: 'egreso',
    concepto: '',
    categoria: 'Otros',
    monto: '',
    fecha: hoy(),
    observaciones: '',
  });

  // Cobro guiado: socio + carrito de multas (Anexo I) y aportes (Anexo II).
  const [carrito, setCarrito] = useState([]);
  const [socioId, setSocioId] = useState('');
  const [filtroSocio, setFiltroSocio] = useState('');
  const [socios, setSocios] = useState([]);
  const [cargandoSocios, setCargandoSocios] = useState(false);

  // Añadir una multa del Anexo I al carrito.
  const [filtroInfraccion, setFiltroInfraccion] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [fechaInfraccion, setFechaInfraccion] = useState(hoy());

  // Añadir un aporte del Anexo II al carrito.
  const [filtroAporte, setFiltroAporte] = useState('');

  // Buscador de socios con lista desplegable.
  const [sociosAbierto, setSociosAbierto] = useState(false);
  const [alertaSocio, setAlertaSocio] = useState(false);

  // Método de pago y comprobante de la transferencia / QR.
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [comprobante, setComprobante] = useState('');

  // Confirmación visual al agregar un rubro al carrito.
  const [avisoAgregado, setAvisoAgregado] = useState(null);

  const [guardando, setGuardando] = useState(false);

  // Catálogos del Anexo I y del Anexo II.
  const catalogo = useMemo(() => multasService.catalogoInfracciones(ANEXO_I), []);
  const aportesCatalogo = useMemo(() => aportesService.catalogoAportes(ANEXO_II), []);

  const carritoDisponible = puedeMultas || puedeAportes;

  // El padrón de socios llega en `GET /api/multas`, que lo devuelve tanto al
  // Tesorero (`multas:gestionar`) como al rol Caja Chica (`caja_chica:gestionar`).
  useEffect(() => {
    if (!carritoDisponible) return;
    let vivo = true;
    (async () => {
      setCargandoSocios(true);
      try {
        const json = await multasService.listarMultas();
        if (vivo && Array.isArray(json?.socios)) setSocios(json.socios);
      } catch (err) {
        console.error('No se pudo cargar el padrón de socios:', err);
        if (vivo) setError(err?.message || 'No se pudo cargar el padrón de socios.');
      } finally {
        if (vivo) setCargandoSocios(false);
      }
    })();
    return () => { vivo = false; };
  }, [carritoDisponible]);

  const cargar = useCallback(async (periodo) => {
    setCargando(true);
    setError(null);
    try {
      const json = await cajaChicaService.listarMovimientos({ mes: periodo });
      setDatos(json);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar los movimientos de caja chica.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar(mes);
  }, [cargar, mes]);

  // La confirmación de «agregado» desaparece sola para no llenar la pantalla.
  useEffect(() => {
    if (!avisoAgregado) return undefined;
    const temporizador = setTimeout(() => setAvisoAgregado(null), 3500);
    return () => clearTimeout(temporizador);
  }, [avisoAgregado]);

  /* ---------------------------------------------------------------------- */
  /* Catálogos del carrito                                                  */
  /* ---------------------------------------------------------------------- */

  const filasMultas = useMemo(() => {
    const q = filtroInfraccion.trim().toLowerCase();
    return catalogo
      .filter((item) => item.origen === 2)
      .filter((item) => filtroCategoria === 'Todas' || categoriaVisible(item) === filtroCategoria)
      .filter((item) => {
        if (!q) return true;
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
          .includes(q);
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
      }));
  }, [catalogo, filtroInfraccion, filtroCategoria]);

  const opcionesAporte = useMemo(() => {
    const q = filtroAporte.trim().toLowerCase();
    if (!q) return aportesCatalogo;
    return aportesCatalogo.filter(
      (a) =>
        a.concepto.toLowerCase().includes(q) || String(a.detalle).toLowerCase().includes(q)
    );
  }, [aportesCatalogo, filtroAporte]);

  const filasAportes = useMemo(
    () =>
      opcionesAporte.map((aporte) => ({
        id: aporte.clave,
        nombre: aporte.concepto,
        detalle: aporte.detalle,
        frecuencia: frecuenciaAporte(aporte),
        monto: Number(aporte.monto),
        item: aporte,
      })),
    [opcionesAporte]
  );

  const sociosFiltrados = useMemo(() => {
    const q = filtroSocio.trim().toLowerCase();
    if (!q) return socios;
    return socios.filter(
      (s) =>
        String(s.nombre || '').toLowerCase().includes(q) ||
        String(s.correo || '').toLowerCase().includes(q)
    );
  }, [filtroSocio, socios]);

  const socioElegido = useMemo(
    () => socios.find((s) => String(s.id) === String(socioId)) || null,
    [socios, socioId]
  );

  const totalCarrito = useMemo(() => cobrosService.totalCarrito(carrito), [carrito]);
  const conceptoCarrito = useMemo(
    () => cobrosService.conceptoCobroGrupal(carrito, socioElegido?.nombre || ''),
    [carrito, socioElegido]
  );
  const categoriaCarrito = useMemo(() => cobrosService.categoriaSegunItems(carrito), [carrito]);

  /* ---------------------------------------------------------------------- */
  /* Construcción del carrito                                               */
  /* ---------------------------------------------------------------------- */

  const elegirSocio = (valor) => {
    setSocioId(valor);
    setAlertaSocio(false);
    setError(null);
    if (valor !== '') {
      setFiltroSocio('');
      setSociosAbierto(false);
    } else {
      setSociosAbierto(true);
    }
  };

  /** Exige un socio antes de agregar rubros y guía la vista hacia el paso 1. */
  const verificarSocio = () => {
    if (socioId) return true;
    setAlertaSocio(true);
    setError('Seleccione un socio primero para agregar rubros al carrito.');
    document.getElementById('paso-socio')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return false;
  };

  /** Agrega una multa del Anexo I directamente al carrito. */
  const agregarMulta = (fila) => {
    if (!verificarSocio()) return;
    const monto = Number(fila.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('Esta multa no tiene monto cobrable.');
      return;
    }
    const nombre = fila.item.tituloCorto || fila.item.infraccion;
    setCarrito((c) => [
      ...c,
      {
        uid: uidItem(),
        tipo: 'multa',
        clave: fila.item.clave,
        articulo: fila.item.articulo,
        infraccion: fila.item.infraccion,
        tituloCorto: fila.item.tituloCorto,
        categoria: fila.item.categoria,
        medida: fila.item.medida,
        monto,
        fechaInfraccion: fechaInfraccion || form.fecha,
      },
    ]);
    setAvisoAgregado({ nombre, monto, tipo: 'multa' });
    setError(null);
  };

  /** Agrega un aporte del Anexo II directamente al carrito. */
  const agregarAporte = (fila) => {
    if (!verificarSocio()) return;
    const monto = Number(fila.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El monto del aporte debe ser mayor que cero.');
      return;
    }
    setCarrito((c) => [
      ...c,
      {
        uid: uidItem(),
        tipo: 'aporte',
        clave: fila.item.clave,
        concepto: fila.item.concepto,
        detalle: fila.item.detalle,
        monto,
      },
    ]);
    setAvisoAgregado({ nombre: fila.item.concepto, monto, tipo: 'aporte' });
    setError(null);
  };

  const quitarDelCarrito = (uid) => {
    setCarrito((c) => c.filter((item) => item.uid !== uid));
  };

  /* ---------------------------------------------------------------------- */
  /* Pestañas                                                               */
  /* ---------------------------------------------------------------------- */

  const irAGastos = () => {
    if (!puedeGastos) return;
    setModo('gastos');
    setError(null);
    setFormAbierto(true);
  };

  const irAMultas = () => {
    if (!puedeMultas) return;
    setModo('multas');
    setError(null);
    setFormAbierto(true);
  };

  const irAAportes = () => {
    if (!puedeAportes) return;
    setModo('aportes');
    setError(null);
    setFormAbierto(true);
  };

  /**
   * Llegada desde el Anexo I «Cobrar en Caja Chica»: abre la pestaña de multas,
   * selecciona al socio y agrega la sanción al carrito lista para cobrar.
   */
  useEffect(() => {
    if (!cobroInicial) return;
    setModo('multas');
    setFormAbierto(true);
    if (cobroInicial.socioId != null) setSocioId(String(cobroInicial.socioId));
    setCarrito((c) => [
      ...c,
      {
        uid: uidItem(),
        tipo: 'multa',
        clave: `pre:${cobroInicial.infraccion}`,
        articulo: cobroInicial.articulo,
        infraccion: cobroInicial.infraccion,
        tituloCorto: cobroInicial.infraccion,
        categoria: cobroInicial.categoria || 'Grave',
        medida: '',
        monto: Number(cobroInicial.monto) || 0,
        fechaInfraccion: hoy(),
      },
    ]);
    onCobroConsumido?.();
    // Sólo se aplica cuando llega un cobro nuevo desde el Anexo I.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobroInicial]);

  /* ---------------------------------------------------------------------- */
  /* Envío                                                                  */
  /* ---------------------------------------------------------------------- */

  const registrar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setExito(null);
    setError(null);

    // --- Pestaña de gastos: movimiento libre -----------------------------
    if (modo === 'gastos') {
      if (!form.concepto.trim()) {
        setError('Indique el concepto del movimiento.');
        return;
      }
      if (form.monto === '' || Number(form.monto) <= 0) {
        setError('El monto debe ser mayor que cero.');
        return;
      }
      if (!form.fecha) {
        setError('Indique la fecha del movimiento.');
        return;
      }

      setGuardando(true);
      try {
        const json = await cajaChicaService.registrarMovimiento({
          ...form,
          concepto: form.concepto.trim(),
          monto: Number(form.monto),
        });
        setExito(json?.mensaje || 'Movimiento registrado correctamente.');
        setForm((f) => ({ ...f, concepto: '', monto: '', observaciones: '' }));
        cargar(mes);
      } catch (err) {
        setError(err?.message || 'No se pudo registrar el movimiento.');
      } finally {
        setGuardando(false);
      }
      return;
    }

    // --- Carrito (multas del Anexo I y/o aportes del Anexo II) -----------
    if (!socioId) {
      setAlertaSocio(true);
      setError('Seleccione un socio primero para agregar rubros al carrito.');
      document.getElementById('paso-socio')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (carrito.length === 0) {
      setError('El carrito está vacío: agregue al menos una multa o un aporte.');
      return;
    }
    if (!form.fecha) {
      setError('Indique la fecha de cobro.');
      return;
    }

    const referenciaPago =
      metodoPago === 'qr'
        ? `Método de pago: Transferencia / QR${comprobante.trim() ? ` · Comprobante: ${comprobante.trim()}` : ''}`
        : 'Método de pago: Efectivo';
    const observaciones = [form.observaciones.trim(), referenciaPago].filter(Boolean).join(' · ');

    setGuardando(true);
    try {
      const json = await cobrosService.registrarCobroGrupal({
        socioId: Number(socioId),
        items: carrito,
        fechaCobro: form.fecha,
        observaciones,
        conceptoCobro: conceptoCarrito,
      });
      setExito(json?.mensaje || 'Cobro registrado en Caja Chica.');
      setCarrito([]);
      setComprobante('');
      setMetodoPago('efectivo');
      setForm((f) => ({ ...f, observaciones: '' }));
      cargar(mes);
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el cobro en Caja Chica.');
    } finally {
      setGuardando(false);
    }
  };

  const totales = datos?.totales;
  const movimientos = datos?.movimientos || [];

  // Los cobros de multas del Anexo I entran solos en la categoría «Multas / Sanciones»
  // cuando el Tesorero marca la sanción como pagada (ver backend/api/multas.php).
  const totalMultas = movimientos
    .filter((m) => m.origenMulta)
    .reduce((suma, m) => suma + Number(m.monto || 0), 0);

  const input =
    'w-full rounded-lg px-3 py-2.5 font-mono text-sm text-[#0D0B61] dark:text-white bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 focus:outline-none focus:border-[#48B3AF]';
  const label =
    'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5';

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 10%, rgba(72,179,175,.14), transparent 55%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />

        <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 font-display font-semibold text-sm text-[#294669] dark:text-[#48B3AF] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Inicio
            </button>
            <button
              onClick={async () => {
                await logout();
                onNavigate('home');
              }}
              className="inline-flex items-center gap-1.5 font-display font-semibold text-sm text-[#C0392B] dark:text-[#F27C7C] hover:underline"
            >
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display font-bold text-xl md:text-2xl text-[#0D0B61] dark:text-white flex items-center gap-2">
                <Wallet className="w-6 h-6 text-[#48B3AF]" />
                Caja Chica
              </h1>
              <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
                Registro y consulta de ingresos y egresos menores, con el cobro de multas (Anexo I) y aportes (Anexo II).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="caja-mes" className="font-mono text-[11px] text-[#294669] dark:text-[#476EAE]">
                Periodo
              </label>
              <input
                id="caja-mes"
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                className="rounded-lg px-3 py-1.5 font-mono text-xs bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55"
              />
            </div>
          </div>

          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                etiqueta: 'Ingresos',
                valor: `Bs. ${formatearMonto(totales?.ingresos)}`,
                icono: TrendingUp,
                color: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                etiqueta: 'Egresos',
                valor: `Bs. ${formatearMonto(totales?.egresos)}`,
                icono: TrendingDown,
                color: 'text-rose-600 dark:text-rose-400',
              },
              {
                etiqueta: 'Saldo del periodo',
                valor: `Bs. ${formatearMonto(totales?.saldoPeriodo)}`,
                icono: Wallet,
                color: 'text-[#0D0B61] dark:text-white',
              },
              {
                etiqueta: 'Saldo acumulado',
                valor: `Bs. ${formatearMonto(totales?.saldoAcumulado)}`,
                icono: Wallet,
                color: 'text-[#48B3AF]',
              },
            ].map((item) => {
              const Icono = item.icono;
              return (
                <div
                  key={item.etiqueta}
                  className="rounded-xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/80 dark:bg-[#0D0B61]/70 px-4 py-3"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#294669]/60 dark:text-[#476EAE]/70 flex items-center gap-1">
                    <Icono className="w-3 h-3" /> {item.etiqueta}
                  </p>
                  <p className={`font-display font-bold text-base mt-0.5 ${item.color}`}>{item.valor}</p>
                </div>
              );
            })}
          </div>

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

          {/* Formulario de registro */}
          {puedeGastos || carritoDisponible ? (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-glow-card bg-white/92 dark:bg-[#0D0B61]/85 p-6"
              style={{ borderRadius: '20px' }}
            >
              <button
                onClick={() => setFormAbierto(o => !o)}
                aria-expanded={formAbierto}
                className="w-full flex items-center justify-between gap-3 text-left"
              >
                <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                  Registrar movimiento
                </h2>
                <span className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                  {formAbierto ? 'Ocultar ▲' : 'Mostrar ▼'}
                </span>
              </button>

              {/* Pestañas de modo de registro. Multas y Aportes quedan
                  habilitadas tanto para el Tesorero como para Caja Chica. */}
              <div role="tablist" aria-label="Modo de registro" className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'gastos'}
                  disabled={!puedeGastos}
                  onClick={irAGastos}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${
                    modo === 'gastos'
                      ? 'border-[#294669]/45 bg-[#294669]/10 dark:border-[#48B3AF]/45 dark:bg-[#294669]/35'
                      : 'border-[#294669]/15 dark:border-[#476EAE]/35 hover:bg-[#294669]/5'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                    <TrendingDown className="w-4 h-4 text-[#294669] dark:text-[#48B3AF]" />
                    💸 Gastos / Egresos
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-[#294669]/75 dark:text-[#476EAE]">
                    {puedeGastos ? 'Tipo, categoría, concepto libre y monto' : 'Su rol no habilita el registro de gastos'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'multas'}
                  disabled={!puedeMultas}
                  onClick={irAMultas}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${
                    modo === 'multas'
                      ? 'border-amber-500/60 bg-amber-500/15'
                      : 'border-amber-500/25 dark:border-amber-500/30 hover:bg-amber-500/8'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ⚖️ Multas (Anexo I)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-amber-700/85 dark:text-amber-300/85">
                    {puedeMultas ? 'Elija una multa y haga clic en ＋ Agregar' : 'Su rol no habilita el cobro de multas'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={modo === 'aportes'}
                  disabled={!puedeAportes}
                  onClick={irAAportes}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${
                    modo === 'aportes'
                      ? 'border-emerald-500/60 bg-emerald-500/15'
                      : 'border-emerald-500/25 dark:border-emerald-500/30 hover:bg-emerald-500/8'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                    <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    💰 Aportes (Anexo II)
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-emerald-700/85 dark:text-emerald-300/85">
                    {puedeAportes ? 'Elija un aporte y haga clic en ＋ Agregar' : 'Su rol no habilita el registro de aportes'}
                  </span>
                </button>
              </div>

              {formAbierto && modo === 'gastos' && (
                <form onSubmit={registrar} noValidate className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="caja-tipo" className={label}>TIPO</label>
                    <select
                      id="caja-tipo"
                      value={form.tipo}
                      onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                      className={input}
                    >
                      <option value="egreso">Egreso</option>
                      <option value="ingreso">Ingreso</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="caja-categoria" className={label}>CATEGORÍA</label>
                    <select
                      id="caja-categoria"
                      value={form.categoria}
                      onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                      className={input}
                    >
                      {cajaChicaService.CATEGORIAS_CAJA.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="caja-concepto" className={label}>CONCEPTO</label>
                    <input
                      id="caja-concepto"
                      type="text"
                      value={form.concepto}
                      onChange={(e) => setForm((f) => ({ ...f, concepto: e.target.value }))}
                      placeholder="Ej. Compra de combustible para la perforación"
                      className={input}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="caja-monto" className={label}>MONTO (Bs.)</label>
                    <input
                      id="caja-monto"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.monto}
                      onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                      className={input}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="caja-fecha" className={label}>FECHA</label>
                    <input
                      id="caja-fecha"
                      type="date"
                      value={form.fecha}
                      onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                      className={input}
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="caja-obs-gasto" className={label}>OBSERVACIONES</label>
                    <input
                      id="caja-obs-gasto"
                      type="text"
                      value={form.observaciones}
                      onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                      className={input}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-display text-base font-bold text-white shadow-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                    >
                      <Save className="w-5 h-5" />
                      {guardando ? 'Registrando…' : 'Registrar Movimiento'}
                    </button>
                  </div>
                </form>
              )}

              {formAbierto && modo !== 'gastos' && (
                <form onSubmit={registrar} noValidate className="mt-5 space-y-4">
                  {/* Caja 1 — Socio (obligatorio, compartido por el carrito) */}
                  <div
                    id="paso-socio"
                    className={`rounded-2xl border-2 bg-slate-900/95 p-4 shadow-xl ring-1 ring-amber-400/20 ${
                      alertaSocio
                        ? 'border-rose-400/70 ring-2 ring-rose-400/40'
                        : 'border-amber-400/40'
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-mono text-[11px] font-bold text-slate-900">
                        1
                      </span>
                      <p className="font-display text-[11px] font-semibold tracking-widest text-amber-300">
                        1. SELECCIONAR SOCIO
                      </p>
                      <span className="font-mono text-[10px] text-amber-200/70">
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
                          Seleccione un socio primero para poder agregar multas o aportes.
                        </p>
                      </div>
                    )}

                    {cargandoSocios ? (
                      <p className="font-mono text-[11px] text-slate-300">Cargando socios…</p>
                    ) : socios.length === 0 ? (
                      <p className="font-mono text-[11px] text-amber-300">
                        No se pudo cargar el padrón de socios. Verifique su sesión e intente de nuevo.
                      </p>
                    ) : socioElegido ? (
                      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2.5">
                        <p className="font-mono text-[11px] text-emerald-200">
                          <Check className="mr-1 inline h-3.5 w-3.5" />
                          <strong className="text-white">{socioElegido.nombre}</strong>
                          {socioElegido.correo ? ` · ${socioElegido.correo}` : ''}
                          {socioElegido.rol ? ` · ${socioElegido.rol}` : ''}
                        </p>
                        <button
                          type="button"
                          onClick={() => elegirSocio('')}
                          className="font-mono text-[10px] font-bold text-amber-300 underline hover:text-amber-200"
                        >
                          Cambiar socio
                        </button>
                      </div>
                    ) : (
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="caja-socio-filtro"
                          type="text"
                          value={filtroSocio}
                          onChange={(e) => {
                            setFiltroSocio(e.target.value);
                            setSociosAbierto(true);
                          }}
                          onFocus={() => setSociosAbierto(true)}
                          onBlur={() => window.setTimeout(() => setSociosAbierto(false), 150)}
                          placeholder="Buscar socio por nombre o correo…"
                          autoComplete="off"
                          aria-expanded={sociosAbierto}
                          aria-controls="lista-socios"
                          className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                        />
                        {filtroSocio !== '' && (
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => setFiltroSocio('')}
                            aria-label="Limpiar búsqueda de socios"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {sociosAbierto && (
                          <div
                            id="lista-socios"
                            className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-600 bg-slate-900 shadow-2xl"
                          >
                            {sociosFiltrados.length === 0 ? (
                              <p className="px-3 py-3 font-mono text-[11px] text-slate-400">
                                Ningún socio coincide con «{filtroSocio.trim()}».
                              </p>
                            ) : (
                              <ul className="divide-y divide-slate-700/70">
                                {sociosFiltrados.map((s) => (
                                  <li key={s.id}>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => elegirSocio(String(s.id))}
                                      className="flex w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-800"
                                    >
                                      <span className="font-display text-xs font-semibold text-white">
                                        {s.nombre}
                                      </span>
                                      <span className="truncate font-mono text-[10px] text-slate-400">
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

                  {/* Caja 2 — Tabla de multas (Anexo I) o aportes (Anexo II) */}
                  {modo === 'multas' && (
                    <div className="rounded-2xl border-2 border-amber-400/40 bg-slate-900/95 p-4 shadow-xl">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-amber-300">
                          2. ELEGIR DE LA TABLA
                        </p>
                        <span className="font-mono text-[10px] text-slate-400">
                          Cuadro N.º 2 · Infracciones Específicas
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-300">
                        Busque la infracción, revise la multa y presione «＋ Agregar».
                      </p>

                      {alertaSocio && (
                        <div
                          role="alert"
                          className="mb-3 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                          <p className="font-mono text-[11px] text-rose-200">
                            Seleccione un socio primero para agregar esta multa.
                          </p>
                        </div>
                      )}

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
                                : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-amber-400/60 hover:text-amber-200'
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
                            id="caja-infraccion-filtro"
                            type="text"
                            value={filtroInfraccion}
                            onChange={(e) => setFiltroInfraccion(e.target.value)}
                            placeholder="Buscar por infracción, artículo o medida (ej. EPP, Art. 41)…"
                            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                          />
                          {filtroInfraccion !== '' && (
                            <button
                              type="button"
                              onClick={() => setFiltroInfraccion('')}
                              aria-label="Limpiar búsqueda de multas"
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-700"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <div>
                          <label htmlFor="caja-fecha-infraccion" className="mb-1 block font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                            Fecha de la infracción
                          </label>
                          <input
                            id="caja-fecha-infraccion"
                            type="date"
                            value={fechaInfraccion}
                            onChange={(e) => setFechaInfraccion(e.target.value)}
                            className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 font-mono text-sm text-white focus:border-amber-400 focus:outline-none sm:w-44"
                          />
                        </div>
                      </div>

                      <div className="mt-3 max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-slate-700">
                        <table className="w-full min-w-[980px] border-collapse text-left text-xs">
                          <thead className="sticky top-0 z-10 bg-slate-800">
                            <tr className="font-display text-[10px] uppercase tracking-wider text-amber-300">
                              <th className="p-3">Infracción tipificada</th>
                              <th className="p-3">Artículo</th>
                              <th className="p-3 text-right">Multa (Bs.)</th>
                              <th className="p-3">Categoría</th>
                              <th className="p-3">Medida complementaria</th>
                              <th className="p-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/80 bg-slate-900">
                            {filasMultas.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="p-6 text-center font-mono text-[11px] text-slate-400">
                                  Ninguna infracción coincide con los filtros aplicados.
                                </td>
                              </tr>
                            ) : (
                              filasMultas.map((fila) => {
                                const cobrable = fila.monto > 0;
                                return (
                                  <tr key={fila.id} className="transition-colors hover:bg-slate-800/70">
                                    <td className="max-w-[360px] p-3">
                                      <p className="font-display text-sm font-semibold leading-snug text-white">
                                        {fila.infraccion}
                                      </p>
                                    </td>
                                    <td className="whitespace-nowrap p-3 font-mono text-[11px] text-slate-300">
                                      {fila.articulo}
                                    </td>
                                    <td className="whitespace-nowrap p-3 text-right font-display text-sm font-bold text-amber-200">
                                      {cobrable ? `Bs. ${formatearMonto(fila.monto)}` : '—'}
                                    </td>
                                    <td className="p-3">
                                      <span
                                        className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide ${claseCategoria(fila.categoriaVisible)}`}
                                      >
                                        {fila.categoriaVisible}
                                      </span>
                                    </td>
                                    <td className="max-w-[280px] p-3 font-mono text-[11px] leading-snug text-slate-300">
                                      {fila.medida || '—'}
                                    </td>
                                    <td className="p-3 text-right">
                                      <button
                                        type="button"
                                        onClick={() => agregarMulta(fila)}
                                        disabled={!cobrable}
                                        className={`inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 font-display text-sm font-bold shadow-sm transition-colors ${
                                          cobrable
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-400'
                                            : 'cursor-not-allowed bg-slate-700 text-slate-400'
                                        }`}
                                      >
                                        <Plus className="h-4 w-4" />
                                        {cobrable ? 'Agregar' : 'Sin multa'}
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {modo === 'aportes' && (
                    <div className="rounded-2xl border-2 border-emerald-400/40 bg-slate-900/95 p-4 shadow-xl">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400 font-mono text-[11px] font-bold text-slate-900">
                          2
                        </span>
                        <p className="font-display text-[11px] font-semibold tracking-widest text-emerald-300">
                          2. ELEGIR DE LA TABLA
                        </p>
                        <span className="font-mono text-[10px] text-slate-400">
                          Anexo II · Escala de Aportes
                        </span>
                      </div>
                      <p className="mb-3 font-mono text-[11px] text-slate-300">
                        Busque el aporte, revise la frecuencia y presione «＋ Agregar».
                      </p>

                      {alertaSocio && (
                        <div
                          role="alert"
                          className="mb-3 flex items-start gap-2 rounded-xl border border-rose-400/50 bg-rose-500/15 px-3 py-2"
                        >
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                          <p className="font-mono text-[11px] text-rose-200">
                            Seleccione un socio primero para agregar este aporte.
                          </p>
                        </div>
                      )}

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          id="caja-aporte-filtro"
                          type="text"
                          value={filtroAporte}
                          onChange={(e) => setFiltroAporte(e.target.value)}
                          placeholder="Buscar aporte (ej. ordinario, fondo de accidentes, mantenimiento)…"
                          className="w-full rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 pl-9 pr-9 font-mono text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                        />
                        {filtroAporte !== '' && (
                          <button
                            type="button"
                            onClick={() => setFiltroAporte('')}
                            aria-label="Limpiar búsqueda de aportes"
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-700"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 max-h-[28rem] overflow-x-auto overflow-y-auto rounded-xl border border-slate-700">
                        <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                          <thead className="sticky top-0 z-10 bg-slate-800">
                            <tr className="font-display text-[10px] uppercase tracking-wider text-emerald-300">
                              <th className="p-3">Concepto de aporte</th>
                              <th className="p-3">Frecuencia</th>
                              <th className="p-3 text-right">Monto (Bs.)</th>
                              <th className="p-3 text-right">Acción</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/80 bg-slate-900">
                            {filasAportes.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="p-6 text-center font-mono text-[11px] text-slate-400">
                                  Ningún aporte coincide con «{filtroAporte.trim()}».
                                </td>
                              </tr>
                            ) : (
                              filasAportes.map((fila) => (
                                <tr key={fila.id} className="transition-colors hover:bg-slate-800/70">
                                  <td className="max-w-[420px] p-3">
                                    <p className="font-display text-sm font-semibold leading-snug text-white">
                                      {fila.nombre}
                                    </p>
                                    <p className="mt-0.5 font-mono text-[10px] leading-snug text-slate-400">
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
                                  <td className="whitespace-nowrap p-3 text-right font-display text-sm font-bold text-emerald-200">
                                    Bs. {formatearMonto(fila.monto)}
                                  </td>
                                  <td className="p-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => agregarAporte(fila)}
                                      className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-emerald-500 px-4 py-2.5 font-display text-sm font-bold text-white shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-400"
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

                  {/* Caja 3 — Carrito */}
                  <div id="carrito-cobro" className="rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-xl">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-display text-[11px] font-semibold tracking-widest text-amber-300">
                        3. CONFIRMAR COBRO
                      </p>
                      <span className="font-mono text-[10px] text-slate-400">
                        {carrito.length} ítem(s) · categoría {categoriaCarrito}
                      </span>
                    </div>

                    {avisoAgregado && (
                      <motion.div
                        role="status"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-2.5"
                      >
                        <Check className="h-4 w-4 shrink-0 text-emerald-300" />
                        <p className="font-display text-sm font-semibold text-emerald-200">
                          ¡Agregado al carrito! {avisoAgregado.nombre} · Bs. {formatearMonto(avisoAgregado.monto)}
                        </p>
                        <button
                          type="button"
                          onClick={() => document.getElementById('carrito-cobro')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                          className="ml-auto font-mono text-[10px] font-bold text-amber-300 underline hover:text-amber-200"
                        >
                          Ver carrito
                        </button>
                      </motion.div>
                    )}

                    {carrito.length === 0 ? (
                      <p className="py-4 text-center font-mono text-[11px] text-slate-400">
                        El carrito está vacío. Use los botones «＋ Agregar» de la tabla de arriba.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                          <thead>
                            <tr className="font-display text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                              <th className="p-2">Anexo</th>
                              <th className="p-2">Detalle</th>
                              <th className="p-2 text-right">Monto (Bs.)</th>
                              <th className="p-2" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/80">
                            {carrito.map((item) => (
                              <tr key={item.uid} className="transition-colors hover:bg-slate-800/60">
                                <td className="p-2">
                                  <span
                                    className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase ${
                                      item.tipo === 'aporte'
                                        ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                                        : 'border-amber-400/40 bg-amber-500/15 text-amber-300'
                                    }`}
                                  >
                                    {item.tipo === 'aporte' ? 'Anexo II' : 'Anexo I'}
                                  </span>
                                </td>
                                <td className="p-2 text-slate-100">
                                  {item.tipo === 'aporte' ? item.concepto : item.infraccion}
                                  <span className="block font-mono text-[10px] text-slate-400">
                                    {item.tipo === 'aporte' ? item.detalle : `${item.articulo} · ${item.categoria}`}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap p-2 text-right font-mono text-slate-100">
                                  {formatearMonto(item.monto)}
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => quitarDelCarrito(item.uid)}
                                    aria-label="Quitar del carrito"
                                    className="rounded p-1 text-rose-300 hover:bg-rose-500/15"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2} className="p-2 text-right font-display text-xs font-bold text-white">
                                TOTAL
                              </td>
                              <td className="whitespace-nowrap p-2 text-right font-display text-sm font-bold text-amber-200">
                                {formatearMonto(totalCarrito)}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {carrito.length > 0 && (
                      <p className="mt-2 font-mono text-[10px] text-slate-400">
                        Concepto: {conceptoCarrito}
                      </p>
                    )}
                  </div>

                  {/* Método de pago: efectivo o transferencia / QR estático */}
                  <div className="rounded-2xl border border-amber-400/30 bg-slate-900/95 p-4 shadow-xl">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <QrCode className="h-4 w-4 text-amber-300" />
                      <p className="font-display text-[11px] font-semibold tracking-widest text-amber-300">
                        MÉTODO DE PAGO
                      </p>
                      <span className="font-mono text-[10px] text-slate-400">
                        seleccione cómo recibió el dinero
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => setMetodoPago('efectivo')}
                        aria-pressed={metodoPago === 'efectivo'}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-display text-sm font-bold transition-colors ${
                          metodoPago === 'efectivo'
                            ? 'border-emerald-400 bg-emerald-500/15 text-emerald-200'
                            : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-emerald-400/60'
                        }`}
                      >
                        <span className="text-lg">💵</span> Efectivo
                      </button>
                      <button
                        type="button"
                        onClick={() => setMetodoPago('qr')}
                        aria-pressed={metodoPago === 'qr'}
                        className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-display text-sm font-bold transition-colors ${
                          metodoPago === 'qr'
                            ? 'border-amber-400 bg-amber-400/15 text-amber-200'
                            : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-amber-400/60'
                        }`}
                      >
                        <span className="text-lg">📱</span> Transferencia / QR
                      </button>
                    </div>

                    {metodoPago === 'qr' && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 flex flex-col items-center gap-3 rounded-2xl border border-amber-400/40 bg-slate-800 p-4"
                      >
                        <img
                          src={qrCobro}
                          alt="QR estático de cobro de la Cooperativa Minera Nevado Chachacomani R.L."
                          className="w-44 rounded-xl bg-white p-2 shadow-lg"
                        />
                        <div className="w-full max-w-md text-center">
                          <p className="font-mono text-[10px] uppercase tracking-widest text-amber-300">
                            Monto exacto a cobrar
                          </p>
                          <p className="font-display text-4xl font-bold text-white">
                            Bs. {formatearMonto(totalCarrito)}
                          </p>
                          <p className="mt-1 font-mono text-[11px] leading-relaxed text-slate-300">
                            Escanee el QR desde su aplicación bancaria.
                          </p>

                          <label
                            htmlFor="caja-comprobante"
                            className="mt-3 block text-left font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-300"
                          >
                            Número de comprobante / transacción{' '}
                            <span className="font-normal normal-case text-slate-400">(opcional)</span>
                          </label>
                          <div className="relative mt-1">
                            <Receipt className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                              id="caja-comprobante"
                              type="text"
                              value={comprobante}
                              onChange={(e) => setComprobante(e.target.value)}
                              placeholder="Ej. 123456789"
                              className="w-full rounded-xl border border-slate-600 bg-slate-900 px-3 py-2.5 pl-9 font-mono text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Caja 4 — Fecha de cobro y observaciones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="caja-fecha-cobro" className={label}>FECHA DE COBRO</label>
                      <input
                        id="caja-fecha-cobro"
                        type="date"
                        value={form.fecha}
                        onChange={(e) => setForm((f) => ({ ...f, fecha: e.target.value }))}
                        className={input}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="caja-obs-cobro" className={label}>OBSERVACIONES</label>
                      <input
                        id="caja-obs-cobro"
                        type="text"
                        value={form.observaciones}
                        onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                        className={input}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="inline-flex items-center gap-2 rounded-lg px-6 py-3 font-display text-base font-bold text-white shadow-sm disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                    >
                      <Save className="w-5 h-5" />
                      {guardando ? 'Registrando…' : 'Confirmar Cobro'}
                    </button>
                    <p className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Un solo envío: un único ingreso en Caja Chica por el total del carrito.
                    </p>
                  </div>
                </form>
              )}
            </motion.section>
          ) : (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 font-mono text-[11px] text-amber-600 dark:text-amber-400">
              Consulta en modo lectura: su rol permite consultar la caja chica pero no registrar
              movimientos.
            </p>
          )}

          {/* Movimientos */}
          <section className="rounded-2xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/92 dark:bg-[#0D0B61]/85 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#294669]/15 dark:border-[#294669]/35 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                Movimientos del periodo
              </h2>
              {totalMultas > 0 && (
                <span className="font-mono text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400">
                  Incluye Bs. {formatearMonto(totalMultas)} por cobros de multas (Anexo I)
                </span>
              )}
            </div>

            {cargando ? (
              <p className="px-5 py-10 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
                Cargando movimientos…
              </p>
            ) : movimientos.length === 0 ? (
              <p className="px-5 py-10 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
                No hay movimientos registrados en este periodo.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#294669]/8 dark:bg-[#294669]/35 text-[#294669] dark:text-[#48B3AF] uppercase font-semibold text-[10px] tracking-wider">
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Tipo</th>
                      <th className="p-3.5">Concepto</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5 text-right">Monto (Bs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#294669]/10 dark:divide-[#294669]/25">
                    {movimientos.map((m) => (
                      <tr key={m.id} className="hover:bg-[#294669]/5 dark:hover:bg-[#294669]/20">
                        <td className="p-3.5 font-mono text-[#294669] dark:text-slate-300 whitespace-nowrap">
                          {String(m.fecha || '').slice(0, 10)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                              m.tipo === 'ingreso'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            }`}
                          >
                            {m.tipo}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#0D0B61] dark:text-slate-100">
                          {m.concepto}
                          {m.registradoPorNombre && (
                            <span className="block mt-0.5 font-mono text-[10px] text-[#294669]/60 dark:text-slate-500">
                              por {m.registradoPorNombre}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#294669]/80 dark:text-slate-400">
                          {m.categoria}
                          {m.origenMulta && (
                            <span className="block mt-0.5 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                              Anexo I · multa #{m.origenMulta}
                            </span>
                          )}
                        </td>
                        <td
                          className={`p-3.5 text-right font-bold whitespace-nowrap ${
                            m.tipo === 'ingreso'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {m.tipo === 'ingreso' ? '+' : '−'} {formatearMonto(m.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
