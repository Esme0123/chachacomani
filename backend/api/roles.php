<?php
/**
 * ============================================================================
 *  ROLES Y PERMISOS (RBAC) — Cooperativa Minera Nevado Chachacomani R.L.
 * ============================================================================
 *  Fuente única de verdad del control de acceso. El frontend replica esta misma
 *  matriz en `frontend/src/services/permisosService.js` SOLO para poder
 *  ocultar botones; la validación real ocurre siempre en este backend.
 *
 *  Los cuatro roles
 *  ----------------
 *   lectura     Socio / Usuario Estándar
 *               Lectura de toda la normativa, emisión de votos y consulta de
 *               sus propias multas desde el Perfil.
 *   tesorero    Incluye TODOS los permisos de `lectura` y además la interfaz de
 *               contaduría y sanciones del Anexo I (Cuadro N.º 1 y Cuadro N.º 2)
 *               con el botón «Llenar Formulario / Registrar Multa».
 *   caja_chica  Incluye lectura y votos, más el panel de ingresos y egresos
 *               menores de caja chica.
 *   admin       Control total: usuarios, roles y DRM exclusivo.
 * ============================================================================
 */
declare(strict_types=1);

/* -------------------------------------------------------------------------- */
/* Catálogo de roles                                                           */
/* -------------------------------------------------------------------------- */

const ROL_LECTURA = 'lectura';
const ROL_TESORERO = 'tesorero';
const ROL_CAJA_CHICA = 'caja_chica';
const ROL_ADMIN = 'admin';

const ROLES_SISTEMA = [ROL_LECTURA, ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN];

/* -------------------------------------------------------------------------- */
/* Catálogo de permisos                                                        */
/* -------------------------------------------------------------------------- */

const PERMISO_LEER_NORMATIVA = 'normativa:leer';
const PERMISO_VOTAR = 'votos:emitir';
const PERMISO_VER_MULTAS_PROPIAS = 'multas:ver_propias';
const PERMISO_GESTIONAR_MULTAS = 'multas:gestionar';
const PERMISO_VER_CONTABILIDAD = 'contabilidad:ver';
const PERMISO_GESTIONAR_CAJA_CHICA = 'caja_chica:gestionar';
const PERMISO_GESTIONAR_USUARIOS = 'usuarios:gestionar';
const PERMISO_GESTIONAR_DRM = 'drm:gestionar';
const PERMISO_VER_ESTADISTICAS = 'estadisticas:ver';

/**
 * Matriz rol -> permisos.
 * Los permisos heredados NO se repiten: cada rol declara lo que suma.
 */
const PERMISOS_POR_ROL = [
    ROL_LECTURA => [
        PERMISO_LEER_NORMATIVA,
        PERMISO_VOTAR,
        PERMISO_VER_MULTAS_PROPIAS,
    ],
    ROL_TESORERO => [
        PERMISO_VER_MULTAS_PROPIAS,   // los permisos de lectura se heredan abajo
        PERMISO_GESTIONAR_MULTAS,
        PERMISO_VER_CONTABILIDAD,
    ],
    ROL_CAJA_CHICA => [
        PERMISO_VER_MULTAS_PROPIAS,   // idem: hereda lectura
        PERMISO_GESTIONAR_CAJA_CHICA,
        PERMISO_VER_CONTABILIDAD,
    ],
    ROL_ADMIN => [
        PERMISO_GESTIONAR_USUARIOS,
        PERMISO_GESTIONAR_DRM,
        PERMISO_VER_ESTADISTICAS,
        PERMISO_GESTIONAR_MULTAS,    // el admin también imputa y cierra multas
        PERMISO_GESTIONAR_CAJA_CHICA,
        PERMISO_VER_CONTABILIDAD,
    ],
];

/**
 * Permisos que TODOS los roles tienen, sea cual sea su rol.
 * Coincide con el "Rol Lectura (Socio / Usuario Estándar)" de la especificación.
 */
const PERMISOS_BASE = [
    PERMISO_LEER_NORMATIVA,
    PERMISO_VOTAR,
    PERMISO_VER_MULTAS_PROPIAS,
];

/** Etiquetas legibles para la interfaz de gestión de usuarios. */
const NOMBRES_ROL = [
    ROL_LECTURA   => 'Lectura (Socio)',
    ROL_TESORERO  => 'Tesorero',
    ROL_CAJA_CHICA => 'Caja Chica',
    ROL_ADMIN     => 'Administrador',
];

/** Descripción de las capacidades de cada rol (gestor de usuarios del Admin). */
const DESCRIPCIONES_ROL = [
    ROL_LECTURA   => 'Lectura de toda la normativa, emisión de votos y consulta de sus propias multas.',
    ROL_TESORERO  => 'Todo lo del rol Lectura, más la gestión de contaduría y sanciones del Anexo I (Cuadro N.º 1 y N.º 2).',
    ROL_CAJA_CHICA => 'Todo lo del rol Lectura, más el panel de ingresos y egresos menores de caja chica.',
    ROL_ADMIN     => 'Control total del sistema, gestión de usuarios y roles, y control exclusivo del DRM.',
];

/* -------------------------------------------------------------------------- */
/* Consultas                                                                   */
/* -------------------------------------------------------------------------- */

/** ¿El nombre corresponde a un rol del sistema? */
function esRolValido(?string $rol): bool
{
    return $rol !== null && in_array($rol, ROLES_SISTEMA, true);
}

/**
 * Permisos efectivos de un rol (base + propios), sin duplicados.
 * @return string[]
 */
function permisosDeRol(?string $rol): array
{
    if (!esRolValido($rol)) {
        return PERMISOS_BASE; // un rol desconocido nunca concede más que lectura
    }
    $permisos = array_merge(PERMISOS_BASE, PERMISOS_POR_ROL[$rol]);
    return array_values(array_unique($permisos));
}

/** ¿El rol tiene el permiso indicado? */
function rolTienePermiso(?string $rol, string $permiso): bool
{
    return in_array($permiso, permisosDeRol($rol), true);
}

/** Nombre legible del rol. */
function nombreRol(?string $rol): string
{
    return NOMBRES_ROL[$rol] ?? NOMBRES_ROL[ROL_LECTURA];
}

/**
 * Matriz completa para el frontend (consola de administración): permite dibujar
 * la tabla de permisos sin duplicar el catálogo en el cliente.
 */
function matrizDePermisos(): array
{
    $filas = [];
    foreach (ROLES_SISTEMA as $rol) {
        $filas[] = [
            'rol' => $rol,
            'nombre' => nombreRol($rol),
            'descripcion' => DESCRIPCIONES_ROL[$rol],
            'permisos' => permisosDeRol($rol),
        ];
    }
    return [
        'roles' => $filas,
        'catalogoPermisos' => [
            PERMISO_LEER_NORMATIVA,
            PERMISO_VOTAR,
            PERMISO_VER_MULTAS_PROPIAS,
            PERMISO_GESTIONAR_MULTAS,
            PERMISO_VER_CONTABILIDAD,
            PERMISO_GESTIONAR_CAJA_CHICA,
            PERMISO_GESTIONAR_USUARIOS,
            PERMISO_GESTIONAR_DRM,
            PERMISO_VER_ESTADISTICAS,
        ],
    ];
}
