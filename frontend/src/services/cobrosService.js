/**
 * ============================================================================
 *  SERVICIO DE COBROS GRUPALES — Carrito del panel de Caja Chica
 * ============================================================================
 *  Cliente de `backend/api/cobros.php`. Envía de una vez las multas del Anexo I
 *  y/o los aportes del Anexo II seleccionados en el carrito: el backend crea las
 *  multas YA PAGADAS y UN ÚNICO movimiento de INGRESO en Caja Chica por el
 *  importe total, con el desglose en `detalle`.
 *
 *  Permisos (los valida el servidor ítem por ítem):
 *   · multas  -> `multas:gestionar`      (Tesorero / Admin)
 *   · aportes -> `caja_chica:gestionar`  (Caja Chica / Admin)
 *
 *  Ruta: POST /api/cobros
 * ============================================================================
 */
import { peticion } from './apiClient';
import {
  CATEGORIA_COBRO_MULTA,
  CATEGORIA_COBRO_APORTE,
  CATEGORIA_COBRO_MIXTO,
} from './cajaChicaService';

/** ¿El ítem del carrito es un aporte del Anexo II? */
export function esAporte(item) {
  return item?.tipo === 'aporte';
}

/** ¿El ítem del carrito es una multa del Anexo I? */
export function esMulta(item) {
  return item?.tipo === 'multa';
}

/**
 * Etiqueta corta del ítem para el concepto del cobro.
 * @param {object} item
 * @returns {string}
 */
export function etiquetaItem(item) {
  if (!item) return '';
  return esAporte(item) ? String(item.concepto || '') : String(item.articulo || '');
}

/** Formatea un monto en Bs. sin decimales sobrantes (300 / 150.5). */
function numeroBs(monto) {
  const numero = Number(monto);
  if (!Number.isFinite(numero)) return '0';
  return String(numero);
}

/**
 * Categoría de Caja Chica que corresponde a la composición del carrito.
 * @param {object[]} items
 * @returns {string}
 */
export function categoriaSegunItems(items) {
  const hayMultas = items.some(esMulta);
  const hayAportes = items.some(esAporte);
  if (hayMultas && hayAportes) return CATEGORIA_COBRO_MIXTO;
  if (hayAportes) return CATEGORIA_COBRO_APORTE;
  if (hayMultas) return CATEGORIA_COBRO_MULTA;
  return CATEGORIA_COBRO_MULTA;
}

/**
 * Compone el concepto del cobro con el mismo formato que el backend:
 *   "Cobro Anexo I/II: [Art. 41 (300 Bs) + Aporte Ordinario (10 Bs)] - Socio: …"
 * @param {object[]} items
 * @param {string} nombreSocio
 * @returns {string}
 */
export function conceptoCobroGrupal(items, nombreSocio) {
  const hayMultas = items.some(esMulta);
  const hayAportes = items.some(esAporte);
  const anexo = hayMultas && hayAportes ? 'Anexo I/II' : hayAportes ? 'Anexo II' : 'Anexo I';

  const lista = items
    .map((item) => `${etiquetaItem(item)} (${numeroBs(item.monto)} Bs)`)
    .join(' + ');

  const socio = String(nombreSocio || '').trim();
  const sufijo = socio ? ` - Socio: ${socio}` : '';
  const texto = `Cobro ${anexo}: [${lista}]${sufijo}`;

  return texto.length > 255 ? `${texto.slice(0, 254)}…` : texto;
}

/** Suma de los importes del carrito. */
export function totalCarrito(items) {
  return items.reduce((suma, item) => suma + Number(item.monto || 0), 0);
}

/**
 * Envía el carrito al backend.
 * @param {{socioId:number, items:object[], fechaCobro?:string,
 *          observaciones?:string, conceptoCobro?:string}} datos
 * @returns {Promise<{cobro: object, mensaje: string}>}
 */
export async function registrarCobroGrupal(datos) {
  const items = (datos.items || []).map((item) =>
    esAporte(item)
      ? { tipo: 'aporte', concepto: item.concepto, monto: item.monto }
      : {
          tipo: 'multa',
          infraccion: item.infraccion,
          articulo: item.articulo,
          categoria: item.categoria,
          monto: item.monto,
          fecha_infraccion: item.fechaInfraccion,
          medida_complementaria: item.medida || '',
          observaciones: item.observaciones || '',
        }
  );

  return peticion('cobros', {
    metodo: 'POST',
    cuerpo: {
      socio_id: datos.socioId,
      fecha_cobro: datos.fechaCobro || undefined,
      observaciones: datos.observaciones || undefined,
      concepto_cobro: datos.conceptoCobro || undefined,
      items,
    },
  });
}
