<?php
/**
 * ============================================================================
 *  AUTENTICACIÓN Y CONTROL DE ACCESO — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Librería compartida por los endpoints de `api/auth/` y por el resto del API
 *  (votación, multas, caja chica, DRM, usuarios).
 *
 *  Modelo de sesión
 *  ----------------
 *   · Al registrarse o iniciar sesión el servidor emite un token opaco de 64
 *     caracteres hexadecimales, guardado en la tabla `sesiones`.
 *   · El frontend lo conserva en localStorage y lo envía en cada petición como
 *     `Authorization: Bearer <token>`.
 *   · Cada petición resuelve el token a un usuario de la tabla `usuarios`; si el
 *     usuario está inactivo o la sesión expiró, el token deja de ser válido.
 *
 *  Contraseñas
 *  -----------
 *   · Nunca se guardan en claro: `password_hash()` / `password_verify()`.
 *   · Política mínima: 8 caracteres, alfanuméricos, con al menos una letra y un
 *     número (requisito del formulario de Registro y del cambio de contraseña).
 * ============================================================================
 */
declare(strict_types=1);

/** Duración de la sesión en segundos (30 días). */
const DURACION_SESION_SEGUNDOS = 2592000;

/* -------------------------------------------------------------------------- */
/* Contraseñas                                                                 */
/* -------------------------------------------------------------------------- */

/** Genera el hash de una contraseña. */
function hashContrasena(string $contrasena): string
{
    return password_hash($contrasena, PASSWORD_DEFAULT);
}

/** Verifica una contraseña contra su hash. */
function verificarContrasena(string $contrasena, string $hash): bool
{
    return password_verify($contrasena, $hash);
}

/**
 * Valida la política de contraseñas.
 * Devuelve `null` si es correcta o el mensaje de error si no lo es.
 */
function validarContrasena($contrasena): ?string
{
    $contrasena = (string) $contrasena;

    if (trim($contrasena) === '') {
        return 'La contraseña es obligatoria.';
    }
    if (strlen($contrasena) < 8) {
        return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (strlen($contrasena) > 72) {
        return 'La contraseña no puede superar los 72 caracteres.';
    }
    if (!preg_match('/^[A-Za-z0-9]+$/', $contrasena)) {
        return 'La contraseña debe ser alfanumérica (sólo letras y números, sin espacios).';
    }
    if (!preg_match('/[A-Za-z]/', $contrasena) || !preg_match('/\d/', $contrasena)) {
        return 'La contraseña debe combinar al menos una letra y un número.';
    }
    return null;
}

/* -------------------------------------------------------------------------- */
/* Token de sesión                                                             */
/* -------------------------------------------------------------------------- */

/** Extrae el token de sesión de los encabezados de la petición. */
function tokenDesdePeticion(): ?string
{
    $candidates = [];

    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $candidates[] = $_SERVER['HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        // Algunos servidores Apache no exponen HTTP_AUTHORIZATION sin CGI.
        $candidates[] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
        $candidates[] = 'Bearer ' . $_SERVER['HTTP_X_AUTH_TOKEN'];
    }

    foreach ($candidates as $cabecera) {
        if (preg_match('/Bearer\s+([A-Za-z0-9]{32,128})/i', (string) $cabecera, $coincidencias)) {
            return $coincidencias[1];
        }
    }

    return null;
}

/** Crea una sesión para el usuario indicado y devuelve su token. */
function crearSesion(int $usuarioId): string
{
    $token = bin2hex(random_bytes(32)); // 64 hexadecimales

    $stmt = db()->prepare(
        'INSERT INTO `sesiones` (`token`, `usuario_id`, `expira_en`)
         VALUES (:token, :usuario_id, DATE_ADD(NOW(), INTERVAL :segundos SECOND))'
    );
    $stmt->execute([
        ':token'     => $token,
        ':usuario_id' => $usuarioId,
        ':segundos'  => DURACION_SESION_SEGUNDOS,
    ]);

    return $token;
}

/** Revoca la sesión indicada (logout). */
function revocarSesion(?string $token): void
{
    if ($token === null || $token === '') {
        return;
    }
    $stmt = db()->prepare('UPDATE `sesiones` SET `revocado` = 1 WHERE `token` = :token');
    $stmt->execute([':token' => $token]);
}

/** Revoca todas las sesiones de un usuario (cambio de contraseña, baja). */
function revocarSesionesDeUsuario(int $usuarioId): void
{
    $stmt = db()->prepare('UPDATE `sesiones` SET `revocado` = 1 WHERE `usuario_id` = :usuario_id');
    $stmt->execute([':usuario_id' => $usuarioId]);
}

/* -------------------------------------------------------------------------- */
/* Resolución del usuario actual                                               */
/* -------------------------------------------------------------------------- */

/**
 * Devuelve el usuario autenticado de la petición, o `null` si no hay sesión
 * válida. El resultado se memoriza durante el ciclo de vida de la petición.
 */
function usuarioActual(): ?array
{
    static $cache = false;

    if ($cache !== false) {
        return $cache;
    }
    $cache = null;

    $token = tokenDesdePeticion();
    if ($token === null) {
        return null;
    }

    try {
        $stmt = db()->prepare(
            'SELECT u.id, u.nombre, u.correo, u.rol, u.activo, u.creado_en
               FROM `sesiones` s
               JOIN `usuarios` u ON u.id = s.usuario_id
              WHERE s.token = :token
                AND s.revocado = 0
                AND s.expira_en > NOW()
              LIMIT 1'
        );
        $stmt->execute([':token' => $token]);
        $fila = $stmt->fetch();
    } catch (PDOException $e) {
        error_log('auth_lib: ' . $e->getMessage());
        return null;
    }

    if (!$fila || (int) $fila['activo'] !== 1) {
        return null;
    }

    $cache = $fila;
    return $cache;
}

/** Exige una sesión válida; responde 401 y termina si no la hay. */
function exigirUsuario(): array
{
    $usuario = usuarioActual();
    if ($usuario === null) {
        jsonError('Debe iniciar sesión para realizar esta acción.', 401);
    }
    return $usuario;
}

/**
 * Exige una sesión válida con el permiso indicado; responde 401/403 y termina.
 * @return array Usuario autenticado
 */
function exigirPermiso(string $permiso): array
{
    $usuario = exigirUsuario();
    if (!rolTienePermiso($usuario['rol'], $permiso)) {
        jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no tiene permiso para esta acción.', 403);
    }
    return $usuario;
}

/** Exige uno de los roles indicados. */
function exigirRol(array $roles): array
{
    $usuario = exigirUsuario();
    if (!esRolValido($usuario['rol']) || !in_array($usuario['rol'], $roles, true)) {
        jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no tiene acceso a esta sección.', 403);
    }
    return $usuario;
}

/* -------------------------------------------------------------------------- */
/* Serialización                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Proyecta una fila de `usuarios` al JSON que consume el frontend (nunca incluye
 * el hash de la contraseña).
 */
function usuarioPublico(array $fila): array
{
    $rol = (string) ($fila['rol'] ?? ROL_LECTURA);

    return [
        'id' => (int) ($fila['id'] ?? 0),
        'nombre' => (string) ($fila['nombre'] ?? ''),
        'correo' => (string) ($fila['correo'] ?? ''),
        'rol' => $rol,
        'nombreRol' => nombreRol($rol),
        'activo' => (int) ($fila['activo'] ?? 1) === 1,
        'creadoEn' => $fila['creado_en'] ?? null,
        'permisos' => permisosDeRol($rol),
    ];
}

/**
 * Identidad que se usa en `votos_articulos.voter_token`: los socios registrados
 * votan una sola vez por artículo gracias a su id de usuario.
 */
function identidadDeVotante(array $usuario): string
{
    return identidadDeUsuario((int) $usuario['id']);
}
