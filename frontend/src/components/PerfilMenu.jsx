import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, UserCog, KeyRound, Gavel, LogOut, Wallet } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import {
  PERMISO_GESTIONAR_CAJA_CHICA,
  PERMISO_GESTIONAR_USUARIOS,
} from '../services/permisosService.js'

/**
 * Menú desplegable de perfil que sustituye al botón «Login» en la barra
 * superior una vez iniciada la sesión.
 *
 * Opciones (especificación 1.3):
 *   1. Ver / Editar Datos de Perfil (Nombre, Correo)
 *   2. Cambiar Contraseña
 *   3. Revisar mis Multas
 *   4. Cerrar Sesión
 *
 * Se añaden además dos accesos condicionados al rol: «Caja Chica» para el rol
 * Caja Chica y «Usuarios y Roles» para el Administrador.
 *
 * @param {(destino: string) => void} onNavigate
 * @param {(seccion: 'perfil'|'password'|'multas') => void} onIrAPerfil
 */
export default function PerfilMenu({ dark, onNavigate, onIrAPerfil }) {
  const { usuario, nombreRol, logout, puede } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const contenedorRef = useRef(null)

  // Cierra el desplegable al pulsar fuera o al pulsar Escape.
  useEffect(() => {
    if (!abierto) return undefined

    const alClicFuera = (e) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target)) {
        setAbierto(false)
      }
    }
    const alEsc = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }

    document.addEventListener('mousedown', alClicFuera)
    document.addEventListener('keydown', alEsc)
    return () => {
      document.removeEventListener('mousedown', alClicFuera)
      document.removeEventListener('keydown', alEsc)
    }
  }, [abierto])

  const navegar = (destino) => {
    setAbierto(false)
    onNavigate(destino)
  }

  const cerrarSesion = async () => {
    setAbierto(false)
    await logout()
    onNavigate('home')
  }

  const irAPerfil = (seccion) => {
    setAbierto(false)
    onIrAPerfil ? onIrAPerfil(seccion) : onNavigate('perfil')
  }

  const items = [
    {
      clave: 'perfil',
      etiqueta: 'Ver / Editar Datos de Perfil',
      icono: UserCog,
      accion: () => irAPerfil('perfil'),
    },
    {
      clave: 'password',
      etiqueta: 'Cambiar Contraseña',
      icono: KeyRound,
      accion: () => irAPerfil('password'),
    },
    {
      clave: 'multas',
      etiqueta: 'Revisar mis Multas',
      icono: Gavel,
      accion: () => irAPerfil('multas'),
    },
  ]

  if (puede(PERMISO_GESTIONAR_CAJA_CHICA)) {
    items.push({
      clave: 'caja',
      etiqueta: 'Panel de Caja Chica',
      icono: Wallet,
      accion: () => navegar('caja-chica'),
    })
  }

  if (puede(PERMISO_GESTIONAR_USUARIOS)) {
    items.push({
      clave: 'usuarios',
      etiqueta: 'Usuarios y Roles',
      icono: UserCog,
      accion: () => navegar('usuarios'),
    })
  }

  const styles = dark
    ? {
        trigger: 'border-[#48B3AF] text-[#48B3AF] hover:bg-[#48B3AF]/12',
        panel: { background: 'rgba(13,11,97,0.97)', borderColor: '#294669', boxShadow: '0 24px 60px rgba(0,0,0,.55)' },
        texto: 'text-white',
        hover: 'hover:bg-[#294669]/50',
        salir: 'text-[#F27C7C] hover:bg-[#F27C7C]/12',
        rol: 'text-[#E4D329]',
      }
    : {
        trigger: 'border-[#294669] text-[#294669] hover:bg-[#294669]/6',
        panel: { background: 'rgba(255,255,255,0.97)', borderColor: 'rgba(41,70,105,0.2)', boxShadow: '0 24px 60px rgba(13,11,97,.25)' },
        texto: 'text-[#0D0B61]',
        hover: 'hover:bg-[#294669]/10',
        salir: 'text-[#C0392B] hover:bg-[#C0392B]/8',
        rol: 'text-[#48B3AF]',
      }

  return (
    <div className="relative shrink-0" ref={contenedorRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setAbierto(o => !o)}
        aria-expanded={abierto}
        aria-haspopup="menu"
        className={`flex items-center gap-2 font-display font-semibold text-sm tracking-wide pl-2 pr-3 py-1.5 rounded-md border transition-all ${styles.trigger}`}
        title="Menú de perfil"
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center font-display font-bold text-[10px] text-[#0D0B61] shrink-0"
          style={{ background: 'linear-gradient(135deg,#E4D329,#48B3AF)' }}
        >
          {usuario?.nombre?.trim().charAt(0).toUpperCase() || 'C'}
        </span>
        <span className="hidden sm:inline max-w-[140px] truncate">
          Bienvenido/a, {usuario?.nombre}
        </span>
        <span className="hidden sm:inline text-[10px]">▾</span>
      </motion.button>

      {abierto && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl border p-2 z-50 backdrop-blur-md"
          style={styles.panel}
        >
          {/* Identidad del socio */}
          <div className="px-3 py-2.5 border-b border-[#294669]/25 dark:border-[#294669]/50 mb-1.5">
            <p className={`font-display font-bold text-sm truncate ${styles.texto}`}>
              {usuario?.nombre}
            </p>
            <p className="font-mono text-[10px] text-[#294669] dark:text-[#476EAE] truncate">
              {usuario?.correo}
            </p>
            <p className={`font-mono text-[10px] mt-1 inline-block px-1.5 py-0.5 rounded border border-current/30 ${styles.rol}`}>
              {nombreRol}
            </p>
          </div>

          {items.map(item => {
            const Icono = item.icono
            return (
              <button
                key={item.clave}
                role="menuitem"
                onClick={item.accion}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-semibold text-sm text-left transition-colors ${styles.texto} ${styles.hover}`}
              >
                <Icono className="w-4 h-4 shrink-0 opacity-70" />
                {item.etiqueta}
              </button>
            )
          })}

          <div className="my-1.5 border-t border-[#294669]/25 dark:border-[#294669]/50" />

          <button
            role="menuitem"
            onClick={cerrarSesion}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-semibold text-sm text-left transition-colors ${styles.salir}`}
          >
            <LogOut className="w-4 h-4 shrink-0 opacity-70" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
