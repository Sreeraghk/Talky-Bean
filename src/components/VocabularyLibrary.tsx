import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Trash2, Search, Volume2, Sparkles, Gamepad2,
  ArrowLeftRight, Eye, EyeOff, Calendar, Undo2, X, RefreshCw, Star, CheckCircle2, AlertCircle, Clock, ChevronRight,
  Shuffle, Brush, Bookmark, Info
} from 'lucide-react';
import { VocabularyWord, GrammarTip, VocabularyExercise, VocabularyExerciseType, LanguageLevel } from '../types';
import { cn } from '../lib/utils';
import { UserService } from '../services/UserService';
import { voiceService } from '../services/VoiceService';
import { VocabularyService } from '../services/VocabularyService';
import { getLanguageConfig } from '../config/languages';
import confetti from 'canvas-confetti';

interface LearningLibraryProps {
  words: VocabularyWord[];
  onRemoveWord: (id: string) => void;
  onRemoveWords?: (ids: string[]) => void;
  onUndoWord?: () => void;
  canUndo?: boolean;
  onToggleBookmark?: (id: string) => void;
  onUnbookmarkWords?: (ids: string[]) => void;
  onUndoUnbookmark?: () => void;
  canUndoUnbookmark?: boolean;
  currentLanguage: string;
  level: LanguageLevel;
  onProgressUpdate?: (score: number) => void;
  user?: any;
  onRequireLogin?: () => void;
}

type TimeFilter = '1day' | '1week' | '1month' | 'all';

export function LearningLibrary({ 
  words, 
  onRemoveWord, 
  onRemoveWords,
  onUndoWord,
  canUndo,
  onToggleBookmark,
  onUnbookmarkWords,
  onUndoUnbookmark,
  canUndoUnbookmark,
  currentLanguage,
  level,
  onProgressUpdate,
  user,
  onRequireLogin
}: LearningLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'bookmarks' | 'exercises'>('vocabulary');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isReversed, setIsReversed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [shuffledOrderMap, setShuffledOrderMap] = useState<Record<string, number> | null>(null);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());
  const [playingId, setPlayingId] = useState<string | null>(null);
  
  const [exercises, setExercises] = useState<VocabularyExercise[]>([]);
  const [loadingType, setLoadingType] = useState<VocabularyExerciseType | null>(null);
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    const saved = VocabularyService.getExercises(currentLanguage);
    setExercises(saved);
    VocabularyService.ensureLexiconLoaded(currentLanguage).catch(() => {});
  }, [currentLanguage]);

  const handleSpeak = async (word: VocabularyWord) => {
    try {
      const normalized = VocabularyService.normalizeWordItem(word, currentLanguage);
      // In canonical order, `normalized.translation` is always the Target-Language word (e.g. "Haus" or "gehen (ging)")
      // Strip any parenthetical inflected duplicate when speaking so TTS pronounces the base form cleanly
      const rawTarget = normalized.translation || '';
      const cleanTargetToSpeak = rawTarget.replace(/\s*\([^)]*\)\s*/g, '').trim() || rawTarget;

      await voiceService.speak({ 
        text: cleanTargetToSpeak, 
        languageCode: normalized.languageCode || currentLanguage,
        onStart: () => setPlayingId(word.id)
      });
    } finally {
      setPlayingId(null);
    }
  };

  const handleGenerateExercise = async (type: VocabularyExerciseType) => {
    if (!user) {
      onRequireLogin?.();
      return;
    }
    setLoadingType(type);
    try {
      const exercise = await VocabularyService.generateExercise(type, words, level, currentLanguage);
      if (exercise) {
        const updated = [...exercises.filter(ex => ex.type !== type), exercise];
        setExercises(updated);
        VocabularyService.saveExercises(updated, currentLanguage);
      }
    } catch (e: any) {
      alert(e.message || "Failed to generate exercise");
    } finally {
      setLoadingType(null);
    }
  };

  const handleUpdateExercise = (id: string, results: Partial<VocabularyExercise>) => {
    const updated = exercises.map(ex => ex.id === id ? { ...ex, ...results } : ex);
    setExercises(updated);
    VocabularyService.saveExercises(updated, currentLanguage);
  };

  const toggleReveal = (id: string) => {
    const newRevealed = new Set(revealedWords);
    if (newRevealed.has(id)) {
      newRevealed.delete(id);
    } else {
      newRevealed.add(id);
    }
    setRevealedWords(newRevealed);
  };

  const filterByTime = (learnedAt: number) => {
    if (timeFilter === 'all') return true;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    if (timeFilter === '1day') return now - learnedAt <= oneDay;
    if (timeFilter === '1week') return now - learnedAt <= oneWeek;
    if (timeFilter === '1month') return now - learnedAt <= oneMonth;
    return true;
  };

  const canonicalLanguageWords = React.useMemo(() => {
    const languageWords = words.filter(w => w.languageCode === currentLanguage);
    return VocabularyService.normalizeVocabularyList(languageWords, currentLanguage).normalized;
  }, [words, currentLanguage]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setShuffleSeed(prev => prev + 1);

    // Create a fixed ID-to-rank permutation snapshot ONLY when the Shuffle button is clicked.
    // Deleting words later (e.g. via right-swipe while Hide is active) preserves the exact relative order
    // of all remaining words without re-shuffling.
    const pool = [...canonicalLanguageWords];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const nextOrderMap: Record<string, number> = {};
    pool.forEach((w, idx) => {
      nextOrderMap[w.id] = idx;
    });
    setShuffledOrderMap(nextOrderMap);

    // Visual feedback duration
    setTimeout(() => setIsShuffling(false), 600);
  };

  const bookmarkedCount = React.useMemo(
    () => canonicalLanguageWords.filter(w => w.isBookmarked).length,
    [canonicalLanguageWords]
  );

  const filteredWords = React.useMemo(() => {
    const sourceWords = activeTab === 'bookmarks'
      ? canonicalLanguageWords.filter(w => w.isBookmarked)
      : canonicalLanguageWords.filter(w => !w.isRemovedFromTimeline);

    const base = sourceWords
      .filter(w => filterByTime(w.learnedAt))
      .filter(w => 
        (w.word || '').toLowerCase().includes(search.toLowerCase()) || 
        (w.translation || '').toLowerCase().includes(search.toLowerCase())
      );

    if (shuffledOrderMap) {
      return [...base].sort((a, b) => {
        const rankA = shuffledOrderMap[a.id] ?? Number.MAX_SAFE_INTEGER;
        const rankB = shuffledOrderMap[b.id] ?? Number.MAX_SAFE_INTEGER;
        if (rankA !== rankB) return rankA - rankB;
        return b.learnedAt - a.learnedAt;
      });
    }

    return [...base].sort((a, b) => b.learnedAt - a.learnedAt);
  }, [canonicalLanguageWords, activeTab, timeFilter, search, shuffledOrderMap]);

  const isBookmarksTab = activeTab === 'bookmarks';
  const showStudyToolbar = activeTab === 'vocabulary' || activeTab === 'bookmarks';
  const activeCanUndo = isBookmarksTab ? Boolean(canUndoUnbookmark || canUndo) : Boolean(canUndo);
  const handleActiveUndo = () => {
    if (isBookmarksTab && canUndoUnbookmark && onUndoUnbookmark) {
      onUndoUnbookmark();
    } else {
      onUndoWord?.();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => {
              setActiveTab('vocabulary');
              setIsSweeping(false);
            }}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-all relative shrink-0 cursor-pointer",
              activeTab === 'vocabulary' ? "border-accent text-text-main" : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            <Book size={20} />
            <span className="font-bold tracking-tight">Vocabulary</span>
            {activeTab === 'vocabulary' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button 
            onClick={() => {
              setActiveTab('bookmarks');
              setIsSweeping(false);
            }}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-all relative shrink-0 cursor-pointer",
              activeTab === 'bookmarks' ? "border-accent text-text-main" : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            <Bookmark size={20} className={cn(activeTab === 'bookmarks' && "fill-current text-accent")} />
            <span className="font-bold tracking-tight">Bookmarks</span>
            {bookmarkedCount > 0 && (
              <span className="text-xs font-extrabold text-accent tabular-nums">
                ({bookmarkedCount})
              </span>
            )}
            {activeTab === 'bookmarks' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
          <button 
            onClick={() => {
              setActiveTab('exercises');
              setIsSweeping(false);
            }}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-all relative shrink-0 cursor-pointer",
              activeTab === 'exercises' ? "border-accent text-text-main" : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            <Gamepad2 size={20} />
            <span className="font-bold tracking-tight">Games</span>
            {activeTab === 'exercises' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search words & translations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card-bg/60 backdrop-blur-md border border-app-border rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-all w-full text-text-main shadow-subtle placeholder:text-text-muted/60"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-card-bg/40 backdrop-blur-md p-3.5 rounded-2xl border border-app-border shadow-subtle space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-accent ml-1" />
            <div className="flex bg-card-soft p-1 rounded-xl border border-app-border gap-1">
              {(['1day', '1week', '1month', 'all'] as TimeFilter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setTimeFilter(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer",
                    timeFilter === f 
                      ? "bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white shadow-md shadow-orange-500/20" 
                      : "text-text-muted hover:text-text-main hover:bg-card-bg/50"
                  )}
                >
                  {f === '1day' ? '1 Day' : f === '1week' ? 'Week' : f === '1month' ? 'Month' : 'All'}
                </button>
              ))}
            </div>
          </div>

          {showStudyToolbar && (
            <div className="flex items-center gap-2">
              <AnimatePresence>
                {activeCanUndo && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: 20 }}
                    onClick={handleActiveUndo}
                    className="p-2.5 rounded-xl border bg-orange-500/10 border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all flex items-center gap-2 cursor-pointer"
                    title={isBookmarksTab && canUndoUnbookmark ? "Undo last bookmark sweep" : "Undo last deletion"}
                  >
                    <Undo2 size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Undo</span>
                  </motion.button>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsReversed(!isReversed)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                  isReversed ? "bg-accent/10 border-accent/50 text-accent" : "bg-card-soft border-app-border text-text-muted hover:text-text-main"
                )}
                title="Reverse Order"
              >
                <ArrowLeftRight size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Reverse</span>
              </button>
              <button
                onClick={() => {
                  setIsHidden(!isHidden);
                  setRevealedWords(new Set());
                }}
                className={cn(
                  "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                  isHidden ? "bg-accent/10 border-accent/50 text-accent" : "bg-card-soft border-app-border text-text-muted hover:text-text-main"
                )}
                title={isHidden ? "Unhide All" : "Hide Translations"}
              >
                {isHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{isHidden ? 'Hidden' : 'Hide'}</span>
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleShuffle}
                className={cn(
                  "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                  isShuffling 
                    ? "bg-accent/10 border-accent/50 text-accent shadow-[0_0_15px_rgba(255,107,107,0.2)]" 
                    : "bg-card-soft border-app-border text-text-muted hover:text-text-main hover:bg-accent/5"
                )}
                title="Shuffle Words"
              >
                <motion.div
                  animate={{ rotate: shuffleSeed * 360 }}
                  transition={{ 
                    duration: 0.6,
                    ease: [0.34, 1.56, 0.64, 1] // Custom bouncy ease for smoother feel
                  }}
                  className={cn("flex items-center justify-center", isShuffling ? "text-accent" : "text-inherit")}
                >
                  <Shuffle size={18} />
                </motion.div>
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Shuffle</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (filteredWords.length > 0) {
                    setIsSweeping(true);
                  }
                }}
                disabled={filteredWords.length === 0}
                className={cn(
                  "p-2.5 rounded-xl border transition-all flex items-center gap-2",
                  isSweeping 
                    ? "bg-red-500/10 border-red-500/50 text-red-500" 
                    : "bg-card-soft border-app-border text-text-muted hover:text-red-500 hover:bg-red-500/5 disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                title="Sweep visibly displayed vocabulary"
              >
                <Brush size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Sweep</span>
              </motion.button>
            </div>
          )}
        </div>

        {showStudyToolbar && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-app-border/60 text-[11px] font-semibold text-text-muted/80 px-1">
            <Info size={13} className="text-accent shrink-0" />
            <span>You can delete a word by right swiping</span>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'exercises' ? (
          <VocabularyGames 
            exercises={exercises}
            words={words}
            loadingType={loadingType}
            onGenerate={handleGenerateExercise}
            onUpdate={handleUpdateExercise}
            onProgressUpdate={onProgressUpdate}
            currentLanguage={currentLanguage}
            user={user}
            onRequireLogin={onRequireLogin}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {isSweeping && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-card p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                      <Brush size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-main">
                        {isBookmarksTab ? 'Sweep Bookmarked Vocabulary?' : 'Sweep Visibly Displayed Vocabulary?'}
                      </h4>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        {isBookmarksTab ? (
                          <>
                            This will unbookmark the <strong className="text-red-500">{filteredWords.length}</strong> words currently shown on your screen for the <strong className="capitalize">{timeFilter === '1day' ? '1 Day' : timeFilter === '1week' ? 'Week' : timeFilter === '1month' ? 'Month' : 'All Time'}</strong> time frame. They will remain safely in your main Vocabulary list.
                          </>
                        ) : (
                          <>
                            This will sweep the <strong className="text-red-500">{filteredWords.length}</strong> words currently shown on your screen for the <strong className="capitalize">{timeFilter === '1day' ? '1 Day' : timeFilter === '1week' ? 'Week' : timeFilter === '1month' ? 'Month' : 'All Time'}</strong> time frame. Any bookmarked words will remain safely in your Bookmarks section.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setIsSweeping(false)}
                      className="px-4 py-2 bg-card-soft border border-app-border text-text-muted hover:text-text-main font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        const idsToSweep = filteredWords.map(w => w.id);
                        if (isBookmarksTab) {
                          onUnbookmarkWords?.(idsToSweep);
                        } else {
                          onRemoveWords?.(idsToSweep);
                        }
                        setIsSweeping(false);
                      }}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 cursor-pointer"
                    >
                      {isBookmarksTab ? 'Yes, Unbookmark' : 'Yes, Sweep'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {filteredWords.length === 0 ? (
              <motion.div 
                key={isBookmarksTab ? "empty-bookmarks" : "empty-vocab"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 bg-card-bg/20 rounded-card border border-dashed border-app-border"
              >
                <div className="w-16 h-16 bg-card-soft rounded-full flex items-center justify-center mx-auto mb-6">
                  {isBookmarksTab ? (
                    <Bookmark size={32} className="text-text-muted" />
                  ) : (
                    <Book size={32} className="text-text-muted" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-text-muted mb-2">
                  {isBookmarksTab ? 'No bookmarked words yet' : 'No words found'}
                </h3>
                <p className="text-text-muted/60 text-sm max-w-xs mx-auto">
                  {isBookmarksTab
                    ? 'Tap the bookmark icon on any word card in your Vocabulary Vault to save it here for focused review.'
                    : 'Click on underlined words in exercises or chat to add them to your library.'}
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="vocab-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
              <AnimatePresence mode="popLayout">
                {filteredWords.map((word) => {
                  const isRevealed = revealedWords.has(word.id);
                  const showHiddenState = isHidden && !isRevealed;
                  
                  // Determine what to show as primary and secondary
                  const primary = isReversed ? word.translation : word.word;
                  const secondary = isReversed ? word.word : word.translation;

                  return (
                    <motion.div 
                      layout="position"
                      key={word.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: 160, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ 
                        layout: { type: "spring", stiffness: 350, damping: 30 }
                      }}
                      className="relative rounded-2xl overflow-hidden select-none"
                    >
                      {/* Red swipe-to-delete background track */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-start pl-5 text-red-500 pointer-events-none"
                      >
                        <div className="flex items-center gap-2 font-black text-[11px] uppercase tracking-widest">
                          <Trash2 size={17} />
                          <span>Delete</span>
                        </div>
                      </div>

                      <motion.div
                        drag="x"
                        dragDirectionLock
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={{ left: 0, right: 0.7 }}
                        onDragEnd={(_, info) => {
                          if (info.offset.x > 85 || (info.offset.x > 40 && info.velocity.x > 400)) {
                            onRemoveWord(word.id);
                          }
                        }}
                        whileDrag={{ scale: 1.01, cursor: "grabbing" }}
                        style={{ touchAction: "pan-y" }}
                        className="bg-card-bg p-4 sm:p-4.5 rounded-2xl border border-app-border flex items-center justify-between group hover:border-accent/40 transition-colors relative z-10 shadow-subtle hover:shadow-app vocabulary-card cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex-1 min-w-0 pr-3 text-left">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <p className="text-base sm:text-lg font-black text-text-main tracking-tight truncate">{primary}</p>
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-card-soft text-text-muted border border-app-border shrink-0 tabular-nums">
                              {new Date(word.learnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <div 
                            onClick={() => isHidden && toggleReveal(word.id)}
                            className={cn(
                              "transition-all duration-300 cursor-pointer min-h-[1.25rem] flex items-center",
                              showHiddenState ? "bg-app-border/50 rounded-lg w-24 h-4 mt-1" : ""
                            )}
                          >
                            {!showHiddenState && <p className="text-xs sm:text-sm text-text-muted font-medium">{secondary}</p>}
                            {showHiddenState && <div className="w-full h-full" />}
                          </div>
                        </div>
                        <div
                          onPointerDownCapture={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 transition-all"
                        >
                          <button 
                            onClick={() => handleSpeak(word)}
                            title="Listen to pronunciation"
                            className={cn(
                              "p-2.5 rounded-2xl transition-all duration-75 cursor-pointer",
                              playingId === word.id 
                                ? "bg-accent/10 text-accent shadow-[0_0_15px_rgba(255,107,107,0.4)] scale-110" 
                                : "text-text-muted hover:text-text-main hover:bg-card-soft"
                            )}
                          >
                            <Volume2 size={18} className={playingId === word.id ? "animate-pulse" : ""} />
                          </button>

                          <button
                            onClick={() => onToggleBookmark?.(word.id)}
                            title={word.isBookmarked ? "Remove from Bookmarks" : "Bookmark word"}
                            className={cn(
                              "p-2.5 rounded-2xl transition-all duration-150 cursor-pointer",
                              word.isBookmarked
                                ? "bg-accent/15 text-accent shadow-[0_0_12px_rgba(255,107,43,0.25)]"
                                : "text-text-muted hover:text-accent hover:bg-card-soft"
                            )}
                          >
                            <Bookmark size={18} className={cn(word.isBookmarked && "fill-current")} />
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VocabularyGames({ 
  exercises, 
  onGenerate, 
  loadingType, 
  onUpdate,
  words,
  onProgressUpdate,
  currentLanguage,
  user,
  onRequireLogin
}: { 
  exercises: VocabularyExercise[], 
  onGenerate: (type: VocabularyExerciseType) => void,
  loadingType: VocabularyExerciseType | null,
  onUpdate: (id: string, results: Partial<VocabularyExercise>) => void,
  words: VocabularyWord[],
  onProgressUpdate?: (score: number) => void,
  currentLanguage: string,
  user?: any,
  onRequireLogin?: () => void
}) {
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null);
  
  const activeExercise = exercises.find(ex => ex.id === activeExerciseId);

  if (activeExerciseId && activeExercise) {
    return (
      <ExerciseSession 
        exercise={activeExercise} 
        currentLanguage={currentLanguage}
        onClose={() => setActiveExerciseId(null)}
        onComplete={(results) => {
          onUpdate(activeExercise.id, results);
          if (results.score !== undefined && onProgressUpdate) {
            onProgressUpdate(results.score);
          }
        }}
      />
    );
  }

  const exerciseTypes: { type: VocabularyExerciseType, label: string, description: string, icon: any }[] = [
    { type: 'matching', label: 'Mix & Match', description: `Match the ${getLanguageConfig(currentLanguage).name} words with their English translations.`, icon: <ArrowLeftRight size={24} /> },
    { type: 'fill-in-the-blank', label: 'Context Master', description: 'Write the appropriate word from your library into the sentence.', icon: <RefreshCw size={24} /> },
    { type: 'multiple-choice', label: 'Speed Choice', description: 'Select the correct word to complete the sentence.', icon: <Sparkles size={24} /> },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {exerciseTypes.map(et => {
        const ex = exercises.find(e => e.type === et.type);
        const isLoading = loadingType === et.type;

        return (
          <div key={et.type} className="bg-card-bg border border-app-border rounded-card p-8 flex flex-col justify-between shadow-app hover:border-accent/30 transition-all group">
            <div>
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-8 group-hover:scale-110 transition-transform">
                {et.icon}
              </div>
              <h3 className="text-2xl font-black text-text-main mb-3 tracking-tight">{et.label}</h3>
              <p className="text-text-muted text-sm leading-relaxed mb-8 font-medium">{et.description}</p>
              
              {ex && ex.isCompleted && (
                <div className="mb-8 p-4 bg-card-soft rounded-2xl border border-app-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-[10px] font-black uppercase text-text-muted tracking-widest">Completed</span>
                  </div>
                  <span className="text-lg font-black text-accent">{ex.score}%</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {!ex ? (
                <button
                  disabled={isLoading || words.length < 5}
                  onClick={() => onGenerate(et.type)}
                  className="w-full bg-accent text-white font-black text-xs uppercase tracking-widest py-5 rounded-btn hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-accent/20"
                >
                  {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {words.length < 5 ? 'Need 5+ Words' : 'Generate Game'}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (!user) {
                        onRequireLogin?.();
                        return;
                      }
                      setActiveExerciseId(ex.id);
                    }}
                    className={cn(
                      "w-full font-black text-xs uppercase tracking-widest py-5 rounded-btn hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-app",
                      ex.isCompleted ? "bg-card-soft text-text-muted border border-app-border" : "bg-accent text-white shadow-accent/20"
                    )}
                  >
                    {ex.isCompleted ? 'Review Results' : 'Start Playing'}
                    <ChevronRight size={18} />
                  </button>
                  
                  {ex.isCompleted && (
                    <button
                      disabled={isLoading}
                      onClick={() => onGenerate(et.type)}
                      className="w-full bg-card-bg border border-app-border text-text-muted font-black text-[10px] uppercase tracking-widest py-4 rounded-btn hover:bg-card-soft transition-all flex items-center justify-center gap-2 hover:text-text-main"
                    >
                      <RefreshCw className={cn(isLoading && "animate-spin")} size={14} />
                      Refresh Experience
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ExerciseSession({
  exercise,
  currentLanguage,
  onClose,
  onComplete
}: {
  exercise: VocabularyExercise,
  currentLanguage: string,
  onClose: () => void,
  onComplete: (results: Partial<VocabularyExercise>) => void
}) {
  const getInitialTime = () => {
    if (exercise.isCompleted) return 0;
    if (exercise.type === 'matching') {
      return (exercise.content.pairs?.length || 5) * 30;
    }
    const questionsCount = exercise.content.questions?.length || 1;
    return questionsCount * 30;
  };

  const [timeLeft, setTimeLeft] = useState(getInitialTime());
  const [isSubmitted, setIsSubmitted] = useState(exercise.isCompleted);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]); // Track answers for multiple questions
  const [userAnswer, setUserAnswer] = useState<any>(exercise.userAnswer || (exercise.type === 'matching' ? {} : ''));
  const [showResults, setShowResults] = useState(exercise.isCompleted);
  const timerRef = useRef<any>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Matching specific state
  const [selectedMatch, setSelectedMatch] = useState<{ id: string, side: 'left' | 'right' } | null>(null);

  useEffect(() => {
    if (showResults || isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showResults, isSubmitted]);

  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && !showResults) {
      handleSubmit();
    }
  }, [timeLeft, isSubmitted, showResults]);

  const handleSubmit = (finalAnswer?: any) => {
    if (isSubmitted) return;
    
    const ans = finalAnswer !== undefined ? finalAnswer : userAnswer;
    const questions = exercise.content.questions || [];
    
    if (exercise.type !== 'matching' && currentQuestionIndex < questions.length - 1) {
      // Continue to next question
      setUserAnswers(prev => [...prev, ans]);
      setUserAnswer('');
      setCurrentQuestionIndex(prev => prev + 1);
      return;
    }

    // Final submission
    let score = 0;
    const allAnswers = exercise.type === 'matching' ? ans : [...userAnswers, ans];

    if (exercise.type === 'matching') {
      const pairs = exercise.content.pairs || [];
      const correctCount = pairs.filter(p => ans[p.id] === p.right).length;
      score = Math.round((correctCount / pairs.length) * 100);
    } else if (exercise.type === 'multiple-choice') {
      const correctCount = questions.filter((q: any, idx: number) => allAnswers[idx] === q.correctAnswerIndex).length;
      score = Math.round((correctCount / questions.length) * 100);
    } else if (exercise.type === 'fill-in-the-blank') {
      const correctCount = questions.filter((q: any, idx: number) => {
        const uAns = (allAnswers[idx] || '').toLowerCase().trim();
        return uAns === q.word?.toLowerCase().trim();
      }).length;
      score = Math.round((correctCount / questions.length) * 100);
    }

    setIsSubmitted(true);
    setShowResults(true);
    if (timerRef.current) clearInterval(timerRef.current);

    onComplete({
      isCompleted: true,
      score,
      userAnswer: allAnswers,
      currentQuestionIndex: questions.length - 1
    });

    if (score === 100) {
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10002 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card-bg border-2 border-app-border rounded-card p-6 md:p-12 shadow-app relative overflow-hidden flex flex-col min-h-[600px] safe-layout mx-4 sm:mx-0"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 gap-6">
        <button 
          onClick={() => {
            if (!isSubmitted && !showResults && timeLeft > 0) {
              setShowExitConfirm(true);
            } else {
              onClose();
            }
          }}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-card-soft hover:bg-card-bg rounded-2xl transition-all border border-app-border group"
        >
          <Undo2 size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-bold hidden xs:inline">Exit Game</span>
        </button>
        
        <div className="flex items-center justify-center gap-6">
          {!isSubmitted && (
            <div className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all",
              timeLeft <= 10 ? "bg-red-500/10 border-red-500/30 text-red-500 animate-pulse" : "bg-card-soft border-app-border text-text-muted"
            )}>
              <Clock size={20} />
              <span className="text-xl font-black tracking-tighter tabular-nums">{timeLeft}s</span>
            </div>
          )}
          
          {isSubmitted && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-accent/10 border border-accent/30 text-accent">
              <Star size={20} className="fill-accent" />
              <span className="text-xl font-black tracking-tighter tabular-nums">Score: {exercise.score}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {exercise.type === 'matching' && (
          <MatchingGame 
            exercise={exercise} 
            isSubmitted={isSubmitted} 
            currentLanguage={currentLanguage}
            userAnswer={userAnswer} 
            setUserAnswer={setUserAnswer} 
            selectedMatch={selectedMatch} 
            setSelectedMatch={setSelectedMatch} 
          />
        )}
        {exercise.type === 'fill-in-the-blank' && (
          <FillInTheBlankGame 
            exercise={exercise} 
            isSubmitted={isSubmitted} 
            currentQuestionIndex={currentQuestionIndex} 
            userAnswer={userAnswer} 
            setUserAnswer={setUserAnswer} 
          />
        )}
        {exercise.type === 'multiple-choice' && (
          <MultipleChoiceGame 
            exercise={exercise} 
            isSubmitted={isSubmitted} 
            currentQuestionIndex={currentQuestionIndex} 
            userAnswer={userAnswer} 
            setUserAnswer={setUserAnswer} 
          />
        )}
      </div>

      <div className="mt-16 flex justify-center">
        {!isSubmitted ? (
          <button
            onClick={() => handleSubmit()}
            className="bg-accent text-white font-black text-sm uppercase tracking-[0.2em] px-12 py-5 rounded-btn hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/30 flex items-center gap-3 cursor-pointer"
          >
            {exercise.type === 'matching' 
              ? 'Finish Matching' 
              : currentQuestionIndex < (exercise.content.questions?.length || 1) - 1 
                ? 'Next Question' 
                : 'Finish Game'
            }
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="bg-accent text-white font-black text-sm uppercase tracking-[0.2em] px-12 py-5 rounded-btn hover:bg-accent-hover hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/30 flex items-center gap-3 cursor-pointer"
          >
            Finish Game
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              onClick={() => setShowExitConfirm(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm transform-gpu will-change-[opacity]"
            />
            
            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-card-bg border border-app-border rounded-[32px] p-8 md:p-10 shadow-2xl text-center space-y-6 overflow-hidden z-10 transform-gpu will-change-transform"
            >
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto text-accent border border-accent/20">
                <AlertCircle size={32} />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight text-text-main text-center">
                  Abandon Timed Challenge?
                </h3>
                
                <p className="text-sm text-text-muted leading-relaxed text-center">
                  Hey{' '}
                  <span className="font-bold text-accent">
                    {UserService.getProfile()?.name || 'Explorer'}
                  </span>
                  , this hesitation is the price you pay today for tomorrow's SUCCESS.
                </p>
                
                <p className="text-xs text-text-subtle text-center">
                  Are you absolutely sure you want to stop? Your timed progress and answers for this game will be abandoned.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3.5 bg-accent text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-accent/20 cursor-pointer"
                >
                  Stay and Conquer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-3.5 bg-card-soft text-text-muted border border-app-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all cursor-pointer"
                >
                  Confirm Exit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MatchingGame({ exercise, isSubmitted, currentLanguage, userAnswer, setUserAnswer, selectedMatch, setSelectedMatch }: any) {
  const pairs = exercise.content.pairs || [];
  const leftSide = React.useMemo(() => [...pairs].sort((a, b) => a.left.localeCompare(b.left)), [pairs]);
  const rightSide = React.useMemo(() => [...pairs].sort((a, b) => a.right.localeCompare(b.right)), [pairs]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-2 mb-4">{getLanguageConfig(currentLanguage).name}</p>
        {leftSide.map((p: any) => {
          const isMatched = userAnswer[p.id] !== undefined;
          const isSelected = selectedMatch?.id === p.id && selectedMatch?.side === 'left';
          const isCorrect = isSubmitted && userAnswer[p.id] === p.right;
          const isWrong = isSubmitted && userAnswer[p.id] !== p.right;

          return (
            <div key={p.id} className="space-y-2">
              <button
                disabled={isSubmitted || isMatched}
                onClick={() => {
                  if (selectedMatch?.side === 'right') {
                    setUserAnswer({ ...userAnswer, [p.id]: selectedMatch.id });
                    setSelectedMatch(null);
                  } else {
                    setSelectedMatch({ id: p.id, side: 'left' });
                  }
                }}
                className={cn(
                  "w-full p-6 rounded-2xl border transition-all text-lg font-bold flex items-center justify-between",
                  isSelected ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/10" : "border-app-border hover:border-accent/30 text-text-main hover:bg-card-soft",
                  isMatched && !isSubmitted && "opacity-50 bg-card-soft cursor-default",
                  isCorrect && "border-green-500 bg-green-500/10 text-green-600",
                  isWrong && "border-red-500 bg-red-500/10 text-red-600",
                  isSubmitted && !isMatched && "border-red-500/30 opacity-60"
                )}
              >
                {p.left}
                {isMatched && <CheckCircle2 size={16} className={isWrong ? "text-red-500" : "text-green-500"} />}
                {isSubmitted && !isMatched && <X size={16} className="text-red-500" />}
              </button>
              {isSubmitted && !isCorrect && (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/5 rounded-xl border border-green-500/20">
                  <span className="text-[10px] font-black uppercase text-green-600 tracking-widest whitespace-nowrap">Correction:</span>
                  <span className="text-sm font-bold text-green-700 truncate">{p.right}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest pl-2 mb-4">English</p>
        {rightSide.map((p: any) => {
          const matchedLeftId = Object.keys(userAnswer).find(k => userAnswer[k] === p.right);
          const isMatched = matchedLeftId !== undefined;
          const isSelected = selectedMatch?.id === p.right && selectedMatch?.side === 'right';
          
          let isCorrect = false;
          let isWrong = false;
          if (isSubmitted && isMatched) {
            const leftItem = pairs.find((item: any) => item.id === matchedLeftId);
            isCorrect = leftItem?.right === p.right;
            isWrong = !isCorrect;
          }

          return (
            <button
              key={p.right}
              disabled={isSubmitted || isMatched}
              onClick={() => {
                if (selectedMatch?.side === 'left') {
                  setUserAnswer({ ...userAnswer, [selectedMatch.id]: p.right });
                  setSelectedMatch(null);
                } else {
                  setSelectedMatch({ id: p.right, side: 'right' });
                }
              }}
              className={cn(
                "w-full p-6 rounded-2xl border transition-all text-lg font-bold flex items-center justify-between",
                isSelected ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/10" : "border-app-border hover:border-accent/30 text-text-main hover:bg-card-soft",
                isMatched && !isSubmitted && "opacity-50 bg-card-soft cursor-default",
                isMatched && isCorrect && "border-green-500 bg-green-500/10 text-green-600",
                isMatched && isWrong && "border-red-500 bg-red-500/10 text-red-600"
              )}
            >
              {p.right}
              {isMatched && <CheckCircle2 size={16} className={isWrong ? "text-red-500" : "text-green-500"} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FillInTheBlankGame({ exercise, isSubmitted, currentQuestionIndex, userAnswer, setUserAnswer }: any) {
  const questions = exercise.content.questions || [];
  
  if (isSubmitted) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto">
        {questions.map((q: any, idx: number) => {
          const uAns = (exercise.userAnswer?.[idx] || '').toLowerCase().trim();
          const isCorrect = uAns === q.word?.toLowerCase().trim();
          return (
            <div key={idx} className="bg-card-soft p-6 rounded-2xl border border-app-border flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-lg font-bold text-text-main mb-1">
                  {q.sentence.replace('[blank]', `[${q.word}]`)}
                </p>
                <p className="text-xs text-text-muted">Your answer: <span className={isCorrect ? "text-green-500" : "text-red-500"}>{exercise.userAnswer?.[idx] || '(No Answer)'}</span></p>
              </div>
              {isCorrect ? <CheckCircle2 className="text-green-500" size={24} /> : <X className="text-red-500" size={24} />}
            </div>
          );
        })}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || {};
  const parts = currentQuestion.sentence?.split('[blank]') || [];
  
  const allOptions = React.useMemo(() => {
    if (!currentQuestion.word) return [];
    return [currentQuestion.word, ...(currentQuestion.options || [])].sort(() => Math.random() - 0.5);
  }, [currentQuestion.word, currentQuestion.options]);

  return (
    <div className="text-center py-6 px-4 md:px-0">
      <div className="mb-4 inline-block px-4 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-black uppercase tracking-widest">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <p className="text-xl md:text-3xl font-black text-text-main mb-8 md:mb-12 tracking-tight leading-relaxed max-w-4xl mx-auto break-german">
        {parts[0]}
        <span className="mx-2 md:mx-3 min-w-[100px] md:min-w-[150px] inline-block border-b-4 border-accent text-accent px-2 md:px-4 py-1 break-all">
          {userAnswer || '_______'}
        </span>
        {parts[1]}
      </p>

      <div className="mt-8 md:mt-12">
        <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-6">Word Bank</p>
        <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
          {allOptions.map((opt: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setUserAnswer(opt)}
              className={cn(
                "px-6 py-3 rounded-xl border transition-all font-bold text-sm",
                userAnswer === opt ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" : "bg-card-soft border-app-border text-text-main hover:border-accent/30"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MultipleChoiceGame({ exercise, isSubmitted, currentQuestionIndex, userAnswer, setUserAnswer }: any) {
  const questions = exercise.content.questions || [];

  if (isSubmitted) {
    return (
      <div className="space-y-8 max-w-3xl mx-auto text-center">
        {questions.map((q: any, idx: number) => {
          const uAnsIdx = exercise.userAnswer?.[idx];
          const isCorrect = uAnsIdx === q.correctAnswerIndex;
          return (
            <div key={idx} className="bg-card-soft p-8 rounded-2xl border border-app-border shadow-sm">
              <p className="text-xl font-bold text-text-main mb-4">
                {q.sentence.replace('[blank]', `[${q.options[q.correctAnswerIndex]}]`)}
              </p>
              <div className="flex items-center justify-center gap-4">
                 <span className={cn(
                   "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest border",
                   isCorrect ? "bg-green-500/10 border-green-500 text-green-600" : "bg-red-500/10 border-red-500 text-red-600"
                 )}>
                   {isCorrect ? 'Correct' : 'Incorrect'}
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex] || {};
  const { sentence, options } = currentQuestion;

  return (
    <div className="text-center py-6 px-4 md:px-0">
      <div className="mb-4 inline-block px-4 py-1 bg-accent/10 rounded-full text-accent text-[10px] font-black uppercase tracking-widest">
        Question {currentQuestionIndex + 1} of {questions.length}
      </div>
      <p className="text-xl md:text-3xl font-black text-text-main mb-8 md:mb-16 tracking-tight leading-relaxed max-w-3xl mx-auto break-german">
        {sentence?.replace('[blank]', '_______')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-w-2xl mx-auto">
        {options?.map((opt: string, idx: number) => {
          const isSelected = userAnswer === idx;

          return (
            <button
              key={idx}
              onClick={() => setUserAnswer(idx)}
              className={cn(
                "p-4 md:p-6 rounded-2xl border transition-all text-lg md:text-xl font-bold break-german",
                isSelected ? "border-accent bg-accent/10 text-accent shadow-lg shadow-accent/10" : "border-app-border hover:border-accent/30 text-text-main hover:bg-card-soft"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
