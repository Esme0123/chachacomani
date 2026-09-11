/**
 * ============================================================================
 *  SERVICIO DE EVALUACIÓN DE ARTÍCULOS — Capa de datos (SOLO API REAL)
 * ============================================================================
 *  Capa única de datos entre la UI React y el backend PHP + MySQL (backend/).
 *
 *  ⚠️  NO existe fallback a localStorage: los votos y estadísticas provienen
 *      EXCLUSIVAMENTE de los endpoints PHP de la API MySQL, para que los votos
 *      sean globales entre dispositivos:
 *        · POST  /api/votar.php          -> registra el voto (tabla votos_articulos)
 *        · GET   /api/estadisticas.php   -> métricas globales / por capítulo / artículo
 *        · GET   /api/mis_votos.php      -> artículos ya votados por este voter_token
 *
 *      Si el API falla (red caída, HTTP 500/404, credenciales DB erróneas) se
 *      lanza el error y la UI lo muestra en un toast; NADA se guarda en
 *      localStorage como "modo simulado".
 *
 *  ▶ Ruta base: por defecto apunta a `/api` del dominio activo
 *    (`https://dominio/api/votar.php`). Para apuntar a otro lugar, defina
 *    VITE_API_BASE_URL en el build (p. ej. 'https://api.ejemplo.com/backend/api').
 * ============================================================================
 */
import { CAPITULOS_DATA } from '../data/reglamentoData';

const TOKEN_KEY = 'chachacomani_voter_token'; // identidad del navegador (anti-spam)

/* -------------------------------------------------------------------------- */
/* Ruta base del API                                                           */
/* -------------------------------------------------------------------------- */

const RAIZ_API = (() => {
  const configurada = import.meta.env.VITE_API_BASE_URL;
  const base = configurada || `${window.location.origin}/api`;
  return base.replace(/\/+$/, ''); // sin barra final, para concatenar /votar.php
})();

const endpoint = (nombre) => `${RAIZ_API}/${nombre}`;

/* -------------------------------------------------------------------------- */
/* voter_token (anti spam: identifica el navegador)                            */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve (creándolo si hace falta) un UUID único por navegador, guardado en
 * localStorage. Este token es el que persiste la votación en MySQL y el que la
 * base de datos usa en la restricción UNIQUE (articulo_id, voter_token).
 */
export function getVoterToken() {
  try {
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      token = generarUuid();
      localStorage.setItem(TOKEN_KEY, token);
    }
    return token;
  } catch {
    // localStorage no disponible: token efímero para la sesión
    return generarUuid();
  }
}

function generarUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos (v4 sin criptografía dura)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Limpieza única: elimina las claves heredadas del antiguo "modo simulación"
 * (localStorage). Así los contadores y votos de la fase previa dejan de tener
 * influencia y todo se lee desde MySQL.
 */
try {
  localStorage.removeItem('chachacomani_modo_api');
  localStorage.removeItem('chachacomani_votos_articulo_v2');
  localStorage.removeItem('chachacomani_voto_usuario_v2');
} catch {
  /* localStorage no disponible */
}

/* Cache en memoria (no persistida) de articulo_id -> 'positivo' | 'negativo',
   útil para la UI mientras el API anti-spam responde. */
let userVotesCache = {};

/* -------------------------------------------------------------------------- */
/* Votos del usuario (anti-spam: botones bloqueados)                          */
/* -------------------------------------------------------------------------- */

/**
 * Consulta al backend qué artículos ya votó este token. Se ejecuta al cargar
 * la app para deshabilitar los botones ya evaluados.
 */
export async function obtenerMisVotos() {
  const token = getVoterToken();

  let res;
  try {
    res = await fetch(endpoint(`mis_votos.php?voter_token=${encodeURIComponent(token)}`), {
      headers: { Accept: 'application/json' },
    });
  } catch (error) {
    console.error('Error backend:', error);
    throw Object.assign(new Error('No se pudo consultar tus votos en la base de datos.'), { status: 0 });
  }

  if (!res.ok) {
    console.error('Error backend:', `HTTP ${res.status} en ${endpoint('mis_votos.php')}`);
    throw Object.assign(new Error(`No se pudieron obtener tus votos (HTTP ${res.status}).`), { status: res.status });
  }

  const json = await res.json();
  const mapa = {};
  (json.votos || []).forEach((v) => {
    mapa[v.articulo_id] = v.tipo_voto;
  });
  userVotesCache = mapa;
  return mapa;
}

/* -------------------------------------------------------------------------- */
/* Registro de un voto                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Registra la evaluación ("positivo" | "negativo") del artículo en MySQL.
 * Lanza Error { status: 409 } si el token ya había votado ese artículo.
 *
 * @param {number} articuloId - article.id del Reglamento
 * @param {'positivo'|'negativo'} tipoVoto
 * @param {number} [capituloId] - capítulo al que pertenece (para el backend)
 */
export async function votarArticulo(articuloId, tipoVoto, capituloId) {
  const token = getVoterToken();

  if (tipoVoto !== 'positivo' && tipoVoto !== 'negativo') {
    throw new Error('tipo_voto debe ser "positivo" o "negativo"');
  }

  let res;
  try {
    res = await fetch(endpoint('votar.php'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        articulo_id: articuloId,
        capitulo_id: capituloId,
        tipo_voto: tipoVoto,
        voter_token: token,
      }),
    });
  } catch (error) {
    // Fallo de red / DNS / CORS: se expone el error, no se cae a localStorage.
    console.error('Error backend:', error);
    throw Object.assign(new Error('Error al registrar voto en la base de datos.'), { status: 0 });
  }

  if (!res.ok) {
    let mensaje = 'Error al registrar voto en la base de datos.';
    try {
      const err = await res.json();
      if (err && err.error) mensaje = err.error;
    } catch {
      /* cuerpo no JSON */
    }
    console.error('Error backend:', `HTTP ${res.status} en votar.php - ${mensaje}`);
    throw Object.assign(new Error(mensaje), { status: res.status });
  }

  // Solo se cachea la decisión del usuario EN MEMORIA (nada se persiste local).
  userVotesCache = { ...userVotesCache, [articuloId]: tipoVoto };
  return {
    userVote: tipoVoto,
    likes: 0,
    dislikes: 0,
    total: 0,
    aprobacion: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Estadísticas (Dashboard de Administración)                                 */
/* -------------------------------------------------------------------------- */

/**
 * Completa la respuesta del API `estadisticas.php` con el catálogo oficial
 * del Reglamento (CAPITULOS_DATA). El backend solo devuelve los artículos que
 * YA tienen votos; aquí se rellenan los que no tienen registro con contadores
 * en 0 (no se inventan números).
 */
function completarConCatalogo(json) {
  const porArticulo = {};
  (json.capitulos || []).forEach((c) => {
    (c.articulos || []).forEach((a) => {
      porArticulo[a.id] = {
        likes: a.likes,
        dislikes: a.dislikes,
        total: a.total,
        aprobacion: a.aprobacion,
      };
    });
  });

  const capitulos = CAPITULOS_DATA.map((cap) => {
    const articulos = cap.articulos.map((art) => {
      const real = porArticulo[art.id] || { likes: 0, dislikes: 0, total: 0, aprobacion: null };
      return {
        id: art.id,
        numero: art.numero,
        denominacion: art.denominacion,
        likes: real.likes,
        dislikes: real.dislikes,
        total: real.total,
        aprobacion: real.aprobacion,
        userVote: userVotesCache[art.id] || null,
      };
    });

    const likes = articulos.reduce((acc, a) => acc + a.likes, 0);
    const dislikes = articulos.reduce((acc, a) => acc + a.dislikes, 0);
    const totalVotos = likes + dislikes;

    return {
      capituloId: cap.id,
      capituloRomano: cap.numero_romano,
      titulo: cap.titulo,
      likes,
      dislikes,
      totalVotos,
      aprobacion: totalVotos > 0 ? Math.round((likes / totalVotos) * 100) : null,
      articulos,
    };
  });

  const totalVotos = capitulos.reduce((acc, c) => acc + c.totalVotos, 0);
  const totalLikes = capitulos.reduce((acc, c) => acc + c.likes, 0);

  return {
    totalVotos,
    aprobacionGeneral: totalVotos > 0 ? Math.round((totalLikes / totalVotos) * 100) : null,
    capitulos,
  };
}

/**
 * Devuelve las estadísticas desde `api/estadisticas.php` (MySQL).
 * No existe modo simulación: si el API falla, lanza un error visible.
 */
export async function obtenerEstadisticas() {
  const token = getVoterToken();

  let res;
  try {
    res = await fetch(endpoint('estadisticas.php'), {
      headers: {
        Accept: 'application/json',
        'X-Voter-Token': token,
      },
    });
  } catch (error) {
    console.error('Error backend:', error);
    throw new Error('No se pudieron obtener las estadísticas desde la base de datos.');
  }

  if (!res.ok) {
    console.error('Error backend:', `HTTP ${res.status} en ${endpoint('estadisticas.php')}`);
    throw new Error(`No se pudieron obtener las estadísticas (HTTP ${res.status}).`);
  }

  const json = await res.json();
  return completarConCatalogo(json);
}