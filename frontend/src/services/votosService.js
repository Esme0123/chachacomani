/**
 * ============================================================================
 *  SERVICIO DE EVALUACIÓN DE ARTÍCULOS — Capa de datos
 * ============================================================================
 *  Symfony entre la UI React y el backend PHP + MySQL (backend/).
 *
 *  ▶ Modo PRODUCCIÓN (backend real):
 *      Cuando el build se sirve desde el dominio de GoDaddy, el servicio
 *      detecta automáticamente el API en `/backend/api/` y:
 *        · POST  api/votar.php          -> registra el voto (tabla votos_articulos)
 *        · GET   api/estadisticas.php   -> métricas globales / por capítulo / artículo
 *        · GET   api/mis_votos.php      -> artículos ya votados por este voter_token
 *      La base de datos (schema.sql) impone la restricción UNIQUE
 *      (articulo_id, voter_token), de modo que un mismo navegador NO puede
 *      votar el mismo artículo dos veces: el servidor responde HTTP 409.
 *
 *  ▶ Modo SIMULACIÓN (local, sin PHP):
 *      Si el API no responde (p.ej. ejecutando `npm run dev` sin backend),
 *      se activa el modo simulado persistido en localStorage. La firma
 *      pública de las funciones es idéntica, por lo que la UI no cambia.
 *
 *  ▶ cambiar_modo: forzar un modo concreto escribiendo en el puntero de
 *      localStorage en la consola:
 *        localStorage.setItem('chachacomani_modo_api', 'real')
 *        localStorage.setItem('chachacomani_modo_api', 'simulacion')
 * ============================================================================
 */
import { CAPITULOS_DATA } from '../data/reglamentoData';

const TOKEN_KEY = 'chachacomani_voter_token';
const OPCIONES_API = {
  // Base del API. En producción se usa el mismo origen (GoDaddy).
  baseUrl: import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/backend/api`,
  // Forzar un modo concreto (útil en QA). Valores: 'auto' | 'real' | 'simulacion'
  modo: import.meta.env.VITE_API_MODE || 'auto',
};

const NUM_MODOS = {
  REAL: 'real',
  SIMULACION: 'simulacion',
};
const MODO_CACHE_KEY = 'chachacomani_modo_api';

const SIMULACION_STORAGE_KEY = 'chachacomani_votos_articulo_v2';
const SIMULACION_USUARIO_KEY = 'chachacomani_voto_usuario_v2';

let modoResuelto = null; // cache en memoria del modo detectado
let userVotesCache = {}; // articulo_id -> 'positivo' | 'negativo'

/* -------------------------------------------------------------------------- */
/* voter_token (anti spam: identifica el navegador)                            */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve (creándolo si hace falta) un UUID único por navegador, guardado en
 * localStorage. Este token es el que persiste la votación y el que la base de
 * datos usa en la restricción UNIQUE (articulo_id, voter_token).
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

/* -------------------------------------------------------------------------- */
/* Detección de modo: backend real (PHP) o simulación local                   */
/* -------------------------------------------------------------------------- */

function getModoForzado() {
  if (OPCIONES_API.modo === 'real' || OPCIONES_API.modo === 'simulacion') {
    return OPCIONES_API.modo;
  }
  try {
    const guardado = localStorage.getItem(MODO_CACHE_KEY);
    if (guardado === NUM_MODOS.REAL || guardado === NUM_MODOS.SIMULACION) {
      return guardado;
    }
  } catch {
    /* ignorar */
  }
  return null;
}

function guardarModo(modo) {
  try {
    localStorage.setItem(MODO_CACHE_KEY, modo);
  } catch {
    /* ignorar */
  }
}

/**
 * Probar si el API PHP responde. Una sola detección por sesión.
 */
async function detectarModo() {
  if (modoResuelto) return modoResuelto;

  const forzado = getModoForzado();
  if (forzado) {
    modoResuelto = forzado;
    return forzado;
  }

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(`${OPCIONES_API.baseUrl}/estadisticas.php`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timer);

    if (res.ok) {
      const json = await res.json();
      if (json && typeof json === 'object' && 'totalVotos' in json) {
        modoResuelto = NUM_MODOS.REAL;
        guardarModo(NUM_MODOS.REAL);
        return modoResuelto;
      }
    }
  } catch {
    // No hay backend PHP disponible (desarrollo local)
  }

  modoResuelto = NUM_MODOS.SIMULACION;
  guardarModo(NUM_MODOS.SIMULACION);
  return modoResuelto;
}

/** Reintenta la detección (por si el backend se despliega a mitad de sesión). */
export async function reDetectarModo() {
  modoResuelto = null;
  try {
    localStorage.removeItem(MODO_CACHE_KEY);
  } catch {
    /* ignorar */
  }
  await detectarModo();
  return modoResuelto;
}

/* -------------------------------------------------------------------------- */
/* Simulación local (sin backend): mismo de la fase previa                    */
/* -------------------------------------------------------------------------- */

const getEstadoSimulacion = () => {
  try {
    const raw = localStorage.getItem(SIMULACION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const guardarEstadoSimulacion = (estado) => {
  try {
    localStorage.setItem(SIMULACION_STORAGE_KEY, JSON.stringify(estado));
  } catch {
    /* localStorage no disponible */
  }
};

/**
 * En simulación (sin backend) no existe "base de datos"; por lo tanto NO se
 * inventan votos de otros votantes. La semilla inicia todo en 0 y solo
 * refleja los votos reales emitidos por este navegador (persistidos en
 * localStorage).
 */
const garantirSemilla = (estado) => {
  const sembrado = { ...estado };
  CAPITULOS_DATA.forEach((cap) => {
    cap.articulos.forEach((art) => {
      if (!sembrado[art.id]) {
        sembrado[art.id] = {
          likes: 0,
          dislikes: 0,
        };
      }
    });
  });
  return sembrado;
};

/**
 * En simulación se persiste la decisión del usuario en una clave propia:
 * articulo_id -> 'positivo' | 'negativo'. Así la UI recuerda qué votó.
 */
const getSimulacionUsuario = () => {
  try {
    const raw = localStorage.getItem(SIMULACION_USUARIO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const guardarSimulacionUsuario = (st) => {
  try {
    localStorage.setItem(SIMULACION_USUARIO_KEY, JSON.stringify(st));
  } catch {
    /* localStorage no disponible */
  }
};

/* -------------------------------------------------------------------------- */
/* Votos del usuario (usadas por la UI pese al anti-spam)                     */
/* -------------------------------------------------------------------------- */

/** Cache local de articulo_id -> 'positivo' | 'negativo' (lo que votó el navegador). */
export function getMisVotos() {
  return { ...userVotesCache };
}

/**
 * Consulta al backend (o a la simulación) qué artículos ya votó este token.
 * Se ejecuta al cargar la app para deshabilitar los botones ya evaluados.
 */
export async function obtenerMisVotos() {
  const modo = await detectarModo();
  const token = getVoterToken();

  if (modo === NUM_MODOS.REAL) {
    try {
      const res = await fetch(
        `${OPCIONES_API.baseUrl}/mis_votos.php?voter_token=${encodeURIComponent(token)}`,
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const json = await res.json();
        const mapa = {};
        (json.votos || []).forEach((v) => {
          mapa[v.articulo_id] = v.tipo_voto;
        });
        userVotesCache = mapa;
        return mapa;
      }
    } catch {
      // Sin conexión: se usa lo cacheado localmente
    }
  }

  // Modo simulación: los votos del usuario viven en localStorage
  const mio = getSimulacionUsuario();
  userVotesCache = { ...mio };
  return { ...mio };
}

/* -------------------------------------------------------------------------- */
/* Registro de un voto                                                        */
/* -------------------------------------------------------------------------- */

function estadoVotoReal(articuloId) {
  const tipo = userVotesCache[articuloId];
  return { userVote: tipo || null };
}

function aplicarVotoSimulacion(articuloId, tipoVoto) {
  // Anti-spam simulado: un mismo votante no evalua dos veces el mismo artículo
  const mio = getSimulacionUsuario();
  if (mio[articuloId]) {
    throw Object.assign(new Error('Ya has evaluado este artículo'), { status: 409 });
  }

  // Gestiona el estado simulado (todo inicia en 0; solo cuenta lo real).
  garantirSemilla(getEstadoSimulacion());

  const nuevas = { ...mio, [articuloId]: tipoVoto };
  guardarSimulacionUsuario(nuevas);
  userVotesCache = nuevas;

  const resumen = resumenDeVoto(articuloId);
  return {
    likes: resumen.likes,
    dislikes: resumen.dislikes,
    total: resumen.total,
    aprobacion: resumen.aprobacion,
    userVote: tipoVoto,
  };
}

/**
 * En modo simulación: totales = contadores reales de este navegador (todo
 * inicia en 0), emulando el resultado agregado de `estadisticas.php`.
 */
function resumenDeVoto(articuloId) {
  const estado = garantirSemilla(getEstadoSimulacion());
  const miVoto = getSimulacionUsuario()[articuloId];

  const base = estado[articuloId] || { likes: 0, dislikes: 0 };
  const likes = (base.likes || 0) + (miVoto === 'positivo' ? 1 : 0);
  const dislikes = (base.dislikes || 0) + (miVoto === 'negativo' ? 1 : 0);
  const total = likes + dislikes;

  return {
    likes,
    dislikes,
    total,
    aprobacion: total > 0 ? Math.round((likes / total) * 100) : null,
  };
}

/**
 * Registra la evaluación ("positivo" | "negativo") del artículo por parte de
 * este navegador. Lanza Error { status: 409 } si ya había votado ese artículo.
 *
 * @param {number} articuloId - article.id del Reglamento
 * @param {'positivo'|'negativo'} tipoVoto
 * @param {number} [capituloId] - capítulo al que pertenece (para el backend)
 */
export async function votarArticulo(articuloId, tipoVoto, capituloId) {
  const modo = await detectarModo();
  const token = getVoterToken();

  if (tipoVoto !== 'positivo' && tipoVoto !== 'negativo') {
    throw new Error('tipo_voto debe ser "positivo" o "negativo"');
  }

  if (modo === NUM_MODOS.REAL) {
    // -- Backend PHP + MySQL ---------------------------------------------
    const res = await fetch(`${OPCIONES_API.baseUrl}/votar.php`, {
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

    if (!res.ok) {
      let mensaje = 'No se pudo registrar el voto.';
      try {
        const err = await res.json();
        if (err && err.error) mensaje = err.error;
      } catch {
        /* cuerpo no JSON */
      }
      throw Object.assign(new Error(mensaje), { status: res.status });
    }

    // Cachear la decisión del usuario para la UI
    userVotesCache = { ...userVotesCache, [articuloId]: tipoVoto };
    return {
      ...estadoVotoReal(articuloId),
      likes: 0,
      dislikes: 0,
      total: 0,
      aprobacion: null,
    };
  }

  // -- Modo simulación (local) ------------------------------------------
  return aplicarVotoSimulacion(articuloId, tipoVoto);
}

/* -------------------------------------------------------------------------- */
/* Estadísticas (Dashboard de Administración)                                 */
/* -------------------------------------------------------------------------- */

function obtenerEstadisticasSimulacion() {
  const mio = getSimulacionUsuario();

  const capitulos = CAPITULOS_DATA.map((cap) => {
    const articulos = cap.articulos.map((art) => {
      const resumen = resumenDeVoto(art.id);
      return {
        id: art.id,
        numero: art.numero,
        denominacion: art.denominacion,
        likes: resumen.likes,
        dislikes: resumen.dislikes,
        total: resumen.total,
        aprobacion: resumen.aprobacion,
        userVote: mio[art.id] || null,
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
 * Completa la respuesta del API `estadisticas.php` con el catálogo oficial
 * del Reglamento (CAPITULOS_DATA). El backend solo devuelve los artículos que
 * YA tienen votos; aquí se rellenan los que no tienen registro con contadores
 * en 0 (nada de números mock inventados).
 *
 * De este modo el renderizado refleja únicamente la información real guardada
 * en MySQL:
 *   · Artículo sin votos -> likes 0 / dislikes 0 / aprobación null
 *   · Capítulo sin votos -> sigue apareciendo con 0 votos en el Dashboard
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
 * Devuelve las estadísticas (modo real = api/estadisticas.php).
 * La estructura es idéntica en ambos modos para que el Dashboard no cambie.
 */
export async function obtenerEstadisticas() {
  const modo = await detectarModo();
  const token = getVoterToken();

  if (modo === NUM_MODOS.REAL) {
    const res = await fetch(`${OPCIONES_API.baseUrl}/estadisticas.php`, {
      headers: {
        Accept: 'application/json',
        'X-Voter-Token': token,
      },
    });
    if (!res.ok) {
      throw new Error('No se pudieron obtener las estadísticas.');
    }
    const json = await res.json();

    // Se combina el catálogo oficial con los conteos reales de MySQL.
    return completarConCatalogo(json);
  }

  return obtenerEstadisticasSimulacion();
}

/** Nombre legible del modo activo (utilidad para depuración). */
export async function getModoActivo() {
  return detectarModo();
}