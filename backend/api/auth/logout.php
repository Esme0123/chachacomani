<?php
/**
 * POST /backend/api/auth/logout.php   (también /api/auth/logout)
 *
 * Cierra la sesión del usuario revocando su token en el servidor.
 * Es idempotente: si no hay token o ya estaba revocado, responde `ok: true`.
 */
declare(strict_types=1);

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../auth_lib.php';

enviarCors();
manejarPreflight();

if (metodoHttp() !== 'POST') {
    jsonError('Método no permitido. Use POST.', 405);
}

$token = tokenDesdePeticion();
revocarSesion($token);

jsonResponse([
    'ok'      => true,
    'mensaje' => 'Sesión cerrada correctamente.',
]);
