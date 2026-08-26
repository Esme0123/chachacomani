<?php
/**
 * Endpoint REST API: api/get_reglamento.php
 * Devuelve la estructura jerárquica completa del Reglamento Interno:
 * Capítulos I al XXI (Artículos 1 al 105) y ANEXOS I y II.
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

try {
    // 1. Obtener Capítulos con sus respectivos Artículos
    $stmtCaps = $pdo->query("SELECT id, numero_romano, numero, titulo, descripcion FROM capitulos ORDER BY numero ASC");
    $capitulos = $stmtCaps->fetchAll();

    $stmtArts = $pdo->query("SELECT id, capitulo_id, numero, denominacion, contenido FROM articulos ORDER BY numero ASC");
    $allArticulos = $stmtArts->fetchAll();

    // Agrupar artículos por capitulo_id
    $articulosPorCapitulo = [];
    foreach ($allArticulos as $art) {
        $capId = (int)$art['capitulo_id'];
        if (!isset($articulosPorCapitulo[$capId])) {
            $articulosPorCapitulo[$capId] = [];
        }
        $articulosPorCapitulo[$capId][] = [
            'id' => (int)$art['id'],
            'numero' => (int)$art['numero'],
            'denominacion' => $art['denominacion'],
            'contenido' => $art['contenido']
        ];
    }

    // Armar estructura de capítulos
    $estructuraCapitulos = [];
    foreach ($capitulos as $cap) {
        $capId = (int)$cap['id'];
        $estructuraCapitulos[] = [
            'id' => $capId,
            'numero_romano' => $cap['numero_romano'],
            'numero' => (int)$cap['numero'],
            'titulo' => $cap['titulo'],
            'descripcion' => $cap['descripcion'],
            'articulos' => $articulosPorCapitulo[$capId] ?? []
        ];
    }

    // 2. Obtener Anexos I y II con sus tablas
    $stmtAnexos = $pdo->query("SELECT id, numero_romano, titulo, nota, disposiciones FROM anexos ORDER BY id ASC");
    $anexos = $stmtAnexos->fetchAll();

    $stmtTablas = $pdo->query("SELECT id, anexo_id, nombre_tabla, datos_json FROM anexo_tablas ORDER BY id ASC");
    $tablas = $stmtTablas->fetchAll();

    $tablasPorAnexo = [];
    foreach ($tablas as $tab) {
        $anxId = (int)$tab['anexo_id'];
        if (!isset($tablasPorAnexo[$anxId])) {
            $tablasPorAnexo[$anxId] = [];
        }
        $tablasPorAnexo[$anxId][] = [
            'id' => (int)$tab['id'],
            'nombre_tabla' => $tab['nombre_tabla'],
            'datos' => is_string($tab['datos_json']) ? json_decode($tab['datos_json'], true) : $tab['datos_json']
        ];
    }

    $estructuraAnexos = [];
    foreach ($anexos as $anx) {
        $anxId = (int)$anx['id'];
        $estructuraAnexos[] = [
            'id' => $anxId,
            'numero_romano' => $anx['numero_romano'],
            'titulo' => $anx['titulo'],
            'nota' => $anx['nota'],
            'disposiciones' => $anx['disposiciones'],
            'tablas' => $tablasPorAnexo[$anxId] ?? []
        ];
    }

    // Respuesta JSON unificada
    $response = [
        'status' => 'success',
        'cooperativa' => [
            'nombre' => 'Cooperativa Minera "Aurífera Nevado Chachacomani" R.L.',
            'documento' => 'Reglamento Interno',
            'fecha_propuesta' => 'Agosto de 2026',
            'aprobacion' => 'Asamblea General Extraordinaria',
            'articulos_totales' => count($allArticulos),
            'capitulos_totales' => count($capitulos)
        ],
        'data' => [
            'capitulos' => $estructuraCapitulos,
            'anexos' => $estructuraAnexos
        ]
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al procesar la solicitud del reglamento',
        'details' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
