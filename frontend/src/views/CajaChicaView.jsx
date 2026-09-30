import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Save, AlertTriangle, LogOut, Scale, Search, X, Check, Sparkles } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PERMISO_GESTIONAR_CAJA_CHICA, PERMISO_GESTIONAR_MULTAS } from '../services/permisosService.js'
import * as cajaChicaService from '../services/cajaChicaService.js'
import * as multasService from '../services/multasService.js'
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

/** Anexo I del documento: contiene los Cuadros N.º 1 y N.º 2 de multas. */
const ANEXO_I = ANEXOS_DATA.find((anexo) => anexo?.tablas?.some((t) => t.id === 'cuadro-2')) || null;

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
 *  FLUJO GUIADO DE REGISTRO (dos pestañas)
 *  --------------------------------------
 *  El formulario arranca en dos pestañas: «💸 Gastos / Egresos Generales» (el
 *  formulario tradicional: tipo, categoría, concepto libre, monto y fecha) y
 *  «⚖️ Registrar Multa / Cobro a Socio».
 *
 *  En la pestaña de multas no se elige ni tipo ni categoría: quedan fijados en
 *  «ingreso» y «Multas / Sanciones», y aparecen dos cajas obligatorias —1. el
 *  socio, en lista buscable, y 2. la infracción del Anexo I con los Cuadros N.º 1
 *  y 2 agrupados— más el monto y el concepto autocompletados. Al guardar,
 *  `POST /api/multas` con `cobrar: true` crea la sanción YA PAGADA y su ingreso en
 *  caja chica en la misma transacción.
 *
 *  El Tesorero no tiene `caja_chica:gestionar`, pero sí `multas:gestionar`: su
 *  pestaña de gastos aparece bloqueada y el formulario trabaja siempre en modo
 *  sanción.
 *
 * @param {object}  [props.cobroInicial] Cobro preseleccionado al llegar desde
 *   el Anexo I («Ir a Caja Chica / Cobrar Multa»).
 */
export default function CajaChicaView({ dark, onNavigate, onToggleTheme, cobroInicial, onCobroConsumido }) {
  const { usuario, logout, puede } = useAuth();
  const puedeRegistrarMovimientos = puede(PERMISO_GESTIONAR_CAJA_CHICA);
  const puedeCobrarMultas = puede(PERMISO_GESTIONAR_MULTAS);
  // El Tesorero entra sólo para cobrar multas: sin `caja_chica:gestionar` su
  // pestaña de gastos queda bloqueada y el formulario trabaja en modo sanción.
  const soloMultas = !puedeRegistrarMovimientos && puedeCobrarMultas;

  const [mes, setMes] = useState(mesActual());
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [formAbierto, setFormAbierto] = useState(true);
  const [form, setForm] = useState({
    tipo: 'egreso',
    concepto: '',
    categoria: 'Otros',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    fechaInfraccion: new Date().toISOString().slice(0, 10),
    socioId: '',
    observaciones: '',
  });
  const [modoMulta, setModoMulta] = useState(false);
  const [conceptoManual, setConceptoManual] = useState(false);
  const [socios, setSocios] = useState([]);
  const [cargandoSocios, setCargandoSocios] = useState(false);
  const [filtroSocio, setFiltroSocio] = useState('');
  const [filtroInfraccion, setFiltroInfraccion] = useState('');
  const [infraccionSel, setInfraccionSel] = useState(null);
  const [nivelSel, setNivelSel] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  // Catálogo del Anexo I y padrón de socios: ambos hacen falta para el conmutador
  // de cobro. El padrón llega en la respuesta de `GET /api/multas`, que sólo
  // devuelve `socios` a quien tiene `multas:gestionar`.
  const catalogo = useMemo(() => multasService.catalogoInfracciones(ANEXO_I), []);

  useEffect(() => {
    if (!puedeCobrarMultas) return;
    let vivo = true;
    (async () => {
      setCargandoSocios(true);
      try {
        const json = await multasService.listarMultas();
        if (vivo && Array.isArray(json?.socios)) setSocios(json.socios);
      } catch (err) {
        console.error('No se pudo cargar el padrón de socios:', err);
      } finally {
        if (vivo) setCargandoSocios(false);
      }
    })();
    return () => { vivo = false; };
  }, [puedeCobrarMultas]);

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
  /* Cobro de multas                                                        */
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
    () => socios.find((s) => String(s.id) === String(form.socioId)) || null,
    [socios, form.socioId]
  );

  /** Concepto del ingreso con el formato de Tesorería. */
  const conceptoSugerido = useMemo(() => {
    if (!infraccionSel) return '';
    return multasService.conceptoCobroMulta(infraccionSel, socioElegido?.nombre || '');
  }, [infraccionSel, socioElegido]);

  const elegirSocio = (valor) => {
    setForm((f) => {
      const nombre = socios.find((s) => String(s.id) === String(valor))?.nombre || '';
      return {
        ...f,
        socioId: valor,
        concepto: conceptoManual ? f.concepto : multasService.conceptoCobroMulta(infraccionSel, nombre),
      };
    });
  };

  /** Elige una infracción del catálogo (Cuadros N.º 1 y 2). */
  const elegirInfraccion = (clave) => {
    const opcion = catalogo.find((i) => i.clave === clave) || null;
    if (!opcion) {
      setInfraccionSel(null);
      setNivelSel(null);
      return;
    }
    setFiltroInfraccion('');
    const nivelInicial = opcion.origen === 1 ? opcion.niveles?.[0] || null : null;
    setForm((f) => ({
      ...f,
      monto: String(multasService.montoDeOpcion(opcion, nivelInicial)),
      concepto: conceptoManual
        ? f.concepto
        : multasService.conceptoCobroMulta(opcion, socioElegido?.nombre || ''),
    }));
    setInfraccionSel(opcion);
    setNivelSel(nivelInicial);
  };

  /** Fija el monto según el tramo de la escala general (Cuadro N.º 1). */
  const elegirNivel = (nivel) => {
    setNivelSel(nivel);
    setForm((f) => ({ ...f, monto: String(multasService.montoDeOpcion(infraccionSel, nivel)) }));
  };

  /**
   * Etiqueta de una opción del desplegable de infracciones: artículo, resumen
   * corto y monto, para que el Tesorero ubique la falta sin abrir el reglamento.
   * En el Cuadro N.º 1 el monto depende de la reincidencia, así que se muestra
   * la escala completa; en el N.º 2, el monto propio de la infracción.
   */
  const etiquetaInfraccion = (item) => {
    if (item.origen === 1) {
      const escala = item.niveles.map((n) => n.monto).join(' / ');
      return `${item.tituloCorto} · ${item.articulo} · escala ${escala} Bs.`;
    }
    const monto = item.monto > 0 ? `${item.monto} Bs.` : 'sin multa pecuniaria';
    return `${item.articulo} · ${item.tituloCorto} · ${monto}`;
  };

  /** Limpia los datos de sanción para no arrastrarlos al modo de gastos. */
  const limpiarCamposMulta = () => {
    setInfraccionSel(null);
    setNivelSel(null);
    setConceptoManual(false);
    setFiltroSocio('');
    setFiltroInfraccion('');
    setForm((f) => ({ ...f, concepto: '', monto: '', socioId: '' }));
  };

  const activarModoMulta = () => {
    setModoMulta(true);
    limpiarCamposMulta();
    setForm((f) => ({ ...f, tipo: 'ingreso', categoria: cajaChicaService.CATEGORIA_COBRO_MULTA }));
    setFormAbierto(true);
  };

  /** Vuelve a la pestaña de gastos: tipo, categoría y concepto libres. */
  const irAGastos = () => {
    if (!puedeRegistrarMovimientos) return;
    setModoMulta(false);
    limpiarCamposMulta();
    setForm((f) => ({ ...f, tipo: 'egreso', categoria: 'Otros' }));
  };

  const cambiarTipo = (valor) => {
    // Al salir del flujo de multa la categoría vuelve a «Otros»: si se dejara
    // «Multas / Sanciones», un movimiento corriente se asentaría bajo la categoría
    // de las multas y falsearía el resumen de cobros.
    setForm((f) => {
      const mantieneMulta = valor === 'ingreso' && f.categoria === cajaChicaService.CATEGORIA_COBRO_MULTA;
      return { ...f, tipo: valor, categoria: mantieneMulta ? f.categoria : 'Otros' };
    });
    if (valor !== 'ingreso') setModoMulta(false);
  };

  const cambiarCategoria = (valor) => {
    setForm((f) => ({ ...f, categoria: valor }));
    if (valor === cajaChicaService.CATEGORIA_COBRO_MULTA) {
      // Ingreso por multa: es el flujo del conmutador, se activa solo.
      if (form.tipo === 'ingreso') activarModoMulta();
    } else {
      setModoMulta(false);
    }
  };

  /**
   * Llegada desde el Anexo I con la sanción preseleccionada: se abre el
   * formulario en modo cobro con los datos ya colocados.
   */
  useEffect(() => {
    if (!cobroInicial) return;
    activarModoMulta();
    setFiltroInfraccion('');
    setInfraccionSel(null);
    setNivelSel(null);

    const opcion =
      catalogo.find((i) => i.articulo === cobroInicial.articulo) ||
      catalogo.find((i) => i.infraccion === cobroInicial.infraccion) ||
      null;
    const nivel = opcion?.origen === 1 ? opcion.niveles?.[0] || null : null;

    setInfraccionSel(opcion);
    setNivelSel(nivel);
    setConceptoManual(false);
    setForm((f) => ({
      ...f,
      tipo: 'ingreso',
      categoria: cajaChicaService.CATEGORIA_COBRO_MULTA,
      socioId: cobroInicial.socioId != null ? String(cobroInicial.socioId) : f.socioId,
      monto: String(cobroInicial.monto ?? (opcion ? multasService.montoDeOpcion(opcion, nivel) : '')),
      concepto: cobroInicial.concepto || multasService.conceptoCobroMulta(opcion, cobroInicial.socioNombre || ''),
      observaciones: cobroInicial.observaciones || '',
    }));
    onCobroConsumido?.();
    // Sólo se aplica cuando llega un cobro nuevo desde el Anexo I.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cobroInicial]);

  const registrar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setExito(null);
    setError(null);

    // Validación guiada: primero las cajas obligatorias del flujo de multa y
    // después los datos del movimiento. El formulario usa `noValidate` para que
    // estos mensajes (en español y señalando la caja que falta) reemplazen a los
    // del navegador.
    if (cobrarMultas) {
      if (!form.socioId) {
        setError('Caja 1 · Seleccione el socio al que se cobra la multa.');
        return;
      }
      if (!infraccionSel) {
        setError('Caja 2 · Seleccione la infracción del Anexo I (Cuadro N.º 1 o N.º 2).');
        return;
      }
      if (!form.fechaInfraccion) {
        setError('Indique la fecha en que ocurrió la infracción.');
        return;
      }
    }
    if (!form.concepto.trim()) {
      setError(
        cobrarMultas
          ? 'El concepto se genera solo al elegir la infracción y el socio; también puede escribirlo.'
          : 'Indique el concepto del movimiento.'
      );
      return;
    }
    if (form.monto === '' || Number(form.monto) <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }
    if (!form.fecha) {
      setError(cobrarMultas ? 'Indique la fecha de cobro.' : 'Indique la fecha del movimiento.');
      return;
    }

    setGuardando(true);
    try {
      if (cobrarMultas) {
        // Una sola llamada: la multa nace PAGADA y el ingreso entra en caja
        // chica en la misma transacción (ver backend/api/multas.php).
        const json = await multasService.registrarMulta({
          socioId: Number(form.socioId),
          infraccion: infraccionSel.infraccion,
          articulo: infraccionSel.articulo,
          categoria: infraccionSel.categoria,
          monto: Number(form.monto),
          fechaInfraccion: form.fechaInfraccion || form.fecha,
          medida: infraccionSel.medida,
          observaciones: form.observaciones,
          cobrar: true,
          fechaCobro: form.fecha,
          conceptoCobro: form.concepto.trim(),
        });
        setExito(json?.mensaje || 'Multa registrada y cobro asentado en Caja Chica.');
      } else {
        const json = await cajaChicaService.registrarMovimiento({
          ...form,
          concepto: form.concepto.trim(),
          monto: Number(form.monto),
        });
        setExito(json?.mensaje || 'Movimiento registrado correctamente.');
      }

      setForm((f) => ({
        ...f,
        concepto: '',
        monto: '',
        socioId: '',
        observaciones: '',
      }));
      setInfraccionSel(null);
      setNivelSel(null);
      setConceptoManual(false);
      cargar(mes);
    } catch (err) {
      setError(err?.message || 'No se pudo registrar el movimiento.');
    } finally {
      setGuardando(false);
    }
  };

  const totales = datos?.totales;
  const movimientos = datos?.movimientos || [];

  // Con `soloMultas` (el Tesorero) el formulario SIEMPRE cobra multas: no tiene
  // `caja_chica:gestionar`, así que el único envío posible es el del Anexo I.
  const cobrarMultas = soloMultas || modoMulta;

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
                Registro y consulta de ingresos y egresos menores, incluido el cobro de multas del Anexo I.
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
          {puedeRegistrarMovimientos || puedeCobrarMultas ? (
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

              {/* Pestañas de modo de registro. El Tesorero sólo puede cobrar
                  multas, así que su pestaña de gastos aparece bloqueada. */}
              <div role="tablist" aria-label="Modo de registro" className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!cobrarMultas}
                  disabled={!puedeRegistrarMovimientos}
                  onClick={irAGastos}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors disabled:opacity-55 disabled:cursor-not-allowed ${
                    !cobrarMultas
                      ? 'border-[#294669]/45 bg-[#294669]/10 dark:border-[#48B3AF]/45 dark:bg-[#294669]/35'
                      : 'border-[#294669]/15 dark:border-[#476EAE]/35 hover:bg-[#294669]/5'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                    <TrendingDown className="w-4 h-4 text-[#294669] dark:text-[#48B3AF]" />
                    💸 Gastos / Egresos Generales
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-[#294669]/75 dark:text-[#476EAE]">
                    {puedeRegistrarMovimientos
                      ? 'Tipo, categoría, concepto libre y monto'
                      : 'Su rol no habilita el registro de gastos'}
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={cobrarMultas}
                  onClick={activarModoMulta}
                  className={`text-left rounded-xl border-2 px-3 py-2.5 transition-colors ${
                    cobrarMultas
                      ? 'border-amber-500/60 bg-amber-500/15'
                      : 'border-amber-500/25 dark:border-amber-500/30 hover:bg-amber-500/8'
                  }`}
                >
                  <span className="flex items-center gap-2 font-display font-bold text-xs text-[#0D0B61] dark:text-white">
                    <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ⚖️ Registrar Multa / Cobro a Socio
                  </span>
                  <span className="mt-0.5 block font-mono text-[10px] text-amber-700/85 dark:text-amber-300/85">
                    Socio + infracción del Anexo I, cobro en un solo paso
                  </span>
                </button>
              </div>

              {formAbierto && (
                <form onSubmit={registrar} noValidate className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!cobrarMultas && (
                    <div>
                      <label htmlFor="caja-tipo" className={label}>TIPO</label>
                      <select
                        id="caja-tipo"
                        value={form.tipo}
                        onChange={(e) => cambiarTipo(e.target.value)}
                        className={input}
                      >
                        <option value="egreso">Egreso</option>
                        <option value="ingreso">Ingreso</option>
                      </select>
                    </div>
                  )}
                  {!cobrarMultas && (
                    <div>
                      <label htmlFor="caja-categoria" className={label}>CATEGORÍA</label>
                      <select
                        id="caja-categoria"
                        value={form.categoria}
                        onChange={(e) => cambiarCategoria(e.target.value)}
                        className={input}
                      >
                        {cajaChicaService.CATEGORIAS_CAJA.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {cobrarMultas && (
                    <>
                      <div className="sm:col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/8 px-3 py-2 font-mono text-[11px] text-amber-700 dark:text-amber-300">
                        Cobro del Anexo I: el tipo queda en <strong>Ingreso</strong> y la categoría en{' '}
                        <strong>{cajaChicaService.CATEGORIA_COBRO_MULTA}</strong>. Al guardar, la
                        sanción queda <strong>PAGADA</strong> y este ingreso entra en Caja Chica en la
                        misma transacción.
                      </div>

                      {/* Caja 1 — Socio (obligatorio) */}
                      <div className="sm:col-span-2 rounded-2xl border-2 border-amber-500/35 bg-amber-500/5 p-4">
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

                      {/* Caja 2 — Infracción del Anexo I (obligatorio) */}
                      <div className="sm:col-span-2 rounded-2xl border-2 border-amber-500/35 bg-amber-500/5 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 font-mono text-[11px] font-bold text-white">
                            2
                          </span>
                          <label htmlFor="caja-infraccion" className={label}>
                            SELECCIONAR INFRACCIÓN (ANEXO I — CUADROS 1 Y 2)
                          </label>
                          <span className="font-mono text-[10px] text-amber-700 dark:text-amber-300">
                            obligatorio
                          </span>
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
                          required
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
                      </div>
                    </>
                  )}

                  {/* Autocompletado: al elegir la infracción, monto y fecha de cobro */}
                  {cobrarMultas && (
                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#294669]/20 dark:border-[#476EAE]/45 bg-[#294669]/5 dark:bg-[#294669]/20 px-3 py-3">
                      <div>
                        <label htmlFor="caja-monto" className={label}>MONTO (Bs.)</label>
                        <input
                          id="caja-monto"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.monto}
                          onChange={(e) => setForm(f => ({ ...f, monto: e.target.value }))}
                          className={input}
                          required
                        />
                        {infraccionSel?.origen === 1 && (
                          <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                            Autocompletado con el monto del cuadro; puede editarlo si la resolución
                            modifica la sanción.
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="caja-fecha" className={label}>FECHA DE COBRO</label>
                        <input
                          id="caja-fecha"
                          type="date"
                          value={form.fecha}
                          onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))}
                          className={input}
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label htmlFor="caja-concepto" className={label}>CONCEPTO</label>
                    <div className="flex items-center gap-2">
                      <input
                        id="caja-concepto"
                        type="text"
                        value={form.concepto}
                        onChange={(e) => {
                          setConceptoManual(true);
                          setForm(f => ({ ...f, concepto: e.target.value }));
                        }}
                        placeholder={
                          cobrarMultas
                            ? 'Se genera solo: Multa Art. 41 (Inasistencia Asamblea) - Socio: Juan Pérez'
                            : 'Ej. Compra de combustible para la perforación'
                        }
                        className={input}
                        required
                      />
                      {cobrarMultas && infraccionSel && (
                        <button
                          type="button"
                          onClick={() => {
                            setConceptoManual(false);
                            setForm(f => ({
                              ...f,
                              concepto: multasService.conceptoCobroMulta(infraccionSel, socioElegido?.nombre || ''),
                            }));
                          }}
                          aria-label="Regenerar el concepto"
                          title="Regenerar el concepto"
                          className="shrink-0 p-2 rounded-lg border border-[#294669]/25 dark:border-[#476EAE]/55 text-[#294669] dark:text-[#48B3AF] hover:bg-[#294669]/10"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {cobrarMultas && conceptoSugerido && form.concepto !== conceptoSugerido && (
                      <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                        Sugerido: {conceptoSugerido}
                      </p>
                    )}
                  </div>
                  {!cobrarMultas && (
                    <>
                      <div>
                        <label htmlFor="caja-monto" className={label}>MONTO (Bs.)</label>
                        <input
                          id="caja-monto"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={form.monto}
                          onChange={(e) => setForm(f => ({ ...f, monto: e.target.value }))}
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
                          onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))}
                          className={input}
                          required
                        />
                      </div>
                    </>
                  )}
                  {cobrarMultas && (
                    <div className="sm:col-span-2">
                      <label htmlFor="caja-fecha-infraccion" className={label}>
                        FECHA DE LA INFRACCIÓN
                      </label>
                      <input
                        id="caja-fecha-infraccion"
                        type="date"
                        value={form.fechaInfraccion}
                        onChange={(e) => setForm(f => ({ ...f, fechaInfraccion: e.target.value }))}
                        className={input}
                        required
                      />
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <label htmlFor="caja-obs" className={label}>OBSERVACIONES</label>
                    <input
                      id="caja-obs"
                      type="text"
                      value={form.observaciones}
                      onChange={(e) => setForm(f => ({ ...f, observaciones: e.target.value }))}
                      className={input}
                    />
                  </div>
                  <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
                      style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
                    >
                      <Save className="w-4 h-4" />
                      {guardando
                        ? 'Registrando…'
                        : cobrarMultas
                          ? 'Cobrar Multa y Registrar Ingreso'
                          : 'Registrar Movimiento'}
                    </button>
                    {cobrarMultas && (
                      <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                        Un solo envío: la multa queda PAGADA y el ingreso entra en Caja Chica.
                      </p>
                    )}
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
