import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Sparkles, Loader2, LogIn, Lock, 
  ArrowRight, ShieldCheck, Heart, Sparkle, Eye, EyeOff, 
  CheckCircle2, KeyRound, AlertTriangle, ChevronDown, UserPlus, ArrowLeft
} from 'lucide-react';
import { CloudStatsService } from '../services/CloudStatsService';
import { UniversalAuthAdapter } from '../services/UniversalAuthAdapter';
import { platformService } from '../services/PlatformService';

interface LoginScreenProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onViewLegal?: (doc: 'terms' | 'privacy') => void;
}

export function LoginScreen({ onSuccess, onCancel, onViewLegal }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);

  const toggleAuthMode = (mode: 'signin' | 'signup' | 'forgot') => {
    setAuthMode(mode);
    setError('');
  };

  const triggerNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await CloudStatsService.resetPassword(email.trim());
      triggerNotification('Password reset link sent to your email! Please check your inbox.');
      toggleAuthMode('signin');
    } catch (err: any) {
      console.error('[ResetPassword Error]', err);
      let friendlyError = err?.message || 'Failed to send password reset email.';
      if (err?.code === 'auth/user-not-found') {
        friendlyError = 'No account found with this email address.';
      } else if (err?.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address.';
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (authMode === 'signup' && !isAdultConfirmed) {
      setError('Adult eligibility required: You must explicitly confirm that you are at least 18 years old to register an account.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const user = await CloudStatsService.registerWithEmail(email.trim(), password, name.trim());
        localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({
          isAdultConfirmed: true,
          confirmedAt: Date.now()
        }));
        if (user?.uid) {
          localStorage.setItem(`talkybean_age_confirmed_${user.uid}`, JSON.stringify({
            isAdultConfirmed: true,
            confirmedAt: Date.now()
          }));
          try {
            const idToken = await user.getIdToken();
            await fetch('/api/user/confirm-age', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ isAdultConfirmed: true })
            });
          } catch {}
        }
        triggerNotification('Account created successfully! Syncing profile...');
      } else {
        await CloudStatsService.loginWithEmail(email.trim(), password);
        triggerNotification('Successfully signed in! Syncing progress...');
      }
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('[EmailAuth Error]', err);
      let friendlyError = err?.message || 'Authentication failed.';
      
      const isWrongPassword = 
        err?.code === 'auth/wrong-password' || 
        err?.code === 'auth/invalid-credential' ||
        friendlyError.includes('wrong-password') ||
        friendlyError.includes('invalid-credential') ||
        friendlyError.includes('wrong-password-or-email') ||
        friendlyError.includes('login');

      if (isWrongPassword) {
        friendlyError = 'Invalid password or email. Click "Forgot Password?" above to reset.';
      } else if (err?.code === 'auth/email-already-in-use') {
        friendlyError = 'This email is already registered. Please sign in instead.';
      } else if (err?.code === 'auth/invalid-email') {
        friendlyError = 'Please enter a valid email address.';
      } else if (err?.code === 'auth/weak-password') {
        friendlyError = 'Password is too weak. Recommend at least 6 characters.';
      } else if (err?.code === 'auth/operation-not-allowed' || friendlyError.includes('operation-not-allowed')) {
        friendlyError = 'Email/Password sign-in is currently unavailable. Please try again later or sign in with Google.';
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!UniversalAuthAdapter.isGoogleSignInAvailable()) {
      setError('Google Sign-In is only available on web or in builds with the native GoogleAuth plugin configured. Please use email & password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await CloudStatsService.login();
      triggerNotification('Signed in with Google successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errCode = err?.code || '';
      const errMsg = err?.message || '';
      const isUserCancellation = 
        errCode === 'auth/popup-closed-by-user' || 
        errCode === 'auth/cancelled-popup-request' ||
        errMsg.includes('popup-closed-by-user') ||
        errMsg.includes('cancelled-popup-request') ||
        errMsg.includes('popup closed by user');

      if (!isUserCancellation) {
        setError(errMsg || 'Google authentication process encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!UniversalAuthAdapter.isAppleSignInAvailable()) {
      setError('Sign in with Apple requires the native SignInWithApple plugin on iOS devices. Please use email & password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await CloudStatsService.loginWithApple();
      triggerNotification('Signed in with Apple successfully!');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (!errMsg.includes('canceled') && !errMsg.includes('cancelled')) {
        setError(errMsg || 'Apple authentication process encountered an error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main flex flex-col justify-center items-center py-12 px-4 sm:px-6 relative overflow-hidden selection:bg-accent/30" id="login-container">
      {/* Dynamic Animated Ambient Glow Blobs matching homepage */}
      <motion.div 
        animate={{ 
          x: [0, 40, -30, 0], 
          y: [0, -50, 25, 0],
          scale: [1, 1.2, 0.9, 1] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[110px] pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: [0, -50, 35, 0], 
          y: [0, 40, -40, 0],
          scale: [1, 0.95, 1.15, 1] 
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 -right-20 w-80 h-80 bg-orange-400/20 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Top Branding Header matching homepage typography & gradient */}
        <div className="text-center mb-8 space-y-3">
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-accent/20 rounded-[2rem] border border-orange-500/35 shadow-[0_0_30px_rgba(255,122,0,0.25)] mb-1"
          >
            <Sparkles size={32} className="text-accent animate-pulse" />
          </motion.div>
          
          <div>
            <h1 className="font-smokum text-5xl sm:text-6xl md:text-7xl font-normal tracking-wide uppercase bg-gradient-to-r from-orange-500 via-amber-500 via-rose-500 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
              Talky Bean
            </h1>
            <p className="text-text-muted/80 text-[11px] sm:text-xs font-black uppercase tracking-[0.35em] mt-2">
              Interactive AI Language Coach
            </p>
          </div>

          <p className="text-xs sm:text-sm text-text-muted max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Learn grammar, practice listening and reading, and build spoken confidence with adaptive AI roleplays. Log in to sync your progress!
          </p>
        </div>

        {/* Main Sleek Auth Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="bg-card-bg/90 backdrop-blur-2xl border-2 border-accent/40 shadow-[0_20px_60px_rgba(255,122,0,0.15)] rounded-[28px] p-6 sm:p-8 space-y-6 relative overflow-hidden"
          id="login-card"
        >
          {/* Glowing Gradient Top Stripe */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 via-rose-500 to-amber-600" />

          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {authMode === 'forgot' ? (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  onSubmit={handlePasswordReset}
                  className="space-y-5 pt-1"
                >
                  <div className="flex items-center gap-3 text-accent pb-2 border-b border-app-border/40">
                    <ShieldCheck size={20} />
                    <span className="font-extrabold uppercase tracking-wider text-xs">Reset Password</span>
                  </div>

                  <p className="text-xs text-text-muted leading-relaxed">
                    Enter your registered email address below. We'll send you a secure link to reset your password and regain access to your Talky Bean learning profile.
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                        disabled={loading}
                        required
                      />
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -5 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-2xl flex items-center gap-2"
                    >
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all disabled:opacity-50 cursor-pointer group"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        <span>Send Password Reset Link</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => toggleAuthMode('signin')}
                    className="w-full text-center text-xs text-accent font-bold hover:underline transition-all cursor-pointer flex items-center justify-center gap-1 mt-2"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Sign In</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="auth-panels"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* SIGN IN ACCORDION PANEL */}
                  <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    authMode === 'signin'
                      ? 'border-accent/80 bg-accent/5 shadow-[0_4px_25px_rgba(255,122,0,0.1)]'
                      : 'border-app-border/70 bg-card-bg/60 hover:bg-card-soft/30 hover:border-accent/30'
                  }`}>
                    <button
                      type="button"
                      onClick={() => toggleAuthMode('signin')}
                      className="w-full flex items-center justify-between p-4 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-all ${
                          authMode === 'signin' 
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20' 
                            : 'bg-card-soft text-text-muted'
                        }`}>
                          <LogIn size={18} />
                        </div>
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-wider transition-all ${
                            authMode === 'signin' ? 'text-accent' : 'text-text-main'
                          }`}>
                            Log In
                          </h3>
                        </div>
                      </div>

                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        authMode === 'signin' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-app-border bg-input-bg text-text-muted'
                      }`}>
                        <motion.div animate={{ rotate: authMode === 'signin' ? 180 : 0 }}>
                          <ChevronDown size={14} />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence mode="wait">
                      {authMode === 'signin' && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0.92, originY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0.92 }}
                          transition={{ 
                            duration: 0.3, 
                            ease: [0.22, 1, 0.36, 1] // Explosive quintic expand
                          }}
                          style={{ willChange: "transform, opacity" }}
                          className="overflow-hidden transform-gpu"
                        >
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12, delay: 0.15, ease: "easeOut" }}
                            className="px-4 pb-5 pt-1 border-t border-app-border/30 space-y-4"
                          >
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                                    disabled={loading}
                                    required
                                  />
                                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Password</label>
                                  <button
                                    type="button"
                                    onClick={() => toggleAuthMode('forgot')}
                                    className="text-[10px] text-accent font-extrabold hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    <ShieldCheck size={11} />
                                    <span>Forgot Password?</span>
                                  </button>
                                </div>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                                    disabled={loading}
                                    required
                                  />
                                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>

                              {error && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-2"
                                >
                                  <AlertTriangle size={15} className="shrink-0 text-red-500" />
                                  <span>{error}</span>
                                </motion.div>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all disabled:opacity-50 cursor-pointer group"
                              >
                                {loading ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <span>Sign In To App</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </motion.button>
                            </form>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* REGISTER ACCORDION PANEL */}
                  <div className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                    authMode === 'signup'
                      ? 'border-accent/80 bg-accent/5 shadow-[0_4px_25px_rgba(255,122,0,0.1)]'
                      : 'border-app-border/70 bg-card-bg/60 hover:bg-card-soft/30 hover:border-accent/30'
                  }`}>
                    <button
                      type="button"
                      onClick={() => toggleAuthMode('signup')}
                      className="w-full flex items-center justify-between p-4 text-left transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl transition-all ${
                          authMode === 'signup' 
                            ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20' 
                            : 'bg-card-soft text-text-muted'
                        }`}>
                          <UserPlus size={18} />
                        </div>
                        <div>
                          <h3 className={`text-xs font-black uppercase tracking-wider transition-all ${
                            authMode === 'signup' ? 'text-accent' : 'text-text-main'
                          }`}>
                            Register New Account
                          </h3>
                        </div>
                      </div>

                      <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                        authMode === 'signup' ? 'border-accent/50 bg-accent/10 text-accent' : 'border-app-border bg-input-bg text-text-muted'
                      }`}>
                        <motion.div animate={{ rotate: authMode === 'signup' ? 180 : 0 }}>
                          <ChevronDown size={14} />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence mode="wait">
                      {authMode === 'signup' && (
                        <motion.div
                          initial={{ opacity: 0, scaleY: 0.92, originY: 0 }}
                          animate={{ opacity: 1, scaleY: 1 }}
                          exit={{ opacity: 0, scaleY: 0.92 }}
                          transition={{ 
                            duration: 0.3, 
                            ease: [0.22, 1, 0.36, 1] // Explosive quintic expand
                          }}
                          style={{ willChange: "transform, opacity" }}
                          className="overflow-hidden transform-gpu"
                        >
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12, delay: 0.15, ease: "easeOut" }}
                            className="px-4 pb-5 pt-1 border-t border-app-border/30 space-y-4"
                          >
                            <form onSubmit={handleEmailAuth} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Display Name</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="e.g. Sreeragh K"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                                    disabled={loading}
                                    required
                                  />
                                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Email Address</label>
                                <div className="relative">
                                  <input
                                    type="email"
                                    placeholder="email@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                                    disabled={loading}
                                    required
                                  />
                                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Password (Min 6 characters)</label>
                                <div className="relative">
                                  <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-input-bg border border-app-border/80 rounded-2xl text-xs sm:text-sm text-text-main outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all shadow-inner focus:bg-card-bg"
                                    disabled={loading}
                                    required
                                  />
                                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                                  <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main cursor-pointer"
                                    tabIndex={-1}
                                  >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>

                              {/* 18+ Adult Eligibility Confirmation */}
                              <div className="p-3.5 bg-card-soft/60 border border-app-border/80 rounded-2xl text-left">
                                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isAdultConfirmed}
                                    onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 rounded text-accent focus:ring-accent border-app-border"
                                    required
                                  />
                                  <span className="text-[11px] text-text-main font-semibold leading-snug">
                                    I confirm that I am at least 18 years of age and agree to the adult-only{' '}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-accent underline font-bold">Terms of Service</a>{' '}
                                    and{' '}
                                    <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-accent underline font-bold">Privacy Policy</a>.
                                  </span>
                                </label>
                              </div>

                              {error && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  className="text-xs font-semibold text-red-500 bg-red-500/10 border border-red-500/20 px-3.5 py-2.5 rounded-2xl flex items-center gap-2"
                                >
                                  <AlertTriangle size={15} className="shrink-0 text-red-500" />
                                  <span>{error}</span>
                                </motion.div>
                              )}

                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 border border-orange-400/30 transition-all disabled:opacity-50 cursor-pointer group"
                              >
                                {loading ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <>
                                    <span>Create Secure Account</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                  </>
                                )}
                              </motion.button>
                            </form>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Separator if not in forgot password mode */}
            {authMode !== 'forgot' && (
              <>
                {(UniversalAuthAdapter.isGoogleSignInAvailable() || UniversalAuthAdapter.isAppleSignInAvailable()) && (
                  <>
                    <div className="relative flex py-1 items-center justify-center">
                      <div className="flex-grow border-t border-app-border/60"></div>
                      <span className="flex-shrink mx-4 text-text-muted text-[10px] uppercase font-black tracking-widest bg-card-bg/80 px-2 py-0.5 rounded">
                        or continue with
                      </span>
                      <div className="flex-grow border-t border-app-border/60"></div>
                    </div>

                    {/* Social Authentication Buttons */}
                    <div className="space-y-2.5">
                      {UniversalAuthAdapter.isGoogleSignInAvailable() && (
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={handleGoogleLogin}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-card-soft/80 border-2 border-app-border hover:border-accent/50 rounded-2xl text-xs font-black uppercase tracking-wider text-text-main hover:bg-card-bg transition-all shadow-sm group cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          <span>Authenticate with Google</span>
                        </motion.button>
                      )}

                      {UniversalAuthAdapter.isAppleSignInAvailable() && (
                        <motion.button
                          whileHover={{ scale: 1.015 }}
                          whileTap={{ scale: 0.985 }}
                          onClick={handleAppleLogin}
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-black text-white hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm group cursor-pointer"
                        >
                          <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.56-7.85-11.6-14.33-6.73-10.74-11.83-22.75-15.3-36.03-3.48-13.28-5.22-25.75-5.22-37.42 0-14.38 3.5-26.63 10.5-36.75 7-10.13 16.27-15.31 27.81-15.54 4.58 0 9.8 1.19 15.67 3.56 5.87 2.37 9.53 3.61 10.98 3.73 2.12-.33 5.92-1.63 11.41-3.9 5.48-2.28 10.36-3.32 14.63-3.12 11.77.74 21.04 4.96 27.81 12.67-10.23 6.18-15.24 14.88-15.02 26.09.22 8.91 3.58 16.34 10.08 22.28 6.5 5.95 14.33 9.4 23.49 10.36-2.13 6.42-4.63 12.87-7.51 19.34zM119.22 33.15c0-6.73 2.45-13.3 7.35-19.71 4.9-6.42 11.23-10.9 18.99-13.44.22 1.34.33 2.58.33 3.73 0 6.6-2.4 13.06-7.21 19.38-4.81 6.32-11.29 10.87-19.46 13.66v-3.62z"/>
                          </svg>
                          <span>Sign in with Apple</span>
                        </motion.button>
                      )}
                    </div>
                  </>
                )}

                {platformService.isNative() && !UniversalAuthAdapter.isGoogleSignInAvailable() && !UniversalAuthAdapter.isAppleSignInAvailable() && (
                  <div className="pt-2 text-center">
                    <p className="text-[10px] text-text-muted/80">
                      Mobile device mode: Please use email &amp; password above to sign in or create an account.
                    </p>
                  </div>
                )}

                {/* Legal compliance disclosure */}
                <div className="pt-3 border-t border-app-border/40 text-center">
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    By signing in or creating an account, you agree to our{' '}
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
              </>
            )}
          </div>
        </motion.div>

        {/* Footer info lockups */}
        <div className="mt-8 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-semibold text-text-muted flex items-center justify-center gap-1 select-none">
            <span className="text-orange-500">🧡</span> Made with love
          </p>
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-4 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-accent transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft size={12} />
              <span>Back to Home</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* Floating success feedback helper */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3.5 z-[200] border border-white/10"
          >
            <Sparkle size={16} className="animate-spin text-white" />
            <span className="text-xs font-black tracking-wide uppercase">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
