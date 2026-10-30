<?php
/**
 * ============================================================================
 *  DEUDAS DE MULTAS (ANEXO I) Y APORTES (ANEXO II)
 * ============================================================================
 *  Ciclo de vida: pendiente -> en_revision -> cancelado.
 *
 *   GET  /api/deudas
 *        · Socio: devuelve SÓLO sus deudas.
 *        · Tesorero / Caja Chica / Admin: listado completo con filtros
 *          `estado`, `tipo` y `socio_id`, más el padrón de socios activos.
 *
 *   POST /api/deudas
 *        Emite una deuda (multa del Anexo I o aporte del Anexo II) y notifica
 *        al socio. Requiere rol de gestión.
 *        Body: { socio_id, concepto, monto, tipo, fecha_emision? }
 *
 *   PUT  /api/deudas
 *        Aprueba/cancela una deuda o la reabre.
 *        Body: { id, estado: 'cancelado'|'pendiente'|'en_revision' }
 *        Al cancelar se asienta el ingreso en Caja Chica (idempotente por
 *        `caja_chica_movimientos.deuda_id`) y se avisa al socio.
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
if (!in_array($metodo, ['GET', 'POST', 'PUT'], true)) {
    jsonError('Método no permitido. Use GET, POST o PUT.', 405);
}

const TIPOS_DEUDA = ['multa_anexo_1', 'aporte_anexo_2'];
const ESTADOS_DEUDA = ['pendiente', 'en_revision', 'cancelado'];
const CATEGORIA_CAJA_DEUDA_MULTA = 'Multas / Sanciones';
const CATEGORIA_CAJA_DEUDA_APORTE = 'Aportes / Fondos';

/** ¿El usuario puede emitir y aprobar deudas? */
function usuarioGestionaDeudas(array $usuario): bool
{
    return rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_MULTAS)
        || rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_CAJA_CHICA);
}

/** Valida una fecha `AAAA-MM-DD` real. */
function validarFechaDeuda(string $fecha): bool
{
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        return false;
    }
    list($anio, $mes, $dia) = array_map('intval', explode('-', $fecha));
    return checkdate($mes, $dia, $anio);
}

/** Formatea un monto para los mensajes de notificación. */
function montoDeudaTexto(float $monto): string
{
    return number_format($monto, 2, '.', '');
}

/** Proyecta una fila de `deudas_multas` al JSON del frontend. */
function deudaPublica(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'socioId' => (int) $fila['socio_id'],
        'socioNombre' => (string) ($fila['socio_nombre'] ?? ''),
        'socioCorreo' => (string) ($fila['socio_correo'] ?? ''),
        'concepto' => (string) $fila['concepto'],
        'monto' => (float) $fila['monto'],
        'tipo' => (string) $fila['tipo'],
        'estado' => (string) $fila['estado'],
        'metodoPago' => $fila['metodo_pago'] ?? null,
        'nroComprobante' => $fila['nro_comprobante'] ?? null,
        'comprobanteUrl' => $fila['comprobante_url'] ?? null,
        'registradoPor' => isset($fila['registrado_por']) ? (int) $fila['registrado_por'] : null,
        'registradoPorNombre' => (string) ($fila['registrador_nombre'] ?? ''),
        'fechaEmision' => $fila['fecha_emision'] ?? null,
        'fechaPago' => $fila['fecha_pago'] ?? null,
        'creadoEn' => $fila['creado_en'] ?? null,
        'actualizadoEn' => $fila['actualizado_en'] ?? null,
    ];
}

/** SELECT base con los datos del socio y del emisor. */
function sqlDeuda(): string
{
    return 'SELECT d.*,
                   s.nombre AS socio_nombre, s.correo AS socio_correo,
                   r.nombre AS registrador_nombre
              FROM `deudas_multas` d
              JOIN `usuarios` s ON s.id = d.socio_id
              LEFT JOIN `usuarios` r ON r.id = d.registrado_por';
}

if (!tablaTieneColumna('deudas_multas', 'id')) {
    jsonError('El módulo de deudas aún no está habilitado: ejecute backend/migrar.php.', 409);
}

/* -------------------------------------------------------------------------- */
/* GET: consulta                                                               */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $usuario = exigirUsuario();
    $gestiona = usuarioGestionaDeudas($usuario);
    // «Mis Deudas» fuerza las propias incluso para Tesorería/Caja Chica/Admin.
    $soloPropias = entradaBooleana($_GET['propias'] ?? false) === true;
    $verTodas = $gestiona && !$soloPropias;

    $where = [];
    $valores = [];

    if ($verTodas) {
        $socioId = isset($_GET['socio_id']) ? (int) $_GET['socio_id'] : 0;
        if ($socioId > 0) {
            $where[] = 'd.socio_id = :socio_id';
            $valores[':socio_id'] = $socioId;
        }
    } else {
        $where[] = 'd.socio_id = :socio_id';
        $valores[':socio_id'] = (int) $usuario['id'];
    }

    $estado = strtolower(trim((string) ($_GET['estado'] ?? '')));
    if ($estado !== '') {
        if (!in_array($estado, ESTADOS_DEUDA, true)) {
            jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_DEUDA) . '.', 400);
        }
        $where[] = 'd.estado = :estado';
        $valores[':estado'] = $estado;
    }

    $tipo = strtolower(trim((string) ($_GET['tipo'] ?? '')));
    if ($tipo !== '') {
        if (!in_array($tipo, TIPOS_DEUDA, true)) {
            jsonError('Tipo no válido. Use: ' . implode(', ', TIPOS_DEUDA) . '.', 400);
        }
        $where[] = 'd.tipo = :tipo';
        $valores[':tipo'] = $tipo;
    }

    $sql = sqlDeuda()
        . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
        . ' ORDER BY d.fecha_emision DESC, d.id DESC';

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute($valores);
        $deudas = array_map('deudaPublica', $stmt->fetchAll());
    } catch (PDOException $e) {
        error_log('deudas GET: ' . $e->getMessage());
        jsonError('No se pudieron obtener las deudas.', 500);
    }

    $totales = [
        'total' => count($deudas),
        'pendientes' => 0,
        'enRevision' => 0,
        'canceladas' => 0,
        'montoPendiente' => 0.0,
        'montoEnRevision' => 0.0,
        'montoCancelado' => 0.0,
    ];
    foreach ($deudas as $deuda) {
        if ($deuda['estado'] === 'cancelado') {
            $totales['canceladas']++;
            $totales['montoCancelado'] += $deuda['monto'];
        } elseif ($deuda['estado'] === 'en_revision') {
            $totales['enRevision']++;
            $totales['montoEnRevision'] += $deuda['monto'];
        } else {
            $totales['pendientes']++;
            $totales['montoPendiente'] += $deuda['monto'];
        }
    }
    foreach (['montoPendiente', 'montoEnRevision', 'montoCancelado'] as $clave) {
        $totales[$clave] = round($totales[$clave], 2);
    }

    $socios = [];
    if ($verTodas) {
        try {
            $stmt = db()->query(
                'SELECT `id`, `nombre`, `correo`, `rol`
                   FROM `usuarios`
                  WHERE `activo` = 1
               ORDER BY (`rol` = \'lectura\') DESC, `nombre` ASC'
            );
            $socios = $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log('deudas GET (socios): ' . $e->getMessage());
            $socios = [];
        }
    }

    jsonResponse([
        'ok' => true,
        'deudas' => $deudas,
        'totales' => $totales,
        'puedeGestionar' => $gestiona,
        'socios' => $socios,
    ]);
}

/* -------------------------------------------------------------------------- */
/* POST: emitir deuda                                                          */
/* -------------------------------------------------------------------------- */

if ($metodo === 'POST') {
    $usuario = exigirUsuario();
    if (!usuarioGestionaDeudas($usuario)) {
        jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede emitir deudas.', 403);
    }

    $body = leerBodyJson();
    $socioId = (int) ($body['socio_id'] ?? 0);
    $concepto = textoLimpio($body['concepto'] ?? '', 255);
    $monto = (float) str_replace(',', '.', (string) ($body['monto'] ?? 0));
    $tipo = strtolower(trim((string) ($body['tipo'] ?? 'multa_anexo_1')));
    $fechaEmision = trim((string) ($body['fecha_emision'] ?? ''));

    if ($socioId <= 0) {
        jsonError('Debe seleccionar el socio al que se imputa la deuda.', 400);
    }
    if ($concepto === '') {
        jsonError('Debe indicar el concepto de la multa o aporte.', 400);
    }
    if ($monto <= 0 || $monto > 1000000) {
        jsonError('El monto debe ser un valor en bolivianos mayor a 0 y menor a 1.000.000.', 400);
    }
    if (!in_array($tipo, TIPOS_DEUDA, true)) {
        jsonError('Tipo no válido. Use: ' . implode(', ', TIPOS_DEUDA) . '.', 400);
    }
    if ($fechaEmision !== '' && !validarFechaDeuda($fechaEmision)) {
        jsonError('La fecha de emisión debe tener el formato AAAA-MM-DD.', 400);
    }

    $stmt = db()->prepare('SELECT `id`, `nombre` FROM `usuarios` WHERE `id` = :id');
    $stmt->execute([':id' => $socioId]);
    $socio = $stmt->fetch();
    if (!$socio) {
        jsonError('El socio seleccionado no existe.', 404);
    }

    $pdo = db();
    try {
        $pdo->beginTransaction();

        $pdo->prepare(
            'INSERT INTO `deudas_multas`
                (`socio_id`, `concepto`, `monto`, `tipo`, `estado`,
                 `registrado_por`, `fecha_emision`)
             VALUES
                (:socio_id, :concepto, :monto, :tipo, \'pendiente\',
                 :registrado_por, :fecha_emision)'
        )->execute([
            ':socio_id' => $socioId,
            ':concepto' => $concepto,
            ':monto' => round($monto, 2),
            ':tipo' => $tipo,
            ':registrado_por' => (int) $usuario['id'],
            ':fecha_emision' => $fechaEmision !== ''
                ? $fechaEmision . ' 00:00:00'
                : date('Y-m-d H:i:s'),
        ]);

        $deudaId = (int) $pdo->lastInsertId();

        notificarUsuario(
            $pdo,
            $socioId,
            'Nueva deuda registrada',
            'Se registró una deuda de Bs. ' . montoDeudaTexto($monto) . ' por: ' . $concepto
            . '. Ingrese a «Mis Deudas» para reportar su pago.'
        );

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('deudas POST: ' . $e->getMessage());
        jsonError('No se pudo registrar la deuda.', 500);
    }

    $stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
    $stmt->execute([':id' => $deudaId]);

    jsonResponse([
        'ok' => true,
        'deuda' => deudaPublica($stmt->fetch() ?: []),
        'mensaje' => 'Deuda registrada y notificada al socio.',
    ], 201);
}

/* -------------------------------------------------------------------------- */
/* PUT: aprobar / reabrir                                                      */
/* -------------------------------------------------------------------------- */

$usuario = exigirUsuario();
if (!usuarioGestionaDeudas($usuario)) {
    jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede actualizar deudas.', 403);
}

$body = leerBodyJson();
$deudaId = (int) ($body['id'] ?? 0);
$estado = strtolower(trim((string) ($body['estado'] ?? '')));

if ($deudaId <= 0) {
    jsonError('Debe indicar el `id` de la deuda.', 400);
}
if (!in_array($estado, ESTADOS_DEUDA, true)) {
    jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_DEUDA) . '.', 400);
}

$stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
$stmt->execute([':id' => $deudaId]);
$actual = $stmt->fetch();
if (!$actual) {
    jsonError('La deuda indicada no existe.', 404);
}

// Aprobar dos veces es idempotente: se devuelve el estado actual sin duplicar
// el ingreso en Caja Chica.
if ($estado === 'cancelado' && $actual['estado'] === 'cancelado') {
    jsonResponse([
        'ok' => true,
        'deuda' => deudaPublica($actual),
        'mensaje' => 'La deuda ya estaba cancelada.',
    ]);
}

$pdo = db();
try {
    $pdo->beginTransaction();

    if ($estado === 'cancelado') {
        $pdo->prepare(
            'UPDATE `deudas_multas`
                SET `estado` = \'cancelado\', `fecha_pago` = COALESCE(`fecha_pago`, NOW())
              WHERE `id` = :id'
        )->execute([':id' => $deudaId]);

        $tieneDeudaId = tablaTieneColumna('caja_chica_movimientos', 'deuda_id');
        $yaAsentado = false;
        if ($tieneDeudaId) {
            $stmt = $pdo->prepare('SELECT `id` FROM `caja_chica_movimientos` WHERE `deuda_id` = :id');
            $stmt->execute([':id' => $deudaId]);
            $yaAsentado = $stmt->fetchColumn() !== false;
        }

        if (!$yaAsentado) {
            $categoria = $actual['tipo'] === 'aporte_anexo_2'
                ? CATEGORIA_CAJA_DEUDA_APORTE
                : CATEGORIA_CAJA_DEUDA_MULTA;
            $concepto = textoLimpio(
                'Cobro de deuda #' . $deudaId . ': ' . $actual['concepto']
                . ' - Socio: ' . $actual['socio_nombre'],
                255
            );
            $observaciones = 'Ingreso automático por la aprobación de la deuda #' . $deudaId . '.';

            if ($tieneDeudaId) {
                $pdo->prepare(
                    'INSERT INTO `caja_chica_movimientos`
                        (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`,
                         `registrado_por`, `deuda_id`)
                     VALUES
                        (\'ingreso\', :concepto, :categoria, :monto, :fecha, :observaciones,
                         :registrado_por, :deuda_id)'
                )->execute([
                    ':concepto' => $concepto,
                    ':categoria' => $categoria,
                    ':monto' => (float) $actual['monto'],
                    ':fecha' => date('Y-m-d'),
                    ':observaciones' => $observaciones,
                    ':registrado_por' => (int) $usuario['id'],
                    ':deuda_id' => $deudaId,
                ]);
            } else {
                $pdo->prepare(
                    'INSERT INTO `caja_chica_movimientos`
                        (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`,
                         `registrado_por`)
                     VALUES
                        (\'ingreso\', :concepto, :categoria, :monto, :fecha, :observaciones,
                         :registrado_por)'
                )->execute([
                    ':concepto' => $concepto,
                    ':categoria' => $categoria,
                    ':monto' => (float) $actual['monto'],
                    ':fecha' => date('Y-m-d'),
                    ':observaciones' => $observaciones,
                    ':registrado_por' => (int) $usuario['id'],
                ]);
            }
        }

        notificarUsuario(
            $pdo,
            (int) $actual['socio_id'],
            'Pago confirmado',
            'Su pago de Bs. ' . montoDeudaTexto((float) $actual['monto'])
            . ' por «' . $actual['concepto'] . '» fue aprobado. La deuda quedó cancelada.'
        );
    } else {
        $pdo->prepare(
            'UPDATE `deudas_multas`
                SET `estado` = :estado, `fecha_pago` = NULL
              WHERE `id` = :id'
        )->execute([':estado' => $estado, ':id' => $deudaId]);

        if (tablaTieneColumna('caja_chica_movimientos', 'deuda_id')) {
            $pdo->prepare('DELETE FROM `caja_chica_movimientos` WHERE `deuda_id` = :id')
                ->execute([':id' => $deudaId]);
        }

        if ($estado === 'pendiente' && $actual['estado'] === 'en_revision') {
            notificarUsuario(
                $pdo,
                (int) $actual['socio_id'],
                'Pago observado',
                'El pago reportado para «' . $actual['concepto'] . '» (Bs. '
                . montoDeudaTexto((float) $actual['monto'])
                . ') fue observado. Revise su comprobante y vuelva a reportarlo desde «Mis Deudas».'
            );
        }
    }

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('deudas PUT: ' . $e->getMessage());
    jsonError('No se pudo actualizar la deuda.', 500);
}

$stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
$stmt->execute([':id' => $deudaId]);
$deuda = deudaPublica($stmt->fetch() ?: []);

$mensajes = [
    'cancelado' => 'Deuda aprobada y cancelada. El ingreso quedó registrado en Caja Chica.',
    'pendiente' => 'Deuda reabierta como pendiente.',
    'en_revision' => 'Deuda marcada en revisión.',
];

jsonResponse([
    'ok' => true,
    'deuda' => $deuda,
    'mensaje' => $mensajes[$estado] ?? 'Deuda actualizada.',
]);
