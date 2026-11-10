'use client';

import { useEffect, useRef, useState } from 'react';

const ROLES = ['Analis', 'Desainer UI', 'Programmer', 'Tester', 'Urus hosting'];

/** Section yang "nempel" saat di-scroll: peran-peran dicoret satu per satu, lalu muncul "CUKUP KAMU". */
export default function ScrollStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(Math.min(1, Math.max(0, -r.top / Math.max(1, total))));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const rolesShown = Math.min(ROLES.length, Math.floor(p * 9));
  const struck = Math.min(ROLES.length, Math.max(0, Math.floor((p - 0.45) * 14)));
  const finale = p > 0.78;

  return (
    <div ref={ref} className="relative h-[260vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.18),transparent_60%)] transition-opacity duration-700 ${finale ? 'opacity-100' : 'opacity-0'}`} />

        <div className="relative flex flex-wrap justify-center gap-2 sm:gap-3">
          {ROLES.map((r, i) => (
            <span
              key={r}
              className={`rounded-full border px-4 py-2 text-sm font-bold transition-all duration-500 sm:text-base ${
                i < rolesShown ? 'opacity-100' : 'translate-y-3 opacity-0'
              } ${i < struck ? 'border-slate-800 text-slate-600 line-through decoration-rose-500 decoration-2' : 'border-slate-600 bg-slate-900 text-slate-200'}`}
            >
              {r}
            </span>
          ))}
        </div>

        <p className={`relative mt-8 max-w-xl text-xl font-bold text-slate-300 transition-all duration-500 sm:text-3xl ${p > 0.12 ? 'opacity-100' : 'opacity-0'}`}>
          Dulu, bikin 1 aplikasi butuh tim sebanyak ini.
        </p>
        <p className={`relative mt-3 max-w-xl text-base text-slate-500 transition-all duration-500 sm:text-lg ${p > 0.3 ? 'opacity-100' : 'opacity-0'}`}>
          Biayanya jutaan, waktunya berminggu-minggu. Itu sebelum aplikasinya kepakai.
        </p>

        <div className={`relative mt-10 transition-all duration-700 ${finale ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Sekarang</div>
          <div className="mt-2 text-5xl font-black leading-none text-white sm:text-7xl">
            CUKUP <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">KAMU.</span>
          </div>
          <div className="mt-4 text-sm text-slate-300 sm:text-base">Plus tim AI Kilat Tools. Rp110rb, sekali bayar.</div>
        </div>

        <div className="absolute bottom-8 left-1/2 h-1 w-40 -translate-x-1/2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full bg-amber-400" style={{ width: `${p * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
