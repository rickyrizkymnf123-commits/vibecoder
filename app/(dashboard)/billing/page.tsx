'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Cpu,
  Crown,
  Check,
  CheckCircle2,
  Loader2,
  CreditCard,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Star,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { ONLINE_PAYMENT_ENABLED, buildAdminWhatsAppLink, buildPaymentConfirmationMessage } from '@/lib/contact';

export default function BillingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppConfirmation = (packageId: string) => {
    const link = buildAdminWhatsAppLink(
      buildPaymentConfirmationMessage({ username: user?.username, email: user?.email, packageId })
    );
    if (link) {
      window.open(link, '_blank');
    } else {
      alert('Silakan hubungi admin Kilat Tools untuk konfirmasi pembayaran paket ini.');
    }
  };

  const handleBuy = async (packageId: string) => {
    // Mode default: pembayaran manual, konfirmasi ke WhatsApp admin, lalu admin menambahkan kredit.
    if (!ONLINE_PAYMENT_ENABLED) {
      openWhatsAppConfirmation(packageId);
      return;
    }
    setPurchasing(packageId);
    try {
      const res = await fetch('/api/payments/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      const data = await res.json();
      if (data.useWhatsApp) {
        openWhatsAppConfirmation(packageId);
        setPurchasing(null);
        return;
      }
      if (!res.ok) {
        alert(data.error || 'Gagal membuat transaksi');
        setPurchasing(null);
        return;
      }

      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      } else {
        alert(`Transaksi berhasil dibuat: ${data.orderId}`);
      }
    } catch {
      alert('Terjadi kendala memproses pembayaran');
    } finally {
      setPurchasing(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back Link & Header (Matched with Gambar 6) */}
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
            <Coins className="w-6 h-6 text-violet-400" /> Billing &amp; Paket Kredit
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Beli slot Kredit App untuk mem-publish aplikasi baru, top-up Kredit AI, atau upgrade ke Tier Pro.
          </p>
        </div>
      </div>

      {/* Current Balances Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* App Credits */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kredit App Tersisa</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {user?.app_credits ?? 0}
            <span className="text-xs font-normal text-slate-500 ml-2">slot publikasi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Dipasang 1 slot per aplikasi ter-publish.
          </p>
        </div>

        {/* AI Credits */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Kredit AI Tersisa</span>
            <Cpu className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            {user?.ai_credits ? (user.ai_credits / 1000).toFixed(0) + 'k' : '0k'}
            <span className="text-xs font-normal text-slate-500 ml-2">
              ({user?.ai_credits?.toLocaleString('id-ID') ?? 0} token)
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Dipotong seiring pemakaian token agen ReAct.
          </p>
        </div>

        {/* Status Langganan */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Status Langganan</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-extrabold text-white mt-2 flex items-center gap-2">
            {user?.is_pro ? (
              <span className="text-amber-300 flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Pro Aktif
              </span>
            ) : (
              <span className="text-slate-400">Free Starter</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {user?.is_pro && user?.pro_until
              ? `Aktif sampai ${new Date(user.pro_until).toLocaleDateString('id-ID')}`
              : 'Upgrade ke Pro untuk ekspor database & ZIP source code'}
          </p>
        </div>
      </div>

      {/* Packages Grid with Purple Palette (#6366f1 / #7c3aed) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {/* Package 1: Paket Basic (Rp 110.000) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-5 shadow-2xl hover:border-violet-500/50 transition-all relative overflow-hidden">
          <div className="space-y-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span>Tier Basic</span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Paket Basic</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rp100.000 = 1 slot aplikasi baru — plus 50.000 Kredit AI buat build &amp; revisi.
              </p>
            </div>

            {/* Inner Order Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-3">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>📄</span>
                <span>RINGKASAN PESANAN</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Paket Basic (1 App)</span>
                  <span className="font-semibold text-white">Rp100.000</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Biaya Transaksi</span>
                  <span className="font-mono text-slate-400">+Rp10.000</span>
                </div>
                <div className="pt-2 border-t border-slate-800/90 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-200">Total</span>
                  <span className="text-xl font-extrabold text-indigo-300 font-mono">Rp110.000</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <p className="text-slate-400 font-medium text-[11px]">Sekali bayar per aplikasi.</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>Termasuk 1 aplikasi web siap publish</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>Revisi/perbaikan gratis — 50rb Kredit AI</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>Subdomain &amp; hosting gratis SSL selamanya</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>SQLite database &amp; akses data cepat via CDN</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleBuy('basic_110k')}
              disabled={purchasing === 'basic_110k'}
              className="w-full py-3.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {purchasing === 'basic_110k' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Beli Paket Basic (Rp 110.000)'
              )}
            </button>
          </div>
        </div>

        {/* Package 2: AI Quota Top-Up */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col justify-between space-y-6 shadow-xl hover:border-violet-500/40 transition-colors">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-600/15 border border-violet-500/30 text-violet-300 text-[10px] font-bold uppercase tracking-wider">
              <span>Top-Up AI Quota</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              Rp 25.000
            </div>
            <p className="text-xs text-slate-400 mt-1">Hanya menambah token pemrosesan AI</p>
            <div className="my-4 border-t border-slate-800" />
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0" />
                <span><b>+100.000 Kredit AI Token</b></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0" />
                <span>Bebas chat &amp; minta revisi tanpa henti</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0" />
                <span>Masa berlaku selamanya (tidak hangus)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#6366f1] shrink-0" />
                <span>Eksekusi tool calling tanpa limitasi</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleBuy('ai_topup_100k')}
              disabled={purchasing === 'ai_topup_100k'}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {purchasing === 'ai_topup_100k' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-violet-400" /> Top-Up 100k Token
                </>
              )}
            </button>
          </div>
        </div>

        {/* Package 3: Pro Tier Package (Paling Populer & Glowing Purple Palette) */}
        <div className="relative p-6 rounded-3xl bg-gradient-to-b from-[#7c3aed]/25 via-slate-900 to-slate-900 border-2 border-[#7c3aed] flex flex-col justify-between space-y-6 shadow-2xl shadow-violet-950/50">
          {/* Badge Paling Populer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md shadow-amber-500/30 flex items-center gap-1">
            <Sparkles className="w-3 h-3 fill-slate-950" /> PALING LENGKAP
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Tier Pro
              </span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              {user?.is_paid && !user?.is_pro ? (
                <>
                  +Rp 100.000 <span className="text-xs font-normal text-amber-300">(Upgrade Basic)</span>
                </>
              ) : (
                <>
                  Rp 210.000 <span className="text-xs font-normal text-slate-400">/ 1 app + pro</span>
                </>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {user?.is_paid && !user?.is_pro
                ? 'Upgrade akun Basic Anda ke Pro: +50rb AI + Akses Semua Fitur Pro'
                : '1 Slot App + 100.000 Token AI + Seluruh Fitur Pro Eksklusif'}
            </p>
            <div className="my-4 border-t border-slate-800" />
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>100.000 Kredit AI Token</b> (Lebih Banyak Buat Revisi)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Download Source Code (.ZIP)</b> Fisik</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span><b>Export Database Postgres (SQL / CSV)</b></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span><b>Push ke GitHub Repo</b> via Personal PAT</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span><b>Storage Pribadi 10GB</b> &amp; Custom Domain</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Prioritas Support Teknis</b></span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleBuy(user?.is_paid && !user?.is_pro ? 'pro_upgrade_100k' : 'pro_210k')}
              disabled={purchasing === 'pro_upgrade_100k' || purchasing === 'pro_210k'}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6366f1] via-[#7c3aed] to-amber-500 hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/40 disabled:opacity-50"
            >
              {purchasing === 'pro_upgrade_100k' || purchasing === 'pro_210k' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" />
                  {user?.is_paid && !user?.is_pro ? '⭐ Upgrade ke Pro (+Rp 100.000)' : '⭐ Beli Paket Pro (Rp 210.000)'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Midtrans Sandbox Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Mode Gateway: <b>Midtrans Snap Sandbox</b> terintegrasi webhook SHA-512 otomatis.
          </span>
        </div>
      </div>
    </div>
  );
}
