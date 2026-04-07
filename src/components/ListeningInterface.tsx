import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, CheckCircle2, Lock, Sparkles, Volume2, Info, ChevronRight, Trophy, AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { ListeningModule, LanguageLevel, ListeningQuestion, ExamType } from '../types';
import { ListeningService } from '../services/ListeningService';
import { FluencyService } from '../services/FluencyService';
import { cn } from '../lib/utils';
import { createWavHeader, base64ToUint8Array } from '../lib/audioUtils';

interface ListeningInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
}

const TOTAL_MODULES = 100;

export function ListeningInterface({ level, language, onClose, onProgressUpdate }: ListeningInterfaceProps) {
  const [examType, setExamType] = useState<ExamType>('Telc');
  const [modules, setModules] = useState<ListeningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ListeningModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showQuestions, setShowQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeGenerations, setActiveGenerations] = useState<number[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const generatingRef = useRef<Set<number>>(new Set());

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
      setGenError(e.message || 'Failed to generate module');
    } finally {
      generatingRef.current.delete(index);
    }
  };

  const handleSelectModule = (m: ListeningModule) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSelectedModule(m);
    setShowQuestions(false);
    setUserAnswers({});
    setIsSubmitted(m.isCompleted);
    setIsPlaying(false);
    setGenError(null);
    setCurrentTime(0);
    setDuration(0);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = async () => {
    if (!selectedModule) return;

    if (!audioRef.current) {
      setIsAudioLoading(true);
      setAudioError(null);
      try {
        const audioData = await ListeningService.getAudio(selectedModule.id);
        if (!audioData) {
          setAudioError('Audio not found for this module.');
          return;
        }

        const pcmBytes = base64ToUint8Array(audioData);
        const wavBytes = createWavHeader(pcmBytes, 24000);
        const blob = new Blob([wavBytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
        audio.onloadedmetadata = () => setDuration(audio.duration);
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          setAudioError('Failed to play audio. The format might be unsupported.');
          setIsPlaying(false);
        };
        
        audioRef.current = audio;
      } catch (err) {
        console.error('Audio loading error:', err);
        setAudioError('Failed to load audio.');
      } finally {
        setIsAudioLoading(false);
      }
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.error('Play error:', err);
          setAudioError('Playback failed. Please try again.');
          setIsPlaying(false);
        });
      }
      setIsPlaying(!isPlaying);
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

    // Update progress
    const maxScore = selectedModule.questions.length;
    const normalizedScore = maxScore > 0 ? score / maxScore : 0;
    onProgressUpdate(normalizedScore);

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
    if (selectedModule) {
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
      <header className="p-6 border-b border-app-border flex items-center justify-between bg-card-bg/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-card-soft rounded-full transition-colors text-text-muted hover:text-text-main"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight text-text-main">Hören Practice</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{level} Level</p>
              <span className="text-app-border">•</span>
              <div className="flex bg-card-soft rounded-lg p-0.5 border border-app-border">
                {(['Telc', 'Goethe'] as ExamType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setExamType(type);
                      setSelectedModule(null);
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all",
                      examType === type ? "bg-orange-500 text-white" : "text-text-muted hover:text-text-main"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all listening progress? This will lock all modules again.')) {
                localStorage.removeItem('deutschbuddy_listening_modules');
                loadModules();
              }
            }}
            className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-text-muted hover:text-red-500"
            title="Reset Progress"
          >
            <RotateCcw size={16} />
          </button>
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
                <button
                  key={i}
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
                  Choose a listening module from the list to start your practice. Each module is designed to simulate real German language examinations.
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

                {/* Module Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Module</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-none text-text-main">{selectedModule.title}</h2>
                  <p className="text-text-muted">Listen carefully to the audio and answer the questions that follow.</p>
                </div>

                {/* Audio Player Strip */}
                <div className="space-y-4">
                  <div className="bg-card-bg/60 border border-app-border rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                    
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={togglePlay}
                            disabled={isAudioLoading}
                            className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20",
                              isAudioLoading ? "bg-card-soft" : "bg-orange-500 hover:bg-orange-600"
                            )}
                          >
                            {isAudioLoading ? <Loader2 size={24} className="animate-spin" /> : 
                             isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                          </button>
                          
                          <div className="space-y-1">
                            <h4 className="font-black text-sm tracking-tight text-text-main">
                              {isAudioLoading ? "Loading Audio..." : isPlaying ? "Now Playing" : "Ready to Listen"}
                            </h4>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                              {selectedModule.title}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={handleReload}
                            disabled={isAudioLoading || !audioRef.current}
                            className="w-10 h-10 rounded-xl bg-card-soft flex items-center justify-center text-text-muted hover:bg-card-bg hover:text-text-main transition-all disabled:opacity-30"
                            title="Restart Audio"
                          >
                            <RotateCcw size={18} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div 
                          onClick={handleSeek}
                          className="h-2 w-full bg-card-soft rounded-full cursor-pointer relative group/progress overflow-hidden"
                        >
                          <motion.div 
                            className="absolute inset-y-0 left-0 bg-orange-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            transition={{ type: "spring", bounce: 0, duration: 0.1 }}
                          />
                          <div className="absolute inset-0 bg-transparent group-hover/progress:bg-card-soft transition-colors" />
                        </div>
                        
                        <div className="flex justify-between items-center text-[10px] font-black font-mono text-text-muted tracking-tighter">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
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

                {/* Test Section */}
                {!showQuestions && !isSubmitted ? (
                  <button
                    onClick={() => setShowQuestions(true)}
                    className="w-full bg-accent text-white font-black text-sm uppercase tracking-widest py-6 rounded-2xl hover:bg-accent-hover transition-all flex items-center justify-center gap-3 group"
                  >
                    Begin the Test
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
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

                    <div className="space-y-6">
                      {selectedModule.questions.map((q, qIdx) => (
                        <motion.div 
                          key={q.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: qIdx * 0.1 }}
                          className="bg-card-bg/40 border border-app-border rounded-[2rem] p-8 space-y-8 relative overflow-hidden group/question"
                        >
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/question:opacity-10 transition-opacity text-text-muted">
                            <Info size={80} />
                          </div>

                          <div className="flex items-start gap-6 relative z-10">
                            <span className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-sm font-black text-white shadow-lg shadow-orange-500/20 shrink-0">
                              {qIdx + 1}
                            </span>
                            <p className="text-xl font-bold leading-tight text-text-main pt-2">{q.question}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 relative z-10">
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
                                    "p-5 rounded-2xl border text-left transition-all flex items-center justify-between group/option",
                                    isSelected ? "bg-orange-500 border-orange-500 text-white" : "bg-card-soft border-app-border hover:bg-card-bg text-text-muted",
                                    showCorrect && "bg-green-500 border-green-500 text-white",
                                    isWrong && "bg-red-500 border-red-500 text-white",
                                    isSubmitted && !isSelected && !isCorrect && "opacity-50"
                                  )}
                                >
                                  <span className="font-bold">{option}</span>
                                  {isSelected && !isSubmitted && <div className="w-2 h-2 bg-white rounded-full" />}
                                  {showCorrect && <CheckCircle2 size={20} />}
                                  {isWrong && <AlertCircle size={20} />}
                                </button>
                              );
                            })}
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {!isSubmitted && (
                      <button
                        disabled={Object.keys(userAnswers).length < selectedModule.questions.length}
                        onClick={handleSubmit}
                        className="w-full bg-orange-500 text-white font-black text-sm uppercase tracking-widest py-6 rounded-2xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
                      >
                        Submit the Test
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
