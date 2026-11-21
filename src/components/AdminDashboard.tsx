import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Users, Search, RefreshCw, 
  Calendar, Mail, User as UserIcon, Clock, CheckCircle2,
  Lock, AlertTriangle, ChevronRight, X, Sparkles, Filter,
  Copy, Check, TrendingUp, BarChart3, PieChart as PieChartIcon,
  ShieldAlert, Award, ArrowUpRight, Zap, Ban, CheckCircle,
  Activity, UserCheck, UserX, Info,
  LifeBuoy, Send, MessageSquare, Tag, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { CloudStatsService } from '../services/CloudStatsService';

export interface ComplaintTicketAdmin {
  id: string;
  userId: string;
  customerId?: string;
  userEmail: string;
  subject: string;
  category: string;
  description: string;
  orderRef?: string | null;
  status: 'Submitted' | 'Under Review' | 'Awaiting Customer' | 'Resolved' | 'Closed';
  createdAt: number;
  updatedAt: number;
  messages?: {
    id: string;
    sender: 'customer' | 'support';
    senderName: string;
    text: string;
    timestamp: number;
  }[];
  internalNotes?: {
    id: string;
    adminEmail: string;
    note: string;
    timestamp: number;
  }[];
}

export interface UserRecord {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  createdAt?: number;
  lastLoginAt?: number;
  isProMember?: boolean;
  isPro?: boolean;
  subscription?: {
    isActive?: boolean;
    platform?: string;
    productId?: string;
    entitlementId?: string;
    grantedByAdmin?: boolean;
    revokedByAdmin?: boolean;
    updatedAt?: number;
    [key: string]: any;
  } | null;
  [key: string]: any;
}

interface AdminDashboardProps {
  adminUid: string;
  currentAdminEmail?: string;
  onSwitchToPersonalView?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminUid,
  currentAdminEmail = 'sreeraghk@gmail.com',
  onSwitchToPersonalView
}) => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pro' | 'trial' | 'free'>('all');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');
  const [copiedUid, setCopiedUid] = useState<string | null>(null);

  // Confirmation modal state for authorize/cancel actions
  const [confirmAction, setConfirmAction] = useState<{
    user: UserRecord;
    action: 'authorize' | 'cancel';
  } | null>(null);

  // Admin Mode Tabs: Users vs Complaints
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'complaints'>('users');
  const [complaints, setComplaints] = useState<ComplaintTicketAdmin[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState<boolean>(false);
  const [complaintSearch, setComplaintSearch] = useState<string>('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState<string>('all');
  const [complaintCategoryFilter, setComplaintCategoryFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicketAdmin | null>(null);

  // Ticket actions
  const [ticketActionLoading, setTicketActionLoading] = useState<boolean>(false);
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [internalNoteText, setInternalNoteText] = useState<string>('');

  const fetchComplaints = async () => {
    setLoadingComplaints(true);
    setErrorMsg('');
    try {
      const idToken = await CloudStatsService.getIdToken();
      const res = await fetch('/api/admin/complaints', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve complaints.');
      }
      const data = await res.json();
      setComplaints(data.complaints || []);
      if (selectedTicket) {
        const updated = (data.complaints || []).find((c: ComplaintTicketAdmin) => c.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err: any) {
      console.error('[AdminDashboard] Error fetching complaints:', err);
      setErrorMsg(err?.message || 'Failed to fetch complaints.');
    } finally {
      setLoadingComplaints(false);
    }
  };

  const handleUpdateTicket = async (ticketId: string, status?: string, reply?: string, note?: string) => {
    setTicketActionLoading(true);
    setErrorMsg('');
    try {
      const idToken = await CloudStatsService.getIdToken();
      const res = await fetch(`/api/admin/complaints/${ticketId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          status: status || undefined,
          adminResponseText: reply || undefined,
          internalNoteText: note || undefined
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update complaint.');
      }
      showToast('Support ticket updated successfully.');
      if (reply) setAdminReplyText('');
      if (note) setInternalNoteText('');
      await fetchComplaints();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error updating ticket.');
    } finally {
      setTicketActionLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setErrorMsg('');
    try {
      const fetched = await CloudStatsService.getAllUsersForAdmin();
      setUsers(fetched);
    } catch (err: any) {
      console.error('[AdminDashboard] Error fetching users:', err);
      setErrorMsg(err?.message || 'Failed to fetch users from Firestore.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUid(id);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleUpdateSubscription = async (user: UserRecord, isPro: boolean) => {
    setActionLoadingId(user.uid || user.id);
    setErrorMsg('');
    try {
      await CloudStatsService.updateUserSubscriptionByAdmin(user.uid || user.id, isPro);
      
      // Update local state immediately
      setUsers(prev => prev.map(u => {
        if ((u.uid || u.id) === (user.uid || user.id)) {
          return {
            ...u,
            isProMember: isPro,
            isPro: isPro,
            subscription: {
              ...(u.subscription || {}),
              isActive: isPro,
              platform: isPro ? 'stripe' : 'none',
              grantedByAdmin: isPro,
              revokedByAdmin: !isPro,
              updatedAt: Date.now()
            }
          };
        }
        return u;
      }));

      if (selectedUser && (selectedUser.uid || selectedUser.id) === (user.uid || user.id)) {
        setSelectedUser(prev => prev ? {
          ...prev,
          isProMember: isPro,
          isPro: isPro,
          subscription: {
            ...(prev.subscription || {}),
            isActive: isPro,
            platform: isPro ? 'stripe' : 'none',
            grantedByAdmin: isPro,
            revokedByAdmin: !isPro,
            updatedAt: Date.now()
          }
        } : null);
      }

      showToast(
        isPro 
          ? `Premium subscription authorized for ${user.email || user.uid}!` 
          : `Premium subscription cancelled for ${user.email || user.uid}.`
      );
    } catch (err: any) {
      console.error('[AdminDashboard] Error updating subscription:', err);
      setErrorMsg(err?.message || 'Failed to update user subscription in Firestore.');
    } finally {
      setActionLoadingId(null);
      setConfirmAction(null);
    }
  };

  // Helper to determine accurate user status
  const getUserStatus = (u: UserRecord): 'pro' | 'trial' | 'free' => {
    const isPro = Boolean(u.isProMember || u.isPro || u.subscription?.isActive);
    if (isPro) return 'pro';
    if (u.subscription?.platform === 'free_trial' && u.subscription?.isActive) return 'trial';
    return 'free';
  };

  // Filtered users according to query & status filter
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.uid && u.uid.toLowerCase().includes(q)) ||
        (u.id && u.id.toLowerCase().includes(q))
      );

      if (!matchesSearch) return false;

      const status = getUserStatus(u);
      if (statusFilter === 'pro') return status === 'pro';
      if (statusFilter === 'trial') return status === 'trial';
      if (statusFilter === 'free') return status === 'free';
      return true;
    });
  }, [users, searchQuery, statusFilter]);

  // Statistics calculation for KPI cards and Recharts
  const stats = useMemo(() => {
    const totalUsers = users.length;
    let proCount = 0;
    let trialCount = 0;
    let freeCount = 0;
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    let activeLast24h = 0;
    let activeLast7d = 0;

    // Timeline data generation (past 7 days)
    const daysMap: Record<string, { date: string; signups: number; activeLogins: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[key] = { date: key, signups: 0, activeLogins: 0 };
    }

    users.forEach(u => {
      const status = getUserStatus(u);
      if (status === 'pro') proCount++;
      else if (status === 'trial') trialCount++;
      else freeCount++;

      if (u.lastLoginAt && u.lastLoginAt >= oneDayAgo) activeLast24h++;
      if (u.lastLoginAt && u.lastLoginAt >= sevenDaysAgo) activeLast7d++;

      if (u.createdAt) {
        const d = new Date(u.createdAt);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daysMap[key]) {
          daysMap[key].signups += 1;
        }
      }

      if (u.lastLoginAt) {
        const d = new Date(u.lastLoginAt);
        const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (daysMap[key]) {
          daysMap[key].activeLogins += 1;
        }
      }
    });

    const activityTimeline = Object.values(daysMap);
    const conversionRate = totalUsers > 0 ? ((proCount / totalUsers) * 100).toFixed(1) : '0';

    const distributionData = [
      { name: 'Active Pro Members', value: proCount, color: '#10B981' },
      { name: 'Free Trials', value: trialCount, color: '#3B82F6' },
      { name: 'Free Tier', value: freeCount, color: '#F97316' },
    ].filter(d => d.value > 0);

    return {
      totalUsers,
      proCount,
      trialCount,
      freeCount,
      activeLast24h,
      activeLast7d,
      conversionRate,
      activityTimeline,
      distributionData
    };
  }, [users]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(t => {
      if (complaintStatusFilter !== 'all' && t.status !== complaintStatusFilter) return false;
      if (complaintCategoryFilter !== 'all' && t.category !== complaintCategoryFilter) return false;
      if (complaintSearch.trim()) {
        const q = complaintSearch.toLowerCase().trim();
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesEmail = (t.userEmail || '').toLowerCase().includes(q);
        const matchesUid = (t.userId || '').toLowerCase().includes(q);
        const matchesSubject = (t.subject || '').toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        return matchesId || matchesEmail || matchesUid || matchesSubject || matchesDesc;
      }
      return true;
    });
  }, [complaints, complaintStatusFilter, complaintCategoryFilter, complaintSearch]);

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Admin Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-card-bg border border-orange-500/30 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-600 dark:text-orange-400 font-black text-[10px] uppercase tracking-wider shadow-sm">
                <ShieldCheck size={14} className="text-orange-500" />
                <span>ADMINISTRATOR CONSOLE</span>
              </div>
              <span className="text-xs text-text-muted font-mono">
                Admin: <code className="text-text-main font-semibold">{currentAdminEmail}</code>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text-main tracking-tight">
              User & Subscription Management
            </h1>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              Full administrative authority over Talky Bean accounts. Manage premium entitlements, monitor subscriber growth, and lookup user records via registered email or unique Firebase ID.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="flex items-center gap-2 px-4 py-2.5 bg-card-bg hover:bg-card-soft border border-app-border rounded-xl text-xs font-bold text-text-main transition-all cursor-pointer shadow-sm disabled:opacity-50"
              title="Reload Firestore Users"
            >
              <RefreshCw size={14} className={loadingUsers ? 'animate-spin text-accent' : ''} />
              <span>Refresh Data</span>
            </button>

            {onSwitchToPersonalView && (
              <button
                onClick={onSwitchToPersonalView}
                className="flex items-center gap-2 px-4 py-2.5 bg-accent/10 hover:bg-accent/20 border border-accent/30 text-accent rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                <UserIcon size={14} />
                <span>Learner View</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Global Success / Alert Feedback */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-between shadow-sm text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast('')} className="p-1 hover:bg-emerald-500/20 rounded-lg">
              <X size={14} />
            </button>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl flex items-center justify-between shadow-sm text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-500/20 rounded-lg">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Section Tabs: Users & Subscriptions vs Complaints & Support */}
      <div className="flex items-center gap-3 border-b border-app-border/60 pb-3">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'users'
              ? 'bg-accent text-white shadow-md'
              : 'bg-card-bg hover:bg-card-soft text-text-muted hover:text-text-main border border-app-border'
          }`}
        >
          <Users size={15} />
          <span>Users & Subscriptions ({users.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveAdminTab('complaints');
            fetchComplaints();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeAdminTab === 'complaints'
              ? 'bg-accent text-white shadow-md'
              : 'bg-card-bg hover:bg-card-soft text-text-muted hover:text-text-main border border-app-border'
          }`}
        >
          <LifeBuoy size={15} />
          <span>Complaints & Support Tickets {complaints.length > 0 ? `(${complaints.length})` : ''}</span>
        </button>
      </div>

      {activeAdminTab === 'users' && (
        <>
          {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 bg-card-bg border border-app-border rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Registered</span>
            <Users size={18} className="text-accent" />
          </div>
          <div className="text-3xl font-black text-text-main">{stats.totalUsers}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
            <Activity size={12} className="text-accent" />
            <span>{stats.activeLast24h} active in last 24 hours</span>
          </div>
        </div>

        {/* Active Pro Members */}
        <div className="p-5 bg-card-bg border border-emerald-500/30 bg-emerald-500/5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pro Subscribers</span>
            <Award size={18} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-text-main">{stats.proCount}</div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            <Sparkles size={12} />
            <span>{stats.conversionRate}% conversion rate</span>
          </div>
        </div>

        {/* Free Trials */}
        <div className="p-5 bg-card-bg border border-blue-500/30 bg-blue-500/5 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Free Trials</span>
            <Zap size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-text-main">{stats.trialCount}</div>
          <div className="text-[11px] text-text-muted">
            <span>Hardware & Account bounded trials</span>
          </div>
        </div>

        {/* 7-Day Active Engagement */}
        <div className="p-5 bg-card-bg border border-app-border rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">7-Day Active Users</span>
            <TrendingUp size={18} className="text-orange-500" />
          </div>
          <div className="text-3xl font-black text-text-main">{stats.activeLast7d}</div>
          <div className="text-[11px] text-text-muted">
            <span>Active learning & speaking sessions</span>
          </div>
        </div>
      </div>

      {/* Graphical Activity Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Trend (AreaChart) */}
        <div className="lg:col-span-2 bg-card-bg border border-app-border rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-black text-text-main flex items-center gap-2 uppercase tracking-wide">
                <BarChart3 size={16} className="text-accent" />
                <span>Recent User Activity & Registrations (Last 7 Days)</span>
              </h3>
              <p className="text-xs text-text-muted">Daily signups and active user authentication logins.</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-text-muted">Active Logins</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-text-muted">New Signups</span>
              </div>
            </div>
          </div>

          <div className="h-64 min-h-[256px] w-full min-w-0 pt-2">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <AreaChart data={stats.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FBBF24" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-app-border/40" />
                <XAxis 
                  dataKey="date" 
                  stroke="currentColor" 
                  className="text-[10px] text-text-muted font-bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  stroke="currentColor" 
                  className="text-[10px] text-text-muted font-bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="activeLogins" 
                  name="Active Logins"
                  stroke="#F97316" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#loginGradient)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="signups" 
                  name="New Signups"
                  stroke="#FBBF24" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#signupGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Tier Distribution (PieChart) */}
        <div className="bg-card-bg border border-app-border rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-text-main flex items-center gap-2 uppercase tracking-wide">
              <PieChartIcon size={16} className="text-emerald-500" />
              <span>Subscription Breakdown</span>
            </h3>
            <p className="text-xs text-text-muted">Distribution across membership tiers.</p>
          </div>

          <div className="h-48 min-h-[192px] w-full min-w-0 relative flex items-center justify-center">
            {stats.distributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={stats.distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(23, 23, 23, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      color: '#fff',
                      fontSize: '12px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-text-muted">No user data available</div>
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-text-main">{stats.totalUsers}</span>
              <span className="text-[9px] uppercase tracking-widest text-text-muted font-bold">Users</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-app-border/40">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-text-muted font-medium">Active Pro</span>
              </div>
              <span className="font-black text-text-main">{stats.proCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-text-muted font-medium">Free Trials</span>
              </div>
              <span className="font-black text-text-main">{stats.trialCount}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span className="text-text-muted font-medium">Free Tier</span>
              </div>
              <span className="font-black text-text-main">{stats.freeCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Subscriber Search & User Management Table */}
      <div className="bg-card-bg border border-app-border rounded-3xl p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-text-main flex items-center gap-2">
              <Users size={18} className="text-accent" />
              <span>Registered Accounts ({filteredUsers.length})</span>
            </h2>
            <p className="text-xs text-text-muted">
              Search by registered email or unique Firebase ID to manage entitlements.
            </p>
          </div>

          {/* Search Bar with ID / Email lookup */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by email or Firebase UID (e.g. 5xX...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-input-bg border border-app-border rounded-xl text-xs text-text-main outline-none focus:border-accent/60 transition-all font-mono shadow-inner"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-accent text-white shadow-sm' 
                : 'bg-card-soft text-text-muted hover:text-text-main'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter('pro')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'pro' 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'bg-card-soft text-text-muted hover:text-emerald-500'
            }`}
          >
            <Award size={12} />
            <span>Pro Members ({stats.proCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('trial')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'trial' 
                ? 'bg-blue-500 text-white shadow-sm' 
                : 'bg-card-soft text-text-muted hover:text-blue-500'
            }`}
          >
            <Zap size={12} />
            <span>Free Trials ({stats.trialCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('free')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'free' 
                ? 'bg-orange-500 text-white shadow-sm' 
                : 'bg-card-soft text-text-muted hover:text-orange-500'
            }`}
          >
            Free Tier ({stats.freeCount})
          </button>
        </div>

        {/* Users Table */}
        {loadingUsers ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw size={26} className="animate-spin text-accent mx-auto" />
            <p className="text-xs text-text-muted font-bold">Querying users from Firestore...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center bg-card-soft/30 rounded-2xl border border-app-border/40 space-y-2">
            <Users size={32} className="text-text-muted mx-auto opacity-40" />
            <p className="text-xs font-bold text-text-main">No matching subscribers found</p>
            <p className="text-[11px] text-text-muted max-w-sm mx-auto">
              {searchQuery 
                ? `No user matched query "${searchQuery}". Check the UID or registered email spelling.` 
                : 'No users in this filter category.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-app-border/60 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-card-soft/80 border-b border-app-border/60 text-[10px] uppercase font-black tracking-wider text-text-muted">
                  <th className="py-3.5 px-4">User Account & Registered Email</th>
                  <th className="py-3.5 px-4">Unique Firebase ID (UID)</th>
                  <th className="py-3.5 px-4 text-center">Subscription Tier</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4">Last Active</th>
                  <th className="py-3.5 px-4 text-right">Subscription Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border/40">
                {filteredUsers.map((u) => {
                  const status = getUserStatus(u);
                  const isPro = status === 'pro';
                  const isTrial = status === 'trial';
                  const isAdmin = u.email?.toLowerCase() === 'sreeraghk@gmail.com' || u.uid === adminUid;
                  const isActionLoading = actionLoadingId === (u.uid || u.id);

                  return (
                    <tr
                      key={u.id || u.uid}
                      className="hover:bg-card-soft/50 transition-all"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase text-white shrink-0 shadow-sm ${
                            isAdmin ? 'bg-amber-500' : isPro ? 'bg-emerald-500' : 'bg-accent'
                          }`}>
                            {u.displayName ? u.displayName.substring(0, 2) : (u.email ? u.email.substring(0, 2) : 'U')}
                          </div>
                          <div className="space-y-0.5 truncate max-w-[220px]">
                            <div className="font-bold text-text-main flex items-center gap-1.5 truncate">
                              <span>{u.email || 'No email registered'}</span>
                              {isAdmin && (
                                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[9px] font-black rounded uppercase">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-text-muted font-medium truncate">
                              {u.displayName || 'Learner'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Unique Firebase UID with copy button */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1.5 max-w-[180px]">
                          <code className="text-text-muted truncate" title={u.uid || u.id}>
                            {u.uid || u.id}
                          </code>
                          <button
                            onClick={() => copyToClipboard(u.uid || u.id, u.uid || u.id)}
                            className="p-1 hover:bg-card-soft rounded text-text-muted hover:text-text-main cursor-pointer shrink-0"
                            title="Copy Firebase UID"
                          >
                            {copiedUid === (u.uid || u.id) ? (
                              <Check size={12} className="text-emerald-500" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Subscription Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-full font-black text-[10px] uppercase tracking-wider shadow-sm">
                            <CheckCircle size={11} />
                            <span>Pro Member</span>
                          </span>
                        ) : isTrial ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-full font-black text-[10px] uppercase tracking-wider">
                            <Zap size={11} />
                            <span>Free Trial</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-card-soft text-text-muted rounded-full font-bold text-[10px] uppercase tracking-wider">
                            <span>Free Tier</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-text-muted shrink-0" />
                          <span>{formatDate(u.createdAt)}</span>
                        </div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-text-muted shrink-0" />
                          <span>{formatDate(u.lastLoginAt)}</span>
                        </div>
                      </td>

                      {/* Action Buttons: Authorize / Cancel */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPro ? (
                            <button
                              onClick={() => setConfirmAction({ user: u, action: 'cancel' })}
                              disabled={isActionLoading || isAdmin}
                              className="px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40"
                              title={isAdmin ? "Cannot cancel admin entitlement" : "Cancel user Pro membership"}
                            >
                              <UserX size={12} />
                              <span>Cancel Pro</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setConfirmAction({ user: u, action: 'authorize' })}
                              disabled={isActionLoading}
                              className="px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-40"
                              title="Authorize user for Pro membership"
                            >
                              <Sparkles size={12} />
                              <span>Authorize Pro</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 bg-card-bg hover:bg-card-soft text-text-muted hover:text-text-main border border-app-border rounded-lg transition-all cursor-pointer"
                            title="Inspect User Details"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </>
      )}

      {/* COMPLAINTS & SUPPORT TICKETS VIEW */}
      {activeAdminTab === 'complaints' && (
        <div className="space-y-6">
          {/* Complaints Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-card-bg border border-app-border rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Total Tickets</span>
                <LifeBuoy size={18} className="text-accent" />
              </div>
              <div className="text-3xl font-black text-text-main">{complaints.length}</div>
              <div className="text-[11px] text-text-muted">Customer grievances registered</div>
            </div>

            <div className="p-5 bg-card-bg border border-amber-500/30 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">New / Submitted</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <div className="text-3xl font-black text-amber-500">
                {complaints.filter(c => c.status === 'Submitted').length}
              </div>
              <div className="text-[11px] text-text-muted">Awaiting initial review</div>
            </div>

            <div className="p-5 bg-card-bg border border-blue-500/30 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Under Action</span>
                <Activity size={18} className="text-blue-500" />
              </div>
              <div className="text-3xl font-black text-blue-500">
                {complaints.filter(c => c.status === 'Under Review' || c.status === 'Awaiting Customer').length}
              </div>
              <div className="text-[11px] text-text-muted">In discussion or review</div>
            </div>

            <div className="p-5 bg-card-bg border border-emerald-500/30 rounded-2xl space-y-1 shadow-sm">
              <div className="flex items-center justify-between text-text-muted">
                <span className="text-xs font-bold uppercase tracking-wider">Resolved / Closed</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-500">
                {complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length}
              </div>
              <div className="text-[11px] text-text-muted">Successfully handled</div>
            </div>
          </div>

          {/* Complaints Controls & Search */}
          <div className="p-4 bg-card-bg border border-app-border rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input
                type="text"
                placeholder="Search by Ticket ID, Customer Email, UID, or keywords..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card-soft/60 border border-app-border rounded-xl text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={complaintStatusFilter}
                onChange={(e) => setComplaintStatusFilter(e.target.value)}
                className="px-3 py-2 bg-card-soft/60 border border-app-border rounded-xl text-xs text-text-main focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted (New)</option>
                <option value="Under Review">Under Review</option>
                <option value="Awaiting Customer">Awaiting Customer</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={complaintCategoryFilter}
                onChange={(e) => setComplaintCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-card-soft/60 border border-app-border rounded-xl text-xs text-text-main focus:outline-none focus:border-accent cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="account_access">Account Access</option>
                <option value="payment_subscription">Payment & Billing</option>
                <option value="technical_issue">Technical & Audio</option>
                <option value="learning_feature">Learning Content</option>
                <option value="privacy_data">Privacy & Data</option>
                <option value="other">Other Concern</option>
              </select>

              <button
                onClick={fetchComplaints}
                disabled={loadingComplaints}
                className="p-2 bg-card-soft hover:bg-card-bg border border-app-border rounded-xl text-text-main transition-colors cursor-pointer"
                title="Refresh Complaints"
              >
                <RefreshCw size={15} className={loadingComplaints ? 'animate-spin text-accent' : ''} />
              </button>
            </div>
          </div>

          {/* Complaints Table */}
          <div className="bg-card-bg border border-app-border rounded-2xl overflow-hidden shadow-sm">
            {loadingComplaints ? (
              <div className="p-12 text-center space-y-3">
                <RefreshCw size={24} className="animate-spin text-accent mx-auto" />
                <p className="text-xs text-text-muted">Loading customer support tickets...</p>
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <LifeBuoy size={28} className="text-text-muted/40 mx-auto" />
                <p className="text-sm font-bold text-text-main">No support tickets found</p>
                <p className="text-xs text-text-muted">
                  {complaints.length === 0
                    ? "No customer complaints or support tickets have been registered yet."
                    : "No tickets match your active search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-app-border bg-card-soft/40 text-text-muted uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-4">Ticket ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Updated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-app-border/40">
                    {filteredComplaints.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-card-soft/20 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-text-main">
                          {ticket.id}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-text-main truncate max-w-[180px]">{ticket.userEmail}</div>
                          <div className="font-mono text-[10px] text-accent truncate max-w-[140px] font-semibold">{ticket.customerId || ticket.userId}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-card-soft border border-app-border text-text-muted">
                            {ticket.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-text-main truncate max-w-[200px]">{ticket.subject}</div>
                          <div className="text-text-muted truncate max-w-[240px] text-[11px]">{ticket.description}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ticket.status === 'Submitted'
                              ? 'bg-amber-500/20 text-amber-500'
                              : ticket.status === 'Under Review'
                              ? 'bg-blue-500/20 text-blue-500'
                              : ticket.status === 'Awaiting Customer'
                              ? 'bg-purple-500/20 text-purple-500'
                              : 'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-text-muted font-mono text-[11px]">
                          {formatDate(ticket.updatedAt)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedTicket(ticket)}
                            className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                          >
                            Manage Ticket
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed User Inspection Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-bg border border-app-border rounded-3xl w-full max-w-xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-app-border/60 bg-card-soft/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent text-white flex items-center justify-center font-bold uppercase text-sm">
                    {selectedUser.displayName?.substring(0, 2) || selectedUser.email?.substring(0, 2) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-main">
                      {selectedUser.email || 'Subscriber Profile'}
                    </h3>
                    <p className="text-xs text-text-muted font-mono">
                      UID: {selectedUser.uid || selectedUser.id}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-2 text-text-muted hover:text-text-main hover:bg-card-soft rounded-full transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                <div className="p-4 bg-card-soft/40 border border-app-border/60 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted font-bold">Subscription Status</span>
                    {getUserStatus(selectedUser) === 'pro' ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-full text-[10px] uppercase tracking-wider">
                        Active Pro
                      </span>
                    ) : getUserStatus(selectedUser) === 'trial' ? (
                      <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold rounded-full text-[10px] uppercase tracking-wider">
                        Free Trial Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-card-soft text-text-muted font-bold rounded-full text-[10px] uppercase tracking-wider">
                        Free Tier
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Unique Firebase ID</span>
                    <div className="flex items-center gap-1">
                      <span className="text-text-main font-bold">{selectedUser.uid || selectedUser.id}</span>
                      <button 
                        onClick={() => copyToClipboard(selectedUser.uid || selectedUser.id, 'modal_uid')}
                        className="p-1 hover:bg-card-soft rounded cursor-pointer"
                      >
                        {copiedUid === 'modal_uid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Registered Email</span>
                    <span className="text-text-main font-bold">{selectedUser.email || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Account Created</span>
                    <span className="text-text-main">{formatDate(selectedUser.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-text-muted">Last Authenticated</span>
                    <span className="text-text-main">{formatDate(selectedUser.lastLoginAt)}</span>
                  </div>
                </div>

                {/* Subscription Action Panel in Modal */}
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-text-main uppercase tracking-wider">
                    <ShieldCheck size={16} className="text-orange-500" />
                    <span>Admin Entitlement Controls</span>
                  </div>
                  <p className="text-xs text-text-muted leading-relaxed">
                    Instantly grant or revoke Pro membership for this user. This updates their Firestore entitlement in real-time.
                  </p>

                  <div className="pt-2 flex gap-3">
                    {getUserStatus(selectedUser) === 'pro' ? (
                      <button
                        onClick={() => {
                          const target = selectedUser;
                          setSelectedUser(null);
                          setConfirmAction({ user: target, action: 'cancel' });
                        }}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <UserX size={14} />
                        <span>Revoke / Cancel Premium</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const target = selectedUser;
                          setSelectedUser(null);
                          setConfirmAction({ user: target, action: 'authorize' });
                        }}
                        className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Sparkles size={14} />
                        <span>Authorize Premium (Grant Pro)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-card-soft/60 border-t border-app-border/60 text-right">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2 bg-card-bg border border-app-border hover:bg-card-soft text-text-main rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Complaint Inspection & Response Modal */}
      <AnimatePresence>
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setSelectedTicket(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-bg border border-app-border rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl my-8 max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 border-b border-app-border/60 bg-card-soft/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center font-bold">
                    <LifeBuoy size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-text-main font-mono">
                        {selectedTicket.id}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        selectedTicket.status === 'Submitted'
                          ? 'bg-amber-500/20 text-amber-500'
                          : selectedTicket.status === 'Under Review'
                          ? 'bg-blue-500/20 text-blue-500'
                          : selectedTicket.status === 'Awaiting Customer'
                          ? 'bg-purple-500/20 text-purple-500'
                          : 'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted">
                      Created: {formatDate(selectedTicket.createdAt)} · Category: <span className="font-semibold text-text-main capitalize">{selectedTicket.category.replace('_', ' ')}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 text-text-muted hover:text-text-main hover:bg-card-soft rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                {/* Customer Details */}
                <div className="p-4 bg-card-soft/40 border border-app-border/60 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-bold">Customer Email</span>
                    <span className="text-text-main font-bold">{selectedTicket.userEmail}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-text-muted">Customer ID</span>
                    <span className="text-accent font-bold">{selectedTicket.customerId || selectedTicket.userId}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-text-muted">Customer UID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-text-main">{selectedTicket.userId}</span>
                      <button
                        onClick={() => copyToClipboard(selectedTicket.userId, 'ticket_uid')}
                        className="p-1 hover:bg-card-soft rounded cursor-pointer"
                        title="Copy UID"
                      >
                        {copiedUid === 'ticket_uid' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>
                  {selectedTicket.orderRef && (
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-text-muted">Order / Transaction Ref</span>
                      <span className="text-accent font-bold">{selectedTicket.orderRef}</span>
                    </div>
                  )}
                </div>

                {/* Complaint Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Original Grievance / Inquiry</h4>
                  <div className="p-4 bg-card-soft/20 border border-app-border rounded-2xl space-y-2">
                    <div className="font-bold text-sm text-text-main">{selectedTicket.subject}</div>
                    <div className="text-xs text-text-muted whitespace-pre-wrap leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>
                </div>

                {/* Message Thread */}
                {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Conversation Thread</h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto p-2">
                      {selectedTicket.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-2xl text-xs space-y-1 ${
                            msg.sender === 'support'
                              ? 'bg-accent/10 border border-accent/20 ml-6 text-text-main'
                              : 'bg-card-soft border border-app-border mr-6 text-text-main'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-text-muted">
                            <span className="font-bold">{msg.senderName} ({msg.sender === 'support' ? 'Support' : 'Customer'})</span>
                            <span>{formatDate(msg.timestamp)}</span>
                          </div>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Update Control */}
                <div className="p-4 bg-card-soft/30 border border-app-border rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-text-main">Update Ticket Status</span>
                    <p className="text-[11px] text-text-muted">Set resolution workflow state for this ticket</p>
                  </div>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateTicket(selectedTicket.id, e.target.value)}
                    disabled={ticketActionLoading}
                    className="px-3 py-2 bg-card-bg border border-app-border rounded-xl text-xs text-text-main font-bold focus:outline-none focus:border-accent cursor-pointer"
                  >
                    <option value="Submitted">Submitted (New)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Awaiting Customer">Awaiting Customer</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Customer-Visible Reply Form */}
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-accent" />
                    <span className="text-xs font-bold text-text-main">Send Reply to Customer (Visible in Customer Portal)</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Type a helpful, professional reply to the customer..."
                    value={adminReplyText}
                    onChange={(e) => setAdminReplyText(e.target.value)}
                    className="w-full p-3 bg-card-bg border border-app-border rounded-xl text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-accent"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateTicket(selectedTicket.id, undefined, adminReplyText)}
                      disabled={ticketActionLoading || !adminReplyText.trim()}
                      className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                    >
                      <Send size={13} />
                      <span>{ticketActionLoading ? 'Sending...' : 'Send Public Reply'}</span>
                    </button>
                  </div>
                </div>

                {/* Private Internal Admin Notes Form & History */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Lock size={16} className="text-amber-500" />
                      <span className="text-xs font-bold text-text-main">Private Internal Admin Notes</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/20 px-2 py-0.5 rounded-full">
                      Strictly Confidential
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Notes entered here are accessible only to administrators. They are never sent to or visible by the customer.
                  </p>

                  {/* List of existing internal notes */}
                  {selectedTicket.internalNotes && selectedTicket.internalNotes.length > 0 && (
                    <div className="space-y-2 max-h-36 overflow-y-auto">
                      {selectedTicket.internalNotes.map((note) => (
                        <div key={note.id} className="p-2.5 bg-card-bg border border-amber-500/20 rounded-xl text-xs space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
                            <span>Admin: {note.adminEmail}</span>
                            <span>{formatDate(note.timestamp)}</span>
                          </div>
                          <p className="text-text-main text-xs whitespace-pre-wrap">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea
                    rows={2}
                    placeholder="Add private note for administrative records (fraud check, refund status, investigation)..."
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    className="w-full p-3 bg-card-bg border border-app-border rounded-xl text-xs text-text-main placeholder-text-muted focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleUpdateTicket(selectedTicket.id, undefined, undefined, internalNoteText)}
                      disabled={ticketActionLoading || !internalNoteText.trim()}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5 shadow-sm"
                    >
                      <Lock size={13} />
                      <span>{ticketActionLoading ? 'Saving...' : 'Save Internal Note'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-card-soft/60 border-t border-app-border/60 text-right">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-5 py-2 bg-card-bg border border-app-border hover:bg-card-soft text-text-main rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal for Authorize/Cancel Subscription */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card-bg border border-app-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl ${
                  confirmAction.action === 'authorize' 
                    ? 'bg-emerald-500/15 text-emerald-500' 
                    : 'bg-red-500/15 text-red-500'
                }`}>
                  {confirmAction.action === 'authorize' ? <Sparkles size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-text-main">
                    {confirmAction.action === 'authorize' ? 'Authorize Premium Access?' : 'Cancel Premium Access?'}
                  </h3>
                  <p className="text-xs text-text-muted font-mono truncate max-w-[240px]">
                    {confirmAction.user.email || confirmAction.user.uid}
                  </p>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed">
                {confirmAction.action === 'authorize'
                  ? `Are you sure you want to grant permanent Pro access to ${confirmAction.user.email || confirmAction.user.uid}? This user will gain unlimited AI practice and premium features.`
                  : `Are you sure you want to revoke Pro access for ${confirmAction.user.email || confirmAction.user.uid}? The user's account will return to the free tier.`
                }
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="w-1/2 py-2.5 bg-card-soft hover:bg-card-bg border border-app-border text-text-main rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => handleUpdateSubscription(confirmAction.user, confirmAction.action === 'authorize')}
                  disabled={actionLoadingId !== null}
                  className={`w-1/2 py-2.5 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50 ${
                    confirmAction.action === 'authorize'
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {actionLoadingId ? 'Processing...' : (confirmAction.action === 'authorize' ? 'Confirm Authorize' : 'Confirm Cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
