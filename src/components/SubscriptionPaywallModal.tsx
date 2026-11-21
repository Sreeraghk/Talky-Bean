import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Check, Loader2, Lock, X, AlertTriangle, CreditCard, Zap } from 'lucide-react';
import { SubscriptionService, SubscriptionState } from '../services/SubscriptionService';
import { platformService } from '../services/PlatformService';
import { ApiService } from '../services/ApiService';
import { DodoPayments } from 'dodopayments-checkout';
import { cn } from '../lib/utils';

interface SubscriptionPaywallModalProps {
  onClose: () => void;
  onActivated: (state: SubscriptionState) => void;
  onViewLegal?: (doc: 'terms' | 'privacy') => void;
}

export function SubscriptionPaywallModal({ onClose, onActivated, onViewLegal }: SubscriptionPaywallModalProps) {
  const [trialLoading, setTrialLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string>('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [restoreMessage, setRestoreMessage] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [isTrialUsed, setIsTrialUsed] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'pro_monthly' | 'pro_yearly'>('pro_monthly');

  useEffect(() => {
    // Determine current trial used state and Device ID
    const state = SubscriptionService.getSubscriptionState();
    setIsTrialUsed(state.trialUsed);

    SubscriptionService.getDeviceId().then(id => {
      setDeviceId(id);
    });

    // Initialize Dodo Payments SDK Overlay Mode
    try {
      DodoPayments.Initialize({
        mode: 'test',
        displayType: 'overlay'
      });
    } catch (e) {
      console.warn('[DodoPayments SDK]: Notice initializing overlay SDK:', e);
    }
  }, []);

  const handleStartTrial = async () => {
    setTrialLoading(true);
    setErrorText(null);
    try {
      const nextState = await SubscriptionService.startFreeTrial();
      onActivated(nextState);
    } catch (err: any) {
      setErrorText(err?.message || 'Verification failed. Could not activate free trial.');
    } finally {
      setTrialLoading(false);
    }
  };

  const handleStartDodoCheckout = async (planId: 'pro_monthly' | 'pro_yearly' = 'pro_monthly') => {
    setPurchaseLoading(planId);
    setErrorText(null);
    try {
      const { UniversalPaymentsAdapter } = await import('../services/UniversalPaymentsAdapter');
      await UniversalPaymentsAdapter.requestPurchase({
        planId,
        onSuccess: (nextState) => {
          onActivated(nextState);
        },
        onError: (err) => {
          setErrorText(err.message || 'Checkout failed. Please try again.');
        }
      });
    } catch (err: any) {
      setErrorText(err?.message || 'Checkout initialization failed. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  const handleRestorePurchases = async () => {
    setRestoreLoading(true);
    setErrorText(null);
    setRestoreMessage(null);
    try {
      const { UniversalPaymentsAdapter } = await import('../services/UniversalPaymentsAdapter');
      const res = await UniversalPaymentsAdapter.restorePurchases();
      if (res.restored) {
        setRestoreMessage(res.message);
        const nextState = SubscriptionService.getSubscriptionState();
        setTimeout(() => {
          onActivated(nextState);
        }, 1200);
      } else {
        setRestoreMessage(res.message);
      }
    } catch (err: any) {
      setErrorText(err?.message || 'Failed to restore purchases.');
    } finally {
      setRestoreLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transform-gpu will-change-[opacity]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-xl bg-card-bg border border-app-border rounded-card shadow-[0_30px_70px_rgba(0,0,0,0.5)] overflow-hidden z-10 flex flex-col max-h-[90vh] transform-gpu will-change-transform"
      >
        {/* Decorative Top Accent */}
        <div className="h-1.5 bg-gradient-to-r from-accent via-accent-hover to-accent" />

        {/* Header Options */}
        <div className="flex justify-between items-center px-6 pt-5 pb-3 border-b border-app-border/45">
          <div className="flex items-center gap-2">
            <Lock size={15} className="text-accent" />
            <span className="font-heading font-black text-[10px] uppercase tracking-widest text-text-muted">Premium Gateway</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-2.5 hover:bg-card-soft text-text-muted hover:text-text-main rounded-full text-xs transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} className="text-accent" />
            </div>
            <h3 className="text-2xl font-black text-text-main tracking-tight md:text-3xl leading-none">
              Premium Account Required
            </h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
              Unlock unlimited interactive practice scenarios, grammar assessments, and daily voice sessions with the Talky Bean AI.
            </p>
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-card-soft/50 border border-app-border/40 p-4 rounded-2xl">
            <div className="flex items-start gap-2.5 text-xs text-text-main">
              <div className="mt-0.5 p-0.5 bg-accent/15 text-accent rounded-full shrink-0">
                <Check size={12} />
              </div>
              <span>Unlimited conversations with your Talky Bean</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-text-main">
              <div className="mt-0.5 p-0.5 bg-accent/15 text-accent rounded-full shrink-0">
                <Check size={12} />
              </div>
              <span>Premium high-fidelity voice assessment profiles</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-text-main">
              <div className="mt-0.5 p-0.5 bg-accent/15 text-accent rounded-full shrink-0">
                <Check size={12} />
              </div>
              <span>Deep personalized grammar assessments</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-text-main">
              <div className="mt-0.5 p-0.5 bg-accent/15 text-accent rounded-full shrink-0">
                <Check size={12} />
              </div>
              <span>Vocabulary mastery & level adjustments</span>
            </div>
          </div>

          {errorText && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-1.5 text-left">
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle size={15} />
                <span>Notice</span>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                {errorText}
              </p>
            </div>
          )}

          {restoreMessage && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 text-left">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={15} />
                <span>Store Entitlement Status</span>
              </div>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                {restoreMessage}
              </p>
            </div>
          )}

          {/* Action Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* 1. Free Trial Option Card */}
            <div className="flex flex-col justify-between p-5 rounded-2xl border border-app-border bg-card-soft hover:border-accent/25 transition-all text-left space-y-4">
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-mono bg-accent/10 text-accent px-2 py-0.5 rounded-full font-bold tracking-wider">
                  Highly Recommended
                </span>
                <h4 className="font-bold text-sm text-text-main">14-Day Free Trial</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Start practicing instantly. No credit card details or billing information are required. Claim premium access in 1 click.
                </p>
              </div>

              <button
                disabled={trialLoading || isTrialUsed}
                onClick={handleStartTrial}
                className="w-full py-3 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-accent/10"
              >
                {trialLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Verifying Device...</span>
                  </>
                ) : isTrialUsed ? (
                  "Claimed / Expired"
                ) : (
                  "🚀 Start 14 Days Free"
                )}
              </button>
            </div>

            {/* 2. Premium Plan Option Card */}
            <div className="flex flex-col justify-between p-5 rounded-2xl border border-app-border/45 bg-card-bg text-left space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-mono bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold tracking-wider">
                    Full Access
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <Zap size={10} /> Instant Activation
                  </span>
                </div>
                <h4 className="font-bold text-sm text-text-main">Talky Bean Pro</h4>
                <p className="text-[11px] text-text-muted leading-relaxed">
                  Choose your preferred billing cycle to unlock full unlimited AI conversation access:
                </p>

                {/* Plan Toggle Selector with Regional Pricing */}
                {(() => {
                  const regional = SubscriptionService.getRegionalPricing();
                  return (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedPlan('pro_monthly')}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                          selectedPlan === 'pro_monthly'
                            ? "border-accent bg-accent/10 text-text-main shadow-sm"
                            : "border-app-border bg-card-soft/40 text-text-muted hover:border-accent/40"
                        )}
                      >
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Monthly</span>
                        <span className="text-sm font-black text-text-main font-mono">{regional.currencySymbol}{regional.priceValue}<span className="text-[10px] font-normal text-text-muted">/mo</span></span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedPlan('pro_yearly')}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between relative overflow-hidden",
                          selectedPlan === 'pro_yearly'
                            ? "border-accent bg-accent/10 text-text-main shadow-sm"
                            : "border-app-border bg-card-soft/40 text-text-muted hover:border-accent/40"
                        )}
                      >
                        <span className="absolute top-1 right-1 text-[8px] bg-emerald-500/20 text-emerald-400 font-extrabold px-1.5 py-0.2 rounded-full uppercase">Best Value</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Annual</span>
                        <span className="text-sm font-black text-text-main font-mono">{regional.currencySymbol}{regional.yearlyValue}<span className="text-[10px] font-normal text-text-muted">/yr</span></span>
                      </button>
                    </div>
                  );
                })()}
              </div>

              <button
                disabled={!!purchaseLoading}
                onClick={() => handleStartDodoCheckout(selectedPlan)}
                className="w-full py-3 bg-gradient-to-r from-accent to-accent-hover text-white rounded-xl text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-accent/20 hover:opacity-95"
              >
                {purchaseLoading === selectedPlan ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Preparing Secure Checkout...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={14} />
                    <span>
                      {platformService.isAndroid()
                        ? `Subscribe via Google Play`
                        : platformService.isIOS()
                        ? `Subscribe via App Store`
                        : selectedPlan === 'pro_yearly'
                        ? `Subscribe Pro (${SubscriptionService.getRegionalPricing().currencySymbol}${SubscriptionService.getRegionalPricing().yearlyValue}/yr)`
                        : `Subscribe Pro (${SubscriptionService.getRegionalPricing().currencySymbol}${SubscriptionService.getRegionalPricing().priceValue}/mo)`
                      }
                    </span>
                  </>
                )}
              </button>

              {/* Restore Purchases & Legal Transparency (StoreKit / Play Billing compliant) */}
              <div className="pt-1.5 space-y-2 text-center">
                <button
                  type="button"
                  disabled={restoreLoading || !!purchaseLoading}
                  onClick={handleRestorePurchases}
                  className="w-full py-1.5 text-[11px] font-semibold text-text-muted hover:text-text-main transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {restoreLoading ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      <span>Checking Store Records...</span>
                    </>
                  ) : (
                    <span>Already subscribed? Restore Purchases</span>
                  )}
                </button>

                <p className="text-[10px] text-text-muted/70 leading-normal max-w-xs mx-auto">
                  Recurring billing. Auto-renews unless canceled at least 24h before renewal in account settings.
                </p>

                {/* Statutory StoreKit / Google Play Compliance: Terms of Use (EULA) & Privacy Policy */}
                <div className="flex items-center justify-center gap-3 pt-1 text-[10px] text-text-muted">
                  <a
                    href="https://www.talkybean.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (onViewLegal) {
                        e.preventDefault();
                        onViewLegal('terms');
                      }
                    }}
                    className="underline hover:text-accent transition-colors cursor-pointer"
                  >
                    Terms of Use (EULA)
                  </a>
                  <span className="text-app-border">•</span>
                  <a
                    href="https://www.talkybean.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (onViewLegal) {
                        e.preventDefault();
                        onViewLegal('privacy');
                      }
                    }}
                    className="underline hover:text-accent transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
