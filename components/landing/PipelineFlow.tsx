'use client';

import { useEffect, useState } from 'react';
import { Zap, Lock, Check } from 'lucide-react';
import { useInView } from './Reveal';

const INPUTS = ['Ide', 'Desain', 'Kode', 'Tes', 'Hosting'];

/** Semua kerjaan masuk ke Kilat Studio, keluar jadi aplikasi online di HP. */
export default function PipelineFlow() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const [pct, setPct] = useState(0);
  const [orders, setOrders] = useState(3);

  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setPct((p) => (p >= 100 ? 100 : p + 4)), 120);
    return () => clearInterval(id);
  }, [inView]);

  useEffect(() => {
    if (pct < 100) return;
    const id = setInterval(() => setOrders((o) => (o >= 12 ? 3 : o + 1)), 1600);
    return () => clearInterval(id);
  }, [pct]);

  const done = pct >= 100;

  return (
    <div ref={ref} className="mx-auto max-w-3xl">
      {/* Input chips */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {INPUTS.map((x, i) => (
          <span
            key={x}
            className={`rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 transition-all duration-500 sm:text-sm ${inView ? 'opacity-100' : 'translate-y-3 opacity-0'}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            {x}
          </span>
        ))}
      </div>

      {/* Converging dotted lines */}
      <svg viewBox="0 0 600 90" className="mx-auto h-16 w-full max-w-xl sm:h-20" preserveAspectRatio="none" aria-hidden>
        {[60, 180, 300, 420, 540].map((x) => (
          <path key={x} d={`M ${x} 0 C ${x} 50, 300 40, 300 90`} fill="none" stroke="rgb(251 191 36 / 0.7)" strokeWidth="2" className="kt-dash" />
        ))}
      </svg>

      {/* Studio card */}
      <div className="mx-auto max-w-md rounded-2xl border border-amber-400/40 bg-slate-900/90 p-4 shadow-xl shadow-amber-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-300">
              <Zap className="h-4 w-4 fill-slate-950 text-slate-950" />
            </div>
            <span className="text-sm font-bold text-white">Kilat Studio</span>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${done ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>
            {done ? '● Selesai' : '● Membangun'}
          </span>
        </div>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-slate-400">Progres aplikasi</div>
            <div className="font-mono text-2xl font-black text-white">{pct}%</div>
          </div>
          <div className="flex h-12 items-end gap-1">
            {[30, 45, 38, 60, 52, 70, 64, 85, 100].map((h, i) => (
              <div
                key={i}
                className={`w-3 rounded-t transition-all duration-500 ${i === 8 ? 'bg-emerald-400' : 'bg-amber-400/70'}`}
                style={{ height: `${pct >= (i + 1) * 11 ? h : 6}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="my-3 flex flex-col items-center font-mono text-[10px] font-bold uppercase tracking-widest text-amber-300/80">
        <svg width="2" height="34" aria-hidden>
          <line x1="1" y1="0" x2="1" y2="34" stroke="rgb(251 191 36 / 0.7)" strokeWidth="2" className="kt-dash" />
        </svg>
        Terbit → langsung dipakai pelanggan
      </div>

      {/* Phone */}
      <div className="kt-float mx-auto w-64 rounded-[34px] border-[6px] border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-amber-500/10">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-slate-700" />
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-slate-900 px-2 py-1.5 font-mono text-[10px] text-slate-300">
          <Lock className="h-3 w-3 text-emerald-400" /> kedaikopi.kilatstools.my.id
        </div>
        <div className="mt-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3 text-white">
          <div className="text-[11px] opacity-90">Pesanan hari ini (contoh)</div>
          <div className="font-mono text-3xl font-black">{done ? orders : 0}</div>
          <div className="text-[10px] opacity-90">tercatat otomatis di aplikasimu</div>
        </div>
        <div className="mt-2 space-y-1.5">
          {['Kopi Susu Aren ×2', 'Croissant ×1', 'Americano ×1'].map((x, i) => (
            <div key={x} className={`flex items-center justify-between rounded-lg bg-slate-900 px-2.5 py-2 text-[11px] text-slate-200 transition-opacity duration-500 ${done ? 'opacity-100' : 'opacity-20'}`} style={{ transitionDelay: `${i * 200}ms` }}>
              {x} <Check className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-center text-[11px] text-slate-500">Ilustrasi tampilan aplikasi kasir yang dibuat dengan Kilat Tools.</p>
    </div>
  );
}
