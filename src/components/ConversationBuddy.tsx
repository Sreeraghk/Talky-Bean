import React from 'react';
import { motion } from 'motion/react';
import { RolePlayScenario } from '../types';
import { Sparkles, Lightbulb } from 'lucide-react';
import { COMMON_ROLE_PLAY_SCENARIOS } from '../data/commonScenarios';
import { TalkingPartnerCard } from './TalkingPartnerCard';

interface ConversationBuddyProps {
  onSelect: (scenario: RolePlayScenario) => void;
  languageCode: string;
  networkStatus: { onLine: boolean; speed: 'good' | 'poor'; checking: boolean };
  onRetryNetwork: () => void;
  user?: any;
  onRequireLogin?: () => void;
}

export function ConversationBuddy({
  onSelect,
  languageCode,
  networkStatus,
  onRetryNetwork,
  user,
  onRequireLogin
}: ConversationBuddyProps) {
  // Only flag genuine offline disconnects (navigator.onLine === false), never false positive latency
  const isTrulyOffline = !networkStatus.onLine;

  const handleCardClick = (buddy: RolePlayScenario) => {
    // Prime speech synthesis synchronously on user touch/click gesture
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
      } catch (e) {}
    }

    if (!user) {
      onRequireLogin?.();
      return;
    }
    if (isTrulyOffline) {
      onRetryNetwork();
      return;
    }
    onSelect(buddy);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-2 text-left px-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f95716] flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#f95716] animate-pulse" />
            <span>TALKING PARTNERS</span>
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
          Your Beans
        </h2>
        <p className="text-xs sm:text-sm text-text-muted font-medium">
          Choose a companion for personalized spoken conversation practice.
        </p>
      </div>

      {/* Network Warning (ONLY if device is genuinely offline) */}
      {isTrulyOffline && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-500/10 border border-red-500/20 p-5 sm:p-6 rounded-[2rem] space-y-3 text-left"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl mt-0.5 shrink-0">📡</span>
            <div className="space-y-1 flex-1">
              <h4 className="font-extrabold text-sm sm:text-base text-text-main flex items-center gap-2">
                Device Offline
                <span className="text-[9px] bg-red-500/20 text-red-400 px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                  Offline
                </span>
              </h4>
              <p className="text-xs text-text-muted leading-relaxed">
                You appear to be offline. Reconnect to Wi-Fi or mobile data to practice with your talking partner.
              </p>
            </div>
          </div>
          <div className="pt-1 flex justify-start">
            <button
              onClick={onRetryNetwork}
              disabled={networkStatus.checking}
              className="px-4 py-2 bg-[#f95716] hover:bg-[#ff6726] text-white rounded-xl text-xs font-bold transition-all shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {networkStatus.checking ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Checking Signal...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Check Connection</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Cinematic Banner Cards Stack matching screenshot */}
      <div className="flex flex-col gap-4 sm:gap-5">
        {COMMON_ROLE_PLAY_SCENARIOS.map((buddy) => (
          <TalkingPartnerCard
            key={buddy.id}
            scenario={buddy}
            onSelect={handleCardClick}
            disabled={isTrulyOffline}
          />
        ))}
      </div>

      {/* Helpful Learner Tip */}
      <div className="bg-card-soft/40 border border-app-border/40 rounded-[24px] p-5 sm:p-6 flex items-start sm:items-center gap-4 text-left">
        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
          <Lightbulb size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-text-main">Pro Tip: Interactive Vocabulary Lookup</h4>
          <p className="text-xs text-text-muted leading-relaxed">
            While speaking with your partner, tap on any unfamiliar word in the transcript to hear its pronunciation and view instant contextual translations.
          </p>
        </div>
      </div>
    </div>
  );
}
