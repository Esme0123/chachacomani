import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookMarked, 
  ShieldAlert, 
  Coins, 
  FileText, 
  Scale, 
  CheckCircle2,
  X,
  Layers,
  Flame,
  Award
} from 'lucide-react';

export default function Sidebar({
  capitulos,
  selectedCapituloId,
  onSelectCapitulo,
  selectedTab,
  setSelectedTab,
  isMobileOpen,
  onCloseMobile
}) {
  // Íconos representativos según el capítulo
  const getChapterIcon = (num) => {
    if (num <= 3) return <Scale className="w-4 h-4 text-amber-500" />;
    if (num === 4) return <Flame className="w-4 h-4 text-rose-400" />;
    if (num <= 6) return <ShieldAlert className="w-4 h-4 text-red-400" />;
    if (num <= 8) return <Layers className="w-4 h-4 text-blue-400" />;
    if (num <= 10) return <Coins className="w-4 h-4 text-amber-400" />;
    if (num <= 12) return <Scale className="w-4 h-4 text-purple-400" />;
    return <FileText className="w-4 h-4 text-emerald-400" />;
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800/80 w-80 select-none">
      
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white font-display">
            Índice General
          </h2>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selector de Sección Principal */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/50">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => {
              setSelectedTab('capitulos');
              onCloseMobile();
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedTab === 'capitulos'
                ? 'bg-amber-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            21 Capítulos
          </button>
          <button
            onClick={() => {
              setSelectedTab('anexos');
              onCloseMobile();
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              selectedTab === 'anexos'
                ? 'bg-amber-500 text-navy-950 shadow-md font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Anexos I y II
          </button>
        </div>
      </div>

      {/* Lista de Capítulos con Scroll Suave */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {selectedTab === 'capitulos' ? (
          <>
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Estructura Normativa (Arts. 1 - 105)
            </div>
            {capitulos.map((cap) => {
              const isSelected = selectedCapituloId === cap.id;
              return (
                <motion.button
                  key={cap.id}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onSelectCapitulo(cap.id);
                    onCloseMobile();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/40 text-amber-900 dark:text-amber-300 font-semibold shadow-sm'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5 shrink-0 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {getChapterIcon(cap.numero)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>CAPÍTULO {cap.numero_romano}</span>
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                        {cap.articulos ? cap.articulos.length : 0} arts.
                      </span>
                    </div>
                    <p className="text-xs line-clamp-2 mt-0.5 text-slate-800 dark:text-slate-200">
                      {cap.titulo}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </>
        ) : (
          <div className="space-y-2">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Anexos Normativos Vinculantes
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                onCloseMobile();
                const el = document.getElementById('anexo-I');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300"
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span>ANEXO I: Escala de Multas</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Cuadros N° 1 y N° 2 (Faltas leves, graves, muy graves y aranceles en Bs).
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                onCloseMobile();
                const el = document.getElementById('anexo-II');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full text-left p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <Coins className="w-4 h-4 text-emerald-500" />
                <span>ANEXO II: Fondo de Accidentes</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                Escala de aportes ordinarios, extraordinarios y auxilio inmediato.
              </p>
            </motion.button>

            <div className="p-3 mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Nota de Delimitación:</span> Anexo III y formularios de actas no integrados según alcance estricto (Pág. 63).
            </div>
          </div>
        )}
      </div>

      {/* Footer del Sidebar */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-400 bg-slate-50 dark:bg-navy-950">
        <div className="flex items-center justify-between">
          <span>Aprobación 2026</span>
          <span className="text-amber-500 font-semibold">AFCOOP / FECOMAN</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Sidebar Desktop fijo */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30">
        {sidebarContent}
      </aside>

      {/* Sidebar Mobile con AnimatePresence */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop con Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-navy-950/70 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative z-10 h-full"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
