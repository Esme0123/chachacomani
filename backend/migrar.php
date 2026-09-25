<?php
/**
 * ============================================================================
 *  MIGRACIÓN DE LA BASE DE DATOS — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Aplica de forma IDEMPOTENTE los cambios de `schema.sql` sobre una base ya
 *  existente (por ejemplo, una instalación previa que solo tenga
 *  `votos_articulos`). No borra datos: únicamente agrega tablas, columnas,
 *  índices y corrige la clave única de votación.
 *
 *  ▶ Desde la terminal (recomendado en cPanel):
 *        cd /home/USUARIO/public_html/backend
 *        php migrar.php
 *
 *  ▶ Desde el navegador (si no tiene acceso SSH):
 *        https://dominio.com/backend/migrar.php
 *
 *  ▶ Crear el primer administrador (imprescindible: sólo un `admin` puede
 *    activar/desactivar el DRM y gestionar usuarios):
 *        php migrar.php --crear-admin
 *        php migrar.php --crear-admin --admin-correo=correo@dominio.com
 *        php migrar.php --crear-admin --admin-nombre="Juan Pérez" --admin-correo=... --admin-clave=...
 *
 *  ▶ Variables de entorno equivalentes (cPanel → "Application Environment
 *    Variables" o php.ini):
 *        CHACHO_ADMIN_CORREO=admin@chachacomani.com
 *        CHACHO_ADMIN_CLAVE=ClaveSegura2026
 *        CHACHO_ADMIN_NOMBRE=Administrador
 *        DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS
 * ============================================================================
 */
declare(strict_types=1);

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/api/helpers.php';
require_once __DIR__ . '/api/roles.php';
require_once __DIR__ . '/api/auth_lib.php';

/* -------------------------------------------------------------------------- */
/* Utilidades de introspección                                                 */
/* -------------------------------------------------------------------------- */

/** ¿Existe la tabla en la base actual? */
function tablaExiste(PDO $pdo, string $tabla): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.TABLES
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tabla'
    );
    $stmt->execute([':tabla' => $tabla]);
    return ((int) $stmt->fetchColumn()) > 0;
}

/** ¿Existe la columna en la tabla indicada? */
function columnaExiste(PDO $pdo, string $tabla, string $columna): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tabla AND COLUMN_NAME = :columna'
    );
    $stmt->execute([':tabla' => $tabla, ':columna' => $columna]);
    return ((int) $stmt->fetchColumn()) > 0;
}

/** ¿Existe el índice con ese nombre en la tabla indicada? */
function indiceExiste(PDO $pdo, string $tabla, string $indice): bool
{
    $stmt = $pdo->prepare(
        'SELECT COUNT(*) FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tabla AND INDEX_NAME = :indice'
    );
    $stmt->execute([':tabla' => $tabla, ':indice' => $indice]);
    return ((int) $stmt->fetchColumn()) > 0;
}

/** Devuelve el nombre de una clave ÚNICA (distinta de PRIMARY) de la tabla. */
function clavesUnicas(PDO $pdo, string $tabla): array
{
    $stmt = $pdo->prepare(
        'SELECT INDEX_NAME, SEQ_IN_INDEX, COLUMN_NAME FROM information_schema.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :tabla AND NON_UNIQUE = 0
         ORDER BY INDEX_NAME, SEQ_IN_INDEX'
    );
    $stmt->execute([':tabla' => $tabla]);

    $porIndice = [];
    foreach ($stmt->fetchAll() as $fila) {
        $porIndice[$fila['INDEX_NAME']][] = $fila['COLUMN_NAME'];
    }
    unset($porIndice['PRIMARY']);

    return $porIndice;
}

/**
 * Extrae de `schema.sql` el CREATE TABLE de una tabla concreta y lo ejecuta.
 * (MySQL no admite "CREATE TABLE IF NOT EXISTS ... ALTER", de ahí el parseo.)
 */
function crearTablaDesdeSchema(PDO $pdo, string $tabla): void
{
    $sql = file_get_contents(__DIR__ . '/schema.sql');
    if ($sql === false) {
        throw new RuntimeException('No se pudo leer schema.sql');
    }
    // Se eliminan los comentarios de línea antes de trocear por ';'
    $sql = preg_replace('/^\s*--.*$/m', '', $sql) ?? $sql;

    foreach (explode(';', $sql) as $sentencia) {
        $sentencia = trim($sentencia);
        if ($sentencia === '' || stripos($sentencia, 'CREATE TABLE') !== 0) {
            continue;
        }
        if (stripos($sentencia, '`' . $tabla . '`') === false) {
            continue;
        }
        $pdo->exec($sentencia);
        return;
    }

    throw new RuntimeException('schema.sql no contiene el CREATE TABLE de ' . $tabla);
}

/** Extrae el valor de una opción con formato `--clave=valor`. */
function valorOpcion(array $argumentos, string $clave): ?string
{
    $prefijo = '--' . $clave . '=';
    foreach ($argumentos as $argumento) {
        $argumento = (string) $argumento;
        if (strpos($argumento, $prefijo) === 0) {
            return substr($argumento, strlen($prefijo));
        }
    }
    return null;
}

/* -------------------------------------------------------------------------- */
/* Migración                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * @param string[] $argumentos Argumentos de CLI (--crear-admin, --admin-correo=…)
 * @return array<int, array{nivel: string, mensaje: string}>
 */
function ejecutarMigracion(array $argumentos): array
{
    $registro = [];
    $log = static function (string $mensaje, string $nivel = 'info') use (&$registro): void {
        $registro[] = ['nivel' => $nivel, 'mensaje' => $mensaje];
    };

    $pdo = db();
    $log('Base de datos «' . credencial('DB_NAME') . '» accesible.', 'ok');

    $dll = static function (PDO $pdo, string $sql, string $descripcion, callable $log): void {
        try {
            $pdo->exec($sql);
            $log($descripcion, 'ok');
        } catch (PDOException $e) {
            $log('No se pudo ' . lcfirst($descripcion) . ': ' . $e->getMessage(), 'error');
        }
    };

    // 1. Tablas -------------------------------------------------------
    $tablas = ['usuarios', 'sesiones', 'votos_articulos', 'multas', 'caja_chica_movimientos', 'configuraciones'];
    foreach ($tablas as $tabla) {
        if (tablaExiste($pdo, $tabla)) {
            $log('Tabla `' . $tabla . '` ya existe (se conserva).');
            continue;
        }
        crearTablaDesdeSchema($pdo, $tabla);
        $log('Tabla `' . $tabla . '` creada.', 'ok');
    }

    // 2. Votos: separar los dos documentos normativos ------------------
    if (columnaExiste($pdo, 'votos_articulos', 'documento')) {
        $log('Columna `votos_articulos`.`documento` ya existe.');
    } else {
        $dll(
            $pdo,
            "ALTER TABLE `votos_articulos` ADD COLUMN `documento` VARCHAR(24) NOT NULL DEFAULT 'reglamento' AFTER `id`",
            'agregar la columna `documento` a `votos_articulos`',
            $log
        );
    }

    if (columnaExiste($pdo, 'votos_articulos', 'usuario_id')) {
        $log('Columna `votos_articulos`.`usuario_id` ya existe.');
    } else {
        $dll(
            $pdo,
            'ALTER TABLE `votos_articulos` ADD COLUMN `usuario_id` INT NULL DEFAULT NULL AFTER `voter_token`',
            'agregar la columna `usuario_id` a `votos_articulos`',
            $log
        );
    }

    // 3. Clave única: (articulo_id, voter_token) -> (documento, articulo_id, voter_token)
    $claveNueva = 'uq_documento_articulo_votante';
    if (indiceExiste($pdo, 'votos_articulos', $claveNueva)) {
        $log('Clave única `' . $claveNueva . '` ya existe.');
    } else {
        foreach (clavesUnicas($pdo, 'votos_articulos') as $nombre => $columnas) {
            if ($nombre === $claveNueva) {
                continue;
            }
            $dll(
                $pdo,
                'ALTER TABLE `votos_articulos` DROP INDEX `' . $nombre . '`',
                'retirar la clave única anterior `' . $nombre . '` (' . implode(', ', $columnas) . ')',
                $log
            );
        }
        $dll(
            $pdo,
            'ALTER TABLE `votos_articulos` ADD UNIQUE KEY `uq_documento_articulo_votante` (`documento`, `articulo_id`, `voter_token`)',
            'crear la clave única `' . $claveNueva . '`',
            $log
        );
    }

    // 4. Índices de apoyo ---------------------------------------------
    $indices = [
        ['votos_articulos', 'idx_votos_capitulo', 'ADD KEY `idx_votos_capitulo` (`documento`, `capitulo_id`)'],
        ['votos_articulos', 'idx_votos_usuario', 'ADD KEY `idx_votos_usuario` (`usuario_id`)'],
        ['votos_articulos', 'idx_votos_tipo', 'ADD KEY `idx_votos_tipo` (`tipo_voto`)'],
        ['multas', 'idx_multas_socio', 'ADD KEY `idx_multas_socio` (`socio_id`, `fecha_infraccion`)'],
        ['caja_chica_movimientos', 'idx_caja_tipo_fecha', 'ADD KEY `idx_caja_tipo_fecha` (`tipo`, `fecha`)'],
    ];
    foreach ($indices as list($tabla, $nombre, $sql)) {
        if (indiceExiste($pdo, $tabla, $nombre)) {
            continue;
        }
        $dll($pdo, 'ALTER TABLE `' . $tabla . '` ' . $sql, 'crear el índice `' . $nombre . '`', $log);
    }

    // 5. Estado inicial del DRM ---------------------------------------
    $stmt = $pdo->prepare('SELECT `valor` FROM `configuraciones` WHERE `clave` = :clave');
    $stmt->execute([':clave' => 'drm_activo']);
    if ($stmt->fetchColumn() === false) {
        $pdo->prepare('INSERT INTO `configuraciones` (`clave`, `valor`) VALUES (:clave, :valor)')
            ->execute([':clave' => 'drm_activo', ':valor' => '1']);
        $log('Estado inicial del DRM: ACTIVO (protegido por defecto).', 'ok');
    } else {
        $log('El estado del DRM ya está configurado en `configuraciones` (se conserva).');
    }

    // 6. Administrador inicial ----------------------------------------
    if (!in_array('--crear-admin', $argumentos, true)) {
        return $registro;
    }

    $correo = strtolower(trim((string) (valorOpcion($argumentos, 'admin-correo') ?: getenv('CHACHO_ADMIN_CORREO') ?: '')));
    $clave = (string) (valorOpcion($argumentos, 'admin-clave') ?: getenv('CHACHO_ADMIN_CLAVE') ?: '');
    $nombre = (string) (valorOpcion($argumentos, 'admin-nombre') ?: getenv('CHACHO_ADMIN_NOMBRE') ?: '');

    if ($correo === '' || !validarCorreo($correo)) {
        $log('Falta un correo válido para el administrador (use --admin-correo=...).', 'error');
        return $registro;
    }
    $problema = validarContrasena($clave);
    if ($problema !== null) {
        $log('Clave del administrador rechazada: ' . $problema, 'error');
        return $registro;
    }

    $stmt = $pdo->prepare('SELECT `id` FROM `usuarios` WHERE `correo` = :correo');
    $stmt->execute([':correo' => $correo]);
    if ($stmt->fetchColumn() !== false) {
        $log('El usuario ' . $correo . ' ya existe: no se modificó su rol.', 'error');
        return $registro;
    }

    $pdo->prepare(
        'INSERT INTO `usuarios` (`nombre`, `correo`, `contrasena_hash`, `rol`)
         VALUES (:nombre, :correo, :hash, :rol)'
    )->execute([
        ':nombre' => $nombre !== '' ? $nombre : 'Administrador',
        ':correo' => $correo,
        ':hash'  => hashContrasena($clave),
        ':rol'   => ROL_ADMIN,
    ]);
    $log('Administrador creado: ' . $correo, 'ok');

    return $registro;
}

/* -------------------------------------------------------------------------- */
/* Punto de entrada                                                            */
/* -------------------------------------------------------------------------- */

$esCli = PHP_SAPI === 'cli';
$argumentos = $esCli ? array_slice($argv ?? [], 1) : [];

if (!$esCli) {
    enviarCors();
    manejarPreflight();
    header('Content-Type: text/html; charset=utf-8');
}

try {
    $salida = ejecutarMigracion($argumentos);
} catch (Throwable $e) {
    $salida = [['nivel' => 'error', 'mensaje' => 'Error durante la migración: ' . $e->getMessage()]];
}

if ($esCli) {
    foreach ($salida as $linea) {
        $prefijo = $linea['nivel'] === 'error' ? '[ERROR] ' : ($linea['nivel'] === 'ok' ? '[OK]    ' : '[INFO]  ');
        fwrite(STDOUT, $prefijo . $linea['mensaje'] . PHP_EOL);
    }
    exit(0);
}

$titulo = 'Migración de la base de datos';
echo '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    . '<title>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</title>'
    . '<style>body{font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:2rem}'
    . 'h1{font-size:1.15rem;margin:0 0 1rem}'
    . 'ul{list-style:none;padding:0;font-family:ui-monospace,monospace;font-size:.8rem}'
    . 'li{padding:.4rem .6rem;border-radius:6px;margin-bottom:.25rem}'
    . '.ok{background:#064e3b}.error{background:#7f1d1d}.info{background:#1e3a5f}</style>'
    . '</head><body><h1>' . htmlspecialchars($titulo, ENT_QUOTES, 'UTF-8') . '</h1><ul>';
foreach ($salida as $linea) {
    echo '<li class="' . htmlspecialchars($linea['nivel'], ENT_QUOTES, 'UTF-8') . '">'
        . htmlspecialchars($linea['mensaje'], ENT_QUOTES, 'UTF-8') . '</li>';
}
echo '</ul>'
    . '<p style="font-size:.75rem;opacity:.7">Por seguridad, elimine este archivo una vez finalizada la migración.</p>'
    . '</body></html>';
