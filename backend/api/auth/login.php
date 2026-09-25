<?php
/**
 * POST /backend/api/auth/login.php   (también /api/auth/login)
 *
 * Inicia sesión con correo + contraseña y devuelve un token de sesión.
 *
 * Body (JSON):
 *   { "correo": "socio@chachacomani.com", "contrasena": "Minera2026" }
 *
 * Respuestas:
 *   200 – sesión iniciada (token + usuario con su rol y permisos)
 *   401 – credenciales incorrectas o cuenta desactivada
 *   400 – datos incompletos
 *
 * Nota de seguridad: el mismo mensaje se devuelve para «correo inexistente» y
 * «contraseña incorrecta» para no revelar qué correos están registrados.
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

$body = leerBodyJson();

$correo = normalizarCorreo($body['correo'] ?? ($body['email'] ?? ($body['usuario'] ?? '')));
$clave  = (string) ($body['contrasena'] ?? ($body['password'] ?? ''));

if ($correo === null || $clave === '') {
    jsonError('Debe indicar su correo electrónico y su contraseña.', 400);
}

$stmt = db()->prepare(
    'SELECT `id`, `nombre`, `correo`, `contrasena_hash`, `rol`, `activo`
       FROM `usuarios`
      WHERE `correo` = :correo
      LIMIT 1'
);
$stmt->execute([':correo' => $correo]);
$fila = $stmt->fetch();

if (!$fila || !verificarContrasena($clave, $fila['contrasena_hash'])) {
    jsonError('Correo electrónico o contraseña incorrectos.', 401);
}

if ((int) $fila['activo'] !== 1) {
    jsonError('Su cuenta está desactivada. Comuníquese con el Administrador del sistema.', 403);
}

$token = crearSesion((int) $fila['id']);

jsonResponse([
    'ok'      => true,
    'token'   => $token,
    'usuario' => usuarioPublico($fila),
    'mensaje' => 'Sesión iniciada correctamente.',
]);
