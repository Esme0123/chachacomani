/**
 * ============================================================================
 *  SERVICIO DE APORTES — Anexo II del Reglamento Interno
 * ============================================================================
 *  Normaliza la tabla «Escala de Aportes al Fondo de Accidentes» del ANEXO II
 *  (`ANEXOS_DATA[1].tablas[0]`, id `cuadro-aportes`) en un catálogo que el
 *  carrito de Caja Chica pueda usar igual que el catálogo del Anexo I.
 *
 *  Los aportes NO tienen tabla propia en la base: al cobrarlos se asientan como
 *  un movimiento de INGRESO en Caja Chica (categoría «Aportes / Fondos»), con el
 *  desglose en el campo `detalle`. Por eso este servicio vive en el frontend:
 *  el backend no necesita conocer la escala, sólo el monto que se le envía.
 *
 *  Filas informativas (sin importe monetario, p. ej. «Forma de recaudación»)
 *  se descartan: no son cobrables.
 * ============================================================================
 */

/** Grupo con el que se rotulan las opciones del carrito. */
const GRUPO_APORTES = 'Anexo II · Escala de Aportes';

/**
 * Extrae el importe en Bs. del texto de la escala.
 * Devuelve `null` cuando la fila no tiene importe (p. ej. «—»).
 * @param {string} textoMonto
 * @returns {number|null}
 */
export function montoDeAporte(textoMonto) {
  if (typeof textoMonto !== 'string' || textoMonto.includes('—')) return null;
  const coincidencia = textoMonto.match(/(\d+(?:[.,]\d+)?)/);
  if (!coincidencia) return null;
  return Number(coincidencia[1].replace(',', '.'));
}

/**
 * ¿El importe de la fila es orientativo y admite edición? Ocurre con el Aporte
 * Extraordinario («Hasta Bs. 100.-»), cuyo monto real decide la Asamblea.
 * @param {string} textoMonto
 * @returns {boolean}
 */
export function esAporteVariable(textoMonto) {
  return typeof textoMonto === 'string' && /hasta|variable/i.test(textoMonto);
}

/**
 * Construye el catálogo de aportes cobrables del Anexo II.
 *
 * @param {{tablas?: {id:string, filas?: object[]}[]}} anexo Anexo II del documento
 * @returns {object[]} Opciones con {clave, grupo, concepto, detalle, monto,
 *   montoTexto, variable}
 */
export function catalogoAportes(anexo) {
  const tabla = anexo?.tablas?.find((t) => t.id === 'cuadro-aportes');
  const filas = tabla?.filas || [];

  return filas
    .map((fila, i) => {
      const monto = montoDeAporte(fila.monto);
      if (monto === null) return null;
      return {
        clave: `a2:${i}`,
        grupo: GRUPO_APORTES,
        concepto: String(fila.concepto || '').trim(),
        detalle: String(fila.periodicidad || '').trim(),
        monto,
        montoTexto: String(fila.monto || '').trim(),
        variable: esAporteVariable(fila.monto),
      };
    })
    .filter(Boolean);
}

/**
 * Etiqueta corta de una opción de aporte para la lista del carrito.
 * @param {object} opcion
 * @returns {string}
 */
export function etiquetaAporte(opcion) {
  if (!opcion) return '';
  return opcion.concepto;
}
