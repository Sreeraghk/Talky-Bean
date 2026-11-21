import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MessageCircle, 
  Send, 
  Loader2, 
  ArrowLeft,
  BookOpen,
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AdaptiveAssessmentModule, AssessmentQuestion } from '../../types';
import { AdaptiveAssessmentService } from '../../services/AdaptiveAssessmentService';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface AdaptiveReviewProps {
  module: AdaptiveAssessmentModule;
  onExit: () => void;
  onRetry: () => void;
  language: string;
}

export function AdaptiveReview({ module, onExit, onRetry, language }: AdaptiveReviewProps) {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [chatQuestion, setChatQuestion] = useState<AssessmentQuestion | null>(null);
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  React.useEffect(() => {
    // Fire celebratory confetti on high scores
    if ((module.score || 0) >= 70) {
      const end = Date.now() + 2000;
      const interval: any = setInterval(() => {
        if (Date.now() > end) return clearInterval(interval);
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 }
        });
      }, 300);
    }
  }, [module.score]);

  // Aggregate grammar category stats
  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {};
    module.questions.forEach(q => {
      const cat = q.grammarCategory || 'General Grammar';
      if (!stats[cat]) stats[cat] = { total: 0, correct: 0 };
      stats[cat].total += 1;
      if (q.isCorrect) stats[cat].correct += 1;
    });
    return Object.entries(stats).map(([category, data]) => ({
      category,
      accuracy: Math.round((data.correct / data.total) * 100),
      total: data.total,
      correct: data.correct
    }));
  }, [module.questions]);

  const correctCount = module.questions.filter(q => q.isCorrect).length;
  const totalCount = module.questions.length;
  const scorePercent = module.score !== undefined ? module.score : Math.round((correctCount / totalCount) * 100);

  const handleOpenChatForQuestion = (q: AssessmentQuestion) => {
    setChatQuestion(q);
    setChatMessages([
      {
        text: `Hello! I'm your Talky Bean AI Grammar Tutor. You're reviewing Question: "${q.prompt}". Ask me any doubt about this rule!`,
        sender: 'ai'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query || !chatQuestion || isChatLoading) return;

    setChatInput('');
    setChatMessages(prev => [...prev, { text: query, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const reply = await AdaptiveAssessmentService.clearDoubt(
        query,
        {
          questionIndex: module.questions.findIndex(q => q.id === chatQuestion.id),
          totalQuestions: totalCount,
          level: module.level,
          moduleTitle: module.title,
          format: chatQuestion.format,
          prompt: chatQuestion.prompt,
          context: chatQuestion.context,
          englishReference: chatQuestion.englishReference,
          options: chatQuestion.options,
          correctAnswer: chatQuestion.correctAnswer,
          userAnswer: chatQuestion.userAnswer,
          explanation: chatQuestion.explanation,
          grammarCategory: chatQuestion.grammarCategory,
          grammarRuleRef: chatQuestion.grammarRuleRef
        },
        language
      );
      setChatMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { text: "Unable to retrieve response. Please try again.", sender: 'ai' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-app-bg overflow-y-auto flex flex-col p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto w-full space-y-8 pb-24">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card-soft border border-app-border text-text-muted hover:text-text-main transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Assessment Hub</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={16} />
            CEFR Level {module.level}
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden text-center space-y-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center text-orange-500 mx-auto shadow-inner">
            <Trophy size={40} />
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-main tracking-tight">Assessment Completed!</h1>
            <p className="text-text-muted text-sm sm:text-base mt-2 max-w-md mx-auto">
              You finished {module.title} in <span className="font-bold text-text-main capitalize">{module.mode || 'Professional'} Mode</span>.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-2">
            <div className="bg-card-soft p-4 rounded-2xl border border-app-border">
              <p className="text-xs font-bold uppercase text-text-muted tracking-wider">Score</p>
              <p className="text-2xl sm:text-3xl font-black text-orange-500 mt-1 tabular-nums">{scorePercent}%</p>
            </div>
            <div className="bg-card-soft p-4 rounded-2xl border border-app-border">
              <p className="text-xs font-bold uppercase text-text-muted tracking-wider">Accuracy</p>
              <p className="text-2xl sm:text-3xl font-black text-text-main mt-1 tabular-nums">{correctCount}/{totalCount}</p>
            </div>
            <div className="bg-card-soft p-4 rounded-2xl border border-app-border">
              <p className="text-xs font-bold uppercase text-text-muted tracking-wider">Formats Tested</p>
              <p className="text-2xl sm:text-3xl font-black text-text-main mt-1 tabular-nums">8 Formats</p>
            </div>
            <div className="bg-card-soft p-4 rounded-2xl border border-app-border">
              <p className="text-xs font-bold uppercase text-text-muted tracking-wider">CEFR Standard</p>
              <p className="text-2xl sm:text-3xl font-black text-green-500 mt-1">
                {scorePercent >= 80 ? 'Mastered' : scorePercent >= 60 ? 'Proficient' : 'Reinforce'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              onClick={onRetry}
              className="px-6 py-3.5 rounded-2xl bg-card-soft border border-app-border text-text-main font-bold text-xs uppercase tracking-widest hover:border-orange-500/40 transition-all flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Retake Assessment
            </button>
            <button
              onClick={onExit}
              className="px-8 py-3.5 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              Continue to Hub
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Syllabus Category Breakdown */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <BookOpen size={20} className="text-orange-500" />
            <h3 className="text-lg font-black text-text-main tracking-tight">Grammar Topics Tested</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {categoryStats.map(stat => (
              <div key={stat.category} className="bg-card-soft p-4 rounded-2xl border border-app-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-main line-clamp-1">{stat.category}</p>
                  <p className="text-xs text-text-muted mt-0.5">{stat.correct} of {stat.total} answered correctly</p>
                </div>
                <span className={cn(
                  "text-sm font-black px-2.5 py-1 rounded-xl tabular-nums",
                  stat.accuracy >= 80 ? "bg-green-500/10 text-green-500" :
                  stat.accuracy >= 50 ? "bg-orange-500/10 text-orange-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  {stat.accuracy}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Question-by-Question Deep Review */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-text-main tracking-tight">Detailed Question Review</h3>
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{totalCount} Questions</span>
          </div>

          <div className="space-y-3">
            {module.questions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              return (
                <div 
                  key={q.id}
                  className={cn(
                    "bg-card-bg border rounded-2xl transition-all overflow-hidden",
                    q.isCorrect ? "border-green-500/20" : "border-red-500/20"
                  )}
                >
                  <div 
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-card-soft/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-black text-xs",
                        q.isCorrect ? "bg-green-500" : "bg-red-500"
                      )}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-card-soft text-text-muted border border-app-border">
                            {q.format.replace('format-', 'F').toUpperCase()}
                          </span>
                          <span className="text-xs font-bold text-text-muted">{q.grammarCategory}</span>
                        </div>
                        <p className="text-sm font-bold text-text-main mt-1 line-clamp-1">{q.prompt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {q.isCorrect ? (
                        <CheckCircle2 size={20} className="text-green-500" />
                      ) : (
                        <XCircle size={20} className="text-red-500" />
                      )}
                      {isExpanded ? <ChevronUp size={18} className="text-text-muted" /> : <ChevronDown size={18} className="text-text-muted" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-app-border space-y-4 text-xs sm:text-sm bg-card-soft/30"
                      >
                        {/* Context & English Reference if applicable */}
                        {q.englishReference && (
                          <div className="p-3.5 bg-orange-500/5 rounded-xl border border-orange-500/20">
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider block mb-1">English Reference</span>
                            <p className="text-text-main font-semibold">{q.englishReference}</p>
                          </div>
                        )}

                        {q.context && (
                          <div className="p-3 bg-card-soft rounded-xl border border-app-border text-text-main">
                            <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block mb-1">Context</span>
                            <p className="italic">{q.context}</p>
                          </div>
                        )}

                        {/* Answers comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-card-bg border border-app-border">
                            <span className="text-[10px] font-black uppercase text-text-muted tracking-wider block mb-1">Your Answer</span>
                            <p className={cn("font-bold", q.isCorrect ? "text-green-500" : "text-red-500")}>
                              {typeof q.userAnswer === 'object' ? JSON.stringify(q.userAnswer) : String(q.userAnswer || '(Empty)')}
                            </p>
                          </div>
                          <div className="p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                            <span className="text-[10px] font-black uppercase text-green-500 tracking-wider block mb-1">Correct Answer</span>
                            <p className="font-bold text-green-600 dark:text-green-400">
                              {typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : String(q.correctAnswer)}
                            </p>
                          </div>
                        </div>

                        {/* Official Explanation */}
                        <div className="p-3.5 bg-card-bg rounded-xl border border-app-border text-text-muted leading-relaxed">
                          <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider block mb-1">Grammar Rule & Explanation</span>
                          <p>{q.explanation}</p>
                        </div>

                        {/* Ask AI Button */}
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleOpenChatForQuestion(q)}
                            className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
                          >
                            <Sparkles size={14} />
                            Ask AI Tutor About This Question
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Gemini AI Doubt Drawer Modal */}
      <AnimatePresence>
        {chatQuestion && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="w-full max-w-2xl bg-card-bg border border-app-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-[600px]"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-app-border flex items-center justify-between bg-card-soft">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-text-main">AI Grammar Tutor</h4>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider line-clamp-1">
                      {chatQuestion.grammarCategory}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setChatQuestion(null)}
                  className="px-3 py-1.5 rounded-xl bg-card-bg text-text-muted hover:text-text-main text-xs font-bold border border-app-border transition-colors"
                >
                  Close
                </button>
              </div>

              {/* Chat Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed",
                      msg.sender === 'user'
                        ? "ml-auto bg-orange-500 text-white rounded-br-sm"
                        : "mr-auto bg-card-soft border border-app-border text-text-main rounded-bl-sm"
                    )}
                  >
                    {msg.text}
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex items-center gap-2 p-3 bg-card-soft rounded-2xl w-fit text-text-muted text-xs">
                    <Loader2 size={14} className="animate-spin text-orange-500" />
                    <span>Analyzing grammar rule...</span>
                  </div>
                )}
              </div>

              {/* Pre-suggested quick pills */}
              <div className="p-2 border-t border-app-border/40 flex items-center gap-2 overflow-x-auto no-scrollbar bg-card-soft/40 px-4">
                {[
                  "Why is this answer correct?",
                  "Explain this case ending rule",
                  "Give me another example"
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="whitespace-nowrap px-3 py-1 rounded-lg bg-card-bg border border-app-border text-[11px] font-bold text-text-muted hover:text-orange-500 transition-colors shrink-0"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-3 sm:p-4 border-t border-app-border flex items-center gap-2 bg-card-bg"
              >
                <input
                  type="text"
                  placeholder="Ask a question about this grammar rule..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-card-soft border border-app-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-orange-500/50"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="p-2.5 rounded-xl bg-orange-500 text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={16} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
