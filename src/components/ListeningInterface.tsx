import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, CheckCircle2, Lock, Sparkles, Volume2, Info, ChevronRight, Trophy, AlertCircle, Loader2, RotateCcw, Trash2, X, Clock, Star, ArrowRight } from 'lucide-react';
import { ListeningModule, LanguageLevel, ListeningQuestion, ExamType, VocabularyWord } from '../types';
import { ListeningService } from '../services/ListeningService';
import { FluencyService } from '../services/FluencyService';
import { UserService } from '../services/UserService';
import { AiService } from '../services/AiService';
import { voiceService } from '../services/VoiceService';
import { cn } from '../lib/utils';
import { getLanguageConfig } from '../config/languages';
import { createWavHeader, base64ToUint8Array } from '../lib/audioUtils';
import confetti from 'canvas-confetti';

const translationCache: Record<string, string> = {};

const AudioVisualizer = ({ isPlaying = false }: { isPlaying: boolean }) => (
  <div className="flex items-center gap-0.5 h-6 px-1 overflow-visible">
    {[1, 2, 3, 4, 5].map((i) => (
      <motion.div 
        key={i}
        className="w-0.5 bg-orange-500 rounded-full"
        initial={{ height: 4 }}
        animate={isPlaying ? {
          height: [4, 18, 8, 16, 4],
        } : {
          height: 4
        }}
        transition={{
          repeat: isPlaying ? Infinity : 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

const SegmentedProgressBar = ({ current, total, segments = 20 }: { current: number; total: number; segments?: number }) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;
  const activeSegments = Math.floor((percentage / 100) * segments);

  return (
    <div className="flex gap-0.5 h-1.5 w-full">
      {Array.from({ length: segments }).map((_, i) => (
        <div 
          key={i}
          className={cn(
            "h-full flex-1 rounded-sm transition-all duration-300",
            i < activeSegments 
              ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" 
              : "bg-card-soft/50"
          )}
          style={{
            opacity: i === activeSegments ? 0.7 : 1,
            transform: i < activeSegments ? 'scaleY(1)' : 'scaleY(0.8)'
          }}
        />
      ))}
    </div>
  );
};

const MiniAudioPlayer = ({ 
  audioId, 
  title, 
  isActive = false, 
  onEnded, 
  disabled = false,
  isProfessional = false,
  isSubmitted = false,
  languageCode
}: { 
  audioId: string; 
  title: string; 
  isActive?: boolean; 
  onEnded?: () => void;
  disabled?: boolean;
  isProfessional?: boolean;
  isSubmitted?: boolean;
  languageCode: string;
}) => {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [hasFinishedPlayback, setHasFinishedPlayback] = useState(false);
  const [current, setCurrent] = useState(0);
  const [dur, setDur] = useState(0);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const preloadAudio = async () => {
    if (isPreloaded || loading || disabled || (isProfessional && hasFinishedPlayback)) return;
    
    setLoading(true);
    try {
      if (audioId.startsWith('WEB_TTS_FALLBACK:')) {
        setIsPreloaded(true);
        setDur(100);
        return;
      }

      const audioData = await ListeningService.getAudio(audioId);
      if (audioData) {
        const pcmBytes = base64ToUint8Array(audioData);
        const wavBytes = createWavHeader(pcmBytes, 24000);
        
        let mimeType = 'audio/wav';
        const isMpeg = wavBytes[0] === 0xFF || (wavBytes[1] === 73 && wavBytes[2] === 68);
        if (isMpeg) {
          mimeType = 'audio/mpeg';
        }

        const calculatedDuration = pcmBytes.length / 48000;
        const blob = new Blob([wavBytes], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio();
        audio.preload = 'auto';
        audio.onended = () => {
          setPlaying(false);
          if (isProfessional) setHasFinishedPlayback(true);
          if (onEnded) onEnded();
        };
        audio.onplay = () => setPlaying(true);
        audio.onpause = () => setPlaying(false);
        audio.ontimeupdate = () => {
          if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDur(audio.duration);
          } else {
            setDur(calculatedDuration || 0);
          }
          setCurrent(audio.currentTime);
        };
        audio.onloadedmetadata = () => {
          if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
            setDur(audio.duration);
          } else {
            setDur(calculatedDuration || 0);
          }
        };
        audio.src = url;
        playerRef.current = audio;
        setIsPreloaded(true);
      }
    } catch (e) {
      console.error("Error preloading mini audio:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isActive && !isPreloaded) {
      preloadAudio();
    }
  }, [isActive, audioId]);

  const toggle = async () => {
    if (disabled || (isProfessional && hasFinishedPlayback)) return;
    
    if (audioId.startsWith('WEB_TTS_FALLBACK:')) {
      if (playing) {
        if (voiceService.isPaused) {
          voiceService.resumeSpeaking();
          setPlaying(true);
        } else {
          voiceService.pauseSpeaking();
          setPlaying(false);
        }
        return;
      }

      const script = audioId.replace('WEB_TTS_FALLBACK:', '');
      setPlaying(true);
      setCurrent(0);
      setDur(100); 
      
      try {
        await voiceService.speak({ 
          text: script, 
          languageCode,
          isNaturalMode: true,
          onStart: () => setPlaying(true),
          onProgress: (percent) => {
            setCurrent(percent);
          }
        });
      } finally {
        setPlaying(false);
        setCurrent(100);
        if (isProfessional) setHasFinishedPlayback(true);
        if (onEnded) onEnded();
      }
      return;
    }

    if (!playerRef.current) {
      await preloadAudio();
    }

    if (playerRef.current) {
      if (playing) {
        playerRef.current.pause();
      } else {
        playerRef.current.play().catch(e => {
          console.warn("Player play error:", e);
          setPlaying(false);
        });
      }
    }
  };

  useEffect(() => {
    if (isActive && !playerRef.current && !isSubmitted && !(isProfessional && hasFinishedPlayback)) {
      preloadAudio(); 
    } else if (!isActive && playerRef.current && playing) {
      playerRef.current.pause();
      setPlaying(false);
    }
  }, [isActive, isSubmitted, hasFinishedPlayback]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className={cn(
      "bg-card-soft/50 border border-app-border rounded-xl p-3 flex flex-col gap-2 transition-all",
      isActive && "border-accent/40 bg-accent/5 ring-1 ring-accent/20"
    )}>
      <div className="flex items-center gap-3">
        <button 
          onClick={toggle}
          disabled={loading || disabled || (isProfessional && hasFinishedPlayback && !playing)}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-accent text-white shadow-sm",
            loading && "opacity-50",
            (isProfessional && hasFinishedPlayback && !playing) && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : 
           playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1 bg-white/5 px-2 py-0.5 rounded-md">
            <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted truncate">{title}</span>
            <AudioVisualizer isPlaying={playing} />
          </div>
          <SegmentedProgressBar current={current} total={dur} segments={24} />
        </div>
      </div>
    </div>
  );
};


interface ListeningInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
  user?: any;
  onRequireLogin?: () => void;
}

const TOTAL_MODULES = 100;

const formatTime = (time: number) => {
  if (isNaN(time) || time === Infinity) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export function ListeningInterface({ level, language, onClose, onProgressUpdate, onNewWord, user, onRequireLogin }: ListeningInterfaceProps) {
  // 1. All State and Ref Declarations
  const [examType, setExamType] = useState<ExamType>(() => {
    const saved = localStorage.getItem(`langeasy_listening_exam_type_${language}_${level}`) || localStorage.getItem(`deutschbuddy_listening_exam_type_${language}_${level}`);
    return (saved as ExamType) || 'Standard';
  });
  const [modules, setModules] = useState<ListeningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ListeningModule | null>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_listening_selected_module_${language}_${level}`) || localStorage.getItem(`deutschbuddy_listening_selected_module_${language}_${level}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Error parsing selected listening module:", e);
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showQuestions, setShowQuestions] = useState(() => {
    const saved = localStorage.getItem(`langeasy_listening_show_questions_${language}_${level}`);
    return saved === 'true';
  });
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_listening_user_answers_${language}_${level}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Error parsing listening user answers:", e);
      return {};
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return localStorage.getItem(`langeasy_listening_is_submitted_${language}_${level}`) === 'true';
  });
  const [showResults, setShowResults] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [prepTime, setPrepTime] = useState<number | null>(null);
  const [isPrepFinished, setIsPrepFinished] = useState(false);
  const [practiceMode, setPracticeMode] = useState<'casual' | 'professional' | null>(() => {
    const saved = localStorage.getItem(`langeasy_listening_mode_${language}_${level}`);
    return (saved as any) || null;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isAudioFinished, setIsAudioFinished] = useState(() => {
    return localStorage.getItem(`langeasy_listening_audio_finished_${language}_${level}`) === 'true';
  });
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_listening_audio_index_${language}_${level}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [postAudioTime, setPostAudioTime] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_listening_post_time_${language}_${level}`);
    return saved ? parseInt(saved, 10) : null;
  });

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_mode_${language}_${level}`, practiceMode || '');
  }, [practiceMode, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_audio_finished_${language}_${level}`, isAudioFinished.toString());
  }, [isAudioFinished, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_audio_index_${language}_${level}`, currentAudioIndex?.toString() || '');
  }, [currentAudioIndex, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_post_time_${language}_${level}`, postAudioTime?.toString() || '');
  }, [postAudioTime, language, level]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [activeGenerations, setActiveGenerations] = useState<number[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const generatingRef = useRef<Set<number>>(new Set());
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ word: string; translation: string; x: number; y: number; isLoading?: boolean } | null>(null);

  const preloadCurrentModule = async () => {
    if (!selectedModule || audioRef.current || isPreloading) return;
    if (selectedModule.audioId?.startsWith('WEB_TTS_FALLBACK:')) return;

    setIsPreloading(true);
    setAudioError(null);
    try {
      const audioId = selectedModule.audioId;
      if (!audioId) return;
      
      const audioData = await ListeningService.getAudio(audioId);

      if (!audioData) {
        console.warn('[ListeningInterface] Audio data is empty in storage for:', audioId);
        return;
      }

      const pcmBytes = base64ToUint8Array(audioData);
      const wavBytes = createWavHeader(pcmBytes, 24000);
      
      let mimeType = 'audio/wav';
      if (wavBytes[0] === 0xFF || (wavBytes[0] === 73 && wavBytes[1] === 68)) {
        mimeType = 'audio/mpeg';
      }

      const calculatedDuration = pcmBytes.length / 48000;
      const blob = new Blob([wavBytes], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const audio = new Audio();
      audio.preload = 'auto';
      audio.onended = () => {
        setIsPlaying(false);
        setIsAudioFinished(true);
        if (practiceMode === 'professional' && selectedModule.teil === 2) {
          setPostAudioTime(prev => prev === null ? 300 : prev); 
        }
      };
      audio.onplay = () => setIsPlaying(true);
      audio.onpause = () => setIsPlaying(false);
      audio.ontimeupdate = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        } else {
          setDuration(calculatedDuration);
        }
        setCurrentTime(audio.currentTime);
      };
      audio.onloadedmetadata = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        } else {
          setDuration(calculatedDuration);
        }
      };
      audio.oncanplay = () => {
        if (audio.duration && audio.duration !== Infinity && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        } else {
          setDuration(calculatedDuration);
        }
      };
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setAudioError('Failed to play audio. The format might be unsupported.');
        setIsPlaying(false);
      };
      
      audio.src = url;
      audio.load();
      audioRef.current = audio;
    } catch (err) {
      console.error('Audio preloading error:', err);
    } finally {
      setIsPreloading(false);
    }
  };

  // 2. All Effects
  useEffect(() => {
    preloadCurrentModule();
  }, [selectedModule, practiceMode]);

  const triggerCelebration = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);

    // Sound effect - Firework/Celebration sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
    audio.volume = 0.4;
    audio.play().catch(e => console.log('Audio play blocked', e));

    // Fireworks effect
    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 10000, scalar: 1.2 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);
      
      // Multiple bursts
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#008000', '#0000ff', '#4b0082', '#ee82ee']
      });
      confetti({ 
        ...defaults, 
        particleCount, 
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#ffffff', '#ff69b4', '#00ffff', '#7cfc00']
      });
    }, 300);
  };

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_exam_type_${language}_${level}`, examType);
  }, [examType, language, level]);

  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem(`langeasy_listening_selected_module_${language}_${level}`, JSON.stringify(selectedModule));
      // Also sync with App.tsx's key if possible
      localStorage.setItem('langeasy_listening_module', JSON.stringify(selectedModule));
    } else {
      localStorage.removeItem(`langeasy_listening_selected_module_${language}_${level}`);
      localStorage.removeItem('langeasy_listening_module');
    }
  }, [selectedModule, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_show_questions_${language}_${level}`, showQuestions.toString());
  }, [showQuestions, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_user_answers_${language}_${level}`, JSON.stringify(userAnswers));
  }, [userAnswers, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_listening_is_submitted_${language}_${level}`, isSubmitted.toString());
  }, [isSubmitted, language, level]);

  useEffect(() => {
    if (selectedModule && !isSubmitted && !isPrepFinished && prepTime === null && practiceMode === 'professional') {
      const time = selectedModule.teil === 1 ? 30 : selectedModule.teil === 2 ? 60 : 5;
      setPrepTime(time);
    }
  }, [selectedModule, isSubmitted, isPrepFinished, practiceMode]);

  useEffect(() => {
    if (isPrepFinished && practiceMode === 'professional' && !isSubmitted && !isAutoPlaying) {
      setIsAutoPlaying(true);
      if (selectedModule?.teil === 2) {
        togglePlay();
      } else {
        setCurrentAudioIndex(0);
      }
    }
  }, [isPrepFinished, practiceMode, isSubmitted, isAutoPlaying, selectedModule]);

  useEffect(() => {
    if (postAudioTime !== null && postAudioTime > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setPostAudioTime(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [postAudioTime, isSubmitted]);

  useEffect(() => {
    if (prepTime !== null && prepTime > 0) {
      const timer = setInterval(() => {
        setPrepTime(prev => {
          if (prev !== null && prev <= 1) {
            clearInterval(timer);
            setIsPrepFinished(true);
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [prepTime]);
  const translateWord = async (word: string, x: number, y: number, retryCount = 0) => {
    const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '').trim();
    if (translationCache[cleanWord]) {
      const cached = translationCache[cleanWord];
      setActiveTooltip({ word, translation: cached, x, y });
      onNewWord({ id: Math.random().toString(36).substr(2, 9), word: cached, translation: word, learnedAt: Date.now() });
      return;
    }
    
    setActiveTooltip({ word, translation: "...", x, y, isLoading: true });
    try {
      if (retryCount > 0) await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{ role: 'user', parts: [{ text: `Translate the ${getLanguageConfig(language).name} word "${word}" to English. Provide only the translation.` }] }],
      });
      
      const result = response.text || "Translation not found";
      
      translationCache[cleanWord] = result;
      setActiveTooltip({ word, translation: result, x, y, isLoading: false });
      onNewWord({ id: Math.random().toString(36).substr(2, 9), word: result, translation: word, learnedAt: Date.now() });
    } catch (error: any) {
      if ((error?.status === "RESOURCE_EXHAUSTED" || error?.code === 429) && retryCount < 3) {
        return translateWord(word, x, y, retryCount + 1);
      }
      setActiveTooltip({ word, translation: "Failed to translate.", x, y, isLoading: false });
      setTimeout(() => setActiveTooltip(null), 2000);
    }
  };

  const loadModules = async () => {
    const m = await ListeningService.ensureInitialModules(level, examType, language);
    setModules(m);
    setActiveGenerations(ListeningService.getActiveGenerations(level, examType, language));
    setIsInitialLoading(false);
    setIsLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const syncState = async () => {
      const m = await ListeningService.ensureInitialModules(level, examType, language);
      if (isMounted) {
        setModules(m);
        setActiveGenerations(ListeningService.getActiveGenerations(level, examType, language));
        setIsInitialLoading(false);
        setIsLoading(false);
      }
    };

    syncState();

    const unsubscribe = ListeningService.subscribe(() => {
      syncState();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [level, examType, language]);

  useEffect(() => {
    if (genError) {
      const timer = setTimeout(() => {
        setGenError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [genError]);

  const handleGenerateModule = async (index: number) => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (generatingRef.current.has(index)) return;
    
    const check = ListeningService.canGenerateMore(level, examType, language);
    if (!check.can) {
      setGenError(check.reason || 'Cannot generate more modules');
      return;
    }

    generatingRef.current.add(index);
    setGenError(null);
    try {
      await ListeningService.generateSingleModule(level, examType, language, index);
    } catch (e: any) {
      console.error("[ListeningInterface] Generation error:", e);
      let message = e.message || 'Failed to generate module';
      if (message.includes('429') || message.includes('RESOURCE_EXHAUSTED')) {
        message = 'The system is currently handling a high volume of requests. Please wait a moment before starting your next module.';
      } else if (message.includes('SAFETY') || message.includes('HARM')) {
        message = 'Safety filters blocked this generation. Please try a different scenario.';
      }
      setGenError(message);
    } finally {
      generatingRef.current.delete(index);
    }
  };

  const handleDeleteModule = (id: string) => {
    console.log('[ListeningInterface] Deleting module:', id);
    ListeningService.deleteModule(id, language);
    if (selectedModule?.id === id) {
      setSelectedModule(null);
    }
    setConfirmingDeleteId(null);
  };

  const handleSelectModule = (m: ListeningModule) => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Initialize answers from module if completed, otherwise empty
    const initialAnswers: Record<string, number> = {};
    if (m.isCompleted) {
      m.questions.forEach(q => {
        if (q.userAnswerIndex !== undefined) {
          initialAnswers[q.id] = q.userAnswerIndex;
        }
      });
    }

    setSelectedModule(m);
    setShowQuestions(true); 
    setUserAnswers(initialAnswers);
    setIsSubmitted(m.isCompleted);
    setShowResults(m.isCompleted);
    setIsPlaying(false);
    setIsAudioFinished(false);
    setGenError(null);
    setCurrentTime(0);
    setDuration(0);
    setPrepTime(null);
    setIsPrepFinished(false);
    setPracticeMode(null);
    setCurrentAudioIndex(null);
    setPostAudioTime(null);
    setIsAutoPlaying(false);
  };

  const handleReload = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const togglePlay = async () => {
    if (!selectedModule) return;

    const audioId = selectedModule.audioId || "";

    // Check for WEB TTS Fallback Marker
    if (audioId.startsWith('WEB_TTS_FALLBACK:')) {
      if (isPlaying) {
        if (voiceService.isPaused) {
          voiceService.resumeSpeaking();
          setIsPlaying(true);
        } else {
          voiceService.pauseSpeaking();
          setIsPlaying(false);
        }
        return;
      }

      const script = audioId.replace('WEB_TTS_FALLBACK:', '');
      setIsPreloading(true);
      try {
        await voiceService.speak({ 
          text: script, 
          languageCode: language,
          isNaturalMode: true,
          onStart: () => {
            setIsPreloading(false);
            setIsPlaying(true);
          },
          onProgress: (percent) => {
            setCurrentTime(percent);
            setDuration(100);
          }
        });
      } finally {
        setIsPlaying(false);
        setIsAudioFinished(true);
        if (practiceMode === 'professional' && selectedModule.teil === 2) {
          setPostAudioTime(prev => prev === null ? 300 : prev);
        }
        setIsPreloading(false);
      }
      return;
    }

    if (!audioRef.current) {
      setIsAudioLoading(true);
      await preloadCurrentModule();
      setIsAudioLoading(false);
      
      if (!audioRef.current) {
        setAudioError("Audio is still loading... please wait a moment.");
        return;
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsPlaying(true);
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error('Play error:', err);
            setAudioError('Playback failed. Please try again.');
            setIsPlaying(false);
          });
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedModule) return;
    
    let score = 0;
    selectedModule.questions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        score++;
      }
    });

    const updatedModule: ListeningModule = {
      ...selectedModule,
      isCompleted: true,
      score,
      questions: selectedModule.questions.map(q => ({
        ...q,
        userAnswerIndex: userAnswers[q.id]
      }))
    };

    const allModules = ListeningService.getModules(language);
    const updatedAllModules = allModules.map(m => m.id === updatedModule.id ? updatedModule : m);
    
    ListeningService.saveModules(updatedAllModules, language);
    const levelModules = updatedAllModules.filter(m => m.level === level && m.examType === examType);
    setModules(levelModules);
    setSelectedModule(updatedModule);
    setIsSubmitted(true);
    setShowResults(true);

    if (score === selectedModule.questions.length && score > 0) {
      triggerCelebration();
    }

    // Update progress
    const maxScore = selectedModule.questions.length;
    const normalizedScore = maxScore > 0 ? score / maxScore : 0;
    onProgressUpdate(normalizedScore * 100);

    // Update Fluency Mirror
    FluencyService.updateFluency(
      language,
      level,
      'listening',
      { 
        moduleId: selectedModule.id, 
        score, 
        maxScore,
        title: selectedModule.title
      }
    );
  };

  const handleBack = () => {
    if (selectedModule && practiceMode === 'professional' && !isSubmitted) {
      setShowExitConfirm(true);
    } else if (selectedModule) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setSelectedModule(null);
    } else {
      onClose();
    }
  };

  const completedCount = modules.filter(m => m.isCompleted && m.examType === examType && m.level === level).length;

  if (isInitialLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-text-muted font-medium tracking-widest uppercase text-xs">Preparing Listening Modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-app-bg overflow-hidden flex flex-col">
      {/* Background Highlights */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="p-4 md:p-6 border-b border-app-border flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card-soft backdrop-blur-xl shrink-0 gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card-soft hover:bg-card-bg rounded-2xl transition-all border border-app-border group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold hidden xs:inline">
              {selectedModule ? 'Exit Module' : 'Back'}
            </span>
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight line-clamp-1 text-text-main">
              {selectedModule ? selectedModule.title : 'Listening'}
            </h2>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted font-black">
              {selectedModule ? 'Audio Experience' : 'Select a Module'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {selectedModule && (
            <div className="flex items-center gap-2 bg-card-bg px-4 py-2 rounded-2xl border border-app-border">
              <Clock size={14} className="text-accent" />
              <span className="text-xs font-mono font-bold">{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          )}
          <div className="flex items-center gap-3 bg-card-soft px-4 py-2 rounded-2xl border border-app-border">
            <Trophy size={16} className="text-orange-500" />
            <span className="text-sm font-bold text-text-main">{completedCount} / {TOTAL_MODULES}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Module List */}
        <aside className={cn(
          "w-full md:w-80 border-r border-app-border flex flex-col bg-card-bg/40 backdrop-blur-md h-full",
          selectedModule ? "hidden md:flex" : "flex"
        )}>
          <div className="p-6 border-b border-app-border shrink-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Modules (1-100)</h3>
              <div className="px-2 py-1 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <span className="text-[10px] font-black text-orange-500">
                  {completedCount} / {TOTAL_MODULES}
                </span>
              </div>
            </div>

            <AnimatePresence>
              {genError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-500 font-bold flex items-center gap-2 shadow-lg shadow-red-500/5 overflow-hidden"
                >
                  <AlertCircle size={12} />
                  <p className="flex-1">{genError}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-24 md:pb-8">
            {Array.from({ length: TOTAL_MODULES }, (_, i) => {
              const module = modules.find(m => m.index === i);
              const isLocked = !module;
              const isSelected = !!module && selectedModule?.id === module.id;
              const isThisGenerating = activeGenerations.includes(i);

              return (
                <div
                  key={i}
                  className="w-full relative group"
                >
                  <button
                    onClick={() => {
                      if (isLocked) {
                        if (!isThisGenerating) handleGenerateModule(i);
                      } else {
                        handleSelectModule(module);
                      }
                    }}
                    className={cn(
                      "w-full relative p-4 rounded-2xl border transition-all text-left group overflow-hidden",
                      isLocked ? "bg-card-soft border-app-border opacity-80 hover:bg-card-bg" : 
                      isSelected ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" :
                      "bg-card-bg border-app-border hover:border-orange-500/30 hover:bg-card-soft",
                      isThisGenerating && "border-orange-500/50 bg-orange-500/5"
                    )}
                  >
                    {isSelected && (
                      <motion.div 
                        layoutId="active-module-bg"
                        className="absolute inset-0 bg-orange-500"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          isSelected ? "text-white/80" : "text-text-muted"
                        )}>Module {i + 1}</span>
                        {isThisGenerating ? (
                          <Loader2 size={14} className="animate-spin text-orange-500" />
                        ) : isLocked ? (
                          <div className="p-1 bg-card-soft rounded-lg text-text-muted group-hover:text-orange-500 transition-colors">
                            <Lock size={18} />
                          </div>
                        ) : 
                         module.isCompleted && <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-orange-500"} />}
                      </div>
                      <h4 className={cn("font-bold truncate text-sm", isSelected ? "text-white" : "text-text-main")}>
                        {isThisGenerating ? "Generating..." : isLocked ? "Unlock Module" : module.title}
                      </h4>
                      {module?.isCompleted && (
                        <div className={cn("text-[10px] font-bold mt-2", isSelected ? "text-white/80" : "text-text-muted")}>
                          Score: {module.score} / {module.questions.length}
                        </div>
                      )}
                    </div>
                  </button>

                  {module && !isThisGenerating && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
                      <AnimatePresence>
                        {confirmingDeleteId === module.id ? (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: 10 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, x: 10 }}
                            className="flex items-center gap-1 bg-red-500 rounded-xl p-1 shadow-lg"
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModule(module.id);
                              }}
                              className="px-2 py-1 text-[10px] font-black text-white uppercase hover:bg-white/10 rounded-lg transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteId(null);
                              }}
                              className="p-1 text-white/80 hover:text-white transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingDeleteId(module.id);
                            }}
                            className={cn(
                              "p-2 rounded-xl transition-all shadow-sm",
                              isSelected ? "bg-white/20 text-white hover:bg-white/40 backdrop-blur-md" : "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                            )}
                            title="Delete Module"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto p-6 md:p-12 relative z-10",
          !selectedModule ? "hidden md:block" : "block"
        )}>
          <AnimatePresence mode="wait">
            {!selectedModule ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
              >
                <div className="relative mb-12">
                  <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transform rotate-3">
                    <Volume2 size={48} />
                  </div>
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight text-text-main">Select a Module</h3>
                <p className="text-text-muted leading-relaxed font-medium">
                  Choose a listening module from the list to start your practice. Each module is designed to simulate real language examinations.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedModule.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-12 pb-24"
              >
                {/* Mobile Back Button */}
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="md:hidden flex items-center gap-3 bg-card-soft border border-app-border px-6 py-4 rounded-2xl text-text-muted font-black text-xs uppercase tracking-widest mb-8 hover:bg-card-bg transition-colors"
                >
                  <ChevronLeft size={20} />
                  Back to Modules
                </button>

                {/* Main Content Area */}
                {showResults ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card-bg/60 border border-app-border rounded-[3rem] p-12 text-center space-y-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                    
                    <div className="space-y-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse" />
                        <div className="relative w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl rotate-3">
                          <Trophy size={48} />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black tracking-tight text-text-main">Practice Complete!</h3>
                        <p className="text-text-muted font-medium">Here is how you performed in this module.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-card-soft/50 border border-app-border p-8 rounded-3xl space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Your Score</p>
                        <div className="text-5xl font-black text-orange-500">
                          {selectedModule.score} <span className="text-2xl text-text-muted">/ {selectedModule.questions.length}</span>
                        </div>
                      </div>
                      
                      <div className="bg-card-soft/50 border border-app-border p-8 rounded-3xl space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Accuracy</p>
                        <div className="text-5xl font-black text-text-main">
                          {Math.round((selectedModule.score / selectedModule.questions.length) * 100)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        onClick={() => setShowResults(false)}
                        className="flex-1 px-8 py-5 bg-card-soft border border-app-border text-text-main rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-card-bg transition-all flex items-center justify-center gap-3"
                      >
                        Review Answers
                        <ArrowRight size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedModule(null)}
                        className="flex-1 px-8 py-5 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                      >
                        Next Module
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Mode Selection */}
                    {!practiceMode && !isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card-bg/60 border border-app-border rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl backdrop-blur-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                    
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mx-auto mb-6">
                        <Sparkles size={40} />
                      </div>
                      <h3 className="text-3xl font-black tracking-tight text-text-main">Choose Your Mode</h3>
                      <p className="text-text-muted max-w-sm mx-auto font-medium">
                        Select how you want to attempt this module. Professional mode simulates real exam conditions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        onClick={() => {
                          setPracticeMode('casual');
                          setIsPrepFinished(true);
                        }}
                        className="group relative p-8 rounded-3xl border border-app-border bg-card-soft hover:bg-card-bg transition-all text-left space-y-4 hover:border-orange-500/30"
                      >
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <Play size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-text-main">Casual Mode</h4>
                          <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                            No timers, manual controls, and replay any audio as many times as you want.
                          </p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setPracticeMode('professional')}
                        className="group relative p-8 rounded-3xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left space-y-4 hover:border-orange-500/40"
                      >
                        <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                          <Trophy size={24} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-text-main">Professional Mode</h4>
                          <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                            Exam timers, automatic playback, no pauses, and single attempt per audio.
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Preparation Timer */}
                {practiceMode === 'professional' && !isPrepFinished && !isSubmitted && prepTime !== null && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-12 text-center space-y-6 backdrop-blur-md relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent" />
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-center gap-3 text-orange-500">
                        <Clock size={32} className="animate-pulse" />
                        <span className="text-lg font-black uppercase tracking-[0.2em]">Preparation Time</span>
                      </div>
                      <div className="text-7xl font-black text-orange-500 tabular-nums">{prepTime}s</div>
                      <p className="text-text-muted font-bold max-w-xs mx-auto">
                        Read the statements below carefully. The audio will start automatically.
                      </p>
                      <button 
                        onClick={() => setIsPrepFinished(true)}
                        className="px-8 py-4 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                      >
                        Skip and Start Audio
                      </button>
                    </div>
                  </div>
                )}

                {/* Post-Audio Timer (Teil 2 Professional) */}
                {practiceMode === 'professional' && postAudioTime !== null && !isSubmitted && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-3xl p-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                      <Clock size={24} className="text-orange-500 animate-pulse" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Time Remaining to Submit</p>
                        <p className="text-2xl font-black text-text-main tabular-nums">
                          {Math.floor(postAudioTime / 60)}:{(postAudioTime % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={handleSubmit}
                      className="px-6 py-3 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all"
                    >
                      Submit Now
                    </button>
                  </div>
                )}

                {/* Module Header */}
                {practiceMode && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Teil {selectedModule.teil || 1}: {selectedModule.teil === 1 ? 'Global Understanding' : selectedModule.teil === 2 ? 'Detailed Understanding' : 'Selective Understanding'}
                      </span>
                    </div>
                    <h2 className="text-4xl font-black tracking-tight leading-none text-text-main">{selectedModule.title}</h2>
                    <p className="text-text-muted">
                      {selectedModule.teil === 1 ? 'Listen to the short clips and decide if the statements are Right or False.' :
                       selectedModule.teil === 2 ? 'Listen to the interview and decide if the statements are Right or False.' :
                       'Listen to the announcements and decide if the statements are Right or False.'}
                    </p>
                  </div>
                )}

                {/* Audio Player Strip (Teil 2 only) */}
                {practiceMode && selectedModule.teil === 2 && (
                  <div className="space-y-4">
                    <div className="bg-card-bg/60 border border-app-border rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                      
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              onClick={togglePlay}
                              disabled={isAudioLoading || (!isPrepFinished && !isSubmitted) || (practiceMode === 'professional' && (isPlaying || isAudioFinished))}
                              className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20",
                                (isAudioLoading || (!isPrepFinished && !isSubmitted) || (practiceMode === 'professional' && (isPlaying || isAudioFinished))) ? "bg-card-soft" : "bg-orange-500 hover:bg-orange-600"
                              )}
                            >
                              {isAudioLoading ? <Loader2 size={24} className="animate-spin" /> : 
                               isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                            
                            <div className="space-y-1">
                              <h4 className="font-black text-sm tracking-tight text-text-main">
                                {isAudioLoading ? "Loading Audio..." : isPlaying ? "Now Playing" : isAudioFinished ? "Audio Finished" : "Ready to Listen"}
                              </h4>
                              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                                {selectedModule.title}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={handleReload}
                              disabled={isAudioLoading || !audioRef.current || practiceMode === 'professional'}
                              className="w-10 h-10 rounded-xl bg-card-soft flex items-center justify-center text-text-muted hover:bg-card-bg hover:text-text-main transition-all disabled:opacity-30"
                              title="Restart Audio"
                            >
                              <RotateCcw size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div 
                            onClick={practiceMode === 'professional' ? undefined : handleSeek}
                            className={cn(
                              "w-full bg-card-soft/20 rounded-lg p-1",
                              practiceMode === 'professional' ? "cursor-default" : "cursor-pointer"
                            )}
                          >
                            <SegmentedProgressBar current={currentTime} total={duration} segments={40} />
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-black font-mono text-text-muted tracking-widest tabular-nums">
                            <div className="flex items-center gap-4">
                              <span className="text-orange-500">{formatTime(currentTime)}</span>
                              <AudioVisualizer isPlaying={isPlaying} />
                              <span className="opacity-50">Remaining: {formatTime(Math.max(0, duration - currentTime))}</span>
                            </div>
                            <span>Total: {formatTime(duration)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {audioError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs text-red-500 font-bold flex items-center gap-3 animate-shake">
                        <AlertCircle size={16} />
                        {audioError}
                      </div>
                    )}
                  </div>
                )}

                {/* Questions Section */}
                {practiceMode && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight text-text-main">Questions</h3>
                      {isSubmitted && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <Trophy size={16} className="text-orange-500" />
                          <span className="text-sm font-bold text-orange-500">Score: {selectedModule.score} / {selectedModule.questions.length}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-12">
                      {selectedModule.questions.map((q, qIdx) => (
                        <motion.div 
                          key={q.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: qIdx * 0.1 }}
                          className={cn(
                            "bg-card-bg/40 border border-app-border rounded-[2.5rem] p-6 md:p-10 space-y-8 relative overflow-hidden group/question transition-all",
                            currentAudioIndex === qIdx && "border-orange-500/40 bg-orange-500/[0.02] ring-1 ring-orange-500/20"
                          )}
                        >
                          {/* Audio for Teil 1 and 3 */}
                          {(selectedModule.teil === 1 || selectedModule.teil === 3) && q.audioId && (
                            <MiniAudioPlayer 
                              audioId={q.audioId} 
                              title={`Clip ${qIdx + 1}`} 
                              isActive={currentAudioIndex === qIdx}
                              isProfessional={practiceMode === 'professional'}
                              disabled={!isPrepFinished && !isSubmitted}
                              isSubmitted={isSubmitted}
                              languageCode={language}
                              onEnded={() => {
                                if (practiceMode === 'professional') {
                                  if (qIdx < selectedModule.questions.length - 1) {
                                    setTimeout(() => {
                                      setCurrentAudioIndex(qIdx + 1);
                                    }, 5000);
                                  } else {
                                    setCurrentAudioIndex(null);
                                  }
                                }
                              }}
                            />
                          )}

                          <div className="flex items-start gap-4 md:gap-8 relative z-10 w-full overflow-hidden">
                            <div className="relative shrink-0">
                              <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full" />
                              <span className="relative w-10 h-10 md:w-14 md:h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-sm md:text-lg font-black text-white shadow-xl shadow-orange-500/20">
                                {qIdx + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 space-y-6">
                              <div className="text-xl md:text-2xl font-bold leading-tight text-text-main flex flex-wrap gap-x-2 break-german">
                                {(q.question || "").split(' ').map((word, i) => {
                                  const cleanWord = word.toLowerCase().replace(/[.,!?]/g, '').trim();
                                  const hint = q.vocabularyHints?.[cleanWord] || q.vocabularyHints?.[word];
                                  return (
                                    <motion.span
                                      key={i}
                                      onClick={(e) => {
                                        if (hint) {
                                          setActiveTooltip({ word, translation: hint, x: e.clientX, y: e.clientY });
                                          onNewWord({ id: Math.random().toString(36).substr(2, 9), word: hint, translation: word, learnedAt: Date.now() });
                                        } else {
                                          translateWord(word, e.clientX, e.clientY);
                                        }
                                      }}
                                      className={cn(
                                        "cursor-pointer transition-colors",
                                        hint ? "underline decoration-dotted decoration-orange-500/60 decoration-2 underline-offset-4 hover:text-orange-500" : "hover:text-orange-500/40"
                                      )}
                                    >
                                      {word}
                                    </motion.span>
                                  );
                                })}
                              </div>

                              <div className="grid grid-cols-2 gap-3 md:gap-4 w-full">
                                {q.options.map((option, oIdx) => {
                                  const isSelected = userAnswers[q.id] === oIdx;
                                  const isCorrect = q.correctAnswerIndex === oIdx;
                                  const isWrong = isSubmitted && isSelected && !isCorrect;
                                  const showCorrect = isSubmitted && isCorrect;

                                  return (
                                    <button
                                      key={oIdx}
                                      disabled={isSubmitted}
                                      onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: oIdx }))}
                                      className={cn(
                                        "p-4 md:p-6 rounded-2xl border text-center transition-all flex items-center justify-center gap-2 md:gap-3 font-black uppercase tracking-widest text-[10px] md:text-xs min-w-0 break-all",
                                        isSelected ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" : "bg-card-soft border-app-border hover:bg-card-bg text-text-muted",
                                        showCorrect && "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/20",
                                        isWrong && "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20",
                                        isSubmitted && !isSelected && !isCorrect && "opacity-50"
                                      )}
                                    >
                                      <span className="truncate">{option}</span>
                                      {showCorrect && <CheckCircle2 size={16} className="shrink-0" />}
                                      {isWrong && <AlertCircle size={16} className="shrink-0" />}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {!isSubmitted && (
                      <div className="pt-8">
                        <button
                          disabled={Object.keys(userAnswers).length < selectedModule.questions.length}
                          onClick={handleSubmit}
                          className="w-full bg-orange-500 text-white font-black text-sm uppercase tracking-widest py-8 rounded-[2rem] hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-orange-500/20 group"
                        >
                          <span className="flex items-center justify-center gap-3">
                            Finish Module
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </button>
                        <p className="text-center text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-6">
                          All unanswered questions will be marked as incorrect
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
        </main>
      </div>

      {/* Celebration Flash */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, repeat: 4 }}
            className="fixed inset-0 bg-white pointer-events-none z-[10001]"
          />
        )}
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            style={{ left: activeTooltip.x, top: activeTooltip.y - 60 }}
            className="fixed z-[100] -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-xl shadow-xl pointer-events-none"
          >
            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{activeTooltip.word}</div>
            <div className="text-sm font-bold flex items-center gap-2">
              {activeTooltip.isLoading && <Loader2 size={12} className="animate-spin" />}
              {activeTooltip.translation}
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-orange-500" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Click Listener to close tooltip */}
      {activeTooltip && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setActiveTooltip(null)}
        />
      )}

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm transform-gpu will-change-[opacity]"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-card-bg border border-app-border rounded-[32px] p-8 md:p-10 shadow-2xl text-center space-y-6 overflow-hidden z-10 transform-gpu will-change-transform"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent border border-accent/20">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-text-main text-center">
                  Abandon Timed Challenge?
                </h3>
                
                <p className="text-sm text-text-muted leading-relaxed text-center">
                  Hey{' '}
                  <span className="font-bold text-accent">
                    {UserService.getProfile()?.name || 'Explorer'}
                  </span>
                  , this hesitation is the price you pay today for tomorrow's SUCCESS.
                </p>
                
                <p className="text-xs text-text-subtle text-center">
                  Are you absolutely sure you want to stop? Your timed progress and answers for this module will be abandoned.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Stay and Conquer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    if (audioRef.current) {
                      audioRef.current.pause();
                      audioRef.current = null;
                    }
                    setSelectedModule(null);
                  }}
                  className="flex-1 py-3.5 bg-card-soft text-text-muted border border-app-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                >
                  Confirm Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
