<?php
/**
 * GET /backend/api/estadisticas.php
 *
 * Devuelve las estadísticas globales de evaluación del Reglamento:
 *   - totalVotos / aprobacionGeneral
 *   - capitulos[]: por capítulo (desglose con % de aprobación)
 *   - cada capítulo trae sus articulos[] con likes/dislikes/aprobación
 *
 * Uso desde el Dashboard de Administración de React.
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

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    jsonError('Método no permitido. Use GET.', 405);
}

// Consulta agregada: artículos con su conteo de votos por tipo
$sql = 'SELECT
            v.articulo_id,
            v.capitulo_id,
            COALESCE(SUM(CASE WHEN v.tipo_voto = "positivo" THEN 1 ELSE 0 END), 0) AS likes,
            COALESCE(SUM(CASE WHEN v.tipo_voto = "negativo" THEN 1 ELSE 0 END), 0) AS dislikes
        FROM votos_articulos v
        GROUP BY v.articulo_id, v.capitulo_id
        ORDER BY v.capitulo_id ASC, v.articulo_id ASC';

try {
    $filas = db()->query($sql)->fetchAll();
} catch (PDOException $e) {
    jsonError('No se pudieron obtener las estadísticas.', 500);
}

// Estructura: capítulo -> artículos
$mapa = [];
foreach ($filas as $fila) {
    $capId = (int) $fila['capitulo_id'];
    $artId = (int) $fila['articulo_id'];
    $likes = (int) $fila['likes'];
    $dislikes = (int) $fila['dislikes'];
    $total = $likes + $dislikes;

    $mapa[$capId][] = [
        'id'          => $artId,
        'numero'      => $artId,
        'denominacion' => 'Artículo ' . $artId,
        'likes'       => $likes,
        'dislikes'    => $dislikes,
        'total'       => $total,
        'aprobacion'  => $total > 0 ? (int) round(($likes / $total) * 100) : null,
    ];
}

// Se agrupa en el formato esperado por el Dashboard (un objeto por capítulo)
$capitulos = [];
foreach ($mapa as $capId => $articulos) {
    $likes = array_sum(array_column($articulos, 'likes'));
    $dislikes = array_sum(array_column($articulos, 'dislikes'));
    $totalVotos = $likes + $dislikes;

    $capitulos[] = [
        'capituloId'   => $capId,
        'capituloRomano' => (string) $capId,
        'titulo'       => 'Capítulo ' . $capId,
        'likes'        => $likes,
        'dislikes'     => $dislikes,
        'totalVotos'   => $totalVotos,
        'aprobacion'   => $totalVotos > 0 ? (int) round(($likes / $totalVotos) * 100) : null,
        'articulos'    => $articulos,
    ];
}

$totalVotos = array_sum(array_column($capitulos, 'totalVotos'));
$totalLikes = array_sum(array_column($capitulos, 'likes'));

jsonResponse([
    'totalVotos'        => $totalVotos,
    'aprobacionGeneral' => $totalVotos > 0 ? (int) round(($totalLikes / $totalVotos) * 100) : null,
    'capitulos'         => $capitulos,
]);