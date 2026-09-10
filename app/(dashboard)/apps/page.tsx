'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Layers,
  Globe,
  Download,
  Database,
  Github,
  ExternalLink,
  Calendar,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { GeneratedApp, UserProfile } from '@/lib/types';

export default function AppsPage() {
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // GitHub push modal state
  const [selectedAppForGh, setSelectedAppForGh] = useState<GeneratedApp | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [ghLoading, setGhLoading] = useState(false);
  const [ghResult, setGhResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, meRes] = await Promise.all([
        fetch('/api/apps'),
        fetch('/api/auth/me')
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApps(appsData.apps || []);
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [publishingId, setPublishingId] = useState<string | null>(null);

  const handleDeleteApp = async (appId: string) => {
    if (confirmDeleteId !== appId) {
      setConfirmDeleteId(appId);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === appId ? null : prev));
      }, 4000);
      return;
    }

    setDeletingId(appId);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/apps?id=${appId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) {
        setActionMessage({ type: 'error', text: data.error || 'Gagal menghapus aplikasi' });
      } else {
        setApps((prev) => prev.filter((a) => a.id !== appId));
        setConfirmDeleteId(null);
        setActionMessage({ type: 'success', text: 'Aplikasi berhasil dihapus dari platform' });
        setTimeout(() => setActionMessage(null), 3500);
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Terjadi kesalahan saat menghubungi server' });
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishDraft = async (app: GeneratedApp) => {
    if (!user || user.app_credits < 1) {
      alert('Kredit App Anda 0. Silakan top up di menu Billing untuk mem-publish aplikasi ini.');
      return;
    }
    setPublishingId(app.id);
    try {
      const res = await fetch('/api/deploy/vercel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId: app.id })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal publish aplikasi');
      } else {
        alert(`Aplikasi ${app.name} berhasil dipublish ke: ${data.publicUrl}`);
        fetchData();
      }
    } catch {
      alert('Terjadi kesalahan saat mem-publish aplikasi');
    } finally {
      setPublishingId(null);
    }
  };

  const handleDownloadSource = async (app: GeneratedApp) => {
    if (app.status !== 'published') {
      alert('Fitur Download Source Code hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft).');
      return;
    }
    if (!user?.is_pro) {
      alert('Fitur Download Source Code hanya tersedia untuk member Tier Pro.');
      return;
    }
    window.open(`/api/pro/download-source?appId=${app.id}`, '_blank');
  };

  const handleExportDb = async (app: GeneratedApp, format: 'sql' | 'csv' = 'sql') => {
    if (app.status !== 'published') {
      alert('Fitur Export Database hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft).');
      return;
    }
    if (!user?.is_pro) {
      alert('Fitur Export Database Postgres hanya tersedia untuk member Tier Pro.');
      return;
    }
    window.open(`/api/pro/export-db?appId=${app.id}&format=${format}`, '_blank');
  };

  const handlePushGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForGh) return;

    setGhLoading(true);
    setGhResult(null);

    try {
      const res = await fetch('/api/pro/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: selectedAppForGh.id,
          repoUrl,
          githubPat
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setGhResult({ success: false, message: data.error || 'Gagal push ke GitHub' });
      } else {
        setGhResult({
          success: true,
          message: `Sukses commit & push ke GitHub! Commit SHA: ${data.commitSha}`
        });
      }
    } catch {
      setGhResult({ success: false, message: 'Terjadi kendala koneksi ke server' });
    } finally {
      setGhLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-violet-400" /> Aplikasi Ter-publish
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Kelola aplikasi web live Anda, unduh source code, export database, atau hubungkan ke GitHub.
          </p>
        </div>

        <Link
          href="/c/new"
          className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/20 transition-all self-start"
        >
          + Buat Aplikasi Baru
        </Link>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Apps Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
          Memuat daftar aplikasi...
        </div>
      ) : apps.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Belum Ada Aplikasi Ter-publish</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Mulai percakapan dengan AI untuk merancang dan mem-publish aplikasi pertama Anda.
          </p>
          <Link
            href="/c/new"
            className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors"
          >
            Mulai Chat Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apps.map((app) => {
            const previewUrl = `/preview/${app.slug}`;
            const publicUrl = app.vercel_url || previewUrl;
            return (
              <div
                key={app.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-6 shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold text-white truncate">{app.name}</h3>
                      <span className="text-xs font-mono text-slate-500 truncate block">slug: {app.slug}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        app.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {app.status === 'published' ? 'published' : 'draft'}
                      </span>
                      <button
                        onClick={() => handleDeleteApp(app.id)}
                        disabled={deletingId === app.id}
                        title="Hapus aplikasi ini"
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
                          confirmDeleteId === app.id
                            ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                            : 'bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-700/60'
                        }`}
                      >
                        {deletingId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>{confirmDeleteId === app.id ? 'Yakin Hapus?' : 'Hapus'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Public Live URL or Draft Publish Action */}
                  {app.status === 'published' ? (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs text-slate-300 mb-4">
                      <span className="flex items-center gap-2 truncate font-mono text-violet-300">
                        <Globe className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                        <span className="truncate">{publicUrl}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Link
                          href={previewUrl}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          Preview
                        </Link>
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                        >
                          Buka <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-950 border border-amber-800/60 flex items-center justify-between text-xs text-slate-300 mb-4">
                      <div>
                        <span className="text-amber-300 font-semibold block">Draft Belum Dipublish</span>
                        <span className="text-[11px] text-slate-400">Memerlukan 1 Kredit App</span>
                      </div>
                      <button
                        onClick={() => handlePublishDraft(app)}
                        disabled={publishingId === app.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:opacity-95 text-white text-[11px] font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {publishingId === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : '🚀 Publish Sekarang'}
                      </button>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>Schema: <b>{app.db_schema_name}</b> (Supabase Postgres)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {app.status === 'published'
                          ? `Dipublish pada: ${new Date(app.published_at || app.created_at).toLocaleDateString('id-ID')}`
                          : `Dibuat pada: ${new Date(app.created_at).toLocaleDateString('id-ID')}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pro Tier Actions & Custom Domain */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Fitur & Operasional</span>
                    {app.status !== 'published' ? (
                      <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                        <Lock className="w-3 h-3" /> Khusus App Published
                      </span>
                    ) : !user?.is_pro ? (
                      <span className="text-amber-400 flex items-center gap-1 text-[10px]">
                        <Lock className="w-3 h-3" /> Fitur Pro
                      </span>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    {/* Download ZIP */}
                    <button
                      onClick={() => handleDownloadSource(app)}
                      disabled={app.status !== 'published'}
                      className={`p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        app.status === 'published' && user?.is_pro
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-950/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-[10px] font-semibold">Download ZIP</span>
                    </button>

                    {/* Export DB SQL */}
                    <button
                      onClick={() => handleExportDb(app, 'sql')}
                      disabled={app.status !== 'published'}
                      className={`p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        app.status === 'published' && user?.is_pro
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-950/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[10px] font-semibold">Export SQL</span>
                    </button>

                    {/* Export DB CSV */}
                    <button
                      onClick={() => handleExportDb(app, 'csv')}
                      disabled={app.status !== 'published'}
                      className={`p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        app.status === 'published' && user?.is_pro
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-950/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-[10px] font-semibold">Export CSV</span>
                    </button>

                    {/* Push to GitHub */}
                    <button
                      onClick={() => {
                        if (app.status !== 'published') {
                          alert('Fitur Push GitHub hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft).');
                          return;
                        }
                        if (!user?.is_pro) {
                          alert('Fitur Push GitHub hanya tersedia untuk member Tier Pro.');
                          return;
                        }
                        setSelectedAppForGh(app);
                      }}
                      disabled={app.status !== 'published'}
                      className={`p-2 rounded-lg border transition-all text-center flex flex-col items-center justify-center gap-1 ${
                        app.status === 'published' && user?.is_pro
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                          : 'bg-slate-950/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5 text-fuchsia-400" />
                      <span className="text-[10px] font-semibold">Push GitHub</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GitHub Push Modal Dialog */}
      {selectedAppForGh && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Github className="w-5 h-5 text-fuchsia-400" /> Push Source ke GitHub Repo Anda
              </h3>
              <button
                onClick={() => {
                  setSelectedAppForGh(null);
                  setGhResult(null);
                }}
                className="text-slate-500 hover:text-white"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Aplikasi: <b>{selectedAppForGh.name}</b>. Masukkan URL repo yang SUDAH Anda buat di GitHub beserta Personal Access Token (PAT) fine-grained dengan izin <i>Contents: Read and write</i>.
            </p>

            {ghResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  ghResult.success
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                {ghResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{ghResult.message}</span>
              </div>
            )}

            <form onSubmit={handlePushGitHub} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">GitHub Repo URL</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/my-app"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  GitHub Personal Access Token (PAT)
                </label>
                <input
                  type="password"
                  value={githubPat}
                  onChange={(e) => setGithubPat(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAppForGh(null);
                    setGhResult(null);
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={ghLoading}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  {ghLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Hubungkan & Push'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
