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
/* Comprobante (opcional)                                                      */
/* -------------------------------------------------------------------------- */

$comprobanteUrl = null;
if (isset($_FILES['comprobante']) && is_array($_FILES['comprobante'])) {
    $archivo = $_FILES['comprobante'];

    if (($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
        if (($archivo['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            jsonError('No se pudo subir el comprobante. Intente nuevamente.', 400);
        }
        if ((int) ($archivo['size'] ?? 0) <= 0 || (int) $archivo['size'] > 5 * 1024 * 1024) {
            jsonError('El comprobante debe pesar como máximo 5 MB.', 400);
        }

        $mime = '';
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $mime = (string) finfo_file($finfo, (string) $archivo['tmp_name']);
                finfo_close($finfo);
            }
        }
        if ($mime === '') {
            // Hosting sin fileinfo: se valida por extensión y el .htaccess
            // impide que cualquier archivo se ejecute como código.
            $porExtension = [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'webp' => 'image/webp',
                'pdf' => 'application/pdf',
            ];
            $extension = strtolower(pathinfo((string) ($archivo['name'] ?? ''), PATHINFO_EXTENSION));
            $mime = $porExtension[$extension] ?? '';
        }

        $extensiones = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
            'application/pdf' => 'pdf',
        ];
        if (!isset($extensiones[$mime])) {
            jsonError('Formato no admitido. Adjunte una imagen JPG/PNG/WEBP o un PDF.', 400);
        }

        $directorio = __DIR__ . '/../uploads/comprobantes';
        if (!is_dir($directorio) && !mkdir($directorio, 0755, true) && !is_dir($directorio)) {
            error_log('notificar_pago: no se pudo crear ' . $directorio);
            jsonError('No se pudo preparar la carpeta de comprobantes.', 500);
        }

        $nombreArchivo = 'comprobante_' . $deudaId . '_' . bin2hex(random_bytes(8))
            . '.' . $extensiones[$mime];
        $destino = $directorio . '/' . $nombreArchivo;

        if (!move_uploaded_file((string) $archivo['tmp_name'], $destino)) {
            error_log('notificar_pago: no se pudo mover el archivo a ' . $destino);
            jsonError('No se pudo guardar el comprobante.', 500);
        }

        $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
            || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
        $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
        $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/notificar_pago.php'));
        $base = rtrim(str_replace('\\', '/', dirname(dirname($script))), '/');
        $comprobanteUrl = ($https ? 'https' : 'http') . '://' . $host . $base
            . '/uploads/comprobantes/' . rawurlencode($nombreArchivo);
    }
}

/* -------------------------------------------------------------------------- */
/* Actualización y avisos                                                      */
/* -------------------------------------------------------------------------- */

$pdo = db();
try {
    $pdo->beginTransaction();

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

    $detalleComprobante = $nroComprobante !== ''
        ? ' Comprobante: ' . $nroComprobante . '.'
        : '';
    notificarRoles(
        $pdo,
        [ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN],
        'Pago reportado por ' . $deuda['socio_nombre'],
        'El socio ' . $deuda['socio_nombre'] . ' reportó el pago de Bs. '
        . number_format((float) $deuda['monto'], 2, '.', '')
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
