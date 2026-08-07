import { useState, useEffect, useRef, useCallback } from 'react';

export interface DiagnosticLog {
  timestamp: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'event';
  message: string;
}

export interface UseVoiceInputOptions {
  onTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  language?: string;
  silenceTimeoutMs?: number; // Silence duration before auto-submitting (default: 5000ms = 5 seconds)
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'no-device'>('prompt');
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const silenceTimeoutMs = options.silenceTimeoutMs || 5000;

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isListeningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestTranscriptRef = useRef('');
  const lastVolumeSilenceRef = useRef<number | null>(null);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    clearSilenceTimer();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    cleanupAudio();
  }, [cleanupAudio, clearSilenceTimer]);

  const triggerAutoSubmit = useCallback(() => {
    const finalSpeech = latestTranscriptRef.current.trim();
    stopListening();
    if (finalSpeech) {
      if (optionsRef.current.onTranscript) {
        optionsRef.current.onTranscript(finalSpeech);
      }
      if (optionsRef.current.onFinalTranscript) {
        optionsRef.current.onFinalTranscript(finalSpeech);
      }
    }
  }, [stopListening]);

  const resetSilenceTimer = useCallback((currentText?: string) => {
    clearSilenceTimer();
    if (!isListeningRef.current) return;

    silenceTimerRef.current = setTimeout(() => {
      const textToSubmit = currentText !== undefined ? currentText : latestTranscriptRef.current;
      if (textToSubmit && textToSubmit.trim()) {
        triggerAutoSubmit();
      } else if (isListeningRef.current) {
        // Stop listening if silent with no speech
        stopListening();
      }
    }, silenceTimeoutMs);
  }, [clearSilenceTimer, silenceTimeoutMs, triggerAutoSubmit, stopListening]);

  const processAudioBlob = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const res = await fetch('/api/ai/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      const text = data.transcript || data.text || '';
      if (text && text.trim()) {
        latestTranscriptRef.current = text.trim();
        setTranscript(text.trim());
        if (optionsRef.current.onTranscript) optionsRef.current.onTranscript(text.trim());
        if (optionsRef.current.onFinalTranscript) optionsRef.current.onFinalTranscript(text.trim());
      } else {
        setErrorMsg('No speech detected or transcription was empty.');
      }
    } catch (err: any) {
      setErrorMsg(`Transcription service error: ${err.message}`);
    }
  };

  const startListening = useCallback(async () => {
    setErrorMsg(null);
    setTranscript('');
    latestTranscriptRef.current = '';
    audioChunksRef.current = [];
    clearSilenceTimer();
    lastVolumeSilenceRef.current = null;

    isListeningRef.current = true;
    setIsListening(true);

    // Setup Web Audio Volume Analyzer for waveform visualizer
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setMicPermission('granted');

        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateVolume = () => {
            if (!isListeningRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalizedVol = Math.min(100, Math.round((avg / 128) * 100));
            setVolumeLevel(normalizedVol);

            // In fallback mode (MediaRecorder), use volume level for silence timer
            if (isFallbackMode) {
              if (normalizedVol < 10) {
                if (!lastVolumeSilenceRef.current) {
                  lastVolumeSilenceRef.current = Date.now();
                } else if (Date.now() - lastVolumeSilenceRef.current > silenceTimeoutMs) {
                  triggerAutoSubmit();
                  return;
                }
              } else {
                lastVolumeSilenceRef.current = null;
              }
            }

            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicPermission('denied');
        setErrorMsg('Microphone access blocked. Please enable microphone permissions in your browser.');
        setIsListening(false);
        isListeningRef.current = false;
        return;
      }
    }

    // Attempt Web Speech API (Primary speech recognition engine)
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        setIsFallbackMode(false);
        const recognition = new SpeechRecognitionClass();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = optionsRef.current.language || 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
          // Start initial silence timer (5 seconds)
          resetSilenceTimer();
        };

        recognition.onresult = (event: any) => {
          let accumulatedText = '';
          for (let i = 0; i < event.results.length; i++) {
            accumulatedText += event.results[i][0].transcript;
          }

          if (accumulatedText) {
            latestTranscriptRef.current = accumulatedText;
            setTranscript(accumulatedText);
            if (optionsRef.current.onTranscript) {
              optionsRef.current.onTranscript(accumulatedText);
            }
            // Reset silence timer every time user speaks
            resetSilenceTimer(accumulatedText);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech') {
            // Keep listening, timer will handle silence
            return;
          }
          if (event.error === 'not-allowed') {
            setMicPermission('denied');
            setErrorMsg('Microphone permission was denied.');
            stopListening();
          } else {
            console.warn('SpeechRecognition error:', event.error);
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            if (latestTranscriptRef.current.trim()) {
              triggerAutoSubmit();
            } else {
              stopListening();
            }
          }
        };

        recognition.start();
        return;
      } catch (e) {
        console.warn('SpeechRecognition failed to start, falling back to MediaRecorder:', e);
      }
    }

    // Fallback: MediaRecorder audio recording
    if (mediaStreamRef.current) {
      setIsFallbackMode(true);
      try {
        const mediaRecorder = new MediaRecorder(mediaStreamRef.current, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size > 0) {
            processAudioBlob(blob);
          }
        };

        mediaRecorder.start();
        setIsListening(true);
        isListeningRef.current = true;
        resetSilenceTimer();
      } catch (e: any) {
        setErrorMsg('Voice recording unsupported in this browser environment.');
        stopListening();
      }
    }
  }, [clearSilenceTimer, resetSilenceTimer, silenceTimeoutMs, stopListening, isFallbackMode, triggerAutoSubmit]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      // If user clicks stop manually and there is text, submit it immediately
      const text = latestTranscriptRef.current.trim();
      stopListening();
      if (text) {
        if (optionsRef.current.onFinalTranscript) {
          optionsRef.current.onFinalTranscript(text);
        }
      }
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    return () => {
      clearSilenceTimer();
      cleanupAudio();
    };
  }, [cleanupAudio, clearSilenceTimer]);

  return {
    isListening,
    transcript,
    volumeLevel,
    errorMsg,
    micPermission,
    isFallbackMode,
    startListening,
    stopListening,
    toggleListening,
    setTranscript,
    ambientNoiseLevel: 10,
    dynamicSilenceMs: silenceTimeoutMs,
    noiseCategory: 'moderate' as 'quiet' | 'moderate' | 'noisy',
    isSupported: true,
    isCalibrating: false,
    logs: [] as DiagnosticLog[],
  };
}
