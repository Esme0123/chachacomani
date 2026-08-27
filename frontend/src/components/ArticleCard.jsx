import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, BookMarked } from 'lucide-react';

const ArticleCard = forwardRef(function ArticleCard({
  article,
  chapterRoman,
  chapterTitle,
  searchTerm,
  fontSize,
  index
}, ref) {
  // Función para resaltar coincidencias de búsqueda
  const highlightSearch = (text, query) => {
    if (!query || !text) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-gold-300 dark:bg-gold-500/40 text-ink dark:text-gold-200 px-1 py-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const isSubItem = (line) => /^[a-z]\)|^[I|V|X]+\.|\•|^\d+\./i.test(line.trim());

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      id={`art-${article.numero}`}
      className="group relative p-6 md:p-8 rounded-3xl bg-ivory dark:bg-navy-900/80 border border-sand-300 dark:border-slate-800 shadow-cream-soft dark:shadow-none transition-all duration-300"
    >
      {/* Filete dorado ornamental que se revela al pasar el cursor */}
      <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent via-gold-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Cabecera del Artículo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-sand-300/60 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/10 dark:bg-gold-500/15 border border-gold-500/40 flex items-center justify-center text-gold-600 dark:text-gold-400 font-bold text-sm font-display shadow-gold-glow/30">
            {article.numero}
          </div>
          <div>
            <span className="text-[11px] font-bold text-gold-600 dark:text-gold-400 tracking-widest uppercase font-sans">
              Artículo {article.numero}
            </span>
            <h3 className="font-serif text-base md:text-lg font-semibold text-ink dark:text-slate-100 leading-snug mt-0.5">
              {highlightSearch(article.denominacion, searchTerm)}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-ink-muted dark:text-slate-400 bg-cream-100 dark:bg-navy-800/80 px-2.5 py-1 rounded-lg border border-sand-300/60 dark:border-navy-700">
          <Scale className="w-3.5 h-3.5 text-gold-500" />
          <span className="font-mono">Cap. {chapterRoman}</span>
        </div>
      </div>

      {/* Contenido Textual — párrafos seleccionables (sel-paragraph) */}
      <div
        className="font-serif leading-[1.85] text-ink-soft dark:text-slate-300 space-y-3 sel-text"
        style={{ fontSize: `${fontSize}px` }}
      >
        {article.contenido.split('\n\n').map((paragraph, pIdx) => {
          const lines = paragraph.split('\n');
          return (
            <div key={pIdx} className="space-y-2">
              {lines.map((line, lIdx) => (
                <p
                  key={lIdx}
                  className={`sel-paragraph ${
                    isSubItem(line)
                      ? 'pl-4 border-l-2 border-gold-400/50 dark:border-gold-500/50 text-ink dark:text-slate-200'
                      : ''
                  }`}
                >
                  {highlightSearch(line, searchTerm)}
                </p>
              ))}
            </div>
          );
        })}
      </div>

      {/* Footer del Artículo */}
      <div className="mt-5 pt-4 border-t border-sand-300/60 dark:border-navy-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-ink-muted dark:text-slate-500">
        <span className="flex items-center gap-1.5">
          <BookMarked className="w-3.5 h-3.5 text-gold-600 dark:text-gold-500" />
          Texto Oficial Aprobado
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-500 animate-subtle-pulse" />
          Coop. Min. Nevado Chachacomani
        </span>
      </div>
    </motion.article>
  );
});

export default ArticleCard;
ArticleCard.displayName = 'ArticleCard';