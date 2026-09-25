<?php
/**
 * GET  /backend/api/auth/usuarios.php
 * POST /backend/api/auth/usuarios.php   (crear socio)
 * PUT  /backend/api/auth/usuarios.php   (cambiar rol / activar / desactivar)
 *
 * Consola de gestión de usuarios del Administrador del Sistema.
 * TODAS las operaciones exigen el permiso `usuarios:gestionar` (rol `admin`).
 *
 * POST body: { "nombre": "...", "correo": "...", "contrasena": "...",
 *              "rol": "lectura|tesorero|caja_chica|admin" }
 * PUT  body: { "id": 3, "rol": "tesorero" }  |  { "id": 3, "activo": false }
 *
 * GET (?id=N) devuelve un usuario concreto; sin `id`, el listado completo con
 * el número de multas de cada socio.
 */
declare(strict_types=1);

require_once __DIR__ . '/../helpers.php';
require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../roles.php';
require_once __DIR__ . '/../auth_lib.php';

enviarCors();
manejarPreflight();

$metodo = metodoHttp();
if (!in_array($metodo, ['GET', 'POST', 'PUT'], true)) {
    jsonError('Método no permitido. Use GET, POST o PUT.', 405);
}

$admin = exigirPermiso(PERMISO_GESTIONAR_USUARIOS);
$adminId = (int) $admin['id'];

/* -------------------------------------------------------------------------- */
/* GET: listado / detalle                                                      */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $idSolicitado = isset($_GET['id']) ? (int) $_GET['id'] : 0;

    if ($idSolicitado > 0) {
        $stmt = db()->prepare('SELECT * FROM `usuarios` WHERE `id` = :id');
        $stmt->execute([':id' => $idSolicitado]);
        $fila = $stmt->fetch();
        if (!$fila) {
            jsonError('El socio solicitado no existe.', 404);
        }
        jsonResponse(['ok' => true, 'usuario' => usuarioPublico($fila)]);
    }

    $stmt = db()->query(
        'SELECT u.id, u.nombre, u.correo, u.rol, u.activo, u.creado_en,
                (SELECT COUNT(*) FROM `multas` m WHERE m.socio_id = u.id) AS total_multas,
                (SELECT COUNT(*) FROM `multas` m WHERE m.socio_id = u.id AND m.estado = \'pendiente\') AS multas_pendientes
           FROM `usuarios` u
          ORDER BY u.rol ASC, u.nombre ASC'
    );

    $usuarios = array_map(
        static function (array $fila): array {
            $publico = usuarioPublico($fila);
            $publico['totalMultas'] = (int) $fila['total_multas'];
            $publico['multasPendientes'] = (int) $fila['multas_pendientes'];
            return $publico;
        },
        $stmt->fetchAll()
    );

    jsonResponse([
        'ok'        => true,
        'usuarios'  => $usuarios,
        'roles'     => matrizDePermisos(),
    ]);
}

/* -------------------------------------------------------------------------- */
/* POST: alta de socio                                                         */
/* -------------------------------------------------------------------------- */

if ($metodo === 'POST') {
    $body = leerBodyJson();

    $nombre = textoLimpio($body['nombre'] ?? '', 150);
    $correo = normalizarCorreo($body['correo'] ?? ($body['email'] ?? ''));
    $clave  = (string) ($body['contrasena'] ?? ($body['password'] ?? ''));
    $rol    = esRolValido($body['rol'] ?? null) ? (string) $body['rol'] : ROL_LECTURA;

    if ($nombre === '' || strlen($nombre) < 3) {
        jsonError('El nombre completo es obligatorio (mínimo 3 caracteres).', 400);
    }
    if ($correo === null) {
        jsonError('El correo electrónico no tiene un formato válido.', 400);
    }
    $problema = validarContrasena($clave);
    if ($problema !== null) {
        jsonError($problema, 400);
    }

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
            ':rol'   => $rol,
        ]);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            jsonError('Ya existe una cuenta registrada con ese correo electrónico.', 409);
        }
        error_log('usuarios: ' . $e->getMessage());
        jsonError('No se pudo crear el usuario.', 500);
    }

    $nuevoId = (int) db()->lastInsertId();
    $stmt = db()->prepare('SELECT `id`, `nombre`, `correo`, `rol`, `activo`, `creado_en` FROM `usuarios` WHERE `id` = :id');
    $stmt->execute([':id' => $nuevoId]);

    jsonResponse([
        'ok'      => true,
        'usuario' => usuarioPublico($stmt->fetch() ?: []),
        'mensaje' => 'Usuario creado correctamente.',
    ], 201);
}

/* -------------------------------------------------------------------------- */
/* PUT: cambio de rol / activación                                             */
/* -------------------------------------------------------------------------- */

$body = leerBodyJson();
$objetivoId = (int) ($body['id'] ?? 0);

if ($objetivoId <= 0) {
    jsonError('Debe indicar el `id` del usuario a modificar.', 400);
}

$stmt = db()->prepare('SELECT `id`, `nombre`, `correo`, `rol`, `activo` FROM `usuarios` WHERE `id` = :id');
$stmt->execute([':id' => $objetivoId]);
$objetivo = $stmt->fetch();

if (!$objetivo) {
    jsonError('El socio solicitado no existe.', 404);
}

// Un Administrador no puede dejar la plataforma sin ningún admin activo.
$esUltimoAdmin = $objetivo['rol'] === ROL_ADMIN
    && (int) $objetivo['activo'] === 1
    && ((int) db()->query("SELECT COUNT(*) FROM `usuarios` WHERE `rol` = 'admin' AND `activo` = 1")->fetchColumn()) <= 1;

$campos = [];
$valores = [':id' => $objetivoId];

if (array_key_exists('rol', $body)) {
    $rol = (string) $body['rol'];
    if (!esRolValido($rol)) {
        jsonError('Rol no válido. Use: ' . implode(', ', ROLES_SISTEMA) . '.', 400);
    }
    if ($esUltimoAdmin && $rol !== ROL_ADMIN) {
        jsonError('No se puede quitar el rol de Administrador al único administrador activo del sistema.', 409);
    }
    $campos[] = '`rol` = :rol';
    $valores[':rol'] = $rol;
}

if (array_key_exists('activo', $body)) {
    $activo = entradaBooleana($body['activo']);
    if ($activo === null) {
        jsonError('El campo `activo` debe ser booleano.', 400);
    }
    if ($esUltimoAdmin && $activo === false) {
        jsonError('No se puede desactivar al único administrador activo del sistema.', 409);
    }
    $campos[] = '`activo` = :activo';
    $valores[':activo'] = $activo ? 1 : 0;
}

if (empty($campos)) {
    jsonError('No se envió ningún campo editable (`rol` o `activo`).', 400);
}

$stmt = db()->prepare('UPDATE `usuarios` SET ' . implode(', ', $campos) . ' WHERE `id` = :id');
$stmt->execute($valores);

// Si el socio queda desactivado o pierde el rol, sus sesiones mueren al instante.
if (($valores[':activo'] ?? 1) === 0 || (isset($valores[':rol']) && $valores[':rol'] !== $objetivo['rol'])) {
    revocarSesionesDeUsuario($objetivoId);
}

$stmt = db()->prepare('SELECT `id`, `nombre`, `correo`, `rol`, `activo`, `creado_en` FROM `usuarios` WHERE `id` = :id');
$stmt->execute([':id' => $objetivoId]);

jsonResponse([
    'ok'      => true,
    'usuario' => usuarioPublico($stmt->fetch() ?: []),
    'mensaje' => 'Usuario actualizado correctamente.',
]);
