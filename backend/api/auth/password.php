<?php
/**
 * POST /backend/api/auth/password.php   (también /api/auth/cambiar-password)
 *
 * Cambio de contraseña del socio autenticado. Exige la contraseña ACTUAL y
 * valida que la nueva cumpla la política de 8+ caracteres alfanuméricos.
 * Al cambiarla se revocan el resto de sesiones abiertas del usuario (el token
 * de esta petición se mantiene activo para no expulsar al propio usuario).
 *
 * Body (JSON):
 *   { "contrasenaActual": "Minera2026", "contrasenaNueva": "Minera2027" }
 */
declare(strict_types=1);

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../roles.php';
require_once __DIR__ . '/../auth_lib.php';

enviarCors();
manejarPreflight();

if (metodoHttp() !== 'POST') {
    jsonError('Método no permitido. Use POST.', 405);
}

$usuario = exigirUsuario();
$usuarioId = (int) $usuario['id'];

$body = leerBodyJson();
$actual = (string) ($body['contrasenaActual'] ?? ($body['actual'] ?? ($body['contrasena'] ?? '')));
$nueva  = (string) ($body['contrasenaNueva'] ?? ($body['nueva'] ?? ''));

if ($actual === '' || $nueva === '') {
    jsonError('Debe indicar su contraseña actual y la nueva.', 400);
}

$stmt = db()->prepare('SELECT `contrasena_hash` FROM `usuarios` WHERE `id` = :id');
$stmt->execute([':id' => $usuarioId]);
$hash = $stmt->fetchColumn();

if ($hash === false || !verificarContrasena($actual, (string) $hash)) {
    jsonError('La contraseña actual no es correcta.', 401);
}

$problema = validarContrasena($nueva);
if ($problema !== null) {
    jsonError($problema, 400);
}

if (verificarContrasena($nueva, (string) $hash)) {
    jsonError('La nueva contraseña debe ser distinta de la actual.', 400);
}

$stmt = db()->prepare('UPDATE `usuarios` SET `contrasena_hash` = :hash WHERE `id` = :id');
$stmt->execute([':hash' => hashContrasena($nueva), ':id' => $usuarioId]);

// Se invalidan las demás sesiones del socio (posibles equipos compartidos).
$stmt = db()->prepare('UPDATE `sesiones` SET `revocado` = 1 WHERE `usuario_id` = :usuario_id AND `token` <> :token');
$stmt->execute([
    ':usuario_id' => $usuarioId,
    ':token'      => (string) tokenDesdePeticion(),
]);

jsonResponse([
    'ok'      => true,
    'mensaje' => 'Contraseña actualizada correctamente.',
]);
