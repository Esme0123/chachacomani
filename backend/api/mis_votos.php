<?php
/**
 * GET /backend/api/mis_votos.php?voter_token=UUID&documento=reglamento
 *   (o, con sesión iniciada: Authorization: Bearer <token>)
 *
 * Devuelve los artículos que la identidad ya evaluó, junto con la opción
 * elegida. Es lo que consume el frontend para bloquear la votación repetida
 * ("Ya evaluaste este artículo").
 *
 *   {
 *     "ok":    true,
 *     "votos": [ { "articulo_id": 1, "tipo_voto": "positivo" } ]
 *   }
 *
 * Con sesión iniciada la identidad es el `usuario_id` (voto único por socio) y
 * el `voter_token` se ignora; sin sesión se usa el token del navegador.
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

if (metodoHttp() !== 'GET') {
    jsonError('Método no permitido. Use GET.', 405);
}

$documento = validarDocumento($_GET['documento'] ?? 'reglamento');
if ($documento === null) {
    jsonError('El parámetro `documento` debe ser "reglamento" o "estatuto".', 400);
}

$usuario   = usuarioActual();
$usuarioId = $usuario !== null ? (int) $usuario['id'] : null;
$token     = $usuario !== null
    ? identidadDeVotante($usuario)
    : trim((string) ($_GET['voter_token'] ?? ''));

if (!validarIdentidadVotante($token)) {
    jsonError(
        $usuario === null
            ? 'Debe iniciar sesión o enviar un parámetro `voter_token` válido.'
            : 'La identidad del votante no es válida.',
        400
    );
}

$sql = 'SELECT articulo_id, tipo_voto
        FROM votos_articulos
        WHERE documento = :documento
          AND voter_token = :token
        ORDER BY articulo_id ASC';

try {
    $stmt = db()->prepare($sql);
    $stmt->execute([':documento' => $documento, ':token' => $token]);
    $filas = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log('mis_votos: ' . $e->getMessage());
    jsonError('No se pudieron consultar tus votos.', 500);
}

jsonResponse([
    'ok'        => true,
    'documento' => $documento,
    'autenticado' => $usuario !== null,
    'votos'     => array_map(static fn ($fila) => [
        'articulo_id' => (int) $fila['articulo_id'],
        'tipo_voto'   => $fila['tipo_voto'],
    ], $filas),
]);
