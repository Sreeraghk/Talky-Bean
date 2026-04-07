import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Book, LayoutDashboard, Settings, User, Plus, Sparkles, X, Languages, Volume2, Info, Activity, ChevronRight, Sun, Moon } from 'lucide-react';
import { SpeakingInterface } from './components/SpeakingInterface';
import { LearningLibrary } from './components/VocabularyLibrary';
import { ProgressMeter } from './components/ProgressMeter';
import { RolePlaySelector } from './components/RolePlaySelector';
import { NativeFluencyMirror } from './components/NativeFluencyMirror';
import { ListeningInterface } from './components/ListeningInterface';
import { AdaptiveExercise } from './components/AdaptiveExercise';
import { GrammarInterface } from './components/GrammarInterface';
import { ProfileSection } from './components/ProfileSection';
import { ListeningService } from './services/ListeningService';
import { FluencyService } from './services/FluencyService';
import { ThemeService, AppTheme } from './services/ThemeService';
import { LanguageLevel, VocabularyWord, ProgressData, RolePlayScenario, Message, ConversationHistory, GrammarTip, SpeakingStyle } from './types';
import { cn } from './lib/utils';
import { Save, UserCircle, Play } from 'lucide-react';
import { voiceService } from './services/VoiceService';
import { SUPPORTED_LANGUAGES, GREETINGS } from './config/languages';
import { getLanguageContent } from './data';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'roleplay' | 'profile'>('dashboard');
  const [theme, setThemeState] = useState<AppTheme>(ThemeService.getTheme());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningOpen, setIsListeningOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [isLevelSelectorOpen, setIsLevelSelectorOpen] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('de');
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(null);

  useEffect(() => {
    ThemeService.init();
    
    const handleThemeEvent = () => {
      const next = ThemeService.getTheme();
      setThemeState(next);
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    };
    window.addEventListener('theme-changed', handleThemeEvent);
    return () => window.removeEventListener('theme-changed', handleThemeEvent);
  }, []);

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

  // Migration effect for legacy data
  useEffect(() => {
    let changed = false;
    const migratedVocab = vocabulary.map(w => {
      const legacy = w as any;
      if (!w.word && legacy.german) {
        changed = true;
        return { ...w, word: legacy.german, translation: legacy.english || '' };
      }
      return w;
    });

    const migratedGrammar = grammarTips.map(t => {
      const legacy = t as any;
      if (!t.rule && legacy.german) {
        changed = true;
        return { ...t, rule: legacy.german, explanation: legacy.english || '' };
      }
      return t;
    });

    if (changed) {
      setVocabulary(migratedVocab);
      setGrammarTips(migratedGrammar);
    }
  }, []);

  useEffect(() => {
    // One-time clear of old vocabulary as requested
    const hasClearedVocab = localStorage.getItem('deutschbuddy_vocab_cleared_v1');
    if (!hasClearedVocab) {
      setVocabulary([]);
      localStorage.setItem('deutschbuddy_vocab_cleared_v1', 'true');
    }

    // One-time reset of fluency mirror as requested (due to AI echo bug)
    const hasResetFluency = localStorage.getItem('fluency_mirror_reset_v1');
    if (!hasResetFluency) {
      FluencyService.resetAssessment();
      localStorage.setItem('fluency_mirror_reset_v1', 'true');
    }
  }, []);

  useEffect(() => {
    // One-time microphone permission request on first run
    const initPermissions = async () => {
      const hasAsked = localStorage.getItem('mic_permission_asked_v1');
      if (!hasAsked) {
        const granted = await voiceService.requestPermissions();
        if (granted) {
          localStorage.setItem('mic_permission_asked_v1', 'true');
        }
      }
    };
    initPermissions();
  }, []);

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

  const handleNewWord = async (word: Omit<VocabularyWord, 'languageCode' | 'theme'>) => {
    // Check if word already exists
    const exists = vocabulary.some(w => (w.word || '').toLowerCase() === (word.word || '').toLowerCase() && w.languageCode === currentLanguage);
    if (exists) return;

    setVocabulary(prev => {
      // Re-check just in case
      if (prev.some(w => (w.word || '').toLowerCase() === (word.word || '').toLowerCase() && w.languageCode === currentLanguage)) return prev;
      return [...prev, { ...word, languageCode: currentLanguage }];
    });
    
    updateProgress(1, 0);
  };

  const handleNewGrammarTip = (tip: Omit<GrammarTip, 'languageCode'>) => {
    setGrammarTips(prev => {
      if (prev.some(t => (t.rule || '').toLowerCase() === (tip.rule || '').toLowerCase() && t.languageCode === currentLanguage)) return prev;
      return [...prev, { ...tip, languageCode: currentLanguage }];
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
        setActiveTab('library');
        break;
      case 'Listening':
        setIsListeningOpen(true);
        break;
      case 'Settings':
        setIsSettingsOpen(true);
        break;
    }
  };

  const handleToggleTheme = () => {
    ThemeService.toggleTheme();
  };

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-text-main font-sans selection:bg-accent/30 transition-colors duration-300 relative overflow-hidden",
      isGlitching && "glitch-effect"
    )}>
      {theme === 'midnight-neon' && <div className="floor-grid" />}
      {theme === 'y2k-kawaii' && <div className="holographic-overlay" />}
      {/* Sidebar / Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card-bg/80 backdrop-blur-2xl border border-app-border rounded-full px-6 py-3 flex items-center gap-8 shadow-app">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={cn("p-2 transition-all", activeTab === 'dashboard' ? "text-accent scale-110" : "text-text-muted hover:text-text-main")}
        >
          <LayoutDashboard size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('roleplay')}
          className={cn("p-2 transition-all", activeTab === 'roleplay' ? "text-accent scale-110" : "text-text-muted hover:text-text-main")}
        >
          <Sparkles size={24} />
        </button>
        <button 
          onClick={() => handleStartSpeaking()}
          className="bg-accent p-4 rounded-full -mt-12 shadow-xl shadow-accent/20 hover:scale-110 active:scale-95 transition-all"
        >
          <Mic size={28} className="text-white" />
        </button>
        <button 
          onClick={() => setActiveTab('library')}
          className={cn("p-2 transition-all", activeTab === 'library' ? "text-accent scale-110" : "text-text-muted hover:text-text-main")}
        >
          <Book size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("p-2 transition-all", activeTab === 'profile' ? "text-accent scale-110" : "text-text-muted hover:text-text-main")}
        >
          <User size={24} />
        </button>
      </nav>

      <main className="max-w-5xl mx-auto pt-16 pb-32 px-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div className="space-y-1">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tighter text-accent leading-none">
              Lang Easy
            </h1>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-text-muted tracking-tight">
                {GREETINGS[currentLanguage] || 'Hello'}, Sreeragh!
              </span>
              <p className="text-text-muted/60 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Just don't Quit</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 bg-card-bg/40 backdrop-blur-md p-1.5 rounded-2xl border border-app-border shadow-app w-full md:w-auto justify-center md:justify-start">
            <button 
              onClick={() => setIsLanguageSelectorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-card-soft rounded-xl border border-app-border hover:bg-card-bg transition-all group hover:shadow-sm shrink-0"
            >
              <span className="text-base">{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}</span>
              <span className="text-text-main text-[10px] font-black uppercase tracking-[0.2em]">
                {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}
              </span>
              <ChevronRight size={12} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all rotate-90" />
            </button>

            <button 
              onClick={() => setIsLevelSelectorOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-card-soft rounded-xl border border-app-border hover:bg-card-bg transition-all group hover:shadow-sm shrink-0"
            >
              <div className="w-5 h-5 bg-accent/10 rounded-lg flex items-center justify-center">
                <Languages size={12} className="text-accent" />
              </div>
              <span className="text-text-main text-[10px] font-black uppercase tracking-[0.2em] level-number">
                Level {level}
              </span>
              <ChevronRight size={12} className="text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all rotate-90" />
            </button>

            <div className="hidden sm:block w-px h-6 bg-app-border mx-1" />

            <button 
              onClick={handleToggleTheme}
              className="p-3 hover:bg-card-soft rounded-xl transition-all text-text-muted hover:text-text-main"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 hover:bg-card-soft rounded-xl transition-all text-text-muted hover:text-text-main"
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
                <div className="grid grid-cols-1 gap-8">
                  <NativeFluencyMirror />
                  <ProgressMeter data={progress} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card-bg border border-app-border rounded-card p-8 flex flex-col justify-between shadow-app relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles size={160} className="text-accent" />
                    </div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-accent/20">
                        <Mic size={24} />
                      </div>
                      <h3 className="text-2xl font-black text-text-main leading-tight mb-3 tracking-tight">Ready for a<br />new challenge?</h3>
                      <p className="text-text-muted text-sm leading-relaxed mb-8">Your Buddy is waiting for a chat. Try a role play scenario today!</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('roleplay')}
                      className="relative z-10 w-full bg-accent text-white font-black text-xs uppercase tracking-widest py-4 rounded-btn hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-accent/20"
                    >
                      Start Role Play 
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="bg-card-bg border border-app-border rounded-card p-8 space-y-6 shadow-app">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Deep Dive</h3>
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Grammar', icon: <Sparkles size={18} />, color: 'text-accent', bg: 'bg-accent/10', action: 'Grammar Check' },
                        { label: 'Vocab', icon: <Book size={18} />, action: 'Vocabulary' },
                        { label: 'Listening', icon: <Volume2 size={18} />, action: 'Listening' },
                        { label: 'Settings', icon: <Settings size={18} />, action: 'Settings' },
                      ].map((action, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleQuickAction(action.action)}
                          className="group bg-card-soft p-4 rounded-2xl border border-app-border hover:border-accent/30 hover:bg-card-bg transition-all flex flex-col items-center gap-3 text-center"
                        >
                          <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", action.bg, action.color)}>
                            {action.icon}
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted group-hover:text-text-main transition-colors">{action.label}</span>
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
                currentLanguage={currentLanguage}
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

          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProfileSection />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSpeaking && selectedScenario && (
          <SpeakingInterface 
            level={level}
            languageCode={currentLanguage}
            speakingStyle={speakingStyle}
            context={selectedScenario.context}
            scenarioId={selectedScenario.id}
            initialMessages={[]} // Always start fresh as requested
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
            language={currentLanguage}
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
            onNewWord={handleNewWord}
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
              className="absolute inset-0 bg-card-bg/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card-bg border border-app-border w-full max-w-md rounded-card overflow-hidden shadow-app relative z-10"
            >
              <div className="p-6 border-b border-app-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-text-main">App Settings</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-card-soft rounded-full transition-colors text-text-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-text-muted">
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
                            ? "bg-accent text-white shadow-lg shadow-accent/20" 
                            : "bg-card-soft text-text-muted hover:bg-card-bg"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-text-muted">
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
                            ? "bg-accent text-white shadow-lg shadow-accent/20" 
                            : "bg-card-soft text-text-muted hover:bg-card-bg"
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
                    <p className="text-[10px] text-text-muted italic px-2">
                      Casual mode uses street German, slang, and lighthearted topics. Perfect for chatting with a friend!
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-text-muted">
                    <Volume2 size={18} />
                    <span className="text-sm font-medium">Microphone & Speed</span>
                  </div>
                  <div className="bg-card-soft p-4 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-text-main">Auto-Mic Mode</span>
                      <button 
                        onClick={() => setTempSettings(prev => ({ ...prev, isAutoMode: !prev.isAutoMode }))}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all flex items-center px-1",
                          tempSettings.isAutoMode ? "bg-accent justify-end" : "bg-app-border justify-start"
                        )}
                      >
                        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Buddy's Speaking Speed</span>
                        <span className="text-xs font-mono text-accent">{tempSettings.speed.toFixed(1)}x</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.5" 
                        step="0.1" 
                        value={tempSettings.speed}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-app-border rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Auto-On Delay</span>
                        <span className="text-xs font-mono text-accent">{tempSettings.autoMicOnDelay.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="10.0" 
                        step="0.5" 
                        value={tempSettings.autoMicOnDelay}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, autoMicOnDelay: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-app-border rounded-lg appearance-none cursor-pointer accent-accent"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted">Auto-Off Delay</span>
                        <span className="text-xs font-mono text-accent">{tempSettings.autoMicOffDelay.toFixed(1)}s</span>
                      </div>
                      <input 
                        type="range" 
                        min="1.0" 
                        max="10.0" 
                        step="0.5" 
                        value={tempSettings.autoMicOffDelay}
                        onChange={(e) => setTempSettings(prev => ({ ...prev, autoMicOffDelay: parseFloat(e.target.value) }))}
                        className="w-full h-1.5 bg-app-border rounded-lg appearance-none cursor-pointer accent-accent"
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
                      className="w-full py-2 text-[10px] font-black uppercase text-text-muted hover:text-text-main transition-colors"
                    >
                      Reset to Default Settings
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-app-border">
                  <button 
                    onClick={handleSaveSettings}
                    className="w-full py-4 bg-accent text-white rounded-btn font-bold flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
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

        {/* Custom Language Selector Modal */}
        {isLanguageSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLanguageSelectorOpen(false)}
              className="absolute inset-0 bg-card-bg/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card-bg border border-app-border w-full max-w-md rounded-card overflow-hidden shadow-app relative z-10"
            >
              <div className="p-8 border-b border-app-border flex items-center justify-between bg-card-soft/30">
                <div>
                  <h3 className="text-3xl font-black text-text-main tracking-tighter">Choose Language</h3>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Select your target language</p>
                </div>
                <button 
                  onClick={() => setIsLanguageSelectorOpen(false)}
                  className="p-3 hover:bg-card-soft rounded-2xl transition-colors text-text-muted hover:text-text-main border border-transparent hover:border-app-border"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-3">
                {SUPPORTED_LANGUAGES.map((lang, index) => (
                  <motion.button
                    key={lang.code}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      if (lang.isLocked) {
                        setError(`${lang.name} is currently locked. We are focusing on German for now!`);
                        return;
                      }
                      setCurrentLanguage(lang.code);
                      setIsLanguageSelectorOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all relative overflow-hidden group",
                      currentLanguage === lang.code 
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" 
                        : "bg-card-soft border-app-border hover:border-accent/30 hover:bg-card-bg text-text-main",
                      lang.isLocked && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {currentLanguage === lang.code && (
                      <motion.div 
                        layoutId="active-lang-bg"
                        className="absolute inset-0 bg-accent"
                      />
                    )}
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm transition-transform group-hover:scale-110",
                        currentLanguage === lang.code ? "bg-white/20" : "bg-card-bg"
                      )}>
                        {lang.flag}
                      </div>
                      <div className="text-left">
                        <div className={cn(
                          "text-lg font-black uppercase tracking-widest leading-none",
                          currentLanguage === lang.code ? "text-white" : "text-text-main"
                        )}>
                          {lang.name}
                        </div>
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70",
                          currentLanguage === lang.code ? "text-white" : "text-text-muted"
                        )}>
                          {lang.nativeName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      {lang.isLocked ? (
                        <div className="bg-black/20 p-2 rounded-xl">
                          <Settings size={16} className="text-white/50" />
                        </div>
                      ) : (
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          currentLanguage === lang.code ? "border-white bg-white" : "border-app-border"
                        )}>
                          {currentLanguage === lang.code && <div className="w-2 h-2 bg-accent rounded-full" />}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Custom Level Selector Modal */}
        {isLevelSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLevelSelectorOpen(false)}
              className="absolute inset-0 bg-card-bg/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card-bg border border-app-border w-full max-w-md rounded-card overflow-hidden shadow-app relative z-10"
            >
              <div className="p-8 border-b border-app-border flex items-center justify-between bg-card-soft/30">
                <div>
                  <h3 className="text-3xl font-black text-text-main tracking-tighter">Proficiency</h3>
                  <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mt-1">Adjust your learning pace</p>
                </div>
                <button 
                  onClick={() => setIsLevelSelectorOpen(false)}
                  className="p-3 hover:bg-card-soft rounded-2xl transition-colors text-text-muted hover:text-text-main border border-transparent hover:border-app-border"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 gap-3">
                {(['A1', 'A2', 'B1', 'B2', 'C1'] as LanguageLevel[]).map((l, index) => (
                  <motion.button
                    key={l}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setLevel(l);
                      setIsLevelSelectorOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between p-5 rounded-3xl border-2 transition-all relative overflow-hidden group",
                      level === l 
                        ? "bg-accent border-accent text-white shadow-lg shadow-accent/20" 
                        : "bg-card-soft border-app-border hover:border-accent/30 hover:bg-card-bg text-text-main"
                    )}
                  >
                    <div className="flex items-center gap-5 relative z-10">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-110 level-number",
                        level === l ? "bg-white text-accent" : "bg-card-bg text-text-muted"
                      )}>
                        {l}
                      </div>
                      <div className="text-left">
                        <div className={cn(
                          "text-lg font-black uppercase tracking-widest leading-none",
                          level === l ? "text-white" : "text-text-main"
                        )}>
                          Level {l}
                        </div>
                        <div className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70",
                          level === l ? "text-white" : "text-text-muted"
                        )}>
                          {l === 'A1' && 'Beginner'}
                          {l === 'A2' && 'Elementary'}
                          {l === 'B1' && 'Intermediate'}
                          {l === 'B2' && 'Upper Intermediate'}
                          {l === 'C1' && 'Advanced'}
                        </div>
                      </div>
                    </div>
                    <div className="relative z-10">
                      <div className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                        level === l ? "border-white bg-white" : "border-app-border"
                      )}>
                        {level === l && <div className="w-2 h-2 bg-accent rounded-full" />}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
