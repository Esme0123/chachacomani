import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function RegisterPanel({ dark, onNavigate }) {
  const [form, setForm] = useState({ nombre: '', email: '', pass: '', confirm: '' })

  const update = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const fields = [
    { key: 'nombre', label: 'NOMBRE COMPLETO', type: 'text', ph: 'Juan Pérez López' },
    { key: 'email', label: 'CORREO ELECTRÓNICO', type: 'email', ph: 'socio@chachacomani.com' },
    { key: 'pass', label: 'CONTRASEÑA', type: 'password', ph: '••••••••' },
    { key: 'confirm', label: 'CONFIRMAR CONTRASEÑA', type: 'password', ph: '••••••••' },
  ]

  const panelBg = dark
    ? 'linear-gradient(135deg, rgba(13,11,97,.95) 0%, rgba(41,70,105,.88) 100%)'
    : 'linear-gradient(135deg, rgba(238,242,255,.98) 0%, rgba(200,215,240,.94) 100%)'

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 ${dark ? 'bg-[#0D0B61]' : 'bg-slate-50'}`}
    >
      <img
        src="https://images.unsplash.com/photo-1504711331083-9c895941bf81?w=1920&h=1080&fit=crop&auto=format"
        alt="Fondo portal minero"
        className="hero-image-animated absolute inset-0 w-full h-full object-cover opacity-[0.09]"
        style={{ filter: 'blur(4px)' }}
      />
      <div className="absolute inset-0" style={{ background: panelBg }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div
            className={`border-glow-card w-full max-w-[420px] transition-colors duration-300 backdrop-blur-sm ${dark ? 'bg-[#0D0B61]/85' : 'bg-white/92'}`}
            style={{ borderRadius: '20px', padding: '2.5rem 2rem' }}
          >
            {/* Logo */}
            <div className="text-center mb-7">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center font-display font-bold text-2xl mb-4"
                style={{ color: '#0D0B61', background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
              >
                C
              </div>
              <h2 className={`font-display font-bold text-2xl tracking-widest transition-colors duration-300 ${dark ? 'text-white' : 'text-[#0D0B61]'}`}>
                CREAR CUENTA
              </h2>
            </div>

            <div className="space-y-4">
              {fields.map(f => (
                <div key={f.key}>
                  <label className={`font-display font-semibold text-[11px] tracking-widest block mb-1.5 transition-colors duration-300 ${dark ? 'text-[#48B3AF]' : 'text-[#294669]'}`}>
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    placeholder={f.ph}
                    className={`w-full rounded-lg px-4 py-3 font-mono text-sm placeholder-[#476EAE] transition-all focus:outline-none ${dark ? 'text-white' : 'text-[#0D0B61] placeholder-[#294669]/40'}`}
                    style={{
                      background: dark ? 'rgba(41,70,105,0.28)' : 'rgb(248 250 252)',
                      border: dark ? '1px solid rgba(71,110,174,0.55)' : '1px solid rgba(41,70,105,0.25)',
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#48B3AF')}
                    onBlur={e => (e.currentTarget.style.borderColor = dark ? 'rgba(71,110,174,0.55)' : 'rgba(41,70,105,0.25)')}
                  />
                </div>
              ))}

              <button
                className="w-full py-3.5 rounded-lg font-display font-bold tracking-widest text-white transition-all duration-300 hover:scale-[1.02] mt-1"
                style={{
                  background: 'linear-gradient(135deg,#48B3AF,#A7E399)',
                  boxShadow: '0 4px 28px rgba(72,179,175,.42)',
                }}
              >
                CREAR CUENTA
              </button>

              <div className="text-center pt-1">
                <button
                  onClick={() => onNavigate('login')}
                  className={`font-mono text-[11px] transition-colors ${dark ? 'text-[#476EAE] hover:text-[#48B3AF]' : 'text-[#294669] hover:text-[#0D0B61]'}`}
                >
                  ¿Ya tienes cuenta? Inicia sesión →
                </button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  )
}