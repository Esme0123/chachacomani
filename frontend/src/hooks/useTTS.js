import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Tamaño máximo (en caracteres) de cada fragmento de voz.
 * Los motores de síntesis de voz (Web Speech API) fallan en silencio o se
 * bloquean cuando reciben una cadena demasiado larga en una sola
 * SpeechSynthesisUtterance, por lo que el texto se trocea antes de leerlo.
 */
const MAX_CHUNK_LENGTH = 200;

/**
 * Divide un texto en fragmentos pequeños (≤ MAX_CHUNK_LENGTH) procurando
 * cortar en límites naturales: fin de oración (. ! ? ; \n), luego coma/dos
 * puntos/guion y, en último caso, en el espacio entre palabras.
 */
function splitIntoChunks(text, maxLen = MAX_CHUNK_LENGTH) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (!t) return [];
  if (t.length <= maxLen) return [t];

  const chunks = [];
  let start = 0;
  const minWindow = Math.floor(maxLen * 0.4);

  while (start < t.length) {
    if (t.length - start <= maxLen) {
      const rest = t.slice(start).trim();
      if (rest) chunks.push(rest);
      break;
    }

    let cut = -1;

    // 1) Fin de oración: . ! ? ; o salto de línea
    for (let i = start + maxLen; i >= start + minWindow; i--) {
      const ch = t[i];
      if (ch === '.' || ch === '!' || ch === '?' || ch === ';' || ch === '\n') {
        cut = i + 1;
        break;
      }
    }

    // 2) Coma, dos puntos o guión
    if (cut === -1) {
      for (let i = start + maxLen; i >= start + minWindow; i--) {
        const ch = t[i];
        if (ch === ',' || ch === ':' || ch === '—') {
          cut = i + 1;
          break;
        }
      }
    }

    // 3) Último espacio de palabra
    if (cut === -1) {
      for (let i = start + maxLen; i >= start + minWindow; i--) {
        if (t[i] === ' ') {
          cut = i;
          break;
        }
      }
    }

    // 4) Corte duro en el límite (evita bucles infinitos)
    if (cut === -1 || cut <= start) cut = start + maxLen;

    const chunk = t.slice(start, cut).trim();
    if (chunk) chunks.push(chunk);
    start = cut;
  }

  return chunks;
}

/**
 * useTTS — Integración con la Web Speech API (window.speechSynthesis).
 * Gestiona el dictado del "Casquito Minero": play, pausa, reanudar, detener,
 * reiniciar, velocidad, barra de progreso y seguidor de lectura en tiempo
 * real (currentlyReadingId) para resaltar la tarjeta/artículo que la voz lee.
 *
 * El texto se trocea en fragmentos de ≤ 200 caracteres que se reproducen en
 * cola, disparando el siguiente fragmento mediante el evento `onend` del
 * anterior, para evitar bloqueos/fallos silenciosos con textos largos.
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentlyReadingId, setCurrentlyReadingId] = useState(null);

  const rateRef = useRef(1);
  const programRef = useRef([]);
  const sessionRef = useRef(0);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Cargar voces disponibles del sistema (español preferiblemente)
  useEffect(() => {
    if (!supported) return;
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [supported]);

  // Monitorear en qué palabra va la lectura para simular progreso
  useEffect(() => {
    if (!supported || !isSpeaking) return;
    const tick = setInterval(() => {
      const u = window.speechSynthesis;
      if (u.speaking && !u.paused) {
        setProgress((p) => (p >= 1 ? 1 : p + 0.018));
      }
    }, 160);
    return () => clearInterval(tick);
  }, [supported, isSpeaking, isPaused]);

  // Limpieza al desmontar el componente: se invalida la sesión activa y se
  // cancela toda síntesis de voz pendiente, además de los intervalos activos.
  useEffect(() => {
    return () => {
      sessionRef.current += 1;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const pickVoice = useCallback(() => {
    if (!supported) return null;
    const es = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
    return es[0] || voices[0] || null;
  }, [voices, supported]);

  const handleEnd = useCallback(() => {
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(1);
    setCurrentlyReadingId(null);
  }, []);

  // Ejecuta un "programa" de lectura: secuencia de segmentos [{ text, id }].
  // Cada segmento se trocea en fragmentos que se leen encadenados por onend;
  // onstart actualiza currentlyReadingId. sessionRef invalida la ejecución
  // cuando se detiene, se reinicia o se cambia de capítulo/artículo.
  const runProgram = useCallback((segments) => {
    if (!supported) {
      alert('Tu navegador no soporta la reproducción por voz (speechSynthesis).');
      return;
    }
    window.speechSynthesis.cancel();
    programRef.current = segments || [];
    sessionRef.current += 1;
    const session = sessionRef.current;

    const clean = (segments || [])
      .map((s) => ({ text: String(s.text || '').replace(/\s+/g, ' ').trim(), id: s.id ?? null }))
      .filter((s) => s.text.length > 0);
    if (!clean.length) return;

    // Troceado del texto en fragmentos ≤ MAX_CHUNK_LENGTH
    const queue = [];
    clean.forEach((seg) => {
      splitIntoChunks(seg.text).forEach((chunk) => {
        queue.push({ text: chunk, id: seg.id });
      });
    });
    if (!queue.length) return;

    setCurrentText(clean.map((s) => s.text).join(' '));
    setProgress(0);
    setIsPaused(false);
    setIsSpeaking(true);

    const next = () => {
      if (sessionRef.current !== session) return;
      const item = queue.shift();
      if (!item) {
        handleEnd();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = 'es-ES';
      utterance.rate = rateRef.current;
      const voice = pickVoice();
      if (voice) {
        utterance.voice = voice;
        if (voice.lang && String(voice.lang).toLowerCase().startsWith('es')) {
          utterance.lang = voice.lang;
        }
      }
      utterance.onstart = () => {
        if (sessionRef.current === session) setCurrentlyReadingId(item.id ?? null);
      };
      utterance.onend = () => {
        if (sessionRef.current !== session) return;
        next();
      };
      utterance.onerror = (event) => {
        if (sessionRef.current !== session) return;
        if (event.error === 'canceled' || event.error === 'interrupted') return;
        next();
      };
      window.speechSynthesis.speak(utterance);
    };

    next();
  }, [supported, pickVoice, handleEnd]);

  const speak = useCallback((text, id = null) => {
    runProgram([{ text, id }]);
  }, [runProgram]);

  const speakSegments = useCallback((segments) => {
    runProgram(segments);
  }, [runProgram]);

  // Volver a reponer desde el inicio: cancela, resetea el índice de lectura a 0
  // e inicia la lectura desde el primer fragmento del programa actual.
  const rerun = useCallback(() => {
    if (programRef.current.length) runProgram(programRef.current);
  }, [runProgram]);

  // Alias explícito de "Volver a escuchar desde el inicio" (Restart/Replay).
  const restart = useCallback(() => {
    rerun();
  }, [rerun]);

  const pause = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [supported]);

  const resume = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    sessionRef.current += 1;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentlyReadingId(null);
  }, [supported]);

  const setRateSafely = useCallback((r) => {
    rateRef.current = r;
    setRate(r);
  }, []);

  return {
    supported,
    isSpeaking,
    isPaused,
    rate,
    setRate: setRateSafely,
    currentText,
    progress,
    currentlyReadingId,
    speak,
    speakSegments,
    rerun,
    restart,
    pause,
    resume,
    stop,
  };
}