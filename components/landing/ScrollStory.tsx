'use client';

import { useEffect, useRef, useState } from 'react';

/** Peran yang biasanya dibayar untuk bikin 1 aplikasi (angka ilustrasi). */
const ROLES = [
  { name: 'Analis', cost: 3, icon: '🧠' },
  { name: 'Desainer UI', cost: 5, icon: '🎨' },
  { name: 'Programmer', cost: 10, icon: '💻' },
  { name: 'Tester', cost: 3, icon: '🧪' },
  { name: 'Hosting', cost: 1, icon: '🌐' }
];
const TOTAL = ROLES.reduce((s, r) => s + r.cost, 0);

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
/** Progres lokal 0..1 di antara titik a dan b dari progres global p. */
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

const RING_LEN = 2 * Math.PI * 48;

const STEPS = ['Tim lama', 'Biayanya', 'Dicoret', 'Sekarang'];

/**
 * Section "nempel" saat di-scroll:
 * cincin tergambar → peran muncul mengelilingi + biaya naik → semua dicoret →
 * cincin meledak jadi cahaya kuning → "SEKARANG CUKUP KAMU."
 */
export default function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(clamp(-r.top / Math.max(1, total)));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Fase-fase animasi
  const hint = 1 - seg(p, 0.02, 0.1);
  const ringDraw = ease(seg(p, 0.02, 0.2));
  const nodesIn = seg(p, 0.12, 0.42) * ROLES.length; // berapa peran yang sudah muncul (desimal)
  const strike = seg(p, 0.48, 0.6); // coretan
  const collapse = ease(seg(p, 0.62, 0.74)); // cincin mengecil
  const burst = ease(seg(p, 0.7, 0.84)); // cahaya membesar
  const finale = ease(seg(p, 0.8, 0.92));

  const shownRoles = Math.min(ROLES.length, Math.floor(nodesIn + 0.001));
  const cost = ROLES.slice(0, shownRoles).reduce((s, r) => s + r.cost, 0);
  const ringRed = strike > 0;

  const step = p < 0.12 ? 0 : p < 0.46 ? 1 : p < 0.7 ? 2 : 3;
  const centerText =
    p < 0.12
      ? { a: 'Dulu, bikin 1 aplikasi', b: 'butuh satu tim lengkap.' }
      : p < 0.46
        ? { a: 'Tiap orang', b: 'dibayar terpisah.' }
        : { a: 'Itu sebelum aplikasinya', b: 'dipakai satu pelanggan pun.' };

  const ringScale = 1 - collapse * 0.85;
  const ringOpacity = 1 - seg(p, 0.7, 0.76);

  return (
    <div ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* Latar: cahaya kuning yang meledak */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(245,158,11,0.28) 28%, rgba(120,53,15,0.18) 48%, transparent 68%)',
            transform: `translate(-50%, -50%) scale(${0.02 + burst * 1.1})`,
            opacity: burst
          }}
        />
        <div className="kt-grid-bg pointer-events-none absolute inset-0" style={{ opacity: 0.35 + burst * 0.4 }} />

        {/* Partikel orbit saat finale */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(88vw,560px)] w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2" style={{ opacity: finale }}>
          <div className="absolute inset-0 animate-[spin_18s_linear_infinite] rounded-full border border-amber-200/20">
            <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow-[0_0_18px_6px_rgba(251,191,36,0.7)]" />
            <span className="absolute bottom-[12%] right-[6%] h-2 w-2 rounded-full bg-yellow-200 shadow-[0_0_12px_4px_rgba(253,224,71,0.6)]" />
          </div>
          <div className="absolute inset-[14%] animate-[spin_11s_linear_infinite_reverse] rounded-full border border-dashed border-amber-200/15">
            <span className="absolute bottom-0 left-1/2 h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-orange-300 shadow-[0_0_14px_5px_rgba(253,186,116,0.6)]" />
          </div>
        </div>

        {/* "Terus scroll" */}
        <div className="pointer-events-none absolute top-[9vh] flex flex-col items-center text-slate-300 transition-opacity" style={{ opacity: hint }}>
          <span className="text-2xl font-light tracking-tight sm:text-4xl">Terus scroll</span>
          <span className="mt-1 animate-bounce text-xl text-amber-400">↓</span>
        </div>

        {/* Cincin + peran */}
        <div
          className="relative aspect-square w-[62vw] sm:w-[min(72vw,440px)]"
          style={{ transform: `scale(${ringScale}) rotate(${collapse * 90}deg)`, opacity: ringOpacity }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="none"
              stroke={ringRed ? '#f43f5e' : '#fbbf24'}
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeDasharray={RING_LEN}
              strokeDashoffset={RING_LEN * (1 - ringDraw)}
              style={{ transition: 'stroke 0.4s' }}
            />
            {/* garis bantu tipis */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" />
          </svg>

          {/* Coretan X besar */}
          <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            {[
              [18, 18, 82, 82],
              [82, 18, 18, 82]
            ].map(([x1, y1, x2, y2], i) => {
              const len = Math.hypot(x2 - x1, y2 - y1);
              const t = seg(strike, i * 0.4, 0.6 + i * 0.4);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f43f5e"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeDasharray={len}
                  strokeDashoffset={len * (1 - t)}
                  style={{ filter: 'drop-shadow(0 0 3px rgba(244,63,94,0.8))' }}
                />
              );
            })}
          </svg>

          {/* Node peran */}
          {ROLES.map((r, i) => {
            const angle = (-90 + (360 / ROLES.length) * i) * (Math.PI / 180);
            const x = 50 + 48 * Math.cos(angle);
            const y = 50 + 48 * Math.sin(angle);
            const appear = ease(clamp(nodesIn - i));
            const struck = strike > 0.15 + i * 0.12;
            return (
              <div
                key={r.name}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: `translate(-50%, -50%) scale(${0.4 + appear * 0.6})`,
                  opacity: appear
                }}
              >
                <span
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-lg transition-colors duration-300 sm:px-3 sm:text-sm ${
                    struck ? 'border-rose-500/50 bg-rose-950/80 text-rose-300 line-through decoration-2' : 'border-amber-400/50 bg-slate-900 text-white shadow-amber-500/20'
                  }`}
                >
                  <span className="no-underline">{r.icon}</span> {r.name}
                </span>
                <span className={`mt-1 rounded-md px-1.5 font-mono text-[10px] font-bold sm:text-xs ${struck ? 'text-rose-400/70 line-through' : 'bg-amber-400/15 text-amber-300'}`}>
                  +Rp{r.cost}jt
                </span>
              </div>
            );
          })}

          {/* Teks tengah */}
          <div className="absolute inset-[18%] flex flex-col items-center justify-center text-center">
            <p key={centerText.a} className="kt-slide-up font-serif text-sm italic leading-snug text-slate-300 sm:text-lg">
              {centerText.a}
              <br />
              {centerText.b}
            </p>
            <div className="mt-3" style={{ opacity: seg(p, 0.14, 0.2) }}>
              <div className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Total biaya</div>
              <div className={`font-mono text-3xl font-black tabular-nums sm:text-5xl ${ringRed ? 'text-rose-400 line-through decoration-4' : 'text-white'}`}>
                Rp{cost}jt
              </div>
              <div className="font-mono text-[10px] text-slate-500">ilustrasi kisaran pasar</div>
            </div>
          </div>
        </div>

        {/* Finale */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
          style={{ opacity: finale, transform: `scale(${0.85 + finale * 0.15})` }}
        >
          <div className="font-mono text-xs font-bold uppercase tracking-[0.4em] text-amber-200">Sekarang</div>
          <div className="mt-3 text-6xl font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_4px_30px_rgba(251,191,36,0.5)] sm:text-8xl">
            CUKUP
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent">KAMU.</span>
          </div>
          <div className="mt-6 text-sm font-semibold text-amber-50 sm:text-lg">Plus tim AI Kilat Tools. Rp110rb, sekali bayar.</div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-200/30 bg-slate-950/60 px-5 py-3 font-mono backdrop-blur" style={{ opacity: seg(p, 0.88, 0.96) }}>
            <span className="text-lg font-bold text-rose-300/80 line-through sm:text-2xl">Rp{TOTAL}jt</span>
            <span className="text-amber-300">→</span>
            <span className="text-2xl font-black text-amber-300 sm:text-3xl">Rp110rb</span>
          </div>
        </div>

        {/* Indikator langkah */}
        <div className="absolute bottom-24 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  i === step ? 'bg-amber-400 text-slate-950' : i < step ? 'bg-slate-800 text-amber-300' : 'bg-slate-900 text-slate-600'
                }`}
              >
                <span className="sm:hidden">{i + 1}</span>
                <span className="hidden sm:inline">{s}</span>
              </span>
              {i < STEPS.length - 1 && <span className={`h-px w-4 sm:w-6 ${i < step ? 'bg-amber-400' : 'bg-slate-700'}`} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
