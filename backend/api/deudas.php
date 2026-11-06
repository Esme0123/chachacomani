<?php
/**
 * ============================================================================
 *  DEUDAS DE MULTAS (ANEXO I) Y APORTES (ANEXO II)
 * ============================================================================
 *  Ciclo de vida: pendiente -> en_revision -> cancelado.
 *  Soporte para:
 *   - Emisión individual o en lote (carrito múltiple).
 *   - Abonos y pagos parciales con cálculo de saldo pendiente.
 *   - Subida y edición de fotos de comprobantes (JPG, PNG, WEBP, PDF).
 *   - Filtrado estricto por socio y separación por categorías.
 *   - Historial de abonos por deuda.
 *
 *   GET  /api/deudas.php
 *        · Socio: devuelve SÓLO sus deudas.
 *        · Tesorero / Caja Chica / Admin: listado completo con filtros
 *          `estado`, `tipo` y `socio_id`, más el padrón de socios activos.
 *
 *   POST /api/deudas.php
 *        - accion='abonar': registra un abono/pago parcial a una deuda.
 *        - items=[...]: emisión en lote desde el carrito ("Dejar Pendiente").
 *        - Emisión individual estándar (socio_id, concepto, monto, tipo).
 *
 *   PUT  /api/deudas.php (o POST con accion='actualizar')
 *        - Aprueba/cancela una deuda o la reabre.
 *        - Edición inline de número de comprobante, foto de comprobante y método de pago.
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
    $monto = (float) $fila['monto'];
    $montoPagado = isset($fila['monto_pagado'])
        ? (float) $fila['monto_pagado']
        : ($fila['estado'] === 'cancelado' ? $monto : 0.0);
    $saldoPendiente = isset($fila['saldo_pendiente'])
        ? (float) $fila['saldo_pendiente']
        : ($fila['estado'] === 'cancelado' ? 0.0 : max(0.0, $monto - $montoPagado));

    return [
        'id' => (int) $fila['id'],
        'socioId' => (int) $fila['socio_id'],
        'socioNombre' => (string) ($fila['socio_nombre'] ?? ''),
        'socioCorreo' => (string) ($fila['socio_correo'] ?? ''),
        'concepto' => (string) $fila['concepto'],
        'monto' => $monto,
        'montoPagado' => round($montoPagado, 2),
        'saldoPendiente' => round($saldoPendiente, 2),
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
        'abonos' => $fila['abonos'] ?? [],
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
    $soloPropias = entradaBooleana($_GET['propias'] ?? false) === true;
    $socioIdQuery = isset($_GET['socio_id']) ? (int) $_GET['socio_id'] : 0;

    $where = [];
    $valores = [];

    // Control de acceso y filtrado estricto por socio
    if (!$gestiona) {
        if ($socioIdQuery > 0 && $socioIdQuery !== (int) $usuario['id']) {
            jsonError('No tiene acceso a las deudas o multas asociadas a otros socios.', 403);
        }
        $where[] = 'd.socio_id = :socio_id';
        $valores[':socio_id'] = (int) $usuario['id'];
        $verTodas = false;
    } elseif ($soloPropias) {
        $where[] = 'd.socio_id = :socio_id';
        $valores[':socio_id'] = (int) $usuario['id'];
        $verTodas = false;
    } elseif ($socioIdQuery > 0) {
        $where[] = 'd.socio_id = :socio_id';
        $valores[':socio_id'] = $socioIdQuery;
        $verTodas = false;
    } else {
        $verTodas = true;
    }

    // Normalización de tipo
    $tipoRaw = strtolower(trim((string) ($_GET['tipo'] ?? '')));
    $aliasesTipo = [
        'multa' => 'multa_anexo_1',
        'multas' => 'multa_anexo_1',
        'multa_anexo_1' => 'multa_anexo_1',
        'aporte' => 'aporte_anexo_2',
        'aportes' => 'aporte_anexo_2',
        'aporte_anexo_2' => 'aporte_anexo_2',
    ];
    $tipo = $aliasesTipo[$tipoRaw] ?? $tipoRaw;
    if ($tipo !== '') {
        if (!in_array($tipo, TIPOS_DEUDA, true)) {
            jsonError('Tipo no válido. Use: ' . implode(', ', TIPOS_DEUDA) . '.', 400);
        }
        $where[] = 'd.tipo = :tipo';
        $valores[':tipo'] = $tipo;
    }

    // Copia base de filtros para calcular totales globales sin distorsión por estado
    $whereBase = $where;
    $valoresBase = $valores;

    // Normalización de estado (admite plurales y aliases)
    $estadoRaw = strtolower(trim((string) ($_GET['estado'] ?? '')));
    $aliasesEstado = [
        'cancelado' => 'cancelado',
        'cancelada' => 'cancelado',
        'canceladas' => 'cancelado',
        'pagada' => 'cancelado',
        'pagadas' => 'cancelado',
        'pendiente' => 'pendiente',
        'pendientes' => 'pendiente',
        'en_revision' => 'en_revision',
        'revision' => 'en_revision',
    ];
    $estado = $aliasesEstado[$estadoRaw] ?? $estadoRaw;
    if ($estado !== '') {
        if (!in_array($estado, ESTADOS_DEUDA, true)) {
            jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_DEUDA) . '.', 400);
        }
        $where[] = 'd.estado = :estado';
        $valores[':estado'] = $estado;
    }

    // 1. Cálculo de totales sobre el conjunto base (sin filtrar por estado)
    $sqlTotales = 'SELECT d.estado, d.monto FROM `deudas_multas` d '
        . ($whereBase ? ' WHERE ' . implode(' AND ', $whereBase) : '');
    try {
        $stmtTotales = db()->prepare($sqlTotales);
        $stmtTotales->execute($valoresBase);
        $filasTotales = $stmtTotales->fetchAll();
    } catch (PDOException $e) {
        $filasTotales = [];
    }

    $totales = [
        'total' => count($filasTotales),
        'pendientes' => 0,
        'enRevision' => 0,
        'canceladas' => 0,
        'montoPendiente' => 0.0,
        'montoEnRevision' => 0.0,
        'montoCancelado' => 0.0,
    ];
    foreach ($filasTotales as $f) {
        $m = (float) $f['monto'];
        $st = (string) $f['estado'];
        if ($st === 'cancelado') {
            $totales['canceladas']++;
            $totales['montoCancelado'] += $m;
        } elseif ($st === 'en_revision') {
            $totales['enRevision']++;
            $totales['montoEnRevision'] += $m;
        } else {
            $totales['pendientes']++;
            $totales['montoPendiente'] += $m;
        }
    }
    foreach (['montoPendiente', 'montoEnRevision', 'montoCancelado'] as $clave) {
        $totales[$clave] = round($totales[$clave], 2);
    }
    $totales['pagadas'] = $totales['canceladas'];
    $totales['montoPagado'] = $totales['montoCancelado'];

    // 2. Consulta de las deudas filtradas
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

    // 3. Adjuntar abonos si la tabla de abonos existe
    if (!empty($deudas) && tablaTieneColumna('abonos_deudas', 'id')) {
        $deudaIds = array_column($deudas, 'id');
        $placeholders = implode(',', array_fill(0, count($deudaIds), '?'));
        try {
            $stmtAbonos = db()->prepare(
                "SELECT a.*, u.nombre AS registrador_nombre
                   FROM `abonos_deudas` a
                   LEFT JOIN `usuarios` u ON u.id = a.registrado_por
                  WHERE a.deuda_id IN ($placeholders)
                  ORDER BY a.creado_en DESC"
            );
            $stmtAbonos->execute($deudaIds);
            $abonosPorDeuda = [];
            foreach ($stmtAbonos->fetchAll() as $ab) {
                $abonosPorDeuda[(int) $ab['deuda_id']][] = [
                    'id' => (int) $ab['id'],
                    'deudaId' => (int) $ab['deuda_id'],
                    'monto' => (float) $ab['monto'],
                    'metodoPago' => (string) ($ab['metodo_pago'] ?? 'efectivo'),
                    'nroComprobante' => $ab['nro_comprobante'] ?? null,
                    'comprobanteUrl' => $ab['comprobante_url'] ?? null,
                    'observaciones' => (string) ($ab['observaciones'] ?? ''),
                    'registradoPor' => isset($ab['registrado_por']) ? (int) $ab['registrado_por'] : null,
                    'registradorNombre' => (string) ($ab['registrador_nombre'] ?? ''),
                    'creadoEn' => $ab['creado_en'] ?? null,
                ];
            }
            foreach ($deudas as &$d) {
                $d['abonos'] = $abonosPorDeuda[$d['id']] ?? [];
            }
            unset($d);
        } catch (Throwable $e) {
            error_log('deudas GET abonos: ' . $e->getMessage());
        }
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
/* POST: emitir deuda, abono o actualización con archivo                       */
/* -------------------------------------------------------------------------- */

if ($metodo === 'POST') {
    $usuario = exigirUsuario();

    // Soporte para multipart/form-data y application/json
    if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false || !empty($_FILES)) {
        $body = $_POST;
        if (isset($body['items']) && is_string($body['items'])) {
            $decoded = json_decode($body['items'], true);
            if (is_array($decoded)) {
                $body['items'] = $decoded;
            }
        }
    } else {
        $body = leerBodyJson();
    }

    $accion = strtolower(trim((string) ($body['accion'] ?? '')));

    /* ---------------------------------------------------------------------- */
    /* ACCIÓN: ABONAR (pago parcial o total de una deuda)                     */
    /* ---------------------------------------------------------------------- */
    if ($accion === 'abonar') {
        $deudaId = (int) ($body['deuda_id'] ?? ($body['id'] ?? 0));
        $montoAbono = (float) str_replace(',', '.', (string) ($body['monto_abono'] ?? ($body['monto'] ?? 0)));
        $metodoPago = strtolower(trim((string) ($body['metodo_pago'] ?? 'efectivo')));
        $nroComprobante = textoLimpio($body['nro_comprobante'] ?? '', 100);
        $observaciones = textoLimpio($body['observaciones'] ?? '', 2000);

        if ($deudaId <= 0) {
            jsonError('Debe indicar el `id` de la deuda.', 400);
        }
        if ($montoAbono <= 0) {
            jsonError('El monto a abonar debe ser mayor a 0.', 400);
        }
        if (!in_array($metodoPago, ['efectivo', 'qr', 'transferencia'], true)) {
            jsonError('Método de pago no válido.', 400);
        }

        $stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
        $stmt->execute([':id' => $deudaId]);
        $deuda = $stmt->fetch();
        if (!$deuda) {
            jsonError('La deuda indicada no existe.', 404);
        }

        $gestiona = usuarioGestionaDeudas($usuario);
        $esDuenio = (int) $deuda['socio_id'] === (int) $usuario['id'];
        if (!$gestiona && !$esDuenio) {
            jsonError('No tiene autorización para abonar a esta deuda.', 403);
        }

        // Subida de imagen/PDF de comprobante
        $comprobanteUrl = null;
        if (isset($_FILES['comprobante']) && is_array($_FILES['comprobante'])) {
            $comprobanteUrl = guardarArchivoComprobante($_FILES['comprobante'], 'abono_' . $deudaId);
        } elseif (!empty($body['comprobante_url'])) {
            $comprobanteUrl = textoLimpio($body['comprobante_url'], 255);
        }

        $montoTotal = (float) $deuda['monto'];
        $montoYaPagado = isset($deuda['monto_pagado'])
            ? (float) $deuda['monto_pagado']
            : ($deuda['estado'] === 'cancelado' ? $montoTotal : 0.0);
        $nuevoPagado = round($montoYaPagado + $montoAbono, 2);
        $nuevoSaldo = max(0.0, round($montoTotal - $nuevoPagado, 2));
        $saldada = $nuevoSaldo <= 0.001;

        // Si paga el socio, pasa a en_revision a menos que el saldo sea 0
        $nuevoEstado = $saldada ? 'cancelado' : ($gestiona ? $deuda['estado'] : 'en_revision');

        $pdo = db();
        try {
            $pdo->beginTransaction();

            if (tablaTieneColumna('abonos_deudas', 'id')) {
                $pdo->prepare(
                    'INSERT INTO `abonos_deudas`
                        (`deuda_id`, `monto`, `metodo_pago`, `nro_comprobante`, `comprobante_url`, `observaciones`, `registrado_por`)
                     VALUES
                        (:deuda_id, :monto, :metodo, :nro, :url, :obs, :reg)'
                )->execute([
                    ':deuda_id' => $deudaId,
                    ':monto' => $montoAbono,
                    ':metodo' => $metodoPago,
                    ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
                    ':url' => $comprobanteUrl,
                    ':obs' => $observaciones !== '' ? $observaciones : null,
                    ':reg' => (int) $usuario['id'],
                ]);
            }

            if (tablaTieneColumna('deudas_multas', 'monto_pagado')) {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `monto_pagado` = :pagado,
                            `saldo_pendiente` = :saldo,
                            `estado` = :estado,
                            `fecha_pago` = IF(:estado = \'cancelado\', COALESCE(`fecha_pago`, NOW()), `fecha_pago`),
                            `metodo_pago` = COALESCE(:metodo, `metodo_pago`),
                            `nro_comprobante` = COALESCE(:nro, `nro_comprobante`),
                            `comprobante_url` = COALESCE(:url, `comprobante_url`)
                      WHERE `id` = :id'
                )->execute([
                    ':pagado' => $nuevoPagado,
                    ':saldo' => $nuevoSaldo,
                    ':estado' => $nuevoEstado,
                    ':metodo' => $metodoPago,
                    ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
                    ':url' => $comprobanteUrl,
                    ':id' => $deudaId,
                ]);
            } else {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `estado` = :estado,
                            `fecha_pago` = IF(:estado = \'cancelado\', COALESCE(`fecha_pago`, NOW()), `fecha_pago`),
                            `metodo_pago` = COALESCE(:metodo, `metodo_pago`),
                            `nro_comprobante` = COALESCE(:nro, `nro_comprobante`),
                            `comprobante_url` = COALESCE(:url, `comprobante_url`)
                      WHERE `id` = :id'
                )->execute([
                    ':estado' => $nuevoEstado,
                    ':metodo' => $metodoPago,
                    ':nro' => $nroComprobante !== '' ? $nroComprobante : null,
                    ':url' => $comprobanteUrl,
                    ':id' => $deudaId,
                ]);
            }

            // Asentar ingreso en caja si lo cobró el personal
            if ($gestiona) {
                $categoria = $deuda['tipo'] === 'aporte_anexo_2' ? CATEGORIA_CAJA_DEUDA_APORTE : CATEGORIA_CAJA_DEUDA_MULTA;
                $conceptoMov = 'Abono de Bs. ' . montoDeudaTexto($montoAbono) . ' a deuda #' . $deudaId . ': ' . $deuda['concepto'] . ' - Socio: ' . $deuda['socio_nombre'];
                $pdo->prepare(
                    'INSERT INTO `caja_chica_movimientos`
                        (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`, `registrado_por`, `deuda_id`)
                     VALUES
                        (\'ingreso\', :concepto, :categoria, :monto, :fecha, :obs, :reg, :deuda_id)'
                )->execute([
                    ':concepto' => textoLimpio($conceptoMov, 255),
                    ':categoria' => $categoria,
                    ':monto' => $montoAbono,
                    ':fecha' => date('Y-m-d'),
                    ':obs' => 'Abono registrado en Tesorería / Caja Chica.',
                    ':reg' => (int) $usuario['id'],
                    ':deuda_id' => $deudaId,
                ]);
            }

            // Avisos por campana
            if ($esDuenio) {
                notificarRoles(
                    $pdo,
                    [ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN],
                    'Abono reportado por ' . $deuda['socio_nombre'],
                    'El socio ' . $deuda['socio_nombre'] . ' reportó un abono de Bs. ' . montoDeudaTexto($montoAbono)
                    . ' para la deuda #' . $deudaId . ' («' . $deuda['concepto'] . '»).'
                );
            } else {
                notificarUsuario(
                    $pdo,
                    (int) $deuda['socio_id'],
                    $saldada ? 'Deuda cancelada en su totalidad' : 'Abono a deuda registrado',
                    'Se registró un abono de Bs. ' . montoDeudaTexto($montoAbono) . ' por: ' . $deuda['concepto']
                    . ($saldada ? '. La deuda quedó totalmente cancelada.' : '. Saldo pendiente: Bs. ' . montoDeudaTexto($nuevoSaldo) . '.')
                );
            }

            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('deudas abonar POST: ' . $e->getMessage());
            jsonError('No se pudo registrar el abono.', 500);
        }

        $stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
        $stmt->execute([':id' => $deudaId]);
        jsonResponse([
            'ok' => true,
            'deuda' => deudaPublica($stmt->fetch() ?: []),
            'mensaje' => $saldada ? 'Deuda saldada por completo.' : 'Abono registrado correctamente.',
        ]);
    }

    /* ---------------------------------------------------------------------- */
    /* ACCIÓN: EMISIÓN EN LOTE DESDE EL CARRITO ("Dejar Pendiente")           */
    /* ---------------------------------------------------------------------- */
    if (isset($body['items']) && is_array($body['items'])) {
        if (!usuarioGestionaDeudas($usuario)) {
            jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede emitir deudas.', 403);
        }

        $socioId = (int) ($body['socio_id'] ?? 0);
        $itemsCrudos = $body['items'];

        if ($socioId <= 0) {
            jsonError('Debe seleccionar el socio al que se imputan las deudas.', 400);
        }
        if (empty($itemsCrudos)) {
            jsonError('El lote está vacío: agregue al menos una multa o un aporte.', 400);
        }

        $stmt = db()->prepare('SELECT `id`, `nombre` FROM `usuarios` WHERE `id` = :id');
        $stmt->execute([':id' => $socioId]);
        $socio = $stmt->fetch();
        if (!$socio) {
            jsonError('El socio seleccionado no existe.', 404);
        }

        $pdo = db();
        $deudasCreadas = [];
        $totalLote = 0.0;
        try {
            $pdo->beginTransaction();
            $tieneCols = tablaTieneColumna('deudas_multas', 'monto_pagado');
            $sqlInsert = $tieneCols
                ? 'INSERT INTO `deudas_multas`
                    (`socio_id`, `concepto`, `monto`, `monto_pagado`, `saldo_pendiente`, `tipo`, `estado`, `registrado_por`, `fecha_emision`)
                   VALUES
                    (:socio_id, :concepto, :monto, 0.00, :saldo, :tipo, \'pendiente\', :registrado_por, :fecha_emision)'
                : 'INSERT INTO `deudas_multas`
                    (`socio_id`, `concepto`, `monto`, `tipo`, `estado`, `registrado_por`, `fecha_emision`)
                   VALUES
                    (:socio_id, :concepto, :monto, :tipo, \'pendiente\', :registrado_por, :fecha_emision)';

            $insertStmt = $pdo->prepare($sqlInsert);

            foreach ($itemsCrudos as $it) {
                if (!is_array($it)) continue;
                $tipo = strtolower(trim((string) ($it['tipo'] ?? 'multa')));
                $tipoBd = in_array($tipo, ['aporte', 'aporte_anexo_2'], true) ? 'aporte_anexo_2' : 'multa_anexo_1';
                $concepto = textoLimpio($it['concepto'] ?? ($it['infraccion'] ?? ($it['articulo'] ?? 'Deuda')), 255);
                if ($tipoBd === 'multa_anexo_1' && !empty($it['articulo']) && strpos($concepto, $it['articulo']) === false) {
                    $concepto = textoLimpio($it['articulo'] . ': ' . $concepto, 255);
                }
                $monto = (float) str_replace(',', '.', (string) ($it['monto'] ?? 0));
                if ($monto <= 0) continue;

                $fechaEmision = trim((string) ($it['fecha_infraccion'] ?? ($it['fecha_emision'] ?? date('Y-m-d H:i:s'))));
                if (strlen($fechaEmision) === 10) {
                    $fechaEmision .= ' 00:00:00';
                }

                $params = [
                    ':socio_id' => $socioId,
                    ':concepto' => $concepto,
                    ':monto' => round($monto, 2),
                    ':tipo' => $tipoBd,
                    ':registrado_por' => (int) $usuario['id'],
                    ':fecha_emision' => $fechaEmision,
                ];
                if ($tieneCols) {
                    $params[':saldo'] = round($monto, 2);
                }
                $insertStmt->execute($params);
                $deudasCreadas[] = (int) $pdo->lastInsertId();
                $totalLote += $monto;
            }

            notificarUsuario(
                $pdo,
                $socioId,
                'Nuevas deudas registradas',
                'Se registraron ' . count($deudasCreadas) . ' deudas pendientes por un total de Bs. ' . montoDeudaTexto($totalLote)
                . '. Ingrese a «Mis Deudas y Aportes» para reportar su comprobante de pago.'
            );

            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('deudas lote POST: ' . $e->getMessage());
            jsonError('No se pudieron emitir las deudas del lote.', 500);
        }

        jsonResponse([
            'ok' => true,
            'deudasIds' => $deudasCreadas,
            'mensaje' => 'Se registraron ' . count($deudasCreadas) . ' deudas pendientes y se notificó al socio.',
        ], 201);
    }

    /* ---------------------------------------------------------------------- */
    /* ACCIÓN: EMISIÓN INDIVIDUAL ESTÁNDAR                                    */
    /* ---------------------------------------------------------------------- */
    if (!usuarioGestionaDeudas($usuario)) {
        jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede emitir deudas.', 403);
    }

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
        $tieneCols = tablaTieneColumna('deudas_multas', 'monto_pagado');

        if ($tieneCols) {
            $pdo->prepare(
                'INSERT INTO `deudas_multas`
                    (`socio_id`, `concepto`, `monto`, `monto_pagado`, `saldo_pendiente`, `tipo`, `estado`,
                     `registrado_por`, `fecha_emision`)
                 VALUES
                    (:socio_id, :concepto, :monto, 0.00, :saldo, :tipo, \'pendiente\',
                     :registrado_por, :fecha_emision)'
            )->execute([
                ':socio_id' => $socioId,
                ':concepto' => $concepto,
                ':monto' => round($monto, 2),
                ':saldo' => round($monto, 2),
                ':tipo' => $tipo,
                ':registrado_por' => (int) $usuario['id'],
                ':fecha_emision' => $fechaEmision !== '' ? $fechaEmision . ' 00:00:00' : date('Y-m-d H:i:s'),
            ]);
        } else {
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
                ':fecha_emision' => $fechaEmision !== '' ? $fechaEmision . ' 00:00:00' : date('Y-m-d H:i:s'),
            ]);
        }

        $deudaId = (int) $pdo->lastInsertId();

        notificarUsuario(
            $pdo,
            $socioId,
            'Nueva deuda registrada',
            'Se registró una deuda de Bs. ' . montoDeudaTexto($monto) . ' por: ' . $concepto
            . '. Ingrese a «Mis Deudas y Aportes» para reportar su pago.'
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
/* PUT: actualizar deuda (aprobar, reabrir, editar comprobante / foto)          */
/* -------------------------------------------------------------------------- */

$usuario = exigirUsuario();
if (!usuarioGestionaDeudas($usuario)) {
    jsonError('Su rol (' . nombreRol($usuario['rol']) . ') no puede actualizar deudas.', 403);
}

// Admite tanto cuerpo JSON como multipart/form-data
if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false || !empty($_FILES)) {
    $body = $_POST;
} else {
    $body = leerBodyJson();
}

$deudaId = (int) ($body['id'] ?? 0);
$tieneEstado = array_key_exists('estado', $body);
$estado = strtolower(trim((string) ($body['estado'] ?? '')));
$tieneComprobante = array_key_exists('nro_comprobante', $body);
$tieneMetodo = array_key_exists('metodo_pago', $body);
$nroComprobante = $tieneComprobante ? textoLimpio($body['nro_comprobante'] ?? '', 100) : '';
$metodoPago = $tieneMetodo ? strtolower(trim((string) ($body['metodo_pago'] ?? ''))) : '';

// Subida de imagen/PDF de comprobante
$comprobanteUrl = null;
if (isset($_FILES['comprobante']) && is_array($_FILES['comprobante'])) {
    $comprobanteUrl = guardarArchivoComprobante($_FILES['comprobante'], 'comprobante_' . $deudaId);
} elseif (!empty($body['comprobante_url'])) {
    $comprobanteUrl = textoLimpio($body['comprobante_url'], 255);
}

if ($deudaId <= 0) {
    jsonError('Debe indicar el `id` de la deuda.', 400);
}
if (!$tieneEstado && !$tieneComprobante && !$tieneMetodo && $comprobanteUrl === null) {
    jsonError('Indique el estado o los datos del comprobante a actualizar.', 400);
}
if ($tieneEstado && !in_array($estado, ESTADOS_DEUDA, true)) {
    jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_DEUDA) . '.', 400);
}
if ($tieneMetodo && $metodoPago !== ''
    && !in_array($metodoPago, ['efectivo', 'qr', 'transferencia'], true)) {
    jsonError('Método de pago no válido. Use: efectivo, qr o transferencia.', 400);
}

$stmt = db()->prepare(sqlDeuda() . ' WHERE d.id = :id');
$stmt->execute([':id' => $deudaId]);
$actual = $stmt->fetch();
if (!$actual) {
    jsonError('La deuda indicada no existe.', 404);
}

$mismoEstado = $tieneEstado && $estado === $actual['estado'];
$pdo = db();
try {
    $pdo->beginTransaction();

    // El comprobante, método de pago y foto pueden editarse inline sin alterar asientos
    $sets = [];
    $valores = [':id' => $deudaId];
    if ($tieneComprobante) {
        $sets[] = '`nro_comprobante` = :nro';
        $valores[':nro'] = $nroComprobante !== '' ? $nroComprobante : null;
    }
    if ($tieneMetodo) {
        $sets[] = '`metodo_pago` = :metodo';
        $valores[':metodo'] = $metodoPago !== '' ? $metodoPago : null;
    }
    if ($comprobanteUrl !== null) {
        $sets[] = '`comprobante_url` = :url';
        $valores[':url'] = $comprobanteUrl;
    }
    if (!empty($sets)) {
        $pdo->prepare('UPDATE `deudas_multas` SET ' . implode(', ', $sets) . ' WHERE `id` = :id')->execute($valores);
    }

    if ($tieneEstado && !$mismoEstado) {
        $tieneCols = tablaTieneColumna('deudas_multas', 'monto_pagado');
        if ($estado === 'cancelado') {
            if ($tieneCols) {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `estado` = \'cancelado\',
                            `monto_pagado` = `monto`,
                            `saldo_pendiente` = 0.00,
                            `fecha_pago` = COALESCE(`fecha_pago`, NOW())
                      WHERE `id` = :id'
                )->execute([':id' => $deudaId]);
            } else {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `estado` = \'cancelado\', `fecha_pago` = COALESCE(`fecha_pago`, NOW())
                      WHERE `id` = :id'
                )->execute([':id' => $deudaId]);
            }

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
            if ($tieneCols) {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `estado` = :estado,
                            `fecha_pago` = NULL,
                            `monto_pagado` = 0.00,
                            `saldo_pendiente` = `monto`
                      WHERE `id` = :id'
                )->execute([':estado' => $estado, ':id' => $deudaId]);
            } else {
                $pdo->prepare(
                    'UPDATE `deudas_multas`
                        SET `estado` = :estado, `fecha_pago` = NULL
                      WHERE `id` = :id'
                )->execute([':estado' => $estado, ':id' => $deudaId]);
            }

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
                    . ') fue observado. Revise su comprobante y vuelva a reportarlo desde «Mis Deudas y Aportes».'
                );
            }
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

if (!$tieneEstado) {
    $mensaje = 'Comprobante actualizado.';
} elseif ($mismoEstado) {
    $mensaje = $estado === 'cancelado' ? 'La deuda ya estaba cancelada.' : 'La deuda ya estaba en ese estado.';
} else {
    $mensaje = $mensajes[$estado] ?? 'Deuda actualizada.';
}

jsonResponse([
    'ok' => true,
    'deuda' => $deuda,
    'mensaje' => $mensaje,
]);
