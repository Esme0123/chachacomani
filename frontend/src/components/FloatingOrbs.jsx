/**
 * ============================================================================
 *  ESFERAS DECORATIVAS FLOTANTES
 * ============================================================================
 *  Capa de fondo purelyamente decorativa para los formularios de autenticación.
 *  Aporta profundidad al fondo (que era plano) con degradados verde/dorado
 *  acordes a la identidad de la cooperativa, desenfoque suave y una animación
 *  CSS flotante u orbital definida en `index.css` (`.auth-orb`).
 *
 *  Garantías de UX:
 *   · `pointer-events: none` + `aria-hidden` -> nunca roba el foco ni el clic,
 *     ni bloquea la escritura en los campos del formulario.
 *   · `z-index: 0` frente al contenedor `z-10` del formulario, así que nunca
 *     tapa la caja de login ni el menú del encabezado.
 *   · Toda la medida viene de clases de Tailwind, por lo que se adapta sola a
 *     móvil; las esferas pequeñas se ocultan bajo 640px.
 * ============================================================================
 */

/** Paleta de la cooperativa: verde agua, verde lima, oro y azul mina. */
const ESFERAS = [
  { pos: 'top-[-12%] left-[-10%]', tam: 'w-72 h-72 sm:w-96 sm:h-96', degradado: 'linear-gradient(135deg,#48B3AF,#A7E399)', dur: '16s', retraso: '0s', opacidad: '.45' },
  { pos: 'top-[8%] right-[-12%]', tam: 'w-64 h-64 sm:w-80 sm:h-80', degradado: 'linear-gradient(135deg,#E4D329,#48B3AF)', dur: '19s', retraso: '-4s', opacidad: '.38' },
  { pos: 'bottom-[-14%] left-[6%]', tam: 'w-80 h-80 sm:w-[26rem] sm:h-[26rem]', degradado: 'linear-gradient(135deg,#A7E399,#E4D329)', dur: '22s', retraso: '-9s', opacidad: '.32' },
  { pos: 'bottom-[6%] right-[4%]', tam: 'w-48 h-48 sm:w-64 sm:h-64', degradado: 'linear-gradient(135deg,#476EAE,#48B3AF)', dur: '14s', retraso: '-6s', opacidad: '.3', pequena: true },
  { pos: 'top-1/2 left-[2%]', tam: 'w-32 h-32 sm:w-44 sm:h-44', degradado: 'linear-gradient(135deg,#E4D329,#F6FF99)', dur: '12s', retraso: '-2s', opacidad: '.35', orbita: true, pequena: true },
  { pos: 'top-[38%] right-[-6%]', tam: 'w-40 h-40 sm:w-56 sm:h-56', degradado: 'linear-gradient(135deg,#48B3AF,#476EAE)', dur: '26s', retraso: '-12s', opacidad: '.28', orbita: true },
];

export default function FloatingOrbs() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {ESFERAS.map((esfera, i) => (
        <span
          key={i}
          className={[
            'auth-orb absolute rounded-full',
            esfera.orbita ? 'auth-orb--orbita' : '',
            esfera.pequena ? 'auth-orb--pequena' : '',
            esfera.pos,
            esfera.tam,
          ].filter(Boolean).join(' ')}
          style={{
            background: esfera.degradado,
            '--orb-duracion': esfera.dur,
            '--orb-retraso': esfera.retraso,
            '--orb-opacidad': esfera.opacidad,
            ...(esfera.orbita ? { '--orb-radio': '28px' } : null),
          }}
        />
      ))}
    </div>
  );
}
