import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ChevronLeft, Sparkles, CheckCircle2, Info, 
  ChevronRight, Trophy, AlertCircle, Loader2, Send, 
  MessageCircle, Check, X, RotateCcw, Play, Lock, Trash2, RefreshCw,
  Minimize2, Minus
} from 'lucide-react';
import { ThemeService } from '../services/ThemeService';
import { GrammarTopic, GrammarExercise, LanguageLevel, GrammarModule, VocabularyWord } from '../types';
import { GrammarService } from '../services/GrammarService';
import { FluencyService } from '../services/FluencyService';
import { getLanguageContent } from '../data';
import { cn } from '../lib/utils';

const TOTAL_MODULES = 16;

interface GrammarInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
  onNewWord: (word: Omit<VocabularyWord, 'languageCode'>) => void;
}

export function GrammarInterface({ level, language, onClose, onProgressUpdate, onNewWord }: GrammarInterfaceProps) {
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

  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [modules, setModules] = useState<GrammarModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<GrammarModule | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [activeGenerations, setActiveGenerations] = useState<number[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ word: string; translation: string; x: number; y: number } | null>(null);
  const lastClickRef = useRef<{ word: string; time: number } | null>(null);
  
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
    const saved = localStorage.getItem('completedGrammarTopics');
    if (saved) setCompletedTopics(new Set(JSON.parse(saved)));
  }, []);

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
  }, [level, selectedTopic]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);

  const handleGenerateModule = async (index: number) => {
    if (!selectedTopic) return;
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
      setGenError(err.message);
    } finally {
      generatingRef.current.delete(index);
      setActiveGenerations(prev => prev.filter(i => i !== index));
    }
  };

  const handleSelectModule = (module: GrammarModule) => {
    setSelectedModule(module);
    setCurrentExerciseIndex(0);
    if (module.exercises && module.exercises.length > 0) {
      prepareExercise(module.exercises[0]);
    }
  };

  const prepareExercise = (exercise: GrammarExercise) => {
    if (!exercise) return;
    
    // Only reset state if it's a different exercise
    // This prevents chat from disappearing during background syncs
    const currentExercise = selectedModule?.exercises?.[currentExerciseIndex];
    if (currentExercise && currentExercise.id !== exercise.id) {
      resetExerciseState();
    } else if (!currentExercise) {
      resetExerciseState();
    }
    
    if (exercise.type === 'fill-in-the-blank' && exercise.content?.correctAnswers) {
      setUserAnswers(new Array(exercise.content.correctAnswers.length).fill(''));
      setUsedBankIndices(new Array(exercise.content.correctAnswers.length).fill(-1));
    } else if (exercise.type === 'mix-and-match' && exercise.content?.pairs) {
      const rights = exercise.content.pairs.map(p => ({ id: p.id, text: p.right }));
      setShuffledRights([...rights].sort(() => Math.random() - 0.5));
    } else if (exercise.type === 'word-order' && exercise.content?.shuffledWords) {
      setUserAnswers([]);
      setUsedBankIndices([]);
    } else if ((exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') && exercise.content?.options) {
      setUserAnswers([]);
    }
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
    
    if (lastClickRef.current && lastClickRef.current.word === word && now - lastClickRef.current.time < 2000) {
      setActiveTooltip(null);
      if (onSecondClick) {
        onSecondClick();
        lastClickRef.current = null;
        return;
      }
    }
    
    lastClickRef.current = { word, time: now };
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setActiveTooltip({
      word,
      translation,
      x: rect.left + rect.width / 2,
      y: rect.top - 15
    });

    // Add to vocabulary automatically when clicked for translation
    onNewWord({
      id: Math.random().toString(36).substr(2, 9),
      word,
      translation,
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
    if (isSubmitted) return;
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
    if (isSubmitted) return;
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
        if (userAnswers[i] === ans) correctCount++;
      });
      totalItems = correctAnswers.length || 1;
    } else if (exercise.type === 'multiple-choice' || exercise.type === 'choose-correct-sentence' || exercise.type === 'true-false') {
      const options = exercise.content?.options || [];
      const correctIdx = exercise.content?.correctAnswerIndex ?? 0;
      if (userAnswers[0] === options[correctIdx]) {
        correctCount = 1;
      }
      totalItems = 1;
    } else if (exercise.type === 'word-order') {
      let correctAnswers = exercise.content?.correctAnswers || [];
      if (typeof correctAnswers === 'string') {
        correctAnswers = (correctAnswers as string).split(/\s+/).filter(Boolean);
      }
      correctAnswers.forEach((ans, i) => {
        if (userAnswers[i] === ans) correctCount++;
      });
      totalItems = correctAnswers.length || 1;
    } else if (exercise.type === 'mix-and-match') {
      const pairs = exercise.content?.pairs || [];
      const pairResults = pairs.map(pair => {
        const matchedRightId = matches[pair.id];
        const matchedRight = shuffledRights.find(r => r.id === matchedRightId);
        return matchedRight?.text === pair.right;
      });
      correctCount = pairResults.filter(Boolean).length;
      totalItems = pairs.length || 1;
    }
    
    const normalizedScore = correctCount / totalItems;
    setScore(normalizedScore);
    setIsSubmitted(true);
    setShowExplanation(true);
    onProgressUpdate(normalizedScore);
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
    if (exercise) exercise.isCompleted = true;

    if (currentExerciseIndex < (selectedModule.exercises?.length || 0) - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      prepareExercise(selectedModule.exercises?.[nextIndex]);
    } else {
      // Module completed
      selectedModule.isCompleted = true;
      const updatedModules = modules.map(m => m.id === selectedModule.id ? { ...m, isCompleted: true } : m);
      setModules(updatedModules);
      GrammarService.saveModules(updatedModules, language);
      
      // Check if all modules for topic are done
      const allDone = updatedModules.every(m => m.isCompleted && m.topicId === selectedTopic.id);
      if (allDone) {
        setCompletedTopics(prev => {
          const next = new Set(prev);
          next.add(selectedTopic.id);
          localStorage.setItem('completedGrammarTopics', JSON.stringify(Array.from(next)));
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

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading || !selectedModule) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const exercise = selectedModule.exercises?.[currentExerciseIndex];
      if (!exercise) {
        setIsChatLoading(false);
        return;
      }
      const context = exercise.type === 'fill-in-the-blank' 
        ? `Sentence: ${exercise.content?.sentence}. Correct Answers: ${exercise.content?.correctAnswers?.join(', ')}`
        : exercise.type === 'multiple-choice'
        ? `Question: ${exercise.content?.question}. Options: ${exercise.content?.options?.join(', ')}. Correct: ${exercise.content?.options?.[exercise.content?.correctAnswerIndex || 0]}`
        : `Pairs: ${exercise.content?.pairs?.map(p => `${p.left} -> ${p.right}`).join(', ')}. User Matches: ${Object.entries(matches).map(([lId, rId]) => {
            const left = exercise.content?.pairs?.find(p => p.id === lId)?.left;
            const right = shuffledRights.find(r => r.id === rId)?.text;
            return `${left} -> ${right}`;
          }).join(', ')}`;
      
      const response = await GrammarService.clearDoubt(userMsg, context, language);
      setChatMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedModule) {
      setSelectedModule(null);
    } else if (selectedTopic) {
      setSelectedTopic(null);
    } else {
      onClose();
    }
  };

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
              {selectedModule ? 'Exit' : selectedTopic ? 'Topics' : 'Back'}
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
              <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-orange-400">
                <AlertCircle size={20} />
                <p className="text-sm font-bold">{genError}</p>
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
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const index = module.index;
                                GrammarService.deleteModule(language, module.id);
                                // Update local state immediately for better responsiveness
                                setModules(prev => prev.filter(m => m.id !== module.id));
                                handleGenerateModule(index);
                              }}
                              className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-all border border-red-500/20"
                              title="Delete & Regenerate Module"
                            >
                              <Trash2 size={16} />
                            </button>
                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg border border-orange-500/20">
                              {module.isCompleted ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : (
                                <Play size={18} className="group-hover:scale-110 transition-all" />
                              )}
                            </div>
                          </>
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
          <div className="flex-1 overflow-y-auto p-6 bg-surface">
            <div className="max-w-2xl mx-auto space-y-8 pb-32">
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
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedModule.exercises?.[currentExerciseIndex]?.id || 'no-exercise'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-8"
                  >
                  {/* Exercise Content */}
                  <div className="bg-card-soft border border-app-border p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                    {/* Navigation Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                            Exercise { (selectedModule.exercises?.length || 0) > 0 ? currentExerciseIndex + 1 : 0} of {selectedModule.exercises?.length || 0}
                          </span>
                        </div>
                        {selectedModule.scenario && (
                          <div className="flex items-center gap-2 mt-2">
                            <Sparkles size={12} className="text-orange-500" />
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                              Scenario: {selectedModule.scenario}
                            </span>
                          </div>
                        )}
                      </div>
                      
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
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-6 text-2xl font-medium leading-relaxed">
                          {selectedModule.exercises?.[currentExerciseIndex]?.content?.sentence?.split('[blank]').map((part, i, arr) => (
                            <React.Fragment key={i}>
                              <span>{renderTextWithHints(part, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}</span>
                              {i < arr.length - 1 && (
                                <div 
                                  className={cn(
                                    "min-w-[120px] min-h-[48px] border-b-2 flex flex-col items-center justify-center transition-all px-4 cursor-pointer py-1",
                                    selectedBlankIndex === i ? "border-orange-500 bg-orange-500/5" : "border-app-border",
                                    userAnswers[i] ? "text-accent" : "text-text-muted italic text-sm",
                                    isSubmitted && userAnswers[i] === selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i] && "border-green-500 text-green-500",
                                    isSubmitted && userAnswers[i] !== selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswers?.[i] && "border-red-500 text-red-500"
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
                        <h3 className="text-2xl font-medium leading-relaxed">
                          {renderTextWithHints(selectedModule.exercises?.[currentExerciseIndex]?.content?.question || '', selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                        {selectedModule.exercises?.[currentExerciseIndex]?.content?.options?.map((option, i) => {
                          const isCorrect = isSubmitted && option === selectedModule.exercises?.[currentExerciseIndex]?.content?.options?.[selectedModule.exercises?.[currentExerciseIndex]?.content?.correctAnswerIndex || 0];
                          const isWrong = isSubmitted && userAnswers[0] === option && !isCorrect;
                          const isSelected = userAnswers[0] === option;
                          
                          return (
                            <button
                              key={i}
                              disabled={isSubmitted}
                              onClick={() => setUserAnswers([option])}
                              className={cn(
                                "p-6 rounded-3xl border text-left transition-all flex items-center justify-between group",
                                !isSubmitted 
                                  ? (isSelected ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20" : "bg-card-soft border-app-border hover:border-border-strong text-text-subtle")
                                  : (isCorrect ? "bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/20" : 
                                     isWrong ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" :
                                     "bg-card-soft border-app-border text-text-muted")
                              )}
                            >
                              <span className="font-bold">
                                {renderTextWithHints(option, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
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
                    <div className="space-y-12">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                          Word Order
                        </span>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-2xl font-medium leading-relaxed">
                          {renderTextWithHints(selectedModule.exercises?.[currentExerciseIndex]?.content?.question || '', selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                        </h3>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Your Sentence</h4>
                        <div className="min-h-[100px] p-6 bg-card-soft border border-app-border rounded-[32px] flex flex-wrap gap-3 items-center">
                          {userAnswers.length === 0 && <span className="text-text-muted italic text-sm">Click words below to build the sentence...</span>}
                          {userAnswers.map((word, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <button
                                disabled={isSubmitted}
                                onClick={() => {
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
                                        return word === correctAnswers[i] ? "bg-green-500/10 border-green-500 text-green-500" : "bg-red-500/10 border-red-500 text-red-500";
                                      })()
                                    : "bg-orange-500 border-orange-400 text-white hover:bg-orange-600"
                                )}
                              >
                                {renderTextWithHints(word, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
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
                                {renderTextWithHints(word, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : selectedModule.exercises?.[currentExerciseIndex]?.type === 'mix-and-match' ? (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                          Mix and Match
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">Select from here...</h4>
                        {selectedModule.exercises?.[currentExerciseIndex]?.content?.pairs?.map((pair) => {
                          const isMatched = !!matches[pair.id];
                          const isSelected = selectedLeftId === pair.id;
                          const matchedRightId = matches[pair.id];
                          const matchedRight = shuffledRights.find(r => r.id === matchedRightId);
                          const isCorrect = isSubmitted && matchedRight?.text === pair.right;
                          const isWrong = isSubmitted && matchedRight && matchedRight.text !== pair.right;

                          return (
                            <button
                              key={pair.id}
                              disabled={isSubmitted}
                              onClick={() => setSelectedLeftId(isSelected ? null : pair.id)}
                              className={cn(
                                "w-full h-20 flex flex-col justify-center px-6 rounded-3xl border transition-all text-left relative group",
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
                                {renderTextWithHints(pair.left, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
                              </div>
                              {isMatched && !isSubmitted && (
                                <div 
                                  onClick={(e) => {
                                    e.stopPropagation();
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
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">...to match these</h4>
                        <div className="space-y-4">
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
                                  disabled={isSubmitted || (isMatched && !isSubmitted)}
                                  onClick={() => {
                                    if (!selectedLeftId) return;
                                    setMatches(prev => ({ ...prev, [selectedLeftId]: right.id }));
                                    setSelectedLeftId(null);
                                  }}
                                  className={cn(
                                    "w-full h-20 flex flex-col justify-center px-6 rounded-3xl border transition-all text-left relative",
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
                                    {renderTextWithHints(right.text, selectedModule.exercises?.[currentExerciseIndex]?.vocabularyHints)}
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
                        layoutId="chat-window"
                        className={cn(
                          "bg-card-soft border border-border-strong rounded-[32px] overflow-hidden flex flex-col transition-all duration-500 shadow-2xl backdrop-blur-xl",
                          isChatExpanded ? "opacity-0 pointer-events-none h-0" : "h-[80px]"
                        )}
                      >
                        <div className="flex-1 flex items-center px-6 gap-4">
                          <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                            <MessageCircle size={20} />
                          </div>
                          <div 
                            className="flex-1 bg-card-soft border border-app-border rounded-2xl px-4 py-2.5 cursor-text group hover:bg-card-bg transition-all flex items-center"
                            onClick={() => setIsChatExpanded(true)}
                          >
                            <span className="text-sm text-text-muted group-hover:text-text-subtle transition-colors">Still not clear, chat with me</span>
                          </div>
                          <button 
                            onClick={() => setIsChatExpanded(true)}
                            className="w-10 h-10 bg-card-soft hover:bg-card-bg border border-app-border rounded-2xl flex items-center justify-center text-text-subtle transition-all"
                          >
                            <Send size={18} />
                          </button>
                        </div>
                      </motion.div>

                      {/* Expanded Modal Form */}
                      <AnimatePresence>
                        {isChatExpanded && (
                          <>
                            {/* Backdrop */}
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              onClick={() => setIsChatExpanded(false)}
                              className="fixed inset-0 bg-card-bg/60 backdrop-blur-md z-[60]"
                            />
                            
                            {/* Modal */}
                            <motion.div 
                              layoutId="chat-window"
                              initial={{ opacity: 0, scale: 0.95, y: 40 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 40 }}
                              transition={{ type: "spring", damping: 25, stiffness: 200 }}
                              className="fixed top-[15%] inset-x-2 md:inset-x-10 lg:inset-x-20 bottom-2 z-[70] bg-card-bg border border-border-strong rounded-[40px] shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
                            >
                              {/* Header */}
                              <div className="p-6 md:p-8 border-b border-app-border bg-card-bg/80 backdrop-blur-md flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                                    <Sparkles size={24} />
                                  </div>
                                  <div>
                                    <h4 className="text-lg font-bold text-text-main uppercase tracking-widest">Clear your doubts</h4>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => setIsChatExpanded(false)}
                                  className="w-12 h-12 bg-card-soft hover:bg-card-bg border border-app-border rounded-2xl flex items-center justify-center text-text-subtle hover:text-text-main transition-all group shadow-inner"
                                  title="Minimize"
                                >
                                  <Minus size={28} className="group-hover:scale-110 transition-transform" />
                                </button>
                              </div>

                              {/* Messages Area */}
                              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 custom-scrollbar bg-card-soft">
                                {chatMessages.length === 0 && (
                                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                                    <div className="w-20 h-20 bg-card-soft rounded-[40px] flex items-center justify-center">
                                      <MessageCircle size={40} className="text-text-muted" />
                                    </div>
                                    <div className="space-y-2">
                                      <h5 className="text-xl font-medium">No messages yet</h5>
                                      <p className="text-sm max-w-[280px]">Ask anything about the current grammar rule or exercise.</p>
                                    </div>
                                  </div>
                                )}
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
                                    />
                                  </div>
                                  <button 
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isChatLoading}
                                    className="w-14 h-14 bg-orange-500 text-white rounded-2xl hover:bg-orange-600 disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 shrink-0 mb-1"
                                  >
                                    <Send size={24} />
                                  </button>
                                </div>
                              </div>
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

      {/* Tooltip */}
      <AnimatePresence>
        {activeTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            style={{ 
              position: 'fixed',
              left: activeTooltip.x,
              top: activeTooltip.y,
              transform: 'translate(-50%, -100%)',
              zIndex: 1000
            }}
            className="bg-card-bg border border-accent/30 px-4 py-2 rounded-xl shadow-2xl pointer-events-none mb-2"
          >
            <div className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-1">Translation</div>
            <div className="text-sm font-bold text-text-main whitespace-nowrap">{activeTooltip.translation}</div>
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-card-bg border-r border-b border-accent/30 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
