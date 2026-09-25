/**
 * ============================================================================
 *  SERVICIO DE GESTIÓN DE USUARIOS Y ROLES — sólo Administrador
 * ============================================================================
 *  Cliente de `backend/api/auth/usuarios.php`. Todas las rutas exigen el
 *  permiso `usuarios:gestionar`, que únicamente tiene el rol ADMIN; cualquier
 *  otro rol recibe 403 del servidor.
 *
 *  Rutas: GET|POST|PUT /api/auth/usuarios
 * ============================================================================
 */
import { peticion } from './apiClient';
import { ROLES_SISTEMA } from './permisosService';

/**
 * Lista todos los socios con su rol, estado y resumen de multas.
 * @returns {Promise<{usuarios: object[]}>}
 */
export async function listarUsuarios() {
  return peticion('auth/usuarios');
}

/**
 * Crea un socio con un rol concreto.
 * @param {{nombre:string, correo:string, contrasena:string, rol:string}} datos
 * @returns {Promise<{usuario: object, mensaje: string}>}
 */
export async function crearUsuario({ nombre, correo, contrasena, rol }) {
  return peticion('auth/usuarios', {
    metodo: 'POST',
    cuerpo: { nombre, correo, contrasena, rol },
  });
}

/**
 * Actualiza el rol y/o el estado (activo/inactivo) de un socio.
 * El backend impide degradar o desactivar al último Administrador activo.
 * @param {number} id
 * @param {{rol?: string, activo?: boolean}} cambios
 * @returns {Promise<{usuario: object, mensaje: string}>}
 */
export async function actualizarUsuario(id, cambios) {
  return peticion('auth/usuarios', {
    metodo: 'PUT',
    cuerpo: { id, ...cambios },
  });
}

export { ROLES_SISTEMA };
