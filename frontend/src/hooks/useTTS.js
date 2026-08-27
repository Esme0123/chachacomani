import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTTS — Integración con la Web Speech API (window.speechSynthesis).
 * Gestiona el dictado del "Casquito Minero": play, pausa, reanudar, detener,
 * velocidad y barra de progreso del texto que se está leyendo.
 */
export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [currentText, setCurrentText] = useState('');
  const [progress, setProgress] = useState(0);

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

  // Sincronizar estado con el final del habla
  useEffect(() => {
    if (!supported) return;
    const handleEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(1);
    };
    window.speechSynthesis.onend = handleEnd;
    window.speechSynthesis.onerror = handleEnd;
    return () => {
      window.speechSynthesis.onend = null;
      window.speechSynthesis.onerror = null;
    };
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

  const speak = useCallback((text) => {
    if (!supported) {
      alert('Tu navegador no soporta la reproducción por voz (speechSynthesis).');
      return;
    }
    window.speechSynthesis.cancel();
    const clean = String(text || '').replace(/\s+/g, ' ').trim();
    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-ES';
    utterance.rate = rate;
    const voice = pickVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    setCurrentText(clean);
    setProgress(0);
    setIsPaused(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [rate, pickVoice, supported]);

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
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
  }, [supported]);

  const setRateSafely = useCallback((r) => {
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
    speak,
    pause,
    resume,
    stop,
  };
}