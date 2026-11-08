'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Plus,
  Globe,
  Coins,
  Cpu,
  FolderOpen,
  Settings,
  LogOut,
  Layers,
  Crown,
  ExternalLink,
  Menu,
  X,
  Trash2,
  Mail,
  Star,
  Zap,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Eye
} from 'lucide-react';
import { UserProfile, ChatSession, GeneratedApp } from '@/lib/types';
import { KilatLogo } from '@/components/KilatLogo';
import { ProUpgradeModal } from '@/components/ProUpgradeModal';

function formatRelativeTime(dateStr?: string) {
  if (!dateStr) return '';
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = Math.max(0, now.getTime() - created.getTime());
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}j`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay}h`;
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [latestApp, setLatestApp] = useState<{ id?: string; name: string; slug: string } | null>(null);
  const [userApps, setUserApps] = useState<GeneratedApp[]>([]);
  const [showAppChooserModal, setShowAppChooserModal] = useState(false);
  const [confirmDeleteAppId, setConfirmDeleteAppId] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [appDeleteToast, setAppDeleteToast] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchLatestApp = async () => {
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        if (data.apps && data.apps.length > 0) {
          setUserApps(data.apps);
          setLatestApp(data.apps[0]);
        } else {
          setUserApps([]);
          setLatestApp(null);
        }
      }
    } catch {}
  };

  const handleDeleteAppFromModal = async (appId: string) => {
    if (confirmDeleteAppId !== appId) {
      setConfirmDeleteAppId(appId);
      setTimeout(() => {
        setConfirmDeleteAppId((prev) => (prev === appId ? null : prev));
      }, 4000);
      return;
    }

    setDeletingAppId(appId);
    try {
      const res = await fetch(`/api/apps?id=${appId}`, { method: 'DELETE' });
      if (res.ok) {
        setUserApps((prev) => {
          const next = prev.filter((a) => a.id !== appId);
          if (latestApp?.id === appId) {
            setLatestApp(next.length > 0 ? next[0] : null);
          }
          return next;
        });
        setConfirmDeleteAppId(null);
        setAppDeleteToast('Aplikasi berhasil dihapus');
        setTimeout(() => setAppDeleteToast(null), 3000);
        window.dispatchEvent(new CustomEvent('forge:app-deleted', { detail: { appId } }));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus aplikasi');
      }
    } catch (err) {
      console.error('Failed to delete app:', err);
      alert('Terjadi kesalahan saat menghapus aplikasi');
    } finally {
      setDeletingAppId(null);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchSessions();
    fetchLatestApp();
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleAppPublished = (e: any) => {
      if (e.detail?.app) {
        setLatestApp(e.detail.app);
        fetchLatestApp();
      }
    };
    const handleAppDeleted = (e: any) => {
      fetchLatestApp();
    };
    window.addEventListener('forge:app-published', handleAppPublished);
    window.addEventListener('forge:app-deleted', handleAppDeleted);
    return () => {
      window.removeEventListener('forge:app-published', handleAppPublished);
      window.removeEventListener('forge:app-deleted', handleAppDeleted);
    };
  }, []);

  useEffect(() => {
    const handleStatus = (e: any) => {
      if (typeof e.detail?.isBuilding === 'boolean') {
        setIsBuilding(e.detail.isBuilding);
      }
    };
    window.addEventListener('forge:building-status', handleStatus);
    return () => window.removeEventListener('forge:building-status', handleStatus);
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        }
      } else if (res.status === 401) {
        setUser((prev) => {
          if (!prev) router.push('/login');
          return prev;
        });
      }
    } catch {
      // Retain existing session on transient network lag
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/chat/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const createNewSession = async () => {
    try {
      const res = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Aplikasi Baru' })
      });
      if (res.ok) {
        const data = await res.json();
        setMobileMenuOpen(false);
        router.push(`/c/${data.session.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (pathname === `/c/${sessionId}`) {
          router.push('/c/new');
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const deleteAllSessions = async () => {
    if (!isConfirmingDeleteAll) {
      setIsConfirmingDeleteAll(true);
      setTimeout(() => setIsConfirmingDeleteAll(false), 4000);
      return;
    }

    try {
      const res = await fetch('/api/chat/sessions?all=true', {
        method: 'DELETE'
      });
      if (res.ok) {
        setSessions([]);
        setIsConfirmingDeleteAll(false);
        window.location.href = '/c/new';
      }
    } catch (err) {
      console.error('Failed to clear sessions:', err);
    }
  };

  const handleExitImpersonation = async () => {
    try {
      await fetch('/api/auth/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exit: true })
      });
      window.location.href = '/admin';
    } catch (err) {
      console.error('Failed to exit impersonation mode:', err);
      window.location.href = '/admin';
    }
  };

  // Determine current active title for top navbar
  const getCurrentTitle = () => {
    if (pathname.startsWith('/c/')) {
      if (pathname === '/c/new') return 'Sesi baru';
      const currentSessionId = pathname.replace('/c/', '');
      const s = sessions.find((item) => item.id === currentSessionId);
      return s ? s.title : 'Sesi baru';
    }
    if (pathname === '/domains') return 'Custom Domain';
    if (pathname === '/pro') return 'Fitur Pro';
    if (pathname === '/admin') return 'Superadmin Panel';
    if (pathname === '/billing') return 'Top-Up & Billing';
    if (pathname === '/apps') return 'Aplikasi Ter-publish';
    if (pathname === '/storage') return 'Storage Pribadi';
    if (pathname === '/account') return 'Akun & Mutasi';
    return 'Kilat Tools';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-slate-400 text-sm">
        <Zap className="w-5 h-5 text-amber-400 fill-amber-400 animate-lightning mr-2" />
        Memuat dasbor Kilat Tools...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col overflow-hidden h-[100dvh]">
      {/* Impersonation Warning Banner (Mode Intip) */}
      {user?.is_impersonating && (
        <div className="bg-gradient-to-r from-amber-600 via-indigo-600 to-purple-700 text-white px-3 sm:px-6 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xl shrink-0 z-[100] border-b border-white/20">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <Eye className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
            <span>
              <strong>Mode Intip Aktif:</strong> Anda sedang melihat &amp; mencoba dashboard sebagai{' '}
              <span className="bg-black/40 px-2 py-0.5 rounded font-mono text-amber-300 border border-white/10">
                @{user.username} ({user.email})
              </span>{' '}
              <span className="text-xs font-normal opacity-90">
                ({user.is_pro ? '⭐ Akun Pro' : '🆓 Akun Gratis'})
              </span>
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="h-7 sm:h-8 px-3 text-xs font-black gap-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shrink-0 ml-2 rounded-lg border border-amber-300 cursor-pointer flex items-center active:scale-95 transition-all"
          >
            ← Kembali ke Mode Admin
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
        {/* Mobile Top App Bar */}
        <header className="md:hidden flex items-center justify-between px-3 py-2 bg-slate-950/95 border-b border-slate-800/80 shrink-0 z-30 gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all shrink-0"
              aria-label="Buka Menu Navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/" className="flex items-center shrink-0">
              <KilatLogo size="sm" showText={true} />
            </Link>
          </div>

          {/* Top Mobile Actions: Live Chooser + Status + Settings + Logout */}
          <div className="flex items-center gap-1.5 shrink-0">
            {userApps.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAppChooserModal(true)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-[11px] font-mono text-emerald-400 whitespace-nowrap shrink-0 active:scale-95 transition-all shadow-sm"
                title="Pilih dan Buka Aplikasi Live Anda"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Live ({userApps.length})</span>
              </button>
            )}

            {/* Live Engine Status Pill */}
            <div className="shrink-0">
              {isBuilding ? (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Bekerja</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Idle</span>
                </span>
              )}
            </div>

            <Link
              href="/account"
              title="Pengaturan Akun"
              className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center shrink-0 ${
                pathname === '/account'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-500/10 hover:text-rose-300 border border-slate-800 text-slate-400 text-xs transition-colors flex items-center shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Mobile Dedicated Full-Width Navigation Strip (100% Fitur Desktop di Mobile, Symmetrical & Zero Cut-Off) */}
        <div
          className={`md:hidden grid ${
            user?.role === 'admin' || user?.username === 'demo' || Boolean(user?.original_admin)
              ? 'grid-cols-5'
              : 'grid-cols-4'
          } gap-1 p-1.5 bg-slate-950/95 border-b border-slate-800/80 shrink-0 z-20 select-none text-center`}
        >
          {/* 1. Combined Resource Capsule */}
          <Link
            href="/billing"
            className="flex flex-col items-center justify-center py-1 px-0.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-amber-300 transition-colors"
            title="Kredit Slot Aplikasi & Token AI"
          >
            <div className="flex items-center gap-0.5 text-[10px] font-bold">
              <span>📁 {user?.app_credits ?? 0}</span>
            </div>
            <div className="text-[9px] text-yellow-400 font-medium truncate max-w-full">
              ⚡ {user?.ai_credits ? (user.ai_credits >= 1000000 ? (user.ai_credits / 1000000).toFixed(1) + 'M' : Math.round(user.ai_credits / 1000) + 'k') : '0k'}
            </div>
          </Link>

          {/* 2. Aplikasi */}
          <Link
            href="/apps"
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl border text-[10px] font-semibold transition-all ${
              pathname === '/apps'
                ? 'bg-violet-600/25 text-violet-200 border-violet-500/50 shadow-sm shadow-violet-600/20'
                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white active:bg-slate-800'
            }`}
            title="Kelola & Hapus Aplikasi Saya"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span className="mt-0.5">Aplikasi</span>
          </Link>

          {/* 3. Domain */}
          <Link
            href="/domains"
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl border text-[10px] font-semibold transition-all ${
              pathname === '/domains'
                ? 'bg-indigo-600/25 text-indigo-200 border-indigo-500/50 shadow-sm shadow-indigo-600/20'
                : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:text-white active:bg-slate-800'
            }`}
            title="Kelola Custom Domain Toko"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="mt-0.5">Domain</span>
          </Link>

          {/* 4. Pro */}
          <Link
            href="/pro"
            className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl border text-[10px] font-semibold transition-all ${
              pathname === '/pro'
                ? 'bg-amber-500/25 text-amber-200 border-amber-500/50 shadow-sm shadow-amber-500/20'
                : 'bg-slate-900/70 border-slate-800 text-amber-400 hover:text-amber-300 active:bg-slate-800'
            }`}
            title="Paket Pro"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="mt-0.5">Pro</span>
          </Link>

          {/* 5. Admin (Only rendered if admin) */}
          {(user?.role === 'admin' || user?.username === 'demo' || Boolean(user?.original_admin)) && (
            <Link
              href="/admin"
              className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl border text-[10px] font-bold transition-all ${
                pathname === '/admin'
                  ? 'bg-purple-600/35 text-purple-200 border-purple-500/60 shadow-sm shadow-purple-600/20'
                  : 'bg-slate-900/70 border-slate-800 text-purple-300 hover:text-purple-200 active:bg-slate-800'
              }`}
              title="Superadmin Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span className="mt-0.5">Admin</span>
            </Link>
          )}
        </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 md:hidden transition-opacity animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (Permanent on Desktop md+, Smooth Sliding Drawer on Mobile) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-950/95 md:bg-slate-950/80 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-[100dvh] select-none transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-black/80' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top brand & Credit Balances */}
        <div className="p-4 border-b border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center group">
              <KilatLogo size="md" />
            </Link>

            <div className="flex items-center gap-2">
              {user?.is_pro && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-fuchsia-500/20 text-amber-300 border border-amber-500/30">
                  <Crown className="w-3 h-3 text-amber-400" /> Pro
                </span>
              )}
              {/* Close Button on Mobile Drawer */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 active:scale-95 transition-all"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clean soft card with purple '+' new chat button */}
          <button
            onClick={createNewSession}
            className="w-full py-2.5 px-3.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-200 font-semibold text-xs transition-all flex items-center justify-between group shadow-sm active:scale-[0.98]"
          >
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-violet-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-sm shadow-violet-600/30">
                <Plus className="w-3.5 h-3.5" />
              </span>
              <span>Buat Chat Baru</span>
            </span>
            <span className="text-[10px] font-mono text-violet-400/80 bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/60">
              +
            </span>
          </button>

          {/* Quick Nav to Apps Manager */}
          <Link
            href="/apps"
            className={`mt-2 w-full py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
              pathname === '/apps'
                ? 'bg-violet-600/25 text-violet-200 border-violet-500/40 shadow-sm'
                : 'bg-slate-900/40 hover:bg-slate-900/80 border-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Aplikasi Saya</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {userApps.length}
            </span>
          </Link>
        </div>

        {/* Sessions List (SESI - Clean VibeCoder Style) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2 flex items-center justify-between">
              <span>SESI</span>
              {sessions.length > 0 && (
                <button
                  onClick={deleteAllSessions}
                  className={`text-[10px] transition-all px-2 py-0.5 rounded font-medium ${
                    isConfirmingDeleteAll
                      ? 'bg-rose-600 text-white font-bold animate-pulse'
                      : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                  }`}
                  title={isConfirmingDeleteAll ? 'Klik sekali lagi untuk konfirmasi hapus' : 'Hapus semua riwayat sesi'}
                >
                  {isConfirmingDeleteAll ? 'yakin hapus semua?' : 'hapus semua'}
                </button>
              )}
            </div>
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-slate-400 italic">Belum ada sesi proyek</div>
              ) : (
                sessions.map((s) => {
                  const isActive = pathname === `/c/${s.id}`;
                  const relTime = formatRelativeTime(s.created_at);
                  return (
                    <Link
                      key={s.id}
                      href={`/c/${s.id}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors group ${
                        isActive
                          ? 'bg-slate-900 text-white border border-slate-700 font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            s.status === 'deployed'
                              ? 'bg-emerald-400 shadow-sm shadow-emerald-500/40'
                              : s.status === 'building'
                              ? 'bg-amber-400 animate-pulse'
                              : 'bg-slate-500'
                          }`}
                        />
                        <span className="truncate">{s.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {relTime && (
                          <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400">
                            {relTime}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteSession(s.id);
                          }}
                          title="Hapus sesi"
                          className="opacity-75 md:opacity-0 md:group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all active:scale-95"
                          aria-label={`Hapus sesi ${s.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Support & User Profile */}
        <div className="border-t border-slate-800/80 bg-slate-950/40 divide-y divide-slate-800/60">
          {/* Help & Support Footer */}
          <div className="px-4 py-2 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">
              Butuh bantuan? Email ke:{' '}
              <a href="mailto:cs@kilatstools.my.id" className="text-violet-400 hover:underline">
                cs@kilatstools.my.id
              </a>
            </span>
          </div>

          {/* User Profile & Logout */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="truncate mr-2">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                <span>{user?.username}</span>
                {user?.is_pro && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    PRO
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area (100dvh safe) */}
      <main className="flex-1 h-[calc(100dvh-95px)] md:h-[100dvh] overflow-hidden bg-[#0b0f19] flex flex-col">
        {/* Top Navbar Header (Modern, Sleek, Spacious VibeCoder Layout) */}
        <header className="hidden md:flex px-4 sm:px-6 py-2.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md items-center justify-between gap-3 shrink-0 z-20">
          {/* Left: Active Session Title */}
          <div className="flex items-center gap-2.5 truncate min-w-0 max-w-[220px] sm:max-w-xs">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight truncate">
              {getCurrentTitle()}
            </h1>
          </div>

          {/* Center: Clean Sleek Subdomain Link (1:1 with VibeCoder Design) */}
          <div className="hidden md:flex items-center">
            <button
              type="button"
              onClick={() => setShowAppChooserModal(true)}
              title="Pilih dan Buka Aplikasi Live Anda"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all group font-mono text-xs cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              <span className="text-slate-300 group-hover:text-amber-300 transition-colors font-medium">
                {user?.subdomain || user?.username || 'demo'}.kilatstools.my.id
              </span>
              {userApps.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-sans font-bold tracking-wider ml-1">
                  LIVE ({userApps.length})
                </span>
              )}
            </button>
          </div>

          {/* Right: Resources, Tools & Account Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto md:ml-0 text-xs font-medium shrink-0">
            {/* Mobile Link */}
            <button
              type="button"
              onClick={() => setShowAppChooserModal(true)}
              className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200"
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>Live ({userApps.length})</span>
            </button>

            {/* Combined Resource Capsule */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-0.5 shadow-inner">
              <Link
                href="/billing"
                title="Kredit Slot Aplikasi"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-amber-300 text-[11px] font-semibold transition-colors"
              >
                <span>🗂</span>
                <span className="text-slate-400 font-normal">App:</span>
                <span>{user?.app_credits ?? 0}</span>
              </Link>
              <div className="w-[1px] h-3.5 bg-slate-800" />
              <Link
                href="/billing"
                title="Kredit Token AI"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-yellow-300 text-[11px] font-semibold transition-colors"
              >
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-slate-400 font-normal">AI:</span>
                <span>{user?.ai_credits ? Math.round(user.ai_credits / 1000) : 0}k</span>
              </Link>
            </div>

            {/* Navigation Buttons (Hidden on mobile, accessible via sidebar drawer) */}
            <Link
              href="/apps"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                pathname === '/apps'
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 font-semibold'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Kelola & Hapus Aplikasi Saya"
            >
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              <span>Aplikasi</span>
            </Link>

            <Link
              href="/domains"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                pathname === '/domains'
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40 font-semibold'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
              }`}
              title="Kelola Custom Domain Toko"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>Domain</span>
            </Link>

            <Link
              href="/pro"
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                pathname === '/pro'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-amber-400'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Pro</span>
            </Link>

            {(user?.role === 'admin' || user?.username === 'demo' || Boolean(user?.original_admin)) && (
              <Link
                href="/admin"
                className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                  pathname === '/admin'
                    ? 'bg-violet-600/30 text-violet-300 border-violet-500/50 font-bold shadow-sm shadow-violet-600/20'
                    : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-violet-300 hover:text-violet-200'
                }`}
                title="Superadmin Funnel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span>Admin</span>
              </Link>
            )}

            {/* Live Status Badge */}
            <div className="hidden sm:flex items-center">
              {isBuilding ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>Bekerja...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Idle</span>
                </span>
              )}
            </div>

            {/* User Quick Actions */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <Link
                href="/account"
                title="Pengaturan Akun & Mutasi"
                className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-[11px] transition-colors flex items-center gap-1.5 ${
                  pathname === '/account'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline">Pengaturan</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Keluar dari akun"
                className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-slate-900/70 hover:bg-rose-500/10 hover:text-rose-300 border border-slate-800 text-slate-400 text-[11px] transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {user && user.is_paid === false && user.role !== 'admin' ? (
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
              <div className="max-w-3xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 text-center">
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-violet-600 flex items-center justify-center mx-auto shadow-lg shadow-violet-500/20">
                    <Zap className="w-7 h-7 text-slate-950 fill-slate-950" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Aktifkan Akun Kilat Tools Anda
                  </h2>
                  <p className="text-sm text-slate-400 max-w-lg mx-auto">
                    Pilih paket aktivasi untuk langsung mulai membangun aplikasi web pertama Anda lewat chat AI.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  {/* Basic Card */}
                  <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-violet-500/40 transition-all flex flex-col justify-between space-y-5">
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Paket Basic</div>
                      <div className="text-2xl font-extrabold text-white">Rp 110.000 <span className="text-xs text-slate-400 font-normal">/ 1 app</span></div>
                      <ul className="space-y-2 text-xs text-slate-300 pt-2">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> 1 Aplikasi web siap publish
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> Revisi gratis — 50.000 Kredit AI
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> Subdomain &amp; hosting SSL gratis selamanya
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> SQLite database &amp; CDN super cepat
                        </li>
                      </ul>
                    </div>
                    <Link
                      href="/billing"
                      className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs text-center transition-all shadow-md shadow-violet-600/30"
                    >
                      Beli Paket Basic (Rp 110k)
                    </Link>
                  </div>

                  {/* Pro Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-slate-950/90 border border-purple-500/40 hover:border-purple-400 transition-all flex flex-col justify-between space-y-5 relative">
                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                      ⭐ PALING POPULER
                    </div>
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-amber-300">Paket Pro</div>
                      <div className="text-2xl font-extrabold text-white">Rp 210.000 <span className="text-xs text-slate-400 font-normal">/ 1 app + pro</span></div>
                      <ul className="space-y-2 text-xs text-slate-300 pt-2">
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> 1 Aplikasi web siap publish
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-amber-300 font-bold">✓</span> <b>100.000 Token AI</b> (+50k ekstra)
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">✓</span> <b>Download Source Code (.ZIP)</b>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">✓</span> <b>Export Database (SQL/CSV)</b>
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-violet-400 font-bold">✓</span> <b>Push GitHub &amp; Storage 10 GB</b>
                        </li>
                      </ul>
                    </div>
                    <Link
                      href="/billing"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 hover:opacity-90 text-white font-bold text-xs text-center transition-all shadow-md shadow-amber-500/20"
                    >
                      Beli Paket Pro (Rp 210k)
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </div>

        {/* First-Login Pro Upgrade Modal for Basic Users */}
        <ProUpgradeModal user={user} onSuccess={fetchUserData} />

        {/* ========================================================================= */}
        {/* MODAL PEMILIH APLIKASI (Ala VibeCoder: "Mau cek aplikasi yang mana?") */}
        {/* ========================================================================= */}
        {showAppChooserModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl space-y-4">
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      Mau Cek Aplikasi yang Mana?
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Domain: <span className="text-amber-400 font-semibold">{user?.subdomain || user?.username || 'demo'}.kilatstools.my.id</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAppChooserModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Delete Toast Notification */}
              {appDeleteToast && (
                <div className="mx-4 sm:mx-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{appDeleteToast}</span>
                </div>
              )}

              {/* App List Container */}
              <div className="p-4 sm:p-5 max-h-[420px] overflow-y-auto space-y-2.5 scrollbar-thin scrollbar-thumb-slate-800">
                {userApps.length === 0 ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <div className="text-xs text-slate-400">
                      Belum ada aplikasi yang diterbitkan di akun ini.
                    </div>
                    <button
                      onClick={() => {
                        setShowAppChooserModal(false);
                        createNewSession();
                      }}
                      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20"
                    >
                      + Buat Aplikasi Pertama Anda
                    </button>
                  </div>
                ) : (
                  userApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-100 group-hover:text-violet-300 transition-colors truncate">
                            {app.name}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 shrink-0">
                            LIVE
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 truncate">
                          URL: <span className="text-indigo-300">{user?.subdomain || user?.username || 'app'}.kilatstools.my.id/{app.slug}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <a
                          href={app.custom_domain ? `https://${app.custom_domain}` : `https://${user?.subdomain || user?.username || 'demo'}.kilatstools.my.id/${app.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => setShowAppChooserModal(false)}
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <span>Buka</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        {app.session_id && (
                          <Link
                            href={`/c/${app.session_id}`}
                            onClick={() => setShowAppChooserModal(false)}
                            className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center justify-center gap-1 border border-slate-700"
                          >
                            <span>Studio</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAppFromModal(app.id)}
                          disabled={deletingAppId === app.id}
                          title="Hapus aplikasi ini"
                          className={`flex-1 sm:flex-none px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all ${
                            confirmDeleteAppId === app.id
                              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                              : 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60'
                          }`}
                        >
                          {deletingAppId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>{confirmDeleteAppId === app.id ? 'Yakin Hapus?' : 'Hapus'}</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Link
                    href="/apps"
                    onClick={() => setShowAppChooserModal(false)}
                    className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5 text-violet-400" />
                    <span>Kelola Semua Aplikasi</span>
                  </Link>
                  <span className="text-slate-700">•</span>
                  <Link
                    href="/domains"
                    onClick={() => setShowAppChooserModal(false)}
                    className="text-violet-400 hover:text-violet-300 font-medium transition-colors flex items-center gap-1"
                  >
                    <span>🌐 Custom Domain</span>
                  </Link>
                </div>
                <button
                  onClick={() => setShowAppChooserModal(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
