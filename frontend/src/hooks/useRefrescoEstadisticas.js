import { useEffect, useRef } from 'react';

/**
 * Hook de refresco automático de estadísticas.
 *
 * Mantiene los contadores sincronizados entre dispositivos SIN recargar la
 * página mediante dos mecanismos:
 *   1. POLLING: revisa cada `intervaloMs` (por defecto 7s) en segundo plano.
 *   2. FOCUS REVALIDATION: cuando la pestaña vuelve a estar visible / en foco
 *      se hace un re-fetch inmediato (eventos `visibilitychange` y `focus`).
 *
 * @param {Function} refrescar Callback que hace el fetch (debe ser estable).
 * @param {Object} [opciones]
 * @param {number} [opciones.intervaloMs=7000] Cada cuánto ejecutar el polling.
 * @param {boolean} [opciones.activo=true] Si el componente está montado/visible.
 * @param {Array}  [opciones.extraDeps=[]] Disparadores para reiniciar el ciclo
 *                                          (p. ej. isOpen del modal).
 */
export function useRefrescoEstadisticas(refrescar, { intervaloMs = 7000, activo = true, extraDeps = [] } = {}) {
  const refrescarRef = useRef(refrescar);
  refrescarRef.current = refrescar;
  const activoRef = useRef(activo);
  activoRef.current = activo;
  const intervaloRef = useRef(intervaloMs);
  intervaloRef.current = intervaloMs;

  useEffect(() => {
    if (!activoRef.current) return undefined;

    // Evita peticiones cuando la pestaña está oculta (ahorra batería/datos).
    const ejecutar = () => {
      if (document.visibilityState === 'visible') {
        refrescarRef.current?.();
      }
    };

    // 1. Polling periódico en segundo plano
    const timer = setInterval(ejecutar, intervaloRef.current);

    // 2. Revalidación al volver a la pestaña (focus revalidation)
    const alVolverVisible = () => {
      if (document.visibilityState === 'visible') {
        refrescarRef.current?.();
      }
    };
    const alGanarFoco = () => refrescarRef.current?.();

    document.addEventListener('visibilitychange', alVolverVisible);
    window.addEventListener('focus', alGanarFoco);

    return () => {
      // Limpieza: se cancela el intervalo y los listeners al desmontar.
      clearInterval(timer);
      document.removeEventListener('visibilitychange', alVolverVisible);
      window.removeEventListener('focus', alGanarFoco);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activo, ...extraDeps]);
}