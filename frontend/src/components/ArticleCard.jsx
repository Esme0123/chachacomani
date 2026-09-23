import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Scale, BookMarked, Volume2, ThumbsUp, ThumbsDown, LockKeyhole } from 'lucide-react';
import { temaReglamento } from '../theme/lecturaTemas';

const ArticleCard = forwardRef(function ArticleCard({
  article,
  chapterRoman,
  chapterTitle,
  searchTerm,
  fontSize,
  index,
  chapterId,
  readId,
  isReading,
  onListenArticle,
  voto,
  onVotar,
  tema = temaReglamento
}, ref) {
  // Función para resaltar coincidencias de búsqueda
  const highlightSearch = (text, query) => {
    if (!query || !text) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className={`px-1 py-0.5 rounded font-semibold ${tema.resaltadoBusqueda}`}>
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
      data-read-id={readId}
      id={readId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.4) }}
      className={`group relative p-6 md:p-8 rounded-3xl transition-all duration-300 ${tema.tarjetaFondo} ${
        isReading
          ? tema.lectAutoActiva
          : `border border-sand-300 dark:border-navy-700 shadow-sm ${tema.tarjetaHoverBorde}`
      }`}
    >
      {/* Filete ornamental que se revela al pasar el cursor */}
      <div className={`absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tema.fileteH}`} />
      <div className={`absolute left-0 top-8 bottom-8 w-px bg-gradient-to-b from-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tema.fileteV}`} />

      {/* Etiqueta de lectura activa */}
      {isReading && (
        <motion.span
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${tema.etiquetaLeyendo}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          🔊 Leyendo ahora...
        </motion.span>
      )}

      {/* Cabecera del Artículo */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-sand-300/60 dark:border-navy-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-bold text-sm font-display shadow-gold-glow/30 ${tema.numeroChip}`}>
            {article.numero}
          </div>
          <div>
            <span className={`text-[11px] font-bold tracking-widest uppercase font-sans ${tema.etiquetaArticulo}`}>
              Artículo {article.numero}
            </span>
            <h3 className="font-serif text-base md:text-lg font-semibold text-ink dark:text-slate-100 leading-snug mt-0.5">
              {highlightSearch(article.denominacion, searchTerm)}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onListenArticle?.(article, chapterId)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors text-[11px] font-semibold ${tema.btnEscuchar}`}
            title="Escuchar este artículo con el Casquito Minero"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Escuchar Artículo
          </button>
          <div className="flex items-center gap-2 text-xs text-ink-muted dark:text-slate-400 bg-cream-100 dark:bg-navy-800/80 px-2.5 py-1 rounded-lg border border-sand-300/60 dark:border-navy-700">
            <Scale className={`w-3.5 h-3.5 ${tema.capBadgeIcono}`} />
            <span className="font-mono">Cap. {chapterRoman}</span>
          </div>
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
                      ? `pl-4 ${tema.lineaSubitem} text-ink dark:text-slate-200`
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
          <BookMarked className={`w-3.5 h-3.5 ${tema.bookmarkIcono}`} />
          Texto Oficial Aprobado
        </span>
        <span className="flex items-center gap-1.5 font-mono">
          <span className={`inline-block w-1.5 h-1.5 rounded-full animate-subtle-pulse ${tema.puntoEstado}`} />
          Coop. Min. Nevado Chachacomani
        </span>
      </div>

      {/* Barra de Evaluación del Artículo */}
      <div className="mt-4 pt-4 border-t border-sand-300/60 dark:border-navy-800/80 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold text-ink-muted dark:text-slate-400">
          ¿Qué te parece este artículo?
        </p>

        {/* Insignia de artículo ya evaluado (anti-spam) */}
        {voto?.userVote && (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold ${tema.votoInsignia}`}>
            <LockKeyhole className="w-3 h-3" />
            Ya evaluaste este artículo ({voto.userVote === 'positivo' ? '👍' : '👎'})
          </span>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => !voto?.userVote && onVotar?.(article.id, 'positivo')}
            disabled={!!voto?.userVote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              voto?.userVote === 'positivo'
                ? 'bg-emerald-500/15 border-emerald-500/60 text-emerald-700 dark:text-emerald-400'
                : voto?.userVote
                  ? 'opacity-40 cursor-not-allowed pointer-events-none bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400/70'
                  : 'bg-emerald-500/5 border-emerald-500/30 text-emerald-700 dark:text-emerald-400/90 hover:bg-emerald-500/15'
            }`}
            title={voto?.userVote ? 'Ya evaluaste este artículo' : 'Me parece bien'}
            aria-disabled={!!voto?.userVote}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            Me parece bien
            {voto?.likes > 0 && <span className="font-mono opacity-80">{voto.likes}</span>}
          </button>
          <button
            onClick={() => !voto?.userVote && onVotar?.(article.id, 'negativo')}
            disabled={!!voto?.userVote}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all ${
              voto?.userVote === 'negativo'
                ? 'bg-rose-500/15 border-rose-500/60 text-rose-700 dark:text-rose-400'
                : voto?.userVote
                  ? 'opacity-40 cursor-not-allowed pointer-events-none bg-rose-500/5 border-rose-500/30 text-rose-700 dark:text-rose-400/70'
                  : 'bg-rose-500/5 border-rose-500/30 text-rose-700 dark:text-rose-400/90 hover:bg-rose-500/15'
            }`}
            title={voto?.userVote ? 'Ya evaluaste este artículo' : 'No me parece bien'}
            aria-disabled={!!voto?.userVote}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            No me parece bien
            {voto?.dislikes > 0 && <span className="font-mono opacity-80">{voto.dislikes}</span>}
          </button>
        </div>
      </div>
    </motion.article>
  );
});

export default ArticleCard;
ArticleCard.displayName = 'ArticleCard';