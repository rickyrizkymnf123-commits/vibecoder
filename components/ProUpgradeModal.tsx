'use client';

import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  X,
  Loader2,
  Download,
  Database,
  GitBranch,
  HardDrive,
  Cpu,
  Headphones
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface ProUpgradeModalProps {
  user: UserProfile | null;
  onSuccess?: () => void;
}

export function ProUpgradeModal({ user, onSuccess }: ProUpgradeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Don't show if already Pro or Admin
    if (user.is_pro || user.role === 'admin') return;

    // Check localStorage if already dismissed
    const storageKey = `kilat_dismissed_pro_modal_${user.id}`;
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      // Small timeout to allow dashboard to render smoothly before opening modal
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    if (user?.id) {
      localStorage.setItem(`kilat_dismissed_pro_modal_${user.id}`, 'true');
    }
    setIsOpen(false);
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/snap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: 'pro_upgrade_100k' })
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Gagal memproses upgrade');
        setLoading(false);
        return;
      }

      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
      } else {
        alert('Order upgrade berhasil dibuat: ' + data.orderId);
      }
      handleDismiss();
      if (onSuccess) onSuccess();
    } catch {
      alert('Terjadi kesalahan koneksi saat memproses upgrade');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user || user.is_pro) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-violet-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/60 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors"
          title="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold tracking-wide">
            <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>KHUSUS PENGGUNA BASIC</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
            Upgrade ke <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-violet-300 to-fuchsia-400">Tier Pro</span> — Cukup Tambah Rp 100.000
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Dapatkan kontrol penuh atas kode dan data aplikasi web Anda dengan 6 keuntungan eksklusif Pro:
          </p>
        </div>

        {/* Benefit Items */}
        <div className="my-5 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-start gap-2 text-slate-200">
              <Download className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>Download Source (.ZIP)</b></span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span><b>Export Database SQL/CSV</b></span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <GitBranch className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
              <span><b>Push ke GitHub Pribadi</b></span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <HardDrive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span><b>Storage 10 GB File Manager</b></span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <Cpu className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
              <span><b>100.000 Token AI</b> (+50k ekstra)</span>
            </div>
            <div className="flex items-start gap-2 text-slate-200">
              <Headphones className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>Prioritas Support &amp; Domain</b></span>
            </div>
          </div>
        </div>

        {/* Price & Action CTA */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-black text-sm tracking-wide shadow-xl shadow-purple-600/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>⭐ Upgrade ke Pro Sekarang (+Rp 100.000)</span>
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-medium text-center"
          >
            Nanti saja, lanjutkan dengan paket Basic
          </button>
        </div>
      </div>
    </div>
  );
}
