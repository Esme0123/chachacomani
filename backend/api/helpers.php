<?php
/**
 * Helpers comunes del API: CORS, respuesta JSON, saneado de entradas y
 * validación de los catálogos cerrados (documento normativo, tipo de voto).
 */
declare(strict_types=1);

/** Documentos normativos que admiten votación. */
const DOCUMENTOS_NORMATIVOS = ['reglamento', 'estatuto'];

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

    header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Voter-Token, X-Auth-Token');
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

/** Devuelve el método HTTP de la petición en mayúsculas. */
function metodoHttp(): string
{
    return strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));
}

/**
 * Normaliza y recorta un texto recibido del cliente.
 * @param mixed $valor
 */
function textoLimpio($valor, int $maximo = 255): string
{
    $texto = trim((string) $valor);
    $texto = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $texto) ?? $texto;
    if (function_exists('mb_substr')) {
        return mb_substr($texto, 0, $maximo);
    }
    return substr($texto, 0, $maximo);
}

/** Valida un correo electrónico y lo devuelve en minúsculas, o null si no es válido. */
function normalizarCorreo($correo): ?string
{
    $correo = strtolower(textoLimpio($correo, 190));
    return validarCorreo($correo) ? $correo : null;
}

/** ¿Es un correo electrónico con formato válido? */
function validarCorreo(string $correo): bool
{
    return (bool) filter_var($correo, FILTER_VALIDATE_EMAIL) && strlen($correo) <= 190;
}

/**
 * Normaliza un valor de entrada a booleano (`true`/`1`/`"1"`/`"si"`/`"on"`).
 * Devuelve null cuando el valor no es reconocible.
 * @param mixed $valor
 */
function entradaBooleana($valor): ?bool
{
    if (is_bool($valor)) {
        return $valor;
    }
    if (is_int($valor)) {
        return $valor === 1 ? true : ($valor === 0 ? false : null);
    }
    $texto = strtolower(trim((string) $valor));
    if (in_array($texto, ['1', 'true', 'si', 'sí', 'on', 'activo'], true)) {
        return true;
    }
    if (in_array($texto, ['0', 'false', 'no', 'off', 'inactivo'], true)) {
        return false;
    }
    return null;
}

/**
 * Normaliza el `documento` a los valores admitidos por la tabla de votos.
 * ('reglamento' | 'estatuto'), con alias tolerados.
 */
function validarDocumento($documento): ?string
{
    $doc = strtolower(trim((string) $documento));
    if ($doc === '') {
        return 'reglamento';
    }
    if ($doc === 'reglamento_interno' || $doc === 'ri') {
        return 'reglamento';
    }
    if ($doc === 'estatuto_organico' || $doc === 'eo') {
        return 'estatuto';
    }
    return in_array($doc, DOCUMENTOS_NORMATIVOS, true) ? $doc : null;
}

/** Devuelve el `documento` solicitado (query o cuerpo JSON) ya normalizado. */
function documentoSolicitado(): ?string
{
    $crudo = $_GET['documento'] ?? null;
    if ($crudo === null) {
        $cuerpo = cuerpoJsonOpcional();
        $crudo = $cuerpo['documento'] ?? null;
    }
    return validarDocumento($crudo);
}

/**
 * Variante de `leerBodyJson()` que devuelve un array vacío cuando el cuerpo
 * viene vacío. Útil en endpoints que aceptan GET y POST.
 */
function cuerpoJsonOpcional(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }
    $datos = json_decode($raw, true);
    return is_array($datos) ? $datos : [];
}

/**
 * Valida la identidad del votante usada por la tabla `votos_articulos`:
 *   · `u:<id>`  -> usuario autenticado (voto único por socio)
 *   · token UUID del navegador -> visitante anónimo
 */
function validarIdentidadVotante(string $identidad): bool
{
    if (preg_match('/^u:\d{1,10}$/', $identidad)) {
        return true;
    }
    return (bool) preg_match('/^[a-zA-Z0-9-]{8,64}$/', $identidad);
}

/** Construye la identidad de voto de un usuario autenticado. */
function identidadDeUsuario(int $usuarioId): string
{
    return 'u:' . $usuarioId;
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