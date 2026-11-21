import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, Sparkles, CheckCircle2, Info, 
  ChevronRight, Trophy, AlertCircle, Loader2, 
  Book, RotateCcw, Clock, Trash2, X, Check, Activity,
  ClipboardCheck, Play, Pause
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { ReadingModule, ReadingExercise, ReadingQuestion, LanguageLevel, VocabularyWord } from '../types';
import { ReadingService } from '../services/ReadingService';
import { FluencyService } from '../services/FluencyService';
import { UserService } from '../services/UserService';
import { CloudStatsService } from '../services/CloudStatsService';
import { platformService } from '../services/PlatformService';
import { getLanguageConfig } from '../config/languages';
import { cn } from '../lib/utils';
import confetti from 'canvas-confetti';
import { MultilingualLemmatizer } from '../services/dictionary';

interface ReadingGenerationTask {
  id: string;
  level: string;
  language: string;
  moduleNumber: number;
  customTopic?: string;
  status: 'pending' | 'generating' | 'success' | 'failed';
  error?: string;
  errorCode?: 'UNAUTHORIZED' | 'AGE_REQUIRED' | 'RATE_LIMITED' | 'SERVICE_UNAVAILABLE' | 'NO_FALLBACK' | 'NETWORK_ERROR' | 'UNKNOWN';
  createdAt: number;
  updatedAt: number;
}

interface ReadingInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
  user?: any;
  onRequireLogin?: () => void;
}

const WordLink = React.memo(({ text, hints, handleWordClick }: { text: string; hints: Record<string, string>; handleWordClick: (word: string, translation: string | null, e: React.MouseEvent) => void }) => {
  if (!text) return null;
  
  const normalizedHints: Record<string, string> = React.useMemo(() => {
    const h: Record<string, string> = {};
    const punctRegex = /[.,!?:;()„“"»«[\]/|\\—–\s]/g;
    Object.entries(hints || {}).forEach(([k, v]) => {
      const cleanKey = k.toLowerCase().trim().replace(punctRegex, '');
      if (cleanKey) h[cleanKey] = v;
      const verbatimKey = k.toLowerCase().trim();
      if (verbatimKey && verbatimKey !== cleanKey) h[verbatimKey] = v;
    });
    return h;
  }, [hints]);

  // Check if text contains non-spaced Asian scripts (Chinese or Japanese)
  const isCjkText = React.useMemo(() => /[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/.test(text), [text]);

  if (isCjkText) {
    // Dictionary substring scanning for non-spaced scripts
    const hintKeys = Object.keys(normalizedHints).sort((a, b) => b.length - a.length);
    const elements: React.ReactNode[] = [];
    let i = 0;
    const len = text.length;

    while (i < len) {
      let matchedKey: string | null = null;
      let matchedTranslation: string | null = null;

      // Scan for longest matching dictionary term starting at current index
      for (const key of hintKeys) {
        if (key.length <= 1) continue;
        const sub = text.substring(i, i + key.length).toLowerCase();
        if (sub === key) {
          matchedKey = text.substring(i, i + key.length);
          matchedTranslation = normalizedHints[key];
          break;
        }
      }

      if (matchedKey && matchedTranslation) {
        const tokenStr = matchedKey;
        const transStr = matchedTranslation;
        elements.push(
          <span 
            key={`cjk-term-${i}`} 
            onClick={(e) => handleWordClick(tokenStr, transStr, e)}
            className="cursor-help font-bold text-inherit px-0.5 inline border-b-2 border-dotted border-accent/80 hover:bg-accent/15 hover:text-accent transition-all"
            title="Click for translation"
          >
            {tokenStr}
          </span>
        );
        i += matchedKey.length;
      } else {
        // Collect continuous plain characters until next potential dictionary match or punctuation
        let nextMatchIdx = i + 1;
        while (nextMatchIdx < len) {
          let hasMatchAtNext = false;
          for (const key of hintKeys) {
            if (key.length <= 1) continue;
            if (text.substring(nextMatchIdx, nextMatchIdx + key.length).toLowerCase() === key) {
              hasMatchAtNext = true;
              break;
            }
          }
          if (hasMatchAtNext) break;
          nextMatchIdx++;
        }
        elements.push(<span key={`cjk-plain-${i}`}>{text.substring(i, nextMatchIdx)}</span>);
        i = nextMatchIdx;
      }
    }

    return <>{elements}</>;
  }

  // Tokenization for spaced and alphabetic languages
  const tokens = text.split(/(\s+|[.,!?:;()„“"»«[\]/|\\—–])/g);
  const cleanPunct = (t: string) => t.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');

  return (
    <>
      {tokens.map((token, i) => {
        if (!token) return null;
        const isWordMatch = /[\p{L}\p{N}]/u.test(token);
        if (!isWordMatch) return <span key={i}>{token}</span>;

        const cleanToken = cleanPunct(token);
        let hint = normalizedHints[cleanToken] || normalizedHints[token.toLowerCase().trim()];

        // Robust matching fallback for inflections, suffixes, plurals, or compound roots
        if (!hint && cleanToken.length > 3) {
          const matchedKey = Object.keys(normalizedHints).find(key => {
            if (key.length <= 3) return false;
            return cleanToken.startsWith(key) || 
                   key.startsWith(cleanToken) || 
                   (cleanToken.length > 5 && key.length > 5 && (
                     cleanToken.includes(key) || key.includes(cleanToken)
                   ));
          });
          if (matchedKey) {
            hint = normalizedHints[matchedKey];
          }
        }

        if (hint) {
          return (
            <span 
              key={i} 
              onClick={(e) => handleWordClick(token, hint, e)}
              className="cursor-help font-bold text-inherit px-0.5 inline border-b-2 border-dotted border-accent/80 hover:bg-accent/15 hover:text-accent transition-all"
              title="Click for translation"
            >
              {token}
            </span>
          );
        }

        return (
          <span key={i} className="text-inherit inline">
            {token}
          </span>
        );
      })}
    </>
  );
});

const PROFESSIONAL_MCQ_TIME_SECONDS = 15 * 60; // 15 minutes (900s) for multiple choice questions
const PROFESSIONAL_TF_TIME_SECONDS = 5 * 60;   // 5 minutes (300s) for true or false questions

export function ReadingInterface({ level, language, onClose, onProgressUpdate, onNewWord, user, onRequireLogin }: ReadingInterfaceProps) {
  const [modules, setModules] = useState<ReadingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ReadingModule | null>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_reading_selected_${language}_${level}`) || localStorage.getItem(`lang_reading_selected_${language}_${level}`);
      if (!saved) return null;
      const mod = JSON.parse(saved);
      return ReadingService.ensureModuleVocabulary(mod, language);
    } catch (e) {
      console.error("[Reading] Error parsing selected module:", e);
      return null;
    }
  });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    const saved = localStorage.getItem(`langeasy_reading_ex_index_${language}_${level}`) || localStorage.getItem(`lang_reading_ex_index_${language}_${level}`);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const saved = localStorage.getItem(`langeasy_reading_q_index_${language}_${level}`) || localStorage.getItem(`lang_reading_q_index_${language}_${level}`);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [generationQueue, setGenerationQueue] = useState<ReadingGenerationTask[]>(() => {
    try {
      const saved = localStorage.getItem('langeasy_reading_gen_queue');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [currentlyProcessingId, setCurrentlyProcessingId] = useState<string | null>(null);
  const sessionInitiatedTaskIds = useRef<Set<string>>(new Set());

  // Derived state to hook seamlessly into existing UI isGenerating logic
  const activeTask = generationQueue.find(t => 
    t.level === level && 
    t.language === language && 
    (t.status === 'pending' || t.status === 'generating')
  );
  const isGenerating = activeTask ? activeTask.moduleNumber : null;

  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_reading_answers_${language}_${level}`) || localStorage.getItem(`lang_reading_answers_${language}_${level}`);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("[Reading] Error parsing user answers:", e);
      return {};
    }
  });
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return (localStorage.getItem(`langeasy_reading_submitted_${language}_${level}`) || localStorage.getItem(`lang_reading_submitted_${language}_${level}`)) === 'true';
  });
  const [isReviewMode, setIsReviewMode] = useState(() => {
    return (localStorage.getItem(`langeasy_reading_review_${language}_${level}`) || localStorage.getItem(`lang_reading_review_${language}_${level}`)) === 'true';
  });
  const [activeTooltip, setActiveTooltip] = useState<{
    word: string;
    lemma?: string;
    pos?: string;
    translation: string;
    x: number;
    y: number;
    arrowOffset: number;
    isLoading?: boolean;
  } | null>(null);
  const [practiceMode, setPracticeMode] = useState<'casual' | 'professional' | null>(() => {
    const saved = localStorage.getItem(`langeasy_reading_mode_${language}_${level}`) || localStorage.getItem(`lang_reading_mode_${language}_${level}`);
    return (saved as any) || null;
  });
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [isShowingCustomInput, setIsShowingCustomInput] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_reading_time_${language}_${level}`) || localStorage.getItem(`lang_reading_time_${language}_${level}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [isGameOver, setIsGameOver] = useState(() => {
    return (localStorage.getItem(`langeasy_reading_gameover_${language}_${level}`) || localStorage.getItem(`lang_reading_gameover_${language}_${level}`)) === 'true';
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isScreenPaused, setIsScreenPaused] = useState(false);

  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem(`langeasy_reading_selected_${language}_${level}`, JSON.stringify(selectedModule));
      // Sync with App.tsx
      localStorage.setItem('langeasy_reading_module', JSON.stringify(selectedModule));
    } else {
      localStorage.removeItem(`langeasy_reading_selected_${language}_${level}`);
      localStorage.removeItem('langeasy_reading_module');
    }
  }, [selectedModule, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_ex_index_${language}_${level}`, currentExerciseIndex.toString());
  }, [currentExerciseIndex, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_q_index_${language}_${level}`, currentQuestionIndex.toString());
  }, [currentQuestionIndex, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_answers_${language}_${level}`, JSON.stringify(userAnswers));
  }, [userAnswers, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_submitted_${language}_${level}`, isSubmitted.toString());
  }, [isSubmitted, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_review_${language}_${level}`, isReviewMode.toString());
  }, [isReviewMode, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_mode_${language}_${level}`, practiceMode || '');
  }, [practiceMode, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_time_${language}_${level}`, timeLeft?.toString() || '');
  }, [timeLeft, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_reading_gameover_${language}_${level}`, isGameOver.toString());
  }, [isGameOver, language, level]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);
  const translationIdRef = useRef<number>(0);
  const mainScrollRef = useRef<HTMLElement | null>(null);
  const passageScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTop = 0;
    }
    if (passageScrollRef.current) {
      passageScrollRef.current.scrollTop = 0;
    }
  }, [selectedModule?.id]);

  // Dismiss any open word translation tooltip cleanly when the user scrolls
  useEffect(() => {
    if (!activeTooltip) return;
    const handleScrollDismiss = () => {
      setActiveTooltip(null);
    };
    const mainEl = mainScrollRef.current;
    const passageEl = passageScrollRef.current;
    mainEl?.addEventListener('scroll', handleScrollDismiss, { passive: true });
    passageEl?.addEventListener('scroll', handleScrollDismiss, { passive: true });
    return () => {
      mainEl?.removeEventListener('scroll', handleScrollDismiss);
      passageEl?.removeEventListener('scroll', handleScrollDismiss);
    };
  }, [activeTooltip]);

  useEffect(() => {
    const handleGlobalClick = () => {
      setActiveTooltip(null);
      translationIdRef.current++; // Cancel pending translation by incrementing ID
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);
  useEffect(() => {
    const saved = ReadingService.getSavedModules(language);
    setModules(saved);
  }, [language]);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Background processing of the generation queue
  useEffect(() => {
    // 1. Clean up old/stuck tasks (over 3 days old), or tasks for modules already saved in local storage
    const savedModules = ReadingService.getSavedModules(language);
    const savedModuleNumbers = new Set(savedModules.filter(m => m.level === level).map(m => m.moduleNumber));
    const staleThreshold = Date.now() - 6 * 60 * 60 * 1000; // 6 hours

    let needsQueueSave = false;
    const cleanedQueue = generationQueue.filter(t => {
      // If task is for this language/level and module already exists, remove it
      if (t.language === language && t.level === level && savedModuleNumbers.has(t.moduleNumber)) {
        needsQueueSave = true;
        return false;
      }
      // Remove stale failed tasks older than 6 hours
      if (t.status === 'failed' && t.createdAt < staleThreshold) {
        needsQueueSave = true;
        return false;
      }
      return true;
    }).map(t => {
      if (t.status === 'generating' && t.id !== currentlyProcessingId) {
        needsQueueSave = true;
        return { ...t, status: 'pending' as const, updatedAt: Date.now() };
      }
      return t;
    });

    if (needsQueueSave) {
      setGenerationQueue(cleanedQueue);
      localStorage.setItem('langeasy_reading_gen_queue', JSON.stringify(cleanedQueue));
      return;
    }

    // 3. Persist the queue when changed
    localStorage.setItem('langeasy_reading_gen_queue', JSON.stringify(generationQueue));

    // 4. Look for the next task to process
    const nextTask = generationQueue.find(t => t.status === 'pending' || t.status === 'generating');
    if (!nextTask || currentlyProcessingId) return;

    setCurrentlyProcessingId(nextTask.id);

    const processTaskInstance = async () => {
      // Mark task as actively generating
      setGenerationQueue(prev => prev.map(t => t.id === nextTask.id ? { ...t, status: 'generating' as const, updatedAt: Date.now() } : t));

      try {
        console.log(`[Queue Runner] Processing background module generation: id=${nextTask.id} level=${nextTask.level} lang=${nextTask.language} moduleNumber=${nextTask.moduleNumber}`);
        const result = await ReadingService.generateReadingModule(
          nextTask.level as any,
          nextTask.language,
          nextTask.moduleNumber,
          nextTask.customTopic
        );

        if (!isMountedRef.current) return;

        // Save module permanently
        ReadingService.saveModule(nextTask.language, result);

        // Update active modules list in state if it's the current language
        if (nextTask.language === language) {
          setModules(ReadingService.getSavedModules(language));
          
          // Auto-open if the user initiated this task during this active view session and has no active module open yet
          if (sessionInitiatedTaskIds.current.has(nextTask.id)) {
            setSelectedModule(result);
            setPracticeMode(null);
            setIsShowingCustomInput(false);
            setCustomTopicInput('');
          }
        }

        // Mark as success AND clear any older failed task for this module number to prevent stale error cards
        setGenerationQueue(prev => prev.filter(t => !(t.level === nextTask.level && t.language === nextTask.language && t.moduleNumber === nextTask.moduleNumber && t.id !== nextTask.id)).map(t => t.id === nextTask.id ? { ...t, status: 'success' as const, updatedAt: Date.now() } : t));
      } catch (err: any) {
        console.warn(`[Queue Runner] Task ${nextTask.id} encountered notice:`, err?.message || err);
        if (!isMountedRef.current) return;

        const isAuthError = err?.status === 401 || err?.code === 'UNAUTHORIZED';
        const isAgeError = err?.status === 403 || err?.code === 'AGE_CONFIRMATION_REQUIRED' || err?.requiresAgeConfirmation;
        const isRateLimit = err?.status === 429 || err?.code === 'RATE_LIMITED' || err?.code === 'DAILY_QUOTA_DEPLETED';
        const isUnavailable = err?.status === 503 || err?.code === 'SERVICE_UNAVAILABLE';
        const isNoFallback = err?.code === 'NO_FALLBACK';
        const isNetwork = err?.status === 0 || err?.code === 'NETWORK_ERROR' || err?.code === 'NETWORK_TIMEOUT';

        let errorCode: ReadingGenerationTask['errorCode'] = 'UNKNOWN';
        let errorMsg = err?.message || "Generation error. Please retry.";

        if (isAuthError) {
          errorCode = 'UNAUTHORIZED';
          errorMsg = "Authentication required. Please sign in to generate reading modules.";
        } else if (isAgeError) {
          errorCode = 'AGE_REQUIRED';
          errorMsg = "18+ Adult eligibility required. Please confirm your age eligibility to access reading modules.";
        } else if (isRateLimit) {
          errorCode = 'RATE_LIMITED';
          errorMsg = "You have depleted the daily AI request quota across all approved high-quality models (Gemini 3.5+). Please wait for your daily quota to reset or try again shortly.";
        } else if (isUnavailable) {
          errorCode = 'SERVICE_UNAVAILABLE';
          errorMsg = "AI service is experiencing high demand. Tap retry to attempt generation.";
        } else if (isNoFallback) {
          errorCode = 'NO_FALLBACK';
          errorMsg = `AI service is temporarily busy, and no precompiled fallback passage is available for ${language.toUpperCase()} (${level}).`;
        } else if (isNetwork) {
          errorCode = 'NETWORK_ERROR';
          errorMsg = "Network timeout or connection interrupted. Check your internet connection and retry.";
        }

        setGenerationQueue(prev => prev.map(t => t.id === nextTask.id ? { ...t, status: 'failed' as const, error: errorMsg, errorCode, updatedAt: Date.now() } : t));
      } finally {
        if (isMountedRef.current) {
          setCurrentlyProcessingId(null);
        }
      }
    };

    processTaskInstance();
  }, [generationQueue, currentlyProcessingId, language, level]);

  const isTimedSessionActive = Boolean(
    selectedModule &&
    practiceMode === 'professional' &&
    !isSubmitted &&
    !isGameOver &&
    !isReviewMode
  );

  const isTimerPaused = showExitConfirm || isScreenPaused;

  useEffect(() => {
    if (!isTimedSessionActive) {
      setIsScreenPaused(false);
    }
  }, [isTimedSessionActive]);

  // Pause timer immediately when screen locks or app/tab loses visibility
  useEffect(() => {
    if (!isTimedSessionActive) return;

    const pauseOnLockOrHide = () => {
      setIsScreenPaused(true);
    };

    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        pauseOnLockOrHide();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', pauseOnLockOrHide);

    let appStateHandle: any = null;
    if (platformService.isNative()) {
      CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (!isActive) {
          pauseOnLockOrHide();
        }
      })
        .then(handle => {
          appStateHandle = handle;
        })
        .catch(() => {});
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', pauseOnLockOrHide);
      if (appStateHandle && typeof appStateHandle.remove === 'function') {
        appStateHandle.remove();
      }
    };
  }, [isTimedSessionActive]);

  useEffect(() => {
    if (isTimedSessionActive && !isTimerPaused) {
      if (timeLeft === null) {
        setTimeLeft(currentExerciseIndex === 0 ? PROFESSIONAL_MCQ_TIME_SECONDS : PROFESSIONAL_TF_TIME_SECONDS);
      }

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          if (prev === 0) {
            handleAutoAdvance();
            return 0;
          }
          return prev;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isTimedSessionActive, isTimerPaused, currentExerciseIndex]);

  const handleAutoAdvance = () => {
    if (currentExerciseIndex === 0) {
      setCurrentExerciseIndex(1);
      setCurrentQuestionIndex(0);
      setTimeLeft(PROFESSIONAL_TF_TIME_SECONDS);
    } else {
      setIsGameOver(true);
      handleSubmit();
    }
  };

  const handleGenerateModule = (moduleNumber: number, customTopic?: string) => {
    const activeUser = user || CloudStatsService.getCurrentUser();
    if (!activeUser) {
      onRequireLogin?.();
      return;
    }
    const trimmedTopic = customTopic?.trim();
    
    // Check if this task already exists in the queue of pending/generating tasks
    const existingActive = generationQueue.find(t => 
      t.level === level && 
      t.language === language && 
      t.moduleNumber === moduleNumber && 
      ((!trimmedTopic && !t.customTopic) || (trimmedTopic && t.customTopic === trimmedTopic)) &&
      (t.status === 'pending' || t.status === 'generating')
    );

    if (existingActive) {
      // Already generating, just track it so that we open it when done if the user waits
      sessionInitiatedTaskIds.current.add(existingActive.id);
      setActiveTooltip(null);
      setIsShowingCustomInput(false);
      setCustomTopicInput('');
      return;
    }

    const taskId = `task-${level}-${language}-${moduleNumber}-${Date.now()}`;
    const newTask: ReadingGenerationTask = {
      id: taskId,
      level,
      language,
      moduleNumber,
      customTopic: trimmedTopic || undefined,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    sessionInitiatedTaskIds.current.add(taskId);
    setGenerationQueue(prev => [
      ...prev.filter(t => !(t.level === level && t.language === language && t.moduleNumber === moduleNumber && t.status === 'failed')),
      newTask
    ]);
    
    setActiveTooltip(null);
    setIsShowingCustomInput(false);
    setCustomTopicInput('');
  };

  const handleDeleteModule = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmingDelete !== moduleId) {
      setConfirmingDelete(moduleId);
      setTimeout(() => setConfirmingDelete(null), 3000); // Reset after 3 seconds
      return;
    }
    
    ReadingService.deleteModule(language, moduleId);
    setModules(prev => prev.filter(m => m.id !== moduleId));
    if (selectedModule?.id === moduleId) setSelectedModule(null);
    setConfirmingDelete(null);
  };

  const handleStartModule = (mode: 'casual' | 'professional') => {
    if (selectedModule?.isCompleted) {
      setIsReviewMode(true);
      setIsSubmitted(true);
      setCurrentExerciseIndex(0);
      setCurrentQuestionIndex(0);
      setPracticeMode(mode);
      return;
    }
    setPracticeMode(mode);
    setIsGameOver(false);
    setIsSubmitted(false);
    setIsReviewMode(false);
    setShowExitConfirm(false);
    setIsScreenPaused(false);
    setCurrentExerciseIndex(0);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    if (mode === 'professional') {
      setTimeLeft(PROFESSIONAL_MCQ_TIME_SECONDS);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (isSubmitted || isReviewMode) return;
    const questionId = selectedModule!.exercises[currentExerciseIndex].questions[currentQuestionIndex].id;
    setUserAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const currentExercise = selectedModule?.exercises[currentExerciseIndex];
  const currentQuestion = currentExercise?.questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < currentExercise!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentExerciseIndex === 0) {
      // Moving to Exercise 2
      setCurrentExerciseIndex(1);
      setCurrentQuestionIndex(0);
      if (practiceMode === 'professional' && !isReviewMode) {
        setTimeLeft(PROFESSIONAL_TF_TIME_SECONDS);
      }
    } else {
      if (isReviewMode) {
        setSelectedModule(null);
        setIsReviewMode(false);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentExerciseIndex > 0) {
      // In professional mode, scrolling back to previous exercise is forbidden to prevent time cheating
      if (practiceMode === 'professional' && !isReviewMode) return;
      
      setCurrentExerciseIndex(0);
      setCurrentQuestionIndex(currentExerciseIndex === 1 ? selectedModule!.exercises[0].questions.length - 1 : 0);
    }
  };

  const handleSubmit = async () => {
    if (isReviewMode) return;
    setIsSubmitted(true);
    let correctCount = 0;
    selectedModule!.exercises.forEach(ex => {
      ex.questions.forEach(q => {
        if (userAnswers[q.id] === q.correctAnswerIndex) {
          correctCount++;
        }
      });
    });

    const score = Math.round((correctCount / 10) * 100);
    const updatedModule = { ...selectedModule!, isCompleted: true, score };
    setSelectedModule(updatedModule);
    setModules(prev => prev.map(m => m.id === updatedModule.id ? updatedModule : m));
    ReadingService.saveModule(language, updatedModule);
    onProgressUpdate(score);

    if (score === 100) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF4500']
      });
    }

    try {
      await FluencyService.updateFluency(language, level, 'reading', {
        theme: selectedModule!.theme,
        score,
        correctCount
      });
    } catch (e) {
      console.warn("Fluency update non-fatal notice:", e);
    }
  };

  const handleWordClick = (word: string, translation: string | null, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!translation) return;
    
    const cleanWord = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    if (!cleanWord || cleanWord.length <= 1) return;

    if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = 160; 
    
    const originalX = rect.left + rect.width / 2;
    let x = originalX;
    const halfWidth = tooltipWidth / 2;
    
    if (x - halfWidth < 20) x = halfWidth + 20;
    if (x + halfWidth > viewportWidth - 20) x = viewportWidth - halfWidth - 20;

    const arrowOffset = originalX - x;

    // Intelligent morphological lemmatization for base form & POS extraction
    const { lemma: derivedLemma, posGuess } = MultilingualLemmatizer.lemmatize(cleanWord, language);
    const lemma = derivedLemma && derivedLemma.toLowerCase() !== cleanWord ? derivedLemma : undefined;

    setActiveTooltip({ 
      word, 
      lemma,
      pos: posGuess,
      translation, 
      x, 
      y: rect.top - 10,
      arrowOffset
    });
    
    // Save to user library with canonical English-first ordering and base lemma form
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      word: translation,
      translation: lemma ? `${lemma} (${word})` : word,
      learnedAt: Date.now()
    });
    
    tooltipTimerRef.current = setTimeout(() => setActiveTooltip(null), 4000);
  };

  const handleHeaderBack = () => {
    if (isGameOver) {
      setIsGameOver(false);
      setPracticeMode(null);
      return;
    }
    if (isReviewMode) {
      setIsReviewMode(false);
      setIsSubmitted(false);
      setPracticeMode(null);
      return;
    }
    if (isSubmitted) {
      setIsSubmitted(false);
      setPracticeMode(null);
      return;
    }
    if (selectedModule && practiceMode === 'professional') {
      setShowExitConfirm(true);
      return;
    }
    if (practiceMode) {
      setPracticeMode(null);
      return;
    }
    if (selectedModule) {
      setSelectedModule(null);
      return;
    }
    onClose();
  };

  const handleHeaderBackRef = useRef(handleHeaderBack);
  handleHeaderBackRef.current = handleHeaderBack;

  useEffect(() => {
    const onHardwareBack = () => {
      if (showExitConfirm) {
        setShowExitConfirm(false);
        setIsScreenPaused(false);
        return;
      }
      if (isScreenPaused) {
        setIsScreenPaused(false);
        return;
      }
      handleHeaderBackRef.current();
    };
    window.addEventListener('talkybean_reading_back', onHardwareBack);
    return () => window.removeEventListener('talkybean_reading_back', onHardwareBack);
  }, [showExitConfirm, isScreenPaused]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-app-bg text-text-main overflow-hidden font-sans">
      {/* Tooltip component and other overlays will be rendered here */}
      <header className="p-6 border-b border-app-border flex items-center justify-between bg-card-bg/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleHeaderBack}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card-soft hover:bg-card-bg rounded-2xl transition-all border border-app-border group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold hidden xs:inline">Back</span>
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-text-main line-clamp-1">Reading Experience</h1>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted font-black">Level {level} Mastery</p>
          </div>
        </div>

        {selectedModule && practiceMode && !isGameOver && (
          <div className="flex items-center gap-4">
            {practiceMode === 'professional' && !isSubmitted && !isReviewMode && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border font-mono font-bold transition-colors",
                isTimerPaused
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-500"
                  : timeLeft && timeLeft < 60 ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse" : "bg-card-soft border-app-border text-text-main"
              )}>
                <Clock size={16} />
                {Math.floor((timeLeft ?? 0) / 60)}:{((timeLeft ?? 0) % 60).toString().padStart(2, '0')}
                {isTimerPaused && (
                  <span className="text-[10px] font-sans font-black uppercase tracking-wider ml-1">Paused</span>
                )}
              </div>
            )}
            {isReviewMode ? (
              <button 
                onClick={() => setSelectedModule(null)}
                className="px-6 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
              >
                Exit Review
              </button>
            ) : !isSubmitted && (
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
              >
                Submit Module
              </button>
            )}
          </div>
        )}
      </header>

      <main ref={mainScrollRef} className="flex-1 overflow-y-auto touch-pan-y p-6 scrollbar-hide">
        {!selectedModule ? (
          <div className="max-w-6xl mx-auto space-y-12 py-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-text-main to-text-main/60 bg-clip-text text-transparent">
                Mastery Modules
              </h2>
              <p className="text-text-muted max-w-xl mx-auto">Select a module to begin your retrieval-based reading and vocabulary analysis.</p>
              {generationQueue.some(t => t.level === level && t.language === language && t.status === 'failed') && (
                <div className="flex items-center justify-center pt-2">
                  <button
                    onClick={() => setGenerationQueue(prev => prev.filter(t => !(t.level === level && t.language === language && t.status === 'failed')))}
                    className="text-xs text-text-muted hover:text-red-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-soft border border-app-border/40 hover:border-red-500/30 transition-all"
                  >
                    <X size={13} />
                    <span>Clear Failed Generation Notices</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Generic Mastery Modules */}
              {Array.from({ length: 5 }).map((_, i) => {
                const moduleNumber = i + 1;
                const existingModule = modules.find(m => m.level === level && m.moduleNumber === moduleNumber && !m.id.includes('custom'));
                const failedTask = generationQueue.find(t => t.level === level && t.language === language && t.moduleNumber === moduleNumber && t.status === 'failed');

                return (
                  <motion.div
                    key={moduleNumber}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => {
                      const activeUser = user || CloudStatsService.getCurrentUser();
                      if (existingModule) {
                        setSelectedModule(existingModule);
                      } else if (failedTask?.errorCode === 'AGE_REQUIRED') {
                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(new CustomEvent('talkybean_require_age_confirmation'));
                        }
                      } else if (failedTask?.errorCode === 'UNAUTHORIZED') {
                        if (!activeUser) {
                          onRequireLogin?.();
                        } else {
                          handleGenerateModule(moduleNumber);
                        }
                      } else {
                        if (!activeUser) {
                          onRequireLogin?.();
                        } else {
                          handleGenerateModule(moduleNumber);
                        }
                      }
                    }}
                    className={cn(
                      "group bg-card-bg border rounded-card p-6 text-left space-y-4 transition-all cursor-pointer relative overflow-hidden flex flex-col",
                      existingModule 
                        ? existingModule.isCompleted ? "border-green-500/30 bg-green-500/5 shadow-xl shadow-green-500/5" : "border-accent/20 shadow-accent/5 shadow-xl" 
                        : failedTask
                        ? failedTask.errorCode === 'UNAUTHORIZED' ? "border-blue-500/30 bg-blue-500/5 hover:border-blue-500/50" :
                          failedTask.errorCode === 'AGE_REQUIRED' ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50" :
                          "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50"
                        : "border-app-border hover:border-accent/40"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                       <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                        existingModule ? "bg-accent text-white" : 
                        failedTask ? (
                          failedTask.errorCode === 'UNAUTHORIZED' ? "bg-blue-500/10 text-blue-500" :
                          failedTask.errorCode === 'AGE_REQUIRED' ? "bg-rose-500/10 text-rose-500" :
                          "bg-amber-500/10 text-amber-500"
                        ) : "bg-card-soft text-text-muted"
                      )}>
                        {failedTask ? <AlertCircle size={20} /> : <Book size={20} />}
                      </div>
                      
                        <div className="flex items-center gap-2">
                        {failedTask && !existingModule && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setGenerationQueue(prev => prev.filter(x => x.id !== failedTask.id));
                            }}
                            className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 bg-card-soft border border-app-border/30 transition-all"
                            title="Dismiss error notice"
                          >
                            <X size={16} />
                          </button>
                        )}
                        {existingModule && (
                          <button 
                            disabled={isGenerating !== null}
                            onClick={(e) => { e.stopPropagation(); handleGenerateModule(moduleNumber); }}
                            className="p-2.5 rounded-xl hover:bg-accent/10 text-text-muted hover:text-accent bg-card-soft border border-app-border/30 transition-all"
                            title="Regenerate for a different topic"
                          >
                            <RotateCcw size={16} className={isGenerating === moduleNumber ? "animate-spin text-accent" : ""} />
                          </button>
                        )}
                        {existingModule && (
                          <button 
                            disabled={isGenerating !== null}
                            onClick={(e) => handleDeleteModule(existingModule?.id || '', e)}
                            className={cn(
                              "relative z-20 p-2.5 rounded-xl transition-all flex items-center gap-2",
                              confirmingDelete === existingModule?.id 
                                ? "bg-red-600 text-white shadow-xl shadow-red-600/40 px-4 py-2" 
                                : "hover:bg-red-500/10 text-text-muted hover:text-red-500 bg-card-soft border border-app-border/30"
                            )}
                          >
                            {confirmingDelete === existingModule?.id ? (
                              <span className="text-[10px] font-black uppercase tracking-widest">Delete?</span>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
  
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-muted">Module {moduleNumber}</div>
                        {existingModule?.isCompleted && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
                            <CheckCircle2 size={10} className="shrink-0" />
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Completed</span>
                          </div>
                        )}
                        {existingModule?.isFallback && (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
                            <span className="text-[8px] font-black uppercase tracking-widest leading-none">Precompiled</span>
                          </div>
                        )}
                        {existingModule && !existingModule.isCompleted && !existingModule.isFallback && (
                           <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                        )}
                        {failedTask && (
                           <div className={cn(
                             "flex items-center gap-1 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest leading-none",
                             failedTask.errorCode === 'UNAUTHORIZED' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                             failedTask.errorCode === 'AGE_REQUIRED' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                             failedTask.errorCode === 'RATE_LIMITED' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                             "bg-amber-500/10 text-amber-600 border-amber-500/20"
                           )}>
                             <span>
                               {failedTask.errorCode === 'UNAUTHORIZED' ? 'Sign In Required' :
                                failedTask.errorCode === 'AGE_REQUIRED' ? '18+ Required' :
                                failedTask.errorCode === 'RATE_LIMITED' ? 'Rate Limited' :
                                failedTask.errorCode === 'NO_FALLBACK' ? 'Unavailable' :
                                'Generation Issue'}
                             </span>
                           </div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                        Reading Module {moduleNumber}
                      </h3>
                      <p className="text-xs text-text-muted mt-2 line-clamp-2 leading-relaxed">
                        {existingModule 
                          ? existingModule.theme 
                          : failedTask 
                          ? (
                            failedTask.errorCode === 'UNAUTHORIZED'
                              ? "Please sign in to generate and access reading modules."
                              : failedTask.errorCode === 'AGE_REQUIRED'
                              ? "18+ Adult eligibility required. Tap to confirm your eligibility."
                              : failedTask.errorCode === 'RATE_LIMITED'
                              ? "Daily AI rate limit reached. Tap anywhere to retry."
                              : failedTask.error || "Generation interrupted. Tap anywhere on this card to retry."
                          )
                          : `Start level ${level} reading module ${moduleNumber}.`}
                      </p>
                    </div>
  
                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border/40">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Source</span>
                        <span className={cn(
                          "text-[10px] font-bold",
                          existingModule?.isFallback ? "text-amber-500" : "text-text-main"
                        )}>
                          {existingModule?.isFallback ? "Precompiled Library" : "Open Source"}
                        </span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Progress</span>
                        {isGenerating === moduleNumber ? (
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-bold text-accent animate-pulse">Syncing...</span>
                             <Loader2 size={14} className="text-accent animate-spin" />
                          </div>
                        ) : existingModule?.isCompleted ? (
                           <div className="flex items-center gap-1">
                             <Trophy size={12} className="text-green-500" />
                             <span className="text-xs font-black text-green-500">{existingModule.score}%</span>
                           </div>
                        ) : failedTask ? (
                          <div className={cn(
                            "flex items-center gap-1 group-hover:translate-x-1 transition-all",
                            failedTask.errorCode === 'UNAUTHORIZED' ? "text-blue-500" :
                            failedTask.errorCode === 'AGE_REQUIRED' ? "text-rose-500" :
                            "text-amber-500"
                          )}>
                             <span className="text-[10px] font-black uppercase tracking-[0.1em]">
                               {failedTask.errorCode === 'UNAUTHORIZED' ? 'SIGN IN' :
                                failedTask.errorCode === 'AGE_REQUIRED' ? 'VERIFY' :
                                'RETRY'}
                             </span>
                             <ChevronRight size={14} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-accent group-hover:translate-x-1 transition-all">
                             <span className="text-[10px] font-black uppercase tracking-[0.1em]">{existingModule ? 'OPEN' : 'LOAD'}</span>
                             <ChevronRight size={14} />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Custom Modules Already Generated */}
              {modules.filter(m => m.moduleNumber === 999 && m.level === level).map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    if (!user) {
                      onRequireLogin?.();
                      return;
                    }
                    setSelectedModule(m);
                  }}
                  className={cn(
                    "group bg-card-bg border rounded-card p-6 text-left space-y-4 transition-all cursor-pointer relative overflow-hidden flex flex-col",
                    m.isCompleted ? "border-green-500/30 bg-green-500/5 shadow-xl shadow-green-500/5" : "border-orange-500/20 shadow-orange-500/5 shadow-xl" 
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 transition-all group-hover:scale-110">
                      <Sparkles size={20} />
                    </div>
                    <div className="flex items-center gap-2">
                      {m.isCompleted && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500 rounded-full text-white">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest lg:block hidden">Done</span>
                        </div>
                      )}
                      <button 
                        onClick={(e) => handleDeleteModule(m.id, e)}
                        className={cn(
                          "relative z-20 p-2.5 rounded-xl transition-all flex items-center gap-2",
                          confirmingDelete === m.id 
                            ? "bg-red-600 text-white shadow-xl shadow-red-600/40 px-4 py-2" 
                            : "hover:bg-red-500/10 text-text-muted hover:text-red-500 bg-card-soft border border-app-border/30"
                        )}
                      >
                        {confirmingDelete === m.id ? (
                          <span className="text-[10px] font-black uppercase tracking-widest">Delete?</span>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Custom Creation</div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-orange-500 transition-colors">
                      {m.theme}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border/40">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Origin</span>
                      <span className="text-[10px] font-bold text-text-main">Self-Generated</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Score</span>
                      {m.isCompleted ? (
                        <div className="flex items-center gap-1">
                          <Trophy size={12} className="text-green-500" />
                          <span className="text-xs font-black text-green-500">{m.score}%</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-accent group-hover:translate-x-1 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-[0.1em]">RE-OPEN</span>
                          <ChevronRight size={14} />
                        </div>
                      )}
                    </div>
                  </div>

                  {m.isCompleted && (
                    <div className="absolute -bottom-4 -right-4 opacity-[0.03] scale-150 rotate-[-15deg] pointer-events-none">
                      <Trophy size={160} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Custom Tasks in Queue */}
              {generationQueue.filter(t => 
                t.level === level && 
                t.language === language && 
                t.moduleNumber === 999 && 
                (t.status === 'pending' || t.status === 'generating')
              ).map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-card-bg/50 border border-accent/20 rounded-card p-6 text-left space-y-4 relative overflow-hidden flex flex-col cursor-wait"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-accent/20 text-accent flex items-center justify-center animate-pulse">
                      <Sparkles size={20} className="animate-spin text-accent" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 animate-pulse">Generating...</div>
                    <h3 className="font-bold text-lg leading-tight text-text-muted">
                      {t.customTopic}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border/40">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Origin</span>
                      <span className="text-[10px] font-bold text-text-muted">Self-Generated</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-accent animate-pulse">Syncing...</span>
                        <Loader2 size={14} className="text-accent animate-spin w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Failed Custom Tasks in Queue */}
              {generationQueue.filter(t => 
                t.level === level && 
                t.language === language && 
                t.moduleNumber === 999 && 
                t.status === 'failed'
              ).map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-card-bg border border-red-500/20 rounded-card p-6 text-left space-y-4 relative overflow-hidden flex flex-col"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
                      <AlertCircle size={20} />
                    </div>
                    <button 
                      onClick={() => setGenerationQueue(prev => prev.filter(x => x.id !== t.id))}
                      className="p-2 bg-card-soft text-text-muted border border-app-border/30 rounded-xl hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      title="Dismiss error"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Generation Failed</div>
                    <h3 className="font-bold text-lg leading-tight text-text-muted/80">
                      {t.customTopic}
                    </h3>
                    <p className="text-[10px] text-red-400 mt-2 line-clamp-2">{t.error || 'Check connectivity and retry.'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-app-border/40">
                    <button 
                      onClick={() => {
                        if (t.errorCode === 'UNAUTHORIZED') {
                          const activeUser = user || CloudStatsService.getCurrentUser();
                          if (!activeUser) {
                            onRequireLogin?.();
                            return;
                          }
                        }
                        if (t.errorCode === 'AGE_REQUIRED') {
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('talkybean_require_age_confirmation'));
                          }
                          return;
                        }
                        // Mark it as 'pending' to retry
                        setGenerationQueue(prev => prev.map(x => x.id === t.id ? { ...x, status: 'pending' as const, error: undefined, errorCode: undefined, updatedAt: Date.now() } : x));
                      }}
                      className="px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all"
                    >
                      {t.errorCode === 'UNAUTHORIZED' ? 'Sign In' : t.errorCode === 'AGE_REQUIRED' ? 'Verify 18+' : 'Retry'}
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Custom Topic Genesis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={cn(
                  "group bg-card-bg border border-dashed border-accent/40 rounded-card p-6 text-left space-y-4 transition-all relative overflow-hidden backdrop-blur-sm",
                  isShowingCustomInput ? "ring-2 ring-accent shadow-2xl scale-[1.02]" : "hover:border-accent cursor-pointer"
                )}
                onClick={() => !isShowingCustomInput && setIsShowingCustomInput(true)}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    <Sparkles size={24} className={cn(isShowingCustomInput && "animate-pulse")} />
                  </div>
                </div>

                {!isShowingCustomInput ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Custom Genesis</div>
                    <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors">
                      Specify Your Topic
                    </h3>
                    <p className="text-xs text-text-muted mt-2">Generate a module based on your own interests or needs.</p>
                  </div>
                ) : (
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-accent">What should we read about?</label>
                       <input 
                        autoFocus
                        type="text"
                        value={customTopicInput}
                        onChange={(e) => setCustomTopicInput(e.target.value)}
                        placeholder="e.g. Modern Architecture in Berlin"
                        className="w-full bg-card-soft border border-app-border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-accent/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customTopicInput.trim()) {
                            handleGenerateModule(999, customTopicInput);
                          }
                        }}
                       />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleGenerateModule(999, customTopicInput)}
                        disabled={!customTopicInput || isGenerating === 999}
                        className="flex-1 bg-accent text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isGenerating === 999 ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Energize'}
                      </button>
                      <button 
                        onClick={() => setIsShowingCustomInput(false)}
                        className="px-4 py-2 bg-card-soft text-text-muted rounded-xl hover:text-text-main transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-app-border/50">
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest italic">AI Powered Genesis</span>
                </div>
              </motion.div>
            </div>
          </div>
        ) : !practiceMode ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-12 py-12"
          >
            <div className="text-center space-y-6">
              <div className="w-24 h-24 bg-accent/10 rounded-[32px] flex items-center justify-center mx-auto border border-accent/20 mb-6 group-hover:rotate-6 transition-transform">
                <Sparkles size={48} className="text-accent" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black text-text-main tracking-tighter">
                  {selectedModule.theme.split(':')[0]}
                </h3>
                <p className="text-text-muted lowercase font-medium tracking-tight">
                  Module {selectedModule.moduleNumber} • {selectedModule.level}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => handleStartModule('casual')}
                className="group relative p-8 rounded-3xl border border-app-border bg-card-soft hover:bg-card-bg transition-all text-left space-y-4 hover:border-orange-500/30"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <Play size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-text-main">Casual Mode</h4>
                  <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                    No timers, manual controls, and read at your own pace with zero pressure.
                  </p>
                </div>
              </button>

              <button 
                onClick={() => handleStartModule('professional')}
                className="group relative p-8 rounded-3xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 transition-all text-left space-y-4 hover:border-orange-500/40"
              >
                <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                  <Trophy size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-text-main">Professional Mode</h4>
                  <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                    Exam timers, 15m for multiple choice & 5m for true/false, strict pacing, and single attempt per exercise.
                  </p>
                </div>
              </button>
            </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { 
                    setIsReviewMode(true); 
                    setIsSubmitted(true);
                    setPracticeMode('casual'); 
                    setCurrentExerciseIndex(0); 
                    setCurrentQuestionIndex(0); 
                  }}
                  className="flex-1 py-4 bg-accent/5 text-accent font-black uppercase tracking-[0.2em] text-xs border border-accent/20 rounded-2xl hover:bg-accent/10 transition-all"
                >
                  Review Past Attempt
                </button>
              </div>

            <button 
              onClick={() => setSelectedModule(null)}
              className="w-full text-center text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:text-accent transition-colors"
            >
              Back to Pathways
            </button>
          </motion.div>
        ) : isGameOver && !isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-card-soft border border-red-500/20 p-12 rounded-[40px] shadow-2xl text-center space-y-8"
          >
            <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <div className="space-y-4">
              <h3 className="text-4xl font-black text-text-main tracking-tighter">Exercise Terminated</h3>
              <p className="text-text-muted max-w-md mx-auto leading-relaxed">
                The session timer has expired. Your current progress has been recorded.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              className="px-12 py-5 bg-accent text-white rounded-3xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-accent/20 hover:scale-105"
            >
              Check Performance
            </button>
          </motion.div>
        ) : isSubmitted && !isReviewMode ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl mx-auto py-12"
          >
            <div className="bg-card-bg border border-app-border rounded-[48px] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
              <div className={cn(
                "w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-4",
                selectedModule.score === 100 ? "bg-green-500/10 text-green-500" : "bg-accent/10 text-accent"
              )}>
                {selectedModule.score === 100 ? <Trophy size={48} /> : <ClipboardCheck size={48} />}
              </div>
              
              <div className="space-y-2">
                <h2 className="text-5xl font-black tracking-tighter">
                  {selectedModule.score === 100 ? "Native Reflexes!" : "Solid Encounter"}
                </h2>
                <p className="text-text-muted font-medium text-lg">You achieved a precision of {selectedModule.score}%</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button 
                  onClick={() => {
                    setIsReviewMode(true);
                    setCurrentExerciseIndex(0);
                    setCurrentQuestionIndex(0);
                  }}
                  className="px-10 py-5 bg-card-soft border border-app-border rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-card-bg transition-all"
                >
                  Review Performance
                </button>
                <button 
                  onClick={() => setSelectedModule(null)}
                  className="px-10 py-5 bg-accent text-white rounded-3xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20"
                >
                  Return to Pathways
                </button>
              </div>

              {selectedModule.score === 100 && (
                <div className="absolute inset-0 pointer-events-none border-[12px] border-green-500/5 rounded-[48px]" />
              )}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            {/* Passage Side */}
            <div className="bg-card-bg border border-app-border rounded-[40px] p-10 shadow-xl space-y-8 lg:sticky lg:top-8 overflow-hidden backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-app-border pb-6">
                <div className="space-y-1">
                  <h3 className="font-black text-2xl tracking-tight text-text-main">{selectedModule.theme.split(':')[0]}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">Exercise {currentExerciseIndex + 1}</span>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{currentExercise?.type === 'mcq' ? 'MCQ Focus' : 'Analytical Alignment'}</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-accent/10 text-accent rounded-2xl text-[10px] font-black uppercase tracking-widest border border-accent/20">
                  {level} Standard
                </div>
              </div>
              <div
                ref={passageScrollRef}
                className="prose prose-lg prose-invert max-w-none text-text-subtle leading-[2.1] font-medium tracking-tight selection:bg-accent/20 lg:overflow-y-auto lg:overscroll-y-auto lg:max-h-[65vh] lg:pr-4 scrollbar-hide space-y-5"
              >
                {(currentExercise?.passage || "")
                  .split(/\n+/)
                  .map(p => p.trim())
                  .filter(Boolean)
                  .map((paragraph, pIdx) => (
                    <p key={`passage-p-${pIdx}`} className="m-0">
                      <WordLink 
                        text={paragraph} 
                        hints={currentExercise?.vocabularyHints || {}} 
                        handleWordClick={handleWordClick}
                      />
                    </p>
                  ))}
              </div>
            </div>

            {/* Questions Side */}
            <div className="space-y-8">
              <motion.div
                key={`${currentExerciseIndex}-${currentQuestionIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card-bg border border-app-border rounded-[40px] p-10 shadow-2xl space-y-10"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Query {currentQuestionIndex + 1} of 5</span>
                    {isReviewMode && (
                      <div className={cn(
                        "px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        userAnswers[currentQuestion!.id] === currentQuestion!.correctAnswerIndex ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {userAnswers[currentQuestion!.id] === currentQuestion!.correctAnswerIndex ? 'Correct' : 'Incorrect'}
                      </div>
                    )}
                  </div>
                  <h4 className="text-2xl font-bold leading-tight tracking-tight text-text-main">
                    <WordLink 
                      text={currentQuestion!.question} 
                      hints={{
                        ...(currentExercise?.vocabularyHints || {}),
                        ...currentQuestion!.vocabularyHints
                      }} 
                      handleWordClick={handleWordClick}
                    />
                  </h4>
                </div>

                <div className="space-y-4">
                  {currentQuestion?.options?.map((option, i) => {
                    const isSelected = userAnswers[currentQuestion.id] === i;
                    const isCorrect = currentQuestion.correctAnswerIndex === i;
                    
                    return (
                      <button 
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={isSubmitted || isReviewMode}
                        className={cn(
                          "w-full p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group relative overflow-hidden",
                          isSelected && !isReviewMode && "bg-accent border-accent text-white shadow-xl shadow-accent/20",
                          isReviewMode && isCorrect && "bg-green-500/10 border-green-500 text-green-500",
                          isReviewMode && isSelected && !isCorrect && "bg-red-500/10 border-red-500 text-red-500",
                          !isSelected && !(isReviewMode && isCorrect) && "bg-card-soft border-app-border hover:border-accent/30 text-text-main"
                        )}
                      >
                        <span className="font-bold text-lg relative z-10">
                          <WordLink 
                            text={option} 
                            hints={{
                              ...(currentExercise?.vocabularyHints || {}),
                              ...currentQuestion!.vocabularyHints
                            }} 
                            handleWordClick={handleWordClick}
                          />
                        </span>
                        {isReviewMode ? (
                          isCorrect ? <Check size={20} className="text-green-500" /> 
                          : isSelected ? <X size={20} className="text-red-500" />
                          : null
                        ) : (
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            isSelected ? "bg-white border-white" : "border-app-border group-hover:border-accent/50"
                          )}>
                            {isSelected && <div className="w-2 h-2 bg-accent rounded-full" />}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {(isSubmitted || isReviewMode) && currentQuestion?.explanation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-6 bg-accent/5 rounded-3xl border border-accent/10 space-y-2"
                  >
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent">
                      <Info size={14} /> Critical Analysis
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed italic">{currentQuestion.explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-between items-center gap-4 pt-8 border-t border-app-border/50">
                  <div className="flex gap-2">
                    <button 
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0 && currentExerciseIndex === 0 || (practiceMode === 'professional' && currentExerciseIndex === 1 && !isReviewMode)}
                      className="p-5 bg-card-soft rounded-2xl border border-app-border hover:bg-card-bg disabled:opacity-20 transition-all text-text-muted hover:text-accent"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      onClick={handleNext}
                      disabled={currentQuestionIndex === 4 && currentExerciseIndex === 1 && isReviewMode}
                      className="p-5 bg-card-soft rounded-2xl border border-app-border hover:bg-card-bg disabled:opacity-20 transition-all text-text-muted hover:text-accent"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={handleNext}
                    className="flex-1 py-5 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-accent/20"
                  >
                    {currentQuestionIndex === 4 && currentExerciseIndex === 1 
                      ? isReviewMode ? 'Exit Review' : 'Finalize Module' 
                      : 'Advance Query'}
                  </button>
                </div>
              </motion.div>

              {!isReviewMode && (
                <div className="bg-accent/5 border border-accent/10 rounded-3xl p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent/10 rounded-2xl text-accent">
                      <Info size={24} />
                    </div>
                    <div className="space-y-1">
                      <h5 className="font-bold">Live Intelligence</h5>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Underlined structures contain deep contextual translations. Interact with them to synchronize your personal vocabulary library.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: "-90%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-100%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-90%", x: "-50%" }}
            style={{ 
              position: 'fixed',
              left: activeTooltip.x,
              top: activeTooltip.y,
              zIndex: 1000
            }}
            className="bg-card-bg border-2 border-accent px-5 py-3 rounded-2xl shadow-2xl pointer-events-none min-w-[150px] max-w-[260px] text-center backdrop-blur-xl"
          >
            {activeTooltip.lemma ? (
              <div className="mb-1">
                <div className="text-[12px] font-black uppercase tracking-wider text-accent flex items-center justify-center gap-1.5">
                  <span>{activeTooltip.lemma}</span>
                  {activeTooltip.pos && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent/90 lowercase font-medium">
                      {activeTooltip.pos}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-text-muted italic">
                  from "{activeTooltip.word}"
                </div>
              </div>
            ) : (
              <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-1 flex items-center justify-center gap-1.5">
                <span>{activeTooltip.word}</span>
                {activeTooltip.pos && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent/90 lowercase font-medium">
                    {activeTooltip.pos}
                  </span>
                )}
              </div>
            )}
            <div className="text-base font-bold text-text-main line-clamp-3 leading-tight flex items-center justify-center gap-2">
              {activeTooltip.isLoading && <Loader2 size={16} className="animate-spin text-accent" />}
              {activeTooltip.translation}
            </div>
            <div 
              style={{ left: `calc(50% + ${activeTooltip.arrowOffset}px)` }}
              className="absolute bottom-[-8px] -translate-x-1/2 w-4 h-4 bg-card-bg border-r-2 border-b-2 border-accent rotate-45 transition-all duration-300" 
            />
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

      {/* Screen-Lock / Inactive Pause Modal */}
      <AnimatePresence>
        {isScreenPaused && !showExitConfirm && isTimedSessionActive && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm transform-gpu will-change-[opacity]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-card-bg border border-app-border rounded-[32px] p-8 md:p-10 shadow-2xl text-center space-y-6 overflow-hidden z-10 transform-gpu will-change-transform"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
                <Pause size={32} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold tracking-tight text-text-main text-center">
                  Challenge Paused
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Your timer is paused at{' '}
                  <span className="font-mono font-bold text-text-main">
                    {Math.floor((timeLeft ?? 0) / 60)}:{((timeLeft ?? 0) % 60).toString().padStart(2, '0')}
                  </span>.
                </p>
                <p className="text-xs text-text-subtle">
                  Tap Continue when you are ready to resume from where you left off.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsScreenPaused(false)}
                  className="flex-1 py-3.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(true)}
                  className="flex-1 py-3.5 bg-card-soft text-text-muted border border-app-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                >
                  Exit Module
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              onClick={() => {
                setShowExitConfirm(false);
                setIsScreenPaused(false);
              }}
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

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[11px] font-bold">
                  <Pause size={12} />
                  <span>
                    Timer paused at {Math.floor((timeLeft ?? 0) / 60)}:{((timeLeft ?? 0) % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                
                <p className="text-sm text-text-muted leading-relaxed">
                  Hey{' '}
                  <span className="font-bold text-accent">
                    {UserService.getProfile()?.name || 'Explorer'}
                  </span>
                  , this hesitation is the price you pay today for tomorrow's SUCCESS.
                </p>
                
                <p className="text-xs text-text-subtle">
                  Are you absolutely sure you want to stop? Your timed progress and current answers for this module will be abandoned.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    setIsScreenPaused(false);
                  }}
                  className="flex-1 py-3.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Stay and Conquer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    setIsScreenPaused(false);
                    setPracticeMode(null);
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
