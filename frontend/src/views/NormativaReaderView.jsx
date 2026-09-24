import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Search,
    Pickaxe,
    AlertTriangle,
    ArrowUp,
    Sparkles,
    FilePenLine,
    ClipboardList,
    BarChart3
} from 'lucide-react';

import { useDRM } from '../hooks/useDRM';
import { useTTS } from '../hooks/useTTS';
import { useRefrescoEstadisticas } from '../hooks/useRefrescoEstadisticas';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ArticleCard from '../components/ArticleCard';
import AnexosView from '../components/AnexosView';
import DRMToast from '../components/DRMToast';
import ProgressBar from '../components/ProgressBar';
import SplashScreen from '../components/SplashScreen';
import CasquitoWidget from '../components/CasquitoWidget';
import SelectionTooltip from '../components/SelectionTooltip';
import ModalFormulario from '../components/ModalFormulario';
import AdminDashboard from '../components/AdminDashboard';

/**
 * Lector de Normativa GENÉRICO: sirve tanto al Reglamento Interno como al
 * Estatuto Orgánico. Todo lo particular del documento se inyecta mediante la
 * prop `documento`:
 *
 *   documento = {
 *     tipo: 'reglamento' | 'estatuto',
 *     tema: temaReglamento | temaEstatuto,
 *     metadata, capitulos, anexos (o null),
 *     votos: { obtenerMisVotos, obtenerEstadisticas, votarArticulo },
 *     formUrl (o null), mostrarFormulario,
 *     strings: { ...todas las cadenas visibles del documento }
 *   }
 */
export default function NormativaReaderView({ documento, onVolver }) {
    const {
        tipo,
        tema,
        metadata,
        capitulos,
        anexos,
        votos,
        formUrl = null,
        mostrarFormulario = true,
        strings,
    } = documento;

    const tieneAnexos = Array.isArray(anexos) && anexos.length > 0;

    // 1. DRM Hook
    const {
        drmEnabled,
        toggleDRM,
        marcarAdmin,
        toastMessage,
        toastVisible,
        hideToast,
        triggerDRMAlert
    } = useDRM();

    // 2. Estados de Interfaz
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
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [backendError, setBackendError] = useState(null);
    const [backendErrorVisible, setBackendErrorVisible] = useState(false);
    const [votosPorArticulo, setVotosPorArticulo] = useState({});
    const [articulosPorId, setArticulosPorId] = useState({});

    // 3. TTS Hook (El Casquito Minero)
    const tts = useTTS();

    // Ref para recordar si había reproducción activa antes de cambiar de vista.
    const ttsActiveRef = useRef(false);

    // Actualiza la ref con el estado de reproducción vigente.
    useEffect(() => {
        ttsActiveRef.current = tts.isSpeaking && !tts.isPaused;
    }, [tts.isSpeaking, tts.isPaused]);

    // Al cambiar de capítulo (o de tab): cancela el audio anterior de forma
    // limpia (colas, intervalos e índice de lectura) y, si había reproducción
    // activa, inicia la lectura del capítulo recién seleccionado.
    useEffect(() => {
        const wasActive = ttsActiveRef.current;
        tts.stop();
        if (wasActive && selectedTab === 'capitulos') speakChapter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCapituloId, selectedTab]);

    // 4. Dark Mode / Warm Cream en <html>
    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-lector', tipo);
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        return () => root.removeAttribute('data-lector');
    }, [isDark, tipo]);

    // 5. Botón Volver Arriba
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Título dinámico de la pestaña según el documento leído.
    useEffect(() => {
        const baseTitle = 'Coop. Minera Aurífera Nevado Chachacomani R.L.';
        document.title = metadata?.tipo ? `${metadata.tipo} | ${baseTitle}` : baseTitle;
        return () => { document.title = baseTitle; };
    }, [metadata?.tipo]);

    const toggleTheme = () => setIsDark(!isDark);
    const increaseFontSize = () => setFontSize((prev) => Math.min(prev + 1, 22));
    const decreaseFontSize = () => setFontSize((prev) => Math.max(prev - 1, 13));

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Abre el Panel de Administrador y marca al usuario como admin (el DRM del
    // próximo arranque inicia desactivado por defecto).
    const abrirAdmin = () => {
        marcarAdmin();
        setIsAdminOpen(true);
    };

    // Toast visible de errores del backend PHP/MySQL.
    const mostrarErrorBackend = (mensaje) => {
        setBackendError(mensaje);
        setBackendErrorVisible(true);
    };
    const ocultarErrorBackend = () => setBackendErrorVisible(false);

    // Convierte la respuesta de estadísticas en el mapa que consume
    // ArticleCard (articulo_id -> { likes, dislikes, total, aprobacion, userVote }).
    const construirMapaVotos = (stats) => {
        const nuevoMapa = {};
        stats.capitulos.forEach((c) => {
            c.articulos.forEach((a) => {
                nuevoMapa[a.id] = {
                    likes: a.likes,
                    dislikes: a.dislikes,
                    total: a.total,
                    aprobacion: a.aprobacion,
                    userVote: a.userVote || null,
                };
            });
        });
        return nuevoMapa;
    };

    // Refresco en segundo plano de los contadores (polling + foco) SIN toasts
    // para no interrumpir la lectura: solo se registran los errores en consola.
    const refrescarContadores = useCallback(async () => {
        try {
            const stats = await votos.obtenerEstadisticas();
            setVotosPorArticulo(construirMapaVotos(stats));
        } catch (error) {
            console.error('Error backend:', error);
        }
    }, [votos]);

    // 1. Polling (cada 7s) + 2. revalidación al volver a la app (focus/visibility)
    useRefrescoEstadisticas(refrescarContadores, { intervaloMs: 7000 });

    const currentCapitulo = useMemo(
        () => capitulos.find((c) => c.id === selectedCapituloId) || capitulos[0],
        [capitulos, selectedCapituloId]
    );

    const filteredArticulos = useMemo(() => {
        if (!searchTerm.trim()) return currentCapitulo.articulos;
        const query = searchTerm.toLowerCase();
        const matched = [];
        capitulos.forEach((cap) => {
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
    }, [searchTerm, currentCapitulo, capitulos]);

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

    // Evaluación de artículos: registra el voto y refresca estadísticas
    const votarArticuloById = async (articuloId, tipoVoto) => {
        try {
            const capituloId = articulosPorId[articuloId]?.capituloId;
            await votos.votarArticulo(articuloId, tipoVoto, capituloId);
        } catch (error) {
            console.error('Error backend:', error);
            if (error?.status === 409) {
                await votos.obtenerMisVotos().catch(() => { });
                mostrarErrorBackend('Ya has evaluado este artículo.');
            } else {
                mostrarErrorBackend(error?.message || 'Error al registrar voto en la base de datos.');
            }
            return;
        }

        // Voto registrado: refresco INMEDIATO de los contadores globales.
        try {
            const stats = await votos.obtenerEstadisticas();
            setVotosPorArticulo(construirMapaVotos(stats));
        } catch (error) {
            console.error('Error backend:', error);
            mostrarErrorBackend('El voto se registró, pero no se pudieron actualizar las estadísticas.');
        }
    };

    // Mapa de consulta rápida: article.id -> capitulo (para votar desde búsquedas)
    useEffect(() => {
        const mapa = {};
        capitulos.forEach((cap) => {
            cap.articulos.forEach((art) => {
                mapa[art.id] = { capituloId: cap.id, numero: art.numero, titulo: art.denominacion };
            });
        });
        setArticulosPorId(mapa);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [capitulos]);

    // Carga inicial: estadísticas + votos del usuario (anti-spam: botones bloqueados)
    useEffect(() => {
        let activo = true;
        (async () => {
            try {
                const misVotos = await votos.obtenerMisVotos();
                const stats = await votos.obtenerEstadisticas();

                const nuevoMapa = {};
                stats.capitulos.forEach((c) => {
                    c.articulos.forEach((a) => {
                        const userVote = a.userVote || (misVotos[a.id] ? misVotos[a.id] : null);
                        nuevoMapa[a.id] = {
                            likes: a.likes,
                            dislikes: a.dislikes,
                            total: a.total,
                            aprobacion: a.aprobacion,
                            userVote,
                        };
                    });
                });
                if (activo) setVotosPorArticulo(nuevoMapa);
            } catch (error) {
                console.error('Error backend:', error);
                if (activo) {
                    mostrarErrorBackend('No se pudieron cargar los votos desde la base de datos.');
                }
            }
        })();
        return () => {
            activo = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [votos]);

    // Seguidor de lectura: desplaza automáticamente hacia el elemento en lectura
    useEffect(() => {
        if (!tts.currentlyReadingId) return;
        const el = document.querySelector(`[data-read-id="${tts.currentlyReadingId}"]`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [tts.currentlyReadingId]);

    const esUltimoCapitulo = selectedCapituloId >= capitulos.length;

    return (
        <>
            {/* Pantalla de Carga Temática */}
            <AnimatePresence>
                {showSplash && <SplashScreen tema={tema} subtitulo={strings.splashSubtitle} onComplete={() => setShowSplash(false)} />}
            </AnimatePresence>

            <div className={`${tema.rootClass} min-h-screen flex flex-col bg-[#f8f9fa] dark:bg-navy-900 text-ink dark:text-slate-100 transition-colors duration-500`}>
                {/* Barra de Progreso de Lectura */}
                <ProgressBar tema={tema} />

                {/* Alerta Toast de Protección DRM */}
                <DRMToast
                    message={toastMessage}
                    isVisible={toastVisible}
                    onClose={hideToast}
                    variant={isDark ? 'dark' : 'cream'}
                />

                {/* Alerta Toast de Errores del Backend (MySQL/API) */}
                <DRMToast
                    key={backendError || 'backend-error'}
                    message={backendError}
                    isVisible={backendErrorVisible}
                    onClose={ocultarErrorBackend}
                    variant={isDark ? 'dark' : 'cream'}
                    title="Error de Conexión"
                    tone="error"
                />

                {/* Botón Volver al Inicio */}
                <div className={`w-full border-b ${tema.barraVolver}`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
                        <button
                            onClick={onVolver}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${tema.botonVolver}`}
                        >
                            ← Volver al Inicio
                        </button>
                    </div>
                </div>

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
                    onOpenAdmin={abrirAdmin}
                    drmEnabled={drmEnabled}
                    onToggleDRM={toggleDRM}
                    tema={tema}
                    strings={strings}
                    tieneAnexos={tieneAnexos}
                />

                {/* Layout Principal */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex gap-8">
                    <Sidebar
                        capitulos={capitulos}
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
                        onOpenAdmin={() => {
                            setIsMobileMenuOpen(false);
                            abrirAdmin();
                        }}
                        drmEnabled={drmEnabled}
                        onToggleDRM={toggleDRM}
                        tema={tema}
                        strings={strings}
                        tieneAnexos={tieneAnexos}
                    />

                    <main className="flex-1 min-w-0 py-8">
                        {selectedTab === 'capitulos' || !tieneAnexos ? (
                            <div className="space-y-6">
                                {!searchTerm ? (
                                    <motion.div
                                        key={currentCapitulo.id}
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        data-read-id={`cap-${currentCapitulo.id}`}
                                        className={`relative overflow-hidden rounded-3xl border p-6 md:p-8 ${isDark
                                            ? tema.heroCardOscuro
                                            : tema.heroCardClaro
                                            }`}
                                    >
                                        {/* Motivo ornamental del pico */}
                                        <div className={`absolute top-0 right-0 p-8 opacity-15 pointer-events-none ${isDark ? tema.heroIcono : tema.heroIconoClaro}`}>
                                            <Pickaxe className="w-48 h-48" />
                                        </div>

                                        <div className="relative z-10 space-y-2">
                                            <div className={`flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest ${isDark ? tema.heroEyebrow : tema.heroEyebrow}`}>
                                                <Sparkles className="w-3.5 h-3.5" />
                                                <span>{currentCapitulo.numero_romano === 'D.F.' ? strings.heroEyebrowDF : `${strings.heroEyebrow} ${currentCapitulo.numero_romano}`}</span>
                                                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? tema.heroPunto : tema.heroPuntoClaro}`} />
                                                <span>{currentCapitulo.articulos.length} {strings.palabraArticulos}</span>
                                            </div>

                                            <h2 className="font-serif text-xl md:text-2xl lg:text-3xl font-semibold leading-tight text-ink dark:text-slate-100">
                                                {currentCapitulo.titulo}
                                            </h2>

                                            {currentCapitulo.descripcion && (
                                                <p className={`text-xs md:text-sm max-w-3xl pt-2 border-t leading-relaxed ${isDark ? 'text-slate-300 border-slate-700/60' : `text-ink-soft ${tema.heroLineaBorde}`}`}>
                                                    {currentCapitulo.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className={`p-4 rounded-2xl flex items-center justify-between ${tema.bannerBusqueda}`}>
                                        <div className={`flex items-center gap-2 text-xs ${tema.bannerBusquedaTexto}`}>
                                            <Search className={`w-4 h-4 ${tema.bannerBusquedaIcono}`} />
                                            <span>
                                                Resultados para: <strong>"{searchTerm}"</strong> — ({filteredArticulos.length} coincidencias encontradas)
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className={`text-xs font-semibold hover:underline ${tema.btnLimpiarBusqueda}`}
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
                                                        voto={votosPorArticulo[art.id]}
                                                        onVotar={votarArticuloById}
                                                        tema={tema}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className={`text-center py-16 px-4 rounded-2xl border ${isDark ? 'bg-navy-900 border-slate-800' : 'bg-ivory border-sand-300'}`}
                                            >
                                                <AlertTriangle className={`w-12 h-12 mx-auto mb-3 ${tema.bannerBusquedaIcono}`} />
                                                <h3 className="text-base font-bold text-ink dark:text-slate-200">
                                                    No se encontraron coincidencias
                                                </h3>
                                                <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
                                                    {strings.noResultsHint}
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
                                            className={`px-4 py-2 text-xs font-bold rounded-xl border disabled:opacity-30 disabled:pointer-events-none transition-all ${tema.botonNeutro} ${tema.botonNeutroHover}`}
                                        >
                                            ← {strings.capituloAnterior}
                                        </button>

                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={speakChapter}
                                                className={`hidden sm:flex items-center gap-1.5 px-3 py-2 text-[11px] rounded-xl border transition-colors ${tema.botonLeerCapitulo}`}
                                            >
                                                <BookOpen className="w-3.5 h-3.5" />
                                                {strings.leerCapitulo}
                                            </button>
                                            <span className="text-xs font-mono text-ink-muted">
                                                {selectedCapituloId} de {capitulos.length}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (!esUltimoCapitulo) {
                                                    setSelectedCapituloId(selectedCapituloId + 1);
                                                    scrollToTop();
                                                } else if (tieneAnexos) {
                                                    setSelectedTab('anexos');
                                                    scrollToTop();
                                                }
                                            }}
                                            disabled={esUltimoCapitulo && !tieneAnexos}
                                            className={`px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1 disabled:opacity-30 disabled:pointer-events-none ${tema.botonPrincipal}`}
                                        >
                                            {!esUltimoCapitulo
                                                ? `${strings.siguienteCapitulo} →`
                                                : tieneAnexos
                                                    ? `${strings.verAnexos} →`
                                                    : strings.finDelDocumento}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <AnexosView anexos={anexos} searchTerm={searchTerm} fontSize={fontSize} />
                        )}

                        {/* CTA Formulario de Observaciones (tras Disposiciones Finales) */}
                        {mostrarFormulario && formUrl && (
                            <section className="mt-12 pt-12 border-t border-sand-300 dark:border-slate-800 scroll-mt-24">
                                <div
                                    className={`relative overflow-hidden rounded-3xl border p-8 md:p-10 text-center ${isDark
                                        ? tema.ctaCardOscuro
                                        : tema.ctaCardClaro
                                        }`}
                                >
                                    <div className={`absolute top-0 right-0 p-8 opacity-15 pointer-events-none ${isDark ? tema.ctaIcono : tema.ctaIconoClaro}`}>
                                        <FilePenLine className="w-40 h-40" />
                                    </div>

                                    <div className="relative z-10 space-y-4 mx-auto max-w-2xl">
                                        <div className={`flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest ${isDark ? tema.ctaEyebrow : tema.ctaEyebrow}`}>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            <span>{strings.ctaEyebrowA}</span>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? tema.ctaPunto : tema.ctaPuntoClaro}`} />
                                            <span>{strings.ctaEyebrowB}</span>
                                        </div>

                                        <h2 className="font-serif text-xl md:text-2xl font-semibold leading-tight text-ink dark:text-slate-100">
                                            {strings.ctaTitle}
                                        </h2>

                                        <p className={`text-xs md:text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-ink-soft'}`}>
                                            {strings.ctaText}
                                        </p>

                                        <button
                                            onClick={() => setIsFormModalOpen(true)}
                                            className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-t text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all ${tema.ctaBoton}`}
                                        >
                                            <ClipboardList className="w-4 h-4" />
                                            {strings.ctaButton}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </main>
                </div>

                {/* Widget TTS: Casquito Minero flotante */}
                <CasquitoWidget tts={tts} onSpeakChapter={speakChapter} tema={tema} />

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
                            className={`fixed bottom-6 left-6 z-40 p-3 rounded-2xl shadow-2xl ${tema.fabSubir}`}
                            title="Subir al inicio"
                        >
                            <ArrowUp className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Botón Flotante: Llenar Formulario */}
                {mostrarFormulario && formUrl && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setIsFormModalOpen(true)}
                        className={`fixed bottom-24 right-6 z-50 inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-t text-sm font-bold shadow-2xl ${tema.ctaBoton}`}
                        title="Llenar formulario de observaciones"
                    >
                        <ClipboardList className="w-5 h-5" />
                        <span className="hidden sm:inline">{strings.ctaButton}</span>
                    </motion.button>
                )}

                {/* Modal: Formulario de Observaciones (Google Forms) */}
                <ModalFormulario
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    isDark={isDark}
                    tema={tema}
                    metadata={metadata}
                    formulario={strings.formulario}
                    formUrl={formUrl}
                />

                {/* Modal: Dashboard de Administrador (evaluación de artículos) */}
                <AdminDashboard
                    isOpen={isAdminOpen}
                    onClose={() => setIsAdminOpen(false)}
                    isDark={isDark}
                    drmEnabled={drmEnabled}
                    toggleDRM={toggleDRM}
                    tema={tema}
                    capitulos={capitulos}
                    votos={votos}
                    strings={strings}
                />

                {/* Footer Institucional */}
                <footer className={`border-t py-8 text-xs transition-colors ${isDark ? 'border-slate-800/80 bg-navy-950 text-slate-500' : 'border-sand-300 bg-white text-ink-muted'}`}>
                    <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
                        <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-ink'}`}>
                            {metadata.nombre}
                        </p>
                        <p className="text-[11px]">
                            {strings.footerLinea}
                        </p>
                        <div className={`pt-2 flex items-center justify-center gap-2 text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-ink-muted'}`}>
                            {strings.footerBadges.map((badge) => (
                                <span key={badge}>{badge}</span>
                            ))}
                            <button
                                onClick={abrirAdmin}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border transition-colors ${isDark
                                    ? 'border-slate-700 text-slate-500 hover:border-gold-500/50'
                                    : 'border-sand-300 text-ink-muted hover:border-gold-500/50'
                                    } ${tema.footerBadgeAcento}`}
                                title="Dashboard de Administrador: estadísticas de evaluación de artículos"
                            >
                                <BarChart3 className="w-3 h-3" />
                                Admin
                            </button>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}