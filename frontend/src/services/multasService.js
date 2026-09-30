/**
 * ============================================================================
 *  SERVICIO DE MULTAS — Anexo I del Reglamento Interno
 * ============================================================================
 *  Cliente de `backend/api/multas.php`. Vincula las faltas del Anexo I (la
 *  escala general del Cuadro N.º 1 y las infracciones tipificadas del Cuadro
 *  N.º 2) con los socios.
 *
 *  Además del cliente HTTP expone el catálogo normalizado del Anexo I
 *  (`catalogoInfracciones`, `montoDeOpcion`, `conceptoCobroMulta`), que
 *  comparten la pantalla del Anexo I y el panel de Caja Chica.
 *
 *  Permisos (los valida el servidor en cada llamada):
 *   · `multas:ver_propias`  -> GET devuelve SÓLO las multas del socio solicitante.
 *   · `multas:gestionar`    -> POST registra multas (también cobradas, con
 *                              `cobrar: true`); PUT cambia el estado de pago.
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
/* Catálogo del Anexo I (compartido por el modal y por Caja Chica)              */
/* -------------------------------------------------------------------------- */

/**
 * Construye el catálogo unificado de faltas del Anexo I a partir de las tablas
 * del propio documento (`tema.tablas`), con la misma forma para ambos cuadros:
 *
 *   · Cuadro N.º 1 — categorías de falta con su ESCALA GENERAL. El monto depende
 *     de la reincidencia, así que `niveles` trae los tramos y `monto` es null.
 *   · Cuadro N.º 2 — infracciones tipificadas con monto propio: `niveles` vacío
 *     y `monto` ya resuelto desde el texto del cuadro.
 *
 * Lo consumen `ModalMulta` (Anexo I) y el conmutador «Registrar Multa a Socio»
 * de Caja Chica, para que ambas pantallas ofrezcan exactamente la misma lista.
 *
 * @param {{tablas?: {id:string, filas?: object[]}[]}} tema Anexo I del documento
 * @returns {object[]} Opciones con {clave, grupo, origen, infraccion, articulo,
 *   categoria, niveles, monto, montoTexto, medida, tituloCorto}
 */
export function catalogoInfracciones(tema) {
  const tabla = (id) => tema?.tablas?.find((t) => t.id === id);

  const categorias = (tabla('cuadro-1')?.filas || [])
    // «Reincidencia general» no es una falta sino la regla de repetir el monto
    // máximo de la categoría ya sancionada (Art. 72 / 75): se cubre eligiendo esa
    // misma categoría en su nivel máximo, así que no es una opción propia.
    .filter((fila) => !/reincidencia/i.test(fila.categoria || ''))
    .map((fila) => {
      const categoria = normalizarCategoria(fila.categoria);
      return {
        clave: `c1:${fila.categoria}`,
        grupo: 'Cuadro N.º 1 · Categorías y escala general',
        origen: 1,
        infraccion: fila.descripcion,
        // El alcance del Cuadro N.º 1 es un párrafo largo: para el concepto del
        // cobro se usa la categoría, que es la descripción corta de la falta.
        tituloCorto: fila.categoria,
        articulo: fila.referencia,
        categoria,
        niveles: ESCALA_MULTAS[categoria] || [],
        monto: null,
        montoTexto: fila.multa,
        medida: '',
      };
    });

  const tipificadas = (tabla('cuadro-2')?.filas || []).map((fila, i) => {
    const montoFila = extraerMonto(fila.multa);
    return {
      clave: `c2:${i}`,
      grupo: 'Cuadro N.º 2 · Infracciones tipificadas',
      origen: 2,
      infraccion: fila.infraccion,
      tituloCorto: fila.infraccion,
      articulo: fila.articulo,
      categoria: normalizarCategoria(fila.categoria, montoFila),
      niveles: [],
      monto: montoFila === null ? 0 : montoFila,
      montoTexto: fila.multa,
      medida: fila.medida && fila.medida !== '—' ? fila.medida : '',
    };
  });

  return [...categorias, ...tipificadas];
}

/**
 * Agrupa las opciones del catálogo por cuadro, conservando el orden.
 * @param {object[]} opciones
 * @returns {{nombre: string, items: object[]}[]}
 */
export function agruparPorCuadro(opciones) {
  const bloques = new Map();
  opciones.forEach((item) => {
    if (!bloques.has(item.grupo)) bloques.set(item.grupo, []);
    bloques.get(item.grupo).push(item);
  });
  return [...bloques.entries()].map(([nombre, items]) => ({ nombre, items }));
}

/**
 * Monto que corresponde a una opción del catálogo: el propio de la fila cuando
 * existe (Cuadro N.º 2) o el del tramo elegido de la escala (Cuadro N.º 1).
 * @param {object} item Opción de `catalogoInfracciones`
 * @param {{veces:number, monto:number}|null} [nivel] Tramo de la escala
 * @returns {number} Monto en Bs.
 */
export function montoDeOpcion(item, nivel = null) {
  if (!item) return 0;
  if (item.origen === 1) {
    if (nivel) return Number(nivel.monto);
    return Number(item.niveles?.[0]?.monto ?? 0);
  }
  return Number(item.monto ?? 0);
}

/**
 * Concepto del ingreso con el formato pedido por la Tesorería:
 *   "Multa [Artículo]: [Descripción corta de la infracción] - [Nombre del Socio]"
 * La descripción corta es la infracción tipificada (Cuadro N.º 2) o la categoría
 * de la falta (Cuadro N.º 1), para que el concepto nunca sea un párrafo.
 * @param {object} item Opción de `catalogoInfracciones`
 * @param {string} nombreSocio
 * @returns {string}
 */
export function conceptoCobroMulta(item, nombreSocio) {
  if (!item) return '';
  const referencia = item.articulo || item.categoria || '';
  const descripcion = item.tituloCorto || item.infraccion || '';
  return `Multa ${referencia}: ${descripcion} - ${String(nombreSocio || '').trim()}`.trim();
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
 *
 * Con `cobrar: true` la sanción nace PAGADA y el backend asienta el ingreso en
 * Caja Chica en la misma transacción: es el flujo que usa el conmutador
 * «Registrar Multa a Socio» del panel de Caja Chica, para que el Tesorero no
 * tenga que ir y venir entre el Anexo I y la caja.
 *
 * @param {{socioId:number, infraccion:string, articulo:string, categoria:string,
 *          monto:number, fechaInfraccion:string, medida?:string,
 *          observaciones?:string, cobrar?:boolean, fechaCobro?:string,
 *          conceptoCobro?:string}} datos
 * @returns {Promise<{multa: object, cobro: object, mensaje: string}>}
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
      cobrar: datos.cobrar === true,
      fecha_cobro: datos.cobrar && datos.fechaCobro ? datos.fechaCobro : undefined,
      concepto_cobro: datos.cobrar && datos.conceptoCobro ? datos.conceptoCobro : undefined,
    },
  });
}

/**
 * Cambia el estado de pago de una multa (pendiente / pagada / anulada).
 *
 * Al pasar a «pagada» el backend asienta automáticamente el cobro como
 * INGRESO en Caja Chica (`tipo: ingreso`, `categoria: "Multas cobradas"`,
 * concepto «Cobro de Multa: <socio> - <infracción> (<artículo>)», monto
 * cobrado). El asiento es idempotente porque queda enlazado por `multa_id`.
 * Quien asienta el cobro a mano en el panel de Caja Chica puede desactivar ese
 * comportamiento con `registrarCajaChica: false`.
 *
 * @param {number} id
 * @param {'pendiente'|'pagada'|'anulada'} estado
 * @param {{registrarCajaChica?: boolean, fechaCobro?: string}} [opciones]
 * @returns {Promise<{multa: object, cobro: object, mensaje: string}>}
 */
export async function cambiarEstadoMulta(id, estado, opciones = {}) {
  return peticion('multas', {
    metodo: 'PUT',
    cuerpo: {
      id,
      estado,
      registrar_caja_chica: opciones.registrarCajaChica !== false,
      fecha_cobro: opciones.fechaCobro || undefined,
    },
  });
}
