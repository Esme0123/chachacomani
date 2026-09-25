import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/** Clases compartidas con el resto de formularios de autenticación. */
const INPUT =
  'w-full rounded-lg px-4 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55'
const LABEL =
  'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5'
const BOTON =
  'w-full py-3.5 rounded-lg font-display font-bold tracking-widest text-white transition-all duration-300 hover:scale-[1.02] mt-1 disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed'
const GRADIENTE = { background: 'linear-gradient(135deg,#48B3AF,#A7E399)', boxShadow: '0 4px 28px rgba(72,179,175,.42)' }

export default function LoginPanel({ dark, onNavigate, onToggleTheme }) {
  const { login } = useAuth()
  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [error, setError] = useState(null)
  const [enviando, setEnviando] = useState(false)

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
      await login(form.correo.trim(), form.contrasena)
      onNavigate('home')
    } catch (err) {
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
                <input
                  id="login-contrasena"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.contrasena}
                  onChange={update('contrasena')}
                  placeholder="••••••••"
                  className={INPUT}
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 font-mono text-[11px] leading-relaxed text-rose-600 dark:text-rose-400"
                >
                  {error}
                </p>
              )}

              <button type="submit" disabled={enviando} className={BOTON} style={GRADIENTE}>
                {enviando ? 'VERIFICANDO…' : 'INICIAR SESIÓN'}
              </button>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="font-mono text-[#294669] dark:text-[#476EAE] hover:text-[#0D0B61] dark:hover:text-[#48B3AF] text-[11px] transition-colors"
                >
                  Crear cuenta →
                </button>
                <span
                  title="Para restablecer su contraseña, comuníquese con el Administrador del sistema."
                  className="font-mono text-[#294669]/60 dark:text-[#476EAE]/60 text-[11px] cursor-help"
                >
                  ¿Olvidó su contraseña?
                </span>
              </div>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </div>
  )
}
