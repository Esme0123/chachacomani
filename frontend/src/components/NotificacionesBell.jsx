import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import * as notificacionesService from '../services/notificacionesService.js'

function formatearFechaNotificacion(valor) {
  if (!valor) return ''
  const fecha = new Date(String(valor).replace(' ', 'T'))
  if (Number.isNaN(fecha.getTime())) return String(valor).slice(0, 16)
  return fecha.toLocaleString('es-BO', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Campana de notificaciones del Header.
 *
 * Consulta los avisos del usuario cada 30 segundos y permite marcar uno o
 * todos como leídos. Al pulsar un aviso navega a la sección correspondiente:
 * «Mis Deudas» para el socio o la bandeja de Caja Chica para el personal.
 */
export default function NotificacionesBell({ dark, onNavigate, onIrAPerfil }) {
  const { estaAutenticado } = useAuth()
  const [abierto, setAbierto] = useState(false)
  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(false)
  const contenedorRef = useRef(null)

  const cargar = useCallback(async (silencioso = false) => {
    if (!estaAutenticado) return
    if (!silencioso) setCargando(true)
    try {
      const json = await notificacionesService.listarNotificaciones()
      setNotificaciones(Array.isArray(json?.notificaciones) ? json.notificaciones : [])
      setNoLeidas(Number(json?.noLeidas) || 0)
    } catch (error) {
      if (!silencioso) {
        console.error('No se pudieron cargar las notificaciones:', error)
      }
    } finally {
      if (!silencioso) setCargando(false)
    }
  }, [estaAutenticado])

  useEffect(() => {
    if (!estaAutenticado) {
      setNotificaciones([])
      setNoLeidas(0)
      setAbierto(false)
      return undefined
    }
    cargar()
    const temporizador = window.setInterval(() => cargar(true), 30000)
    return () => window.clearInterval(temporizador)
  }, [estaAutenticado, cargar])

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

  const alternar = () => {
    const nuevo = !abierto
    setAbierto(nuevo)
    if (nuevo) cargar(true)
  }

  const abrirNotificacion = async (notificacion) => {
    if (!notificacion.leido) {
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === notificacion.id ? { ...n, leido: true } : n))
      )
      setNoLeidas((prev) => Math.max(0, prev - 1))
      try {
        await notificacionesService.marcarLeida(notificacion.id)
      } catch (error) {
        console.error('No se pudo marcar el aviso como leído:', error)
        cargar(true)
      }
    }

    setAbierto(false)
    if (notificacion.rolDestino === 'socio') {
      if (onIrAPerfil) onIrAPerfil('deudas')
      else if (onNavigate) onNavigate('perfil')
    } else if (onNavigate) {
      onNavigate('caja-chica')
    }
  }

  const marcarTodas = async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })))
    setNoLeidas(0)
    try {
      await notificacionesService.marcarTodasLeidas()
    } catch (error) {
      console.error('No se pudieron marcar todos los avisos:', error)
      cargar(true)
    }
  }

  if (!estaAutenticado) return null

  const estilos = dark
    ? {
        trigger: 'border-[#48B3AF]/70 text-[#48B3AF] hover:bg-[#48B3AF]/12',
        panel: {
          background: 'rgba(13,11,97,0.98)',
          borderColor: '#294669',
          boxShadow: '0 24px 60px rgba(0,0,0,.55)',
        },
        texto: 'text-white',
        subtexto: 'text-[#476EAE]',
        hover: 'hover:bg-[#294669]/50',
        borde: 'border-[#294669]/50',
      }
    : {
        trigger: 'border-[#294669]/40 text-[#294669] hover:bg-[#294669]/8',
        panel: {
          background: 'rgba(255,255,255,0.98)',
          borderColor: 'rgba(41,70,105,0.2)',
          boxShadow: '0 24px 60px rgba(13,11,97,.25)',
        },
        texto: 'text-[#0D0B61]',
        subtexto: 'text-[#294669]/70',
        hover: 'hover:bg-[#294669]/10',
        borde: 'border-[#294669]/20',
      }

  return (
    <div className="relative shrink-0" ref={contenedorRef}>
      <button
        type="button"
        onClick={alternar}
        aria-expanded={abierto}
        aria-haspopup="menu"
        title="Notificaciones"
        className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all ${estilos.trigger}`}
      >
        <Bell className="w-4 h-4" />
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-[21rem] max-w-[calc(100vw-2rem)] rounded-2xl border z-50 backdrop-blur-md overflow-hidden"
          style={estilos.panel}
        >
          <div className={`px-3 py-2.5 border-b flex items-center justify-between gap-2 ${estilos.borde}`}>
            <p className={`font-display font-bold text-sm ${estilos.texto}`}>
              Notificaciones
            </p>
            <button
              type="button"
              onClick={marcarTodas}
              disabled={noLeidas === 0}
              className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded-md transition-colors disabled:opacity-40 ${estilos.texto} ${estilos.hover}`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Marcar todas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {cargando ? (
              <p className={`px-4 py-8 text-center font-mono text-[11px] ${estilos.subtexto}`}>
                Cargando avisos…
              </p>
            ) : notificaciones.length === 0 ? (
              <p className={`px-4 py-8 text-center font-mono text-[11px] ${estilos.subtexto}`}>
                No tiene notificaciones.
              </p>
            ) : (
              <ul>
                {notificaciones.map((notificacion) => (
                  <li key={notificacion.id} className={`border-b last:border-b-0 ${estilos.borde}`}>
                    <button
                      type="button"
                      onClick={() => abrirNotificacion(notificacion)}
                      className={`w-full text-left px-3 py-3 transition-colors ${estilos.hover}`}
                    >
                      <span className="flex items-start gap-2">
                        <span
                          className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                            notificacion.leido ? 'bg-transparent' : 'bg-[#48B3AF]'
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className={`block font-display font-semibold text-xs ${estilos.texto}`}>
                            {notificacion.titulo}
                          </span>
                          <span className={`block mt-0.5 font-mono text-[10px] leading-relaxed ${estilos.subtexto}`}>
                            {notificacion.mensaje}
                          </span>
                          <span className={`block mt-1 font-mono text-[9px] ${estilos.subtexto}`}>
                            {formatearFechaNotificacion(notificacion.creadoEn)}
                          </span>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
