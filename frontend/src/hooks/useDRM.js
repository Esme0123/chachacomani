import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado useDRM
 *
 * Intercepta eventos de copia, corte, menú contextual (clic derecho) y atajos de
 * teclado clave (Ctrl+C, Ctrl+X, Ctrl+U, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I/J/C)
 * MUNICAMENTE cuando la protección está ENCENDIDA (drmEnabled === true).
 *
 * La seguridad se puede alternar desde el Header y el Panel de Administrador:
 *   · drmEnabled  -> bool  (estado actual)
 *   · toggleDRM() -> cambia ON/OFF y persiste en localStorage ('drm_enabled')
 *   · marcarAdmin()-> marca al usuario como administrador (el DRM inicia OFF)
 *
 * El valor inicial por defecto es OFF en entorno de desarrollo local y para
 * administradores; en producción arranca ON y se conserva la preferencia
 * guardada por el usuario en 'drm_enabled'.
 */
const DRM_KEY = 'drm_enabled';
const ADMIN_KEY = 'chachacomani_admin';

function esEntornoDesarrollo() {
  const host = window.location.hostname;
  return host === '' || host === 'localhost' || host === '127.0.0.1';
}

function esAdminGuardado() {
  try {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  } catch {
    return false;
  }
}

function leerPreferenciaDrm() {
  try {
    const guardado = localStorage.getItem(DRM_KEY);
    if (guardado === 'true') return true;
    if (guardado === 'false') return false;
  } catch {
    /* ignorar */
  }
  // Sin preferencia guardada: OFF en desarrollo local y para administradores.
  return !esEntornoDesarrollo() && !esAdminGuardado();
}

export function useDRM() {
  const [drmEnabled, setDrmEnabled] = useState(() => leerPreferenciaDrm());
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Persiste la preferencia del usuario en localStorage.
  useEffect(() => {
    try {
      localStorage.setItem(DRM_KEY, String(drmEnabled));
    } catch {
      /* localStorage no disponible */
    }
    // Al desactivar la protección se oculta cualquier alerta pendiente.
    if (!drmEnabled) {
      setToastVisible(false);
    }
  }, [drmEnabled]);

  const toggleDRM = useCallback(() => {
    setDrmEnabled((prev) => !prev);
  }, []);

  const marcarAdmin = useCallback(() => {
    try {
      localStorage.setItem(ADMIN_KEY, 'true');
    } catch {
      /* localStorage no disponible */
    }
    setDrmEnabled(false);
  }, []);

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
    if (!drmEnabled) return;

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
    marcarAdmin,
    toastMessage,
    toastVisible,
    hideToast,
    triggerDRMAlert
  };
}