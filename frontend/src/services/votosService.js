/**
 * ============================================================================
 *  SERVICIO DE EVALUACIÓN DE ARTÍCULOS — Reglamento Y Estatuto
 * ============================================================================
 *  Capa ÚNICA de votación de la plataforma. Tanto el Reglamento Interno como el
 *  Estatuto Orgánico consumen este servicio; lo que los distingue es el
 *  parámetro `documento` ('reglamento' | 'estatuto') y el catálogo de capítulos
 *  que se le inyecta para completar los artículos que aún no tienen votos.
 *
 *  ⚠️ NO existe fallback a localStorage ni datos simulados: los votos, los
 *      contadores y la verificación de voto único provienen EXCLUSIVAMENTE de
 *      la base de datos del servidor, para que sean globales entre dispositivos.
 *        · POST /api/votos      -> registra el voto (tabla `votos_articulos`)
 *        · GET  /api/votos      -> artículos ya votados por este socio/navegador
 *        · GET  /api/estadisticas -> métricas globales, por capítulo y artículo
 *
 *  La restricción UNIQUE (documento, articulo_id, voter_token) del servidor es
 *  la que garantiza el voto único. Cuando el socio ha iniciado sesión, el token
 *  de sesión viaja como `Authorization: Bearer` y el backend usa la identidad
 *  `u:<id>`; si no hay sesión, se usa el UUID anónimo del navegador.
 *
 *  ▶ Ruta base: `VITE_API_BASE_URL` (o `VITE_API_URL`) en el build; por defecto
 *    `/api` del dominio activo.
 * ============================================================================
 */
import { peticion, leerToken } from './apiClient';

const TOKEN_KEY = 'chachacomani_voter_token'; // identidad del navegador (anti-spam)

/* -------------------------------------------------------------------------- */
/* voter_token (identidad anónima del navegador)                                */
/* -------------------------------------------------------------------------- */

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
 * Devuelve (creándolo si hace falta) un UUID único por navegador.
 * Sólo se usa como identidad de voto cuando el visitante NO ha iniciado sesión:
 * con sesión iniciada manda el `usuario_id` del socio.
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

/**
 * Limpieza única: elimina las claves heredadas del antiguo "modo simulación"
 * (localStorage). Así los contadores y votos de la fase previa dejan de tener
 * influencia y todo se lee desde MySQL. También se borra el voto del Estatuto
 * que se guardaba localmente antes de conectarlo al backend.
 */
try {
  localStorage.removeItem('chachacomani_modo_api');
  localStorage.removeItem('chachacomani_votos_articulo_v2');
  localStorage.removeItem('chachacomani_voto_usuario_v2');
  localStorage.removeItem('chachacomani_estatuto_votos_v1');
} catch {
  /* localStorage no disponible */
}

/**
 * Cache en memoria (no persistida) de articulo_id -> 'positivo' | 'negativo',
 * útil para la UI mientras el API responde.
 */
const cacheVotos = new Map();

/* -------------------------------------------------------------------------- */
/* Fábrica de servicios por documento                                          */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve el objeto `votos` que inyecta `NormativaReaderView`.
 *
 * @param {'reglamento'|'estatuto'} documento
 * @param {Array} capitulos  Catálogo del documento, para completar con ceros los
 *                           artículos que aún no tienen votos registrados.
 */
export function crearVotosService(documento, capitulos) {
  return {
    documento,
    obtenerMisVotos: () => obtenerMisVotos(documento),
    obtenerEstadisticas: () => obtenerEstadisticas(documento, capitulos),
    votarArticulo: (articuloId, tipoVoto, capituloId) =>
      votarArticulo(documento, articuloId, tipoVoto, capituloId),
  };
}

/* -------------------------------------------------------------------------- */
/* Votos del usuario (anti-spam: botones bloqueados)                          */
/* -------------------------------------------------------------------------- */

/**
 * Consulta al backend qué artículos ya votó este socio (o este navegador).
 * @returns {Promise<Object<number, 'positivo'|'negativo'>>}
 */
export async function obtenerMisVotos(documento = 'reglamento') {
  // `votos` es ambiguo en el router: GET devuelve las m��as, POST registra el
  // voto. Para la consulta se usa la ruta explícita `mis-votos`.
  const json = await peticion('mis-votos', {
    params: { documento, voter_token: getVoterToken() },
  });

  const mapa = {};
  (json.votos || []).forEach((v) => {
    mapa[v.articulo_id] = v.tipo_voto;
  });
  cacheVotos.set(documento, mapa);
  return mapa;
}

/* -------------------------------------------------------------------------- */
/* Registro de un voto                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Registra la evaluación ("positivo" | "negativo") de un artículo en MySQL.
 * Lanza `ApiError { status: 409 }` si ese socio ya evaluó el artículo.
 *
 * @param {'reglamento'|'estatuto'} documento
 * @param {number} articuloId
 * @param {'positivo'|'negativo'} tipoVoto
 * @param {number} [capituloId]
 */
export async function votarArticulo(documento, articuloId, tipoVoto, capituloId) {
  if (tipoVoto !== 'positivo' && tipoVoto !== 'negativo') {
    throw new Error('tipo_voto debe ser "positivo" o "negativo"');
  }

  const json = await peticion('votos', {
    metodo: 'POST',
    cuerpo: {
      // El campo `documento` es lo que separa el Reglamento del Estatuto en la
      // tabla `votos_articulos`; sin él ambos corpora se mezclarían.
      documento,
      articulo_id: articuloId,
      capitulo_id: capituloId,
      tipo_voto: tipoVoto,
      voter_token: getVoterToken(),
    },
  });

  // Sólo se cachea la decisión EN MEMORIA (nada se persiste en localStorage).
  const mapa = cacheVotos.get(documento) || {};
  cacheVotos.set(documento, { ...mapa, [articuloId]: tipoVoto });

  return {
    userVote: json.tipo_voto || tipoVoto,
    likes: 0,
    dislikes: 0,
    total: 0,
    aprobacion: null,
  };
}

/* -------------------------------------------------------------------------- */
/* Estadísticas                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Completa la respuesta de `estadisticas.php` con el catálogo oficial del
 * documento. El backend sólo devuelve los artículos que YA tienen votos; aquí se
 * rellenan los que no tienen registro con contadores en 0 (no se inventan
 * números).
 */
function completarConCatalogo(json, documento, capitulos) {
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

  const misVotos = cacheVotos.get(documento) || {};

  const capitulosCompletos = capitulos.map((cap) => {
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
        userVote: misVotos[art.id] || null,
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

  const totalVotos = capitulosCompletos.reduce((acc, c) => acc + c.totalVotos, 0);
  const totalLikes = capitulosCompletos.reduce((acc, c) => acc + c.likes, 0);

  return {
    documento,
    totalVotos,
    aprobacionGeneral: totalVotos > 0 ? Math.round((totalLikes / totalVotos) * 100) : null,
    capitulos: capitulosCompletos,
  };
}

/**
 * Devuelve las estadísticas del documento desde `api/estadisticas.php` (MySQL).
 * No existe modo simulación: si el API falla, lanza un error visible.
 */
export async function obtenerEstadisticas(documento = 'reglamento', capitulos = []) {
  const json = await peticion('estadisticas', { params: { documento } });
  return completarConCatalogo(json, documento, capitulos);
}

/** ¿Hay sesión iniciada? Lo consulta la interfaz para el aviso de voto único. */
export function haySesion() {
  return Boolean(leerToken());
}
