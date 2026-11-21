import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mic, ChevronRight, CheckCircle2, Award, Zap, RefreshCw, BarChart2, MessageSquare, TrendingUp } from 'lucide-react';
import { DailyTaskService, DailyTask, DailyTaskEvaluation } from '../services/DailyTaskService';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { cn } from '../lib/utils';

interface DailyTaskCardProps {
  languageCode: string;
  level: string;
  onStartTask: (task: DailyTask) => void;
  onViewFluency?: () => void;
  user?: any;
  onRequireLogin?: () => void;
}

export function DailyTaskCard({
  languageCode,
  level,
  onStartTask,
  onViewFluency,
  user,
  onRequireLogin
}: DailyTaskCardProps) {
  const [task, setTask] = useState<DailyTask>(() => 
    DailyTaskService.getTodayTask(languageCode, level)
  );
  const [evaluation, setEvaluation] = useState<DailyTaskEvaluation | null>(() => 
    DailyTaskService.getTodayEvaluation(languageCode)
  );
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const updatedTask = DailyTaskService.getTodayTask(languageCode, level);
    setTask(updatedTask);
    const updatedEval = DailyTaskService.getTodayEvaluation(languageCode);
    setEvaluation(updatedEval);
  }, [languageCode, level]);

  useEffect(() => {
    const handleCompleted = (e: any) => {
      const updatedEval = DailyTaskService.getTodayEvaluation(languageCode);
      setEvaluation(updatedEval);
    };

    const handleReset = () => {
      setEvaluation(null);
    };

    window.addEventListener('daily-task-completed', handleCompleted);
    window.addEventListener('daily-task-reset', handleReset);

    return () => {
      window.removeEventListener('daily-task-completed', handleCompleted);
      window.removeEventListener('daily-task-reset', handleReset);
    };
  }, [languageCode]);

  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === languageCode);

  const handleStart = () => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    onStartTask(task);
  };

  const handleReplay = () => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    onStartTask(task);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-3xl border border-app-border bg-card-bg text-text-main p-5 sm:p-7 shadow-subtle hover:shadow-app transition-all group"
    >
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      <AnimatePresence mode="wait">
        {!evaluation ? (
          /* ========================================================= */
          /* PENDING DAILY TASK STATE                                   */
          /* ========================================================= */
          <motion.div 
            key="pending-task"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
          >
            <div className="space-y-3.5 max-w-2xl text-left">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                  <Sparkles size={13} className="text-orange-500" />
                  Daily Challenge
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-card-soft text-text-muted border border-app-border px-3 py-1 rounded-full flex items-center gap-1">
                  ⏱️ 10 Mins Target
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-card-soft text-text-main border border-app-border">
                  {task.difficulty}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight leading-tight">
                "{task.title}"
              </h2>

              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-xl">
                {task.description}
              </p>

              <div className="pt-1 flex items-center gap-4 text-xs font-medium text-text-muted flex-wrap">
                <span className="flex items-center gap-1.5 font-bold bg-card-soft px-3.5 py-1.5 rounded-xl border border-app-border">
                  <Zap size={14} className="text-orange-500" />
                  <span>Goal: {task.goal}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end">
              <button
                onClick={handleStart}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 group/btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Mic size={14} />
                </div>
                <span>Start Today's Task</span>
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* ========================================================= */
          /* ========================================================= */
          /* COMPLETED DAILY TASK EVALUATION CARD STATE                 */
          /* ========================================================= */
          <motion.div 
            key="completed-task"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative z-10 space-y-5"
          >
            {/* Header Status Bar */}
            <div className="flex items-center justify-between gap-4 border-b border-black/8 dark:border-white/10 pb-4">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-text-muted">
                    DAILY TASK
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted font-medium flex-wrap">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Daily task: evaluated {new Date(evaluation.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span aria-hidden="true" className="opacity-40">·</span>
                  <span>Session: {evaluation.durationMinutes || 15}m target</span>
                </div>
              </div>

              {/* Circular Overall Score Indicator */}
              <div className="flex items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-2 rounded-2xl shrink-0">
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-emerald-500/20"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${Math.min(100, evaluation.overallScore || 0)}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-emerald-600 dark:text-emerald-400">
                    A
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-wider text-text-muted">OVERALL SCORE</p>
                  <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {evaluation.overallScore}%
                  </p>
                </div>
              </div>
            </div>

            {/* 4 Bento Metric Cards Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. Fluency */}
              <div className="p-3.5 bg-card-soft dark:bg-[#1C222E] rounded-2xl border border-black/6 dark:border-white/8 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <TrendingUp size={12} className="text-[#FF6B2B]" />
                  <span>FLUENCY</span>
                </div>
                <p className="text-xl font-black text-text-main tabular-nums">{evaluation.fluencyScore}%</p>
                <div className="w-full h-1.5 bg-black/8 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B2B] rounded-full transition-all duration-700" style={{ width: `${evaluation.fluencyScore}%` }} />
                </div>
              </div>

              {/* 2. Vocabulary */}
              <div className="p-3.5 bg-card-soft dark:bg-[#1C222E] rounded-2xl border border-black/6 dark:border-white/8 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <Zap size={12} className="text-rose-500" />
                  <span>VOCABULARY</span>
                </div>
                <p className="text-xl font-black text-text-main tabular-nums">{evaluation.vocabularyScore}%</p>
                <div className="w-full h-1.5 bg-black/8 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${evaluation.vocabularyScore}%` }} />
                </div>
              </div>

              {/* 3. Confidence */}
              <div className="p-3.5 bg-card-soft dark:bg-[#1C222E] rounded-2xl border border-black/6 dark:border-white/8 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <BarChart2 size={12} className="text-sky-500" />
                  <span>CONFIDENCE</span>
                </div>
                <p className="text-xl font-black text-text-main tabular-nums">{evaluation.confidenceScore}%</p>
                <div className="w-full h-1.5 bg-black/8 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full transition-all duration-700" style={{ width: `${evaluation.confidenceScore}%` }} />
                </div>
              </div>

              {/* 4. Grammar */}
              <div className="p-3.5 bg-card-soft dark:bg-[#1C222E] rounded-2xl border border-black/6 dark:border-white/8 text-left space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-text-muted">
                  <Sparkles size={12} className="text-purple-500" />
                  <span>GRAMMAR</span>
                </div>
                <p className="text-xl font-black text-text-main tabular-nums">{evaluation.grammarScore}%</p>
                <div className="w-full h-1.5 bg-black/8 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${evaluation.grammarScore}%` }} />
                </div>
              </div>
            </div>

            {/* AI Key Feedback Banner */}
            <div className="p-4 bg-card-soft dark:bg-[#1C222E] rounded-2xl border border-black/6 dark:border-white/8 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF6B2B]">
                <MessageSquare size={14} />
                <span>AI Performance Evaluation</span>
              </div>
              <p className="text-xs sm:text-sm text-text-main leading-relaxed font-normal">
                "{evaluation.keyTakeaway || "Great effort in today's scenario! Continue practicing for maximum fluency gains."}"
              </p>
              
              {evaluation.strengths && evaluation.strengths.length > 0 && (
                <div className="pt-1 flex flex-wrap gap-2">
                  {evaluation.strengths.map((str, idx) => (
                    <span key={idx} className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                      ✓ {str}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-1 flex-wrap">
              <button
                onClick={() => DailyTaskService.resetTodayTask(languageCode)}
                className="px-4 py-2.5 bg-card-soft hover:bg-card-bg text-text-muted hover:text-text-main font-bold text-xs rounded-xl border border-app-border flex items-center gap-2 transition-all cursor-pointer"
                title="Reset evaluation and retry scenario"
              >
                <RefreshCw size={13} />
                <span>Retry Task</span>
              </button>

              <div className="flex items-center gap-2.5">
                {onViewFluency && (
                  <button
                    onClick={onViewFluency}
                    className="px-5 py-2.5 bg-[#FF6B2B] hover:bg-[#E85B1C] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer hover:scale-105 active:scale-95"
                  >
                    <span>FULL FLUENCY MIRROR</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
