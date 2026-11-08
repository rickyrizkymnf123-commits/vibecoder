'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Coins,
  Cpu,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles
} from 'lucide-react';
import { UserProfile, CreditTransaction } from '@/lib/types';

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, txRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/account/transactions')
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', message: 'Kata sandi baru minimal 6 karakter' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordNotice({ type: 'error', message: data.error || 'Gagal mengubah kata sandi' });
      } else {
        setPasswordNotice({ type: 'success', message: 'Kata sandi berhasil diperbarui!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordNotice({ type: 'error', message: 'Terjadi kesalahan sistem' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-violet-400" /> Pengaturan Akun
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Kelola profil pengguna, keamanan kata sandi, dan pantau catatan riwayat kredit akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-violet-400" /> Informasi Pengguna
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Username
              </span>
              <span className="text-white font-medium text-sm">@{user?.username}</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Email
              </span>
              <span className="text-white font-medium text-sm">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Subdomain Pribadi
              </span>
              <div className="flex items-center gap-2 font-mono text-violet-300 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>{user?.subdomain}.kilatstools.my.id</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Status Tier & Paket
              </span>
              <div className="mt-1 flex items-center gap-2">
                {user?.is_pro ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Paket Pro Edition
                  </span>
                ) : user?.is_paid ? (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                    ⚡ Paket Basic Aktif
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                    🆓 Free Starter Plan
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-6">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Kredit App</span>
                <span className="font-mono text-base font-bold text-amber-400">{user?.app_credits ?? 0} Slot</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Kredit AI</span>
                <span className="font-mono text-base font-bold text-emerald-400">{(user?.ai_credits ?? 0).toLocaleString('id-ID')} Token</span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Key className="w-4 h-4 text-violet-400" /> Ganti Kata Sandi
          </div>

          {passwordNotice && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordNotice.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {passwordNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordNotice.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kata Sandi Lama</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-md shadow-violet-600/20"
            >
              {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Perbarui Kata Sandi'}
            </button>
          </form>
        </div>
      </div>

      {/* Credit Transactions Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-violet-400" /> Riwayat Audit Mutasi Kredit
          </h2>
          <span className="text-xs text-slate-500">{transactions.length} entri audit</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat riwayat transaksi...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada catatan mutasi kredit pada akun ini.
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Tipe Kredit</th>
                  <th className="px-6 py-3.5">Jumlah Mutasi</th>
                  <th className="px-6 py-3.5">Keterangan / Alasan</th>
                  <th className="px-6 py-3.5 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'app_credit' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <Coins className="w-3 h-3" /> Kredit App
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1 w-fit">
                          <Cpu className="w-3 h-3" /> Kredit AI
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString('id-ID')}` : tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{tx.reason}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {tx.balance_after.toLocaleString('id-ID')}
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
