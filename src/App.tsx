import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AI_CONFIG } from './config/aiConfig';
import { Mic, Book, LayoutDashboard, Settings, User, Users, Plus, Sparkles, X, Languages, Volume2, Info, Activity, ChevronRight, ChevronDown, ClipboardCheck, Wand2, Zap, Brain, ShieldCheck } from 'lucide-react';
import { PublicLandingPage } from './components/PublicLandingPage';
import { WorkspaceSkeleton } from './components/WorkspaceSkeleton';
import { ProgressMeter } from './components/ProgressMeter';
import { LoginScreen } from './components/LoginScreen';
import { LegalDocumentView } from './components/LegalDocumentView';
import { ExternalDeletionPage } from './components/ExternalDeletionPage';
import { AgeVerificationModal } from './components/AgeVerificationModal';
import { CustomerComplaintModal } from './components/CustomerComplaintModal';

// Direct static imports for instantaneous zero-latency navigation
import { SpeakingInterface } from './components/SpeakingInterface';
import { LearningLibrary } from './components/VocabularyLibrary';
import { RolePlaySelector } from './components/RolePlaySelector';
import { ConversationBuddy } from './components/ConversationBuddy';
import { NativeFluencyMirror } from './components/NativeFluencyMirror';
import { ListeningInterface } from './components/ListeningInterface';
import { AdaptiveAssessmentHub } from './components/adaptive/AdaptiveAssessmentHub';
import { GrammarInterface } from './components/GrammarInterface';
import { ProfileSection } from './components/ProfileSection';
import { SettingsSection } from './components/SettingsSection';
import { ReadingInterface } from './components/ReadingInterface';
import { AdminDashboard } from './components/AdminDashboard';
import { DeveloperConsole } from './components/DeveloperConsole';

const ADMIN_UID = 'jruhO3mtqrcBDUxJ2CuPJhs2clf1';
import { ListeningService } from './services/ListeningService';
import { FluencyService } from './services/FluencyService';
import { ThemeService, AppTheme } from './services/ThemeService';
import { LanguageLevel, VocabularyWord, ProgressData, RolePlayScenario, Message, ConversationHistory, GrammarTip, SpeakingStyle, FluencyAssessment } from './types';
import { cn, checkNetworkStatus } from './lib/utils';
import { Save, UserCircle, Play, Loader2 } from 'lucide-react';
import { voiceService } from './services/VoiceService';
import { SUPPORTED_LANGUAGES, GREETINGS } from './config/languages';
import { getLanguageContent } from './data';
import { platformService } from './services/PlatformService';
import { StorageService } from './services/StorageService';
import { CloudStatsService } from './services/CloudStatsService';
import { UserService } from './services/UserService';
import { SubscriptionService } from './services/SubscriptionService';
import { DeveloperWhitelistService } from './services/DeveloperWhitelistService';
import { SubscriptionPaywallModal } from './components/SubscriptionPaywallModal';
import { OnboardingWizard } from './components/OnboardingWizard';
import { LocalizationService } from './services/LocalizationService';
import { VocabularyService } from './services/VocabularyService';
import { DailyTaskCard } from './components/DailyTaskCard';
import { DailyTaskService, DailyTask } from './services/DailyTaskService';
import { App as CapacitorApp } from '@capacitor/app';

export default function App() {
  const [activeTab, rawSetActiveTab] = useState<'dashboard' | 'library' | 'roleplay' | 'settings' | 'profile' | 'buddy'>(() => {
    const saved = localStorage.getItem('langeasy_active_tab') || localStorage.getItem('deutschbuddy_active_tab');
    if (saved === 'dashboard' || saved === 'library' || saved === 'roleplay' || saved === 'settings' || saved === 'profile' || saved === 'buddy') {
      return (saved === 'profile' ? 'settings' : saved) as any;
    }
    return 'dashboard';
  });
  
  // MIGRATION: One-time migration of legacy (presumably German) data to partitioned maps
  useEffect(() => {
    const hasMigratedToMaps = localStorage.getItem('langeasy_maps_migrated_v1');
    if (!hasMigratedToMaps) {
      console.log("[App] Starting map-based storage migration...");
      
      const legacyLang = localStorage.getItem('langeasy_language') || 'de';
      
      // Migrate Vocabulary
      const legacyVocab = localStorage.getItem('langeasy_vocab');
      if (legacyVocab) {
        try {
          const parsed = JSON.parse(legacyVocab);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setVocabByLang(prev => ({ ...prev, [legacyLang]: parsed }));
          }
        } catch (e) {}
      }

      // Migrate Grammar
      const legacyGrammar = localStorage.getItem('langeasy_grammar');
      if (legacyGrammar) {
        try {
          const parsed = JSON.parse(legacyGrammar);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setGrammarByLang(prev => ({ ...prev, [legacyLang]: parsed }));
          }
        } catch (e) {}
      }

      // Migrate History
      const legacyHistory = localStorage.getItem('langeasy_history');
      if (legacyHistory) {
        try {
          const parsed = JSON.parse(legacyHistory);
          if (parsed && typeof parsed === 'object') {
            setHistoryByLang(prev => ({ ...prev, [legacyLang]: parsed }));
          }
        } catch (e) {}
      }

      // Migrate Level
      const legacyLevel = localStorage.getItem('langeasy_level');
      if (legacyLevel) {
        setLevelByLang(prev => ({ ...prev, [legacyLang]: legacyLevel as LanguageLevel }));
      }

      localStorage.setItem('langeasy_maps_migrated_v1', 'true');
      console.log("[App] Migration to map-based storage complete.");
    }
  }, []);

  const [theme, setThemeState] = useState<AppTheme>(ThemeService.getTheme());

  useEffect(() => {
    const handleThemeChange = () => {
      setThemeState(ThemeService.getTheme());
    };
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListeningOpen, setIsListeningOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isGrammarOpen, setIsGrammarOpen] = useState(false);
  const [isReadingOpen, setIsReadingOpen] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState(() => {
    return StorageService.load('native_language', undefined, 'en');
  });
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(() => {
    return StorageService.load('onboarding_completed', undefined, true);
  });
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return StorageService.load('language', undefined, 'de');
  });

  const [levelByLang, setLevelByLang] = useState<Record<string, LanguageLevel>>(() => {
    return StorageService.load<Record<string, LanguageLevel>>('level_by_lang', undefined, {});
  });

  const [vocabByLang, setVocabByLang] = useState<Record<string, VocabularyWord[]>>(() => {
    const raw = StorageService.load<Record<string, VocabularyWord[]>>('vocab_by_lang', undefined, {});
    const normalizedInitial: Record<string, VocabularyWord[]> = {};
    for (const [lang, list] of Object.entries(raw || {})) {
      normalizedInitial[lang] = VocabularyService.normalizeVocabularyList(list || [], lang).normalized;
    }
    return normalizedInitial;
  });

  const [grammarByLang, setGrammarByLang] = useState<Record<string, GrammarTip[]>>(() => {
    return StorageService.load<Record<string, GrammarTip[]>>('grammar_by_lang', undefined, {});
  });

  const [historyByLang, setHistoryByLang] = useState<Record<string, ConversationHistory>>(() => {
    return StorageService.load<Record<string, ConversationHistory>>('history_by_lang', undefined, {});
  });

  const level = levelByLang[currentLanguage] || 'A1';
  const vocabulary = vocabByLang[currentLanguage] || [];
  const grammarTips = grammarByLang[currentLanguage] || [];
  const history = historyByLang[currentLanguage] || {};

  const languageContent = getLanguageContent(currentLanguage);
  const rolePlayScenarios = languageContent.rolePlayScenarios;

  const setLevel = (newLevel: LanguageLevel) => {
    setLevelByLang(prev => ({ ...prev, [currentLanguage]: newLevel }));
  };

  const setVocabulary = (newVocab: VocabularyWord[] | ((prev: VocabularyWord[]) => VocabularyWord[])) => {
    setVocabByLang(prev => {
      const current = prev[currentLanguage] || [];
      const updated = typeof newVocab === 'function' ? newVocab(current) : newVocab;
      return { ...prev, [currentLanguage]: updated };
    });
  };

  const setGrammarTips = (newGrammar: GrammarTip[] | ((prev: GrammarTip[]) => GrammarTip[])) => {
    setGrammarByLang(prev => {
      const current = prev[currentLanguage] || [];
      const updated = typeof newGrammar === 'function' ? newGrammar(current) : newGrammar;
      return { ...prev, [currentLanguage]: updated };
    });
  };

  const setHistory = (newHistory: ConversationHistory | ((prev: ConversationHistory) => ConversationHistory)) => {
    setHistoryByLang(prev => {
      const current = prev[currentLanguage] || {};
      const updated = typeof newHistory === 'function' ? newHistory(current) : newHistory;
      return { ...prev, [currentLanguage]: updated };
    });
  };

  const [error, setError] = useState<string | null>(null);
  const [networkStatus, setNetworkStatus] = useState<{
    onLine: boolean;
    speed: 'good' | 'poor';
    checking: boolean;
  }>({ onLine: true, speed: 'good', checking: false });
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const checkAppNetworkStatus = async () => {
    setNetworkStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await checkNetworkStatus();
      setNetworkStatus({ onLine: res.onLine, speed: res.speed, checking: false });
      if (res.onLine && res.speed === 'good') {
        setConnectionError(null);
      }
    } catch {
      setNetworkStatus({ onLine: true, speed: 'good', checking: false });
    }
  };

  const [selectedScenario, setSelectedScenario] = useState<RolePlayScenario | null>(() => {
    return StorageService.load<RolePlayScenario | null>('selected_scenario', currentLanguage, null);
  });
  
  const [currentDailyTask, setCurrentDailyTask] = useState<DailyTask | null>(null);
  const speakingStartTimeRef = useRef<number>(Date.now());
  
  const [speakingMessages, setSpeakingMessages] = useState<Message[]>(() => {
    return StorageService.load<Message[]>('speaking_messages', currentLanguage, []);
  });

  const [speed, setSpeed] = useState<number>(() => {
    const stored = StorageService.load<number | string | null>('speed', undefined, null)
      ?? StorageService.load<number | string | null>('speech_speed', undefined, null);
    if (stored !== null && stored !== undefined && stored !== '') {
      const parsed = typeof stored === 'number' ? stored : parseFloat(String(stored));
      if (Number.isFinite(parsed)) return Math.min(1.5, Math.max(0.5, parsed));
    }
    try {
      const legacy = localStorage.getItem('langeasy_speed') || localStorage.getItem('deutschbuddy_speed');
      if (legacy) {
        const parsed = parseFloat(legacy);
        if (Number.isFinite(parsed)) {
          const clamped = Math.min(1.5, Math.max(0.5, parsed));
          StorageService.save('speed', clamped);
          return clamped;
        }
      }
    } catch {}
    return 1.0;
  });

  const [autoMicOnDelay, setAutoMicOnDelay] = useState<number>(() => {
    const stored = StorageService.load<number | string | null>('autoMicOnDelay', undefined, null)
      ?? StorageService.load<number | string | null>('auto_mic_delay', undefined, null);
    if (stored !== null && stored !== undefined && stored !== '') {
      const parsed = typeof stored === 'number' ? stored : parseFloat(String(stored));
      if (Number.isFinite(parsed)) return Math.min(10.0, Math.max(1.0, parsed));
    }
    try {
      const legacy = localStorage.getItem('autoMicOnDelay');
      if (legacy) {
        const parsed = parseFloat(legacy);
        if (Number.isFinite(parsed)) {
          const clamped = Math.min(10.0, Math.max(1.0, parsed));
          StorageService.save('autoMicOnDelay', clamped);
          return clamped;
        }
      }
    } catch {}
    return 2.0;
  });

  const [isAutoMode, setIsAutoMode] = useState<boolean>(() => {
    const stored = StorageService.load<boolean | string | null>('isAutoMode', undefined, null);
    if (typeof stored === 'boolean') return stored;
    if (stored === 'true' || stored === 'false') return stored === 'true';
    try {
      const legacy = localStorage.getItem('isAutoMode');
      if (legacy !== null) {
        const boolVal = legacy === 'true';
        StorageService.save('isAutoMode', boolVal);
        return boolVal;
      }
    } catch {}
    return true;
  });

  const [speakingStyle, setSpeakingStyle] = useState<SpeakingStyle>(() => {
    const stored = StorageService.load<string | null>('speaking_style', undefined, null);
    if (stored === 'Formal' || stored === 'Casual') return stored;
    try {
      const legacy = localStorage.getItem('langeasy_speaking_style') || localStorage.getItem('deutschbuddy_speaking_style');
      if (legacy === 'Formal' || legacy === 'Casual') {
        StorageService.save('speaking_style', legacy);
        return legacy;
      }
    } catch {}
    return 'Formal';
  });

  const preferencesUpdatedAtRef = useRef<number>(
    StorageService.load<number>('preferences_updated_at', undefined, 0) || 0
  );
  const prefsRef = useRef({ speed, autoMicOnDelay, isAutoMode, speakingStyle });
  useEffect(() => {
    prefsRef.current = { speed, autoMicOnDelay, isAutoMode, speakingStyle };
  }, [speed, autoMicOnDelay, isAutoMode, speakingStyle]);

  const persistPreferencesUpdate = (partial: Partial<{
    speed: number;
    autoMicOnDelay: number;
    isAutoMode: boolean;
    speakingStyle: SpeakingStyle;
  }>) => {
    const next = { ...prefsRef.current, ...partial };
    prefsRef.current = next;
    const now = Date.now();
    preferencesUpdatedAtRef.current = now;

    if (partial.speed !== undefined) {
      StorageService.save('speed', next.speed);
      try {
        localStorage.removeItem('langeasy_speed');
        localStorage.removeItem('deutschbuddy_speed');
      } catch {}
    }
    if (partial.autoMicOnDelay !== undefined) {
      StorageService.save('autoMicOnDelay', next.autoMicOnDelay);
      try {
        localStorage.removeItem('autoMicOnDelay');
      } catch {}
    }
    if (partial.isAutoMode !== undefined) {
      StorageService.save('isAutoMode', next.isAutoMode);
      try {
        localStorage.removeItem('isAutoMode');
      } catch {}
    }
    if (partial.speakingStyle !== undefined) {
      StorageService.save('speaking_style', next.speakingStyle);
      try {
        localStorage.removeItem('langeasy_speaking_style');
        localStorage.removeItem('deutschbuddy_speaking_style');
      } catch {}
    }
    StorageService.save('preferences_updated_at', now);

    CloudStatsService.syncPreferences({
      speed: next.speed,
      autoMicOnDelay: next.autoMicOnDelay,
      isAutoMode: next.isAutoMode,
      speakingStyle: next.speakingStyle,
      updatedAt: now
    });
  };

  const handleSpeedChange = (spd: number) => {
    const clamped = Math.min(1.5, Math.max(0.5, Number(spd.toFixed(1))));
    setSpeed(clamped);
    persistPreferencesUpdate({ speed: clamped });
  };

  const handleAutoMicOnDelayChange = (delay: number) => {
    const clamped = Math.min(10.0, Math.max(1.0, Number(delay.toFixed(1))));
    setAutoMicOnDelay(clamped);
    persistPreferencesUpdate({ autoMicOnDelay: clamped });
  };

  const handleAutoModeChange = (auto: boolean) => {
    setIsAutoMode(auto);
    persistPreferencesUpdate({ isAutoMode: auto });
  };

  const handleSpeakingStyleChange = (style: SpeakingStyle) => {
    setSpeakingStyle(style);
    persistPreferencesUpdate({ speakingStyle: style });
  };

  const [lastDeletedWords, setLastDeletedWords] = useState<VocabularyWord[]>([]);
  const [lastTimelineRemovedIds, setLastTimelineRemovedIds] = useState<string[]>([]);
  const [lastUnbookmarkedIds, setLastUnbookmarkedIds] = useState<string[]>([]);

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
    // One-time clear of old vocabulary as requested - V2 for forced re-sync
    const hasClearedVocab = localStorage.getItem('deutschbuddy_vocab_cleared_v2');
    if (!hasClearedVocab) {
      setVocabulary([]);
      localStorage.setItem('deutschbuddy_vocab_cleared_v2', 'true');
    }

    // Clear stuck modal overlay keys from legacy localStorage
    ['langeasy_is_speaking', 'deutschbuddy_is_speaking', 'langeasy_is_listening_open', 'deutschbuddy_is_listening_open', 'langeasy_is_exercise_open', 'deutschbuddy_is_exercise_open', 'langeasy_is_grammar_open', 'deutschbuddy_is_grammar_open', 'langeasy_is_reading_open', 'deutschbuddy_is_reading_open', 'langeasy_is_settings_open', 'deutschbuddy_is_settings_open'].forEach(k => localStorage.removeItem(k));

    // One-time reset of fluency mirror as requested (due to AI echo bug)
    const hasResetFluency = localStorage.getItem('fluency_mirror_reset_v1');
    if (!hasResetFluency) {
      FluencyService.resetAssessment(currentLanguage);
      localStorage.setItem('fluency_mirror_reset_v1', 'true');
    }

    // One-time filter of vocabulary to remove grammar tips that shouldn't be there
    const hasCleanedInternalVocab = localStorage.getItem('vocab_grammar_cleanup_v1');
    if (!hasCleanedInternalVocab) {
      setVocabulary(prev => prev.filter(w => w.word.length <= 40 && !w.word.includes(':')));
      localStorage.setItem('vocab_grammar_cleanup_v1', 'true');
    }

    // Continuous lexicon-backed in-place repair of existing vocabulary across all languages
    // so every entry is guaranteed to follow canonical order: word = English, translation = Target Language
    VocabularyService.normalizeAllVocabByLangAsync(vocabByLang)
      .then(({ nextMap, changed }) => {
        if (changed) {
          setVocabByLang(nextMap);
        }
      })
      .catch(err => console.warn('[VocabNormalizer] Async lexicon normalization notice:', err));
  }, []);

  useEffect(() => {
    // Ensure lexicon for active language is loaded and current language vocabulary is normalized in place
    let active = true;
    VocabularyService.ensureLexiconLoaded(currentLanguage)
      .then(() => {
        if (!active) return;
        setVocabByLang(prev => {
          const currentList = prev[currentLanguage] || [];
          const { normalized, changed } = VocabularyService.normalizeVocabularyList(currentList, currentLanguage);
          if (!changed) return prev;
          return { ...prev, [currentLanguage]: normalized };
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [currentLanguage]);

  useEffect(() => {
    // One-time microphone permission request on first run
    const initPermissions = async () => {
      const hasAsked = StorageService.load('mic_permission_asked_v1', undefined, false);
      if (!hasAsked) {
        const granted = await voiceService.requestPermissions();
        if (granted) {
          StorageService.save('mic_permission_asked_v1', true);
        }
      }
    };
    initPermissions();
  }, []);

  useEffect(() => {
    checkAppNetworkStatus();
    
    const handleOnlineEvent = () => {
      checkAppNetworkStatus();
    };
    const handleOfflineEvent = () => {
      setNetworkStatus({ onLine: false, speed: 'poor', checking: false });
    };

    window.addEventListener('online', handleOnlineEvent);
    window.addEventListener('offline', handleOfflineEvent);

    const intervalId = setInterval(() => {
      checkAppNetworkStatus();
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      window.removeEventListener('offline', handleOfflineEvent);
      clearInterval(intervalId);
    };
  }, []);

  const [customScenarioByLang, setCustomScenarioByLang] = useState<Record<string, RolePlayScenario | null>>(() => {
    return StorageService.load<Record<string, RolePlayScenario | null>>('custom_scenario_by_lang', undefined, {});
  });

  const customScenario = customScenarioByLang[currentLanguage] || null;
  const setCustomScenario = (scenario: RolePlayScenario | null) => {
    setCustomScenarioByLang(prev => ({ ...prev, [currentLanguage]: scenario }));
  };

  const [progressByLanguage, setProgressByLanguage] = useState<Record<string, ProgressData[]>>(() => {
    return StorageService.load<Record<string, ProgressData[]>>('progress_by_lang', undefined, {});
  });

  const [user, setUser] = useState<any>(null);
  const [adminViewMode, rawSetAdminViewMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('talkybean_admin_view_mode') === 'true';
    } catch {
      return false;
    }
  });
  const setAdminViewMode = (val: boolean) => {
    rawSetAdminViewMode(val);
    try {
      localStorage.setItem('talkybean_admin_view_mode', String(val));
    } catch {}
  };
  const isAdminUser = Boolean(
    user && (
      user.uid === ADMIN_UID || 
      user.email?.toLowerCase() === 'sreeraghk@gmail.com' ||
      DeveloperWhitelistService.isAdmin()
    )
  );
  const [showAdminConsole, setShowAdminConsole] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(false);
  const [showLogin, setShowLogin] = useState<boolean>(false);

  const [legalModalDoc, setLegalModalDoc] = useState<'terms' | 'privacy' | null>(null);

  // 18+ Adult Eligibility State
  const [isAdultConfirmed, setIsAdultConfirmed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('talkybean_age_confirmed_v1');
      if (stored !== null) return true;
      localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({ isAdultConfirmed: true, confirmedAt: Date.now() }));
      return true;
    } catch {
      return true;
    }
  });
  const [showAgeVerification, setShowAgeVerification] = useState<boolean>(false);

  // Customer Support & Complaints Modal State
  const [showSupportModal, setShowSupportModal] = useState<boolean>(false);

  // Decoupled Landing Shell vs App Workspace vs Legal Policy vs External Deletion routing (/app vs / vs /terms vs /privacy vs /delete-account)
  const [viewMode, setViewMode] = useState<'landing' | 'app' | 'terms' | 'privacy' | 'delete-account'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const search = window.location.search;
      if (path.startsWith('/delete-account') || search.includes('page=delete-account') || search.includes('doc=delete-account')) {
        return 'delete-account';
      }
      if (path.startsWith('/terms') || search.includes('page=terms') || search.includes('doc=terms')) {
        return 'terms';
      }
      if (path.startsWith('/privacy') || search.includes('page=privacy') || search.includes('doc=privacy')) {
        return 'privacy';
      }
      if (path.startsWith('/landing') || search.includes('mode=landing') || search.includes('landing=true')) {
        return 'landing';
      }
    }
    return 'app';
  });

  const navigateTo = (mode: 'landing' | 'app' | 'terms' | 'privacy' | 'delete-account') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      const pathMap: Record<string, string> = {
        app: '/',
        landing: '/landing',
        terms: '/terms',
        privacy: '/privacy',
        'delete-account': '/delete-account'
      };
      const targetPath = pathMap[mode] || '/';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({}, '', targetPath);
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const search = window.location.search;
        if (path.startsWith('/delete-account') || search.includes('page=delete-account') || search.includes('doc=delete-account')) {
          setViewMode('delete-account');
        } else if (path.startsWith('/terms') || search.includes('page=terms') || search.includes('doc=terms')) {
          setViewMode('terms');
        } else if (path.startsWith('/privacy') || search.includes('page=privacy') || search.includes('doc=privacy')) {
          setViewMode('privacy');
        } else if (path.startsWith('/landing') || search.includes('mode=landing') || search.includes('landing=true')) {
          setViewMode('landing');
        } else {
          setViewMode('app');
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Gated premium attributes
  const [subscription, setSubscription] = useState(() => SubscriptionService.getSubscriptionState());
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  // Free trial calculations
  const isOnFreeTrial = !isAdminUser && subscription.platform === 'free_trial' && subscription.isActive;
  let trialStartFormatted = '';
  let trialEndFormatted = '';
  let daysRemaining = 0;
  let trialProgress = 0;

  if (isOnFreeTrial) {
    const expiresMs = subscription.trialExpiresAt || subscription.expiresAt || Date.now();
    const durationMs = (subscription.trialStartDate && expiresMs > subscription.trialStartDate)
      ? (expiresMs - subscription.trialStartDate)
      : 14 * 24 * 60 * 60 * 1000;
    const startMs = subscription.trialStartDate || (expiresMs - durationMs);
    
    const startDt = new Date(startMs);
    const endDt = new Date(expiresMs);
    
    trialStartFormatted = startDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    trialEndFormatted = endDt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const nowMs = Date.now();
    const minDiff = expiresMs - nowMs;
    daysRemaining = Math.max(0, Math.ceil(minDiff / (1000 * 60 * 60 * 24)));
    
    // Calculate remaining percentage of the trial (100% at start, 0% at expiration)
    trialProgress = Math.max(0, Math.min(100, (minDiff / durationMs) * 100));
  }

  useEffect(() => {
    const handleSubChange = () => {
      setSubscription(SubscriptionService.getSubscriptionState());
    };
    window.addEventListener('subscription_change', handleSubChange);

    // Verify or synch device trial eligibility
    SubscriptionService.checkDeviceTrialEligibility().then(() => {
      setSubscription(SubscriptionService.getSubscriptionState());
    });

    return () => {
      window.removeEventListener('subscription_change', handleSubChange);
    };
  }, []);

  const setActiveTab = (tab: 'dashboard' | 'library' | 'roleplay' | 'settings' | 'profile' | 'buddy') => {
    const targetTab = tab === 'profile' ? 'settings' : tab;
    if (!user && targetTab !== 'dashboard' && targetTab !== 'settings') {
      setShowLogin(true);
      return;
    }
    // Block access to learning modules/menus if 18+ eligibility is unconfirmed
    if (user && !isAdminUser && !isAdultConfirmed && (targetTab === 'library' || targetTab === 'roleplay' || targetTab === 'buddy')) {
      setShowAgeVerification(true);
      return;
    }
    // Block access to learning modules/menus if subscription is inactive and not admin
    if (user && !isAdminUser && !subscription.isActive && (targetTab === 'library' || targetTab === 'roleplay' || targetTab === 'buddy')) {
      setShowPaywall(true);
      return;
    }
    rawSetActiveTab(targetTab);
  };

  const handleLanguageChange = (newLang: string, newLevel?: string) => {
    setCurrentLanguage(newLang);
    StorageService.save('language', newLang);
    if (newLevel) {
      setLevelByLang(prev => ({ ...prev, [newLang]: newLevel as LanguageLevel }));
      StorageService.save('level_by_lang', { ...levelByLang, [newLang]: newLevel });
    }
  };

  useEffect(() => {
    if (!user && activeTab !== 'dashboard') {
      rawSetActiveTab('dashboard');
    }
  }, [user, activeTab]);

  // Maintain current navigation/overlay state reference for hardware back-button handler
  const navigationStateRef = useRef({
    connectionError,
    showPaywall,
    showLogin,
    legalModalDoc,
    showSupportModal,
    viewMode,
    isListeningOpen,
    isExerciseOpen,
    isGrammarOpen,
    isReadingOpen,
    isSpeaking,
    selectedScenario,
    activeTab,
  });

  useEffect(() => {
    navigationStateRef.current = {
      connectionError,
      showPaywall,
      showLogin,
      legalModalDoc,
      showSupportModal,
      viewMode,
      isListeningOpen,
      isExerciseOpen,
      isGrammarOpen,
      isReadingOpen,
      isSpeaking,
      selectedScenario,
      activeTab,
    };
  }, [
    connectionError,
    showPaywall,
    showLogin,
    legalModalDoc,
    showSupportModal,
    viewMode,
    isListeningOpen,
    isExerciseOpen,
    isGrammarOpen,
    isReadingOpen,
    isSpeaking,
    selectedScenario,
    activeTab,
  ]);

  // Android Hardware Back-Button Support (Google Play Core Navigation Quality Compliance)
  useEffect(() => {
    if (!platformService.isNative()) return;

    let listenerHandle: any = null;
    CapacitorApp.addListener('backButton', () => {
      const state = navigationStateRef.current;

      // 1. Dismiss connection error overlay if visible
      if (state.connectionError) {
        setConnectionError(null);
        return;
      }

      // 2. Dismiss legal modal if open
      if (state.legalModalDoc) {
        setLegalModalDoc(null);
        return;
      }

      // Dismiss customer support modal if open
      if (state.showSupportModal) {
        setShowSupportModal(false);
        return;
      }

      // 3. Navigate back from legal full pages or delete-account
      if (state.viewMode === 'terms' || state.viewMode === 'privacy' || state.viewMode === 'delete-account') {
        navigateTo('landing');
        return;
      }

      // 4. Dismiss Paywall modal
      if (state.showPaywall) {
        setShowPaywall(false);
        return;
      }

      // 5. Dismiss Login screen / modal
      if (state.showLogin) {
        setShowLogin(false);
        return;
      }

      // 4. Dismiss interactive learning modules
      if (state.isListeningOpen) {
        setIsListeningOpen(false);
        return;
      }
      if (state.isExerciseOpen) {
        setIsExerciseOpen(false);
        return;
      }
      if (state.isGrammarOpen) {
        window.dispatchEvent(new CustomEvent('talkybean_grammar_back'));
        return;
      }
      if (state.isReadingOpen) {
        window.dispatchEvent(new CustomEvent('talkybean_reading_back'));
        return;
      }

      // 5. Exit active roleplay speaking session
      if (state.selectedScenario || state.isSpeaking) {
        setSelectedScenario(null);
        setIsSpeaking(false);
        return;
      }

      // 6. Navigate back to primary Dashboard if on a secondary tab
      if (state.activeTab !== 'dashboard') {
        rawSetActiveTab('dashboard');
        return;
      }

      // 7. If on root dashboard with no open modals, exit the app
      CapacitorApp.exitApp();
    }).then(handle => {
      listenerHandle = handle;
    }).catch(err => {
      console.warn('[Hardware Back Button] Registration notice:', err);
    });

    return () => {
      if (listenerHandle && typeof listenerHandle.remove === 'function') {
        listenerHandle.remove();
      }
    };
  }, []);

  useEffect(() => {
    const initialized = CloudStatsService.init((u) => {
      setUser(u);
      setAuthChecking(false);
      if (u) {
        // When user logs in, try to fetch remote stats
        CloudStatsService.getRemoteStats().then(remote => {
          if (remote) {
            if (remote.progress) {
              setProgressByLanguage(prev => {
                const merged: Record<string, ProgressData[]> = { ...prev };
                try {
                  if (Array.isArray(remote.progress)) {
                    // Stored as flat array (e.g. from task completion)
                    const targetLang = currentLanguage || 'de';
                    const localData = Array.isArray(merged[targetLang]) ? [...merged[targetLang]] : [];
                    remote.progress.forEach((remoteDay: any) => {
                      if (!remoteDay || typeof remoteDay !== 'object' || !remoteDay.date) return;
                      const localIndex = localData.findIndex(d => d && d.date === remoteDay.date);
                      if (localIndex > -1) {
                        if ((remoteDay.exercisesCompleted || 0) >= (localData[localIndex]?.exercisesCompleted || 0)) {
                          localData[localIndex] = { ...localData[localIndex], ...remoteDay };
                        }
                      } else {
                        localData.push(remoteDay);
                      }
                    });
                    merged[targetLang] = localData.sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
                  } else if (remote.progress && typeof remote.progress === 'object') {
                    Object.entries(remote.progress).forEach(([lang, remoteData]) => {
                      if (!Array.isArray(remoteData)) return;
                      const localData = Array.isArray(merged[lang]) ? [...merged[lang]] : [];
                      remoteData.forEach((remoteDay: any) => {
                        if (!remoteDay || typeof remoteDay !== 'object' || !remoteDay.date) return;
                        const localIndex = localData.findIndex(d => d && d.date === remoteDay.date);
                        if (localIndex > -1) {
                          if ((remoteDay.exercisesCompleted || 0) >= (localData[localIndex]?.exercisesCompleted || 0)) {
                            localData[localIndex] = { ...localData[localIndex], ...remoteDay };
                          }
                        } else {
                          localData.push(remoteDay);
                        }
                      });
                      merged[lang] = localData.sort((a, b) => String(a?.date || '').localeCompare(String(b?.date || '')));
                    });
                  }
                } catch (mergeErr) {
                  console.warn('[App] Progress remote merge notice:', mergeErr);
                }
                return merged;
              });
            }
            if (remote.fluency) {
              const all = StorageService.load<Record<string, FluencyAssessment>>('all_fluency_data', undefined, {});
              const updated = { ...all, ...remote.fluency };
              StorageService.save('all_fluency_data', updated);
              // Update individual language items too
              Object.entries(remote.fluency).forEach(([lang, assessment]) => {
                StorageService.save('fluency_v2', assessment, lang);
              });
            }
            if (remote.profile) {
              UserService.saveProfile(remote.profile);
              if (remote.profile.nativeLanguage) {
                StorageService.save('native_language', remote.profile.nativeLanguage);
                setNativeLanguage(remote.profile.nativeLanguage);
              }
              if (remote.profile.targetLanguage) {
                StorageService.save('language', remote.profile.targetLanguage);
                setCurrentLanguage(remote.profile.targetLanguage);
              }
              StorageService.save('onboarding_completed', true);
              setIsOnboardingCompleted(true);
            }
            if (remote.subscription) {
              const currentSub = SubscriptionService.getSubscriptionState();
              if (remote.subscription.isActive && (!currentSub.isActive || currentSub.platform !== remote.subscription.platform)) {
                SubscriptionService.saveSubscriptionState({
                  ...currentSub,
                  isActive: remote.subscription.isActive,
                  platform: remote.subscription.platform,
                  productId: remote.subscription.productId,
                  entitlementId: remote.subscription.entitlementId || 'le_premium',
                  expiresAt: remote.subscription.expiresAt || remote.subscription.trialExpiresAt,
                  trialUsed: remote.subscription.trialUsed,
                  trialExpiresAt: remote.subscription.trialExpiresAt,
                  trialStartDate: remote.subscription.trialStartDate || null
                });
              }
            }
            if (remote.preferences) {
              const remotePrefs = remote.preferences;
              const remoteTs = typeof remotePrefs.updatedAt === 'number' ? remotePrefs.updatedAt : 0;
              const localTs = preferencesUpdatedAtRef.current || 0;
              if (localTs === 0 || remoteTs > localTs) {
                if (typeof remotePrefs.speed === 'number' && Number.isFinite(remotePrefs.speed)) {
                  const clampedSpeed = Math.min(1.5, Math.max(0.5, remotePrefs.speed));
                  setSpeed(clampedSpeed);
                  StorageService.save('speed', clampedSpeed);
                }
                if (typeof remotePrefs.autoMicOnDelay === 'number' && Number.isFinite(remotePrefs.autoMicOnDelay)) {
                  const clampedDelay = Math.min(10.0, Math.max(1.0, remotePrefs.autoMicOnDelay));
                  setAutoMicOnDelay(clampedDelay);
                  StorageService.save('autoMicOnDelay', clampedDelay);
                }
                if (typeof remotePrefs.isAutoMode === 'boolean') {
                  setIsAutoMode(remotePrefs.isAutoMode);
                  StorageService.save('isAutoMode', remotePrefs.isAutoMode);
                }
                if (remotePrefs.speakingStyle === 'Formal' || remotePrefs.speakingStyle === 'Casual') {
                  setSpeakingStyle(remotePrefs.speakingStyle);
                  StorageService.save('speaking_style', remotePrefs.speakingStyle);
                }
                if (remoteTs > 0) {
                  preferencesUpdatedAtRef.current = remoteTs;
                  StorageService.save('preferences_updated_at', remoteTs);
                }
              } else if (localTs > remoteTs) {
                CloudStatsService.syncPreferences({
                  ...prefsRef.current,
                  updatedAt: localTs
                });
              }
            }
          }
        });

        // Verify adult eligibility status on server/cache
        CloudStatsService.getAdultConfirmationStatus(u).then((confirmed) => {
          setIsAdultConfirmed(confirmed);
          if (!confirmed && (viewMode === 'app' || !isOnboardingCompleted)) {
            setShowAgeVerification(true);
          }
        });
      }
    });

    if (!initialized) {
      setAuthChecking(false);
    }
  }, []);

  // Proactive adult eligibility gate monitoring
  useEffect(() => {
    const handleRequireAge = () => {
      setShowAgeVerification(true);
    };
    window.addEventListener('talkybean_require_age_confirmation', handleRequireAge);
    return () => window.removeEventListener('talkybean_require_age_confirmation', handleRequireAge);
  }, []);

  useEffect(() => {
    if (viewMode === 'app') {
      if (user) {
        CloudStatsService.getAdultConfirmationStatus(user).then((confirmed) => {
          setIsAdultConfirmed(confirmed);
          if (!confirmed) {
            setShowAgeVerification(true);
          }
        });
      } else {
        const guestConfirmed = localStorage.getItem('talkybean_age_confirmed_v1') !== null;
        if (!guestConfirmed) {
          try {
            localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({ isAdultConfirmed: true, confirmedAt: Date.now() }));
          } catch {}
        }
        setIsAdultConfirmed(true);
      }
    }
  }, [viewMode, user]);

  useEffect(() => {
    let unsubscribeWhitelist: (() => void) | null = null;
    
    if (user) {
      unsubscribeWhitelist = DeveloperWhitelistService.listenToCurrentUserWhitelist((whitelist) => {
        if (whitelist && whitelist.allowed) {
          const currentSub = SubscriptionService.getSubscriptionState();
          const capExceeded = whitelist.tokenLimit !== null && whitelist.tokenUsed >= whitelist.tokenLimit;
          const shouldBeActive = !capExceeded;
          
          if (currentSub.isActive !== shouldBeActive || currentSub.platform !== 'free_developer_pass') {
            SubscriptionService.saveSubscriptionState({
              ...currentSub,
              isActive: shouldBeActive,
              platform: 'free_developer_pass' as any,
              productId: 'dev_free_pass'
            });
            window.dispatchEvent(new Event('subscription_change'));
          }
        } else {
          const currentSub = SubscriptionService.getSubscriptionState();
          if (currentSub.platform === 'free_developer_pass') {
            SubscriptionService.saveSubscriptionState({
              ...currentSub,
              isActive: false,
              platform: 'none',
              productId: ''
            });
            window.dispatchEvent(new Event('subscription_change'));
          }
        }
      });
    } else {
      DeveloperWhitelistService.setCurrentUserWhitelist(null);
    }
    
    return () => {
      if (unsubscribeWhitelist) unsubscribeWhitelist();
    };
  }, [user]);

  const progress = React.useMemo<ProgressData[]>(() => {
    const raw = progressByLanguage?.[currentLanguage];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.filter(d => d && typeof d === 'object' && typeof d.date === 'string');
      if (valid.length > 0) return valid;
    }
    return [{
      date: new Date().toLocaleDateString('en-CA'),
      wordsLearned: 0,
      speakingTimeMinutes: 0,
      exercisesCompleted: 0,
      averageScore: 0
    }];
  }, [progressByLanguage, currentLanguage]);

  useEffect(() => {
    StorageService.save('active_tab', activeTab);
  }, [activeTab]);

  // Unified persistence effects
  useEffect(() => {
    StorageService.save('language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    StorageService.save('vocab_by_lang', vocabByLang);
  }, [vocabByLang]);

  useEffect(() => {
    StorageService.save('grammar_by_lang', grammarByLang);
  }, [grammarByLang]);

  useEffect(() => {
    StorageService.save('history_by_lang', historyByLang);
  }, [historyByLang]);

  useEffect(() => {
    StorageService.save('level_by_lang', levelByLang);
  }, [levelByLang]);

  useEffect(() => {
    StorageService.save('selected_scenario', selectedScenario, currentLanguage);
  }, [selectedScenario, currentLanguage]);

  // Safety: If speaking state is active but scenario is missing (e.g. language switch), reset it 
  // to avoid a black "stuck" screen
  useEffect(() => {
    if (isSpeaking && !selectedScenario) {
      console.warn("[App] Orphaned speaking state detected. Resetting to avoid black screen.");
      setIsSpeaking(false);
    }
  }, [isSpeaking, selectedScenario]);

  useEffect(() => {
    StorageService.save('speaking_messages', speakingMessages, currentLanguage);
  }, [speakingMessages, currentLanguage]);

  useEffect(() => {
    StorageService.save('progress_by_lang', progressByLanguage);
    CloudStatsService.syncProgress(progressByLanguage);
  }, [progressByLanguage]);

  useEffect(() => {
    StorageService.save('custom_scenario_by_lang', customScenarioByLang);
  }, [customScenarioByLang]);

  useEffect(() => {
    StorageService.save('speed', speed);
  }, [speed]);

  useEffect(() => {
    StorageService.save('autoMicOnDelay', autoMicOnDelay);
  }, [autoMicOnDelay]);

  useEffect(() => {
    StorageService.save('isAutoMode', isAutoMode);
  }, [isAutoMode]);

  useEffect(() => {
    StorageService.save('speaking_style', speakingStyle);
  }, [speakingStyle]);

  const handleRemoveWord = (id: string) => {
    const wordToDelete = vocabulary.find(w => w.id === id);
    if (wordToDelete) {
      setLastDeletedWords([wordToDelete]);
      setLastTimelineRemovedIds([]);
      setLastUnbookmarkedIds([]);
    }
    setVocabulary(prev => prev.filter(w => w.id !== id));
  };

  const handleRemoveWords = (ids: string[]) => {
    const idSet = new Set(ids);
    const matchingWords = vocabulary.filter(w => idSet.has(w.id));
    const wordsToDelete = matchingWords.filter(w => !w.isBookmarked);
    const bookmarkedToSweepFromTimeline = matchingWords
      .filter(w => w.isBookmarked && !w.isRemovedFromTimeline)
      .map(w => w.id);

    if (wordsToDelete.length > 0 || bookmarkedToSweepFromTimeline.length > 0) {
      setLastDeletedWords(wordsToDelete);
      setLastTimelineRemovedIds(bookmarkedToSweepFromTimeline);
      setLastUnbookmarkedIds([]);
    }

    setVocabulary(prev =>
      prev
        .filter(w => !(idSet.has(w.id) && !w.isBookmarked))
        .map(w => (idSet.has(w.id) && w.isBookmarked ? { ...w, isRemovedFromTimeline: true } : w))
    );
  };

  const handleUndoWord = () => {
    if (lastDeletedWords.length > 0 || lastTimelineRemovedIds.length > 0) {
      const timelineRestoreSet = new Set(lastTimelineRemovedIds);
      setVocabulary(prev => {
        const restoredTimeline = prev.map(w =>
          timelineRestoreSet.has(w.id) ? { ...w, isRemovedFromTimeline: false } : w
        );
        const toAdd = lastDeletedWords.filter(ldw => !restoredTimeline.some(w => w.id === ldw.id));
        return [...restoredTimeline, ...toAdd];
      });
      setLastDeletedWords([]);
      setLastTimelineRemovedIds([]);
    }
  };

  const handleToggleBookmark = (id: string) => {
    setVocabulary(prev =>
      prev.map(w => (w.id === id ? { ...w, isBookmarked: !w.isBookmarked } : w))
    );
  };

  const handleUnbookmarkWords = (ids: string[]) => {
    const idSet = new Set(ids);
    const affected = vocabulary.filter(w => idSet.has(w.id) && w.isBookmarked).map(w => w.id);
    if (affected.length > 0) {
      setLastUnbookmarkedIds(affected);
      setLastDeletedWords([]);
      setLastTimelineRemovedIds([]);
    }
    setVocabulary(prev =>
      prev.map(w => (idSet.has(w.id) ? { ...w, isBookmarked: false } : w))
    );
  };

  const handleUndoUnbookmark = () => {
    if (lastUnbookmarkedIds.length > 0) {
      const idSet = new Set(lastUnbookmarkedIds);
      setVocabulary(prev =>
        prev.map(w => (idSet.has(w.id) ? { ...w, isBookmarked: true } : w))
      );
      setLastUnbookmarkedIds([]);
    }
  };

  const handleRemoveGrammarTip = (id: string) => {
    setGrammarTips(prev => prev.filter(t => t.id !== id));
  };

  const updateProgress = (words: number, minutes: number, exercises: number = 0, score: number = 0) => {
    // Strict cap at 100 for accuracy
    const cappedScore = Math.min(100, score);
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    const currentFluency = FluencyService.getAssessment(currentLanguage).overall;
    
    setProgressByLanguage(prev => {
      const langProgress = prev[currentLanguage] || [];
      const last = langProgress[langProgress.length - 1];
      
      let newLangProgress;
      if (last && last.date === today) {
        const newExercisesCompleted = (last.exercisesCompleted || 0) + exercises;
        const currentTotalScore = (last.averageScore || 0) * (last.exercisesCompleted || 0);
        const newAverageScore = newExercisesCompleted > 0 
          ? Math.min(100, (currentTotalScore + cappedScore) / newExercisesCompleted)
          : (last.averageScore || 0);

        newLangProgress = [...langProgress.slice(0, -1), { 
          ...last, 
          wordsLearned: last.wordsLearned + words,
          speakingTimeMinutes: last.speakingTimeMinutes + minutes,
          exercisesCompleted: newExercisesCompleted,
          averageScore: newAverageScore,
          overallFluency: currentFluency
        }];
      } else {
        newLangProgress = [...langProgress, { 
          date: today, 
          wordsLearned: words, 
          speakingTimeMinutes: minutes,
          exercisesCompleted: exercises,
          averageScore: score,
          overallFluency: currentFluency
        }];
      }

      return {
        ...prev,
        [currentLanguage]: newLangProgress
      };
    });
  };

  const handleNewWord = async (wordData: Omit<VocabularyWord, 'languageCode' | 'theme'>) => {
    // Validation: Don't add if it looks like a grammar tip (too long or contains colon/special markers)
    const isLikelyGrammar = wordData.word.length > 50 || wordData.translation.length > 65 || wordData.word.includes(':');
    if (isLikelyGrammar) {
      console.warn("Skipping word that looks like a grammar tip:", wordData.word);
      return;
    }

    await VocabularyService.ensureLexiconLoaded(currentLanguage);

    // Canonical Policy: word = English Meaning, translation = Target-Language Word (or "lemma (clickedWord)")
    const { word: englishWord, translation: foreignWord, swapped } = VocabularyService.normalizeWordPair(
      wordData.word,
      wordData.translation,
      currentLanguage
    );

    if (!englishWord || !foreignWord) return;

    if (swapped) {
      console.log(`[VocabNormalizer] Normalized pair to English-first: "${englishWord}" -> "${foreignWord}"`);
    }

    const targetBase = foreignWord.toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').trim();

    // Check if word already exists (case-insensitive on canonical English + target base)
    const existingItem = vocabulary.find(w => {
      const normW = VocabularyService.normalizeWordItem(w, currentLanguage);
      const existingBase = normW.translation.toLowerCase().replace(/\s*\([^)]*\)\s*/g, '').trim();
      return (
        normW.word.toLowerCase() === englishWord.toLowerCase() &&
        existingBase === targetBase &&
        normW.languageCode === currentLanguage
      );
    });
    if (existingItem) {
      if (existingItem.isRemovedFromTimeline) {
        setVocabulary(prev =>
          prev.map(w =>
            w.id === existingItem.id
              ? { ...w, isRemovedFromTimeline: false, learnedAt: Date.now() }
              : w
          )
        );
      }
      return;
    }

    setVocabulary(prev => {
      const nextList = [
        ...prev,
        { ...wordData, word: englishWord, translation: foreignWord, languageCode: currentLanguage }
      ];
      return VocabularyService.normalizeVocabularyList(nextList, currentLanguage).normalized;
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
    if (!user) {
      setShowLogin(true);
      return;
    }
    // INTERCEPT: If clicking start speaking, check if adult eligibility is confirmed (bypassed for admin)
    if (user && !isAdminUser && !isAdultConfirmed) {
      setShowAgeVerification(true);
      return;
    }
    // INTERCEPT: If clicking start speaking, check if user has active subscription (bypassed for admin)
    if (user && !isAdminUser && !subscription.isActive) {
      setShowPaywall(true);
      return;
    }
    if (!networkStatus.onLine) {
      setConnectionError("You appear to be offline. Please check your internet connection and try again.");
      return;
    }
    const newScenario = scenario || {
      id: 'free-talk',
      title: 'Free Conversation',
      description: 'Talk about anything you like.',
      context: 'You are having a friendly conversation with your best friend about your day and interests.'
    };
    
    // Only clear messages if it's a DIFFERENT scenario
    if (selectedScenario?.id !== newScenario.id) {
      setSpeakingMessages([]);
    }
    
    setSelectedScenario(newScenario);
    speakingStartTimeRef.current = Date.now();
    setIsSpeaking(true);
  };

  const handleStartDailyTask = (task: DailyTask) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (user && !isAdminUser && !isAdultConfirmed) {
      setShowAgeVerification(true);
      return;
    }
    if (user && !isAdminUser && !subscription.isActive) {
      setShowPaywall(true);
      return;
    }
    setCurrentDailyTask(task);
    handleStartSpeaking(task.scenario);
  };

  const handleCloseSpeaking = async (messages: Message[]) => {
    const sessionDurationMins = Math.max(0.1, (Date.now() - speakingStartTimeRef.current) / 60000);

    if (selectedScenario) {
      setHistory(prev => ({
        ...prev,
        [selectedScenario.id]: messages
      }));

      // Evaluate task if user participated in current daily task scenario
      if (currentDailyTask && selectedScenario.id === currentDailyTask.scenario.id) {
        if (messages.filter(m => m.sender === 'user').length > 0) {
          try {
            await DailyTaskService.evaluateAndSaveTask(
              currentLanguage,
              level,
              currentDailyTask,
              messages,
              sessionDurationMins
            );
          } catch (e) {
            console.error("[App] Daily task evaluation error:", e);
          }
        }
      }
    }
    setSpeakingMessages([]);
    setIsSpeaking(false);
    setCurrentDailyTask(null);
  };

  const handleQuickAction = (action: string) => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    // INTERCEPT: If triggering any learning action, check if 18+ adult eligibility is confirmed (bypassed for admin)
    if (user && !isAdminUser && !isAdultConfirmed && action !== 'Settings') {
      setShowAgeVerification(true);
      return;
    }
    // INTERCEPT: If triggering any premium action, check if user has active subscription (bypassed for admin)
    if (user && !isAdminUser && !subscription.isActive && action !== 'Settings') {
      setShowPaywall(true);
      return;
    }
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
        setActiveTab('settings');
        break;
      case 'Reading':
        setIsReadingOpen(true);
        break;
    }
  };

  const calculatedStreak = React.useMemo(() => {
    if (!Array.isArray(progress) || progress.length === 0) return 1;
    const sortedData = [...progress]
      .filter(d => d && typeof d === 'object' && typeof d.date === 'string')
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    const activityDates = new Set(
      sortedData
        .filter(d => ((d.wordsLearned || 0) > 0 || (d.speakingTimeMinutes || 0) > 0 || (d.exercisesCompleted || 0) > 0))
        .map(d => d.date)
    );
    if (activityDates.size === 0) return 1;
    const todayStr = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    if (!activityDates.has(todayStr) && !activityDates.has(yesterdayStr)) return 0;
    let currentStreak = 0;
    let checkDate = activityDates.has(todayStr) ? new Date() : yesterday;
    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toLocaleDateString('en-CA');
      if (activityDates.has(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak || 1;
  }, [progress]);

  if (viewMode === 'delete-account') {
    return (
      <ExternalDeletionPage
        onNavigateHome={() => navigateTo('landing')}
        onNavigateApp={() => navigateTo('app')}
      />
    );
  }

  if (viewMode === 'terms' || viewMode === 'privacy') {
    return (
      <LegalDocumentView
        initialDocument={viewMode}
        onNavigateHome={() => navigateTo('landing')}
        onClose={() => navigateTo('app')}
      />
    );
  }

  if (viewMode === 'landing') {
    return (
      <>
        <PublicLandingPage 
          onEnterApp={() => navigateTo('app')}
          onClaimTrial={() => {
            navigateTo('app');
            setShowPaywall(true);
          }}
          onLoginClick={() => {
            navigateTo('app');
            setShowLogin(true);
          }}
          onNavigateLegal={(doc) => navigateTo(doc)}
          onNavigateDeleteAccount={() => navigateTo('delete-account')}
          onOpenSupport={() => setShowSupportModal(true)}
        />
        <AnimatePresence>
          {showPaywall && (
            <SubscriptionPaywallModal 
              onClose={() => setShowPaywall(false)}
              onActivated={(state) => {
                setSubscription(state);
                setShowPaywall(false);
              }}
              onViewLegal={(doc) => setLegalModalDoc(doc)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {legalModalDoc && (
            <LegalDocumentView
              initialDocument={legalModalDoc}
              isModal={true}
              onClose={() => setLegalModalDoc(null)}
              onNavigateHome={() => {
                setLegalModalDoc(null);
                navigateTo('landing');
              }}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showSupportModal && (
            <CustomerComplaintModal
              user={user}
              onClose={() => setShowSupportModal(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showAgeVerification && (
            <AgeVerificationModal
              user={user}
              onConfirmed={() => {
                setIsAdultConfirmed(true);
                setShowAgeVerification(false);
              }}
              onUnderAgeBlocked={() => {
                setIsAdultConfirmed(false);
                setShowAgeVerification(false);
                CloudStatsService.logout().catch(() => {});
                setUser(null);
                navigateTo('landing');
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (!isOnboardingCompleted) {
    return (
      <>
        <OnboardingWizard
          onComplete={(profile) => {
            setNativeLanguage(profile.nativeLanguage || 'en');
            setCurrentLanguage(profile.targetLanguage || 'de');
            setIsOnboardingCompleted(true);
          }}
          onViewLegal={(doc) => setLegalModalDoc(doc)}
        />
        <AnimatePresence>
          {legalModalDoc && (
            <LegalDocumentView
              initialDocument={legalModalDoc}
              isModal={true}
              onClose={() => setLegalModalDoc(null)}
              onNavigateHome={() => {
                setLegalModalDoc(null);
                navigateTo('landing');
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  if (!user && showLogin) {
    return (
      <>
        <LoginScreen 
          onSuccess={() => {
            setShowLogin(false);
          }} 
          onCancel={() => {
            setShowLogin(false);
          }}
          onViewLegal={(doc) => setLegalModalDoc(doc)}
        />
        <AnimatePresence>
          {legalModalDoc && (
            <LegalDocumentView
              initialDocument={legalModalDoc}
              isModal={true}
              onClose={() => setLegalModalDoc(null)}
              onNavigateHome={() => {
                setLegalModalDoc(null);
                navigateTo('landing');
              }}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-app-bg text-text-main font-sans selection:bg-accent/30 transition-colors duration-300 relative",
      isGlitching && "glitch-effect"
    )}>
      {/* Sidebar / Floating Dock Navigation */}
      <nav 
        className="fixed left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-[440px] bg-card-bg/95 backdrop-blur-xl border border-app-border rounded-full px-2.5 py-1.5 flex items-center justify-between shadow-[0_12px_36px_rgba(31,30,27,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)] transition-all"
        style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Central Protruding Semi-Circle Mic Arch */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center justify-center z-10 pointer-events-auto">
          <div className="p-1 bg-card-bg/90 backdrop-blur-xl border border-app-border rounded-full shadow-lg">
            <button 
              onClick={() => handleStartSpeaking()}
              className="w-13 h-13 sm:w-14 sm:h-14 bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-full shadow-md shadow-orange-500/35 hover:scale-105 active:scale-95 transition-all flex items-center justify-center text-white border border-white/20 group cursor-pointer relative"
              title="Instant Voice Practice"
            >
              <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-25 pointer-events-none" />
              <Mic className="w-6 h-6 text-white relative z-10" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-5 w-full items-center">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all relative group w-full cursor-pointer",
              activeTab === 'dashboard' ? "text-accent font-black" : "text-text-muted hover:text-text-main"
            )}
            title="Home Dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase opacity-95">Home</span>
            {activeTab === 'dashboard' && (
              <motion.div layoutId="nav-pill" className="absolute -bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('roleplay')}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all relative group w-full cursor-pointer",
              activeTab === 'roleplay' ? "text-accent font-black" : "text-text-muted hover:text-text-main"
            )}
            title="Conversation Partners"
          >
            <Users className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase opacity-95">Partners</span>
            {activeTab === 'roleplay' && (
              <motion.div layoutId="nav-pill" className="absolute -bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
          </button>

          {/* Spacer for Center Mic */}
          <div className="flex flex-col items-center justify-center w-full pointer-events-none">
            <div className="w-5 h-5" />
            <span className="text-[9px] font-bold uppercase opacity-0">Mic</span>
          </div>

          <button 
            onClick={() => setActiveTab('library')}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all relative group w-full cursor-pointer",
              activeTab === 'library' ? "text-accent font-black" : "text-text-muted hover:text-text-main"
            )}
            title="Vocabulary Vault"
          >
            <Book className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase opacity-95">Vault</span>
            {activeTab === 'library' && (
              <motion.div layoutId="nav-pill" className="absolute -bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all relative group w-full cursor-pointer",
              (activeTab === 'settings' || activeTab === 'profile') ? "text-accent font-black" : "text-text-muted hover:text-text-main"
            )}
            title="Settings & Profile"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-extrabold tracking-wider uppercase opacity-95">Settings</span>
            {(activeTab === 'settings' || activeTab === 'profile') && (
              <motion.div layoutId="nav-pill" className="absolute -bottom-1 w-1.5 h-1.5 bg-accent rounded-full" />
            )}
          </button>
        </div>
      </nav>

      <Suspense fallback={<WorkspaceSkeleton />}>
        <main className="max-w-[680px] mx-auto pt-4 sm:pt-6 pb-[calc(132px+env(safe-area-inset-bottom,0px))] px-4 sm:px-5 relative z-10">
          {/* Ambient Background Glowing Accents for High-End Artistic Aesthetic */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30 dark:opacity-20">
            <motion.div 
              animate={{ 
                x: [0, 40, -30, 0], 
                y: [0, -50, 30, 0], 
                scale: [1, 1.2, 0.9, 1] 
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-32 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                x: [0, -50, 35, 0], 
                y: [0, 40, -40, 0], 
                scale: [1, 0.95, 1.15, 1] 
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-32 w-80 h-80 bg-orange-400/15 rounded-full blur-[90px]"
            />
          </div>

          {/* Top Header Controls Bar */}
          <motion.header 
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="flex flex-col gap-4 mb-6 relative z-10"
          >
            {/* Row 1: Logo Brand & Streak Badge */}
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => navigateTo('landing')}
                title="Talky Bean Home"
              >
                <h1 className="font-smokum text-3xl sm:text-4xl tracking-wide uppercase bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm select-none" style={{ textRendering: 'geometricPrecision' }}>
                  TALKY BEAN
                </h1>
              </div>

              <motion.span 
                whileHover={{ scale: 1.04 }}
                className="text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-xs tabular-nums"
              >
                <motion.span 
                  animate={{ scale: [1, 1.25, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🔥
                </motion.span> 
                {calculatedStreak} {calculatedStreak === 1 ? 'DAY' : 'DAYS'} STREAK
              </motion.span>
            </div>

            {/* Row 2: User Greeting */}
            <p className="text-text-muted text-sm sm:text-base font-medium leading-snug">
              {GREETINGS[currentLanguage] || 'Hello'}, <span className="text-text-main font-bold">{user?.displayName || 'Learner'}</span> — ready today for today's practice session?
            </p>

            {/* Row 3: Target Language, Framework, and Settings cards */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2.5 items-stretch">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-app-border bg-card-bg hover:border-accent/40 shadow-subtle transition-all text-left group cursor-pointer"
                title="Switch Target Language in Settings"
              >
                <span className="text-2xl drop-shadow-sm shrink-0">
                  {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag || '🌐'}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-muted group-hover:text-accent transition-colors truncate">
                    Target Language
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-text-main truncate">
                    {SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name || currentLanguage}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-2xl border border-app-border bg-card-bg hover:border-accent/40 shadow-subtle transition-all text-left group cursor-pointer"
                title="Change CEFR Level in Settings"
              >
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                  <Languages size={16} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-text-muted group-hover:text-accent transition-colors truncate">
                    Framework
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-text-main truncate tabular-nums">
                    CEFR {level}
                  </span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                  "w-12 sm:w-13 flex items-center justify-center rounded-2xl border transition-all cursor-pointer shadow-subtle",
                  (activeTab === 'settings' || activeTab === 'profile')
                    ? "bg-accent text-white border-accent shadow-accent/20"
                    : "bg-card-bg border-app-border text-text-muted hover:text-text-main hover:border-accent/40"
                )}
                title="Settings & Profile"
              >
                <Settings size={20} className="hover:rotate-45 transition-transform duration-300" />
              </button>
            </div>
          </motion.header>

        <AnimatePresence mode="wait">
          {((!isSpeaking || !selectedScenario) && !isListeningOpen && !isReadingOpen && !isGrammarOpen && !isExerciseOpen && activeTab === 'dashboard') && (
            <motion.div 
              key="dashboard"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.05
                  }
                }
              }}
              className="space-y-6 relative z-10"
            >
              {isAdminUser && adminViewMode ? (
                <AdminDashboard
                  adminUid={ADMIN_UID}
                  currentAdminEmail={user?.email || ''}
                  onSwitchToPersonalView={() => setAdminViewMode(false)}
                />
              ) : (
                <div className="space-y-6">
                  {isAdminUser && !adminViewMode && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-xs text-text-main">
                      <div className="flex items-center gap-2 font-semibold">
                        <ShieldCheck size={16} className="text-amber-500" />
                        <span>You are currently viewing your personal learner dashboard as system admin.</span>
                      </div>
                      <button
                        onClick={() => setAdminViewMode(true)}
                        className="px-3.5 py-1.5 bg-amber-500 text-white hover:bg-amber-600 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm"
                      >
                        Switch to Admin View
                      </button>
                    </div>
                  )}

                  {/* Dynamic Daily Task & Scenario Challenge Card */}
                  <DailyTaskCard
                  languageCode={currentLanguage}
                  level={level}
                  onStartTask={handleStartDailyTask}
                  onViewFluency={() => {
                    const mirrorEl = document.getElementById('native-fluency-mirror-section');
                    if (mirrorEl) {
                      mirrorEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  user={user}
                  onRequireLogin={() => setShowLogin(true)}
                />

                {/* 7-Day Free Trial Timer & Visual Progress */}
                {isOnFreeTrial && (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                    className="p-6 rounded-card border border-accent/25 bg-accent/5 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-subtle"
                  >
                    <div className="space-y-2 z-10 w-full md:w-auto text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest bg-accent text-white px-2.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                          <Sparkles size={10} className="animate-pulse" />
                          Free Trial Active
                        </span>
                        <span className="text-xs text-text-muted font-medium">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining</span>
                      </div>
                      
                      <p className="text-xs text-text-muted leading-relaxed max-w-xl">
                        Your trial expires on <strong className="text-text-main font-semibold">{trialEndFormatted}</strong>. Upgrade to Premium for unrestricted voice sessions and assessment metrics.
                      </p>

                      <div className="w-full max-w-md pt-1">
                        <div className="w-full h-1.5 bg-card-soft border border-app-border/40 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${trialProgress}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full bg-accent rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowPaywall(true)}
                      className="px-5 py-2.5 bg-accent hover:bg-accent-hover font-black text-xs uppercase tracking-wider text-white rounded-btn transition-all active:scale-95 shrink-0 z-10 flex items-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
                    >
                      <span>Upgrade Plan</span>
                      <ChevronRight size={14} />
                    </button>
                  </motion.div>
                )}

                {/* Main Progress Mirror & Metrics Grid */}
                <div className="space-y-6">
                  <motion.div 
                    id="native-fluency-mirror-section"
                    variants={{
                      hidden: { opacity: 0, y: 15 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                  >
                    <NativeFluencyMirror languageCode={currentLanguage} />
                  </motion.div>
                  <motion.div variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                  }}>
                    <ProgressMeter data={progress} />
                  </motion.div>
                </div>
                
                {/* Practice Hub Modules Section */}
                <div className="space-y-4">
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1 }
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 border border-orange-500/35 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                          <Zap size={12} className="text-[#FF6B2B] fill-[#FF6B2B] animate-pulse" />
                          PRACTICE SUITE
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-text-main tracking-tight flex items-center gap-2.5">
                        <span>Practice Modules</span>
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B2B] opacity-75" />
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF6B2B]" />
                        </span>
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-card-bg border border-app-border text-text-muted shadow-xs flex items-center gap-2">
                        <span className="text-base">{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.flag}</span>
                        <span className="font-extrabold text-text-main">{SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage)?.name}</span>
                        <span className="text-text-muted/40">•</span>
                        <span className="text-accent font-black tracking-tight">Level {level}</span>
                      </span>
                    </div>
                  </motion.div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* 1. Reading Module (Indigo/Blue Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleQuickAction('Reading')}
                      className="group bg-gradient-to-br from-blue-500/10 via-card-bg to-indigo-500/5 dark:from-blue-600/15 dark:via-card-bg dark:to-indigo-900/10 border border-blue-500/25 hover:border-blue-500/50 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-blue-500/15 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-blue-500/20 blur-2xl opacity-40 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
                          <ClipboardCheck size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          TEXT
                        </span>
                      </div>

                      {/* Middle Area: Animated Dynamic Scanning Book SVG */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <motion.svg
                          animate={{ y: [0, -5, 0], rotate: [-1.5, 1.5, -1.5] }}
                          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                          viewBox="0 0 68 52"
                          className="w-18 h-14 drop-shadow-[0_4px_16px_rgba(59,130,246,0.4)]"
                        >
                          <defs>
                            <linearGradient id="blueBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.5" />
                            </linearGradient>
                            <linearGradient id="scanBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.1" />
                              <stop offset="50%" stopColor="#93C5FD" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>

                          {/* Outer Floating Sparks */}
                          <motion.circle cx="14" cy="10" r="1.5" fill="#93C5FD" animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.2 }} />
                          <motion.circle cx="54" cy="8" r="2" fill="#60A5FA" animate={{ y: [0, -12, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.6, repeat: Infinity, delay: 0.8 }} />
                          <motion.circle cx="34" cy="6" r="1.5" fill="#38BDF8" animate={{ y: [0, -8, 0], opacity: [0, 1, 0] }} transition={{ duration: 1.9, repeat: Infinity, delay: 1.3 }} />

                          {/* Book Base Pages */}
                          <path d="M8 12 C20 8, 30 10, 34 16 C38 10, 48 8, 60 12 L60 40 C48 36, 38 38, 34 44 C30 38, 20 36, 8 40 Z" fill="url(#blueBookGrad)" stroke="#3B82F6" strokeWidth="1.8" />
                          <path d="M34 16 L34 44" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />

                          {/* Left Page Text Lines */}
                          <line x1="14" y1="20" x2="28" y2="18" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 2" />
                          <line x1="14" y1="26" x2="28" y2="24" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
                          <line x1="14" y1="32" x2="26" y2="30" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />

                          {/* Right Page Text Lines */}
                          <line x1="40" y1="18" x2="54" y2="20" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 2" />
                          <line x1="40" y1="24" x2="54" y2="26" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />
                          <line x1="40" y1="30" x2="52" y2="32" stroke="#93C5FD" strokeWidth="1.6" strokeLinecap="round" />

                          {/* Scanning Laser Beam Line */}
                          <motion.line 
                            x1="12" y1="16" x2="56" y2="16" 
                            stroke="url(#scanBeamGrad)" strokeWidth="3" strokeLinecap="round"
                            animate={{ y: [2, 22, 2], opacity: [0.3, 1, 0.3] }} 
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} 
                          />
                        </motion.svg>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-blue-500 transition-colors">
                          Reading Passage
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-500">
                          <span>Start Reading</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>

                    {/* 2. Listening Lab (Amber/Orange Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleQuickAction('Listening')}
                      className="group bg-gradient-to-br from-amber-500/10 via-card-bg to-orange-500/5 dark:from-amber-600/15 dark:via-card-bg dark:to-orange-900/10 border border-amber-500/25 hover:border-amber-500/50 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-amber-500/15 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-amber-500/20 blur-2xl opacity-40 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 flex items-center justify-center font-bold shadow-xs">
                          <Volume2 size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          AUDIO
                        </span>
                      </div>

                      {/* Middle Area: Animated Soundwave Equalizer with Acoustic Waves & Notes */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <div className="relative flex items-center justify-center w-24 h-16">
                          {/* Concentric Acoustic Sound Ripples */}
                          <motion.div
                            animate={{ scale: [0.7, 1.45, 0.7], opacity: [0.8, 0, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                            className="absolute inset-0 m-auto w-12 h-12 rounded-full border border-amber-400/40 pointer-events-none"
                          />
                          <motion.div
                            animate={{ scale: [0.5, 1.25, 0.5], opacity: [0.9, 0, 0.9] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
                            className="absolute inset-0 m-auto w-10 h-10 rounded-full border border-orange-400/30 pointer-events-none"
                          />

                          {/* 7 Dynamic Bouncing Equalizer Bars */}
                          <div className="relative z-10 flex items-center gap-1">
                            {[14, 28, 44, 34, 22, 40, 18].map((h, i) => (
                              <motion.div
                                key={i}
                                animate={{ 
                                  height: [h * 0.25, h, h * 0.4, h * 0.9, h * 0.25],
                                  opacity: [0.65, 1, 0.75, 1, 0.65]
                                }}
                                transition={{ 
                                  duration: 0.9 + (i * 0.12), 
                                  repeat: Infinity, 
                                  ease: "easeInOut", 
                                  delay: i * 0.08 
                                }}
                                className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-orange-400 to-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                style={{ height: `${h}px` }}
                              />
                            ))}
                          </div>

                          {/* Floating Note Sparkle */}
                          <motion.div
                            animate={{ y: [0, -10, 0], x: [0, 4, 0], opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-1 right-2 text-amber-300 font-bold text-xs pointer-events-none"
                          >
                            ♪
                          </motion.div>
                        </div>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-amber-500 transition-colors">
                          Listening Practice
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <span>Listen Now</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>

                    {/* 3. Grammar Studio (Amethyst Purple Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => handleQuickAction('Grammar Check')}
                      className="group bg-gradient-to-br from-purple-500/10 via-card-bg to-fuchsia-500/5 dark:from-purple-600/15 dark:via-card-bg dark:to-fuchsia-900/10 border border-purple-500/25 hover:border-purple-500/50 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-purple-500/15 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-purple-500/20 blur-2xl opacity-40 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-500 dark:text-purple-400 flex items-center justify-center font-bold shadow-xs">
                          <Wand2 size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                          RULES
                        </span>
                      </div>

                      {/* Middle Area: Animated Syntax Diagram, Orbiting Nodes & Magic Sparkles */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <motion.svg
                          viewBox="0 0 68 52"
                          className="w-18 h-14 drop-shadow-[0_4px_16px_rgba(168,85,247,0.4)]"
                        >
                          <defs>
                            <linearGradient id="purpleCrystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#E879F9" />
                              <stop offset="50%" stopColor="#C084FC" />
                              <stop offset="100%" stopColor="#7E22CE" />
                            </linearGradient>
                          </defs>

                          {/* Outer Orbiting Syntax Ring */}
                          <motion.circle
                            cx="34" cy="26" r="18"
                            fill="none" stroke="#A855F7" strokeWidth="1" strokeDasharray="3 3"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            style={{ originX: "34px", originY: "26px" }}
                          />

                          {/* Orbiting Satellite Nodes */}
                          <motion.g
                            animate={{ rotate: -360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            style={{ originX: "34px", originY: "26px" }}
                          >
                            <circle cx="16" cy="26" r="3.5" fill="#C084FC" stroke="#FFFFFF" strokeWidth="1" />
                            <circle cx="52" cy="26" r="3.5" fill="#C084FC" stroke="#FFFFFF" strokeWidth="1" />
                            <circle cx="34" cy="8" r="3" fill="#E879F9" stroke="#FFFFFF" strokeWidth="1" />
                            <circle cx="34" cy="44" r="3" fill="#E879F9" stroke="#FFFFFF" strokeWidth="1" />
                          </motion.g>

                          {/* Dynamic Laser Beams */}
                          <line x1="16" y1="26" x2="34" y2="26" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="2 2" />
                          <line x1="34" y1="26" x2="52" y2="26" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="2 2" />
                          <line x1="34" y1="8" x2="34" y2="26" stroke="#E879F9" strokeWidth="1.5" strokeDasharray="2 2" />
                          <line x1="34" y1="26" x2="34" y2="44" stroke="#E879F9" strokeWidth="1.5" strokeDasharray="2 2" />

                          {/* Central Pulsing Logic Core */}
                          <motion.circle 
                            cx="34" cy="26" r="8" 
                            fill="url(#purpleCrystalGrad)" stroke="#F3E8FF" strokeWidth="1.8"
                            animate={{ scale: [0.9, 1.18, 0.9] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: "34px", originY: "26px" }}
                          />

                          {/* Wand Tip Rotating Magic Sparkle Star */}
                          <motion.path
                            animate={{ rotate: 360, scale: [0.8, 1.35, 0.8] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                            style={{ originX: "50px", originY: "12px" }}
                            d="M50 7 L52 10 L56 12 L52 14 L50 17 L48 14 L44 12 L48 10 Z"
                            fill="#FDE047"
                            filter="drop-shadow(0 0 6px #FACC15)"
                          />
                        </motion.svg>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-purple-500 transition-colors">
                          Grammar Studio
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-purple-500">
                          <span>Explore Grammar</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>

                    {/* 4. Vocabulary Vault (Emerald Mint Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setActiveTab('library')}
                      className="group bg-gradient-to-br from-emerald-500/10 via-card-bg to-teal-500/5 dark:from-emerald-600/15 dark:via-card-bg dark:to-teal-900/10 border border-emerald-500/25 hover:border-emerald-500/50 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-emerald-500/15 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-emerald-500/20 blur-2xl opacity-40 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
                          <Book size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
                          {vocabulary.length} WORDS
                        </span>
                      </div>

                      {/* Middle Area: Animated 3D Floating Flashcard Deck & Elastic +1 Pill */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <motion.svg
                          animate={{ y: [0, -6, 0], rotate: [-2, 2, -2] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          viewBox="0 0 68 52"
                          className="w-18 h-14 drop-shadow-[0_4px_16px_rgba(16,185,129,0.4)]"
                        >
                          <defs>
                            <linearGradient id="emeraldCardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#34D399" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>

                          {/* Back Cards Stack */}
                          <rect x="20" y="14" width="32" height="26" rx="5" fill="#065F46" opacity="0.35" transform="rotate(-8 36 27)" />
                          <rect x="19" y="15" width="32" height="26" rx="5" fill="#047857" opacity="0.65" transform="rotate(5 35 28)" />
                          
                          {/* Top Interactive Card */}
                          <rect x="18" y="16" width="32" height="26" rx="5" fill="url(#emeraldCardGrad)" stroke="#A7F3D0" strokeWidth="1.5" />
                          <line x1="24" y1="23" x2="38" y2="23" stroke="#ECFDF5" strokeWidth="1.8" strokeLinecap="round" />
                          <line x1="24" y1="29" x2="44" y2="29" stroke="#ECFDF5" strokeWidth="1.8" strokeLinecap="round" />
                          <line x1="24" y1="35" x2="35" y2="35" stroke="#ECFDF5" strokeWidth="1.8" strokeLinecap="round" />

                          {/* Floating Elastic +1 Badge */}
                          <motion.g
                            animate={{ y: [0, -8, 0], scale: [1, 1.25, 1] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: "50px", originY: "14px" }}
                          >
                            <circle cx="50" cy="14" r="7.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" filter="drop-shadow(0 0 6px rgba(16,185,129,0.8))" />
                            <text x="50" y="17" textAnchor="middle" fontSize="8.5" fontWeight="900" fill="#FFFFFF">+1</text>
                          </motion.g>

                          {/* Floating Sparkles */}
                          <motion.circle cx="14" cy="22" r="1.5" fill="#6EE7B7" animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} />
                          <motion.circle cx="54" cy="38" r="1.5" fill="#6EE7B7" animate={{ scale: [0, 1.5, 0] }} transition={{ duration: 2.3, repeat: Infinity, delay: 1 }} />
                        </motion.svg>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-emerald-500 transition-colors">
                          Vocabulary Vault
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <span>Open Vault</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>

                    {/* 5. Adaptive Exercises (Rose/Coral Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        if (!networkStatus.onLine) {
                          setConnectionError("You appear to be offline. Please check your internet connection.");
                          return;
                        }
                        setIsExerciseOpen(true);
                      }}
                      className="group bg-gradient-to-br from-rose-500/10 via-card-bg to-pink-500/5 dark:from-rose-600/15 dark:via-card-bg dark:to-pink-900/10 border border-rose-500/25 hover:border-rose-500/50 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-rose-500/15 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-rose-500/20 blur-2xl opacity-40 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 dark:text-rose-400 flex items-center justify-center font-bold shadow-xs">
                          <Brain size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          QUIZ
                        </span>
                      </div>

                      {/* Middle Area: High-Energy Pulsing Neural Network & Flashing Lightning */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <motion.svg
                          viewBox="0 0 68 52"
                          className="w-18 h-14 drop-shadow-[0_4px_16px_rgba(244,63,94,0.4)]"
                        >
                          <defs>
                            <linearGradient id="roseBrainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FB7185" />
                              <stop offset="50%" stopColor="#F43F5E" />
                              <stop offset="100%" stopColor="#BE123C" />
                            </linearGradient>
                          </defs>

                          {/* Outer Rotating Radar Aura */}
                          <motion.circle
                            cx="34" cy="26" r="19"
                            fill="none" stroke="#FDA4AF" strokeWidth="1.2" strokeDasharray="4 3"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                            style={{ originX: "34px", originY: "26px" }}
                          />

                          {/* Radiating Shockwave Ring */}
                          <motion.circle
                            cx="34" cy="26" r="13"
                            fill="none" stroke="#F43F5E" strokeWidth="1.5"
                            animate={{ scale: [0.8, 1.4, 0.8], opacity: [0.9, 0, 0.9] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                            style={{ originX: "34px", originY: "26px" }}
                          />

                          {/* Synaptic Neuron Satellites */}
                          <motion.circle cx="16" cy="18" r="3.5" fill="#FB7185" stroke="#FFFFFF" strokeWidth="1" animate={{ scale: [0.8, 1.3, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }} />
                          <motion.circle cx="52" cy="18" r="3.5" fill="#FB7185" stroke="#FFFFFF" strokeWidth="1" animate={{ scale: [0.8, 1.3, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }} />
                          <motion.circle cx="18" cy="36" r="3" fill="#FDA4AF" stroke="#FFFFFF" strokeWidth="1" animate={{ scale: [0.8, 1.3, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.7 }} />
                          <motion.circle cx="50" cy="36" r="3" fill="#FDA4AF" stroke="#FFFFFF" strokeWidth="1" animate={{ scale: [0.8, 1.3, 0.8] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1.0 }} />

                          {/* Neural Connection Rays */}
                          <line x1="16" y1="18" x2="27" y2="23" stroke="#FDA4AF" strokeWidth="1.5" />
                          <line x1="52" y1="18" x2="41" y2="23" stroke="#FDA4AF" strokeWidth="1.5" />
                          <line x1="18" y1="36" x2="28" y2="29" stroke="#FDA4AF" strokeWidth="1.5" />
                          <line x1="50" y1="36" x2="40" y2="29" stroke="#FDA4AF" strokeWidth="1.5" />

                          {/* Heartbeat Pulsing Brain Core */}
                          <motion.circle 
                            cx="34" cy="26" r="11" 
                            fill="url(#roseBrainGrad)" stroke="#FFE4E6" strokeWidth="1.8"
                            animate={{ scale: [0.92, 1.15, 0.94, 1.2, 0.92] }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: "34px", originY: "26px" }}
                          />

                          {/* Dynamic Flashing Lightning Bolt */}
                          <motion.path 
                            d="M33 19 L30 26 L36 26 L34 33" 
                            stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
                            animate={{ 
                              opacity: [0.4, 1, 0.3, 1, 0.5],
                              scale: [0.95, 1.15, 0.95]
                            }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                            style={{ originX: "34px", originY: "26px" }}
                            filter="drop-shadow(0 0 6px #FFFFFF)"
                          />
                        </motion.svg>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-rose-500 transition-colors">
                          Adaptive Exercises
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-rose-500">
                          <span>Start Quiz</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>

                    {/* 6. AI Conversation Buddy (Flame Orange Glow) */}
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, y: 15, scale: 0.98 },
                        show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 320, damping: 22 } }
                      }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        if (!networkStatus.onLine) {
                          setConnectionError("You appear to be offline. Please check your internet connection.");
                          return;
                        }
                        setActiveTab('buddy');
                      }}
                      className="group bg-gradient-to-br from-orange-500/15 via-card-bg to-amber-500/10 dark:from-orange-600/20 dark:via-card-bg dark:to-amber-900/15 border border-orange-500/35 hover:border-orange-500 rounded-[22px] p-4 flex flex-col justify-between text-left transition-all duration-300 shadow-subtle hover:shadow-lg hover:shadow-orange-500/20 relative overflow-hidden min-h-[185px] cursor-pointer backdrop-blur-md"
                    >
                      <div className="w-28 h-28 rounded-full bg-orange-500/25 blur-2xl opacity-50 absolute -right-4 -top-4 pointer-events-none group-hover:scale-130 transition-transform animate-pulse" />
                      
                      {/* Top Row: Icon + Micro Tag */}
                      <div className="flex items-center justify-between relative z-10">
                        <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center font-bold shadow-xs">
                          <Users size={18} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1.5 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                          LIVE PARTNER
                        </span>
                      </div>

                      {/* Middle Area: Animated Overlapping Chat Bubbles & Real-Time Waveform */}
                      <div className="h-16 flex items-center justify-center my-1 relative z-10">
                        <motion.svg
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                          viewBox="0 0 68 52"
                          className="w-18 h-14 drop-shadow-[0_4px_16px_rgba(255,107,43,0.45)]"
                        >
                          <defs>
                            <linearGradient id="orangeBuddyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FF7A3D" />
                              <stop offset="100%" stopColor="#EA580C" />
                            </linearGradient>
                          </defs>

                          {/* Left Partner Incoming Bubble */}
                          <motion.g
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <rect x="6" y="15" width="26" height="20" rx="7" fill="#7C2D12" opacity="0.45" stroke="#FDBA74" strokeWidth="1" />
                            <polygon points="12,35 16,41 20,35" fill="#7C2D12" opacity="0.45" />
                            
                            {/* 3 Animated Sequential Typing Dots */}
                            <motion.circle cx="13" cy="25" r="2" fill="#FED7AA" animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                            <motion.circle cx="19" cy="25" r="2" fill="#FED7AA" animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                            <motion.circle cx="25" cy="25" r="2" fill="#FED7AA" animate={{ y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                          </motion.g>

                          {/* Right User Outgoing Speech Bubble */}
                          <motion.g
                            animate={{ scale: [0.98, 1.03, 0.98] }}
                            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                            style={{ originX: "42px", originY: "25px" }}
                          >
                            <rect x="22" y="11" width="38" height="26" rx="9" fill="url(#orangeBuddyGrad)" stroke="#FED7AA" strokeWidth="1.2" />
                            <polygon points="34,37 38,44 43,37" fill="#EA580C" />
                            
                            {/* Live Waveform Equalizer Bars */}
                            {[
                              { x: 30, h: 8, delay: 0 },
                              { x: 35, h: 14, delay: 0.15 },
                              { x: 40, h: 18, delay: 0.3 },
                              { x: 45, h: 12, delay: 0.45 },
                              { x: 50, h: 7, delay: 0.6 }
                            ].map((bar, idx) => (
                              <motion.line
                                key={idx}
                                x1={bar.x}
                                y1={24 - bar.h / 2}
                                x2={bar.x}
                                y2={24 + bar.h / 2}
                                stroke="#FFFFFF"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                animate={{
                                  y1: [24 - (bar.h * 0.3) / 2, 24 - bar.h / 2, 24 - (bar.h * 0.4) / 2],
                                  y2: [24 + (bar.h * 0.3) / 2, 24 + bar.h / 2, 24 + (bar.h * 0.4) / 2],
                                }}
                                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: bar.delay }}
                              />
                            ))}
                          </motion.g>

                          {/* Floating Voice Acoustic Wave Arc */}
                          <motion.path
                            d="M62 17 C65 21, 65 27, 62 31"
                            fill="none" stroke="#FFA26B" strokeWidth="2" strokeLinecap="round"
                            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.25, 0.8] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                            style={{ originX: "62px", originY: "24px" }}
                          />
                        </motion.svg>
                      </div>

                      {/* Bottom Area: Title + CTA */}
                      <div className="relative z-10">
                        <h3 className="text-[15.5px] font-extrabold tracking-tight leading-snug mb-0.5 text-text-main group-hover:text-orange-500 transition-colors">
                          Conversation Buddy
                        </h3>
                        <div className="flex items-center gap-1 text-xs font-bold text-orange-500">
                          <span>Start Talking</span>
                          <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
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
                onRemoveWord={handleRemoveWord}
                onRemoveWords={handleRemoveWords}
                onUndoWord={handleUndoWord}
                canUndo={lastDeletedWords.length > 0 || lastTimelineRemovedIds.length > 0}
                onToggleBookmark={handleToggleBookmark}
                onUnbookmarkWords={handleUnbookmarkWords}
                onUndoUnbookmark={handleUndoUnbookmark}
                canUndoUnbookmark={lastUnbookmarkedIds.length > 0}
                currentLanguage={currentLanguage}
                level={level}
                onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
                user={user}
                onRequireLogin={() => setShowLogin(true)}
              />
            </motion.div>
          )}

          {activeTab === 'buddy' && (
            <motion.div 
              key="buddy"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ConversationBuddy 
                onSelect={handleStartSpeaking}
                languageCode={currentLanguage}
                networkStatus={networkStatus}
                onRetryNetwork={checkAppNetworkStatus}
                user={user}
                onRequireLogin={() => setShowLogin(true)}
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
                languageCode={currentLanguage}
                user={user}
                onRequireLogin={() => setShowLogin(true)}
              />
            </motion.div>
          )}

          {(activeTab === 'settings' || activeTab === 'profile') && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {showAdminConsole ? (
                <DeveloperConsole onClose={() => setShowAdminConsole(false)} />
              ) : (
                <SettingsSection 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  level={level}
                  onLevelChange={setLevel}
                  speakingStyle={speakingStyle}
                  onSpeakingStyleChange={handleSpeakingStyleChange}
                  speed={speed}
                  onSpeedChange={handleSpeedChange}
                  autoMicOnDelay={autoMicOnDelay}
                  onAutoMicOnDelayChange={handleAutoMicOnDelayChange}
                  isAutoMode={isAutoMode}
                  onAutoModeChange={handleAutoModeChange}
                  onOpenAdminConsole={() => setShowAdminConsole(true)}
                  onResetProgress={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  onViewLegal={(doc) => setLegalModalDoc(doc)}
                  onOpenSupport={() => {
                    if (!user) {
                      setShowLogin(true);
                    } else {
                      setShowSupportModal(true);
                    }
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </Suspense>

      <AnimatePresence>
        {isSpeaking && selectedScenario && (
          <SpeakingInterface 
            key={`${currentLanguage}-${level}`}
            level={level}
            languageCode={currentLanguage}
            speakingStyle={speakingStyle}
            context={selectedScenario.context}
            scenarioId={selectedScenario.id}
            scenarioTitle={selectedScenario.title}
            scenarioDescription={selectedScenario.description}
            scenarioImageUrl={selectedScenario.imageUrl}
            initialMessages={speakingMessages}
            vocabulary={vocabulary}
            onClose={handleCloseSpeaking}
            onNewWord={handleNewWord}
            onNewGrammarTip={handleNewGrammarTip}
            onSpeakingTimeUpdate={(mins) => updateProgress(0, mins)}
            onMessagesUpdate={setSpeakingMessages}
            onLevelChange={setLevel}
            onSpeedChange={handleSpeedChange}
            autoMicOnDelay={autoMicOnDelay}
            isAutoMode={isAutoMode}
            speed={speed}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListeningOpen && (
          <ListeningInterface 
            key={`${currentLanguage}-${level}`}
            level={level}
            language={currentLanguage}
            onClose={() => setIsListeningOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
            onNewWord={handleNewWord}
            user={user}
            onRequireLogin={() => setShowLogin(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExerciseOpen && (
          <AdaptiveAssessmentHub 
            key={`${currentLanguage}-${level}`}
            level={level}
            language={currentLanguage}
            onClose={() => setIsExerciseOpen(false)}
            user={user}
            onRequireLogin={() => setShowLogin(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGrammarOpen && (
          <GrammarInterface 
            key={`${currentLanguage}-${level}`}
            level={level}
            language={currentLanguage}
            onClose={() => setIsGrammarOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
            onNewWord={handleNewWord}
            user={user}
            onRequireLogin={() => setShowLogin(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isReadingOpen && (
          <ReadingInterface 
            key={`${currentLanguage}-${level}`}
            level={level}
            language={currentLanguage}
            onClose={() => setIsReadingOpen(false)}
            onProgressUpdate={(score) => updateProgress(0, 0, 1, score)}
            onNewWord={handleNewWord}
            user={user}
            onRequireLogin={() => setShowLogin(true)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {connectionError && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              onClick={() => setConnectionError(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm transform-gpu will-change-[opacity]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-card-bg border border-red-500/20 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-app relative z-10 p-8 space-y-6 transform-gpu will-change-transform"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/15 text-red-500 rounded-3xl flex items-center justify-center text-3xl">
                  📡
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-text-main">
                    Unstable Connection Detected
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    Your connection has high latency or is disconnected. We are unable to connect to the conversation Bean right now. Please check your signal level and click retry below.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  onClick={async () => {
                    await checkAppNetworkStatus();
                  }}
                  disabled={networkStatus.checking}
                  className="w-full py-4 bg-accent text-white rounded-btn font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {networkStatus.checking ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Quality...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Retry Connection</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setConnectionError(null)}
                  className="w-full py-3 hover:bg-card-soft text-text-muted rounded-xl text-xs font-bold transition-all"
                >
                  Dismiss Warning
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showPaywall && (
          <SubscriptionPaywallModal 
            onClose={() => setShowPaywall(false)}
            onActivated={(state) => {
              setSubscription(state);
              setShowPaywall(false);
            }}
            onViewLegal={(doc) => setLegalModalDoc(doc)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {legalModalDoc && (
          <LegalDocumentView
            initialDocument={legalModalDoc}
            isModal={true}
            onClose={() => setLegalModalDoc(null)}
            onNavigateHome={() => {
              setLegalModalDoc(null);
              navigateTo('landing');
            }}
          />
        )}
      </AnimatePresence>

      {/* 18+ Adult Eligibility Gate Modal */}
      <AnimatePresence>
        {showAgeVerification && (
          <AgeVerificationModal
            user={user}
            onConfirmed={() => {
              setIsAdultConfirmed(true);
              setShowAgeVerification(false);
            }}
            onUnderAgeBlocked={() => {
              setIsAdultConfirmed(false);
              setShowAgeVerification(false);
              CloudStatsService.logout().catch(() => {});
              setUser(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Customer Support & Complaints Portal Modal */}
      <AnimatePresence>
        {showSupportModal && (
          <CustomerComplaintModal
            user={user}
            onClose={() => setShowSupportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
