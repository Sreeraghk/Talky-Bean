import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Book, Trash2, Search, Volume2, Sparkles, 
  ArrowLeftRight, Eye, EyeOff, Calendar
} from 'lucide-react';
import { VocabularyWord, GrammarTip } from '../types';
import { cn } from '../lib/utils';
import { voiceService } from '../services/VoiceService';

interface LearningLibraryProps {
  words: VocabularyWord[];
  grammarTips: GrammarTip[];
  onRemoveWord: (id: string) => void;
  onRemoveGrammarTip: (id: string) => void;
  currentLanguage: string;
}

type TimeFilter = '1day' | '1week' | '1month' | 'all';

export function LearningLibrary({ words, grammarTips, onRemoveWord, onRemoveGrammarTip, currentLanguage }: LearningLibraryProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar'>('vocabulary');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isReversed, setIsReversed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

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

  const filteredWords = words
    .filter(w => w.languageCode === currentLanguage)
    .filter(w => filterByTime(w.learnedAt))
    .filter(w => 
      (w.word || '').toLowerCase().includes(search.toLowerCase()) || 
      (w.translation || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.learnedAt - a.learnedAt);

  const filteredGrammar = grammarTips
    .filter(t => t.languageCode === currentLanguage)
    .filter(t => filterByTime(t.learnedAt))
    .filter(t => 
      (t.rule || '').toLowerCase().includes(search.toLowerCase()) || 
      (t.explanation || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.learnedAt - a.learnedAt);

  return (
    <div className="space-y-8">
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab('vocabulary')}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-all relative",
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
            onClick={() => setActiveTab('grammar')}
            className={cn(
              "flex items-center gap-2 pb-3 border-b-2 transition-all relative",
              activeTab === 'grammar' ? "border-accent text-text-main" : "border-transparent text-text-muted hover:text-text-main"
            )}
          >
            <Sparkles size={20} />
            <span className="font-bold tracking-tight">Grammar</span>
            {activeTab === 'grammar' && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={activeTab === 'vocabulary' ? "Search words..." : "Search grammar..."} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card-bg/50 border border-app-border rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent/50 transition-all w-full md:w-64 text-text-main"
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-card-bg/30 p-4 rounded-card border border-app-border">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-text-muted ml-2" />
          <div className="flex bg-card-soft p-1 rounded-xl border border-app-border">
            {(['1day', '1week', '1month', 'all'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  timeFilter === f ? "bg-accent text-white" : "text-text-muted hover:text-text-main"
                )}
              >
                {f === '1day' ? '1 Day' : f === '1week' ? 'Week' : f === '1month' ? 'Month' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'vocabulary' && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Content Grid */}
      <AnimatePresence mode="wait">
        {activeTab === 'vocabulary' ? (
          filteredWords.length === 0 ? (
            <motion.div 
              key="empty-vocab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-card-bg/20 rounded-card border border-dashed border-app-border"
            >
              <div className="w-16 h-16 bg-card-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Book size={32} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-muted mb-2">No words found</h3>
              <p className="text-text-muted/60 text-sm max-w-xs mx-auto">Click on underlined words in exercises or chat to add them to your library.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="vocab-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredWords.map((word) => {
                const isRevealed = revealedWords.has(word.id);
                const showHiddenState = isHidden && !isRevealed;
                
                // Determine what to show as primary and secondary
                const primary = isReversed ? word.translation : word.word;
                const secondary = isReversed ? word.word : word.translation;

                return (
                  <motion.div 
                    layout
                    key={word.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card-bg p-5 rounded-card border border-app-border flex items-center justify-between group hover:border-accent/30 transition-all relative overflow-hidden shadow-app vocabulary-card"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-text-main tracking-tight truncate">{primary}</p>
                      <div 
                        onClick={() => isHidden && toggleReveal(word.id)}
                        className={cn(
                          "transition-all duration-300 cursor-pointer min-h-[1.25rem] flex items-center",
                          showHiddenState ? "bg-app-border/50 rounded-lg w-24 h-4 mt-1" : ""
                        )}
                      >
                        {!showHiddenState && <p className="text-sm text-text-muted font-medium">{secondary}</p>}
                        {showHiddenState && <div className="w-full h-full" />}
                      </div>
                      <p className="text-[9px] text-text-muted/60 mt-3 uppercase tracking-[0.2em] font-black">
                        {new Date(word.learnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => voiceService.speak({ text: word.word, languageCode: word.languageCode })}
                        className="p-2.5 hover:bg-card-soft rounded-2xl text-text-muted hover:text-text-main transition-colors"
                      >
                        <Volume2 size={18} />
                      </button>
                      <button 
                        onClick={() => onRemoveWord(word.id)}
                        className="p-2.5 hover:bg-red-500/10 rounded-2xl text-text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )
        ) : (
          filteredGrammar.length === 0 ? (
            <motion.div 
              key="empty-grammar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32 bg-card-bg/20 rounded-card border border-dashed border-app-border"
            >
              <div className="w-16 h-16 bg-card-soft rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-text-muted" />
              </div>
              <h3 className="text-xl font-bold text-text-muted mb-2">No grammar tips yet</h3>
              <p className="text-text-muted/60 text-sm max-w-xs mx-auto">Enable grammar explanations in chat to see tips here.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="grammar-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {filteredGrammar.map((tip) => (
                <motion.div 
                  layout
                  key={tip.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card-bg p-8 rounded-card border border-app-border flex flex-col justify-between group hover:border-accent/30 transition-all relative overflow-hidden shadow-app"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-10 h-10 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                      <Sparkles size={20} />
                    </div>
                    <button 
                      onClick={() => onRemoveGrammarTip(tip.id)}
                      className="p-2.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-2xl text-text-muted hover:text-red-500 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-text-main mb-3 tracking-tight leading-tight">{tip.rule}</h3>
                    <p className="text-text-muted text-sm leading-relaxed font-medium">{tip.explanation}</p>
                    <div className="flex items-center gap-4 mt-8">
                      <p className="text-[9px] text-text-muted/60 uppercase tracking-[0.2em] font-black">
                        {new Date(tip.learnedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <div className="h-px flex-1 bg-app-border" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
