/**
 * Sonido discreto de notificación generado con la Web Audio API.
 *
 * No requiere archivos de audio ni peticiones adicionales, por lo que funciona
 * igual en el hosting compartido de GoDaddy. El AudioContext se crea de forma
 * perezosa y se reanuda con el primer gesto del usuario (pointerdown/keydown)
 * para cumplir las políticas de reproducción automática de los navegadores.
 */
let contextoAudio = null;

function obtenerContexto() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!contextoAudio) {
    try {
      contextoAudio = new AudioCtx();
    } catch {
      return null;
    }
  }
  return contextoAudio;
}

/** Prepara/reanuda el AudioContext tras un gesto del usuario. */
export function desbloquearAudioNotificaciones() {
  const ctx = obtenerContexto();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
}

/** Reproduce un tono breve de dos notas (≈ 0,4 s) a bajo volumen. */
export function reproducirSonidoNotificacion() {
  const ctx = obtenerContexto();
  if (!ctx) return;

  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const ahora = ctx.currentTime;
    const oscilador = ctx.createOscillator();
    const ganancia = ctx.createGain();

    oscilador.type = 'sine';
    oscilador.frequency.setValueAtTime(880, ahora);
    oscilador.frequency.exponentialRampToValueAtTime(1174.66, ahora + 0.12);

    ganancia.gain.setValueAtTime(0.0001, ahora);
    ganancia.gain.linearRampToValueAtTime(0.05, ahora + 0.02);
    ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.38);

    oscilador.connect(ganancia);
    ganancia.connect(ctx.destination);
    oscilador.start(ahora);
    oscilador.stop(ahora + 0.4);
  } catch {
    /* El navegador puede bloquear el audio; el toast sigue siendo visible. */
  }
}
