import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  ShieldCheck, 
  Pickaxe, 
  Layers, 
  ChevronRight, 
  Scale, 
  AlertTriangle,
  FileSpreadsheet,
  ArrowUp,
  Sparkles
} from 'lucide-react';

import { useDRM } from './hooks/useDRM';
import { CAPITULOS_DATA, ANEXOS_DATA, REGLAMENTO_METADATA } from './data/reglamentoData';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';
import AnexosView from './components/AnexosView';
import DRMToast from './components/DRMToast';
import ProgressBar from './components/ProgressBar';

export default function App() {
  // 1. DRM Hook
  const { toastMessage, toastVisible, hideToast } = useDRM();

  // 2. Estados de Interfaz
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [fontSize, setFontSize] = useState(15);
  const [selectedCapituloId, setSelectedCapituloId] = useState(1);
  const [selectedTab, setSelectedTab] = useState('capitulos'); // 'capitulos' | 'anexos'
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 3. Efecto para Dark Mode en <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // 4. Botón Volver Arriba
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 22));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 13));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 5. Filtrado de Artículos y Búsqueda Global en tiempo real
  const currentCapitulo = useMemo(() => {
    return CAPITULOS_DATA.find((c) => c.id === selectedCapituloId) || CAPITULOS_DATA[0];
  }, [selectedCapituloId]);

  const filteredArticulos = useMemo(() => {
    if (!searchTerm.trim()) {
      return currentCapitulo.articulos;
    }

    const query = searchTerm.toLowerCase();
    // Búsqueda en todo el cuerpo del reglamento si hay término de búsqueda
    const matched = [];
    CAPITULOS_DATA.forEach((cap) => {
      cap.articulos.forEach((art) => {
        if (
          art.denominacion.toLowerCase().includes(query) ||
          art.contenido.toLowerCase().includes(query) ||
          `artículo ${art.numero}`.includes(query) ||
          `art ${art.numero}`.includes(query)
        ) {
          matched.push({
            ...art,
            capituloRomano: cap.numero_romano,
            capituloTitulo: cap.titulo
          });
        }
      });
    });
    return matched;
  }, [searchTerm, currentCapitulo]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Barra de Progreso de Lectura con Framer Motion */}
      <ProgressBar />

      {/* Alerta Toast de Protección DRM */}
      <DRMToast
        message={toastMessage}
        isVisible={toastVisible}
        onClose={hideToast}
      />

      {/* Barra de Navegación Superior */}
      <Navbar
        isDark={isDark}
        toggleTheme={toggleTheme}
        fontSize={fontSize}
        increaseFontSize={increaseFontSize}
        decreaseFontSize={decreaseFontSize}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
      />

      {/* Layout Principal: Sidebar + Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8">
        
        {/* Menú Lateral de Capítulos y Anexos */}
        <Sidebar
          capitulos={CAPITULOS_DATA}
          selectedCapituloId={selectedCapituloId}
          onSelectCapitulo={(id) => {
            setSelectedCapituloId(id);
            setSearchTerm('');
            scrollToTop();
          }}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Área Central de Lectura */}
        <main className="flex-1 min-w-0 py-8">
          
          {/* Si se visualizan Capítulos y Artículos */}
          {selectedTab === 'capitulos' ? (
            <div className="space-y-6">
              
              {/* Encabezado del Capítulo o Estado de Búsqueda */}
              {!searchTerm ? (
                <motion.div
                  key={currentCapitulo.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white border border-amber-500/30 shadow-gold-glow relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Pickaxe className="w-48 h-48 text-amber-400" />
                  </div>

                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                      <span>CAPÍTULO {currentCapitulo.numero_romano}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>{currentCapitulo.articulos.length} Artículos</span>
                    </div>

                    <h2 className="text-xl md:text-2xl lg:text-3xl font-extrabold font-display leading-tight text-slate-100">
                      {currentCapitulo.titulo}
                    </h2>

                    {currentCapitulo.descripcion && (
                      <p className="text-xs md:text-sm text-slate-300 max-w-3xl pt-2 border-t border-slate-700/60 leading-relaxed">
                        {currentCapitulo.descripcion}
                      </p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300">
                    <Search className="w-4 h-4 text-amber-500" />
                    <span>
                      Resultados para: <strong>"{searchTerm}"</strong> — ({filteredArticulos.length} coincidencias encontradas)
                    </span>
                  </div>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    Limpiar Búsqueda
                  </button>
                </div>
              )}

              {/* Lista Renderizada de Artículos con Animación de Entrada */}
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {filteredArticulos.length > 0 ? (
                    filteredArticulos.map((art, idx) => (
                      <ArticleCard
                        key={art.id || art.numero}
                        article={art}
                        chapterRoman={art.capituloRomano || currentCapitulo.numero_romano}
                        chapterTitle={art.capituloTitulo || currentCapitulo.titulo}
                        searchTerm={searchTerm}
                        fontSize={fontSize}
                        index={idx}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 px-4 bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-slate-800"
                    >
                      <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                        No se encontraron coincidencias
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Intenta buscar con otros términos como 'EPP', 'falta', 'asamblea', 'multa' o 'excedentes'.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Paginación entre Capítulos */}
              {!searchTerm && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => {
                      if (selectedCapituloId > 1) {
                        setSelectedCapituloId(selectedCapituloId - 1);
                        scrollToTop();
                      }
                    }}
                    disabled={selectedCapituloId === 1}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-500 hover:text-navy-950 disabled:opacity-30 disabled:pointer-events-none transition-all"
                  >
                    ← Capítulo Anterior
                  </button>

                  <span className="text-xs font-mono text-slate-400">
                    {selectedCapituloId} de {CAPITULOS_DATA.length}
                  </span>

                  <button
                    onClick={() => {
                      if (selectedCapituloId < CAPITULOS_DATA.length) {
                        setSelectedCapituloId(selectedCapituloId + 1);
                        scrollToTop();
                      } else {
                        setSelectedTab('anexos');
                        scrollToTop();
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 text-navy-950 hover:bg-amber-400 shadow-sm transition-all flex items-center gap-1"
                  >
                    {selectedCapituloId < CAPITULOS_DATA.length ? 'Siguiente Capítulo →' : 'Ver Anexos I y II →'}
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Vista de Anexos I y II */
            <AnexosView
              anexos={ANEXOS_DATA}
              searchTerm={searchTerm}
              fontSize={fontSize}
            />
          )}

        </main>
      </div>

      {/* Botón Flotante Volver Arriba */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 p-3 bg-amber-500 hover:bg-amber-400 text-navy-950 rounded-2xl shadow-gold-glow-lg border border-amber-300 transition-colors"
            title="Subir al inicio"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Footer Institucional */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-navy-950 py-8 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {REGLAMENTO_METADATA.nombre}
          </p>
          <p className="text-[11px] text-slate-400">
            Reglamento Interno Aprobado en Asamblea General Extraordinaria • Marco Legal Ley N° 356 y D.S. N° 1995
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-amber-500 font-mono">
            <span>● 21 Capítulos</span>
            <span>● 105 Artículos</span>
            <span>● Anexos I y II</span>
            <span>● Sistema de Lectura Protegida DRM</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
