import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, X, Check, Terminal, ShieldAlert, ShieldCheck, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { DiagnosticLog } from '../hooks/useVoiceInput';

interface VoiceInputVisualizerProps {
  isListening: boolean;
  volumeLevel?: number; // 0 to 100
  transcript?: string;
  errorMsg?: string | null;
  micPermission?: 'granted' | 'denied' | 'prompt' | 'no-device' | 'checking';
  isFallbackMode?: boolean;
  logs?: DiagnosticLog[];
  isCalibrating?: boolean;
  ambientNoiseLevel?: number;
  dynamicSilenceMs?: number;
  noiseCategory?: 'quiet' | 'moderate' | 'noisy';
  onStop: () => void;
  onSelectPreset?: (presetText: string) => void;
  placeholder?: string;
  title?: string;
  compact?: boolean;
}

export const VoiceInputVisualizer: React.FC<VoiceInputVisualizerProps> = ({
  isListening,
  volumeLevel = 35,
  transcript = '',
  errorMsg,
  micPermission = 'checking',
  isFallbackMode = false,
  logs = [],
  isCalibrating = false,
  ambientNoiseLevel = 5,
  dynamicSilenceMs = 2500,
  noiseCategory = 'moderate',
  onStop,
  onSelectPreset,
  title = "Listening to Voice Inquiry",
  compact = false,
}) => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  if (!isListening && !isFallbackMode && !showDiagnostics) return null;

  const presetQueries = [
    "Tell me about Silk",
    "180 GSM Organic Cotton",
    "Mulberry Silk Charmeuse",
    "Heavyweight Linen 220 GSM",
    "Recycled Ocean Polyester",
    "OEKO-TEX Certified Denim",
    "Bulk Mill Pricing & MOQ",
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white px-3 py-1.5 rounded-xl shadow-lg border border-rose-400/50 text-xs">
        <div className="relative flex items-center justify-center">
          <span className="absolute -inset-1 rounded-full bg-white/40 animate-ping" />
          <Mic className="w-3.5 h-3.5 relative z-10 text-white animate-bounce" />
        </div>
        <div className="flex items-center gap-1.5 font-bold">
          <span className="tracking-wide">LISTENING</span>
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-white rounded-full animate-pulse h-full" />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-2/3 delay-75" />
            <span className="w-0.5 bg-white rounded-full animate-pulse h-4/5 delay-150" />
          </div>
        </div>
        {transcript && (
          <span className="truncate max-w-[120px] bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
            "{transcript}"
          </span>
        )}
        <button
          onClick={onStop}
          className="ml-auto p-0.5 rounded-full hover:bg-white/20 transition-colors"
          title="Stop Listening"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-rose-500/40 rounded-2xl p-3.5 text-white shadow-2xl space-y-3 animate-fadeIn my-2 relative overflow-hidden text-xs">
      {/* Background glowing aura */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Mic Status Badge & Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {/* Pulsating Microphone Avatar */}
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-full ${isListening ? 'bg-rose-600 text-white shadow-md' : 'bg-slate-800 text-slate-400'}`}>
            {isListening && <span className="absolute -inset-1 rounded-full bg-rose-500 opacity-75 animate-ping" />}
            {micPermission === 'denied' ? (
              <MicOff className="w-4 h-4 text-rose-400" />
            ) : (
              <Mic className="w-4 h-4 relative z-10" />
            )}
          </div>
          <div>
            <h4 className="text-xs font-extrabold tracking-wide uppercase text-rose-300 flex items-center gap-1.5">
              <span>{title}</span>
              {isListening && <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
            </h4>
            <p className="text-[11px] text-slate-300">
              {transcript ? "Recognized speech in real-time (auto-submits on silence)..." : "Speak into your mic or select a query..."}
            </p>
          </div>
        </div>

        {/* Visual Microphone Access Badge */}
        <div className="flex items-center gap-1.5">
          {micPermission === 'granted' && (
            <span className="inline-flex items-center gap-1 bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Mic Granted</span>
            </span>
          )}
          {micPermission === 'denied' && (
            <span className="inline-flex items-center gap-1 bg-rose-950/90 border border-rose-600 text-rose-300 px-2 py-0.5 rounded-full text-[10px] font-semibold animate-pulse">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Mic Denied</span>
            </span>
          )}
          {micPermission === 'no-device' && (
            <span className="inline-flex items-center gap-1 bg-amber-950/90 border border-amber-600 text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-semibold">
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>No Hardware Mic</span>
            </span>
          )}

          {/* Done / Stop Button */}
          <button
            onClick={onStop}
            className="p-1 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700 flex items-center gap-1 text-[11px] font-semibold"
          >
            <X className="w-3.5 h-3.5 text-rose-400" />
            <span>Done</span>
          </button>
        </div>
      </div>

      {/* Real Live Audio Waveform Bars (when listening) */}
      {isListening && (
        <div className="flex items-center justify-center gap-1.5 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800 px-3">
          <Volume2 className="w-4 h-4 text-rose-400 mr-2 shrink-0 animate-pulse" />
          <div className="flex items-end justify-center gap-1 h-7 flex-1">
            {[40, 75, 100, 60, 85, 30, 95, 50, 80, 45, 90, 65, 35].map((height, i) => {
              const dynamicHeight = volumeLevel > 5 ? Math.max(15, Math.min(100, (volumeLevel / 100) * height * 1.2)) : (i % 3 === 0 ? 30 : 15);
              return (
                <div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-rose-600 to-amber-400 rounded-full transition-all duration-75"
                  style={{ height: `${dynamicHeight}%` }}
                />
              );
            })}
          </div>
          <span className="text-[10px] font-mono text-rose-300 ml-2 w-8 text-right">
            {volumeLevel > 0 ? `${volumeLevel}%` : 'Listening'}
          </span>
        </div>
      )}

      {/* Live Transcript Display */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 text-xs">
        <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider mb-0.5">
          <span>Live Transcript:</span>
          {transcript && (
            <span className="text-emerald-400 font-medium">
              Auto-submitting upon pause
            </span>
          )}
        </div>
        <p className="text-slate-100 font-medium min-h-[18px]">
          {transcript ? (
            <span className="text-white font-semibold">"{transcript}"</span>
          ) : (
            <span className="text-slate-500 italic">Listening for input... (e.g. "Tell me about Silk")</span>
          )}
        </p>
      </div>

      {/* Error / Permission Guidance if any */}
      {(errorMsg || micPermission === 'denied') && (
        <div className="flex items-start gap-2 bg-rose-950/70 border border-rose-800/80 text-rose-200 p-2 rounded-xl text-[11px]">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-300">Microphone / Speech Notice:</p>
            <p>{errorMsg || "Microphone access blocked in browser. Allow microphone in site permissions."}</p>
          </div>
        </div>
      )}

      {/* Fallback Text Input Mode Alert Banner */}
      {isFallbackMode && (
        <div className="bg-indigo-950/70 border border-indigo-700/80 text-indigo-200 p-2 rounded-xl text-[11px] flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-300">Text Mode Fallback Active:</span>
            <span className="ml-1">You can type your query in the input field below or click any sample prompt to ask AI.</span>
          </div>
        </div>
      )}



      {/* Preset Suggestions for Fast Voice Testing */}
      {onSelectPreset && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Click sample query prompt to ask AI instantly:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {presetQueries.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 border border-slate-700 hover:border-rose-500/50 text-[11px] text-slate-200 hover:text-white transition-all flex items-center gap-1"
              >
                <span>"{preset}"</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
