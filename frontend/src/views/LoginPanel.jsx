import { useState } from 'react'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import FloatingOrbs from '../components/FloatingOrbs.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/** Clases compartidas con el resto de formularios de autenticación. */
const INPUT =
  'w-full rounded-lg px-4 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55'
/** Igual que INPUT pero reservando el hueco del botón "ojo" a la derecha. */
const INPUT_OLHO =
  'w-full rounded-lg pl-4 pr-11 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55'
const LABEL =
  'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5'
const BOTON =
  'w-full py-3.5 rounded-lg font-display font-bold tracking-widest text-white transition-all duration-300 hover:scale-[1.02] mt-1 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed'
const GRADIENTE = { background: 'linear-gradient(135deg,#48B3AF,#A7E399)', boxShadow: '0 4px 28px rgba(72,179,175,.42)' }

/** Botón "ojito" que alterna el type del input entre password y text. */
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

export default function LoginPanel({ dark, onNavigate, onToggleTheme }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [error, setError] = useState(null)
  const [errorDelServidor, setErrorDelServidor] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [verContrasena, setVerContrasena] = useState(false)
  const [recordar, setRecordar] = useState(true)

  const update = (k) => (e) => {
    setForm(f => ({ ...f, [k]: e.target.value }))
    setError(null)
  }

  const enviar = async (e) => {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    setError(null)
    try {
      await login(form.correo.trim(), form.contrasena, recordar)
      onNavigate('home')
    } catch (err) {
      // Se muestra literalmente lo que devolvió el backend (`json.error`).
      setErrorDelServidor(true)
      setError(err?.message || 'No se pudo iniciar sesión.')
    } finally {
      setEnviando(false)
    }
  }

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
                INICIAR SESIÓN
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="login-correo" className={LABEL}>CORREO ELECTRÓNICO</label>
                <input
                  id="login-correo"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.correo}
                  onChange={update('correo')}
                  placeholder="socio@chachacomani.com"
                  className={INPUT}
                />
              </div>

              <div>
                <label htmlFor="login-contrasena" className={LABEL}>CONTRASEÑA</label>
                <div className="relative">
                  <input
                    id="login-contrasena"
                    type={verContrasena ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={form.contrasena}
                    onChange={update('contrasena')}
                    placeholder="••••••••"
                    className={INPUT_OLHO}
                  />
                  <button
                    type="button"
                    onClick={() => setVerContrasena(v => !v)}
                    className={BTON_OJO}
                    aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    aria-pressed={verContrasena}
                    title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {verContrasena
                      ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                      : <Eye className="w-4 h-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-0.5">
                <label
                  htmlFor="login-recordar"
                  className="flex items-center gap-2 cursor-pointer group select-none"
                >
                  <input
                    id="login-recordar"
                    type="checkbox"
                    checked={recordar}
                    onChange={(e) => setRecordar(e.target.checked)}
                    className="w-4 h-4 rounded border-[#294669]/40 dark:border-[#476EAE]/60 bg-slate-50 dark:bg-[#294669]/40 accent-[#48B3AF] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#48B3AF] focus-visible:ring-offset-1 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0D0B61]"
                  />
                  <span className="font-mono text-[11px] text-[#294669] dark:text-[#476EAE] group-hover:text-[#0D0B61] dark:group-hover:text-[#48B3AF] transition-colors">
                    Recordarme
                  </span>
                </label>

                <span
                  title="Para restablecer su contraseña, comuníquese con el Administrador del sistema."
                  className="font-mono text-[#294669]/60 dark:text-[#476EAE]/60 text-[11px] cursor-help text-right"
                >
                  ¿Olvidó su contraseña?
                </span>
              </div>

              {recordar && (
                <p className="font-mono text-[10px] leading-relaxed text-[#294669]/55 dark:text-[#476EAE]/60 -mt-2">
                  La sesión se guardará en este navegador y no expirará al cerrarlo.
                </p>
              )}

              {error && <AlertaError mensaje={error} delServidor={errorDelServidor} />}

              <button type="submit" disabled={enviando} className={BOTON} style={GRADIENTE}>
                <span className="inline-flex items-center justify-center gap-2">
                  {enviando && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
                  {enviando ? 'VERIFICANDO…' : 'INICIAR SESIÓN'}
                </span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-mono text-[#294669] dark:text-[#476EAE] hover:text-[#0D0B61] dark:hover:text-[#48B3AF] text-[11px] transition-colors"
                >
                  Crear cuenta →
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
