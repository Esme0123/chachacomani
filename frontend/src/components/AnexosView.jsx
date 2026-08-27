import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Coins, AlertCircle, Info, Filter, CheckCircle2 } from 'lucide-react';

export default function AnexosView({ anexos, searchTerm, fontSize }) {
  const [filterCategory, setFilterCategory] = useState('all');

  return (
    <div className="space-y-10 pb-16">
      
      {/* Banner Explicativo de Delimitación */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-transparent border border-amber-500/30 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-ink-soft dark:text-slate-300 space-y-1">
            <p className="font-bold text-amber-600 dark:text-amber-400 text-sm">
              Anexos Normativos Oficiales (Páginas 58 a 63)
            </p>
            <p>
              Conforme a la delimitación formal, este módulo contiene el <strong>ANEXO I</strong> (Escala de Multas y Medidas Disciplinarias) y <strong>ANEXO II</strong> (Escala de Aportes al Fondo de Accidentes), de cumplimiento normativo vinculante.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ANEXO I: ESCALA DE MULTAS */}
      <section id="anexo-I" className="space-y-6 scroll-mt-20">
        <div className="flex items-center gap-3 pb-3 border-b border-sand-300 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/40">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Normativa Sancionatoria</span>
            <h2 className="text-xl md:text-2xl font-bold text-ink dark:text-white font-display">
              ANEXO I: Escala de Multas y Medidas Disciplinarias
            </h2>
          </div>
        </div>

        {/* Nota introductoria */}
        <div className="p-4 rounded-xl bg-cream-100 dark:bg-navy-950 border border-sand-300 dark:border-slate-800 text-xs text-ink-muted dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-ink-soft dark:text-slate-200">Disposición Transitoria (Art. 100): </span>
          Mientras la Cooperativa no alcance producción regular, todas las sanciones pecuniarias se fijan y pagan en bolivianos (Bs.); una vez regularizada la producción, la Asamblea General podrá resolver su conversión equivalente a gramos de oro físico.
        </div>

        {/* Cuadro N° 1: Clasificación General */}
        <div className="bg-ivory dark:bg-navy-900 rounded-2xl border border-sand-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-cream-100 dark:bg-slate-800/60 border-b border-sand-300 dark:border-slate-800 font-bold text-sm text-ink dark:text-slate-100 flex items-center justify-between">
            <span>Cuadro N.º 1: Clasificación de Faltas y Escala General de Sanciones</span>
            <span className="text-xs font-normal text-amber-500">Arts. 72, 73, 75</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream-100/70 dark:bg-slate-800/40 text-ink-muted dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-sand-300 dark:border-slate-800">
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Descripción / Alcance</th>
                  <th className="p-3.5">Referencia</th>
                  <th className="p-3.5 text-right">Sanción / Multa (Bs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/70 dark:divide-slate-800 text-ink-soft dark:text-slate-300">
                <tr className="hover:bg-cream-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Falta Leve</td>
                  <td className="p-3.5">Conductas del Art. 72.II, incisos a) al h). Retrasos, faltas semanales, abandono momentáneo.</td>
                  <td className="p-3.5 font-mono text-slate-400">Art. 72. II</td>
                  <td className="p-3.5 text-right font-medium">1ª vez: Amonestación escrita<br/>2ª vez: Bs. 100.- | 3ª vez: Bs. 150.-</td>
                </tr>
                <tr className="hover:bg-cream-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-amber-600 dark:text-amber-400">Falta Grave</td>
                  <td className="p-3.5">Conductas del Art. 72.III, incisos a) al n). Reincidencias, inasistencia a Asambleas, ebriedad o altercados.</td>
                  <td className="p-3.5 font-mono text-slate-400">Art. 72.III</td>
                  <td className="p-3.5 text-right font-bold text-amber-600 dark:text-amber-400">Bs. 300.-</td>
                </tr>
                <tr className="hover:bg-cream-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-rose-600 dark:text-rose-400">Falta Muy Grave</td>
                  <td className="p-3.5">Conductas del Art. 72.IV, incisos a) al f). Remisión obligatoria al Tribunal de Honor; sumario de exclusión o expulsión.</td>
                  <td className="p-3.5 font-mono text-slate-400">Art. 72. IV</td>
                  <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">Hasta Bs. 500.- (+ Proceso Penal/Expulsión)</td>
                </tr>
                <tr className="hover:bg-cream-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-purple-600 dark:text-purple-400">Reincidencia General</td>
                  <td className="p-3.5">Comisión de nueva falta de igual o mayor categoría dentro de los doce (12) meses siguientes.</td>
                  <td className="p-3.5 font-mono text-slate-400">Art. 72 / 75</td>
                  <td className="p-3.5 text-right font-bold text-purple-600 dark:text-purple-400">Monto máximo de categoría</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Cuadro N° 2: Infracciones Específicas Detalladas */}
        <div className="bg-ivory dark:bg-navy-900 rounded-2xl border border-sand-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-cream-100 dark:bg-slate-800/60 border-b border-sand-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-ink dark:text-slate-100">
                Cuadro N.º 2: Infracciones Específicas, Multas y Medidas Complementarias
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Arancel estandarizado para socios, directivos y personal operativo.</p>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex items-center gap-1 bg-cream-200 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterCategory === 'all' ? 'bg-amber-500 text-navy-950 font-bold' : 'text-ink-muted dark:text-slate-400'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterCategory('Leve')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterCategory === 'Leve' ? 'bg-emerald-500 text-white font-bold' : 'text-ink-muted dark:text-slate-400'
                }`}
              >
                Leves
              </button>
              <button
                onClick={() => setFilterCategory('Grave')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterCategory === 'Grave' ? 'bg-amber-500 text-navy-950 font-bold' : 'text-ink-muted dark:text-slate-400'
                }`}
              >
                Graves
              </button>
              <button
                onClick={() => setFilterCategory('Muy grave')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterCategory === 'Muy grave' ? 'bg-rose-500 text-white font-bold' : 'text-ink-muted dark:text-slate-400'
                }`}
              >
                Muy Graves
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[550px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 z-10 bg-cream-100 dark:bg-navy-950 shadow-sm">
                <tr className="text-ink-muted dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-sand-300 dark:border-slate-800">
                  <th className="p-3.5">Infracción Tipificada</th>
                  <th className="p-3.5">Artículo</th>
                  <th className="p-3.5 text-center">Multa (Bs.)</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Medida Complementaria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/70 dark:divide-slate-800 text-ink-soft dark:text-slate-300">
                {anexos[0]?.tablas[1]?.filas
                  .filter((f) => filterCategory === 'all' || f.categoria.toLowerCase().includes(filterCategory.toLowerCase()))
                  .map((fila, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/5 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-medium text-ink dark:text-slate-100">{fila.infraccion}</td>
                      <td className="p-3.5 font-mono text-amber-600 dark:text-amber-400 whitespace-nowrap">{fila.articulo}</td>
                      <td className="p-3.5 text-center font-bold text-ink dark:text-white whitespace-nowrap">
                        {fila.multa !== '—' ? (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
                            {fila.multa}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          fila.categoria.includes('Leve') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                          fila.categoria.includes('Grave') && !fila.categoria.includes('Muy') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          fila.categoria.includes('Consejeros') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        }`}>
                          {fila.categoria}
                        </span>
                      </td>
                      <td className="p-3.5 text-ink-muted dark:text-slate-400">{fila.medida}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ANEXO II: ESCALA DE APORTES */}
      <section id="anexo-II" className="space-y-6 pt-6 scroll-mt-20">
        <div className="flex items-center gap-3 pb-3 border-b border-sand-300 dark:border-slate-800">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/40">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Fondo de Contingencias</span>
            <h2 className="text-xl md:text-2xl font-bold text-ink dark:text-white font-display">
              ANEXO II: Escala de Aportes al Fondo de Accidentes
            </h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-cream-100 dark:bg-navy-950 border border-sand-300 dark:border-slate-800 text-xs text-ink-muted dark:text-slate-400 leading-relaxed">
          <span className="font-bold text-ink-soft dark:text-slate-200">Marco Operativo (Art. 13): </span>
          Los recursos del Fondo se destinan exclusivamente al auxilio económico inmediato ante accidentes laborales de socias y socios. Administrado por Tesorería y fiscalizado por el Consejo de Vigilancia.
        </div>

        <div className="bg-ivory dark:bg-navy-900 rounded-2xl border border-sand-300 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-cream-100 dark:bg-slate-800/60 border-b border-sand-300 dark:border-slate-800 font-bold text-sm text-ink dark:text-slate-100">
            Escala de Aportes y Modalidades de Recaudación
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-cream-100/70 dark:bg-slate-800/40 text-ink-muted dark:text-slate-400 uppercase font-semibold text-[11px] border-b border-sand-300 dark:border-slate-800">
                  <th className="p-3.5">Concepto</th>
                  <th className="p-3.5">Periodicidad / Hecho Generador</th>
                  <th className="p-3.5 text-right">Monto (Bs.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200/70 dark:divide-slate-800 text-ink-soft dark:text-slate-300">
                {anexos[1]?.tablas[0]?.filas.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-semibold text-ink dark:text-slate-100">{item.concepto}</td>
                    <td className="p-3.5 text-ink-muted dark:text-slate-400">{item.periodicidad}</td>
                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {item.monto !== '—' ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                          {item.monto}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
