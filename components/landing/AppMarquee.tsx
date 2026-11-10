const APPS = [
  { title: 'Kasir Warung', emoji: '🧾', bar: 'bg-amber-500', rows: ['Nasi Goreng · 18rb', 'Es Teh · 5rb', 'Total · 23rb'] },
  { title: 'Booking Salon', emoji: '💇', bar: 'bg-pink-500', rows: ['10:00 · Potong', '13:00 · Creambath', '15:30 · Kosong'] },
  { title: 'Stok Gudang', emoji: '📦', bar: 'bg-sky-500', rows: ['Beras 5kg · 42', 'Minyak 2L · 8 ⚠️', 'Gula 1kg · 60'] },
  { title: 'Absensi', emoji: '🕘', bar: 'bg-emerald-500', rows: ['Rina · 07:58 ✓', 'Budi · 08:03 ✓', 'Sari · Izin'] },
  { title: 'Undangan', emoji: '💌', bar: 'bg-rose-400', rows: ['Andi & Laras', 'Sabtu, 14 Feb', 'RSVP · 128 tamu'] },
  { title: 'Keuangan', emoji: '💰', bar: 'bg-teal-500', rows: ['Masuk · 4,2jt', 'Keluar · 1,8jt', 'Saldo · 2,4jt'] },
  { title: 'Antrian Klinik', emoji: '🎫', bar: 'bg-indigo-500', rows: ['Dipanggil · A-12', 'Berikutnya · A-13', 'Menunggu · 7'] },
  { title: 'Katalog Toko', emoji: '🛍️', bar: 'bg-orange-500', rows: ['Kaos Polos · 65rb', 'Hoodie · 150rb', 'Order via WA'] },
  { title: 'Nilai Siswa', emoji: '📚', bar: 'bg-violet-500', rows: ['Matematika · 88', 'B. Indo · 92', 'Rata-rata · 90'] },
  { title: 'Kos-kosan', emoji: '🏠', bar: 'bg-lime-600', rows: ['Kamar 1 · Lunas', 'Kamar 2 · Jatuh tempo', 'Kamar 3 · Lunas'] }
];

function Phone({ app }: { app: (typeof APPS)[number] }) {
  return (
    <div className="w-40 shrink-0 rounded-[26px] border-[5px] border-slate-700 bg-white p-0 shadow-xl sm:w-44">
      <div className="mx-auto mt-1 h-1.5 w-12 rounded-full bg-slate-300" />
      <div className={`mx-2 mt-2 rounded-lg ${app.bar} px-2 py-1.5 text-[11px] font-black text-white`}>
        {app.emoji} {app.title}
      </div>
      <div className="space-y-1.5 p-2">
        {app.rows.map((r) => (
          <div key={r} className="rounded-md bg-slate-100 px-2 py-1.5 text-[10px] font-medium text-slate-700">
            {r}
          </div>
        ))}
        <div className={`rounded-md ${app.bar} py-1.5 text-center text-[10px] font-bold text-white`}>+ Tambah</div>
      </div>
      <div className="flex items-center justify-between rounded-b-[20px] bg-slate-900 px-2.5 py-1.5 font-mono text-[8px] text-slate-300">
        <span>AI · KILAT</span>
        <span className="text-emerald-400">● online</span>
      </div>
    </div>
  );
}

export default function AppMarquee() {
  const row1 = [...APPS, ...APPS];
  const row2 = [...APPS.slice(5), ...APPS.slice(0, 5), ...APPS.slice(5), ...APPS.slice(0, 5)];
  return (
    <div className="kt-marquee-wrap relative space-y-5 overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
      <div className="kt-marquee flex w-max gap-5">
        {row1.map((a, i) => (
          <Phone key={`a${i}`} app={a} />
        ))}
      </div>
      <div className="kt-marquee-reverse flex w-max gap-5">
        {row2.map((a, i) => (
          <Phone key={`b${i}`} app={a} />
        ))}
      </div>
    </div>
  );
}
