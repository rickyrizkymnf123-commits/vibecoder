'use client';

import { useState } from 'react';

const FREELANCE_PER_APP = 3_000_000; // ilustrasi biaya jasa developer per aplikasi sederhana
const KILAT_BASIC = 110_000;

function rupiah(n: number) {
  if (n >= 1_000_000) {
    const jt = n / 1_000_000;
    return `Rp${Number.isInteger(jt) ? jt : jt.toFixed(1).replace('.', ',')} juta`;
  }
  return `Rp${Math.round(n / 1000)}rb`;
}

export default function CostCalculator() {
  const [apps, setApps] = useState(2);
  const [clientPrice, setClientPrice] = useState(500_000);

  const freelanceCost = apps * FREELANCE_PER_APP;
  const clientsToPayBack = Math.max(1, Math.ceil(KILAT_BASIC / clientPrice));

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <label className="text-sm text-slate-300">
          Kalau kamu pesan ke freelancer sebanyak
        </label>
        <div className="mt-1 text-2xl font-extrabold text-white">{apps} aplikasi</div>
        <input
          type="range"
          min={1}
          max={10}
          value={apps}
          onChange={(e) => setApps(Number(e.target.value))}
          className="mt-4 w-full accent-amber-400"
          aria-label="Jumlah aplikasi"
        />
        <div className="mt-5 text-4xl font-black text-rose-400">{rupiah(freelanceCost)}</div>
        <p className="mt-2 text-xs text-slate-400">
          Kisaran Rp3 juta per aplikasi sederhana × jumlah aplikasi. Belum termasuk revisi &amp; biaya hosting.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <label className="text-sm text-slate-300">Kalau kamu jual jasa bikin aplikasi ke UMKM seharga</label>
        <div className="mt-1 text-2xl font-extrabold text-white">{rupiah(clientPrice)}</div>
        <input
          type="range"
          min={100_000}
          max={3_000_000}
          step={100_000}
          value={clientPrice}
          onChange={(e) => setClientPrice(Number(e.target.value))}
          className="mt-4 w-full accent-amber-400"
          aria-label="Harga jual jasa"
        />
        <div className="mt-5 text-4xl font-black text-amber-300">
          {clientsToPayBack} klien
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Segitu yang udah nutup modal Paket Basic Rp110rb. Sisanya bisa jadi keuntungan kamu.
        </p>
      </div>

      <p className="md:col-span-2 text-[11px] text-slate-500 text-center">
        Angka di atas cuma ilustrasi dari harga jasa yang umum, bukan janji penghasilan. Semua dihitung di browser kamu.
      </p>
    </div>
  );
}
