import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Target, Sparkles, Loader2, Save, Palette, Check, 
  Cloud, LogOut, LogIn, ChevronDown, ChevronRight, Gift, Settings,
  ShieldCheck, CreditCard, Zap, AlertCircle, Smartphone, X, AlertTriangle,
  Languages, Activity, Volume2, Mic, Sliders, Trash2, Globe, CheckCircle2, Award, LifeBuoy
} from 'lucide-react';
import { UserService } from '../services/UserService';
import { ThemeService, AppTheme } from '../services/ThemeService';
import { CloudStatsService } from '../services/CloudStatsService';
import { SubscriptionService, SubscriptionState } from '../services/SubscriptionService';
import { platformService } from '../services/PlatformService';
import { DeveloperWhitelistService } from '../services/DeveloperWhitelistService';
import { ApiService } from '../services/ApiService';
import { UserProfile, SpeakingStyle } from '../types';
import { cn } from '../lib/utils';
import { DodoPayments } from 'dodopayments-checkout';
import { SUPPORTED_LANGUAGES, LanguageConfig } from '../config/languages';

const THEMES: { id: AppTheme; name: string; color: string; desc: string; gradient?: string }[] = [
  { id: 'dark', name: 'Dark Mode (Obsidian Glass)', color: '#0D1117', gradient: 'linear-gradient(135deg, #0D1117 0%, #151B24 100%)', desc: 'Obsidian glass with flame orange accents' },
  { id: 'light', name: 'Light Mode (Warm Cream Linen)', color: '#FAF6F0', gradient: 'linear-gradient(135deg, #FAF6F0 0%, #FFFFFF 100%)', desc: 'Warm cream & alabaster warmth with zero eye strain' },
];

export interface SettingsSectionProps {
  currentLanguage: string;
  onLanguageChange: (lang: string, level?: string) => void;
  level: string;
  onLevelChange: (level: string) => void;
  speakingStyle: SpeakingStyle;
  onSpeakingStyleChange: (style: SpeakingStyle) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  autoMicOnDelay: number;
  onAutoMicOnDelayChange: (delay: number) => void;
  isAutoMode: boolean;
  onAutoModeChange: (isAuto: boolean) => void;
  onOpenAdminConsole?: () => void;
  onResetProgress?: () => void;
  onViewLegal?: (doc: 'terms' | 'privacy') => void;
  onOpenSupport?: () => void;
}

export function SettingsSection({
  currentLanguage,
  onLanguageChange,
  level,
  onLevelChange,
  speakingStyle,
  onSpeakingStyleChange,
  speed,
  onSpeedChange,
  autoMicOnDelay,
  onAutoMicOnDelayChange,
  isAutoMode,
  onAutoModeChange,
  onOpenAdminConsole,
  onResetProgress,
  onViewLegal,
  onOpenSupport
}: SettingsSectionProps) {
  const isAdmin = DeveloperWhitelistService.isAdmin();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState('');
  const [isUpdatingGoals, setIsUpdatingGoals] = useState(false);
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings updated!');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(ThemeService.getTheme());
  const [currentUser, setCurrentUser] = useState<any>(CloudStatsService.getCurrentUser());
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Mandatory confirmation modal for curriculum / style / voice control changes
  const [pendingSettingChange, setPendingSettingChange] = useState<{
    type: 'language' | 'level' | 'tone' | 'speed' | 'delay';
    newValue: any;
    label: string;
    currentValue: string;
    targetLangCode?: string;
    targetLevelCode?: string;
  } | null>(null);

  const [tempSpeed, setTempSpeed] = useState<number>(speed);
  const [tempDelay, setTempDelay] = useState<number>(autoMicOnDelay);

  useEffect(() => {
    setTempSpeed(speed);
  }, [speed]);

  useEffect(() => {
    setTempDelay(autoMicOnDelay);
  }, [autoMicOnDelay]);

  // Account Deletion state (Apple Guideline 5.1.1(v) & Google Play Compliance)
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Subscription & Payment state
  const [subscription, setSubscription] = useState<SubscriptionState>(SubscriptionService.getSubscriptionState());
  const [showConcurrentAlert, setShowConcurrentAlert] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);
  const [unsubscribeLoading, setUnsubscribeLoading] = useState(false);

  useEffect(() => {
    const p = UserService.getProfile();
    if (p) {
      setProfile(p);
      setGoals(p.goals || '');
    }

    try {
      DodoPayments.Initialize({
        mode: 'test',
        displayType: 'overlay'
      });
    } catch (e) {
      console.warn('[DodoPayments SDK]: Initialize notice:', e);
    }

    CloudStatsService.setOnLoggedOutElsewhere(() => {
      setShowConcurrentAlert(true);
    });

    const handleSubChange = () => {
      setSubscription(SubscriptionService.getSubscriptionState());
    };
    window.addEventListener('subscription_change', handleSubChange);

    CloudStatsService.init((u) => {
      setCurrentUser(u);
      setSubscription(SubscriptionService.getSubscriptionState());
      
      SubscriptionService.checkDeviceTrialEligibility().then((eligible) => {
        if (!eligible) {
          setSubscription(SubscriptionService.getSubscriptionState());
        }
      });
    });

    return () => {
      window.removeEventListener('subscription_change', handleSubChange);
    };
  }, []);

  const triggerNotification = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2600);
  };

  const handleStartTrial = async () => {
    setTrialLoading(true);
    try {
      await SubscriptionService.startFreeTrial();
      setSubscription(SubscriptionService.getSubscriptionState());
      triggerNotification('14-Day Free Trial activated! Enjoy full Pro access.');
    } catch (err: any) {
      triggerNotification(err?.message || 'Failed to activate trial.');
    } finally {
      setTrialLoading(false);
    }
  };

  const handleStartCheckout = async (planId: 'pro_monthly' | 'pro_yearly' = 'pro_monthly') => {
    setCheckoutLoading(true);
    try {
      if (platformService.isAndroid()) {
        SubscriptionService.toggleSubscription(true, 'google_play');
        setSubscription(SubscriptionService.getSubscriptionState());
        triggerNotification('Google Play Pro Membership activated!');
        return;
      }
      if (platformService.isIOS()) {
        SubscriptionService.toggleSubscription(true, 'apple_store');
        setSubscription(SubscriptionService.getSubscriptionState());
        triggerNotification('Apple App Store Pro Membership activated!');
        return;
      }

      const data = await ApiService.createCheckoutSession(planId);
      if (data.checkoutUrl) {
        if (data.isSandbox && data.environment !== 'live_mode') {
          SubscriptionService.toggleSubscription(true, 'stripe');
          setSubscription(SubscriptionService.getSubscriptionState());
          triggerNotification('Pro Membership activated successfully (Sandbox Mode)!');
        } else {
          try {
            DodoPayments.Checkout.open({ checkoutUrl: data.checkoutUrl });
          } catch (e) {
            window.location.href = data.checkoutUrl;
          }
        }
      }
    } catch (err: any) {
      triggerNotification(err?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleConfirmUnsubscribe = async () => {
    setUnsubscribeLoading(true);
    try {
      SubscriptionService.toggleSubscription(false, 'none');
      setSubscription(SubscriptionService.getSubscriptionState());
      setShowUnsubscribeModal(false);
      triggerNotification('Membership subscription cancelled successfully.');
    } catch (err: any) {
      triggerNotification(err?.message || 'Failed to cancel subscription.');
    } finally {
      setUnsubscribeLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await CloudStatsService.login();
    } catch (err: any) {
      triggerNotification(err?.message || 'Sign-in failed. Please use email & password on mobile.');
    }
  };

  const handleLogout = async () => {
    await CloudStatsService.logout();
  };

  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm account deletion.');
      return;
    }
    setDeleteError('');
    setIsDeletingAccount(true);
    try {
      await CloudStatsService.deleteAccount();
      setShowDeleteAccountModal(false);
      triggerNotification('Account permanently deleted. Refreshing...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error('Account deletion failed:', err);
      setDeleteError(err?.message || 'Failed to delete account. Please try again.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleUpdateGoals = async () => {
    if (!goals.trim() || isUpdatingGoals) return;
    setIsUpdatingGoals(true);
    try {
      const updated = await UserService.updateGoals(goals);
      setProfile(updated);
      triggerNotification('Learning goals saved successfully!');
    } catch (error) {
      console.error('Failed to update goals:', error);
      triggerNotification('Failed to update goals');
    } finally {
      setIsUpdatingGoals(false);
    }
  };

  const handleThemeChange = (theme: AppTheme) => {
    ThemeService.setTheme(theme);
    setCurrentTheme(theme);
    triggerNotification(`Switched to ${theme === 'dark' ? 'Dark' : 'Light'} Mode`);
  };

  const regional = SubscriptionService.getRegionalPricing();
  const currentLangConfig = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* 1. Profile Header Banner - Bento Styled */}
      <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-7 shadow-app relative overflow-hidden transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#FF7A3D]/25 via-amber-400/20 to-orange-500/20 p-1 border-2 border-[#FF7A3D]/40 shadow-md flex items-center justify-center overflow-hidden">
                {currentUser?.photoURL ? (
                  <img 
                    src={currentUser.photoURL} 
                    className="w-full h-full rounded-xl object-cover" 
                    referrerPolicy="no-referrer" 
                    alt="Profile Avatar" 
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-card-soft flex items-center justify-center text-accent">
                    <User size={30} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-card-bg flex items-center justify-center shadow-xs" title="Online & Active">
                <Check size={11} className="text-white stroke-[3]" />
              </div>
            </div>

            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main">
                  {currentUser?.displayName || profile?.name || 'Sreeragh K'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Award size={11} className="stroke-[2.5]" /> Pro
                </span>
              </div>
              <p className="text-xs text-text-muted font-medium">
                {currentUser?.email || 'sreeragh@learner.dev'}
              </p>
              <div className="pt-0.5 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-card-soft border border-app-border text-text-muted">
                  {currentLangConfig.flag} {currentLangConfig.name} · {level}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Log Out / Sign In & Goals toggle */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4.5 py-2.5 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] hover:brightness-110 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
              className={cn(
                "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer",
                isGoalsExpanded 
                  ? "bg-[#FF7A3D]/10 text-[#FF7A3D] border-[#FF7A3D]/40" 
                  : "bg-card-soft text-text-main border-app-border hover:bg-card-bg"
              )}
            >
              <Target size={14} className={isGoalsExpanded ? "text-[#FF7A3D]" : "text-text-muted"} />
              <span>{isGoalsExpanded ? 'Hide Bio' : 'Goals & Bio'}</span>
              <ChevronDown size={14} className={cn("transition-transform duration-200", isGoalsExpanded && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Expandable Goals & Bio Section */}
        <AnimatePresence>
          {isGoalsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pt-6 mt-6 border-t border-app-border/40 text-left space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-wider">
                  <Target size={15} />
                  <span>Personal Learning Goals & Motivation</span>
                </div>
                <span className="text-[10px] text-text-muted font-medium">
                  {goals.split(/\s+/).filter(Boolean).length} / 250 words
                </span>
              </div>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="Share your goals and why you are learning this language (e.g., travel, business meetings, daily casual conversation, exams)..."
                className="w-full h-28 bg-input-bg border border-app-border rounded-2xl p-4 text-xs sm:text-sm text-text-main placeholder:text-text-muted/50 focus:border-accent/50 outline-none transition-all resize-none shadow-inner"
                maxLength={1500}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdateGoals}
                  disabled={isUpdatingGoals || !goals.trim()}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50 shadow-md cursor-pointer"
                >
                  {isUpdatingGoals ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  Save Goals
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Categorized Settings Bento Cards */}
      <div className="space-y-6">

        {/* GROUP A: Language & Curriculum Settings */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-5 text-left">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-app-border/40 text-text-muted">
            <Globe size={16} className="text-[#3B82F6]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Language & Curriculum</h3>
          </div>

          {/* Row 1: Target Language Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-xl shadow-xs">
                  {currentLangConfig.flag}
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">Target Language</p>
                  <p className="text-xs text-text-muted">{currentLangConfig.name} ({currentLangConfig.nativeName})</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card-soft hover:bg-card-bg border border-app-border text-xs font-bold text-text-main hover:border-[#FF7A3D]/40 transition-all cursor-pointer"
              >
                <span>Change</span>
                <ChevronDown size={14} className={cn("transition-transform duration-200", isLanguageSelectorOpen && "rotate-180")} />
              </button>
            </div>

            {/* Expandable Language Selector Grid */}
            <AnimatePresence>
              {isLanguageSelectorOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden pt-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3 bg-card-soft/80 border border-app-border rounded-2xl">
                    {SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = currentLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          disabled={lang.isLocked}
                          onClick={() => {
                            if (isSelected) {
                              setIsLanguageSelectorOpen(false);
                              return;
                            }
                            setPendingSettingChange({
                              type: 'language',
                              newValue: lang.code,
                              label: `${lang.flag} ${lang.name} (${lang.nativeName})`,
                              currentValue: `${currentLangConfig.flag} ${currentLangConfig.name}`,
                              targetLangCode: lang.code,
                              targetLevelCode: lang.levels[0]?.code || 'A1'
                            });
                          }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-xl border transition-all text-left group cursor-pointer",
                            isSelected
                              ? "bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white border-transparent shadow-md shadow-orange-500/20"
                              : "bg-card-bg border-app-border text-text-main hover:border-[#FF7A3D]/40 hover:bg-card-soft",
                            lang.isLocked && "opacity-40 cursor-not-allowed grayscale"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">{lang.flag}</span>
                            <div>
                              <p className={cn("text-xs font-extrabold", isSelected ? "text-white" : "text-text-main")}>{lang.name}</p>
                              <p className={cn("text-[10px]", isSelected ? "text-white/80" : "text-text-muted")}>{lang.nativeName}</p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-px bg-app-border/30 my-1" />

          {/* Row 2: CEFR Proficiency Level Selector - 5-Pill Squircle Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xs">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-main">CEFR level</p>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/10 text-[#FF6B2B] border border-orange-500/20">
                      {currentLangConfig.framework}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">Target fluency curriculum</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white text-xs font-black shadow-sm">
                CEFR {level}
              </span>
            </div>

            {/* 5 Equal-Width Squircle Pills Matching Mockup */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
              {(currentLangConfig.levels || []).map((lvl) => {
                const isSelected = level === lvl.code;
                return (
                  <button
                    key={lvl.code}
                    type="button"
                    onClick={() => {
                      if (isSelected) return;
                      setPendingSettingChange({
                        type: 'level',
                        newValue: lvl.code,
                        label: `CEFR ${lvl.code} (${lvl.name || lvl.label})`,
                        currentValue: `CEFR ${level}`
                      });
                    }}
                    className={cn(
                      "py-2.5 sm:py-3 px-1 sm:px-2 rounded-2xl border transition-all flex flex-col items-center justify-center text-center group cursor-pointer relative overflow-hidden",
                      isSelected
                        ? "bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white border-transparent shadow-md shadow-orange-500/25 ring-2 ring-[#FF7A3D]/40"
                        : "bg-card-soft border-app-border text-text-muted hover:text-text-main hover:bg-card-bg hover:border-[#FF7A3D]/30"
                    )}
                  >
                    <span className={cn("text-xs sm:text-sm font-black tracking-tight", isSelected ? "text-white" : "text-text-main")}>
                      {lvl.label}
                    </span>
                    <span className={cn("text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-tighter truncate max-w-full mt-0.5", isSelected ? "text-white/90" : "text-text-muted/70")}>
                      {lvl.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-app-border/30 my-1" />

          {/* Row 3: Conversation Tone & Style Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-main">Conversation Tone & Style</p>
                <p className="text-xs text-text-muted">
                  {speakingStyle === 'Formal' ? 'Formal, polite, standard grammar' : 'Casual, slang, native everyday phrasing'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-card-soft border border-app-border rounded-2xl">
              {(['Formal', 'Casual'] as SpeakingStyle[]).map((style) => {
                const isSelected = speakingStyle === style;
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      if (isSelected) return;
                      setPendingSettingChange({
                        type: 'tone',
                        newValue: style,
                        label: style === 'Formal' ? 'Polite / Formal' : 'Casual / Slang',
                        currentValue: speakingStyle === 'Formal' ? 'Polite / Formal' : 'Casual / Slang'
                      });
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                      isSelected
                        ? "bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white shadow-sm"
                        : "text-text-muted hover:text-text-main"
                    )}
                  >
                    {style === 'Formal' ? 'Polite / Formal' : 'Casual / Slang'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* GROUP B: Bean AI Voice & Speech Practice */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-5 text-left">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-app-border/40 text-text-muted">
            <Volume2 size={16} className="text-[#FF6B2B]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Bean AI Voice & Speech Practice</h3>
          </div>

          {/* Speaking Speed Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#FF6B2B] shadow-xs">
                  <Sliders size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-main">Voice Pace</p>
                  <p className="text-xs text-text-muted">Bean speech playback cadence</p>
                </div>
              </div>
              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-orange-500/10 text-[#FF6B2B] border border-orange-500/20">
                {tempSpeed.toFixed(1)}x
              </span>
            </div>

            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={tempSpeed}
                onChange={(e) => setTempSpeed(parseFloat(e.target.value))}
                onPointerUp={(e) => {
                  const val = parseFloat(e.currentTarget.value);
                  setTempSpeed(val);
                  if (val !== speed && !pendingSettingChange) {
                    setPendingSettingChange({
                      type: 'speed',
                      currentValue: `${speed.toFixed(1)}x`,
                      newValue: val,
                      label: `${val.toFixed(1)}x`
                    });
                  }
                }}
                onKeyUp={(e) => {
                  const val = parseFloat(e.currentTarget.value);
                  setTempSpeed(val);
                  if (val !== speed && !pendingSettingChange) {
                    setPendingSettingChange({
                      type: 'speed',
                      currentValue: `${speed.toFixed(1)}x`,
                      newValue: val,
                      label: `${val.toFixed(1)}x`
                    });
                  }
                }}
                className="w-full h-2 bg-card-soft rounded-lg appearance-none cursor-pointer accent-[#FF6B2B]"
              />
              <div className="flex justify-between text-[10px] font-bold text-text-muted">
                <button
                  type="button"
                  onClick={() => {
                    if (0.8 !== speed) {
                      setTempSpeed(0.8);
                      setPendingSettingChange({
                        type: 'speed',
                        currentValue: `${speed.toFixed(1)}x`,
                        newValue: 0.8,
                        label: 'Slow (0.8x)'
                      });
                    }
                  }}
                  className={cn("transition-colors cursor-pointer", speed === 0.8 ? "text-[#FF6B2B] font-extrabold" : "hover:text-[#FF6B2B]")}
                >
                  Slow (0.8x)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (1.0 !== speed) {
                      setTempSpeed(1.0);
                      setPendingSettingChange({
                        type: 'speed',
                        currentValue: `${speed.toFixed(1)}x`,
                        newValue: 1.0,
                        label: 'Natural (1.0x)'
                      });
                    }
                  }}
                  className={cn("transition-colors cursor-pointer", speed === 1.0 ? "text-[#FF6B2B] font-extrabold" : "hover:text-[#FF6B2B]")}
                >
                  Natural (1.0x)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (1.2 !== speed) {
                      setTempSpeed(1.2);
                      setPendingSettingChange({
                        type: 'speed',
                        currentValue: `${speed.toFixed(1)}x`,
                        newValue: 1.2,
                        label: 'Fast (1.2x)'
                      });
                    }
                  }}
                  className={cn("transition-colors cursor-pointer", speed === 1.2 ? "text-[#FF6B2B] font-extrabold" : "hover:text-[#FF6B2B]")}
                >
                  Fast (1.2x)
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-app-border/30 my-1" />

          {/* Response Delay Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text-main">Response Delay</p>
                <p className="text-xs text-text-muted">Pause before Bean speaks back</p>
              </div>
              <span className="font-mono font-black text-xs px-2.5 py-1 rounded-xl bg-card-soft border border-app-border text-text-main">
                {tempDelay.toFixed(1)}s
              </span>
            </div>

            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.5"
              value={tempDelay}
              onChange={(e) => setTempDelay(parseFloat(e.target.value))}
              onPointerUp={(e) => {
                const val = parseFloat(e.currentTarget.value);
                setTempDelay(val);
                if (val !== autoMicOnDelay && !pendingSettingChange) {
                  setPendingSettingChange({
                    type: 'delay',
                    currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                    newValue: val,
                    label: `${val.toFixed(1)}s`
                  });
                }
              }}
              onKeyUp={(e) => {
                const val = parseFloat(e.currentTarget.value);
                setTempDelay(val);
                if (val !== autoMicOnDelay && !pendingSettingChange) {
                  setPendingSettingChange({
                    type: 'delay',
                    currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                    newValue: val,
                    label: `${val.toFixed(1)}s`
                  });
                }
              }}
              className="w-full h-2 bg-card-soft rounded-lg appearance-none cursor-pointer accent-[#FF6B2B]"
            />
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-bold text-text-muted">
              <button
                type="button"
                onClick={() => {
                  if (1.0 !== autoMicOnDelay) {
                    setTempDelay(1.0);
                    setPendingSettingChange({
                      type: 'delay',
                      currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                      newValue: 1.0,
                      label: '1.0s (Quick)'
                    });
                  }
                }}
                className={cn("py-1 rounded-lg border transition-colors cursor-pointer", autoMicOnDelay === 1.0 ? "bg-orange-500/15 border-orange-500/30 text-[#FF6B2B]" : "bg-card-soft/50 border-app-border/40 hover:text-[#FF6B2B]")}
              >
                1s Quick
              </button>
              <button
                type="button"
                onClick={() => {
                  if (3.0 !== autoMicOnDelay) {
                    setTempDelay(3.0);
                    setPendingSettingChange({
                      type: 'delay',
                      currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                      newValue: 3.0,
                      label: '3.0s (Natural)'
                    });
                  }
                }}
                className={cn("py-1 rounded-lg border transition-colors cursor-pointer", autoMicOnDelay === 3.0 ? "bg-orange-500/15 border-orange-500/30 text-[#FF6B2B]" : "bg-card-soft/50 border-app-border/40 hover:text-[#FF6B2B]")}
              >
                3s Natural
              </button>
              <button
                type="button"
                onClick={() => {
                  if (6.0 !== autoMicOnDelay) {
                    setTempDelay(6.0);
                    setPendingSettingChange({
                      type: 'delay',
                      currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                      newValue: 6.0,
                      label: '6.0s (Relaxed)'
                    });
                  }
                }}
                className={cn("py-1 rounded-lg border transition-colors cursor-pointer", autoMicOnDelay === 6.0 ? "bg-orange-500/15 border-orange-500/30 text-[#FF6B2B]" : "bg-card-soft/50 border-app-border/40 hover:text-[#FF6B2B]")}
              >
                6s Relaxed
              </button>
              <button
                type="button"
                onClick={() => {
                  if (10.0 !== autoMicOnDelay) {
                    setTempDelay(10.0);
                    setPendingSettingChange({
                      type: 'delay',
                      currentValue: `${autoMicOnDelay.toFixed(1)}s`,
                      newValue: 10.0,
                      label: '10.0s (Pensive)'
                    });
                  }
                }}
                className={cn("py-1 rounded-lg border transition-colors cursor-pointer", autoMicOnDelay === 10.0 ? "bg-orange-500/15 border-orange-500/30 text-[#FF6B2B]" : "bg-card-soft/50 border-app-border/40 hover:text-[#FF6B2B]")}
              >
                10s Pensive
              </button>
            </div>
          </div>

          <div className="h-px bg-app-border/30 my-1" />

          {/* Auto-Mic Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xs">
                <Mic size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-text-main">Auto-Mic Listening Mode</p>
                <p className="text-xs text-text-muted">Automatically open mic after Bean completes speech</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onAutoModeChange(!isAutoMode);
                triggerNotification(`Auto-Mic ${!isAutoMode ? 'Enabled' : 'Disabled'}`);
              }}
              className={cn(
                "w-13 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer flex items-center shadow-inner",
                isAutoMode ? "bg-emerald-500 justify-end" : "bg-app-border justify-start"
              )}
            >
              <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="w-5 h-5 rounded-full bg-white shadow-md"
              />
            </button>
          </div>
        </div>

        {/* GROUP C: Membership & Subscription - Mockup Gradient Card */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-4 text-left">
          <div className="flex items-center justify-between pb-2.5 border-b border-app-border/40">
            <div className="flex items-center gap-2.5 text-text-muted">
              <CreditCard size={16} className="text-emerald-500" />
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Pro Membership & Billing</h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Zap size={11} className="stroke-[3]" /> Active
            </span>
          </div>

          {/* Jewel Mesh Gradient Pro Card matching mockup */}
          <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#211B3D] via-[#2A1D45] to-[#12313B] text-white border border-indigo-500/25 shadow-xl">
            {/* Ambient Background Orbs */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-md">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black tracking-tight text-white">Talky Bean Pro</h4>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9.5px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <Sparkles size={10} className="text-amber-300" /> Full Access Pro Plan
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed font-normal">
                  Unlimited AI voice conversations, instant pronunciation feedback, and custom scenario simulations.
                </p>
                <div className="pt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-amber-300">₹399</span>
                  <span className="text-[11px] text-white/70 font-bold uppercase tracking-wider">/ month</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {subscription.isActive ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowUnsubscribeModal(true)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md"
                    >
                      Manage Plan
                    </button>
                    <div className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5">
                      <Check size={14} className="stroke-[3]" /> Active Member
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      type="button"
                      disabled={trialLoading || subscription.trialUsed}
                      onClick={handleStartTrial}
                      className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white rounded-xl text-xs font-bold transition-all cursor-pointer backdrop-blur-md flex items-center justify-center gap-1.5"
                    >
                      <Gift size={14} />
                      <span>{subscription.trialUsed ? 'Trial Consumed' : '14-Day Free Trial'}</span>
                    </button>
                    <button
                      type="button"
                      disabled={checkoutLoading}
                      onClick={() => handleStartCheckout('pro_monthly')}
                      className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] hover:brightness-110 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard size={14} />
                      <span>Subscribe Pro</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* GROUP D: App Appearance & Themes */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-4 text-left">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-app-border/40 text-text-muted">
            <Palette size={16} className="text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Appearance</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {THEMES.map((theme) => {
              const isSelected = currentTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeChange(theme.id)}
                  className={cn(
                    "p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group cursor-pointer relative overflow-hidden",
                    isSelected
                      ? "bg-[#FF7A3D]/10 border-[#FF7A3D] shadow-md ring-1 ring-[#FF7A3D]/30"
                      : "bg-card-soft border-app-border hover:border-[#FF7A3D]/30 hover:bg-card-bg"
                  )}
                >
                  <div
                    className="w-12 h-12 rounded-xl shadow-inner flex items-center justify-center border border-app-border/50 shrink-0"
                    style={{ background: theme.gradient || theme.color }}
                  >
                    {isSelected && (
                      <Check className={theme.id === 'light' ? "text-slate-800 stroke-[3]" : "text-white stroke-[3]"} size={20} />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className={cn("text-sm font-bold", isSelected ? "text-[#FF7A3D]" : "text-text-main")}>
                      {theme.name}
                    </p>
                    <p className="text-xs text-text-muted">{theme.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* GROUP E: Admin Developer Gateway */}
        {isAdmin && onOpenAdminConsole && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-5 sm:p-6 shadow-app space-y-3 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-500">
                <ShieldCheck size={18} />
                <h3 className="text-xs font-black uppercase tracking-wider">Developer Administration</h3>
              </div>
              <span className="text-[10px] font-mono uppercase bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-bold">
                Admin Mode
              </span>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Access the developer whitelist controller, manage token allocations, and inspect system telemetry.
            </p>
            <button
              type="button"
              onClick={onOpenAdminConsole}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 font-bold text-xs uppercase tracking-widest text-white rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck size={14} />
              Open Whitelist Controller
            </button>
          </div>
        )}

        {/* GROUP F: Customer Support & Complaints */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-4 text-left">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-app-border/40 text-text-muted">
            <LifeBuoy size={16} className="text-[#FF7A3D]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Help & Support Portal</h3>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-main">Support & Complaints Management</p>
              <p className="text-xs text-text-muted">Submit an inquiry, report a technical or subscription issue, and track support ticket responses</p>
            </div>

            <button
              type="button"
              onClick={onOpenSupport}
              className="px-4.5 py-2.5 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] hover:brightness-110 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md flex items-center justify-center gap-1.5"
            >
              <LifeBuoy size={14} />
              <span>Get Support</span>
            </button>
          </div>
        </div>

        {/* GROUP G: Data Management & Privacy */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-5 sm:p-6 shadow-app space-y-5 text-left">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-app-border/40 text-text-muted">
            <Trash2 size={16} className="text-red-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted">Data & Privacy Management</h3>
          </div>

          {/* Reset Local Learning Data */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-main">Reset Local Learning Data</p>
              <p className="text-xs text-text-muted">Clear cached vocabulary, audio caches, and conversation history</p>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirmModal(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              Reset Data
            </button>
          </div>

          {/* Permanent In-App Account Deletion */}
          <div className="pt-3 border-t border-app-border/40 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red-500">Delete Account & Cloud Data</p>
              <p className="text-xs text-text-muted">
                {currentUser 
                  ? "Permanently delete your account, authentication records, speech metrics, and stored files"
                  : "Sign in to manage and delete your cloud account and stored data"}
              </p>
            </div>

            {currentUser ? (
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmText('');
                  setDeleteError('');
                  setShowDeleteAccountModal(true);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 shadow-md"
              >
                Delete Account
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="px-4 py-2 bg-card-soft border border-app-border text-text-muted hover:text-text-main rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
              >
                Sign In First
              </button>
            )}
          </div>
        </div>

        {/* App Footer Info */}
        <div className="text-center pt-4 text-text-muted/60 space-y-2">
          <p className="text-xs font-semibold">Talky Bean · AI Language Practice v2.4.0</p>
          <p className="text-[10px]">Crafted for fluent real-time conversation & fluency mastery</p>
          <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-text-muted">
            <button
              type="button"
              onClick={() => onViewLegal ? onViewLegal('terms') : (window.location.href = '/terms')}
              className="hover:text-accent underline transition-colors cursor-pointer"
            >
              Terms of Use (EULA)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onViewLegal ? onViewLegal('privacy') : (window.location.href = '/privacy')}
              className="hover:text-accent underline transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>

      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2.5 z-50 pointer-events-none"
          >
            <Sparkles size={16} />
            <span className="text-xs font-extrabold tracking-wide">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MANDATORY CONFIRMATION MODAL FOR CURRICULUM & STYLE CHANGES */}
      <AnimatePresence>
        {pendingSettingChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-[110] p-4 sm:p-6 text-left"
          >
            <motion.div
              initial={{ scale: 0.94, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 12 }}
              className="bg-card-bg border border-app-border p-6 sm:p-7 rounded-3xl shadow-2xl max-w-sm sm:max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-[#FF7A3D] shrink-0">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">
                    {pendingSettingChange.type === 'language' || pendingSettingChange.type === 'level' 
                      ? 'Confirm Curriculum Change'
                      : pendingSettingChange.type === 'tone'
                      ? 'Confirm Tone Change'
                      : pendingSettingChange.type === 'speed'
                      ? 'Confirm Voice Speed Change'
                      : 'Confirm Response Delay Change'}
                  </h3>
                  <p className="text-[11px] text-text-muted">
                    {pendingSettingChange.type === 'language' ? 'Target Language Update' :
                     pendingSettingChange.type === 'level' ? 'CEFR Proficiency Adjustment' :
                     pendingSettingChange.type === 'tone' ? 'Conversation Tone Update' :
                     pendingSettingChange.type === 'speed' ? 'Bean Speech Rate Adjustment' :
                     'Auto-Mic Response Delay Adjustment'}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-card-soft border border-app-border space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">Current Setting:</span>
                  <span className="font-bold text-text-main">{pendingSettingChange.currentValue}</span>
                </div>
                <div className="flex items-center justify-center py-0.5 text-[#FF7A3D]">
                  <ChevronDown size={16} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted font-medium">New Target:</span>
                  <span className="font-extrabold text-[#FF6B2B]">{pendingSettingChange.label}</span>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {pendingSettingChange.type === 'language' && (
                  `Switching your study language will re-align all practice modules, conversation scenarios, and vocabulary drills to ${pendingSettingChange.label}. Are you sure you want to proceed?`
                )}
                {pendingSettingChange.type === 'level' && (
                  `Adjusting your proficiency to ${pendingSettingChange.label} will dynamically calibrate Bean's conversational vocabulary, sentence length, and feedback rigor.`
                )}
                {pendingSettingChange.type === 'tone' && (
                  `Switching your speaking style will re-tune Bean's conversational responses between formal standard and everyday casual idiom.`
                )}
                {pendingSettingChange.type === 'speed' && (
                  `Adjusting Bean's voice speed to ${pendingSettingChange.label} will alter how quickly conversational speech is spoken across all talking partners. Are you sure you want to proceed?`
                )}
                {pendingSettingChange.type === 'delay' && (
                  `Changing the response delay to ${pendingSettingChange.label} adjusts how long Bean pauses after speaking before opening your microphone. Are you sure you want to proceed?`
                )}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTempSpeed(speed);
                    setTempDelay(autoMicOnDelay);
                    setPendingSettingChange(null);
                  }}
                  className="py-3 bg-card-soft border border-app-border rounded-xl text-xs font-bold text-text-main hover:bg-card-bg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (pendingSettingChange.type === 'language') {
                      onLanguageChange(pendingSettingChange.targetLangCode!, pendingSettingChange.targetLevelCode);
                      setIsLanguageSelectorOpen(false);
                      triggerNotification(`Target language set to ${pendingSettingChange.label}`);
                    } else if (pendingSettingChange.type === 'level') {
                      onLevelChange(pendingSettingChange.newValue);
                      triggerNotification(`Proficiency updated to ${pendingSettingChange.label}`);
                    } else if (pendingSettingChange.type === 'tone') {
                      onSpeakingStyleChange(pendingSettingChange.newValue);
                      triggerNotification(`Style set to ${pendingSettingChange.label}`);
                    } else if (pendingSettingChange.type === 'speed') {
                      onSpeedChange(pendingSettingChange.newValue);
                      setTempSpeed(pendingSettingChange.newValue);
                      triggerNotification(`Voice speed set to ${pendingSettingChange.label}`);
                    } else if (pendingSettingChange.type === 'delay') {
                      onAutoMicOnDelayChange(pendingSettingChange.newValue);
                      setTempDelay(pendingSettingChange.newValue);
                      triggerNotification(`Response delay set to ${pendingSettingChange.label}`);
                    }
                    setPendingSettingChange(null);
                  }}
                  className="py-3 bg-gradient-to-r from-[#FF7A3D] to-[#E84D1C] hover:brightness-110 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check size={14} className="stroke-[3]" />
                  <span>Yes, Confirm</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-6 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card-bg border border-app-border p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle size={24} />
                <h3 className="text-base font-bold text-text-main">Reset All Learning Data?</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                This will clear local speech metrics, cached words, and practice states. This action cannot be undone.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="py-2.5 bg-card-soft border border-app-border rounded-xl text-xs font-bold text-text-main hover:bg-card-bg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onResetProgress) {
                      onResetProgress();
                    } else {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md cursor-pointer"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unsubscribe Modal */}
      <AnimatePresence>
        {showUnsubscribeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-6 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card-bg border border-app-border p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <AlertTriangle size={24} />
                <h3 className="text-base font-bold text-text-main">Cancel Pro Membership</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Are you sure you want to stop recurring membership? You will maintain full access until the end of your current period.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUnsubscribeModal(false)}
                  className="py-2.5 bg-card-soft border border-app-border rounded-xl text-xs font-bold text-text-main cursor-pointer"
                >
                  Keep Plan
                </button>
                <button
                  type="button"
                  disabled={unsubscribeLoading}
                  onClick={handleConfirmUnsubscribe}
                  className="py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {unsubscribeLoading ? <Loader2 size={13} className="animate-spin" /> : 'Confirm Cancel'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Concurrent Device Session Alert */}
      <AnimatePresence>
        {showConcurrentAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-6 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card-bg border border-red-500/30 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <Smartphone size={24} />
                <h3 className="text-base font-bold text-text-main">Simultaneous Login Detected</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Your account was accessed from another device. To protect your data, only one device session is active at a time.
              </p>
              <button
                type="button"
                onClick={() => setShowConcurrentAlert(false)}
                className="w-full py-3 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all cursor-pointer"
              >
                Acknowledge & Sign In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permanent Account Deletion Modal (Apple Guideline 5.1.1(v) & Google Play Compliance) */}
      <AnimatePresence>
        {showDeleteAccountModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[100] p-6 text-left"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-card-bg border border-red-500/40 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-5"
            >
              <div className="flex items-center gap-3 text-red-500">
                <AlertTriangle size={26} className="shrink-0 text-red-500" />
                <div>
                  <h3 className="text-base font-extrabold text-text-main">Permanently Delete Account?</h3>
                  <p className="text-[11px] text-text-muted">This action is irreversible and permanent</p>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                Deleting your account will permanently wipe your profile, saved words, speech telemetry, uploaded files, and cloud history.
              </p>

              {/* Statutory Subscription Notice Callout */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-[11px] text-amber-300 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-amber-400">
                  <span>⚠️</span> Notice Regarding Store Subscriptions:
                </p>
                <p className="text-text-muted leading-relaxed">
                  Deleting your Talky Bean account <span className="font-semibold text-text-main">does not automatically cancel recurring subscriptions</span> billed through Google Play Store or Apple App Store.
                </p>
                <p className="text-[10px] text-text-muted leading-relaxed pt-1">
                  To prevent future charges, cancel your subscription in:
                  <br />• <strong>iOS:</strong> Settings &gt; Apple ID &gt; Subscriptions
                  <br />• <strong>Android:</strong> Play Store &gt; Profile &gt; Payments &amp; subscriptions
                </p>
              </div>

              {deleteError && (
                <div className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                  {deleteError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-text-muted">
                  Type <span className="text-red-500 font-mono">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  disabled={isDeletingAccount}
                  className="w-full px-4 py-2.5 bg-input-bg border border-app-border rounded-xl text-xs font-mono font-bold text-text-main outline-none focus:border-red-500 transition-all uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setShowDeleteAccountModal(false);
                    setDeleteConfirmText('');
                    setDeleteError('');
                  }}
                  className="py-2.5 bg-card-soft border border-app-border rounded-xl text-xs font-bold text-text-main hover:bg-card-bg transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteConfirmText.trim().toUpperCase() !== 'DELETE' || isDeletingAccount}
                  onClick={handleConfirmDeleteAccount}
                  className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    'Delete Everything'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
