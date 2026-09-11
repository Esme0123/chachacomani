<?php
/**
 * POST /backend/api/votar.php
 *
 * Registra la evaluación de un artículo: "Me parece bien" / "No me parece bien".
 *
 * Body (JSON):
 *   {
 *     "articulo_id":  1,
 *     "capitulo_id":  1,
 *     "tipo_voto":    "positivo" | "negativo",
 *     "voter_token":  "uuid-generado-por-el-navegador"
 *   }
 *
 * Respuestas:
 *   200 – voto registrado
 *   409 – el voter_token ya evaluó ese artículo (clave única `(articulo_id, voter_token)`)
 *   400 – datos inválidos   500 – error de servidor
 */
declare(strict_types=1);

// Cabeceras CORS universales (se envía antes que cualquier otra cosa).
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Voter-Token');
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';

enviarCors();
manejarPreflight();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    jsonError('Método no permitido. Use POST.', 405);
}

$body = leerBodyJson();

$articuloId = (int) ($body['articulo_id'] ?? 0);
$capituloId = (int) ($body['capitulo_id'] ?? 0);
$tipoVoto   = validarTipoVoto($body['tipo_voto'] ?? '');
$token      = trim((string) ($body['voter_token'] ?? ''));

if ($articuloId <= 0) {
    jsonError('El campo `articulo_id` es obligatorio.', 400);
}
if ($capituloId <= 0) {
    jsonError('El campo `capitulo_id` es obligatorio.', 400);
}
if ($tipoVoto === null) {
    jsonError('El campo `tipo_voto` debe ser "positivo" o "negativo".', 400);
}
if (!validarVoterToken($token)) {
    jsonError('El campo `voter_token` es inválido.', 400);
}

$ip = ipVisitante();

$sql = 'INSERT INTO votos_articulos (articulo_id, capitulo_id, tipo_voto, voter_token, ip_address)
        VALUES (:articulo_id, :capitulo_id, :tipo_voto, :voter_token, :ip_address)';

try {
    $stmt = db()->prepare($sql);
    $stmt->execute([
        ':articulo_id' => $articuloId,
        ':capitulo_id' => $capituloId,
        ':tipo_voto'   => $tipoVoto,
        ':voter_token' => $token,
        ':ip_address'  => $ip,
    ]);
} catch (PDOException $e) {
    // 23000 = violación de restricción (UNIQUE Key: el token ya votó este artículo)
    if ($e->getCode() === '23000') {
        jsonError('Ya has evaluado este artículo', 409);
    }
    jsonError('No se pudo registrar el voto.', 500);
}

jsonResponse([
    'ok'          => true,
    'articulo_id' => $articuloId,
    'tipo_voto'   => $tipoVoto,
    'mensaje'     => 'Voto registrado correctamente.',
], 200);