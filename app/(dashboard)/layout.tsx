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
  ShieldCheck
} from 'lucide-react';
import { UserProfile, ChatSession } from '@/lib/types';
import { KilatLogo } from '@/components/KilatLogo';

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
  const pathname = usePathname();
  const router = useRouter();

  const fetchLatestApp = async () => {
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        if (data.apps && data.apps.length > 0) {
          setLatestApp(data.apps[0]);
        }
      }
    } catch {}
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
      }
    };
    window.addEventListener('forge:app-published', handleAppPublished);
    return () => window.removeEventListener('forge:app-published', handleAppPublished);
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
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col md:flex-row overflow-hidden h-[100dvh]">
      {/* Mobile Top App Bar (Visible on mobile only) */}
      <header className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border-b border-slate-800/80 shrink-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white active:scale-95 transition-all"
            aria-label="Buka Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center">
            <KilatLogo size="sm" />
          </Link>
        </div>

        {/* Compact Credit Pills for Mobile Viewport */}
        <div className="flex items-center gap-1.5">
          <Link
            href="/billing"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-amber-300"
          >
            <Coins className="w-3 h-3 text-amber-400" />
            <span>{user?.app_credits ?? 0}</span>
          </Link>
          <Link
            href="/billing"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-amber-300"
          >
            <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{user?.ai_credits ? Math.round(user.ai_credits / 1000) : 0}k</span>
          </Link>
          {user?.is_pro && (
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Pro
            </span>
          )}
        </div>
      </header>

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
              <a href="mailto:cs@forge.dev" className="text-violet-400 hover:underline">
                cs@forge.dev
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
      <main className="flex-1 h-[calc(100dvh-53px)] md:h-[100dvh] overflow-hidden bg-[#0b0f19] flex flex-col">
        {/* Top Navbar Header (Balanced Spacious Layout: Left Title, Center Live App & Credits, Right Tools) */}
        <header className="px-6 sm:px-8 py-3 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-20">
          {/* Left: Active Session Title (No Duplicate Logo here) */}
          <div className="flex items-center gap-2.5 truncate min-w-0 max-w-[200px] sm:max-w-xs">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <h1 className="text-xs sm:text-sm font-semibold text-slate-200 tracking-tight truncate">
              {getCurrentTitle()}
            </h1>
          </div>

          {/* Center: Live App Preview & Resource Badges (Prominently in the middle) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Live App Preview Pill */}
            <a
              href={latestApp ? `/preview/${latestApp.slug}` : `/preview/gudangku-inventori-stok`}
              target="_blank"
              rel="noreferrer"
              title={latestApp ? `Buka Live Preview: ${latestApp.name}` : 'Buka Live Preview Aplikasi'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 text-slate-200 hover:text-white transition-all shadow-sm group font-mono text-[11px]"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold text-slate-200 group-hover:text-amber-300">
                {latestApp ? `${latestApp.slug}.kilattools.dev` : `${user?.subdomain || 'demo'}.kilattools.dev`}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-sans uppercase font-bold tracking-wider">
                LIVE APP
              </span>
            </a>

            {/* Combined Resource Badges */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800/80 rounded-xl p-0.5 shadow-inner">
              <Link
                href="/billing"
                title="Kredit Slot Aplikasi"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-amber-300 text-[11px] font-semibold transition-colors"
              >
                <span>🗂</span>
                <span className="text-slate-400 font-normal">App:</span>
                <span>{user?.app_credits ?? 0}</span>
              </Link>
              <div className="w-[1px] h-3.5 bg-slate-800" />
              <Link
                href="/billing"
                title="Kredit Token AI"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-yellow-300 text-[11px] font-semibold transition-colors"
              >
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="text-slate-400 font-normal">AI:</span>
                <span>{user?.ai_credits ? Math.round(user.ai_credits / 1000) : 0}k</span>
              </Link>
            </div>
          </div>

          {/* Right: Quick Nav & Actions (Comfortably spaced on the right) */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto md:ml-0 text-xs font-medium shrink-0">
            {/* Mobile Fallback for App Pill */}
            <a
              href={latestApp ? `/preview/${latestApp.slug}` : `/preview/gudangku-inventori-stok`}
              target="_blank"
              rel="noreferrer"
              className="md:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Live App</span>
            </a>

            <Link
              href="/domains"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                pathname === '/domains'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
            >
              <span>🌐</span>
              <span className="hidden sm:inline">Domain</span>
            </Link>

            <Link
              href="/pro"
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                pathname === '/pro'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-amber-400'
              }`}
            >
              <Crown className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Pro</span>
            </Link>

            {(user?.role === 'admin' || user?.username === 'demo') && (
              <Link
                href="/admin"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors ${
                  pathname === '/admin'
                    ? 'bg-violet-600/30 text-violet-300 border-violet-500/50 font-bold shadow-sm shadow-violet-600/20'
                    : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-violet-300 hover:text-violet-200'
                }`}
                title="Superadmin Funnel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Status */}
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

            {/* Group 4: Account Actions with Divider */}
            <div className="flex items-center gap-1.5 pl-2.5 border-l border-slate-800">
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
                <span className="hidden md:inline">Pengaturan</span>
              </Link>

              <button
                onClick={handleLogout}
                title="Keluar dari akun"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/70 hover:bg-rose-500/10 hover:text-rose-300 border border-slate-800 text-slate-400 text-[11px] transition-colors flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Keluar</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Inner Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
}
