import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTTS — Integración con la Web Speech API (window.speechSynthesis).
 * Gestiona el dictado del "Casquito Minero": play, pausa, reanudar, detener,
 * velocidad, barra de progreso y seguidor de lectura en tiempo real
 * (currentlyReadingId) para resaltar la tarjeta/artículo que la voz lee.
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

  // Ejecuta un "programa" de lectura: secuencia de segmentos [{ text, id }]
  // donde cada segmento dispara onstart que actualiza currentlyReadingId.
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

    setCurrentText(clean.map((s) => s.text).join(' '));
    setProgress(0);
    setIsPaused(false);
    setIsSpeaking(true);

    clean.forEach((seg, i) => {
      const utterance = new SpeechSynthesisUtterance(seg.text);
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
        if (sessionRef.current === session) setCurrentlyReadingId(seg.id ?? null);
      };
      const finish = () => {
        if (sessionRef.current === session) handleEnd();
      };
      if (i === clean.length - 1) {
        utterance.onend = finish;
        utterance.onerror = finish;
      }
      window.speechSynthesis.speak(utterance);
    });
  }, [supported, pickVoice, handleEnd]);

  const speak = useCallback((text, id = null) => {
    runProgram([{ text, id }]);
  }, [runProgram]);

  const speakSegments = useCallback((segments) => {
    runProgram(segments);
  }, [runProgram]);

  const rerun = useCallback(() => {
    if (programRef.current.length) runProgram(programRef.current);
  }, [runProgram]);

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
    pause,
    resume,
    stop,
  };
}