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
 *   PUT  /backend/api/multas.php        (permiso `multas:gestionar`)
 *        Body: { "id": 12, "estado": "pagada" }  -> cierra la sanción
 *              { "id": 12, "estado": "anulada" } -> anula por resolución
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
        'creadoEn' => $fila['creado_en'] ?? null,
        'actualizadoEn' => $fila['actualizado_en'] ?? null,
    ];
}

const SELECT_MULTA = 'SELECT m.*,
                             s.nombre AS socio_nombre, s.correo AS socio_correo,
                             r.nombre AS registrador_nombre
                        FROM `multas` m
                        JOIN `usuarios` s ON s.id = m.socio_id
                        JOIN `usuarios` r ON r.id = m.registrado_por';

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

    $sql = SELECT_MULTA
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
                'SELECT `id`, `nombre`, `correo`
                   FROM `usuarios`
                  WHERE `activo` = 1
                  ORDER BY `nombre` ASC'
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

    // El socio debe existir (FK) — mensaje claro en vez de un error 500.
    $stmt = db()->prepare('SELECT `id` FROM `usuarios` WHERE `id` = :id');
    $stmt->execute([':id' => $socioId]);
    if ($stmt->fetchColumn() === false) {
        jsonError('El socio seleccionado no existe.', 404);
    }

    try {
        $stmt = db()->prepare(
            'INSERT INTO `multas`
                (`socio_id`, `infraccion`, `articulo_referencia`, `categoria`, `monto`,
                 `fecha_infraccion`, `estado`, `medida_complementaria`, `observaciones`, `registrado_por`)
             VALUES
                (:socio_id, :infraccion, :articulo, :categoria, :monto,
                 :fecha, \'pendiente\`, :medida, :observaciones, :registrado_por)'
        );
        $stmt->execute([
            ':socio_id'       => $socioId,
            ':infraccion'     => $infraccion,
            ':articulo'       => $articulo,
            ':categoria'      => $categoria,
            ':monto'          => $monto,
            ':fecha'          => $fecha,
            ':medida'         => $medida !== '' ? $medida : null,
            ':observaciones'  => $observaciones !== '' ? $observaciones : null,
            ':registrado_por' => (int) $usuario['id'],
        ]);
    } catch (PDOException $e) {
        error_log('multas POST: ' . $e->getMessage());
        jsonError('No se pudo registrar la multa.', 500);
    }

    $multaId = (int) db()->lastInsertId();
    $stmt = db()->prepare(SELECT_MULTA . ' WHERE m.id = :id');
    $stmt->execute([':id' => $multaId]);

    jsonResponse([
        'ok'      => true,
        'multa'   => multaPublica($stmt->fetch() ?: []),
        'mensaje' => 'Multa registrada correctamente.',
    ], 201);
}

/* -------------------------------------------------------------------------- */
/* PUT: cambiar el estado de una multa (pagada / anulada)                      */
/* -------------------------------------------------------------------------- */

$usuario = exigirPermiso(PERMISO_GESTIONAR_MULTAS);

$body = leerBodyJson();
$multaId = (int) ($body['id'] ?? 0);
$estado = strtolower(trim((string) ($body['estado'] ?? '')));

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

$stmt = db()->prepare('UPDATE `multas` SET `estado` = :estado WHERE `id` = :id');
$stmt->execute([':estado' => $estado, ':id' => $multaId]);

$stmt = db()->prepare(SELECT_MULTA . ' WHERE m.id = :id');
$stmt->execute([':id' => $multaId]);

jsonResponse([
    'ok'      => true,
    'multa'   => multaPublica($stmt->fetch() ?: []),
    'mensaje' => $estado === 'pagada'
        ? 'Multa marcada como pagada.'
        : ($estado === 'anulada' ? 'Multa anulada.' : 'Multa reabierta como pendiente.'),
]);

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
