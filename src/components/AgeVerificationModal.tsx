import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, CheckCircle, ArrowRight, Lock, Ban } from 'lucide-react';
import { CloudStatsService } from '../services/CloudStatsService';

interface AgeVerificationModalProps {
  onConfirmed: () => void;
  onUnderAgeBlocked?: () => void;
  user?: any;
}

export function AgeVerificationModal({ onConfirmed, onUnderAgeBlocked, user }: AgeVerificationModalProps) {
  const [status, setStatus] = useState<'prompt' | 'blocked'>('prompt');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedCheck, setConfirmedCheck] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirmAdult = async () => {
    if (!confirmedCheck) return;
    setSubmitting(true);
    setErrorMessage('');
    try {
      localStorage.setItem('talkybean_age_confirmed_v1', JSON.stringify({
        isAdultConfirmed: true,
        confirmedAt: Date.now()
      }));

      // If user is authenticated, sync to server authoritatively
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch('/api/user/confirm-age', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ isAdultConfirmed: true })
          });

          if (!response.ok) {
            const errJson = await response.json().catch(() => ({}));
            throw new Error(errJson.error || 'Server rejected age confirmation.');
          }

          localStorage.setItem(`talkybean_age_confirmed_${user.uid}`, JSON.stringify({
            isAdultConfirmed: true,
            confirmedAt: Date.now()
          }));
        } catch (e: any) {
          console.error('[AgeGate] Server verification failed:', e);
          setErrorMessage(e.message || 'Unable to synchronize age eligibility with server. Please try again.');
          setSubmitting(false);
          return;
        }
      }

      onConfirmed();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnderAge = () => {
    setStatus('blocked');
    localStorage.removeItem('talkybean_age_confirmed_v1');
    if (user?.uid) {
      localStorage.removeItem(`talkybean_age_confirmed_${user.uid}`);
    }
    if (onUnderAgeBlocked) {
      onUnderAgeBlocked();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card-bg border border-app-border rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center"
      >
        {status === 'prompt' ? (
          <>
            <div className="w-14 h-14 rounded-3xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert size={28} />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
                Adult-Only Learning Experience
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-text-main tracking-tight pt-1">
                Age Eligibility Required (18+)
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Talky Bean is powered by Google Gemini generative artificial intelligence. In compliance with safety standards and provider terms, Talky Bean is exclusively designed for adult learners aged 18 and older.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card-soft/50 border border-app-border/80 text-left space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedCheck}
                  onChange={(e) => setConfirmedCheck(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-accent focus:ring-accent border-app-border"
                />
                <span className="text-xs text-text-main font-semibold leading-snug">
                  I confirm that I am at least 18 years of age and agree to the adult-only terms of use.
                </span>
              </label>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2 text-left">
                <AlertTriangle size={15} className="shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmAdult}
                disabled={!confirmedCheck || submitting}
                className="w-full py-3.5 px-4 bg-accent hover:bg-accent-hover text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <span>{submitting ? 'Verifying...' : 'Confirm and Enter Talky Bean'}</span>
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={handleUnderAge}
                className="w-full py-2.5 text-xs text-text-muted hover:text-red-500 font-semibold transition-colors cursor-pointer"
              >
                I am under 18 years old
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-3xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
              <Ban size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-text-main">
                Access Restricted
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                Talky Bean is exclusively available to learners aged 18 and older due to generative AI capabilities. Registration and AI access cannot be provided to individuals under 18.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-card-soft/40 border border-app-border text-xs text-text-muted">
              No personal information has been recorded from your session.
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => window.location.href = 'https://www.google.com'}
                className="w-full py-2.5 px-4 bg-card-soft hover:bg-app-border/40 text-text-main font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Exit Website
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
