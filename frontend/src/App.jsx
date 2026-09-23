import { useLayoutEffect, useState } from 'react'
import HomePanel from './views/HomePanel.jsx'
import LoginPanel from './views/LoginPanel.jsx'
import RegisterPanel from './views/RegisterPanel.jsx'
import ReglamentoInternoView from './views/ReglamentoInternoView.jsx'
import EstatutoOrganicoView from './views/EstatutoOrganicoView.jsx'
import EnDesarrolloView from './views/EnDesarrolloView.jsx'
import { CursorRippleOverlay } from './components/Effects.jsx'

export default function App() {
  const [vista, setVista] = useState('home')
  const [dark, setDark] = useState(false)
  const toggleTheme = () => setDark(d => !d)

  // Modo claro/oscuro global: sincroniza la clase 'dark' en <html>.
  // Las vistas 'reglamento' y 'estatuto' gestionan su propio tema (regímen/claro).
  useLayoutEffect(() => {
    if (vista !== 'reglamento' && vista !== 'estatuto') {
      const root = document.documentElement
      root.classList.toggle('dark', dark)
    }
  }, [dark, vista])

  return (
    <div className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-[#0D0B61]' : 'bg-slate-50'}`}>
      {/* Efecto global de ripple que sigue al cursor */}
      <CursorRippleOverlay />

      {vista === 'reglamento' && (
        <ReglamentoInternoView onVolver={() => setVista('home')} />
      )}

      {vista === 'estatuto' && (
        <EstatutoOrganicoView onVolver={() => setVista('home')} />
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
              onToggleTheme={toggleTheme}
            />
          )}
          {vista === 'login' && <LoginPanel dark={dark} onNavigate={setVista} onToggleTheme={toggleTheme} />}
          {vista === 'register' && <RegisterPanel dark={dark} onNavigate={setVista} onToggleTheme={toggleTheme} />}
        </div>
      )}
    </div>
  )
}