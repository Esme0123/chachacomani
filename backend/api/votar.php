<?php
/**
 * POST /backend/api/votar.php
 *
 * Registra la evaluación de un artículo: "Me parece bien" / "No me parece bien".
 * Sirve por igual al Reglamento Interno y al Estatuto Orgánico: la columna
 * `documento` de la tabla `votos_articulos` evita que los artículos homónimos
 * (ambos documentos numeran del 1 al 99) colisionen.
 *
 * Body (JSON):
 *   {
 *     "documento":   "reglamento" | "estatuto",   // opcional: por defecto reglamento
 *     "articulo_id": 1,
 *     "capitulo_id": 1,
 *     "tipo_voto":   "positivo" | "negativo",
 *     "voter_token": "uuid-del-navegador"         // sólo si NO hay sesión
 *   }
 *
 * Identidad del voto (voto único garantizado por la base de datos):
 *   · con sesión iniciada  -> 'u:<usuario_id>'  (un voto por socio y artículo)
 *   · sin sesión          -> 'voter_token' del navegador (un voto por equipo)
 *
 * Respuestas:
 *   200 – voto registrado
 *   409 – esta identidad ya evaluó ese artículo
 *         (clave única `uq_documento_articulo_votante`)
 *   400 – datos inválidos   500 – error de servidor
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

if (metodoHttp() !== 'POST') {
    jsonError('Método no permitido. Use POST.', 405);
}

$body = leerBodyJson();

$documento = validarDocumento($body['documento'] ?? 'reglamento');
if ($documento === null) {
    jsonError('El campo `documento` debe ser "reglamento" o "estatuto".', 400);
}

$articuloId = (int) ($body['articulo_id'] ?? 0);
$capituloId = (int) ($body['capitulo_id'] ?? 0);
$tipoVoto   = validarTipoVoto($body['tipo_voto'] ?? '');

// Identidad: se prioriza la sesión iniciada (voto único por socio).
$usuario    = usuarioActual();
$usuarioId  = $usuario !== null ? (int) $usuario['id'] : null;
$token      = $usuario !== null
    ? identidadDeVotante($usuario)
    : trim((string) ($body['voter_token'] ?? ''));

if ($articuloId <= 0) {
    jsonError('El campo `articulo_id` es obligatorio.', 400);
}
if ($capituloId <= 0) {
    jsonError('El campo `capitulo_id` es obligatorio.', 400);
}
if ($tipoVoto === null) {
    jsonError('El campo `tipo_voto` debe ser "positivo" o "negativo".', 400);
}
if (!validarIdentidadVotante($token)) {
    jsonError(
        $usuario === null
            ? 'Debe iniciar sesión para votar, o enviar un `voter_token` válido.'
            : 'La identidad del votante no es válida.',
        400
    );
}

$ip = ipVisitante();

$sql = 'INSERT INTO votos_articulos
            (documento, articulo_id, capitulo_id, tipo_voto, voter_token, usuario_id, ip_address)
        VALUES
            (:documento, :articulo_id, :capitulo_id, :tipo_voto, :voter_token, :usuario_id, :ip_address)';

try {
    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':documento'   => $documento,
        ':articulo_id' => $articuloId,
        ':capitulo_id' => $capituloId,
        ':tipo_voto'   => $tipoVoto,
        ':voter_token' => $token,
        ':usuario_id'  => $usuarioId,
        ':ip_address'  => $ip,
    ]);
} catch (PDOException $e) {
    // 23000 = violación de restricción (UNIQUE Key: la identidad ya votó este artículo)
    if ($e->getCode() === '23000') {
        jsonError('Ya has evaluado este artículo', 409);
    }
    error_log('votar: ' . $e->getMessage());
    jsonError('No se pudo registrar el voto.', 500);
}

jsonResponse([
    'ok'          => true,
    'documento'   => $documento,
    'articulo_id' => $articuloId,
    'tipo_voto'   => $tipoVoto,
    'mensaje'     => 'Voto registrado correctamente.',
], 200);
