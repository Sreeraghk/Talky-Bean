import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Sparkles, Loader2, LogIn, Mail, ArrowRight, ArrowLeft, 
  Globe2, Target, GraduationCap, Calendar, Compass, Shield, Check, ShieldAlert
} from 'lucide-react';
import { CloudStatsService } from '../services/CloudStatsService';
import { StorageService } from '../services/StorageService';
import { LocalizationService, NATIVE_LANGUAGE_NAMES, NATIVE_LANGUAGE_FLAGS } from '../services/LocalizationService';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { platformService } from '../services/PlatformService';
import { UniversalAuthAdapter } from '../services/UniversalAuthAdapter';
import { cn } from '../lib/utils';

interface OnboardingWizardProps {
  onComplete: (preferences: {
    nativeLanguage: string;
    targetLanguage: string;
    name: string;
    age: string;
    goals: string;
    experienceLevel: string;
  }) => void;
  onViewLegal?: (doc: 'terms' | 'privacy') => void;
}

export function OnboardingWizard({ onComplete, onViewLegal }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [nativeLanguage, setNativeLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('de');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [underAgeBlocked, setUnderAgeBlocked] = useState(false);
  const [stepError, setStepError] = useState('');
  const [goals, setGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('A1');

  // Auth and sync state
  const [authMode, setAuthMode] = useState<'options' | 'email-signup' | 'email-signin'>('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isAndroid = /Android/i.test(navigator.userAgent) || platformService?.isAndroid?.();

  const handleNextStep = () => {
    setStepError('');
    if (step === 2 && !isAdultConfirmed) {
      setStepError('Adult eligibility required (18+): You must explicitly confirm that you are at least 18 years old to use Talky Bean.');
      return;
    }
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  // Perform Google Sign-In and Sync Profile
  const handleGoogleSync = async () => {
    if (!UniversalAuthAdapter.isGoogleSignInAvailable()) {
      setErrorMsg('Google Sign-In is only available on web or in builds with the native GoogleAuth plugin configured. Please use email registration.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);
    try {
      await CloudStatsService.init();
      await CloudStatsService.login();
      
      // Successfully authenticated with Google, sync details
      await syncCompletedProfile();
    } catch (err: any) {
      console.error('[Onboarding Google Sync Error]', err);
      if (!err?.message?.includes('popup-closed-by-user')) {
        setErrorMsg(err?.message || 'Google account sign-in failed.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform Email Register and Sync Profile
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    try {
      await CloudStatsService.init();
      await CloudStatsService.registerWithEmail(email.trim(), password, name.trim());
      
      // Sync completed details
      await syncCompletedProfile();
    } catch (err: any) {
      console.error('[Onboarding Email SignUp Error]', err);
      setErrorMsg(err?.message || 'Registrations failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Perform Email Sign-In and Sync Profile (if existing user)
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    try {
      await CloudStatsService.init();
      await CloudStatsService.loginWithEmail(email.trim(), password);
      
      // Update/sync details with active credentials
      await syncCompletedProfile();
    } catch (err: any) {
      console.error('[Onboarding Email SignIn Error]', err);
      setErrorMsg(err?.message || 'Login credentials incorrect.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process Guest Mode / Local Offline Setup
  const handleGuestMode = () => {
    // Record verified adult status
    localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({
      isAdultConfirmed: true,
      confirmedAt: Date.now()
    }));

    // Write completed config locally
    StorageService.save('onboarding_completed', true);
    StorageService.save('native_language', nativeLanguage);
    StorageService.save('language', targetLanguage);
    
    // Complete wizard
    onComplete({
      nativeLanguage,
      targetLanguage,
      name: name.trim() || 'Learner',
      age: '18+',
      goals: goals.trim() || 'General Learning',
      experienceLevel
    });
  };

  // Sync profile details to Cloud and complete
  const syncCompletedProfile = async () => {
    // Record verified adult status locally
    localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({
      isAdultConfirmed: true,
      confirmedAt: Date.now()
    }));

    const currentUser = CloudStatsService.getCurrentUser();
    if (currentUser?.uid) {
      localStorage.setItem(`talkybean_age_confirmed_${currentUser.uid}`, JSON.stringify({
        isAdultConfirmed: true,
        confirmedAt: Date.now()
      }));

      try {
        const idToken = await currentUser.getIdToken();
        await fetch('/api/user/confirm-age', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ isAdultConfirmed: true })
        });
      } catch (e) {
        console.warn('[Onboarding] Non-fatal age sync warning:', e);
      }
    }

    // 1. Write completed config locally
    StorageService.save('onboarding_completed', true);
    StorageService.save('native_language', nativeLanguage);
    StorageService.save('language', targetLanguage);

    const userProfile = {
      name: name.trim() || 'Learner',
      email: email.trim() || 'synced_user@domain.com',
      goals: goals.trim() || 'General fluency and conversation',
      nativeLanguage,
      targetLanguage,
      age: '18+',
      isAdultConfirmed: true,
      experienceLevel,
      lastUpdated: Date.now()
    };

    // 2. Sync to cloud database
    await CloudStatsService.syncProfile(userProfile);

    // 3. Complete onboarding
    onComplete(userProfile);
  };

  // Localization translator fallback
  const t = (key: string) => {
    return LocalizationService.tTo(key, nativeLanguage);
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex flex-col justify-center items-center py-8 px-4 sm:px-6 relative overflow-hidden selection:bg-accent/30" id="onboarding-wizard">
      {/* Background atmospheric blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-accent/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Android Device Installation Indicator */}
      {isAndroid && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 py-1.5 px-4 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          Android Client Setup Mode Activated
        </div>
      )}

      <div className="w-full max-w-xl bg-card-bg/90 backdrop-blur-3xl border border-app-border rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative z-10">
        {underAgeBlocked ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-text-main">Adult Eligibility Required (18+)</h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Talky Bean is powered by Google Gemini generative artificial intelligence. In compliance with safety standards and provider terms, Talky Bean is exclusively designed for adult learners aged 18 and older. Registration and AI learning access cannot be provided to individuals under 18.
            </p>
            <div className="p-4 rounded-2xl bg-card-soft/40 border border-app-border text-xs text-text-muted max-w-sm mx-auto">
              No personal data or information has been recorded from your session.
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-card-soft hover:bg-app-border/40 text-text-main font-bold text-xs rounded-xl transition-all cursor-pointer border border-app-border"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Progress Tracker */}
            <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] sm:text-xs font-black uppercase text-accent tracking-[0.25em]">
            Step {step} of 3
          </span>
          <div className="flex gap-1.5 items-center">
            {[1, 2, 3].map(s => (
              <div 
                key={s} 
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300", 
                  step === s ? "w-8 bg-accent" : step > s ? "w-3 bg-accent/40" : "w-3 bg-app-border"
                )} 
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-main flex items-center gap-2.5">
                  <Globe2 className="text-accent" size={28} />
                  {t('welcome_title')}
                </h1>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  {t('welcome_subtitle')}
                </p>
              </div>

              {/* NATIVE LANGUAGE SELECTION */}
              <div className="space-y-3">
                <label className="block text-sm font-bold tracking-wide text-text-main flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t('native_lang_label')}
                </label>
                <p className="text-xs text-text-muted -mt-1 leading-relaxed">
                  {t('native_lang_desc')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {Object.entries(NATIVE_LANGUAGE_NAMES).map(([code, name]) => (
                    <button
                      key={`native-${code}`}
                      type="button"
                      onClick={() => setNativeLanguage(code)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all duration-200",
                        nativeLanguage === code 
                          ? "bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(253,224,71,0.1)]" 
                          : "bg-app-bg/50 border-app-border hover:bg-card-bg/80 hover:border-text-muted/30 text-text-muted hover:text-text-main"
                      )}
                    >
                      <span className="text-lg">{NATIVE_LANGUAGE_FLAGS[code]}</span>
                      <span className="truncate">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* TARGET LANGUAGE SELECTION */}
              <div className="space-y-3 pt-2">
                <label className="block text-sm font-bold tracking-wide text-text-main flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {t('target_lang_label')}
                </label>
                <p className="text-xs text-text-muted -mt-1 leading-relaxed">
                  {t('target_lang_desc')}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={`target-${lang.code}`}
                      type="button"
                      onClick={() => setTargetLanguage(lang.code)}
                      className={cn(
                        "py-2.5 px-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all duration-200",
                        targetLanguage === lang.code 
                          ? "bg-accent/15 border-accent text-accent shadow-[0_0_15px_rgba(253,224,71,0.1)]" 
                          : "bg-app-bg/50 border-app-border hover:bg-card-bg/80 hover:border-text-muted/30 text-text-muted hover:text-text-main"
                      )}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span className="truncate">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation Action */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNextStep}
                  className="bg-accent text-black font-semibold rounded-xl text-sm py-3 px-6 hover:opacity-90 flex items-center gap-2 transition-all active:scale-95 shadow-[0_4px_20px_rgba(253,224,71,0.3)]"
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black tracking-tight text-text-main flex items-center gap-2.5">
                  <User className="text-accent" size={24} />
                  {t('install_title')}
                </h2>
                <p className="text-sm text-text-muted mt-1">
                  {t('install_subtitle')}
                </p>
              </div>

              <div className="space-y-4 pt-1">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <User size={14} className="text-accent" />
                    {t('fullname_label')}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('fullname_placeholder')}
                    className="w-full bg-app-bg/50 border border-app-border rounded-xl py-3 px-4 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-all font-medium"
                  />
                </div>

                {/* Adult Eligibility (18+) Gate */}
                <div className="p-4 rounded-2xl bg-card-soft/60 border border-app-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-1.5">
                      <Shield size={13} className="text-accent" />
                      Adult-Only Learning Experience (18+)
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                      Required
                    </span>
                  </div>
                  
                  <p className="text-xs text-text-muted leading-relaxed">
                    Talky Bean uses Google Gemini generative artificial intelligence and is exclusively designed for learners aged 18 and older.
                  </p>

                  <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
                    <input
                      type="checkbox"
                      checked={isAdultConfirmed}
                      onChange={(e) => {
                        setIsAdultConfirmed(e.target.checked);
                        if (e.target.checked) setStepError('');
                      }}
                      className="mt-0.5 w-4 h-4 rounded text-accent focus:ring-accent border-app-border"
                    />
                    <span className="text-xs font-semibold text-text-main leading-snug">
                      I confirm that I am at least 18 years of age and agree to adult-only terms of use.
                    </span>
                  </label>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setUnderAgeBlocked(true)}
                      className="text-[11px] text-text-muted hover:text-red-500 font-semibold transition-colors cursor-pointer"
                    >
                      I am under 18 years old
                    </button>
                  </div>
                </div>

                {stepError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                    <ShieldAlert size={16} className="shrink-0 text-red-500" />
                    <span>{stepError}</span>
                  </div>
                )}

                {/* Goals select/text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <Compass size={14} className="text-accent" />
                    {t('goals_label')}
                  </label>
                  <input
                    type="text"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                    placeholder={t('goals_placeholder')}
                    className="w-full bg-app-bg/50 border border-app-border rounded-xl py-3 px-4 text-sm text-text-main placeholder-text-muted/50 focus:outline-none focus:border-accent/50 transition-all font-medium"
                  />
                </div>

                {/* Level selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                    <GraduationCap size={15} className="text-accent" />
                    {t('experience_label')}
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['A1', 'A2', 'B1', 'B2', 'C1'].map(l => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setExperienceLevel(l)}
                        className={cn(
                          "py-2.5 rounded-xl border text-sm font-black transition-all",
                          experienceLevel === l 
                            ? "bg-accent border-accent text-black shadow-[0_0_12px_rgba(253,224,71,0.2)]" 
                            : "bg-app-bg/50 border-app-border hover:border-text-muted/30 text-text-muted hover:text-text-main"
                        )}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Control buttons */}
              <div className="flex border-t border-app-border/40 pt-4 mt-6 justify-between">
                <button
                  onClick={handlePrevStep}
                  className="bg-app-bg border border-app-border text-text-muted font-semibold rounded-xl text-sm py-2.5 px-5 hover:border-text-muted/40 flex items-center gap-2 transition-all active:scale-95"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
                <button
                  onClick={handleNextStep}
                  className="bg-accent text-black font-semibold rounded-xl text-sm py-2.5 px-6 hover:opacity-90 flex items-center gap-2 transition-all active:scale-95 shadow-[0_4px_18px_rgba(253,224,71,0.25)]"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-black tracking-tight text-text-main flex items-center gap-2.5">
                  <GraduationCap className="text-accent" size={24} />
                  {t('start_learning')}
                </h2>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  Your profile preference: <strong className="text-text-main">{t('NATIVE_LANGUAGE_NAMES.' + nativeLanguage) || NATIVE_LANGUAGE_NAMES[nativeLanguage]}</strong> helper mode to learn <strong className="text-accent">{SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage)?.name}</strong>!
                </p>
              </div>

              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {errorMsg && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-semibold leading-relaxed"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {authMode === 'options' && (
                  <div className="space-y-3 pt-2">
                    {/* Synchronize with Google Sign-In */}
                    {UniversalAuthAdapter.isGoogleSignInAvailable() && (
                      <>
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={handleGoogleSync}
                          className="w-full bg-white text-black font-bold text-sm py-3 px-5 rounded-2xl flex items-center justify-center gap-3 active:scale-98 transition-all hover:opacity-95 shadow-md disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader2 className="animate-spin text-black" size={18} />
                          ) : (
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          )}
                          {t('or_google')}
                        </button>

                        <div className="relative flex py-2 items-center">
                          <div className="flex-grow border-t border-app-border/40"></div>
                          <span className="flex-shrink mx-4 text-xs font-black uppercase text-text-muted leading-none">Or Email</span>
                          <div className="flex-grow border-t border-app-border/40"></div>
                        </div>
                      </>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setAuthMode('email-signup')}
                        className="bg-card-bg hover:bg-card-bg/80 border border-app-border text-text-main font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <User size={14} className="text-accent" />
                        Create Account
                      </button>
                      <button
                        onClick={() => setAuthMode('email-signin')}
                        className="bg-card-bg hover:bg-card-bg/80 border border-app-border text-text-main font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <LogIn size={14} className="text-accent" />
                        Sign In Email
                      </button>
                    </div>

                    {/* Local Guest Fallback */}
                    <div className="pt-4 border-t border-app-border/40 text-center">
                      <button
                        onClick={handleGuestMode}
                        className="text-text-muted hover:text-text-main transition-all text-xs font-bold underline flex items-center justify-center gap-1.5 mx-auto"
                      >
                        <Shield size={14} className="text-accent" />
                        {t('or_guest')}
                      </button>
                    </div>
                  </div>
                )}

                {/* EMAIL SIGN UP */}
                {authMode === 'email-signup' && (
                  <form onSubmit={handleEmailRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase text-text-muted tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-app-bg/50 border border-app-border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase text-text-muted tracking-wider">Secure Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-app-bg/50 border border-app-border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="pt-2 flex flex-col gap-2.5">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-accent text-black font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(253,224,71,0.2)] disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin text-black" size={16} /> : <Check size={16} />}
                        Create Account & Sync Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('options'); setErrorMsg(''); }}
                        className="text-center text-text-muted hover:text-text-main text-xs font-semibold py-1.5 transition-all"
                      >
                        Back to Auth Options
                      </button>
                    </div>
                  </form>
                )}

                {/* EMAIL SIGN IN */}
                {authMode === 'email-signin' && (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase text-text-muted tracking-wider">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-app-bg/50 border border-app-border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-black uppercase text-text-muted tracking-wider">Password</label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-app-bg/50 border border-app-border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:border-accent/40"
                      />
                    </div>
                    <div className="pt-2 flex flex-col gap-2.5">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-accent text-black font-black text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_18px_rgba(253,224,71,0.2)] disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin text-black" size={16} /> : <LogIn size={16} />}
                        Sign In & Sync Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('options'); setErrorMsg(''); }}
                        className="text-center text-text-muted hover:text-text-main text-xs font-semibold py-1.5 transition-all"
                      >
                        Back to Auth Options
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Navigation Action */}
              <div className="flex flex-col sm:flex-row border-t border-app-border/40 pt-4 mt-6 justify-between items-center gap-3">
                <button
                  onClick={handlePrevStep}
                  disabled={isProcessing}
                  className="bg-app-bg border border-app-border text-text-muted font-semibold rounded-xl text-sm py-2.5 px-5 hover:border-text-muted/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <p className="text-[10px] text-text-muted text-center sm:text-right leading-relaxed">
                  By continuing, you agree to our{' '}
                  <button
                    type="button"
                    onClick={() => onViewLegal ? onViewLegal('terms') : (window.location.href = '/terms')}
                    className="underline hover:text-accent font-semibold transition-colors cursor-pointer"
                  >
                    Terms of Use
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => onViewLegal ? onViewLegal('privacy') : (window.location.href = '/privacy')}
                    className="underline hover:text-accent font-semibold transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </button>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
