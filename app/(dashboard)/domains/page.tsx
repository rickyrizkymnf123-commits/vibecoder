'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Globe,
  Plus,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  Server,
  Trash2,
  Crown,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { GeneratedApp, UserProfile } from '@/lib/types';

export default function CustomDomainsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [domainInputs, setDomainInputs] = useState<Record<string, string>>({});
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    fetchUserData();
    fetchApps();
  }, []);

  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  };

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPro = Boolean(user?.is_pro || user?.role === 'admin' || user?.username === 'demo');

  const handleInputChange = (appId: string, val: string) => {
    setDomainInputs((prev) => ({ ...prev, [appId]: val }));
  };

  const handleConnectDomain = async (appId: string) => {
    const domain = (domainInputs[appId] || '').trim();
    if (!domain) {
      alert('Masukkan nama domain terlebih dahulu (contoh: tokoku.com)');
      return;
    }

    if (!isPro) {
      alert('Fitur Custom Domain hanya tersedia untuk pengguna Pro Edition.');
      return;
    }

    setConnectingAppId(appId);
    setToastMessage(null);

    try {
      const res = await fetch('/api/deploy/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId,
          customDomain: domain
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.app) {
        setDomainInputs((prev) => ({ ...prev, [appId]: '' }));
        setToastMessage({
          type: 'success',
          text: `Domain ${data.app.custom_domain} berhasil dihubungkan! Silakan pasang 2 DNS record di bawah ini.`
        });
        await fetchApps();
      } else {
        setToastMessage({
          type: 'error',
          text: data.error || 'Gagal menambahkan custom domain'
        });
      }
    } catch (err) {
      console.error(err);
      setToastMessage({
        type: 'error',
        text: 'Terjadi kesalahan sistem saat menghubungi server'
      });
    } finally {
      setConnectingAppId(null);
    }
  };

  const handleVerifyDns = async (app: GeneratedApp) => {
    if (!app.custom_domain) return;
    setVerifyingAppId(app.id);
    setToastMessage(null);

    try {
      const res = await fetch(`/api/deploy/domain?appId=${app.id}&verify=true`);
      const data = await res.json();

      if (res.ok && data.verified) {
        setToastMessage({
          type: 'success',
          text: `Selamat! Domain ${app.custom_domain} telah terverifikasi aktif dan siap diakses dengan HTTPS.`
        });
      } else {
        setToastMessage({
          type: 'error',
          text: `DNS untuk ${app.custom_domain} belum terverifikasi penuh. Pastikan kedua record (TXT dan A) sudah terpasang di provider domain Anda. Propagasi biasanya memerlukan 1-15 menit.`
        });
      }
      await fetchApps();
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Gagal mengecek status verifikasi DNS'
      });
    } finally {
      setVerifyingAppId(null);
    }
  };

  const handleDeleteDomain = async (app: GeneratedApp) => {
    if (!app.custom_domain) return;
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus custom domain "${app.custom_domain}" dari aplikasi "${app.name}"?`
    );
    if (!confirmDelete) return;

    setDeletingAppId(app.id);
    setToastMessage(null);
    try {
      const res = await fetch('/api/deploy/domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({
          type: 'info',
          text: `Custom domain "${app.custom_domain}" berhasil dihapus.`
        });
        await fetchApps();
      } else {
        setToastMessage({
          type: 'error',
          text: data.error || 'Gagal menghapus custom domain'
        });
      }
    } catch {
      setToastMessage({
        type: 'error',
        text: 'Terjadi kesalahan saat menghapus custom domain'
      });
    } finally {
      setDeletingAppId(null);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedValue(id);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const username = user?.username || 'user';
  const publishedApps = apps.filter((a) => a.status === 'published' || a.status === 'deploying' || a.status === 'draft');

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
      {/* Back Link & Header */}
      <div className="space-y-2">
        <Link
          href="/c/new"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke chat</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Globe className="w-6 h-6 text-violet-400" /> Custom Domain
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Pasang domain milikmu sendiri ke salah satu app yang sudah kamu publish.
            </p>
          </div>
          {isPro ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold w-fit">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Pro Member</span>
            </div>
          ) : (
            <Link
              href="/pro"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all w-fit"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade ke Pro</span>
            </Link>
          )}
        </div>
      </div>

      {/* Pro Upsell Alert if Non-Pro */}
      {!isPro && !loading && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 shadow-xl space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Crown className="w-5 h-5" />
            <span>Fitur Khusus Pengguna Pro Edition</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Menghubungkan domain root kustom mandiri (seperti <strong>domainku.com</strong>) dengan verifikasi kepemilikan Vercel dan proteksi SSL otomatis hanya tersedia untuk pengguna <strong>Tier Pro</strong>.
          </p>
          <div className="pt-1">
            <Link
              href="/pro"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <span>Upgrade ke Pro Sekarang</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {toastMessage && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 animate-in fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
              : 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toastMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toastMessage.type === 'info' && <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
          <div className="flex-1 font-medium">{toastMessage.text}</div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* List of 1-Card per Published App */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
            <span>Memuat aplikasi...</span>
          </div>
        ) : publishedApps.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Belum ada aplikasi yang siap dihubungkan. Buat aplikasi baru terlebih dahulu.
            </p>
            <Link
              href="/c/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Aplikasi Baru</span>
            </Link>
          </div>
        ) : (
          publishedApps.map((app) => {
            const hasCustomDomain = Boolean(app.custom_domain);
            const isVerified = app.domain_status === 'verified';
            const isFailed = app.domain_status === 'failed';

            // DNS verification records
            const txtHost = app.domain_verification?.txt_name || app.txt_verification_name || '_vercel';
            const txtValue =
              app.domain_verification?.txt_value ||
              app.txt_verification_value ||
              `vc-domain-verify=${app.custom_domain}`;
            const aHost = app.domain_verification?.a_name || '@';
            const aValue = app.domain_verification?.a_value || '76.76.21.21';

            const defaultSubdomainUrl = `${username}.kilatstools.my.id/${app.slug}`;

            return (
              <div
                key={app.id}
                className="p-5 sm:p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4"
              >
                {/* Header Card: App Title & Subdomain URL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-white tracking-tight">{app.name}</h2>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                        NODE
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <span className="text-slate-500">URL Default:</span>
                      <a
                        href={`https://${defaultSubdomainUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-300 hover:underline inline-flex items-center gap-1"
                      >
                        <span>{defaultSubdomainUrl}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500" />
                      </a>
                    </div>
                  </div>

                  <a
                    href={hasCustomDomain && isVerified ? `https://${app.custom_domain}` : `https://${defaultSubdomainUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition-colors inline-flex items-center justify-center gap-1.5 border border-slate-700 w-fit"
                  >
                    <span>Buka Live</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>

                {/* State A: Belum Ada Custom Domain -> Input Field + Hubungkan */}
                {!hasCustomDomain && (
                  <div className="space-y-3 pt-1">
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="text"
                        value={domainInputs[app.id] || ''}
                        onChange={(e) => handleInputChange(app.id, e.target.value)}
                        placeholder="contoh: kalkulator.com atau tokoku.id"
                        disabled={!isPro || connectingAppId === app.id}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-colors disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => handleConnectDomain(app.id)}
                        disabled={connectingAppId === app.id || !isPro}
                        className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-violet-600/30 transition-all disabled:opacity-50 shrink-0"
                      >
                        {connectingAppId === app.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        <span>Hubungkan</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Masukkan domain root yang sudah Anda miliki (contoh: <code>kalkulator.com</code>).
                    </p>
                  </div>
                )}

                {/* State B: Sudah Ada Custom Domain -> Domain Bar, Status, dan 2 DNS Record Box */}
                {hasCustomDomain && (
                  <div className="space-y-4 pt-1">
                    {/* Domain Status Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {isVerified ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        ) : isFailed ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        )}

                        <a
                          href={`https://${app.custom_domain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sm font-bold text-white hover:underline flex items-center gap-1.5"
                        >
                          <span>{app.custom_domain}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>

                        {/* Status Badges */}
                        {isVerified ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Aktif &amp; Terverifikasi
                          </span>
                        ) : isFailed ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Verifikasi Gagal — Periksa Record
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Menunggu DNS (1-15 Menit)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyDns(app)}
                          disabled={verifyingAppId === app.id}
                          className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${verifyingAppId === app.id ? 'animate-spin' : ''}`} />
                          <span>{verifyingAppId === app.id ? 'Memeriksa...' : 'Cek Status'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDomain(app)}
                          disabled={deletingAppId === app.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {deletingAppId === app.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>

                    {/* 2 DNS Records Instruction Box (Directly in the same card) */}
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3.5">
                      <div className="text-xs text-slate-300 leading-relaxed">
                        Arahkan 2 DNS Record berikut di panel registrar domain Anda (Dewaweb, Niagahoster, DomaiNesia, Cloudflare, dll):
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {/* Record 1: TXT Verification */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-violet-500/30 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-violet-300 font-sans">
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 text-violet-400" /> Record 1: Bukti Kepemilikan
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-violet-950 text-violet-400 border border-violet-800 text-[9px]">
                              TXT
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px]">
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-sans block">Host / Nama:</span>
                              <span className="text-white font-bold">{txtHost}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-sans block">Target / Value:</span>
                              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-indigo-300 break-all flex items-center justify-between gap-1.5 mt-0.5">
                                <span className="truncate text-[10px]">{txtValue}</span>
                                <button
                                  type="button"
                                  onClick={() => copyText(txtValue, `txt-${app.id}`)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white shrink-0 flex items-center gap-1 text-[10px] font-sans"
                                >
                                  {copiedValue === `txt-${app.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Salin</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Record 2: A Record Routing */}
                        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-300 font-sans">
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-emerald-400" /> Record 2: Arahkan Trafik
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px]">
                              A
                            </span>
                          </div>

                          <div className="space-y-1.5 text-[11px]">
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-sans block">Host / Nama:</span>
                              <span className="text-white font-bold">{aHost}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-sans block">Target IP:</span>
                              <div className="p-2 rounded bg-slate-950 border border-slate-800 text-emerald-300 flex items-center justify-between gap-1.5 mt-0.5">
                                <span className="font-bold text-[11px]">{aValue}</span>
                                <button
                                  type="button"
                                  onClick={() => copyText(aValue, `a-${app.id}`)}
                                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white shrink-0 flex items-center gap-1 text-[10px] font-sans"
                                >
                                  {copiedValue === `a-${app.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                  <span>Salin</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                        💡 <strong>Catatan:</strong> <strong>TXT record</strong> memverifikasi kepemilikan Anda secara aman di Vercel, sedangkan <strong>A record</strong> mengarahkan trafik pengunjung ke aplikasi. Sertifikat SSL/HTTPS otomatis terbit setelah verifikasi selesai.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}


