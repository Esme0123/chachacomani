/**
 * ============================================================================
 *  SERVICIO DE DRM (Protección de Contenido) — Cooperativo Nevado Chachacomani
 * ============================================================================
 *  Cliente de `backend/api/drm.php`. El estado del DRM es GLOBAL: se guarda en
 *  la tabla `configuraciones` (clave `drm_activo`) y por tanto se comparte
 *  entre todos los dispositivos y"Socios" de la Cooperativa.
 *
 *  Permisos:
 *   · GET  -> público. Todos ven si la protección está activa.
 *   · POST -> exige `drm:gestionar`, que sólo tiene el rol ADMIN.
 *             Cualquier otro rol recibe 403 del servidor.
 *
 *  Rutas: GET|POST /api/drm
 * ============================================================================
 */
import { peticion } from './apiClient';

/**
 * Consulta el estado global del DRM.
 * @returns {Promise<{drmActivo: boolean, actualizadoEn: string|null, origen: string}>}
 */
export async function obtenerEstadoDrm() {
  const json = await peticion('drm');
  return {
    drmActivo: json.drmActivo !== false,
    actualizadoEn: json.actualizadoEn || null,
    origen: json.origen || null,
  };
}

/**
 * Activa o desactiva el DRM para TODA la plataforma. Sólo el Administrador.
 * @param {boolean} activo
 * @returns {Promise<{drmActivo: boolean, actualizadoEn: string, mensaje: string}>}
 */
export async function cambiarEstadoDrm(activo) {
  return peticion('drm', {
    metodo: 'POST',
    cuerpo: { activo: Boolean(activo) },
  });
}
