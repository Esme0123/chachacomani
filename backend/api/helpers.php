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

/**
 * ¿La tabla tiene esa columna?
 * Sirve para que el código funcione sobre bases instaladas antes de una
 * migración: si la columna aún no existe, se degrada con comportamiento
 * razonable en vez de romper el endpoint con un error 500.
 * @param string $tabla
 * @param string $columna
 */
function tablaTieneColumna(string $tabla, string $columna): bool
{
    static $cache = [];

    $clave = $tabla . '.' . $columna;
    if (isset($cache[$clave])) {
        return $cache[$clave];
    }

    try {
        $stmt = db()->prepare(
            'SELECT COUNT(*) FROM information_schema.COLUMNS
              WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = :tabla
                AND COLUMN_NAME = :columna'
        );
        $stmt->execute([':tabla' => $tabla, ':columna' => $columna]);
        $existe = ((int) $stmt->fetchColumn()) > 0;
    } catch (PDOException $e) {
        error_log('helpers (columna): ' . $e->getMessage());
        $existe = false;
    }

    $cache[$clave] = $existe;
    return $existe;
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

/* -------------------------------------------------------------------------- */
/* Notificaciones                                                              */
/* -------------------------------------------------------------------------- */

/** ¿La tabla `notificaciones` ya fue creada por la migración? */
function notificacionDisponible(): bool
{
    return tablaTieneColumna('notificaciones', 'id');
}

/**
 * Inserta un aviso para un usuario (o para un rol, si `usuario_id` es null).
 * No falla si la migración aún no se aplicó: simplemente no hay campana.
 */
function crearNotificacion(
    PDO $pdo,
    ?int $usuarioId,
    ?string $rolDestino,
    string $titulo,
    string $mensaje
): void {
    if (!notificacionDisponible()) {
        return;
    }

    $pdo->prepare(
        'INSERT INTO `notificaciones` (`usuario_id`, `rol_destino`, `titulo`, `mensaje`)
         VALUES (:usuario_id, :rol_destino, :titulo, :mensaje)'
    )->execute([
        ':usuario_id'  => $usuarioId,
        ':rol_destino' => $rolDestino,
        ':titulo'      => textoLimpio($titulo, 150),
        ':mensaje'     => textoLimpio($mensaje, 2000),
    ]);
}

/** Aviso dirigido a un socio concreto. */
function notificarUsuario(PDO $pdo, int $usuarioId, string $titulo, string $mensaje): void
{
    crearNotificacion($pdo, $usuarioId, 'socio', $titulo, $mensaje);
}

/**
 * Aviso para todos los usuarios activos de uno o varios roles.
 * Se crea una fila por usuario para que el estado «leído» sea personal.
 *
 * @param string[] $roles Roles del sistema (`tesorero`, `caja_chica`, `admin`)
 *   o el alias `socio` (que internamente es el rol `lectura`).
 */
function notificarRoles(PDO $pdo, array $roles, string $titulo, string $mensaje): void
{
    if (!notificacionDisponible() || $roles === []) {
        return;
    }

    $rolesSistema = [];
    foreach ($roles as $rol) {
        $rolesSistema[] = $rol === 'socio' ? ROL_LECTURA : $rol;
    }
    $rolesSistema = array_values(array_unique($rolesSistema));
    if ($rolesSistema === []) {
        return;
    }

    $marcadores = implode(', ', array_fill(0, count($rolesSistema), '?'));
    $stmt = $pdo->prepare(
        'SELECT `id`, `rol` FROM `usuarios` WHERE `activo` = 1 AND `rol` IN (' . $marcadores . ')'
    );
    $stmt->execute($rolesSistema);

    foreach ($stmt->fetchAll() as $usuario) {
        $rolDestino = $usuario['rol'] === ROL_LECTURA ? 'socio' : (string) $usuario['rol'];
        crearNotificacion($pdo, (int) $usuario['id'], $rolDestino, $titulo, $mensaje);
    }
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

/**
 * Guarda un archivo de comprobante subido en `uploads/comprobantes/`.
 * Admite imágenes JPG, PNG, WEBP y documentos PDF de hasta 5 MB.
 * Devuelve la URL accesible absoluta o relativa del archivo, o null si no se adjuntó ninguno.
 *
 * @param array $archivo Elemento de $_FILES (ej. $_FILES['comprobante'])
 * @param string $prefijo Prefijo del nombre generado
 * @return string|null
 */
function guardarArchivoComprobante(array $archivo, string $prefijo = 'comprobante'): ?string
{
    $error = $archivo['error'] ?? UPLOAD_ERR_NO_FILE;
    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($error !== UPLOAD_ERR_OK) {
        jsonError('No se pudo subir el archivo de comprobante. Intente nuevamente.', 400);
    }

    $size = (int) ($archivo['size'] ?? 0);
    if ($size <= 0 || $size > 5 * 1024 * 1024) {
        jsonError('El archivo de comprobante no debe superar los 5 MB.', 400);
    }

    $mime = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) {
            $mime = (string) finfo_file($finfo, (string) $archivo['tmp_name']);
            finfo_close($finfo);
        }
    }
    if ($mime === '') {
        $porExtension = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'webp' => 'image/webp',
            'pdf' => 'application/pdf',
        ];
        $ext = strtolower(pathinfo((string) ($archivo['name'] ?? ''), PATHINFO_EXTENSION));
        $mime = $porExtension[$ext] ?? '';
    }

    $extensiones = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];
    if (!isset($extensiones[$mime])) {
        jsonError('Formato no admitido. Adjunte una imagen (JPG, PNG, WEBP) o un PDF.', 400);
    }

    $directorio = dirname(__DIR__) . '/uploads/comprobantes';
    if (!is_dir($directorio) && !mkdir($directorio, 0755, true) && !is_dir($directorio)) {
        error_log('guardarArchivoComprobante: no se pudo crear ' . $directorio);
        jsonError('No se pudo preparar el directorio de almacenamiento.', 500);
    }

    $nombre = $prefijo . '_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $extensiones[$mime];
    $destino = $directorio . '/' . $nombre;

    if (!move_uploaded_file((string) $archivo['tmp_name'], $destino)) {
        error_log('guardarArchivoComprobante: no se pudo mover a ' . $destino);
        jsonError('No se pudo guardar el archivo del comprobante.', 500);
    }

    $https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (string) ($_SERVER['SERVER_PORT'] ?? '') === '443';
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? '/api/deudas.php'));
    $base = rtrim(str_replace('\\', '/', dirname(dirname($script))), '/');
    return ($https ? 'https' : 'http') . '://' . $host . $base
        . '/uploads/comprobantes/' . rawurlencode($nombre);
}
