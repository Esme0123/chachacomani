import { useLayoutEffect, useState, useCallback } from 'react'
import HomePanel from './views/HomePanel.jsx'
import LoginPanel from './views/LoginPanel.jsx'
import RegisterPanel from './views/RegisterPanel.jsx'
import ReglamentoInternoView from './views/ReglamentoInternoView.jsx'
import EstatutoOrganicoView from './views/EstatutoOrganicoView.jsx'
import EnDesarrolloView from './views/EnDesarrolloView.jsx'
import ProfileView from './views/ProfileView.jsx'
import CajaChicaView from './views/CajaChicaView.jsx'
import UsuariosView from './views/UsuariosView.jsx'
import { CursorRippleOverlay } from './components/Effects.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { DRMProvider } from './context/DRMContext.jsx'
import { PERMISO_GESTIONAR_CAJA_CHICA, PERMISO_VER_CONTABILIDAD, PERMISO_GESTIONAR_USUARIOS } from './services/permisosService.js'

/**
 * Envoltura de la aplicación: monta los proveedores de sesión y DRM y decide
 * qué vista se muestra. La navegación es por estado (no hay router).
 */
export default function App() {
  return (
    <AuthProvider>
      <DRMProvider>
        <AppShell />
      </DRMProvider>
    </AuthProvider>
  )
}

function AppShell() {
  const [vista, setVista] = useState('home')
  const [dark, setDark] = useState(false)
  const [seccionPerfil, setSeccionPerfil] = useState('perfil')
  const toggleTheme = () => setDark(d => !d)

  const { usuario, cargando, puede } = useAuth()

  /**
   * Permiso mínimo para entrar a cada vista restringida. Es una barrera de
   * navegación (evita pantallas inútiles); la validación real la hace el
   * backend, que responde 403 ante cualquier intento no autorizado.
   */
  const ACCESO_VISTA = {
    'caja-chica': [PERMISO_VER_CONTABILIDAD, PERMISO_GESTIONAR_CAJA_CHICA],
    usuarios: [PERMISO_GESTIONAR_USUARIOS],
  }
  const accesoPermitido = !ACCESO_VISTA[vista]
    || ACCESO_VISTA[vista].some((permiso) => puede(permiso))

  /**
   * Navega a la vista de perfil, opcionalmente a una de sus secciones.
   * El `Header` y el `Sidebar` la invocan con un destino simple:
   *   'perfil' | 'password' | 'multas'
   */
  const irAPerfil = useCallback((destino = 'perfil') => {
    const seccion = typeof destino === 'string' ? destino : destino?.seccion;
    if (seccion) setSeccionPerfil(seccion);
    setVista('perfil');
  }, [])

  /**
   * Cambio de pestaña DENTRO de la vista de perfil: actualiza el estado global
   * para que el Header siga siendo coherente si se navega fuera y se vuelve.
   */
  const cambiarSeccionPerfil = useCallback((seccion) => {
    setSeccionPerfil(seccion);
  }, [])

  // Modo claro/oscuro global: sincroniza la clase 'dark' en <html>.
  // Las vistas 'reglamento' y 'estatuto' gestionan su propio tema (regímen/claro).
  useLayoutEffect(() => {
    if (vista !== 'reglamento' && vista !== 'estatuto') {
      const root = document.documentElement
      root.classList.toggle('dark', dark)
    }
  }, [dark, vista])

  // Barra de carga mientras se restaura la sesión desde localStorage.
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0D0B61]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="size-10 rounded-full animate-spin"
            style={{ background: 'conic-gradient(from 0deg, #48B3AF, #7B4BC9, #E4A11B, #48B3AF)' }}
          />
          <p className="font-mono text-[11px] text-[#294669]/70 dark:text-[#476EAE]">
            Verificando su sesión…
          </p>
        </div>
      </div>
    )
  }

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

      {vista === 'perfil' && usuario && (
        <ProfileView
          dark={dark}
          onNavigate={setVista}
          onToggleTheme={toggleTheme}
          onIrAPerfil={irAPerfil}
          seccion={seccionPerfil}
          onCambiarSeccion={cambiarSeccionPerfil}
        />
      )}

      {vista === 'caja-chica' && usuario && accesoPermitido && (
        <CajaChicaView dark={dark} onNavigate={setVista} onToggleTheme={toggleTheme} />
      )}

      {vista === 'usuarios' && usuario && accesoPermitido && (
        <UsuariosView dark={dark} onNavigate={setVista} onToggleTheme={toggleTheme} />
      )}

      {(vista === 'home' || vista === 'login' || vista === 'register') && (
        <div className="size-full">
          {vista === 'home' && (
            <HomePanel
              dark={dark}
              onNavigate={setVista}
              onToggleTheme={toggleTheme}
              onIrAPerfil={irAPerfil}
            />
          )}
          {vista === 'login' && (
            <LoginPanel
              dark={dark}
              onNavigate={setVista}
              onToggleTheme={toggleTheme}
              onIrAPerfil={irAPerfil}
            />
          )}
          {vista === 'register' && (
            <RegisterPanel
              dark={dark}
              onNavigate={setVista}
              onToggleTheme={toggleTheme}
              onIrAPerfil={irAPerfil}
            />
          )}
        </div>
      )}
    </div>
  )
}
