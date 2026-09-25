<?php
/**
 * GET /backend/api/estadisticas.php?documento=reglamento|estatuto
 *
 * Devuelve las estadísticas de evaluación del documento solicitado:
 *   - totalVotos / aprobacionGeneral
 *   - capitulos[]: por capítulo (desglose con % de aprobación)
 *   - cada capítulo trae sus articulos[] con likes/dislikes/aprobación
 *
 * Todos los contadores se calculan en MySQL: si un artículo no tiene filas, el
 * frontend lo completa con ceros a partir del catálogo oficial (nunca inventa
 * cifras).
 *
 * Esta consulta NO exige sesión ni permiso: es el backing de la barra de votos
 * del lector, que es pública por diseño. El detalle administrativo de la
 * evaluación de artículos (Dashboard del Administrador) se restringe en la
 * interfaz con el permiso `estadisticas:ver`, que sólo tiene el rol `admin`
 * (ver `roles.php`); ningún endpoint permite escribir ni borrar aquí.
 *
 * Uso desde el Dashboard de Administración de React.
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

// Consulta agregada: artículos con su conteo de votos por tipo
$sql = 'SELECT
            v.articulo_id,
            v.capitulo_id,
            COALESCE(SUM(CASE WHEN v.tipo_voto = "positivo" THEN 1 ELSE 0 END), 0) AS likes,
            COALESCE(SUM(CASE WHEN v.tipo_voto = "negativo" THEN 1 ELSE 0 END), 0) AS dislikes
        FROM votos_articulos v
        WHERE v.documento = :documento
        GROUP BY v.articulo_id, v.capitulo_id
        ORDER BY v.capitulo_id ASC, v.articulo_id ASC';

try {
    $stmt = db()->prepare($sql);
    $stmt->execute([':documento' => $documento]);
    $filas = $stmt->fetchAll();
} catch (PDOException $e) {
    error_log('estadisticas: ' . $e->getMessage());
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
    'ok'                => true,
    'documento'         => $documento,
    'totalVotos'        => $totalVotos,
    'aprobacionGeneral' => $totalVotos > 0 ? (int) round(($totalLikes / $totalVotos) * 100) : null,
    'capitulos'         => $capitulos,
]);
