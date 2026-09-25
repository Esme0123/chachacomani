import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '../services/authService';
import { tienePermiso, esAdmin as comprobarEsAdmin, nombreRol } from '../services/permisosService';

/**
 * ============================================================================
 *  CONTEXTO DE AUTENTICACIÓN
 * ============================================================================
 *  Fuente única del estado de sesión de la aplicación. Se monta una sola vez en
 *  `App.jsx`; el resto de la aplicación consume el hook `useAuth()`.
 *
 *  · `usuario`  -> socio autenticado (id, nombre, correo, rol, permisos) o null.
 *  · `cargando` -> true mientras se valida el token guardado con el servidor.
 *  · `puede(permiso)` -> booleano para ocultar botones no autorizados.
 *
 *  La lista de `permisos` la envía el backend en `usuarioPublico()`; si por
 *  alguna razón no viniera, `tienePermiso` la recalcula desde el rol.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al arrancar la aplicación se valida el token de localStorage contra el
  // servidor: así una sesión caducada no deja la interfaz "logueada".
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const socio = await authService.sesionActual();
        if (vivo) setUsuario(socio);
      } catch (error) {
        // Error de red: se asume sesión cerrada y el socio tendrá que
        // volver a autenticarse cuando la conexión se restablezca.
        console.error('No se pudo validar la sesión:', error);
        if (vivo) setUsuario(null);
      } finally {
        if (vivo) setCargando(false);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const login = useCallback(async (correo, contrasena) => {
    const json = await authService.login(correo, contrasena);
    setUsuario(json.usuario);
    return json.usuario;
  }, []);

  const registro = useCallback(async (nombre, correo, contrasena) => {
    const json = await authService.registro(nombre, correo, contrasena);
    setUsuario(json.usuario);
    return json.usuario;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUsuario(null);
  }, []);

  const actualizarPerfil = useCallback(async (datos) => {
    const json = await authService.actualizarPerfil(datos);
    setUsuario(json.usuario);
    return json.usuario;
  }, []);

  const refrescarUsuario = useCallback(async () => {
    const json = await authService.obtenerPerfil();
    setUsuario(json.usuario);
    return json.usuario;
  }, []);

  const cambiarContrasena = useCallback(async (contrasenaActual, contrasenaNueva) => {
    return authService.cambiarContrasena(contrasenaActual, contrasenaNueva);
  }, []);

  const puede = useCallback(
    (permiso) => tienePermiso(usuario, permiso),
    [usuario]
  );

  const valor = useMemo(
    () => ({
      usuario,
      cargando,
      estaAutenticado: Boolean(usuario),
      esAdmin: comprobarEsAdmin(usuario),
      nombreRol: nombreRol(usuario?.rol),
      login,
      registro,
      logout,
      actualizarPerfil,
      refrescarUsuario,
      cambiarContrasena,
      puede,
    }),
    [usuario, cargando, login, registro, logout, actualizarPerfil, refrescarUsuario, cambiarContrasena, puede]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/** Acceso al contexto de sesión. Lanza si se usa fuera de <AuthProvider>. */
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth() debe usarse dentro de <AuthProvider>.');
  }
  return contexto;
}
