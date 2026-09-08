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
}

export function useVoiceInput(options: UseVoiceInputOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'no-device'>('prompt');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const isListeningRef = useRef(false);
  const animFrameRef = useRef<number | null>(null);
  
  // Dynamic Silence Detection
  const [isCalibrating, setIsCalibrating] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceStartRef = useRef<number | null>(null);

  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    isListeningRef.current = false;
    clearSilenceTimer();
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    cleanupAudio();
  }, [cleanupAudio, clearSilenceTimer]);

  const processAudioBlob = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      
      const res = await fetch('/api/ai/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.text) {
        setTranscript(data.text);
        if (options.onTranscript) options.onTranscript(data.text);
        if (options.onFinalTranscript) options.onFinalTranscript(data.text);
      } else {
        setErrorMsg('Transcription failed or empty.');
      }
    } catch (err: any) {
      setErrorMsg(`Transcription error: ${err.message}`);
    }
  };

  const startListening = useCallback(async () => {
    setErrorMsg(null);
    setTranscript('');
    audioChunksRef.current = [];
    clearSilenceTimer();

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

            // Basic Silence Detection
            if (normalizedVol < 10) {
              if (!silenceStartRef.current) {
                 silenceStartRef.current = Date.now();
              } else if (Date.now() - silenceStartRef.current > 2500) {
                 // 2.5 seconds of silence
                 if (isListeningRef.current) stopListening();
              }
            } else {
              silenceStartRef.current = null;
            }

            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
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
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setMicPermission('denied');
        setErrorMsg('Microphone access blocked.');
      } else {
        setErrorMsg(`Unable to access microphone: ${err.message}`);
      }
    }
  }, [options, stopListening, clearSilenceTimer]);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
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
    startListening,
    stopListening,
    toggleListening,
    setTranscript,
    isCalibrating,
    ambientNoiseLevel: 10,
    dynamicSilenceMs: 2500,
    noiseCategory: 'moderate' as 'quiet' | 'moderate' | 'noisy',
    isSupported: true,
    isFallbackMode: false,
    logs: [] as DiagnosticLog[]
  };
}
