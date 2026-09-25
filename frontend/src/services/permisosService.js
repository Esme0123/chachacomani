/**
 * ============================================================================
 *  ROLES Y PERMISOS (RBAC) — espejo del backend
 * ============================================================================
 *  Réplica exacta de `backend/api/roles.php`. El servidor es la autoridad: cada
 *  endpoint vuelve a validar el permiso con `exigirPermiso()` y responde 403 si
 *  el rol no lo tiene. Este archivo existe únicamente para OCULTAR botones y
 *  secciones que el usuario no puede usar, evitando pantallas que siempre
 *  acabarían en un error.
 *
 *  ⚠️ Si se modifica la matriz en roles.php, debe replicarse aquí.
 * ============================================================================
 */

export const ROL_LECTURA = 'lectura';
export const ROL_TESORERO = 'tesorero';
export const ROL_CAJA_CHICA = 'caja_chica';
export const ROL_ADMIN = 'admin';

export const ROLES_SISTEMA = [ROL_LECTURA, ROL_TESORERO, ROL_CAJA_CHICA, ROL_ADMIN];

/* -------------------------------------------------------------------------- */
/* Catálogo de permisos                                                        */
/* -------------------------------------------------------------------------- */

export const PERMISO_LEER_NORMATIVA = 'normativa:leer';
export const PERMISO_VOTAR = 'votos:emitir';
export const PERMISO_VER_MULTAS_PROPIAS = 'multas:ver_propias';
export const PERMISO_GESTIONAR_MULTAS = 'multas:gestionar';
export const PERMISO_VER_CONTABILIDAD = 'contabilidad:ver';
export const PERMISO_GESTIONAR_CAJA_CHICA = 'caja_chica:gestionar';
export const PERMISO_GESTIONAR_USUARIOS = 'usuarios:gestionar';
export const PERMISO_GESTIONAR_DRM = 'drm:gestionar';
export const PERMISO_VER_ESTADISTICAS = 'estadisticas:ver';

/**
 * Permisos que TODOS los roles tienen, sea cual sea su rol: lectura de la
 * normativa, emisión de votos y consulta de sus propias multas.
 */
export const PERMISOS_BASE = [
  PERMISO_LEER_NORMATIVA,
  PERMISO_VOTAR,
  PERMISO_VER_MULTAS_PROPIAS,
];

/** Lo que cada rol suma sobre los permisos base. */
const PERMISOS_POR_ROL = {
  [ROL_LECTURA]: [],
  [ROL_TESORERO]: [
    PERMISO_VER_MULTAS_PROPIAS,
    PERMISO_GESTIONAR_MULTAS,
    PERMISO_VER_CONTABILIDAD,
  ],
  [ROL_CAJA_CHICA]: [
    PERMISO_VER_MULTAS_PROPIAS,
    PERMISO_GESTIONAR_CAJA_CHICA,
    PERMISO_VER_CONTABILIDAD,
  ],
  [ROL_ADMIN]: [
    PERMISO_GESTIONAR_USUARIOS,
    PERMISO_GESTIONAR_DRM,
    PERMISO_VER_ESTADISTICAS,
    PERMISO_GESTIONAR_MULTAS,
    PERMISO_GESTIONAR_CAJA_CHICA,
    PERMISO_VER_CONTABILIDAD,
  ],
};

/** Etiquetas legibles de cada rol. */
export const NOMBRES_ROL = {
  [ROL_LECTURA]: 'Lectura (Socio)',
  [ROL_TESORERO]: 'Tesorero',
  [ROL_CAJA_CHICA]: 'Caja Chica',
  [ROL_ADMIN]: 'Administrador',
};

/** Descripción de las capacidades de cada rol (consola de gestión de socios). */
export const DESCRIPCIONES_ROL = {
  [ROL_LECTURA]:
    'Lectura de toda la normativa, emisión de votos y consulta de sus propias multas.',
  [ROL_TESORERO]:
    'Todo lo del rol Lectura, más la gestión de contaduría y sanciones del Anexo I (Cuadro N.º 1 y N.º 2).',
  [ROL_CAJA_CHICA]:
    'Todo lo del rol Lectura, más el panel de ingresos y egresos menores de caja chica.',
  [ROL_ADMIN]:
    'Control total del sistema, gestión de usuarios y roles, y control exclusivo del DRM.',
};

/* -------------------------------------------------------------------------- */
/* Consultas                                                                   */
/* -------------------------------------------------------------------------- */

export function esRolValido(rol) {
  return ROLES_SISTEMA.includes(rol);
}

export function nombreRol(rol) {
  return NOMBRES_ROL[rol] || NOMBRES_ROL[ROL_LECTURA];
}

export function descripcionRol(rol) {
  return DESCRIPCIONES_ROL[rol] || DESCRIPCIONES_ROL[ROL_LECTURA];
}

/** Permisos efectivos de un rol (base + propios), sin duplicados. */
export function permisosDeRol(rol) {
  if (!esRolValido(rol)) return [...PERMISOS_BASE];
  return [...new Set([...PERMISOS_BASE, ...PERMISOS_POR_ROL[rol]])];
}

/**
 * ¿El usuario indicado tiene el permiso?
 * Sin sesión iniciada sólo se concede lectura de la normativa: el resto exige
 * iniciar sesión para que el servidor pueda identificar al socio.
 */
export function tienePermiso(usuario, permiso) {
  if (!usuario) return permiso === PERMISO_LEER_NORMATIVA;
  const permisos = Array.isArray(usuario.permisos) && usuario.permisos.length
    ? usuario.permisos
    : permisosDeRol(usuario.rol);
  return permisos.includes(permiso);
}

export function esAdmin(usuario) {
  return usuario?.rol === ROL_ADMIN;
}

/* -------------------------------------------------------------------------- */
/* Matriz completa (consola de administración)                                 */
/* -------------------------------------------------------------------------- */

export function matrizDePermisos() {
  return {
    roles: ROLES_SISTEMA.map((rol) => ({
      rol,
      nombre: nombreRol(rol),
      descripcion: descripcionRol(rol),
      permisos: permisosDeRol(rol),
    })),
    catalogoPermisos: [
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
  };
}
