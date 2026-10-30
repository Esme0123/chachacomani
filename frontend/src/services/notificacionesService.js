/**
 * ============================================================================
 *  SERVICIO DE NOTIFICACIONES — Campana del Header
 * ============================================================================
 *  Cliente de `backend/api/notificaciones.php`.
 *
 *  Rutas:
 *    GET /api/notificaciones        -> avisos del usuario + contador
 *    PUT /api/notificaciones        -> marcar uno o todos como leídos
 * ============================================================================
 */
import { peticion } from './apiClient';

/**
 * @returns {Promise<{notificaciones: object[], noLeidas: number}>}
 */
export async function listarNotificaciones() {
  return peticion('notificaciones');
}

/** Marca un aviso como leído. */
export async function marcarLeida(id) {
  return peticion('notificaciones', {
    metodo: 'PUT',
    cuerpo: { id },
  });
}

/** Marca todos los avisos del usuario como leídos. */
export async function marcarTodasLeidas() {
  return peticion('notificaciones', {
    metodo: 'PUT',
    cuerpo: { todas: true },
  });
}
