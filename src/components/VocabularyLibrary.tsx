import React from 'react';
import { motion } from 'motion/react';
import { Book, Trash2, Search, Volume2 } from 'lucide-react';
import { VocabularyWord } from '../types';

interface VocabularyLibraryProps {
  words: VocabularyWord[];
  onRemove: (id: string) => void;
}

export function VocabularyLibrary({ words, onRemove }: VocabularyLibraryProps) {
  const [search, setSearch] = React.useState('');
  
  const filteredWords = words.filter(w => 
    w.german.toLowerCase().includes(search.toLowerCase()) || 
    w.english.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.learnedAt - a.learnedAt);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Book className="text-orange-500" />
          <h2 className="text-2xl font-bold">Vocabulary Library</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Search words..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {filteredWords.length === 0 ? (
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
                <button className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white">
                  <Volume2 size={18} />
                </button>
                <button 
                  onClick={() => onRemove(word.id)}
                  className="p-2 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
