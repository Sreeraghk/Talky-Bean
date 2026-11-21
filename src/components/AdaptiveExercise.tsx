import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, CheckCircle2, AlertCircle, Loader2, Trophy, Brain, Timer, Zap, BookOpen, Layers } from 'lucide-react';
import { Exercise, LanguageLevel, VocabularyWord, GrammarTip, AdvancedExercise, AdvancedExerciseType } from '../types';
import { ExerciseService } from '../services/ExerciseService';
import { PerformanceService } from '../services/PerformanceService';
import { ThemeService } from '../services/ThemeService';
import { FluencyService } from '../services/FluencyService';
import { cn } from '../lib/utils';

interface AdaptiveExerciseProps {
  level: LanguageLevel;
  language: string;
  vocabulary: VocabularyWord[];
  grammarTips: GrammarTip[];
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
  user?: any;
  onRequireLogin?: () => void;
}

export function AdaptiveExercise({ level, language, vocabulary, grammarTips, onClose, onProgressUpdate, user, onRequireLogin }: AdaptiveExerciseProps) {
  const [sessionExercises, setSessionExercises] = useState<AdvancedExercise[]>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_adaptive_exercises_${language}_${level}`) || localStorage.getItem(`lang_adaptive_exercises_${language}_${level}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [currentIdx, setCurrentIdx] = useState(() => {
    try {
      const saved = localStorage.getItem(`langeasy_adaptive_idx_${language}_${level}`) || localStorage.getItem(`lang_adaptive_idx_${language}_${level}`);
      const parsed = saved ? parseInt(saved, 10) : 0;
      return isNaN(parsed) ? 0 : parsed;
    } catch (e) {
      return 0;
    }
  });
  const [selectedTypes, setSelectedTypes] = useState<AdvancedExerciseType[]>(() => {
    try {
      const saved = localStorage.getItem(`langeasy_adaptive_types_${language}_${level}`) || localStorage.getItem(`lang_adaptive_types_${language}_${level}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [gameState, setGameState] = useState<'selecting' | 'loading' | 'playing' | 'summary'>(() => {
    const saved = localStorage.getItem(`langeasy_adaptive_state_${language}_${level}`) || localStorage.getItem(`lang_adaptive_state_${language}_${level}`);
    return (saved as any) || 'selecting';
  });
  
  const [selectedOption, setSelectedOption] = useState<number | null>(() => {
    const saved = localStorage.getItem(`langeasy_adaptive_option_${language}_${level}`) || localStorage.getItem(`lang_adaptive_option_${language}_${level}`);
    return saved ? parseInt(saved, 10) : null;
  });
  const [isSubmitted, setIsSubmitted] = useState(() => {
    return (localStorage.getItem(`langeasy_adaptive_submitted_${language}_${level}`) || localStorage.getItem(`lang_adaptive_submitted_${language}_${level}`)) === 'true';
  });
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(`langeasy_adaptive_score_${language}_${level}`) || localStorage.getItem(`lang_adaptive_score_${language}_${level}`);
    return saved ? parseInt(saved, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_exercises_${language}_${level}`, JSON.stringify(sessionExercises));
  }, [sessionExercises, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_idx_${language}_${level}`, currentIdx.toString());
  }, [currentIdx, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_types_${language}_${level}`, JSON.stringify(selectedTypes));
  }, [selectedTypes, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_state_${language}_${level}`, gameState);
  }, [gameState, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_option_${language}_${level}`, selectedOption?.toString() || '');
  }, [selectedOption, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_submitted_${language}_${level}`, isSubmitted.toString());
  }, [isSubmitted, language, level]);

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_score_${language}_${level}`, score.toString());
  }, [score, language, level]);
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem(`langeasy_adaptive_streak_${language}_${level}`) || localStorage.getItem(`deutschbuddy_adaptive_streak_${language}_${level}`);
    return saved ? parseInt(saved) : 0;
  });

  useEffect(() => {
    localStorage.setItem(`langeasy_adaptive_streak_${language}_${level}`, streak.toString());
  }, [streak, language, level]);

  const theme = ThemeService.getTheme();

  const gameOptions: { type: AdvancedExerciseType; label: string; icon: any; description: string; color: string }[] = [
    { type: 'mix-and-match', label: 'Mix & Match', icon: Layers, description: 'Pair terms with meanings', color: 'bg-blue-500' },
    { type: 'context-master', label: 'Context Master', icon: BookOpen, description: 'Master words in stories', color: 'bg-purple-500' },
    { type: 'speed-choice', label: 'Speed Choice', icon: Zap, description: 'Race against the clock', color: 'bg-orange-500' }
  ];

  const toggleType = (type: AdvancedExerciseType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const startBatch = async () => {
    if (selectedTypes.length === 0) return;
    if (!user) {
      onRequireLogin?.();
      return;
    }
    setGameState('loading');
    try {
      const exercises = await ExerciseService.generateBatchAdvanced(selectedTypes, level, vocabulary, grammarTips, language);
      setSessionExercises(exercises);
      setGameState('playing');
      setCurrentIdx(0);
      setScore(0);
    } catch (e) {
      console.error("Batch gen error:", e);
      setGameState('selecting');
    }
  };

  const activeExercise = sessionExercises[currentIdx];

  const handleSubmit = (correct: boolean) => {
    setIsSubmitted(true);
    if (correct) {
      setScore(s => s + 1);
      setStreak(st => st + 1);
      onProgressUpdate(100);
    } else {
      setStreak(0);
      onProgressUpdate(0);
    }

    // Update Fluency Mirror
    FluencyService.updateFluency(language, level, 'grammar', {
      exerciseId: activeExercise.id,
      correct,
      type: activeExercise.type
    });
  };

  const nextExercise = () => {
    if (currentIdx < sessionExercises.length - 1) {
      setCurrentIdx(i => i + 1);
      setIsSubmitted(false);
      setSelectedOption(null);
    } else {
      setGameState('summary');
    }
  };

  if (gameState === 'selecting') {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex flex-col p-6 overflow-y-auto">
        <header className="mb-12 flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-card-soft rounded-full text-text-muted"><ChevronLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-text-main">Practice Modes</h1>
            <p className="text-xs font-black uppercase text-orange-500 tracking-widest">Select one or more to begin</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {gameOptions.map(opt => (
            <button
              key={opt.type}
              onClick={() => toggleType(opt.type)}
              className={cn(
                "p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group",
                selectedTypes.includes(opt.type) 
                  ? "bg-card-soft border-orange-500 ring-4 ring-orange-500/10" 
                  : "bg-card-bg border-app-border hover:border-orange-500/50"
              )}
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6", opt.color)}>
                <opt.icon size={24} />
              </div>
              <h3 className="text-xl font-black text-text-main mb-2">{opt.label}</h3>
              <p className="text-sm text-text-muted leading-relaxed">{opt.description}</p>
              
              {selectedTypes.includes(opt.type) && (
                <div className="absolute top-4 right-4 text-orange-500">
                  <CheckCircle2 size={24} />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-auto pt-12 max-w-2xl mx-auto w-full">
          <button
            disabled={selectedTypes.length === 0}
            onClick={startBatch}
            className="w-full bg-orange-500 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Start {selectedTypes.length} Sessions
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-8" />
        <h2 className="text-4xl font-black text-text-main mb-4 tracking-tight">Preparing Challenges...</h2>
        <p className="text-text-muted uppercase text-xs font-black tracking-[0.3em] animate-pulse">Curating your personalized practice session</p>
      </div>
    );
  }

  if (gameState === 'summary') {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-orange-500/10 rounded-[2rem] flex items-center justify-center text-orange-500 mb-8 mx-auto shadow-xl">
          <Trophy size={48} />
        </div>
        <h1 className="text-5xl font-black text-text-main mb-2 tracking-tight">Session Complete!</h1>
        <p className="text-xl text-text-muted mb-12">You successfully completed {score} out of {sessionExercises.length} challenges.</p>
        <button
          onClick={onClose}
          className="bg-accent text-white px-12 py-5 rounded-3xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
        >
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col">
      <header className="p-4 md:p-6 border-b border-app-border flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card-soft backdrop-blur-xl shrink-0 gap-4 relative z-20">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setGameState('selecting')}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card-soft hover:bg-card-bg rounded-2xl transition-all border border-app-border group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs md:text-sm font-bold hidden xs:inline">Exit Session</span>
          </button>
          <div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-text-main line-clamp-1">
              {activeExercise.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-text-muted font-black">
                Challenge {currentIdx + 1} of {sessionExercises.length}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
           {activeExercise.type === 'speed-choice' && !isSubmitted && (
             <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-2xl border border-red-500/20">
               <Timer size={16} />
               <span className="font-black text-sm tabular-nums">{activeExercise.data.timeLimit}s</span>
             </div>
           )}
           <div className="bg-card-bg px-4 py-2 rounded-2xl text-xs font-bold text-text-main border border-app-border">
             Streak: {streak}
           </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeExercise.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {/* Context Master Passage */}
              {activeExercise.type === 'context-master' && activeExercise.data.passage && (
                <div className="bg-card-soft p-8 rounded-3xl border border-app-border leading-relaxed text-lg text-text-main italic border-l-8 border-l-purple-500">
                  {activeExercise.data.passage}
                </div>
              )}

              <h2 className="text-3xl font-black text-text-main leading-tight tracking-tight">
                {activeExercise.question}
              </h2>

              {/* Mix and Match Rendering */}
              {activeExercise.type === 'mix-and-match' && activeExercise.data.pairs && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Simplification for demo: Multiple Choice of pairs */}
                  <p className="text-text-muted col-span-full">Select the correct translation for {activeExercise.data.pairs[0].term}:</p>
                  {activeExercise.data.pairs.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isSubmitted) return;
                        setSelectedOption(idx);
                        handleSubmit(idx === 0);
                      }}
                      className={cn(
                        "p-6 rounded-2xl border text-left transition-all",
                        isSubmitted && idx === 0 ? "bg-green-500/10 border-green-500 text-green-500" :
                        isSubmitted && selectedOption === idx ? "bg-red-500/10 border-red-500 text-red-500" :
                        "bg-card-bg border-app-border hover:border-orange-500/30"
                      )}
                    >
                      <span className="font-bold">{p.definition}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Speed Choice & Context Multiple Choice */}
              {(activeExercise.type === 'speed-choice' || activeExercise.type === 'context-master') && activeExercise.data.options && (
                <div className="grid grid-cols-1 gap-4">
                  {activeExercise.data.options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => {
                        setSelectedOption(idx);
                        handleSubmit(idx === activeExercise.data.correctAnswerIndex);
                      }}
                      className={cn(
                        "p-6 rounded-2xl border text-left transition-all flex justify-between items-center group",
                        isSubmitted ? (
                          idx === activeExercise.data.correctAnswerIndex ? "bg-green-500/10 border-green-500 text-green-500" :
                          selectedOption === idx ? "bg-red-500/10 border-red-500 text-red-500" : "opacity-50"
                        ) : (
                          selectedOption === idx ? "bg-orange-500/10 border-orange-500 text-orange-500" : "bg-card-bg border-app-border"
                        )
                      )}
                    >
                      <span className="text-lg font-bold">{opt}</span>
                      {isSubmitted && idx === activeExercise.data.correctAnswerIndex && <CheckCircle2 size={24} />}
                    </button>
                  ))}
                </div>
              )}

              {isSubmitted && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                  <div className="bg-card-soft p-8 rounded-3xl border border-app-border">
                    <p className="text-text-main">{activeExercise.data.explanation}</p>
                  </div>
                  <button
                    onClick={nextExercise}
                    className="w-full bg-orange-500 text-white py-6 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl"
                  >
                    {currentIdx < sessionExercises.length - 1 ? 'Next Challenge' : 'Complete Session'}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
