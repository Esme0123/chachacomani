/**
 * ============================================================================
 *  SERVICIO DE CAJA CHICA
 * ============================================================================
 *  Cliente de `backend/api/caja_chica.php`. Panel de ingresos y egresos menores
 *  para el rol Caja Chica (y el Administrador).
 *
 *  Permisos:
 *   · `caja_chica:gestionar` -> registra movimientos (POST).
 *   · `contabilidad:ver`      -> consulta movimientos y saldos (GET).
 *     El Tesorero tiene este segundo permiso: puede consultar la caja pero no
 *     registrarla.
 *
 *  Rutas: GET|POST /api/caja-chica
 * ============================================================================
 */
import { peticion } from './apiClient';

/** Categorías admitidas (deben coincidir con CATEGORIAS_CAJA del backend). */
export const CATEGORIAS_CAJA = [
  'Otros',
  'Transporte',
  'Alimentación',
  'Material de oficina',
  'Combustible',
  'Mantenimiento',
  'Aportes',
  'Multas cobradas',
  'Retiros',
];

/**
 * Consulta los movimientos de caja chica de un periodo (`YYYY-MM`).
 * @param {{mes?: string}} [filtros] Periodo; por defecto el mes en curso.
 * @returns {Promise<{periodo: string|null, movimientos: object[], totales: object, puedeRegistrar: boolean}>}
 */
export async function listarMovimientos(filtros = {}) {
  return peticion('caja-chica', { params: { mes: filtros.mes } });
}

/**
 * Registra un ingreso o egreso menor.
 * @param {{tipo:'ingreso'|'egreso', concepto:string, categoria:string,
 *          monto:number, fecha:string, observaciones?:string}} datos
 * @returns {Promise<{movimiento: object, mensaje: string}>}
 */
export async function registrarMovimiento(datos) {
  return peticion('caja-chica', {
    metodo: 'POST',
    cuerpo: {
      tipo: datos.tipo,
      concepto: datos.concepto,
      categoria: datos.categoria,
      monto: datos.monto,
      fecha: datos.fecha,
      observaciones: datos.observaciones || null,
    },
  });
}
