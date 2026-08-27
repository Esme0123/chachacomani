import React from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Moon,
  Search,
  Menu,
  ShieldCheck,
  Pickaxe,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

export default function Navbar({
  isDark,
  toggleTheme,
  fontSize,
  increaseFontSize,
  decreaseFontSize,
  searchTerm,
  setSearchTerm,
  onOpenMobileMenu,
  selectedTab,
  setSelectedTab
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand-300/70 dark:border-slate-800/80 bg-cream-50/85 dark:bg-navy-900/85 backdrop-blur-md transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Logo & Título */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 text-ink-muted dark:text-slate-300 hover:bg-cream-200 dark:hover:bg-navy-800 rounded-lg transition-colors"
              aria-label="Abrir Menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setSelectedTab('capitulos')}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-500 to-gold-300 p-0.5 shadow-gold-glow shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-ivory dark:bg-navy-900 rounded-[10px] flex items-center justify-center text-gold-600 dark:text-gold-400">
                  <Pickaxe className="w-5 h-5 animate-subtle-pulse" />
                </div>
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                    Reglamento Interno
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold bg-gold-500/10 text-gold-600 dark:text-gold-400 rounded border border-gold-500/30">
                    R.L.
                  </span>
                </div>
                <h1 className="text-sm font-bold text-ink dark:text-white truncate font-display">
                  Nevado Chachacomani
                </h1>
              </div>
            </motion.div>
          </div>

          {/* Buscador */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                placeholder="Buscar artículo, término, multa (Ej. EPP, falta)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-cream-100 dark:bg-navy-800/80 border border-sand-300 dark:border-slate-700/60 rounded-xl text-ink dark:text-white placeholder-ink-muted focus:outline-none focus:ring-2 focus:ring-gold-500/50 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink bg-cream-300 dark:bg-slate-700 rounded-full px-1.5"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Herramientas de Control */}
          <div className="flex items-center gap-1.5 sm:gap-2">

            {/* Pestañas de Vista */}
            <div className="hidden sm:flex items-center bg-cream-100 dark:bg-navy-800 p-1 rounded-xl border border-sand-300 dark:border-slate-700 text-xs font-medium">
              <button
                onClick={() => setSelectedTab('capitulos')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTab === 'capitulos'
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                    : 'text-ink-muted dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400'
                }`}
              >
                Artículos (1-105)
              </button>
              <button
                onClick={() => setSelectedTab('anexos')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedTab === 'anexos'
                    ? 'bg-gold-500 text-navy-950 font-bold shadow-sm'
                    : 'text-ink-muted dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400'
                }`}
              >
                Anexos I & II
              </button>
            </div>

            {/* Ajuste de Tamaño de Fuente */}
            <div className="flex items-center bg-cream-100 dark:bg-navy-800/80 rounded-xl p-0.5 border border-sand-300 dark:border-slate-700/60">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={decreaseFontSize}
                disabled={fontSize <= 13}
                className="p-1.5 text-ink-muted dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 disabled:opacity-30 rounded-lg"
                title="Reducir tamaño de letra"
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>
              <span className="text-[11px] font-mono px-1 text-ink-muted dark:text-slate-400 select-none">
                {fontSize}px
              </span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={increaseFontSize}
                disabled={fontSize >= 22}
                className="p-1.5 text-ink-muted dark:text-slate-300 hover:text-gold-600 dark:hover:text-gold-400 disabled:opacity-30 rounded-lg"
                title="Aumentar tamaño de letra"
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Selector de Tema */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-ink-muted dark:text-gold-400 bg-cream-100 dark:bg-navy-800/80 hover:bg-cream-200 dark:hover:bg-navy-700/80 rounded-xl border border-sand-300 dark:border-slate-700/60 transition-colors"
              title={isDark ? "Cambiar a Modo Claro (Warm Cream)" : "Cambiar a Modo Oscuro (Slate & Gold)"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Badge de Seguridad */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DRM Activo</span>
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}