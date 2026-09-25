/**
 * ============================================================================
 *  SERVICIO DE MULTAS — Anexo I del Reglamento Interno
 * ============================================================================
 *  Cliente de `backend/api/multas.php`. Vincula las infracciones tipificadas del
 *  Cuadro N.º 2 (Art. 28.I.a, Art. 10.c, Art. 41, Art. 18.a/b…) con los socios.
 *
 *  Permisos (los valida el servidor en cada llamada):
 *   · `multas:ver_propias`  -> GET devuelve SÓLO las multas del socio solicitante.
 *   · `multas:gestionar`    -> POST registra multas; PUT cambia el estado de pago.
 *
 *  Rutas: GET|POST|PUT /api/multas
 * ============================================================================
 */
import { peticion } from './apiClient';

/** Categorías del ENUM `multas.categoria` (deben coincidir con backend). */
export const CATEGORIAS_MULTA = ['Leve', 'Grave', 'Muy grave', 'Falta gravísima'];

/** Estados del ENUM `multas.estado`. */
export const ESTADOS_MULTA = ['pendiente', 'pagada', 'anulada'];

/**
 * Escala oficial de multas del Cuadro N.º 1 del Anexo I. Se usa para
 * precalcular el monto cuando el Tesorero elige la categoría y la reincidencia.
 * Los montos en Bs. son los del Art. 100 (Disposición Transitoria).
 */
export const ESCALA_MULTAS = {
  Leve: [
    { veces: 1, monto: 0, etiqueta: '1ª vez: Amonestación escrita' },
    { veces: 2, monto: 100, etiqueta: '2ª vez: Bs. 100.-' },
    { veces: 3, monto: 150, etiqueta: '3ª vez: Bs. 150.-' },
  ],
  Grave: [{ veces: 1, monto: 300, etiqueta: 'Bs. 300.-' }],
  'Muy grave': [{ veces: 1, monto: 500, etiqueta: 'Hasta Bs. 500.-' }],
  'Falta gravísima': [{ veces: 1, monto: 0, etiqueta: 'Sin multa pecuniaria (Tribunal de Honor)' }],
};

/**
 * Devuelve el monto oficial sugerido para una categoría y reincidencia dadas.
 * @param {'Leve'|'Grave'|'Muy grave'|'Falta gravísima'} categoria
 * @param {number} reincidencia 1 = primera vez, 2 = segunda, 3 = tercera…
 * @returns {number} Monto en Bs. (0 cuando la sanción no es pecuniaria).
 */
export function montoSegunEscala(categoria, reincidencia = 1) {
  const niveles = ESCALA_MULTAS[categoria];
  if (!niveles || niveles.length === 0) return 0;
  const nivel = niveles[Math.min(Math.max(reincidencia, 1), niveles.length) - 1];
  return nivel.monto;
}

/**
 * Extrae el monto numérico del texto del Cuadro N.º 2 (p. ej. "150 Bs." -> 150).
 * Devuelve `null` cuando la infracción no tiene multa pecunaria ("—").
 * @returns {number|null}
 */
export function extraerMonto(textoMulta) {
  if (typeof textoMulta !== 'string') return null;
  if (textoMulta.includes('—')) return null;
  const coincidencia = textoMulta.match(/(\d+(?:[.,]\d+)?)/);
  if (!coincidencia) return null;
  return Number(coincidencia[1].replace(',', '.'));
}

/**
 * Normaliza la categoría del Cuadro N.º 2 a uno de los valores del ENUM.
 *
 * "Consejeros" NO es una categoría de la escala (el Art. 72 sólo distingue
 * Leve / Grave / Muy grave / Falta gravísima): en el Cuadro N.º 2 indica a QUIÉN
 * se aplica la infracción. En ese caso la severidad se deduce del monto de la
 * propia fila, que es el dato que el ENUM sí sabe expresar.
 *
 * @param {string} categoria Categoría tal como figura en el Cuadro N.º 2.
 * @param {number|null} [monto] Monto de la misma fila, si lo hay.
 * @returns {'Leve'|'Grave'|'Muy grave'|'Falta gravísima'}
 */
export function normalizarCategoria(categoria, monto = null) {
  const texto = String(categoria || '').trim();
  const coincide = CATEGORIAS_MULTA.find(
    (c) => c.toLowerCase() === texto.toLowerCase()
  );
  if (coincide) return coincide;
  if (texto.toLowerCase().includes('muy grave')) return 'Muy grave';
  if (texto.toLowerCase().includes('consejero')) {
    // Inasistencia de CONSEjeros Bs. 150 -> Leve; de munculnya Bs. 300 -> Grave.
    return Number(monto) > 150 ? 'Grave' : 'Leve';
  }
  if (texto.toLowerCase().includes('grave')) return 'Grave';
  return 'Leve';
}

/* -------------------------------------------------------------------------- */
/* Consultas                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Lista las multas visibles para el solicitante.
 * · Rol Lectura  -> únicamente las suyas (el servidor lo impone).
 * · Tesorero/Admin -> las de todos, con filtro opcional de estado.
 *
 * Cuando el solicitante puede gestionar multas, la respuesta incluye además
 * `socios`: el padrón de socios activos para el selector del formulario
 * «Registrar Multa». Así el Tesorero puede imputar sanciones sin necesidad del
 * permiso `usuarios:gestionar`, que es exclusivo del Administrador.
 *
 * @param {{estado?: 'pendiente'|'pagada'|'anulada'}} [filtros]
 * @returns {Promise<{multas: object[], totales: object, puedeGestionar: boolean,
 *                    socios: {id:number,nombre:string,correo:string}[]}>}
 */
export async function listarMultas(filtros = {}) {
  return peticion('multas', { params: { estado: filtros.estado } });
}

/**
 * Historial de multas del socio autenticado. Es la fuente de la tabla
 * «Revisar mis Multas» del perfil: fecha de infracción, monto en Bs. y estado.
 * @returns {Promise<{multas: object[], totales: object, puedeGestionar: boolean}>}
 */
export async function misMultas() {
  return listarMultas();
}

/* -------------------------------------------------------------------------- */
/* Escrituras (Tesorero / Administrador)                                       */
/* -------------------------------------------------------------------------- */

/**
 * Imputa una multa a un socio.
 * @param {{socioId:number, infraccion:string, articulo:string, categoria:string,
 *          monto:number, fechaInfraccion:string, medida?:string,
 *          observaciones?:string}} datos
 * @returns {Promise<{multa: object, mensaje: string}>}
 */
export async function registrarMulta(datos) {
  return peticion('multas', {
    metodo: 'POST',
    cuerpo: {
      socio_id: datos.socioId,
      infraccion: datos.infraccion,
      articulo_referencia: datos.articulo,
      categoria: datos.categoria,
      monto: datos.monto,
      fecha_infraccion: datos.fechaInfraccion,
      medida_complementaria: datos.medida || null,
      observaciones: datos.observaciones || null,
    },
  });
}

/**
 * Cambia el estado de pago de una multa (pendiente / pagada / anulada).
 * @returns {Promise<{multa: object, mensaje: string}>}
 */
export async function cambiarEstadoMulta(id, estado) {
  return peticion('multas', {
    metodo: 'PUT',
    cuerpo: { id, estado },
  });
}
