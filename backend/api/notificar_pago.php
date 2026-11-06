<?php
/**
 * ============================================================================
 *  REPORTE DE PAGO DE UNA DEUDA
 * ============================================================================
 *  POST /api/notificar-pago   (multipart/form-data o JSON)
 *
 *  El socio reporta el pago de una deuda con método, número de comprobante y
 *  una foto/PDF opcional. La deuda pasa a `en_revision` y se notifica a
 *  Tesorería, Caja Chica y Administración para que aprueben el pago.
 *
 *  Campos:
 *    · deuda_id          (obligatorio)
 *    · metodo_pago       efectivo | qr | transferencia
 *    · nro_comprobante   texto libre (opcional)
 *    · comprobante       archivo JPG/PNG/WEBP/PDF (opcional, máx. 5 MB)
 * ============================================================================
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

if (metodoHttp() !== 'POST') {
    jsonError('Método no permitido. Use POST.', 405);
}

if (!tablaTieneColumna('deudas_multas', 'id')) {
    jsonError('El módulo de deudas aún no está habilitado: ejecute backend/migrar.php.', 409);
}

$usuario = exigirUsuario();

$esMultipart = isset($_SERVER['CONTENT_TYPE'])
    && stripos((string) $_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false;
$datos = $esMultipart ? $_POST : leerBodyJson();

$deudaId = (int) ($datos['deuda_id'] ?? ($datos['id'] ?? 0));
$metodoPago = strtolower(trim((string) ($datos['metodo_pago'] ?? '')));
$nroComprobante = textoLimpio($datos['nro_comprobante'] ?? '', 100);

if ($deudaId <= 0) {
    jsonError('Debe indicar la deuda que desea reportar.', 400);
}
if (!in_array($metodoPago, ['efectivo', 'qr', 'transferencia'], true)) {
    jsonError('Método de pago no válido. Use efectivo, qr o transferencia.', 400);
}

$stmt = db()->prepare(
    'SELECT d.*, s.nombre AS socio_nombre
       FROM `deudas_multas` d
       JOIN `usuarios` s ON s.id = d.socio_id
      WHERE d.id = :id'
);
$stmt->execute([':id' => $deudaId]);
$deuda = $stmt->fetch();
if (!$deuda) {
    jsonError('La deuda indicada no existe.', 404);
}

$esStaff = in_array($usuario['rol'], [ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN], true);
if (!$esStaff && (int) $deuda['socio_id'] !== (int) $usuario['id']) {
    jsonError('Solo puede reportar el pago de sus propias deudas.', 403);
}
if ($deuda['estado'] === 'cancelado') {
    jsonError('Esta deuda ya fue cancelada; no es necesario reportar el pago.', 409);
}

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Comprobante (opcional)                                                      */
/* -------------------------------------------------------------------------- */

$comprobanteUrl = null;
if (isset($_FILES['comprobante']) && is_array($_FILES['comprobante'])) {
    $comprobanteUrl = guardarArchivoComprobante($_FILES['comprobante'], 'comprobante_' . $deudaId);
}

/* -------------------------------------------------------------------------- */
/* Monto del abono / pago reportado                                           */
/* -------------------------------------------------------------------------- */

$montoTotal = (float) $deuda['monto'];
$montoYaPagado = isset($deuda['monto_pagado']) ? (float) $deuda['monto_pagado'] : 0.0;
$saldoActual = isset($deuda['saldo_pendiente']) && (float) $deuda['saldo_pendiente'] > 0
    ? (float) $deuda['saldo_pendiente']
    : max(0.0, $montoTotal - $montoYaPagado);

$montoAbono = isset($_POST['monto_abono']) && trim((string) $_POST['monto_abono']) !== ''
    ? (float) str_replace(',', '.', (string) $_POST['monto_abono'])
    : $saldoActual;

if ($montoAbono <= 0) {
    $montoAbono = $saldoActual;
}
$montoAbono = min($montoAbono, $saldoActual > 0 ? $saldoActual : $montoTotal);

/* -------------------------------------------------------------------------- */
/* Actualización y avisos                                                      */
/* -------------------------------------------------------------------------- */

$pdo = db();
try {
    $pdo->beginTransaction();

    if (tablaTieneColumna('abonos_deudas', 'id')) {
        $pdo->prepare(
            'INSERT INTO `abonos_deudas`
                (`deuda_id`, `monto`, `metodo_pago`, `nro_comprobante`, `comprobante_url`, `observaciones`, `registrado_por`)
             VALUES
                (:deuda_id, :monto, :metodo, :nro, :url, :obs, :reg)'
        )->execute([
            ':deuda_id' => $deudaId,
            ':monto' => $montoAbono,
            ':metodo' => $metodoPago,
            ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
            ':url' => $comprobanteUrl,
            ':obs' => 'Abono reportado por el socio.',
            ':reg' => (int) $usuario['id'],
        ]);
    }

    $nuevoPagado = round($montoYaPagado + $montoAbono, 2);
    $nuevoSaldo = max(0.0, round($montoTotal - $nuevoPagado, 2));

    if (tablaTieneColumna('deudas_multas', 'monto_pagado')) {
        $pdo->prepare(
            'UPDATE `deudas_multas`
                SET `estado` = \'en_revision\',
                    `monto_pagado` = :pagado,
                    `saldo_pendiente` = :saldo,
                    `metodo_pago` = :metodo,
                    `nro_comprobante` = :nro,
                    `comprobante_url` = COALESCE(:comprobante_url, `comprobante_url`)
              WHERE `id` = :id'
        )->execute([
            ':pagado' => $nuevoPagado,
            ':saldo' => $nuevoSaldo,
            ':metodo' => $metodoPago,
            ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
            ':comprobante_url' => $comprobanteUrl,
            ':id' => $deudaId,
        ]);
    } else {
        $pdo->prepare(
            'UPDATE `deudas_multas`
                SET `estado` = \'en_revision\',
                    `metodo_pago` = :metodo,
                    `nro_comprobante` = :nro,
                    `comprobante_url` = COALESCE(:comprobante_url, `comprobante_url`)
              WHERE `id` = :id'
        )->execute([
            ':metodo' => $metodoPago,
            ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
            ':comprobante_url' => $comprobanteUrl,
            ':id' => $deudaId,
        ]);
    }

    $detalleComprobante = $nroComprobante !== ''
        ? ' Comprobante: ' . $nroComprobante . '.'
        : '';
    notificarRoles(
        $pdo,
        [ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN],
        'Pago reportado por ' . $deuda['socio_nombre'],
        'El socio ' . $deuda['socio_nombre'] . ' reportó un pago de Bs. '
        . number_format($montoAbono, 2, '.', '')
        . ' por «' . $deuda['concepto'] . '» mediante ' . $metodoPago
        . '.' . $detalleComprobante . ' Revise la bandeja de «Pagos reportados».'
    );

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('notificar_pago POST: ' . $e->getMessage());
    jsonError('No se pudo reportar el pago.', 500);
}
    }
    error_log('notificar_pago POST: ' . $e->getMessage());
    jsonError('No se pudo reportar el pago.', 500);
}

$stmt = db()->prepare(
    'SELECT d.*, s.nombre AS socio_nombre, s.correo AS socio_correo
       FROM `deudas_multas` d
       JOIN `usuarios` s ON s.id = d.socio_id
      WHERE d.id = :id'
);
$stmt->execute([':id' => $deudaId]);
$actualizada = $stmt->fetch() ?: [];

jsonResponse([
    'ok' => true,
    'deuda' => [
        'id' => (int) ($actualizada['id'] ?? $deudaId),
        'socioId' => (int) ($actualizada['socio_id'] ?? 0),
        'socioNombre' => (string) ($actualizada['socio_nombre'] ?? ''),
        'concepto' => (string) ($actualizada['concepto'] ?? ''),
        'monto' => (float) ($actualizada['monto'] ?? 0),
        'tipo' => (string) ($actualizada['tipo'] ?? ''),
        'estado' => (string) ($actualizada['estado'] ?? 'en_revision'),
        'metodoPago' => $actualizada['metodo_pago'] ?? null,
        'nroComprobante' => $actualizada['nro_comprobante'] ?? null,
        'comprobanteUrl' => $actualizada['comprobante_url'] ?? null,
        'fechaEmision' => $actualizada['fecha_emision'] ?? null,
        'fechaPago' => $actualizada['fecha_pago'] ?? null,
    ],
    'mensaje' => 'Pago reportado. Tesorería revisará el comprobante y confirmará la cancelación.',
], 201);
