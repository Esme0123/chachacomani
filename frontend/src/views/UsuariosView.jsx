import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, UserPlus, ShieldCheck, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROLES_SISTEMA, PERMISO_GESTIONAR_USUARIOS } from '../services/permisosService.js'
import * as usuariosService from '../services/usuariosService.js'

/** Etiquetas legibles de cada rol del sistema. */
const NOMBRES_ROL = {
  admin: 'Administrador',
  tesorero: 'Tesorero',
  caja_chica: 'Caja Chica',
  lectura: 'Socio (Lectura)',
}

/** Colores de la insignia de rol en la tabla. */
const ESTILO_ROL = {
  admin: 'bg-[#7B4BC9]/12 text-[#7B4BC9] dark:text-[#C4A0F0] border-[#7B4BC9]/30',
  tesorero: 'bg-[#48B3AF]/12 text-[#1B7F7C] dark:text-[#48B3AF] border-[#48B3AF]/30',
  caja_chica: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/30',
  lectura: 'bg-slate-500/12 text-slate-600 dark:text-slate-300 border-slate-400/30',
};

const formInicial = { nombre: '', correo: '', contrasena: '', rol: 'lectura' };

/**
 * ============================================================================
 *  CONSOLA DE USUARIOS Y ROLES — sólo Administrador
 * ============================================================================
 *  Requisito 4: el Administrador controla el sistema y gestiona los roles de
 *  los socios. Da de alta socios, les asigna el rol correspondiente y activa o
 *  desactiva cuentas.
 *
 *  El backend (`GET|POST|PUT /api/auth/usuarios`) exige `usuarios:gestionar`,
 *  exclusivo del Administrador, y protege al último administrador activo: no
 *  se puede degradar ni desactivar, de modo que la plataforma nunca queda sin
 *  quien la administre.
 * ============================================================================
 */
export default function UsuariosView({ dark, onNavigate, onToggleTheme }) {
  const { usuario, logout, puede } = useAuth();
  const autorizado = puede(PERMISO_GESTIONAR_USUARIOS);

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('all');
  const [formAbierto, setFormAbierto] = useState(false);
  const [form, setForm] = useState(formInicial);
  const [creando, setCreando] = useState(false);
  const [idEnProceso, setIdEnProceso] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const json = await usuariosService.listarUsuarios();
      setUsuarios(json.usuarios || []);
    } catch (err) {
      setError(err?.message || 'No se pudo cargar el padrón de socios.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    if (autorizado) cargar();
    else setCargando(false);
  }, [autorizado, cargar]);

  const crear = async (e) => {
    e.preventDefault();
    if (creando) return;
    setExito(null);
    setError(null);

    if (form.nombre.trim().length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())) {
      setError('Indique un correo electrónico válido.');
      return;
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,72}$/.test(form.contrasena)) {
      setError('La contraseña debe tener al menos 8 caracteres alfanuméricos e incluir una letra y un número.');
      return;
    }

    setCreando(true);
    try {
      const json = await usuariosService.crearUsuario({
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        contrasena: form.contrasena,
        rol: form.rol,
      });
      setExito(json?.mensaje || 'Socio creado correctamente.');
      setForm(formInicial);
      setFormAbierto(false);
      cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo crear el socio.');
    } finally {
      setCreando(false);
    }
  };

  /** Cambia el rol de un socio; el backend impide degradar al último admin. */
  const cambiarRol = async (socio, rol) => {
    if (socio.rol === rol) return;
    setIdEnProceso(socio.id);
    setExito(null);
    setError(null);
    try {
      const json = await usuariosService.actualizarUsuario(socio.id, { rol });
      setExito(json?.mensaje || 'Rol actualizado correctamente.');
      cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo actualizar el rol.');
    } finally {
      setIdEnProceso(null);
    }
  };

  /** Activa o desactiva la cuenta. */
  const alternarActivo = async (socio) => {
    setIdEnProceso(socio.id);
    setExito(null);
    setError(null);
    try {
      const json = await usuariosService.actualizarUsuario(socio.id, { activo: !socio.activo });
      setExito(json?.mensaje || (socio.activo ? 'Cuenta desactivada.' : 'Cuenta activada.'));
      cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar el estado de la cuenta.');
    } finally {
      setIdEnProceso(null);
    }
  };

  // Filtros de la tabla
  const filtrados = usuarios.filter((u) => {
    if (filtroRol !== 'all' && u.rol !== filtroRol) return false;
    const objetivo = busqueda.trim().toLowerCase();
    if (!objetivo) return true;
    return u.nombre.toLowerCase().includes(objetivo) || u.correo.toLowerCase().includes(objetivo);
  });

  const input =
    'w-full rounded-lg px-3 py-2.5 font-mono text-sm text-[#0D0B61] dark:text-white bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 focus:outline-none focus:border-[#48B3AF]';
  const label =
    'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5';

  if (!autorizado) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />
        <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-16 space-y-4 text-center">
          <ShieldCheck className="w-12 h-12 mx-auto text-rose-500" />
          <h1 className="font-display font-bold text-xl text-[#0D0B61] dark:text-white">
            Acceso restringido
          </h1>
          <p className="font-mono text-xs text-[#294669]/80 dark:text-slate-400">
            La gestión de socios y roles es exclusiva del Administrador del Sistema.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="mt-4 inline-flex items-center gap-1.5 font-display font-semibold text-sm text-[#294669] dark:text-[#48B3AF] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 10%, rgba(123,75,201,.14), transparent 55%)' }}
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

          <div>
            <h1 className="font-display font-bold text-xl md:text-2xl text-[#0D0B61] dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#7B4BC9]" />
              Gestión de Socios y Roles
            </h1>
            <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
              Consola exclusiva del Administrador. Las sesiones de los socios afectados se cierran al
              instante.
            </p>
          </div>

          {error && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}
          {exito && (
            <p role="status" className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> {exito}
            </p>
          )}

          {/* Alta de socio */}
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
              <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#48B3AF]" /> Registrar nuevo socio
              </h2>
              <span className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                {formAbierto ? 'Ocultar ▲' : 'Mostrar ▼'}
              </span>
            </button>

            {formAbierto && (
              <form onSubmit={crear} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="u-nombre" className={label}>NOMBRE COMPLETO</label>
                  <input
                    id="u-nombre"
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm(f => ({ ...f, nombre: e.target.value }))}
                    className={input}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="u-correo" className={label}>CORREO ELECTRÓNICO</label>
                  <input
                    id="u-correo"
                    type="email"
                    value={form.correo}
                    onChange={(e) => setForm(f => ({ ...f, correo: e.target.value }))}
                    className={input}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="u-clave" className={label}>CONTRASEÑA PROVISIONAL</label>
                  <input
                    id="u-clave"
                    type="text"
                    value={form.contrasena}
                    onChange={(e) => setForm(f => ({ ...f, contrasena: e.target.value }))}
                    placeholder="Mínimo 8, con letra y número"
                    className={input}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="u-rol" className={label}>ROL</label>
                  <select
                    id="u-rol"
                    value={form.rol}
                    onChange={(e) => setForm(f => ({ ...f, rol: e.target.value }))}
                    className={input}
                  >
                    {ROLES_SISTEMA.map((r) => (
                      <option key={r} value={r}>{NOMBRES_ROL[r] || r}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={creando}
                    className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg,#7B4BC9,#48B3AF)' }}
                  >
                    <UserPlus className="w-4 h-4" />
                    {creando ? 'Creando…' : 'Crear Socio'}
                  </button>
                </div>
              </form>
            )}
          </motion.section>

          {/* Listado */}
          <section className="rounded-2xl border border-[#294669]/15 dark:border-[#294669]/40 bg-white/92 dark:bg-[#0D0B61]/85 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#294669]/15 dark:border-[#294669]/35 flex flex-wrap items-center gap-3">
              <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                Padrón de socios
                <span className="ml-2 font-mono text-[11px] font-normal text-[#294669]/60 dark:text-[#476EAE]">
                  ({filtrados.length}/{usuarios.length})
                </span>
              </h2>
              <div className="flex-1" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar socio…"
                aria-label="Buscar socio"
                className="rounded-lg px-3 py-1.5 font-mono text-xs bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 w-full sm:w-56"
              />
              <select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                aria-label="Filtrar por rol"
                className="rounded-lg px-3 py-1.5 font-mono text-xs bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55"
              >
                <option value="all">Todos los roles</option>
                {ROLES_SISTEMA.map((r) => (
                  <option key={r} value={r}>{NOMBRES_ROL[r] || r}</option>
                ))}
              </select>
            </div>

            {cargando ? (
              <p className="px-5 py-10 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
                Cargando socios…
              </p>
            ) : filtrados.length === 0 ? (
              <p className="px-5 py-10 text-center font-mono text-xs text-[#294669]/70 dark:text-[#476EAE]">
                No hay socios que coincidan con el filtro.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#294669]/8 dark:bg-[#294669]/35 text-[#294669] dark:text-[#48B3AF] uppercase font-semibold text-[10px] tracking-wider">
                      <th className="p-3.5">Socio</th>
                      <th className="p-3.5">Rol</th>
                      <th className="p-3.5 text-center">Multas</th>
                      <th className="p-3.5 text-center">Estado</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#294669]/10 dark:divide-[#294669]/25">
                    {filtrados.map((u) => {
                      const procesando = idEnProceso === u.id;
                      const esYo = usuario && u.id === usuario.id;
                      return (
                        <tr key={u.id} className={`hover:bg-[#294669]/5 dark:hover:bg-[#294669]/20 ${!u.activo ? 'opacity-55' : ''}`}>
                          <td className="p-3.5">
                            <p className="font-semibold text-[#0D0B61] dark:text-slate-100">
                              {u.nombre}
                              {esYo && (
                                <span className="ml-1.5 font-mono text-[9px] uppercase text-[#48B3AF]">(usted)</span>
                              )}
                            </p>
                            <p className="font-mono text-[10px] text-[#294669]/60 dark:text-slate-500">{u.correo}</p>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={u.rol}
                              onChange={(e) => cambiarRol(u, e.target.value)}
                              disabled={procesando}
                              aria-label={`Rol de ${u.nombre}`}
                              className={`rounded-lg px-2 py-1 font-mono text-[11px] border bg-transparent disabled:opacity-50 ${ESTILO_ROL[u.rol] || ESTILO_ROL.lectura}`}
                            >
                              {ROLES_SISTEMA.map((r) => (
                                <option key={r} value={r}>{NOMBRES_ROL[r] || r}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3.5 text-center font-mono text-[#294669] dark:text-slate-300">
                            {u.totalMultas ?? 0}
                            {u.multasPendientes > 0 && (
                              <span className="block text-[9px] text-rose-500">
                                {u.multasPendientes} pendiente{u.multasPendientes === 1 ? '' : 's'}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                                u.activo
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-400/25'
                              }`}
                            >
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => alternarActivo(u)}
                              disabled={procesando}
                              className={`font-mono text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1.5 rounded-lg border disabled:opacity-50 transition-colors ${
                                u.activo
                                  ? 'border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                                  : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                              }`}
                            >
                              {u.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
