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
  Trash2
} from 'lucide-react';
import { GeneratedApp } from '@/lib/types';

export default function CustomDomainsPage() {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [domainInput, setDomainInput] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [dnsInstructions, setDnsInstructions] = useState<any>(null);
  const [checkStatusLoading, setCheckStatusLoading] = useState(false);
  const [deletingAppId, setDeletingAppId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data.apps || []);
        if (data.apps?.length > 0) {
          setSelectedAppId(data.apps[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppId || !domainInput) return;

    setAssigning(true);
    setDnsInstructions(null);

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
        setDnsInstructions(data.dnsInstructions);
        setDomainInput('');
        fetchApps();
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

  const handleVerifyDns = async (domain: string) => {
    setCheckStatusLoading(true);
    try {
      const res = await fetch(`/api/deploy/domain?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.verified) {
        alert(`Domain ${domain} terverifikasi aktif dan siap diakses!`);
      } else {
        alert(`DNS record untuk ${domain} belum terdeteksi. Harap tunggu proses propagasi DNS (1-15 menit).`);
      }
    } catch {
      alert('Gagal mengecek status DNS');
    } finally {
      setCheckStatusLoading(false);
    }
  };

  const handleDeleteDomain = async (app: GeneratedApp) => {
    if (!app.custom_domain) return;
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus custom domain "${app.custom_domain}" dari aplikasi ${app.name}?`
    );
    if (!confirmDelete) return;

    setDeletingAppId(app.id);
    try {
      const res = await fetch('/api/deploy/domain', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Custom domain "${app.custom_domain}" berhasil dihapus.`);
        fetchApps();
      } else {
        alert(data.error || 'Gagal menghapus custom domain');
      }
    } catch {
      alert('Terjadi kesalahan saat menghapus custom domain');
    } finally {
      setDeletingAppId(null);
    }
  };

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Back Link & Header (Matched with Gambar 3) */}
      <div className="space-y-3">
        <Link
          href="/c/new"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke chat</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-violet-400" /> Custom Domain
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hubungkan nama domain kustom Anda sendiri ke aplikasi yang telah dipublish via Vercel Domains API.
          </p>
        </div>
      </div>

      {/* Section: Daftar Aplikasi & Subdomain Publik Anda */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Daftar Aplikasi & Domain Publik Anda</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pilih aplikasi yang ingin Anda buka atau hubungkan ke custom domain sendiri.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            {apps.length} Aplikasi Aktif
          </span>
        </div>

        {apps.length === 0 && !loading ? (
          <div className="text-xs text-slate-400 py-4 text-center">
            Belum ada aplikasi yang diterbitkan. Silakan buat aplikasi baru terlebih dahulu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">{app.name}</h3>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      LIVE
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-indigo-300 truncate">
                    /{app.slug}
                  </div>
                  {app.custom_domain && (
                    <div className="mt-1 font-mono text-[11px] text-amber-400 flex items-center gap-1">
                      <span>🌐</span>
                      <span>{app.custom_domain}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <a
                    href={app.custom_domain ? `https://${app.custom_domain}` : `https://rickyrizky.kilatstools.my.id/${app.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Buka App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAppId(app.id);
                      const el = document.getElementById('custom-domain-form');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      selectedAppId === app.id
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                    }`}
                  >
                    Atur Domain
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Connect Form Card */}
      <div id="custom-domain-form" className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Tambah Custom Domain Toko Sendiri</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Vercel Edge Network</span>
        </div>

        {apps.length === 0 && !loading ? (
          <div className="text-xs text-amber-300 bg-amber-950/40 p-3.5 rounded-xl border border-amber-800/60">
            Anda belum memiliki aplikasi ter-publish. Buat dan publish aplikasi terlebih dahulu sebelum menambahkan custom domain.
          </div>
        ) : (
          <form onSubmit={handleConnectDomain} className="space-y-4">
            {/* App Selection Card with NODE Badge */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Pilih Aplikasi Target
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {apps.map((a) => {
                  const isSelected = selectedAppId === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAppId(a.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-violet-950/30 border-violet-500 text-white shadow-sm shadow-violet-500/10'
                          : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs truncate">{a.name}</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30">
                            NODE
                          </span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                          /{a.slug}
                        </div>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'border-violet-400 bg-violet-600 text-white'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Wide Input with Purple 'Tambah domain' Button */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-slate-300">
                Nama Domain Anda
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="contoh: kalkulatorku.com"
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-slate-600 transition-colors"
                  required
                />
                <button
                  type="submit"
                  disabled={assigning || !selectedAppId}
                  className="px-6 py-2.5 sm:py-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50 shrink-0"
                >
                  {assigning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  <span>Tambah domain</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* DNS Instructions Panel */}
        {dnsInstructions && (
          <div className="p-5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs space-y-4 animate-in fade-in duration-200">
            <div className="font-bold text-violet-300 flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Instruksi Pengaturan DNS di Provider Domain Anda
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Buka panel akun tempat Anda membeli domain (misal: <strong>Dewaweb</strong>, <strong>Niagahoster</strong>, <strong>DomaiNesia</strong>, <strong>Cloudflare</strong>, dll) &gt; masuk ke menu <strong>DNS Management</strong>, lalu tambahkan record berikut:
            </p>

            <div className="space-y-2.5">
              {(dnsInstructions.records || [dnsInstructions]).map((rec: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  {rec.desc && (
                    <div className="text-[11px] font-semibold text-violet-400 flex items-center justify-between">
                      <span>• {rec.desc}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] items-center">
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Tipe Record</span>
                      <span className="text-emerald-400 font-bold">{rec.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] uppercase block">Host / Nama</span>
                      <span className="text-white truncate font-bold">{rec.host}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-1">
                      <span className="text-slate-500 text-[10px] uppercase block">Target / Value</span>
                      <span className="text-indigo-300 truncate">{rec.value}</span>
                    </div>
                    <div className="flex items-center sm:justify-end">
                      <button
                        type="button"
                        onClick={() => copyText(rec.value)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 rounded-lg border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 text-[11px] transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Salin Value</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-[11px] text-emerald-300">
              💡 <strong>Tips:</strong> Tidak perlu mengubah Nameserver (NS). Cukup simpan DNS record di atas, tunggu 1-10 menit untuk propagasi DNS, lalu aplikasi toko Anda langsung aktif dengan SSL/HTTPS otomatis.
            </div>
          </div>
        )}
      </div>

      {/* Connected Domains Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Daftar Aplikasi & Status Domain
        </h2>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat status domain...</div>
        ) : apps.length === 0 ? (
          <div className="text-xs text-slate-500 italic p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-center">
            Belum ada aplikasi yang terhubung
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3">Nama Aplikasi</th>
                  <th className="px-5 py-3">Subdomain Kilat Tools</th>
                  <th className="px-5 py-3">Custom Domain</th>
                  <th className="px-5 py-3">Status DNS</th>
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
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {app.custom_domain ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleVerifyDns(app.custom_domain!)}
                            disabled={checkStatusLoading}
                            title="Cek Verifikasi DNS"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition-colors inline-flex items-center gap-1 border border-slate-700"
                          >
                            <RefreshCw className={`w-3 h-3 ${checkStatusLoading ? 'animate-spin' : ''}`} />
                            <span>Cek DNS</span>
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
                            <span>Hapus</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
