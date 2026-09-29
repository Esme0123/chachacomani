/**
 * ============================================================================
 *  SERVICIO DE AUTENTICACIÓN — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Cliente de los endpoints de `backend/api/auth/`. El servidor emite un token
 *  opaco que este servicio guarda en localStorage y que `apiClient` reenvía en
 *  cada petición como `Authorization: Bearer <token>`.
 *
 *  Rutas (backend/api/index.php)
 *    POST /api/auth/register   -> crea la cuenta (siempre con rol `lectura`)
 *    POST /api/auth/login      -> devuelve { token, usuario }
 *    POST /api/auth/logout     -> revoca el token del servidor
 *    GET  /api/auth/me         -> { usuario, resumenMultas }
 *    PUT  /api/auth/me         -> actualiza nombre y correo
 *    POST /api/auth/password   -> cambia la contraseña
 *
 *  ⚠️ El ROL NUNCA se cambia desde aquí: sólo el Administrador lo hace desde la
 *     consola de gestión de usuarios (`usuariosService`).
 * ============================================================================
 */
import { peticion, guardarToken, borrarToken } from './apiClient';

/* -------------------------------------------------------------------------- */
/* Política de contraseñas (espejo de auth_lib.php::validarContrasena)         */
/* -------------------------------------------------------------------------- */

/** Longitud mínima y máxima que exige el backend. */
export const CONTRASENA_MIN = 8;
export const CONTRASENA_MAX = 72;

/**
 * Valida la contraseña en el cliente para dar respuesta inmediata.
 * Devuelve `null` si es correcta o un mensaje específico de lo que falla.
 * El orden de las comprobaciones va de lo más básico a lo más específico para
 * que el socio reciba siempre la causa exacta y no un bloqueo genérico.
 */
export function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string' || contrasena === '') {
    return 'La contraseña es obligatoria.';
  }
  if (/\s/.test(contrasena)) {
    return 'La contraseña no debe contener espacios en blanco.';
  }
  if (contrasena.length < CONTRASENA_MIN) {
    return `La contraseña debe tener al menos ${CONTRASENA_MIN} caracteres (le faltan ${CONTRASENA_MIN - contrasena.length}).`;
  }
  if (contrasena.length > CONTRASENA_MAX) {
    return `La contraseña no puede superar los ${CONTRASENA_MAX} caracteres (tiene ${contrasena.length}).`;
  }
  if (!/^[A-Za-z0-9]+$/.test(contrasena)) {
    const especiales = [...new Set(contrasena.match(/[^A-Za-z0-9]/g) || [])].join(' ');
    return `La contraseña sólo admite letras y números, sin caracteres especiales (se detectó: «${especiales}»).`;
  }
  if (!/[A-Za-z]/.test(contrasena)) {
    return 'La contraseña debe incluir al menos una letra.';
  }
  if (!/\d/.test(contrasena)) {
    return 'La contraseña debe incluir al menos un número.';
  }
  return null;
}

/**
 * Desglose de la política de contraseñas para mostrarla como lista de
 * requisitos en tiempo real (✓ / ✗) mientras el socio escribe.
 * @returns {{id: string, etiqueta: string, cumple: boolean}[]}
 */
export function requisitosContrasena(contrasena = '') {
  return [
    { id: 'longitud', etiqueta: `Mínimo ${CONTRASENA_MIN} caracteres`, cumple: contrasena.length >= CONTRASENA_MIN && contrasena.length <= CONTRASENA_MAX },
    { id: 'sin-espacios', etiqueta: 'Sin espacios en blanco', cumple: contrasena.length > 0 && !/\s/.test(contrasena) },
    { id: 'alfanumerica', etiqueta: 'Sólo letras y números', cumple: contrasena.length > 0 && /^[A-Za-z0-9]+$/.test(contrasena) },
    { id: 'letra', etiqueta: 'Al menos una letra', cumple: /[A-Za-z]/.test(contrasena) },
    { id: 'numero', etiqueta: 'Al menos un número', cumple: /\d/.test(contrasena) },
  ];
}

/* -------------------------------------------------------------------------- */
/* Sesión                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Inicia sesión con correo y contraseña.
 * @param {string} correo
 * @param {string} contrasena
 * @param {boolean} [recordar=true] Si es false, la sesión sólo dura mientras
 *   el navegador esté abierto (sessionStorage) en vez de persistir 30 días.
 * @returns {Promise<{token: string, usuario: object}>}
 */
export async function login(correo, contrasena, recordar = true) {
  const json = await peticion('auth/login', {
    metodo: 'POST',
    cuerpo: { correo, contrasena },
    token: null,
  });
  guardarToken(json.token, recordar);
  return json;
}

/**
 * Registra un socio nuevo. El backend le asigna siempre el rol `lectura`;
 * los roles superiores los concede un Administrador.
 * @returns {Promise<{token: string, usuario: object}>}
 */
export async function registro(nombre, correo, contrasena, recordar = true) {
  const json = await peticion('auth/register', {
    metodo: 'POST',
    cuerpo: { nombre, correo, contrasena },
    token: null,
  });
  guardarToken(json.token, recordar);
  return json;
}

/**
 * Cierra sesión. El token se revoca en el servidor; si la llamada falla
 * (red caída) la sesión local se descarta igualmente, porque el token queda
 * inutilizable en el cliente de todas formas.
 */
export async function logout() {
  try {
    await peticion('auth/logout', { metodo: 'POST' });
  } catch (error) {
    console.warn('No se pudo revocar el token en el servidor:', error);
  } finally {
    borrarToken();
  }
}

/**
 * Recupera la sesión al cargar la aplicación. Si el token ya caducó o el socio
 * fue desactivado, el backend responde 401 y se descarta el token local.
 * @returns {Promise<object|null>} Usuario autenticado o null.
 */
export async function sesionActual() {
  try {
    const json = await peticion('auth/me');
    return json.usuario || null;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      borrarToken();
      return null;
    }
    // Fallo de red: se mantiene el token para no expulsar al socio sin motivo.
    throw error;
  }
}

/**
 * Perfil del socio autenticado, con el resumen de sus multas.
 * @returns {Promise<{usuario: object, resumenMultas: object}>}
 */
export async function obtenerPerfil() {
  return peticion('auth/me');
}

/**
 * Actualiza los datos del perfil. Sólo admite `nombre` y `correo`.
 * @returns {Promise<{usuario: object}>}
 */
export async function actualizarPerfil(datos) {
  return peticion('auth/me', {
    metodo: 'PUT',
    cuerpo: {
      nombre: datos.nombre,
      correo: datos.correo,
    },
  });
}

/**
 * Cambia la contraseña exigiendo la actual y validando la nueva (8+ alfanuméricos).
 * @returns {Promise<{mensaje: string}>}
 */
export async function cambiarContrasena(contrasenaActual, contrasenaNueva) {
  return peticion('auth/password', {
    metodo: 'POST',
    cuerpo: { contrasenaActual, contrasenaNueva },
  });
}
