import { useState, useEffect, useCallback } from 'react';
import { useDRMEstado } from '../context/DRMContext.jsx';

/**
 * Hook `useDRM` — adaptador del bloqueo de contenido.
 *
 * Ya NO decide ni persiste el estado del DRM: lo hace el servidor, a través de
 * `DRMContext` (tabla `configuraciones`, clave `drm_activo`). Este hook se
 * limita a registrar los interceptores de copia, corte, menú contextual y
 * atajos de teclado, y a ofrecer el toast de aviso.
 *
 * El control del interruptor Activo/Inactivo es exclusivo del Administrador
 * (permiso `drm:gestionar`); para los demás roles el indicador es sólo una
 * etiqueta. Ver `DRMContext` y `services/drmService.js`.
 */
export function useDRM() {
  const {
    drmActivo: drmEnabled,
    alternarDrm: toggleDRM,
    cargando,
    cambiando,
  } = useDRMEstado();

  const [toastMessage, setToastMessage] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const triggerDRMAlert = useCallback(
    (message = 'Contenido protegido: Solo lectura y resaltado autorizado') => {
      if (!drmEnabled) return; // con DRM desactivado no se muestra la alerta
      setToastMessage(message);
      setToastVisible(true);
    },
    [drmEnabled]
  );

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  useEffect(() => {
    // Con el DRM desactivado no se registra NINGÚN listener: F12, clic derecho
    // y las herramientas del navegador quedan totalmente libres para depurar.
    if (!drmEnabled) {
      setToastVisible(false);
      return undefined;
    }

    // 1. Interceptar Clic Derecho (Context Menu)
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerDRMAlert('Clic derecho deshabilitado por protección de contenido');
      return false;
    };

    // 2. Interceptar Evento Copiar (Copy)
    const handleCopy = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
      triggerDRMAlert('Copia de texto no permitida. Contenido protegido.');
      return false;
    };

    // 3. Interceptar Evento Cortar (Cut)
    const handleCut = (e) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', '');
      }
      triggerDRMAlert('Cortado de texto no permitido. Contenido de solo lectura.');
      return false;
    };

    // 4. Interceptar Atajos de Teclado
    const handleKeyDown = (e) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // F12 (Herramientas de Desarrollador)
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        triggerDRMAlert('Inspección de código deshabilitada.');
        return false;
      }

      if (isCtrlOrCmd) {
        const key = e.key.toLowerCase();

        // Ctrl + C (Copiar)
        if (key === 'c' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Contenido protegido: Solo lectura y resaltado autorizado.');
          return false;
        }

        // Ctrl + X (Cortar)
        if (key === 'x' && !e.shiftKey) {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Extracción de texto bloqueada. Solo lectura autorizada.');
          return false;
        }

        // Ctrl + U (Ver Código Fuente)
        if (key === 'u') {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Visualización de código fuente bloqueada.');
          return false;
        }

        // Ctrl + S (Guardar Página)
        if (key === 's') {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Descarga de página protegida.');
          return false;
        }

        // Ctrl + P (Imprimir)
        if (key === 'p') {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Impresión directa no autorizada.');
          return false;
        }

        // Ctrl + Shift + I / J / C (DevTools)
        if (e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
          e.preventDefault();
          e.stopPropagation();
          triggerDRMAlert('Acceso a consola de desarrollo restringido.');
          return false;
        }
      }
    };

    // Agregar Listeners
    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('copy', handleCopy, { capture: true });
    window.addEventListener('cut', handleCut, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('cut', handleCut, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [drmEnabled, triggerDRMAlert]);

  return {
    drmEnabled,
    toggleDRM,
    cargando,
    cambiando,
    toastMessage,
    toastVisible,
    hideToast,
    triggerDRMAlert,
  };
}