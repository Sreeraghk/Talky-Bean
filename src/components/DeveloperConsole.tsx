import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserPlus, Shield, Trash2, Key, ToggleLeft, ToggleRight, 
  RefreshCw, AlertCircle, Sparkles, Check, X, ShieldAlert,
  Sliders, Search, LayoutDashboard
} from 'lucide-react';
import { DeveloperWhitelistService, WhitelistedUser } from '../services/DeveloperWhitelistService';
import { cn } from '../lib/utils';

interface DeveloperConsoleProps {
  onClose: () => void;
}

export function DeveloperConsole({ onClose }: DeveloperConsoleProps) {
  const [users, setUsers] = useState<WhitelistedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create / Add form states
  const [newEmail, setNewEmail] = useState('');
  const [hasLimit, setHasLimit] = useState(false);
  const [newLimit, setNewLimit] = useState(50000);
  const [isAdding, setIsAdding] = useState(false);
  
  // Editing states
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editLimitValue, setEditLimitValue] = useState<number>(50000);
  const [editHasLimit, setEditHasLimit] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Status/Message notification banner
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const loadWhitelistedUsers = async () => {
    setLoading(true);
    try {
      const data = await DeveloperWhitelistService.getWhitelistedUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      triggerNotification(err.message || "Failed to load developer whitelist list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWhitelistedUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = newEmail.trim().toLowerCase();
    if (!email) {
      triggerNotification("Please enter a valid email address.", "error");
      return;
    }

    if (users.some(u => u.email === email)) {
      triggerNotification("This user email is already in the whitelist.", "error");
      return;
    }

    setIsAdding(true);
    try {
      const limit = hasLimit ? Math.max(100, newLimit) : null;
      await DeveloperWhitelistService.addWhitelistedUser(email, limit);
      triggerNotification(`Successfully whitelisted ${email} for free platform access!`);
      setNewEmail('');
      setHasLimit(false);
      await loadWhitelistedUsers();
    } catch (err: any) {
      triggerNotification(err.message || "Failed to add user to whitelist.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleAccess = async (email: string, currentAllowed: boolean) => {
    try {
      await DeveloperWhitelistService.updateWhitelistedUser(email, { allowed: !currentAllowed });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, allowed: !currentAllowed } : u));
      triggerNotification(
        `Access for ${email} is now ${!currentAllowed ? 'GRANTED (Free Mode)' : 'PAUSED (Standard Mode)'}`
      );
    } catch (err: any) {
      triggerNotification(err.message || "Failed to toggle user access.", "error");
    }
  };

  const handleOpenEditCap = (user: WhitelistedUser) => {
    setEditingEmail(user.email);
    setEditHasLimit(user.tokenLimit !== null);
    setEditLimitValue(user.tokenLimit || 50000);
  };

  const handleSaveCap = async (email: string) => {
    setIsUpdating(true);
    try {
      const limit = editHasLimit ? Math.max(100, editLimitValue) : null;
      await DeveloperWhitelistService.updateWhitelistedUser(email, { tokenLimit: limit });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, tokenLimit: limit } : u));
      triggerNotification(`Token cap updated for ${email}`);
      setEditingEmail(null);
    } catch (err: any) {
      triggerNotification(err.message || "Failed to edit token cap.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetUsage = async (email: string) => {
    if (!window.confirm(`Are you sure you want to reset token usage for ${email} back to zero?`)) return;
    try {
      await DeveloperWhitelistService.updateWhitelistedUser(email, { tokenUsed: 0 });
      setUsers(prev => prev.map(u => u.email === email ? { ...u, tokenUsed: 0 } : u));
      triggerNotification(`Token usage reset to zero for ${email}!`);
    } catch (err: any) {
      triggerNotification(err.message || "Failed to reset usage statistics.", "error");
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!window.confirm(`Remove ${email} from free developer whitelist completely? They will return to standard payment flow.`)) {
      return;
    }
    try {
      await DeveloperWhitelistService.removeWhitelistedUser(email);
      setUsers(prev => prev.filter(u => u.email !== email));
      triggerNotification(`${email} has been removed from developer whitelist.`);
    } catch (err: any) {
      triggerNotification(err.message || "Failed to remove user.", "error");
    }
  };

  // Stats summaries
  const activeWhitelists = users.filter(u => u.allowed).length;
  const totalTokensDistributed = users.reduce((sum, u) => sum + (u.tokenLimit || 0), 0);
  const totalTokensConsumed = users.reduce((sum, u) => sum + u.tokenUsed, 0);

  // Filtering
  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-card-bg/60 border border-app-border rounded-panel p-6 md:p-8 relative backdrop-blur-3xl overflow-hidden shadow-2xl">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-app-border gap-4 mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500 animate-pulse" size={24} />
            <span className="text-2xs uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500">
              Admin Gateway
            </span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-main">
            Developer Whitelist & Token Cap Console
          </h2>
          <p className="text-sm text-text-muted">
            Securely grant free platform access to close friends and testers ("till I want to"), while restricting their token allocation.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="px-5 py-2.5 bg-card-soft text-text-muted hover:text-text-main border border-app-border rounded-full text-xs font-bold transition-all active:scale-95"
        >
          Back to Profile
        </button>
      </div>

      {/* Notifications banner */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-xl mb-6 flex items-center gap-3 border text-sm font-medium shadow-lg backdrop-blur-md",
              notification.type === 'error' 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-green-500/10 border-green-500/20 text-green-400"
            )}
          >
            {notification.type === 'error' ? <ShieldAlert size={18} /> : <Check size={18} />}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Summary Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card-soft border border-app-border/60 rounded-xl p-5 relative overflow-hidden">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Active Whitelisted Users</p>
          <p className="text-4xl font-extrabold font-mono text-text-main">{activeWhitelists} <span className="text-xs font-normal text-text-muted">/ {users.length} total</span></p>
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <UserPlus size={48} />
          </div>
        </div>
        <div className="bg-card-soft border border-app-border/60 rounded-xl p-5 relative overflow-hidden">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Total Token Caps Set</p>
          <p className="text-4xl font-extrabold font-mono text-orange-500">
            {totalTokensDistributed > 0 ? totalTokensDistributed.toLocaleString() : 'N/A'}
          </p>
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <Sliders size={48} />
          </div>
        </div>
        <div className="bg-card-soft border border-app-border/60 rounded-xl p-5 relative overflow-hidden">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Whitelisting Token Usage</p>
          <p className="text-4xl font-extrabold font-mono text-accent">
            {totalTokensConsumed.toLocaleString()}
          </p>
          <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none">
            <RefreshCw size={48} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Whitelist Addition Form (Left Column) */}
        <div className="lg:col-span-4 bg-card-soft/40 border border-app-border rounded-panel p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-1.5">
              <UserPlus size={18} className="text-orange-500" />
              Whitelist a New User
            </h3>
            <p className="text-xs text-text-muted">
              Add someone by email so they bypass active RevenueCat checks instantly.
            </p>
          </div>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-text-muted">User Email Address</label>
              <input 
                type="email" 
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="friend@gamil.com"
                required
                className="w-full bg-card-soft border border-app-border rounded-btn px-4 py-3 text-sm focus:ring-1 focus:ring-orange-500 outline-none"
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-text-muted block">Enforce Token Cap</label>
                  <span className="text-[10px] text-text-muted">Restrict how much AI models they consume.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasLimit(!hasLimit)}
                  className="text-text-muted hover:text-orange-500 transition-colors"
                >
                  {hasLimit ? (
                    <ToggleRight size={38} className="text-orange-500" />
                  ) : (
                    <ToggleLeft size={38} />
                  )}
                </button>
              </div>

              <AnimatePresence>
                {hasLimit && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <label className="text-xs font-bold uppercase tracking-wider text-text-muted">Token Quota Limit</label>
                    <input 
                      type="number" 
                      value={newLimit}
                      onChange={(e) => setNewLimit(Number(e.target.value))}
                      placeholder="50000"
                      min="100"
                      className="w-full bg-card-soft border border-app-border rounded-btn px-4 py-2.5 text-sm font-mono text-text-main outline-none focus:ring-1 focus:ring-orange-500"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {[10000, 50000, 100000, 500000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setNewLimit(val)}
                          className="px-2 py-1 bg-card-soft hover:bg-card-bg border border-app-border rounded text-[10px] font-mono text-text-muted hover:text-text-main transition-all"
                        >
                          {val >= 1000 ? `${val/1000}k` : val}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={isAdding}
              className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-btn text-xs font-extrabold uppercase tracking-widest transition-all hover:shadow-lg shadow-orange-500/20 active:scale-95"
            >
              {isAdding ? "Working..." : "Grant Free Access"}
            </button>
          </form>
        </div>

        {/* List of Whitelisted Users (Right Column) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <Sliders size={18} className="text-accent" />
                Manage Whitelisted Accounts
              </h3>
              <p className="text-xs text-text-muted">Users below enjoy unlimited platform utility on both web and native apps.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <input 
                type="text" 
                placeholder="Search whitelisted email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-soft border border-app-border rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:border-accent"
              />
              <Search className="absolute left-3 top-2.5 text-text-muted" size={14} />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card-soft/20 border border-app-border rounded-panel space-y-4">
              <RefreshCw className="animate-spin text-orange-500" size={32} />
              <p className="text-sm text-text-muted">Querying secure whitelist database...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-card-soft/20 border border-app-border rounded-panel text-center px-4 space-y-3">
              <AlertCircle className="text-text-muted/40" size={48} />
              <h4 className="font-bold text-text-main text-lg">No whitelisted users found</h4>
              <p className="text-sm text-text-muted max-w-sm">
                {searchQuery ? "No matches found. Clear search filter or try another term." : "Add emails to check, toggle, or cap friends' free access easily on this control deck."}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredUsers.map((item) => {
                const usesCap = item.tokenLimit !== null;
                const progressPercent = usesCap ? Math.min(100, (item.tokenUsed / item.tokenLimit!) * 100) : 0;
                
                return (
                  <div 
                    key={item.email}
                    className="p-5 bg-card-soft/40 hover:bg-card-soft/60 border border-app-border rounded-xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      {/* Email + Allowed badge status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-text-main font-mono text-sm break-all">{item.email}</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border",
                          item.allowed 
                            ? "bg-green-500/10 border-green-500/20 text-green-400" 
                            : "bg-zinc-500/10 border-zinc-500/20 text-text-muted"
                        )}>
                          {item.allowed ? "FREE ACCESS ACTIVE" : "PAUSED"}
                        </span>
                      </div>

                      {/* Token Cap Progress Details */}
                      <div className="space-y-1.5 max-w-md">
                        <div className="flex justify-between text-2xs font-bold text-text-muted">
                          <span className="uppercase tracking-wider">AI API Token Usage</span>
                          <span className="font-mono">
                            {item.tokenUsed.toLocaleString()} / {usesCap ? item.tokenLimit!.toLocaleString() : '∞'}
                          </span>
                        </div>
                        {usesCap && (
                          <div className="w-full bg-card-bg border border-app-border rounded-full h-2 overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                progressPercent >= 90 ? "bg-red-500" : progressPercent >= 75 ? "bg-orange-500" : "bg-accent"
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions and toggle switches */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                      {/* Active Toggle Switch */}
                      <button
                        title={item.allowed ? "Pause Free Access" : "Activate Free Access"}
                        onClick={() => handleToggleAccess(item.email, item.allowed)}
                        className="p-2 hover:bg-card-bg rounded-lg border border-app-border/40 text-text-muted hover:text-text-main transition-all flex items-center justify-center"
                      >
                        {item.allowed ? (
                          <ToggleRight size={22} className="text-green-500" />
                        ) : (
                          <ToggleLeft size={22} />
                        )}
                      </button>

                      {/* Token Cap editing and adjustments inline dropdown */}
                      {editingEmail === item.email ? (
                        <div className="flex items-center gap-1.5 border border-orange-500/30 bg-orange-500/10 rounded-lg p-1">
                          <div className="flex items-center gap-1 text-2xs font-extrabold text-orange-500 uppercase px-1">
                            <label className="mr-1">Cap:</label>
                            <input 
                              type="checkbox" 
                              checked={editHasLimit} 
                              onChange={(e) => setEditHasLimit(e.target.checked)}
                            />
                          </div>
                          {editHasLimit && (
                            <input
                              type="number"
                              value={editLimitValue}
                              onChange={(e) => setEditLimitValue(Number(e.target.value))}
                              className="bg-card-bg border border-app-border text-xs text-text-main font-mono w-20 px-1.5 py-0.5 rounded outline-none"
                            />
                          )}
                          <button 
                            onClick={() => handleSaveCap(item.email)}
                            className="bg-green-500 hover:bg-green-600 p-1 rounded text-white"
                          >
                            <Check size={12} />
                          </button>
                          <button 
                            onClick={() => setEditingEmail(null)}
                            className="bg-zinc-500 hover:bg-zinc-600 p-1 rounded text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenEditCap(item)}
                          className="px-2.5 py-1.5 hover:bg-card-bg border border-app-border/40 rounded-lg text-2xs font-bold text-text-muted hover:text-text-main transition-all"
                        >
                          Modify Cap
                        </button>
                      )}

                      {/* Reset Limit usage to 0 */}
                      <button
                        title="Reset Token Counters"
                        onClick={() => handleResetUsage(item.email)}
                        className="p-2 hover:bg-card-bg border border-app-border/40 rounded-lg text-text-muted hover:text-accent transition-all"
                      >
                        <RefreshCw size={14} />
                      </button>

                      {/* Trash - Remove User from Whitelist */}
                      <button
                        title="Remove Whitelist completely"
                        onClick={() => handleRemoveUser(item.email)}
                        className="p-2 border border-app-border/40 hover:bg-red-500/10 hover:border-red-500/20 text-text-muted hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
