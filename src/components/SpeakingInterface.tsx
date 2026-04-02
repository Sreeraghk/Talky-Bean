import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Settings2, Volume2, VolumeX, Info, RefreshCcw, Pause, Play } from 'lucide-react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { LanguageLevel, VocabularyWord, Message, GrammarTip, SpeakingStyle } from '../types';
import { cn } from '../lib/utils';
import { AiService } from '../services/AiService';
import { voiceService } from '../services/VoiceService';
import { KeepAwake } from '@capacitor-community/keep-awake';
import { Capacitor } from '@capacitor/core';

const translationCache: Record<string, string> = {};

interface SpeakingInterfaceProps {
  level: LanguageLevel;
  speakingStyle: SpeakingStyle;
  context: string;
  scenarioId: string;
  initialMessages?: Message[];
  vocabulary: VocabularyWord[];
  onClose: (messages: Message[]) => void;
  onNewWord: (word: VocabularyWord) => void;
  onNewGrammarTip: (tip: GrammarTip) => void;
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
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startListeningRef = useRef<((isAuto?: boolean | React.MouseEvent) => void) | null>(null);
  const isRestartingRef = useRef(false);

  useEffect(() => {
    isAutoModeRef.current = isAutoMode;
  }, [isAutoMode]);

  useEffect(() => {
    autoMicOnDelayRef.current = autoMicOnDelay;
  }, [autoMicOnDelay]);

  useEffect(() => {
    autoMicOffDelayRef.current = autoMicOffDelay;
  }, [autoMicOffDelay]);

  // Keep screen awake during conversation
  useEffect(() => {
    let wakeLock: any = null;

    const enableKeepAwake = async () => {
      // 1. Native Platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        try {
          await KeepAwake.keepAwake();
          console.log("KeepAwake: Native screen will stay on.");
        } catch (err) {
          console.warn("KeepAwake Native error:", err);
        }
      } 
      // 2. Web Fallback (Browser Preview)
      else if ('wakeLock' in navigator) {
        try {
          // Attempt to request wake lock
          wakeLock = await (navigator as any).wakeLock.request('screen');
          console.log("KeepAwake: Web screen wake lock active.");
          
          // Re-request if visibility changes (standard web behavior)
          const handleVisibilityChange = async () => {
            if (wakeLock !== null && document.visibilityState === 'visible') {
              try {
                wakeLock = await (navigator as any).wakeLock.request('screen');
              } catch (e) {
                // Silent fail on re-request
              }
            }
          };
          document.addEventListener('visibilitychange', handleVisibilityChange);
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            console.warn("KeepAwake: Wake Lock permission denied (common in iframes). Screen may dim.");
          } else {
            console.warn("KeepAwake Web error:", err);
          }
        }
      }
    };

    const disableKeepAwake = async () => {
      // 1. Native Platform
      if (Capacitor.isNativePlatform()) {
        try {
          await KeepAwake.allowSleep();
          console.log("KeepAwake: Native screen can now sleep.");
        } catch (err) {
          console.warn("KeepAwake Native error:", err);
        }
      }
      // 2. Web Fallback
      if (wakeLock) {
        try {
          await wakeLock.release();
          wakeLock = null;
          console.log("KeepAwake: Web screen wake lock released.");
        } catch (err) {
          console.warn("KeepAwake Web release error:", err);
        }
      }
    };

    enableKeepAwake();
    return () => {
      disableKeepAwake();
    };
  }, []);

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

  const speakText = useCallback(async (text: string, messageId: string, onEnd?: () => void) => {
    if (isMutedRef.current || isPaused) {
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      onEnd?.();
      return;
    }
    
    // Cancel any ongoing speech
    voiceService.stopSpeaking();
    
    setCurrentlySpeakingId(messageId);
    setVisibleCharIndex(0);

    try {
      await voiceService.speak({
        text,
        rate: speedRef.current
      });
      
      // Since native TTS might not have word boundaries easily, 
      // we'll simulate the text appearing or just show it all
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      onEnd?.();
    } catch (error) {
      console.error("Speech error:", error);
      setCurrentlySpeakingId(null);
      setVisibleCharIndex(text.length);
      onEnd?.();
    }
  }, []);

  const handleNewWordLearned = useCallback((german: string, english: string) => {
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      german,
      english,
      learnedAt: Date.now()
    });
  }, [onNewWord]);

  const handleGrammarTipReceived = useCallback((german: string, explanation: string) => {
    pendingGrammarTipsRef.current.push(`${german}: ${explanation}`);
    onNewGrammarTip({
      id: Math.random().toString(36).substr(2, 9),
      german,
      explanation,
      learnedAt: Date.now()
    });
  }, [onNewGrammarTip]);

  const currentAiMessageIdRef = useRef<string | null>(null);

  const handleTranscriptUpdate = useCallback((text: string, isUser: boolean, isFinal = true) => {
    console.log("Transcript Update Received in UI:", text, "isUser:", isUser, "isFinal:", isFinal);
    
    if (!isUser) {
      // AI Response: Split into spoken and study notes
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
        
        // 1. Add or update message
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

        // 2. Speak the German part ONLY when final
        if (isFinal) {
          currentAiMessageIdRef.current = null;
          speakText(spokenText, messageId, () => {
            console.log("AI Speech Finished. Auto-Mic Mode:", isAutoModeRef.current);
            if (isAutoModeRef.current) {
              if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
              autoStartTimeoutRef.current = setTimeout(() => {
                console.log("Triggering Auto-Mic Start...");
                startListeningRef.current?.(true);
              }, autoMicOnDelayRef.current * 1000);
            }
          });
        }
      } else {
        // Fallback if separator is missing
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
            console.log("AI Speech Finished (Fallback). Auto-Mic Mode:", isAutoModeRef.current);
            if (isAutoModeRef.current) {
              if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
              autoStartTimeoutRef.current = setTimeout(() => {
                console.log("Triggering Auto-Mic Start (Fallback)...");
                startListeningRef.current?.(true);
              }, autoMicOnDelayRef.current * 1000);
            }
          });
        }
      }
    } else {
      // User Message
      setMessages(prev => [...prev, { 
        id: Math.random().toString(36).substr(2, 9), 
        text, 
        sender: 'user', 
        timestamp: Date.now() 
      }]);
    }
  }, [speakText]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  const stopListening = useCallback(async () => {
    if (isStoppingRef.current) return;
    isStoppingRef.current = true;
    console.log("stopListening called");

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    await voiceService.stopListening();
    setIsListeningWithRef(false);
    setIsRecognitionActive(false);
    isRecognitionActiveRef.current = false;

    const fullTranscript = transcriptRef.current.trim();
    if (fullTranscript && !isProcessingRef.current && !isMessageSentRef.current) {
      isMessageSentRef.current = true;
      if (sendMessageRef.current) {
        // sendMessage will handle adding the message to the UI (handleTranscriptUpdate)
        // unless we pass silent: true. We want it to handle it for consistency.
        sendMessageRef.current(fullTranscript);
      }
      setCurrentTranscript("");
      setInterimTranscript("");
      transcriptRef.current = "";
      interimRef.current = "";
    }
    
    // Reset stopping flag after a short delay to allow UI to settle
    setTimeout(() => {
      isStoppingRef.current = false;
    }, 1000);
  }, [handleTranscriptUpdate]);

  const startListening = useCallback(async (isAuto: boolean | React.MouseEvent = false) => {
    const autoMode = typeof isAuto === 'boolean' ? isAuto : false;
    console.log("startListening called, autoMode:", autoMode);
    
    if (isPaused || isProcessingRef.current || currentlySpeakingId || isRecognitionActiveRef.current || isStoppingRef.current) {
      console.log("Cannot start listening: paused, processing, speaking, active, or stopping");
      return;
    }

    if (autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }

    const hasPermission = await voiceService.checkPermissions();
    if (!hasPermission) {
      setError("Microphone permission denied");
      return;
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
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      // Use a more generous initial timeout (8s) to allow for engine warmup and user starting
      silenceTimeoutRef.current = setTimeout(() => {
        console.log("Initial silence timeout reached, stopping...");
        if (isListeningRef.current) {
          stopListening();
        }
      }, Math.max(8000, autoMicOffDelayRef.current * 1000));
    }

    voiceService.startListening('de-DE', 
      (result) => {
        if (isStoppingRef.current) return;
        // Since we now use cumulative transcripts from VoiceService
        transcriptRef.current = result.transcript;
        setCurrentTranscript(result.transcript);
        setInterimTranscript(""); // No longer needed as separate
        interimRef.current = "";
        
        if (isAutoModeRef.current) {
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          // Once we have a result, we use the user-defined delay
          silenceTimeoutRef.current = setTimeout(() => {
            console.log(`Silence timeout (${autoMicOffDelayRef.current}s) reached after result, stopping...`);
            if (isListeningRef.current) {
              stopListening();
            }
          }, autoMicOffDelayRef.current * 1000);
        }
      },
      (error) => {
        console.error("Speech recognition error:", error);
        setIsListeningWithRef(false);
        setIsRecognitionActive(false);
        isRecognitionActiveRef.current = false;
        isRestartingRef.current = false;
      },
      () => {
        console.log("Speech recognition ended naturally");
        // Only call stopListening if we aren't already stopping
        if (!isStoppingRef.current) {
          stopListening();
        }
      }
    );
  }, [currentlySpeakingId, stopListening]);

  useEffect(() => {
    startListeningRef.current = startListening;
  }, [startListening]);

  const { isProcessing, sendMessage } = useGeminiChat({
    level: complexity,
    speakingStyle,
    context,
    vocabulary: vocabulary.map(v => v.german),
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
      voiceService.stopListening();
      voiceService.stopSpeaking();
    };
  }, []);

  // Auto-start conversation
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      setIsInitializing(true);
      console.log("Initiating conversation with Buddy...");
      
      // Set a timeout for initial load
      timeout = setTimeout(() => {
        if (isInitializing) {
          setError("Connection is taking longer than usual. Please check your internet or try refreshing.");
        }
      }, 15000);

      sendMessage("INITIATE_CONVERSATION", true).then(() => {
        clearTimeout(timeout);
      }).catch(err => {
        clearTimeout(timeout);
        console.error("Failed to initiate conversation:", err);
        setError("Buddy failed to load. Please refresh.");
        setIsInitializing(false);
      });
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [sendMessage, isInitializing]);

  const prevComplexityRef = useRef(complexity);

  // Level change trigger
  useEffect(() => {
    if (hasStartedRef.current && messages.length > 0 && prevComplexityRef.current !== complexity) {
      sendMessage(`I have changed my German level to ${complexity}. Please acknowledge this and continue our conversation at this new level.`, true);
      prevComplexityRef.current = complexity;
    }
  }, [complexity, sendMessage, messages.length]);

  const handleRefresh = useCallback(async () => {
    window.speechSynthesis.cancel();
    setMessages([]);
    setShowRefreshConfirm(false);
    hasStartedRef.current = true; // Set to true since we're initiating now
    sendMessage("INITIATE_CONVERSATION", true);
  }, [sendMessage]);

  const translateWord = async (word: string, retryCount = 0) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (translationCache[cleanWord]) {
      setTranslation({ word, translation: translationCache[cleanWord] });
      setTranslationError(null);
      return;
    }

    setIsTranslating(true);
    setTranslation(null);
    setTranslationError(null);

    try {
      // Small delay for subsequent retries to respect rate limits
      if (retryCount > 0) {
        const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: `Translate the German word "${word}" to English. Provide only the translation.`,
      });
      
      const result = response.text || "Translation not found";
      translationCache[cleanWord] = result;
      setTranslation({ word, translation: result });
      setTranslationError(null);
    } catch (error: any) {
      console.error("Translation error:", error);
      
      // Handle Rate Limit (429) with retry
      if (error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) {
        if (retryCount < 3) {
          console.log(`Rate limit hit, retrying translation for "${word}" (attempt ${retryCount + 1})...`);
          return translateWord(word, retryCount + 1);
        } else {
          setTranslationError("Rate limit reached. Please wait a moment before trying again.");
        }
      } else {
        setTranslationError("Failed to translate. Please try again.");
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const togglePause = useCallback(() => {
    if (!isPaused) {
      // Pausing
      setIsPaused(true);
      if (isListeningRef.current) {
        stopListening();
      }
      voiceService.stopSpeaking();
      setCurrentlySpeakingId(null);
      if (autoStartTimeoutRef.current) {
        clearTimeout(autoStartTimeoutRef.current);
        autoStartTimeoutRef.current = null;
      }
    } else {
      // Resuming
      setIsPaused(false);
      // If we were waiting for auto-mic, we might want to restart it, 
      // but for simplicity let's just let the user trigger it or wait for next AI msg.
      // Actually, if the user clicks Play, they probably want to talk.
    }
  }, [isPaused, stopListening]);

  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulated loading progress
  useEffect(() => {
    if (isInitializing) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 95) return prev;
          const increment = Math.max(0.1, (100 - prev) / 40);
          return prev + increment;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setLoadingProgress(100);
    }
  }, [isInitializing]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900"
    >
      {/* Pause/Play Button (Top Left) */}
      <button 
        onClick={togglePause}
        className={cn(
          "absolute top-6 left-6 z-50 p-3 rounded-full shadow-lg transition-all active:scale-90 flex items-center justify-center",
          isPaused 
            ? "bg-green-500 hover:bg-green-600 text-white" 
            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600"
        )}
        title={isPaused ? "Resume Chat" : "Pause Chat"}
      >
        {isPaused ? <Play size={24} fill="currentColor" /> : <Pause size={24} fill="currentColor" />}
      </button>

      {/* Red Close Button */}
      <button 
        onClick={() => {
          const durationMins = (Date.now() - sessionStartTimeRef.current) / 60000;
          if (durationMins > 0.1) {
            onSpeakingTimeUpdate(durationMins);
          }
          onClose(messages);
        }} 
        className="absolute top-6 right-6 z-50 p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all active:scale-90"
      >
        <X size={24} strokeWidth={3} />
      </button>

      <div className="flex-1 overflow-y-auto pt-20 pb-8 space-y-6 px-4 md:px-8 scrollbar-hide">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={cn(
              "flex flex-col max-w-[85%] transition-all duration-300",
              msg.sender === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div 
              className={cn(
                "p-4 rounded-2xl text-lg leading-relaxed shadow-sm border transition-all",
                msg.sender === 'user' 
                  ? "bg-orange-500 text-white rounded-tr-none border-orange-400" 
                  : "bg-zinc-100 text-zinc-800 rounded-tl-none border-zinc-200"
              )}
            >
              <div className={cn(
                "flex flex-wrap gap-x-1.5",
                msg.sender === 'user' ? "justify-end" : "justify-start"
              )}>
                {(() => {
                  let cumulativeCharCount = 0;
                  return msg.text.split(' ').map((word, i) => {
                    const wordStart = cumulativeCharCount;
                    cumulativeCharCount += word.length + 1; // +1 for the space
                    const isVisible = msg.sender === 'user' || msg.id !== currentlySpeakingId || wordStart < visibleCharIndex;
                    
                    return (
                      <motion.span 
                        key={i}
                        initial={false}
                        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 5 }}
                        onClick={msg.sender === 'ai' && isVisible ? () => translateWord(word) : undefined}
                        className={cn(
                          msg.sender === 'ai' 
                            ? "cursor-pointer underline decoration-orange-500/30 decoration-2 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all font-medium"
                            : "font-medium"
                        )}
                      >
                        {word}
                      </motion.span>
                    );
                  });
                })()}
              </div>
              
              {/* Study Notes Display */}
              {msg.studyNotes && msg.id !== currentlySpeakingId && (
                <div className="mt-4 pt-4 border-t border-zinc-200 text-sm text-zinc-600 italic">
                  <div className="flex items-center gap-2 mb-2 text-orange-600 not-italic font-bold uppercase text-[10px]">
                    <Info size={12} />
                    Study Notes
                  </div>
                  {msg.studyNotes}
                </div>
              )}
            </div>
            <span className={cn(
              "text-[10px] text-zinc-400 mt-1.5 uppercase tracking-widest font-bold",
              msg.sender === 'user' ? "text-right" : "text-left"
            )}>
              {msg.sender === 'user' ? 'You' : 'Buddy'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"
            />
            <p className="text-zinc-400 text-sm font-medium animate-pulse">Buddy is thinking...</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {(translation || isTranslating || translationError) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-36 left-1/2 -translate-x-1/2 bg-white border border-zinc-200 p-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[240px] z-50"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
              <Info size={20} />
            </div>
            <div className="flex-1">
              {isTranslating ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-sm font-medium text-zinc-500 ml-1">Translating...</span>
                </div>
              ) : translationError ? (
                <p className="text-sm font-medium text-red-500">{translationError}</p>
              ) : (
                <>
                  <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tighter">{translation?.word}</p>
                  <p className="text-lg font-medium text-zinc-800">{translation?.translation}</p>
                </>
              )}
            </div>
            <button 
              onClick={() => {
                setTranslation(null);
                setTranslationError(null);
              }} 
              className="ml-auto p-1.5 hover:bg-zinc-100 rounded-lg"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[150] flex flex-col items-center justify-center p-6 text-center"
          >
            {/* Red Close Button */}
            <button 
              onClick={() => {
                const durationMins = (Date.now() - sessionStartTimeRef.current) / 60000;
                if (durationMins > 0.1) {
                  onSpeakingTimeUpdate(durationMins);
                }
                onClose(messages);
              }} 
              className="absolute top-6 right-6 z-[200] p-3 bg-zinc-100 hover:bg-red-500 text-zinc-500 hover:text-white rounded-full shadow-lg transition-all active:scale-90 border border-zinc-200"
              title="Close Buddy"
            >
              <X size={24} strokeWidth={3} />
            </button>

            <div className="relative mb-12">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ 
                  scale: { repeat: Infinity, duration: 2, ease: "easeInOut" },
                  rotate: { repeat: Infinity, duration: 8, ease: "linear" }
                }}
                className="w-32 h-32 bg-gradient-to-tr from-orange-500 to-orange-300 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-orange-500/20 relative"
              >
                <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] blur-xl animate-pulse" />
                <RefreshCcw size={48} className="text-white relative z-10" />
              </motion.div>
              
              {/* Decorative rings */}
              <motion.div 
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-orange-500 rounded-[2.5rem]"
              />
              <motion.div 
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5, ease: "easeOut" }}
                className="absolute inset-0 border-2 border-orange-400 rounded-[2.5rem]"
              />
            </div>

            <div className="space-y-4 max-w-sm">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-black text-zinc-900 tracking-tighter"
              >
                Connecting...
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-zinc-500 font-medium leading-relaxed"
              >
                Waking up your German-speaking friend. <br/>
                <span className="text-xs uppercase tracking-widest font-black text-orange-500/60 mt-2 block">Almost there • {Math.round(loadingProgress)}%</span>
              </motion.p>
            </div>

            {/* Loading progress bar */}
            <div className="mt-12 w-64 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]"
              />
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 p-6 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 text-sm font-medium max-w-xs"
              >
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <span className="font-bold uppercase tracking-widest text-[10px]">Connection Error</span>
                </div>
                {error}
                <button 
                  onClick={() => window.location.reload()}
                  className="block w-full mt-4 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                >
                  Try Refreshing
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {showRefreshConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCcw size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Refresh Conversation?</h3>
              <p className="text-zinc-500 mb-8">This will clear all current messages and start a fresh conversation. This cannot be undone.</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowRefreshConfirm(false)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRefresh}
                  className="flex-1 px-6 py-3 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
                >
                  Refresh
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-4 md:p-8 border-t border-zinc-100 bg-white shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex flex-col gap-6 md:gap-10">
          {/* Main Action Row */}
          <div className="flex items-center justify-between px-2 md:px-4">
            <div className="w-14 md:w-20 flex justify-start">
              <button 
                onClick={() => setShowRefreshConfirm(true)}
                className="p-3 md:p-4 rounded-2xl transition-all border bg-white border-zinc-200 text-zinc-400 shadow-sm hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50 group"
                title="Refresh Conversation"
              >
                <RefreshCcw size={20} className="md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="relative">
              {isListening && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-400 rounded-full"
                  />
                  <motion.div 
                    animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.3 }}
                    className="absolute inset-0 bg-red-300 rounded-full"
                  />
                </>
              )}
              
              <button 
                onClick={isListening ? stopListening : startListening}
                disabled={isPaused || isProcessing || currentlySpeakingId !== null}
                className={cn(
                  "relative p-6 md:p-8 rounded-full transition-all shadow-2xl active:scale-95 z-10",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white ring-4 md:ring-8 ring-red-100" 
                    : (isPaused || isProcessing || currentlySpeakingId !== null)
                      ? "bg-zinc-300 text-zinc-500 cursor-not-allowed ring-0 shadow-none"
                      : "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200 ring-4 md:ring-8 ring-transparent"
                )}
              >
                <div className="flex flex-col items-center gap-1">
                  {isListening ? <MicOff size={32} className="md:w-10 md:h-10" /> : <Mic size={32} className="md:w-10 md:h-10" />}
                  <span className="font-black text-[8px] md:text-[10px] tracking-widest uppercase">
                    {isListening ? "Stop" : "Talk"}
                  </span>
                </div>
              </button>
              
              {isListening && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-32 left-1/2 -translate-x-1/2 w-[85vw] max-w-xs md:w-80 text-center pointer-events-none"
                >
                  <div className="bg-white/95 backdrop-blur-md border border-red-100 rounded-3xl p-3 md:p-4 shadow-2xl mb-3">
                    <p className="text-xs md:text-sm text-zinc-600 line-clamp-3 italic font-medium leading-relaxed">
                      {interimTranscript || currentTranscript || "Buddy is listening..."}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    RECORDING...
                  </div>
                </motion.div>
              )}
            </div>

            <div className="w-14 md:w-20 flex justify-end">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={cn(
                  "p-3 md:p-4 rounded-2xl transition-all border shadow-sm group",
                  isMuted 
                    ? "bg-red-50 border-red-100 text-red-500" 
                    : "bg-white border-zinc-200 text-zinc-400 hover:text-orange-500 hover:border-orange-200 hover:bg-orange-50"
                )}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
