import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion';
import { X, Gavel, Save, AlertTriangle, Search } from 'lucide-react';
import * as multasService from '../services/multasService.js';

/**
 * ============================================================================
 *  MODAL: «Llenar Formulario / Registrar Multa» — Anexo I
 * ============================================================================
 *  Permite al Tesorero (y al Administrador) imputar una multa a un socio
 *  eligiendo la infracción en el catálogo unificado del Anexo I:
 *
 *  · Cuadro N.º 1 — categorías de falta (Leve / Grave / Muy Grave) con su
 *    escala general; el monto lo fija el nivel que elija el Tesorero
 *    (1.ª vez, 2.ª vez, 3.ª vez…).
 *  · Cuadro N.º 2 — infracciones tipificadas con artículo, medida
 *    complementaria y monto propio, que se autocompletan al seleccionarlas.
 *
 *  El selector de socios lo resuelve el backend: `GET /api/multas` devuelve, en
 *  `socios`, el padrón de socios activos (id, nombre, correo y rol) para quien
 *  tenga `multas:gestionar`. Así el Tesorero no necesita `usuarios:gestionar`,
 *  que es exclusivo del Administrador. El guardado es `POST /api/multas`.
 */
export default function ModalMulta({ isOpen, onClose, tema, isDark, socios = [] }) {
  const [infracciones, setInfracciones] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [filtroSocio, setFiltroSocio] = useState('');
  const [seleccion, setSeleccion] = useState(null);
  const [nivel, setNivel] = useState(null);
  const [form, setForm] = useState({
    socioId: '',
    categoria: '',
    monto: '',
    fechaInfraccion: new Date().toISOString().slice(0, 10),
    medida: '',
    observaciones: '',
  });
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [guardando, setGuardando] = useState(false);

  /**
   * Catálogo unificado de infracciones del Anexo I (Cuadros N.º 1 y 2) con la
   * misma forma para ambas tablas, de modo que el formulario itere una sola
   * lista. `niveles` viene vacío cuando el monto ya es propio de la fila
   * (Cuadro N.º 2) y con la escala de la categoría cuando el monto depende de
   * la reincidencia (Cuadro N.º 1).
   */
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setExito(null);

    const tabla = (id) => tema?.tablas?.find((t) => t.id === id);
    const categorias = (tabla('cuadro-1')?.filas || [])
      // «Reincidencia general» no es una falta sino la regla de repetir el monto
      // máximo de la categoría ya sancionada (Art. 72 / 75); se cubre eligiendo
      // esa misma categoría en su nivel máximo, así que no es una opción propia.
      .filter((fila) => !/reincidencia/i.test(fila.categoria || ''))
      .map((fila) => {
        const categoria = multasService.normalizarCategoria(fila.categoria);
        return {
          clave: `c1:${fila.categoria}`,
          grupo: 'Cuadro N.º 1 · Categorías y escala general',
          origen: 1,
          infraccion: fila.descripcion,
          articulo: fila.referencia,
          categoria,
          niveles: multasService.ESCALA_MULTAS[categoria] || [],
          monto: null,
          montoTexto: fila.multa,
          medida: '',
        };
      });

    const tipificadas = (tabla('cuadro-2')?.filas || []).map((fila, i) => {
      const montoFila = multasService.extraerMonto(fila.multa);
      return {
        clave: `c2:${i}`,
        grupo: 'Cuadro N.º 2 · Infracciones tipificadas',
        origen: 2,
        infraccion: fila.infraccion,
        articulo: fila.articulo,
        categoria: multasService.normalizarCategoria(fila.categoria, montoFila),
        niveles: [],
        monto: montoFila === null ? 0 : montoFila,
        montoTexto: fila.multa,
        medida: fila.medida && fila.medida !== '—' ? fila.medida : '',
      };
    });

    setInfracciones([...categorias, ...tipificadas]);
  }, [isOpen, tema]);

  const filtradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return infracciones;
    return infracciones.filter(
      (f) =>
        f.infraccion.toLowerCase().includes(q) ||
        String(f.articulo).toLowerCase().includes(q) ||
        f.categoria.toLowerCase().includes(q)
    );
  }, [filtro, infracciones]);

  /** Agrupa las coincidencias por cuadro para poder rotular cada bloque. */
  const grupos = useMemo(() => {
    const bloques = new Map();
    filtradas.forEach((item) => {
      if (!bloques.has(item.grupo)) bloques.set(item.grupo, []);
      bloques.get(item.grupo).push(item);
    });
    return [...bloques.entries()].map(([nombre, items]) => ({ nombre, items }));
  }, [filtradas]);

  /** Socios que coinciden con el buscador del formulario. */
  const sociosFiltrados = useMemo(() => {
    const q = filtroSocio.trim().toLowerCase();
    if (!q) return socios;
    return socios.filter(
      (s) =>
        String(s.nombre || '').toLowerCase().includes(q) ||
        String(s.correo || '').toLowerCase().includes(q)
    );
  }, [filtroSocio, socios]);

  // Al elegir una infracción se precompletan categoría, monto y medida.
  //
  // El monto por defecto es el del PROPIO Cuadro N.º 2 cuando la fila lo trae
  // (p. ej. la inasistencia injustificada al trabajo son "150 Bs." aunque su
  // categoría sea Leve y la escala general del Art. 72.II imponga amonestación
  // en la primera vez). Usar la escala general ahí grabaría un monto que
  // contradice el cuadro oficial. Sólo cuando la fila viene del Cuadro N.º 1 el
  // monto depende de la reincidencia, y entonces se elige el nivel de la escala.
  const elegirInfraccion = (item) => {
    setSeleccion(item);
    setExito(null);
    // En el Cuadro N.º 1 el monto SIEMPRE sale de la escala de la categoría
    // (aunque la escala tenga un único nivel, como en Grave y Muy Grave), así
    // que se preselecciona el nivel por defecto y se pinta como activo.
    const conEscala = item.origen === 1 && item.niveles.length > 0;
    const nivelInicial = conEscala ? item.niveles[0] : null;
    setNivel(nivelInicial);
    setForm((f) => ({
      ...f,
      categoria: item.categoria,
      monto: String(conEscala ? nivelInicial.monto : item.monto),
      medida: item.medida,
    }));
  };

  /** Fija el monto según el nivel elegido en la escala general (Cuadro N.º 1). */
  const elegirNivel = (n) => {
    setNivel(n);
    setError(null);
    setForm((f) => ({ ...f, monto: String(n.monto) }));
  };

  /**
   * Escala general de la categoría seleccionada (Cuadro N.º 1). Si la elección
   * vino del propio Cuadro N.º 1 sus niveles fijan el monto; si vino de una
   * infracción tipificada son sólo referencia y se muestran como texto, para no
   * temptar al Tesorero de sustituir el monto propio de la fila.
   */
  const escalaCategoria = useMemo(() => {
    if (!seleccion) return null;
    return {
      origen: seleccion.origen,
      categoria: seleccion.categoria,
      niveles:
        seleccion.niveles.length > 0
          ? seleccion.niveles
          : multasService.ESCALA_MULTAS[seleccion.categoria] || [],
    };
  }, [seleccion]);

  const guardar = async (e) => {
    e.preventDefault();
    if (guardando) return;
    setError(null);
    setExito(null);

    if (!seleccion) {
      setError('Seleccione la infracción del Cuadro N.º 1 o N.º 2.');
      return;
    }
    if (!form.socioId) {
      setError('Seleccione el socio al que se imputa la multa.');
      return;
    }
    if (form.monto === '' || Number(form.monto) < 0) {
      setError('Indique el monto en bolivianos (0 si la sanción no es pecuniaria).');
      return;
    }

    setGuardando(true);
    try {
      const json = await multasService.registrarMulta({
        socioId: Number(form.socioId),
        infraccion: seleccion.infraccion,
        articulo: seleccion.articulo,
        categoria: form.categoria || multasService.normalizarCategoria(seleccion.categoria),
        monto: Number(form.monto),
        fechaInfraccion: form.fechaInfraccion,
        medida: form.medida,
        observaciones: form.observaciones,
      });
      setExito(json?.mensaje || 'Multa registrada correctamente.');
      setForm({
        socioId: form.socioId,
        categoria: '',
        monto: '',
        fechaInfraccion: new Date().toISOString().slice(0, 10),
        medida: '',
        observaciones: '',
      });
      setSeleccion(null);
      setNivel(null);
      setFiltro('');
    } catch (err) {
      setError(err?.message || 'No se pudo registrar la multa.');
    } finally {
      setGuardando(false);
    }
  };

  if (!isOpen) return null;

  const input =
    'w-full rounded-lg px-3 py-2 font-mono text-xs text-[#0D0B61] dark:text-white bg-slate-50 dark:bg-[#294669]/40 border border-[#294669]/25 dark:border-[#476EAE]/55 focus:outline-none focus:border-[#48B3AF]';
  const label =
    'font-display font-semibold text-[#294669] dark:text-[#48B3AF] text-[10px] tracking-widest block mb-1';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label="Registrar Multa"
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[#294669]/25 dark:border-[#294669]/50 bg-white dark:bg-[#0D0B61] shadow-2xl"
      >
        {/* Cabecera */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 border-b border-[#294669]/20 dark:border-[#294669]/40 bg-white dark:bg-[#0D0B61]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/40">
              <Gavel className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-sm text-[#0D0B61] dark:text-white">
                Llenar Formulario / Registrar Multa
              </h2>
              <p className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                Anexo I · Cuadros N.º 1 y 2 — Escala e infracciones tipificadas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-[#294669] dark:text-slate-300 hover:bg-[#294669]/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={guardar} className="p-5 space-y-5">
          {/* 1. Socio — padrón cargado por el backend (`GET /api/multas`). El
              buscador filtra por nombre o correo para no recorrer una lista larga. */}
          <div>
            <label htmlFor="multa-socio-filtro" className={label}>SOCIO SANCIONADO</label>
            {socios.length === 0 ? (
              <p className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
                No se pudo cargar el listado de socios. Verifique su sesión e intente de nuevo.
              </p>
            ) : (
              <>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#294669]/50 dark:text-[#476EAE]" />
                  <input
                    id="multa-socio-filtro"
                    type="text"
                    value={filtroSocio}
                    onChange={(e) => setFiltroSocio(e.target.value)}
                    placeholder="Buscar socio por nombre o correo…"
                    className={`${input} pl-8`}
                  />
                </div>
                <select
                  id="multa-socio"
                  value={form.socioId}
                  onChange={(e) => { setForm(f => ({ ...f, socioId: e.target.value })); setError(null); }}
                  className={`${input} mt-2`}
                  required
                >
                  <option value="">— Seleccione un socio —</option>
                  {sociosFiltrados.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.correo}){s.rol ? ` · ${s.rol}` : ''}
                    </option>
                  ))}
                </select>
                {filtroSocio.trim() !== '' && sociosFiltrados.length === 0 && (
                  <p className="mt-1 font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                    Ningún socio coincide con «{filtroSocio.trim()}».
                  </p>
                )}
              </>
            )}
          </div>

          {/* 2. Catálogo de infracciones (Cuadro N.º 1 y N.º 2) */}
          <div>
            <label htmlFor="multa-buscar" className={label}>INFRACCIÓN (CUADRO N.º 1 Y N.º 2)</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#294669]/50 dark:text-[#476EAE]" />
              <input
                id="multa-buscar"
                type="text"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Buscar por infracción, artículo o categoría (ej. inasistencia, Art. 41, grave)…"
                className={`${input} pl-8`}
              />
            </div>

            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-[#294669]/15 dark:border-[#294669]/35">
              <table className="w-full text-left text-[11px] border-collapse">
                <tbody className="divide-y divide-[#294669]/10 dark:divide-[#294669]/25">
                  {filtradas.length === 0 ? (
                    <tr>
                      <td className="p-3 text-center font-mono text-[#294669]/60 dark:text-[#476EAE]">
                        Ninguna infracción coincide con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    grupos.flatMap((grupo) => [
                      <tr key={`cab-${grupo.nombre}`} className="bg-[#294669]/5 dark:bg-[#294669]/25">
                        <td
                          colSpan={3}
                          className="px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-[#294669]/70 dark:text-[#48B3AF]"
                        >
                          {grupo.nombre}
                        </td>
                      </tr>,
                      ...grupo.items.map((item) => (
                        <tr
                          key={item.clave}
                          onClick={() => elegirInfraccion(item)}
                          aria-selected={seleccion === item}
                          className={`cursor-pointer transition-colors ${
                            seleccion === item
                              ? 'bg-amber-500/15'
                              : 'hover:bg-[#294669]/5 dark:hover:bg-[#294669]/25'
                          }`}
                        >
                          <td className="p-2.5 text-[#0D0B61] dark:text-slate-200">
                            {item.infraccion}
                            {item.origen === 1 && (
                              <span className="block font-mono text-[9px] uppercase text-[#48B3AF]">
                                {item.categoria}
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 font-mono text-[#48B3AF] whitespace-nowrap align-top">{item.articulo}</td>
                          <td
                            className={`p-2.5 text-right font-bold whitespace-nowrap align-top ${
                              item.origen === 1
                                ? 'font-mono text-[9px] font-normal text-[#294669]/70 dark:text-slate-400'
                                : 'text-[#0D0B61] dark:text-white'
                            }`}
                          >
                            {item.montoTexto}
                          </td>
                        </tr>
                      )),
                    ])
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Escala general de la categoría (Cuadro N.º 1). En las categorías
              del Cuadro N.º 1 estos botones fijan el monto; en una infracción
              tipificada son sólo referencia. */}
          {escalaCategoria && (
            <div>
              <span className={label}>ESCALA GENERAL DE LA CATEGORÍA (CUADRO N.º 1)</span>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-block px-2.5 py-1 rounded-lg font-display font-semibold text-[10px] uppercase bg-[#294669]/10 text-[#294669] dark:bg-[#294669]/45 dark:text-[#48B3AF] border border-[#294669]/20 dark:border-[#476EAE]/45">
                  {escalaCategoria.categoria}
                </span>
                {escalaCategoria.niveles.map((n) => {
                  const activo = nivel?.veces === n.veces;
                  // Sólo son botones cuando el monto depende de la reincidencia
                  // (categoría elegida en el Cuadro N.º 1).
                  if (escalaCategoria.origen !== 1) {
                    return (
                      <span
                        key={n.veces}
                        className="px-2.5 py-1 rounded-lg font-mono text-[10px] bg-slate-100 dark:bg-[#294669]/30 text-[#294669]/80 dark:text-slate-300"
                      >
                        {n.etiqueta}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={n.veces}
                      type="button"
                      onClick={() => elegirNivel(n)}
                      aria-pressed={activo}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[10px] transition-colors border ${
                        activo
                          ? 'border-amber-500/50 bg-amber-500/15 text-[#0D0B61] dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-[#294669]/30 text-[#294669]/80 dark:text-slate-300 border-transparent hover:border-[#294669]/20'
                      }`}
                    >
                      {n.etiqueta}
                    </button>
                  );
                })}
                <span className="font-mono text-[10px] text-[#294669]/70 dark:text-[#476EAE]">
                  El monto queda editable y puede ajustarse si procede.
                </span>
              </div>
            </div>
          )}

          {/* 4. Monto, fecha y medidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="multa-monto" className={label}>MONTO (Bs.)</label>
              <input
                id="multa-monto"
                type="number"
                min="0"
                step="0.01"
                value={form.monto}
                onChange={(e) => { setForm(f => ({ ...f, monto: e.target.value })); setError(null); }}
                className={input}
                required
              />
            </div>
            <div>
              <label htmlFor="multa-fecha" className={label}>FECHA DE INFRACCIÓN</label>
              <input
                id="multa-fecha"
                type="date"
                value={form.fechaInfraccion}
                onChange={(e) => setForm(f => ({ ...f, fechaInfraccion: e.target.value }))}
                className={input}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="multa-medida" className={label}>MEDIDA COMPLEMENTARIA</label>
              <input
                id="multa-medida"
                type="text"
                value={form.medida}
                onChange={(e) => setForm(f => ({ ...f, medida: e.target.value }))}
                placeholder="Ej. Amonestación escrita, suspensión preventiva…"
                className={input}
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="multa-obs" className={label}>OBSERVACIONES</label>
              <textarea
                id="multa-obs"
                rows={2}
                value={form.observaciones}
                onChange={(e) => setForm(f => ({ ...f, observaciones: e.target.value }))}
                placeholder="Antecedente, acta o resolución del Consejo de Administración…"
                className={`${input} resize-y`}
              />
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="font-mono text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
            </div>
          )}
          {exito && (
            <p role="status" className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              {exito}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-display font-semibold text-xs border border-[#294669]/25 dark:border-[#476EAE]/55 text-[#294669] dark:text-slate-300 hover:bg-[#294669]/8"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg font-display font-bold text-xs text-white disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg,#E4A11B,#C0392B)' }}
            >
              <Save className="w-3.5 h-3.5" />
              {guardando ? 'Registrando…' : 'Registrar Multa'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
