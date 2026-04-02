import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Book, LayoutDashboard, Settings, User, Plus, Sparkles, X, Languages, Volume2, Info, Activity, ChevronRight } from 'lucide-react';
import { SpeakingInterface } from './components/SpeakingInterface';
import { LearningLibrary } from './components/VocabularyLibrary';
import { ProgressMeter } from './components/ProgressMeter';
import { RolePlaySelector } from './components/RolePlaySelector';
import { ListeningInterface } from './components/ListeningInterface';
import { AdaptiveExercise } from './components/AdaptiveExercise';
import { GrammarInterface } from './components/GrammarInterface';
import { ListeningService } from './services/ListeningService';
import { LanguageLevel, VocabularyWord, ProgressData, RolePlayScenario, Message, ConversationHistory, GrammarTip, SpeakingStyle } from './types';
import { cn } from './lib/utils';
import { Save, UserCircle, Play } from 'lucide-react';
import { voiceService } from './services/VoiceService';
import { SUPPORTED_LANGUAGES, GREETINGS } from './constants';
import { getLanguageContent } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'roleplay'>('dashboard');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningOpen, setIsListeningOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);

  const languageContent = getLanguageContent(currentLanguage);
  const rolePlayScenarios = languageContent.rolePlayScenarios;
  
  // Settings State
  const [level, setLevel] = useState<LanguageLevel>(() => {
    const saved = localStorage.getItem('deutschbuddy_level');
    return (saved as LanguageLevel) || 'A1';
  });

  const [speed, setSpeed] = useState(() => {
    const saved = localStorage.getItem('deutschbuddy_speed');
    return saved ? parseFloat(saved) : 1.0;
  });

  const [autoMicOnDelay, setAutoMicOnDelay] = useState(() => {
    const saved = localStorage.getItem('autoMicOnDelay');
    return saved ? parseFloat(saved) : 2.0;
  });

  const [autoMicOffDelay, setAutoMicOffDelay] = useState(() => {
    const saved = localStorage.getItem('autoMicOffDelay');
    return saved ? parseFloat(saved) : 4.0;
  });

  const [isAutoMode, setIsAutoMode] = useState(() => {
    const saved = localStorage.getItem('isAutoMode');
    return saved === null ? true : saved === 'true';
  });

  const [speakingStyle, setSpeakingStyle] = useState<SpeakingStyle>(() => {
    const saved = localStorage.getItem('deutschbuddy_speaking_style');
    return (saved as SpeakingStyle) || 'Formal';
  });

  // Temporary settings state for the modal
  const [tempSettings, setTempSettings] = useState({
    level,
    speed,
    autoMicOnDelay,
    autoMicOffDelay,
    isAutoMode,
    speakingStyle
  });

  // Sync temp settings when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setTempSettings({
        level,
        speed,
        autoMicOnDelay,
        autoMicOffDelay,
        isAutoMode,
        speakingStyle
      });
    }
  }, [isSettingsOpen, level, speed, autoMicOnDelay, autoMicOffDelay, isAutoMode, speakingStyle]);

  const handleSaveSettings = () => {
    // Update actual state
    setLevel(tempSettings.level);
    setSpeed(tempSettings.speed);
    setAutoMicOnDelay(tempSettings.autoMicOnDelay);
    setAutoMicOffDelay(tempSettings.autoMicOffDelay);
    setIsAutoMode(tempSettings.isAutoMode);
    setSpeakingStyle(tempSettings.speakingStyle);

    // Persist to localStorage
    localStorage.setItem('deutschbuddy_level', tempSettings.level);
    localStorage.setItem('deutschbuddy_speed', tempSettings.speed.toString());
    localStorage.setItem('autoMicOnDelay', tempSettings.autoMicOnDelay.toString());
    localStorage.setItem('autoMicOffDelay', tempSettings.autoMicOffDelay.toString());
    localStorage.setItem('isAutoMode', tempSettings.isAutoMode.toString());
    localStorage.setItem('deutschbuddy_speaking_style', tempSettings.speakingStyle);

    setIsSettingsOpen(false);
  };
  
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>(() => {
    const saved = localStorage.getItem('deutschbuddy_vocab');
    return saved ? JSON.parse(saved) : [];
  });

  const [grammarTips, setGrammarTips] = useState<GrammarTip[]>(() => {
    const saved = localStorage.getItem('deutschbuddy_grammar');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState<ConversationHistory>(() => {
    const saved = localStorage.getItem('deutschbuddy_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [customScenario, setCustomScenario] = useState<RolePlayScenario | null>(() => {
    const saved = localStorage.getItem('deutschbuddy_custom_scenario');
    return saved ? JSON.parse(saved) : null;
  });

  const [progress, setProgress] = useState<ProgressData[]>(() => {
    const saved = localStorage.getItem('deutschbuddy_progress');
    if (saved) return JSON.parse(saved);
    
    // Start with today's empty record
    const today = new Date().toISOString().split('T')[0];
    return [{
      date: today,
      wordsLearned: 0,
      speakingTimeMinutes: 0,
      exercisesCompleted: 0,
      averageScore: 0
    }];
  });

  useEffect(() => {
    localStorage.setItem('deutschbuddy_vocab', JSON.stringify(vocabulary));
  }, [vocabulary]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_grammar', JSON.stringify(grammarTips));
  }, [grammarTips]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('deutschbuddy_progress', JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    if (customScenario) {
      localStorage.setItem('deutschbuddy_custom_scenario', JSON.stringify(customScenario));
    } else {
      localStorage.removeItem('deutschbuddy_custom_scenario');
    }
  }, [customScenario]);

  const handleNewWord = (word: VocabularyWord) => {
    setVocabulary(prev => {
      if (prev.some(w => w.german.toLowerCase() === word.german.toLowerCase())) return prev;
      return [...prev, word];
    });
    
    updateProgress(1, 0);
  };

  const handleNewGrammarTip = (tip: GrammarTip) => {
    setGrammarTips(prev => {
      if (prev.some(t => t.german.toLowerCase() === tip.german.toLowerCase())) return prev;
      return [...prev, tip];
    });
  };

  const handleRemoveWord = (id: string) => {
    setVocabulary(prev => prev.filter(w => w.id !== id));
  };

  const handleRemoveGrammarTip = (id: string) => {
    setGrammarTips(prev => prev.filter(t => t.id !== id));
  };

  const updateProgress = (words: number, minutes: number, exercises: number = 0, score: number = 0) => {
    const today = new Date().toISOString().split('T')[0];
    setProgress(prev => {
      const last = prev[prev.length - 1];
      if (last && last.date === today) {
        const newExercisesCompleted = (last.exercisesCompleted || 0) + exercises;
        const currentTotalScore = (last.averageScore || 0) * (last.exercisesCompleted || 0);
        const newAverageScore = newExercisesCompleted > 0 
          ? (currentTotalScore + score) / newExercisesCompleted 
          : 0;

        return [...prev.slice(0, -1), { 
          ...last, 
          wordsLearned: last.wordsLearned + words,
          speakingTimeMinutes: last.speakingTimeMinutes + minutes,
          exercisesCompleted: newExercisesCompleted,
          averageScore: newAverageScore
        }];
      }
      return [...prev, { 
        date: today, 
        wordsLearned: words, 
        speakingTimeMinutes: minutes,
        exercisesCompleted: exercises,
        averageScore: score
      }];
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
        setIsGrammarOpen(true);
        break;
      case 'Vocabulary':
        setIsExerciseOpen(true);
        break;
      case 'Listening':
        setIsListeningOpen(true);
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

      <main className="max-w-5xl mx-auto pt-16 pb-32 px-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <Activity size={16} />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-orange-500/80">LANG EASY</span>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
              {GREETINGS[currentLanguage] || 'Hello'}, Sreeragh!
            </h1>
            <p className="text-zinc-500 text-sm font-medium">Just don't Quit</p>
          </div>
          
          <div className="flex items-center gap-2 bg-zinc-900/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span className="text-sm">{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}</span>
              <select 
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className="bg-transparent text-white text-xs font-bold uppercase tracking-widest outline-none border-none cursor-pointer appearance-none pr-2"
              >
                {SUPPORTED_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <Languages size={14} className="text-orange-500" />
              <select 
                value={level}
                onChange={(e) => setLevel(e.target.value as LanguageLevel)}
                className="bg-transparent text-white text-xs font-bold uppercase tracking-widest outline-none border-none cursor-pointer appearance-none pr-2"
              >
                <option value="A1">Level A1</option>
                <option value="A2">Level A2</option>
                <option value="B1">Level B1</option>
                <option value="B2">Level B2</option>
                <option value="C1">Level C1</option>
              </select>
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 hover:bg-white/5 rounded-xl transition-all text-zinc-400 hover:text-white"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="space-y-8">
                {/* Progress & Stats */}
                <ProgressMeter data={progress} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={160} className="text-orange-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-orange-500/20">
                        <Mic size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight mb-3 tracking-tight">Ready for a<br />new challenge?</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed mb-8">Your Buddy is waiting for a chat. Try a role play scenario today!</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('roleplay')}
                      className="relative z-10 w-full bg-white text-black font-black text-xs uppercase tracking-widest py-4 rounded-2xl hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      Start Role Play 
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Deep Dive</h3>
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Grammar', icon: <Sparkles size={18} />, color: 'text-blue-400', bg: 'bg-blue-400/10', action: 'Grammar Check' },
                        { label: 'Vocab', icon: <Book size={18} />, color: 'text-purple-400', bg: 'bg-purple-400/10', action: 'Vocabulary' },
                        { label: 'Listening', icon: <Volume2 size={18} />, color: 'text-green-400', bg: 'bg-green-400/10', action: 'Listening' },
                        { label: 'Settings', icon: <Settings size={18} />, color: 'text-zinc-400', bg: 'bg-zinc-400/10', action: 'Settings' },
                      ].map((action, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleQuickAction(action.action)}
                          className="group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-orange-500/30 hover:bg-white/10 transition-all flex flex-col items-center gap-3 text-center"
                        >
                          <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", action.bg, action.color)}>
                            {action.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
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
              <LearningLibrary 
                words={vocabulary} 
                grammarTips={grammarTips}
                onRemoveWord={handleRemoveWord}
                onRemoveGrammarTip={handleRemoveGrammarTip}
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
              <RolePlaySelector 
                onSelect={handleStartSpeaking} 
                customScenario={customScenario}
                onSaveCustom={setCustomScenario}
                onDeleteCustom={() => setCustomScenario(null)}
                scenarios={rolePlayScenarios}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSpeaking && selectedScenario && (
          <SpeakingInterface 
            level={level}
            speakingStyle={speakingStyle}
            context={selectedScenario.context}
            scenarioId={selectedScenario.id}
            initialMessages={history[selectedScenario.id] || []}
            vocabulary={vocabulary}
            onClose={handleCloseSpeaking}
            onNewWord={handleNewWord}
            onNewGrammarTip={handleNewGrammarTip}
            onSpeakingTimeUpdate={(mins) => updateProgress(0, mins)}
            onLevelChange={setLevel}
            onSpeedChange={setSpeed}
            autoMicOnDelay={autoMicOnDelay}
            autoMicOffDelay={autoMicOffDelay}
            isAutoMode={isAutoMode}
            speed={speed}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListeningOpen && (
          <ListeningInterface 
            level={level}
            language={currentLanguage}
            onClose={() => setIsListeningOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExerciseOpen && (
          <AdaptiveExercise 
            level={level}
            vocabulary={vocabulary}
            grammarTips={grammarTips}
            onClose={() => setIsExerciseOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGrammarOpen && (
          <GrammarInterface 
            level={level}
            language={currentLanguage}
            onClose={() => setIsGrammarOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
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
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Languages size={18} />
                    <span className="text-sm font-medium">Learning Level</span>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {(['A1', 'A2', 'B1', 'B2', 'C1'] as LanguageLevel[]).map((l) => (
                      <button
                        key={l}
                        onClick={() => setTempSettings(prev => ({ ...prev, level: l }))}
                        className={cn(
                          "py-2 rounded-xl text-sm font-bold transition-all",
                          tempSettings.level === l 
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
                    <Sparkles size={18} />
                    <span className="text-sm font-medium">Speaking Style</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Formal', 'Casual'] as SpeakingStyle[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => setTempSettings(prev => ({ ...prev, speakingStyle: s }))}
                        className={cn(
                          "py-3 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1",
                          tempSettings.speakingStyle === s 
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                            : "bg-white/5 text-zinc-400 hover:bg-white/10"
                        )}
                      >
                        <span>{s}</span>
                        <span className="text-[10px] font-normal opacity-70">
                          {s === 'Formal' ? 'Proper German' : 'Native Casual'}
                        </span>
                      </button>
                    ))}
                  </div>
                  {tempSettings.speakingStyle === 'Casual' && (
                    <p className="text-[10px] text-zinc-500 italic px-2">
                      Casual mode uses street German, slang, and lighthearted topics. Perfect for chatting with a friend!
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-400">
                    <Volume2 size={18} />
                    <span className="text-sm font-medium">Microphone & Speed</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Auto-Mic Mode</span>
                      <button 
                        onClick={() => setTempSettings(prev => ({ ...prev, isAutoMode: !prev.isAutoMode }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all flex items-center px-1",
                          tempSettings.isAutoMode ? "bg-orange-500 justify-end" : "bg-zinc-700 justify-start"
                        )}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Buddy's Speaking Speed</span>
                        <span className="text-xs font-mono text-orange-500">{tempSettings.speed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1" 
                        value={tempSettings.speed}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Auto-On Delay</span>
                        <span className="text-xs font-mono text-orange-500">{tempSettings.autoMicOnDelay.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="5.0" 
                        step="0.5" 
                        value={tempSettings.autoMicOnDelay}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, autoMicOnDelay: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">Auto-Off Delay</span>
                        <span className="text-xs font-mono text-orange-500">{tempSettings.autoMicOffDelay.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="1.0" 
                        max="10.0" 
                        step="0.5" 
                        value={tempSettings.autoMicOffDelay}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, autoMicOffDelay: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        setTempSettings({
                          level: 'A1',
                          speed: 1.0,
                          autoMicOnDelay: 2.0,
                          autoMicOffDelay: 4.0,
                          isAutoMode: true,
                          speakingStyle: 'Formal'
                        });
                      }}
                      className="w-full py-2 text-[10px] font-black uppercase text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Reset to Default Settings
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-[0.98] transition-all"
                  >
                    <Save size={18} />
                    Save Settings
                  </button>
                </div>

                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full py-3 text-red-500/60 text-[10px] font-bold hover:text-red-500 transition-all"
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
