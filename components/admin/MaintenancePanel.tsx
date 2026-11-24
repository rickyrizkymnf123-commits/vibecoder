'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Wrench } from 'lucide-react';

interface MaintenanceState {
  enabled: boolean;
  message: string;
  updatedAt?: string;
  updatedBy?: string;
}

export function MaintenancePanel() {
  const [state, setState] = useState<MaintenanceState | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = (m: MaintenanceState) => {
    setState(m);
    setEnabled(m.enabled);
    setMessage(m.message);
  };

  useEffect(() => {
    fetch('/api/admin/maintenance', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => (d.maintenance ? apply(d.maintenance) : setNotice({ ok: false, text: d.error || 'Gagal memuat status' })))
      .catch(() => setNotice({ ok: false, text: 'Gagal memuat status maintenance' }));
  }, []);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const r = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, message })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Gagal menyimpan');
      apply(d.maintenance);
      setNotice({
        ok: true,
        text: d.maintenance.enabled
          ? 'Maintenance AKTIF. Member non-admin sekarang melihat halaman maintenance (berlaku dalam ±10 detik).'
          : 'Maintenance dimatikan. Semua member bisa memakai Kilat Tools lagi (berlaku dalam ±10 detik).'
      });
    } catch (e: any) {
      setNotice({ ok: false, text: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (!state && !notice) {
    return (
      <div className="flex items-center gap-2 text-slate-400 text-sm p-6">
        <Loader2 className="w-4 h-4 animate-spin" /> Memuat status maintenance…
      </div>
    );
  }

  const dirty = !!state && (enabled !== state.enabled || message !== state.message);

  return (
    <div className="max-w-3xl rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl border border-amber-400/30 bg-amber-400/10 flex items-center justify-center shrink-0">
          <Wrench className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Mode Maintenance</h2>
          <p className="text-xs text-slate-400 mt-1">
            Saat aktif, semua member selain admin tidak bisa memakai dashboard, builder, dan API. Mereka melihat halaman
            maintenance. Landing page, login, profil publik, dan aplikasi yang sudah dipublish tetap jalan.
          </p>
        </div>
      </div>

      {state && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
            state.enabled ? 'border-amber-400/40 bg-amber-400/10 text-amber-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          Status sekarang: {state.enabled ? 'MAINTENANCE AKTIF' : 'Normal (tidak maintenance)'}
          {state.updatedAt && (
            <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
              Diubah {new Date(state.updatedAt).toLocaleString('id-ID')}
              {state.updatedBy ? ` oleh ${state.updatedBy}` : ''}
            </span>
          )}
        </div>
      )}

      <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 cursor-pointer">
        <span>
          <span className="block text-sm font-semibold text-white">Aktifkan maintenance</span>
          <span className="block text-[11px] text-slate-500">Admin tetap bisa mengakses semua fitur.</span>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative w-12 h-7 rounded-full transition-colors shrink-0 ${enabled ? 'bg-amber-500' : 'bg-slate-700'}`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${enabled ? 'translate-x-5' : ''}`} />
        </button>
      </label>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pesan untuk member</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40"
        />
      </div>

      {notice && <p className={`text-xs ${notice.ok ? 'text-emerald-300' : 'text-rose-300'}`}>{notice.text}</p>}

      <button
        type="button"
        onClick={save}
        disabled={saving || !dirty}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-pink-600 disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Simpan
      </button>
    </div>
  );
}
