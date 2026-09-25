<?php
/**
 * POST /backend/api/auth/registro.php   (también /api/auth/register)
 *
 * Crea la cuenta de un socio. Todo usuario nuevo nace con el rol
 * `lectura` (Socio / Usuario Estándar): los roles superiores los concede
 * exclusivamente un Administrador desde la consola de gestión de usuarios.
 *
 * Body (JSON):
 *   { "nombre": "Juan Pérez", "correo": "socio@chachacomani.com", "contrasena": "Minera2026" }
 *
 * Respuestas:
 *   201 – cuenta creada (devuelve token + usuario)
 *   409 – el correo ya está registrado
 *   400 – datos inválidos (incluye la política de contraseña de 8+ alfanuméricos)
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

$nombre  = textoLimpio($body['nombre'] ?? '', 150);
$correo  = normalizarCorreo($body['correo'] ?? ($body['email'] ?? ''));
$clave   = (string) ($body['contrasena'] ?? ($body['password'] ?? ''));

if ($nombre === '') {
    jsonError('El nombre completo es obligatorio.', 400);
}
if (strlen($nombre) < 3) {
    jsonError('El nombre completo debe tener al menos 3 caracteres.', 400);
}
if ($correo === null) {
    jsonError('El correo electrónico no tiene un formato válido.', 400);
}

$problema = validarContrasena($clave);
if ($problema !== null) {
    jsonError($problema, 400);
}

// El correo es la identidad de la persona: se normaliza a minúsculas.
$stmt = db()->prepare('SELECT `id` FROM `usuarios` WHERE `correo` = :correo');
$stmt->execute([':correo' => $correo]);
if ($stmt->fetchColumn() !== false) {
    jsonError('Ya existe una cuenta registrada con ese correo electrónico.', 409);
}

try {
    $stmt = db()->prepare(
        'INSERT INTO `usuarios` (`nombre`, `correo`, `contrasena_hash`, `rol`)
         VALUES (:nombre, :correo, :hash, :rol)'
    );
    $stmt->execute([
        ':nombre' => $nombre,
        ':correo' => $correo,
        ':hash'  => hashContrasena($clave),
        ':rol'   => ROL_LECTURA,
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonError('Ya existe una cuenta registrada con ese correo electrónico.', 409);
    }
    error_log('registro: ' . $e->getMessage());
    jsonError('No se pudo crear la cuenta.', 500);
}

$usuarioId = (int) db()->lastInsertId();
$token = crearSesion($usuarioId);

jsonResponse([
    'ok'      => true,
    'token'   => $token,
    'usuario' => usuarioPublico([
        'id'     => $usuarioId,
        'nombre' => $nombre,
        'correo' => $correo,
        'rol'    => ROL_LECTURA,
        'activo' => 1,
    ]),
    'mensaje' => 'Cuenta creada correctamente. ¡Bienvenido/a a la Cooperativa!',
], 201);
