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
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { GeneratedApp, UserProfile } from '@/lib/types';

export default function CustomDomainsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [verifyingAppId, setVerifyingAppId] = useState<string | null>(null);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

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
        const appList: GeneratedApp[] = data.apps || [];
        setApps(appList);
        if (appList.length > 0 && !selectedAppId) {
          setSelectedAppId(appList[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPro = Boolean(user?.is_pro || user?.role === 'admin' || user?.username === 'demo');

  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !domainInput) return;
    if (!isPro) {
      alert('Fitur Custom Domain hanya tersedia untuk pengguna Pro Edition.');
      return;
    }

    setAssigning(true);
    setVerifyMessage(null);

    try {
      const res = await fetch('/api/deploy/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: selectedAppId,
          customDomain: domainInput
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDomainInput('');
        setVerifyMessage({
          type: 'info',
          text: `Domain ${data.app?.custom_domain || domainInput} berhasil ditambahkan! Silakan pasang 2 DNS record di bawah.`
        });
        await fetchApps();
      } else {
        alert(data.error || 'Gagal menambahkan domain');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan sistem');
    } finally {
      setAssigning(false);
    }
  };

  const handleVerifyDns = async (app: GeneratedApp) => {
    if (!app.custom_domain) return;
    setVerifyingAppId(app.id);
    setVerifyMessage(null);

    try {
      const res = await fetch(`/api/deploy/domain?appId=${app.id}&verify=true`);
      const data = await res.json();

      if (res.ok && data.verified) {
        setVerifyMessage({
          type: 'success',
          text: `Selamat! Domain ${app.custom_domain} telah terverifikasi aktif dan siap diakses dengan SSL.`
        });
      } else {
        setVerifyMessage({
          type: 'error',
          text: `Verifikasi belum berhasil. Pastikan kedua DNS Record (TXT _vercel & A @ 76.76.21.21) sudah terpasang dengan benar di provider domain Anda. Propagasi DNS dapat membutuhkan waktu 1-15 menit.`
        });
      }
      await fetchApps();
    } catch {
      alert('Gagal mengecek status verifikasi DNS');
    } finally {
      setVerifyingAppId(null);
    }
  };

  const handleDeleteDomain = async (app: GeneratedApp) => {
    if (!app.custom_domain) return;
    const confirmDelete = window.confirm(
      `Yakin ingin memutuskan custom domain "${app.custom_domain}" dari aplikasi "${app.name}"?`
    );
    if (!confirmDelete) return;

    setDeletingAppId(app.id);
    setVerifyMessage(null);
    try {
      const res = await fetch('/api/deploy/domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVerifyMessage({
          type: 'info',
          text: `Custom domain "${app.custom_domain}" berhasil diputuskan.`
        });
        await fetchApps();
      } else {
        alert(data.error || 'Gagal menghapus custom domain');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus custom domain');
    } finally {
      setDeletingAppId(null);
    }
  };

  const copyText = (txt: string, id: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedValue(id);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  const selectedApp = apps.find((a) => a.id === selectedAppId);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Back Link & Header */}
      <div className="space-y-3">
        <Link
          href="/c/new"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke chat</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-violet-400" /> Custom Domain (Pro)
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Hubungkan domain milik Anda sendiri (contoh: <code>tokoku.com</code>) ke aplikasi dengan verifikasi 2-tahap Vercel Edge.
            </p>
          </div>
          {isPro ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-violet-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold w-fit">
              <Crown className="w-4 h-4 text-amber-400" />
              <span>Pro Member Aktif</span>
            </div>
          ) : (
            <Link
              href="/pro"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade ke Pro</span>
            </Link>
          )}
        </div>
      </div>

      {/* Pro Upsell Alert if Non-Pro */}
      {!isPro && !loading && (
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-slate-900 border border-amber-500/30 shadow-2xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Crown className="w-5 h-5" />
            <span>Fitur Khusus Pengguna Pro Edition</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Menghubungkan domain kustom mandiri (seperti <strong>domainku.com</strong> atau <strong>kasir.id</strong>) dengan verifikasi TXT challenge dan proteksi SSL otomatis hanya tersedia untuk pengguna <strong>Tier Pro</strong>.
          </p>
          <div className="pt-2">
            <Link
              href="/pro"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <span>Buka Halaman Langganan Pro & Top-Up</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>
      )}

      {/* Notification Toast/Message */}
      {verifyMessage && (
        <div
          className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start gap-3 animate-in fade-in ${
            verifyMessage.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200'
              : verifyMessage.type === 'error'
              ? 'bg-rose-950/50 border-rose-500/40 text-rose-200'
              : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
          }`}
        >
          {verifyMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {verifyMessage.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {verifyMessage.type === 'info' && <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />}
          <div className="flex-1 font-medium">{verifyMessage.text}</div>
          <button
            onClick={() => setVerifyMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Section 1: Daftar Aplikasi & Pemilihan Target */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Aplikasi Anda (Granularitas 1 Domain = 1 App)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih aplikasi yang ingin Anda hubungkan atau kelola custom domain-nya.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            {apps.length} Aplikasi
          </span>
        </div>

        {apps.length === 0 && !loading ? (
          <div className="text-xs text-slate-400 py-6 text-center space-y-2">
            <p>Belum ada aplikasi yang diterbitkan (published).</p>
            <Link
              href="/c/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs"
            >
              <span>Buat Aplikasi Baru Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apps.map((app) => {
              const isSelected = selectedAppId === app.id;
              const hasDomain = Boolean(app.custom_domain);
              const isVerified = app.domain_status === 'verified';

              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-violet-950/20 border-violet-500/80 shadow-md shadow-violet-500/10 ring-1 ring-violet-500/40'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">{app.name}</h3>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          {app.status.toUpperCase()}
                        </span>
                        {hasDomain && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                              isVerified
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : app.domain_status === 'failed'
                                ? 'bg-rose-950 text-rose-300 border-rose-800'
                                : 'bg-amber-950 text-amber-300 border-amber-800'
                            }`}
                          >
                            {isVerified ? 'VERIFIED' : app.domain_status === 'failed' ? 'FAILED' : 'PENDING'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="font-mono text-[11px] text-indigo-300 truncate">
                      Subdomain: /{app.slug}
                    </div>

                    {hasDomain ? (
                      <div className="font-mono text-[11px] text-amber-300 flex items-center gap-1.5 truncate">
                        <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{app.custom_domain}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 italic">
                        Belum ada domain kustom
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                    <a
                      href={hasDomain && isVerified ? `https://${app.custom_domain}` : `https://rickyrizky.kilatstools.my.id/${app.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Buka Live</span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </a>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAppId(app.id);
                        const el = document.getElementById('custom-domain-form');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                        isSelected
                          ? 'bg-violet-600 text-white border-violet-500 font-bold'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                      }`}
                    >
                      {hasDomain ? 'Kelola DNS' : 'Hubungkan'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Form Input atau Detail 2 DNS Records */}
      <div id="custom-domain-form" className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" />
              <span>
                {selectedApp?.custom_domain
                  ? `Pengaturan DNS Domain: ${selectedApp.custom_domain}`
                  : 'Hubungkan Domain Baru'}
              </span>
            </h2>
            {selectedApp && (
              <p className="text-xs text-slate-400 mt-0.5">
                Target Aplikasi: <strong className="text-white">{selectedApp.name}</strong> (/{selectedApp.slug})
              </p>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
            Vercel DNS Engine
          </span>
        </div>

        {/* Jika belum ada custom domain pada app terpilih */}
        {selectedApp && !selectedApp.custom_domain && (
          <form onSubmit={handleConnectDomain} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Nama Root Domain Anda (Bukan subdomain)
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="contoh: tokoku.com atau kasirku.id"
                  disabled={!isPro || assigning}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-colors disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={assigning || !selectedAppId || !isPro}
                  className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50 shrink-0"
                >
                  {assigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Hubungkan Domain</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Masukkan domain root lengkap yang telah Anda beli dari registrar seperti Dewaweb, Niagahoster, DomaiNesia, dll.
              </p>
            </div>
          </form>
        )}

        {/* Jika app sudah punya custom domain -> Tampilkan 2 TAHAP DNS CARD */}
        {selectedApp && selectedApp.custom_domain && (
          <div className="space-y-5 animate-in fade-in">
            {/* Status Header Bar */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="font-mono text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-violet-400" />
                  <span>{selectedApp.custom_domain}</span>
                </div>
                {selectedApp.domain_status === 'verified' ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Aktif & Terverifikasi</span>
                  </span>
                ) : selectedApp.domain_status === 'failed' ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Verifikasi Gagal — Cek Record</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Menunggu DNS (1-15 Menit)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyDns(selectedApp)}
                  disabled={verifyingAppId === selectedApp.id}
                  className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/20 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${verifyingAppId === selectedApp.id ? 'animate-spin' : ''}`} />
                  <span>{verifyingAppId === selectedApp.id ? 'Memeriksa...' : 'Cek Status Verifikasi'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteDomain(selectedApp)}
                  disabled={deletingAppId === selectedApp.id}
                  className="px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {deletingAppId === selectedApp.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Putuskan Domain</span>
                </button>
              </div>
            </div>

            {/* Instruction Text */}
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                Tambahkan 2 DNS Record berikut di panel DNS Registrar Anda (Dewaweb, Niagahoster, DomaiNesia, Cloudflare, dll):
              </p>
              <p className="text-slate-400">
                Tidak perlu mengubah Nameserver (NS). Cukup tambahkan kedua record di bawah ini:
              </p>
            </div>

            {/* 2 DNS Record Cards (Side-by-side or stacked) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Record 1: TXT Verification Challenge */}
              <div className="p-4 rounded-xl bg-slate-950 border border-violet-500/40 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-violet-600 text-white font-mono text-[9px] font-bold rounded-bl-lg">
                  RECORD 1: KEPEMILIKAN
                </div>
                <div className="space-y-1 pt-1">
                  <div className="text-xs font-bold text-violet-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-violet-400" />
                    <span>Bukti Kepemilikan (TXT Challenge)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Memverifikasi bahwa Anda pemilik sah domain {selectedApp.custom_domain}.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Tipe Record</div>
                    <div className="text-emerald-400 font-bold">TXT</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Nama / Host</div>
                    <div className="text-white font-bold truncate">
                      {selectedApp.txt_verification_name || '_vercel'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Nilai / Value</div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-indigo-300 break-all flex items-center justify-between gap-2 mt-1">
                      <span className="truncate">
                        {selectedApp.txt_verification_value || `vc-domain-verify=${selectedApp.custom_domain}`}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            selectedApp.txt_verification_value || `vc-domain-verify=${selectedApp.custom_domain}`,
                            'txt'
                          )
                        }
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white shrink-0 flex items-center gap-1 text-[10px]"
                      >
                        {copiedValue === 'txt' ? (
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
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/40 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 px-2.5 py-0.5 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded-bl-lg">
                  RECORD 2: TRAFIK
                </div>
                <div className="space-y-1 pt-1">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Arahkan Trafik (A Record)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mengarahkan pengunjung domain ke Vercel Global Anycast Edge Network.
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-900 font-mono text-xs">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Tipe Record</div>
                    <div className="text-emerald-400 font-bold">A</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Nama / Host</div>
                    <div className="text-white font-bold">@ (atau kosong)</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Nilai / IP Target</div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-emerald-300 flex items-center justify-between gap-2 mt-1">
                      <span className="font-bold">76.76.21.21</span>
                      <button
                        type="button"
                        onClick={() => copyText('76.76.21.21', 'a_record')}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white shrink-0 flex items-center gap-1 text-[10px]"
                      >
                        {copiedValue === 'a_record' ? (
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

            {/* Helper Alert */}
            <div className="p-3.5 rounded-xl bg-violet-950/30 border border-violet-800/40 text-[11px] text-slate-300 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <div>
                <strong>Langkah Selanjutnya:</strong> Setelah Anda menyimpan kedua record di atas pada DNS panel domain Anda, klik tombol <strong>&quot;Cek Status Verifikasi&quot;</strong>. Jika DNS telah menyebar, status akan berubah menjadi <span className="text-emerald-400 font-bold">Aktif &amp; Terverifikasi</span> dan sertifikat SSL HTTPS otomatis diterbitkan.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Tabel Ringkasan Seluruh Domain */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Ringkasan Domain Terhubung
        </h2>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat status domain...</div>
        ) : apps.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
            Belum ada aplikasi yang terhubung
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-[600px]">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Nama Aplikasi</th>
                    <th className="px-5 py-3">Subdomain Platform</th>
                    <th className="px-5 py-3">Custom Domain</th>
                    <th className="px-5 py-3">Status Verifikasi</th>
                    <th className="px-5 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {apps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{app.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">
                            NODE
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-400">/{app.slug}</td>
                      <td className="px-5 py-3.5 font-mono text-violet-300">
                        {app.custom_domain ? (
                          <a
                            href={`https://${app.custom_domain}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1 font-semibold"
                          >
                            {app.custom_domain} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600 italic">Belum di-set</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {app.custom_domain ? (
                          app.domain_status === 'verified' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                            </span>
                          ) : app.domain_status === 'failed' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1 w-fit">
                              <XCircle className="w-3 h-3" /> Gagal
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1 w-fit">
                              <RefreshCw className="w-3 h-3" /> Menunggu DNS
                            </span>
                          )
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {app.custom_domain ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleVerifyDns(app)}
                              disabled={verifyingAppId === app.id}
                              title="Cek Verifikasi DNS"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 border border-slate-700"
                            >
                              <RefreshCw className={`w-3 h-3 ${verifyingAppId === app.id ? 'animate-spin' : ''}`} />
                              <span>Cek</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDomain(app)}
                              disabled={deletingAppId === app.id}
                              title="Hapus / Putuskan Custom Domain"
                              className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-800/50 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                            >
                              {deletingAppId === app.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>Putuskan</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppId(app.id);
                              const el = document.getElementById('custom-domain-form');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 text-violet-300 border border-violet-800/60 text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Set Domain</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

