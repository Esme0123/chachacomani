<?php
/**
 * ============================================================================
 *  MÓDULO DE MULTAS — Anexo I del Reglamento Interno
 * ============================================================================
 *  Endpoint único para todo el ciclo de una sanción:
 *
 *   GET  /backend/api/multas.php
 *        ?socio_id=N     -> historial de un socio concreto
 *        ?estado=pendiente|pagada|anulada
 *   · Con rol `lectura`   : sólo se devuelve el historial PROPIO (el parámetro
 *                          `socio_id` se ignora y se fuerza el id del usuario).
 *   · Con rol `tesorero` o `admin` : listado completo + filtros + totales, y el
 *                          padrón de socios activos en `socios` para poder
 *                          imputar una multa sin exponer la gestión de usuarios.
 *
 *   POST /backend/api/multas.php        (permiso `multas:gestionar`)
 *        Botón «Llenar Formulario / Registrar Multa» del Anexo I.
 *        Body: { "socio_id": 3, "infraccion": "Inasistencia injustificada…",
 *                "articulo_referencia": "Art. 28.I.a)", "categoria": "Leve",
 *                "monto": 150, "fecha_infraccion": "2026-09-25",
 *                "medida_complementaria": "…", "observaciones": "…" }
 *
 *        Con "cobrar": true la sanción nace YA PAGADA y su ingreso se asienta
 *        en la MISMA transacción (flujo del conmutador «Registrar Multa a
 *        Socio» del panel de Caja Chica, que evita volver al Anexo I):
 *        { …, "cobrar": true, "fecha_cobro": "2026-09-30",
 *          "concepto_cobro": "Multa Art. 28.I.a): Inasistencia… - Juan Pérez" }
 *
 *   PUT  /backend/api/multas.php        (permiso `multas:gestionar`)
 *        Body: { "id": 12, "estado": "pagada" }  -> cierra la sanción y
 *              REGISTRA AUTOMÁTICAMENTE el ingreso en caja chica
 *              { "id": 12, "estado": "anulada" } -> anula por resolución y
 *              retira el ingreso de caja chica si se había generado
 *
 *  Integración con Caja Chica
 *  --------------------------
 *  Cuando el Tesorero marca una multa como «pagada» —con el PUT o naciéndola
 *  cobrada con el POST— el cobro se asienta como un movimiento de INGRESO en
 *  `caja_chica_movimientos`:
 *     · tipo     -> ingreso
 *     · categoría-> "Multas cobradas"
 *     · concepto -> "Cobro de Multa: <socio> - <infracción> (<artículo>)", o el
 *                   que envíe el cliente en `concepto_cobro` (formato del panel
 *                   de Caja Chica: "Multa <artículo>: <infracción> - <socio>")
 *     · monto    -> el valor efectivamente cobrado
 *  El vínculo se guarda en `caja_chica_movimientos`.`multa_id`, declarado
 *  UNIQUE: re-marcar la misma multa como pagada, reabrirla o anularla nunca
 *  duplica ni deja huérfano el ingreso. Opcionalmente el cliente puede pedir
 *  `registrar_caja_chica: false` para asentar el cobro a mano en el panel de
 *  caja chica en lugar de dejarlo automático.
 *
 *  Escala oficial (Cuadro N.º 1 y Cuadro N.º 2): Leve Bs. 100/150,
 *  Grave Bs. 300, Muy Grave según arancel. El monto y la categoría se
 *  guardan tal como se imputaron (histórico inalterable).
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

const CATEGORIAS_MULTA = ['Leve', 'Grave', 'Muy grave', 'Falta gravísima'];
const ESTADOS_MULTA = ['pendiente', 'pagada', 'anulada'];

/** Categoría de caja chica con la que se asientan los cobros de multas. */
const CATEGORIA_COBRO_MULTA = 'Multas cobradas';

/** Proyecta una fila de `multas` (con los nombres del socio y del registrador). */
function multaPublica(array $fila): array
{
    return [
        'id' => (int) $fila['id'],
        'socioId' => (int) $fila['socio_id'],
        'socioNombre' => (string) ($fila['socio_nombre'] ?? ''),
        'socioCorreo' => (string) ($fila['socio_correo'] ?? ''),
        'infraccion' => (string) $fila['infraccion'],
        'articulo' => (string) $fila['articulo_referencia'],
        'categoria' => (string) $fila['categoria'],
        'monto' => (float) $fila['monto'],
        'fechaInfraccion' => $fila['fecha_infraccion'] ?? null,
        'estado' => (string) $fila['estado'],
        'medidaComplementaria' => $fila['medida_complementaria'] ?? null,
        'observaciones' => $fila['observaciones'] ?? null,
        'registradoPor' => (int) $fila['registrado_por'],
        'registradoPorNombre' => (string) ($fila['registrador_nombre'] ?? ''),
        // Trazabilidad con Caja Chica: si el cobro ya está asentado, se informa
        // el movimiento generado para no ofrecer registrarlo dos veces.
        'cobroCajaId' => isset($fila['cobro_id']) && $fila['cobro_id'] !== null
            ? (int) $fila['cobro_id']
            : null,
        'cobroCajaFecha' => $fila['cobro_fecha'] ?? null,
        'creadoEn' => $fila['creado_en'] ?? null,
        'actualizadoEn' => $fila['actualizado_en'] ?? null,
    ];
}

/**
 * `SELECT` base de una multa con los nombres del socio y del registrador.
 * Cuando la base ya tiene la columna `caja_chica_movimientos`.`multa_id`
 * (migración aplicada), se añade el LEFT JOIN que permite saber si el cobro
 * ya fue asentado. En bases sin migrar, la consulta sigue siendo válida.
 */
function sqlMulta(): string
{
    $sql = 'SELECT m.*,
                   s.nombre AS socio_nombre, s.correo AS socio_correo,
                   r.nombre AS registrador_nombre';

    if (tablaTieneColumna('caja_chica_movimientos', 'multa_id')) {
        $sql .= ",
                   c.id AS cobro_id, c.fecha AS cobro_fecha
              FROM `multas` m
              JOIN `usuarios` s ON s.id = m.socio_id
              JOIN `usuarios` r ON r.id = m.registrado_por
         LEFT JOIN `caja_chica_movimientos` c ON c.multa_id = m.id";
    } else {
        $sql .= "
              FROM `multas` m
              JOIN `usuarios` s ON s.id = m.socio_id
              JOIN `usuarios` r ON r.id = m.registrado_por";
    }

    return $sql;
}

/* -------------------------------------------------------------------------- */
/* GET: consulta de multas                                                     */
/* -------------------------------------------------------------------------- */

if ($metodo === 'GET') {
    $usuario = exigirPermiso(PERMISO_VER_MULTAS_PROPIAS);
    $puedeVerTodas = rolTienePermiso($usuario['rol'], PERMISO_GESTIONAR_MULTAS);

    $where = [];
    $valores = [];

    if ($puedeVerTodas) {
        $socioId = isset($_GET['socio_id']) ? (int) $_GET['socio_id'] : 0;
        if ($socioId > 0) {
            $where[] = 'm.socio_id = :socio_id';
            $valores[':socio_id'] = $socioId;
        }
    } else {
        // Rol Lectura: sólo su propio historial, aunque solicite otro socio_id.
        $where[] = 'm.socio_id = :socio_id';
        $valores[':socio_id'] = (int) $usuario['id'];
    }

    $estado = strtolower(trim((string) ($_GET['estado'] ?? '')));
    if ($estado !== '') {
        if (!in_array($estado, ESTADOS_MULTA, true)) {
            jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_MULTA) . '.', 400);
        }
        $where[] = 'm.estado = :estado';
        $valores[':estado'] = $estado;
    }

    $sql = sqlMulta()
        . ($where ? ' WHERE ' . implode(' AND ', $where) : '')
        . ' ORDER BY m.fecha_infraccion DESC, m.id DESC';

    try {
        $stmt = db()->prepare($sql);
        $stmt->execute($valores);
        $filas = $stmt->fetchAll();
    } catch (PDOException $e) {
        error_log('multas GET: ' . $e->getMessage());
        jsonError('No se pudieron obtener las multas.', 500);
    }

    $multas = array_map('multaPublica', $filas);

    $totales = [
        'total' => count($multas),
        'pendientes' => 0,
        'pagadas' => 0,
        'anuladas' => 0,
        'montoPendiente' => 0.0,
        'montoPagado' => 0.0,
    ];
    foreach ($multas as $multa) {
        if ($multa['estado'] === 'pagada') {
            $totales['pagadas']++;
            $totales['montoPagado'] += $multa['monto'];
        } elseif ($multa['estado'] === 'anulada') {
            $totales['anuladas']++;
        } else {
            $totales['pendientes']++;
            $totales['montoPendiente'] += $multa['monto'];
        }
    }
    $totales['montoPendiente'] = round($totales['montoPendiente'], 2);
    $totales['montoPagado'] = round($totales['montoPagado'], 2);

    // El Tesorero necesita un padrón de socios para imputar multas, pero no
    // tiene `usuarios:gestionar` (exclusivo del Admin). Se le devuelve aquí
    // únicamente la lista de socios activos (id, nombre y correo), que es
    // justo lo que el formulario «Registrar Multa» necesita, y nada más.
    $socios = [];
    if ($puedeVerTodas) {
        try {
            $stmt = db()->query(
                'SELECT `id`, `nombre`, `correo`, `rol`
                   FROM `usuarios`
                  WHERE `activo` = 1
               ORDER BY (`rol` = \'lectura\') DESC, `nombre` ASC'
            );
            $socios = $stmt->fetchAll();
        } catch (PDOException $e) {
            error_log('multas GET (socios): ' . $e->getMessage());
            $socios = [];
        }
    }

    jsonResponse([
        'ok'             => true,
        'multas'         => $multas,
        'totales'        => $totales,
        'puedeGestionar' => $puedeVerTodas,
        'socios'         => $socios,
    ]);
}

/* -------------------------------------------------------------------------- */
/* POST: imputar una multa (Tesorero / Admin)                                  */
/* -------------------------------------------------------------------------- */

if ($metodo === 'POST') {
    $usuario = exigirPermiso(PERMISO_GESTIONAR_MULTAS);

    $body = leerBodyJson();

    $socioId = (int) ($body['socio_id'] ?? 0);
    $infraccion = textoLimpio($body['infraccion'] ?? '', 255);
    $articulo = textoLimpio($body['articulo_referencia'] ?? ($body['articulo'] ?? ''), 60);
    $categoria = textoLimpio($body['categoria'] ?? 'Leve', 20);
    $monto = (float) str_replace(',', '.', (string) ($body['monto'] ?? 0));
    $fecha = trim((string) ($body['fecha_infraccion'] ?? date('Y-m-d')));
    $medida = textoLimpio($body['medida_complementaria'] ?? ($body['medida'] ?? ''), 255);
    $observaciones = textoLimpio($body['observaciones'] ?? '', 2000);

    // `cobrar: true` es el atajo que usa el panel de Caja Chica: la sanción
    // nace YA PAGADA y su ingreso se asienta en la misma transacción, de modo
    // que el Tesorero cobra sin volver al Anexo I.
    $cobrar = entradaBooleana($body['cobrar'] ?? false) === true;
    $fechaCobro = trim((string) ($body['fecha_cobro'] ?? ''));
    $conceptoCobro = textoLimpio($body['concepto_cobro'] ?? '', 255);

    if ($socioId <= 0) {
        jsonError('Debe seleccionar el socio (miembro) al que se imputa la multa.', 400);
    }
    if ($infraccion === '') {
        jsonError('Debe describir la infracción tipificada.', 400);
    }
    if ($articulo === '') {
        jsonError('Debe indicar el artículo de referencia (p. ej. "Art. 28.I.a)").', 400);
    }
    if (!in_array($categoria, CATEGORIAS_MULTA, true)) {
        jsonError('Categoría no válida. Use: ' . implode(', ', CATEGORIAS_MULTA) . '.', 400);
    }
    if ($monto < 0 || $monto > 1000000) {
        jsonError('El monto debe ser un valor en bolivianos entre 0 y 1.000.000.', 400);
    }
    if (!validarFechaIso($fecha)) {
        jsonError('La fecha de infracción debe tener el formato AAAA-MM-DD.', 400);
    }
    if ($cobrar && $monto <= 0) {
        jsonError('Una sanción sin multa pecunaria no se puede cobrar: regístrela como pendiente.', 400);
    }
    if ($fechaCobro !== '' && !validarFechaIso($fechaCobro)) {
        jsonError('La fecha de cobro debe tener el formato AAAA-MM-DD.', 400);
    }

    // El socio debe existir (FK) — mensaje claro en vez de un error 500.
    $stmt = db()->prepare('SELECT `id` FROM `usuarios` WHERE `id` = :id');
    $stmt->execute([':id' => $socioId]);
    if ($stmt->fetchColumn() === false) {
        jsonError('El socio seleccionado no existe.', 404);
    }

    // La sanción y (si se cobra) su ingreso se escriben juntos: o entra la multa
    // con su asiento en Caja Chica, o no entra ninguna de las dos cosas.
    $pdo = db();
    try {
        $pdo->beginTransaction();

        $stmt = $pdo->prepare(
            'INSERT INTO `multas`
                (`socio_id`, `infraccion`, `articulo_referencia`, `categoria`, `monto`,
                 `fecha_infraccion`, `estado`, `medida_complementaria`, `observaciones`, `registrado_por`)
             VALUES
                (:socio_id, :infraccion, :articulo, :categoria, :monto,
                 :fecha, :estado, :medida, :observaciones, :registrado_por)'
        );
        $stmt->execute([
            ':socio_id'       => $socioId,
            ':infraccion'     => $infraccion,
            ':articulo'       => $articulo,
            ':categoria'      => $categoria,
            ':monto'          => $monto,
            ':fecha'          => $fecha,
            ':estado'         => $cobrar ? 'pagada' : 'pendiente',
            ':medida'         => $medida !== '' ? $medida : null,
            ':observaciones'  => $observaciones !== '' ? $observaciones : null,
            ':registrado_por' => (int) $usuario['id'],
        ]);

        $multaId = (int) $pdo->lastInsertId();

        $cobro = ['accion' => 'nada', 'movimientoId' => null, 'concepto' => null, 'monto' => null, 'aviso' => ''];
        if ($cobrar) {
            $cobro = sincronizarCobroEnCajaChica(
                $pdo,
                $multaId,
                'pagada',
                (int) $usuario['id'],
                true,
                $fechaCobro !== '' ? $fechaCobro : $fecha,
                $conceptoCobro
            );
        }

        $pdo->commit();
    } catch (Throwable $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log('multas POST: ' . $e->getMessage());
        jsonError('No se pudo registrar la multa.', 500);
    }

    $stmt = db()->prepare(sqlMulta() . ' WHERE m.id = :id');
    $stmt->execute([':id' => $multaId]);

    $aviso = '';
    if ($cobro['accion'] === 'registrado') {
        $aviso = ' Cobro asentado en Caja Chica: «' . $cobro['concepto'] . '».';
    } elseif ($cobro['accion'] === 'omitido' && $cobro['aviso'] !== '') {
        $aviso = ' ' . $cobro['aviso'];
    }

    jsonResponse([
        'ok'      => true,
        'multa'   => multaPublica($stmt->fetch() ?: []),
        'cobro'   => $cobro,
        'mensaje' => ($cobrar ? 'Multa registrada y cobrada correctamente.' : 'Multa registrada correctamente.') . $aviso,
    ], 201);
}

/* -------------------------------------------------------------------------- */
/* PUT: cambiar el estado de una multa (pagada / anulada)                      */
/* -------------------------------------------------------------------------- */

$usuario = exigirPermiso(PERMISO_GESTIONAR_MULTAS);

$body = leerBodyJson();
$multaId = (int) ($body['id'] ?? 0);
$estado = strtolower(trim((string) ($body['estado'] ?? '')));

// El asiento en Caja Chica es automático; el Tesorero puede desactivarlo
// (`registrar_caja_chica: false`) si prefiere asentarlo a mano en el panel.
$crudoCaja = $body['registrar_caja_chica'] ?? true;
$registrarCaja = !in_array(
    strtolower(trim((string) (is_bool($crudoCaja) ? ($crudoCaja ? 'true' : 'false') : $crudoCaja))),
    ['false', '0', 'no', 'off'],
    true
);

$fechaCobro = trim((string) ($body['fecha_cobro'] ?? ''));
if ($fechaCobro !== '' && !validarFechaIso($fechaCobro)) {
    jsonError('La fecha de cobro debe tener el formato AAAA-MM-DD.', 400);
}

if ($multaId <= 0) {
    jsonError('Debe indicar el `id` de la multa.', 400);
}
if (!in_array($estado, ESTADOS_MULTA, true)) {
    jsonError('Estado no válido. Use: ' . implode(', ', ESTADOS_MULTA) . '.', 400);
}

$stmt = db()->prepare('SELECT `id`, `estado` FROM `multas` WHERE `id` = :id');
$stmt->execute([':id' => $multaId]);
$actual = $stmt->fetch();

if (!$actual) {
    jsonError('La multa indicada no existe.', 404);
}

// El cambio de estado y el asiento contable van en la MISMA transacción: o se
// guardan ambos, o ninguno. Así la caja chica nunca refleja un cobro de una
// sanción que no llegó a marcarse como pagada.
$pdo = db();
try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('UPDATE `multas` SET `estado` = :estado WHERE `id` = :id');
    $stmt->execute([':estado' => $estado, ':id' => $multaId]);

    $cobro = sincronizarCobroEnCajaChica(
        $pdo,
        $multaId,
        $estado,
        (int) $usuario['id'],
        $registrarCaja,
        $fechaCobro
    );

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('multas PUT: ' . $e->getMessage());
    jsonError('No se pudo actualizar la multa.', 500);
}

$stmt = db()->prepare(sqlMulta() . ' WHERE m.id = :id');
$stmt->execute([':id' => $multaId]);
$multa = multaPublica($stmt->fetch() ?: []);

$mensajes = [
    'pagada' => 'Multa marcada como pagada.',
    'anulada' => 'Multa anulada.',
    'pendiente' => 'Multa reabierta como pendiente.',
];

$aviso = '';
switch ($cobro['accion']) {
    case 'registrado':
        $aviso = ' Ingreso registrado en Caja Chica: «' . $cobro['concepto'] . '».';
        break;
    case 'ya-registrado':
        $aviso = ' El cobro ya constaba en Caja Chica (movimiento #' . $cobro['movimientoId'] . ').';
        break;
    case 'revertido':
        $aviso = ' Se retiró de Caja Chica el ingreso asociado a esta multa.';
        break;
    case 'omitido':
        $aviso = $cobro['aviso'] !== '' ? ' ' . $cobro['aviso'] : '';
        break;
}

jsonResponse([
    'ok'      => true,
    'multa'   => $multa,
    'cobro'   => $cobro,
    'mensaje' => ($mensajes[$estado] ?? 'Multa actualizada.') . $aviso,
]);

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Mantiene sincronizado el cobro de una multa con la Caja Chica.
 *
 * El vínculo es `caja_chica_movimientos`.`multa_id` (UNIQUE), así que el
 * asiento es idempotente: re-marcar la misma multa como pagada no duplica el
 * ingreso, y anular o reabrir una multa ya cobrada retira el ingreso para que
 * el saldo de caja refleje la realidad.
 *
 * @return array{
 *   accion: 'registrado'|'ya-registrado'|'revertido'|'omitido'|'nada',
 *   movimientoId: int|null, concepto: string|null, monto: float|null,
 *   aviso: string
 * }
 * @param string $fechaCobro Fecha del ingreso; vacía = hoy.
 * @param string $concepto   Concepto propuesto por el cliente (panel de Caja
 *   Chica); vacío = el que se compone aquí.
 */
function sincronizarCobroEnCajaChica(
    PDO $pdo,
    int $multaId,
    string $estado,
    int $usuarioId,
    bool $registrar,
    string $fechaCobro,
    string $concepto = ''
): array {
    $nada = ['accion' => 'nada', 'movimientoId' => null, 'concepto' => null, 'monto' => null, 'aviso' => ''];

    // Base instalada antes de la migración: la multa se actualiza igual, pero
    // se avisa de que falta el vínculo para no perder el cobro en silencio.
    if (!tablaTieneColumna('caja_chica_movimientos', 'multa_id')) {
        return [
            'accion' => 'omitido',
            'movimientoId' => null,
            'concepto' => null,
            'monto' => null,
            'aviso' => 'No se asentó el ingreso en Caja Chica: ejecute backend/migrar.php para activar el vínculo con el Anexo I.',
        ];
    }

    $stmt = $pdo->prepare('SELECT `id`, `monto`, `fecha` FROM `caja_chica_movimientos` WHERE `multa_id` = :multa_id');
    $stmt->execute([':multa_id' => $multaId]);
    $existente = $stmt->fetch();

    // La sanción deja de estar cobrada (anulada por resolución o reabierta):
    // se retira el ingreso para no deixar dinero cobrado por una multa sin vigor.
    if ($estado !== 'pagada') {
        if (!$existente) {
            return $nada;
        }
        $pdo->prepare('DELETE FROM `caja_chica_movimientos` WHERE `id` = :id')
            ->execute([':id' => (int) $existente['id']]);
        return [
            'accion' => 'revertido',
            'movimientoId' => null,
            'concepto' => null,
            'monto' => null,
            'aviso' => '',
        ];
    }

    if ($existente) {
        return [
            'accion' => 'ya-registrado',
            'movimientoId' => (int) $existente['id'],
            'concepto' => null,
            'monto' => null,
            'aviso' => '',
        ];
    }

    // El Tesorero decidió asentar el cobro a mano en el panel de caja chica.
    if (!$registrar) {
        return [
            'accion' => 'omitido',
            'movimientoId' => null,
            'concepto' => null,
            'monto' => null,
            'aviso' => 'No se generó el ingreso en Caja Chica (debe registrarlo a mano).',
        ];
    }

    $stmt = $pdo->prepare(sqlMulta() . ' WHERE m.id = :id');
    $stmt->execute([':id' => $multaId]);
    $multa = $stmt->fetch();

    if (!$multa) {
        return $nada;
    }

    $monto = round((float) $multa['monto'], 2);
    if ($monto <= 0) {
        return [
            'accion' => 'omitido',
            'movimientoId' => null,
            'concepto' => null,
            'monto' => null,
            'aviso' => 'La sanción no es pecuniaria: no se asienta ningún ingreso en Caja Chica.',
        ];
    }

    $concepto = $concepto !== ''
        ? textoLimpio($concepto, 255)
        : textoLimpio(
            'Cobro de Multa: ' . $multa['socio_nombre'] . ' - ' . $multa['infraccion']
            . ' (' . $multa['articulo_referencia'] . ')',
            255
        );

    $pdo->prepare(
        'INSERT INTO `caja_chica_movimientos`
            (`tipo`, `concepto`, `categoria`, `monto`, `fecha`, `observaciones`, `registrado_por`, `multa_id`)
         VALUES
            (\'ingreso\', :concepto, :categoria, :monto, :fecha, :observaciones, :registrado_por, :multa_id)'
    )->execute([
        ':concepto' => $concepto,
        ':categoria' => CATEGORIA_COBRO_MULTA,
        ':monto' => $monto,
        ':fecha' => $fechaCobro !== '' ? $fechaCobro : date('Y-m-d'),
        ':observaciones' => 'Ingreso automático por el cobro de la multa #' . $multaId . ' (Anexo I).',
        ':registrado_por' => $usuarioId,
        ':multa_id' => $multaId,
    ]);

    return [
        'accion' => 'registrado',
        'movimientoId' => (int) $pdo->lastInsertId(),
        'concepto' => $concepto,
        'monto' => $monto,
        'aviso' => '',
    ];
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
