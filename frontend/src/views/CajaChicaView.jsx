import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Save, AlertTriangle, LogOut, Scale, Search, X, Check, Sparkles, Coins, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PERMISO_GESTIONAR_CAJA_CHICA, PERMISO_GESTIONAR_MULTAS } from '../services/permisosService.js'
import * as cajaChicaService from '../services/cajaChicaService.js'
import * as multasService from '../services/multasService.js'
import * as aportesService from '../services/aportesService.js'
import * as cobrosService from '../services/cobrosService.js'
import { ANEXOS_DATA } from '../data/reglamentoData'

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
 *  · El Tesorero tiene `contabilidad:ver`, por lo que puede consultar el panel
 *    en modo lectura: ve los movimientos y los saldos, pero el formulario de
 *    registro le aparece bloqueado.
 *
 *  FLUJO GUIADO DE REGISTRO (tres pestañas)
 *  ----------------------------------------
 *  · 💸 Gastos / Egresos Generales — formulario clásico (tipo, categoría,
 *    concepto libre, monto y fecha). Requiere `caja_chica:gestionar`.
 *  · ⚖️ Multas (Anexo I) — carrito de sanciones: se elige el socio y se agregan
 *    una o varias infracciones de los Cuadros N.º 1 y N.º 2.
 *  · 💰 Aportes (Anexo II) — carrito de aportes de la Escala del Fondo de
 *    Accidentes (Aporte Ordinario, Fondo de Mantenimiento, Extraordinario…).
 *
 *  Ambos carritos comparten el socio y el mismo envío: al guardar, el backend
 *  (`POST /api/cobros`) crea las multas YA PAGADAS y UN ÚNICO movimiento de
 *  INGRESO en Caja Chica por el importe total, con categoría «Multas /
 *  Sanciones», «Aportes / Fondos» o «Cobros Anexo I y II» según la composición.
 *
 *  El Tesorero no tiene `caja_chica:gestionar`, pero sí `multas:gestionar`: su
 *  única pestaña habilitada es la de multas. El rol Caja Chica registra gastos y
 *  aportes; únicamente el Admin puede mezclar multas y aportes en un mismo cobro.
 *
 * @param {object}  [props.cobroInicial] Cobro preseleccionado al llegar desde
 *   el Anexo I («Cobrar en Caja Chica»).
 */
export default function CajaChicaView({ dark, onNavigate, onToggleTheme, cobroInicial, onCobroConsumido }) {
  const { logout, puede } = useAuth();
  const puedeGastos = puede(PERMISO_GESTIONAR_CAJA_CHICA);
  const puedeMultas = puede(PERMISO_GESTIONAR_MULTAS);
  const puedeAportes = puede(PERMISO_GESTIONAR_CAJA_CHICA);

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
  const [infraccionSel, setInfraccionSel] = useState(null);
  const [nivelSel, setNivelSel] = useState(null);
  const [montoMulta, setMontoMulta] = useState('');
  const [fechaInfraccion, setFechaInfraccion] = useState(hoy());

  // Añadir un aporte del Anexo II al carrito.
  const [filtroAporte, setFiltroAporte] = useState('');
  const [aporteSel, setAporteSel] = useState(null);
  const [montoAporte, setMontoAporte] = useState('');

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

  /* ---------------------------------------------------------------------- */
  /* Catálogos del carrito                                                  */
  /* ---------------------------------------------------------------------- */

  const opcionesInfraccion = useMemo(() => {
    const q = filtroInfraccion.trim().toLowerCase();
    const lista = q
      ? catalogo.filter(
          (i) =>
            i.infraccion.toLowerCase().includes(q) ||
            String(i.articulo).toLowerCase().includes(q) ||
            i.categoria.toLowerCase().includes(q)
        )
      : catalogo;
    return multasService.agruparPorCuadro(lista);
  }, [catalogo, filtroInfraccion]);

  const opcionesAporte = useMemo(() => {
    const q = filtroAporte.trim().toLowerCase();
    if (!q) return aportesCatalogo;
    return aportesCatalogo.filter(
      (a) =>
        a.concepto.toLowerCase().includes(q) || String(a.detalle).toLowerCase().includes(q)
    );
  }, [aportesCatalogo, filtroAporte]);

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
    if (valor !== '') setFiltroSocio('');
  };

  /** Elige una infracción del catálogo (Cuadros N.º 1 y 2). */
  const elegirInfraccion = (clave) => {
    const opcion = catalogo.find((i) => i.clave === clave) || null;
    if (!opcion) {
      setInfraccionSel(null);
      setNivelSel(null);
      setMontoMulta('');
      return;
    }
    setFiltroInfraccion('');
    const nivelInicial = opcion.origen === 1 ? opcion.niveles?.[0] || null : null;
    setMontoMulta(String(multasService.montoDeOpcion(opcion, nivelInicial)));
    setInfraccionSel(opcion);
    setNivelSel(nivelInicial);
  };

  /** Fija el monto según el tramo de la escala general (Cuadro N.º 1). */
  const elegirNivel = (nivel) => {
    setNivelSel(nivel);
    setMontoMulta(String(multasService.montoDeOpcion(infraccionSel, nivel)));
  };

  /**
   * Etiqueta de una opción del desplegable de infracciones: artículo, resumen
   * corto y monto, para ubicar la falta sin abrir el reglamento.
   */
  const etiquetaInfraccion = (item) => {
    if (item.origen === 1) {
      const escala = item.niveles.map((n) => n.monto).join(' / ');
      return `${item.tituloCorto} · ${item.articulo} · escala ${escala} Bs.`;
    }
    const monto = item.monto > 0 ? `${item.monto} Bs.` : 'sin multa pecuniaria';
    return `${item.articulo} · ${item.tituloCorto} · ${monto}`;
  };

  const agregarMultaAlCarrito = () => {
    if (!infraccionSel) {
      setError('Elija la infracción del Anexo I que desea agregar al carrito.');
      return;
    }
    const monto = Number(montoMulta);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('La sanción no tiene monto: fíjelo (o elija otra infracción) antes de agregarla.');
      return;
    }
    setCarrito((c) => [
      ...c,
      {
        uid: uidItem(),
        tipo: 'multa',
        clave: infraccionSel.clave,
        articulo: infraccionSel.articulo,
        infraccion: infraccionSel.infraccion,
        tituloCorto: infraccionSel.tituloCorto,
        categoria: infraccionSel.categoria,
        medida: infraccionSel.medida,
        monto,
        fechaInfraccion: fechaInfraccion || form.fecha,
      },
    ]);
    setInfraccionSel(null);
    setNivelSel(null);
    setFiltroInfraccion('');
    setMontoMulta('');
    setError(null);
  };

  const elegirAporte = (clave) => {
    const opcion = aportesCatalogo.find((a) => a.clave === clave) || null;
    setAporteSel(opcion);
    setMontoAporte(opcion ? String(opcion.monto) : '');
  };

  const agregarAporteAlCarrito = () => {
    if (!aporteSel) {
      setError('Elija el aporte del Anexo II que desea agregar al carrito.');
      return;
    }
    const monto = Number(montoAporte);
    if (!Number.isFinite(monto) || monto <= 0) {
      setError('El monto del aporte debe ser mayor que cero.');
      return;
    }
    setCarrito((c) => [
      ...c,
      {
        uid: uidItem(),
        tipo: 'aporte',
        clave: aporteSel.clave,
        concepto: aporteSel.concepto,
        detalle: aporteSel.detalle,
        monto,
      },
    ]);
    setAporteSel(null);
    setFiltroAporte('');
    setMontoAporte('');
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
      setError('Caja 1 · Seleccione el socio al que se imputa el cobro.');
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

    setGuardando(true);
    try {
      const json = await cobrosService.registrarCobroGrupal({
        socioId: Number(socioId),
        items: carrito,
        fechaCobro: form.fecha,
        observaciones: form.observaciones,
        conceptoCobro: conceptoCarrito,
      });
      setExito(json?.mensaje || 'Cobro registrado en Caja Chica.');
      setCarrito([]);
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

              {/* Pestañas de modo de registro. Se deshabilitan las que el rol no
                  puede usar: el Tesorero sólo cobra multas; el rol Caja Chica
                  registra gastos y aportes. */}
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
                    {puedeMultas ? 'Agregue una o varias sanciones al carrito' : 'Su rol no habilita el cobro de multas'}
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
                    {puedeAportes ? 'Agregue uno o varios aportes al carrito' : 'Su rol no habilita el registro de aportes'}
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
                      className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                    >
                      <Save className="w-4 h-4" />
                      {guardando ? 'Registrando…' : 'Registrar Movimiento'}
                    </button>
                  </div>
                </form>
              )}

              {formAbierto && modo !== 'gastos' && (
                <form onSubmit={registrar} noValidate className="mt-5 space-y-4">
                  {/* Caja 1 — Socio (obligatorio, compartido por el carrito) */}
                  <div className="rounded-2xl border-2 border-amber-500/35 bg-amber-500/5 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 font-mono text-[11px] font-bold text-white">
                        1
                      </span>
                      <label htmlFor="caja-socio-filtro" className={label}>
                        SELECCIONAR SOCIO
                      </label>
                      <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300">
                        obligatorio
                      </span>
                    </div>
                    {cargandoSocios ? (
                      <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
                        Cargando socios…
                      </p>
                    ) : socios.length === 0 ? (
                      <p className="font-mono text-[11px] text-amber-600 dark:text-amber-400">
                        No se pudo cargar el padrón de socios. Verifique su sesión e intente de nuevo.
                      </p>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#294669]/50 dark:text-[#476EAE]" />
                          <input
                            id="caja-socio-filtro"
                            type="text"
                            value={filtroSocio}
                            onChange={(e) => setFiltroSocio(e.target.value)}
                            placeholder="Buscar socio por nombre o correo…"
                            className={`${input} pl-9`}
                          />
                          {filtroSocio !== '' && (
                            <button
                              type="button"
                              onClick={() => setFiltroSocio('')}
                              aria-label="Limpiar búsqueda de socios"
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#294669]/60 dark:text-slate-400 hover:bg-[#294669]/10"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {socioElegido ? (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-500/45 bg-emerald-500/10 px-3 py-2">
                            <p className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300">
                              <Check className="mr-1 inline h-3.5 w-3.5" />
                              <strong>{socioElegido.nombre}</strong>
                              {socioElegido.correo ? ` · ${socioElegido.correo}` : ''}
                              {socioElegido.rol ? ` · ${socioElegido.rol}` : ''}
                            </p>
                            <button
                              type="button"
                              onClick={() => elegirSocio('')}
                              className="font-mono text-[10px] text-[#294669] underline dark:text-[#48B3AF]"
                            >
                              Cambiar socio
                            </button>
                          </div>
                        ) : (
                          <ul className="mt-2 grid max-h-56 gap-1 overflow-y-auto pr-1">
                            {sociosFiltrados.map((s) => (
                              <li key={s.id}>
                                <button
                                  type="button"
                                  onClick={() => elegirSocio(String(s.id))}
                                  className="flex w-full items-baseline justify-between gap-3 rounded-lg border border-[#294669]/15 bg-white/70 px-3 py-2 text-left hover:border-amber-500/50 hover:bg-amber-500/8 dark:border-[#476EAE]/35 dark:bg-[#0D0B61]/60"
                                >
                                  <span className="font-display text-xs font-semibold text-[#0D0B61] dark:text-white">
                                    {s.nombre}
                                  </span>
                                  <span className="truncate font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                                    {s.correo}
                                    {s.rol ? ` · ${s.rol}` : ''}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                        {!socioElegido && filtroSocio.trim() !== '' && sociosFiltrados.length === 0 && (
                          <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                            Ningún socio coincide con «{filtroSocio.trim()}».
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Caja 2 — Según la pestaña: infracción (Anexo I) o aporte (Anexo II) */}
                  {modo === 'multas' && (
                    <div className="rounded-2xl border-2 border-amber-500/35 bg-amber-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 font-mono text-[11px] font-bold text-white">
                          2
                        </span>
                        <label htmlFor="caja-infraccion" className={label}>
                          SELECCIONAR INFRACCIÓN (ANEXO I — CUADROS 1 Y 2)
                        </label>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#294669]/50 dark:text-[#476EAE]" />
                        <input
                          id="caja-infraccion-filtro"
                          type="text"
                          value={filtroInfraccion}
                          onChange={(e) => setFiltroInfraccion(e.target.value)}
                          placeholder="Buscar por infracción, artículo o categoría (ej. inasistencia, Art. 41, EPP, ebriedad)…"
                          className={`${input} pl-9`}
                        />
                        {filtroInfraccion !== '' && (
                          <button
                            type="button"
                            onClick={() => setFiltroInfraccion('')}
                            aria-label="Limpiar búsqueda de infracciones"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#294669]/60 dark:text-slate-400 hover:bg-[#294669]/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <select
                        id="caja-infraccion"
                        value={infraccionSel?.clave || ''}
                        onChange={(e) => elegirInfraccion(e.target.value)}
                        className={`${input} mt-2`}
                      >
                        <option value="">— Seleccione la infracción —</option>
                        {opcionesInfraccion.map((grupo) => (
                          <optgroup key={grupo.nombre} label={grupo.nombre}>
                            {grupo.items.map((item) => (
                              <option key={item.clave} value={item.clave}>
                                {etiquetaInfraccion(item)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {filtroInfraccion.trim() !== '' && opcionesInfraccion.every((g) => g.items.length === 0) && (
                        <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                          Ninguna infracción coincide con «{filtroInfraccion.trim()}».
                        </p>
                      )}

                      {/* Escala general (Cuadro N.º 1): el monto sale del tramo. */}
                      {infraccionSel?.origen === 1 && infraccionSel.niveles.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1 font-mono text-[10px] text-amber-700 dark:text-amber-300">
                            <strong>{infraccionSel.tituloCorto}</strong> ·{' '}
                            {infraccionSel.articulo} — elija la reincidencia y el monto se ajusta:
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block px-2 py-0.5 rounded-lg font-display font-semibold text-[10px] uppercase bg-[#294669]/10 text-[#294669] dark:bg-[#294669]/45 dark:text-[#48B3AF] border border-[#294669]/20 dark:border-[#476EAE]/45">
                              {infraccionSel.categoria}
                            </span>
                            {infraccionSel.niveles.map((n) => (
                              <button
                                key={n.veces}
                                type="button"
                                onClick={() => elegirNivel(n)}
                                aria-pressed={nivelSel?.veces === n.veces}
                                className={`rounded-lg border px-2.5 py-1 font-mono text-[10px] transition-colors ${
                                  nivelSel?.veces === n.veces
                                    ? 'border-amber-500/60 bg-amber-500/20 text-[#0D0B61] dark:text-amber-300'
                                    : 'bg-slate-100 text-[#294669]/80 border-transparent hover:border-[#294669]/25 dark:bg-[#294669]/30 dark:text-slate-300'
                                }`}
                              >
                                {n.etiqueta}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="caja-monto-multa" className={label}>MONTO (Bs.)</label>
                          <input
                            id="caja-monto-multa"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={montoMulta}
                            onChange={(e) => setMontoMulta(e.target.value)}
                            className={input}
                          />
                        </div>
                        <div>
                          <label htmlFor="caja-fecha-infraccion" className={label}>FECHA DE LA INFRACCIÓN</label>
                          <input
                            id="caja-fecha-infraccion"
                            type="date"
                            value={fechaInfraccion}
                            onChange={(e) => setFechaInfraccion(e.target.value)}
                            className={input}
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={agregarMultaAlCarrito}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-500/50 bg-amber-500/15 px-3 py-2.5 font-display text-xs font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25"
                          >
                            <Plus className="w-4 h-4" /> Agregar multa
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {modo === 'aportes' && (
                    <div className="rounded-2xl border-2 border-emerald-500/35 bg-emerald-500/5 p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-mono text-[11px] font-bold text-white">
                          2
                        </span>
                        <label htmlFor="caja-aporte" className={label}>
                          SELECCIONAR APORTE (ANEXO II — ESCALA DE APORTES)
                        </label>
                      </div>
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#294669]/50 dark:text-[#476EAE]" />
                        <input
                          id="caja-aporte-filtro"
                          type="text"
                          value={filtroAporte}
                          onChange={(e) => setFiltroAporte(e.target.value)}
                          placeholder="Buscar aporte (ej. ordinario, fondo de accidentes, mantenimiento)…"
                          className={`${input} pl-9`}
                        />
                        {filtroAporte !== '' && (
                          <button
                            type="button"
                            onClick={() => setFiltroAporte('')}
                            aria-label="Limpiar búsqueda de aportes"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-[#294669]/60 dark:text-slate-400 hover:bg-[#294669]/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <select
                        id="caja-aporte"
                        value={aporteSel?.clave || ''}
                        onChange={(e) => elegirAporte(e.target.value)}
                        className={`${input} mt-2`}
                      >
                        <option value="">— Seleccione el aporte —</option>
                        {opcionesAporte.map((item) => (
                          <option key={item.clave} value={item.clave}>
                            {item.concepto} · {item.montoTexto}
                          </option>
                        ))}
                      </select>
                      {filtroAporte.trim() !== '' && opcionesAporte.length === 0 && (
                        <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                          Ningún aporte coincide con «{filtroAporte.trim()}».
                        </p>
                      )}

                      {aporteSel && (
                        <p className="mt-2 font-mono text-[10px] text-emerald-700 dark:text-emerald-300">
                          {aporteSel.detalle}
                          {aporteSel.variable
                            ? ' · importe orientativo: confirme el monto según la Resolución de Asamblea.'
                            : ''}
                        </p>
                      )}

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor="caja-monto-aporte" className={label}>MONTO (Bs.)</label>
                          <input
                            id="caja-monto-aporte"
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={montoAporte}
                            onChange={(e) => setMontoAporte(e.target.value)}
                            className={input}
                          />
                        </div>
                        <div className="flex items-end sm:col-span-2">
                          <button
                            type="button"
                            onClick={agregarAporteAlCarrito}
                            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 py-2.5 font-display text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25"
                          >
                            <Plus className="w-4 h-4" /> Agregar aporte
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Caja 3 — Carrito */}
                  <div className="rounded-2xl border border-[#294669]/20 dark:border-[#476EAE]/45 bg-[#294669]/5 dark:bg-[#294669]/20 p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <label className={label}>CARRITO DEL COBRO</label>
                      <span className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                        {carrito.length} ítem(s) · categoría {categoriaCarrito}
                      </span>
                    </div>

                    {carrito.length === 0 ? (
                      <p className="py-4 text-center font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
                        El carrito está vacío. Agregue multas y/o aportes con los botones de arriba.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="text-[#294669] dark:text-[#48B3AF] uppercase font-semibold text-[10px] tracking-wider">
                              <th className="p-2">Anexo</th>
                              <th className="p-2">Detalle</th>
                              <th className="p-2 text-right">Monto (Bs.)</th>
                              <th className="p-2" />
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#294669]/10 dark:divide-[#294669]/30">
                            {carrito.map((item) => (
                              <tr key={item.uid}>
                                <td className="p-2">
                                  <span
                                    className={`inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase border ${
                                      item.tipo === 'aporte'
                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                    }`}
                                  >
                                    {item.tipo === 'aporte' ? 'Anexo II' : 'Anexo I'}
                                  </span>
                                </td>
                                <td className="p-2 text-[#0D0B61] dark:text-slate-100">
                                  {item.tipo === 'aporte' ? item.concepto : item.infraccion}
                                  <span className="block font-mono text-[10px] text-[#294669]/60 dark:text-slate-500">
                                    {item.tipo === 'aporte' ? item.detalle : `${item.articulo} · ${item.categoria}`}
                                  </span>
                                </td>
                                <td className="p-2 text-right font-mono text-[#0D0B61] dark:text-slate-100 whitespace-nowrap">
                                  {formatearMonto(item.monto)}
                                </td>
                                <td className="p-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => quitarDelCarrito(item.uid)}
                                    aria-label="Quitar del carrito"
                                    className="p-1 rounded text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={2} className="p-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white text-right">
                                TOTAL
                              </td>
                              <td className="p-2 text-right font-display font-bold text-sm text-[#48B3AF] whitespace-nowrap">
                                {formatearMonto(totalCarrito)}
                              </td>
                              <td />
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}

                    {carrito.length > 0 && (
                      <p className="mt-2 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                        Concepto: {conceptoCarrito}
                      </p>
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
                      className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                    >
                      <Save className="w-4 h-4" />
                      {guardando ? 'Registrando…' : 'Registrar Cobro en Caja Chica'}
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
