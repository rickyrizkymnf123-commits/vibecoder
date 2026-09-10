'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderOpen,
  Upload,
  Trash2,
  FileText,
  Lock,
  Crown,
  Loader2,
  HardDrive,
  Download
} from 'lucide-react';
import { StorageFileItem, UserProfile } from '@/lib/types';

export default function StoragePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [files, setFiles] = useState<StorageFileItem[]>([]);
  const [usage, setUsage] = useState<{ usedBytes: number; limitBytes: number; percentage: number }>({
    usedBytes: 0,
    limitBytes: 10 * 1024 * 1024 * 1024,
    percentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, storageRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/pro/storage')
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (storageRes.ok) {
        const data = await storageRes.json();
        setFiles(data.files || []);
        if (data.usage) setUsage(data.usage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        fetchData();
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
    if (!confirm('Yakin ingin menghapus berkas ini?')) return;
    try {
      const res = await fetch('/api/pro/storage', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!loading && !user?.is_pro) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full space-y-8 text-center pt-16">
        <div className="w-16 h-16 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center mx-auto text-fuchsia-400">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Storage Pribadi 10GB adalah Fitur Pro</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2">
            Simpan gambar aset, dokumen PDF, dan berkas umum untuk aplikasi Anda dengan kuota 10GB Supabase Storage.
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm shadow-lg shadow-violet-600/25"
        >
          <Crown className="w-4 h-4 text-amber-300" /> Upgrade ke Forge Pro
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <FolderOpen className="w-6 h-6 text-violet-400" /> Storage Pribadi (10GB)
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Penyimpanan berkas umum terpisah dari database aplikasi menggunakan Supabase Storage bucket.
        </p>
      </div>

      {/* Storage Gauge */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-violet-400" />
            <span className="text-sm font-semibold text-white">Kapasitas Terpakai</span>
          </div>
          <span className="text-xs font-mono text-slate-300">
            <b>{formatSize(usage.usedBytes)}</b> dari 10 GB ({usage.percentage}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500"
            style={{ width: `${Math.max(2, usage.percentage)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>0 GB</span>
          <span>10 GB Kuota Pro Aktif</span>
        </div>
      </div>

      {/* File Upload Box */}
      <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 hover:border-slate-700 transition-colors text-center">
        <Upload className="w-8 h-8 text-violet-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white">Unggah Berkas Baru</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">Mendukung gambar, dokumen, atau file asset</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors cursor-pointer">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Pilih Berkas dari Komputer
          <input
            type="file"
            onChange={handleSimulateUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Files List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Berkas Tersimpan ({files.length})</h3>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat berkas storage...</div>
        ) : files.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada berkas yang diunggah ke storage pribadi Anda.
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Nama Berkas</th>
                  <th className="px-6 py-3.5">Ukuran</th>
                  <th className="px-6 py-3.5">Tipe</th>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {files.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="truncate max-w-xs">{f.name}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{formatSize(f.size)}</td>
                    <td className="px-6 py-4 text-slate-500">{f.mime_type}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(f.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteFile(f.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
