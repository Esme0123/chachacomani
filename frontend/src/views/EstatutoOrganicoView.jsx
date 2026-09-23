import NormativaReaderView from './NormativaReaderView';
import { ESTATUTO_CAPITULOS, ESTATUTO_METADATA } from '../data/estatutoData';
import * as votosService from '../services/frontendVotosService';
import { temaEstatuto } from '../theme/lecturaTemas';

const FORMULARIO_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe2pAtuRwfZq1NiytOHy7V5IqPokeq2Nxo7-N4XnuETHIYL9g/viewform?usp=sharing&ouid=101278048953362428823';

const strings = {
  marca: 'Estatuto Orgánico',
  badge: 'R.L.',
  marcaSub: 'Nevado Chachacomani',
  buscarPlaceholder: 'Buscar artículo, término, asamblea, régimen...',
  tabCapitulos: 'Artículos (1-99)',
  tabAnexos: null,
  sidebarCapitulos: '9 Secciones',
  sidebarAnexos: null,
  sidebarSubheader: 'Estructura Normativa (Arts. 1 - 99) + D.F.',
  sidebarFooterIzq: 'Aprobado en Asamblea General',
  sidebarFooterDer: 'AFCOOP',
  capituloEtiqueta: (cap) => (cap.numero_romano === 'D.F.' ? 'DISP. FINALES' : `CAPÍTULO ${cap.numero_romano}`),
  noResultsHint:
    "Intenta buscar con otros términos como 'asamblea', 'asociada', 'excedente', 'consejo' o 'Estatuto'.",
  heroEyebrow: 'CAPÍTULO',
  heroEyebrowDF: 'DISPOSICIONES FINALES',
  palabraArticulos: 'Artículos',
  capituloAnterior: 'Capítulo Anterior',
  siguienteCapitulo: 'Siguiente Capítulo',
  leerCapitulo: 'Leer capítulo',
  verAnexos: 'Ver Disposiciones Finales',
  finDelDocumento: 'Final del Documento',
  ctaEyebrowA: 'Participación Cooperativa',
  ctaEyebrowB: 'Revisión Normativa',
  ctaTitle: '¿Desea dejar una observación al Estatuto Orgánico?',
  ctaText:
    'Completó la lectura del Estatuto y detectó un punto a mejorar. Sus aportes serán valorados por el Consejo de Administración y el Consejo de Vigilancia, en conformidad con la Ley N.º 356 y el Reglamento Interno.',
  ctaButton: 'Llenar Formulario',
  footerLinea:
    'Estatuto Orgánico Aprobado en Asamblea General • Marco Legal Ley N° 356 y D.S. N° 1995',
  footerBadges: [
    '● 8 Capítulos',
    '● 99 Artículos',
    '● 3 Disposiciones Finales',
    '● Sistema de Lectura Protegida DRM',
  ],
  splashSubtitle: 'Estatuto Orgánico',
  formulario: {
    eyeCatch: 'Participación cooperativa',
    title: 'Formulario de Observaciones al Estatuto Orgánico',
    texto:
      'Valoramos enormemente su participación durante este proceso de revisión del Estatuto Orgánico de',
    leyA: 'Ley General de Cooperativas N.º 356',
    leyB: 'Reglamento Interno',
    cta: 'Abrir Formulario en Google Forms',
    pie: 'Sus aportes serán valorados por el Consejo de Administración y el Consejo de Vigilancia en el marco del procedimiento de reforma previsto en el Estatuto Orgánico.',
    ariaLabel: 'Formulario de Observaciones al Estatuto Orgánico',
  },
  adminEyebrow: 'Panel de Administración',
  adminTitle: 'Evaluación del Estatuto Orgánico',
  adminAprobacionLabel: 'Aprobación General del Estatuto',
  adminErrorHint: 'Los votos del Estatuto se registran de forma local en este navegador.',
  adminFooter:
    'Estadísticas del Estatuto Orgánico calculadas localmente (localStorage). Los votos no se envían a ningún servidor.',
};

export default function EstatutoOrganicoView({ onVolver }) {
  return (
    <NormativaReaderView
      onVolver={onVolver}
      documento={{
        tipo: 'estatuto',
        tema: temaEstatuto,
        metadata: ESTATUTO_METADATA,
        capitulos: ESTATUTO_CAPITULOS,
        anexos: null,
        votos: votosService,
        formUrl: FORMULARIO_URL,
        mostrarFormulario: true,
        strings,
      }}
    />
  );
}