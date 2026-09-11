<?php
/**
 * Conexión PDO a la base de datos (optimizada para cPanel / GoDaddy).
 *
 * ▸ Cambie DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASS con las credenciales
 *   que cPanel le muestre en "MySQL® Databases".
 * ▸ La base de datos se proporciona en `schema.sql` (importable en phpMyAdmin).
 *
 * Charset utf8mb4: permiso para emojis (👍/👎) y todo el alfabeto oficial.
 */
declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_PORT = 3306;
const DB_NAME = 'chochocomani_bd';
const DB_USER = 'esme';
const DB_PASS = 'chochocomani123.';

/**
 * Orígenes permitidos por CORS.
 * - Para desarrollo local (Vite) se autoriza http://localhost:5173
 * - En producción reemplace por el dominio de GoDaddy, por ejemplo:
 *   'https://www.su-dominio.com'
 * Dejar como '*' permite cualquier origen (útil durante la migración).
 */
const ALLOWED_ORIGINS = [
    'http://localhost:5173', // dev server de Vite
    'http://127.0.0.1:5173',
    'https://normas.chachacomani.com/', // <- GoDaddy (producción)
    '*'
];

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        DB_HOST,
        DB_PORT,
        DB_NAME
    );

    $opciones = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // errores controlados por excepciones
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,                  // consultas preparadas nativas
        PDO::ATTR_PERSISTENT         => true,                   // reutiliza la conexión
    ];

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, $opciones);
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

// Marque como true SOLO temporalmente si necesita depurar la conexión.
// @define('DB_DEBUG', true);