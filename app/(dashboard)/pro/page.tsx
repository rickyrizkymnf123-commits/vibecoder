'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star,
  ArrowLeft,
  Crown,
  Download,
  Database,
  HardDrive,
  Github,
  Upload,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
  Code2
} from 'lucide-react';
import { UserProfile, GeneratedApp, StorageFileItem } from '@/lib/types';

export default function ProFeaturesPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apps, setApps] = useState<GeneratedApp[]>([]);
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [usage, setUsage] = useState<{ usedBytes: number; limitBytes: number; percentage: number }>({
    usedBytes: 0,
    limitBytes: 10 * 1024 * 1024 * 1024,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);

  // GitHub Push states
  const [selectedGithubAppId, setSelectedGithubAppId] = useState('');
  const [githubPat, setGithubPat] = useState('');
  const [githubRepoUrl, setGithubRepoUrl] = useState('');
  const [commitMessage, setCommitMessage] = useState('Release from Forge Pro');
  const [pushingGithub, setPushingGithub] = useState(false);
  const [githubPushResult, setGithubPushResult] = useState<any>(null);
  const [githubError, setGithubError] = useState('');

  // Storage states
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [meRes, appsRes, storageRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/apps'),
        fetch('/api/pro/storage')
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        const publishedApps = (appsData.apps || []).filter(
          (a: GeneratedApp) => a.status === 'published'
        );
        setApps(publishedApps);
        if (publishedApps.length > 0) {
          setSelectedGithubAppId(publishedApps[0].id);
        }
      }
      if (storageRes.ok) {
        const storageData = await storageRes.json();
        setFiles(storageData.files || []);
        if (storageData.usage) setUsage(storageData.usage);
      }
    } catch (err) {
      console.error('Failed to load Pro data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSource = (appId: string) => {
    window.open(`/api/pro/download-source?appId=${appId}`, '_blank');
  };

  const handleExportDb = (appId: string, format: 'sql' | 'csv') => {
    window.open(`/api/pro/export-db?appId=${appId}&format=${format}`, '_blank');
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await fetch('/api/pro/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          mimeType: file.type || 'application/octet-stream'
        })
      });

      if (res.ok) {
        const storageRes = await fetch('/api/pro/storage');
        if (storageRes.ok) {
          const storageData = await storageRes.json();
          setFiles(storageData.files || []);
          if (storageData.usage) setUsage(storageData.usage);
        }
      } else {
        const err = await res.json();
        alert(err.error || 'Gagal mengunggah berkas');
      }
    } catch {
      alert('Terjadi kesalahan saat mengunggah');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const res = await fetch('/api/pro/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      if (res.ok) {
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGithubPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGithubAppId || !githubRepoUrl) return;

    setPushingGithub(true);
    setGithubError('');
    setGithubPushResult(null);

    try {
      const res = await fetch('/api/pro/github-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: selectedGithubAppId,
          repoUrl: githubRepoUrl,
          githubPat: githubPat || undefined,
          commitMessage: commitMessage || 'Release from Forge Pro'
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGithubPushResult(data);
      } else {
        setGithubError(data.error || 'Gagal melakukan push ke GitHub');
      }
    } catch {
      setGithubError('Terjadi kesalahan koneksi jaringan');
    } finally {
      setPushingGithub(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isPro = Boolean(user?.is_pro);

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back Link & Header (Matched with Gambar 4 & 5) */}
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
            <Star className="w-6 h-6 text-amber-400 fill-amber-400/20" /> Fitur Eksklusif Pro
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola source code, export database terstruktur, penyimpanan cloud 10GB, dan sinkronisasi GitHub otomatis.
          </p>
        </div>
      </div>

      {/* Status Card (Matched with Gambar 4) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-600/10 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Status Keanggotaan Pro:</span>
            {isPro ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Aktif
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-slate-500" /> Nonaktif (Free Tier)
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">
            {isPro
              ? user?.pro_until
                ? `Berlaku hingga: ${new Date(user.pro_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                : 'Masa aktif aktif 30 hari penuh'
              : 'Aktifkan Pro untuk membuka download source code, export DB, storage 10GB, dan GitHub push.'}
          </p>
        </div>

        <Link
          href="/billing"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>{isPro ? 'Perpanjang / Kelola Pembayaran →' : 'Upgrade ke Pro Sekarang →'}</span>
        </Link>
      </div>

      {/* SECTION 1: Download Source & Export DB per App (Matched with Gambar 4) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Code2 className="w-4 h-4 text-violet-400" />
            <span>1. Download Source Code & Export Database</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {apps.length} Aplikasi Ter-publish
          </span>
        </div>

        {apps.length === 0 ? (
          <div className="text-xs text-slate-400 p-4 rounded-xl bg-slate-950 border border-slate-800 text-center italic">
            Belum ada aplikasi yang dipublish. Bangun aplikasi di chat studio terlebih dahulu.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate mr-2">
                    <span className="font-semibold text-white text-xs truncate">{app.name}</span>
                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 font-mono text-[9px] font-bold border border-emerald-500/30 shrink-0">
                      NODE
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    /{app.slug}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/80">
                  {/* Download Source Button */}
                  <button
                    onClick={() => handleDownloadSource(app.id)}
                    disabled={!isPro}
                    className="flex-1 py-2 px-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    title={isPro ? 'Unduh berkas ZIP project' : 'Khusus pengguna Pro'}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download ZIP</span>
                  </button>

                  {/* Export DB SQL */}
                  <button
                    onClick={() => handleExportDb(app.id, 'sql')}
                    disabled={!isPro}
                    className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    title={isPro ? 'Export struktur tabel SQL' : 'Khusus pengguna Pro'}
                  >
                    <Database className="w-3.5 h-3.5 text-amber-400" />
                    <span>Export SQL</span>
                  </button>

                  {/* Export DB CSV */}
                  <button
                    onClick={() => handleExportDb(app.id, 'csv')}
                    disabled={!isPro}
                    className="py-2 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                    title={isPro ? 'Export data CSV' : 'Khusus pengguna Pro'}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Storage Pribadi 10GB (Matched with Gambar 5) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>2. Storage Cloud Pribadi (10GB)</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {formatBytes(usage.usedBytes)} / 10 GB
          </div>
        </div>

        {/* Meter Gauge Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Kapasitas Terpakai</span>
            <span>{usage.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, Math.max(usage.percentage, 1))}%` }}
            />
          </div>
        </div>

        {/* Upload Control */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs text-slate-400">
            Simpan aset gambar, dokumen PDF, dan database backup aplikasi Anda dengan aman.
          </p>

          <label
            className={`px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shrink-0 ${
              !isPro ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>Unggah Berkas Baru</span>
            <input
              type="file"
              disabled={!isPro || uploading}
              onChange={handleUploadFile}
              className="hidden"
            />
          </label>
        </div>

        {/* File Table / List */}
        {files.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden mt-3">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-2.5">Nama Berkas</th>
                  <th className="px-4 py-2.5">Ukuran</th>
                  <th className="px-4 py-2.5">Tipe</th>
                  <th className="px-4 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-900/40">
                    <td className="px-4 py-2.5 font-medium text-white flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-400">
                      {formatBytes(file.size)}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono text-[10px]">
                      {file.mime_type}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECTION 3: GitHub Push Integration (Matched with Gambar 5) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Github className="w-4 h-4 text-violet-400" />
            <span>3. Push ke GitHub Otomatis</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Git REST Automation</span>
        </div>

        {/* 5-Step Tutorial Card */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 text-xs text-slate-300">
          <div className="font-bold text-white flex items-center gap-1.5 text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
            <span>5 Langkah Menghubungkan Repository GitHub:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 leading-relaxed">
            <li>
              Buka <b className="text-white">github.com</b> lalu masuk ke menu <b>Settings &gt; Developer Settings &gt; Personal Access Tokens (Tokens classic)</b>.
            </li>
            <li>
              Klik <b>Generate new token</b> dan beri centang pada scope <code className="text-violet-300 bg-slate-900 px-1 py-0.5 rounded">repo</code> (Full control of private repositories).
            </li>
            <li>
              Salin token PAT tersebut dan tempelkan pada formulir <b>GitHub Token</b> di bawah.
            </li>
            <li>
              Ketik nama repository target (misal: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">username/nama-repo</code>) atau URL lengkap repository.
            </li>
            <li>
              Klik tombol <b>Hubungkan &amp; Push ke GitHub</b>. Forge akan secara otomatis mengunggah seluruh berkas proyek ke repository Anda!
            </li>
          </ol>
        </div>

        {/* GitHub Push Form */}
        <form onSubmit={handleGithubPush} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Target App */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pilih Aplikasi yang Ingin Di-push
              </label>
              <select
                value={selectedGithubAppId}
                onChange={(e) => setSelectedGithubAppId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500"
              >
                {apps.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Repository */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Repository GitHub Target
              </label>
              <input
                type="text"
                value={githubRepoUrl}
                onChange={(e) => setGithubRepoUrl(e.target.value)}
                placeholder="contoh: rickyrizkymnf123-commits/kasir-pos"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* GitHub PAT */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Personal Access Token (PAT)
              </label>
              <input
                type="password"
                value={githubPat}
                onChange={(e) => setGithubPat(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (opsional jika ada di server)"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500 placeholder:text-slate-600"
              />
            </div>

            {/* Commit Message */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Pesan Commit
              </label>
              <input
                type="text"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Initial release from Forge Pro"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pushingGithub || !selectedGithubAppId || !isPro}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-40"
          >
            {pushingGithub ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            <span>
              {isPro
                ? 'Hubungkan & Push ke GitHub Sekarang'
                : 'Khusus Pengguna Pro — Silakan Upgrade'}
            </span>
          </button>
        </form>

        {/* GitHub Success Notification */}
        {githubPushResult && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 space-y-1.5 animate-in fade-in duration-200">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Source code berhasil di-push ke GitHub!</span>
            </div>
            {githubPushResult.commitUrl && (
              <a
                href={githubPushResult.commitUrl}
                target="_blank"
                rel="noreferrer"
                className="text-violet-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                Lihat Commit di GitHub: {githubPushResult.commitSha?.substring(0, 7)}{' '}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* GitHub Error Notification */}
        {githubError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{githubError}</span>
          </div>
        )}
      </div>
    </div>
  );
}
