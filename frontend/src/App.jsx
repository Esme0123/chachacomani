import { useState } from 'react'
import HomePanel from './views/HomePanel.jsx'
import LoginPanel from './views/LoginPanel.jsx'
import RegisterPanel from './views/RegisterPanel.jsx'
import StyleGuide from './views/StyleGuide.jsx'
import ReglamentoInternoView from './views/ReglamentoInternoView.jsx'
import { CursorRippleOverlay } from './components/Effects.jsx'

const VISTAS = [
  { id: 'home', label: '🏠 Inicio Claro' },
  { id: 'home-dark', label: '🌙 Inicio Oscuro' },
  { id: 'login', label: '🔐 Login' },
  { id: 'register', label: '📝 Registro' },
  { id: 'style-guide', label: '🎨 Guía de Estilo' },
  { id: 'reglamento', label: '📜 Reglamento Interno' },
]

export default function App() {
  const [vista, setVista] = useState('home')

  return (
    <>
      {/* Efecto global de ripple que sigue al cursor */}
      <CursorRippleOverlay />

      {vista === 'reglamento' ? (
        <ReglamentoInternoView onVolver={() => setVista('home')} />
      ) : (
        <div className="size-full">
          {/* Floating panel switcher */}
          <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <nav
              className="pointer-events-auto flex gap-1 items-center rounded-full px-2 py-2 flex-wrap justify-center"
              style={{
                background: 'rgba(4,3,50,0.88)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(41,70,105,0.6)',
                boxShadow: '0 8px 40px rgba(13,11,97,.8), 0 0 24px rgba(72,179,175,.15)',
              }}
            >
              {VISTAS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setVista(t.id)}
                  className="px-4 py-2 rounded-full font-display font-semibold text-xs tracking-wide transition-all duration-200"
                  style={{
                    background: vista === t.id ? 'linear-gradient(135deg,#E4D329,#48B3AF)' : 'transparent',
                    color: vista === t.id ? '#0D0B61' : '#476EAE',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Active view */}
          {vista === 'home' && <HomePanel dark={false} onNavigate={setVista} />}
          {vista === 'home-dark' && <HomePanel dark={true} onNavigate={setVista} />}
          {vista === 'login' && <LoginPanel onNavigate={setVista} />}
          {vista === 'register' && <RegisterPanel onNavigate={setVista} />}
          {vista === 'style-guide' && <StyleGuide onNavigate={setVista} />}
        </div>
      )}
    </>
  )
}