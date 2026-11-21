import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Lock, 
  Unlock, 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Trash2, 
  X, 
  AlertCircle, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Timer,
  Zap, 
  BookOpen 
} from 'lucide-react';
import { LanguageLevel, AdaptiveAssessmentModule, AssessmentMode } from '../../types';
import { AdaptiveAssessmentService } from '../../services/AdaptiveAssessmentService';
import { AdaptiveSession } from './AdaptiveSession';
import { cn } from '../../lib/utils';
import { getLanguageConfig } from '../../config/languages';

interface AdaptiveAssessmentHubProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onRequireLogin?: () => void;
  user?: any;
}

export function AdaptiveAssessmentHub({ level, language, onClose, onRequireLogin, user }: AdaptiveAssessmentHubProps) {
  const selectedLevel = level;
  const [modules, setModules] = useState<AdaptiveAssessmentModule[]>([]);
  const [activeSessionModule, setActiveSessionModule] = useState<AdaptiveAssessmentModule | null>(null);

  // Unlocking & Generation state
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Modals
  const [selectedModuleToPlay, setSelectedModuleToPlay] = useState<AdaptiveAssessmentModule | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [activeQuotaModules, setActiveQuotaModules] = useState<AdaptiveAssessmentModule[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Sync modules from service
  const loadModules = () => {
    const list = AdaptiveAssessmentService.getModules(selectedLevel, language);
    setModules(list);
  };

  useEffect(() => {
    loadModules();
    const unsubscribe = AdaptiveAssessmentService.subscribe(() => {
      loadModules();
    });
    return unsubscribe;
  }, [selectedLevel, language]);

  const handleStartUnlockFlow = async (mod: AdaptiveAssessmentModule) => {
    if (!user && onRequireLogin) {
      onRequireLogin();
      return;
    }

    const check = AdaptiveAssessmentService.canUnlockModule(language);
    if (!check.can) {
      setActiveQuotaModules(check.activeModules);
      setShowQuotaModal(true);
      return;
    }

    // Immediately trigger on-demand generation without asking for mode upfront
    setGeneratingIndex(mod.index);
    setGenerationError(null);

    try {
      await AdaptiveAssessmentService.unlockAndGenerateModule(
        selectedLevel,
        language,
        mod.index
      );
      loadModules();
    } catch (err: any) {
      console.warn("[AdaptiveAssessmentHub] Generation notice:", err?.message || err);
      setGenerationError(err.message || "Failed to generate assessment. Please try again.");
    } finally {
      setGeneratingIndex(null);
    }
  };

  const handleOpenModule = (mod: AdaptiveAssessmentModule) => {
    if (!user && onRequireLogin) {
      onRequireLogin();
      return;
    }

    // Always allow user to choose or change mode when starting or reattempting midway
    setSelectedModuleToPlay(mod);
  };

  const handleSelectModeAndStart = (mode: AssessmentMode) => {
    if (!selectedModuleToPlay) return;
    const updated: AdaptiveAssessmentModule = {
      ...selectedModuleToPlay,
      mode
    };
    AdaptiveAssessmentService.updateModuleProgress(selectedLevel, language, updated);
    setSelectedModuleToPlay(null);
    loadModules();
    setActiveSessionModule(updated);
  };

  const handleDeleteModule = (modId: string) => {
    AdaptiveAssessmentService.deleteOrResetModule(language, selectedLevel, modId);
    setConfirmDeleteId(null);
    loadModules();
  };

  // If in active session, render AdaptiveSession arena
  if (activeSessionModule) {
    return (
      <AdaptiveSession
        module={activeSessionModule}
        language={language}
        onClose={() => {
          setActiveSessionModule(null);
          loadModules();
        }}
        onUpdateModule={(updated) => {
          AdaptiveAssessmentService.updateModuleProgress(selectedLevel, language, updated);
          setActiveSessionModule(updated);
          loadModules();
        }}
      />
    );
  }

  const langConfig = getLanguageConfig(language);

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="p-4 sm:p-6 border-b border-app-border bg-card-soft backdrop-blur-xl flex items-center justify-between gap-4 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-card-bg border border-app-border hover:bg-card-soft text-text-muted hover:text-text-main transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Back to Dashboard</span>
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
              <span>{langConfig.name} Grammar Assessment</span>
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                Level {level}
              </span>
            </h1>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
              100 Progressive Modules · CEFR {level} Curriculum
            </p>
          </div>
        </div>
      </header>

      {/* Generation Error Alert */}
      <AnimatePresence>
        {generationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-red-500 text-white text-xs font-bold flex items-center justify-between px-6 shrink-0"
          >
            <span>{generationError}</span>
            <button onClick={() => setGenerationError(null)} className="p-1 hover:bg-white/20 rounded">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 100 Modules Progression Grid */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto space-y-6 pb-24">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-text-main tracking-tight">
                {selectedLevel} Assessment Modules
              </h2>
              <p className="text-xs text-text-muted">
                Select an unlocked module to practice, or tap any locked module to generate on-demand.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((mod, idx) => {
              const isGenerating = generatingIndex === idx;
              const isUnlocked = mod.isUnlocked;
              const isCompleted = mod.isCompleted;

              return (
                <div
                  key={mod.id}
                  className={cn(
                    "p-5 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between group",
                    isCompleted
                      ? "bg-card-bg border-green-500/30 hover:border-green-500/60 shadow-subtle"
                      : isUnlocked
                        ? "bg-card-bg border-orange-500/40 hover:border-orange-500 shadow-md ring-1 ring-orange-500/20"
                        : "bg-card-soft/60 border-app-border opacity-75 hover:opacity-100 hover:border-app-border/80"
                  )}
                >
                  <div className="space-y-3">
                    {/* Top Row: Module # Badge & Status */}
                    <div className="flex items-center justify-between">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm",
                        isCompleted
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : isUnlocked
                            ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                            : "bg-card-soft text-text-muted border border-app-border"
                      )}>
                        {idx + 1}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isCompleted ? (
                          <div className="flex items-center gap-1 text-[11px] font-black uppercase text-green-500 bg-green-500/10 px-2 py-0.5 rounded-lg border border-green-500/20">
                            <CheckCircle2 size={13} />
                            <span>{mod.score}%</span>
                          </div>
                        ) : isUnlocked ? (
                          <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-lg border border-orange-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-text-muted">
                            <Lock size={12} />
                            Locked
                          </span>
                        )}

                        {/* Reset / Delete button if unlocked */}
                        {isUnlocked && (
                          <div className="relative">
                            {confirmDeleteId === mod.id ? (
                              <div className="flex items-center gap-1 bg-red-500 p-1 rounded-lg">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteModule(mod.id);
                                  }}
                                  className="text-[10px] font-black text-white px-1.5 uppercase hover:underline"
                                >
                                  Reset
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteId(null);
                                  }}
                                  className="text-white hover:opacity-75"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(mod.id);
                                }}
                                className="p-1 text-text-muted hover:text-red-500 transition-colors rounded-lg"
                                title="Reset module to free quota"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-black text-text-main line-clamp-1">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed line-clamp-2">
                        {isCompleted
                          ? "Assessment verified. All 20 challenges completed."
                          : isUnlocked
                            ? `In progress (${mod.questions?.length || 20} questions across 8 formats).`
                            : "Curriculum assessment. Tap to unlock and start challenge."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-5 mt-4 border-t border-app-border/40">
                    {isGenerating ? (
                      <div className="w-full py-3 rounded-2xl bg-orange-500/10 text-orange-500 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                        <Loader2 size={15} className="animate-spin" />
                        Generating 20 Challenges...
                      </div>
                    ) : isCompleted ? (
                      <button
                        onClick={() => setActiveSessionModule(mod)}
                        className="w-full py-3 rounded-2xl bg-card-soft hover:bg-card-bg text-text-main font-bold text-xs uppercase tracking-wider border border-app-border hover:border-green-500/40 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={15} className="text-green-500" />
                        Review Results
                      </button>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleOpenModule(mod)}
                        className="w-full py-3 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Play size={14} className="fill-white" />
                        {mod.mode ? "Resume Challenge" : "Start Challenge"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartUnlockFlow(mod)}
                        className="w-full py-3 rounded-2xl bg-card-soft hover:bg-orange-500 hover:text-white text-text-muted font-bold text-xs uppercase tracking-wider border border-app-border hover:border-orange-500 transition-all flex items-center justify-center gap-2 group-hover:text-text-main"
                      >
                        <Unlock size={14} />
                        Unlock Module
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Mode Selection Modal — shown when opening the exercise! */}
      <AnimatePresence>
        {selectedModuleToPlay && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setSelectedModuleToPlay(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-card-soft text-text-muted hover:text-text-main"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-2xl font-black text-text-main tracking-tight">
                  {(selectedModuleToPlay.currentQuestionIndex || 0) > 0 ? "Choose Mode to Resume" : "Choose Assessment Mode"}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  {(selectedModuleToPlay.currentQuestionIndex || 0) > 0 ? (
                    <span>
                      Resuming <strong className="text-text-main">{selectedModuleToPlay.title}</strong> at Question {(selectedModuleToPlay.currentQuestionIndex || 0) + 1}. You can continue or switch modes:
                    </span>
                  ) : (
                    <span>
                      Select how you would like to tackle <strong className="text-text-main">{selectedModuleToPlay.title}</strong>:
                    </span>
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Professional Mode */}
                <button
                  onClick={() => handleSelectModeAndStart('professional')}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all text-left space-y-3 group relative overflow-hidden",
                    selectedModuleToPlay.mode === 'professional'
                      ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20"
                      : "border-orange-500/30 bg-card-soft hover:border-orange-500 hover:bg-orange-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Timer size={20} />
                    </div>
                    {selectedModuleToPlay.mode === 'professional' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-500 text-white shadow-xs">
                        Previous Mode
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-text-main">Professional Mode</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Independent countdown timers (90s / 120s) with 5s grace period alert, exam discipline, and post-completion deep review.
                    </p>
                  </div>
                </button>

                {/* Casual Mode */}
                <button
                  onClick={() => handleSelectModeAndStart('casual')}
                  className={cn(
                    "p-5 rounded-2xl border-2 transition-all text-left space-y-3 group relative overflow-hidden",
                    selectedModuleToPlay.mode === 'casual'
                      ? "border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/20"
                      : "border-app-border bg-card-soft hover:border-orange-500 hover:bg-orange-500/5"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-card-bg text-text-muted group-hover:text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BookOpen size={20} />
                    </div>
                    {selectedModuleToPlay.mode === 'casual' && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-500 text-white shadow-xs">
                        Previous Mode
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-text-main">Casual Mode</h4>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Untimed relaxed pacing, instant answer feedback, and on-demand live Gemini AI Tutor doubt clearing drawer.
                    </p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quota Limit Reached Modal (4 Active Limit) */}
      <AnimatePresence>
        {showQuotaModal && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-card-bg border border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowQuotaModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-card-soft text-text-muted hover:text-text-main"
              >
                <X size={18} />
              </button>

              <div className="text-center space-y-2">
                <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto">
                  <AlertCircle size={28} />
                </div>
                <h3 className="text-2xl font-black text-text-main tracking-tight">Active Exercise Limit Reached</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  You currently have <strong className="text-red-500">4 active unfinished exercises</strong>. To maintain learning focus and optimize system resources, you must complete or discard an active module before unlocking a new one.
                </p>
              </div>

              {/* List of 4 active modules with Resume / Discard */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
                {activeQuotaModules.map((m) => (
                  <div key={m.id} className="p-3.5 bg-card-soft rounded-2xl border border-app-border flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">
                          {m.level}
                        </span>
                        <p className="text-xs font-black text-text-main line-clamp-1">{m.title}</p>
                      </div>
                      <p className="text-[10px] text-text-muted mt-0.5">Mode: {m.mode || 'Professional'}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setShowQuotaModal(false);
                          handleOpenModule(m);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-orange-500 text-white font-bold text-xs uppercase tracking-wider hover:scale-105 transition-all"
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => {
                          AdaptiveAssessmentService.deleteOrResetModule(language, m.level, m.id);
                          const updated = AdaptiveAssessmentService.getActiveUnfinishedModules(language);
                          setActiveQuotaModules(updated);
                          if (updated.length < 4) {
                            setShowQuotaModal(false);
                          }
                          loadModules();
                        }}
                        className="p-1.5 rounded-xl bg-card-bg text-text-muted hover:text-red-500 border border-app-border transition-colors"
                        title="Discard this module"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowQuotaModal(false)}
                  className="w-full py-3.5 rounded-2xl bg-card-soft text-text-main font-bold text-xs uppercase tracking-wider hover:bg-card-bg border border-app-border transition-colors"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
