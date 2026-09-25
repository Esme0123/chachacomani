<?php
/**
 * Conexión PDO a la base de datos (optimizada para cPanel / GoDaddy).
 *
 * ▸ Las credenciales se leen de las constantes de este archivo y pueden
 *   sobrescribirse con variables de entorno (útil en cPanel → "Application
 *   Environment Variables"): DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS.
 * ▸ La base de datos se proporciona en `schema.sql` (importable en phpMyAdmin)
 *   y los cambios sobre una base ya existente se aplican con `php migrar.php`.
 *
 * Charset utf8mb4: permiso para emojis (👍/👎) y todo el alfabeto oficial.
 */
declare(strict_types=1);

// Las cabeceras CORS las emite SIEMPRE api/helpers.php (enviarCors()), que se
// encarga además de respetar la lista de orígenes permitidos. Este archivo NO
// debe enviar cabeceras: si lo hiciera, cada endpoint respondería con DOS
// cabeceras Access-Control-Allow-Origin y el navegador rechazaría la respuesta
// por CORS, dejando la aplicación inteira sin conexión con el API.
if (!headers_sent()) {
    header('Content-Type: application/json; charset=UTF-8');
}

const DB_HOST = 'localhost';
const DB_PORT = 3306;
const DB_NAME = 'chochocomani_bd';
const DB_USER = 'esme';
const DB_PASS = 'chochocomani123.';

/**
 * Orígenes permitidos por CORS.
 * - Para desarrollo local (Vite) se autoriza http://localhost:3000 y :5173
 * - En producción se incluye el dominio de GoDaddy.
 * Dejar como '*' permite cualquier origen (útil durante la migración).
 */
const ALLOWED_ORIGINS = [
    'http://localhost:3000',      // dev server de Vite (vite.config.js)
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://normas.chachacomani.com', // <- GoDaddy (producción)
    'https://chachacomani.com',   // dominio alternativo
    '*',                          // wildcard (permite cualquier origen durante la migración)
];

/**
 * Devuelve el valor de una credencial priorizando la variable de entorno.
 * @param string $constante Nombre de la constante declarada arriba.
 */
function credencial(string $constante): string
{
    $entorno = getenv($constante);
    if (is_string($entorno) && $entorno !== '') {
        return $entorno;
    }
    return (string) constant($constante);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        credencial('DB_HOST'),
        (int) credencial('DB_PORT'),
        credencial('DB_NAME')
    );

    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // errores controlados por excepciones
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,                  // consultas preparadas nativas
        PDO::ATTR_PERSISTENT         => true,                   // reutiliza la conexión
    ];

    try {
        $pdo = new PDO($dsn, credencial('DB_USER'), credencial('DB_PASS'), $opciones);
    } catch (PDOException $e) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'ok'      => false,
            'error'   => 'No se pudo conectar a la base de datos.',
            'detalle' => (defined('DB_DEBUG') && DB_DEBUG === true)
                ? $e->getMessage()
                : 'Revise las credenciales en backend/config/db.php',
        ]);
        exit;
    }

    return $pdo;
}

// PDO: ERRMODE_EXCEPTION activado para reportar errores de credenciales como
// excepciones (no se enmascaran). Para ver el mensaje real del DSN, defina
// DB_DEBUG antes de incluir este archivo, por ejemplo en la consola:
//   php -r "define('DB_DEBUG', true); require 'backend/config/db.php'; db();"
if (!defined('DB_DEBUG')) {
    define('DB_DEBUG', false);
}