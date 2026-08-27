import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlighter, Headphones } from 'lucide-react';

/**
 * SelectionTooltip — Pop-up contextual flotante sobre la selección de texto.
 * Solo actúa si la selección vive dentro de un elemento .sel-paragraph.
 * Ofrece dos acciones: "Resaltar/Quitar resaltado" (alterna el marcador sin
 * anidar etiquetas HTML) y "Escuchar Selección" (TTS).
 */
export default function SelectionTooltip({ onListen, showToast }) {
  const [range, setRange] = useState(null);
  const [rect, setRect] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const tooltipRef = useRef(null);
  const lastText = useRef('');

  const isSelectionValid = useCallback((sel) => {
    if (!sel || sel.isCollapsed) return false;
    // La selección debe estar estrictamente dentro de la lectura (párrafo normativo)
    if (!(sel.anchorNode instanceof HTMLElement) && sel.anchorNode?.nodeType === Node.TEXT_NODE) {
      const el = sel.anchorNode.parentElement;
      return !!el?.closest?.('.sel-paragraph');
    }
    return !!sel.anchorNode?.closest?.('.sel-paragraph');
  }, []);

  // Detecta si la selección cae dentro o sobre un marcador .hl-user ya aplicado
  const hasHighlight = useCallback((r) => {
    const candidates = [r.startContainer, r.endContainer, r.commonAncestorContainer];
    for (const c of candidates) {
      if (!c) continue;
      const el = c.nodeType === Node.TEXT_NODE ? c.parentElement : c;
      if (el?.closest?.('.hl-user')) return true;
    }
    return false;
  }, []);

  // Recolecta todos los <mark class="hl-user"> que intersecan el rango
  const collectMarks = useCallback((r) => {
    const marks = new Set();
    if (!r.commonAncestorContainer) return [...marks];
    const root = r.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? r.commonAncestorContainer.parentElement
      : r.commonAncestorContainer;
    if (!root?.querySelectorAll) return [...marks];
    root.querySelectorAll('.hl-user').forEach((m) => {
      try {
        if (r.intersectsNode(m)) marks.add(m);
      } catch {
        /* ignore */
      }
    });
    return [...marks];
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      // Clic en cualquier parte → cerrar tooltip
      if (!sel || sel.isCollapsed || !isSelectionValid(sel)) {
        setRange(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setRange(null);
        return;
      }
      lastText.current = text;
      const r = sel.getRangeAt(0).cloneRange();
      const rect = r.getBoundingClientRect();
      setIsHighlighted(hasHighlight(r));
      setRange({ text, rect });
      setRect(rect);
    };

    const handleMouseDown = (e) => {
      // Si se hace clic fuera del propio tooltip, ocultarlo
      if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
        // Mantener si ya hay una selección activa sobre párrafo
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) setRange(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mouseup', handleMouseDown);
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
      document.removeEventListener('mouseup', handleMouseDown);
    };
  }, [isSelectionValid, hasHighlight]);

  const clearSelection = () => {
    window.getSelection()?.removeAllRanges();
    setRange(null);
  };

  const handleHighlight = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !isSelectionValid(sel)) return;
    try {
      const range = sel.getRangeAt(0).cloneRange();
      const existing = collectMarks(range);
      if (existing.length) {
        // Quitar marca existente sin dejar etiquetas anidadas
        existing.forEach((m) => {
          m.parentNode?.replaceChild(document.createTextNode(m.textContent), m);
        });
        showToast?.('Resaltado eliminado.');
        clearSelection();
        return;
      }
      // Aplicar marca nueva (previene anidación: solo si la selección no estaba resaltada)
      const mark = document.createElement('mark');
      mark.className =
        'hl-user px-0.5 rounded-sm bg-gold-400/45 dark:bg-gold-500/60 text-inherit';
      range.surroundContents(mark);
      showToast?.('Fragmento resaltado correctamente.');
    } catch (err) {
      // Si surroundContents falla (rangos parciales), se conserva la selección
    }
    clearSelection();
  };

  const handleListen = () => {
    if (lastText.current) onListen?.(lastText.current);
    clearSelection();
  };

  if (!range) return null;
  const top = (range.rect?.top ?? 0) - 52;
  const left = range.rect?.left ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, y: 8, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{
          top: top < 0 ? (range.rect?.bottom ?? 0) + 12 : top,
          left: Math.max(8, left),
        }}
        className="fixed z-50 flex items-center gap-1 px-2 py-1.5 rounded-xl bg-navy-900 dark:bg-navy-900 border border-gold-500/40 shadow-gold-glow-lg"
      >
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleHighlight}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
            isHighlighted
              ? 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
              : 'bg-gold-500/10 text-gold-300 hover:bg-gold-500 hover:text-navy-950'
          }`}
          title={isHighlighted ? 'Quitar resaltado del fragmento' : 'Resaltar fragmento seleccionado'}
        >
          <Highlighter className="w-3.5 h-3.5" />
          {isHighlighted ? 'Quitar resaltado' : 'Resaltar'}
        </motion.button>
        <div className="w-px h-4 bg-slate-700/60 mx-0.5" />
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleListen}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-gold-500/20 text-slate-200 hover:text-gold-300 text-[11px] font-semibold transition-colors"
          title="Escuchar el texto seleccionado con El Casquito Minero"
        >
          <Headphones className="w-3.5 h-3.5" />
          Escuchar Selección
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}