<?php
/**
 * ============================================================================
 *  ENRUTADOR DEL API — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Publica rutas limpias (sin extensión) que apuntan a los mismos endpoints
 *  PHP de siempre, para que el frontend consuma por ejemplo:
 *
 *      POST /api/auth/register   ->  api/auth/registro.php
 *      POST /api/auth/login      ->  api/auth/login.php
 *      GET  /api/auth/me         ->  api/auth/perfil.php
 *      POST /api/auth/password   ->  api/auth/password.php
 *      GET  /api/auth/usuarios   ->  api/auth/usuarios.php
 *      GET  /api/drm             ->  api/drm.php
 *      GET  /api/multas          ->  api/multas.php
 *      GET  /api/caja-chica      ->  api/caja_chica.php
 *      GET  /api/votos           ->  api/mis_votos.php
 *      GET  /api/estadisticas    ->  api/estadisticas.php
 *      POST /api/votos           ->  api/votar.php
 *
 *  El acceso directo a los archivos `.php` sigue funcionando (compatibilidad
 *  con despliegues donde `mod_rewrite` no está disponible). El mapa es una
 *  lista blanca: cualquier ruta desconocida responde 404 y NO se incluye
 *  ningún archivo del disco.
 * ============================================================================
 */
declare(strict_types=1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Voter-Token, X-Auth-Token');
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

/* -------------------------------------------------------------------------- */
/* Lista blanca de rutas                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Cada entrada asocia un método HTTP con el endpoint que lo atiende. Una misma
 * ruta limpia puede repartir entre varios archivos según el método; así
 * `GET /api/votos` lista los votos del usuario y `POST /api/votos` registra
 * uno, sin depender de que el servidor web enrute por extensión.
 */
const RUTAS_API = [
    // Autenticación (las rutas pedidas por la especificación)
    'auth/register'         => ['POST' => 'auth/registro.php'],
    'auth/registro'         => ['POST' => 'auth/registro.php'],
    'auth/login'            => ['POST' => 'auth/login.php'],
    'auth/logout'           => ['POST' => 'auth/logout.php'],
    'auth/me'               => ['GET' => 'auth/perfil.php', 'PUT' => 'auth/perfil.php'],
    'auth/perfil'           => ['GET' => 'auth/perfil.php', 'PUT' => 'auth/perfil.php'],
    'auth/profile'          => ['GET' => 'auth/perfil.php', 'PUT' => 'auth/perfil.php'],
    'auth/password'         => ['POST' => 'auth/password.php'],
    'auth/cambiar-password' => ['POST' => 'auth/password.php'],

    // Gestión de usuarios y roles (sólo Administrador)
    'auth/usuarios'         => ['GET' => 'auth/usuarios.php', 'POST' => 'auth/usuarios.php', 'PUT' => 'auth/usuarios.php'],
    'usuarios'              => ['GET' => 'auth/usuarios.php', 'POST' => 'auth/usuarios.php', 'PUT' => 'auth/usuarios.php'],

    // Configuración global (el DRM sólo se escribe por el Administrador)
    'drm'                   => ['GET' => 'drm.php', 'POST' => 'drm.php'],

    // Módulo de multas (Anexo I) y caja chica
    'multas'                => ['GET' => 'multas.php', 'POST' => 'multas.php', 'PUT' => 'multas.php'],
    'caja-chica'            => ['GET' => 'caja_chica.php', 'POST' => 'caja_chica.php'],
    'caja_chica'            => ['GET' => 'caja_chica.php', 'POST' => 'caja_chica.php'],

    // Votación de artículos
    'votos'                 => ['GET' => 'mis_votos.php', 'POST' => 'votar.php'],
    'mis-votos'             => ['GET' => 'mis_votos.php'],
    'estadisticas'          => ['GET' => 'estadisticas.php'],
    'votar'                 => ['POST' => 'votar.php', 'GET' => 'votar.php'],
];

/* -------------------------------------------------------------------------- */
/* Resolución de la ruta                                                      */
/* -------------------------------------------------------------------------- */

/**
 * La ruta llega en el parámetro `ruta` (regla de .htaccess) o en PATH_INFO
 * (fallback para `php -S` y servidores con CGI).
 */
function rutaSolicitada(): string
{
    $ruta = $_GET['ruta'] ?? '';
    if ($ruta === '' && isset($_SERVER['PATH_INFO'])) {
        $ruta = (string) $_SERVER['PATH_INFO'];
    }
    if ($ruta === '' && isset($_SERVER['ORIG_PATH_INFO'])) {
        $ruta = (string) $_SERVER['ORIG_PATH_INFO'];
    }

    $ruta = rawurldecode((string) $ruta);
    $ruta = ltrim($ruta, '/');
    // Se descarta cualquier sufijo de extensión para aceptar /api/auth/login.php
    $ruta = preg_replace('/\.php$/i', '', $ruta) ?? $ruta;

    return strtolower(trim($ruta));
}

/**
 * Devuelve la ruta al endpoint que atiende el método recibido, o responde 405
 * con la cabecera `Allow` cuando esa ruta no admite el método.
 *
 * @param array<string,string> $porMetodo
 */
function resolverEndpoint(string $ruta, array $porMetodo): string
{
    $metodo = metodoHttp();

    if (isset($porMetodo[$metodo])) {
        return __DIR__ . '/' . $porMetodo[$metodo];
    }

    $permitidos = array_keys($porMetodo);
    header('Allow: ' . implode(', ', array_merge($permitidos, ['OPTIONS'])));
    jsonError(
        'El método ' . $metodo . ' no está permitido en /api/' . $ruta
        . '. Use: ' . implode(', ', $permitidos) . '.',
        405
    );
}

$ruta = rutaSolicitada();

if ($ruta === '') {
    // Índice del API: útil como comprobación de despliegue.
    $catalogo = [];
    foreach (RUTAS_API as $nombre => $porMetodo) {
        $catalogo[] = ['ruta' => '/api/' . $nombre, 'metodos' => array_keys($porMetodo)];
    }
    jsonResponse([
        'ok'      => true,
        'servicio' => 'Cooperativa Minera Nevado Chachacomani R.L. — API normativa',
        'rutas'   => array_keys(RUTAS_API),
        'catalogo' => $catalogo,
    ]);
}

if (!isset(RUTAS_API[$ruta])) {
    jsonError('Ruta de API desconocida: /api/' . $ruta, 404);
}

$destino = resolverEndpoint($ruta, RUTAS_API[$ruta]);

if (!is_file($destino)) {
    jsonError('El endpoint ' . basename($destino) . ' no está disponible en este despliegue.', 500);
}

// El endpoint incluido se encarga del método, la validación y la respuesta:
// `jsonResponse()` / `jsonError()` terminan la ejecución con `exit`.
require $destino;
