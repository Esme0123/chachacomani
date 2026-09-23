/**
 * ============================================================================
 *  SERVICIO LOCAL DE EVALUACIÓN DE ARTÍCULOS — Estatuto Orgánico
 * ============================================================================
 *  El backend PHP + MySQL (votosService.js) administra EXCLUSIVAMENTE los votos
 *  del Reglamento Interno. Para que el Estatuto Orgánico conserve el módulo de
 *  "Estadísticas" 100% en el frontend, este servicio espeja la misma API:
 *
 *    · obtenerMisVotos()      -> artículos ya evaluados por este navegador
 *    · obtenerEstadisticas()  -> métricas globales / por capítulo / por artículo
 *    · votarArticulo()        -> registra el voto (localStorage)
 *
 *  Los datos se persisten en localStorage bajo una clave dedicada al Estatuto,
 *  por lo que no interfieren con los votos globales del Reglamento.
 * ============================================================================
 */
import { ESTATUTO_CAPITULOS } from '../data/estatutoData';

const STORE_KEY = 'chachacomani_estatuto_votos_v1';

/* -------------------------------------------------------------------------- */
/* Persistencia local                                                         */
/* -------------------------------------------------------------------------- */

function leerRegistro() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const datos = raw ? JSON.parse(raw) : {};
    return typeof datos === 'object' && datos !== null ? datos : {};
  } catch {
    return {};
  }
}

/**
 * Guarda la estructura { [articuloId]: { tipo, capituloId } }.
 * Devuelve true si localStorage está disponible.
 */
function guardarRegistro(registro) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(registro));
    return true;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* Votos del usuario (anti-spam: botones bloqueados)                           */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve el mapa articulo_id -> 'positivo' | 'negativo' de este navegador.
 * Es una promesa para mantener el mismo contrato async de votosService.
 */
export async function obtenerMisVotos() {
  const registro = leerRegistro();
  const mapa = {};
  Object.keys(registro).forEach((id) => {
    mapa[id] = registro[id].tipo;
  });
  return mapa;
}

/* -------------------------------------------------------------------------- */
/* Registro de un voto                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Registra la evaluación ("positivo" | "negativo") de un artículo del Estatuto
 * en localStorage. Lanza Error { status: 409 } si este navegador ya había
 * evaluado ese artículo.
 *
 * @param {number} articuloId - article.id del Estatuto
 * @param {'positivo'|'negativo'} tipoVoto
 * @param {number} [capituloId] - capítulo al que pertenece
 */
export async function votarArticulo(articuloId, tipoVoto, capituloId) {
  if (tipoVoto !== 'positivo' && tipoVoto !== 'negativo') {
    throw new Error('tipo_voto debe ser "positivo" o "negativo"');
  }

  const registro = leerRegistro();
  const articuloIdStr = String(articuloId);

  if (registro[articuloIdStr]) {
    throw Object.assign(new Error('Ya has evaluado este artículo.'), { status: 409 });
  }

  registro[articuloIdStr] = { tipo: tipoVoto, capituloId: capituloId || null };
  guardarRegistro(registro);

  const stats = await obtenerEstadisticas();
  const porArticulo = {};
  stats.capitulos.forEach((c) => {
    c.articulos.forEach((a) => {
      porArticulo[a.id] = {
        likes: a.likes,
        dislikes: a.dislikes,
        total: a.total,
        aprobacion: a.aprobacion,
      };
    });
  });
  const a = porArticulo[articuloId] || { likes: 0, dislikes: 0, total: 0, aprobacion: null };

  return {
    userVote: tipoVoto,
    likes: a.likes,
    dislikes: a.dislikes,
    total: a.total,
    aprobacion: a.aprobacion,
  };
}

/* -------------------------------------------------------------------------- */
/* Estadísticas (Dashboard de Administración)                                  */
/* -------------------------------------------------------------------------- */

/**
 * Construye las estadísticas del Estatuto a partir del catálogo oficial
 * (ESTATUTO_CAPITULOS) y de los votos guardados en localStorage, con la misma
 * forma que devuelve el API `estadisticas.php` del Reglamento.
 */
export async function obtenerEstadisticas() {
  const registro = leerRegistro();

  const capitulos = ESTATUTO_CAPITULOS.map((cap) => {
    const articulos = cap.articulos.map((art) => {
      const voto = registro[String(art.id)];
      const likes = voto && voto.tipo === 'positivo' ? 1 : 0;
      const dislikes = voto && voto.tipo === 'negativo' ? 1 : 0;
      const total = likes + dislikes;
      return {
        id: art.id,
        numero: art.numero,
        denominacion: art.denominacion,
        likes,
        dislikes,
        total,
        aprobacion: total > 0 ? Math.round((likes / total) * 100) : null,
        userVote: voto ? voto.tipo : null,
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