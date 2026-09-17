import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import { RippleOverlay } from '../components/Effects.jsx'

export default function LoginPanel({ onNavigate }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [ripple, setRipple] = useState({ x: 50, y: 50, show: false })

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ background: '#0D0B61' }}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect()
        setRipple({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, show: true })
      }}
      onMouseLeave={() => setRipple(v => ({ ...v, show: false }))}
    >
      <img
        src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop&auto=format"
        alt="Fondo portal minero"
        className="hero-image-animated absolute inset-0 w-full h-full object-cover opacity-[0.18]"
        style={{ filter: 'blur(3px)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(13,11,97,.96) 0%, rgba(41,70,105,.87) 100%)' }}
      />
      {ripple.show && <RippleOverlay x={ripple.x} y={ripple.y} />}

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark onNavigate={onNavigate} />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="electric-border-outer w-full max-w-[420px]" style={{ borderRadius: '20px' }}>
            <div className="bg-[#0D0B61]/96 backdrop-blur-sm rounded-[18px] p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 mx-auto rounded-full flex items-center justify-center font-display font-bold text-[#0D0B61] text-2xl mb-4"
                  style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
                >
                  C
                </div>
                <h2 className="font-display font-bold text-white text-2xl tracking-widest">INICIAR SESIÓN</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="font-display font-semibold text-[#48B3AF] text-[11px] tracking-widest block mb-2">
                    USUARIO
                  </label>
                  <input
                    type="text"
                    value={user}
                    onChange={e => setUser(e.target.value)}
                    placeholder="nombre.usuario"
                    className="w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-[#476EAE] transition-all focus:outline-none focus:ring-1"
                    style={{
                      background: 'rgba(41,70,105,0.28)',
                      border: '1px solid rgba(71,110,174,0.55)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#48B3AF')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(71,110,174,0.55)')}
                  />
                </div>

                <div>
                  <label className="font-display font-semibold text-[#48B3AF] text-[11px] tracking-widest block mb-2">
                    CONTRASEÑA
                  </label>
                  <input
                    type="password"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-lg px-4 py-3 font-mono text-sm text-white placeholder-[#476EAE] transition-all focus:outline-none"
                    style={{
                      background: 'rgba(41,70,105,0.28)',
                      border: '1px solid rgba(71,110,174,0.55)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#48B3AF')}
                    onBlur={e => (e.currentTarget.style.borderColor = 'rgba(71,110,174,0.55)')}
                  />
                </div>

                <button
                  className="w-full py-3.5 rounded-lg font-display font-bold tracking-widest text-[#0D0B61] transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg,#E4D329,#48B3AF)',
                    boxShadow: '0 4px 28px rgba(228,211,41,.38)',
                  }}
                >
                  INICIAR SESIÓN
                </button>

                <div className="flex items-center justify-between pt-1">
                  <a href="#" className="font-mono text-[#476EAE] hover:text-[#48B3AF] text-[11px] transition-colors">
                    ¿Olvidó su contraseña?
                  </a>
                  <button
                    onClick={() => onNavigate('register')}
                    className="font-mono text-[#476EAE] hover:text-[#A7E399] text-[11px] transition-colors"
                  >
                    Crear cuenta →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}