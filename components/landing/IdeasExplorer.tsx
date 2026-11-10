'use client';

import { useState } from 'react';

const CATS = ['Semua', '🏪 UMKM', '💼 Jasa', '🏫 Pendidikan', '🏢 Kantor', '🙋 Pribadi'] as const;

const IDEAS: { emoji: string; name: string; desc: string; cat: (typeof CATS)[number] }[] = [
  { emoji: '🧾', name: 'Kasir Warung', desc: 'Transaksi, struk & laporan harian', cat: '🏪 UMKM' },
  { emoji: '📦', name: 'Stok Gudang', desc: 'Barang masuk-keluar + peringatan stok tipis', cat: '🏪 UMKM' },
  { emoji: '🛍️', name: 'Katalog Toko', desc: 'Etalase produk + tombol order WhatsApp', cat: '🏪 UMKM' },
  { emoji: '🏷️', name: 'Kalkulator HPP', desc: 'Hitung modal & harga jual produk', cat: '🏪 UMKM' },
  { emoji: '💈', name: 'Booking Salon', desc: 'Pelanggan pilih jadwal sendiri', cat: '💼 Jasa' },
  { emoji: '🎫', name: 'Antrian Klinik', desc: 'Nomor antrian & panggilan pasien', cat: '💼 Jasa' },
  { emoji: '🧺', name: 'Laundry Tracker', desc: 'Status cucian: diproses, siap, diambil', cat: '💼 Jasa' },
  { emoji: '📚', name: 'Nilai Siswa', desc: 'Input nilai & rekap rapor', cat: '🏫 Pendidikan' },
  { emoji: '📿', name: 'Setoran Hafalan', desc: 'Catat progres hafalan santri', cat: '🏫 Pendidikan' },
  { emoji: '📝', name: 'Kuis Online', desc: 'Soal pilihan ganda + skor otomatis', cat: '🏫 Pendidikan' },
  { emoji: '🕘', name: 'Absensi Karyawan', desc: 'Jam masuk, izin & rekap bulanan', cat: '🏢 Kantor' },
  { emoji: '🗂️', name: 'Inventaris Kantor', desc: 'Data aset & peminjaman barang', cat: '🏢 Kantor' },
  { emoji: '✅', name: 'Tugas Tim', desc: 'Papan tugas & tenggat sederhana', cat: '🏢 Kantor' },
  { emoji: '💰', name: 'Catatan Keuangan', desc: 'Pemasukan, pengeluaran & grafik', cat: '🙋 Pribadi' },
  { emoji: '💌', name: 'Undangan Digital', desc: 'Undangan + RSVP tamu', cat: '🙋 Pribadi' },
  { emoji: '🏋️', name: 'Jurnal Olahraga', desc: 'Catat latihan & progres mingguan', cat: '🙋 Pribadi' }
];

export default function IdeasExplorer() {
  const [cat, setCat] = useState<(typeof CATS)[number]>('Semua');
  const list = cat === 'Semua' ? IDEAS : IDEAS.filter((i) => i.cat === cat);

  return (
    <div>
      <div className="kt-no-scrollbar flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
              cat === c ? 'border-amber-400 bg-amber-400 text-slate-950' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {list.map((i) => (
          <div key={i.name} className="kt-pop rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-1 hover:border-amber-400/50 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="text-3xl">{i.emoji}</div>
            <div className="mt-2 font-bold text-white">{i.name}</div>
            <div className="mt-0.5 text-xs text-slate-400">{i.desc}</div>
            <div className="mt-3 text-[10px] font-semibold text-amber-300">Web-app · siap online</div>
          </div>
        ))}
      </div>
    </div>
  );
}
