<?php
/**
 * ============================================================================
 *  GET  /backend/api/drm.php
 *  POST /backend/api/drm.php
 * ============================================================================
 *  Estado GLOBAL de la protección DRM de contenido normativo.
 *
 *   · GET  es público: TODAS las páginas del portal (Inicio, Reglamento
 *     Interno y Estatuto Orgánico) leen este valor para saber si la
 *     protección está Activa o Inactiva. El valor se guarda en la tabla
 *     `configuraciones`, de modo que el cambio del Administrador persiste
 *     entre dispositivos y sesiones.
 *   · POST exige el permiso `drm:gestionar` (exclusivo del rol `admin`).
 *     Los roles Lectura, Tesorero y Caja Chica reciben 403 aunque Seam capaces
 *     de llamar al endpoint: el interruptor que muestran en el encabezado del
 *     lector es únicamente una etiqueta informativa para ellos.
 *
 * POST body (JSON): { "activo": true }  |  { "activo": false }
 * ============================================================================
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

$metodo = metodoHttp();
if (!in_array($metodo, ['GET', 'POST'], true)) {
    jsonError('Método no permitido. Use GET o POST.', 405);
}

$CLAVE = 'drm_activo';

/* -------------------------------------------------------------------------- */
/* Lectura del estado (pública)                                               */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve el estado persistido del DRM. Si la fila no existe todavía, la
 * plataforma arranca PROTEGIDA (fail-safe).
 */
function leerEstadoDrm(): array
{
    $stmt = db()->prepare('SELECT `valor`, `actualizado_en` FROM `configuraciones` WHERE `clave` = :clave');
    $stmt->execute([':clave' => 'drm_activo']);
    $fila = $stmt->fetch();

    if (!$fila) {
        return ['activo' => true, 'actualizadoEn' => null, 'origen' => 'predeterminado'];
    }

    return [
        'activo' => ((string) $fila['valor']) === '1',
        'actualizadoEn' => $fila['actualizado_en'] ?? null,
        'origen' => 'base de datos',
    ];
}

/* -------------------------------------------------------------------------- */
/* GET                                                                         */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $estado = leerEstadoDrm();

    jsonResponse([
        'ok'            => true,
        'documento'     => null, // el DRM es global: afecta a toda la plataforma
        'drmActivo'     => $estado['activo'],
        'actualizadoEn' => $estado['actualizadoEn'],
        'origen'        => $estado['origen'],
    ]);
}

/* -------------------------------------------------------------------------- */
/* POST — sólo Administrador                                                   */
/* -------------------------------------------------------------------------- */

$admin = exigirPermiso(PERMISO_GESTIONAR_DRM);

$body = leerBodyJson();
$crudo = $body['activo'] ?? ($body['drmActivo'] ?? null);
$activo = entradaBooleana($crudo);

if ($activo === null) {
    jsonError('Debe enviar el campo booleano `activo` (true o false).', 400);
}

try {
    $stmt = db()->prepare(
        'INSERT INTO `configuraciones` (`clave`, `valor`, `actualizado_por`)
         VALUES (:clave, :valor, :usuario)
         ON DUPLICATE KEY UPDATE `valor` = VALUES(`valor`), `actualizado_por` = VALUES(`actualizado_por`)'
    );
    $stmt->execute([
        ':clave'   => $CLAVE,
        ':valor'   => $activo ? '1' : '0',
        ':usuario' => (int) $admin['id'],
    ]);
} catch (PDOException $e) {
    error_log('drm: ' . $e->getMessage());
    jsonError('No se pudo actualizar el estado del DRM.', 500);
}

$estado = leerEstadoDrm();

jsonResponse([
    'ok'            => true,
    'drmActivo'     => $estado['activo'],
    'actualizadoEn' => $estado['actualizadoEn'],
    'mensaje'       => $estado['activo']
        ? 'Seguridad DRM activada para toda la plataforma.'
        : 'Seguridad DRM desactivada para toda la plataforma.',
]);
