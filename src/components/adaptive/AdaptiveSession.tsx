import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Clock, 
  Timer, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  MessageCircle, 
  Send, 
  Loader2, 
  ChevronRight, 
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  Check,
  Minus
} from 'lucide-react';
import { AdaptiveAssessmentModule, AssessmentQuestion } from '../../types';
import { AdaptiveAssessmentService } from '../../services/AdaptiveAssessmentService';
import { AdaptiveReview } from './AdaptiveReview';
import { cn } from '../../lib/utils';

interface AdaptiveSessionProps {
  module: AdaptiveAssessmentModule;
  language: string;
  onClose: () => void;
  onUpdateModule: (updated: AdaptiveAssessmentModule) => void;
}

export function AdaptiveSession({ module: initialModule, language, onClose, onUpdateModule }: AdaptiveSessionProps) {
  const [currentModule, setCurrentModule] = useState<AdaptiveAssessmentModule>(initialModule);
  const [currentIdx, setCurrentIdx] = useState<number>(initialModule.currentQuestionIndex || 0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSummary, setShowSummary] = useState(initialModule.isCompleted);

  // Sync when initialModule changes (e.g. user selected different mode from Hub)
  useEffect(() => {
    setCurrentModule(initialModule);
    setCurrentIdx(initialModule.currentQuestionIndex || 0);
    setShowSummary(!!initialModule.isCompleted);
  }, [initialModule.id, initialModule.mode]);

  // Active question
  const currentQuestion = currentModule.questions[currentIdx] || currentModule.questions[0];

  // User input states for different formats
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [textInput, setTextInput] = useState('');
  const [wordOrderItems, setWordOrderItems] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [correctionInput, setCorrectionInput] = useState('');
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>('');

  // Submission & evaluation states
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState<string | null>(null);

  // Professional mode timers
  const isProfessional = currentModule.mode === 'professional';
  const [timeLeft, setTimeLeft] = useState<number>(currentQuestion?.timeLimitSeconds || 90);
  const [gracePeriodLeft, setGracePeriodLeft] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const graceRef = useRef<NodeJS.Timeout | null>(null);

  // Gemini Chat Tutor Drawer (can be minimized, not closed completely)
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Sync state whenever question changes
  useEffect(() => {
    if (!currentQuestion) return;

    // Reset input states
    setSelectedOption(currentQuestion.userAnswer ?? null);
    setTextInput(typeof currentQuestion.userAnswer === 'string' ? currentQuestion.userAnswer : '');
    setSelectedSegmentId(null);
    setCorrectionInput('');
    setFillBlankAnswer(typeof currentQuestion.userAnswer === 'string' ? currentQuestion.userAnswer : '');
    setIsSubmitted(!!currentQuestion.isSubmitted);
    setEvaluationFeedback(null);

    // Format 5 word-order initialization
    if (currentQuestion.format === 'format-5-word-order') {
      const words = Array.isArray(currentQuestion.wordBank) && currentQuestion.wordBank.length > 0
        ? [...currentQuestion.wordBank]
        : typeof currentQuestion.correctAnswer === 'string'
          ? currentQuestion.correctAnswer.split(' ').sort(() => Math.random() - 0.5)
          : [];
      
      if (Array.isArray(currentQuestion.userAnswer) && currentQuestion.userAnswer.length > 0) {
        setWordOrderItems(currentQuestion.userAnswer);
        setAvailableWords(words.filter(w => !currentQuestion.userAnswer.includes(w)));
      } else {
        setWordOrderItems([]);
        setAvailableWords(words);
      }
    }

    // Professional timer initialization
    if (isProfessional && !currentQuestion.isSubmitted) {
      const limit = currentQuestion.timeLimitSeconds || 90;
      setTimeLeft(limit);
      setGracePeriodLeft(null);
    }
  }, [currentIdx, currentQuestion?.id, isProfessional]);

  // Question countdown timer for Professional Mode
  useEffect(() => {
    if (!isProfessional || isSubmitted || showSummary || gracePeriodLeft !== null) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Trigger 5-second grace period prompt
          setGracePeriodLeft(5);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isProfessional, isSubmitted, showSummary, gracePeriodLeft, currentIdx]);

  // Grace Period countdown (5 seconds before auto-advance)
  useEffect(() => {
    if (gracePeriodLeft === null) {
      if (graceRef.current) clearInterval(graceRef.current);
      return;
    }

    graceRef.current = setInterval(() => {
      setGracePeriodLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(graceRef.current!);
          handleAutoSubmitAndAdvance();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (graceRef.current) clearInterval(graceRef.current);
    };
  }, [gracePeriodLeft]);

  // Auto-submit and advance when timer and grace period expire
  const handleAutoSubmitAndAdvance = () => {
    if (isSubmitted) return;
    submitCurrentQuestion(true);
  };

  // Compile current answer based on format
  const getCurrentUserAnswer = () => {
    if (!currentQuestion) return null;
    switch (currentQuestion.format) {
      case 'format-1-mcq':
      case 'format-6-conversation-completion':
      case 'format-7-correct-sentence':
        return selectedOption;
      case 'format-2-fill-blanks':
        return fillBlankAnswer.trim();
      case 'format-3-error-correction':
        return { segmentId: selectedSegmentId, correction: correctionInput.trim() };
      case 'format-4-sentence-transformation':
      case 'format-8-short-writing':
        return textInput.trim();
      case 'format-5-word-order':
        return wordOrderItems;
      default:
        return textInput.trim();
    }
  };

  const isCurrentAnswerEmpty = () => {
    const ans = getCurrentUserAnswer();
    if (ans === null || ans === undefined || ans === '') return true;
    if (Array.isArray(ans) && ans.length === 0) return true;
    if (typeof ans === 'object' && !ans.segmentId && !ans.correction) return true;
    return false;
  };

  const submitCurrentQuestion = async (isAutoAdvance = false) => {
    if (isSubmitted || !currentQuestion) return;

    setIsEvaluating(true);
    const userAnswer = getCurrentUserAnswer();
    let isCorrect = false;
    let score = 0;
    let feedback = '';

    // Format evaluation logic
    if (currentQuestion.format === 'format-1-mcq' || 
        currentQuestion.format === 'format-6-conversation-completion' || 
        currentQuestion.format === 'format-7-correct-sentence') {
      isCorrect = String(userAnswer).trim().toLowerCase() === String(currentQuestion.correctAnswer).trim().toLowerCase();
      score = isCorrect ? 1 : 0;
    } else if (currentQuestion.format === 'format-2-fill-blanks') {
      const correct = String(currentQuestion.correctAnswer).trim().toLowerCase();
      isCorrect = String(userAnswer).trim().toLowerCase() === correct;
      score = isCorrect ? 1 : 0;
    } else if (currentQuestion.format === 'format-3-error-correction') {
      const errPart = currentQuestion.underlinedParts?.find(p => p.isError);
      const isSegmentMatch = selectedSegmentId === errPart?.id;
      const isFixMatch = correctionInput.trim().toLowerCase().includes((errPart?.correction || '').toLowerCase().trim());
      isCorrect = isSegmentMatch && (isFixMatch || !errPart?.correction);
      score = isCorrect ? 1 : isSegmentMatch ? 0.5 : 0;
    } else if (currentQuestion.format === 'format-4-sentence-transformation') {
      const correct = String(currentQuestion.correctAnswer).trim().toLowerCase();
      isCorrect = String(userAnswer).trim().toLowerCase() === correct;
      score = isCorrect ? 1 : 0;
    } else if (currentQuestion.format === 'format-5-word-order') {
      const constructed = wordOrderItems.join(' ').trim().toLowerCase();
      const target = String(currentQuestion.correctAnswer).trim().toLowerCase();
      isCorrect = constructed === target;
      score = isCorrect ? 1 : 0;
    } else if (currentQuestion.format === 'format-8-short-writing') {
      const evalResult = await AdaptiveAssessmentService.evaluateShortWriting(currentQuestion, String(userAnswer), language);
      isCorrect = evalResult.isCorrect;
      score = evalResult.score / 100;
      feedback = evalResult.feedback;
      setEvaluationFeedback(feedback);
    }

    const updatedQuestions = [...currentModule.questions];
    updatedQuestions[currentIdx] = {
      ...currentQuestion,
      userAnswer,
      isSubmitted: true,
      isCorrect,
      score,
      timeSpentSeconds: (currentQuestion.timeLimitSeconds || 90) - timeLeft
    };

    const isLastQuestion = currentIdx >= currentModule.questions.length - 1;
    const allCompleted = isLastQuestion;
    const finalScore = allCompleted 
      ? Math.round((updatedQuestions.filter(q => q.isCorrect).length / updatedQuestions.length) * 100)
      : undefined;

    const updatedModule: AdaptiveAssessmentModule = {
      ...currentModule,
      questions: updatedQuestions,
      currentQuestionIndex: isLastQuestion ? currentIdx : currentIdx + 1,
      isCompleted: allCompleted,
      score: finalScore,
      completedAt: allCompleted ? Date.now() : undefined
    };

    setCurrentModule(updatedModule);
    onUpdateModule(updatedModule);
    setIsSubmitted(true);
    setIsEvaluating(false);

    // If auto-advance was triggered from timer expiry, proceed after brief pause
    if (isAutoAdvance) {
      setTimeout(() => {
        handleNextQuestion();
      }, 1200);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < currentModule.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setIsSubmitted(false);
      setEvaluationFeedback(null);
      setGracePeriodLeft(null);
    } else {
      setShowSummary(true);
    }
  };

  // Word Order builders for Format 5
  const handleAddWordToOrder = (word: string, index: number) => {
    if (isSubmitted) return;
    setWordOrderItems(prev => [...prev, word]);
    setAvailableWords(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveWordFromOrder = (word: string, index: number) => {
    if (isSubmitted) return;
    setWordOrderItems(prev => prev.filter((_, i) => i !== index));
    setAvailableWords(prev => [...prev, word]);
  };

  // Chat Doubt Drawer (Casual Mode)
  const handleSendChatMessage = async (textToSend?: string) => {
    const query = (textToSend || chatInput).trim();
    if (!query || isChatLoading) return;

    setChatInput('');
    setChatMessages(prev => [...prev, { text: query, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const reply = await AdaptiveAssessmentService.clearDoubt(
        query,
        {
          questionIndex: currentIdx,
          totalQuestions: currentModule.questions.length,
          level: currentModule.level,
          moduleTitle: currentModule.title,
          format: currentQuestion.format,
          prompt: currentQuestion.prompt,
          context: currentQuestion.context,
          englishReference: currentQuestion.englishReference,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          userAnswer: getCurrentUserAnswer(),
          explanation: currentQuestion.explanation,
          grammarCategory: currentQuestion.grammarCategory,
          grammarRuleRef: currentQuestion.grammarRuleRef
        },
        language
      );
      setChatMessages(prev => [...prev, { text: reply, sender: 'ai' }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { text: "Connection error. Please try again.", sender: 'ai' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (showSummary) {
    return (
      <AdaptiveReview
        module={currentModule}
        onExit={onClose}
        onRetry={() => {
          // Reset module and restart
          AdaptiveAssessmentService.deleteOrResetModule(language, currentModule.level, currentModule.id);
          AdaptiveAssessmentService.unlockAndGenerateModule(currentModule.level, language, currentModule.index, currentModule.mode || 'professional').then(m => {
            setCurrentModule(m);
            setCurrentIdx(0);
            setShowSummary(false);
          });
        }}
        language={language}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-app-bg flex flex-col overflow-hidden">
      {/* Header Bar */}
      <header className="p-4 sm:p-5 border-b border-app-border bg-card-soft backdrop-blur-xl flex items-center justify-between shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isProfessional && !isSubmitted) {
                setShowExitConfirm(true);
              } else {
                onClose();
              }
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card-bg border border-app-border hover:bg-card-soft text-text-muted hover:text-text-main transition-colors group"
          >
            <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-bold hidden sm:inline">Exit Session</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
                {currentModule.level}
              </span>
              <h2 className="text-sm sm:text-base font-black text-text-main line-clamp-1">
                {currentModule.title}
              </h2>
            </div>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
              Question {currentIdx + 1} of {currentModule.questions.length}
            </p>
          </div>
        </div>

        {/* Timers & Mode Pill */}
        <div className="flex items-center gap-2.5">
          {isProfessional && (
            <div className={cn(
              "flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black tabular-nums transition-colors shadow-sm",
              timeLeft <= 15 ? "bg-red-500/15 border-red-500/40 text-red-500 animate-pulse ring-2 ring-red-500/20" : "bg-orange-500/10 border-orange-500/30 text-orange-500"
            )}>
              <Timer size={16} className={timeLeft <= 15 ? "text-red-500 animate-spin" : "text-orange-500"} />
              <span>{timeLeft}s</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card-bg border border-app-border text-[11px] font-bold text-text-muted">
            <span className="capitalize">{currentModule.mode || 'Casual'}</span>
          </div>
        </div>
      </header>

      {/* Professional Mode Timer Visual Bar */}
      {isProfessional && !isSubmitted && (
        <div className="w-full bg-card-soft h-1.5 overflow-hidden shrink-0 border-b border-app-border/40">
          <motion.div
            className={cn(
              "h-full transition-all duration-1000",
              timeLeft <= 15 ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-amber-500"
            )}
            style={{
              width: `${Math.max(0, Math.min(100, (timeLeft / (currentQuestion.timeLimitSeconds || 90)) * 100))}%`
            }}
          />
        </div>
      )}

      {/* 5-Second Grace Period Alert Toast */}
      <AnimatePresence>
        {gracePeriodLeft !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
          >
            <div className="bg-red-500 text-white p-4 rounded-2xl shadow-2xl border border-red-400 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <AlertCircle size={20} className="animate-spin" />
                  <p className="text-xs sm:text-sm font-black">
                    Time Expired! Auto-advancing in <span className="underline font-mono">{gracePeriodLeft}s</span>
                  </p>
                </div>
                <button
                  onClick={() => submitCurrentQuestion(true)}
                  className="px-3 py-1 rounded-xl bg-white text-red-600 font-black text-xs uppercase tracking-wider hover:bg-white/90 transition-colors shadow-sm"
                >
                  Submit Now
                </button>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  className="bg-white h-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Exercise Arena */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 flex flex-col justify-between max-w-3xl mx-auto w-full">
        <div className="space-y-6">

          {/* Primary Prompt */}
          <h2 className="text-xl sm:text-2xl font-black text-text-main leading-snug tracking-tight">
            {currentQuestion.prompt}
          </h2>

          {/* Context box if available */}
          {currentQuestion.context && currentQuestion.format !== 'format-5-word-order' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-card-soft border border-app-border text-text-main text-sm sm:text-base leading-relaxed italic border-l-4 border-l-orange-500">
              {currentQuestion.context}
            </div>
          )}

          {/* FORMAT 1, 6, 7: Multiple Choice Options */}
          {(currentQuestion.format === 'format-1-mcq' || 
            currentQuestion.format === 'format-6-conversation-completion' || 
            currentQuestion.format === 'format-7-correct-sentence') && (
            <div className="space-y-4">
              {/* If Format 6, display dialogue bubbles */}
              {currentQuestion.format === 'format-6-conversation-completion' && currentQuestion.dialogue && (
                <div className="space-y-3 p-4 bg-card-soft rounded-2xl border border-app-border">
                  {currentQuestion.dialogue.map((turn, i) => (
                    <div key={i} className={cn("p-3 rounded-xl text-sm", turn.isMissing ? "bg-orange-500/10 border border-dashed border-orange-500/40 text-orange-500 font-bold" : "bg-card-bg border border-app-border text-text-main")}>
                      <span className="text-[10px] uppercase font-black tracking-wider block text-text-muted mb-0.5">{turn.speaker}</span>
                      {turn.isMissing ? (selectedOption || "[Select the best response below]") : turn.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options?.map((opt, idx) => {
                  const isSelected = selectedOption === opt;
                  const isCorrectAnswer = opt === currentQuestion.correctAnswer;
                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => setSelectedOption(opt)}
                      className={cn(
                        "p-4 sm:p-5 rounded-2xl border text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between group",
                        isSubmitted
                          ? isCorrectAnswer
                            ? "bg-green-500/10 border-green-500 text-green-500"
                            : isSelected
                              ? "bg-red-500/10 border-red-500 text-red-500"
                              : "bg-card-bg border-app-border opacity-50"
                          : isSelected
                            ? "bg-orange-500/10 border-orange-500 text-orange-500 ring-2 ring-orange-500/20"
                            : "bg-card-bg border-app-border hover:border-orange-500/40 text-text-main"
                      )}
                    >
                      <span>{opt}</span>
                      {isSubmitted && isCorrectAnswer && <CheckCircle2 size={20} className="text-green-500 shrink-0" />}
                      {isSubmitted && isSelected && !isCorrectAnswer && <XCircle size={20} className="text-red-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FORMAT 2: Fill in the Blanks */}
          {currentQuestion.format === 'format-2-fill-blanks' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-6 bg-card-soft rounded-2xl border border-app-border text-base sm:text-lg text-text-main leading-loose">
                {currentQuestion.context?.split('[blank]').map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <span>{part}</span>
                    {i < arr.length - 1 && (
                      <span className={cn(
                        "inline-block min-w-[120px] px-3 py-1 mx-1.5 rounded-xl border text-center font-bold text-sm transition-all",
                        fillBlankAnswer
                          ? "bg-orange-500/10 border-orange-500 text-orange-500"
                          : "bg-card-bg border-dashed border-app-border text-text-muted"
                      )}>
                        {fillBlankAnswer || "_______"}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Word Bank Choices */}
              {currentQuestion.wordBank && currentQuestion.wordBank.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Select from Word Bank:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.wordBank.map((word, idx) => (
                      <button
                        key={idx}
                        disabled={isSubmitted}
                        onClick={() => setFillBlankAnswer(word)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl border font-bold text-sm transition-all",
                          fillBlankAnswer === word
                            ? "bg-orange-500 text-white border-orange-500 shadow-md"
                            : "bg-card-bg border-app-border text-text-main hover:border-orange-500/40"
                        )}
                      >
                        {word}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FORMAT 3: Error Identification & Correction */}
          {currentQuestion.format === 'format-3-error-correction' && (
            <div className="space-y-6">
              <div className="p-4 sm:p-6 bg-card-soft rounded-2xl border border-app-border">
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-4">
                  Step 1: Click the underlined segment containing the grammar error:
                </p>
                <div className="flex flex-wrap gap-2 text-base sm:text-lg">
                  {currentQuestion.underlinedParts?.map(part => {
                    const isSelected = selectedSegmentId === part.id;
                    return (
                      <button
                        key={part.id}
                        disabled={isSubmitted}
                        onClick={() => setSelectedSegmentId(part.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border-b-2 font-bold transition-all text-left",
                          isSelected
                            ? "bg-orange-500/10 border-orange-500 text-orange-500"
                            : "bg-card-bg border-app-border text-text-main hover:border-orange-500/50"
                        )}
                      >
                        {part.text}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSegmentId && (
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">
                    Step 2: Provide the corrected phrase:
                  </p>
                  <input
                    type="text"
                    disabled={isSubmitted}
                    placeholder="Enter the correct grammatical form..."
                    value={correctionInput}
                    onChange={(e) => setCorrectionInput(e.target.value)}
                    className="w-full bg-card-soft border border-app-border rounded-xl px-4 py-3 text-sm font-bold text-text-main focus:outline-none focus:border-orange-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* FORMAT 4: Sentence Transformation */}
          {currentQuestion.format === 'format-4-sentence-transformation' && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/20">
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider block mb-1">
                  Grammar Transformation Rule
                </span>
                <p className="text-sm font-bold text-text-main">{currentQuestion.transformationRule}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Transformed Sentence:</label>
                <textarea
                  rows={3}
                  disabled={isSubmitted}
                  placeholder="Type your transformed sentence here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-2xl p-4 text-sm sm:text-base font-bold text-text-main focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* FORMAT 5: Word-Order Exercise (MANDATORY: ENGLISH REFERENCE FIRST) */}
          {currentQuestion.format === 'format-5-word-order' && (
            <div className="space-y-6">
              {/* MANDATORY ENGLISH REFERENCE DISPLAYED FIRST */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-orange-500/10 via-orange-500/5 to-transparent rounded-2xl border border-orange-500/30">
                <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest block mb-1">
                  English Reference (Translate & Arrange):
                </span>
                <p className="text-base sm:text-lg font-black text-text-main">
                  "{currentQuestion.englishReference || currentQuestion.context}"
                </p>
              </div>

              {/* Constructed sentence drop target area */}
              <div className="min-h-[90px] p-4 bg-card-soft rounded-2xl border-2 border-dashed border-app-border flex flex-wrap gap-2 items-center">
                {wordOrderItems.length === 0 ? (
                  <span className="text-xs text-text-muted italic">
                    Tap the words below in the correct order to construct the sentence...
                  </span>
                ) : (
                  wordOrderItems.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => handleRemoveWordFromOrder(word, idx)}
                      className="px-3.5 py-2 rounded-xl bg-orange-500 text-white font-bold text-sm shadow-md hover:bg-orange-600 transition-all flex items-center gap-1.5"
                    >
                      <span>{word}</span>
                      {!isSubmitted && <span className="text-xs opacity-70">×</span>}
                    </button>
                  ))
                )}
              </div>

              {/* Available word bank chips */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Available Words:</span>
                <div className="flex flex-wrap gap-2">
                  {availableWords.map((word, idx) => (
                    <button
                      key={idx}
                      disabled={isSubmitted}
                      onClick={() => handleAddWordToOrder(word, idx)}
                      className="px-3.5 py-2 rounded-xl bg-card-bg border border-app-border text-text-main font-bold text-sm hover:border-orange-500 transition-all shadow-sm"
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FORMAT 8: Short Contextual Writing */}
          {currentQuestion.format === 'format-8-short-writing' && (
            <div className="space-y-4">
              {currentQuestion.writingCues && currentQuestion.writingCues.length > 0 && (
                <div className="p-4 bg-card-soft rounded-2xl border border-app-border space-y-2">
                  <span className="text-xs font-black uppercase text-orange-500 tracking-wider block">
                    Required Grammar Constraints:
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-text-main font-bold">
                    {currentQuestion.writingCues.map((cue, i) => (
                      <li key={i}>{cue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Your Written Response:</label>
                <textarea
                  rows={4}
                  disabled={isSubmitted}
                  placeholder="Write a clear, grammatically structured response..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-2xl p-4 text-sm sm:text-base font-bold text-text-main focus:outline-none focus:border-orange-500 resize-none"
                />
              </div>

              {evaluationFeedback && (
                <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-xs sm:text-sm text-text-main">
                  <span className="font-bold text-orange-500 block mb-1">AI Evaluator Feedback:</span>
                  <p>{evaluationFeedback}</p>
                </div>
              )}
            </div>
          )}

          {/* Submitted Result / Explanation Accordion */}
          <AnimatePresence>
            {isSubmitted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 pt-4 border-t border-app-border"
              >
                <div className={cn(
                  "p-4 sm:p-5 rounded-2xl border flex items-start gap-3",
                  currentQuestion.isCorrect ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400" : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                )}>
                  {currentQuestion.isCorrect ? <CheckCircle2 size={22} className="shrink-0 mt-0.5" /> : <XCircle size={22} className="shrink-0 mt-0.5" />}
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider">
                      {currentQuestion.isCorrect ? "Correct!" : "Incorrect"}
                    </h4>
                    <p className="text-xs sm:text-sm text-text-main mt-1 leading-relaxed">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* Minimizable Chat Bot Help matching Grammar Modules */}
          <div className="relative pt-2">
            {/* Small Persistent Bar Form */}
            <motion.div 
              className={cn(
                "bg-card-soft border border-app-border rounded-[28px] overflow-hidden flex flex-col shadow-lg backdrop-blur-xl transition-all duration-300 transform-gpu",
                isChatExpanded ? "opacity-0 pointer-events-none h-0" : "h-[74px]"
              )}
              style={{ willChange: "transform, opacity" }}
            >
              <div className="flex-1 flex items-center px-4 sm:px-6 gap-3 sm:gap-4">
                <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-orange-500/20 shrink-0">
                  <MessageCircle size={20} />
                </div>
                <div 
                  className="flex-1 bg-card-bg border border-app-border rounded-xl px-4 py-2.5 cursor-pointer group hover:border-orange-500/40 transition-all flex items-center"
                  onClick={() => setIsChatExpanded(true)}
                >
                  <span className="text-xs sm:text-sm text-text-muted group-hover:text-text-main transition-colors truncate">
                    {chatMessages.length > 0
                      ? `Clear doubts (${chatMessages.length} message${chatMessages.length > 1 ? 's' : ''}) • Click to open`
                      : "Have a doubt about this question? Chat with tutor"}
                  </span>
                </div>
                <button 
                  onClick={() => setIsChatExpanded(true)}
                  className="w-10 h-10 bg-card-bg hover:bg-card-soft border border-app-border rounded-xl flex items-center justify-center text-text-muted hover:text-orange-500 transition-all cursor-pointer shrink-0"
                  title="Open AI Tutor"
                >
                  <Send size={16} />
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
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsChatExpanded(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-md z-[70] transform-gpu"
                  />
                  
                  {/* Modal Container */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: 15 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed top-[12%] inset-x-4 sm:inset-x-12 md:inset-x-24 lg:inset-x-44 bottom-6 z-[80] bg-card-bg border border-app-border rounded-[36px] shadow-2xl flex flex-col overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-app-border bg-card-soft flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-text-main uppercase tracking-wider">Clear your doubts</h4>
                          <p className="text-xs text-text-muted mt-0.5">
                            Question {currentIdx + 1} of {currentModule.questions.length}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setIsChatExpanded(false)}
                        className="w-10 h-10 bg-card-soft hover:bg-card-bg border border-app-border rounded-xl flex items-center justify-center text-text-muted hover:text-text-main transition-all group"
                        title="Minimize"
                      >
                        <Minus size={22} className="group-hover:scale-110 transition-transform" />
                      </button>
                    </div>

                    {/* Question Context Ribbon */}
                    <div className="px-5 py-2.5 bg-card-soft/80 border-b border-app-border flex items-center justify-between gap-3 text-xs shrink-0">
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-orange-500 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-[10px] uppercase">
                          Q{currentIdx + 1}
                        </span>
                        <span className="text-text-muted truncate italic">
                          "{currentQuestion.prompt}"
                        </span>
                      </div>
                      {isSubmitted && (
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-lg font-bold text-[10px] uppercase tracking-wider shrink-0",
                          currentQuestion.isCorrect ? "bg-green-500/15 text-green-500" : "bg-red-500/15 text-red-500"
                        )}>
                          {currentQuestion.isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      )}
                    </div>

                    {/* Scrollable Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
                      {chatMessages.length === 0 ? (
                        <div className="text-center py-12 text-text-muted space-y-2">
                          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto mb-3">
                            <MessageCircle size={24} />
                          </div>
                          <p className="text-sm font-bold text-text-main">Need clarification on this challenge?</p>
                          <p className="text-xs max-w-sm mx-auto">Ask the AI tutor anything about syntax, cases, or word order for this exercise.</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={cn(
                              "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%]",
                              msg.sender === 'user'
                                ? "ml-auto bg-orange-500 text-white rounded-br-sm"
                                : "mr-auto bg-card-soft border border-app-border text-text-main rounded-bl-sm"
                            )}
                          >
                            {msg.text}
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex items-center gap-2 text-xs text-text-muted p-3 bg-card-soft rounded-2xl w-fit">
                          <Loader2 size={14} className="animate-spin text-orange-500" />
                          <span>Tutor is thinking...</span>
                        </div>
                      )}
                    </div>

                    {/* Pre-suggested quick prompt pills */}
                    <div className="px-4 py-2 border-t border-app-border/40 flex items-center gap-2 overflow-x-auto no-scrollbar bg-card-soft/40">
                      {[
                        "Why is this answer correct?",
                        "Explain the grammar rule",
                        "Show another example"
                      ].map(prompt => (
                        <button
                          key={prompt}
                          onClick={() => handleSendChatMessage(prompt)}
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
                        handleSendChatMessage();
                      }}
                      className="p-3 sm:p-4 border-t border-app-border flex items-center gap-2 bg-card-bg"
                    >
                      <input
                        type="text"
                        placeholder="Ask a question about this grammar exercise..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="flex-1 bg-card-soft border border-app-border rounded-xl px-4 py-2.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isChatLoading}
                        className="p-2.5 rounded-xl bg-orange-500 text-white disabled:opacity-40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Submission Action Bar */}
        <div className="pt-6 mt-8 border-t border-app-border flex items-center justify-between gap-4">
          <div className="text-xs text-text-muted font-bold">
            {isProfessional ? (
              <span>Independent Countdown: {timeLeft}s remaining</span>
            ) : (
              <span>Casual Untimed Mode</span>
            )}
          </div>

          {!isSubmitted ? (
            <button
              disabled={isCurrentAnswerEmpty() || isEvaluating}
              onClick={() => submitCurrentQuestion(false)}
              className="px-8 py-3.5 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {isEvaluating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-8 py-3.5 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <span>{currentIdx < currentModule.questions.length - 1 ? "Next Challenge" : "Complete Assessment"}</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </main>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl"
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-xl font-black text-text-main">Exit Active Challenge?</h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                You are in <span className="font-bold text-text-main">Professional Timed Mode</span>. Exiting now will pause your active session, but won't grant extra time.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-xs font-black uppercase tracking-wider shadow-md hover:scale-[1.02] transition-all"
                  >
                    Resume Timer
                  </button>
                  <button
                    onClick={() => {
                      // Switch to Casual Mode directly
                      const updated: AdaptiveAssessmentModule = {
                        ...currentModule,
                        mode: 'casual',
                        currentQuestionIndex: currentIdx
                      };
                      setCurrentModule(updated);
                      onUpdateModule(updated);
                      setShowExitConfirm(false);
                    }}
                    className="flex-1 py-3 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30 text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Switch to Casual
                  </button>
                </div>
                <button
                  onClick={() => {
                    const updated: AdaptiveAssessmentModule = {
                      ...currentModule,
                      currentQuestionIndex: currentIdx
                    };
                    onUpdateModule(updated);
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="w-full py-2.5 rounded-xl bg-card-soft text-text-muted hover:text-text-main text-xs font-bold uppercase tracking-wider border border-app-border transition-colors"
                >
                  Save & Exit to Hub
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
