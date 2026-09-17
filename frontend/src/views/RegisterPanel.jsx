import { useState } from 'react'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'

export default function RegisterPanel({ dark, onNavigate, onToggleTheme }) {
  const [form, setForm] = useState({ nombre: '', email: '', pass: '', confirm: '' })

  const update = (k) => (e) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const fields = [
    { key: 'nombre', label: 'NOMBRE COMPLETO', type: 'text', ph: 'Juan Pérez López' },
    { key: 'email', label: 'CORREO ELECTRÓNICO', type: 'email', ph: 'socio@chachacomani.com' },
    { key: 'pass', label: 'CONTRASEÑA', type: 'password', ph: '••••••••' },
    { key: 'confirm', label: 'CONFIRMAR CONTRASEÑA', type: 'password', ph: '••••••••' },
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

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header dark={dark} onNavigate={onNavigate} onToggleTheme={onToggleTheme} />

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div
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
                  <label className="font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[11px] tracking-widest block mb-1.5">
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={update(f.key)}
                    placeholder={f.ph}
                    className="w-full rounded-lg px-4 py-3 font-mono text-sm text-[#0D0B61] dark:text-white placeholder-[#294669]/40 dark:placeholder-[#476EAE] bg-slate-50 dark:bg-[#294669]/40 border transition-all focus:outline-none focus:border-[#48B3AF] border-[#294669]/25 dark:border-[#476EAE]/55"
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
                  className="font-mono text-[#294669] dark:text-[#476EAE] hover:text-[#0D0B61] dark:hover:text-[#48B3AF] text-[11px] transition-colors"
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