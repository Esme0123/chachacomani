import NormativaReaderView from './NormativaReaderView';
import { CAPITULOS_DATA, ANEXOS_DATA, REGLAMENTO_METADATA } from '../data/reglamentoData';
import * as votosService from '../services/votosService';
import { temaReglamento } from '../theme/lecturaTemas';

const FORMULARIO_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe2pAtuRwfZq1NiytOHy7V5IqPokeq2Nxo7-N4XnuETHIYL9g/viewform?usp=sharing&ouid=101278048953362428823';

const strings = {
  marca: 'Reglamento Interno',
  badge: 'R.L.',
  marcaSub: 'Nevado Chachacomani',
  buscarPlaceholder: 'Buscar artículo, término, multa (Ej. EPP, falta)...',
  tabCapitulos: 'Artículos (1-105)',
  tabAnexos: 'Anexos I & II',
  sidebarCapitulos: '21 Capítulos',
  sidebarAnexos: 'Anexos I y II',
  sidebarSubheader: 'Estructura Normativa (Arts. 1 - 105)',
  sidebarFooterIzq: 'Aprobación 2026',
  sidebarFooterDer: 'AFCOOP / FECOMAN',
  capituloEtiqueta: (cap) => `CAPÍTULO ${cap.numero_romano}`,
  noResultsHint: "Intenta buscar con otros términos como 'EPP', 'falta', 'asamblea', 'multa' o 'excedentes'.",
  heroEyebrow: 'CAPÍTULO',
  heroEyebrowDF: 'DISPOSICIONES FINALES',
  palabraArticulos: 'Artículos',
  capituloAnterior: 'Capítulo Anterior',
  siguienteCapitulo: 'Siguiente Capítulo',
  leerCapitulo: 'Leer capítulo',
  verAnexos: 'Ver Anexos I y II',
  finDelDocumento: 'Final del Documento',
  ctaEyebrowA: 'Participación Cooperativa',
  ctaEyebrowB: 'Revisión Normativa',
  ctaTitle: '¿Desea dejar una observación al Reglamento Interno?',
  ctaText:
    'Completó la lectura del Reglamento y detectó un punto a mejorar. Sus aportes serán valorados por el Consejo de Administración y el Consejo de Vigilancia, en conformidad con la Ley N.º 356 y el Estatuto Orgánico.',
  ctaButton: 'Llenar Formulario',
  footerLinea:
    'Reglamento Interno Aprobado en Asamblea General Extraordinaria • Marco Legal Ley N° 356 y D.S. N° 1995',
  footerBadges: [
    '● 21 Capítulos',
    '● 105 Artículos',
    '● Anexos I y II',
    '● Sistema de Lectura Protegida DRM',
  ],
  splashSubtitle: 'Reglamento Interno',
  formulario: {
    eyeCatch: 'Participación cooperativa',
    title: 'Formulario de Observaciones al Reglamento',
    texto:
      'Valoramos enormemente su participación durante este proceso de revisión del Reglamento Interno de',
    leyA: 'Ley General de Cooperativas N.º 356',
    leyB: 'Estatuto Orgánico',
    cta: 'Abrir Formulario en Google Forms',
    pie: 'Sus aportes serán valorados por el Consejo de Administración y el Consejo de Vigilancia en el marco del procedimiento de reforma previsto en el Reglamento Interno.',
    ariaLabel: 'Formulario de Observaciones al Reglamento',
  },
  adminEyebrow: 'Panel de Administración',
  adminTitle: 'Evaluación del Reglamento Interno',
  adminAprobacionLabel: 'Aprobación General del Reglamento',
  adminErrorHint: 'Compruebe que el backend PHP esté disponible.',
  adminFooter:
    'Estadísticas en tiempo real desde el backend PHP + MySQL (backend/). No existe modo simulación: si el API falla, el error se muestra y nada se guarda en localStorage.',
};

export default function ReglamentoInternoView({ onVolver }) {
  return (
    <NormativaReaderView
      onVolver={onVolver}
      documento={{
        tipo: 'reglamento',
        tema: temaReglamento,
        metadata: REGLAMENTO_METADATA,
        capitulos: CAPITULOS_DATA,
        anexos: ANEXOS_DATA,
        votos: votosService,
        formUrl: FORMULARIO_URL,
        mostrarFormulario: true,
        strings,
      }}
    />
  );
}