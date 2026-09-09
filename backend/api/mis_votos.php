<?php
/**
 * GET /backend/api/mis_votos.php?voter_token=UUID
 *
 * Devuelve los artículos que el voter_token ya evaluó junto con la opción
 * elegida. Es consumido por el frontend para bloquear la votación repetida:
 *
 *   {
 *     "ok":    true,
 *     "votos": [
 *       { "articulo_id": 1, "tipo_voto": "positivo" },
 *       { "articulo_id": 2, "tipo_voto": "negativo" }
 *     ]
 *   }
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';

enviarCors();
manejarPreflight();

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    jsonError('Método no permitido. Use GET.', 405);
}

$token = trim((string) ($_GET['voter_token'] ?? ''));
if (!validarVoterToken($token)) {
    jsonError('El parámetro `voter_token` es inválido.', 400);
}

$sql = 'SELECT articulo_id, tipo_voto
        FROM votos_articulos
        WHERE voter_token = :token
        ORDER BY articulo_id ASC';

try {
    $stmt = db()->prepare($sql);
    $stmt->execute([':token' => $token]);
    $filas = $stmt->fetchAll();
} catch (PDOException $e) {
    jsonError('No se pudieron consultar tus votos.', 500);
}

jsonResponse([
    'ok'    => true,
    'votos' => array_map(static fn ($fila) => [
        'articulo_id' => (int) $fila['articulo_id'],
        'tipo_voto'   => $fila['tipo_voto'],
    ], $filas),
]);