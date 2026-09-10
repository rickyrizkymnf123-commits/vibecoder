'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldAlert, Loader2, Zap } from 'lucide-react';

import { KilatLogo } from '@/components/KilatLogo';

export default function PlatformLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (res.ok) window.location.href = '/c/new';
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Gagal masuk akun');
        setLoading(false);
        return;
      }

      // Full navigation redirect so cookies and layout state load fresh
      window.location.href = '/c/new';
    } catch {
      setError('Terjadi kendala koneksi ke server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0b0f19] relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative z-10">
        <KilatLogo size="lg" className="mb-6" />

        <h2 className="text-2xl font-bold text-white tracking-tight">Masuk ke Akun Anda</h2>
        <p className="text-sm text-slate-400 mt-1">Lanjutkan pembuatan dan pengelolaan aplikasi web Anda</p>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Username atau Email
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="demo atau demo@forge.dev"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-600"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Kata Sandi
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors placeholder:text-slate-600"
              required
            />
          </div>

          <div className="text-xs text-slate-500">
            Akun bawaan demo: <b>demo</b> / <b>password123</b>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Masuk Sekarang'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Belum memiliki akun?{' '}
          <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold underline">
            Daftar Akun Baru (Dapat 1 Slot Gratis)
          </Link>
        </div>
      </div>
    </div>
  );
}
