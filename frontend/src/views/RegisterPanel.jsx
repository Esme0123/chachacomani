import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import FloatingOrbs from '../components/FloatingOrbs.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { validarContrasena, requisitosContrasena } from '../services/authService.js'

const INPUT =
  'w-full rounded-lg px-4 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55'
const INPUT_BASE =
  'w-full rounded-lg pl-4 pr-11 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none'
/* Estados del borde. Sólo se aplica UN color de borde a la vez, así que nunca
   hay dos utilidades `border-color` compitiendo por especificidad. */
const BORDE = {
  neutro: 'border-[#294669]/25 dark:border-[#476EAE]/55 focus:border-[#48B3AF]',
  coincide: 'border-emerald-500 dark:border-emerald-400 focus:border-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.15)]',
  noCoincide: 'border-rose-500 dark:border-rose-400 focus:border-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,.15)]',
}
const LABEL =
  'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5'
const BOTON =
  'w-full py-3.5 rounded-lg font-display font-bold tracking-widest text-white transition-all duration-300 hover:scale-[1.02] mt-1 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed'
const GRADIENTE = { background: 'linear-gradient(135deg,#48B3AF,#A7E399)', boxShadow: '0 4px 28px rgba(72,179,175,.42)' }
const BTON_OJO =
  'absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-md text-[#294669]/70 dark:text-[#48B3AF] hover:bg-[#48B3AF]/10 hover:text-[#0D0B61] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48B3AF] transition-colors'

/** Caja de alerta destacada: muestra el mensaje exacto que devolvió la API. */
function AlertaError({ mensaje, delServidor }) {
  return (
    <div
      role="alert"
      className="rounded-xl border-l-4 border-rose-500 bg-rose-500/10 dark:bg-rose-500/15 px-3.5 py-3 flex items-start gap-2.5 shadow-[0_4px_18px_rgba(244,63,94,.12)]"
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-px text-rose-600 dark:text-rose-400" aria-hidden="true" />
      <div className="min-w-0">
        <p className="font-display font-semibold text-[10px] tracking-widest text-rose-600 dark:text-rose-400 uppercase">
          {delServidor ? 'Respuesta del servidor' : 'Revise el formulario'}
        </p>
        <p className="font-mono text-[11px] leading-relaxed text-rose-600 dark:text-rose-400 break-words">
          {mensaje}
        </p>
      </div>
    </div>
  )
}

/** Botón "ojito" que alterna el type del input entre password y text. */
function BtnOjo({ visible, onClick, id }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={BTON_OJO}
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={visible}
      aria-controls={id}
      title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
    >
      {visible
        ? <EyeOff className="w-4 h-4" aria-hidden="true" />
        : <Eye className="w-4 h-4" aria-hidden="true" />}
    </button>
  )
}

export default function RegisterPanel({ dark, onNavigate, onToggleTheme }) {
  const { registro } = useAuth()
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', confirmacion: '' })
  const [error, setError] = useState(null)
  const [errorDelServidor, setErrorDelServidor] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [ver, setVer] = useState({ contrasena: false, confirmacion: false })

  const alternarVisibilidad = (k) => () => setVer(v => ({ ...v, [k]: !v[k] }))

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError(null)
  }

  // --- Confirmación en tiempo real -------------------------------------------
  const escribiendoConfirmacion = form.confirmacion.length > 0
  const coinciden = escribiendoConfirmacion && form.contrasena === form.confirmacion

  /** Borde verde si coincide, rojo si no; neutro mientras el campo está vacío. */
  const bordeConfirmacion = !escribiendoConfirmacion
    ? BORDE.neutro
    : coinciden
      ? BORDE.coincide
      : BORDE.noCoincide

  const requisitos = requisitosContrasena(form.contrasena)
  const mostrarRequisitos = form.contrasena.length > 0

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setError(null)
    setErrorDelServidor(false)

    // Validación en el cliente: la misma política que aplica el backend, para
    // dar respuesta inmediata sin un viaje de ida y vuelta.
    if (form.nombre.trim().length < 3) {
      setError('El nombre completo debe tener al menos 3 caracteres.')
      return
    }
    const problema = validarContrasena(form.contrasena)
    if (problema) {
      setError(problema)
      return
    }
    if (form.contrasena !== form.confirmacion) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setEnviando(true)
    try {
      await registro(form.nombre.trim(), form.correo.trim(), form.contrasena, true)
      onNavigate('home')
    } catch (err) {
      // Se muestra literalmente lo que devolvió el backend (`json.error`).
      setErrorDelServidor(true)
      setError(err?.message || 'No se pudo crear la cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  const fields = [
    { key: 'nombre', label: 'NOMBRE COMPLETO', type: 'text', ph: 'Juan Pérez López', autoComplete: 'name' },
    { key: 'correo', label: 'CORREO ELECTRÓNICO', type: 'email', ph: 'socio@chachacomani.com', autoComplete: 'email' },
  ]

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-[#0D0B61]">
      {/* Fondo vectorial: radiante + rejilla minera sutil (sin imágenes externas) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 70% 10%, rgba(72,179,175,.14), transparent 55%), radial-gradient(circle at 10% 90%, rgba(228,211,41,.12), transparent 50%)' }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(13,11,97,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(13,11,97,0.04) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />
      {/* Esferas decorativas flotantes (pointer-events: none, z-index inferior) */}
      <FloatingOrbs />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <form
            onSubmit={enviar}
            className="border-glow-card w-full max-w-[420px] backdrop-blur-sm bg-white/92 dark:bg-[#0D0B61]/85"
            style={{ borderRadius: '20px', padding: '2.5rem 2rem' }}
          >
            {/* Logo */}
            <div className="text-center mb-7">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center font-display font-bold text-[#0D0B61] text-2xl mb-4"
                style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
              >
                C
              </div>
              <h2 className="font-display font-bold text-[#0D0B61] dark:text-white text-2xl tracking-widest">
                CREAR CUENTA
              </h2>
            </div>

            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label htmlFor={`registro-${f.key}`} className={LABEL}>{f.label}</label>
                  <input
                    id={`registro-${f.key}`}
                    type={f.type}
                    required
                    autoComplete={f.autoComplete}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    placeholder={f.ph}
                    className={INPUT}
                  />
                </div>
              ))}

              {/* Contraseña */}
              <div>
                <label htmlFor="registro-contrasena" className={LABEL}>CONTRASEÑA</label>
                <div className="relative">
                  <input
                    id="registro-contrasena"
                    type={ver.contrasena ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.contrasena}
                    onChange={update('contrasena')}
                    placeholder="Mínimo 8 caracteres alfanuméricos"
                    className={`${INPUT_BASE} ${BORDE.neutro}`}
                  />
                  <BtnOjo
                    id="registro-contrasena"
                    visible={ver.contrasena}
                    onClick={alternarVisibilidad('contrasena')}
                  />
                </div>

                {/* Requisitos evaluados en vivo: el socio ve qué falta exacto. */}
                {mostrarRequisitos && (
                  <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1">
                    {requisitos.map(r => (
                      <li
                        key={r.id}
                        className={`flex items-center gap-1.5 font-mono text-[10px] transition-colors ${
                          r.cumple
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-[#294669]/55 dark:text-[#476EAE]/70'
                        }`}
                      >
                        {r.cumple
                          ? <CheckCircle2 className="w-3 h-3 shrink-0" aria-hidden="true" />
                          : <XCircle className="w-3 h-3 shrink-0" aria-hidden="true" />}
                        {r.etiqueta}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Confirmar contraseña: feedback en tiempo real */}
              <div>
                <label htmlFor="registro-confirmacion" className={LABEL}>CONFIRMAR CONTRASEÑA</label>
                <div className="relative">
                  <input
                    id="registro-confirmacion"
                    type={ver.confirmacion ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={form.confirmacion}
                    onChange={update('confirmacion')}
                    placeholder="••••••••"
                    aria-describedby="registro-confirmacion-estado"
                    className={`${INPUT_BASE} ${bordeConfirmacion}`}
                  />
                  <BtnOjo
                    id="registro-confirmacion"
                    visible={ver.confirmacion}
                    onClick={alternarVisibilidad('confirmacion')}
                  />
                </div>

                {escribiendoConfirmacion && (
                  <p
                    id="registro-confirmacion-estado"
                    role="status"
                    aria-live="polite"
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium transition-colors ${
                      coinciden
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-rose-500/50 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {coinciden
                      ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      : <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    {coinciden ? '¡Las contraseñas coinciden!' : 'Las contraseñas no coinciden'}
                  </p>
                )}
              </div>

              {error && <AlertaError mensaje={error} delServidor={errorDelServidor} />}

              <button type="submit" disabled={enviando} className={BOTON} style={GRADIENTE}>
                <span className="inline-flex items-center justify-center gap-2">
                  {enviando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {enviando ? 'CREANDO CUENTA…' : 'CREAR CUENTA'}
                </span>
              </button>

              <p className="font-mono text-[10px] leading-relaxed text-[#294669]/70 dark:text-[#476EAE]/70 text-center">
                Toda cuenta nueva se registra con el rol «Lectura (Socio)». Los roles
                Tesorero, Caja Chica y Administrador los concede el Administrador del sistema.
              </p>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="font-mono text-[#294669] dark:text-[#476EAE] hover:text-[#0D0B61] dark:hover:text-[#48B3AF] text-[11px] transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia sesión →
                </button>
              </div>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  )
}
