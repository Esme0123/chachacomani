import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as drmService from '../services/drmService';
import { useAuth } from './AuthContext';
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas';
import { PERMISO_GESTIONAR_DRM } from '../services/permisosService';

/**
 * ============================================================================
 *  CONTEXTO GLOBAL DE DRM (Protección de Contenido)
 * ============================================================================
 *  Especificación 3.d — «Control exclusivo del DRM»:
 *
 *   · El estado (Activo / Inactivo) vive en el SERVIDOR (tabla
 *     `configuraciones`, clave `drm_activo`). No se guarda en localStorage, de
 *     modo que un cambio del Administrador afecta a todos los socios y a todos
 *     los dispositivos.
 *   · Sólo el rol ADMIN puede alternarlo (`drm:gestionar`). Para los demás
 *     roles el indicador es una ETIQUETA informative, sin capacidad de clic.
 *     El servidor responde 403 a cualquier POST de un rol no autorizado.
 *   · La sincronización es de "tiempo real": polling periódico + revalidación
 *     al volver a la pestaña, de forma que el cambio se refleja en el lector
 *     de normativa y en el resto de vistas sin recargar la página.
 * ============================================================================
 */
const DRMContext = createContext(null);

/** Periodicidad con la que se consulta el estado global del DRM. */
const INTERVALO_MS = 7000;

export function DRMProvider({ children }) {
  const { puede } = useAuth();
  const [drmActivo, setDrmActivo] = useState(true);
  const [actualizadoEn, setActualizadoEn] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [cambiando, setCambiando] = useState(false);

  const puedeGestionar = puede(PERMISO_GESTIONAR_DRM);

  // Carga inicial del estado global.
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const estado = await drmService.obtenerEstadoDrm();
        if (vivo) {
          setDrmActivo(estado.drmActivo);
          setActualizadoEn(estado.actualizadoEn);
          setError(null);
        }
      } catch (err) {
        console.error('No se pudo consultar el estado del DRM:', err);
        if (vivo) setError('No se pudo consultar el estado de la protección DRM.');
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // Refresco en segundo plano: mantiene el estado sincronizado sin recargar.
  const refrescar = useCallback(async () => {
    try {
      const estado = await drmService.obtenerEstadoDrm();
      setDrmActivo(estado.drmActivo);
      setActualizadoEn(estado.actualizadoEn);
    } catch (err) {
      console.error('No se pudo refrescar el estado del DRM:', err);
    }
  }, []);

  useRefrescoEstadisticas(refrescar, { intervaloMs: INTERVALO_MS });

  /**
   * Alterna el DRM globalmente. Exclusivo del Administrador: si el rol no tiene
   * `drm:gestionar` se rechaza aquí mismo y, si aun así llegase al servidor,
   * `drm.php` respondería 403.
   * @returns {Promise<{ok: boolean, mensaje: string}>}
   */
  const alternarDrm = useCallback(async () => {
    if (!puedeGestionar) {
      return {
        ok: false,
        mensaje: 'Sólo el Administrador del sistema puede cambiar el estado del DRM.',
      };
    }
    if (cambiando) return { ok: false, mensaje: 'Actualizando…' };

    const deseado = !drmActivo;
    setCambiando(true);
    try {
      const json = await drmService.cambiarEstadoDrm(deseado);
      setDrmActivo(json.drmActivo !== false);
      setActualizadoEn(json.actualizadoEn || null);
      setError(null);
      return { ok: true, mensaje: json.mensaje };
    } catch (err) {
      const mensaje = err?.message || 'No se pudo cambiar el estado del DRM.';
      setError(mensaje);
      return { ok: false, mensaje };
    } finally {
      setCambiando(false);
    }
  }, [puedeGestionar, drmActivo, cambiando]);

  const valor = useMemo(
    () => ({
      drmActivo,
      actualizadoEn,
      cargando,
      error,
      cambiando,
      puedeGestionar,
      alternarDrm,
      refrescar,
    }),
    [drmActivo, actualizadoEn, cargando, error, cambiando, puedeGestionar, alternarDrm, refrescar]
  );

  return <DRMContext.Provider value={valor}>{children}</DRMContext.Provider>;
}

/** Acceso al estado global del DRM. Lanza si se usa fuera de <DRMProvider>. */
export function useDRMEstado() {
  const contexto = useContext(DRMContext);
  if (!contexto) {
    throw new Error('useDRMEstado() debe usarse dentro de <DRMProvider>.');
  }
  return contexto;
}
