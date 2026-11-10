'use client';

import { useEffect, useState } from 'react';
import {
  Home,
  MessageSquare,
  Activity,
  Monitor,
  Smartphone,
  Rocket,
  Paintbrush,
  Check,
  Loader2,
  Lock,
  Globe,
  Plus,
  Minus,
  Zap
} from 'lucide-react';
import { useInView } from './Reveal';

const TABS = [
  { id: 'ringkasan', label: 'Ringkasan', icon: Home, caption: 'Ringkasan: 6 peran AI ngerjain aplikasimu satu per satu, dari rancangan sampai online.' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, caption: 'Chat: ceritain aplikasinya pakai bahasa sehari-hari, AI langsung paham.' },
  { id: 'aktivitas', label: 'Aktivitas', icon: Activity, caption: 'Aktivitas: setiap langkah AI tampil live lengkap dengan progres persen.' },
  { id: 'preview', label: 'Preview', icon: Monitor, caption: 'Preview: coba aplikasinya langsung, tampilan desktop & HP. Klik tombol + dan − di dalamnya.' },
  { id: 'publish', label: 'Publikasi', icon: Rocket, caption: 'Publikasi: satu klik, aplikasimu online di subdomain sendiri dengan SSL.' },
  { id: 'revisi', label: 'Revisi', icon: Paintbrush, caption: 'Revisi: minta perubahan lewat chat, aplikasinya langsung diperbarui.' }
] as const;

type TabId = (typeof TABS)[number]['id'];

const AGENTS = [
  { name: 'AI Analis', role: 'Rancang fitur & alur', color: 'border-l-sky-400' },
  { name: 'AI Desainer', role: 'Susun tampilan & warna', color: 'border-l-pink-400' },
  { name: 'AI Programmer', role: 'Tulis HTML, CSS, JS', color: 'border-l-violet-400' },
  { name: 'AI Penguji', role: 'Cek file & error', color: 'border-l-emerald-400' },
  { name: 'AI Publisher', role: 'Online-kan ke subdomain', color: 'border-l-amber-400' },
  { name: 'AI Revisi', role: 'Siaga buat perubahan', color: 'border-l-orange-400' }
];

const MENU = [
  { n: 'Kopi Susu Aren', p: 22000, e: '🧋' },
  { n: 'Americano', p: 18000, e: '☕' },
  { n: 'Croissant', p: 25000, e: '🥐' },
  { n: 'Teh Lemon', p: 15000, e: '🍋' }
];

export default function AppStudioDemo() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const [tab, setTab] = useState<TabId>('ringkasan');
  const [auto, setAuto] = useState(true);
  const [tick, setTick] = useState(0);

  // Waktu berjalan untuk animasi di dalam tab
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(id);
  }, [inView]);

  // Ganti tab otomatis tiap 6 detik sampai pengguna klik sendiri
  useEffect(() => {
    if (!auto || !inView) return;
    const id = setInterval(() => {
      setTab((cur) => TABS[(TABS.findIndex((x) => x.id === cur) + 1) % TABS.length].id);
      setTick(0);
    }, 6000);
    return () => clearInterval(id);
  }, [auto, inView]);

  const choose = (id: TabId) => {
    setAuto(false);
    setTab(id);
    setTick(0);
  };

  const current = TABS.find((x) => x.id === tab)!;

  return (
    <div ref={ref}>
      <div className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0b0f19] shadow-2xl shadow-black/60">
        {/* Window bar */}
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950 px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <div className="mx-auto flex max-w-xs flex-1 items-center justify-center gap-1.5 rounded-md bg-slate-900 px-3 py-1 font-mono text-[11px] text-slate-400">
            <Lock className="h-3 w-3" /> kilatstools.my.id / studio / kedai-kopi
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="hidden w-14 shrink-0 flex-col items-center gap-3 border-r border-slate-800 bg-slate-950/60 py-4 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300">
              <Zap className="h-5 w-5 fill-slate-950 text-slate-950" />
            </div>
            {TABS.map((x) => (
              <button
                key={x.id}
                onClick={() => choose(x.id)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${tab === x.id ? 'bg-amber-400/15 text-amber-300' : 'text-slate-500 hover:text-slate-200'}`}
                aria-label={x.label}
              >
                <x.icon className="h-4 w-4" />
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6">
              <div>
                <div className="text-lg font-black text-white">Kedai Kopi POS</div>
                <div className="font-mono text-[11px] text-slate-400">kasir & stok kedai kopi · 6/6 AI selesai</div>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
              </span>
            </div>

            {/* Tabs */}
            <div className="kt-no-scrollbar mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-6">
              {TABS.map((x) => (
                <button
                  key={x.id}
                  onClick={() => choose(x.id)}
                  className={`relative shrink-0 overflow-hidden rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    tab === x.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {x.label}
                  {tab === x.id && auto && <span className="absolute bottom-0 left-0 h-0.5 animate-[kt-progress_6s_linear] bg-slate-950/50" style={{ width: '100%' }} />}
                </button>
              ))}
            </div>

            {/* Body */}
            <div key={tab} className="kt-slide-up h-[360px] overflow-hidden px-4 py-4 sm:px-6">
              {tab === 'ringkasan' && <Ringkasan tick={tick} />}
              {tab === 'chat' && <Chat tick={tick} />}
              {tab === 'aktivitas' && <Aktivitas tick={tick} />}
              {tab === 'preview' && <Preview />}
              {tab === 'publish' && <Publish tick={tick} />}
              {tab === 'revisi' && <Revisi tick={tick} />}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center text-sm text-slate-400">
        <b className="text-slate-200">{current.label}</b>: {current.caption.split(': ').slice(1).join(': ')}
      </p>
      <p className="mt-1 text-center text-[11px] text-slate-500">
        {auto ? 'Demo jalan sendiri · tap tab buat lihat tiap fitur' : 'Tap tab lain buat lihat fitur berikutnya'}
      </p>
    </div>
  );
}

function Ringkasan({ tick }: { tick: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
        <span className="text-xs text-slate-300">Biaya jasa developer yang kamu keluarkan</span>
        <span className="font-mono text-lg font-black text-emerald-300">Rp0</span>
      </div>
      {AGENTS.map((a, i) => {
        const done = tick > i * 2 + 1;
        const working = !done && tick >= i * 2;
        return (
          <div key={a.name} className={`flex items-center justify-between rounded-lg border border-slate-800 border-l-4 ${a.color} bg-slate-900/70 px-3 py-2`}>
            <div className="min-w-0">
              <div className="text-sm font-bold text-white">{a.name}</div>
              <div className="truncate text-[11px] text-slate-400">{a.role}</div>
            </div>
            {done ? (
              <span className="kt-pop rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">Selesai</span>
            ) : working ? (
              <span className="flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-[11px] font-bold text-amber-300">
                <Loader2 className="h-3 w-3 animate-spin" /> Proses
              </span>
            ) : (
              <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500">Antri</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Chat({ tick }: { tick: number }) {
  const msgs = [
    { me: true, t: 'Bikinin aplikasi kasir buat kedai kopi aku. Ada menu, stok, dan laporan harian ya.' },
    { me: false, t: 'Siap! Aku rancang 3 halaman: Kasir, Stok, dan Laporan. Tampilannya aku bikin enak dipakai di HP.' },
    { me: true, t: 'Tambahin cetak struk juga bisa?' },
    { me: false, t: 'Bisa. Tombol "Cetak Struk" aku taruh di halaman kasir. Lagi aku tulis kodenya… ✍️' }
  ];
  const shown = Math.min(msgs.length, Math.floor(tick / 2) + 1);
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2.5 overflow-hidden">
        {msgs.slice(0, shown).map((m, i) => (
          <div key={i} className={`kt-slide-up flex ${m.me ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.me ? 'rounded-br-sm bg-amber-400 text-slate-950' : 'rounded-bl-sm bg-slate-800 text-slate-100'}`}>{m.t}</div>
          </div>
        ))}
        {shown < msgs.length && (
          <div className="flex gap-1 pl-2">
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:120ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-slate-500 [animation-delay:240ms]" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-500">
        Ketik permintaan atau revisi… <span className="ml-auto rounded-md bg-amber-400 px-2 py-1 text-xs font-bold text-slate-950">Kirim</span>
      </div>
    </div>
  );
}

function Aktivitas({ tick }: { tick: number }) {
  const steps = ['Menyusun rencana aplikasi', 'Menulis public/index.html', 'Menulis public/style.css', 'Menulis public/app.js', 'Cek file yang direferensikan', 'Tes sintaks JavaScript', 'Menerbitkan aplikasi'];
  const done = Math.min(steps.length, Math.floor(tick / 1.3));
  const pct = Math.round((done / steps.length) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-widest text-slate-400">Aktivitas & langkah kerja</span>
        <span className={`font-mono font-bold ${pct === 100 ? 'text-emerald-300' : 'text-amber-300'}`}>{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-3 space-y-1.5">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm ${i === done ? 'kt-shimmer bg-slate-900' : ''}`}>
            {i < done ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : i === done ? (
              <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            ) : (
              <span className="h-4 w-4 rounded-full border border-slate-600" />
            )}
            <span className={i <= done ? 'text-slate-100' : 'text-slate-500'}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Preview() {
  const [mobile, setMobile] = useState(false);
  const [qty, setQty] = useState<number[]>([1, 0, 1, 0]);
  const total = MENU.reduce((s, m, i) => s + m.p * qty[i], 0);
  const change = (i: number, d: number) => setQty((q) => q.map((v, j) => (j === i ? Math.max(0, v + d) : v)));

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end gap-1">
        <button onClick={() => setMobile(false)} className={`rounded-md p-1.5 ${!mobile ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`} aria-label="Desktop">
          <Monitor className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => setMobile(true)} className={`rounded-md p-1.5 ${mobile ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`} aria-label="HP">
          <Smartphone className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="flex flex-1 items-start justify-center overflow-hidden">
        <div className={`overflow-hidden rounded-xl bg-white text-slate-900 shadow-xl transition-all duration-500 ${mobile ? 'w-52' : 'w-full'}`}>
          <div className="flex items-center justify-between bg-amber-500 px-3 py-2 text-white">
            <span className="text-sm font-black">☕ Kedai Kopi</span>
            <span className="text-[10px] font-semibold">Kasir · Stok · Laporan</span>
          </div>
          <div className={`grid gap-2 p-2.5 ${mobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {MENU.map((m, i) => (
              <div key={m.n} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                <span className="text-xl">{m.e}</span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-bold">{m.n}</div>
                  <div className="text-[10px] text-slate-500">Rp{m.p.toLocaleString('id-ID')}</div>
                </div>
                <button onClick={() => change(i, -1)} className="rounded bg-slate-100 p-1" aria-label={`Kurangi ${m.n}`}>
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-4 text-center text-xs font-bold">{qty[i]}</span>
                <button onClick={() => change(i, 1)} className="rounded bg-amber-500 p-1 text-white" aria-label={`Tambah ${m.n}`}>
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="mx-2.5 mb-2.5 flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2 text-white">
            <span className="text-xs">Total</span>
            <span className="text-sm font-black">Rp{total.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Publish({ tick }: { tick: number }) {
  const published = tick >= 3;
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Alamat aplikasi</div>
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-sm text-slate-100">
          <Lock className="h-4 w-4 text-emerald-400" />
          <span className="truncate">kedaikopi.kilatstools.my.id/pos</span>
        </div>
        <button className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-bold transition ${published ? 'bg-emerald-500 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
          {published ? (
            <>
              <Check className="h-4 w-4" /> Sudah Online
            </>
          ) : tick >= 1 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Menerbitkan…
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" /> Terbitkan Sekarang
            </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
          <Lock className="h-4 w-4 text-emerald-400" />
          <div className="mt-1.5 text-sm font-bold text-white">SSL / HTTPS</div>
          <div className="text-[11px] text-emerald-300">{published ? 'Aktif' : 'Menyiapkan…'}</div>
        </div>
        <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3">
          <Globe className="h-4 w-4 text-violet-300" />
          <div className="mt-1.5 text-sm font-bold text-white">Domain sendiri</div>
          <div className="text-[11px] text-violet-300">Tersedia di Paket Pro</div>
        </div>
      </div>
    </div>
  );
}

function Revisi({ tick }: { tick: number }) {
  const changed = tick >= 4;
  return (
    <div className="grid h-full gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="self-end rounded-2xl rounded-br-sm bg-amber-400 px-3.5 py-2 text-sm text-slate-950">Ganti warnanya jadi hijau, terus tambahin menu Matcha ya</div>
        {tick >= 2 && (
          <div className="kt-slide-up self-start rounded-2xl rounded-bl-sm bg-slate-800 px-3.5 py-2 text-sm text-slate-100">
            {changed ? 'Beres! Warna jadi hijau & menu Matcha udah ditambah ✅' : 'Oke, lagi aku ubah…'}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl bg-white text-slate-900 shadow-xl">
        <div className={`px-3 py-2 text-sm font-black text-white transition-colors duration-700 ${changed ? 'bg-emerald-600' : 'bg-amber-500'}`}>☕ Kedai Kopi</div>
        <div className="space-y-1.5 p-2.5 text-xs">
          {['Kopi Susu Aren', 'Americano', 'Croissant'].map((n) => (
            <div key={n} className="flex justify-between rounded border border-slate-200 px-2 py-1.5">
              {n} <span className={changed ? 'text-emerald-600' : 'text-amber-600'}>+</span>
            </div>
          ))}
          {changed && (
            <div className="kt-pop flex justify-between rounded border border-emerald-400 bg-emerald-50 px-2 py-1.5">
              Matcha Latte <span className="text-emerald-600">BARU</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
