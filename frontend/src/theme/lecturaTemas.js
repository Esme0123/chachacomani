/**
 * Temas visuales del "Lector de Normativa".
 *
 * Cada documento (Reglamento Interno / Estatuto Orgánico) carga un objeto de
 * tema con los fragmentos de clases Tailwind (o valores arbitrarios) que se
 * interpolan en el lector genérico (NormativaReaderView) y en los componentes
 * compartidos (Navbar, Sidebar, ArticleCard, ProgressBar, CasquitoWidget,
 * ModalFormulario, AdminDashboard, SplashScreen).
 *
 * Son FRAGMENTOS de classname completos, por lo que Tailwind los detecta en el
 * escaneo de contenido y los genera en el CSS final.
 */

/* ============================================================================
 * Tema por defecto: Reglamento Interno (Oro & Carbón / Slate & Gold)
 * Mantiene EXACTAMENTE las clases que usaba el lector original para no alterar
 * el aspecto actual del Reglamento.
 * ========================================================================== */
export const temaReglamento = {
  rootClass: 'theme-reglamento',

  /* --- Franja superior "Volver al Inicio" --- */
  barraVolver: 'border-[#294669] bg-[#0D0B61]',
  botonVolver:
    'text-[#E4D329] hover:text-[#F6FF99] hover:bg-[#294669]/80 bg-[#294669] border-[#478B8D]',

  /* --- Barra de progreso de lectura --- */
  barraProgreso:
    'bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 shadow-[0_0_12px_rgba(245,158,11,0.8)]',

  /* --- Navbar: logo y marca --- */
  logoDisco: 'bg-gradient-to-tr from-gold-600 via-gold-500 to-gold-300 shadow-gold-glow',
  logoIconoFondo: 'bg-ivory dark:bg-navy-900',
  logoIconoTexto: 'text-gold-600 dark:text-gold-400',
  marcaTexto: 'text-gold-600 dark:text-gold-400',
  marcaBadge: 'bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/30',
  busquedaFocus: 'focus:ring-gold-500/50',

  /* --- Navbar: pestañas de vista --- */
  tabActiva: 'bg-[#f59e0b] text-navy-950 font-bold shadow-sm',
  tabHover: 'hover:text-gold-600 dark:hover:text-gold-400',

  /* --- Sidebar --- */
  indiceIcono: 'text-gold-600 dark:text-gold-400',
  iconoCapitulo: 'text-gold-500',
  selectorActivo: 'bg-gold-500 text-navy-950 shadow-md font-bold',
  botonEstadisticas:
    'border-gold-500/40 bg-gold-500/10 text-gold-700 dark:text-gold-400 hover:bg-gold-500/20',
  capituloSeleccionado:
    'bg-gold-500/15 dark:bg-gold-500/20 border-gold-500/50 text-amber-600 dark:text-gold-300',
  capituloTituloSel: 'text-amber-600 dark:text-gold-300',
  footerAcento: 'text-gold-600 dark:text-gold-400',

  /* --- Tarjeta de Artículo --- */
  resaltadoBusqueda: 'bg-gold-300 dark:bg-gold-500/40 text-ink dark:text-gold-200',
  tarjetaFondo: 'bg-ivory dark:bg-navy-800',
  tarjetaHoverBorde: 'hover:border-gold-600/80 dark:hover:border-gold-600/80',
  lectAutoActiva: 'border-2 border-amber-500 shadow-lg shadow-amber-500/20',
  fileteH: 'via-gold-400/60',
  fileteV: 'via-gold-500/40',
  etiquetaLeyendo:
    'bg-amber-500 text-white shadow-lg shadow-amber-500/30',
  numeroChip:
    'bg-amber-100 dark:bg-gold-500/15 border-2 border-amber-300 dark:border-gold-500/40 text-amber-900 dark:text-gold-400',
  etiquetaArticulo: 'text-gold-600 dark:text-gold-400',
  btnEscuchar:
    'border-gold-600/40 bg-gold-500/5 text-gold-700 dark:text-gold-400 hover:bg-gold-500/15',
  capBadgeIcono: 'text-gold-500',
  lineaSubitem: 'border-l-2 border-gold-400/50 dark:border-gold-500/50',
  bookmarkIcono: 'text-gold-600 dark:text-gold-500',
  puntoEstado: 'bg-gold-500',
  votoInsignia:
    'bg-gold-500/10 border-gold-500/40 text-gold-700 dark:text-gold-300',

  /* --- Vista: héroe del capítulo --- */
  heroCardOscuro:
    'bg-gradient-to-br from-navy-800 via-navy-800 to-navy-700 border-gold-500/30 text-slate-100 shadow-gold-glow',
  heroCardClaro:
    'bg-gradient-to-br from-gold-100 via-cream-100 to-gold-200/70 border-gold-400/40 text-ink shadow-cream-panel',
  heroIcono: 'text-gold-400',
  heroIconoClaro: 'text-gold-600',
  heroEyebrow: 'text-gold-600 dark:text-gold-400',
  heroPunto: 'bg-gold-400',
  heroPuntoClaro: 'bg-gold-600',
  heroLineaBorde: 'border-gold-400/30',

  /* --- Resultados de búsqueda --- */
  bannerBusqueda: 'bg-gold-500/10 border-gold-500/30',
  bannerBusquedaTexto: 'text-gold-800 dark:text-gold-300',
  bannerBusquedaIcono: 'text-gold-500',
  btnLimpiarBusqueda: 'text-gold-700 dark:text-gold-400',

  /* --- Paginación entre capítulos --- */
  botonNeutro:
    'bg-cream-100 dark:bg-navy-800 text-ink dark:text-slate-200 border-sand-300 dark:border-navy-700',
  botonNeutroHover: 'hover:bg-gold-500 hover:text-navy-950',
  botonLeerCapitulo:
    'border-gold-500/40 text-gold-700 dark:text-gold-400 hover:bg-gold-500/10',
  botonPrincipal:
    'bg-[#f59e0b] text-navy-950 hover:bg-gold-500',
  botonPrincipalGradiente:
    'from-[#f59e0b] to-[#fbbf24] text-navy-950 hover:from-[#f59e0b] hover:to-[#fcd34d]',

  /* --- CTA Formulario (final de lectura) --- */
  ctaCardOscuro:
    'bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950 border-gold-500/30 shadow-gold-glow',
  ctaCardClaro:
    'bg-gradient-to-br from-gold-100 via-cream-100 to-gold-200/70 border-gold-400/40 shadow-cream-panel',
  ctaIcono: 'text-gold-400',
  ctaIconoClaro: 'text-gold-600',
  ctaEyebrow: 'text-gold-600 dark:text-gold-400',
  ctaPunto: 'bg-gold-400',
  ctaPuntoClaro: 'bg-gold-600',
  ctaBoton:
    'from-gold-600 to-gold-400 text-navy-950 shadow-gold-glow-lg hover:from-gold-500 hover:to-gold-300',

  /* --- Botones flotantes --- */
  fabSubir: 'bg-gold-500 hover:bg-gold-400 text-navy-950 shadow-gold-glow-lg',
  fabFormulario: cta => cta,

  /* --- Footer --- */
  footerBadgeAcento: 'text-gold-500 dark:text-gold-500',

  /* --- Modal Formulario --- */
  modalIcono: 'bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 shadow-gold-glow',
  modalHeaderClaro: 'bg-gradient-to-br from-gold-100 to-cream-100 border-sand-300',
  modalEyebrow: 'text-gold-600 dark:text-gold-400',
  modalStrong: 'text-gold-700 dark:text-gold-300',
  modalCta:
    'from-gold-600 to-gold-400 text-navy-950 shadow-gold-glow-lg hover:from-gold-500 hover:to-gold-300',
  modalCheck: 'text-gold-600 dark:text-gold-400',

  /* --- Dashboard de Administración --- */
  adminIcono: 'bg-gradient-to-tr from-gold-600 to-gold-400 text-navy-950 shadow-gold-glow',
  adminEyebrow: 'text-gold-600 dark:text-gold-400',
  adminHeaderClaro: 'bg-gradient-to-br from-gold-100 to-cream-100 border-sand-300',
  adminSpinner: 'border-gold-500/30 border-t-gold-500',
  adminProgreso: 'from-gold-600 via-gold-500 to-emerald-500',
  adminFocus: 'focus:ring-gold-500/50',
  adminCeldaNum: 'text-gold-600 dark:text-gold-400',
  adminBarraOK: 'from-gold-500 to-emerald-500',
  adminBarraNO: 'from-rose-500 to-gold-500',
  adminCheck: 'text-gold-600 dark:text-gold-400',
  adminSelect: 'text-gold-600 dark:text-gold-400',

  /* --- CasquitoWidget (TTS) --- */
  cascPanel:
    'bg-white dark:bg-navy-900/95 border-sand-300 dark:border-gold-600/40 shadow-cream-panel dark:shadow-gold-glow-lg',
  cascTitulo: 'text-ink dark:text-gold-300',
  cascProgreso: 'from-gold-600 to-gold-400',
  cascPlay:
    'from-gold-600 to-gold-500 text-navy-950 shadow-gold-glow hover:from-gold-500 hover:to-gold-400',
  cascRestablecer:
    'border-gold-500/40 text-gold-700 dark:text-gold-400 hover:bg-gold-500/15',
  cascVelActivo: 'bg-gold-500 text-navy-950 font-bold',
  cascVelIcono: 'text-gold-600 dark:text-gold-400',
  cascFondo: 'border-sand-300 dark:border-gold-600/50 shadow-cream-panel dark:shadow-gold-glow-lg',

  /* --- SplashScreen --- */
  splashFondo: 'bg-gold-fume dark:bg-navy-900',
  splashAura1: 'bg-gold-400/10',
  splashAura2: 'bg-gold-600/10',
  splashAnillo: 'text-gold-200 dark:text-slate-800',
  splashGlow: 'bg-gold-500/40',
  splashGradStop1: '#f59e0b',
  splashGradStop2: '#fbbf24',
};

/* ============================================================================
 * Tema del Estatuto Orgánico — Paleta Corporativa Exclusiva
 *   · Primario Oscuro  #092328  (encabezados / badges principales)
 *   · Secundario       #12544F  (bordes / botones activos)
 *   · Acento           #2A835F  (destacados / hover)
 *   · Suave            #8BBB92  (fondos de tarjetas / badges secundarios)
 * ========================================================================== */
export const temaEstatuto = {
  rootClass: 'theme-estatuto',

  barraVolver: 'border-[#12544F]/60 bg-[#092328]',
  botonVolver: 'text-[#8BBB92] hover:text-white hover:bg-[#12544F]/80 bg-[#12544F] border-[#2A835F]',

  barraProgreso:
    'bg-gradient-to-r from-[#12544F] via-[#2A835F] to-[#8BBB92] shadow-[0_0_12px_rgba(42,131,95,0.8)]',

  logoDisco: 'bg-gradient-to-tr from-[#12544F] via-[#2A835F] to-[#8BBB92] shadow-[0_0_20px_-5px_rgba(42,131,95,0.5)]',
  logoIconoFondo: 'bg-white dark:bg-[#092328]',
  logoIconoTexto: 'text-[#2A835F] dark:text-[#8BBB92]',
  marcaTexto: 'text-[#2A835F] dark:text-[#8BBB92]',
  marcaBadge: 'bg-[#2A835F]/10 text-[#2A835F] dark:text-[#8BBB92] border-[#2A835F]/40',
  busquedaFocus: 'focus:ring-[#2A835F]/60',

  tabActiva: 'bg-[#12544F] text-white font-bold shadow-md',
  tabHover: 'hover:text-[#2A835F] dark:hover:text-[#8BBB92]',

  indiceIcono: 'text-[#2A835F] dark:text-[#8BBB92]',
  iconoCapitulo: 'text-[#2A835F]',
  selectorActivo: 'bg-[#12544F] text-white shadow-md font-bold',
  botonEstadisticas:
    'border-[#2A835F]/40 bg-[#2A835F]/10 text-[#12544F] dark:text-[#8BBB92] hover:bg-[#2A835F]/20',
  capituloSeleccionado:
    'bg-[#8BBB92]/25 dark:bg-[#2A835F]/25 border-[#2A835F]/60 text-[#092328] dark:text-[#8BBB92]',
  capituloTituloSel: 'text-[#12544F] dark:text-[#8BBB92]',
  footerAcento: 'text-[#2A835F] dark:text-[#8BBB92]',

  resaltadoBusqueda: 'bg-[#8BBB92] dark:bg-[#2A835F]/50 text-[#092328] dark:text-[#e6f3e8]',
  tarjetaFondo: 'bg-[#8BBB92] dark:bg-[#0e2f33]',
  tarjetaHoverBorde: 'hover:border-[#2A835F]/80 dark:hover:border-[#8BBB92]/70',
  lectAutoActiva: 'border-2 border-[#2A835F] shadow-lg shadow-[#2A835F]/25',
  fileteH: 'via-[#8BBB92]',
  fileteV: 'via-[#2A835F]/60',
  etiquetaLeyendo: 'bg-[#2A835F] text-white shadow-lg shadow-[#2A835F]/30',
  numeroChip:
    'bg-[#dcece0] dark:bg-[#2A835F]/20 border-2 border-[#2A835F]/50 text-[#092328] dark:text-[#8BBB92]',
  etiquetaArticulo: 'text-[#12544F] dark:text-[#8BBB92]',
  btnEscuchar:
    'border-[#2A835F]/50 bg-[#2A835F]/8 text-[#12544F] dark:text-[#8BBB92] hover:bg-[#2A835F]/20',
  capBadgeIcono: 'text-[#2A835F]',
  lineaSubitem: 'border-l-2 border-[#2A835F]/60 dark:border-[#8BBB92]/60',
  bookmarkIcono: 'text-[#2A835F] dark:text-[#8BBB92]',
  puntoEstado: 'bg-[#2A835F]',
  votoInsignia:
    'bg-[#2A835F]/12 border-[#2A835F]/50 text-[#12544F] dark:text-[#8BBB92]',

  heroCardOscuro:
    'bg-gradient-to-br from-[#0b2f33] via-[#0a2a2e] to-[#12544F]/70 border-[#2A835F]/40 text-slate-100 shadow-[0_0_20px_-5px_rgba(42,131,95,0.45)]',
  heroCardClaro:
    'bg-gradient-to-br from-[#8BBB92]/80 via-[#e4f0e7] to-[#8BBB92]/50 border-[#2A835F]/45 text-[#092328] shadow-[0_10px_40px_-18px_rgba(18,84,79,0.35)]',
  heroIcono: 'text-[#8BBB92]',
  heroIconoClaro: 'text-[#2A835F]',
  heroEyebrow: 'text-[#2A835F] dark:text-[#8BBB92]',
  heroPunto: 'bg-[#8BBB92]',
  heroPuntoClaro: 'bg-[#2A835F]',
  heroLineaBorde: 'border-[#2A835F]/40',

  bannerBusqueda: 'bg-[#2A835F]/10 border-[#2A835F]/35',
  bannerBusquedaTexto: 'text-[#0b4a40] dark:text-[#8BBB92]',
  bannerBusquedaIcono: 'text-[#2A835F]',
  btnLimpiarBusqueda: 'text-[#12544F] dark:text-[#8BBB92]',

  botonNeutro:
    'bg-white dark:bg-[#0a2a2e] text-[#092328] dark:text-slate-200 border-[#8BBB92]/80 dark:border-[#12544F]',
  botonNeutroHover: 'hover:bg-[#2A835F] hover:text-white',
  botonLeerCapitulo:
    'border-[#2A835F]/50 text-[#12544F] dark:text-[#8BBB92] hover:bg-[#2A835F]/10',
  botonPrincipal: 'bg-[#12544F] text-white hover:bg-[#2A835F]',
  botonPrincipalGradiente:
    'from-[#12544F] to-[#2A835F] text-white hover:from-[#0e453f] hover:to-[#2A835F]',

  ctaCardOscuro:
    'bg-gradient-to-br from-[#0b2f33] via-[#092328] to-[#061a1d] border-[#2A835F]/40 shadow-[0_0_20px_-5px_rgba(42,131,95,0.45)]',
  ctaCardClaro:
    'bg-gradient-to-br from-[#8BBB92]/70 via-[#e8f3ea] to-[#8BBB92]/45 border-[#2A835F]/45 shadow-[0_10px_40px_-18px_rgba(18,84,79,0.3)]',
  ctaIcono: 'text-[#8BBB92]',
  ctaIconoClaro: 'text-[#2A835F]',
  ctaEyebrow: 'text-[#2A835F] dark:text-[#8BBB92]',
  ctaPunto: 'bg-[#8BBB92]',
  ctaPuntoClaro: 'bg-[#2A835F]',
  ctaBoton:
    'from-[#12544F] to-[#2A835F] text-white shadow-[0_0_35px_-5px_rgba(42,131,95,0.55)] hover:from-[#0e453f] hover:to-[#2A835F]',

  fabSubir:
    'bg-[#2A835F] hover:bg-[#12544F] text-white shadow-[0_0_35px_-5px_rgba(42,131,95,0.5)]',
  fabFormulario: cta => cta,

  footerBadgeAcento: 'text-[#2A835F] dark:text-[#8BBB92]',

  modalIcono:
    'bg-gradient-to-tr from-[#12544F] to-[#2A835F] text-white shadow-[0_0_20px_-5px_rgba(42,131,95,0.5)]',
  modalHeaderClaro: 'bg-gradient-to-br from-[#8BBB92]/50 to-[#e8f3ea] border-[#8BBB92]/50',
  modalEyebrow: 'text-[#2A835F] dark:text-[#8BBB92]',
  modalStrong: 'text-[#12544F] dark:text-[#8BBB92]',
  modalCta:
    'from-[#12544F] to-[#2A835F] text-white shadow-[0_0_35px_-5px_rgba(42,131,95,0.55)] hover:from-[#0e453f] hover:to-[#2A835F]',
  modalCheck: 'text-[#2A835F] dark:text-[#8BBB92]',

  adminIcono:
    'bg-gradient-to-tr from-[#12544F] to-[#2A835F] text-white shadow-[0_0_20px_-5px_rgba(42,131,95,0.5)]',
  adminEyebrow: 'text-[#2A835F] dark:text-[#8BBB92]',
  adminHeaderClaro: 'bg-gradient-to-br from-[#8BBB92]/50 to-[#e8f3ea] border-sand-300',
  adminSpinner: 'border-[#2A835F]/30 border-t-[#2A835F]',
  adminProgreso: 'from-[#12544F] via-[#2A835F] to-[#2A835F]',
  adminFocus: 'focus:ring-[#2A835F]/60',
  adminCeldaNum: 'text-[#12544F] dark:text-[#8BBB92]',
  adminBarraOK: 'from-[#2A835F] to-[#2A835F]',
  adminBarraNO: 'from-rose-500 to-[#2A835F]',
  adminCheck: 'text-[#2A835F] dark:text-[#8BBB92]',
  adminSelect: 'text-[#2A835F] dark:text-[#8BBB92]',

  cascPanel:
    'bg-white dark:bg-[#092328]/95 border-sand-300 dark:border-[#2A835F]/60 shadow-cream-panel dark:shadow-[0_0_35px_-5px_rgba(42,131,95,0.5)]',
  cascTitulo: 'text-ink dark:text-[#8BBB92]',
  cascProgreso: 'from-[#12544F] to-[#2A835F]',
  cascPlay:
    'from-[#12544F] to-[#2A835F] text-white shadow-[0_0_35px_-5px_rgba(42,131,95,0.55)] hover:from-[#0e453f] hover:to-[#2A835F]',
  cascRestablecer:
    'border-[#2A835F]/50 text-[#12544F] dark:text-[#8BBB92] hover:bg-[#2A835F]/15',
  cascVelActivo: 'bg-[#12544F] text-white font-bold',
  cascVelIcono: 'text-[#2A835F] dark:text-[#8BBB92]',
  cascFondo:
    'border-sand-300 dark:border-[#2A835F]/60 shadow-cream-panel dark:shadow-[0_0_35px_-5px_rgba(42,131,95,0.5)]',

  splashFondo: 'bg-[#e8f3ea] dark:bg-[#092328]',
  splashAura1: 'bg-[#2A835F]/15',
  splashAura2: 'bg-[#12544F]/20',
  splashAnillo: 'text-[#8BBB92] dark:text-[#0e2f33]',
  splashGlow: 'bg-[#2A835F]/50',
  splashGradStop1: '#8BBB92',
  splashGradStop2: '#2A835F',
};

/**
 * Devuelve el objeto de tema activo según el tipo de documento.
 * @param {'reglamento'|'estatuto'} tipo
 */
export function obtenerTema(tipo) {
  return tipo === 'estatuto' ? temaEstatuto : temaReglamento;
}