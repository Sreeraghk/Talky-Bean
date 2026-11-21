import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MicOff, 
  X, 
  Settings2, 
  Volume2, 
  VolumeX, 
  Info, 
  RefreshCcw, 
  Pause, 
  Play, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  MessageSquare,
  Heart,
  Plane,
  Briefcase,
  Users,
  Compass,
  Home,
  Sparkles,
  CheckCheck
} from 'lucide-react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { useLocalMicVolume } from '../hooks/useLocalMicVolume';
import { LanguageLevel, VocabularyWord, Message, GrammarTip, SpeakingStyle } from '../types';
import { cn } from '../lib/utils';
import { AiService } from '../services/AiService';
import { voiceService } from '../services/VoiceService';
import { FluencyService } from '../services/FluencyService';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';
import { getLanguageConfig } from '../config/languages';
import { platformService } from '../services/PlatformService';
import { COMMON_ROLE_PLAY_SCENARIOS } from '../data/commonScenarios';

const translationCache: Record<string, string> = {};

/**
 * Strips SSML / HTML tag-like sequences (including nested or unclosed streaming tags)
 * using a deterministic character scanner so crafted inputs cannot leave behind partial tags
 * or angle brackets while preserving normal spoken text and punctuation.
 */
function stripMarkupTags(input: string): string {
  if (!input) return '';
  let result = '';
  let tagDepth = 0;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '<') {
      tagDepth++;
    } else if (ch === '>') {
      if (tagDepth > 0) {
        tagDepth--;
      }
    } else if (ch === '\n' && tagDepth > 0) {
      tagDepth = 0;
      result += ch;
    } else if (tagDepth === 0) {
      result += ch;
    }
  }

  return result.trim();
}

const getConnectingTheme = (scenarioId: string, title: string) => {
  const text = `${scenarioId} ${title}`.toLowerCase();
  if (text.includes('café') || text.includes('cafe') || text.includes('coffee') || text.includes('barista') || text.includes('restaurant')) {
    return {
      icon: <MessageSquare className="w-10 h-10 text-[#f59e0b]" strokeWidth={2.2} />,
      bg: 'bg-[#2d1b11]/80 border-[#b45309]/40',
      glow: 'bg-amber-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('romantic') || text.includes('girlfriend') || text.includes('partner') || text.includes('love') || text.includes('date')) {
    return {
      icon: <Heart className="w-10 h-10 text-[#f43f5e] fill-[#f43f5e]" strokeWidth={2} />,
      bg: 'bg-[#351121]/80 border-[#e11d48]/40',
      glow: 'bg-rose-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('airport') || text.includes('travel') || text.includes('flight') || text.includes('gate') || text.includes('hotel')) {
    return {
      icon: <Plane className="w-10 h-10 text-white fill-white" strokeWidth={1.8} />,
      bg: 'bg-[#122338]/80 border-[#0284c7]/40',
      glow: 'bg-sky-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('office') || text.includes('colleague') || text.includes('work') || text.includes('teammate') || text.includes('career')) {
    return {
      icon: <Briefcase className="w-10 h-10 text-[#2dd4bf]" strokeWidth={2.2} />,
      bg: 'bg-[#0c2226]/80 border-[#0d9488]/40',
      glow: 'bg-teal-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('bestfriend') || text.includes('friend') || text.includes('buddy') || text.includes('social')) {
    return {
      icon: <Users className="w-10 h-10 text-[#818cf8]" strokeWidth={2.2} />,
      bg: 'bg-[#161536]/80 border-[#6366f1]/40',
      glow: 'bg-indigo-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('mentor') || text.includes('guide') || text.includes('parent')) {
    return {
      icon: <Compass className="w-10 h-10 text-[#fbbf24]" strokeWidth={2.2} />,
      bg: 'bg-[#281d0f]/80 border-[#d97706]/40',
      glow: 'bg-amber-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80'
    };
  }
  if (text.includes('roommate') || text.includes('chore') || text.includes('home')) {
    return {
      icon: <Home className="w-10 h-10 text-[#34d399]" strokeWidth={2.2} />,
      bg: 'bg-[#0f2419]/80 border-[#059669]/40',
      glow: 'bg-emerald-500/25',
      fallbackImg: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80'
    };
  }
  return {
    icon: <Sparkles className="w-10 h-10 text-[#c084fc]" strokeWidth={2.2} />,
    bg: 'bg-[#221633]/80 border-[#a855f7]/40',
    glow: 'bg-purple-500/25',
    fallbackImg: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'
  };
};

const getScenarioFallbackGreeting = (lang: string, sId: string, title: string) => {
  const isDe = lang === 'de';
  const isEs = lang === 'es';
  const isFr = lang === 'fr';
  const isIt = lang === 'it';
  const textLower = `${sId} ${title}`.toLowerCase();

  if (textLower.includes('café') || textLower.includes('cafe') || textLower.includes('barista') || textLower.includes('coffee')) {
    if (isDe) return "Hallo! Willkommen in unserem Café. Was darf ich Ihnen heute bringen?";
    if (isEs) return "¡Hola! Bienvenido a nuestro café. ¿Qué te gustaría tomar hoy?";
    if (isFr) return "Bonjour ! Bienvenue dans notre café. Que puis-je vous servir aujourd'hui ?";
    if (isIt) return "Ciao! Benvenuto nel nostro bar. Cosa posso portarti oggi?";
    return "Hello! Welcome to our cozy café. What can I get started for you today?";
  }

  if (textLower.includes('romantic') || textLower.includes('partner') || textLower.includes('girlfriend') || textLower.includes('love')) {
    if (isDe) return "Hallo mein Schatz! Schön, dass du da bist. Wie war dein Tag heute?";
    if (isEs) return "¡Hola, cariño! Me alegro tanto de verte. ¿Cómo estuvo tu día?";
    if (isFr) return "Coucou mon cœur ! Ravie de te voir. Comment s'est passée ta journée ?";
    if (isIt) return "Ciao tesoro! Che bello vederti. Com'è andata la tua giornata?";
    return "Hey there! It's so nice to see you. How was your day today?";
  }

  if (textLower.includes('airport') || textLower.includes('travel') || textLower.includes('gate') || textLower.includes('flight')) {
    if (isDe) return "Guten Tag! Willkommen am Schalter. Wohin fliegen Sie heute?";
    if (isEs) return "¡Buenos días! Bienvenido al mostrador. ¿Hacia dónde vuela hoy?";
    if (isFr) return "Bonjour ! Bienvenue au comptoir. Vers quelle destination voyagez-vous aujourd'hui ?";
    if (isIt) return "Buongiorno! Benvenuto al banco. Verso quale destinazione vola oggi?";
    return "Good day! Welcome to the check-in desk. Where are you flying today?";
  }

  if (isDe) return "Hallo! Schön dich zu sehen. Worüber möchtest du heute sprechen?";
  if (isEs) return "¡Hola! Qué bueno verte. ¿De qué te gustaría hablar hoy?";
  if (isFr) return "Bonjour ! Ravi de te voir. De quoi aimerais-tu parler aujourd'hui ?";
  if (isIt) return "Ciao! Che bello vederti. Di cosa vorresti parlare oggi?";
  return "Hello! Great to see you. What would you like to talk about today?";
};

interface SpeakingInterfaceProps {
  level: LanguageLevel;
  languageCode: string;
  speakingStyle: SpeakingStyle;
  context: string;
  scenarioId: string;
  scenarioTitle?: string;
  scenarioDescription?: string;
  scenarioImageUrl?: string;
  initialMessages?: Message[];
  vocabulary: VocabularyWord[];
  onClose: (messages: Message[]) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
  onNewGrammarTip: (tip: Omit<GrammarTip, 'languageCode'>) => void;
  onSpeakingTimeUpdate: (minutes: number) => void;
  onMessagesUpdate?: (messages: Message[]) => void;
  onLevelChange?: (level: LanguageLevel) => void;
  onSpeedChange?: (speed: number) => void;
  autoMicOnDelay: number;
  isAutoMode: boolean;
  speed: number;
}

export function SpeakingInterface({ 
  level, 
  languageCode,
  speakingStyle,
  context, 
  scenarioId,
  scenarioTitle,
  scenarioDescription,
  scenarioImageUrl,
  initialMessages = [], 
  vocabulary, 
  onClose, 
  onNewWord,
  onNewGrammarTip,
  onSpeakingTimeUpdate,
  onMessagesUpdate,
  onLevelChange,
  onSpeedChange,
  autoMicOnDelay,
  isAutoMode,
  speed
}: SpeakingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isClosing, setIsClosing] = useState(false);

  const matchedCommon = COMMON_ROLE_PLAY_SCENARIOS.find(s => s.id === scenarioId);
  const displayTitle = scenarioTitle || matchedCommon?.title || (scenarioId ? scenarioId.replace(/[-_]/g, ' ') : "Conversation Partner");
  const displayDescription = scenarioDescription || matchedCommon?.description || "Get ready for a real-time conversation practice session.";
  const displayImageUrl = scenarioImageUrl || matchedCommon?.imageUrl;
  const partnerTheme = getConnectingTheme(scenarioId, displayTitle);
  const langConfig = getLanguageConfig(languageCode);
  const langName = langConfig?.name || 'Language';
  const langFlag = langConfig?.flag || '🌐';
  const activeBgImage = displayImageUrl || partnerTheme.fallbackImg;

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const [complexity, setComplexity] = useState<LanguageLevel>(level);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const [showGrammar, setShowGrammar] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<{ word: string; translation: string; x: number; y: number; isLoading?: boolean } | null>(null);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const currentlySpeakingIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentlySpeakingIdRef.current = currentlySpeakingId;
  }, [currentlySpeakingId]);

  // Play subtle and elegant assistant ping/chime when starting to listen
  useEffect(() => {
    if (isListening) {
      if (typeof window !== 'undefined') {
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const ctx = new AudioContextClass();
            const now = ctx.currentTime;
            
            // Note 1 (sweet warm note)
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(587.33, now); // D5
            
            gain1.gain.setValueAtTime(0, now);
            gain1.gain.linearRampToValueAtTime(0.08, now + 0.05);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.25);

            // Note 2 (beautiful ascending fourth)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
            
            gain2.gain.setValueAtTime(0, now + 0.08);
            gain2.gain.linearRampToValueAtTime(0.08, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.35);
          }
        } catch (e) {
          console.warn("Could not play listening audio chime:", e);
        }
      }
    }
  }, [isListening]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Initializing Bean...");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [voiceLevel, setVoiceLevel] = useState(0);
  const [suggestedWords, setSuggestedWords] = useState<{word: string, translation: string}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Clean Slate Strategy: Wipes session on Mount/Unmount
  useEffect(() => {
    setIsInitializing(true);
    
    // 1. Purge physical remnants & memory
    voiceService.stopListening();
    voiceService.stopSpeaking();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const wakeUp = new SpeechSynthesisUtterance(" ");
        wakeUp.volume = 0.01;
        window.speechSynthesis.speak(wakeUp);
      } catch (e) {}
    }

    // Keep screen awake during conversation practice on mobile devices
    if (platformService.isNative()) {
      KeepAwake.keepAwake().catch(() => {});
    }
    clearSession();
    setMessages([]); // Wipe messages immediately to ensure fresh start
    setCurrentTranscript("");
    setInterimTranscript("");
    setSuggestedWords([]);
    spokenMessageIdsRef.current.clear();
    pendingGrammarTipsRef.current = [];

    // 2. Platform & Context Deep Search
    setLoadingProgress(20);

    platformService.initialize()
      .then(async (config) => {
        setLoadingProgress(50);
        
        console.log(`[BuddyInit] ----------------------------------`);
        console.log(`[BuddyInit] Platform: ${config.type.toUpperCase()}`);
        console.log(`[BuddyInit] System Mode: ${config.sttEngine.toUpperCase()}/${config.ttsEngine.toUpperCase()}`);
        console.log(`[BuddyInit] Context: ${context}`);
        console.log(`[BuddyInit] Scenario: ${scenarioId}`);
        console.log(`[BuddyInit] ----------------------------------`);
        
        // Removed artificial "settling" delay for speed

        setLoadingProgress(80);

        if (config.isNative) {
          // PROACTIVE: Request permissions on first mount to avoid race conditions during talk
          await voiceService.requestPermissions().catch(() => {});
          return voiceService.checkPermissions().catch(() => true);
        }
        return true;
      })
      .then(() => {
        setLoadingProgress(100);
      })
      .catch((err) => {
        console.error("[BuddyInit] Platform initialization failed:", err);
        setError("Failed to initialize hardware. Please check your microphone permissions and try refreshing.");
      });

    return () => { 
      // 3. Destructive Cleanup on Unmount
      isStoppingRef.current = true;
      voiceService.stopListening();
      voiceService.stopSpeaking();
      if (platformService.isNative()) {
        KeepAwake.allowSleep().catch(() => {});
      }
      clearSession();
      console.log("[BuddyExit] Session Memory Purged.");
    };
  }, []);

  const handleClose = useCallback(async () => {
    console.log("[BuddyExit] Closing session... Clearing traces.");
    setIsClosing(true);
    
    // Stop all audio hardware immediately
    voiceService.stopListening();
    voiceService.stopSpeaking();
    window.speechSynthesis.cancel();
    
    // Calculate and save session stats before trashing memory
    const durationMins = (Date.now() - sessionStartTimeRef.current) / 60000;
    if (durationMins > 0.1) {
      onSpeakingTimeUpdate(durationMins);
      FluencyService.updateFluency(languageCode, level, 'speaking', { 
        durationMins, messageCount: messages.length,
        userMessages: messages.filter(m => m.sender === 'user').map(m => m.text)
      });
    }
    
    // 4. Closing Delay: Take 1.5 seconds to "trash" conversation history and close properly
    clearSession();
    await new Promise(r => setTimeout(r, 1500));
    
    onClose(messages);
  }, [messages, onClose, languageCode, level, onSpeakingTimeUpdate]);

  useEffect(() => {
    onMessagesUpdate?.(messages);
  }, [messages, onMessagesUpdate]);

  // Local-only volume monitoring to overrule native silence without cloud data consumption
  const { volume: lastVoiceLevel, startCapture: startLocalMic, stopCapture: stopLocalMic } = useLocalMicVolume();

  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const isRecognitionActiveRef = useRef(false);
  useEffect(() => {
    isRecognitionActiveRef.current = isRecognitionActive;
  }, [isRecognitionActive]);
  
  const isListeningRef = useRef(isListening);
  const setIsListeningWithRef = useCallback((val: boolean) => {
    setIsListening(val);
    isListeningRef.current = val;
  }, []);

  const isStoppingRef = useRef(false);
  const isAutoModeRef = useRef(isAutoMode);
  const autoMicOnDelayRef = useRef(autoMicOnDelay);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAiSpeakingRef = useRef(false);
  const isComponentMountedRef = useRef(true);
  const lastStartRequestTimeRef = useRef(0);
  const lastVoiceLevelRef = useRef(0);

  // Sync refs and voice level
  useEffect(() => {
    lastVoiceLevelRef.current = lastVoiceLevel;
    setVoiceLevel(lastVoiceLevel);
  }, [lastVoiceLevel]);

  const stopListening = useCallback(async () => {
    if (isStoppingRef.current) return;
    
    console.log("[Buddy] Stop Listening Sequence Initiated.");
    isStoppingRef.current = true;

    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    if (coldStartWatchdogRef.current) {
      clearTimeout(coldStartWatchdogRef.current);
      coldStartWatchdogRef.current = null;
    }

    // Capture the latest transcript state
    const finalTranscript = transcriptRef.current.trim() || interimRef.current.trim();
    console.log(`[Buddy] stopListening. Final: "${finalTranscript}", Processing: ${isProcessingRef.current}, Sent: ${isMessageSentRef.current}`);
    
    await voiceService.stopListening();
    stopLocalMic();

    setIsListeningWithRef(false);
    setIsRecognitionActive(false);
    isRecognitionActiveRef.current = false;

    if (finalTranscript.length > 0) {
      if (isProcessingRef.current) {
        console.warn(`[Buddy] Dropping handoff (AI is thinking).`);
      } else if (isMessageSentRef.current) {
        console.warn(`[Buddy] Dropping handoff (Already sent).`);
      } else {
        console.log(`[Buddy] >>> HANDOFF: "${finalTranscript}"`);
        isMessageSentRef.current = true;
        setSuggestedWords([]); 
        if (sendMessageRef.current) {
          sendMessageRef.current(finalTranscript)
            .then(() => {
              console.log("[Buddy] Message successfully hit AI pipeline.");
            })
            .catch((err: any) => {
              console.error("[Buddy] Connection fail during handoff:", err);
              setError(`Bean lost the connection: ${err?.message || 'Technical glitch'}. Tap to retry.`);
              isMessageSentRef.current = false; 
              isProcessingRef.current = false;
            });
        }
      }
    }

    // Reset transcripts AFTER the check
    setCurrentTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";
    
    setTimeout(() => {
      if (isComponentMountedRef.current) isStoppingRef.current = false;
    }, 1200); 
  }, [setIsListeningWithRef, stopLocalMic]);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
  }, [isAutoMode, isPaused]);

  useEffect(() => {
    autoMicOnDelayRef.current = autoMicOnDelay;
  }, [autoMicOnDelay]);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const sendMessageRef = useRef<any>(null);
  const isMessageSentRef = useRef(false);
  const sessionStartTimeRef = useRef(Date.now());
  const lastResultTimeRef = useRef(Date.now());
  const pendingGrammarTipsRef = useRef<string[]>([]);
  const currentAiMessageIdRef = useRef<string | null>(null);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());
  const lastSpokenTextRef = useRef<Record<string, string>>({});

  const coldStartWatchdogRef = useRef<NodeJS.Timeout | null>(null);

  const startListening = useCallback(async (isAutoTrigger = false) => {
    // 1. Guard check: Don't start if already active, in a busy state, or AI is currently talking
    if (isListeningRef.current || isPaused) {
      console.log("[Buddy] Mic start aborted: Already Active or Paused.");
      return;
    }

    // Force clear state if it's an auto-trigger to overcome ghost locks
    if (isAutoTrigger) {
      isAiSpeakingRef.current = false;
      isProcessingRef.current = false;
      isMessageSentRef.current = false;
    }

    if (isProcessingRef.current || isAiSpeakingRef.current) {
      console.log("[Buddy] Mic start aborted: System Busy (Processing/Speaking).");
      return;
    }

    const now = Date.now();
    // 2. Hardware Debounce: Prevent rapid toggling of the audio hardware
    if (now - lastStartRequestTimeRef.current < 1000) return;
    lastStartRequestTimeRef.current = now;

    // 3. Clear existing auto-mic timers to prevent phantom starts
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    console.log(`[Buddy] Launching STT Subsystem (Auto-Trigger: ${isAutoTrigger}, Language: ${languageCode})`);

    // 4. Initial state reset
    setIsListeningWithRef(true);
    setIsRecognitionActive(true);
    isRecognitionActiveRef.current = true;
    isStoppingRef.current = false;
    isMessageSentRef.current = false;
    setCurrentTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";
    lastResultTimeRef.current = Date.now();
    
    // Cold Start Watchdog: If no audio is received after 6s of "listening", reset hardware
    if (coldStartWatchdogRef.current) clearTimeout(coldStartWatchdogRef.current);
    coldStartWatchdogRef.current = setTimeout(() => {
      if (isListeningRef.current && !isStoppingRef.current && !transcriptRef.current && !interimRef.current) {
        console.log("[Buddy] Cold Start Timeout: Resetting hardware...");
        stopListening();
        // Notify user if it keeps happening
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
        } else {
          setError("Bean is having trouble hearing you. Try speaking louder or check your mic settings.");
        }
      }
    }, 6000);

    try {
      // 5. Hardware Activation
      // CRITICAL: On many browsers (especially mobile), opening a second AudioStream/Context 
      // via getUserMedia can lock the microphone hardware and prevent SpeechRecognition from firing.
      // We disable the redundant local visual monitor during active STT capture.
      // if (!platformService.isNative()) startLocalMic(); 
      
      const config = getLanguageConfig(languageCode);
      const targetLang = config.ttsLang || 'de-DE';
      
      // We await the setup of the speech recognizer
      await voiceService.startListening(
        targetLang, 
        (result) => {
          if (coldStartWatchdogRef.current) {
            clearTimeout(coldStartWatchdogRef.current);
            coldStartWatchdogRef.current = null;
          }
          if (isStoppingRef.current || isPaused) return;
          const cleanText = result.transcript.trim();
          if (!cleanText) return;

          lastResultTimeRef.current = Date.now();
          transcriptRef.current = cleanText;

          // AUTOMATIC HANDOFF: Check for stability on EVERY result (interim or final)
          const checkStable = () => {
            if (!isComponentMountedRef.current || !isListeningRef.current || isStoppingRef.current) return;
            const now = Date.now();
            const silenceDuration = now - lastResultTimeRef.current;
            
            // If the browser says it's final, we can be more aggressive (800ms)
            // If it's interim, we wait a bit longer (1500ms) to ensure the user didn't just pause to think
            const threshold = result.isFinal ? 800 : 1500;
            
            if (silenceDuration >= threshold) {
              console.log(`[Buddy] Stability reached (${silenceDuration}ms, Final=${result.isFinal}). Auto-handoff.`);
              stopListening();
            }
          };

          if (result.isFinal) {
            console.log(`[Buddy] FINAL result reached: "${cleanText}"`);
            setCurrentTranscript(cleanText);
            setInterimTranscript("");
            setTimeout(checkStable, 850);
          } else {
            console.log(`[Buddy] Interim result: "${cleanText}"`);
            interimRef.current = cleanText;
            setInterimTranscript(cleanText);
            // Even if it's interim, we start a watchdog to close the session if the user stops talking
            setTimeout(checkStable, 1550);
          }
        },
        (err) => {
          if (coldStartWatchdogRef.current) {
            clearTimeout(coldStartWatchdogRef.current);
            coldStartWatchdogRef.current = null;
          }
          console.warn("[Buddy] STT Logic notice:", err);
          if (err === 'no-speech') {
            console.log("[Buddy] Clean silence detected. No hardware error.");
          } else if (err === 'network-unreachable') {
            setError("Bean is having trouble reaching the speech servers. Please check your connection.");
          } else {
            setError(`Could not hear you well (${err}). Please try again or check your mic settings.`);
          }
          // Emergency shutdown on error to prevent broken states
          stopListening();
        },
        () => {
          // Hardware session naturally ended (silence / system timeout)
          if (isListeningRef.current && !isStoppingRef.current) {
            console.log("[Buddy] Mic hardware session ended naturally. Checking for results...");
            // Only stop if we haven't received anything for a bit, or if we have a final transcript
            stopListening();
          }
        }
      );
    } catch (error: any) {
      console.warn("[Buddy] Hardware session start notice:", error);
      setIsListeningWithRef(false);
      setIsRecognitionActive(false);
      isRecognitionActiveRef.current = false;
      setError("Could not access microphone. Please check permissions.");
    }
  }, [isPaused, languageCode, stopListening, startLocalMic, setIsListeningWithRef]);


  // Monitor Network Status
  useEffect(() => {
    const handleOnline = () => {
      if (error?.includes("stable internet connection")) setError(null);
    };
    const handleOffline = () => {
      if (isListeningRef.current) {
        setError("Bean lost connection. Please check your internet.");
        stopListening();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [error, stopListening]);

  const speakText = useCallback(async (text: string, messageId: string, onEnd?: () => void, isForce = true) => {
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    if (isMutedRef.current || isPaused) {
      setCurrentlySpeakingId(null);
      onEnd?.();
      return;
    }

    if (!isUnlocked) {
      setIsUnlocked(true);
    }
    
    isAiSpeakingRef.current = true;
    if (isListeningRef.current) {
      await voiceService.stopListening();
      setIsListeningWithRef(false);
    }
    
    voiceService.stopSpeaking();
    // Hardware settlement: Give the browser audio engine a moment to breathe before re-engaging
    await new Promise(r => setTimeout(r, 250)); 
    
    if (!isComponentMountedRef.current || isPaused) return;
    
    setCurrentlySpeakingId(messageId);
    isAiSpeakingRef.current = true;
    setIsAiSpeaking(true);

    try {
      await voiceService.speak({
        text,
        languageCode,
        rate: speedRef.current,
        isNaturalMode: true,
        gender: scenarioId === 'girlfriend' ? 'female' : undefined,
        onStart: () => {
          console.log("[Buddy] Physical speech hardware ENGAGED.");
        }
      });
      console.log("[Buddy] Speech output finished naturally.");
    } catch (error) {
      console.log("[Buddy] Speech output ended or interrupted:", (error as any)?.message || error);
    } finally {
      // ENSURE state is ALWAYS reset even on error
      if (currentlySpeakingIdRef.current === messageId) {
        setCurrentlySpeakingId(null);
      }
      
      // Hardware Handoff Buffer: Wait 150ms for browser to release hardware before clearing flags
      setTimeout(() => {
        if (!isComponentMountedRef.current) return;
        isAiSpeakingRef.current = false;
        setIsAiSpeaking(false);
        
        // Note: isProcessing and isMessageSent are managed by handleTranscriptUpdate 
        // and shouldn't be handled here to avoid early release during streaming.
        
        if (onEnd) onEnd();
      }, 150);
    }
  }, [languageCode, isPaused, isUnlocked, setIsUnlocked]);

  const handleTranscriptUpdate = useCallback((text: string, isUser: boolean, isFinal = true, shouldSpeak = false, translations?: Record<string, string>, suggestions?: {word: string, translation: string}[]) => {
    // RESET handoff block as soon as ANY new AI content arrives (proactive unlock)
    if (!isUser) {
      isMessageSentRef.current = false;
    }

    console.log("Transcript Update Received in UI:", text, "isUser:", isUser, "isFinal:", isFinal, "shouldSpeak:", shouldSpeak);
    
    // Manually ensure the ref is updated immediately when Buddy starts talking
    if (!isUser) {
      isInitializingRef.current = false;
      setIsInitializing(false);
    }
    
    if (!isUser) {
      if (isFinal && suggestions) {
        console.log(`[Buddy] Updating suggestions: ${suggestions.length} items`);
        setSuggestedWords(suggestions);
      }
      
      let messageId = currentAiMessageIdRef.current;
      if (!messageId) {
        messageId = Math.random().toString(36).substr(2, 9);
        currentAiMessageIdRef.current = messageId;
      }
      
      if (text.includes("---")) {
        const parts = text.split("---");
        let spokenText = parts[0].trim();
        let rawStudyNotes = parts[1] ? parts[1].trim() : "";
        
        // Strip SSML tags like <break time="300ms"/> for BOTH display and speech
        const cleanSpoken = stripMarkupTags(spokenText);
        
        let studyNotes = "";
        
        // Formulate highly polished, compact, human-readable Study Notes
        if (isFinal) {
          const wordPairs: string[] = [];
          const seenPairs = new Set<string>();
          
          if (translations && Object.keys(translations).length > 0) {
            Object.entries(translations).forEach(([key, val]) => {
              const normKey = key.trim().toLowerCase();
              const normVal = val.trim().toLowerCase();
              const pairId = [normKey, normVal].sort().join("->");
              
              if (!seenPairs.has(pairId)) {
                seenPairs.add(pairId);
                const k = key.trim().charAt(0).toUpperCase() + key.trim().slice(1);
                const v = val.trim().charAt(0).toUpperCase() + val.trim().slice(1);
                
                // Exclude any raw bracket metadata or JSON artifacts
                if (!k.includes("{") && !k.includes("}") && !k.includes("[") && !k.includes("]") &&
                    !v.includes("{") && !v.includes("}") && !v.includes("[") && !v.includes("]")) {
                  wordPairs.push(`• ${k}: ${v}`);
                }
              }
            });
          }
          
          if (wordPairs.length > 0) {
            studyNotes = wordPairs.join("   |   ");
          }
          
          if (pendingGrammarTipsRef.current.length > 0) {
            const formattedGrammar = pendingGrammarTipsRef.current
              .map(tip => `💡 ${tip.replace(/💡/g, '')}`)
              .join('   |   ');
            
            studyNotes = studyNotes 
              ? `${studyNotes}\n${formattedGrammar}` 
              : formattedGrammar;
            pendingGrammarTipsRef.current = [];
          }
          
          // Fallback to cleaned raw notes only if we don't have structured word pairs
          if (!studyNotes && rawStudyNotes) {
            const cleanRaw = rawStudyNotes
              .replace(/\[[A-Z_]+:[\s\S]*?\]/g, '')
              .replace(/\{[^\}]*\}/g, '')
              .replace(/[•\-\s]+$/g, '')
              .replace(/^[•\-\s]+/g, '')
              .trim();
            
            if (cleanRaw) {
              studyNotes = cleanRaw;
            }
          }
        } else {
          // While streaming, display simpler partial notes without JSON artifacts
          studyNotes = rawStudyNotes
            .replace(/\[[A-Z_]+:[\s\S]*?\]/g, '')
            .replace(/\{[^\}]*\}/g, '')
            .trim();
        }
        
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === messageId);
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingIndex] = {
              ...newMessages[existingIndex],
              text: cleanSpoken,
              studyNotes: isFinal ? (studyNotes || undefined) : undefined,
              translations: isFinal ? translations : newMessages[existingIndex].translations
            };
            return newMessages;
          }
          return [...prev, { 
            id: messageId!, 
            text: cleanSpoken, 
            sender: 'ai', 
            timestamp: Date.now(),
            studyNotes: isFinal ? (studyNotes || undefined) : undefined,
            translations
          }];
        });

        if (isFinal || shouldSpeak) {
          // Robust Speech Trigger: Only speak if we haven't spoken THIS text for THIS ID yet.
          // This allows streaming to start early, but prevents re-speaking the entire message 
          // when the 'isFinal' chunk arrives with metadata.
          const hasAlreadySpokenExactlyThis = lastSpokenTextRef.current[messageId] === cleanSpoken;
          
          if (hasAlreadySpokenExactlyThis) {
            if (isFinal) {
              currentAiMessageIdRef.current = null;
              delete lastSpokenTextRef.current[messageId];
            }
            return;
          }
          
          lastSpokenTextRef.current[messageId] = cleanSpoken;
          if (isFinal) currentAiMessageIdRef.current = null;
          
      speakText(cleanSpoken, messageId, () => {
        if (!isComponentMountedRef.current) return;
        
        // AUTO-MIC TRIGGER (Metadata Path)
        if (isAutoModeRef.current && !isPaused) {
          const delay = Math.max(1200, autoMicOnDelayRef.current * 1000); // Increased minimum for hardware clearance
          console.log(`[Buddy] Scheduling auto-mic in ${delay}ms after speech finishes.`);
          
          if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
          autoStartTimeoutRef.current = setTimeout(() => {
            // Re-check conditions before firing
            if (!isListeningRef.current && !isPaused && isAutoModeRef.current && !isAiSpeakingRef.current && !isProcessingRef.current) {
              console.log("[Buddy] Timer expired. Triggering startListening via AutoMode.");
              startListening(true);
            } else {
              console.log("[Buddy] Auto-mic skipped: System busy or inhibited.", { 
                isListening: isListeningRef.current, 
                isPaused, 
                isAiSpeaking: isAiSpeakingRef.current,
                isProcessing: isProcessingRef.current
              });
            }
          }, delay);
        }
      });
        }
      } else {
        const cleanText = stripMarkupTags(text);
        if (!cleanText && !isFinal) return; // Don't add a message bubble for empty interim updates
        
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === messageId);
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingIndex] = {
              ...newMessages[existingIndex],
              text: cleanText,
              translations: isFinal ? translations : newMessages[existingIndex].translations
            };
            return newMessages;
          }
          return [...prev, { 
            id: messageId!, 
            text: cleanText, 
            sender: 'ai', 
            timestamp: Date.now(),
            translations
          }];
        });

        if (isFinal || shouldSpeak) {
          // Robust Speech Trigger: Same logic for plain text responses
          const hasAlreadySpokenExactlyThis = lastSpokenTextRef.current[messageId] === cleanText;

          if (hasAlreadySpokenExactlyThis) {
            if (isFinal) {
              currentAiMessageIdRef.current = null;
              delete lastSpokenTextRef.current[messageId];
            }
            return;
          }
          
          lastSpokenTextRef.current[messageId] = cleanText;
          if (isFinal) currentAiMessageIdRef.current = null;
          
          speakText(cleanText, messageId, () => {
            if (!isComponentMountedRef.current) return;
            
            // AUTO-MIC TRIGGER (Direct Path)
            if (isAutoModeRef.current && !isPaused) {
              const delay = Math.max(1200, autoMicOnDelayRef.current * 1000); // Increased minimum for hardware clearance
              console.log(`[Buddy] Scheduling auto-mic in ${delay}ms after speech finishes (Direct).`);
              
              if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
              autoStartTimeoutRef.current = setTimeout(() => {
                if (!isListeningRef.current && !isPaused && isAutoModeRef.current && !isAiSpeakingRef.current && !isProcessingRef.current) {
                  console.log("[Buddy] Timer expired. Triggering startListening via Direct Path.");
                  startListening(true);
                } else {
                  console.log("[Buddy] Auto-mic skipped (Direct): System busy or inhibited.");
                }
              }, delay);
            }
          });
        }
      }
    } else {
      setMessages(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        text, 
        sender: 'user', 
        timestamp: Date.now() 
      }]);
    }
  }, [speakText, autoMicOnDelay]);

  const handleNewWordLearned = useCallback((word: string, translation: string) => {
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      word,
      translation,
      learnedAt: Date.now()
    });
  }, [onNewWord]);

  const handleGrammarTipReceived = useCallback((rule: string, explanation: string) => {
    pendingGrammarTipsRef.current.push(`${rule}: ${explanation}`);
    onNewGrammarTip({
      id: Math.random().toString(36).substr(2, 9),
      rule,
      explanation,
      learnedAt: Date.now()
    });
  }, [onNewGrammarTip]);

  const { isProcessing, sendMessage, clearSession } = useGeminiChat({
    level: complexity,
    languageCode,
    speakingStyle,
    context,
    scenarioId,
    vocabulary: vocabulary.filter(v => v.languageCode === languageCode),
    history: messages,
    onTranscriptUpdate: (text, isUser, isFinal, shouldSpeak, translations, suggestions) => {
      // CRITICAL: Any AI activity MUST release the loading gate
      if (!isUser) {
        setIsInitializing(false);
      }
      handleTranscriptUpdate(text, isUser, isFinal, shouldSpeak, translations, suggestions);
    },
    onNewWordLearned: handleNewWordLearned,
    onGrammarTip: handleGrammarTipReceived
  });

  useEffect(() => {
    isProcessingRef.current = isProcessing;
    sendMessageRef.current = sendMessage;
  }, [isProcessing, sendMessage]);

  // SAFETY PULSE: Ensure mic starts if we are idle and in auto mode
  useEffect(() => {
    if (isAutoMode && !isInitializing && !isPaused && !isProcessing && !isAiSpeaking && !isListening && !isStoppingRef.current) {
      // Use the user-configured delay, minimum 1.5s to avoid clipping the very end of AI audio tails
      const delay = Math.max(1500, autoMicOnDelay * 1000);
      
      const pulseTimeout = setTimeout(() => {
        if (isComponentMountedRef.current && !isListeningRef.current && !isAiSpeakingRef.current && !isProcessingRef.current && !isPaused && !isStoppingRef.current) {
          console.log("[Buddy] Idle state stable. Requesting auto-mic start.");
          startListening(true);
        }
      }, delay);
      
      return () => clearTimeout(pulseTimeout);
    }
  }, [isAutoMode, isInitializing, isPaused, isProcessing, isAiSpeaking, isListening, startListening, autoMicOnDelay]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
      isStoppingRef.current = true;
      if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
      
      // Stop the AI's ongoing stream to prevent zombie responses
      if (sendMessageRef.current) {
        sendMessageRef.current("STOP_ALL", true).catch(() => {});
      }

      stopLocalMic();
      voiceService.stopListening();
      voiceService.stopSpeaking();
      window.speechSynthesis.cancel();
    };
  }, []);

  // Keep screen awake during conversation
  useEffect(() => {
    let wakeLock: any = null;
    const enableKeepAwake = async () => {
      if (Capacitor.isNativePlatform()) {
        try { await KeepAwake.keepAwake(); } catch (err) { console.warn(err); }
      } else if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
          const handleVisibilityChange = async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
              try { wakeLock = await (navigator as any).wakeLock.request('screen'); } catch (e) {}
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);
        } catch (err) {}
      }
    };
    const disableKeepAwake = async () => {
      if (Capacitor.isNativePlatform()) {
        try { await KeepAwake.allowSleep(); } catch (err) {}
      }
      if (wakeLock) {
        try { await wakeLock.release(); wakeLock = null; } catch (err) {}
      }
    };
    enableKeepAwake();

    // Pre-check and request native permissions for a smooth native start
    const checkPerms = async () => {
      try {
        const hasPerm = await voiceService.checkPermissions();
        if (!hasPerm) {
          await voiceService.requestPermissions();
        }
      } catch (err) {
        console.warn("Permission pre-check failed:", err);
      }
    };
    checkPerms();

    return () => { disableKeepAwake(); };
  }, []);

  const [showBypass, setShowBypass] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastProcessedRetryRef = useRef(-1);

  const handleUnlock = useCallback(() => {
    console.log("[Buddy] Physical interaction detected. Unlocking audio hardware...");
    // 1. HARDWARE WAKE-UP (User Gesture)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const wakeUp = new SpeechSynthesisUtterance(" ");
        wakeUp.volume = 0.01; // Tiny standard audibility to bypass Safari iOS and mobile Chrome audio restrictions
        window.speechSynthesis.speak(wakeUp);
      } catch (e) {}
    }
    
    // 2. UNLOCK
    setIsUnlocked(true);
    setIsInitializing(false);
    
    // 3. REPLAY INITIAL MESSAGE (If one exists but was suppressed)
    const initialAiMessage = messages.find(m => m.sender === 'ai');
    if (initialAiMessage) {
      console.log("[Buddy] Replaying Suppressed Greeting:", initialAiMessage.text);
      speakText(initialAiMessage.text, initialAiMessage.id, () => {
        if (!isComponentMountedRef.current) return;
        
        // AUTO-MIC TRIGGER on greeting completion
        if (isAutoModeRef.current && !isPaused) {
          const delay = Math.max(1200, autoMicOnDelayRef.current * 1000);
          console.log(`[Buddy] Scheduling auto-mic in ${delay}ms after greeting finishes.`);
          
          if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
          autoStartTimeoutRef.current = setTimeout(() => {
            if (!isListeningRef.current && !isPaused && isAutoModeRef.current && !isAiSpeakingRef.current && !isProcessingRef.current) {
              console.log("[Buddy] Timer expired. Triggering startListening via Greeting unlock.");
              startListening(true);
            }
          }, delay);
        }
      }, true);
    }
  }, [speakText, messages, isPaused, startListening]);

  const isInitializingRef = useRef(isInitializing);
  useEffect(() => { isInitializingRef.current = isInitializing; }, [isInitializing]);

  useEffect(() => {
    if (isInitializing) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.max(0.1, (100 - prev) / 40);
        });
      }, 100);
      const bypassTimeout = setTimeout(() => setShowBypass(true), 25000);
      return () => { clearInterval(interval); clearTimeout(bypassTimeout); };
    } else {
      setLoadingProgress(100);
    }
  }, [isInitializing]);

  const hasInitiatedRef = useRef(false);
  const hasAutoReloadedRef = useRef(false);

  useEffect(() => {
    let statusInterval: NodeJS.Timeout;
    
    // STRICT GUARD: Only initiate once per component mounting
    if (!hasInitiatedRef.current || retryCount > lastProcessedRetryRef.current) {
      const isInitial = !hasInitiatedRef.current;
      hasInitiatedRef.current = true;
      lastProcessedRetryRef.current = retryCount;
      
      setIsInitializing(true); 
      setError(null);
      
      const statuses = ["Waking up your conversation partner...", "Preparing context...", "Almost ready!", "Connecting to Bean..."];
      let statusIdx = 0;
      statusInterval = setInterval(() => {
        if (isInitializingRef.current) {
          statusIdx = (statusIdx + 1) % statuses.length;
          setLoadingStatus(statuses[statusIdx]);
        }
      }, 3000);

      const runInitiation = async () => {
        // Automatic Reload Strategy: Automatically reset audio hardware safely
        if (isInitial || !hasAutoReloadedRef.current) {
          hasAutoReloadedRef.current = true;
          console.log("[Sync] Executing automatic session reload on Bean initiation...");
          voiceService.stopSpeaking();
          voiceService.stopListening();
          if (typeof window !== 'undefined' && window.speechSynthesis) {
            try {
              window.speechSynthesis.cancel();
              if (window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
            } catch (e) {}
          }
          spokenMessageIdsRef.current.clear();
          setMessages([]);
          // Allow audio hardware 100ms to settle cleanly
          await new Promise(r => setTimeout(r, 100));
        }

        try {
          await sendMessage("INITIATE_CONVERSATION", false);
          if (isInitializingRef.current) {
            console.log("[Sync] Initiation request reached completion.");
            setIsInitializing(false);
          }
        } catch (err: any) {
          console.warn("[Sync] Initial AI stream error:", err?.message || err);
          if (isInitializingRef.current) {
            setError(err?.message || "Unable to connect to Bean. Please tap Retry.");
          }
        }
      };

      runInitiation();

      return () => { 
        if (statusInterval) clearInterval(statusInterval);
      };
    }
  }, [sendMessage, retryCount]);

  const handleRetry = useCallback(() => {
    setError(null);
    setShowBypass(false);
    setLoadingStatus("Attempting to reconnect...");
    setRetryCount(prev => prev + 1);
  }, []);
  const forceStart = useCallback(() => { 
    setIsUnlocked(true); 
    setIsInitializing(false); 
    setError(null); 
  }, []);
  const prevComplexityRef = useRef(complexity);

  useEffect(() => {
    if (hasInitiatedRef.current && messages.length > 0 && prevComplexityRef.current !== complexity) {
      sendMessage(`I have changed my German level to ${complexity}.`, true);
      prevComplexityRef.current = complexity;
    }
  }, [complexity, sendMessage, messages.length]);

  const handleRefresh = useCallback(async () => {
    voiceService.stopSpeaking();
    voiceService.stopListening();
    spokenMessageIdsRef.current.clear();
    setMessages([]);
    setShowRefreshConfirm(false);
    hasInitiatedRef.current = true;
    sendMessage("INITIATE_CONVERSATION", true);
  }, [sendMessage]);

  useEffect(() => {
    if (!activeTooltip) return;
    const timer = setTimeout(() => {
      setActiveTooltip(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeTooltip]);

  const togglePause = useCallback(() => {
    if (!isPaused) {
      setIsPaused(true);
      if (isListeningRef.current) stopListening();
      voiceService.stopSpeaking();
      setCurrentlySpeakingId(null);
      if (autoStartTimeoutRef.current) { clearTimeout(autoStartTimeoutRef.current); autoStartTimeoutRef.current = null; }
    } else {
      setIsPaused(false);
    }
  }, [isPaused, stopListening]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0b0d14] text-zinc-100 overflow-hidden font-sans select-none"
    >
      {/* Cinematic Luxury Dark Theme Background (Reference: Image 2) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 bg-[#0b0d14]" />
        
        {/* Soft atmospheric amber & warm glow points */}
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="absolute top-1/3 -right-28 w-80 h-80 rounded-full bg-orange-600/8 blur-3xl" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[480px] h-60 rounded-full bg-amber-500/10 blur-3xl" />

        {/* SVG Flowing Organic Waves & Dot-Matrix Accent Pattern */}
        <svg 
          className="absolute inset-0 w-full h-full opacity-60" 
          xmlns="http://www.w3.org/2000/svg" 
          preserveAspectRatio="none" 
          viewBox="0 0 400 800"
        >
          <defs>
            <linearGradient id="warmDuneGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#92400e" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="warmDuneGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b45309" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#78350f" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="waveStrokeGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#d97706" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0.05" />
            </linearGradient>
            <pattern id="luxDotMatrix" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.9" fill="#d97706" fillOpacity="0.16" />
            </pattern>
          </defs>

          {/* Upper Right Dot Matrix Field */}
          <rect x="230" y="35" width="150" height="130" fill="url(#luxDotMatrix)" />
          {/* Lower Left Dot Matrix Field */}
          <rect x="15" y="440" width="110" height="140" fill="url(#luxDotMatrix)" />

          {/* Upper Ambient Wave Ribbons */}
          <path 
            d="M -40 50 Q 90 130, 220 70 T 450 130" 
            fill="none" 
            stroke="url(#waveStrokeGold)" 
            strokeWidth="1.2" 
          />
          <path 
            d="M -30 25 Q 100 100, 240 45 T 450 95" 
            fill="none" 
            stroke="url(#waveStrokeGold)" 
            strokeWidth="0.75" 
            strokeOpacity="0.6" 
          />

          {/* Lower Sweeping Organic Dune Ribbons */}
          <path 
            d="M -60 560 Q 70 480, 210 590 T 460 500 L 460 820 L -60 820 Z" 
            fill="url(#warmDuneGrad1)" 
          />
          <path 
            d="M -60 560 Q 70 480, 210 590 T 460 500" 
            fill="none" 
            stroke="url(#waveStrokeGold)" 
            strokeWidth="1.4" 
          />
          <path 
            d="M -40 640 Q 130 570, 270 690 T 460 620 L 460 820 L -40 820 Z" 
            fill="url(#warmDuneGrad2)" 
          />
          <path 
            d="M -40 640 Q 130 570, 270 690 T 460 620" 
            fill="none" 
            stroke="url(#waveStrokeGold)" 
            strokeWidth="1" 
            strokeOpacity="0.75" 
          />
        </svg>
      </div>

      {/* Top Header Buttons */}
      <button 
        onClick={togglePause}
        aria-label={isPaused ? "Resume conversation" : "Pause conversation"}
        className={cn(
          "absolute top-5 left-5 z-40 w-11 h-11 rounded-full backdrop-blur-md border shadow-md transition-all active:scale-95 flex items-center justify-center cursor-pointer",
          isPaused 
            ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30" 
            : "bg-white/[0.08] hover:bg-white/[0.15] border-white/10 text-zinc-300 hover:text-white"
        )}
      >
        {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
      </button>

      <button 
        onClick={handleClose} 
        aria-label="Exit conversation" 
        className="absolute top-5 right-5 z-40 w-11 h-11 bg-red-500/90 hover:bg-red-600 text-white rounded-full shadow-lg shadow-red-500/25 border border-red-400/30 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
      >
        <X size={20} strokeWidth={2.6} />
      </button>

      <AnimatePresence>
        {isClosing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#0b0d14]/95 z-[200] flex flex-col items-center justify-center p-6 text-center backdrop-blur-md"
          >
            <div className="relative mb-8">
              <motion.div 
                animate={{ scale: [1, 1.15, 1], rotate: [0, -360] }} 
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/20"
              >
                <X size={40} className="text-red-400" />
              </motion.div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Ending Session</h2>
              <p className="text-zinc-400 text-xs font-medium">Releasing audio resources & saving progress...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && !isInitializing && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-4 right-4 sm:left-6 sm:right-6 z-[60] p-4 bg-red-500/15 border border-red-500/30 text-white rounded-2xl shadow-2xl backdrop-blur-md flex flex-col gap-3"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="shrink-0 text-red-400" />
                <p className="text-sm font-medium leading-tight text-red-200">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>
            {error.includes("Microphone") && (
              <button 
                onClick={async () => {
                  setError(null);
                  try {
                    await startListening();
                  } catch (err) {
                    setError("Could not access microphone.");
                  }
                }} 
                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                Try Again
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div className="relative z-10 flex-1 overflow-y-auto pt-20 pb-6 space-y-6 px-4 sm:px-6 md:px-8 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex flex-col max-w-[88%] sm:max-w-[82%]", 
              msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div 
              className={cn(
                "p-4 sm:p-5 text-base sm:text-[17px] leading-relaxed shadow-lg transition-all",
                msg.sender === 'user' 
                  ? "bg-[#1f1917]/90 text-[#f5ede6] rounded-2xl sm:rounded-3xl border border-amber-600/45 shadow-[0_0_20px_rgba(217,119,6,0.12)] backdrop-blur-md" 
                  : "bg-[#131620]/85 text-zinc-100 rounded-2xl sm:rounded-3xl border border-amber-500/25 shadow-[0_0_20px_rgba(217,119,6,0.06)] backdrop-blur-md"
              )}
            >
              <div className={cn("flex flex-wrap gap-x-1.5", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                {(msg.text || "").split(' ').map((word, i) => {
                  const cleanWord = word.toLowerCase().replace(/[.,!?()[\]{}:;"'‘’“”]/g, '').trim();
                  const cachedTranslation = msg.translations?.[cleanWord];
                  const hasTranslation = msg.sender === 'ai' && !!cachedTranslation;

                  return (
                    <motion.span 
                      key={i}
                      onClick={hasTranslation ? (e) => {
                        e.stopPropagation();
                        setActiveTooltip({ word, translation: cachedTranslation!, x: e.clientX, y: e.clientY });
                        onNewWord({ 
                          id: Math.random().toString(36).substr(2, 9), 
                          word: cachedTranslation!, 
                          translation: word, 
                          learnedAt: Date.now() 
                        });
                      } : undefined}
                      className={cn(
                        hasTranslation 
                          ? "cursor-pointer font-bold text-amber-400 underline decoration-amber-500/80 decoration-2 underline-offset-4 hover:text-amber-300 transition-colors" 
                          : "font-normal"
                      )}
                    >
                      {word}
                    </motion.span>
                  );
                })}
              </div>

              {msg.studyNotes && msg.id !== currentlySpeakingId && (
                <div className="mt-3.5 pt-3 border-t border-amber-500/20 text-xs sm:text-sm text-zinc-400 italic">
                  <div className="flex items-center gap-1.5 mb-1.5 text-amber-400 not-italic font-bold uppercase text-[10px] tracking-wider">
                    <Info size={12} /> Study Notes
                  </div>
                  {msg.studyNotes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 mt-1.5 px-1">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                {msg.sender === 'user' ? 'YOU' : 'BEAN'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.sender === 'user' && (
                  <CheckCheck className="w-3.5 h-3.5 text-amber-500 inline ml-0.5" strokeWidth={2.4} />
                )}
              </span>

              {msg.sender === 'ai' && (
                <button 
                  onClick={() => speakText(msg.text, msg.id, undefined, true)}
                  className={cn(
                    "p-1 rounded-full transition-all hover:bg-white/10 ml-0.5 cursor-pointer",
                    msg.id === currentlySpeakingId ? "text-amber-400 animate-pulse" : "text-zinc-500 hover:text-amber-400"
                  )}
                  title="Speak message"
                >
                  <Volume2 size={12} className={cn(msg.id === currentlySpeakingId && "animate-bounce")} />
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />

        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-10 gap-3.5">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1.3, ease: "linear" }} 
              className="w-11 h-11 rounded-full border-[3px] border-amber-500/20 border-t-amber-500 border-r-amber-500/60 shadow-[0_0_18px_rgba(245,158,11,0.3)]" 
            />
            <p className="text-zinc-400 text-[11px] font-bold uppercase tracking-[0.28em]">
              Bean is thinking...
            </p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ left: activeTooltip.x, top: activeTooltip.y - 60 }}
            className="fixed z-[100] -translate-x-1/2 bg-[#1b1716]/95 text-zinc-100 border border-amber-500/40 px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400/80">{activeTooltip.word}</div>
            <div className="text-sm font-bold flex items-center gap-2 text-white">
              {activeTooltip.translation}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-[#1b1716]" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isUnlocked && !isInitializing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#0a0d14] z-[140] flex flex-col items-center justify-between p-6 sm:p-8 text-center overflow-hidden"
          >
            {/* Scenic background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img 
                src={activeBgImage} 
                alt="" 
                className="w-full h-full object-cover scale-110 filter blur-xl opacity-30 select-none transform-gpu" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/90 via-[#0a0d14]/85 to-[#0a0d14]" />
              <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none ${partnerTheme.glow}`} />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 shadow-sm">
                <span className="text-base">{langFlag}</span>
                <span className="text-xs font-semibold text-white/90">{langName}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Level {complexity}</span>
              </div>
              <button 
                onClick={handleClose} 
                aria-label="Close session" 
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-md cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Center Content */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md my-auto py-6 space-y-6">
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.1, 0.35] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className={`absolute w-36 h-36 rounded-3xl blur-md ${partnerTheme.glow}`}
                />
                <div className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ${partnerTheme.bg} backdrop-blur-xl border flex flex-col items-center justify-center shadow-2xl`}>
                  <Volume2 size={44} className="text-amber-400" />
                </div>
              </div>

              <div className="space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold tracking-widest text-emerald-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  BEAN IS READY
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm font-sans">
                  {displayTitle}
                </h2>
                <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed font-normal max-w-xs mx-auto">
                  {displayDescription}
                </p>
              </div>

              <button 
                onClick={handleUnlock}
                className="w-full max-w-xs py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-2xl font-bold text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all cursor-pointer uppercase tracking-wider"
              >
                <Play size={20} fill="currentColor" />
                Start Talking
              </button>
            </div>

            {/* Footer */}
            <div className="relative z-10 pb-4 pt-2 text-[11px] text-zinc-500 font-medium flex items-center justify-center gap-1.5">
              <Volume2 size={13} className="text-zinc-400" />
              <span>Tap Start Talking to begin your live voice role-play</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-[#0a0d14] z-[150] flex flex-col items-center justify-between p-6 sm:p-8 text-center overflow-hidden"
          >
            {/* Atmospheric Scenic Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <img 
                src={activeBgImage} 
                alt="" 
                className="w-full h-full object-cover scale-110 filter blur-xl opacity-30 select-none transform-gpu" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d14]/90 via-[#0a0d14]/85 to-[#0a0d14]" />
              <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-40 pointer-events-none ${partnerTheme.glow}`} />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 w-full max-w-md flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 shadow-sm">
                <span className="text-base">{langFlag}</span>
                <span className="text-xs font-semibold text-white/90">{langName}</span>
                <span className="text-white/30 text-xs">·</span>
                <span className="text-xs font-bold text-orange-400 uppercase tracking-wide">Level {complexity}</span>
              </div>
              <button 
                onClick={handleClose} 
                aria-label="Close session" 
                className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.18] active:scale-95 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all shadow-md cursor-pointer"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Center Visual & Title Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md my-auto py-6 space-y-6">
              {/* Glowing Beacon Squircle */}
              <div className="relative flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.08, 0.35] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className={`absolute w-36 h-36 rounded-3xl blur-md ${partnerTheme.glow}`}
                />
                
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl ${partnerTheme.bg} backdrop-blur-xl border flex flex-col items-center justify-center shadow-2xl overflow-hidden`}
                >
                  <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                      animate={{ y: [0, -3, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    >
                      {partnerTheme.icon}
                    </motion.div>
                    
                    {/* Equalizer Waveform Bars */}
                    <div className="flex items-center gap-1 mt-2.5">
                      {[0.35, 0.85, 0.55, 1.0, 0.45].map((scale, i) => (
                        <motion.span
                          key={i}
                          animate={error ? { scaleY: 0.2 } : { scaleY: [0.25, scale, 0.25] }}
                          transition={{ repeat: Infinity, duration: 0.9 + i * 0.18, ease: "easeInOut" }}
                          className="w-1 h-3.5 bg-gradient-to-t from-orange-500 to-amber-300 rounded-full origin-bottom"
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Subtle shine diagonal */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-transparent pointer-events-none" />
                </motion.div>
              </div>

              {/* Typography & Mission */}
              <div className="space-y-3 px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-[11px] font-bold tracking-widest text-orange-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  {error ? "CONNECTION ISSUE" : "CONNECTING TO BEAN"}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm font-sans">
                  {displayTitle}
                </h2>

                <p className="text-sm sm:text-base text-zinc-300/90 leading-relaxed font-normal max-w-xs mx-auto">
                  {error ? (error || "Unable to establish voice link") : displayDescription}
                </p>
              </div>

              {/* Progress Bar & Status */}
              <div className="w-full max-w-xs space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                  <span className="truncate max-w-[200px]">
                    {error ? "Setup failed" : (loadingStatus || "Preparing speech engine...")}
                  </span>
                  {!error && (
                    <span className="font-bold text-orange-400">{Math.round(loadingProgress)}%</span>
                  )}
                </div>

                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 backdrop-blur-sm border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${error ? 100 : loadingProgress}%` }} 
                    transition={{ duration: 0.3 }}
                    className={`h-full rounded-full ${
                      error 
                        ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' 
                        : 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.6)]'
                    }`}
                  />
                </div>
              </div>

              {/* Error Card if error occurs or bypass is shown */}
              {(error || showBypass) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-sm max-w-xs w-full space-y-3"
                >
                  <div className="flex items-start gap-2.5 text-red-400 text-left">
                    <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
                    <p className="text-xs leading-relaxed text-red-200">
                      {error || "AI partner is taking a moment to respond. Please tap Retry to reconnect."}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleRetry} 
                      className="flex-1 min-h-[44px] py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCcw size={13} />
                      Retry
                    </button>
                    <button 
                      onClick={handleClose} 
                      className="min-h-[44px] py-2.5 px-4 bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="relative z-10 pb-4 pt-2 text-[11px] text-zinc-500 font-medium flex items-center justify-center gap-1.5">
              <Volume2 size={13} className="text-zinc-400" />
              <span>Interactive voice enabled · Headset or speaker recommended</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRefreshConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 transform-gpu will-change-[opacity]"
          >
            <motion.div 
              initial={{ scale: 0.96, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.96, opacity: 0, y: 10 }} 
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#151720]/95 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center border border-amber-500/25 transform-gpu will-change-transform"
            >
              <div className="w-16 h-16 bg-amber-500/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
                <RefreshCcw size={28} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Refresh Conversation?</h3>
              <p className="text-zinc-400 mb-8 text-sm">This will clear all current messages and start a fresh conversation.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRefreshConfirm(false)} 
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-300 bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRefresh} 
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {suggestedWords.length > 0 && !isProcessing && !isInitializing && (
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="px-4 pb-3 max-w-4xl mx-auto w-full flex flex-col items-center transform-gpu relative z-10"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="h-px w-8 bg-amber-500/20" />
              <button 
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#151720]/80 border border-amber-500/30 text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer backdrop-blur-md"
                title={showSuggestions ? "Hide Helping Words" : "Show Helping Words"}
              >
                {showSuggestions ? <EyeOff size={11} /> : <Eye size={11} />}
                {showSuggestions ? "Hide Hints" : "Show Hints"}
              </button>
              <div className="h-px w-8 bg-amber-500/20" />
            </div>

            <AnimatePresence mode="wait">
              {showSuggestions ? (
                <motion.div 
                  key="suggestions-visible"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-xl bg-[#141620]/95 backdrop-blur-md rounded-2xl border border-amber-500/30 p-4 shadow-xl flex flex-col gap-2 font-sans overflow-hidden transform-gpu"
                >
                  {suggestedWords.map((item, idx) => {
                    const cleanWord = item.word.replace(/^[,\s\-\.]+/, '').trim();
                    const cleanTranslation = item.translation.replace(/^[,\s\-\.]+/, '').trim();
                    if (!cleanWord && !cleanTranslation) return null;
                    return (
                      <div 
                        key={idx}
                        className="flex items-start gap-2.5 text-left text-sm py-1 border-b border-white/[0.06] last:border-0"
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                        <p className="text-zinc-300 leading-relaxed select-text">
                          <span className="font-semibold text-white text-sm">{cleanWord}</span>
                          <span className="mx-2 text-amber-400/80 font-bold">-</span>
                          <span className="italic text-amber-400 font-medium">{cleanTranslation}</span>
                        </p>
                      </div>
                    );
                  })}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls Dock (Reference: Image 2) */}
      <div className="relative z-20 px-6 py-5 border-t border-white/[0.06] bg-[#0c0e15]/85 backdrop-blur-xl shadow-[0_-10px_35px_rgba(0,0,0,0.6)]">
        <div className="max-w-md mx-auto flex items-center justify-between px-2 sm:px-6">
          {/* Refresh / Clear Button */}
          <div className="w-14 sm:w-16 flex justify-start">
            <button 
              onClick={() => setShowRefreshConfirm(true)} 
              aria-label="Refresh conversation"
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-zinc-400 hover:text-zinc-200 flex items-center justify-center shadow-lg active:scale-95 transition-all group cursor-pointer"
            >
              <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500 text-zinc-400 group-hover:text-amber-400" />
            </button>
          </div>

          {/* Central Talk / Mic Button */}
          <div className="relative flex items-center justify-center">
            {isListening && (
              <motion.div 
                animate={{ scale: [1, 1.45, 1], opacity: [0.4, 0, 0.4] }} 
                transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} 
                className="absolute inset-0 -m-2 rounded-full bg-red-500/30 blur-md pointer-events-none" 
              />
            )}
            
            <button 
              onClick={() => {
                if (typeof window !== 'undefined' && window.speechSynthesis) {
                  try {
                    window.speechSynthesis.cancel();
                    const wakeUp = new SpeechSynthesisUtterance(" ");
                    wakeUp.volume = 0.01;
                    window.speechSynthesis.speak(wakeUp);
                  } catch (e) {}
                }

                setIsUnlocked(true);

                if (isListening) {
                  stopListening();
                } else {
                  isStoppingRef.current = false;
                  startListening();
                }
              }} 
              disabled={isPaused || isProcessing || currentlySpeakingId !== null} 
              aria-label={isListening ? "Stop listening" : "Talk to Bean"}
              className={cn(
                "relative w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 z-10 cursor-pointer shadow-xl",
                isListening 
                  ? "bg-gradient-to-b from-red-500 to-red-600 border-2 border-red-400 text-white shadow-[0_0_35px_rgba(239,68,68,0.5)]" 
                  : (isPaused || isProcessing || currentlySpeakingId !== null) 
                    ? "bg-[#16171d] border border-white/[0.06] text-zinc-600 opacity-60 cursor-not-allowed" 
                    : "bg-gradient-to-b from-[#251d19] to-[#161210] border-2 border-amber-600/50 shadow-[0_0_28px_rgba(217,119,6,0.3)] hover:border-amber-500 hover:shadow-[0_0_36px_rgba(217,119,6,0.45)] text-amber-400"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                {isListening ? (
                  <MicOff size={28} className="text-white" />
                ) : (
                  <Mic size={28} className={cn((isPaused || isProcessing || currentlySpeakingId !== null) ? "text-zinc-600" : "text-amber-400")} />
                )}
                <span className={cn(
                  "font-black text-[9px] tracking-widest uppercase mt-0.5",
                  isListening ? "text-white" : (isPaused || isProcessing || currentlySpeakingId !== null) ? "text-zinc-600" : "text-amber-400"
                )}>
                  {isListening ? "Stop" : "Talk"}
                </span>
              </div>
            </button>
          </div>

          {/* Volume Mute Toggle */}
          <div className="w-14 sm:w-16 flex justify-end">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              aria-label={isMuted ? "Unmute assistant" : "Mute assistant"}
              className={cn(
                "w-13 h-13 sm:w-14 sm:h-14 rounded-full border flex items-center justify-center shadow-lg active:scale-95 transition-all cursor-pointer",
                isMuted 
                  ? "bg-red-500/15 border-red-500/40 text-red-400" 
                  : "bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-zinc-400 hover:text-zinc-200 hover:text-amber-400"
              )}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
