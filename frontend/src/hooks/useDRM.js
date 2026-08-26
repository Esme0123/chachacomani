import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado useDRM
 * Intercepta eventos de copia, menú contextual (clic derecho) y atajos de teclado clave
 * (Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+P, F12, Ctrl+Shift+I/J/C)
 * Dispara una alerta toast animada indicando "Contenido protegido solo para lectura".
 */
export function useDRM() {
  const [toastMessage, setToastMessage] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const triggerDRMAlert = useCallback((message = 'Contenido protegido solo para lectura') => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  useEffect(() => {
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

    // 3. Interceptar Atajos de Teclado
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
          triggerDRMAlert('Contenido protegido solo para lectura.');
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
    window.addEventListener('keydown', handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [triggerDRMAlert]);

  return {
    toastMessage,
    toastVisible,
    hideToast,
    triggerDRMAlert
  };
}
