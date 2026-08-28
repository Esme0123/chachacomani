import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  ShieldCheck,
  Pickaxe,
  Scale,
  AlertTriangle,
  ArrowUp,
  Sparkles,
  FilePenLine,
  ClipboardList
} from 'lucide-react';

import { useDRM } from './hooks/useDRM';
import { useTTS } from './hooks/useTTS';
import { CAPITULOS_DATA, ANEXOS_DATA, REGLAMENTO_METADATA } from './data/reglamentoData';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ArticleCard from './components/ArticleCard';
import AnexosView from './components/AnexosView';
import DRMToast from './components/DRMToast';
import ProgressBar from './components/ProgressBar';
import SplashScreen from './components/SplashScreen';
import CasquitoWidget from './components/CasquitoWidget';
import SelectionTooltip from './components/SelectionTooltip';
import ModalFormulario from './components/ModalFormulario';

export default function App() {
  // 1. DRM Hook
  const { toastMessage, toastVisible, hideToast, triggerDRMAlert } = useDRM();

  // 2. TTS Hook (El Casquito Minero)
  const tts = useTTS();

  // 3. Estados de Interfaz
  const [showSplash, setShowSplash] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const [fontSize, setFontSize] = useState(16);
  const [selectedCapituloId, setSelectedCapituloId] = useState(1);
  const [selectedTab, setSelectedTab] = useState('capitulos'); // 'capitulos' | 'anexos'
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 4. Dark Mode / Warm Cream en <html>
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

  // 5. Botón Volver Arriba
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setIsDark(!isDark);
  const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 22));
  const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 13));

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const currentCapitulo = useMemo(
    () => CAPITULOS_DATA.find((c) => c.id === selectedCapituloId) || CAPITULOS_DATA[0],
    [selectedCapituloId]
  );

  const filteredArticulos = useMemo(() => {
    if (!searchTerm.trim()) return currentCapitulo.articulos;
    const query = searchTerm.toLowerCase();
    const matched = [];
    CAPITULOS_DATA.forEach((cap) => {
      cap.articulos.forEach((art) => {
        if (
          art.denominacion.toLowerCase().includes(query) ||
          art.contenido.toLowerCase().includes(query) ||
          `artículo ${art.numero}`.includes(query) ||
          `art ${art.numero}`.includes(query)
        ) {
          matched.push({ ...art, capituloRomano: cap.numero_romano, capituloId: cap.id });
        }
      });
    });
    return matched;
  }, [searchTerm, currentCapitulo]);

  const speakChapter = () => {
    const segments = [
      {
        text: `Capítulo ${currentCapitulo.numero_romano}. ${currentCapitulo.titulo}. ${currentCapitulo.descripcion || ''}`,
        id: `cap-${currentCapitulo.id}`
      },
      ...currentCapitulo.articulos.map((a) => ({
        text: `Artículo ${a.numero}. ${a.denominacion}. ${a.contenido}`,
        id: `art-${currentCapitulo.id}-${a.numero}`
      }))
    ];
    tts.speakSegments(segments);
  };

  // Escuchar un Artículo individual (detiene cualquier lectura previa)
  const listenArticle = (art, chapterId) => {
    const readId = `art-${chapterId}-${art.numero}`;
    const text = `Artículo ${art.numero}. ${art.denominacion}. ${art.contenido}`;
    tts.speak(text, readId);
  };

  // Seguidor de lectura: desplaza automáticamente hacia el elemento en lectura
  useEffect(() => {
    if (!tts.currentlyReadingId) return;
    const el = document.querySelector(`[data-read-id="${tts.currentlyReadingId}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [tts.currentlyReadingId]);

  return (
    <>
      {/* Pantalla de Carga Temática */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-navy-900 text-ink dark:text-slate-100 transition-colors duration-500">
        {/* Barra de Progreso de Lectura */}
        <ProgressBar />

        {/* Alerta Toast de Protección DRM */}
        <DRMToast
          message={toastMessage}
          isVisible={toastVisible}
          onClose={hideToast}
          variant={isDark ? 'dark' : 'cream'}
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

        {/* Layout Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8">
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

          <main className="flex-1 min-w-0 py-8">
            {selectedTab === 'capitulos' ? (
              <div className="space-y-6">
                {!searchTerm ? (
                  <motion.div
                    key={currentCapitulo.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    data-read-id={`cap-${currentCapitulo.id}`}
                    className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${
                      isDark
                        ? 'bg-gradient-to-br from-navy-800 via-navy-800 to-navy-700 border-gold-500/30 text-slate-100 shadow-gold-glow'
                        : 'bg-gradient-to-br from-gold-100 via-cream-100 to-gold-200/70 border-gold-400/40 text-ink shadow-cream-panel'
                    }`}
                  >
                    {/* Motivo ornamental del pico */}
                    <div className={`absolute top-0 right-0 p-8 opacity-15 pointer-events-none ${isDark ? 'text-gold-400' : 'text-gold-600'}`}>
                      <Pickaxe className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>CAPÍTULO {currentCapitulo.numero_romano}</span>
                        <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-gold-400' : 'bg-gold-600'}`} />
                        <span>{currentCapitulo.articulos.length} Artículos</span>
                      </div>

                      <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-ink dark:text-slate-100">
                        {currentCapitulo.titulo}
                      </h2>

                      {currentCapitulo.descripcion && (
                        <p className={`text-xs md:text-sm max-w-3xl pt-2 border-t leading-relaxed ${isDark ? 'text-slate-300 border-slate-700/60' : 'text-ink-soft border-gold-400/30'}`}>
                          {currentCapitulo.descripcion}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className={isDark ? 'p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between' : 'p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-between'}>
                    <div className="flex items-center gap-2 text-xs text-gold-800 dark:text-gold-300">
                      <Search className="w-4 h-4 text-gold-500" />
                      <span>
                        Resultados para: <strong>"{searchTerm}"</strong> — ({filteredArticulos.length} coincidencias encontradas)
                      </span>
                    </div>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-xs font-semibold text-gold-700 dark:text-gold-400 hover:underline"
                    >
                      Limpiar Búsqueda
                    </button>
                  </div>
                )}

                {/* Lista de Artículos */}
                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {filteredArticulos.length > 0 ? (
                      filteredArticulos.map((art, idx) => {
                        const chapterId = art.capituloId || currentCapitulo.id;
                        const readId = `art-${chapterId}-${art.numero}`;
                        return (
                          <ArticleCard
                            key={`${chapterId}-${art.numero}`}
                            article={art}
                            chapterRoman={art.capituloRomano || currentCapitulo.numero_romano}
                            chapterTitle={art.capituloTitulo || currentCapitulo.titulo}
                            searchTerm={searchTerm}
                            fontSize={fontSize}
                            index={idx}
                            chapterId={chapterId}
                            readId={readId}
                            isReading={tts.currentlyReadingId === readId}
                            onListenArticle={listenArticle}
                          />
                        );
                      })
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`text-center py-16 px-4 rounded-2xl border ${isDark ? 'bg-navy-900 border-slate-800' : 'bg-ivory border-sand-300'}`}
                      >
                        <AlertTriangle className="w-12 h-12 mx-auto text-gold-500 mb-3" />
                        <h3 className="text-base font-bold text-ink dark:text-slate-200">
                          No se encontraron coincidencias
                        </h3>
                        <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                          Intenta buscar con otros términos como 'EPP', 'falta', 'asamblea', 'multa' o 'excedentes'.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Paginación entre Capítulos */}
                {!searchTerm && (
                  <div className={`flex items-center justify-between pt-6 border-t ${isDark ? 'border-slate-800' : 'border-sand-300'}`}>
                    <button
                      onClick={() => {
                        if (selectedCapituloId > 1) {
                          setSelectedCapituloId(selectedCapituloId - 1);
                          scrollToTop();
                        }
                      }}
                      disabled={selectedCapituloId === 1}
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-cream-100 dark:bg-navy-800 text-ink dark:text-slate-200 hover:bg-gold-500 hover:text-navy-950 border border-sand-300 dark:border-navy-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
                    >
                      ← Capítulo Anterior
                    </button>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={speakChapter}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-xl border border-gold-500/40 text-gold-700 dark:text-gold-400 hover:bg-gold-500/10 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Leer capítulo
                      </button>
                      <span className="text-xs font-mono text-ink-muted">
                        {selectedCapituloId} de {CAPITULOS_DATA.length}
                      </span>
                    </div>

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
                      className="px-4 py-2 text-xs font-bold rounded-xl bg-gold-600 text-navy-950 hover:bg-gold-500 shadow-sm transition-all flex items-center gap-1"
                    >
                      {selectedCapituloId < CAPITULOS_DATA.length ? 'Siguiente Capítulo →' : 'Ver Anexos I y II →'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <AnexosView anexos={ANEXOS_DATA} searchTerm={searchTerm} fontSize={fontSize} />
            )}

            {/* CTA Formulario de Observaciones (tras Disposiciones Finales) */}
            <section className="mt-12 pt-12 border-t border-sand-300 dark:border-slate-800 scroll-mt-24">
              <div
                className={`relative overflow-hidden rounded-3xl border p-8 md:p-10 text-center ${
                  isDark
                    ? 'bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border-gold-500/30 shadow-gold-glow'
                    : 'bg-gradient-to-br from-gold-100 via-cream-100 to-gold-200/70 border-gold-400/40 shadow-cream-panel'
                }`}
              >
                <div className={`absolute top-0 right-0 p-8 opacity-15 pointer-events-none ${isDark ? 'text-gold-400' : 'text-gold-600'}`}>
                  <FilePenLine className="w-40 h-40" />
                </div>

                <div className="relative z-10 space-y-4 mx-auto max-w-2xl">
                  <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-gold-600 dark:text-gold-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Participación Cooperativa</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-gold-400' : 'bg-gold-600'}`} />
                    <span>Revisión Normativa</span>
                  </div>

                  <h2 className="font-serif text-xl md:text-2xl font-semibold leading-tight text-ink dark:text-slate-100">
                    ¿Desea dejar una observación al Reglamento Interno?
                  </h2>

                  <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-soft'}`}>
                    Completó la lectura del Reglamento y detectó un punto a mejorar. Sus aportes
                    serán valorados por el Consejo de Administración y el Consejo de Vigilancia,
                    en conformidad con la Ley N.º 356 y el Estatuto Orgánico.
                  </p>

                  <button
                    onClick={() => setIsFormModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-t from-gold-600 to-gold-400 text-navy-950 text-sm font-bold shadow-gold-glow-lg hover:from-gold-500 hover:to-gold-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <ClipboardList className="w-4 h-4" />
                    Llenar Formulario
                  </button>
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Widget TTS: Casquito Minero flotante */}
        <CasquitoWidget tts={tts} onSpeakChapter={speakChapter} />

        {/* Tooltip de Selección Contextual */}
        <SelectionTooltip onListen={tts.speak} showToast={triggerDRMAlert} />

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
              className="fixed bottom-6 left-6 z-40 p-3 bg-gold-500 hover:bg-gold-400 text-navy-950 rounded-2xl shadow-gold-glow-lg"
              title="Subir al inicio"
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Botón Flotante: Llenar Formulario */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsFormModalOpen(true)}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-t from-gold-600 to-gold-400 text-navy-950 text-sm font-bold shadow-gold-glow-lg"
          title="Llenar formulario de observaciones"
        >
          <ClipboardList className="w-5 h-5" />
          <span className="hidden sm:inline">Llenar Formulario</span>
        </motion.button>

        {/* Modal: Formulario de Observaciones (Google Forms) */}
        <ModalFormulario
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          isDark={isDark}
        />

        {/* Footer Institucional */}
        <footer className={`border-t py-8 text-xs transition-colors ${isDark ? 'border-slate-800/80 bg-navy-950 text-slate-500' : 'border-sand-300 bg-white text-ink-muted'}`}>
          <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
            <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-ink'}`}>
              {REGLAMENTO_METADATA.nombre}
            </p>
            <p className="text-[11px]">
              Reglamento Interno Aprobado en Asamblea General Extraordinaria • Marco Legal Ley N° 356 y D.S. N° 1995
            </p>
            <div className={`pt-2 flex items-center justify-center gap-2 text-[10px] font-mono ${isDark ? 'text-gold-500' : 'text-gold-600'}`}>
              <span>● 21 Capítulos</span>
              <span>● 105 Artículos</span>
              <span>● Anexos I y II</span>
              <span>● Sistema de Lectura Protegida DRM</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}