import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Mic, Zap, Check, ArrowRight, ShieldCheck, 
  Globe2, BookOpen, MessageSquare, Award, Play, ChevronDown,
  Gift, Star, Brain, Lock
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { SubscriptionService } from '../services/SubscriptionService';

interface PublicLandingPageProps {
  onEnterApp: () => void;
  onClaimTrial: () => void;
  onLoginClick: () => void;
  onNavigateLegal?: (doc: 'terms' | 'privacy') => void;
  onNavigateDeleteAccount?: () => void;
  onOpenSupport?: () => void;
}

export function PublicLandingPage({ 
  onEnterApp, 
  onClaimTrial, 
  onLoginClick, 
  onNavigateLegal,
  onNavigateDeleteAccount,
  onOpenSupport
}: PublicLandingPageProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const regionalPricing = SubscriptionService.getRegionalPricing();

  const faqs = [
    {
      q: "How does Talky Bean help me speak fluently?",
      a: "Talky Bean combines real-time AI conversation partner with instant pronunciation feedback, native fluency analysis, and 50+ real-world roleplay scenarios. You practice actual speaking rather than just filling in multiple-choice blanks."
    },
    {
      q: "Is there a free trial available?",
      a: "Yes! Every new user can activate a 14-day risk-free Pro trial with zero credit card required. You get unlimited conversation practice and immediate access to all language modules."
    },
    {
      q: "Which languages are currently supported?",
      a: "We support English, German, French, Spanish, Italian, Portuguese, Japanese, Chinese, Russian, Dutch, and Korean with custom dialect and regional accent adaptability."
    },
    {
      q: "Can I use Talky Bean on mobile devices or native apps?",
      a: "Absolutely. Talky Bean is fully optimized for all mobile browsers and deep-links seamlessly into native app wrappers on Android and iOS."
    }
  ];

  return (
    <div className="min-h-screen bg-app-bg text-text-main font-sans selection:bg-accent selection:text-white flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-app-bg/85 backdrop-blur-md border-b border-app-border/40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterApp}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center shadow-md shadow-accent/20">
              <Mic className="text-white w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-text-main">Talky Bean</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full border border-accent/20">
                AI Voice Coach
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold text-text-muted">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <a href="#languages" className="hover:text-accent transition-colors">Languages</a>
            <a href="#pricing" className="hover:text-accent transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-accent transition-colors">FAQ</a>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLoginClick}
              className="text-xs sm:text-sm font-bold text-text-muted hover:text-text-main px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onEnterApp}
              className="px-4 py-2 sm:px-5 sm:py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs sm:text-sm rounded-btn shadow-md shadow-accent/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Launch App</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex flex-wrap items-center justify-center gap-2"
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
              <Gift size={14} className="animate-bounce" />
              <span>14-Day Free Trial Available • No Credit Card Required</span>
            </div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-card-soft border border-app-border text-text-muted text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck size={13} className="text-accent" />
              <span>Adult Learners (18+)</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-text-main max-w-4xl mx-auto leading-[1.1]"
          >
            Master Real Spoken Fluency with Your <span className="bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">AI Voice Coach</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Overcome speaking anxiety and speak naturally in real-life situations. Interactive AI roleplay scenarios, instant speech feedback, and smart grammar guidance.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={onClaimTrial}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-accent to-accent-hover text-white font-extrabold text-base rounded-btn shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
            >
              <Sparkles size={18} />
              <span>Start 14-Day Free Trial</span>
            </button>

            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-card-bg hover:bg-card-soft text-text-main border border-app-border hover:border-accent/40 font-bold text-base rounded-btn transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>Explore Workspace</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>

          {/* Key Benefits Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-text-muted">
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-emerald-500" />
              <span>Instant Speech Recognition</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-emerald-500" />
              <span>50+ Interactive Scenarios</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check size={16} className="text-emerald-500" />
              <span>Native Pronunciation Mirror</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-card-bg border-y border-app-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase font-bold tracking-widest text-accent">Intelligent Learning Engine</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-text-main">Everything you need to reach natural fluency</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card-soft border border-app-border p-8 rounded-card space-y-4 hover:border-accent/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Mic size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-main">AI Voice Partner</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Practice uninterrupted conversational speech in real-time. Your AI voice buddy adapts dynamically to your skill level and speaking pace.
              </p>
            </div>

            <div className="bg-card-soft border border-app-border p-8 rounded-card space-y-4 hover:border-accent/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-main">Real-World Roleplays</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Step into practical scenarios: ordering coffee, navigating immigration, interviewing for jobs, or making new friends abroad.
              </p>
            </div>

            <div className="bg-card-soft border border-app-border p-8 rounded-card space-y-4 hover:border-accent/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-main">Native Fluency Meter</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Receive instant granular scores on accent accuracy, word variety, cadence, and grammatical precision after every sentence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Section */}
      <section id="languages" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase font-bold tracking-widest text-accent">Global Support</h2>
            <p className="text-3xl font-extrabold text-text-main">Practice in 11+ World Languages</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <div 
                key={lang.code}
                onClick={onEnterApp}
                className="bg-card-bg border border-app-border p-4 rounded-2xl flex items-center space-x-3 hover:border-accent/40 cursor-pointer transition-all hover:scale-105"
              >
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <p className="text-sm font-bold text-text-main">{lang.name}</p>
                  <p className="text-[10px] text-text-muted uppercase font-mono">{lang.code}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card-bg border-y border-app-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-xs uppercase font-bold tracking-widest text-accent">Transparent Pricing</h2>
            <p className="text-3xl font-extrabold text-text-main">Start Free, Upgrade Whenever</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* 14-Day Free Trial Tier */}
            <div className="bg-card-soft border-2 border-emerald-500/40 p-8 rounded-card relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 left-8 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow">
                100% Risk Free
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-text-main">14-Day Free Trial</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black font-mono text-emerald-500">{regionalPricing.currencySymbol}0</span>
                  <span className="text-xs text-text-muted font-bold uppercase">/ 14 days</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Instant full access to AI voice conversations, real-world scenarios, and vocabulary tools with zero billing required.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-app-border/40">
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>Full Pro access for 14 complete days</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>No credit card or payment info required</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-emerald-500 shrink-0" />
                    <span>All 11+ languages unlocked</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onClaimTrial}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-btn shadow-md transition-all cursor-pointer"
              >
                Claim 14-Day Free Access
              </button>
            </div>

            {/* Talky Bean Pro Tier */}
            <div className="bg-card-soft border border-app-border p-8 rounded-card relative flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-text-main">Talky Bean Pro</h3>
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-black font-mono text-accent">{regionalPricing.currencySymbol}{regionalPricing.priceValue}</span>
                  <span className="text-xs text-text-muted font-bold uppercase">/ month</span>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Unlimited continuous speech practice, advanced fluency metrics, custom scenarios, and priority voice models.
                </p>

                <div className="space-y-2.5 pt-4 border-t border-app-border/40">
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-accent shrink-0" />
                    <span>Unlimited voice speaking minutes</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-accent shrink-0" />
                    <span>Custom scenario creation engine</span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-text-main font-medium">
                    <Check size={16} className="text-accent shrink-0" />
                    <span>Sync across Web, Android, and iOS</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-3.5 px-6 bg-accent hover:bg-accent-hover text-white font-bold text-sm rounded-btn shadow-md transition-all cursor-pointer"
              >
                Subscribe to Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-widest text-accent">Questions & Answers</h2>
            <p className="text-3xl font-extrabold text-text-main">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="bg-card-bg border border-app-border rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full p-6 text-left font-bold text-sm sm:text-base text-text-main flex items-center justify-between cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={18} className={`text-text-muted transition-transform ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="px-6 pb-6 text-xs sm:text-sm text-text-muted leading-relaxed border-t border-app-border/30 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-card-bg border-t border-app-border/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
              <Mic size={16} />
            </div>
            <span className="font-bold text-sm text-text-main">Talky Bean AI Voice Coach</span>
          </div>

          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Talky Bean. Exclusively designed for adult learners (18+). Built for global fluency.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-text-muted">
            <button onClick={onEnterApp} className="hover:text-accent transition-colors cursor-pointer">App Workspace</button>
            <a href="#pricing" className="hover:text-accent transition-colors">Plans</a>
            <button
              onClick={() => onNavigateLegal ? onNavigateLegal('terms') : (window.location.href = '/terms')}
              className="hover:text-accent transition-colors cursor-pointer underline sm:no-underline"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigateLegal ? onNavigateLegal('privacy') : (window.location.href = '/privacy')}
              className="hover:text-accent transition-colors cursor-pointer underline sm:no-underline"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigateDeleteAccount ? onNavigateDeleteAccount() : (window.location.href = '/delete-account')}
              className="hover:text-red-400 transition-colors cursor-pointer underline sm:no-underline"
            >
              Delete Account
            </button>
            {onOpenSupport && (
              <button
                onClick={onOpenSupport}
                className="hover:text-accent transition-colors cursor-pointer underline sm:no-underline"
              >
                Help & Support
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
