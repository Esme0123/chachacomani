<?php
/**
 * ============================================================================
 *  PANEL DE CAJA CHICA — ingresos y egresos menores
 * ============================================================================
 *  Pertenece al rol `caja_chica` (y al `admin`, que hereda la gestión). El rol
 *  `tesorero` puede CONSULTAR la movements por su permiso `contabilidad:ver`,
 *  pero no registrar movimientos.
 *
 *   GET  /backend/api/caja_chica.php      (permiso `caja_chica:gestionar` o
 *                                          `contabilidad:ver`)
 *        ?mes=YYYY-MM  -> movimientos del mes + saldo acumulado del ejercicio
 *
 *   POST /backend/api/caja_chica.php      (permiso `caja_chica:gestionar`)
 *        Body: { "tipo": "ingreso|egreso", "concepto": "…", "categoria": "…",
 *                 "monto": 45.50, "fecha": "2026-09-25", "observaciones": "…" }
 * ============================================================================
 */
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/roles.php';
require_once __DIR__ . '/auth_lib.php';

enviarCors();
manejarPreflight();

$metodo = metodoHttp();
if (!in_array($metodo, ['GET', 'POST'], true)) {
    jsonError('Método no permitido. Use GET o POST.', 405);
}

const CATEGORIAS_CAJA = ['Otros', 'Transporte', 'Alimentación', 'Material de oficina', 'Combustible', 'Mantenimiento', 'Aportes', 'Multas cobradas', 'Retiros'];

/** Proyecta un movimiento de caja chica al JSON que consume el frontend. */
function movimientoPublico(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'tipo' => (string) $fila['tipo'],
        'concepto' => (string) $fila['concepto'],
        'categoria' => (string) $fila['categoria'],
        'monto' => (float) $fila['monto'],
        'fecha' => $fila['fecha'] ?? null,
        'observaciones' => $fila['observaciones'] ?? null,
        'registradoPor' => (int) $fila['registrado_por'],
        'registradoPorNombre' => (string) ($fila['registrador_nombre'] ?? ''),
        'creadoEn' => $fila['creado_en'] ?? null,
    ];
}

/* -------------------------------------------------------------------------- */
/* GET: consulta (caja_chica / tesorero / admin)                               */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $usuario = exigirUsuario();
    if (
        !rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_CAJA_CHICA)
        && !rolTienePermiso($usuario['rol'], PERMISO_VER_CONTABILIDAD)
    ) {
        jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no tiene acceso al panel de caja chica.', 403);
    }

    $mes = trim((string) ($_GET['mes'] ?? date('Y-m')));
    $filtroMes = preg_match('/^\d{4}-\d{2}$/', $mes) === 1;

    $where = $filtroMes ? 'WHERE DATE_FORMAT(m.fecha, \'%Y-%m\') = :mes' : '';
    $valores = $filtroMes ? [':mes' => $mes] : [];

    $sql = 'SELECT m.*, u.nombre AS registrador_nombre
              FROM `caja_chica_movimientos` m
              JOIN `usuarios` u ON u.id = m.registrado_por
            ' . $where . '
            ORDER BY m.fecha DESC, m.id DESC
            LIMIT 500';

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute($valores);
        $filas = $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log('caja_chica GET: ' . $e->getMessage());
        jsonError('No se pudieron obtener los movimientos de caja chica.', 500);
    }

    $movimientos = array_map('movimientoPublico', $filas);
    $ingresos = 0.0;
    $egresos = 0.0;
    foreach ($movimientos as $movimiento) {
        if ($movimiento['tipo'] === 'ingreso') {
            $ingresos += $movimiento['monto'];
        } else {
            $egresos += $movimiento['monto'];
        }
    }

    // Saldo acumulado histórico (todo el ejercicio), no sólo el periodo filtrado.
    try {
        $saldo = db()->query(
            "SELECT COALESCE(SUM(CASE WHEN `tipo` = 'ingreso' THEN `monto` ELSE -`monto` END), 0)
               FROM `caja_chica_movimientos`"
        )->fetchColumn();
    } catch (PDOException $e) {
        $saldo = 0;
    }

    jsonResponse([
        'ok'          => true,
        'periodo'     => $filtroMes ? $mes : null,
        'movimientos' => $movimientos,
        'totales'     => [
            'ingresos' => round($ingresos, 2),
            'egresos' => round($egresos, 2),
            'saldoPeriodo' => round($ingresos - $egresos, 2),
            'saldoAcumulado' => round((float) $saldo, 2),
        ],
        'puedeRegistrar' => rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_CAJA_CHICA),
    ]);
}

/* -------------------------------------------------------------------------- */
/* POST: registrar movimiento (caja_chica / admin)                            */
/* -------------------------------------------------------------------------- */

$usuario = exigirPermiso(PERMISO_GESTIONAR_CAJA_CHICA);

$body = leerBodyJson();

$tipo = strtolower(trim((string) ($body['tipo'] ?? '')));
$concepto = textoLimpio($body['concepto'] ?? '', 255);
$categoria = textoLimpio($body['categoria'] ?? 'Otros', 80);
$monto = (float) str_replace(',', '.', (string) ($body['monto'] ?? 0));
$fecha = trim((string) ($body['fecha'] ?? date('Y-m-d')));
$observaciones = textoLimpio($body['observaciones'] ?? '', 2000);

if (!in_array($tipo, ['ingreso', 'egreso'], true)) {
    jsonError('El tipo de movimiento debe ser "ingreso" o "egreso".', 400);
}
if ($concepto === '') {
    jsonError('Debe describir el concepto del movimiento.', 400);
}
if ($monto <= 0 || $monto > 1000000) {
    jsonError('El monto debe ser un valor en bolivianos mayor que 0 y menor a 1.000.000.', 400);
}
if (!in_array($categoria, CATEGORIAS_CAJA, true)) {
    jsonError('Categoría no válida. Use: ' . implode(', ', CATEGORIAS_CAJA) . '.', 400);
}
if (!validarFechaIso($fecha)) {
    jsonError('La fecha debe tener el formato AAAA-MM-DD.', 400);
}

try {
    $stmt = db()->prepare(
        'INSERT INTO `caja_chica_movimientos`
            (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`, `registrado_por`)
         VALUES (:tipo, :concepto, :categoria, :monto, :fecha, :observaciones, :registrado_por)'
    );
    $stmt->execute([
        ':tipo'          => $tipo,
        ':concepto'      => $concepto,
        ':categoria'     => $categoria,
        ':monto'         => $monto,
        ':fecha'         => $fecha,
        ':observaciones' => $observaciones !== '' ? $observaciones : null,
        ':registrado_por' => (int) $usuario['id'],
    ]);
} catch (PDOException $e) {
    error_log('caja_chica POST: ' . $e->getMessage());
    jsonError('No se pudo registrar el movimiento de caja chica.', 500);
}

$movimientoId = (int) db()->lastInsertId();
$stmt = db()->prepare(
    'SELECT m.*, u.nombre AS registrador_nombre
       FROM `caja_chica_movimientos` m
       JOIN `usuarios` u ON u.id = m.registrado_por
      WHERE m.id = :id'
);
$stmt->execute([':id' => $movimientoId]);

jsonResponse([
    'ok'         => true,
    'movimiento' => movimientoPublico($stmt->fetch() ?: []),
    'mensaje'    => 'Movimiento de caja chica registrado correctamente.',
], 201);

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

/** Valida una fecha `AAAA-MM-DD` que exista en el calendario. */
function validarFechaIso(string $fecha): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        return false;
    }
    list($anio, $mes, $dia) = array_map('intval', explode('-', $fecha));
    return checkdate($mes, $dia, $anio);
}
