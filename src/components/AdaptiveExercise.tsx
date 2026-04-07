import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Sparkles, CheckCircle2, AlertCircle, Loader2, Trophy, Brain } from 'lucide-react';
import { Exercise, LanguageLevel, VocabularyWord, GrammarTip } from '../types';
import { ExerciseService } from '../services/ExerciseService';
import { PerformanceService } from '../services/PerformanceService';
import { ThemeService } from '../services/ThemeService';
import { cn } from '../lib/utils';

interface AdaptiveExerciseProps {
  level: LanguageLevel;
  language: string;
  vocabulary: VocabularyWord[];
  grammarTips: GrammarTip[];
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
}

export function AdaptiveExercise({ level, language, vocabulary, grammarTips, onClose, onProgressUpdate }: AdaptiveExerciseProps) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showSplatter, setShowSplatter] = useState(false);
  const theme = ThemeService.getTheme();

  useEffect(() => {
    loadNextExercise();
  }, []);

  const loadNextExercise = async () => {
    setIsLoading(true);
    setIsSubmitted(false);
    setSelectedOption(null);
    setShowSplatter(false);
    try {
      const next = await ExerciseService.generateAdaptiveExercise(level, vocabulary, grammarTips, language);
      setExercise(next);
    } catch (e) {
      console.error("Error loading exercise:", e);
    }
    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (selectedOption === null || !exercise) return;
    
    const isCorrect = selectedOption === exercise.correctAnswerIndex;
    setIsSubmitted(true);
    
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      onProgressUpdate(1);
      
      // Spray paint effect for Street Graphite on high streak
      if (theme === 'street-graphite' && newStreak >= 3) {
        setShowSplatter(true);
      }
    } else {
      setStreak(0);
      onProgressUpdate(0);
    }
    
    // Record performance
    if (exercise.relatedItemId !== 'generic') {
      PerformanceService.recordAttempt(exercise.relatedItemId, exercise.type, isCorrect);
    }
  };

  if (isLoading && !exercise) {
    return (
      <div className="fixed inset-0 z-50 bg-app-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-text-muted font-medium tracking-widest uppercase text-xs">Generating Adaptive Exercise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-app-bg overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-app-border flex items-center justify-between bg-card-bg/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-card-soft rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-text-main">Adaptive Practice</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Personalized for your level</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-card-soft px-4 py-2 rounded-2xl border border-app-border">
          <Trophy size={16} className="text-orange-500" />
          <span className="text-sm font-bold text-text-main">Streak: {streak}</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-2xl mx-auto space-y-12">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-64 flex flex-col items-center justify-center text-center"
              >
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-4" />
                <p className="text-text-muted text-sm font-medium uppercase tracking-widest">Preparing your next challenge...</p>
              </motion.div>
            ) : exercise && (
              <motion.div 
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                {/* Exercise Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Brain size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {exercise.type === 'vocabulary' ? 'Vocabulary' : 'Grammar'} Focus
                    </span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight leading-tight text-text-main">{exercise.question}</h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 gap-4">
                  {exercise.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect = exercise.correctAnswerIndex === idx;
                    const isWrong = isSubmitted && isSelected && !isCorrect;
                    const showCorrect = isSubmitted && isCorrect;

                    return (
                      <button
                        key={idx}
                        disabled={isSubmitted}
                        onClick={() => setSelectedOption(idx)}
                        className={cn(
                          "p-6 rounded-2xl border text-left transition-all flex items-center justify-between group relative overflow-hidden",
                          exercise.type === 'vocabulary' && "vocabulary-card",
                          isSubmitted ? (
                            showCorrect ? "bg-green-500/10 border-green-500/50 text-green-400" :
                            isWrong ? "bg-red-500/10 border-red-500/50 text-red-400" :
                            "bg-card-soft border-app-border text-text-muted"
                          ) : (
                            isSelected ? "bg-orange-500/10 border-orange-500 text-orange-500" :
                            "bg-card-bg border-app-border hover:border-accent/30 hover:bg-card-soft"
                          )
                        )}
                      >
                        <span className="text-lg font-bold relative z-10">{option}</span>
                        <div className="relative z-10">
                          {isSubmitted && showCorrect && <CheckCircle2 size={24} />}
                          {isSubmitted && isWrong && <AlertCircle size={24} />}
                        </div>
                        {showSplatter && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                            <div className="spray-splatter" style={{ left: Math.random() * 80 + '%', top: Math.random() * 80 + '%' }} />
                            <div className="spray-splatter" style={{ left: Math.random() * 80 + '%', top: Math.random() * 80 + '%' }} />
                          </div>
                        )}
                        {isSelected && !isSubmitted && (
                          <motion.div 
                            layoutId="active-bg"
                            className="absolute inset-0 bg-orange-500/5 pointer-events-none"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Next Button */}
                <div className="space-y-6">
                  {isSubmitted && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-card-bg/50 border border-app-border rounded-3xl p-8 space-y-4"
                    >
                      <div className="flex items-center gap-2 text-text-muted">
                        <Sparkles size={16} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explanation</span>
                      </div>
                      <p className="text-text-main leading-relaxed">{exercise.explanation}</p>
                    </motion.div>
                  )}

                  {!isSubmitted ? (
                    <button
                      disabled={selectedOption === null}
                      onClick={handleSubmit}
                      className="w-full bg-accent text-white font-black text-sm uppercase tracking-widest py-6 rounded-2xl hover:bg-accent-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                    >
                      Check Answer
                    </button>
                  ) : (
                    <button
                      onClick={loadNextExercise}
                      className="w-full bg-orange-500 text-white font-black text-sm uppercase tracking-widest py-6 rounded-2xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                    >
                      Next Exercise
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
