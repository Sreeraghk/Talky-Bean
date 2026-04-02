import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { 
  ChevronLeft, Sparkles, CheckCircle2, Volume2, Info, 
  ChevronRight, Trophy, AlertCircle, Loader2, Send, 
  MessageCircle, Check, X, RotateCcw, Play
} from 'lucide-react';
import { GrammarTopic, GrammarExercise, LanguageLevel, GrammarBatch } from '../types';
import { GrammarService } from '../services/GrammarService';
import { getLanguageContent } from '../data';
import { cn } from '../lib/utils';

interface GrammarInterfaceProps {
  level: LanguageLevel;
  language: string;
  onClose: () => void;
  onProgressUpdate: (score: number) => void;
}

export function GrammarInterface({ level, language, onClose, onProgressUpdate }: GrammarInterfaceProps) {
  const languageContent = getLanguageContent(language);
  const grammarTopics = languageContent.grammarTopics;

  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [batches, setBatches] = useState<GrammarBatch[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingMore, setIsGeneratingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Exercise State
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [mixMatchAnswers, setMixMatchAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Persistence
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = localStorage.getItem('completedGrammarTopics');
    if (saved) setCompletedTopics(new Set(JSON.parse(saved)));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const [shuffledRights, setShuffledRights] = useState<{ id: string; text: string }[]>([]);

  const loadExercises = async (topic: GrammarTopic) => {
    setIsLoading(true);
    setError(null);
    try {
      const exercises = await GrammarService.generateExercises(topic.id, topic.name, level, language);
      const newBatch: GrammarBatch = {
        id: `batch-${Date.now()}`,
        topicId: topic.id,
        exercises,
        createdAt: Date.now()
      };
      setBatches([newBatch]);
      setSelectedTopic(topic);
      setCurrentExerciseIndex(0);
      prepareExercise(exercises[0]);
    } catch (error) {
      console.error('Failed to load exercises:', error);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const prepareExercise = (exercise: GrammarExercise) => {
    resetExerciseState();
    if (exercise.type === 'mix-and-match' && exercise.content.pairs) {
      const rights = exercise.content.pairs.map(p => ({ id: p.id, text: p.right }));
      setShuffledRights([...rights].sort(() => Math.random() - 0.5));
    }
  };

  const generateMore = async () => {
    if (!selectedTopic) return;
    setIsGeneratingMore(true);
    setError(null);
    try {
      const exercises = await GrammarService.generateExercises(selectedTopic.id, selectedTopic.name, level, language);
      const newBatch: GrammarBatch = {
        id: `batch-${Date.now()}`,
        topicId: selectedTopic.id,
        exercises,
        createdAt: Date.now()
      };
      setBatches(prev => [...prev, newBatch]);
    } catch (error) {
      console.error('Failed to generate more exercises:', error);
      setError('Failed to generate more exercises. Please try again.');
    } finally {
      setIsGeneratingMore(false);
    }
  };

  const resetExerciseState = () => {
    setUserAnswers([]);
    setMixMatchAnswers({});
    setIsSubmitted(false);
    setScore(null);
    setShowExplanation(false);
    setChatMessages([]);
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    window.speechSynthesis.speak(utterance);
  };

  const handleDrop = (word: string, index: number) => {
    if (isSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[index] = word;
    setUserAnswers(newAnswers);
  };

  const handleRemoveAnswer = (index: number) => {
    if (isSubmitted) return;
    const newAnswers = [...userAnswers];
    newAnswers[index] = '';
    setUserAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const currentBatch = batches[Math.floor(currentExerciseIndex / 5)];
    const exercise = currentBatch.exercises[currentExerciseIndex % 5];
    
    let correctCount = 0;
    if (exercise.type === 'fill-in-the-blank') {
      exercise.content.correctAnswers?.forEach((ans, i) => {
        if (userAnswers[i] === ans) correctCount++;
      });
      const totalBlanks = exercise.content.correctAnswers?.length || 1;
      setScore(correctCount / totalBlanks);
    } else {
      shuffledRights.forEach((right, i) => {
        const originalPair = exercise.content.pairs?.[i];
        if (originalPair && right.text === originalPair.right) correctCount++;
      });
      const totalPairs = exercise.content.pairs?.length || 1;
      setScore(correctCount / totalPairs);
    }
    
    setIsSubmitted(true);
    setShowExplanation(true);
    onProgressUpdate(correctCount);
  };

  const handleFinishExercise = () => {
    const currentBatch = batches[Math.floor(currentExerciseIndex / 5)];
    const exercise = currentBatch.exercises[currentExerciseIndex % 5];
    exercise.isCompleted = true;

    const allExercises = batches.flatMap(b => b.exercises);
    if (currentExerciseIndex < allExercises.length - 1) {
      const nextIndex = currentExerciseIndex + 1;
      setCurrentExerciseIndex(nextIndex);
      prepareExercise(allExercises[nextIndex]);
    } else {
      // Topic completed
      const newCompleted = new Set(completedTopics);
      newCompleted.add(selectedTopic!.id);
      setCompletedTopics(newCompleted);
      localStorage.setItem('completedGrammarTopics', JSON.stringify(Array.from(newCompleted)));
      setSelectedTopic(null);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setIsChatLoading(true);

    try {
      const currentBatch = batches[Math.floor(currentExerciseIndex / 5)];
      const exercise = currentBatch.exercises[currentExerciseIndex % 5];
      const context = exercise.type === 'fill-in-the-blank' 
        ? `Sentence: ${exercise.content.sentence}. Correct Answers: ${exercise.content.correctAnswers?.join(', ')}`
        : `Pairs: ${exercise.content.pairs?.map(p => `${p.left} -> ${p.right}`).join(', ')}`;
      
      const response = await GrammarService.clearDoubt(userMsg, context);
      setChatMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const allExercises = batches.flatMap(b => b.exercises);
  const completedExercises = allExercises.filter(e => e.isCompleted);
  const pendingExercises = allExercises.filter(e => !e.isCompleted);
  const currentExercise = pendingExercises[0] || completedExercises[completedExercises.length - 1];
  
  const canGenerateMore = batches.length > 0 && 
    batches[batches.length - 1].exercises.filter(e => e.isCompleted).length >= 3;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
          <p className="text-zinc-500 font-medium animate-pulse">Preparing your grammar challenge...</p>
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
            onClick={selectedTopic ? () => setSelectedTopic(null) : onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              {selectedTopic ? selectedTopic.name : `${level} Grammar`}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-black">
              {selectedTopic ? 'Exercise Mode' : 'Select a Topic'}
            </p>
          </div>
        </div>
        {selectedTopic && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full border border-orange-500/20">
            <Trophy size={14} className="text-orange-500" />
            <span className="text-xs font-bold text-orange-500">
              {completedExercises.length} / {allExercises.length} Done
            </span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between">
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
        )}
        {!selectedTopic ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {['Major', 'MixMatch', 'FinalIntegration'].map((cat) => {
              const topics = grammarTopics.filter(t => t.level === level && t.category === cat);
              if (topics.length === 0) return null;
              
              return (
                <div key={cat} className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 px-2">
                    {cat === 'Major' ? 'Core Topics' : cat === 'MixMatch' ? 'Mix & Match' : 'Final Integration'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topics.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => loadExercises(topic)}
                        className="group bg-zinc-900/40 border border-white/5 p-6 rounded-3xl hover:border-orange-500/30 transition-all text-left flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                            completedTopics.has(topic.id) ? "bg-green-500/10 text-green-500" : "bg-white/5 text-zinc-400 group-hover:text-orange-500"
                          )}>
                            {completedTopics.has(topic.id) ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
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
        ) : (
          <div className="max-w-2xl mx-auto space-y-8 pb-32">
            {pendingExercises.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentExercise.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                {/* Exercise Content */}
                <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6">
                    <button 
                      onClick={() => speakText(currentExercise.content.sentence || '')}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-zinc-400 hover:text-white"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>

                  {currentExercise.type === 'fill-in-the-blank' ? (
                    <div className="space-y-12">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-6 text-2xl font-medium leading-relaxed">
                        {currentExercise.content.sentence?.split('[blank]').map((part, i, arr) => (
                          <React.Fragment key={i}>
                            <span>{part}</span>
                            {i < arr.length - 1 && (
                              <div 
                                className={cn(
                                  "min-w-[120px] h-12 border-b-2 flex items-center justify-center transition-all px-4",
                                  userAnswers[i] ? "border-orange-500 text-orange-500" : "border-zinc-700",
                                  isSubmitted && userAnswers[i] === currentExercise.content.correctAnswers?.[i] && "border-green-500 text-green-500",
                                  isSubmitted && userAnswers[i] !== currentExercise.content.correctAnswers?.[i] && "border-red-500 text-red-500"
                                )}
                                onClick={() => handleRemoveAnswer(i)}
                              >
                                {userAnswers[i] || ''}
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Word Bank */}
                      {!isSubmitted && (
                        <div className="flex flex-wrap gap-3 pt-8 border-t border-white/5">
                          {currentExercise.content.wordBank?.map((word, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const firstEmpty = userAnswers.findIndex(a => !a);
                                const targetIndex = firstEmpty === -1 ? userAnswers.length : firstEmpty;
                                handleDrop(word, targetIndex);
                              }}
                              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-sm font-bold transition-all hover:scale-105 active:scale-95"
                            >
                              {word}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">Match these...</h4>
                        {currentExercise.content.pairs?.map((pair) => (
                          <div key={pair.id} className="h-16 flex items-center p-4 bg-white/5 rounded-2xl border border-white/5 font-medium text-sm">
                            {pair.left}
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4">...to these</h4>
                        <Reorder.Group 
                          axis="y" 
                          values={shuffledRights} 
                          onReorder={isSubmitted ? () => {} : setShuffledRights}
                          className="space-y-4"
                        >
                          {shuffledRights.map((right, i) => (
                            <Reorder.Item 
                              key={right.id} 
                              value={right}
                              dragListener={!isSubmitted}
                              className={cn(
                                "h-16 flex items-center p-4 bg-zinc-800 rounded-2xl border border-white/5 cursor-grab active:cursor-grabbing transition-all text-sm",
                                isSubmitted && right.text === currentExercise.content.pairs?.[i]?.right ? "border-green-500 text-green-500" :
                                isSubmitted ? "border-red-500 text-red-500" : "hover:border-orange-500/50"
                              )}
                            >
                              {right.text}
                            </Reorder.Item>
                          ))}
                        </Reorder.Group>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-12 flex items-center gap-4">
                    {!isSubmitted ? (
                      <button
                        onClick={handleSubmit}
                        className="flex-1 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleFinishExercise}
                        className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        Finish & Next
                      </button>
                    )}
                    <button 
                      onClick={resetExerciseState}
                      className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-zinc-400"
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
                    <div className="bg-zinc-900/40 border border-white/5 p-8 rounded-[40px] space-y-4">
                      <div className="flex items-center gap-2 text-orange-500">
                        <Info size={18} />
                        <h4 className="text-sm font-black uppercase tracking-widest">Grammar Note</h4>
                      </div>
                      <p className="text-zinc-300 leading-relaxed">{currentExercise.explanation}</p>
                    </div>

                    {/* Chat Window */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] overflow-hidden flex flex-col h-[400px]">
                      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center text-white">
                          <MessageCircle size={16} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold">Clear your doubts</h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Chat with Gemini</p>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn(
                            "max-w-[80%] p-4 rounded-2xl text-sm",
                            msg.sender === 'user' ? "bg-orange-500 text-white ml-auto rounded-tr-none" : "bg-white/5 text-zinc-300 mr-auto rounded-tl-none"
                          )}>
                            {msg.text}
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="bg-white/5 text-zinc-500 p-4 rounded-2xl mr-auto rounded-tl-none animate-pulse flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin" />
                            Thinking...
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
                        <input 
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Ask a question about this rule..."
                          className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500/50 transition-all"
                        />
                        <button 
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || isChatLoading}
                          className="p-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="text-center space-y-6 py-12">
              <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <Trophy size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">Topic Mastered!</h3>
                <p className="text-zinc-500">You've completed all current exercises for this topic.</p>
              </div>
              <button
                onClick={() => {
                  const newCompleted = new Set(completedTopics);
                  newCompleted.add(selectedTopic!.id);
                  setCompletedTopics(newCompleted);
                  localStorage.setItem('completedGrammarTopics', JSON.stringify(Array.from(newCompleted)));
                  setSelectedTopic(null);
                }}
                className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-500 hover:text-white transition-all"
              >
                Finish Topic
              </button>
            </div>
          )}

          {/* Completed Exercises List */}
          {completedExercises.length > 0 && (
            <div className="space-y-4 pt-12 border-t border-white/5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Completed Exercises</h4>
              <div className="space-y-3">
                {completedExercises.map((ex, i) => (
                  <div key={ex.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                        <Check size={12} />
                      </div>
                      <span className="text-sm text-zinc-400 font-medium">Exercise {i + 1}</span>
                    </div>
                    <button 
                      onClick={() => speakText(ex.content.sentence || '')}
                      className="p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

            {/* Generate More Button */}
            {canGenerateMore && (
              <button
                onClick={generateMore}
                disabled={isGeneratingMore}
                className="w-full py-6 bg-zinc-900 border border-white/5 rounded-[40px] text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px] hover:text-orange-500 hover:border-orange-500/30 transition-all flex items-center justify-center gap-3"
              >
                {isGeneratingMore ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGeneratingMore ? 'Generating...' : 'Generate 5 More Exercises'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
