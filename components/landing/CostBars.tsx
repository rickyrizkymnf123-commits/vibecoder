'use client';

import { useInView } from './Reveal';

const BARS = [
  { emoji: '😵‍💨', value: 20000, label: 'Rp 20jt+', desc: 'Agency / software house', color: 'from-rose-600 to-rose-500' },
  { emoji: '😰', value: 10000, label: 'Rp 10jt', desc: 'Bootcamp belajar coding', color: 'from-violet-600 to-violet-500' },
  { emoji: '😩', value: 6000, label: 'Rp 3–10jt', desc: 'Freelance developer', color: 'from-orange-500 to-amber-500' },
  { emoji: '🥱', value: 4000, label: '±Rp 4jt/thn', desc: 'AI builder luar (langganan dolar)', color: 'from-slate-600 to-slate-500' },
  { emoji: '🤩', value: 110, label: 'Rp 110rb', desc: 'Kilat Tools, sekali bayar', color: 'from-amber-400 to-yellow-300', highlight: true }
];

const MAX = 20000;

export default function CostBars() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div ref={ref}>
      <div className="flex h-72 items-end justify-center gap-2 sm:h-80 sm:gap-5">
        {BARS.map((b, i) => {
          const h = Math.max(8, (b.value / MAX) * 100);
          return (
            <div key={b.desc} className="flex h-full w-full max-w-[120px] flex-col items-center justify-end">
              <div className={`mb-2 text-2xl transition-all duration-500 sm:text-3xl ${inView ? 'opacity-100' : 'translate-y-4 opacity-0'}`} style={{ transitionDelay: `${i * 180 + 600}ms` }}>
                {b.emoji}
              </div>
              <div
                className={`relative flex w-full items-start justify-center rounded-t-xl bg-gradient-to-t ${b.color} transition-[height] duration-1000 ease-out ${
                  b.highlight ? 'shadow-[0_0_40px_rgba(251,191,36,0.6)]' : ''
                }`}
                style={{ height: inView ? `${h}%` : '0%', transitionDelay: `${i * 180}ms` }}
              >
                <span
                  className={`whitespace-nowrap pt-2 text-[11px] font-black sm:text-sm ${b.highlight ? 'absolute -top-7 text-amber-300' : 'text-white'}`}
                >
                  {b.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex justify-center gap-2 border-t border-slate-800 pt-3 sm:gap-5">
        {BARS.map((b) => (
          <div key={b.desc} className={`w-full max-w-[120px] text-center text-[10px] leading-tight sm:text-xs ${b.highlight ? 'font-bold text-amber-300' : 'text-slate-400'}`}>
            {b.desc}
          </div>
        ))}
      </div>
    </div>
  );
}
