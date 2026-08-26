import React from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Shield, Scale, Tag } from 'lucide-react';

export default function ArticleCard({
  article,
  chapterRoman,
  chapterTitle,
  searchTerm,
  fontSize,
  index
}) {
  // Función para resaltar coincidencias de búsqueda
  const highlightSearch = (text, query) => {
    if (!query || !text) return text;
    
    // Escapar caracteres especiales de regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark
          key={i}
          className="bg-amber-300 dark:bg-amber-500/40 text-slate-900 dark:text-amber-200 px-1 py-0.5 rounded font-semibold transition-all"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      id={`art-${article.numero}`}
      className="p-6 md:p-8 bg-white dark:bg-navy-900/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-gold-glow/20 transition-all duration-300 relative overflow-hidden group"
    >
      {/* Acento dorado superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Cabecera del Artículo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-sm">
            {article.numero}
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-wider uppercase">
              Artículo {article.numero}
            </span>
            <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
              {highlightSearch(article.denominacion, searchTerm)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg">
          <Scale className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono">Cap. {chapterRoman}</span>
        </div>
      </div>

      {/* Contenido Textual con soporte de párrafos y listas */}
      <div
        className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-3"
        style={{ fontSize: `${fontSize}px` }}
      >
        {article.contenido.split('\n\n').map((paragraph, pIdx) => {
          // Si contiene saltos de línea simples dentro del párrafo (listas o incisos)
          const lines = paragraph.split('\n');
          return (
            <div key={pIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                const isSubItem = /^[a-z]\)|^[I|V|X]+\.|\•|^\d+\./i.test(line.trim());
                return (
                  <p
                    key={lIdx}
                    className={`${
                      isSubItem
                        ? 'pl-4 border-l-2 border-amber-500/30 dark:border-amber-500/40 text-slate-800 dark:text-slate-200'
                        : ''
                    }`}
                  >
                    {highlightSearch(line, searchTerm)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer del Artículo */}
      <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Texto Oficial Aprobado
        </span>
        <span className="font-mono text-slate-500">
          Ref: Coop. Min. Nevado Chachacomani
        </span>
      </div>
    </motion.article>
  );
}
