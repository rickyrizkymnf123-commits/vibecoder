'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Copy, RotateCcw, Sparkles } from 'lucide-react';

const QUESTIONS = [
  {
    key: 'bidang',
    q: 'Usaha atau kegiatan kamu di bidang apa?',
    options: ['Warung / kafe / kuliner', 'Toko / jualan online', 'Jasa (salon, laundry, bengkel)', 'Sekolah / pesantren / kursus', 'Kantor / organisasi']
  },
  {
    key: 'masalah',
    q: 'Apa yang paling bikin repot sekarang?',
    options: ['Catat penjualan & hitung uang', 'Ngecek stok barang', 'Atur jadwal / booking pelanggan', 'Data anggota / siswa / karyawan', 'Bikin laporan bulanan']
  },
  {
    key: 'pengguna',
    q: 'Siapa yang bakal pakai aplikasinya?',
    options: ['Saya sendiri', 'Saya + karyawan', 'Pelanggan saya']
  },
  {
    key: 'perangkat',
    q: 'Paling sering dibuka dari mana?',
    options: ['HP', 'Laptop / komputer', 'Dua-duanya']
  }
] as const;

const APP_BY_PROBLEM: Record<string, { name: string; emoji: string; features: string[] }> = {
  'Catat penjualan & hitung uang': { name: 'Aplikasi Kasir', emoji: '🧾', features: ['daftar produk & harga', 'keranjang dan total otomatis', 'cetak/simpan struk', 'laporan penjualan harian'] },
  'Ngecek stok barang': { name: 'Aplikasi Stok Barang', emoji: '📦', features: ['data barang & jumlah stok', 'catat barang masuk dan keluar', 'peringatan stok menipis', 'riwayat pergerakan stok'] },
  'Atur jadwal / booking pelanggan': { name: 'Aplikasi Booking', emoji: '📅', features: ['pilihan layanan & harga', 'kalender slot jadwal', 'form booking pelanggan', 'daftar booking hari ini'] },
  'Data anggota / siswa / karyawan': { name: 'Aplikasi Data Anggota', emoji: '🗂️', features: ['form tambah & ubah data', 'pencarian dan filter', 'status aktif / nonaktif', 'ekspor daftar'] },
  'Bikin laporan bulanan': { name: 'Aplikasi Laporan Keuangan', emoji: '📊', features: ['catat pemasukan & pengeluaran', 'kategori transaksi', 'grafik bulanan', 'ringkasan laba/rugi'] }
};

export default function AppPlanQuiz() {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const finished = answers.length === QUESTIONS.length;

  const pick = (opt: string) => {
    const next = [...answers.slice(0, step), opt];
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
  };

  const reset = () => {
    setAnswers([]);
    setStep(0);
    setCopied(false);
  };

  if (!started) {
    return (
      <div className="rounded-3xl border border-amber-400/30 bg-gradient-to-br from-amber-400/10 to-slate-900 p-8 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-amber-300" />
        <h3 className="mt-3 text-2xl font-black text-white">Rancang aplikasi pertamamu, 1 menit.</h3>
        <p className="mt-2 text-sm text-slate-300">4 pertanyaan singkat. Nggak minta email. Hasilnya: ide aplikasi + perintah siap ditempel ke Kilat Tools.</p>
        <button onClick={() => setStarted(true)} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-300">
          Mulai kuis <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (finished) {
    const [bidang, masalah, pengguna, perangkat] = answers;
    const app = APP_BY_PROBLEM[masalah];
    const prompt = `Bikinin ${app.name.toLowerCase()} untuk ${bidang.toLowerCase()}. Fiturnya: ${app.features.join(', ')}. Yang pakai: ${pengguna.toLowerCase()}. Tampilannya harus nyaman dibuka di ${perangkat === 'Dua-duanya' ? 'HP dan laptop' : perangkat.toLowerCase()}, simpel, dan pakai bahasa Indonesia.`;

    return (
      <div className="kt-pop rounded-3xl border border-amber-400/40 bg-slate-900/80 p-6 sm:p-8">
        <div className="font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">Rencana aplikasimu</div>
        <div className="mt-3 flex items-center gap-3">
          <span className="text-4xl">{app.emoji}</span>
          <div>
            <div className="text-2xl font-black text-white">{app.name}</div>
            <div className="text-sm text-slate-400">untuk {bidang.toLowerCase()}</div>
          </div>
        </div>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {app.features.map((f) => (
            <li key={f} className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2 text-sm text-slate-200">
              <Check className="h-4 w-4 text-emerald-400" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Perintah siap tempel ke Kilat Tools</span>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(prompt).then(() => setCopied(true)).catch(() => null);
              }}
              className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />} {copied ? 'Tersalin' : 'Salin'}
            </button>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-200">“{prompt}”</p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-300">
            Bikin aplikasi ini sekarang <ArrowRight className="h-4 w-4" />
          </Link>
          <button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500">
            <RotateCcw className="h-4 w-4" /> Ulangi
          </button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[step];
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          Pertanyaan {step + 1} dari {QUESTIONS.length}
        </span>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="hover:text-white">
            ← Kembali
          </button>
        )}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${(step / QUESTIONS.length) * 100}%` }} />
      </div>
      <h3 key={q.key} className="kt-slide-up mt-5 text-xl font-black text-white sm:text-2xl">
        {q.q}
      </h3>
      <div className="mt-5 grid gap-2.5">
        {q.options.map((o) => (
          <button
            key={o}
            onClick={() => pick(o)}
            className={`kt-slide-up rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
              answers[step] === o ? 'border-amber-400 bg-amber-400/10 text-amber-200' : 'border-slate-700 bg-slate-950/50 text-slate-200 hover:border-amber-400/60'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
