import { useState } from 'react'
import { CARDS } from '../data/landingData.js'

export default function Header({ dark, onNavigate, onToggleTheme }) {
  const [bibliotecaAbierto, setBibliotecaAbierto] = useState(false)

  const irABiblioteca = (card) => {
    setBibliotecaAbierto(false)
    onNavigate(card.title === 'Reglamento Interno' ? 'reglamento' : 'en-desarrollo')
  }

  return (
    <header className={`sticky top-0 z-40 ${dark
      ? 'bg-[#0D0B61]/90 backdrop-blur-sm border-b border-[#294669]/60'
      : 'bg-white/96 backdrop-blur-sm border-b border-[#294669]/18'
      }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-[#0D0B61] text-sm shrink-0"
            style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
          >
            C
          </div>
          <div>
            <div className={`font-display font-bold text-[13px] leading-tight tracking-wide ${dark ? 'text-white' : 'text-[#0D0B61]'}`}>
              COOPERATIVA MINERA AURÍFERA
            </div>
            <div className="font-display text-[#E4D329] text-[10px] tracking-[0.15em]">
              NEVADO CHACHACOMANI R.L.
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="font-display font-semibold text-sm tracking-wide px-3 py-1.5 rounded-md bg-[#E4D329] text-[#0D0B61] hover:bg-[#F6FF99] transition-colors"
          >
            Inicio
          </button>

          {/* Biblioteca dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setBibliotecaAbierto(true)}
            onMouseLeave={() => setBibliotecaAbierto(false)}
          >
            <button
              onClick={() => setBibliotecaAbierto(o => !o)}
              aria-expanded={bibliotecaAbierto}
              className={`flex items-center gap-1.5 font-display font-semibold text-sm tracking-wide px-3 py-1.5 rounded-md border transition-all ${dark
                  ? 'border-[#48B3AF]/70 text-[#48B3AF] hover:bg-[#48B3AF]/12'
                  : 'border-[#294669]/40 text-[#294669] hover:bg-[#294669]/6'
                }`}
            >
              Biblioteca
              <span className={`inline-block text-[10px] transition-transform duration-200 ${bibliotecaAbierto ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {bibliotecaAbierto && (
              <div
                className="absolute left-0 top-full mt-2 w-72 rounded-2xl border p-2 shadow-2xl z-50 backdrop-blur-md"
                style={{
                  background: dark ? 'rgba(13,11,97,0.97)' : 'rgba(255,255,255,0.97)',
                  borderColor: dark ? '#294669' : 'rgba(41,70,105,0.2)',
                  boxShadow: dark ? '0 24px 60px rgba(0,0,0,.55)' : '0 24px 60px rgba(13,11,97,.25)',
                }}
              >
                <div className="px-3 py-2 font-mono text-[10px] tracking-widest text-[#48B3AF]">
                  DOCUMENTOS NORMATIVOS
                </div>
                {CARDS.map(card => (
                  <button
                    key={card.id}
                    onClick={() => irABiblioteca(card)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-[#294669]/15"
                  >
                    <span
                      className="w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-base"
                      style={{ background: `${card.color}1a`, border: `1px solid ${card.color}55` }}
                    >
                      {card.icon}
                    </span>
                    <span className={`flex-1 min-w-0 font-display font-semibold text-sm leading-tight ${dark ? 'text-white' : 'text-[#0D0B61]'}`}>
                      {card.title}
                    </span>
                    <span className={`font-mono text-[10px] shrink-0 ${dark ? 'text-[#476EAE]' : 'text-[#294669]'}`}>
                      {card.title === 'Reglamento Interno' ? '📜' : '🚧'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            aria-label="Cambiar modo claro/oscuro"
            className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm transition-all ${dark
                ? 'border-[#48B3AF]/70 hover:bg-[#48B3AF]/12'
                : 'border-[#294669]/40 hover:bg-[#294669]/8'
              }`}
          >
            {dark ? '🌙' : '☀️'}
          </button>

          <button
            onClick={() => onNavigate('login')}
            className={`font-display font-semibold text-sm tracking-wide px-4 py-1.5 rounded-md border transition-all ${dark
                ? 'border-[#48B3AF] text-[#48B3AF] hover:bg-[#48B3AF]/12'
                : 'border-[#294669] text-[#294669] hover:bg-[#294669]/6'
              }`}
          >
            Login
          </button>
        </nav>
      </div>
    </header>
  )
}