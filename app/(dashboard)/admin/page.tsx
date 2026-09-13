'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Users,
  Clock,
  Zap,
  Cpu,
  Trash2,
  Plus,
  Edit,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Coins,
  Loader2,
  ArrowLeft,
  Key,
  Server,
  Activity,
  Check,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface PlatformStats {
  totalUsers: number;
  pendingUsers: number;
  activeUsers: number;
  proUsers: number;
  totalApps: number;
  publishedApps: number;
  totalAppCredits: number;
  totalAiCredits: number;
  totalRevenue: number;
}

interface AiConfigData {
  baseUrl: string;
  defaultModel: string;
  hasApiKey: boolean;
  maskedApiKey: string;
  updatedAt?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'stats' | 'approval' | 'users' | 'ai'>('approval');
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'pro'>('all');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState<UserProfile | null>(null);
  const [creditAppInput, setCreditAppInput] = useState(1);
  const [creditAiInput, setCreditAiInput] = useState(100000);
  const [creditReasonInput, setCreditReasonInput] = useState('Top Up Admin Manual');

  // Add user form
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [newIsPro, setNewIsPro] = useState(false);
  const [newAppCredits, setNewAppCredits] = useState(1);
  const [newAiCredits, setNewAiCredits] = useState(100000);

  // AI Config state
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [aiKeyInput, setAiKeyInput] = useState('');
  const [aiBaseUrlInput, setAiBaseUrlInput] = useState('https://api.koboillm.com/v1');
  const [aiModelInput, setAiModelInput] = useState('gemini-2.5-flash');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, aiRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/admin/ai-config')
      ]);

      if (statsRes.status === 401 || statsRes.status === 403) {
        alert('Akses ditolak: Halaman ini khusus Administrator.');
        router.push('/');
        return;
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData.stats);
      }

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setUsers(uData.users || []);
      }

      if (aiRes.ok) {
        const aData = await aiRes.json();
        setAiConfig(aData.config);
        if (aData.config) {
          setAiBaseUrlInput(aData.config.baseUrl || 'https://api.koboillm.com/v1');
          setAiModelInput(aData.config.defaultModel || 'gemini-2.5-flash');
        }
      }
    } catch (err: any) {
      notify('error', 'Gagal memuat data admin: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memproses persetujuan');

      notify('success', action === 'approve' ? 'Akun pengguna berhasil disetujui (di-ACC)' : 'Akun pengguna berhasil ditolak');
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Yakin ingin menghapus permanen pengguna @${username} beserta seluruh data aplikasinya?`)) {
      return;
    }

    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus user');

      notify('success', `Pengguna @${username} berhasil dihapus`);
      setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedUserIds.length} pengguna terpilih secara massal? Tindakan ini tidak dapat dibatalkan!`)) {
      return;
    }

    setActionLoading('bulk_delete');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus massal');

      notify('success', `${data.deletedCount} pengguna berhasil dihapus massal`);
      setSelectedUserIds([]);
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveCredits = async () => {
    if (!showCreditsModal) return;
    setActionLoading('saving_credits');
    try {
      const res = await fetch(`/api/admin/users/${showCreditsModal.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appCredits: creditAppInput,
          aiCredits: creditAiInput,
          reason: creditReasonInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah kredit');

      notify('success', `Kredit pengguna @${showCreditsModal.username} berhasil diperbarui`);
      setShowCreditsModal(null);
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading('creating_user');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword,
          role: newRole,
          isPro: newIsPro,
          appCredits: newAppCredits,
          aiCredits: newAiCredits
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambahkan user');

      notify('success', `Pengguna @${newUsername} berhasil dibuat dan langsung aktif!`);
      setShowAddModal(false);
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTestAiConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testConnection: true,
          apiKey: aiKeyInput,
          baseUrl: aiBaseUrlInput
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setTestResult({ success: false, message: data.error || 'Koneksi gagal' });
      } else {
        setTestResult({
          success: true,
          message: data.message || 'Koneksi berhasil!',
          latency: data.latencyMs
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: 'Gagal menghubungi server: ' + err.message });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveAiConfig = async () => {
    setActionLoading('saving_ai');
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: aiKeyInput,
          baseUrl: aiBaseUrlInput,
          defaultModel: aiModelInput
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan konfigurasi AI');

      notify('success', 'Konfigurasi AI KoboiLLM berhasil disimpan!');
      setAiConfig(data.config);
      setAiKeyInput('');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered users
  const pendingUsers = users.filter((u) => u.status === 'pending' || u.is_approved === false);
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.subdomain.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter === 'active') return u.status === 'active' && u.is_approved !== false;
    if (statusFilter === 'pending') return u.status === 'pending' || u.is_approved === false;
    if (statusFilter === 'pro') return u.is_pro;
    return true;
  });

  const toggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map((u) => u.id));
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-6 md:p-8">
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            href="/c/new"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown className="w-4 h-4" />
              </div>
              <h1 className="text-xl font-extrabold text-white tracking-tight">Superadmin Control Funnel</h1>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Master Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Persetujuan pendaftaran user (ACC), manajemen kredit manual & massal, serta kontrol API KoboiLLM.
            </p>
          </div>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={fetchInitialData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div
          className={`max-w-7xl mx-auto mt-4 p-4 rounded-xl border flex items-center justify-between gap-3 text-sm transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-6 flex flex-wrap gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab('approval')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'approval'
              ? 'bg-amber-500/15 border border-amber-500/30 text-amber-300 shadow-lg shadow-amber-500/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Persetujuan User (ACC)</span>
          {pendingUsers.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
              {pendingUsers.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300 shadow-lg shadow-violet-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Semua Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ikhtisar & Statistik</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'ai'
              ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 shadow-lg shadow-blue-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Pengaturan API KoboiLLM</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-6">
        {/* ======================= TAB 1: APPROVAL / ACC ======================= */}
        {activeTab === 'approval' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Daftar Pengguna Menunggu Persetujuan (ACC)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pengguna berikut telah mendaftar tetapi BELUM bisa masuk sebelum Anda setujui.
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                {pendingUsers.length} Permintaan Pending
              </span>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">Semua Pendaftaran Sudah Bersih</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Tidak ada pengguna yang sedang menunggu persetujuan. Setiap pengguna baru yang mendaftar via web akan langsung muncul di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-5 rounded-2xl bg-slate-900/80 border border-amber-500/30 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                          ⏳ Butuh ACC Admin
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(user.created_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white font-black text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">@{user.username}</h4>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Subdomain:</span>
                          <span className="text-slate-200 font-mono">{user.subdomain}.forge.dev</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Kredit Bawaan:</span>
                          <span className="text-emerald-400 font-semibold">{user.app_credits} App · {user.ai_credits.toLocaleString()} AI</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => handleApprove(user.id, 'approve')}
                        disabled={actionLoading === user.id}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                      >
                        {actionLoading === user.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Setujui (ACC)</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleApprove(user.id, 'reject')}
                        disabled={actionLoading === user.id}
                        className="px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 font-semibold text-xs border border-rose-500/30 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 2: SEMUA PENGGUNA ======================= */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Cari nama, email, subdomain..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif Disetujui</option>
                  <option value="pending">Menunggu ACC</option>
                  <option value="pro">Tier Pro</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {selectedUserIds.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={actionLoading === 'bulk_delete'}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus {selectedUserIds.length} Terpilih</span>
                  </button>
                )}

                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah User Manual</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 w-10 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                        {selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-violet-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-3.5">Pengguna</th>
                    <th className="p-3.5">Status & Role</th>
                    <th className="p-3.5">Kredit App</th>
                    <th className="p-3.5">Kredit AI</th>
                    <th className="p-3.5">Tgl Daftar</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        Tidak ada pengguna yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      const isPending = u.status === 'pending' || u.is_approved === false;
                      const isAdmin = u.role === 'admin' || u.username === 'demo';

                      return (
                        <tr
                          key={u.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isSelected ? 'bg-violet-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 text-center">
                            <button onClick={() => toggleSelectUser(u.id)} className="text-slate-400 hover:text-white">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-violet-400" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white">
                                {u.username.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-200">@{u.username}</div>
                                <div className="text-[11px] text-slate-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {isAdmin && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  👑 Admin
                                </span>
                              )}
                              {isPending ? (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  ⏳ Menunggu ACC
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  ✓ Aktif
                                </span>
                              )}
                              {u.is_pro && (
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  ⭐ Pro
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-amber-400">{u.app_credits} Slot</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-emerald-400">{u.ai_credits.toLocaleString()} Token</span>
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Inject credits button */}
                              <button
                                onClick={() => {
                                  setShowCreditsModal(u);
                                  setCreditAppInput(u.app_credits);
                                  setCreditAiInput(u.ai_credits);
                                }}
                                title="Atur / Suntik Kredit"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              >
                                <Zap className="w-3.5 h-3.5 text-amber-400" />
                              </button>

                              {/* ACC or Reject if pending */}
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(u.id, 'approve')}
                                    title="Setujui (ACC)"
                                    className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleApprove(u.id, 'reject')}
                                    title="Tolak"
                                    className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}

                              {/* Delete button (protected for admin) */}
                              {!isAdmin && (
                                <button
                                  onClick={() => handleDeleteUser(u.id, u.username)}
                                  disabled={actionLoading === u.id}
                                  title="Hapus Pengguna"
                                  className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
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
        )}

        {/* ======================= TAB 3: STATISTIK ======================= */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Pengguna</span>
                <Users className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{stats.totalUsers} User</div>
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <span className="text-emerald-400 font-semibold">{stats.activeUsers} Aktif</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{stats.pendingUsers} Pending</span>
                <span>•</span>
                <span className="text-purple-400 font-semibold">{stats.proUsers} Pro</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Aplikasi Diterbitkan</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{stats.publishedApps} App</div>
              <p className="mt-2 text-[11px] text-slate-400">Dari total {stats.totalApps} draft aplikasi</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Kredit AI Beredar</span>
                <Cpu className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-extrabold text-white">{(stats.totalAiCredits / 1000).toFixed(0)}k Token</div>
              <p className="mt-2 text-[11px] text-slate-400">Plus {stats.totalAppCredits} slot Kredit App</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Omset Penjualan</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-amber-300">
                Rp {stats.totalRevenue.toLocaleString('id-ID')}
              </div>
              <p className="mt-2 text-[11px] text-slate-400">Settlement via Midtrans Gateway</p>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: PENGATURAN API KOBOILLM ======================= */}
        {activeTab === 'ai' && (
          <div className="max-w-2xl bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Konfigurasi AI Provider (KoboiLLM)</h3>
              </div>
              <p className="text-xs text-slate-400">
                Atur API Key dan model bawaan secara dinamis tanpa perlu mengubah berkas konfigurasi server.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Base URL API
                </label>
                <input
                  type="text"
                  value={aiBaseUrlInput}
                  onChange={(e) => setAiBaseUrlInput(e.target.value)}
                  placeholder="https://api.koboillm.com/v1"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  KoboiLLM API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={aiKeyInput}
                    onChange={(e) => setAiKeyInput(e.target.value)}
                    placeholder={aiConfig?.hasApiKey ? `Tersimpan: ${aiConfig.maskedApiKey} (Isi jika ingin ganti)` : 'sk-koboillm-...'}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500 placeholder:text-slate-500"
                  />
                </div>
                {aiConfig?.hasApiKey && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> API Key aktif tersimpan di server.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Model AI Bawaan (Default Model)
                </label>
                <select
                  value={aiModelInput}
                  onChange={(e) => setAiModelInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash (Rekomendasi: Cepat & Handal)</option>
                  <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (Paling Irit: $0.10 / 1M)</option>
                  <option value="gemini-3.7-flash">gemini-3.7-flash (Kecerdasan Ekstrem / Deep Coding)</option>
                </select>
              </div>

              {/* Test Connection Output */}
              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold">{testResult.message}</div>
                    {testResult.latency && (
                      <div className="text-[10px] opacity-80 mt-0.5">Waktu respons: {testResult.latency}ms</div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center gap-3">
                <button
                  onClick={handleTestAiConnection}
                  disabled={testingConnection}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {testingConnection ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5 text-blue-400" />}
                  <span>Uji Koneksi API</span>
                </button>

                <button
                  onClick={handleSaveAiConfig}
                  disabled={actionLoading === 'saving_ai'}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {actionLoading === 'saving_ai' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Simpan Konfigurasi AI</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================= MODAL: TAMBAH USER MANUAL ======================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <span>Tambah Pengguna Manual (Langsung Aktif)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="contoh: budi_toko"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="budi@email.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Kata Sandi</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kredit App</label>
                  <input
                    type="number"
                    value={newAppCredits}
                    onChange={(e) => setNewAppCredits(Number(e.target.value))}
                    min={0}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kredit AI</label>
                  <input
                    type="number"
                    value={newAiCredits}
                    onChange={(e) => setNewAiCredits(Number(e.target.value))}
                    min={0}
                    step={1000}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.checked ? 'admin' : 'user')}
                    className="rounded border-slate-700 bg-slate-950 text-violet-600"
                  />
                  <span>Role Administrator</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newIsPro}
                    onChange={(e) => setNewIsPro(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-purple-600"
                  />
                  <span>Tier Pro (30 Hari)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === 'creating_user'}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-1"
                >
                  {actionLoading === 'creating_user' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Simpan User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= MODAL: SUNTIK KREDIT ======================= */}
      {showCreditsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Atur / Suntik Kredit Pengguna</span>
              </h3>
              <button onClick={() => setShowCreditsModal(null)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <div>Target Pengguna: <b className="text-white">@{showCreditsModal.username}</b> ({showCreditsModal.email})</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Saldo saat ini: {showCreditsModal.app_credits} App · {showCreditsModal.ai_credits.toLocaleString()} AI</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Set Saldo Kredit App</label>
                <input
                  type="number"
                  value={creditAppInput}
                  onChange={(e) => setCreditAppInput(Number(e.target.value))}
                  min={0}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Set Saldo Kredit AI (Token)</label>
                <input
                  type="number"
                  value={creditAiInput}
                  onChange={(e) => setCreditAiInput(Number(e.target.value))}
                  min={0}
                  step={10000}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Keterangan / Alasan Mutasi</label>
                <input
                  type="text"
                  value={creditReasonInput}
                  onChange={(e) => setCreditReasonInput(e.target.value)}
                  placeholder="Contoh: Top Up Manual via Transfer BCA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreditsModal(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                onClick={handleSaveCredits}
                disabled={actionLoading === 'saving_credits'}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1"
              >
                {actionLoading === 'saving_credits' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Simpan Saldo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
