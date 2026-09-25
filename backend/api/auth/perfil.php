<?php
/**
 * GET  /backend/api/auth/perfil.php   (también /api/auth/me)
 * PUT  /backend/api/auth/perfil.php
 *
 * GET  -> Devuelve los datos del socio autenticado, su rol, sus permisos y el
 *         resumen de sus multas (total, pendientes y monto adeudado).
 * PUT  -> Actualiza los datos de perfil. Sólo se admiten `nombre` y `correo`
 *         (el rol NUNCA se cambia desde aquí: eso es tarea del Administrador).
 *
 * PUT body (JSON): { "nombre": "Juan Pérez", "correo": "nuevo@correo.com" }
 *
 * Respuestas: 200 – ok | 401 – sin sesión | 409 – correo ya en uso
 */
declare(strict_types=1);

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../roles.php';
require_once __DIR__ . '/../auth_lib.php';

enviarCors();
manejarPreflight();

$metodo = metodoHttp();
if ($metodo !== 'GET' && $metodo !== 'PUT') {
    jsonError('Método no permitido. Use GET o PUT.', 405);
}

$usuario = exigirUsuario();
$usuarioId = (int) $usuario['id'];

/* -------------------------------------------------------------------------- */
/* GET: perfil + resumen de multas                                             */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $stmt = db()->prepare(
        'SELECT COUNT(*) AS total,
                COALESCE(SUM(CASE WHEN `estado` = \'pendiente\' THEN 1 ELSE 0 END), 0) AS pendientes,
                COALESCE(SUM(CASE WHEN `estado` = \'pendiente\' THEN `monto` ELSE 0 END), 0) AS monto_pendiente,
                COALESCE(SUM(`monto`), 0) AS monto_total
           FROM `multas`
          WHERE `socio_id` = :socio_id'
    );
    $stmt->execute([':socio_id' => $usuarioId]);
    $resumen = $stmt->fetch() ?: [];

    jsonResponse([
        'ok'      => true,
        'usuario' => usuarioPublico($usuario),
        'resumenMultas' => [
            'total'          => (int) ($resumen['total'] ?? 0),
            'pendientes'     => (int) ($resumen['pendientes'] ?? 0),
            'montoPendiente' => (float) ($resumen['monto_pendiente'] ?? 0),
            'montoTotal'     => (float) ($resumen['monto_total'] ?? 0),
        ],
    ]);
}

/* -------------------------------------------------------------------------- */
/* PUT: edición de datos de perfil                                             */
/* -------------------------------------------------------------------------- */

$body = leerBodyJson();

$nombre = array_key_exists('nombre', $body) ? textoLimpio($body['nombre'], 150) : (string) $usuario['nombre'];
if ($nombre === '') {
    jsonError('El nombre completo es obligatorio.', 400);
}
if (strlen($nombre) < 3) {
    jsonError('El nombre completo debe tener al menos 3 caracteres.', 400);
}

$correo = array_key_exists('correo', $body)
    ? normalizarCorreo($body['correo'])
    : (string) $usuario['correo'];
if ($correo === null) {
    jsonError('El correo electrónico no tiene un formato válido.', 400);
}

if ($correo !== (string) $usuario['correo']) {
    $stmt = db()->prepare('SELECT `id` FROM `usuarios` WHERE `correo` = :correo AND `id` <> :id');
    $stmt->execute([':correo' => $correo, ':id' => $usuarioId]);
    if ($stmt->fetchColumn() !== false) {
        jsonError('Ese correo electrónico ya está registrado por otro socio.', 409);
    }
}

try {
    $stmt = db()->prepare('UPDATE `usuarios` SET `nombre` = :nombre, `correo` = :correo WHERE `id` = :id');
    $stmt->execute([':nombre' => $nombre, ':correo' => $correo, ':id' => $usuarioId]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        jsonError('Ese correo electrónico ya está registrado por otro socio.', 409);
    }
    error_log('perfil: ' . $e->getMessage());
    jsonError('No se pudieron guardar los datos del perfil.', 500);
}

$stmt = db()->prepare('SELECT `id`, `nombre`, `correo`, `rol`, `activo`, `creado_en` FROM `usuarios` WHERE `id` = :id');
$stmt->execute([':id' => $usuarioId]);

jsonResponse([
    'ok'      => true,
    'usuario' => usuarioPublico($stmt->fetch() ?: $usuario),
    'mensaje' => 'Datos del perfil actualizados.',
]);
