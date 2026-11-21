import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, ShieldAlert, AlertTriangle, ArrowLeft, CheckCircle2, 
  HelpCircle, Lock, Mail, ExternalLink, Loader2, Sparkles
} from 'lucide-react';
import { CloudStatsService } from '../services/CloudStatsService';

interface ExternalDeletionPageProps {
  onNavigateHome?: () => void;
  onNavigateApp?: () => void;
}

export function ExternalDeletionPage({ onNavigateHome, onNavigateApp }: ExternalDeletionPageProps) {
  const [user, setUser] = useState<any>(CloudStatsService.getCurrentUser());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Deletion modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletionComplete, setDeletionComplete] = useState(false);

  // Password reset recovery state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetError('Please enter your account email.');
      return;
    }
    setResetLoading(true);
    setResetError('');
    setResetSuccess('');
    try {
      await CloudStatsService.init();
      await CloudStatsService.resetPassword(resetEmail.trim());
      setResetSuccess(`Password recovery email sent to ${resetEmail.trim()}. Check your inbox to reset your password, then return here to complete account deletion.`);
    } catch (err: any) {
      setResetError(err?.message || 'Failed to send recovery email. Please verify the email address.');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSignInOnWeb = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await CloudStatsService.init();
      const authenticatedUser = await CloudStatsService.loginWithEmail(email.trim(), password);
      setUser(authenticatedUser);
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleExecuteDeletion = async () => {
    if (confirmInput.trim().toUpperCase() !== 'DELETE') {
      setDeleteError('Please type DELETE to confirm permanent deletion.');
      return;
    }

    setDeleting(true);
    setDeleteError('');
    try {
      await CloudStatsService.deleteAccount();
      setDeletionComplete(true);
      setShowConfirmModal(false);
      setUser(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Account deletion failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-text-main selection:bg-accent selection:text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-app-border/40 pb-6">
          <div className="flex items-center gap-3">
            {(onNavigateHome || onNavigateApp) && (
              <button
                onClick={onNavigateHome || onNavigateApp}
                className="p-2 -ml-2 rounded-xl bg-card-soft hover:bg-app-border/40 text-text-main transition-colors cursor-pointer"
                title="Go back"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-text-main tracking-tight">Talky Bean</span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                  Account & Data Deletion
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                Official Web Portal for Permanent Account Deletion
              </p>
            </div>
          </div>
        </div>

        {deletionComplete ? (
          <div className="bg-card-bg border border-emerald-500/30 rounded-3xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-text-main">Account Successfully Deleted</h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-md mx-auto leading-relaxed">
              Your Talky Bean account credentials, Firebase Authentication record, Firestore profile, learning history, speech metrics, and stored upload files have been permanently deleted from our primary servers.
            </p>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500 leading-relaxed max-w-lg mx-auto">
              <strong>Important Store Subscription Notice:</strong> If you activated a Pro subscription through Google Play or Apple App Store, deleting your Talky Bean account does not automatically cancel store recurring billing. Please cancel your subscription directly in your device account settings.
            </div>
            <div className="pt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-card-soft hover:bg-app-border/40 border border-app-border text-text-main text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Return to Homepage
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Overview Section */}
            <div className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h1 className="text-xl sm:text-2xl font-extrabold text-text-main flex items-center gap-2.5">
                <Trash2 className="text-red-500" size={24} />
                <span>Delete Your Talky Bean Account and Associated Data</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                In compliance with Apple App Store Guideline 5.1.1(v), Google Play Developer Policies, and global data privacy regulations, Talky Bean provides multiple ways for users to permanently delete their account and associated personal data.
              </p>
            </div>

            {/* Explanation of what is deleted & retained */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card-bg border border-app-border rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-500 flex items-center gap-1.5">
                  <CheckCircle2 size={15} />
                  <span>What Will Be Permanently Deleted</span>
                </h3>
                <ul className="text-xs text-text-muted space-y-2 list-disc list-inside leading-relaxed">
                  <li>Your Firebase Authentication identity and login credentials.</li>
                  <li>Your root Firestore user profile (name, email, language level).</li>
                  <li>All learning progress: vocabulary lists, streaks, and quiz results.</li>
                  <li>Conversation history transcripts and calculated fluency scores.</li>
                  <li>All uploaded files and custom profile avatars in Cloud Storage.</li>
                </ul>
              </div>

              <div className="bg-card-bg border border-app-border rounded-3xl p-6 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <ShieldAlert size={15} />
                  <span>Statutory & Anti-Fraud Retained Records</span>
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  As disclosed in our Privacy Policy, minimal records are retained strictly under lawful exceptions:
                </p>
                <ul className="text-xs text-text-muted space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Device Trial Record:</strong> Hardware identifiers in <code className="text-[10px] bg-card-soft px-1 rounded">/used_device_trials</code> are retained to prevent multi-account free trial fraud.
                  </li>
                  <li>
                    <strong>Financial Audit Records:</strong> Transaction logs in <code className="text-[10px] bg-card-soft px-1 rounded">payment_audit_logs</code> are retained solely for tax (GST/VAT) compliance.
                  </li>
                </ul>
              </div>
            </div>

            {/* In-app instructions */}
            <div className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-text-main">
                Method 1: Direct In-App Deletion (Recommended)
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                If you have access to the Talky Bean application on your mobile device or web browser:
              </p>
              <ol className="text-xs sm:text-sm text-text-muted space-y-2 list-decimal list-inside bg-card-soft/40 p-4 rounded-2xl border border-app-border/40 font-medium">
                <li>Open <strong>Talky Bean</strong> and navigate to <strong>Settings</strong>.</li>
                <li>Scroll down to the <strong>Data & Privacy Management</strong> section.</li>
                <li>Tap <strong>Delete Account & Cloud Data</strong>.</li>
                <li>Type <strong>DELETE</strong> in the confirmation box and tap Confirm.</li>
              </ol>
            </div>

            {/* Web-based self-service deletion */}
            <div className="bg-card-bg border border-app-border rounded-3xl p-6 sm:p-8 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-text-main">
                Method 2: External Web Self-Service Deletion
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                If you have uninstalled the mobile application or cannot access the app, you can delete your account directly on this page without reinstalling the app. You must authenticate to verify ownership of the account.
              </p>

              {user ? (
                <div className="p-5 rounded-2xl bg-card-soft/60 border border-app-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted">Currently authenticated as:</p>
                      <p className="text-sm font-bold text-text-main">{user.email || user.uid}</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      Identity Verified
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setConfirmInput('');
                      setDeleteError('');
                      setShowConfirmModal(true);
                    }}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    <span>Permanently Delete My Talky Bean Account Now</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignInOnWeb} className="p-5 rounded-2xl bg-card-soft/40 border border-app-border space-y-3">
                  <p className="text-xs font-semibold text-text-main">
                    Sign in with your account credentials to initiate deletion:
                  </p>

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                      {authError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-card-bg border border-app-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-card-bg border border-app-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {authLoading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                    <span>{authLoading ? 'Verifying...' : 'Sign In to Proceed with Deletion'}</span>
                  </button>

                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email.trim());
                        setResetError('');
                        setResetSuccess('');
                        setShowResetModal(true);
                      }}
                      className="text-xs text-text-muted hover:text-accent font-medium transition-colors cursor-pointer"
                    >
                      Cannot sign in? Send password recovery link
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Store Subscription Warning */}
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 space-y-2">
              <h4 className="font-bold flex items-center gap-1.5 text-amber-300">
                <AlertTriangle size={15} />
                <span>Important: Google Play and Apple App Store Subscriptions</span>
              </h4>
              <p className="leading-relaxed text-[11px] text-amber-200/80">
                Deleting your Talky Bean account <strong>does not automatically cancel</strong> active paid recurring subscriptions managed through Google Play or Apple App Store. Apple and Google require subscription cancellations to be performed directly in your phone or store settings.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg border border-app-border rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-text-main">Confirm Account Deletion</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  This action is permanent and cannot be undone. All your progress, vocabulary, and stored cloud data will be removed.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                  Type <span className="text-red-500 font-mono font-black">DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  placeholder="DELETE"
                  className="w-full bg-card-soft border border-app-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-text-main focus:outline-none focus:border-red-500 text-center tracking-widest uppercase"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setShowConfirmModal(false)}
                  className="w-1/2 py-2.5 bg-card-soft hover:bg-app-border/40 text-text-main text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting || confirmInput.trim().toUpperCase() !== 'DELETE'}
                  onClick={handleExecuteDeletion}
                  className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Password Recovery Modal */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card-bg border border-app-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-main">Recover Account Credentials</h3>
                  <p className="text-xs text-text-muted">Send password reset email to verify identity</p>
                </div>
              </div>

              {resetSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs space-y-3">
                  <p className="leading-relaxed">{resetSuccess}</p>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close and Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordRecovery} className="space-y-3 pt-1">
                  {resetError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                      {resetError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Account Email</label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-card-soft border border-app-border rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none focus:border-accent"
                    />
                  </div>

                  <p className="text-[11px] text-text-muted leading-relaxed">
                    We will send a password reset link to this address. Once you regain access, you can sign in to authorize permanent account deletion.
                  </p>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      disabled={resetLoading}
                      onClick={() => setShowResetModal(false)}
                      className="w-1/2 py-2.5 bg-card-soft hover:bg-app-border/40 text-text-main text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-1/2 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    >
                      {resetLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                      <span>{resetLoading ? 'Sending...' : 'Send Reset Link'}</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
