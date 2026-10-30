<?php
/**
 * ============================================================================
 *  NOTIFICACIONES — Campana de avisos del Header
 * ============================================================================
 *   GET /api/notificaciones
 *        Devuelve los avisos del usuario autenticado (máx. 50) y el contador
 *        de no leídos. También incluye avisos dirigidos a su rol cuando la fila
 *        no tiene un usuario concreto (`usuario_id` NULL).
 *
 *   PUT /api/notificaciones
 *        Body: { "id": 12 }        -> marca un aviso como leído.
 *              { "todas": true }   -> marca todos como leídos.
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
if (!in_array($metodo, ['GET', 'PUT'], true)) {
    jsonError('Método no permitido. Use GET o PUT.', 405);
}

if (!tablaTieneColumna('notificaciones', 'id')) {
    jsonError('El módulo de notificaciones aún no está habilitado: ejecute backend/migrar.php.', 409);
}

$usuario = exigirUsuario();
$usuarioId = (int) $usuario['id'];
$rolDestino = $usuario['rol'] === ROL_LECTURA ? 'socio' : (string) $usuario['rol'];

/** Proyecta una fila de `notificaciones` al JSON del frontend. */
function notificacionPublica(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'usuarioId' => $fila['usuario_id'] !== null ? (int) $fila['usuario_id'] : null,
        'rolDestino' => $fila['rol_destino'] ?? null,
        'titulo' => (string) $fila['titulo'],
        'mensaje' => (string) $fila['mensaje'],
        'leido' => (int) $fila['leido'] === 1,
        'creadoEn' => $fila['creado_en'] ?? null,
    ];
}

if ($metodo === 'GET') {
    try {
        $stmt = db()->prepare(
            'SELECT `id`, `usuario_id`, `rol_destino`, `titulo`, `mensaje`, `leido`, `creado_en`
               FROM `notificaciones`
              WHERE `usuario_id` = :usuario_id
                 OR (`usuario_id` IS NULL AND `rol_destino` = :rol)
           ORDER BY `creado_en` DESC, `id` DESC
              LIMIT 50'
        );
        $stmt->execute([':usuario_id' => $usuarioId, ':rol' => $rolDestino]);
        $notificaciones = array_map('notificacionPublica', $stmt->fetchAll());

        $stmt = db()->prepare(
            'SELECT COUNT(*)
               FROM `notificaciones`
              WHERE `leido` = 0
                AND (`usuario_id` = :usuario_id
                     OR (`usuario_id` IS NULL AND `rol_destino` = :rol))'
        );
        $stmt->execute([':usuario_id' => $usuarioId, ':rol' => $rolDestino]);
        $noLeidas = (int) $stmt->fetchColumn();
    } catch (PDOException $e) {
        error_log('notificaciones GET: ' . $e->getMessage());
        jsonError('No se pudieron obtener las notificaciones.', 500);
    }

    jsonResponse([
        'ok' => true,
        'notificaciones' => $notificaciones,
        'noLeidas' => $noLeidas,
    ]);
}

/* PUT: marcar como leídas -------------------------------------------------- */

$body = leerBodyJson();
$todas = entradaBooleana($body['todas'] ?? false) === true;
$id = (int) ($body['id'] ?? 0);

if (!$todas && $id <= 0) {
    jsonError('Indique el `id` del aviso o `todas: true`.', 400);
}

try {
    if ($todas) {
        $stmt = db()->prepare(
            'UPDATE `notificaciones`
                SET `leido` = 1
              WHERE `leido` = 0
                AND (`usuario_id` = :usuario_id
                     OR (`usuario_id` IS NULL AND `rol_destino` = :rol))'
        );
        $stmt->execute([':usuario_id' => $usuarioId, ':rol' => $rolDestino]);
    } else {
        $stmt = db()->prepare(
            'UPDATE `notificaciones`
                SET `leido` = 1
              WHERE `id` = :id
                AND (`usuario_id` = :usuario_id
                     OR (`usuario_id` IS NULL AND `rol_destino` = :rol))'
        );
        $stmt->execute([':id' => $id, ':usuario_id' => $usuarioId, ':rol' => $rolDestino]);
    }

    $stmt = db()->prepare(
        'SELECT COUNT(*)
           FROM `notificaciones`
          WHERE `leido` = 0
            AND (`usuario_id` = :usuario_id
                 OR (`usuario_id` IS NULL AND `rol_destino` = :rol))'
    );
    $stmt->execute([':usuario_id' => $usuarioId, ':rol' => $rolDestino]);
    $noLeidas = (int) $stmt->fetchColumn();
} catch (PDOException $e) {
    error_log('notificaciones PUT: ' . $e->getMessage());
    jsonError('No se pudieron actualizar las notificaciones.', 500);
}

jsonResponse([
    'ok' => true,
    'noLeidas' => $noLeidas,
    'mensaje' => $todas ? 'Todos los avisos fueron marcados como leídos.' : 'Aviso marcado como leído.',
]);
