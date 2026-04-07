import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Settings2, Volume2, VolumeX, Info, RefreshCcw, Pause, Play } from 'lucide-react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { LanguageLevel, VocabularyWord, Message, GrammarTip, SpeakingStyle } from '../types';
import { cn } from '../lib/utils';
import { AiService } from '../services/AiService';
import { voiceService } from '../services/VoiceService';
import { FluencyService } from '../services/FluencyService';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

const translationCache: Record<string, string> = {};

interface SpeakingInterfaceProps {
  level: LanguageLevel;
  languageCode: string;
  speakingStyle: SpeakingStyle;
  context: string;
  scenarioId: string;
  initialMessages?: Message[];
  vocabulary: VocabularyWord[];
  onClose: (messages: Message[]) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
  onNewGrammarTip: (tip: Omit<GrammarTip, 'languageCode'>) => void;
  onSpeakingTimeUpdate: (minutes: number) => void;
  onLevelChange?: (level: LanguageLevel) => void;
  onSpeedChange?: (speed: number) => void;
  autoMicOnDelay: number;
  autoMicOffDelay: number;
  isAutoMode: boolean;
  speed: number;
}

export function SpeakingInterface({ 
  level, 
  languageCode,
  speakingStyle,
  context, 
  scenarioId,
  initialMessages = [], 
  vocabulary, 
  onClose, 
  onNewWord,
  onNewGrammarTip,
  onSpeakingTimeUpdate,
  onLevelChange,
  onSpeedChange,
  autoMicOnDelay,
  autoMicOffDelay,
  isAutoMode,
  speed
}: SpeakingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
  const [translation, setTranslation] = useState<{ word: string; translation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const [visibleCharIndex, setVisibleCharIndex] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const autoMicOffDelayRef = useRef(autoMicOffDelay);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startListeningRef = useRef<((isAuto?: boolean | React.MouseEvent) => void) | null>(null);
  const isRestartingRef = useRef(false);
  const isAiSpeakingRef = useRef(false);
  const lastResultTimeRef = useRef(Date.now());
  const silenceMonitorIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startSilenceMonitor = useCallback(() => {
    if (silenceMonitorIntervalRef.current) clearInterval(silenceMonitorIntervalRef.current);
    lastResultTimeRef.current = Date.now();
    
    silenceMonitorIntervalRef.current = setInterval(() => {
      if (!isListeningRef.current || isStoppingRef.current || isAiSpeakingRef.current || isPaused) return;
      
      const silenceDuration = (Date.now() - lastResultTimeRef.current) / 1000;
      // Use a more generous initial silence limit (8s) if nothing has been said yet
      const limit = transcriptRef.current.trim() === "" 
        ? Math.max(8, autoMicOffDelayRef.current) 
        : autoMicOffDelayRef.current;
        
      if (silenceDuration >= limit) {
        console.log(`Silence limit reached (${silenceDuration.toFixed(1)}s >= ${limit}s). Stopping.`);
        stopListening();
      }
    }, 500);
  }, [isPaused]);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
  }, [isAutoMode]);

  useEffect(() => {
    autoMicOnDelayRef.current = autoMicOnDelay;
  }, [autoMicOnDelay]);

  useEffect(() => {
    autoMicOffDelayRef.current = autoMicOffDelay;
  }, [autoMicOffDelay]);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const isProcessingRef = useRef(false);
  const sendMessageRef = useRef<any>(null);
  const isMessageSentRef = useRef(false);
  const sessionStartTimeRef = useRef(Date.now());
  const pendingGrammarTipsRef = useRef<string[]>([]);
  const currentAiMessageIdRef = useRef<string | null>(null);

  const stopListening = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    console.log("stopListening called");

    if (silenceMonitorIntervalRef.current) {
      clearInterval(silenceMonitorIntervalRef.current);
      silenceMonitorIntervalRef.current = null;
    }

    await voiceService.stopListening();
    setIsListeningWithRef(false);
    setIsRecognitionActive(false);
    isRecognitionActiveRef.current = false;

    const fullTranscript = transcriptRef.current.trim();
    if (fullTranscript && !isProcessingRef.current && !isMessageSentRef.current) {
      isMessageSentRef.current = true;
      if (sendMessageRef.current) {
        sendMessageRef.current(fullTranscript);
      }
      setCurrentTranscript("");
      setInterimTranscript("");
      transcriptRef.current = "";
      interimRef.current = "";
    }
    
    setTimeout(() => {
      isStoppingRef.current = false;
    }, 1000);
  }, [setIsListeningWithRef]);

  const startListening = useCallback(async (isAuto: boolean | React.MouseEvent = false) => {
    const autoMode = typeof isAuto === 'boolean' ? isAuto : false;
    console.log("startListening called, autoMode:", autoMode);
    
    if (isPaused || isProcessingRef.current || currentlySpeakingId || isRecognitionActiveRef.current || isStoppingRef.current || isAiSpeakingRef.current) {
      console.log("Cannot start listening: paused, processing, speaking, active, stopping, or AI speaking");
      return;
    }

    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    let hasPermission = await voiceService.checkPermissions();
    if (!hasPermission) {
      hasPermission = await voiceService.requestPermissions();
      if (!hasPermission) {
        setError("Microphone permission denied");
        return;
      }
    }

    setIsListeningWithRef(true);
    setIsRecognitionActive(true);
    isRecognitionActiveRef.current = true;
    isRestartingRef.current = false;
    isMessageSentRef.current = false;
    setCurrentTranscript("");
    setInterimTranscript("");
    transcriptRef.current = "";
    interimRef.current = "";

    if (isAutoModeRef.current) {
      startSilenceMonitor();
    }

    const startEngine = async () => {
      voiceService.startListening('de-DE', 
        (result) => {
          if (isStoppingRef.current || isAiSpeakingRef.current) return;
          lastResultTimeRef.current = Date.now();
          transcriptRef.current = result.transcript;
          setCurrentTranscript(result.transcript);
          setInterimTranscript("");
          interimRef.current = "";
        },
        (error) => {
          console.error("Speech recognition error:", error);
          setIsListeningWithRef(false);
          setIsRecognitionActive(false);
          isRecognitionActiveRef.current = false;
          isRestartingRef.current = false;
        },
        () => {
          console.log("Speech recognition engine ended naturally");
          // If the engine stopped but we are still supposed to be listening (auto-mic window), restart it
          if (isListeningRef.current && !isStoppingRef.current && !isAiSpeakingRef.current && !isPaused) {
            console.log("Restarting speech recognition engine to maintain window...");
            startEngine();
          } else if (!isStoppingRef.current) {
            stopListening();
          }
        }
      );
    };

    await startEngine();
  }, [isPaused, currentlySpeakingId, stopListening, setIsListeningWithRef, startSilenceMonitor]);

  const speakText = useCallback(async (text: string, messageId: string, onEnd?: () => void) => {
    if (isMutedRef.current || isPaused) {
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      onEnd?.();
      return;
    }
    
    isAiSpeakingRef.current = true;
    if (isListeningRef.current) {
      stopListening();
    }
    
    voiceService.stopSpeaking();
    setCurrentlySpeakingId(messageId);
    setVisibleCharIndex(0);

    try {
      await voiceService.speak({
        text,
        languageCode,
        rate: speedRef.current,
        useGeminiTTS: true
      });
      
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      isAiSpeakingRef.current = false;
      onEnd?.();
    } catch (error) {
      console.error("Speech error:", error);
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      isAiSpeakingRef.current = false;
      onEnd?.();
    }
  }, [stopListening, languageCode, isPaused]);

  const handleTranscriptUpdate = useCallback((text: string, isUser: boolean, isFinal = true) => {
    console.log("Transcript Update Received in UI:", text, "isUser:", isUser, "isFinal:", isFinal);
    
    if (!isUser) {
      let messageId = currentAiMessageIdRef.current;
      if (!messageId) {
        messageId = Math.random().toString(36).substr(2, 9);
        currentAiMessageIdRef.current = messageId;
      }
      
      if (text.includes("---")) {
        const parts = text.split("---");
        const spokenText = parts[0].trim();
        let studyNotes = parts[1].trim();
        
        if (pendingGrammarTipsRef.current.length > 0) {
          studyNotes = `Grammar Tip: ${pendingGrammarTipsRef.current.join('\n')}\n\n${studyNotes}`;
          pendingGrammarTipsRef.current = [];
        }
        
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === messageId);
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingIndex] = {
              ...newMessages[existingIndex],
              text: spokenText,
              studyNotes: isFinal ? studyNotes : undefined
            };
            return newMessages;
          }
          return [...prev, { 
            id: messageId!, 
            text: spokenText, 
            sender: 'ai', 
            timestamp: Date.now(),
            studyNotes: isFinal ? studyNotes : undefined
          }];
        });

        if (isFinal) {
          currentAiMessageIdRef.current = null;
          speakText(spokenText, messageId, () => {
            if (isAutoModeRef.current) {
              if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
              autoStartTimeoutRef.current = setTimeout(() => {
                startListeningRef.current?.(true);
              }, autoMicOnDelayRef.current * 1000);
            }
          });
        }
      } else {
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === messageId);
          if (existingIndex !== -1) {
            const newMessages = [...prev];
            newMessages[existingIndex] = {
              ...newMessages[existingIndex],
              text: text
            };
            return newMessages;
          }
          return [...prev, { 
            id: messageId!, 
            text, 
            sender: 'ai', 
            timestamp: Date.now() 
          }];
        });

        if (isFinal) {
          currentAiMessageIdRef.current = null;
          speakText(text, messageId, () => {
            if (isAutoModeRef.current) {
              if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
              autoStartTimeoutRef.current = setTimeout(() => {
                startListeningRef.current?.(true);
              }, autoMicOnDelayRef.current * 1000);
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

  const { isProcessing, sendMessage } = useGeminiChat({
    level: complexity,
    languageCode,
    speakingStyle,
    context,
    vocabulary: vocabulary.filter(v => v.languageCode === languageCode),
    history: messages,
    onTranscriptUpdate: (text, isUser, isFinal) => {
      setIsInitializing(false);
      handleTranscriptUpdate(text, isUser, isFinal);
    },
    onNewWordLearned: handleNewWordLearned,
    onGrammarTip: handleGrammarTipReceived
  });

  useEffect(() => {
    isProcessingRef.current = isProcessing;
    sendMessageRef.current = sendMessage;
  }, [isProcessing, sendMessage]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (silenceMonitorIntervalRef.current) clearInterval(silenceMonitorIntervalRef.current);
      if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
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
    return () => { disableKeepAwake(); };
  }, []);

  const [loadingStatus, setLoadingStatus] = useState("Waking up your German-speaking friend.");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showBypass, setShowBypass] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const lastProcessedRetryRef = useRef(-1);
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
      const bypassTimeout = setTimeout(() => setShowBypass(true), 6000);
      return () => { clearInterval(interval); clearTimeout(bypassTimeout); };
    } else {
      setLoadingProgress(100);
    }
  }, [isInitializing]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let statusInterval: NodeJS.Timeout;
    const shouldStart = !hasStartedRef.current || retryCount > lastProcessedRetryRef.current;
    if (shouldStart) {
      hasStartedRef.current = true;
      lastProcessedRetryRef.current = retryCount;
      setIsInitializing(true);
      setError(null);
      const statuses = ["Waking up your German-speaking friend.", "Preparing context...", "Almost ready!", "Trying again..."];
      let statusIdx = 0;
      statusInterval = setInterval(() => {
        if (isInitializingRef.current) {
          statusIdx = (statusIdx + 1) % statuses.length;
          setLoadingStatus(statuses[statusIdx]);
        }
      }, 3000);
      timeout = setTimeout(() => {
        if (isInitializingRef.current) {
          setError("Buddy is taking a while. You can wait or start manually.");
          setShowBypass(true);
        }
      }, 12000);
      sendMessage("INITIATE_CONVERSATION", true)
        .then(() => { if (isInitializingRef.current) setIsInitializing(false); })
        .catch(() => { setError("Buddy failed to load."); setIsInitializing(false); })
        .finally(() => { clearTimeout(timeout); clearInterval(statusInterval); });
    }
    return () => { if (timeout) clearTimeout(timeout); if (statusInterval) clearInterval(statusInterval); };
  }, [sendMessage, retryCount]);

  const handleRetry = useCallback(() => setRetryCount(prev => prev + 1), []);
  const forceStart = useCallback(() => { setIsInitializing(false); setError(null); }, []);
  const prevComplexityRef = useRef(complexity);

  useEffect(() => {
    if (hasStartedRef.current && messages.length > 0 && prevComplexityRef.current !== complexity) {
      sendMessage(`I have changed my German level to ${complexity}.`, true);
      prevComplexityRef.current = complexity;
    }
  }, [complexity, sendMessage, messages.length]);

  const handleRefresh = useCallback(async () => {
    window.speechSynthesis.cancel();
    voiceService.stopSpeaking();
    voiceService.stopListening();
    setMessages([]);
    setShowRefreshConfirm(false);
    hasStartedRef.current = true;
    sendMessage("INITIATE_CONVERSATION", true);
  }, [sendMessage]);

  const translateWord = async (word: string, retryCount = 0) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (translationCache[cleanWord]) {
      setTranslation({ word, translation: translationCache[cleanWord] });
      return;
    }
    setIsTranslating(true);
    try {
      if (retryCount > 0) await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: `Translate the German word "${word}" to English. Provide only the translation.`,
      });
      const result = response.text || "Translation not found";
      translationCache[cleanWord] = result;
      setTranslation({ word, translation: result });
      onNewWord({ id: Math.random().toString(36).substr(2, 9), word, translation: result, learnedAt: Date.now() });
    } catch (error: any) {
      if ((error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) && retryCount < 3) {
        return translateWord(word, retryCount + 1);
      }
      setTranslationError("Failed to translate.");
    } finally { setIsTranslating(false); }
  };

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
      className="fixed inset-0 z-50 flex flex-col bg-app-bg text-text-main"
    >
      <button 
        onClick={togglePause}
        className={cn(
          "absolute top-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center",
          isPaused ? "bg-green-500 hover:bg-green-600 text-white" : "bg-card-bg hover:bg-card-soft text-text-muted"
        )}
      >
        {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
      </button>

      <button 
        onClick={() => {
          voiceService.stopListening();
          voiceService.stopSpeaking();
          if (silenceMonitorIntervalRef.current) {
            clearInterval(silenceMonitorIntervalRef.current);
            silenceMonitorIntervalRef.current = null;
          }
          if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
          window.speechSynthesis.cancel();
          const durationMins = (Date.now() - sessionStartTimeRef.current) / 60000;
          if (durationMins > 0.1) {
            onSpeakingTimeUpdate(durationMins);
            FluencyService.updateFluency(languageCode, level, 'speaking', { 
              durationMins, messageCount: messages.length,
              userMessages: messages.filter(m => m.sender === 'user').map(m => m.text)
            });
          }
          onClose(messages);
        }} 
        className="absolute top-6 right-6 z-50 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all active:scale-90"
      >
        <X size={24} strokeWidth={3} />
      </button>

      <div className="flex-1 overflow-y-auto pt-20 pb-8 space-y-6 px-4 md:px-8 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
            <div className={cn("p-4 rounded-card text-lg leading-relaxed shadow-app border", msg.sender === 'user' ? "bg-accent text-white rounded-tr-none" : "bg-card-bg text-text-main rounded-tl-none")}>
              <div className={cn("flex flex-wrap gap-x-1.5", msg.sender === 'user' ? "justify-end" : "justify-start")}>
                {(() => {
                  let cumulativeCharCount = 0;
                  return msg.text.split(' ').map((word, i) => {
                    const wordStart = cumulativeCharCount;
                    cumulativeCharCount += word.length + 1;
                    const isVisible = msg.sender === 'user' || msg.id !== currentlySpeakingId || wordStart < visibleCharIndex;
                    return (
                      <motion.span 
                        key={i}
                        initial={false}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
                        onClick={msg.sender === 'ai' && isVisible ? () => translateWord(word) : undefined}
                        className={cn(msg.sender === 'ai' ? "cursor-pointer underline decoration-accent/30 decoration-2 underline-offset-4 hover:text-accent" : "font-medium")}
                      >
                        {word}
                      </motion.span>
                    );
                  });
                })()}
              </div>
              {msg.studyNotes && msg.id !== currentlySpeakingId && (
                <div className="mt-4 pt-4 border-t border-app-border text-sm text-text-muted italic">
                  <div className="flex items-center gap-2 mb-2 text-accent not-italic font-bold uppercase text-[10px]">
                    <Info size={12} /> Study Notes
                  </div>
                  {msg.studyNotes}
                </div>
              )}
            </div>
            <span className="text-[10px] text-text-muted/60 mt-1.5 uppercase tracking-widest font-bold">
              {msg.sender === 'user' ? 'You' : 'Buddy'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
            <p className="text-text-muted text-sm font-medium animate-pulse">Buddy is thinking...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(translation || isTranslating || translationError) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-36 left-1/2 -translate-x-1/2 bg-card-bg border border-app-border p-4 rounded-card shadow-2xl flex items-center gap-3 min-w-[240px] z-50">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-accent shrink-0"><Info size={20} /></div>
            <div className="flex-1">
              {isTranslating ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-accent rounded-full animate-bounce" /><span className="text-sm font-medium text-text-muted ml-1">Translating...</span></div> : translationError ? <p className="text-sm font-medium text-red-500">{translationError}</p> : <><p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">{translation?.word}</p><p className="text-lg font-medium text-text-main">{translation?.translation}</p></>}
            </div>
            <button onClick={() => { setTranslation(null); setTranslationError(null); }} className="ml-auto p-1.5 hover:bg-card-soft rounded-lg text-text-muted"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInitializing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-app-bg z-[150] flex flex-col items-center justify-center p-6 text-center">
            <button onClick={() => onClose(messages)} className="absolute top-6 right-6 z-[200] p-3 bg-card-bg hover:bg-red-500 text-text-muted hover:text-white rounded-full shadow-lg transition-all active:scale-90 border border-app-border"><X size={24} strokeWidth={3} /></button>
            <div className="relative mb-12">
              <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }} transition={{ scale: { repeat: Infinity, duration: 2 }, rotate: { repeat: Infinity, duration: 8, ease: "linear" } }} className="w-32 h-32 bg-gradient-to-tr from-accent to-accent/60 rounded-card flex items-center justify-center shadow-2xl shadow-accent/20 relative"><RefreshCcw size={48} className="text-white relative z-10" /></motion.div>
            </div>
            <div className="space-y-4 max-w-sm">
              <h2 className="text-4xl font-black text-text-main tracking-tighter">Connecting...</h2>
              <p className="text-text-muted font-medium leading-relaxed">{loadingStatus}</p>
            </div>
            <div className="mt-12 w-64 h-2 bg-card-bg rounded-full overflow-hidden border border-app-border/50 p-0.5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${loadingProgress}%` }} className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" />
            </div>
            {error && (
              <div className="mt-12 p-6 bg-red-500/10 text-red-500 rounded-card border border-red-500/20 text-sm font-medium max-w-xs">
                {error}
                <div className="flex flex-col gap-2 mt-4">
                  <button onClick={handleRetry} className="block w-full py-3 bg-accent text-white rounded-xl font-bold">Try Reconnecting</button>
                  <button onClick={forceStart} className="block w-full py-3 bg-card-soft text-text-muted rounded-xl font-bold">Start Chat Anyway</button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRefreshConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-card-bg/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-card-bg rounded-card p-8 max-w-sm w-full shadow-2xl text-center border border-app-border">
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto mb-6"><RefreshCcw size={32} /></div>
              <h3 className="text-xl font-bold text-text-main mb-2">Refresh Conversation?</h3>
              <p className="text-text-muted mb-8 text-sm">This will clear all current messages and start a fresh conversation.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRefreshConfirm(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-text-muted bg-card-soft">Cancel</button>
                <button onClick={handleRefresh} className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-accent">Refresh</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 border-t border-app-border bg-card-bg shadow-app">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-10">
          <div className="flex items-center justify-between px-2 md:px-4">
            <div className="w-14 md:w-20 flex justify-start">
              <button onClick={() => setShowRefreshConfirm(true)} className="p-3 md:p-4 rounded-2xl transition-all border bg-card-bg border-app-border text-text-muted hover:text-accent group"><RefreshCcw size={20} className="md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" /></button>
            </div>
            <div className="relative">
              {isListening && <motion.div animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-red-400 rounded-full" />}
              <button onClick={isListening ? stopListening : startListening} disabled={isPaused || isProcessing || currentlySpeakingId !== null} className={cn("relative p-6 md:p-8 rounded-full transition-all shadow-2xl active:scale-95 z-10", isListening ? "bg-red-500 text-white" : (isPaused || isProcessing || currentlySpeakingId !== null) ? "bg-app-border text-text-muted" : "bg-accent text-white")}>
                <div className="flex flex-col items-center gap-1">{isListening ? <MicOff size={32} /> : <Mic size={32} />}<span className="font-black text-[8px] md:text-[10px] tracking-widest uppercase">{isListening ? "Stop" : "Talk"}</span></div>
              </button>
              {isListening && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs md:w-80 text-center pointer-events-none"><div className="bg-card-bg/95 backdrop-blur-md border border-red-100 rounded-card p-3 md:p-4 shadow-2xl mb-3"><p className="text-xs md:text-sm text-text-muted line-clamp-3 italic font-medium leading-relaxed">{currentTranscript || "Buddy is listening..."}</p></div></motion.div>}
            </div>
            <div className="w-14 md:w-20 flex justify-end">
              <button onClick={() => setIsMuted(!isMuted)} className={cn("p-3 md:p-4 rounded-2xl transition-all border shadow-sm", isMuted ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-card-bg border-app-border text-text-muted hover:text-accent")}>{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
