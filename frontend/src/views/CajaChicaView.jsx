import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Save, AlertTriangle, LogOut } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { PERMISO_GESTIONAR_CAJA_CHICA } from '../services/permisosService.js'
import * as cajaChicaService from '../services/cajaChicaService.js'

function formatearMonto(monto) {
  const numero = Number(monto);
  if (!Number.isFinite(numero)) return '0,00';
  return numero.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Periodo por defecto: el mes en curso, "YYYY-MM". */
function mesActual() {
  return new Date().toISOString().slice(0, 7);
}

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
 */
export default function CajaChicaView({ dark, onNavigate, onToggleTheme }) {
  const { usuario, logout, puede } = useAuth();
  const puedeRegistrar = puede(PERMISO_GESTIONAR_CAJA_CHICA);

  const [mes, setMes] = useState(mesActual());
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState({
    tipo: 'egreso',
    concepto: '',
    categoria: 'Otros',
    monto: '',
    fecha: new Date().toISOString().slice(0, 10),
    observaciones: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

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

  const registrar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setExito(null);

    if (!form.concepto.trim()) {
      setError('Indique el concepto del movimiento.');
      return;
    }
    if (form.monto === '' || Number(form.monto) <= 0) {
      setError('El monto debe ser mayor que cero.');
      return;
    }

    setGuardando(true);
    setError(null);
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
  };

  const totales = datos?.totales;
  const movimientos = datos?.movimientos || [];

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
                Registro y consulta de ingresos y egresos menores.
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
          {puedeRegistrar ? (
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

              {formAbierto && (
                <form onSubmit={registrar} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="caja-tipo" className={label}>TIPO</label>
                    <select
                      id="caja-tipo"
                      value={form.tipo}
                      onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}
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
                      onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
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
                      onChange={(e) => setForm(f => ({ ...f, concepto: e.target.value }))}
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
            </motion.section>
          ) : (
            <p className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 font-mono text-[11px] text-amber-600 dark:text-amber-400">
              Consulta en modo lectura: su rol permite consultar la caja chica pero no registrar
              movimientos.
            </p>
          )}

          {/* Movimientos */}
          <section className="rounded-2xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/92 dark:bg-[#0D0B61]/85 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#294669]/15 dark:border-[#294669]/35">
              <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                Movimientos del periodo
              </h2>
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
                        <td className="p-3.5 text-[#294669]/80 dark:text-slate-400">{m.categoria}</td>
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
