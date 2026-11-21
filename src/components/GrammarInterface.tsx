import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import { 
  ChevronLeft, Sparkles, CheckCircle2, Info, 
  ChevronRight, Trophy, AlertCircle, Loader2, Send, 
  MessageCircle, Check, X, RotateCcw, Play, Pause, Lock, Trash2, RefreshCw,
  Minimize2, Minus, Activity
} from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { ThemeService } from '../services/ThemeService';
import { GrammarTopic, GrammarExercise, LanguageLevel, GrammarModule, VocabularyWord } from '../types';
import { GrammarService, GrammarDoubtContext } from '../services/GrammarService';
import { FluencyService } from '../services/FluencyService';
import { UserService } from '../services/UserService';
import { platformService } from '../services/PlatformService';
import { getLanguageContent } from '../data';
import { cn } from '../lib/utils';

const TOTAL_MODULES = 16;

const getUserAnswerSummary = (
  exercise: GrammarExercise | undefined,
  userAnswers: string[],
  selectedIndex: number | null,
  matches: Record<string, string>,
  shuffledRights: { id: string; text: string }[]
): string => {
  if (!exercise) return '';
  if (exercise.type === 'fill-in-the-blank') {
    if (!userAnswers || userAnswers.length === 0 || userAnswers.every(a => !a)) return '';
    return userAnswers.map((ans, idx) => `Blank ${idx + 1}: "${ans || '(empty)'}"`).join(', ');
  }
  if (exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') {
    if (userAnswers && userAnswers.length > 0 && userAnswers[0]) return userAnswers[0];
    if (selectedIndex !== null && exercise.content?.options?.[selectedIndex]) return exercise.content.options[selectedIndex];
    return '';
  }
  if (exercise.type === 'word-order') {
    return userAnswers?.filter(Boolean).join(' ') || '';
  }
  if (exercise.type === 'mix-and-match') {
    const pairs = exercise.content?.pairs || [];
    const matchedEntries = Object.entries(matches);
    if (matchedEntries.length === 0) return '';
    return matchedEntries.map(([lId, rId]) => {
      const left = pairs.find(p => p.id === lId)?.left;
      const right = shuffledRights.find(r => r.id === rId)?.text;
      return `"${left}" -> "${right || '(unmatched)'}"`;
    }).join(', ');
  }
  return userAnswers?.filter(Boolean).join(', ') || '';
};

interface GrammarInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
  user?: any;
  onRequireLogin?: () => void;
}

export function GrammarInterface({ level, language, onClose, onProgressUpdate, onNewWord, user, onRequireLogin }: GrammarInterfaceProps) {
  const [theme, setThemeState] = useState(ThemeService.getTheme());
  const isLight = theme === 'light';

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      setThemeState(e.detail.theme);
    };
    window.addEventListener('themeChange' as any, handleThemeChange);
    return () => window.removeEventListener('themeChange' as any, handleThemeChange);
  }, []);

  const languageContent = getLanguageContent(language);
  const grammarTopics = languageContent.grammarTopics;

  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_grammar_selected_topic_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_selected_topic_${language}_${level}`);
      if (saved) {
        const topicId = saved;
        return grammarTopics.find(t => t.id === topicId) || null;
      }
    } catch (e) {
      console.error("[Grammar] Error parsing selected topic:", e);
    }
    return null;
  });
  const [modules, setModules] = useState<GrammarModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<GrammarModule | null>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_grammar_selected_module_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_selected_module_${language}_${level}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("[Grammar] Error parsing selected module:", e);
      return null;
    }
  });
  const [practiceMode, setPracticeMode] = useState<'casual' | 'professional' | null>(() => {
    const saved = localStorage.getItem(`langeasy_grammar_mode_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_mode_${language}_${level}`);
    return (saved as any) || null;
  });
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isScreenPaused, setIsScreenPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_grammar_time_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_time_${language}_${level}`);
    const parsed = saved ? parseInt(saved, 10) : null;
    return (parsed !== null && !isNaN(parsed)) ? parsed : null;
  });
  const [totalTimeLeft, setTotalTimeLeft] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_grammar_total_time_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_total_time_${language}_${level}`);
    const parsed = saved ? parseInt(saved, 10) : null;
    return (parsed !== null && !isNaN(parsed)) ? parsed : null;
  });
  const [isGameOver, setIsGameOver] = useState(() => {
    return (localStorage.getItem(`langeasy_grammar_gameover_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_gameover_${language}_${level}`)) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(`langeasy_grammar_mode_${language}_${level}`, practiceMode || '');
  }, [practiceMode, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_grammar_time_${language}_${level}`, timeLeft?.toString() || '');
  }, [timeLeft, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_grammar_total_time_${language}_${level}`, totalTimeLeft?.toString() || '');
  }, [totalTimeLeft, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_grammar_gameover_${language}_${level}`, isGameOver.toString());
  }, [isGameOver, language, level]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(() => {
    const saved = localStorage.getItem(`langeasy_grammar_exercise_index_${language}_${level}`) || localStorage.getItem(`deutschbuddy_grammar_exercise_index_${language}_${level}`);
    const parsed = saved ? parseInt(saved, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeGenerations, setActiveGenerations] = useState<number[]>([]);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ word: string; translation: string; x: number; y: number } | null>(null);
  const lastClickRef = useRef<{ word: string; time: number } | null>(null);

  useEffect(() => {
    if (genError) {
      const timer = setTimeout(() => setGenError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [genError]);
  
  // Exercise State
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedBlankIndex, setSelectedBlankIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [usedBankIndices, setUsedBankIndices] = useState<number[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({}); // leftId -> rightId
  
  const checkAnswer = (userAns: string, correctAns: string) => {
    if (!userAns || !correctAns) return false;
    if (language === 'de') {
      return userAns.trim().toLowerCase() === correctAns.trim().toLowerCase();
    }
    return userAns.trim() === correctAns.trim();
  };

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatExpanded) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isChatExpanded, chatMessages]);

  const generatingRef = useRef<Set<number>>(new Set());

  const [showCelebration, setShowCelebration] = useState(false);

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

  // Persistence
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    // One-time clear of old modules to apply new 16-module logic
    const hasCleared = localStorage.getItem('grammar_modules_cleared_v2');
    if (!hasCleared) {
      GrammarService.clearModules(language);
      localStorage.setItem('grammar_modules_cleared_v2', 'true');
    }
  }, [language]);

  useEffect(() => {
    const saved = localStorage.getItem('langeasy_completed_grammar_topics') || localStorage.getItem('completedGrammarTopics');
    if (saved) setCompletedTopics(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    if (selectedTopic) {
      localStorage.setItem(`langeasy_grammar_selected_topic_${language}`, selectedTopic.id);
    } else {
      localStorage.removeItem(`langeasy_grammar_selected_topic_${language}`);
    }
  }, [selectedTopic, language]);

  useEffect(() => {
    if (selectedModule) {
      localStorage.setItem(`langeasy_grammar_selected_module_${language}`, JSON.stringify(selectedModule));
    } else {
      localStorage.removeItem(`langeasy_grammar_selected_module_${language}`);
    }
  }, [selectedModule, language]);

  useEffect(() => {
    localStorage.setItem(`langeasy_grammar_exercise_index_${language}`, currentExerciseIndex.toString());
  }, [currentExerciseIndex, language]);

  useEffect(() => {
    if (genError) {
      const timer = setTimeout(() => {
        setGenError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [genError]);

  useEffect(() => {
    let isMounted = true;

    const syncState = async () => {
      if (!selectedTopic) return;
      const m = await GrammarService.ensureInitialModules(level, selectedTopic.id, language);
      if (isMounted) {
        setModules(m);
        setActiveGenerations(GrammarService.getActiveGenerations(level, selectedTopic.id, language));
        setIsInitialLoading(false);
        setIsLoading(false);
      }
    };

    if (selectedTopic) {
      syncState();
      const unsubscribe = GrammarService.subscribe(() => {
        syncState();
      });
      return () => {
        isMounted = false;
        unsubscribe();
      };
    } else {
      setIsInitialLoading(true);
    }
  }, [level, selectedTopic, language]);

  useEffect(() => {
    if (!selectedModule || !selectedModule.exercises[currentExerciseIndex]) return;
    
    const exercise = selectedModule.exercises[currentExerciseIndex];
    
    // Only update if there's an actual change to avoid infinite loops
    if (JSON.stringify(exercise.userAnswers) !== JSON.stringify(userAnswers) ||
        exercise.isSubmitted !== isSubmitted ||
        exercise.score !== score ||
        JSON.stringify(exercise.usedBankIndices) !== JSON.stringify(usedBankIndices) ||
        JSON.stringify(exercise.matches) !== JSON.stringify(matches) ||
        JSON.stringify(exercise.chatMessages) !== JSON.stringify(chatMessages)) {
      
      const updatedExercises = [...selectedModule.exercises];
      updatedExercises[currentExerciseIndex] = {
        ...exercise,
        userAnswers,
        isSubmitted,
        score,
        usedBankIndices,
        matches,
        chatMessages
      };
      setSelectedModule({ ...selectedModule, exercises: updatedExercises });
    }
  }, [userAnswers, isSubmitted, score, usedBankIndices, matches, chatMessages, currentExerciseIndex, selectedModule]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);

  const handleGenerateModule = async (index: number) => {
    if (!selectedTopic) return;
    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (generatingRef.current.has(index)) return;
    
    const check = GrammarService.canGenerateMore(level, selectedTopic.id, language);
    if (!check.can) {
      setGenError(check.reason || 'Limit reached');
      return;
    }

    generatingRef.current.add(index);
    setActiveGenerations(prev => [...prev, index]);

    try {
      await GrammarService.generateSingleModule(level, selectedTopic.id, selectedTopic.name, language, index);
    } catch (err: any) {
      const msg = err?.message || 'Failed to generate module';
      const cleanMsg = msg.includes('Unexpected token') || msg.includes('<!doctype') || msg.includes('is not valid JSON')
        ? 'AI service is temporarily busy. Please wait a moment and tap again.'
        : msg;
      setGenError(cleanMsg);
    } finally {
      generatingRef.current.delete(index);
      setActiveGenerations(prev => prev.filter(i => i !== index));
    }
  };

  const handleDeleteModule = (moduleId: string) => {
    GrammarService.deleteModule(language, moduleId);
    // Update local state immediately for better responsiveness
    setModules(prev => prev.filter(m => m.id !== moduleId));
    setConfirmingDeleteId(null);
  };

  const isTimedSessionActive = Boolean(
    selectedModule &&
    !selectedModule.isCompleted &&
    practiceMode === 'professional' &&
    !isSubmitted &&
    !isGameOver
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
      if (timeLeft === null) setTimeLeft(30);
      if (totalTimeLeft === null) setTotalTimeLeft(150);

      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          if (prev === 0) {
            handleAutoSubmit();
            return 0;
          }
          return prev;
        });
      }, 1000);

      totalTimerRef.current = setInterval(() => {
        setTotalTimeLeft(prev => {
          if (prev !== null && prev > 0) return prev - 1;
          if (prev === 0) {
            handleTotalTimeExpiring();
            return 0;
          }
          return prev;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (totalTimerRef.current) clearInterval(totalTimerRef.current);
      };
    }
  }, [isTimedSessionActive, isTimerPaused, currentExerciseIndex]);

  const handleAutoSubmit = () => {
    if (!isSubmitted) {
      handleSubmit();
    }
  };

  const handleTotalTimeExpiring = () => {
    setIsGameOver(true);
    setIsSubmitted(true);
    if (!score) setScore(0);
  };

  const handleStartModule = (mode: 'casual' | 'professional') => {
    setPracticeMode(mode);
    setIsGameOver(false);
    setShowExitConfirm(false);
    setIsScreenPaused(false);
    if (mode === 'professional') {
      setTimeLeft(30);
      setTotalTimeLeft(150);
    }
  };

  const handleSelectModule = (module: GrammarModule) => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    setSelectedModule(module);
    setPracticeMode(null); // Show mode selector first
    setShowExitConfirm(false);
    setIsScreenPaused(false);
    setCurrentExerciseIndex(0);
    if (module.exercises && module.exercises.length > 0) {
      prepareExercise(module.exercises[0]);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      const prevIndex = currentExerciseIndex - 1;
      setCurrentExerciseIndex(prevIndex);
      prepareExercise(selectedModule!.exercises[prevIndex]);
    }
  };

  const prepareExercise = (exercise: GrammarExercise) => {
    if (!exercise) return;
    
    // Load existing state if available
    setUserAnswers(exercise.userAnswers || []);
    setUsedBankIndices(exercise.usedBankIndices || []);
    setIsSubmitted(exercise.isSubmitted || false);
    setScore(exercise.score || null);
    setShowExplanation(exercise.isSubmitted || false);
    setMatches(exercise.matches || {});
    setChatMessages(exercise.chatMessages || []);
    
    // Specific initialization if no saved state
    if (!exercise.userAnswers) {
      if (exercise.type === 'fill-in-the-blank' && exercise.content?.correctAnswers) {
        setUserAnswers(new Array(exercise.content.correctAnswers.length).fill(''));
        setUsedBankIndices(new Array(exercise.content.correctAnswers.length).fill(-1));
      } else if (exercise.type === 'word-order' && exercise.content?.shuffledWords) {
        setUserAnswers([]);
        setUsedBankIndices([]);
      } else if ((exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') && exercise.content?.options) {
        setUserAnswers([]);
      }
    }

    if (exercise.type === 'mix-and-match' && exercise.content?.pairs) {
      const rights = exercise.content.pairs.map(p => ({ id: p.id, text: p.right }));
      setShuffledRights([...rights].sort(() => Math.random() - 0.5));
    }
    
    // Reset temporary UI state
    setSelectedIndex(null);
    setSelectedBlankIndex(null);
    setActiveTooltip(null);
    setSelectedLeftId(null);
  };

  const resetExerciseState = () => {
    setUserAnswers([]);
    setUsedBankIndices([]);
    setSelectedIndex(null);
    setSelectedBlankIndex(null);
    setIsSubmitted(false);
    setScore(null);
    setShowExplanation(false);
    setChatMessages([]);
    setActiveTooltip(null);
    setSelectedLeftId(null);
    setMatches({});
  };

  useEffect(() => {
    if (!activeTooltip) return;

    const handleGlobalClick = () => {
      setActiveTooltip(null);
    };

    const autoCloseTimer = setTimeout(() => {
      setActiveTooltip(null);
    }, 3000);

    // Small delay to ensure the click that opens it doesn't immediately close it
    const attachTimer = setTimeout(() => {
      window.addEventListener('click', handleGlobalClick);
    }, 50);

    return () => {
      clearTimeout(autoCloseTimer);
      clearTimeout(attachTimer);
      window.removeEventListener('click', handleGlobalClick);
    };
  }, [activeTooltip]);

  const handleWordClick = (word: string, e: React.MouseEvent, translation: string, onSecondClick?: () => void) => {
    e.stopPropagation();
    const now = Date.now();
    
    // Shorter window for "immediate" second click (800ms)
    if (lastClickRef.current && lastClickRef.current.word === word && now - lastClickRef.current.time < 800) {
      setActiveTooltip(null);
      if (onSecondClick) {
        onSecondClick();
        lastClickRef.current = null;
        return;
      }
    }
    
    lastClickRef.current = { word, time: now };
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Position tooltip significantly above the word to avoid obstruction
    setActiveTooltip({
      word,
      translation,
      x: rect.left + rect.width / 2,
      y: rect.top - 35 // Further increased clearance
    });

    // Add to vocabulary automatically when clicked for translation (English first, Target Language second)
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      word: translation,
      translation: word,
      learnedAt: Date.now()
    });
  };

  const renderTextWithHints = (text: string, hints?: Record<string, string>, onSecondClick?: () => void) => {
    if (!hints) return text;
    
    // Sort keys by length descending to avoid partial matches
    const sortedKeys = Object.keys(hints).sort((a, b) => b.length - a.length);
    if (sortedKeys.length === 0) return text;

    const regex = new RegExp(`(${sortedKeys.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => {
      const hintKey = sortedKeys.find(k => k.toLowerCase() === part.toLowerCase());
      if (hintKey) {
        return (
          <span 
            key={i}
            className="border-b-2 border-dotted border-orange-500/50 cursor-pointer hover:text-orange-500 transition-colors"
            onClick={(e) => handleWordClick(part, e, hints[hintKey], onSecondClick)}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const handleDrop = (word: string, blankIndex: number, bankIndex: number) => {
    if (isSubmitted) {
      setIsSubmitted(false);
      setScore(null);
      setShowExplanation(false);
    }
    const newAnswers = [...userAnswers];
    newAnswers[blankIndex] = word;
    setUserAnswers(newAnswers);
    
    const newUsed = [...usedBankIndices];
    newUsed[blankIndex] = bankIndex;
    setUsedBankIndices(newUsed);
    
    // Auto-select next blank
    const nextEmpty = newAnswers.findIndex((a, idx) => !a && idx > blankIndex);
    if (nextEmpty !== -1) {
      setSelectedBlankIndex(nextEmpty);
    } else {
      setSelectedBlankIndex(null);
    }
  };

  const handleRemoveAnswer = (index: number) => {
    if (isSubmitted) {
      setIsSubmitted(false);
      setScore(null);
      setShowExplanation(false);
    }
    const newAnswers = [...userAnswers];
    newAnswers[index] = '';
    setUserAnswers(newAnswers);
    
    const newUsed = [...usedBankIndices];
    newUsed[index] = -1;
    setUsedBankIndices(newUsed);
  };

  const handleSubmit = () => {
    if (!selectedModule) return;
    const exercise = selectedModule.exercises?.[currentExerciseIndex];
    if (!exercise) return;
    
    let correctCount = 0;
    let totalItems = 1;

    if (exercise.type === 'fill-in-the-blank') {
      const correctAnswers = exercise.content?.correctAnswers || [];
      correctAnswers.forEach((ans, i) => {
        if (checkAnswer(userAnswers[i], ans)) correctCount++;
      });
      totalItems = correctAnswers.length || 1;
    } else if (exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') {
      const options = exercise.content?.options || [];
      const correctIdx = exercise.content?.correctAnswerIndex ?? 0;
      if (checkAnswer(userAnswers[0], options[correctIdx])) {
        correctCount = 1;
      }
      totalItems = 1;
    } else if (exercise.type === 'word-order') {
      let correctAnswers = exercise.content?.correctAnswers || [];
      if (typeof correctAnswers === 'string') {
        correctAnswers = (correctAnswers as string).split(/\s+/).filter(Boolean);
      }
      correctAnswers.forEach((ans, i) => {
        if (checkAnswer(userAnswers[i], ans)) correctCount++;
      });
      totalItems = correctAnswers.length || 1;
    } else if (exercise.type === 'mix-and-match') {
      const pairs = exercise.content?.pairs || [];
      const pairResults = pairs.map(pair => {
        const matchedRightId = matches[pair.id];
        const matchedRight = shuffledRights.find(r => r.id === matchedRightId);
        return checkAnswer(matchedRight?.text || '', pair.right);
      });
      correctCount = pairResults.filter(Boolean).length;
      totalItems = pairs.length || 1;
    }
    
    const normalizedScore = correctCount / totalItems;
    setScore(normalizedScore);
    setIsSubmitted(true);
    setShowExplanation(true);
    onProgressUpdate(normalizedScore * 100);
  };

  const canSubmit = () => {
    if (!selectedModule) return false;
    const exercise = selectedModule.exercises?.[currentExerciseIndex];
    if (!exercise) return false;
    if (exercise.type === 'fill-in-the-blank') {
      const correctAnswers = exercise.content?.correctAnswers || [];
      if (correctAnswers.length === 0) return false;
      return userAnswers.length === correctAnswers.length && userAnswers.every(a => a !== '');
    }
    if (exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') {
      return userAnswers.length > 0 && userAnswers[0] !== '';
    }
    if (exercise.type === 'word-order') {
      let correctAnswers = exercise.content?.correctAnswers || [];
      if (typeof correctAnswers === 'string') {
        correctAnswers = (correctAnswers as string).split(/\s+/).filter(Boolean);
      }
      if (correctAnswers.length === 0) return false;
      return userAnswers.length === correctAnswers.length;
    }
    if (exercise.type === 'mix-and-match') {
      const pairs = exercise.content?.pairs || [];
      return Object.keys(matches).length === pairs.length;
    }
    return false;
  };

  const handleFinishExercise = () => {
    if (!selectedModule) return;
    const exercise = selectedModule.exercises?.[currentExerciseIndex];
    if (exercise) {
      exercise.isCompleted = true;
      exercise.score = score;
    }

    if (currentExerciseIndex < (selectedModule.exercises?.length || 0) - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      prepareExercise(selectedModule.exercises?.[nextIndex]);
      if (practiceMode === 'professional') {
        setTimeLeft(30);
      }
    } else {
      // Module completed
      selectedModule.isCompleted = true;
      
      const moduleCorrectCount = selectedModule.exercises?.filter(ex => ex.score === 1).length || 0;
      if (moduleCorrectCount === (selectedModule.exercises?.length || 0)) {
        triggerCelebration();
      }

      const updatedModules = modules.map(m => m.id === selectedModule.id ? { ...m, isCompleted: true } : m);
      setModules(updatedModules);
      GrammarService.saveModules(updatedModules, language);
      
      // Check if all modules for topic are done
      const allDone = updatedModules.every(m => m.isCompleted && m.topicId === selectedTopic.id);
      if (allDone) {
        setCompletedTopics(prev => {
          const next = new Set(prev);
          next.add(selectedTopic.id);
          localStorage.setItem('langeasy_completed_grammar_topics', JSON.stringify(Array.from(next)));
          return next;
        });
      }

      // Update Fluency Mirror
      FluencyService.updateFluency(
        language,
        level,
        'grammar',
        { 
          topicId: selectedTopic.id, 
          topicName: selectedTopic.name,
          moduleId: selectedModule.id,
          moduleTitle: selectedModule.title
        }
      );
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const msgToSend = (typeof customMessage === 'string' ? customMessage : chatInput).trim();
    if (!msgToSend || isChatLoading || !selectedModule) return;
    
    setChatInput('');
    setChatMessages(prev => [...prev, { text: msgToSend, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const exercise = selectedModule.exercises?.[currentExerciseIndex];
      if (!exercise) {
        setIsChatLoading(false);
        return;
      }

      let questionOrSentence = '';
      let correctAnswer = '';
      const options = exercise.content?.options || [];
      const wordBank = exercise.content?.wordBank || [];

      if (exercise.type === 'fill-in-the-blank') {
        const sentence = exercise.content?.sentence || '';
        questionOrSentence = sentence;
        const correctAnswers = exercise.content?.correctAnswers || [];
        correctAnswer = correctAnswers.join(', ');
      } else if (exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') {
        questionOrSentence = exercise.content?.question || exercise.content?.sentence || 'Multiple choice question';
        const correctIdx = exercise.content?.correctAnswerIndex ?? 0;
        correctAnswer = options[correctIdx] || (exercise.content?.correctAnswers?.[0] || 'Unknown');
      } else if (exercise.type === 'word-order') {
        questionOrSentence = `Arrange words: ${exercise.content?.shuffledWords?.join(' ') || exercise.content?.sentence || ''}`;
        const cAns = exercise.content?.correctAnswers || [];
        if (Array.isArray(cAns)) correctAnswer = cAns.join(' ');
        else correctAnswer = String(cAns);
      } else if (exercise.type === 'mix-and-match') {
        const pairs = exercise.content?.pairs || [];
        questionOrSentence = `Match pairs: ${pairs.map(p => `"${p.left}"`).join(', ')}`;
        correctAnswer = pairs.map(p => `"${p.left}" -> "${p.right}"`).join(', ');
      } else {
        questionOrSentence = exercise.content?.sentence || exercise.content?.question || 'Grammar exercise';
        correctAnswer = exercise.content?.correctAnswers?.join(', ') || '';
      }

      const userAnswerStr = getUserAnswerSummary(exercise, userAnswers, selectedIndex, matches, shuffledRights);

      const doubtContext: GrammarDoubtContext = {
        exerciseIndex: currentExerciseIndex,
        totalExercises: selectedModule.exercises.length,
        topicName: selectedTopic?.name,
        moduleTitle: selectedModule.title,
        level: level,
        exerciseType: exercise.type,
        questionOrSentence,
        options: options.length > 0 ? options : undefined,
        wordBank: wordBank.length > 0 ? wordBank : undefined,
        correctAnswer,
        userAnswer: userAnswerStr || undefined,
        isSubmitted,
        score,
        explanation: exercise.explanation,
        vocabularyHints: exercise.vocabularyHints,
        recentChatHistory: chatMessages
      };
      
      // Initialize an empty AI message bubble for streaming tokens
      let currentAiStreamText = '';
      let aiMessageIdx = -1;
      setChatMessages(prev => {
        aiMessageIdx = prev.length;
        return [...prev, { text: '', sender: 'ai' }];
      });

      const response = await GrammarService.clearDoubtStream(
        msgToSend,
        doubtContext,
        language,
        (chunk) => {
          currentAiStreamText += chunk;
          setChatMessages(prev => {
            const next = [...prev];
            const target = aiMessageIdx >= 0 && aiMessageIdx < next.length ? aiMessageIdx : next.length - 1;
            if (next[target] && next[target].sender === 'ai') {
              next[target] = { ...next[target], text: currentAiStreamText };
            }
            return next;
          });
        }
      );

      // Ensure final response is cleanly committed
      setChatMessages(prev => {
        const next = [...prev];
        const target = aiMessageIdx >= 0 && aiMessageIdx < next.length ? aiMessageIdx : next.length - 1;
        if (next[target] && next[target].sender === 'ai') {
          next[target] = { ...next[target], text: response || currentAiStreamText };
        }
        return next;
      });
    } catch (error) {
      console.error('Chat failed:', error);
      setChatMessages(prev => {
        const filtered = prev.filter(m => m.text.trim().length > 0);
        return [...filtered, { 
          text: "I'm having a bit of trouble connecting right now. Could you please try sending that again?", 
          sender: 'ai' 
        }];
      });
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedModule && !selectedModule.isCompleted && practiceMode === 'professional' && !isGameOver && !isSubmitted) {
      setShowExitConfirm(true);
    } else if (selectedModule) {
      setSelectedModule(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else {
      onClose();
    }
  };

  const handleBackRef = useRef(handleBack);
  handleBackRef.current = handleBack;

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
      handleBackRef.current();
    };
    window.addEventListener('talkybean_grammar_back', onHardwareBack);
    return () => window.removeEventListener('talkybean_grammar_back', onHardwareBack);
  }, [showExitConfirm, isScreenPaused]);

  const completedCount = modules.filter(m => m.isCompleted && m.topicId === selectedTopic?.id).length;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-text-muted font-medium animate-pulse">Preparing your grammar challenge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-app-bg overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-4 md:p-6 border-b border-app-border flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card-soft backdrop-blur-xl shrink-0 relative z-20 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card-soft hover:bg-card-bg rounded-2xl transition-all border border-app-border group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold hidden xs:inline">
              {selectedModule ? 'Exit Module' : selectedTopic ? 'Topics' : 'Back'}
            </span>
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight line-clamp-1">
              {selectedModule ? selectedModule.title : selectedTopic ? selectedTopic.name : `${level} Grammar`}
            </h2>
            <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted font-black">
              {selectedModule ? 'Exercise Mode' : selectedTopic ? 'Select a Module' : 'Select a Topic'}
            </p>
          </div>
        </div>
        
        {selectedTopic && (
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-2 bg-card-soft px-3 py-1.5 md:px-4 md:py-2 rounded-2xl border border-app-border">
              <Trophy size={14} className="text-orange-500" />
              <span className="text-xs md:text-sm font-bold">{completedCount} / {TOTAL_MODULES}</span>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Warning Message */}
        <AnimatePresence>
          {genError && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            >
              <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3 border border-orange-400">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-sm font-bold">{genError}</p>
                </div>
                <button
                  onClick={() => setGenError(null)}
                  className="p-1 hover:bg-orange-600/40 rounded-full transition-colors text-white shrink-0"
                  aria-label="Dismiss message"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
            <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-xl p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3 text-red-500">
                <Info size={18} />
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="p-1 hover:bg-red-500/10 rounded-full transition-colors text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {!selectedTopic ? (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              {['Major', 'MixMatch', 'FinalIntegration'].map((cat) => {
                const topics = grammarTopics.filter(t => t.level === level && t.category === cat);
                if (topics.length === 0) return null;
                
                return (
                  <div key={cat} className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted px-2">
                      {cat === 'Major' ? 'Core Topics' : cat === 'MixMatch' ? 'Mix & Match' : 'Final Integration'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {topics.map((topic) => (
                        <button
                          key={topic.id}
                          onClick={() => setSelectedTopic(topic)}
                          className="group bg-card-soft border border-app-border p-6 rounded-3xl hover:border-accent/30 transition-all text-left flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors bg-card-bg text-text-subtle group-hover:text-accent">
                              <Sparkles size={20} />
                            </div>
                            <span className="font-bold text-lg group-hover:text-white transition-colors">{topic.name}</span>
                          </div>
                          <ChevronRight size={20} className="text-zinc-600 group-hover:text-orange-500 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !selectedModule ? (
          <>
            {/* Module List Sidebar */}
            <aside className="w-full md:w-80 border-r border-app-border flex flex-col bg-card-soft backdrop-blur-xl relative z-10 min-h-0 h-full">
              <div className="p-6 border-b border-app-border shrink-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Modules (1-16)</h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar pb-32">
                {Array.from({ length: TOTAL_MODULES }).map((_, i) => {
                  const module = modules.find(m => m.index === i);
                  const isGenerating = activeGenerations.includes(i);
                  
                  return (
                    <div
                      key={i}
                      role="button"
                      tabIndex={0}
                      onClick={() => !isGenerating && (module ? handleSelectModule(module) : handleGenerateModule(i))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          !isGenerating && (module ? handleSelectModule(module) : handleGenerateModule(i));
                        }
                      }}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between group relative overflow-hidden cursor-pointer",
                        isGenerating && "pointer-events-none opacity-50",
                        module?.isCompleted 
                          ? "bg-green-500/5 border-green-500/20 hover:bg-green-500/10" 
                          : module 
                            ? "bg-card-soft border-border-strong hover:border-accent/30" 
                            : "bg-card-soft border-app-border hover:border-border-strong opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors",
                          module?.isCompleted ? "bg-green-500/20 text-green-500" : "bg-card-bg text-text-muted group-hover:text-accent"
                        )}>
                          {i + 1}
                        </div>
                        <div>
                          <p className={cn(
                            "text-sm font-bold transition-colors",
                            module?.isCompleted ? "text-green-500" : "text-text-main group-hover:text-text-main"
                          )}>
                            {isGenerating ? 'Generating...' : module ? module.title : 'Locked Module'}
                          </p>
                          <p className="text-[10px] text-text-muted font-medium">
                            {module?.isCompleted ? 'Completed' : module ? 'Ready to Start' : 'Click to Unlock'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="relative z-10 flex items-center gap-2">
                        {isGenerating ? (
                          <Loader2 size={18} className="text-orange-500 animate-spin" />
                        ) : module ? (
                          <div className="flex items-center gap-2">
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
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all border border-red-500/20"
                                  title="Delete Module"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </AnimatePresence>
                            
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
                              {module.isCompleted ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : (
                                <Play size={18} className="group-hover:scale-110 transition-all" />
                              )}
                            </div>
                          </div>
                        ) : (
                          <Lock size={18} className="text-zinc-700 group-hover:text-orange-500 transition-colors" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            {/* Empty State for Main Content */}
            <div className="flex-1 hidden md:flex items-center justify-center p-12 bg-surface">
              <div className="text-center space-y-6 max-w-sm">
                <div className="w-20 h-20 bg-card-soft rounded-[32px] flex items-center justify-center mx-auto border border-app-border">
                  <Sparkles size={40} className="text-text-muted" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Select a Module</h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Choose a module from the list to start practicing. You can unlock up to 4 modules at a time.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-surface">
            <div className="max-w-2xl mx-auto space-y-8 pb-32 safe-layout">
            {selectedModule && (
              selectedModule.isCompleted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card-soft border border-green-500/20 p-12 rounded-[40px] shadow-2xl text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-green-500/20">
                    <Trophy size={48} className="text-green-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-white">Module Completed!</h3>
                    <p className="text-text-subtle max-w-md mx-auto leading-relaxed">
                      You've successfully finished all exercises in this module. Great job!
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl mt-4">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="text-green-500 font-bold text-sm">
                        {selectedModule.exercises?.filter(ex => ex.score === 1).length || 0} / {selectedModule.exercises?.length || 0} exercises correct
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="w-full sm:w-auto px-8 py-4 bg-card-soft hover:bg-card-bg rounded-2xl text-sm font-bold transition-all border border-app-border"
                    >
                      Back to Modules
                    </button>
                  </div>
                </motion.div>
              ) : !practiceMode ? (
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
                      onClick={() => handleStartModule('casual')}
                      className="group relative p-8 rounded-3xl border border-app-border bg-card-soft hover:bg-card-bg transition-all text-left space-y-4 hover:border-orange-500/30"
                    >
                      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Play size={24} />
                      </div>
                      <div>
                        <h4 className="text-xl font-black text-text-main">Casual Mode</h4>
                        <p className="text-xs text-text-muted font-medium mt-1 leading-relaxed">
                          No timers, manual pace, and learn at your own speed with zero time pressure.
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
                          Exam timers, 30s per question, 150s total limit, simulating test conditions.
                        </p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              ) : isGameOver ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card-soft border border-red-500/20 p-12 rounded-[40px] shadow-2xl text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-red-500/10 rounded-[32px] flex items-center justify-center mx-auto border border-red-500/20">
                    <AlertCircle size={48} className="text-red-500" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-3xl font-bold text-text-main">Time's Up!</h3>
                    <p className="text-text-subtle max-w-md mx-auto leading-relaxed">
                      The total time limit for this professional module has expired.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
                    >
                      Back to Modules
                    </button>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedModule.exercises?.[currentExerciseIndex]?.id || 'no-exercise'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6 md:space-y-8"
                  >
                  {/* Exercise Content */}
                  <div className="bg-card-soft border border-app-border p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-2xl relative overflow-hidden">
                    {/* Navigation Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                            Exercise { (selectedModule.exercises?.length || 0) > 0 ? currentExerciseIndex + 1 : 0} of {selectedModule.exercises?.length || 0}
                          </span>
                        </div>
                        {selectedModule.scenario && (
                          <div className="flex items-center gap-2 mt-2 max-w-full overflow-hidden">
                            <Sparkles size={12} className="text-orange-500 shrink-0" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest line-clamp-1 truncate">
                              Scenario: {selectedModule.scenario.length > 50 ? selectedModule.scenario.slice(0, 50).trim() + '...' : selectedModule.scenario}
                            </span>
                          </div>
                        )}
                      </div>

                      {practiceMode === 'professional' && !isSubmitted && (
                        <div className={cn(
                          "flex items-center gap-4 px-4 py-2 border rounded-2xl shadow-inner transition-colors",
                          isTimerPaused ? "bg-amber-500/10 border-amber-500/40" : "bg-card-soft border-app-border"
                        )}>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              isTimerPaused ? "bg-amber-500" : timeLeft && timeLeft <= 5 ? "bg-red-500 animate-pulse" : "bg-orange-500 animate-pulse"
                            )} />
                            <span className={cn(
                              "text-sm font-black font-mono flex items-center gap-1.5",
                              isTimerPaused ? "text-amber-500" : timeLeft && timeLeft <= 5 ? "text-red-500" : "text-text-main"
                            )}>
                              {timeLeft}s
                            </span>
                          </div>
                          <div className="w-px h-4 bg-app-border" />
                          <div className="flex items-center gap-2">
                            <Activity size={14} className="text-text-muted" />
                            <span className="text-[10px] font-black uppercase text-text-muted">Total: {totalTimeLeft}s</span>
                          </div>
                          {isTimerPaused && (
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-500">Paused</span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        {selectedModule.exercises?.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              if (idx === currentExerciseIndex) return;
                              setCurrentExerciseIndex(idx);
                              prepareExercise(selectedModule.exercises?.[idx]!);
                            }}
                            className={cn(
                              "w-2 h-2 rounded-full transition-all",
                              idx === currentExerciseIndex ? "bg-orange-500 w-6" : "bg-card-soft hover:bg-card-bg"
                            )}
                          />
                        ))}
                      </div>

                      {currentExerciseIndex < (selectedModule.exercises?.length || 0) - 1 && (
                        <button
                          onClick={() => {
                            const nextIndex = currentExerciseIndex + 1;
                            setCurrentExerciseIndex(nextIndex);
                            prepareExercise(selectedModule.exercises?.[nextIndex]!);
                          }}
                          className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-main transition-colors"
                        >
                          Skip <ChevronRight size={14} />
                        </button>
                      )}
                    </div>

                    {/* Validation for broken exercises */}
                    {(selectedModule.exercises?.length || 0) === 0 ? (
                      <div className="py-12 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-white">Module Generation Failed</p>
                          <p className="text-sm text-text-muted">No valid exercises could be generated for this module. Please delete it and try again.</p>
                        </div>
                        <button 
                          onClick={() => {
                            GrammarService.deleteModule(language, selectedModule.id);
                            setSelectedModule(null);
                          }}
                          className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-sm font-bold transition-all border border-red-500/20"
                        >
                          Delete & Try Again
                        </button>
                      </div>
                    ) : (selectedModule.exercises?.[currentExerciseIndex]?.type === 'fill-in-the-blank' && (!selectedModule.exercises?.[currentExerciseIndex]?.content?.sentence || !selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers || selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.length === 0)) ||
                      ((selectedModule.exercises?.[currentExerciseIndex]?.type === 'multiple-choice' || selectedModule.exercises?.[currentExerciseIndex]?.type === 'choose-correct-sentence' || selectedModule.exercises?.[currentExerciseIndex]?.type === 'true-false') && (!selectedModule.exercises?.[currentExerciseIndex]?.content?.options || selectedModule.exercises?.[currentExerciseIndex]?.content?.options?.length === 0)) ||
                      (selectedModule.exercises?.[currentExerciseIndex]?.type === 'word-order' && (!selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers || selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.length === 0)) ||
                      (selectedModule.exercises?.[currentExerciseIndex]?.type === 'mix-and-match' && (!selectedModule.exercises?.[currentExerciseIndex]?.content?.pairs || selectedModule.exercises?.[currentExerciseIndex]?.content?.pairs?.length === 0)) ? (
                      <div className="py-12 text-center space-y-4">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                        <div className="space-y-2">
                          <p className="text-lg font-bold text-white">Exercise Data Missing</p>
                          <p className="text-sm text-text-muted">This exercise couldn't be loaded correctly. Please skip it or try again.</p>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={handleFinishExercise}
                            className="px-6 py-3 bg-card-soft hover:bg-card-bg rounded-2xl text-sm font-bold transition-all"
                          >
                            Skip Exercise
                          </button>
                          <button 
                            onClick={() => {
                              GrammarService.deleteModule(language, selectedModule.id);
                              setSelectedModule(null);
                            }}
                            className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-sm font-bold transition-all border border-red-500/20"
                          >
                            Regenerate Module
                          </button>
                        </div>
                      </div>
                    ) : selectedModule.exercises?.[currentExerciseIndex]?.type === 'fill-in-the-blank' ? (
                      <div className="space-y-12">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                            Fill in the Blank
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 md:gap-x-3 gap-y-4 md:gap-y-6 text-xl md:text-2xl font-medium leading-relaxed break-german">
                          {selectedModule.exercises?.[currentExerciseIndex]?.content?.sentence?.split('[blank]').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              <span>{renderTextWithHints(part, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}</span>
                              {i < arr.length - 1 && (
                                <div 
                                  className={cn(
                                    "min-w-[120px] min-h-[48px] border-b-2 flex flex-col items-center justify-center transition-all px-4 cursor-pointer py-1",
                                    selectedBlankIndex === i ? "border-orange-500 bg-orange-500/5" : "border-app-border",
                                    userAnswers[i] ? "text-accent" : "text-text-muted italic text-sm",
                                    isSubmitted && checkAnswer(userAnswers[i], selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i]) && "border-green-500 text-green-500",
                                    isSubmitted && !checkAnswer(userAnswers[i], selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i]) && "border-red-500 text-red-500"
                                  )}
                                  onClick={() => {
                                    if (isSubmitted) return;
                                    if (userAnswers[i]) {
                                      handleRemoveAnswer(i);
                                    } else {
                                      setSelectedBlankIndex(i);
                                    }
                                  }}
                                >
                                  <span className={cn(
                                    "text-lg font-bold",
                                    isSubmitted && userAnswers[i] !== selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i] && "line-through opacity-50 text-sm"
                                  )}>
                                    {userAnswers[i] || 'click word...'}
                                  </span>
                                  {isSubmitted && userAnswers[i] !== selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i] && (
                                    <span className="text-sm font-black text-green-500 mt-0.5 animate-in fade-in slide-in-from-top-1">
                                      {selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i]}
                                    </span>
                                  )}
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Word Bank */}
                        <div className="flex flex-wrap gap-3 pt-8 border-t border-app-border">
                          {selectedModule.exercises?.[currentExerciseIndex]?.content?.wordBank?.map((word, i) => {
                            const isUsed = usedBankIndices.includes(i);
                            
                            return (
                              <button
                                key={i}
                                disabled={isUsed || isSubmitted}
                                onClick={() => {
                                  let targetIndex = selectedBlankIndex;
                                  if (targetIndex === null) {
                                    targetIndex = userAnswers.findIndex(a => !a);
                                  }
                                  
                                  if (targetIndex !== -1) {
                                    handleDrop(word, targetIndex, i);
                                  }
                                }}
                                className={cn(
                                  "px-6 py-3 border rounded-2xl text-sm font-bold transition-all",
                                  isUsed || isSubmitted
                                    ? "bg-card-bg border-app-border text-text-muted cursor-not-allowed"
                                    : "bg-card-soft hover:bg-card-bg border-app-border text-text-main hover:scale-105 active:scale-95",
                                  selectedBlankIndex !== null && !isSubmitted && "border-orange-500/30"
                                )}
                              >
                                {renderTextWithHints(word, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => {
                                  let targetIndex = selectedBlankIndex;
                                  if (targetIndex === null) {
                                    targetIndex = userAnswers.findIndex(a => !a);
                                  }
                                  
                                  if (targetIndex !== -1) {
                                    handleDrop(word, targetIndex, i);
                                  }
                                })}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : selectedModule.exercises?.[currentExerciseIndex]?.type === 'multiple-choice' || selectedModule.exercises?.[currentExerciseIndex]?.type === 'choose-correct-sentence' || selectedModule.exercises?.[currentExerciseIndex]?.type === 'true-false' ? (
                      <div className="space-y-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                            {selectedModule.exercises?.[currentExerciseIndex]?.type.replace(/-/g, ' ')}
                          </span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-medium leading-relaxed break-german">
                          {renderTextWithHints(selectedModule.exercises?.[currentExerciseIndex]?.content?.question || '', selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                        </h3>
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {selectedModule.exercises?.[currentExerciseIndex]?.content?.options?.map((option, i) => {
                          const isCorrect = isSubmitted && checkAnswer(option, selectedModule.exercises?.[currentExerciseIndex]?.content?.options?.[selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswerIndex || 0]);
                          const isWrong = isSubmitted && userAnswers[0] === option && !isCorrect;
                          const isSelected = userAnswers[0] === option;
                          
                          return (
                            <button
                              key={i}
                              disabled={isSubmitted && false} // Allow correction
                              onClick={() => {
                                if (isSubmitted) {
                                  setIsSubmitted(false);
                                  setScore(null);
                                  setShowExplanation(false);
                                }
                                setUserAnswers([option]);
                              }}
                              className={cn(
                                "p-4 md:p-6 rounded-2xl md:rounded-3xl border text-left transition-all flex items-center justify-between group break-words min-h-[4rem]",
                                !isSubmitted 
                                  ? (isSelected ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20" : "bg-card-soft border-app-border hover:border-border-strong text-text-subtle")
                                  : (isCorrect ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20" : 
                                     isWrong ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" :
                                     "bg-card-soft border-app-border text-text-muted")
                              )}
                            >
                              <span className="font-bold">
                                {renderTextWithHints(option, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => {
                                  if (isSubmitted) {
                                    setIsSubmitted(false);
                                    setScore(null);
                                    setShowExplanation(false);
                                  }
                                  setUserAnswers([option]);
                                })}
                              </span>
                              <div className={cn(
                                "w-6 h-6 rounded-full border flex items-center justify-center transition-colors",
                                isSelected ? "bg-card-soft border-border-strong" : "border-app-border"
                              )}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : selectedModule.exercises?.[currentExerciseIndex]?.type === 'word-order' ? (
                    <div className="space-y-8 md:space-y-12">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                          Word Order
                        </span>
                      </div>
                      <div className="space-y-4">
                          <h3 className="text-xl md:text-2xl font-medium leading-relaxed break-german">
                            {renderTextWithHints(selectedModule.exercises?.[currentExerciseIndex]?.content?.question || '', selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                          </h3>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Your Sentence</h4>
                        <div className="min-h-[80px] md:min-h-[100px] p-4 md:p-6 bg-card-soft border border-app-border rounded-[24px] md:rounded-[32px] flex flex-wrap gap-2 md:gap-3 items-center">
                          {userAnswers.length === 0 && <span className="text-text-muted italic text-sm">Click words below to build the sentence...</span>}
                          {userAnswers.map((word, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <button
                                disabled={isSubmitted}
                                onClick={() => {
                                  if (isSubmitted) {
                                    setIsSubmitted(false);
                                    setScore(null);
                                    setShowExplanation(false);
                                  }
                                  const newAnswers = [...userAnswers];
                                  newAnswers.splice(i, 1);
                                  setUserAnswers(newAnswers);
                                  
                                  const newUsed = [...usedBankIndices];
                                  newUsed.splice(i, 1);
                                  setUsedBankIndices(newUsed);
                                }}
                                className={cn(
                                  "px-4 py-2 rounded-xl border transition-all text-sm font-bold",
                                  isSubmitted 
                                    ? (() => {
                                        let correctAnswers = selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers || [];
                                        if (typeof correctAnswers === 'string') {
                                          correctAnswers = (correctAnswers as string).split(/\s+/).filter(Boolean);
                                        }
                                        return checkAnswer(word, correctAnswers[i]) ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500";
                                      })()
                                    : "bg-orange-500 border-orange-400 text-white hover:bg-orange-600"
                                )}
                              >
                                {renderTextWithHints(word, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => handleRemoveAnswer(i))}
                              </button>
                              {(() => {
                                let correctAnswers = selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers || [];
                                if (typeof correctAnswers === 'string') {
                                  correctAnswers = (correctAnswers as string).split(/\s+/).filter(Boolean);
                                }
                                const correctWord = correctAnswers[i];
                                return isSubmitted && word !== correctWord && (
                                  <span className="text-[10px] font-black text-green-500 animate-in fade-in slide-in-from-top-1">
                                    {correctWord}
                                  </span>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Word Bank</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedModule.exercises?.[currentExerciseIndex]?.content?.shuffledWords?.map((word, i) => {
                            const isUsed = usedBankIndices.includes(i);
                            return (
                              <button
                                key={i}
                                disabled={isUsed || isSubmitted}
                                onClick={() => {
                                  if (isSubmitted) {
                                    setIsSubmitted(false);
                                    setScore(null);
                                    setShowExplanation(false);
                                  }
                                  setUserAnswers(prev => [...prev, word]);
                                  setUsedBankIndices(prev => [...prev, i]);
                                }}
                                className={cn(
                                  "px-6 py-3 rounded-2xl border transition-all text-sm font-bold",
                                  isUsed || isSubmitted
                                    ? "bg-card-bg border-app-border text-text-muted cursor-not-allowed" 
                                    : "bg-card-soft border-app-border hover:border-border-strong text-text-main hover:scale-105"
                                )}
                              >
                                {renderTextWithHints(word, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => {
                                  if (isSubmitted) {
                                    setIsSubmitted(false);
                                    setScore(null);
                                    setShowExplanation(false);
                                  }
                                  setUserAnswers(prev => [...prev, word]);
                                  setUsedBankIndices(prev => [...prev, i]);
                                })}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : selectedModule.exercises?.[currentExerciseIndex]?.type === 'mix-and-match' ? (
                    <div className="space-y-8 md:space-y-12">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                          Mix and Match
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">Select from here...</h4>
                        {selectedModule.exercises?.[currentExerciseIndex]?.content?.pairs?.map((pair) => {
                          const isMatched = !!matches[pair.id];
                          const isSelected = selectedLeftId === pair.id;
                          const matchedRightId = matches[pair.id];
                          const matchedRight = shuffledRights.find(r => r.id === matchedRightId);
                          const isCorrect = isSubmitted && checkAnswer(matchedRight?.text || '', pair.right);
                          const isWrong = isSubmitted && matchedRight && !checkAnswer(matchedRight.text, pair.right);

                          return (
                            <button
                              key={pair.id}
                              disabled={false}
                              onClick={() => {
                                if (isSubmitted) {
                                  setIsSubmitted(false);
                                  setScore(null);
                                  setShowExplanation(false);
                                }
                                setSelectedLeftId(isSelected ? null : pair.id);
                              }}
                              className={cn(
                                "w-full min-h-[5rem] flex flex-col justify-center px-4 md:px-6 py-3 rounded-2xl md:rounded-3xl border transition-all text-left relative group break-words",
                                isSelected ? "bg-orange-500/10 border-orange-500 shadow-lg shadow-orange-500/5" : 
                                isCorrect ? "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]" :
                                isWrong ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]" :
                                isMatched ? "bg-card-soft border-border-strong text-text-subtle" :
                                "bg-card-soft border-app-border hover:border-border-strong"
                              )}
                            >
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
                                {isSubmitted && (
                                  <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                    isCorrect ? "bg-green-500 text-green-500" : "bg-red-500 text-red-500"
                                  )} />
                                )}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 group-hover:text-text-subtle transition-colors pl-2">
                                {isSelected ? "Now pick a match" : isMatched ? "Matched" : "Select to match"}
                              </span>
                              <div className="font-medium text-sm pl-2">
                                {renderTextWithHints(pair.left, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => {
                                  if (isSubmitted) {
                                    setIsSubmitted(false);
                                    setScore(null);
                                    setShowExplanation(false);
                                  }
                                  setSelectedLeftId(isSelected ? null : pair.id);
                                })}
                              </div>
                              {isMatched && (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isSubmitted) {
                                      setIsSubmitted(false);
                                      setScore(null);
                                      setShowExplanation(false);
                                    }
                                    const newMatches = { ...matches };
                                    delete newMatches[pair.id];
                                    setMatches(newMatches);
                                  }}
                                  className="absolute -right-2 -top-2 w-6 h-6 bg-card-bg rounded-full flex items-center justify-center border border-border-strong hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <X size={12} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-2">...to match these</h4>
                        <div className="space-y-3">
                          {(() => {
                            const currentEx = selectedModule.exercises?.[currentExerciseIndex];
                            const pairs = currentEx?.content?.pairs || [];
                            const itemsToRender = isSubmitted 
                              ? pairs.map(p => ({ id: p.id, text: p.right }))
                              : shuffledRights;

                            return itemsToRender.map((right) => {
                              const matchForThis = Object.entries(matches).find(([_, rId]) => rId === right.id);
                              const isMatched = !!matchForThis;
                              const leftId = matchForThis?.[0];
                              const leftPair = pairs.find(p => p.id === leftId);
                              
                              const isCorrect = isSubmitted && isMatched && right.id === leftId;
                              const isWrong = isSubmitted && isMatched && right.id !== leftId;
                              // If submitted and not matched, it's still the correct answer for its corresponding question
                              const isCorrectAnswer = isSubmitted;

                              return (
                                <button
                                  key={right.id}
                                  disabled={isMatched && !isSubmitted}
                                  onClick={() => {
                                    if (isSubmitted) {
                                      setIsSubmitted(false);
                                      setScore(null);
                                      setShowExplanation(false);
                                    }
                                    if (!selectedLeftId) return;
                                    setMatches(prev => ({ ...prev, [selectedLeftId]: right.id }));
                                    setSelectedLeftId(null);
                                  }}
                                  className={cn(
                                    "w-full min-h-[5rem] flex flex-col justify-center px-4 md:px-6 py-3 rounded-2xl md:rounded-3xl border transition-all text-left relative break-words",
                                    isCorrect ? "bg-green-500/10 border-green-500 text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.1)]" :
                                    isWrong ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                                    isCorrectAnswer ? "bg-green-500/5 border-green-500/30 text-green-500/70" :
                                    isMatched ? "bg-card-bg border-app-border opacity-40 cursor-not-allowed" :
                                    selectedLeftId ? "bg-card-soft border-orange-500/30 hover:border-orange-500 hover:bg-orange-500/5" :
                                    "bg-card-soft border-app-border hover:border-border-strong"
                                  )}
                                >
                                  <div className="absolute left-2 top-1/2 -translate-y-1/2">
                                    {isSubmitted && (
                                      <div className={cn(
                                        "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]",
                                        isCorrect ? "bg-green-500 text-green-500" : "bg-text-muted text-text-muted"
                                      )} />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1 pl-2">
                                    {isSubmitted 
                                      ? `Answer for: ${pairs.find(p => p.id === right.id)?.left}`
                                      : isMatched ? `Matched to: ${leftPair?.left}` : "Available"}
                                  </span>
                                  <div className="font-medium text-sm pl-2">
                                    {renderTextWithHints(right.text, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints, () => {
                                      if (isSubmitted) {
                                        setIsSubmitted(false);
                                        setScore(null);
                                        setShowExplanation(false);
                                      }
                                      if (!selectedLeftId) return;
                                      setMatches(prev => ({ ...prev, [selectedLeftId]: right.id }));
                                      setSelectedLeftId(null);
                                    })}
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                    <div className="py-12 text-center text-text-muted italic">
                      Select an exercise to begin
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-12 flex items-center gap-4">
                    {currentExerciseIndex > 0 && (
                      <button
                        onClick={handlePreviousExercise}
                        className="px-6 py-4 bg-card-soft hover:bg-card-bg rounded-2xl text-sm font-bold transition-all border border-app-border flex items-center gap-2"
                      >
                        <ChevronLeft size={18} />
                        <span className="hidden xs:inline">Previous</span>
                      </button>
                    )}
                    {!isSubmitted ? (
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit()}
                        className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all disabled:opacity-50"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishExercise}
                        className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        {currentExerciseIndex < (selectedModule.exercises?.length || 0) - 1 ? 'Next Exercise' : 'Finish Module'}
                      </button>
                    )}
                    <button 
                      onClick={() => selectedModule && selectedModule.exercises?.[currentExerciseIndex] && prepareExercise(selectedModule.exercises?.[currentExerciseIndex])}
                      className="p-4 bg-card-soft hover:bg-card-bg rounded-2xl transition-all text-text-subtle"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>

                {/* Explanation & Chat */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-card-soft border border-app-border p-8 rounded-[40px] space-y-4">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Info size={18} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Grammar Note</h4>
                      </div>
                      <p className="text-text-main leading-relaxed">{selectedModule.exercises?.[currentExerciseIndex]?.explanation}</p>
                    </div>

                    {/* Chat Window */}
                    <div className="relative">
                      {/* Small Bar Form */}
                      <motion.div 
                        className={cn(
                          "bg-card-soft border border-border-strong rounded-[32px] overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl transition-all duration-300 transform-gpu",
                          isChatExpanded ? "opacity-0 pointer-events-none h-0" : "h-[80px]"
                        )}
                        style={{ willChange: "transform, opacity" }}
                      >
                        <div className="flex-1 flex items-center px-6 gap-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                            <MessageCircle size={20} />
                          </div>
                          <div 
                            className="flex-1 bg-card-soft border border-app-border rounded-2xl px-4 py-2.5 cursor-text group hover:bg-card-bg transition-all flex items-center"
                            onClick={() => setIsChatExpanded(true)}
                          >
                            <span className="text-sm text-text-muted group-hover:text-text-subtle transition-colors truncate">
                              {chatMessages.length > 0
                                ? `Clear doubts (${chatMessages.length} message${chatMessages.length > 1 ? 's' : ''}) • Click to continue`
                                : "Have a doubt about this question? Chat with tutor"}
                            </span>
                          </div>
                          <button 
                            onClick={() => setIsChatExpanded(true)}
                            className="w-10 h-10 bg-card-soft hover:bg-card-bg border border-app-border rounded-2xl flex items-center justify-center text-text-subtle transition-all cursor-pointer"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </motion.div>

                      {/* Expanded Modal Form */}
                      <AnimatePresence mode="wait">
                        {isChatExpanded && (
                          <>
                            {/* Backdrop */}
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ 
                                duration: 0.25, 
                                ease: [0.64, 0, 0.78, 0] // Collapse curve
                              }}
                              onClick={() => setIsChatExpanded(false)}
                              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] transform-gpu"
                              style={{ willChange: "opacity" }}
                            />
                            
                            {/* Hardware-Accelerated Container Shell */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.88, y: 25 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.88, y: 15 }}
                              transition={{ 
                                duration: 0.3, // 300ms explosive expand
                                ease: [0.22, 1, 0.36, 1] // Explosive deceleration curve
                              }}
                              style={{ willChange: "transform, opacity" }}
                              className="fixed top-[15%] inset-x-4 md:inset-x-20 lg:inset-x-40 bottom-6 z-[70] bg-card-bg border border-border-strong rounded-[40px] shadow-[0_25px_90px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transform-gpu"
                            >
                              {/* Layer Isolated Content: Fades in during the last 30% of timeline to avoid warping */}
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ 
                                  duration: 0.12, 
                                  delay: 0.18, // Last 30% of 300ms transition
                                  ease: "easeOut" 
                                }}
                                className="flex flex-col h-full w-full overflow-hidden"
                              >
                                {/* Header */}
                                <div className="p-6 md:p-8 border-b border-app-border bg-card-bg/80 backdrop-blur-md flex items-center justify-between shrink-0">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                                      <Sparkles size={24} />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-bold text-text-main uppercase tracking-widest">Clear your doubts</h4>
                                      {selectedModule && (
                                        <p className="text-xs text-text-muted mt-0.5">
                                          Question {currentExerciseIndex + 1} of {selectedModule.exercises.length} &bull; {selectedTopic?.name}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <button 
                                    onClick={() => setIsChatExpanded(false)}
                                    className="w-12 h-12 bg-card-soft hover:bg-card-bg border border-app-border rounded-2xl flex items-center justify-center text-text-subtle hover:text-text-main transition-all group shadow-inner cursor-pointer"
                                    title="Minimize"
                                  >
                                    <Minus size={28} className="group-hover:scale-110 transition-transform" />
                                  </button>
                                </div>

                                {/* Question & Attempt Context Ribbon */}
                                {selectedModule && selectedModule.exercises?.[currentExerciseIndex] && (() => {
                                  const curEx = selectedModule.exercises[currentExerciseIndex];
                                  const userAns = getUserAnswerSummary(curEx, userAnswers, selectedIndex, matches, shuffledRights);
                                  const isAnsCorrect = isSubmitted && score !== null && score >= 1;
                                  const isAnsWrong = isSubmitted && (score === null || score < 1);
                                  const sentenceOrPrompt = curEx.content?.sentence || curEx.content?.question || selectedTopic?.name || '';

                                  return (
                                    <div className="px-6 md:px-8 py-3 bg-card-soft/90 border-b border-app-border flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
                                      <div className="flex items-center gap-2.5 flex-1 min-w-[220px]">
                                        <span className="font-mono font-bold text-orange-500 px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 shrink-0 uppercase text-[10px] tracking-wider">
                                          Question {currentExerciseIndex + 1}
                                        </span>
                                        <span className="font-medium text-text-muted line-clamp-1 italic text-xs" title={sentenceOrPrompt}>
                                          "{sentenceOrPrompt}"
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        {userAns ? (
                                          <span className={cn(
                                            "px-3 py-1 rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-xs",
                                            isAnsCorrect ? "bg-green-500/15 text-green-500 border border-green-500/30" :
                                            isAnsWrong ? "bg-red-500/15 text-red-500 border border-red-500/30" :
                                            "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                          )}>
                                            <span className="text-[9px] uppercase font-black tracking-widest opacity-80">Your Answer:</span>
                                            <span className="max-w-[160px] truncate">"{userAns}"</span>
                                            {isAnsCorrect && <Check size={14} className="shrink-0" />}
                                            {isAnsWrong && <X size={14} className="shrink-0" />}
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-card-bg text-text-muted border border-app-border">
                                            Question in progress
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}

                                {/* Messages Area */}
                                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-card-soft">
                                  {chatMessages.length === 0 && (() => {
                                    const curEx = selectedModule?.exercises?.[currentExerciseIndex];
                                    const userAns = getUserAnswerSummary(curEx, userAnswers, selectedIndex, matches, shuffledRights);
                                    const isAnsWrong = isSubmitted && (score === null || score < 1);
                                    const isAnsCorrect = isSubmitted && score !== null && score >= 1;

                                    const quickPrompts: string[] = [];
                                    if (isAnsWrong && userAns) {
                                      quickPrompts.push(`Why is my answer "${userAns}" incorrect?`);
                                      quickPrompts.push("Why is the correct answer required here?");
                                      quickPrompts.push("Explain the grammar rule behind this sentence.");
                                    } else if (isAnsCorrect) {
                                      quickPrompts.push("Why does this sentence use this specific form?");
                                      quickPrompts.push("Can you give another example of this pattern?");
                                    } else if (userAns) {
                                      quickPrompts.push(`Is "${userAns}" the right choice for this sentence?`);
                                      quickPrompts.push("Give me a hint for this question.");
                                    } else {
                                      quickPrompts.push("Give me a hint for this question.");
                                      quickPrompts.push("What grammar rule applies to this sentence?");
                                      quickPrompts.push("What do the words in this sentence mean?");
                                    }

                                    return (
                                      <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-lg mx-auto py-6">
                                        <div className="w-16 h-16 bg-orange-500/10 text-orange-500 rounded-3xl flex items-center justify-center shadow-inner">
                                          <Sparkles size={30} />
                                        </div>
                                        <div className="space-y-1">
                                          <h5 className="text-lg font-bold text-text-main">Doubts on Question {currentExerciseIndex + 1}?</h5>
                                          <p className="text-xs text-text-muted leading-relaxed max-w-sm">
                                            Ask any doubt about this sentence, your answer, or how the grammar applies. The tutor is focused strictly on this exercise.
                                          </p>
                                        </div>
                                        {quickPrompts.length > 0 && (
                                          <div className="w-full flex flex-col gap-2 pt-2 text-left">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted pl-1">
                                              Suggested Questions:
                                            </span>
                                            {quickPrompts.map((promptText, pIdx) => (
                                              <button
                                                key={pIdx}
                                                type="button"
                                                onClick={() => handleSendMessage(promptText)}
                                                className="text-left text-xs font-semibold px-4 py-3 rounded-2xl bg-card-bg hover:bg-card-bg/80 border border-app-border hover:border-orange-500/50 text-text-main hover:text-orange-500 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                                              >
                                                <span className="truncate pr-2">{promptText}</span>
                                                <ChevronRight size={14} className="text-text-muted group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })()}
                                  {chatMessages.map((msg, i) => (
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      key={i} 
                                      className={cn(
                                        "max-w-[85%] md:max-w-[75%] p-6 rounded-[32px] text-base leading-relaxed shadow-sm",
                                        msg.sender === 'user' 
                                          ? "bg-orange-500 text-white ml-auto rounded-tr-none" 
                                          : "bg-card-soft border border-app-border text-text-main mr-auto rounded-tl-none"
                                      )}
                                    >
                                      <div className={cn(
                                        "prose prose-sm max-w-none prose-p:leading-relaxed prose-table:border prose-table:border-border-strong prose-th:bg-card-soft prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-app-border",
                                        isLight ? "prose-slate" : "prose-invert"
                                      )}>
                                        <Markdown remarkPlugins={[remarkGfm]}>{msg.text}</Markdown>
                                      </div>
                                    </motion.div>
                                  ))}
                                  {isChatLoading && (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="bg-card-soft border border-app-border text-text-subtle p-6 rounded-[32px] mr-auto rounded-tl-none flex items-center gap-4"
                                    >
                                      <div className="flex gap-1">
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                        <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                                      </div>
                                      <span className="text-sm font-medium">Thinking...</span>
                                    </motion.div>
                                  )}
                                  <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-6 md:p-10 bg-card-bg border-t border-app-border shrink-0">
                                  <div className="max-w-4xl mx-auto relative group flex items-end gap-3">
                                    <div className="flex-1 relative">
                                      <textarea 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onInput={(e) => {
                                          const target = e.target as HTMLTextAreaElement;
                                          target.style.height = 'auto';
                                          target.style.height = `${Math.min(target.scrollHeight, 150)}px`;
                                        }}
                                        placeholder="Still not clear, chat with me"
                                        className="w-full bg-input-bg border border-border-strong rounded-[24px] pl-6 pr-6 py-4 text-lg outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all placeholder:text-text-muted resize-none min-h-[60px] max-h-[150px] custom-scrollbar"
                                        rows={1}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                          }
                                        }}
                                      />
                                    </div>
                                    <button 
                                      onClick={() => handleSendMessage()}
                                      disabled={!chatInput.trim() || isChatLoading}
                                      className="w-14 h-14 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 shrink-0 mb-1 cursor-pointer"
                                    >
                                      <Send size={24} />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )
        )}
      </div>
    </div>
  )}
</main>

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
            initial={{ opacity: 0, scale: 0.9, y: "-90%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-100%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-90%", x: "-50%" }}
            style={{ 
              position: 'fixed',
              left: activeTooltip.x,
              top: activeTooltip.y,
              zIndex: 1000
            }}
            className="bg-card-bg border border-accent/30 px-4 py-2 rounded-xl shadow-2xl pointer-events-none mb-4"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Translation</div>
            <div className="text-sm font-bold text-text-main whitespace-nowrap">{activeTooltip.translation}</div>
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-card-bg border-r border-b border-accent/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

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
                <p className="text-sm text-text-muted leading-relaxed text-center">
                  Your timer is paused at{' '}
                  <span className="font-mono font-bold text-text-main">{timeLeft ?? 0}s</span>
                  {' '}({totalTimeLeft ?? 0}s total remaining).
                </p>
                <p className="text-xs text-text-subtle text-center">
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
                  <span>Timer paused at {timeLeft ?? 0}s ({totalTimeLeft ?? 0}s total)</span>
                </div>
                
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
