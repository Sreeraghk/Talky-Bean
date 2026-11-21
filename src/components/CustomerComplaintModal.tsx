import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LifeBuoy, Send, MessageSquare, Clock, AlertCircle, 
  CheckCircle2, X, ChevronRight, RefreshCw, FileText, 
  ShieldAlert, User, HelpCircle, ArrowLeft
} from 'lucide-react';
import { CloudStatsService } from '../services/CloudStatsService';

export interface ComplaintMessage {
  id: string;
  sender: 'customer' | 'support';
  senderName: string;
  text: string;
  timestamp: number;
}

export interface ComplaintTicket {
  id: string;
  userId: string;
  customerId?: string;
  userEmail: string;
  subject: string;
  category: 'account_access' | 'payment_subscription' | 'technical_issue' | 'learning_feature' | 'privacy_data' | 'other';
  description: string;
  orderRef?: string;
  status: 'Submitted' | 'Under Review' | 'Awaiting Customer' | 'Resolved' | 'Closed';
  createdAt: number;
  updatedAt: number;
  messages: ComplaintMessage[];
}

interface CustomerComplaintModalProps {
  onClose: () => void;
  user: any;
}

const CATEGORIES = [
  { value: 'account_access', label: 'Account Access & Security' },
  { value: 'payment_subscription', label: 'Payment, Billing & Subscription' },
  { value: 'technical_issue', label: 'Audio, Speech or Technical Glitch' },
  { value: 'learning_feature', label: 'Learning Content & AI Feedback' },
  { value: 'privacy_data', label: 'Privacy, Data & Account Rights' },
  { value: 'other', label: 'General Feedback or Other Concern' },
];

export function CustomerComplaintModal({ onClose, user }: CustomerComplaintModalProps) {
  const [activeView, setActiveView] = useState<'list' | 'create' | 'detail'>('list');
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<string>('technical_issue');
  const [description, setDescription] = useState('');
  const [orderRef, setOrderRef] = useState('');
  const [followUpText, setFollowUpText] = useState('');

  const fetchMyComplaints = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/complaints/my', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve support tickets.');
      }
      const data = await res.json();
      setComplaints(data.complaints || []);
      if (selectedTicket) {
        const updated = (data.complaints || []).find((c: ComplaintTicket) => c.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err: any) {
      console.warn('[CustomerComplaint] Notice loading tickets:', err);
      setErrorMsg(err.message || 'Unable to connect to customer support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [user]);

  const handleSubmitNewComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setErrorMsg('Please provide both a subject and details for your complaint.');
      return;
    }

    if (subject.length > 150) {
      setErrorMsg('Subject must not exceed 150 characters.');
      return;
    }

    if (description.length > 3000) {
      setErrorMsg('Description must not exceed 3000 characters.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          description: description.trim(),
          orderRef: orderRef.trim() || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setSuccessMsg(`Complaint registered successfully. Ticket ID: ${data.ticket.id}`);
      setSubject('');
      setDescription('');
      setOrderRef('');
      await fetchMyComplaints();
      setSelectedTicket(data.ticket);
      setActiveView('detail');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !followUpText.trim()) return;

    setSubmitting(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/complaints/${selectedTicket.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          text: followUpText.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post message.');
      }

      setFollowUpText('');
      setSelectedTicket(data.ticket);
      await fetchMyComplaints();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send message.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Under Review':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Awaiting Customer':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'Resolved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Closed':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      default:
        return 'bg-accent/10 text-accent border-accent/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card-bg border border-app-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 border-b border-app-border/40 flex items-center justify-between bg-card-soft/40">
          <div className="flex items-center gap-3">
            {activeView !== 'list' && (
              <button
                onClick={() => {
                  setActiveView('list');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="p-1.5 -ml-1 rounded-xl bg-card-soft hover:bg-app-border/40 text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div className="w-9 h-9 rounded-2xl bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
              <LifeBuoy size={18} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-text-main">Help & Support / Complaints</h2>
              <p className="text-[11px] text-text-muted">Register an issue, track ticket status, and talk to support</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-card-soft transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* LIST VIEW */}
          {activeView === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Your Tickets ({complaints.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchMyComplaints}
                    disabled={loading}
                    className="p-1.5 rounded-xl border border-app-border text-text-muted hover:text-text-main transition-colors cursor-pointer"
                    title="Refresh tickets"
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  </button>
                  <button
                    onClick={() => {
                      setActiveView('create');
                      setErrorMsg('');
                      setSuccessMsg('');
                    }}
                    className="px-3.5 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    + Register New Complaint
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-text-muted text-xs space-y-2">
                  <RefreshCw size={18} className="animate-spin mx-auto text-accent" />
                  <p>Loading your complaint history...</p>
                </div>
              ) : complaints.length === 0 ? (
                <div className="py-12 text-center bg-card-soft/30 border border-app-border/40 rounded-2xl p-6 space-y-3">
                  <MessageSquare size={32} className="mx-auto text-text-muted/40" />
                  <p className="text-sm font-bold text-text-main">No complaints registered</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    If you encounter an issue with billing, exercises, account access, or speech recognition, submit a ticket here.
                  </p>
                  <button
                    onClick={() => setActiveView('create')}
                    className="mt-2 px-4 py-2 bg-accent text-white font-bold text-xs rounded-xl hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Submit a Ticket
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {complaints.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setActiveView('detail');
                      }}
                      className="p-4 rounded-2xl border border-app-border bg-card-soft/20 hover:bg-card-soft/60 transition-all cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-accent font-bold">{ticket.id}</span>
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${getStatusBadge(ticket.status)}`}>
                            {ticket.status}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-text-main truncate">{ticket.subject}</h4>
                        <p className="text-[11px] text-text-muted flex items-center gap-2">
                          <span>{CATEGORIES.find(c => c.value === ticket.category)?.label || ticket.category}</span>
                          <span>•</span>
                          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-text-muted shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CREATE TICKET VIEW */}
          {activeView === 'create' && (
            <form onSubmit={handleSubmitNewComplaint} className="space-y-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-400/90 leading-relaxed">
                <strong>Security reminder:</strong> Never enter sensitive secrets such as passwords, complete payment card numbers, or government ID numbers into complaint descriptions.
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-accent"
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Subject</label>
                <input
                  type="text"
                  maxLength={150}
                  required
                  placeholder="e.g., Billing discrepancy on Pro subscription"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Optional Order / Transaction Reference
                </label>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g., dodo_sub_123 or Google Play receipt order ID"
                  value={orderRef}
                  onChange={(e) => setOrderRef(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-accent font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Detailed Description (Max 3,000 chars)
                </label>
                <textarea
                  rows={5}
                  maxLength={3000}
                  required
                  placeholder="Describe your issue with dates, error messages, and what happened..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-card-soft border border-app-border rounded-xl p-3.5 text-xs sm:text-sm text-text-main focus:outline-none focus:border-accent resize-none leading-relaxed"
                />
                <span className="text-[10px] text-text-muted float-right">{description.length}/3000</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-app-border/40">
                <button
                  type="button"
                  onClick={() => setActiveView('list')}
                  className="px-4 py-2 bg-card-soft hover:bg-app-border/40 rounded-xl text-xs font-bold text-text-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send size={13} />
                  <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
              </div>
            </form>
          )}

          {/* DETAIL & CONVERSATION VIEW */}
          {activeView === 'detail' && selectedTicket && (
            <div className="space-y-4">
              <div className="p-4 bg-card-soft/40 border border-app-border/60 rounded-2xl space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-mono font-bold text-accent">{selectedTicket.id}</span>
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${getStatusBadge(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-text-main">{selectedTicket.subject}</h3>
                <p className="text-xs text-text-muted leading-relaxed whitespace-pre-line bg-card-bg/60 p-3 rounded-xl border border-app-border/30">
                  {selectedTicket.description}
                </p>
                <p className="text-[11px] text-text-muted">
                  Customer ID: <span className="font-mono text-text-main">{selectedTicket.customerId || selectedTicket.userId}</span>
                </p>
                {selectedTicket.orderRef && (
                  <p className="text-[11px] text-text-muted">
                    Reference: <span className="font-mono text-text-main">{selectedTicket.orderRef}</span>
                  </p>
                )}
                <p className="text-[10px] text-text-muted">
                  Submitted: {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Message thread */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
                  Message Thread ({selectedTicket.messages?.length || 0})
                </span>

                {(!selectedTicket.messages || selectedTicket.messages.length === 0) ? (
                  <p className="text-xs text-text-muted italic py-2">
                    Our team is reviewing your ticket. You will see updates and responses here.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {selectedTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-2xl text-xs space-y-1 ${
                          msg.sender === 'support'
                            ? 'bg-accent/10 border border-accent/20 text-text-main ml-4'
                            : 'bg-card-soft border border-app-border text-text-main mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-text-muted">
                          <span className="font-bold text-text-main">
                            {msg.sender === 'support' ? 'Talky Bean Support' : 'You'}
                          </span>
                          <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add response form */}
              {selectedTicket.status !== 'Closed' ? (
                <form onSubmit={handleSendFollowUp} className="pt-2 border-t border-app-border/40 space-y-2">
                  <textarea
                    rows={2}
                    maxLength={2000}
                    placeholder="Add a follow-up response or clarification..."
                    value={followUpText}
                    onChange={(e) => setFollowUpText(e.target.value)}
                    className="w-full bg-card-soft border border-app-border rounded-xl p-3 text-xs text-text-main focus:outline-none focus:border-accent resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting || !followUpText.trim()}
                      className="px-4 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-40 flex items-center gap-1.5"
                    >
                      <Send size={12} />
                      <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-text-muted italic text-center py-2">
                  This ticket has been marked as Closed. If you have a new question, please open a new complaint.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
