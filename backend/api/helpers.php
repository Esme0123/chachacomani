<?php
/**
 * Helpers comunes del API: CORS, respuesta JSON y validación de `voter_token`.
 */
declare(strict_types=1);

/**
 * Envía los encabezados CORS para admitir peticiones desde el dominio de
 * GoDaddy en producción y desde localhost durante el desarrollo local.
 */
function enviarCors(): void
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';

    // Origen permitido: registro exacto o "wildcard temporal"
    $permitido = false;
    foreach (ALLOWED_ORIGINS as $o) {
        if ($o === '*' || ($origen !== '' && strtolower($o) === strtolower($origen))) {
            $permitido = true;
            break;
        }
    }

    if ($permitido) {
        header('Access-Control-Allow-Origin: ' . ($origen !== '' ? $origen : '*'));
        header('Vary: Origin');
    } elseif ($origen !== '') {
        header('Access-Control-Allow-Origin: *'); // respaldo mientras se configura el dominio
    } else {
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Voter-Token');
    header('Access-Control-Max-Age: 86400');
    header('X-Content-Type-Options: nosniff');
}

/** Responde preflight CORS y termina la ejecución. */
function manejarPreflight(): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Emite una respuesta JSON y termina.
 * @param mixed $datos
 */
function jsonResponse($datos, int $codigoHttp = 200): void
{
    http_response_code($codigoHttp);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($datos, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/** Emite una respuesta de error JSON y termina. */
function jsonError(string $mensaje, int $codigoHttp = 400): void
{
    jsonResponse(['ok' => false, 'error' => $mensaje], $codigoHttp);
}

/** Lee el cuerpo JSON de la petición (POST/PUT). */
function leerBodyJson(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        jsonError('Se esperaba un cuerpo JSON.', 400);
    }

    $datos = json_decode($raw, true);
    if (!is_array($datos)) {
        jsonError('JSON inválido.', 400);
    }

    return $datos;
}

/**
 * Valida el `voter_token` (UUID del navegador, 8-64 caracteres alfanuméricos).
 */
function validarVoterToken(string $token): bool
{
    return (bool) preg_match('/^[a-zA-Z0-9-]{8,64}$/', $token);
}

/**
 * Normaliza el `tipo_voto` a los valores del ENUM de la base de datos.
 */
function validarTipoVoto($tipo): ?string
{
    $t = strtolower((string) $tipo);
    if ($t === 'positivo') {
        return 'positivo';
    }
    if ($t === 'negativo') {
        return 'negativo';
    }
    // Compatibilidad con valores enviados desde versiones previas
    if ($t === 'bien' || $t === 'like') {
        return 'positivo';
    }
    if ($t === 'no_bien' || $t === 'dislike') {
        return 'negativo';
    }
    return null;
}

/** Devuelve la IP pública del visitante (IPv6 hasta 45 chars). */
function ipVisitante(): string
{
    if (!empty($_SERVER['HTTP_CF_CONNECTING_IP'])) { // Cloudflare
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) { // proxies genéricos
        $ip = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
    } else {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    $ip = filter_var(trim($ip), FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6);
    return $ip !== false ? $ip : '0.0.0.0';
}