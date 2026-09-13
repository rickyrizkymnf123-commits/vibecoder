'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Coins,
  Cpu,
  Crown,
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

export default function BillingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [simulatingWebhook, setSimulatingWebhook] = useState(false);

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

  const handleBuy = async (packageId: string) => {
    setPurchasing(packageId);
    try {
      const res = await fetch('/api/payments/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId })
      });

      const data = await res.json();
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

  const handleSimulateWebhook = async (itemType: string, amount: number) => {
    setSimulatingWebhook(true);
    try {
      const orderId = `VC-SIM-${Date.now()}`;
      await fetch('/api/payments/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId:
            itemType === 'app_credit_bundle'
              ? 'bundle_1'
              : itemType === 'ai_credit_topup'
              ? 'ai_topup_100k'
              : 'pro_monthly'
        })
      });

      const serverKey = 'SB-Mid-server-TEST_SANDBOX_KEY_FORGE';
      await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: orderId,
          status_code: '200',
          gross_amount: `${amount}.00`,
          signature_key: 'dummy-sha512-simulated',
          transaction_status: 'settlement'
        })
      });

      await fetchUserData();
      alert('Simulasi settlement pembayaran berhasil diperbarui!');
    } catch {
      await fetchUserData();
    } finally {
      setSimulatingWebhook(false);
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
        {/* Package 1: Top Up Kredit App (Format Persis VibeCoder) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-5 shadow-2xl hover:border-violet-500/50 transition-all relative overflow-hidden">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Top Up Kredit App</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Rp100.000 = 1 slot app baru — plus 100.000 Kredit AI buat build &amp; revisi.
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
                  <span>Top Up Kredit App</span>
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
              <p className="text-slate-400 font-medium text-[11px]">Sekali bayar, bukan langganan.</p>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>1 app siap publish</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>100.000 Kredit AI buat build &amp; revisi</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2.5} />
                  <span>Tidak ada langganan atau kontrak bulanan</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleBuy('topup_app_100k')}
              disabled={purchasing === 'topup_app_100k'}
              className="w-full py-3.5 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50 active:scale-[0.98]"
            >
              {purchasing === 'topup_app_100k' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Bayar Sekarang'
              )}
            </button>
            <button
              onClick={() => handleSimulateWebhook('app_credit_bundle', 110000)}
              disabled={simulatingWebhook}
              className="w-full py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 transition-colors"
            >
              ⚡ Instant Sandbox Top-up (Dev Mode)
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
                <span><b>+100.000 Kredit AI</b></span>
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
            <button
              onClick={() => handleSimulateWebhook('ai_credit_topup', 25000)}
              disabled={simulatingWebhook}
              className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-400 transition-colors"
            >
              ⚡ Instant Sandbox Top-up
            </button>
          </div>
        </div>

        {/* Package 3: Pro Tier Subscription (Paling Populer & Glowing Purple Palette) */}
        <div className="relative p-6 rounded-2xl bg-gradient-to-b from-[#7c3aed]/25 via-slate-900 to-slate-900 border-2 border-[#7c3aed] flex flex-col justify-between space-y-6 shadow-2xl shadow-violet-950/50">
          {/* Badge Paling Populer */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#6366f1] to-[#7c3aed] text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md shadow-violet-600/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Paling Populer
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
                Forge Tier Pro
              </span>
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mt-3">
              Rp 149.000 <span className="text-xs font-normal text-slate-400">/ 30 hari</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Akses penuh ekspor kode &amp; integrasi repo</p>
            <div className="my-4 border-t border-slate-800" />
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Download Source Code (.ZIP)</b></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Export Database Postgres (SQL / CSV)</b></span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Push ke GitHub Repo</b> via Personal PAT</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span><b>Storage Pribadi 10GB</b> Supabase Bucket</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bonus <b>5 Slot App</b> + <b>250.000 Kredit AI</b></span>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleBuy('pro_monthly')}
              disabled={purchasing === 'pro_monthly'}
              className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#7c3aed] hover:opacity-95 active:scale-[0.98] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/40 disabled:opacity-50"
            >
              {purchasing === 'pro_monthly' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-300" /> Berlangganan Pro
                </>
              )}
            </button>
            <button
              onClick={() => handleSimulateWebhook('pro_monthly', 149000)}
              disabled={simulatingWebhook}
              className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-300 transition-colors"
            >
              ⚡ Instant Pro Activation Sandbox
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
