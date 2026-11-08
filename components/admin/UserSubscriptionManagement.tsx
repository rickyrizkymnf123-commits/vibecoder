'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  ShieldCheck,
  Shield,
  User,
  Plus,
  Edit2,
  Trash2,
  Check,
  XCircle,
  Search,
  RefreshCw,
  CalendarPlus,
  Clock,
  MessageSquare,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Loader2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Eye
} from 'lucide-react';
import { UserWithSubscriptionData, AppRole } from '@/lib/types';

export function UserSubscriptionManagement() {
  const [users, setUsers] = useState<UserWithSubscriptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending'>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<'all' | 'active' | 'expired' | 'free' | 'none'>('all');
  const [packageFilter, setPackageFilter] = useState<'all' | 'pro' | 'basic' | 'free'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState<UserWithSubscriptionData | null>(null);
  const [showBulkSubModal, setShowBulkSubModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Invitation Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('user');
  const [inviteNotes, setInviteNotes] = useState('');

  // Subscription Edit Form
  const [subPackage, setSubPackage] = useState<'pro' | 'basic' | 'free'>('basic');
  const [subDays, setSubDays] = useState(30);
  const [subFreeAccess, setSubFreeAccess] = useState(false);
  const [subIsActive, setSubIsActive] = useState(true);
  const [subNotes, setSubNotes] = useState('');
  const [subCustomDate, setSubCustomDate] = useState('');

  // Bulk Subscription Form
  const [bulkDays, setBulkDays] = useState(30);
  const [bulkMode, setBulkMode] = useState<'smart' | 'now'>('smart');
  const [bulkFreeAccess, setBulkFreeAccess] = useState(false);
  const [bulkNotes, setBulkNotes] = useState('Bulk subscription extension');

  useEffect(() => {
    fetchUsers();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Gagal memuat data pengguna');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return iso;
    }
  };

  const getDaysRemaining = (endIso?: string | null) => {
    if (!endIso) return null;
    const diff = new Date(endIso).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Status & Package Filter Helpers
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Status Filter
    if (statusFilter === 'registered' && !u.is_registered) return false;
    if (statusFilter === 'pending' && u.is_registered) return false;

    // Package Filter
    if (packageFilter !== 'all') {
      const isPro = u.is_pro || u.role === 'admin';
      const isPaid = u.is_paid || isPro;
      if (packageFilter === 'pro' && !isPro) return false;
      if (packageFilter === 'basic' && (!isPaid || isPro)) return false;
      if (packageFilter === 'free' && isPaid) return false;
    }

    // Subscription Filter
    if (subscriptionFilter !== 'all') {
      const isFree = u.subscription?.is_free_access;
      const days = getDaysRemaining(u.subscription?.subscription_end);
      const isActive = u.subscription?.is_active && (isFree || (days !== null && days > 0));

      if (subscriptionFilter === 'free' && !isFree) return false;
      if (subscriptionFilter === 'active' && (!isActive || isFree)) return false;
      if (subscriptionFilter === 'expired' && (isFree || days === null || days > 0)) return false;
      if (subscriptionFilter === 'none' && u.subscription) return false;
    }

    return true;
  });

  // Package Handler
  const handlePackageChange = async (userId: string, newPackage: 'pro' | 'basic' | 'free') => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, package: newPackage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah paket');

      notify('success', `Paket pengguna berhasil diubah menjadi ${newPackage === 'pro' ? '👑 PRO' : newPackage === 'basic' ? '⚡ BASIC' : '🆓 GRATIS'}`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Selection
  const isAllSelected = filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions
  const handleImpersonateUser = async (user: UserWithSubscriptionData) => {
    setActionLoadingId(user.id);
    try {
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: user.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal masuk mode intip');

      notify('success', `Mengalihkan ke dashboard @${user.username || user.name || user.email}...`);
      window.location.href = '/c/new';
    } catch (err: any) {
      notify('error', err.message || 'Gagal masuk mode intip');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQuickAddDays = async (user: UserWithSubscriptionData, days: number) => {
    setActionLoadingId(user.id);
    try {
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          days,
          mode: 'smart',
          notes: `Quick extend +${days} hari oleh Admin`
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperpanjang langganan');

      notify('success', `Berhasil menambah +${days} hari untuk ${user.name || user.email}`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah role');

      notify('success', `Role berhasil diubah menjadi ${newRole}`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprovalToggle = async (userId: string, currentApproved: boolean) => {
    setActionLoadingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, is_approved: !currentApproved })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status persetujuan');

      notify('success', `Status persetujuan akun berhasil diperbarui`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUserOrInvitation = async (user: UserWithSubscriptionData) => {
    if (!confirm(`Yakin ingin menghapus ${user.is_registered ? 'pengguna' : 'undangan'} "${user.email}"?`)) {
      return;
    }

    setActionLoadingId(user.id);
    try {
      if (!user.is_registered && user.invitation?.id) {
        const res = await fetch(`/api/admin/invitations/${user.invitation.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus undangan');
      } else {
        const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Gagal menghapus pengguna');
      }

      notify('success', `Berhasil menghapus ${user.email}`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Save Full Subscription
  const handleSaveSubscriptionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubModal) return;

    setSubmitting(true);
    try {
      let finalEnd = showSubModal.subscription?.subscription_end;
      if (subCustomDate) {
        finalEnd = new Date(subCustomDate).toISOString();
      } else if (subDays > 0) {
        const base = (showSubModal.subscription?.subscription_end && new Date(showSubModal.subscription.subscription_end).getTime() > Date.now())
          ? new Date(showSubModal.subscription.subscription_end)
          : new Date();
        finalEnd = new Date(base.getTime() + subDays * 86400000).toISOString();
      }

      const [subRes, userRes] = await Promise.all([
        fetch('/api/admin/subscriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: showSubModal.id,
            subscription_end: finalEnd,
            is_free_access: subFreeAccess,
            is_active: subIsActive,
            notes: subNotes
          })
        }),
        fetch('/api/admin/users', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: showSubModal.id,
            package: subPackage
          })
        })
      ]);

      const data = await subRes.json();
      if (!subRes.ok) throw new Error(data.error || 'Gagal menyimpan langganan');

      notify('success', 'Data langganan & paket akun berhasil diperbarui');
      setShowSubModal(null);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Save Invitation
  const handleCreateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          notes: inviteNotes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal membuat undangan');

      notify('success', `Undangan untuk ${inviteEmail} berhasil ditambahkan ke whitelist`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteNotes('');
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Operations
  const handleBulkApprove = async (approve: boolean) => {
    if (selectedUserIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds, is_approved: approve })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah persetujuan');

      notify('success', data.message);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/subscriptions/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedUserIds,
          days: bulkDays,
          mode: bulkMode,
          isFreeAccess: bulkFreeAccess,
          notes: bulkNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal perpanjangan massal');

      notify('success', data.message);
      setShowBulkSubModal(false);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Hapus ${selectedUserIds.length} pengguna/undangan yang dipilih secara permanen?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus massal');

      notify('success', data.message);
      setSelectedUserIds([]);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Counts
  const totalCount = users.length;
  const registeredCount = users.filter((u) => u.is_registered).length;
  const pendingInvitesCount = users.filter((u) => !u.is_registered).length;
  const activeSubsCount = users.filter((u) => {
    const isFree = u.subscription?.is_free_access;
    const days = getDaysRemaining(u.subscription?.subscription_end);
    return u.subscription?.is_active && (isFree || (days !== null && days > 0));
  }).length;
  const freeAccessCount = users.filter((u) => u.subscription?.is_free_access).length;
  const expiredCount = users.filter((u) => {
    const isFree = u.subscription?.is_free_access;
    const days = getDaysRemaining(u.subscription?.subscription_end);
    return !isFree && (days === null || days <= 0);
  }).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg border transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Cards (Matching ProfitLab Stat Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="truncate">Total Pengguna</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">{registeredCount} Terdaftar · {pendingInvitesCount} Undangan</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">Langganan Aktif</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{activeSubsCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">Berbayar & Berjangka</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="truncate">Akses Lifetime</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-purple-400">{freeAccessCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">Tanpa Masa Aktif</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Clock className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="truncate">Kedaluwarsa</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">{expiredCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">Perlu Perpanjangan</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">Whitelist</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400">{pendingInvitesCount}</div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">Pre-Approved Email</div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Cari nama, email, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filters on mobile take equal space or wrap smoothly */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full sm:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="registered">Terdaftar</option>
              <option value="pending">Pending Undangan</option>
            </select>

            {/* Package Filter */}
            <select
              value={packageFilter}
              onChange={(e: any) => setPackageFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-purple-500 font-semibold"
            >
              <option value="all">Semua Paket</option>
              <option value="pro">👑 Paket Pro</option>
              <option value="basic">⚡ Paket Basic</option>
              <option value="free">🆓 Paket Gratis</option>
            </select>

            {/* Subscription Filter */}
            <select
              value={subscriptionFilter}
              onChange={(e: any) => setSubscriptionFilter(e.target.value)}
              className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">Semua Masa Aktif</option>
              <option value="active">🟢 Aktif</option>
              <option value="free">🟣 Lifetime</option>
              <option value="expired">🔴 Kedaluwarsa</option>
              <option value="none">⚪ Tanpa Sub</option>
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition text-xs flex items-center justify-center shrink-0"
            title="Muat Ulang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex-1 sm:flex-none px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Undangan Email</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (When users are selected) */}
      {selectedUserIds.length > 0 && (
        <div className="p-3 bg-blue-950/50 border border-blue-800/60 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <span className="px-2 py-0.5 bg-blue-600 text-white font-bold rounded-lg">
              {selectedUserIds.length}
            </span>
            <span>pengguna terpilih</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowBulkSubModal(true)}
              disabled={submitting}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span>⚡ Perpanjang Massal</span>
            </button>

            <button
              onClick={() => handleBulkApprove(true)}
              disabled={submitting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Setujui Semua</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={submitting}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Users & Subscription Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px]">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5 w-10 text-center">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {isAllSelected ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-3.5">Pengguna / Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Paket (Tier)</th>
                <th className="p-3.5 text-center">Persetujuan</th>
                <th className="p-3.5">Status Masa Aktif</th>
                <th className="p-3.5">Kedaluwarsa</th>
                <th className="p-3.5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Memuat data pengguna dan lisensi langganan...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>Tidak ada pengguna yang cocok dengan kriteria pencarian</span>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  const isFree = user.subscription?.is_free_access;
                  const daysRemaining = getDaysRemaining(user.subscription?.subscription_end);
                  const isActive =
                    user.subscription?.is_active && (isFree || (daysRemaining !== null && daysRemaining > 0));
                  const isPendingInvite = !user.is_registered;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => toggleSelectUser(user.id)}
                          className="text-slate-500 hover:text-blue-400"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* User Info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-inner ${
                              user.role === 'admin'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : user.role === 'moderator'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {user.name ? user.name.charAt(0) : user.email.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-1.5">
                              <span>{user.name || user.username || 'User'}</span>
                              {user.phone_number && (
                                <a
                                  href={`https://wa.me/${user.phone_number.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300"
                                  title="Kirim WhatsApp"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {isPendingInvite && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                                  Pending Undangan
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Selector */}
                      <td className="p-3.5">
                        <select
                          value={user.role}
                          onChange={(e: any) => handleRoleChange(user.id, e.target.value)}
                          disabled={actionLoadingId === user.id || isPendingInvite}
                          className={`px-2 py-1 rounded-lg border text-xs font-semibold focus:outline-none transition ${
                            user.role === 'admin'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                              : user.role === 'moderator'
                              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                              : 'bg-slate-950 text-slate-300 border-slate-800'
                          }`}
                        >
                          <option value="user">👤 User</option>
                          <option value="moderator">🛡️ Moderator</option>
                          <option value="admin">👑 Administrator</option>
                        </select>
                      </td>

                      {/* Package (Tier) Selector */}
                      <td className="p-3.5">
                        {isPendingInvite ? (
                          <span className="text-slate-500 text-[11px]">-</span>
                        ) : (
                          <select
                            value={user.is_pro || user.role === 'admin' ? 'pro' : user.is_paid ? 'basic' : 'free'}
                            onChange={(e: any) => handlePackageChange(user.id, e.target.value)}
                            disabled={actionLoadingId === user.id}
                            className={`px-2 py-1 rounded-lg border text-xs font-bold focus:outline-none transition cursor-pointer shadow-sm ${
                              user.is_pro || user.role === 'admin'
                                ? 'bg-purple-950/70 text-purple-300 border-purple-500/40 hover:border-purple-400'
                                : user.is_paid
                                ? 'bg-blue-950/70 text-blue-300 border-blue-500/40 hover:border-blue-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <option value="pro">👑 Pro</option>
                            <option value="basic">⚡ Basic</option>
                            <option value="free">🆓 Gratis</option>
                          </select>
                        )}
                      </td>

                      {/* Approval Toggle */}
                      <td className="p-3.5 text-center">
                        {isPendingInvite ? (
                          <span className="text-slate-500 text-[11px]">-</span>
                        ) : (
                          <button
                            onClick={() => handleApprovalToggle(user.id, user.is_approved)}
                            disabled={actionLoadingId === user.id}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 transition ${
                              user.is_approved
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-400 border border-rose-500/30 hover:bg-rose-900'
                            }`}
                          >
                            {user.is_approved ? (
                              <>
                                <Check className="w-3 h-3" /> Disetujui
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Pending
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Subscription Status Badge */}
                      <td className="p-3.5">
                        {isFree ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30 inline-flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-purple-400" /> Akses Gratis (Lifetime)
                          </span>
                        ) : isActive ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Aktif ({daysRemaining} hari lagi)
                          </span>
                        ) : user.subscription ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30 inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Kedaluwarsa
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                            Tanpa Langganan
                          </span>
                        )}
                      </td>

                      {/* Expiration Date */}
                      <td className="p-3.5 text-slate-300 font-mono text-[11px]">
                        {isFree ? (
                          <span className="text-purple-400 font-bold">Selamanya (No Expiry)</span>
                        ) : user.subscription?.subscription_end ? (
                          <span>{formatDate(user.subscription.subscription_end)}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Mode Intip Button */}
                          {user.is_registered && (
                            <button
                              onClick={() => handleImpersonateUser(user)}
                              disabled={actionLoadingId === user.id}
                              className="px-2.5 py-1 bg-indigo-950/70 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition shadow-sm"
                              title="Intip / Masuk ke Akun User Ini (Mode Intip)"
                            >
                              <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Intip</span>
                            </button>
                          )}

                          {/* Quick +30 Days Button */}
                          <button
                            onClick={() => handleQuickAddDays(user, 30)}
                            disabled={actionLoadingId === user.id || isPendingInvite}
                            className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 transition"
                            title="Tambah +30 Hari Masa Aktif"
                          >
                            <CalendarPlus className="w-3 h-3" /> +30 Hari
                          </button>

                          {/* Manage Full Subscription Button */}
                          <button
                            onClick={() => {
                              setShowSubModal(user);
                              setSubPackage(user.is_pro || user.role === 'admin' ? 'pro' : user.is_paid ? 'basic' : 'free');
                              setSubDays(30);
                              setSubFreeAccess(user.subscription?.is_free_access || false);
                              setSubIsActive(user.subscription?.is_active !== false);
                              setSubNotes(user.subscription?.notes || '');
                              setSubCustomDate('');
                            }}
                            disabled={isPendingInvite}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                            title="Kelola Detail Langganan & Paket"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete User */}
                          <button
                            onClick={() => handleDeleteUserOrInvitation(user)}
                            disabled={actionLoadingId === user.id}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg transition"
                            title="Hapus Akun / Undangan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: PRE-APPROVED EMAIL INVITATION */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Plus className="w-5 h-5 text-blue-400" />
                <span>Tambah Undangan Pra-Persetujuan</span>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvitation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Email Calon Pengguna *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: user@bisnis.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Role Akses Bawaan
                </label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="user">👤 User Biasa</option>
                  <option value="moderator">🛡️ Moderator</option>
                  <option value="admin">👑 Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Admin (Opsional)
                </label>
                <textarea
                  placeholder="Catatan pendaftaran khusus / invoice nomor..."
                  value={inviteNotes}
                  onChange={(e) => setInviteNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan ke Whitelist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL SUBSCRIPTION EDIT */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-white font-bold text-base flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-emerald-400" />
                  <span>Kelola Langganan Pengguna</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[260px]">{showSubModal.email}</p>
              </div>
              <button
                onClick={() => setShowSubModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubscriptionModal} className="space-y-4">
              {/* Package Tier Switcher */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Paket Akses Akun (Tier)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubPackage('pro')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      subPackage === 'pro'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200 shadow-md shadow-purple-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">👑 Paket Pro</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Semua fitur + Export ZIP/DB</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubPackage('basic')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      subPackage === 'basic'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-200 shadow-md shadow-blue-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">⚡ Paket Basic</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Akses dasbor &amp; build web</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubPackage('free')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      subPackage === 'free'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-md shadow-amber-900/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white flex items-center gap-1">🆓 Paket Gratis</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Terkunci paywall aktivasi</div>
                  </button>
                </div>
              </div>

              {/* Lifetime / Free Access Switch */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Akses Gratis (Lifetime)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Pengguna dapat menggunakan platform selamanya tanpa batas waktu.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={subFreeAccess}
                  onChange={(e) => setSubFreeAccess(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 cursor-pointer shrink-0 ml-2"
                />
              </div>

              {/* Add Days Presets */}
              {!subFreeAccess && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Tambah Hari Masa Aktif (Smart Extend)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[30, 60, 90, 365].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          setSubDays(d);
                          setSubCustomDate('');
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition ${
                          subDays === d && !subCustomDate
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        +{d} Hari
                      </button>
                    ))}
                  </div>

                  {/* Or Custom Date */}
                  <div className="mt-2">
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Atau Tetapkan Tanggal Kedaluwarsa Spesifik:
                    </label>
                    <input
                      type="date"
                      value={subCustomDate}
                      onChange={(e) => {
                        setSubCustomDate(e.target.value);
                        setSubDays(0);
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Status Switch */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Status Lisensi Aktif</div>
                  <div className="text-[11px] text-slate-400">
                    Jika dinonaktifkan, user tidak bisa mengakses fitur berbayar.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={subIsActive}
                  onChange={(e) => setSubIsActive(e.target.checked)}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer shrink-0 ml-2"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Admin
                </label>
                <textarea
                  placeholder="Nomor invoice pembayaran, referensi transfer, atau alasan perpanjangan..."
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubModal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: BULK SUBSCRIPTION EXTENSION */}
      {showBulkSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <CalendarPlus className="w-5 h-5 text-emerald-400" />
                <span className="truncate">Perpanjangan Massal ({selectedUserIds.length})</span>
              </div>
              <button
                onClick={() => setShowBulkSubModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBulkExtendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jumlah Hari Ditambahkan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[30, 60, 90, 365].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setBulkDays(d)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        bulkDays === d
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      +{d} Hari
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mode Perhitungan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMode('smart')}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      bulkMode === 'smart'
                        ? 'bg-blue-950/60 text-blue-200 border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Smart Mode</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Tambah dari sisa hari jika aktif, atau dari hari ini jika expired.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkMode('now')}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      bulkMode === 'now'
                        ? 'bg-blue-950/60 text-blue-200 border-blue-500'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Mulai Hari Ini</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Reset dan hitung hari langsung dari hari ini.
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Akses Gratis (Lifetime)</div>
                  <div className="text-[10px] text-slate-400">Berikan akses gratis tanpa batas waktu.</div>
                </div>
                <input
                  type="checkbox"
                  checked={bulkFreeAccess}
                  onChange={(e) => setBulkFreeAccess(e.target.checked)}
                  className="w-5 h-5 accent-purple-500 cursor-pointer shrink-0 ml-2"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Admin
                </label>
                <input
                  type="text"
                  value={bulkNotes}
                  onChange={(e) => setBulkNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBulkSubModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Jalankan Perpanjangan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
