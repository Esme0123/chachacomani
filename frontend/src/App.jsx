import { useState } from 'react'
import HomePanel from './views/HomePanel.jsx'
import LoginPanel from './views/LoginPanel.jsx'
import RegisterPanel from './views/RegisterPanel.jsx'
import ReglamentoInternoView from './views/ReglamentoInternoView.jsx'
import EnDesarrolloView from './views/EnDesarrolloView.jsx'
import { CursorRippleOverlay } from './components/Effects.jsx'

export default function App() {
  const [vista, setVista] = useState('home')
  const [dark, setDark] = useState(false)

  return (
    <>
      {/* Efecto global de ripple que sigue al cursor */}
      <CursorRippleOverlay />

      {vista === 'reglamento' && (
        <ReglamentoInternoView onVolver={() => setVista('home')} />
      )}

      {vista === 'en-desarrollo' && (
        <EnDesarrolloView onVolver={() => setVista('home')} />
      )}

      {(vista === 'home' || vista === 'login' || vista === 'register') && (
        <div className="size-full">
          {vista === 'home' && (
            <HomePanel
              dark={dark}
              onNavigate={setVista}
              onToggleTheme={() => setDark(d => !d)}
            />
          )}
          {vista === 'login' && <LoginPanel onNavigate={setVista} />}
          {vista === 'register' && <RegisterPanel onNavigate={setVista} />}
        </div>
      )}
    </>
  )
}