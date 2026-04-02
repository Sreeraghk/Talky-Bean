import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ChevronLeft, CheckCircle2, Lock, Sparkles, Volume2, Info, ChevronRight, Trophy, AlertCircle, Loader2 } from 'lucide-react';
import { ListeningModule, LanguageLevel, ListeningQuestion } from '../types';
import { ListeningService } from '../services/ListeningService';
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
  const [modules, setModules] = useState<ListeningModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<ListeningModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    loadModules();
  }, [level]);

  const loadModules = async () => {
    setIsLoading(true);
    const m = await ListeningService.ensureInitialModules(level, language);
    setModules(m);
    setIsLoading(false);
  };

  const handleGenerate = async () => {
    const check = ListeningService.canGenerateMore(level);
    if (!check.can) {
      setGenError(check.reason || 'Cannot generate more modules');
      return;
    }

    setIsGenerating(true);
    setGenError(null);
    try {
      await ListeningService.generateNextBatch(level);
      const updated = ListeningService.getModules().filter(m => m.level === level);
      setModules(updated);
    } catch (e: any) {
      setGenError(e.message || 'Failed to generate modules');
    } finally {
      setIsGenerating(false);
    }
  };

  const audioRef = useRef<HTMLAudioElement | null>(null);

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
  };

  const togglePlay = async () => {
    if (!selectedModule) return;

    if (!audioRef.current) {
      const audioData = await ListeningService.getAudio(selectedModule.id);
      if (!audioData) return;

      // Gemini TTS returns raw PCM (24000Hz, 16-bit, mono).
      // We wrap it in a WAV header so standard <audio> elements can play it.
      const pcmBytes = base64ToUint8Array(audioData);
      const wavBytes = createWavHeader(pcmBytes, 24000);
      const blob = new Blob([wavBytes], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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

    const allModules = ListeningService.getModules();
    const updatedAllModules = allModules.map(m => m.id === updatedModule.id ? updatedModule : m);
    
    ListeningService.saveModules(updatedAllModules);
    const levelModules = updatedAllModules.filter(m => m.level === level);
    setModules(levelModules);
    setSelectedModule(updatedModule);
    setIsSubmitted(true);

    // Update progress
    const maxScore = selectedModule.questions.length;
    const normalizedScore = maxScore > 0 ? score / maxScore : 0;
    onProgressUpdate(normalizedScore);
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-zinc-400 font-medium tracking-widest uppercase text-xs">Preparing Listening Modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight">Hören Practice</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{level} Level Examination</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
          <Trophy size={16} className="text-orange-500" />
          <span className="text-sm font-bold">{modules.filter(m => m.isCompleted).length} / {TOTAL_MODULES}</span>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        {/* Module List */}
        <aside className={cn(
          "w-full md:w-80 border-r border-white/5 overflow-y-auto p-6 space-y-4 bg-zinc-900/20",
          selectedModule ? "hidden md:block" : "block"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Modules</h3>
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="p-2 bg-orange-500/10 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-all disabled:opacity-50"
              title="Generate next 5 modules"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            </button>
          </div>

          {genError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-500 font-bold mb-4 flex items-center gap-2">
              <AlertCircle size={12} />
              {genError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: TOTAL_MODULES }, (_, i) => {
              const module = modules[i];
              const isLocked = !module;
              const isSelected = selectedModule?.id === module?.id;

              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => module && handleSelectModule(module)}
                  className={cn(
                    "relative p-4 rounded-2xl border transition-all text-left group",
                    isLocked ? "bg-white/2 border-white/5 opacity-50 cursor-not-allowed" : 
                    isSelected ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20" :
                    "bg-white/5 border-white/5 hover:border-orange-500/30 hover:bg-white/10"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isSelected ? "text-white/80" : "text-zinc-500"
                    )}>Module {i + 1}</span>
                    {isLocked ? <Lock size={12} /> : 
                     module.isCompleted && <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-orange-500"} />}
                  </div>
                  <h4 className="font-bold truncate text-sm">
                    {isLocked ? "Locked" : module.title}
                  </h4>
                  {module?.isCompleted && (
                    <div className={cn("text-[10px] font-bold mt-2", isSelected ? "text-white/80" : "text-zinc-400")}>
                      Score: {module.score} / {module.questions.length}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-y-auto p-6 md:p-12",
          !selectedModule ? "hidden md:block" : "block"
        )}>
          <AnimatePresence mode="wait">
            {!selectedModule ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto"
              >
                <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mb-8">
                  <Volume2 size={40} />
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">Select a Module</h3>
                <p className="text-zinc-500 leading-relaxed">
                  Choose a listening module from the list to start your practice. Each module is designed to simulate real German language examinations.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedModule.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-12"
              >
                {/* Module Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-orange-500">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Active Module</span>
                  </div>
                  <h2 className="text-4xl font-black tracking-tight leading-none">{selectedModule.title}</h2>
                  <p className="text-zinc-500">Listen carefully to the audio and answer the questions that follow.</p>
                </div>

                {/* Audio Player */}
                <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent pointer-events-none" />
                  
                  <div className="relative">
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
                      isPlaying ? "bg-orange-500 shadow-2xl shadow-orange-500/40 scale-110" : "bg-white/10 hover:bg-white/20"
                    )}>
                      <button 
                        onClick={togglePlay}
                        className="w-full h-full flex items-center justify-center"
                      >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                      </button>
                    </div>
                    {isPlaying && (
                      <div className="absolute -inset-4 border-2 border-orange-500/30 rounded-full animate-ping pointer-events-none" />
                    )}
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
                      {isPlaying ? "Now Playing" : "Ready to Listen"}
                    </p>
                    <p className="text-sm text-zinc-400 italic">"Hören Sie gut zu..."</p>
                  </div>
                </div>

                {/* Test Section */}
                {!showQuestions && !isSubmitted ? (
                  <button
                    onClick={() => setShowQuestions(true)}
                    className="w-full bg-white text-black font-black text-sm uppercase tracking-widest py-6 rounded-2xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
                  >
                    Begin the Test
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black tracking-tight">Questions</h3>
                      {isSubmitted && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                          <Trophy size={16} className="text-orange-500" />
                          <span className="text-sm font-bold text-orange-500">Score: {selectedModule.score} / {selectedModule.questions.length}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      {selectedModule.questions.map((q, qIdx) => (
                        <div key={q.id} className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 space-y-6">
                          <div className="flex items-start gap-4">
                            <span className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-xs font-black text-zinc-500 shrink-0">
                              {qIdx + 1}
                            </span>
                            <p className="text-lg font-bold leading-tight">{q.question}</p>
                          </div>

                          <div className="grid grid-cols-1 gap-3 pl-12">
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
                                    "p-4 rounded-xl border text-left transition-all flex items-center justify-between group",
                                    isSubmitted ? (
                                      showCorrect ? "bg-green-500/10 border-green-500/50 text-green-400" :
                                      isWrong ? "bg-red-500/10 border-red-500/50 text-red-400" :
                                      "bg-white/2 border-white/5 text-zinc-600"
                                    ) : (
                                      isSelected ? "bg-orange-500/10 border-orange-500 text-orange-500" :
                                      "bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10"
                                    )
                                  )}
                                >
                                  <span className="text-sm font-medium">{option}</span>
                                  {isSubmitted && showCorrect && <CheckCircle2 size={16} />}
                                  {isSubmitted && isWrong && <AlertCircle size={16} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
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
