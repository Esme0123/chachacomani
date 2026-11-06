import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import { useAuth } from './AuthContext.jsx'
import * as notificacionesService from '../services/notificacionesService.js'
import NotificacionesToast from '../components/NotificacionesToast.jsx'
import {
  desbloquearAudioNotificaciones,
  reproducirSonidoNotificacion,
} from '../utils/sonidoNotificacion.js'

/**
 * ============================================================================
 *  ESTADO GLOBAL DE NOTIFICACIONES
 * ============================================================================
 *  Fuente única de la campana del Header. Mantiene el contador de no leídas
 *  sincronizado con MySQL sin recargar la página mediante:
 *
 *    1. Polling ligero cada 7 s (sólo con la pestaña visible).
 *    2. Revalidación inmediata al enfocar la ventana o volver a la pestaña.
 *
 *  Al detectar avisos nuevos (comparando los IDs ya conocidos) muestra un
 *  toast flotante y reproduce un tono discreto. El toast se monta aquí una
 *  sola vez, aunque el Header renderice la campana en escritorio y móvil.
 *
 *  Toda suscripción (intervalo y listeners) se libera en el cleanup del
 *  useEffect y en el desmontaje del proveedor.
 * ============================================================================
 */
const INTERVALO_MS = 7000
const DURACION_TOAST_MS = 6000

const NotificacionesContext = createContext(null)

export function NotificacionesProvider({ children }) {
  const { estaAutenticado, usuario } = useAuth()
  const usuarioId = usuario?.id ?? null

  const [notificaciones, setNotificaciones] = useState([])
  const [noLeidas, setNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState(null)

  const idsPreviosRef = useRef(new Set())
  const primeraCargaRef = useRef(true)
  const enVueloRef = useRef(false)
  const avisoTimerRef = useRef(null)
  const generacionRef = useRef(0)

  const cerrarAviso = useCallback(() => {
    if (avisoTimerRef.current) {
      window.clearTimeout(avisoTimerRef.current)
      avisoTimerRef.current = null
    }
    setAviso(null)
  }, [])

  const mostrarAviso = useCallback((nuevas) => {
    if (!nuevas.length) return
    const avisoNuevo = nuevas.length === 1
      ? nuevas[0]
      : {
          id: `lote-${nuevas[0].id}`,
          titulo: `${nuevas.length} notificaciones nuevas`,
          mensaje: 'Revise la campana del Header para ver el detalle de sus avisos.',
        }

    setAviso(avisoNuevo)
    reproducirSonidoNotificacion()

    if (avisoTimerRef.current) {
      window.clearTimeout(avisoTimerRef.current)
    }
    avisoTimerRef.current = window.setTimeout(() => {
      avisoTimerRef.current = null
      setAviso(null)
    }, DURACION_TOAST_MS)
  }, [])

  const recargar = useCallback(async ({ silencioso = true } = {}) => {
    if (!estaAutenticado) return
    if (enVueloRef.current) return

    const generacion = generacionRef.current
    enVueloRef.current = true
    if (!silencioso) setCargando(true)

    try {
      const json = await notificacionesService.listarNotificaciones()
      if (generacion !== generacionRef.current) return

      const lista = Array.isArray(json?.notificaciones) ? json.notificaciones : []

      setNotificaciones(lista)
      setNoLeidas(Number(json?.noLeidas) || 0)

      const idsActuales = new Set(lista.map((n) => n.id))

      if (primeraCargaRef.current) {
        primeraCargaRef.current = false
      } else {
        const nuevas = lista.filter((n) => !idsPreviosRef.current.has(n.id))
        if (nuevas.length > 0) mostrarAviso(nuevas)
      }

      idsPreviosRef.current = idsActuales
    } catch (error) {
      if (!silencioso) {
        console.error('No se pudieron cargar las notificaciones:', error)
      }
    } finally {
      enVueloRef.current = false
      if (!silencioso) setCargando(false)
    }
  }, [estaAutenticado, mostrarAviso])

  const marcarLeida = useCallback(async (id) => {
    setNotificaciones((prev) => prev.map((n) => (n.id === id ? { ...n, leido: true } : n)))
    setNoLeidas((prev) => Math.max(0, prev - 1))

    try {
      const json = await notificacionesService.marcarLeida(id)
      if (typeof json?.noLeidas === 'number') setNoLeidas(json.noLeidas)
    } catch (error) {
      await recargar({ silencioso: true })
      throw error
    }
  }, [recargar])

  const marcarTodasLeidas = useCallback(async () => {
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leido: true })))
    setNoLeidas(0)

    try {
      await notificacionesService.marcarTodasLeidas()
    } catch (error) {
      await recargar({ silencioso: true })
      throw error
    }
  }, [recargar])

  // Polling + revalidación al recuperar el foco. Se reinicia al cambiar de
  // usuario o cerrar sesión; el cleanup cancela intervalo y listeners.
  useEffect(() => {
    generacionRef.current += 1

    if (!estaAutenticado) {
      setNotificaciones([])
      setNoLeidas(0)
      setCargando(false)
      cerrarAviso()
      idsPreviosRef.current = new Set()
      primeraCargaRef.current = true
      return undefined
    }

    primeraCargaRef.current = true
    idsPreviosRef.current = new Set()

    recargar({ silencioso: false })

    const alTic = () => {
      if (document.visibilityState === 'visible') {
        recargar({ silencioso: true })
      }
    }
    const alVolverVisible = () => {
      if (document.visibilityState === 'visible') {
        recargar({ silencioso: true })
      }
    }
    const alGanarFoco = () => recargar({ silencioso: true })

    const temporizador = window.setInterval(alTic, INTERVALO_MS)
    document.addEventListener('visibilitychange', alVolverVisible)
    window.addEventListener('focus', alGanarFoco)

    return () => {
      generacionRef.current += 1
      window.clearInterval(temporizador)
      document.removeEventListener('visibilitychange', alVolverVisible)
      window.removeEventListener('focus', alGanarFoco)
    }
  }, [estaAutenticado, usuarioId, recargar, cerrarAviso])

  // Desbloquea el audio con el primer gesto del usuario (política de autoplay).
  useEffect(() => {
    const desbloquear = () => desbloquearAudioNotificaciones()
    window.addEventListener('pointerdown', desbloquear, { once: true })
    window.addEventListener('keydown', desbloquear, { once: true })
    return () => {
      window.removeEventListener('pointerdown', desbloquear)
      window.removeEventListener('keydown', desbloquear)
    }
  }, [])

  // Limpieza del temporizador del toast al desmontar el proveedor.
  useEffect(() => () => {
    if (avisoTimerRef.current) {
      window.clearTimeout(avisoTimerRef.current)
      avisoTimerRef.current = null
    }
  }, [])

  const valor = useMemo(() => ({
    notificaciones,
    noLeidas,
    cargando,
    recargar,
    marcarLeida,
    marcarTodasLeidas,
  }), [notificaciones, noLeidas, cargando, recargar, marcarLeida, marcarTodasLeidas])

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
      <NotificacionesToast aviso={aviso} onCerrar={cerrarAviso} />
    </NotificacionesContext.Provider>
  )
}

/** Acceso al estado global de notificaciones. */
export function useNotificaciones() {
  const contexto = useContext(NotificacionesContext)
  if (!contexto) {
    throw new Error('useNotificaciones() debe usarse dentro de <NotificacionesProvider>.')
  }
  return contexto
}
