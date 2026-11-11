'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

/**
 * Preview video YouTube: tampil thumbnail + tombol play dulu (ringan, nggak muat player YouTube),
 * player baru dimuat dan langsung diputar saat diklik.
 */
export default function YouTubeDemo({ videoId, title = 'Video demo Kilat Tools' }: { videoId: string; title?: string }) {
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState(`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-black shadow-2xl shadow-amber-500/10">
        <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="kt-ping absolute inline-flex h-full w-full rounded-full bg-rose-500" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <span className="font-mono text-[11px] font-bold tracking-widest text-slate-300">VIDEO PENJELASAN · KILAT TOOLS</span>
        </div>

        <div className="relative aspect-video w-full">
          {playing ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <button onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label={`Putar ${title}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt={title}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                onLoad={(e) => {
                  // maxresdefault yang tidak tersedia dikembalikan sebagai gambar kecil 120px -> pakai hqdefault
                  if ((e.currentTarget as HTMLImageElement).naturalWidth <= 120) setThumb(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
                }}
                onError={() => setThumb(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="relative flex h-20 w-20 items-center justify-center">
                  <span className="kt-ping absolute inset-0 rounded-full bg-amber-400/50" />
                  <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-yellow-300 shadow-xl shadow-amber-500/40 transition group-hover:scale-110">
                    <Play className="ml-1 h-9 w-9 fill-slate-950 text-slate-950" />
                  </span>
                </span>
                <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white">👆 Tap buat putar · nyalain suara 🔊</span>
              </span>
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
        <span>🔊 Nyalain suara</span>
        <span>📱 Enak ditonton di HP</span>
      </div>
    </div>
  );
}
