/**
 * ============================================================================
 *  CLIENTE HTTP ÚNICO — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Punto de entrada de TODA la comunicación con el backend PHP + MySQL
 *  (backend/). Ninguna vista ni servicio debe usar `fetch` directamente.
 *
 *  Responsabilidades
 *  -----------------
 *   1. Resolver la raíz del API (`VITE_API_BASE_URL` o `/api` del dominio).
 *   2. Adjuntar el token de sesión (`Authorization: Bearer <token>`) que
 *      devuelve `POST /api/auth/login`, leído de localStorage.
 *   3. Traducir rutas limpias (`auth/login`) a su archivo real (`auth/login.php`)
 *      cuando el hosting no soporta `mod_rewrite`: primero se intenta la ruta
 *      limpia y, si responde 404, se reintenta con la extensión `.php`.
 *   4. Normalizar los errores del servidor a `Error { status, payload }` para
 *      que la UI pueda mostrar el mensaje que devuelve el backend.
 * ============================================================================
 */

/* -------------------------------------------------------------------------- */
/* Sesión                                                                      */
/* -------------------------------------------------------------------------- */

export const TOKEN_KEY = 'chachacomani_token';

/** Devuelve el token de sesión guardado, o null si no hay sesión iniciada. */
export function leerToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/** Guarda el token de sesión (lo devuelve el login y el registro). */
export function guardarToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* localStorage no disponible: la sesión durará lo que dure la recarga */
  }
}

/** Descarta el token de sesión (cierre de sesión). */
export function borrarToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* localStorage no disponible */
  }
}

/* -------------------------------------------------------------------------- */
/* Raíz del API                                                                */
/* -------------------------------------------------------------------------- */

const RAIZ_API = (() => {
  const configurada =
    import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
  const base = configurada || `${window.location.origin}/api`;
  return base.replace(/\/+$/, ''); // sin barra final, para concatenar
})();

export function raizApi() {
  return RAIZ_API;
}

/* -------------------------------------------------------------------------- */
/* Rutas limpias -> archivos .php                                              */
/* -------------------------------------------------------------------------- */

/**
 * Equivalencia entre la ruta limpia publicada por `api/index.php` y el archivo
 * PHP real, para los hostings sin mod_rewrite (GoDaddy compartido, etc.).
 */
const ALIAS_PHP = {
  'auth/register': 'auth/registro.php',
  'auth/registro': 'auth/registro.php',
  'auth/login': 'auth/login.php',
  'auth/logout': 'auth/logout.php',
  'auth/me': 'auth/perfil.php',
  'auth/perfil': 'auth/perfil.php',
  'auth/profile': 'auth/perfil.php',
  'auth/password': 'auth/password.php',
  'auth/cambiar-password': 'auth/password.php',
  'auth/usuarios': 'auth/usuarios.php',
  usuarios: 'auth/usuarios.php',
  drm: 'drm.php',
  multas: 'multas.php',
  'caja-chica': 'caja_chica.php',
  caja_chica: 'caja_chica.php',
  votos: 'votar.php',
  votar: 'votar.php',
  'mis-votos': 'mis_votos.php',
  estadisticas: 'estadisticas.php',
};

/* -------------------------------------------------------------------------- */
/* Errores                                                                     */
/* -------------------------------------------------------------------------- */

/** Error de API con el código HTTP y el cuerpo JSON que devolvió el servidor. */
export class ApiError extends Error {
  constructor(mensaje, status, payload = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }

  /** 401: la sesión caducó o el socio no ha iniciado sesión. */
  get esNoAutorizado() {
    return this.status === 401;
  }

  /** 403: el rol del socio no tiene permiso para esta operación. */
  get esProhibido() {
    return this.status === 403;
  }
}

/* -------------------------------------------------------------------------- */
/* Petición                                                                    */
/* -------------------------------------------------------------------------- */

function construirUrl(ruta, params) {
  const url = new URL(`${RAIZ_API}/${ruta.replace(/^\/+/, '')}`);
  if (params) {
    Object.entries(params).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        url.searchParams.set(clave, valor);
      }
    });
  }
  return url.toString();
}

function cabeceras({ metodo, cuerpo, token }) {
  const cabeceras = { Accept: 'application/json' };

  if (cuerpo !== undefined) {
    cabeceras['Content-Type'] = 'application/json; charset=utf-8';
  }

  // El token es lo que convierte un voto anónimo en un voto de socio con
  // voto único garantizado por el backend (identidad `u:<id>`).
  const sesion = token === undefined ? leerToken() : token;
  if (sesion) {
    cabeceras.Authorization = `Bearer ${sesion}`;
  }

  if (metodo === 'GET') {
    cabeceras['X-Voter-Token'] = sesion || '';
  }

  return cabeceras;
}

/**
 * Ejecuta una petición contra el API y devuelve el JSONparseado.
 *
 * @param {string} ruta   Ruta limpia, p. ej. 'auth/login' o 'drm.php'.
 * @param {object} [opciones]
 * @param {'GET'|'POST'|'PUT'} [opciones.metodo='GET']
 * @param {object}         [opciones.cuerpo]   Objeto serializado a JSON.
 * @param {object}         [opciones.params]   Query string.
 * @param {string|null}    [opciones.token]    Fuerza el token (logout usa null).
 * @returns {Promise<object>}
 * @throws {ApiError}
 */
export async function peticion(ruta, opciones = {}) {
  const { metodo = 'GET', cuerpo, params, token } = opciones;

  const ejecutar = async (destino) => {
    const opcionesFetch = {
      method: metodo,
      headers: cabeceras({ metodo, cuerpo, token }),
    };
    if (cuerpo !== undefined) {
      opcionesFetch.body = JSON.stringify(cuerpo);
    }
    return fetch(construirUrl(destino, params), opcionesFetch);
  };

  let res;
  try {
    res = await ejecutar(ruta);
  } catch (error) {
    // DNS caído, CORS bloqueado o servidor inaccesible: no hay respuesta HTTP.
    console.error('Error de red contacting el API:', error);
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      0
    );
  }

  // El hosting no soporta mod_rewrite: se reintenta con el archivo .php real.
  if (res.status === 404 && !ruta.endsWith('.php') && ALIAS_PHP[ruta]) {
    try {
      res = await ejecutar(ALIAS_PHP[ruta]);
    } catch (error) {
      console.error('Error de red contacting el API:', error);
      throw new ApiError(
        'No se pudo conectar con el servidor. Verifique su conexión a internet.',
        0
      );
    }
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* cuerpo vacío o no-JSON: se maneja con el status más abajo */
  }

  if (!res.ok || (json && json.ok === false)) {
    const mensaje =
      (json && json.error) ||
      `Error del servidor (HTTP ${res.status}).`;
    console.error(`Error API ${metodo} /${ruta}:`, mensaje, json);
    throw new ApiError(mensaje, res.status, json);
  }

  return json || {};
}
