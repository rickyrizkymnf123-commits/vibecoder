'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Coins,
  ArrowLeft,
  Loader2,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  UserCheck,
  UserPlus
} from 'lucide-react';

interface RecordItem {
  id: string;
  title: string;
  category: string;
  amount_cents: number;
  status: string;
  type?: 'income' | 'expense';
  created_at: string;
}

interface UserItem {
  id: string;
  username: string;
  name: string;
  role: string;
  status: string;
  email: string;
}

export default function AppPreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);

  // Active Role View: 'user' or 'admin'
  const [activeRole, setActiveRole] = useState<'user' | 'admin'>('user');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states for transaction
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Pemasukan');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('income');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for new user (Admin Panel)
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('User');

  useEffect(() => {
    fetchApp();
  }, [slug]);

  const fetchApp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/preview/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setAppData(data.app);
        setRecords(data.app.records || []);
        setUsers(data.app.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setIsSubmitting(true);

    const amountNum = parseFloat(newAmount.replace(/[^0-9]/g, '')) || 0;
    const amountCents = amountNum * 100;

    try {
      const res = await fetch(`/api/preview/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          category: newCategory || 'Umum',
          amount_cents: amountCents,
          status: 'selesai',
          type: newType
        })
      });

      if (res.ok) {
        const data = await res.json();
        setRecords((prev) => [data.record, ...prev]);
        setNewTitle('');
        setNewAmount('');
        setIsRecordModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserUsername) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/preview/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'user',
          name: newUserName,
          username: newUserUsername,
          email: newUserEmail || `${newUserUsername}@dompetku.dev`,
          role: newUserRole
        })
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) => [...prev, data.user]);
        setNewUserName('');
        setNewUserUsername('');
        setNewUserEmail('');
        setIsUserModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      setTimeout(() => {
        setConfirmDeleteId((prev) => (prev === id ? null : prev));
      }, 3500);
      return;
    }

    try {
      const res = await fetch(`/api/preview/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        setConfirmDeleteId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/preview/${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: 'user' })
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Calculations for Finance Dashboard
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    for (const r of records) {
      const isIncome = r.type === 'income' || r.category.toLowerCase().includes('pemasukan') || r.category.toLowerCase().includes('gaji');
      if (isIncome) {
        inc += r.amount_cents || 0;
      } else {
        exp += r.amount_cents || 0;
      }
    }
    return {
      totalIncome: inc,
      totalExpense: exp,
      balance: inc - exp
    };
  }, [records]);

  // Categories list
  const categories = ['Semua', ...Array.from(new Set(records.map((r) => r.category || 'Umum')))];
  const filteredRecords = records.filter((r) => {
    const matchCat = selectedCategory === 'Semua' || r.category === selectedCategory;
    const matchSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400 text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-violet-500 mr-2" />
        Memuat pratinjau aplikasi...
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold text-rose-400">Aplikasi Tidak Ditemukan</h2>
        <p className="text-sm text-slate-400 mt-2">Pastikan slug aplikasi sudah benar dan aplikasi telah selesai di-generate.</p>
        <Link href="/" className="mt-4 px-4 py-2 bg-violet-600 rounded-lg text-sm font-medium">
          Kembali ke Forge
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Banner Notice */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">{appData.name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live Interactive App
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Database: PostgreSQL &bull; Timezone: WIB (Asia/Jakarta)
            </p>
          </div>
        </div>

        {/* Multi-Role Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => setActiveRole('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeRole === 'user'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" /> Dashboard User
            </button>
            <button
              onClick={() => setActiveRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeRole === 'admin'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Panel Admin
            </button>
          </div>

          {activeRole === 'user' ? (
            <button
              onClick={() => setIsRecordModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" /> Catat Transaksi
            </button>
          ) : (
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-amber-600/20"
            >
              <UserPlus className="w-4 h-4" /> Tambah User
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* VIEW 1: USER DASHBOARD */}
        {activeRole === 'user' && (
          <>
            {/* KPI Finance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Saldo Saat Ini</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-2xl font-extrabold mt-1 font-mono ${balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  Rp {(balance / 100).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">Arus Kas Bersih Terkini</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Pemasukan</span>
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-sky-400 mt-1 font-mono">
                  Rp {(totalIncome / 100).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Dari gaji, honor & dividen</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Total Pengeluaran</span>
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">
                  Rp {(totalExpense / 100).toLocaleString('id-ID')}
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Biaya makan, tagihan & belanja</span>
              </div>
            </div>

            {/* Visual Grafik Ringkasan Bulanan (Interactive Visual Bar Chart) */}
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-bold text-white">Ringkasan Grafik Keuangan Bulanan</h2>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-sky-500"></span>
                    <span className="text-slate-300">Pemasukan</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                    <span className="text-slate-300">Pengeluaran</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="space-y-2 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-sky-300">Pemasukan ({(totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense) * 100).toFixed(1) : 0)}%)</span>
                    <span className="text-sky-400 font-bold">Rp {(totalIncome / 100).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-full transition-all duration-500"
                      style={{ width: `${totalIncome + totalExpense > 0 ? Math.min(100, Math.max(5, (totalIncome / (totalIncome + totalExpense)) * 100)) : 50}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1 font-mono">
                    <span className="text-rose-300">Pengeluaran ({(totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense) * 100).toFixed(1) : 0)}%)</span>
                    <span className="text-rose-400 font-bold">Rp {(totalExpense / 100).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-500"
                      style={{ width: `${totalIncome + totalExpense > 0 ? Math.min(100, Math.max(5, (totalExpense / (totalIncome + totalExpense)) * 100)) : 50}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === cat
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            {/* Transactions Table */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Nama Transaksi</th>
                      <th className="px-4 py-3">Kategori</th>
                      <th className="px-4 py-3">Tipe</th>
                      <th className="px-4 py-3">Nominal (Rupiah)</th>
                      <th className="px-4 py-3">Waktu</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          Belum ada catatan transaksi. Klik tombol Catat Transaksi di atas.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((r) => {
                        const isIncome = r.type === 'income' || r.category.toLowerCase().includes('pemasukan') || r.category.toLowerCase().includes('gaji');
                        return (
                          <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-medium text-white">{r.title}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                                {r.category}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${isIncome ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'}`}>
                                {isIncome ? '+ Pemasukan' : '- Pengeluaran'}
                              </span>
                            </td>
                            <td className={`px-4 py-3 font-mono font-bold ${isIncome ? 'text-sky-400' : 'text-rose-400'}`}>
                              {isIncome ? '+' : '-'} Rp {(r.amount_cents / 100).toLocaleString('id-ID')}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[11px] font-mono">
                              {new Date(r.created_at).toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteRecord(r.id)}
                                className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                  confirmDeleteId === r.id
                                    ? 'bg-rose-600 text-white font-bold'
                                    : 'text-slate-400 hover:text-rose-400'
                                }`}
                              >
                                {confirmDeleteId === r.id ? 'Yakin Hapus?' : 'Hapus'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: ADMIN PANEL */}
        {activeRole === 'admin' && (
          <div className="space-y-6">
            {/* Admin Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Pengguna Terdaftar</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">
                  {users.length} Akun
                </div>
                <span className="text-[11px] text-emerald-400 mt-1 block">Role Admin & User Aktif</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Total Aktivitas Transaksi</span>
                <div className="text-2xl font-extrabold text-violet-400 mt-1 font-mono">
                  {records.length} Transaksi
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Aktivitas Global Sistem</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Status Hak Akses</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">
                  Administrator
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">Akses CRUD Penuh</span>
              </div>
            </div>

            {/* Users Management Table */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Daftar Pengguna Sistem (Panel Admin)</h3>
                  <p className="text-xs text-slate-400">Kelola akun, tambah pengguna baru, dan pantau aktivitas pengguna.</p>
                </div>
                <button
                  onClick={() => setIsUserModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Tambah User
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Nama Lengkap</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-300">@{u.username}</td>
                        <td className="px-4 py-3 text-slate-400">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === 'Admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-violet-500/20 text-violet-300 border border-violet-500/40'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                            {u.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {u.username !== 'admin' ? (
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                              title="Hapus User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500">Superadmin</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: ADD TRANSACTION */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Catat Transaksi Keuangan</h2>
            <form onSubmit={handleCreateRecord} className="space-y-3">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setNewType('income'); setNewCategory('Pemasukan'); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${newType === 'income' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  + Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => { setNewType('expense'); setNewCategory('Makanan & Belanja'); }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${newType === 'expense' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
                >
                  - Pengeluaran
                </button>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Deskripsi Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder={newType === 'income' ? 'Misal: Gaji Pokok, Freelance Web' : 'Misal: Makan Siang, Belanja Bulanan'}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Nominal (Rupiah)</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 150000"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  {newType === 'income' ? (
                    <>
                      <option value="Pemasukan">Pemasukan Gaji</option>
                      <option value="Freelance">Proyek Sampingan / Freelance</option>
                      <option value="Investasi">Dividen / Investasi</option>
                      <option value="Lainnya">Pemasukan Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Makanan & Belanja">Makanan & Minuman</option>
                      <option value="Tagihan Rutin">Tagihan Listrik / Air / Internet</option>
                      <option value="Transportasi">Bensin & Transportasi</option>
                      <option value="Kebutuhan Rumah">Kebutuhan Rumah Tangga</option>
                      <option value="Hiburan">Hiburan & Rekreasi</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-lg shadow-violet-600/30"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD USER (ADMIN) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white">Tambah Pengguna Baru (Panel Admin)</h2>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ahmad Rifai"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: ahmad"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="Misal: ahmad@gmail.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Peran / Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="User">User Biasa</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-lg shadow-amber-600/30"
                >
                  {isSubmitting ? 'Menambahkan...' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}