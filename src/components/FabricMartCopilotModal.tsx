import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'react-markdown';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, Send, RefreshCw, AudioLines, ExternalLink, User, Store, ShieldCheck, Square, Activity, Cpu, Radio, Zap, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { AIChatMessage, Product } from '../types';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { VoiceInputVisualizer } from './VoiceInputVisualizer';
import { Agent3DCanvas } from './3dFabric/Agent3DCanvas';

interface FabricMartCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: Product) => void;
  onNavigate?: (tab: string, searchQuery?: string) => void;
}

// 3D Animated Avatar Model Badge for "FM AGENT"
const FMAgentVisualEmblem: React.FC<{ size?: 'sm' | 'md' | 'lg'; state?: 'idle' | 'listening' | 'processing' | 'speaking' }> = ({
  size = 'md',
  state = 'idle',
}) => {
  return (
    <div className="relative shrink-0 flex items-center justify-center">
      <Agent3DCanvas state={state} size={size} />
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
          state === 'listening'
            ? 'bg-rose-500 animate-pulse'
            : state === 'speaking'
            ? 'bg-emerald-500 animate-pulse'
            : state === 'processing'
            ? 'bg-amber-500 animate-pulse'
            : 'bg-blue-500'
        }`}
      />
    </div>
  );
};

// Visual Haptic Feedback Panel for Voice Interactions
const HapticFeedbackPanel: React.FC<{
  state: 'listening' | 'processing' | 'speaking' | 'idle';
  transcriptText?: string;
  onStop: () => void;
}> = ({ state, transcriptText, onStop }) => {
  if (state === 'idle') return null;

  return (
    <div className="mx-3 my-2 p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-lg animate-fadeIn">
      {/* State 1: LISTENING */}
      {state === 'listening' && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-rose-500/50 text-rose-100 p-3 rounded-xl border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
              </div>
              <span className="font-extrabold text-xs tracking-wider uppercase text-rose-300 flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" /> FM AGENT LISTENING...
              </span>
            </div>
            <button
              onClick={onStop}
              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] transition-colors"
            >
              Stop
            </button>
          </div>

          {/* Animated Waveform Level Equalizer */}
          <div className="flex items-center justify-center gap-1 h-8 bg-black/40 rounded-lg px-3">
            {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70].map((height, idx) => (
              <span
                key={idx}
                className="w-1 bg-rose-400 rounded-full animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDuration: `${0.3 + (idx % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>

          <p className="text-[11px] text-rose-200/90 italic truncate">
            {transcriptText || 'Speak your fabric request clearly into your mic...'}
          </p>
        </div>
      )}

      {/* State 2: PROCESSING */}
      {state === 'processing' && (
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-500/50 text-amber-100 p-3 rounded-xl border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-extrabold text-xs tracking-wider uppercase text-amber-300">
                FM AGENT PROCESSING...
              </span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono animate-pulse">
              AI Reasoning
            </span>
          </div>

          {/* Haptic Orbital Radar Loader */}
          <div className="flex items-center gap-3 bg-black/40 rounded-lg p-2.5">
            <RefreshCw className="w-5 h-5 text-amber-400 animate-spin shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 animate-pulse w-3/4 rounded-full" />
              </div>
              <p className="text-[10px] text-amber-200/80">Analyzing request & searching support knowledge base...</p>
            </div>
          </div>
        </div>
      )}

      {/* State 3: SPEAKING */}
      {state === 'speaking' && (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-emerald-500/50 text-emerald-100 p-3 rounded-xl border flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AudioLines className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-extrabold text-xs tracking-wider uppercase text-emerald-300">
                FM AGENT SPEAKING...
              </span>
            </div>
            <button
              onClick={onStop}
              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
            >
              Mute
            </button>
          </div>

          {/* Soft Voice Haptic Audio Bar Visualizer */}
          <div className="flex items-center justify-between bg-black/40 rounded-lg px-4 py-2">
            <span className="text-[10px] text-emerald-300 font-medium">Soft Polite Voice Output</span>
            <div className="flex items-center gap-1 h-5">
              {[30, 80, 50, 100, 60, 90, 40].map((h, i) => (
                <span
                  key={i}
                  className="w-1 bg-emerald-400 rounded-full animate-pulse"
                  style={{
                    height: `${h}%`,
                    animationDuration: `${0.4 + (i % 3) * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const FabricMartCopilotModal: React.FC<FabricMartCopilotModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onNavigate,
}) => {
  const { user, role } = useAuth();
  const { addToCart } = useCart();
  const isSeller = role === 'SUPPLIER';

  const [inputMessage, setInputMessage] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedMsgIds, setExpandedMsgIds] = useState<Record<string, boolean>>({});
  const toggleExpandMsg = (id: string) => {
    setExpandedMsgIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const recognitionRef = useRef<any>(null);

  // Helper to remove any raw markdown symbols like **, ###, etc from spoken or plain text
  const stripMarkdown = (str: string) => {
    if (!str) return '';
    return str
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/^[\s-]*\*\s+/gm, '')
      .trim();
  };

  // Role-based greeting generator with automatic detection upon login/open
  const generateGreeting = (currentRole: string, currentUser: any) => {
    const isSupplier = currentRole === 'SUPPLIER';
    const userName = currentUser?.name || (isSupplier ? 'Mill Partner' : 'Apparel Buyer');

    if (isSupplier) {
      return {
        text: `Welcome back, ${userName}! I am your Voice Support Agent for Fabric Mart operations.\n\nAsk me about order status, dashboard navigation, or product inventory help.`,
        shortAudioAnswer: `Welcome back, ${userName}! I am your Voice Support Agent. How may I assist your operations today?`,
      };
    }

    return {
      text: `Welcome back, ${userName}! I am your Voice Support Agent.\n\nAsk me about order tracking, account troubleshooting, or how to navigate the marketplace.`,
      shortAudioAnswer: `Welcome back, ${userName}! I am your Voice Support Agent. How may I help you today?`,
    };
  };

  const initialGreeting = generateGreeting(role, user);

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: initialGreeting.text,
      shortAudioAnswer: initialGreeting.shortAudioAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Voice Input Hook
  const {
    isListening,
    transcript,
    volumeLevel,
    errorMsg,
    micPermission,
    isFallbackMode,
    logs,
    isCalibrating,
    ambientNoiseLevel,
    dynamicSilenceMs,
    noiseCategory,
    stopListening,
    toggleListening,
  } = useVoiceInput({
    onTranscript: (text) => setInputMessage(text),
    onFinalTranscript: (finalText) => {
      if (finalText && finalText.trim()) {
        handleSendMessage(undefined, finalText);
      }
    }
  });

  // Voice Selection & Soft Polite Human-like Speech Output
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speakText = async (text: string, msgId?: string) => {
    if (voiceMuted || !isOpenRef.current) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Clean markdown text for human-like reading
    const cleanText = text
      .replace(/###/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/ - /g, '. ')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .trim();

    if (!cleanText) return;

    try {
      setIsSpeaking(true);
      if (msgId) setSpeakingMsgId(msgId);

      const response = await fetch('/api/ai/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText })
      });
      
      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      };

      await audio.play();
    } catch (e) {
      console.warn("Server TTS failed, falling back to Web Speech API:", e);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        const voices = window.speechSynthesis.getVoices();
        const politeVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Victoria') || v.name.includes('Natural') || v.name.includes('Karen') || v.name.includes('Female'))) || voices.find((v) => v.lang.startsWith('en'));
        if (politeVoice) utterance.voice = politeVoice;

        utterance.onstart = () => {
          setIsSpeaking(true);
          if (msgId) setSpeakingMsgId(msgId);
        };
        utterance.onend = () => {
          setIsSpeaking(false);
          setSpeakingMsgId(null);
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          setSpeakingMsgId(null);
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
        setSpeakingMsgId(null);
      }
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  // Manage audio & voice state whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.sender === 'assistant' && !voiceMuted) {
          speakText(lastMsg.shortAudioAnswer || lastMsg.text, lastMsg.id);
        }
      }
    } else {
      stopSpeaking();
      stopListening();
    }

    return () => {
      stopSpeaking();
      stopListening();
    };
  }, [isOpen]);

  const toggleVoiceListening = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    toggleListening();
  };

  // Check for voice-triggered navigation commands
  const checkNavigationCommand = (rawQuery: string) => {
    const q = rawQuery.toLowerCase().trim();

    // 1. Orders / Dashboard / Track Order
    if (q.includes('order') || q.includes('my orders') || q.includes('track') || q.includes('order history') || q.includes('take me to my orders') || q.includes('show my orders')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: `Please log in or register to track your orders.`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: `Certainly! Navigating you directly to your ${isSeller ? 'Mill Orders & Sales' : 'Orders'} page.`
      };
    }
    
    // 1.1 Address Update / Settings
    if (q.includes('address') || q.includes('update address') || q.includes('shipping address') || q.includes('profile settings') || q.includes('account settings')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: `Please log in to update your account settings.`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: `Navigating you to your Profile Settings. You can update your shipping address there.`
      };
    }
    
    // 1.2 Returns
    if (q.includes('return') || q.includes('defective') || q.includes('refund')) {
      if (!user) {
        return {
          isNav: true,
          targetTab: 'auth',
          reply: `Please log in to manage your returns.`
        };
      }
      const targetTab = isSeller ? 'supplier-dashboard' : 'buyer-dashboard';
      return {
        isNav: true,
        targetTab,
        reply: `I'll take you to your dashboard where you can request a return for your recent orders.`
      };
    }

    // 2. Search for fabric (e.g. "search for silk fabrics", "search silk", "find organic linen")
    // 2. Search for fabric (e.g. "search for silk fabrics", "search silk", "find organic linen")
    if (q.startsWith('search for') || q.startsWith('search') || q.startsWith('find') || q.startsWith('show me')) {
      const searchTerms = q
        .replace(/^search for/i, '')
        .replace(/^search/i, '')
        .replace(/^find/i, '')
        .replace(/^show me/i, '')
        .replace(/fabrics?/gi, '')
        .replace(/textiles?/gi, '')
        .trim();

      if (searchTerms) {
        return {
          isNav: true,
          targetTab: 'marketplace',
          searchQuery: searchTerms,
          reply: `Certainly! Navigating to the marketplace catalog and filtering for "${searchTerms}" fabrics.`
        };
      }
    }

    // 3. Marketplace / Catalog
    if (q.includes('marketplace') || q.includes('browse fabrics') || q.includes('fabric catalog') || q.includes('showroom catalog')) {
      return {
        isNav: true,
        targetTab: 'marketplace',
        reply: `Opening the Fabric Mart marketplace catalog.`
      };
    }

    // 4. Cart / Checkout
    if (q.includes('cart') || q.includes('checkout')) {
      return {
        isNav: true,
        targetTab: 'checkout',
        reply: `Taking you directly to the checkout summary page.`
      };
    }

    // 5. Home
    if (q.includes('go home') || q.includes('take me home') || q.includes('landing page')) {
      return {
        isNav: true,
        targetTab: 'home',
        reply: `Returning to the main home page.`
      };
    }

    return { isNav: false };
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || inputMessage;
    if (!query.trim()) return;

    if (isListening) {
      stopListening();
    }

    stopSpeaking();

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');

    // Check for direct voice navigation shortcut match
    const navResult = checkNavigationCommand(query);
    if (navResult.isNav && navResult.reply) {
      const aiNavMsg: AIChatMessage = {
        id: `ai-nav-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: navResult.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiNavMsg]);
      if (!voiceMuted && isOpenRef.current) speakText(navResult.reply, aiNavMsg.id);

      if (onNavigate) {
        onNavigate(navResult.targetTab!, navResult.searchQuery);
      }
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/voice/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query, role: role, userId: user?.id }),
      });
      const data = await res.json();

      let politeReply = data.responseText || data.text || data.answer || 'I am your Fabric Mart Voice Support Agent.';
      
      let navTarget = null;
      const navMatch = politeReply.match(/\[NAVIGATE:\s*(.*?)\]/i);
      if (navMatch) {
        navTarget = navMatch[1].trim().toLowerCase();
        politeReply = politeReply.replace(navMatch[0], '').trim();
      }

      let shortAudio = politeReply;

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: 'assistant',
        text: politeReply,
        shortAudioAnswer: shortAudio,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.suggestedProducts,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak back short audio answer in polite human voice
      if (!voiceMuted && isOpenRef.current) {
        speakText(shortAudio, aiMsg.id);
      }

      if (navTarget && onNavigate) {
        if (navTarget === 'dashboard') {
          onNavigate(role === 'BUYER' ? 'buyer-dashboard' : 'supplier-dashboard');
        } else {
          onNavigate(navTarget);
        }
      }
    } catch (err) {
      console.error('Copilot voice query error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentState = isListening ? 'listening' : isLoading ? 'processing' : isSpeaking ? 'speaking' : 'idle';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end p-0 sm:p-5 bg-slate-950/40 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      {/* Modern Floating Widget Layout - Consistently Anchored at Bottom Right */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-[420px] h-[82vh] sm:h-[600px] max-h-[85vh] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-t-3xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col animate-slideUp overflow-hidden ring-1 ring-slate-900/5 dark:ring-white/10"
      >
        {/* Mobile sheet drag handle indicator */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-1.5 sm:hidden shrink-0" />
        
        {/* Modern Sleek Header */}
        <div className="p-3.5 sm:p-4 bg-white/50 dark:bg-slate-800/50 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <FMAgentVisualEmblem size="sm" state={currentState} />

            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                FM Copilot
                <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[9px] uppercase tracking-wider font-bold">3D AI</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isSeller ? 'Supplier Assistant' : 'Sourcing Assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  setVoiceMuted(!voiceMuted);
                }
              }}
              title={isSpeaking ? "Stop Voice Speaking" : voiceMuted ? "Unmute Voice Output" : "Mute Voice Output"}
              className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                isSpeaking
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 animate-pulse'
                  : voiceMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  : 'bg-blue-600/30 border-blue-500/50 text-blue-300 hover:bg-blue-600/50'
              }`}
            >
              {isSpeaking ? (
                <AudioLines className="w-4 h-4 text-emerald-400" />
              ) : voiceMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Disappear / Close Button */}
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              title="Close FM AGENT Sidebar"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Visual Haptic Feedback Panel for Voice Interactions */}
        <HapticFeedbackPanel
          state={currentState}
          transcriptText={inputMessage}
          onStop={() => {
            if (isListening && recognitionRef.current) recognitionRef.current.stop();
            stopSpeaking();
          }}
        />

        {/* Voice Conversation History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map((msg, index) => (
            <div
              key={msg.id || `msg-${index}`}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200 dark:border-slate-700'
                }`}
              >
                {msg.sender === 'assistant' ? (
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      <div className="prose dark:prose-invert max-w-none text-xs">
                        <Markdown>{msg.text}</Markdown>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => {
                          if (speakingMsgId === msg.id) {
                            stopSpeaking();
                          } else {
                            speakText(msg.shortAudioAnswer || msg.text, msg.id);
                          }
                        }}
                        className={`p-1.5 rounded-full transition-colors flex items-center gap-1.5 ${
                          speakingMsgId === msg.id
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
                            : 'bg-slate-100 text-slate-500 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <Square className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-bold">Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span className="text-[10px] font-bold">Listen</span>
                          </>
                        )}
                      </button>
                      
                      {speakingMsgId === msg.id && (
                        <div className="flex items-center gap-0.5">
                          <span className="w-1 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0ms]"></span>
                          <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                          <span className="w-1 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:300ms]"></span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="font-medium text-white">{msg.text}</p>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              <span>FM AGENT is analyzing textile parameters...</span>
            </div>
          )}
        </div>

        {/* Quick Voice Command Suggestion Chips */}
        <div className="p-2.5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-2 text-[11px] scrollbar-none shrink-0 hide-scrollbar">
          {isSeller ? (
            <>
              <button
                onClick={() => handleSendMessage(undefined, 'How do I update my inventory bulk?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
              >
                📦 Update Bulk
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'My dashboard analytics are missing.')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
              >
                📊 Missing Analytics
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'How do I process a refund for a buyer?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
              >
                💸 Process Refund
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'Where can I view my payout schedule?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
              >
                🗓️ Payout Schedule
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'Can I export my sales report?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 font-medium hover:border-amber-500 transition-colors"
              >
                📥 Export Sales
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleSendMessage(undefined, 'Where is my order?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
              >
                📦 Track Order
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'How do I return a defective fabric roll?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
              >
                ↩️ Returns
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'Can I change my shipping address?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
              >
                📍 Update Address
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'The marketplace page is not loading.')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
              >
                🌐 Page Error
              </button>
              <button
                onClick={() => handleSendMessage(undefined, 'How do I contact the supplier directly?')}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 font-medium hover:border-blue-500 transition-colors"
              >
                📞 Contact Supplier
              </button>
            </>
          )}
        </div>

        {/* Voice Visualizer Indicator & Diagnostics */}
        <div className="px-3">
          <VoiceInputVisualizer
            isListening={isListening}
            volumeLevel={volumeLevel}
            transcript={transcript || inputMessage}
            errorMsg={errorMsg}
            micPermission={micPermission}
            isFallbackMode={isFallbackMode}
            logs={logs}
            isCalibrating={isCalibrating}
            ambientNoiseLevel={ambientNoiseLevel}
            dynamicSilenceMs={dynamicSilenceMs}
            noiseCategory={noiseCategory}
            onStop={stopListening}
            onSelectPreset={(preset) => {
              setInputMessage(preset);
              stopListening();
              handleSendMessage(undefined, preset);
            }}
            title="FM Agent Voice Assistant"
          />
        </div>

        {/* Input Bar with Voice Button */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceListening}
              title={isListening ? "Stop Voice Listening" : "Start Voice Input"}
              className={`p-3 rounded-2xl font-bold flex items-center gap-1.5 transition-all ${
                isListening
                  ? 'bg-rose-600 text-white shadow-lg ring-4 ring-rose-400/40 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span className="text-xs hidden sm:inline">Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span className="text-xs hidden sm:inline">Tap Voice</span>
                </>
              )}
            </button>
          )}

          <input
            type="text"
            placeholder={
              isListening
                ? "Listening to your voice..."
                : isSeller
                ? "Ask FM AGENT about pricing, spec sheets..."
                : "Ask FM AGENT for fabric recommendations..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className={`flex-1 bg-slate-50 dark:bg-slate-800 border rounded-2xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 ${
              isListening
                ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/20'
                : 'border-slate-300 dark:border-slate-700 focus:ring-blue-600'
            }`}
          />

          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-[#081324] dark:bg-blue-600 text-white p-3 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
