import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Book, LayoutDashboard, Settings, User, Plus, Sparkles, X, Languages, Volume2, Info } from 'lucide-react';
import { SpeakingInterface } from './components/SpeakingInterface';
import { VocabularyLibrary } from './components/VocabularyLibrary';
import { ProgressMeter } from './components/ProgressMeter';
import { RolePlaySelector } from './components/RolePlaySelector';
import { LanguageLevel, VocabularyWord, ProgressData, RolePlayScenario, Message, ConversationHistory, ROLE_PLAY_SCENARIOS } from './types';
import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'roleplay'>('dashboard');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);
  const [level, setLevel] = useState<LanguageLevel>(() => {
    const saved = localStorage.getItem('deutschbuddy_level');
    return (saved as LanguageLevel) || 'A1';
  });
  
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    const saved = localStorage.getItem('deutschbuddy_vocab');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<ConversationHistory>(() => {
    const saved = localStorage.getItem('deutschbuddy_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [progress, setProgress] = useState<ProgressData[]>(() => {
    const saved = localStorage.getItem('deutschbuddy_progress');
    if (saved) return JSON.parse(saved);
    
    // Default mock data for visualization
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });
    
    return dates.map(date => ({
      date,
      wordsLearned: Math.floor(Math.random() * 10) + 5,
      speakingTimeMinutes: Math.floor(Math.random() * 20) + 10
    }));
  });

  useEffect(() => {
    localStorage.setItem('deutschbuddy_vocab', JSON.stringify(vocabulary));
  }, [vocabulary]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_level', level);
  }, [level]);

  const handleNewWord = (word: VocabularyWord) => {
    setVocabulary(prev => {
      if (prev.some(w => w.german.toLowerCase() === word.german.toLowerCase())) return prev;
      return [...prev, word];
    });
    
    // Update today's progress
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => {
      const last = prev[prev.length - 1];
      if (last && last.date === today) {
        return [...prev.slice(0, -1), { ...last, wordsLearned: last.wordsLearned + 1 }];
      }
      return [...prev, { date: today, wordsLearned: 1, speakingTimeMinutes: 0 }];
    });
  };

  const handleStartSpeaking = (scenario?: RolePlayScenario) => {
    setSelectedScenario(scenario || {
      id: 'free-talk',
      title: 'Free Conversation',
      description: 'Talk about anything you like.',
      context: 'You are having a friendly conversation with your best friend about your day and interests.'
    });
    setIsSpeaking(true);
  };

  const handleCloseSpeaking = (messages: Message[]) => {
    if (selectedScenario) {
      setHistory(prev => ({
        ...prev,
        [selectedScenario.id]: messages
      }));
    }
    setIsSpeaking(false);
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'Grammar Check':
        const grammarScenario = ROLE_PLAY_SCENARIOS.find(s => s.id === 'grammar-practice');
        if (grammarScenario) handleStartSpeaking(grammarScenario);
        break;
      case 'Vocabulary':
        setActiveTab('library');
        break;
      case 'Daily Quiz':
        const quizScenario = ROLE_PLAY_SCENARIOS.find(s => s.id === 'daily-quiz');
        if (quizScenario) handleStartSpeaking(quizScenario);
        break;
      case 'Settings':
        setIsSettingsOpen(true);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-orange-500/30">
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900/80 backdrop-blur-2xl border border-white/5 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={cn("p-2 transition-all", activeTab === 'dashboard' ? "text-orange-500 scale-110" : "text-gray-500 hover:text-white")}
        >
          <LayoutDashboard size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('roleplay')}
          className={cn("p-2 transition-all", activeTab === 'roleplay' ? "text-orange-500 scale-110" : "text-gray-500 hover:text-white")}
        >
          <Sparkles size={24} />
        </button>
        <button 
          onClick={() => handleStartSpeaking()}
          className="bg-orange-500 p-4 rounded-full -mt-12 shadow-xl shadow-orange-500/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Mic size={28} className="text-white" />
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={cn("p-2 transition-all", activeTab === 'library' ? "text-orange-500 scale-110" : "text-gray-500 hover:text-white")}
        >
          <Book size={24} />
        </button>
        <button 
          className="p-2 text-gray-500 hover:text-white transition-all"
        >
          <User size={24} />
        </button>
      </nav>

      <main className="max-w-5xl mx-auto pt-12 pb-32 px-6">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 tracking-tight">Guten Tag, Sreeragh! 👋</h1>
            <p className="text-gray-400">Ready to level up your German today?</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-2xl border border-white/5">
            <select 
              value={level}
              onChange={(e) => setLevel(e.target.value as LanguageLevel)}
              className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-lg text-xs font-bold uppercase tracking-widest outline-none border-none cursor-pointer hover:bg-orange-500/20 transition-colors appearance-none"
            >
              <option value="A1">Level A1</option>
              <option value="A2">Level A2</option>
              <option value="B1">Level B1</option>
              <option value="B2">Level B2</option>
            </select>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors"
            >
              <Settings size={20} className="text-gray-400" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <ProgressMeter data={progress} />
                </div>
                <div className="bg-gradient-to-br from-orange-600 to-orange-400 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-orange-500/10">
                  <h3 className="text-2xl font-bold leading-tight">Practice makes perfect.</h3>
                  <p className="text-orange-100 text-sm mt-2 mb-6">Your Buddy is waiting for a chat. Try a role play scenario today!</p>
                  <button 
                    onClick={() => setActiveTab('roleplay')}
                    className="bg-white text-orange-600 font-bold py-3 px-6 rounded-2xl hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
                  >
                    Explore Role Plays <Sparkles size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Grammar Check', icon: <Sparkles size={20} />, color: 'bg-blue-500' },
                    { label: 'Vocabulary', icon: <Book size={20} />, color: 'bg-purple-500' },
                    { label: 'Daily Quiz', icon: <LayoutDashboard size={20} />, color: 'bg-green-500' },
                    { label: 'Settings', icon: <Settings size={20} />, color: 'bg-zinc-700' },
                  ].map((action, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleQuickAction(action.label)}
                      className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 hover:bg-zinc-800 transition-all flex flex-col items-center gap-3"
                    >
                      <div className={cn("p-3 rounded-xl text-white", action.color)}>
                        {action.icon}
                      </div>
                      <span className="text-xs font-medium text-gray-300">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'library' && (
            <motion.div 
              key="library"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <VocabularyLibrary 
                words={vocabulary} 
                onRemove={(id) => setVocabulary(prev => prev.filter(w => w.id !== id))} 
              />
            </motion.div>
          )}

          {activeTab === 'roleplay' && (
            <motion.div 
              key="roleplay"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <RolePlaySelector onSelect={handleStartSpeaking} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSpeaking && selectedScenario && (
          <SpeakingInterface 
            level={level}
            context={selectedScenario.context}
            scenarioId={selectedScenario.id}
            initialMessages={history[selectedScenario.id] || []}
            vocabulary={vocabulary}
            onClose={handleCloseSpeaking}
            onNewWord={handleNewWord}
            onLevelChange={setLevel}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold">App Settings</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Languages size={18} />
                    <span className="text-sm font-medium">Learning Level</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(['A1', 'A2', 'B1', 'B2'] as LanguageLevel[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={cn(
                          "py-2 rounded-xl text-sm font-bold transition-all",
                          level === l 
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-white/5 text-zinc-400 hover:bg-white/10"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Volume2 size={18} />
                    <span className="text-sm font-medium">Audio Preferences</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between">
                    <span className="text-sm">Auto-play AI responses</span>
                    <div className="w-10 h-6 bg-orange-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Info size={18} />
                    <span className="text-sm font-medium">About DeutschBuddy</span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    DeutschBuddy is your AI-powered companion for mastering German through real-time conversations and role-play scenarios.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  Reset All Progress
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
