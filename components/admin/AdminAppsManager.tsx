'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, RefreshCw, Loader2, CheckSquare, Square, ExternalLink, AppWindow } from 'lucide-react';

interface AdminApp {
  id: string;
  name: string;
  slug: string;
  status: string;
  user_id: string;
  owner_username: string | null;
  owner_subdomain: string | null;
  custom_domain: string | null;
  file_count: number;
  created_at: string | null;
  updated_at: string | null;
}

type StatusFilter = 'all' | 'published' | 'draft';

function formatDate(value: string | null): string {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return value;
  }
}

function publicUrl(app: AdminApp): string | null {
  if (app.custom_domain) return `https://${app.custom_domain}`;
  if (app.owner_subdomain) return `https://${app.owner_subdomain}.kilatstools.my.id/${app.slug}`;
  return null;
}

export function AdminAppsManager({ onCountChange }: { onCountChange?: (count: number) => void }) {
  const [apps, setApps] = useState<AdminApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const notify = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 6000);
  };

  const loadApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/apps', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat aplikasi');
      setApps(data.apps || []);
      onCountChange?.((data.apps || []).length);
      setSelected((prev) => prev.filter((id) => (data.apps || []).some((a: AdminApp) => a.id === id)));
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return apps.filter((a) => {
      if (statusFilter === 'published' && a.status !== 'published') return false;
      if (statusFilter === 'draft' && a.status === 'published') return false;
      if (!q) return true;
      return [a.name, a.slug, a.owner_username, a.custom_domain]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [apps, search, statusFilter]);

  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selected.includes(a.id));

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => prev.filter((id) => !filtered.some((a) => a.id === id)));
    } else {
      setSelected((prev) => Array.from(new Set([...prev, ...filtered.map((a) => a.id)])));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deleteApps = async (ids: string[], label: string) => {
    if (ids.length === 0) return;
    if (!confirm(`Hapus permanen ${label}? Aplikasi tidak bisa diakses lagi dan tindakan ini tidak dapat dibatalkan.`)) return;

    setDeleting(ids.length === 1 ? ids[0] : 'bulk');
    try {
      const res = await fetch('/api/admin/apps', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appIds: ids })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus aplikasi');

      const extra = data.errors?.length ? ` (${data.errors.join('; ')})` : '';
      notify('success', `${data.deletedCount} aplikasi berhasil dihapus${extra}`);
      setSelected((prev) => prev.filter((id) => !ids.includes(id)));
      await loadApps();
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs border ${
            notice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {notice.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama aplikasi, slug, pemilik, domain..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/60"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200"
          >
            <option value="all">Semua Status</option>
            <option value="published">Terbit (Published)</option>
            <option value="draft">Draft / Belum Terbit</option>
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadApps}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button
            onClick={() => deleteApps(selected, `${selected.length} aplikasi terpilih`)}
            disabled={selected.length === 0 || deleting !== null}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {deleting === 'bulk' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Hapus {selected.length} Terpilih
          </button>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <th className="p-3.5 w-10">
                <button onClick={toggleAll} title="Pilih semua yang tampil" className="text-slate-400 hover:text-white">
                  {allFilteredSelected ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4" />}
                </button>
              </th>
              <th className="p-3.5">Aplikasi</th>
              <th className="p-3.5">Pemilik</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5">Berkas</th>
              <th className="p-3.5">Diperbarui</th>
              <th className="p-3.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading && apps.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Memuat aplikasi...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  <AppWindow className="w-6 h-6 mx-auto mb-2 opacity-60" />
                  Tidak ada aplikasi yang cocok.
                </td>
              </tr>
            ) : (
              filtered.map((app) => {
                const url = publicUrl(app);
                const isSelected = selected.includes(app.id);
                return (
                  <tr key={app.id} className={`border-b border-slate-800/70 ${isSelected ? 'bg-violet-600/5' : ''}`}>
                    <td className="p-3.5">
                      <button onClick={() => toggleOne(app.id)} className="text-slate-400 hover:text-white">
                        {isSelected ? <CheckSquare className="w-4 h-4 text-violet-400" /> : <Square className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-100 truncate max-w-[260px]">{app.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono truncate max-w-[260px]">{app.slug}</div>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {app.owner_username ? `@${app.owner_username}` : <span className="text-slate-500">(user terhapus)</span>}
                    </td>
                    <td className="p-3.5">
                      {app.status === 'published' ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          ✓ Terbit
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-700/40 text-slate-300 border border-slate-600/40">
                          Draft
                        </span>
                      )}
                      {app.custom_domain && (
                        <div className="text-[10px] text-cyan-300 mt-1 truncate max-w-[180px]">🌐 {app.custom_domain}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-400 text-xs">{app.file_count}</td>
                    <td className="p-3.5 text-slate-400 text-xs whitespace-nowrap">{formatDate(app.updated_at || app.created_at)}</td>
                    <td className="p-3.5">
                      <div className="flex justify-end gap-1.5">
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Buka aplikasi"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteApps([app.id], `aplikasi "${app.name}"`)}
                          disabled={deleting !== null}
                          title="Hapus aplikasi"
                          className="p-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white disabled:opacity-50"
                        >
                          {deleting === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-500">
        Menampilkan {filtered.length} dari {apps.length} aplikasi. Menghapus aplikasi tidak menghapus akun pemiliknya maupun riwayat chat.
      </p>
    </div>
  );
}
