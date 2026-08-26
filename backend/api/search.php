<?php
/**
 * Endpoint REST API: api/search.php
 * Realiza búsqueda Full-Text en Artículos y Anexos
 * Parámetro GET: ?q=termino_a_buscar
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

$query = isset($_GET['q']) ? trim($_GET['q']) : '';

if (empty($query)) {
    echo json_encode([
        'status' => 'success',
        'query' => '',
        'total' => 0,
        'results' => []
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // Búsqueda en Artículos con JOIN a Capítulos
    $sqlArt = "SELECT 
                a.id, 
                a.numero, 
                a.denominacion, 
                a.contenido, 
                c.numero_romano as capitulo_romano, 
                c.titulo as capitulo_titulo,
                'articulo' as tipo
               FROM articulos a
               INNER JOIN capitulos c ON a.capitulo_id = c.id
               WHERE a.denominacion LIKE :qLike OR a.contenido LIKE :qLike
               ORDER BY a.numero ASC";

    $stmt = $pdo->prepare($sqlArt);
    $searchTerm = "%{$query}%";
    $stmt->bindValue(':qLike', $searchTerm, PDO::PARAM_STR);
    $stmt->execute();
    $artResults = $stmt->fetchAll();

    // Búsqueda en Anexos
    $sqlAnx = "SELECT 
                id, 
                numero_romano, 
                titulo, 
                nota, 
                disposiciones as contenido, 
                'anexo' as tipo 
               FROM anexos 
               WHERE titulo LIKE :qLike OR nota LIKE :qLike OR disposiciones LIKE :qLike";
    
    $stmtAnx = $pdo->prepare($sqlAnx);
    $stmtAnx->bindValue(':qLike', $searchTerm, PDO::PARAM_STR);
    $stmtAnx->execute();
    $anxResults = $stmtAnx->fetchAll();

    $allResults = array_merge($artResults, $anxResults);

    echo json_encode([
        'status' => 'success',
        'query' => $query,
        'total' => count($allResults),
        'results' => $allResults
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al ejecutar la búsqueda',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
