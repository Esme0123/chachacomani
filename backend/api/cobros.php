<?php
/**
 * ============================================================================
 *  COBROS GRUPALES — Carrito de Caja Chica (Anexo I + Anexo II)
 * ============================================================================
 *  POST /backend/api/cobros.php
 *
 *  Registra, en UNA sola transacción, un cobro que puede combinar varias
 *  multas del Anexo I y varios aportes del Anexo II seleccionados en el
 *  carrito del panel de Caja Chica. Efectos:
 *
 *    1. Cada multa del carrito se inserta YA PAGADA.
 *    2. Se crea UN ÚNICO movimiento de INGRESO en `caja_chica_movimientos`
 *       por el importe total, con el desglose guardado en `detalle` (JSON).
 *    3. Cada multa queda enlazada a ese movimiento en
 *       `multas`.`caja_chica_movimiento_id`.
 *
 *  Permisos POR ÍTEM
 *  -----------------
 *    · ítem `multa`  -> exige `multas:gestionar`      (Tesorero / Admin)
 *    · ítem `aporte` -> exige `caja_chica:gestionar`  (Caja Chica / Admin)
 *
 *  Así el Tesorero puede enviar sólo multas, el rol Caja Chica sólo aportes, y
 *  un cobro mixto queda reservado al Administrador (tiene ambos permisos).
 *
 *  Body
 *  ----
 *    {
 *      "socio_id": 3,
 *      "fecha_cobro": "2026-09-30",       // opcional; por defecto hoy
 *      "observaciones": "…",              // opcional
 *      "concepto_cobro": "…",             // opcional; si falta se compone aquí
 *      "items": [
 *        { "tipo": "multa", "infraccion": "Inasistencia…", "articulo": "Art. 41",
 *          "categoria": "Grave", "monto": 300, "fecha_infraccion": "2026-09-20",
 *          "medida_complementaria": "", "observaciones": "" },
 *        { "tipo": "aporte", "concepto": "Aporte Ordinario", "monto": 10 }
 *      ]
 *    }
 *
 *  Respuesta: { ok, cobro: { movimientoId, categoria, concepto, monto, fecha,
 *              multas: [id…], detalle }, mensaje }
 * ============================================================================
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

/* Categorías del ENUM `multas.categoria` (deben coincidir con el backend). */
const CATEGORIAS_MULTA_COBRO = ['Leve', 'Grave', 'Muy grave', 'Falta gravísima'];

/* Categorías de `caja_chica_movimientos` según la composición del carrito. */
const CATEGORIA_CAJA_MULTA  = 'Multas / Sanciones';
const CATEGORIA_CAJA_APORTE = 'Aportes / Fondos';
const CATEGORIA_CAJA_MIXTO  = 'Cobros Anexo I y II';

/** Tope defensivo del carrito para no aceptar un cuerpo desmedido. */
const MAX_ITEMS_COBRO = 40;

/** Formatea un monto en Bs. sin ceros decimales sobrantes (300 / 150.5). */
function numeroBs(float $monto): string
{
    $texto = number_format($monto, 2, '.', '');
    return rtrim(rtrim($texto, '0'), '.');
}

/** Valida una fecha `AAAA-MM-DD` que exista en el calendario. */
function validarFechaIso(string $fecha): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        return false;
    }
    list($anio, $mes, $dia) = array_map('intval', explode('-', $fecha));
    return checkdate($mes, $dia, $anio);
}

/**
 * Compone el concepto del cobro con el formato del panel de Caja Chica:
 *   "Cobro Anexo I/II: [Art. 41 (300 Bs) + Aporte Ordinario (10 Bs)] - Socio: …"
 * El prefijo «Anexo I», «Anexo II» o «Anexo I/II» refleja la composición real.
 *
 * @param array<int, array{tipo:string, monto:float, articulo?:string, concepto?:string}> $items
 */
function componerConceptoCobro(array $items, string $socio): string
{
    $hayMultas = false;
    $hayAportes = false;
    $partes = [];

    foreach ($items as $item) {
        if ($item['tipo'] === 'aporte') {
            $hayAportes = true;
            $etiqueta = (string) $item['concepto'];
        } else {
            $hayMultas = true;
            $etiqueta = (string) $item['articulo'];
        }
        $partes[] = $etiqueta . ' (' . numeroBs((float) $item['monto']) . ' Bs)';
    }

    $anexo = $hayMultas && $hayAportes
        ? 'Anexo I/II'
        : ($hayAportes ? 'Anexo II' : 'Anexo I');

    $sufijo = $socio !== '' ? ' - Socio: ' . $socio : '';
    $prefijo = 'Cobro ' . $anexo . ': [';
    $presupuesto = 255 - strlen($prefijo) - 1 - strlen($sufijo); // 1 = ']'

    $visibles = [];
    $usado = 0;
    foreach ($partes as $indice => $parte) {
        $suma = $usado + strlen($parte) + ($usado > 0 ? 3 : 0); // " + " = 3
        if ($suma > $presupuesto && $usado > 0) {
            $visibles[] = '… (+' . (count($partes) - $indice) . ' más)';
            break;
        }
        $visibles[] = $parte;
        $usado = $suma;
    }

    return trim($prefijo . implode(' + ', $visibles) . ']' . $sufijo);
}

/* -------------------------------------------------------------------------- */
/* Lectura y validación                                                        */
/* -------------------------------------------------------------------------- */

$usuario = exigirUsuario();
$body = leerBodyJson();

$socioId      = (int) ($body['socio_id'] ?? 0);
$fechaCobro   = trim((string) ($body['fecha_cobro'] ?? ''));
$observaciones = textoLimpio($body['observaciones'] ?? '', 2000);
$conceptoCliente = textoLimpio($body['concepto_cobro'] ?? '', 255);
$itemsCrudos  = $body['items'] ?? null;

if ($socioId <= 0) {
    jsonError('Debe seleccionar el socio al que se imputa el cobro.', 400);
}
if (!is_array($itemsCrudos) || $itemsCrudos === []) {
    jsonError('El carrito está vacío: agregue al menos una multa o un aporte.', 400);
}
if (count($itemsCrudos) > MAX_ITEMS_COBRO) {
    jsonError('El carrito admite como máximo ' . MAX_ITEMS_COBRO . ' ítems.', 400);
}
if ($fechaCobro !== '' && !validarFechaIso($fechaCobro)) {
    jsonError('La fecha de cobro debe tener el formato AAAA-MM-DD.', 400);
}

$items = [];
$hayMultas = false;
$hayAportes = false;
$total = 0.0;

foreach (array_values($itemsCrudos) as $indice => $crudo) {
    $numero = $indice + 1;

    if (!is_array($crudo)) {
        jsonError('El ítem #' . $numero . ' del carrito no es válido.', 400);
    }

    $tipo = strtolower(trim((string) ($crudo['tipo'] ?? '')));
    $monto = (float) str_replace(',', '.', (string) ($crudo['monto'] ?? 0));

    if (!in_array($tipo, ['multa', 'aporte'], true)) {
        jsonError('El ítem #' . $numero . ' debe ser de tipo «multa» o «aporte».', 400);
    }
    if ($monto <= 0 || $monto > 1000000) {
        jsonError('El ítem #' . $numero . ' debe tener un monto en bolivianos mayor a 0.', 400);
    }

    if ($tipo === 'multa') {
        $infraccion = textoLimpio($crudo['infraccion'] ?? '', 255);
        $articulo = textoLimpio($crudo['articulo'] ?? ($crudo['articulo_referencia'] ?? ''), 60);
        $categoria = textoLimpio($crudo['categoria'] ?? 'Leve', 20);
        $fechaInfraccion = trim((string) ($crudo['fecha_infraccion'] ?? date('Y-m-d')));
        $medida = textoLimpio($crudo['medida_complementaria'] ?? ($crudo['medida'] ?? ''), 255);
        $obsItem = textoLimpio($crudo['observaciones'] ?? '', 2000);

        if ($infraccion === '') {
            jsonError('El ítem #' . $numero . ': debe describir la infracción tipificada.', 400);
        }
        if ($articulo === '') {
            jsonError('El ítem #' . $numero . ': debe indicar el artículo de referencia.', 400);
        }
        if (!in_array($categoria, CATEGORIAS_MULTA_COBRO, true)) {
            jsonError('El ítem #' . $numero . ': categoría no válida. Use: '
                . implode(', ', CATEGORIAS_MULTA_COBRO) . '.', 400);
        }
        if (!validarFechaIso($fechaInfraccion)) {
            jsonError('El ítem #' . $numero . ': la fecha de infracción debe ser AAAA-MM-DD.', 400);
        }

        $hayMultas = true;
        $items[] = [
            'tipo' => 'multa',
            'infraccion' => $infraccion,
            'articulo' => $articulo,
            'categoria' => $categoria,
            'monto' => round($monto, 2),
            'fecha_infraccion' => $fechaInfraccion,
            'medida' => $medida,
            'observaciones' => $obsItem,
        ];
    } else {
        $concepto = textoLimpio($crudo['concepto'] ?? '', 255);
        if ($concepto === '') {
            jsonError('El ítem #' . $numero . ': debe indicar el concepto del aporte.', 400);
        }

        $hayAportes = true;
        $items[] = [
            'tipo' => 'aporte',
            'concepto' => $concepto,
            'monto' => round($monto, 2),
        ];
    }

    $total += $monto;
}
$total = round($total, 2);

/* -------------------------------------------------------------------------- */
/* Permisos por tipo de ítem                                                   */
/* -------------------------------------------------------------------------- */

if ($hayMultas && !rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_MULTAS)) {
    jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede cobrar multas del Anexo I.', 403);
}
if ($hayAportes && !rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_CAJA_CHICA)) {
    jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede registrar aportes del Anexo II.', 403);
}

/* -------------------------------------------------------------------------- */
/* Escritura atómica                                                           */
/* -------------------------------------------------------------------------- */

// El cobro grupal necesita las columnas de vínculo; sin migrar, se avisa con
// claridad en vez de fallar a mitad de la transacción.
if (!tablaTieneColumna('multas', 'caja_chica_movimiento_id')
    || !tablaTieneColumna('caja_chica_movimientos', 'detalle')) {
    jsonError(
        'El cobro grupal aún no está habilitado: ejecute backend/migrar.php en el servidor.',
        409
    );
}

// El socio debe existir (FK) — mensaje claro en vez de un error 500.
$stmt = db()->prepare('SELECT `id`, `nombre` FROM `usuarios` WHERE `id` = :id');
$stmt->execute([':id' => $socioId]);
$socio = $stmt->fetch();
if (!$socio) {
    jsonError('El socio seleccionado no existe.', 404);
}

$nombreSocio = (string) $socio['nombre'];
$concepto = $conceptoCliente !== '' ? $conceptoCliente : componerConceptoCobro($items, $nombreSocio);

if ($hayMultas && $hayAportes) {
    $categoriaCaja = CATEGORIA_CAJA_MIXTO;
} elseif ($hayAportes) {
    $categoriaCaja = CATEGORIA_CAJA_APORTE;
} else {
    $categoriaCaja = CATEGORIA_CAJA_MULTA;
}

$movimientoId = 0;
$multasCreadas = [];
$detalle = [
    'version' => 1,
    'socio' => ['id' => $socioId, 'nombre' => $nombreSocio],
    'items' => [],
    'total' => $total,
];

$pdo = db();
try {
    $pdo->beginTransaction();

    // 1. Multas: nacen YA PAGADAS (el carrito es un cobro, no una imputación).
    $insertarMulta = $pdo->prepare(
        'INSERT INTO `multas`
            (`socio_id`, `infraccion`, `articulo_referencia`, `categoria`, `monto`,
             `fecha_infraccion`, `estado`, `medida_complementaria`, `observaciones`, `registrado_por`)
         VALUES
            (:socio_id, :infraccion, :articulo, :categoria, :monto,
             :fecha, \'pagada\', :medida, :observaciones, :registrado_por)'
    );

    foreach ($items as $item) {
        if ($item['tipo'] !== 'multa') {
            continue;
        }
        $insertarMulta->execute([
            ':socio_id' => $socioId,
            ':infraccion' => $item['infraccion'],
            ':articulo' => $item['articulo'],
            ':categoria' => $item['categoria'],
            ':monto' => $item['monto'],
            ':fecha' => $item['fecha_infraccion'],
            ':medida' => $item['medida'] !== '' ? $item['medida'] : null,
            ':observaciones' => $item['observaciones'] !== '' ? $item['observaciones'] : null,
            ':registrado_por' => (int) $usuario['id'],
        ]);

        $multaId = (int) $pdo->lastInsertId();
        $multasCreadas[] = $multaId;
        $detalle['items'][] = [
            'tipo' => 'multa',
            'multaId' => $multaId,
            'articulo' => $item['articulo'],
            'descripcion' => $item['infraccion'],
            'categoria' => $item['categoria'],
            'monto' => $item['monto'],
        ];
    }

    // 2. Aportes: no tienen tabla propia; viven en el desglose del movimiento.
    foreach ($items as $item) {
        if ($item['tipo'] !== 'aporte') {
            continue;
        }
        $detalle['items'][] = [
            'tipo' => 'aporte',
            'concepto' => $item['concepto'],
            'monto' => $item['monto'],
        ];
    }

    // 3. Un solo movimiento de ingreso por el importe total del carrito.
    $pdo->prepare(
        'INSERT INTO `caja_chica_movimientos`
            (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`,
             `registrado_por`, `detalle`)
         VALUES
            (\'ingreso\', :concepto, :categoria, :monto, :fecha, :observaciones,
             :registrado_por, :detalle)'
    )->execute([
        ':concepto' => $concepto,
        ':categoria' => $categoriaCaja,
        ':monto' => $total,
        ':fecha' => $fechaCobro !== '' ? $fechaCobro : date('Y-m-d'),
        ':observaciones' => $observaciones !== ''
            ? $observaciones
            : 'Cobro grupal desde el panel de Caja Chica (Anexo I/II).',
        ':registrado_por' => (int) $usuario['id'],
        ':detalle' => json_encode($detalle, JSON_UNESCAPED_UNICODE),
    ]);
    $movimientoId = (int) $pdo->lastInsertId();

    // 4. Enlazar cada multa con el movimiento que la saldó.
    if ($multasCreadas !== []) {
        $enlazar = $pdo->prepare(
            'UPDATE `multas` SET `caja_chica_movimiento_id` = :movimiento WHERE `id` = :id'
        );
        foreach ($multasCreadas as $multaId) {
            $enlazar->execute([':movimiento' => $movimientoId, ':id' => $multaId]);
        }
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('cobros POST: ' . $e->getMessage());
    jsonError('No se pudo registrar el cobro en Caja Chica.', 500);
}

jsonResponse([
    'ok' => true,
    'cobro' => [
        'movimientoId' => $movimientoId,
        'categoria' => $categoriaCaja,
        'concepto' => $concepto,
        'monto' => $total,
        'fecha' => $fechaCobro !== '' ? $fechaCobro : date('Y-m-d'),
        'multas' => $multasCreadas,
        'detalle' => $detalle,
    ],
    'mensaje' => 'Cobro registrado en Caja Chica por Bs. ' . numeroBs($total) . '.',
], 201);
