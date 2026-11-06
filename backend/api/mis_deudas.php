<?php
/**
 * ============================================================================
 *  VISTA PERSONAL DE DEUDAS Y MULTAS (api/mis_deudas.php)
 * ============================================================================
 *  Fuerza estrictamente `propias = 1` y filtra por el usuario activo en sesión.
 *  Ningún usuario puede acceder a deudas de otros socios a través de esta ruta.
 * ============================================================================
 */
declare(strict_types=1);

// Forzar la consulta propia
$_GET['propias'] = '1';

require __DIR__ . '/deudas.php';
