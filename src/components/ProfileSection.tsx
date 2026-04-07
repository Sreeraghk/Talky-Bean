import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Target, Sparkles, Loader2, Save, MessageSquare, Palette, Check } from 'lucide-react';
import { UserService } from '../services/UserService';
import { ThemeService, AppTheme } from '../services/ThemeService';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';

const THEMES: { id: AppTheme; name: string; color: string; desc: string; gradient?: string }[] = [
  { id: 'dark', name: 'Dark Mode', color: '#18181b', gradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)', desc: 'Classic dark aesthetic' },
  { id: 'light', name: 'Light Mode', color: '#f8fafc', desc: 'Clean and bright look' },
  { id: 'midnight-neon', name: 'Midnight Neon', color: '#0D0221', gradient: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%)', desc: 'Retro-futurist pulse' },
  { id: 'street-graphite', name: 'Street Graphite', color: '#121212', gradient: 'linear-gradient(135deg, #121212 0%, #FF6B00 100%)', desc: 'Urban industrial raw' },
  { id: 'y2k-kawaii', name: 'Y2K Kawaii', color: '#F8F0FF', gradient: 'linear-gradient(135deg, #FFB6C1 0%, #A0E7E5 100%)', desc: 'Glossy bubble nostalgia' },
];

export function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goals, setGoals] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(ThemeService.getTheme());

  useEffect(() => {
    const p = UserService.getProfile();
    if (p) {
      setProfile(p);
      setGoals(p.goals);
    }
  }, []);

  const handleUpdateGoals = async () => {
    if (!goals.trim() || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await UserService.updateGoals(goals);
      setProfile(updated);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update goals:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleThemeChange = (theme: AppTheme) => {
    ThemeService.setTheme(theme);
    setCurrentTheme(theme);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20">
          <User className="text-accent w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">Your Profile</h2>
          <p className="text-text-muted text-sm">Personalize your learning journey</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Goals Input */}
        <div className="bg-card-bg border border-app-border p-8 rounded-card shadow-app space-y-6">
          <div className="flex items-center gap-3 text-accent">
            <Target size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">Your Goals & Motivation</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-text-muted leading-relaxed">
              Tell us about your goals, wishes, likes, fantasies, and why you are learning this language. 
              We'll use this to curate a personal experience for you.
            </p>
            
            <textarea
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g. I want to become a nurse in Germany..."
              className="w-full h-48 bg-input-bg border border-app-border rounded-2xl p-4 text-sm text-text-main focus:border-accent/50 outline-none transition-all resize-none"
              maxLength={1500}
            />
            
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-text-muted font-medium">
                {goals.split(/\s+/).filter(Boolean).length} / 250 words
              </span>
              <button
                onClick={handleUpdateGoals}
                disabled={isUpdating || !goals.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-btn text-sm font-bold hover:bg-accent-hover transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Update Goals
              </button>
            </div>
          </div>
        </div>

        {/* AI Assessment */}
        <div className="bg-card-bg border border-app-border p-8 rounded-card shadow-app space-y-6 flex flex-col">
          <div className="flex items-center gap-3 text-accent">
            <Sparkles size={20} />
            <h3 className="font-bold uppercase tracking-widest text-xs">AI Assessment</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {profile?.aiAssessment ? (
                <motion.div
                  key="assessment"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-accent/5 border border-accent/10 p-6 rounded-3xl relative">
                    <MessageSquare size={16} className="absolute -top-2 -left-2 text-accent" />
                    <p className="text-sm text-text-main leading-relaxed italic">
                      "{profile.aiAssessment}"
                    </p>
                  </div>
                  <p className="text-[10px] text-text-muted text-center uppercase tracking-widest font-bold">
                    This note helps Gemini personalize your exercises
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-accent/5 rounded-2xl flex items-center justify-center mx-auto">
                    <Sparkles size={24} className="text-text-muted" />
                  </div>
                  <p className="text-sm text-text-muted">
                    Update your goals to see your personalized AI assessment.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="bg-card-bg border border-app-border p-8 rounded-card shadow-app space-y-6">
        <div className="flex items-center gap-3 text-accent">
          <Palette size={20} />
          <h3 className="font-bold uppercase tracking-widest text-xs">App Aesthetics</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={cn(
                "group relative p-4 rounded-2xl border transition-all text-left space-y-2",
                currentTheme === theme.id 
                  ? "bg-accent/5 border-accent shadow-lg" 
                  : "bg-input-bg border-app-border hover:border-accent/30"
              )}
            >
              <div 
                className={cn(
                  "w-full h-12 rounded-xl mb-3 shadow-inner flex items-center justify-center relative overflow-hidden",
                  theme.id === 'midnight-neon' && "animate-pulse shadow-[0_0_15px_rgba(255,0,255,0.4)]",
                  theme.id === 'street-graphite' && "hover:animate-bounce",
                  theme.id === 'y2k-kawaii' && "hover:scale-110 transition-transform duration-300"
                )}
                style={{ background: theme.gradient || theme.color }}
              >
                {theme.id === 'midnight-neon' && (
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_49%,rgba(255,255,255,0.2)_50%,transparent_51%)] bg-[length:20px_20px]" />
                    <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_49%,rgba(255,255,255,0.2)_50%,transparent_51%)] bg-[length:20px_20px]" />
                  </div>
                )}
                {theme.id === 'street-graphite' && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/sneaker-collage/100/100')] bg-cover opacity-60 mix-blend-overlay" />
                    <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]" />
                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-white font-black tracking-tighter bg-accent px-1">SNEAKER_ID</div>
                  </div>
                )}
                {theme.id === 'y2k-kawaii' && (
                  <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffccdd_1px,transparent_1px)] bg-[length:10px_10px] opacity-50" />
                    <div className="absolute top-1 left-2 w-3 h-3 bg-white/80 rounded-full blur-[1px] shadow-sm" />
                    <div className="absolute top-2 right-2 w-8 h-4 bg-[#A0E7E5]/80 rotate-[10deg] shadow-sm" />
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px]">🎀 ✨ 🍭</div>
                  </div>
                )}
                {currentTheme === theme.id && <Check className="text-white relative z-10 drop-shadow-md" size={20} />}
              </div>
              <div className="space-y-1">
                <p className={cn(
                  "text-sm font-bold transition-colors",
                  currentTheme === theme.id ? "text-accent" : "text-text-main"
                )}>
                  {theme.name}
                </p>
                <p className="text-[10px] text-text-muted leading-tight">
                  {theme.desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-accent text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
          >
            <Sparkles size={18} />
            <span className="text-sm font-bold">Preferences updated!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
