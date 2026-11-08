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
  Square,
  Eye,
  EyeOff,
  Save,
  Bot,
  Sparkles,
  Send
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { UserSubscriptionManagement } from '@/components/admin/UserSubscriptionManagement';

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
  apiKey?: string;
  maskedApiKey: string;
  updatedAt?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'approval' | 'users' | 'stats' | 'ai'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get('tab');
      if (urlTab && ['subscriptions', 'approval', 'users', 'stats', 'ai'].includes(urlTab)) {
        return urlTab as any;
      }
      const savedTab = localStorage.getItem('forge_admin_active_tab');
      if (savedTab && ['subscriptions', 'approval', 'users', 'stats', 'ai'].includes(savedTab)) {
        return savedTab as any;
      }
    }
    return 'subscriptions';
  });
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'pro' | 'basic' | 'free'>('all');
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
  const [newPackage, setNewPackage] = useState<'pro' | 'basic' | 'free'>('basic');
  const [newAppCredits, setNewAppCredits] = useState(1);
  const [newAiCredits, setNewAiCredits] = useState(100000);

  // AI Config state (ProfitLab style)
  const [aiConfig, setAiConfig] = useState<AiConfigData | null>(null);
  const [aiKeyInput, setAiKeyInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('forge_ai_config_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.apiKey) return parsed.apiKey;
        }
      } catch (_) {}
    }
    return '';
  });
  const [aiShowApiKey, setAiShowApiKey] = useState(false);
  const [aiBaseUrlInput, setAiBaseUrlInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('forge_ai_config_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.baseUrl) return parsed.baseUrl;
        }
      } catch (_) {}
    }
    return 'https://api.koboillm.com/v1';
  });
  const [aiModelInput, setAiModelInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('forge_ai_config_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.defaultModel) return parsed.defaultModel;
        }
      } catch (_) {}
    }
    return 'gemini-2.5-flash';
  });
  const [modelsList, setModelsList] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('forge_ai_models_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (_) {}
    }
    return [
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'claude-3-5-sonnet-20241022',
      'gpt-4o',
      'gpt-4o-mini'
    ];
  });
  const [loadingModels, setLoadingModels] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);

  // Test Chat state
  const [testPrompt, setTestPrompt] = useState('Hai, perkenalkan dirimu sebagai Asisten AI Kilat Tools');
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [testReply, setTestReply] = useState('');
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testError, setTestError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleTabChange = (tab: 'subscriptions' | 'approval' | 'users' | 'stats' | 'ai') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('forge_admin_active_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('tab', tab);
      window.history.replaceState({}, '', url.toString());
    }
  };

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
          if (aData.config.baseUrl) setAiBaseUrlInput(aData.config.baseUrl);
          if (aData.config.defaultModel) setAiModelInput(aData.config.defaultModel);
          if (aData.config.apiKey) setAiKeyInput(aData.config.apiKey);
          try {
            localStorage.setItem('forge_ai_config_cache', JSON.stringify(aData.config));
          } catch (_) {}
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

  const handlePackageChange = async (userId: string, targetPackage: 'pro' | 'basic' | 'free') => {
    setActionLoading(`pkg_${userId}`);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          package: targetPackage
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah paket pengguna');
      notify('success', `Paket pengguna berhasil diubah menjadi ${targetPackage.toUpperCase()}`);
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
          package: newPackage,
          isPro: newPackage === 'pro',
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
      setNewPackage('basic');
      await fetchInitialData();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleImpersonateUser = async (targetUser: UserProfile) => {
    try {
      setActionLoading(targetUser.id);
      const res = await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: targetUser.id })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal masuk mode intip');
      }
      notify('success', `Mengalihkan ke dashboard @${targetUser.username}...`);
      window.location.href = '/c/new';
    } catch (err: any) {
      notify('error', err.message || 'Gagal masuk mode intip');
    } finally {
      setActionLoading(null);
    }
  };

  const handleFetchModels = async () => {
    if (!aiKeyInput && !aiConfig?.hasApiKey) {
      notify('error', 'Masukkan API Key terlebih dahulu');
      return;
    }
    setLoadingModels(true);
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'fetch_models',
          baseUrl: aiBaseUrlInput,
          apiKey: aiKeyInput
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil model');

      if (data.models && data.models.length > 0) {
        setModelsList(data.models);
        try {
          localStorage.setItem('forge_ai_models_cache', JSON.stringify(data.models));
        } catch (_) {}
        if (!data.models.includes(aiModelInput)) {
          setAiModelInput(data.models[0]);
        }
        notify('success', `🟢 ${data.models.length} model berhasil ditemukan dari provider AI!`);
      } else {
        notify('error', 'Daftar model kosong dari provider API');
      }
    } catch (err: any) {
      notify('error', `Gagal fetch models: ${err.message}`);
    } finally {
      setLoadingModels(false);
    }
  };

  const handleSaveAiConfig = async () => {
    setAiSaving(true);
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

      notify('success', 'Pengaturan AI berhasil disimpan!');
      if (data.config) {
        setAiConfig(data.config);
        if (data.config.baseUrl) setAiBaseUrlInput(data.config.baseUrl);
        if (data.config.defaultModel) setAiModelInput(data.config.defaultModel);
        if (data.config.apiKey) setAiKeyInput(data.config.apiKey);
        try {
          localStorage.setItem('forge_ai_config_cache', JSON.stringify(data.config));
        } catch (_) {}
      }
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setAiSaving(false);
    }
  };

  const handleTestAiChat = async () => {
    if (!testPrompt.trim()) {
      notify('error', 'Ketik pesan uji coba terlebih dahulu');
      return;
    }
    setIsTestingAi(true);
    setTestReply('');
    setTestError('');
    setTestLatency(null);
    try {
      const res = await fetch('/api/admin/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_ai',
          baseUrl: aiBaseUrlInput,
          apiKey: aiKeyInput,
          model: aiModelInput,
          prompt: testPrompt
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTestError(data.error || 'Gagal menerima respon dari model AI.');
      } else {
        setTestReply(data.reply || '(Respon kosong)');
        setTestLatency(data.latencyMs || null);
      }
    } catch (err: any) {
      setTestError(`Gagal mengirim prompt uji coba: ${err.message}`);
    } finally {
      setIsTestingAi(false);
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
    if (statusFilter === 'pro') return Boolean(u.is_pro);
    if (statusFilter === 'basic') return Boolean(u.is_paid && !u.is_pro);
    if (statusFilter === 'free') return !u.is_paid;
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
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-3.5 sm:p-6 md:p-8">
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
              <h1 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">Superadmin Control Funnel</h1>
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
          className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
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

      {/* Navigation Tabs (Mobile Optimized Scrollable) */}
      <div className="max-w-7xl mx-auto mt-6 flex overflow-x-auto no-scrollbar gap-2 border-b border-slate-800/80 pb-3 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        <button
          onClick={() => handleTabChange('subscriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'subscriptions'
              ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>👥 Kelola Langganan & Users</span>
        </button>

        <button
          onClick={() => handleTabChange('approval')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
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
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300 shadow-lg shadow-violet-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Semua Pengguna ({users.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'stats'
              ? 'bg-purple-600/20 border border-purple-500/40 text-purple-300 shadow-lg shadow-purple-600/10'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Ikhtisar & Statistik</span>
        </button>

        <button
          onClick={() => handleTabChange('ai')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
            activeTab === 'ai'
              ? 'bg-gradient-to-r from-indigo-600/30 to-purple-600/30 border border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-600/15'
              : 'bg-slate-900/60 border border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span>Pengaturan API KoboiLLM</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto mt-6">
        {/* ======================= TAB 0: USER SUBSCRIPTIONS & MANAGEMENT ======================= */}
        {activeTab === 'subscriptions' && (
          <UserSubscriptionManagement />
        )}

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
                          <span className="text-slate-200 font-mono">{user.subdomain}.kilatstools.my.id</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-400">
                          <span>Kredit Bawaan:</span>
                          <span className="text-emerald-400 font-semibold">{user.app_credits} App · {user.ai_credits.toLocaleString()} AI</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() => handleImpersonateUser(user)}
                        disabled={actionLoading === user.id}
                        title="Intip akun pengguna ini"
                        className="px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Intip</span>
                      </button>

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
                  <option value="all">Semua Status & Paket</option>
                  <option value="active">Aktif Disetujui</option>
                  <option value="pending">Menunggu ACC</option>
                  <option value="pro">👑 Paket Pro</option>
                  <option value="basic">⚡ Paket Basic</option>
                  <option value="free">🆓 Gratis (Belum Bayar)</option>
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
              <table className="w-full text-left text-xs min-w-[800px]">
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
                    <th className="p-3.5">Paket (Tier)</th>
                    <th className="p-3.5">Kredit App</th>
                    <th className="p-3.5">Kredit AI</th>
                    <th className="p-3.5">Tgl Daftar</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Tidak ada pengguna yang cocok dengan pencarian / filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelected = selectedUserIds.includes(u.id);
                      const isPending = u.status === 'pending' || u.is_approved === false;
                      const isAdmin = u.role === 'admin' || u.username === 'demo';
                      const currentTier: 'pro' | 'basic' | 'free' = u.is_pro ? 'pro' : u.is_paid ? 'basic' : 'free';

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
                            <select
                              value={currentTier}
                              disabled={actionLoading === `pkg_${u.id}`}
                              onChange={(e) => handlePackageChange(u.id, e.target.value as any)}
                              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border focus:outline-none transition-all cursor-pointer ${
                                currentTier === 'pro'
                                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-300 hover:border-purple-400'
                                  : currentTier === 'basic'
                                  ? 'bg-blue-950/40 border-blue-500/50 text-blue-300 hover:border-blue-400'
                                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                              }`}
                            >
                              <option value="pro" className="bg-slate-900 text-purple-300">👑 Pro</option>
                              <option value="basic" className="bg-slate-900 text-blue-300">⚡ Basic</option>
                              <option value="free" className="bg-slate-900 text-slate-400">🆓 Gratis</option>
                            </select>
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
                              {/* Intip button */}
                              <button
                                onClick={() => handleImpersonateUser(u)}
                                disabled={actionLoading === u.id}
                                title={`Intip akun @${u.username}`}
                                className="p-1.5 px-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                                <span>Intip</span>
                              </button>

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

        {/* ======================= TAB 4: PENGATURAN API KOBOILLM (KILAT TOOLS STYLE) ======================= */}
        {activeTab === 'ai' && (
          <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-7 rounded-2xl shadow-2xl space-y-6 backdrop-blur-xl">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">AI Configuration</h2>
                  <p className="text-[11px] text-indigo-400/80 font-medium">Kilat Tools Central API Hub</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Konfigurasi AI central untuk semua edge function & code builder. API key dan model dipilih di sini — user biasa tidak bisa mengubah.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Base URL
                </label>
                <input
                  type="text"
                  value={aiBaseUrlInput}
                  onChange={(e) => setAiBaseUrlInput(e.target.value)}
                  placeholder="https://api.koboillm.com/v1"
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  LiteLLM compatible API URL (contoh: api.koboillm.com/v1)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  API Key
                </label>
                <div className="relative">
                  <input
                    type={aiShowApiKey ? 'text' : 'password'}
                    name="ai_api_key_custom_vault"
                    id="ai_api_key_custom_vault"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={aiKeyInput}
                    onChange={(e) => setAiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-xs font-mono pr-10 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setAiShowApiKey(!aiShowApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {aiShowApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleFetchModels}
                  disabled={loadingModels}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-indigo-500/50 text-indigo-300 hover:text-white disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/10"
                >
                  {loadingModels ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Fetch Models</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Default Model
                </label>
                <select
                  value={aiModelInput}
                  onChange={(e) => setAiModelInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                >
                  <option value="">-- Pilih Model --</option>
                  {aiModelInput && !modelsList.includes(aiModelInput) && (
                    <option value={aiModelInput}>{aiModelInput}</option>
                  )}
                  {modelsList
                    .filter((m) => !m.includes('MAINTENANCE') && !m.includes('SOLD OUT') && !m.includes('SOLD'))
                    .map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Model yang dipilih akan digunakan oleh semua AI edge functions & code generation
                </p>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleSaveAiConfig}
                  disabled={aiSaving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/30"
                >
                  {aiSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Simpan Pengaturan AI</span>
                </button>
              </div>

              {/* AI Chat Testing Widget */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    🤖 Uji Integrasi KoboiLLM API (Testing Mode)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Kirimkan pesan uji coba untuk memastikan bahwa Base URL, API Key, dan Model yang Anda masukkan di atas terhubung dan merespons dengan benar.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Pesan / Prompt Uji Coba</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={testPrompt}
                        onChange={(e) => setTestPrompt(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isTestingAi) handleTestAiChat();
                        }}
                        placeholder="Hai, perkenalkan dirimu sebagai Asisten AI Kilat Tools"
                        className="flex-1 px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={handleTestAiChat}
                        disabled={isTestingAi}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 shrink-0"
                      >
                        {isTestingAi ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Mengirim...</span>
                          </>
                        ) : (
                          <>
                            <span>🚀 Kirim</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {testError && (
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-bold text-rose-200">Error:</span>
                        <div className="font-mono text-[11px] leading-relaxed break-all">{testError}</div>
                      </div>
                    </div>
                  )}

                  {testReply && (
                    <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/25 p-4 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          🤖 Respon AI KoboiLLM ({aiModelInput}):
                        </span>
                        {testLatency && (
                          <span className="text-[11px] text-amber-400 font-mono font-normal">
                            ⚡ {(testLatency / 1000).toFixed(2)}s ({testLatency}ms)
                          </span>
                        )}
                      </div>
                      <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-200">
                        {testReply}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================= MODAL: TAMBAH USER MANUAL ======================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-violet-400" />
                <span>Tambah Pengguna Manual (Langsung Aktif)</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-sm p-1">
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

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Pilih Paket Pengguna (Tier)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPackage('pro')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      newPackage === 'pro'
                        ? 'bg-purple-950/50 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">👑</span>
                    <span className="font-bold text-[11px] mt-1">Paket Pro</span>
                    <span className="text-[9px] text-slate-500">Akses Penuh</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPackage('basic')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      newPackage === 'basic'
                        ? 'bg-blue-950/50 border-blue-500 text-blue-200 ring-1 ring-blue-500'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">⚡</span>
                    <span className="font-bold text-[11px] mt-1">Paket Basic</span>
                    <span className="text-[9px] text-slate-500">Standar Aktif</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewPackage('free')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center transition-all ${
                      newPackage === 'free'
                        ? 'bg-slate-800 border-slate-500 text-slate-200 ring-1 ring-slate-400'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">🆓</span>
                    <span className="font-bold text-[11px] mt-1">Gratis</span>
                    <span className="text-[9px] text-slate-500">Belum Bayar</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.checked ? 'admin' : 'user')}
                    className="rounded border-slate-700 bg-slate-950 text-violet-600"
                  />
                  <span>Jadikan Administrator</span>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Atur / Suntik Kredit Pengguna</span>
              </h3>
              <button onClick={() => setShowCreditsModal(null)} className="text-slate-400 hover:text-white text-sm p-1">
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <div className="truncate">Target: <b className="text-white">@{showCreditsModal.username}</b> ({showCreditsModal.email})</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Saldo: {showCreditsModal.app_credits} App · {showCreditsModal.ai_credits.toLocaleString()} AI</div>
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
