import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, X, Settings2, Volume2, VolumeX, Info, RefreshCcw } from 'lucide-react';
import { useGeminiChat } from '../hooks/useGeminiChat';
import { LanguageLevel, VocabularyWord, Message } from '../types';
import { cn } from '../lib/utils';
import { GoogleGenAI } from '@google/genai';

const translationCache: Record<string, string> = {};
const aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SpeakingInterfaceProps {
  level: LanguageLevel;
  context: string;
  scenarioId: string;
  initialMessages?: Message[];
  vocabulary: VocabularyWord[];
  onClose: (messages: Message[]) => void;
  onNewWord: (word: VocabularyWord) => void;
  onLevelChange?: (level: LanguageLevel) => void;
}

export function SpeakingInterface({ 
  level, 
  context, 
  scenarioId,
  initialMessages = [], 
  vocabulary, 
  onClose, 
  onNewWord,
  onLevelChange
}: SpeakingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [speed, setSpeed] = useState(1.0);
  const speedRef = useRef(speed);
  
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const [complexity, setComplexity] = useState<LanguageLevel>(level);
  const [isMuted, setIsMuted] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [translation, setTranslation] = useState<{ word: string; translation: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if (isMuted) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE'; // German
    utterance.rate = speed;
    
    // Find a German voice if available
    const voices = window.speechSynthesis.getVoices();
    const germanVoice = voices.find(v => v.lang.startsWith('de'));
    if (germanVoice) {
      utterance.voice = germanVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE'; // Assuming user speaks German
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        sendMessage(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleTranscriptUpdate = useCallback((text: string, isUser: boolean) => {
    console.log("Transcript Update Received in UI:", text, "isUser:", isUser);
    
    if (!isUser) {
      // AI Response: Split into spoken and study notes
      if (text.includes("---")) {
        const parts = text.split("---");
        const spokenText = parts[0].trim();
        const studyNotes = parts[1].trim();
        
        // 1. Speak the German part
        speakText(spokenText);
        
        // 2. Add as message (we'll display it specially in the UI)
        setMessages(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          text: spokenText, 
          sender: 'ai', 
          timestamp: Date.now(),
          studyNotes: studyNotes // Custom property for study notes
        }]);
      } else {
        // Fallback if separator is missing
        speakText(text);
        setMessages(prev => [...prev, { 
          id: Math.random().toString(36).substr(2, 9), 
          text, 
          sender: 'ai', 
          timestamp: Date.now() 
        }]);
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
  }, [isMuted, speed]);

  const handleNewWordLearned = useCallback((german: string, english: string) => {
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      german,
      english,
      learnedAt: Date.now()
    });
  }, [onNewWord]);

  const { isProcessing, sendMessage } = useGeminiChat({
    level: complexity,
    context,
    vocabulary: vocabulary.map(v => v.german),
    history: messages,
    onTranscriptUpdate: handleTranscriptUpdate,
    onNewWordLearned: handleNewWordLearned
  });

  // Auto-start conversation
  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      sendMessage("INITIATE_CONVERSATION", true);
    }
  }, [sendMessage]);

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

      const response = await aiInstance.models.generateContent({
        model: "gemini-3-flash-preview",
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-white text-zinc-900"
    >
      {/* Red Close Button */}
      <button 
        onClick={() => onClose(messages)} 
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
                {msg.text.split(' ').map((word, i) => (
                  <span 
                    key={i}
                    onClick={msg.sender === 'ai' ? () => translateWord(word) : undefined}
                    className={cn(
                      msg.sender === 'ai' 
                        ? "cursor-pointer underline decoration-orange-500/30 decoration-2 underline-offset-4 hover:text-orange-600 hover:decoration-orange-500 transition-all font-medium"
                        : "font-medium"
                    )}
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              {/* Study Notes Display */}
              {msg.studyNotes && (
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

      <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">Speed</label>
              <div className="flex items-center gap-2">
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.1" 
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-24 accent-orange-500"
                />
                <span className="text-xs font-mono text-zinc-600">{speed.toFixed(1)}x</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">Level</label>
              <select 
                value={complexity}
                onChange={(e) => {
                  const newLevel = e.target.value as LanguageLevel;
                  setComplexity(newLevel);
                  onLevelChange?.(newLevel);
                }}
                className="bg-white text-xs rounded-lg px-2 py-1.5 outline-none border border-zinc-200 text-zinc-700 shadow-sm"
              >
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper Int)</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-zinc-400 uppercase font-bold">Grammar</label>
              <button 
                onClick={() => setShowGrammar(!showGrammar)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border shadow-sm",
                  showGrammar 
                    ? "bg-orange-500 border-orange-400 text-white" 
                    : "bg-white border-zinc-200 text-zinc-400"
                )}
              >
                {showGrammar ? "Detailed" : "Off"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowRefreshConfirm(true)}
              className="p-4 rounded-full transition-all border bg-white border-zinc-200 text-zinc-400 shadow-sm hover:text-orange-500 hover:border-orange-200"
              title="Refresh Conversation"
            >
              <RefreshCcw size={24} />
            </button>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={cn(
                "p-4 rounded-full transition-all border",
                isMuted ? "bg-red-50 border-red-100 text-red-500" : "bg-white border-zinc-200 text-zinc-400 shadow-sm"
              )}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            <div className="relative">
              {isListening && (
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-orange-500 rounded-full"
                />
              )}
              <button 
                onClick={startListening}
                disabled={isProcessing}
                className={cn(
                  "relative p-6 rounded-full transition-all shadow-xl",
                  isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                )}
              >
                {isListening ? <MicOff size={32} /> : <Mic size={32} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
