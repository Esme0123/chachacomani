import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, ThumbsUp, ThumbsDown, Users, CheckCircle2, ShieldCheck, ShieldOff } from 'lucide-react';
import { temaReglamento } from '../theme/lecturaTemas';
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas';

export default function AdminDashboard({
  isOpen,
  onClose,
  isDark,
  drmEnabled,
  toggleDRM,
  puedeGestionarDrm = false,
  cambiandoDrm = false,
  tema = temaReglamento,
  capitulos = [],
  votos,
  strings = {}
}) {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [capituloId, setCapituloId] = useState(capitulos[0]?.id || null);

  useEffect(() => {
    if (!isOpen) return;
    let activo = true;
    setCargando(true);
    setError(null);
    votos.obtenerEstadisticas()
      .then((datos) => {
        if (!activo) return;
        setStats(datos);
      })
      .catch((e) => {
        if (!activo) return;
        setError(e?.message || 'No se pudieron cargar las estadísticas.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [isOpen, votos]);

  // Refresco automático en segundo plano mientras el Dashboard está abierto:
  // polling cada 7s + revalidación al volver a la pestaña (focus/visibility).
  const refrescarStats = useCallback(() => {
    votos.obtenerEstadisticas()
      .then((datos) => setStats(datos))
      .catch((e) => {
        console.error('Error backend:', e);
        setError(e?.message || 'No se pudieron cargar las estadísticas.');
      });
  }, [votos]);

  useRefrescoEstadisticas(refrescarStats, { intervaloMs: 7000, activo: isOpen });

  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  const capituloActual = useMemo(
    () => (stats ? stats.capitulos.find((c) => c.capituloId === capituloId) : null),
    [stats, capituloId]
  );

  const statCard = (icon, label, value, sub) => (
    <div
      className={`rounded-2xl border p-4 flex items-start gap-3 ${
        isDark ? 'bg-navy-800 border-slate-700' : 'bg-cream-100 border-sand-300'
      }`}
    >
      <div className={`p-2.5 rounded-xl shrink-0 ${tema.adminIcono}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-ink-muted dark:text-slate-400">
          {label}
        </p>
        <p className="text-xl font-bold text-ink dark:text-white font-display leading-tight">
          {value}
        </p>
        {sub && <p className="text-[11px] text-ink-muted dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6 bg-navy-950/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard de Administrador - Evaluación de la Normativa"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border shadow-2xl ${
              isDark ? 'bg-navy-900 border-slate-800' : 'bg-ivory border-sand-300'
            }`}
          >
            {/* Cabecera */}
            <div
              className={`relative shrink-0 overflow-hidden px-6 py-5 sm:px-8 border-b ${
                isDark ? 'bg-gradient-to-br from-navy-800 to-navy-900 border-slate-800' : tema.adminHeaderClaro
              }`}
            >
              <div className={`absolute top-0 right-0 p-4 opacity-10 pointer-events-none ${isDark ? tema.ctaIcono : tema.ctaIconoClaro}`}>
                <BarChart3 className="w-24 h-24" />
              </div>
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${tema.adminIcono}`}>
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[11px] font-mono font-bold uppercase tracking-widest ${tema.adminEyebrow}`}>
                      {strings.adminEyebrow || 'Panel de Administración'}
                    </p>
                    <h2 className="text-lg sm:text-xl font-bold text-ink dark:text-white font-display leading-tight mt-1">
                      {strings.adminTitle || 'Evaluación de la Normativa'}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Cerrar dashboard"
                  title="Cerrar dashboard"
                  className="shrink-0 p-2 text-ink-muted hover:text-ink dark:text-slate-400 dark:hover:text-white bg-cream-200/70 dark:bg-navy-800 hover:bg-cream-300 dark:hover:bg-navy-700 border border-sand-300 dark:border-slate-700 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Fila de Seguridad DRM (toggle On/Off) */}
            <div
              className={`flex shrink-0 items-center justify-between gap-3 px-4 py-3 sm:px-6 border-b ${
                isDark ? 'border-slate-800 bg-navy-950/40' : 'border-sand-200 bg-cream-100/60'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-ink-muted dark:text-slate-300">
                {drmEnabled ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <ShieldOff className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span>Seguridad DRM</span>
                <span className={`font-mono ${drmEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {drmEnabled ? 'ON' : 'OFF'}
                </span>
              </div>

              <button
                onClick={toggleDRM}
                disabled={!puedeGestionarDrm || cambiandoDrm}
                role="switch"
                aria-checked={drmEnabled}
                title={
                  puedeGestionarDrm
                    ? drmEnabled ? 'Desactivar Seguridad DRM' : 'Activar Seguridad DRM'
                    : 'Sólo el Administrador del sistema puede cambiar el DRM'
                }
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  drmEnabled ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    drmEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Cuerpo */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
              {cargando && !stats ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-ink-muted dark:text-slate-400">
                  <div className={`w-8 h-8 rounded-full border-2 animate-spin ${tema.adminSpinner}`} />
                  <p className="text-xs">Cargando estadísticas...</p>
                </div>
              ) : error && !stats ? (
                <div className="text-center py-12 text-sm text-rose-600 dark:text-rose-400">
                  <p>{error}</p>
                  <p className="mt-2 text-xs opacity-70">
                    {strings.adminErrorHint || 'Compruebe que el servicio de datos esté disponible.'}
                  </p>
                </div>
              ) : !stats ? (
                <p className="text-sm text-ink-muted dark:text-slate-400">Sin datos disponibles.</p>
              ) : (
                <>
                  {/* Métricas Globales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {statCard(
                      <Users className="w-4 h-4" />,
                      'Total de votos registrados',
                      stats.totalVotos.toLocaleString('es-BO'),
                      'Suma de apoyos y desapoyos por artículo'
                    )}
                    {statCard(
                      <ThumbsUp className="w-4 h-4" />,
                      'Apoyos totales',
                      stats.capitulos.reduce((acc, c) => acc + c.likes, 0).toLocaleString('es-BO'),
                      'Votos "Me parece bien"'
                    )}
                    {statCard(
                      <ThumbsDown className="w-4 h-4" />,
                      'Desapoyos totales',
                      stats.capitulos.reduce((acc, c) => acc + c.dislikes, 0).toLocaleString('es-BO'),
                      'Votos "No me parece bien"'
                    )}
                  </div>

                  {/* Aprobación General */}
                  <div
                    className={`rounded-2xl border p-4 ${
                      isDark ? 'bg-navy-800 border-slate-700' : 'bg-cream-100 border-sand-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">
                        <CheckCircle2 className={`w-4 h-4 ${tema.adminCheck}`} />
                        {strings.adminAprobacionLabel || 'Aprobación General'}
                      </p>
                      <p className="text-xl font-bold text-ink dark:text-white font-display">
                        {stats.aprobacionGeneral !== null ? `${stats.aprobacionGeneral}%` : '—'}
                      </p>
                    </div>
                    <div className="mt-3 h-2.5 w-full rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${tema.adminProgreso}`}
                        style={{ width: `${stats.aprobacionGeneral ?? 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Filtro por Capítulo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted dark:text-slate-400">
                      <BarChart3 className={`w-3.5 h-3.5 ${tema.adminSelect}`} />
                      Desglose por Capítulo
                    </label>
                    <select
                      value={capituloId}
                      onChange={(e) => setCapituloId(Number(e.target.value))}
                      className={`w-full px-3 py-2 text-xs rounded-xl border bg-cream-100 dark:bg-navy-800 text-ink dark:text-white focus:outline-none focus:ring-2 transition-all ${
                        isDark ? 'border-slate-700' : 'border-sand-300'
                      } ${tema.adminFocus}`}
                    >
                      {stats.capitulos.map((c) => (
                        <option key={c.capituloId} value={c.capituloId}>
                          Capítulo {c.capituloRomano} — {c.titulo}
                        </option>
                      ))}
                    </select>

                    {capituloActual && (
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-muted dark:text-slate-400 px-1">
                        <span>
                          Aprobación promedio:{' '}
                          <strong className="text-ink dark:text-white">
                            {capituloActual.aprobacion !== null ? `${capituloActual.aprobacion}%` : '—'}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {capituloActual.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          {capituloActual.dislikes}
                        </span>
                        <span>{capituloActual.totalVotos} votos</span>
                      </div>
                    )}
                  </div>

                  {/* Tabla por Artículo */}
                  <div
                    className={`rounded-2xl border overflow-hidden ${
                      isDark ? 'bg-navy-800 border-slate-700' : 'bg-cream-100 border-sand-300'
                    }`}
                  >
                    <div className="px-4 py-2.5 border-b border-sand-300/60 dark:border-slate-700/60 text-[10px] font-bold uppercase tracking-widest text-ink-muted dark:text-slate-400">
                      Detalle por Artículo
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-xs">
                        <thead>
                          <tr
                            className={`text-[10px] uppercase tracking-wider ${
                              isDark ? 'text-slate-400 border-slate-700' : 'text-ink-muted border-sand-300'
                            } border-b`}
                          >
                            <th className="px-4 py-2 font-bold">Art.</th>
                            <th className="px-4 py-2 font-bold">Título</th>
                            <th className="px-4 py-2 font-bold text-center">
                              <span className="inline-flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Bien
                              </span>
                            </th>
                            <th className="px-4 py-2 font-bold text-center">
                              <span className="inline-flex items-center gap-1">
                                <ThumbsDown className="w-3 h-3 text-rose-600 dark:text-rose-400" /> No bien
                              </span>
                            </th>
                            <th className="px-4 py-2 font-bold w-40">Aprobación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {capituloActual?.articulos.map((a) => (
                            <tr
                              key={a.id}
                              className={`border-b last:border-b-0 ${
                                isDark ? 'border-slate-700/50' : 'border-sand-200'
                              }`}
                            >
                              <td className={`px-4 py-2.5 font-mono font-bold ${tema.adminCeldaNum}`}>
                                {a.numero}
                              </td>
                              <td className="px-4 py-2.5 text-ink dark:text-slate-200 leading-snug max-w-[18rem]">
                                {a.denominacion}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-emerald-700 dark:text-emerald-400">
                                {a.likes}
                              </td>
                              <td className="px-4 py-2.5 text-center font-mono text-rose-700 dark:text-rose-400">
                                {a.dislikes}
                              </td>
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 flex-1 rounded-full bg-cream-200 dark:bg-navy-900 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${
                                        a.aprobacion !== null && a.aprobacion >= 50
                                          ? tema.adminBarraOK
                                          : tema.adminBarraNO
                                      }`}
                                      style={{ width: `${a.aprobacion ?? 0}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-[10px] text-ink-muted dark:text-slate-400 w-9 text-right">
                                    {a.aprobacion !== null ? `${a.aprobacion}%` : '—'}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pie */}
            <div
              className={`shrink-0 border-t px-6 py-3 sm:px-8 ${
                isDark ? 'border-slate-800 bg-navy-950/50' : 'border-sand-200 bg-cream-100'
              }`}
            >
              <p className="text-[11px] leading-relaxed text-ink-muted dark:text-slate-500">
                {strings.adminFooter || 'Estadísticas del documento en tiempo real.'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}