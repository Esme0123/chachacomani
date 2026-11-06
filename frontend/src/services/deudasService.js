/**
 * ============================================================================
 *  SERVICIO DE DEUDAS — Multas (Anexo I) y aportes (Anexo II)
 * ============================================================================
 *  Cliente de `backend/api/deudas.php` y `backend/api/notificar_pago.php`.
 *
 *  Ciclo de vida:
 *    pendiente -> en_revision (el socio reporta el pago)
 *              -> cancelado   (Tesorero / Caja Chica / Admin aprueba)
 *
 *  Rutas:
 *    GET|POST|PUT /api/deudas
 *    POST         /api/notificar-pago   (multipart/form-data)
 * ============================================================================
 */
import { peticion } from './apiClient';

export const TIPO_DEUDA_MULTA = 'multa_anexo_1';
export const TIPO_DEUDA_APORTE = 'aporte_anexo_2';

export const TIPOS_DEUDA = [
  { id: TIPO_DEUDA_MULTA, etiqueta: 'Multa (Anexo I)' },
  { id: TIPO_DEUDA_APORTE, etiqueta: 'Aporte (Anexo II)' },
];

export const ESTADOS_DEUDA = ['pendiente', 'en_revision', 'cancelado'];

export const ETIQUETA_ESTADO_DEUDA = {
  pendiente: 'Pendiente',
  en_revision: 'En revisión',
  cancelado: 'Cancelado',
};

export const ETIQUETA_TIPO_DEUDA = {
  [TIPO_DEUDA_MULTA]: 'Multa (Anexo I)',
  [TIPO_DEUDA_APORTE]: 'Aporte (Anexo II)',
};

export const METODOS_PAGO = [
  { id: 'efectivo', etiqueta: 'Efectivo' },
  { id: 'qr', etiqueta: 'Transferencia / QR' },
  { id: 'transferencia', etiqueta: 'Transferencia bancaria' },
];

/**
 * Lista las deudas visibles para el solicitante.
 * El backend fuerza el socio cuando el rol es Lectura.
 *
 * @param {{estado?: string, tipo?: string, socioId?: number,
 *          propias?: boolean}} [filtros]
 * @returns {Promise<{deudas: object[], totales: object, puedeGestionar: boolean,
 *                    socios: object[]}>}
 */
export async function listarDeudas(filtros = {}) {
  return peticion('deudas', {
    params: {
      estado: filtros.estado,
      tipo: filtros.tipo,
      socio_id: filtros.socioId,
      propias: filtros.propias ? 1 : undefined,
    },
  });
}

/** Deudas del socio autenticado (perfil «Mis Deudas»), aunque sea staff. */
export async function misDeudas() {
  return listarDeudas({ propias: true });
}

/**
 * Emite una deuda y notifica al socio.
 * @param {{socioId:number, concepto:string, monto:number, tipo:string,
 *          fechaEmision?:string}} datos
 */
export async function emitirDeuda(datos) {
  return peticion('deudas', {
    metodo: 'POST',
    cuerpo: {
      socio_id: datos.socioId,
      concepto: datos.concepto,
      monto: datos.monto,
      tipo: datos.tipo,
      fecha_emision: datos.fechaEmision || undefined,
    },
  });
}

/**
 * Aprueba (cancela) o reabre una deuda.
 * @param {number} id
 * @param {'cancelado'|'pendiente'|'en_revision'} estado
 */
export async function cambiarEstadoDeuda(id, estado) {
  return peticion('deudas', {
    metodo: 'PUT',
    cuerpo: { id, estado },
  });
}

/**
 * Actualiza el comprobante o el método de pago de una deuda sin cambiar su
 * estado ni duplicar el ingreso en Caja Chica.
 * @param {number} id
 * @param {{nroComprobante?:string, metodoPago?:string}} datos
 */
export async function actualizarComprobanteDeuda(id, datos) {
  return peticion('deudas', {
    metodo: 'PUT',
    cuerpo: {
      id,
      nro_comprobante: datos.nroComprobante ?? undefined,
      metodo_pago: datos.metodoPago ?? undefined,
    },
  });
}

/**
 * Reporta el pago de una deuda con comprobante opcional.
 * @param {{deudaId:number, metodoPago:string, nroComprobante?:string,
 *          archivo?:File|null}} datos
 */
export async function reportarPago(datos) {
  const formData = new FormData();
  formData.append('deuda_id', String(datos.deudaId));
  formData.append('metodo_pago', datos.metodoPago);
  if (datos.nroComprobante) {
    formData.append('nro_comprobante', datos.nroComprobante);
  }
  if (datos.archivo) {
    formData.append('comprobante', datos.archivo);
  }

  return peticion('notificar-pago', { metodo: 'POST', formData });
}
