import Link from 'next/link';
import LandingLiveDemoStudio from '@/components/LandingLiveDemoStudio';
import CostCalculator from '@/components/landing/CostCalculator';
import { buildAdminWhatsAppLink } from '@/lib/contact';
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  MessageSquareText,
  Palette,
  Code2,
  FlaskConical,
  Rocket,
  Wrench,
  Monitor,
  ListChecks,
  Globe,
  FileArchive,
  Database,
  Github,
  HardDrive,
  UserPlus,
  Wallet,
  BadgeCheck,
  ChevronDown,
  MessageCircle
} from 'lucide-react';

const CTA_HREF = '/register';

const aiTeam = [
  { code: 'AI-01', role: 'ANALIS', title: 'Penerjemah Ide', desc: 'Ubah obrolan kamu jadi daftar fitur & alur aplikasi yang jelas.', icon: MessageSquareText },
  { code: 'AI-02', role: 'DESAIN', title: 'Desainer UI', desc: 'Susun tampilan modern & responsif, enak dibuka di HP maupun laptop.', icon: Palette },
  { code: 'AI-03', role: 'PROGRAMMER', title: 'Penulis Kode', desc: 'Nulis HTML, CSS & JavaScript lengkap. Kamu nggak perlu sentuh kodenya.', icon: Code2 },
  { code: 'AI-04', role: 'PENGUJI', title: 'Quality Check', desc: 'Ngecek file yang kurang & error sebelum aplikasi diterbitkan.', icon: FlaskConical },
  { code: 'AI-05', role: 'PUBLISHER', title: 'Tukang Online-in', desc: 'Terbitin aplikasi ke subdomain kamu sendiri, langsung bisa dibagikan.', icon: Rocket },
  { code: 'AI-06', role: 'REVISI', title: 'Asisten Revisi', desc: 'Mau ganti warna, tambah menu, atau fitur baru? Tinggal bilang.', icon: Wrench }
];

const costs = [
  { emoji: '😵‍💨', price: 'Rp 20jt+', label: 'Agency software house (per proyek)' },
  { emoji: '😰', price: 'Rp 3–10jt', label: 'Freelance developer (per aplikasi)' },
  { emoji: '😩', price: '$20+/bln', label: 'AI builder luar negeri (langganan, pakai dolar)' },
  { emoji: '🥱', price: 'Berbulan-bulan', label: 'Belajar ngoding sendiri dari nol' }
];

const features = [
  {
    tag: '01 · CHAT BUILDER',
    title: 'Cukup Ngobrol, Aplikasi Jadi.',
    desc: 'Tulis ide pakai bahasa sehari-hari, misalnya "bikinin aplikasi kasir buat warung kopi, ada stok & laporan harian". AI langsung merancang, menulis kode, dan merakit aplikasinya.',
    chip: 'bahasa Indonesia · tanpa coding',
    icon: MessageSquareText
  },
  {
    tag: '02 · AKTIVITAS LIVE',
    title: 'Kamu Lihat AI-nya Kerja, Langkah demi Langkah.',
    desc: 'Setiap file yang ditulis dan setiap pengecekan muncul di panel aktivitas lengkap dengan progres persen. Nggak ada loading misterius.',
    chip: 'progres real-time',
    icon: ListChecks
  },
  {
    tag: '03 · PREVIEW INSTAN',
    title: 'Cek Tampilan Desktop & HP Sebelum Terbit.',
    desc: 'Preview langsung di samping chat. Coba klik-klik aplikasinya, kalau ada yang kurang pas tinggal minta revisi.',
    chip: 'preview desktop + mobile',
    icon: Monitor
  },
  {
    tag: '04 · ONLINE 1 KLIK',
    title: 'Langsung Punya Link Sendiri.',
    desc: 'Aplikasi terbit di namakamu.kilatstools.my.id/nama-aplikasi, sudah HTTPS. Paket Pro bisa pakai domain sendiri.',
    chip: 'subdomain + SSL gratis',
    icon: Globe
  }
];

const proPerks = [
  { icon: FileArchive, text: 'Download source code (.ZIP)' },
  { icon: Database, text: 'Export database (SQL / CSV)' },
  { icon: Github, text: 'Push ke repo GitHub kamu' },
  { icon: HardDrive, text: 'Storage pribadi 10GB + custom domain' }
];

const ideas = [
  { emoji: '🧾', name: 'Kasir Warung', desc: 'Transaksi, stok & laporan harian', tag: 'UMKM' },
  { emoji: '📦', name: 'Stok Gudang', desc: 'Barang masuk-keluar + notifikasi stok tipis', tag: 'UMKM' },
  { emoji: '💈', name: 'Booking Salon', desc: 'Pelanggan pilih jadwal sendiri', tag: 'Jasa' },
  { emoji: '🕘', name: 'Absensi Karyawan', desc: 'Jam masuk, izin & rekap bulanan', tag: 'Kantor' },
  { emoji: '🛍️', name: 'Katalog Toko', desc: 'Etalase produk + order via WhatsApp', tag: 'Jualan' },
  { emoji: '💌', name: 'Undangan Digital', desc: 'Undangan nikah + RSVP tamu', tag: 'Event' },
  { emoji: '🏷️', name: 'Kalkulator HPP', desc: 'Hitung modal & harga jual', tag: 'Jualan' },
  { emoji: '💰', name: 'Catatan Keuangan', desc: 'Pemasukan, pengeluaran & grafik', tag: 'Pribadi' },
  { emoji: '🎫', name: 'Antrian Klinik', desc: 'Nomor antrian & panggilan pasien', tag: 'Jasa' },
  { emoji: '📚', name: 'Nilai Siswa', desc: 'Input nilai & cetak rapor', tag: 'Sekolah' },
  { emoji: '📿', name: 'Setoran Hafalan', desc: 'Catat progres hafalan santri', tag: 'Pendidikan' },
  { emoji: '🏠', name: 'Kos-kosan', desc: 'Data penghuni & tagihan bulanan', tag: 'Properti' }
];

const faqs = [
  {
    q: 'Saya sama sekali nggak bisa coding, bisa pakai?',
    a: 'Bisa. Kilat Tools dibuat justru untuk yang nggak bisa coding. Kamu cukup jelasin aplikasi yang kamu mau pakai bahasa sehari-hari, AI yang ngerjain sisanya.'
  },
  {
    q: 'Bayarnya bulanan atau sekali?',
    a: 'Sekali bayar, tanpa langganan. Paket Basic Rp110.000 dan Pro Rp210.000. Kalau kredit AI habis, bisa top-up 100.000 kredit seharga Rp25.000.'
  },
  {
    q: 'Apa itu Kredit App dan Kredit AI?',
    a: 'Kredit App = jatah untuk menerbitkan 1 aplikasi online. Kredit AI = "bensin" untuk AI saat membuat & merevisi aplikasi. Setiap paket dapat 1 Kredit App + 100.000 Kredit AI.'
  },
  {
    q: 'Gimana cara bayarnya?',
    a: 'Daftar akun dulu, lalu transfer dan kirim bukti pembayaran ke WhatsApp admin. Setelah admin konfirmasi (ACC), akun kamu aktif dan kredit langsung masuk.'
  },
  {
    q: 'Aplikasinya bisa diubah setelah jadi?',
    a: 'Bisa. Buka lagi chat-nya dan minta perubahan, misalnya ganti warna, tambah menu, atau fitur baru. AI akan memperbarui aplikasimu.'
  },
  {
    q: 'Aplikasi saya bisa dilihat orang lain?',
    a: 'Aplikasi yang sudah kamu terbitkan bisa dibuka siapa saja lewat link-nya, jadi bisa langsung dibagikan ke pelanggan. Proyek setiap pengguna terpisah, jadi pengguna lain nggak bisa mengubah aplikasimu.'
  },
  {
    q: 'Bisa pakai domain sendiri?',
    a: 'Bisa di Paket Pro. Paket Basic memakai subdomain gratis namakamu.kilatstools.my.id.'
  },
  {
    q: 'Kalau akun nggak diaktifkan gimana?',
    a: 'Kalau pembayaran sudah dikonfirmasi tapi akun tidak diaktifkan admin dalam 2×24 jam, kamu bisa mengajukan refund. Detailnya ada di halaman Kebijakan Refund.'
  }
];

function CtaButton({ label = 'Mulai Sekarang', className = '' }: { label?: string; className?: string }) {
  return (
    <Link
      href={CTA_HREF}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:from-amber-300 hover:to-yellow-200 ${className}`}
    >
      {label} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300">
      {children}
    </div>
  );
}

export default function LandingPage() {
  const waLink = buildAdminWhatsAppLink('Halo Admin Kilat Tools, saya mau tanya-tanya soal paketnya.');

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#070a12] pb-24 text-slate-100">
      {/* Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1100px] -translate-x-1/2 bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-transparent blur-[120px]" />

      {/* Promo bar */}
      <div className="relative z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-2 text-center text-xs font-bold text-slate-950">
        ⚡ Sekali bayar, tanpa langganan bulanan. Mulai <b>Rp110rb</b>, langsung bikin aplikasi pertamamu.{' '}
        <a href="#harga" className="underline">Lihat paket</a>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#070a12]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-lg shadow-amber-500/30 animate-lightning">
              <Zap className="h-5 w-5 fill-slate-950 text-slate-950" />
            </div>
            <span className="font-lightning text-lg font-extrabold tracking-tight sm:text-xl">Kilat Tools</span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-300 md:flex">
            <a href="#cara-kerja" className="hover:text-white">Cara Kerja</a>
            <a href="#fitur" className="hover:text-white">Fitur</a>
            <a href="#ide" className="hover:text-white">Ide Aplikasi</a>
            <a href="#harga" className="hover:text-white">Harga</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
              Masuk
            </Link>
            <Link
              href={CTA_HREF}
              className="hidden rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 sm:inline-flex"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
        <SectionLabel>⚡ Ketik ide · AI bikinin · Online hari ini</SectionLabel>
        <h1 className="mt-6 text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl md:text-6xl">
          Punya ide aplikasi tapi <span className="text-amber-300">nggak bisa ngoding?</span>
          <br className="hidden sm:block" /> Cukup ngobrol, <span className="bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">AI yang bikinin.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
          Kasir warung, booking salon, absensi karyawan, katalog toko. Ceritain aja maunya kamu, Kilat Tools merancang,
          menulis kode, mengetes, sampai menerbitkan aplikasinya ke link milikmu sendiri.
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-3 gap-3">
          {[
            { n: '0', l: 'baris kode yang kamu tulis' },
            { n: '6', l: 'peran AI yang kerja buat kamu' },
            { n: '1×', l: 'bayar, tanpa langganan' }
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
              <div className="text-3xl font-black text-amber-300 sm:text-4xl">{s.n}</div>
              <div className="mt-1 text-[11px] uppercase leading-snug tracking-wider text-slate-400">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton label="Bikin Aplikasi Pertamaku" />
          <a href="#demo" className="rounded-xl border border-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:border-slate-500">
            Lihat demonya dulu
          </a>
        </div>
      </section>

      {/* Langkah 1 — cara kerja */}
      <section id="cara-kerja" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Langkah 1 · Pahami alurnya</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Dari ide ke aplikasi online, cuma 3 langkah</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: '01', t: 'Ceritain idemu', d: 'Tulis di kolom chat, contoh: "bikin aplikasi stok barang buat toko sembako, ada laporan harian".' },
            { n: '02', t: 'Tonton AI bekerja', d: 'AI merancang, menulis file, dan mengecek hasilnya. Semua langkahnya tampil live lengkap dengan progres.' },
            { n: '03', t: 'Terbitkan & bagikan', d: 'Satu klik, aplikasimu online di namakamu.kilatstools.my.id. Siap dibagikan ke pelanggan.' }
          ].map((s) => (
            <div key={s.n} className="relative rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6">
              <div className="text-5xl font-black text-amber-400/20">{s.n}</div>
              <h3 className="mt-2 text-lg font-bold text-white">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Langkah 2 — demo */}
      <section id="demo" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Langkah 2 · Coba sendiri</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Klik-klik sendiri, rasain cara kerjanya 👇</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Ini simulasi tampilan studio Kilat Tools. Ketik ide, lihat AI menyusun aplikasinya.
          </p>
        </div>
        <div className="mt-10">
          <LandingLiveDemoStudio />
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <CtaButton label="Ambil Akses Mulai Rp110rb" />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
            <span>✓ Sekali bayar</span>
            <span>✓ Langsung punya link sendiri</span>
            <span>✓ Revisi lewat chat</span>
          </div>
        </div>
      </section>

      {/* Tim AI */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>6 peran AI · kerja kapan aja</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Kamu yang punya ide. <span className="text-amber-300">Tim AI yang kerjain.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Biasanya butuh analis, desainer, programmer, sampai tester buat satu aplikasi. Di Kilat Tools, semua peran itu
            dijalankan AI dalam satu alur kerja.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiTeam.map((a) => (
            <div key={a.code} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-400/40">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold tracking-widest text-amber-300">
                  {a.code} · {a.role}
                </span>
                <a.icon className="h-5 w-5 text-slate-500 group-hover:text-amber-300" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-white">{a.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Real talk biaya */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Jujur-jujuran</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Segini biasanya biaya bikin aplikasi</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Pengen punya aplikasi sendiri, tapi angkanya bikin mikir dua kali.</p>
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {costs.map((c) => (
            <div key={c.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-center">
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-2 text-xl font-black text-slate-200 line-through decoration-rose-500/70">{c.price}</div>
              <div className="mt-1 text-xs text-slate-400">{c.label}</div>
            </div>
          ))}
          <div className="rounded-2xl border-2 border-amber-400 bg-amber-400/10 p-5 text-center shadow-lg shadow-amber-500/20">
            <div className="text-3xl">🤩</div>
            <div className="mt-2 text-xl font-black text-amber-300">Rp110rb</div>
            <div className="mt-1 text-xs text-amber-100/80">Kilat Tools, sekali bayar</div>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">Kisaran harga pasar yang umum, bisa beda tergantung kebutuhan.</p>
      </section>

      {/* Kalkulator */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-white sm:text-4xl">Hitung sendiri, mending yang mana?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Geser angkanya.</p>
        </div>
        <div className="mt-8">
          <CostCalculator />
        </div>
      </section>

      {/* Cerita dua orang */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-black text-white sm:text-4xl">Dua pemilik usaha, ide yang sama minggu ini.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-rose-300">Yang nyari developer dulu</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Minta penawaran ke beberapa developer, nunggu balasan, bayar DP, nunggu revisi yang nggak kelar-kelar.
            </p>
            <div className="mt-5 border-t border-slate-800 pt-4 text-xs font-bold uppercase tracking-widest text-slate-500">Sebulan kemudian</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">Aplikasinya masih “on progress”. Modal udah keluar, pelanggan belum bisa pakai apa-apa.</p>
          </div>
          <div className="rounded-2xl border border-amber-400/40 bg-amber-400/5 p-6">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-300">Yang ngetik idenya ke Kilat Tools</div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              Ceritain kebutuhannya ke AI, cek preview-nya, minta beberapa revisi lewat chat, lalu klik terbitkan.
            </p>
            <div className="mt-5 border-t border-amber-400/20 pt-4 text-xs font-bold uppercase tracking-widest text-amber-200/70">Hari itu juga</div>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">Link aplikasinya udah dibagikan ke karyawan & pelanggan. Sisa budget dipakai buat promosi usahanya.</p>
          </div>
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">Gambaran situasi, bukan cerita pelanggan tertentu. Hasil tiap orang bisa beda.</p>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Isi dalam aplikasinya</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Bukan template. Bukan e-book. Studio AI beneran.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Login, buka chat, dan studio AI kamu langsung siap kerja. Ini yang kamu dapat.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {features.map((f) => (
            <div key={f.tag} className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0b0f19] p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/15 text-amber-300">
                <f.icon className="h-5 w-5" />
              </div>
              <div className="mt-5 font-mono text-[11px] font-bold tracking-widest text-amber-300">{f.tag}</div>
              <h3 className="mt-2 text-xl font-bold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {f.chip}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-3xl border border-violet-500/30 bg-violet-500/5 p-7">
          <div className="font-mono text-[11px] font-bold tracking-widest text-violet-300">05 · KHUSUS PAKET PRO</div>
          <h3 className="mt-2 text-xl font-bold text-white">Aplikasinya 100% milik kamu.</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {proPerks.map((p) => (
              <div key={p.text} className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-200">
                <p.icon className="h-4 w-4 shrink-0 text-violet-300" /> {p.text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ide aplikasi */}
      <section id="ide" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Butuh inspirasi?</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Aplikasi yang bisa kamu bikin minggu ini</h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {ideas.map((i) => (
            <div key={i.name} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:-translate-y-0.5 hover:border-amber-400/40">
              <div className="text-2xl">{i.emoji}</div>
              <div className="mt-2 font-bold text-white">{i.name}</div>
              <div className="mt-0.5 text-xs text-slate-400">{i.desc}</div>
              <div className="mt-3 inline-block rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">{i.tag}</div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">Contoh ide untuk gambaran. Kamu bebas bikin aplikasi sesuai kebutuhan usahamu.</p>
      </section>

      {/* Bedanya */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Bedanya sama yang lain</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Bukan cuma generator halaman. Aplikasi yang bisa dipakai.</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { t: 'Bahasa Indonesia, harga rupiah', d: 'Nggak perlu kartu kredit atau langganan dolar. Ngobrolnya pakai bahasa sehari-hari.' },
            { t: 'Sekali bayar, bukan langganan', d: 'Bayar paket sekali, kredit nggak hangus. Butuh lebih? Tinggal top-up mulai Rp25rb.' },
            { t: 'Langsung online, bukan file mentah', d: 'Aplikasi terbit di link milikmu sendiri lengkap dengan SSL. Nggak perlu urus hosting.' }
          ].map((b) => (
            <div key={b.t} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <BadgeCheck className="h-6 w-6 text-amber-300" />
              <h3 className="mt-3 text-lg font-bold text-white">{b.t}</h3>
              <p className="mt-2 text-sm text-slate-400">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Harga */}
      <section id="harga" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="text-center">
          <SectionLabel>Harga</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Sekali bayar. Pilih yang pas buat kamu.</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-7">
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400">Basic</div>
            <div className="mt-3 text-4xl font-black text-white">Rp110.000</div>
            <div className="text-xs text-slate-500">sekali bayar</div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
              {['1 Kredit App (terbitkan 1 aplikasi)', '100.000 Kredit AI untuk bikin & revisi', 'Subdomain namakamu.kilatstools.my.id + SSL', 'Preview desktop & mobile', 'Revisi lewat chat kapan aja'].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {t}</li>
              ))}
            </ul>
            <Link href={CTA_HREF} className="mt-8 rounded-xl bg-slate-800 py-3.5 text-center text-sm font-bold text-white hover:bg-slate-700">
              Pilih Basic
            </Link>
          </div>

          <div className="relative flex flex-col rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-400/10 to-slate-900/80 p-7 shadow-2xl shadow-amber-500/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-950">
              Paling lengkap
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-amber-300">Pro</div>
            <div className="mt-3 text-4xl font-black text-white">Rp210.000</div>
            <div className="text-xs text-slate-400">sekali bayar · sudah Basic? upgrade +Rp100rb</div>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-200">
              {['Semua isi Paket Basic', 'Custom domain (domainkamu.com)', 'Download source code (.ZIP)', 'Export database SQL / CSV', 'Push ke GitHub', 'Storage pribadi 10GB', 'Prioritas support'].map((t) => (
                <li key={t} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {t}</li>
              ))}
            </ul>
            <CtaButton label="Pilih Pro" className="mt-8 w-full" />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Kredit AI habis? Top-up <b className="text-slate-200">100.000 Kredit AI cuma Rp25.000</b>. Kredit nggak hangus.
        </p>

        {/* Cara beli */}
        <div className="mt-12 rounded-3xl border border-slate-800 bg-slate-900/50 p-7">
          <h3 className="text-center text-lg font-bold text-white">Cara aktivasi akun</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: UserPlus, t: '1. Daftar akun', d: 'Isi email, username & kata sandi di halaman daftar.' },
              { icon: Wallet, t: '2. Transfer & konfirmasi', d: 'Kirim bukti transfer ke WhatsApp admin.' },
              { icon: BadgeCheck, t: '3. Akun aktif', d: 'Setelah di-ACC admin, kredit masuk dan kamu bisa langsung bikin aplikasi.' }
            ].map((s) => (
              <div key={s.t} className="text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/15 text-amber-300">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="mt-3 font-semibold text-white">{s.t}</div>
                <p className="mt-1 text-xs text-slate-400">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-black text-white sm:text-4xl">Pertanyaan yang sering ditanya</h2>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 open:border-amber-400/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white">
                {f.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.a}</p>
            </details>
          ))}
        </div>
        {waLink && (
          <div className="mt-6 text-center">
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
              <MessageCircle className="h-4 w-4" /> Masih ragu? Tanya admin via WhatsApp
            </a>
          </div>
        )}
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-slate-900 to-slate-950 p-8 text-center sm:p-12">
          <Zap className="mx-auto h-10 w-10 fill-amber-300 text-amber-300" />
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Idemu udah nunggu terlalu lama.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-300">
            Daftar sekarang, ceritain aplikasi yang kamu mau, dan lihat AI merakitnya untukmu.
          </p>
          <CtaButton label="Mulai Bikin Aplikasi" className="mt-8" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 text-center text-sm text-slate-500">
        <p>&copy; 2026 Kilat Tools. Semua hak dilindungi.</p>
        <nav className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
          <Link href="/syarat-ketentuan" className="hover:text-slate-300">Syarat &amp; Ketentuan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-slate-300">Kebijakan Privasi</Link>
          <Link href="/kebijakan-refund" className="hover:text-slate-300">Kebijakan Refund</Link>
        </nav>
      </footer>

      {/* Sticky CTA bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-[#070a12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="leading-tight">
            <div className="text-lg font-black text-white">Rp110.000 <span className="text-xs font-normal text-slate-400">sekali bayar</span></div>
            <div className="text-[11px] text-amber-300">1 aplikasi online + 100rb Kredit AI</div>
          </div>
          <Link
            href={CTA_HREF}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 sm:px-6"
          >
            Daftar<span className="hidden sm:inline"> Sekarang</span> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
