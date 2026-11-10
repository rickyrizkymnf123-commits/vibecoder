'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Check, Loader2, Lock, Share2, Plus } from 'lucide-react';
import { useInView } from './Reveal';

const TOTAL = 26000;
const PROMPT = 'Bikinin aplikasi kasir buat kedai kopi aku, ada daftar menu, stok, dan laporan penjualan harian.';

const CHAPTERS = [
  { at: 0, label: 'Ketik ide' },
  { at: 5000, label: 'AI merancang' },
  { at: 9500, label: 'Nulis kode' },
  { at: 14500, label: 'Tes otomatis' },
  { at: 17500, label: 'Preview' },
  { at: 22000, label: 'Online!' }
];

const PLAN = ['Halaman kasir + keranjang', 'Daftar menu & stok', 'Laporan penjualan harian', 'Tampilan rapi di HP'];

const CODE = [
  { c: 'text-violet-300', t: '<section id="kasir" class="pos">' },
  { c: 'text-sky-300', t: '  <h1>Kedai Kopi · Kasir</h1>' },
  { c: 'text-amber-200', t: 'const menu = loadMenu();' },
  { c: 'text-amber-200', t: 'function tambahKeKeranjang(item) {' },
  { c: 'text-emerald-300', t: '  keranjang.push(item); hitungTotal();' },
  { c: 'text-amber-200', t: '}' },
  { c: 'text-pink-300', t: '.pos { display:grid; gap:12px; }' },
  { c: 'text-amber-200', t: 'simpanLaporanHarian(transaksi);' }
];

const TESTS = ['index.html ditemukan', 'app.js lolos cek sintaks', 'style.css terhubung', 'Semua tombol berfungsi'];

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `0:${String(s).padStart(2, '0')}`;
}

export default function HeroVideoDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.35);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const last = useRef<number | null>(null);

  // Mulai otomatis saat terlihat
  useEffect(() => {
    if (inView && !started) {
      setStarted(true);
      setPlaying(true);
    }
  }, [inView, started]);

  useEffect(() => {
    if (!playing) {
      last.current = null;
      return;
    }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current != null) {
        const dt = now - last.current;
        setT((prev) => {
          const next = prev + dt;
          if (next >= TOTAL) {
            setPlaying(false);
            return TOTAL;
          }
          return next;
        });
      }
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const chapterIdx = CHAPTERS.reduce((acc, c, i) => (t >= c.at ? i : acc), 0);
  const seek = (ms: number) => {
    setT(ms);
    setPlaying(true);
    setStarted(true);
  };

  const ended = t >= TOTAL;

  return (
    <div ref={ref} className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-[#0b0f19] shadow-2xl shadow-amber-500/10">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="kt-ping absolute inline-flex h-full w-full rounded-full bg-rose-500" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
            <span className="font-mono text-[11px] font-bold tracking-widest text-slate-300">VIDEO DEMO · KILAT STUDIO</span>
          </div>
          <span className="rounded-md bg-amber-400/15 px-2 py-0.5 font-mono text-[11px] font-bold text-amber-300">
            {CHAPTERS[chapterIdx].label}
          </span>
        </div>

        {/* Stage */}
        <div className="relative h-[340px] sm:h-[380px]">
          <div className="kt-grid-bg absolute inset-0 opacity-60" />
          <div className="relative flex h-full items-center justify-center p-4 sm:p-8">
            <Scene t={t} idx={chapterIdx} />
          </div>

          {(!started || ended || !playing) && (
            <button
              onClick={() => (ended ? seek(0) : setPlaying(true))}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-[2px]"
              aria-label="Putar demo"
            >
              <span className="relative flex h-20 w-20 items-center justify-center">
                <span className="kt-ping absolute inset-0 rounded-full bg-amber-400/50" />
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 shadow-xl shadow-amber-500/40">
                  {ended ? <RotateCcw className="h-8 w-8 text-slate-950" /> : <Play className="ml-1 h-9 w-9 fill-slate-950 text-slate-950" />}
                </span>
              </span>
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">
                {ended ? 'Putar ulang' : started ? 'Lanjutkan' : '👆 Tap buat putar'}
              </span>
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="border-t border-slate-800 bg-slate-950/80 px-4 py-3">
          <div
            className="relative h-1.5 cursor-pointer rounded-full bg-slate-800"
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek(((e.clientX - r.left) / r.width) * TOTAL);
            }}
          >
            <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300" style={{ width: `${(t / TOTAL) * 100}%` }} />
            {CHAPTERS.slice(1).map((c) => (
              <span key={c.at} className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 bg-slate-950" style={{ left: `${(c.at / TOTAL) * 100}%` }} />
            ))}
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
            <button onClick={() => (ended ? seek(0) : setPlaying((p) => !p))} className="flex items-center gap-1.5 font-semibold text-slate-200 hover:text-white">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {playing ? 'Jeda' : 'Putar'}
            </button>
            <span className="font-mono">
              {fmt(t)} / {fmt(TOTAL)}
            </span>
          </div>
        </div>
      </div>

      {/* Chapter chips */}
      <div className="mt-5 text-center font-mono text-[11px] font-bold uppercase tracking-widest text-slate-500">Lompat ke bagian</div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {CHAPTERS.map((c, i) => (
          <button
            key={c.at}
            onClick={() => seek(c.at)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              i === chapterIdx ? 'border-amber-400 bg-amber-400/15 text-amber-200' : 'border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-600'
            }`}
          >
            <span className="mr-1.5 font-mono text-amber-400">{fmt(c.at)}</span>
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Scene({ t, idx }: { t: number; idx: number }) {
  const local = t - CHAPTERS[idx].at;

  if (idx === 0) {
    const chars = Math.min(PROMPT.length, Math.floor(local / 38));
    return (
      <div className="w-full max-w-xl kt-slide-up">
        <div className="mb-3 text-center text-sm text-slate-400">1. Kamu cukup ceritain idenya…</div>
        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
          <div className="min-h-[72px] text-base leading-relaxed text-white sm:text-lg">
            {PROMPT.slice(0, chars)}
            <span className="kt-caret ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-amber-300" />
          </div>
          <div className="mt-3 flex justify-end">
            <span className={`rounded-lg px-4 py-2 text-sm font-bold transition ${chars >= PROMPT.length ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'}`}>
              Kirim ⚡
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (idx === 1) {
    return (
      <div className="w-full max-w-md kt-slide-up">
        <div className="mb-3 text-center text-sm text-slate-400">2. AI menyusun rencana aplikasinya</div>
        <div className="space-y-2.5">
          {PLAN.map((p, i) => {
            const done = local > 700 + i * 900;
            const active = !done && local > i * 900;
            return (
              <div key={p} className={`flex items-center gap-3 rounded-xl border p-3 transition ${done ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/80'}`}>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {done ? <Check className="h-4 w-4" /> : active ? <Loader2 className="h-4 w-4 animate-spin" /> : i + 1}
                </span>
                <span className={`text-sm ${done ? 'text-white' : 'text-slate-400'}`}>{p}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (idx === 2) {
    const shown = Math.min(CODE.length, Math.floor(local / 550) + 1);
    const pct = Math.min(100, Math.round((local / 5000) * 100));
    return (
      <div className="w-full max-w-xl kt-slide-up">
        <div className="mb-3 text-center text-sm text-slate-400">3. AI nulis semua kodenya, kamu cukup nonton</div>
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#0a0d16] shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 px-3 py-2 font-mono text-[11px] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2">public/app.js</span>
            <span className="ml-auto text-amber-300">{pct}%</span>
          </div>
          <div className="space-y-1 p-4 font-mono text-[12px] sm:text-[13px]">
            {CODE.slice(0, shown).map((l, i) => (
              <div key={i} className={`kt-slide-up ${l.c}`}>
                <span className="mr-3 select-none text-slate-600">{String(i + 1).padStart(2, '0')}</span>
                {l.t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (idx === 3) {
    return (
      <div className="w-full max-w-md kt-slide-up">
        <div className="mb-3 text-center text-sm text-slate-400">4. Dites otomatis sebelum online</div>
        <div className="space-y-2">
          {TESTS.map((x, i) => {
            const ok = local > 400 + i * 600;
            return (
              <div key={x} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-2.5 font-mono text-sm">
                <span className={ok ? 'text-white' : 'text-slate-500'}>{x}</span>
                {ok ? <span className="kt-pop rounded bg-emerald-500/20 px-2 text-xs font-bold text-emerald-300">LOLOS</span> : <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (idx === 4) {
    const items = Math.min(3, Math.floor(local / 1000));
    const total = [18000, 22000, 15000].slice(0, items).reduce((a, b) => a + b, 0);
    return (
      <div className="flex w-full max-w-xl flex-col items-center kt-slide-up">
        <div className="mb-3 text-center text-sm text-slate-400">5. Aplikasinya langsung bisa dicoba</div>
        <div className="w-60 rounded-[28px] border-4 border-slate-700 bg-white p-3 text-slate-900 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm font-black">☕ Kedai Kopi</div>
            <div className="rounded-full bg-amber-100 px-2 text-[10px] font-bold text-amber-700">Kasir</div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {[
              { n: 'Latte', p: '18rb' },
              { n: 'Aren', p: '22rb' },
              { n: 'Teh', p: '15rb' }
            ].map((m, i) => (
              <div key={m.n} className={`rounded-lg border p-1.5 text-center transition ${i < items ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                <div className="text-lg">☕</div>
                <div className="text-[10px] font-bold">{m.n}</div>
                <div className="text-[9px] text-slate-500">{m.p}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2 text-[10px]">
            {['Latte', 'Aren', 'Teh'].slice(0, items).map((n) => (
              <div key={n} className="kt-slide-up flex justify-between">
                <span>{n}</span>
                <Plus className="h-3 w-3 text-emerald-600" />
              </div>
            ))}
            {items === 0 && <div className="text-slate-400">Keranjang kosong</div>}
          </div>
          <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
            <span className="text-[10px]">Total</span>
            <span className="text-sm font-black">Rp{total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg text-center kt-slide-up">
      <div className="kt-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl shadow-emerald-500/40">
        <Check className="h-9 w-9" />
      </div>
      <div className="mt-4 text-2xl font-black text-white sm:text-3xl">Aplikasimu udah online! 🎉</div>
      <div className="mx-auto mt-4 flex max-w-sm items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-left font-mono text-xs text-slate-200 sm:text-sm">
        <Lock className="h-4 w-4 shrink-0 text-emerald-400" />
        <span className="truncate">kedaikopi.kilatstools.my.id/kasir</span>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">
        <Share2 className="h-4 w-4" /> Bagikan ke karyawan
      </div>
    </div>
  );
}
