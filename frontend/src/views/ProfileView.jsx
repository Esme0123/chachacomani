import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  UserCog, KeyRound, Gavel, Save, Check, AlertTriangle, LogOut, ArrowLeft, ShieldAlert,
  Receipt,
} from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import MisDeudas from '../components/MisDeudas.jsx'
import RevisarMultas from '../components/RevisarMultas.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { validarContrasena } from '../services/authService.js'

/* -------------------------------------------------------------------------- */
/* Presentación de datos                                                       */
/* -------------------------------------------------------------------------- */

const ETIQUETA_ESTADO = {
  pendiente: { texto: 'Pendiente', clases: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  pagada: { texto: 'Pagada', clases: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  anulada: { texto: 'Anulada', clases: 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30' },
};

const ETIQUETA_CATEGORIA = {
  Leve: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Grave: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Muy grave': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'Falta gravísima': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
};

/** Formatea una fecha de MySQL ("2026-09-25 10:00:00") como "25/09/2026". */
function formatearFecha(fecha) {
  if (!fecha) return '—';
  const solo = String(fecha).slice(0, 10);
  const [anio, mes, dia] = solo.split('-');
  return dia && mes && anio ? `${dia}/${mes}/${anio}` : solo;
}

/** Formatea un monto en bolivianos: "150.00" -> "Bs. 150,00". */
function formatearMonto(monto) {
  const numero = Number(monto);
  if (!Number.isFinite(numero)) return 'Bs. 0,00';
  return `Bs. ${numero.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const INPUT_PERFIL =
  'w-full rounded-lg px-4 py-2.5 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55 disabled:opacity-60'
const LABEL = 'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5'

/* -------------------------------------------------------------------------- */
/* Vista                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Perfil del socio (especificación 1 y 4).
 *
 * Tres secciones:
 *   · Perfil     -> ver / editar nombre y correo.
 *   · Contraseña -> cambiar la contraseña (valida la actual y la nueva, 8+ alfanuméricos).
 *   · Multas     -> tabla del historial de sanciones: infracción, artículo,
 *                   fecha, monto en Bs. y estado de pago.
 *   · Deudas     -> multas y aportes pendientes con reporte de pago y comprobante.
 *
 * @param {{dark: boolean, onNavigate: Function, onToggleTheme: Function,
 *          onIrAPerfil?: Function,
 *          seccion?: 'perfil'|'password'|'multas'|'deudas',
 *          onCambiarSeccion?: Function}} props
 */
export default function ProfileView({
  dark,
  onNavigate,
  onToggleTheme,
  onIrAPerfil,
  seccion: seccionInicial = 'perfil',
  onCambiarSeccion,
}) {
  const { usuario, nombreRol, actualizarPerfil, logout } = useAuth();
  const [seccion, setSeccion] = useState(seccionInicial);

  // Si el menú de perfil pide otra sección, se sincroniza.
  useEffect(() => {
    setSeccion(seccionInicial);
  }, [seccionInicial]);

  const cambiarSeccion = (nueva) => {
    setSeccion(nueva);
    if (onCambiarSeccion) onCambiarSeccion(nueva);
  };

  const tabs = [
    { clave: 'perfil', etiqueta: 'Datos de Perfil', icono: UserCog },
    { clave: 'password', etiqueta: 'Cambiar Contraseña', icono: KeyRound },
    { clave: 'multas', etiqueta: 'Revisar mis Multas', icono: Gavel },
    { clave: 'deudas', etiqueta: 'Mis Deudas y Aportes', icono: Receipt },
  ];

  if (!usuario) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0D0B61]">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <p className="font-display font-semibold text-[#0D0B61] dark:text-white">
            Debe iniciar sesión para ver su perfil.
          </p>
          <button
            onClick={() => onNavigate('login')}
            className="font-display font-semibold text-sm px-5 py-2 rounded-md text-white"
            style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
          >
            Ir al Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 10%, rgba(72,179,175,.14), transparent 55%), radial-gradient(circle at 10% 90%, rgba(228,211,41,.12), transparent 50%)' }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} onIrAPerfil={onIrAPerfil} />

        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 space-y-6">
          {/* Cabecera del perfil */}
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

          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 shrink-0 rounded-full flex items-center justify-center font-display font-bold text-2xl text-[#0D0B61]"
              style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
            >
              {usuario.nombre.trim().charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-bold text-xl md:text-2xl text-[#0D0B61] dark:text-white truncate">
                {usuario.nombre}
              </h1>
              <p className="font-mono text-xs text-[#294669] dark:text-[#476EAE] truncate">
                {usuario.correo}
              </p>
              <span className="inline-block mt-1 font-mono text-[10px] px-2 py-0.5 rounded border border-[#48B3AF]/50 text-[#48B3AF]">
                {nombreRol}
              </span>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-[#294669]/40 p-1 rounded-xl">
            {tabs.map((tab) => {
              const Icono = tab.icono;
              const activo = seccion === tab.clave;
              return (
                <button
                  key={tab.clave}
                  onClick={() => cambiarSeccion(tab.clave)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-display font-semibold text-sm transition-colors ${
                    activo
                      ? 'bg-[#0D0B61] dark:bg-[#48B3AF] text-white dark:text-[#0D0B61]'
                      : 'text-[#294669] dark:text-[#476EAE] hover:bg-[#294669]/10'
                  }`}
                >
                  <Icono className="w-4 h-4" />
                  {tab.etiqueta}
                </button>
              );
            })}
          </div>

          {seccion === 'perfil' && (
            <SeccionPerfil
              usuario={usuario}
              nombreRol={nombreRol}
              onGuardar={actualizarPerfil}
            />
          )}
          {seccion === 'password' && <SeccionPassword />}
          {seccion === 'multas' && <RevisarMultas />}
          {seccion === 'deudas' && <MisDeudas />}
        </main>

        <Footer />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Datos de perfil                                                          */
/* -------------------------------------------------------------------------- */

function SeccionPerfil({ usuario, nombreRol, onGuardar }) {
  const [nombre, setNombre] = useState(usuario.nombre);
  const [correo, setCorreo] = useState(usuario.correo);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Si el servidor devuelve el usuario actualizado, se reflejan los campos.
  useEffect(() => {
    setNombre(usuario.nombre);
    setCorreo(usuario.correo);
  }, [usuario.nombre, usuario.correo]);

  const sinCambios = nombre.trim() === usuario.nombre && correo.trim() === usuario.correo;

  const enviar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setError(null);
    setExito(null);

    if (nombre.trim().length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres.');
      return;
    }

    setGuardando(true);
    try {
      await onGuardar({ nombre: nombre.trim(), correo: correo.trim() });
      setExito('Datos del perfil actualizados.');
    } catch (err) {
      setError(err?.message || 'No se pudieron guardar los datos del perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glow-card bg-white/92 dark:bg-[#0D0B61]/85 p-6 md:p-8"
      style={{ borderRadius: '20px' }}
    >
      <h2 className="font-display font-bold text-lg text-[#0D0B61] dark:text-white mb-1">
        Datos de Perfil
      </h2>
      <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE] mb-6">
        Puede actualizar su nombre y su correo electrónico. Su rol ({nombreRol}) sólo lo modifica el
        Administrador del sistema.
      </p>

      <form onSubmit={enviar} className="space-y-4 max-w-lg">
        <div>
          <label htmlFor="perfil-nombre" className={LABEL}>NOMBRE COMPLETO</label>
          <input
            id="perfil-nombre"
            type="text"
            value={nombre}
            onChange={(e) => { setNombre(e.target.value); setError(null); setExito(null); }}
            className={INPUT_PERFIL}
          />
        </div>

        <div>
          <label htmlFor="perfil-correo" className={LABEL}>CORREO ELECTRÓNICO</label>
          <input
            id="perfil-correo"
            type="email"
            value={correo}
            onChange={(e) => { setCorreo(e.target.value); setError(null); setExito(null); }}
            className={INPUT_PERFIL}
          />
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {exito && (
          <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            {exito}
          </p>
        )}

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={guardando || sinCambios}
            className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
          >
            {guardando ? <Save className="w-4 h-4 animate-pulse" /> : <Check className="w-4 h-4" />}
            {guardando ? 'Guardando…' : 'Guardar Cambios'}
          </button>
          {sinCambios && (
            <span className="font-mono text-[10px] text-[#294669]/60 dark:text-[#476EAE]/60">
              Sin cambios pendientes
            </span>
          )}
        </div>
      </form>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. Cambio de contraseña                                                     */
/* -------------------------------------------------------------------------- */

function SeccionPassword() {
  const { cambiarContrasena } = useAuth();
  const [form, setForm] = useState({ actual: '', nueva: '', confirmacion: '' });
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setError(null);
    setExito(null);
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (enviando) return;
    setError(null);
    setExito(null);

    if (!form.actual) {
      setError('Indique su contraseña actual.');
      return;
    }
    const problema = validarContrasena(form.nueva);
    if (problema) {
      setError(problema);
      return;
    }
    if (form.nueva === form.actual) {
      setError('La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    if (form.nueva !== form.confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      const json = await cambiarContrasena(form.actual, form.nueva);
      setExito(json?.mensaje || 'Contraseña actualizada correctamente.');
      setForm({ actual: '', nueva: '', confirmacion: '' });
    } catch (err) {
      setError(err?.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setEnviando(false);
    }
  };

  const campos = [
    { key: 'actual', label: 'CONTRASEÑA ACTUAL', ph: '••••••••', autoComplete: 'current-password' },
    { key: 'nueva', label: 'NUEVA CONTRASEÑA', ph: 'Mínimo 8 alfanuméricos', autoComplete: 'new-password' },
    { key: 'confirmacion', label: 'CONFIRMAR NUEVA CONTRASEÑA', ph: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-glow-card bg-white/92 dark:bg-[#0D0B61]/85 p-6 md:p-8"
      style={{ borderRadius: '20px' }}
    >
      <h2 className="font-display font-bold text-lg text-[#0D0B61] dark:text-white mb-1">
        Cambiar Contraseña
      </h2>
      <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE] mb-6">
        La nueva contraseña debe tener al menos 8 caracteres alfanuméricos (una letra y un número).
        Al cambiarla se cerrarán sus demás sesiones abiertas.
      </p>

      <form onSubmit={enviar} className="space-y-4 max-w-lg">
        {campos.map((campo) => (
          <div key={campo.key}>
            <label htmlFor={`password-${campo.key}`} className={LABEL}>{campo.label}</label>
            <input
              id={`password-${campo.key}`}
              type="password"
              required
              autoComplete={campo.autoComplete}
              value={form[campo.key]}
              onChange={update(campo.key)}
              placeholder={campo.ph}
              className={INPUT_PERFIL}
            />
          </div>
        ))}

        {error && (
          <p role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
        {exito && (
          <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
            {exito}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex items-center gap-2 font-display font-semibold text-sm px-5 py-2.5 rounded-lg text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg,#48B3AF,#A7E399)' }}
        >
          {enviando ? <Save className="w-4 h-4 animate-pulse" /> : <KeyRound className="w-4 h-4" />}
          {enviando ? 'Actualizando…' : 'Actualizar Contraseña'}
        </button>
      </form>
    </motion.section>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Revisar mis Multas: Gestionado por components/RevisarMultas.jsx          */
/* -------------------------------------------------------------------------- */

