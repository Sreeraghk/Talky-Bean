import React from 'react';
import { motion } from 'motion/react';
import { Book, Trash2, Search, Volume2, Sparkles } from 'lucide-react';
import { VocabularyWord, GrammarTip } from '../types';
import { cn } from '../lib/utils';
import { voiceService } from '../services/VoiceService';

interface LearningLibraryProps {
  words: VocabularyWord[];
  grammarTips: GrammarTip[];
  onRemoveWord: (id: string) => void;
  onRemoveGrammarTip: (id: string) => void;
}

export function LearningLibrary({ words, grammarTips, onRemoveWord, onRemoveGrammarTip }: LearningLibraryProps) {
  const [search, setSearch] = React.useState('');
  const [activeTab, setActiveTab] = React.useState<'vocabulary' | 'grammar'>('vocabulary');
  
  const filteredWords = words.filter(w => 
    w.german.toLowerCase().includes(search.toLowerCase()) || 
    w.english.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.learnedAt - a.learnedAt);

  const filteredGrammar = grammarTips.filter(t => 
    t.german.toLowerCase().includes(search.toLowerCase()) || 
    t.explanation.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.learnedAt - a.learnedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('vocabulary')}
            className={cn(
              "flex items-center gap-2 pb-2 border-b-2 transition-all",
              activeTab === 'vocabulary' ? "border-orange-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Book size={20} />
            <span className="font-bold">Vocabulary</span>
          </button>
          <button 
            onClick={() => setActiveTab('grammar')}
            className={cn(
              "flex items-center gap-2 pb-2 border-b-2 transition-all",
              activeTab === 'grammar' ? "border-orange-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"
            )}
          >
            <Sparkles size={20} />
            <span className="font-bold">Grammar</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder={activeTab === 'vocabulary' ? "Search words..." : "Search grammar..."} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors w-full md:w-64"
          />
        </div>
      </div>

      {activeTab === 'vocabulary' ? (
        filteredWords.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-gray-500">No words found. Start speaking to learn new words!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => (
              <motion.div 
                layout
                key={word.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-orange-500/30 transition-all"
              >
                <div>
                  <p className="text-lg font-bold text-white">{word.german}</p>
                  <p className="text-sm text-gray-400">{word.english}</p>
                  <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">
                    {new Date(word.learnedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => voiceService.speak({ text: word.german })}
                    className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white"
                  >
                    <Volume2 size={18} />
                  </button>
                  <button 
                    onClick={() => onRemoveWord(word.id)}
                    className="p-2 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        filteredGrammar.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-gray-500">No grammar tips yet. Enable grammar explanations in chat!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredGrammar.map((tip) => (
              <motion.div 
                layout
                key={tip.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-orange-500/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-orange-500/10 text-orange-500 p-2 rounded-lg">
                    <Sparkles size={18} />
                  </div>
                  <button 
                    onClick={() => onRemoveGrammarTip(tip.id)}
                    className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div>
                  <p className="text-xl font-bold text-white mb-2">{tip.german}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{tip.explanation}</p>
                  <p className="text-[10px] text-gray-600 mt-4 uppercase tracking-widest">
                    {new Date(tip.learnedAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
