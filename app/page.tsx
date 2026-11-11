import Link from 'next/link';
import './landing.css';
import HeroVideoDemo from '@/components/landing/HeroVideoDemo';
import YouTubeDemo from '@/components/landing/YouTubeDemo';
import { getYouTubeId } from '@/lib/youtube';
import AppStudioDemo from '@/components/landing/AppStudioDemo';
import CostBars from '@/components/landing/CostBars';
import ScrollStory from '@/components/landing/ScrollStory';
import CostCalculator from '@/components/landing/CostCalculator';
import AppMarquee from '@/components/landing/AppMarquee';
import PipelineFlow from '@/components/landing/PipelineFlow';
import IdeasExplorer from '@/components/landing/IdeasExplorer';
import AppPlanQuiz from '@/components/landing/AppPlanQuiz';
import Reveal, { CountUp } from '@/components/landing/Reveal';
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
  MessageCircle,
  X,
  Minus,
  Check
} from 'lucide-react';

const CTA_HREF = '/register';

// Link video demo YouTube (watch / youtu.be / shorts). Kosong = pakai demo animasi bawaan.
// Bisa diisi lewat env NEXT_PUBLIC_DEMO_YOUTUBE_URL di Vercel (lalu redeploy).
const DEMO_YOUTUBE_URL = process.env.NEXT_PUBLIC_DEMO_YOUTUBE_URL || '';

const aiTeam = [
  { code: 'AI-01', role: 'ANALIS', title: 'Penerjemah Ide', desc: 'Ubah obrolanmu jadi daftar fitur & alur aplikasi yang jelas.', icon: MessageSquareText },
  { code: 'AI-02', role: 'DESAIN', title: 'Desainer UI', desc: 'Tampilan modern & responsif, nyaman di HP maupun laptop.', icon: Palette },
  { code: 'AI-03', role: 'PROGRAMMER', title: 'Penulis Kode', desc: 'HTML, CSS & JavaScript lengkap. Kamu nggak perlu sentuh kodenya.', icon: Code2 },
  { code: 'AI-04', role: 'PENGUJI', title: 'Quality Check', desc: 'Cek file yang kurang & error sebelum aplikasi diterbitkan.', icon: FlaskConical },
  { code: 'AI-05', role: 'PUBLISHER', title: 'Tukang Online-in', desc: 'Terbitin ke subdomain kamu, lengkap dengan SSL.', icon: Rocket },
  { code: 'AI-06', role: 'REVISI', title: 'Asisten Revisi', desc: 'Ganti warna, tambah menu, fitur baru? Tinggal bilang.', icon: Wrench }
];

const features = [
  {
    tag: '01 · CHAT BUILDER',
    title: 'Cukup Ngobrol, Aplikasi Jadi.',
    desc: 'Tulis idemu pakai bahasa sehari-hari. AI merancang halaman, menulis kode, dan merakit aplikasinya, tanpa kamu buka satu file pun.',
    chip: 'bahasa Indonesia · tanpa coding',
    icon: MessageSquareText,
    url: 'kilatstools.my.id/c/baru'
  },
  {
    tag: '02 · AKTIVITAS LIVE',
    title: 'Lihat AI-nya Kerja, Langkah demi Langkah.',
    desc: 'Setiap file yang ditulis dan setiap pengecekan muncul di panel aktivitas lengkap dengan progres persen. Nggak ada loading misterius.',
    chip: 'progres real-time',
    icon: ListChecks,
    url: 'kilatstools.my.id/c/aktivitas'
  },
  {
    tag: '03 · PREVIEW INSTAN',
    title: 'Cek Tampilan Desktop & HP Sebelum Terbit.',
    desc: 'Preview langsung di samping chat. Klik-klik aplikasinya, kalau ada yang kurang pas tinggal minta revisi.',
    chip: 'preview desktop + mobile',
    icon: Monitor,
    url: 'kilatstools.my.id/preview'
  },
  {
    tag: '04 · ONLINE 1 KLIK',
    title: 'Langsung Punya Link Sendiri.',
    desc: 'Aplikasi terbit di namakamu.kilatstools.my.id/nama-aplikasi, sudah HTTPS. Paket Pro bisa pakai domain sendiri.',
    chip: 'subdomain + SSL gratis',
    icon: Globe,
    url: 'namakamu.kilatstools.my.id'
  }
];

const proPerks = [
  { icon: FileArchive, text: 'Download source code (.ZIP)' },
  { icon: Database, text: 'Export database (SQL / CSV)' },
  { icon: Github, text: 'Push ke repo GitHub kamu' },
  { icon: HardDrive, text: 'Storage 10GB + custom domain' }
];

const stages = [
  { n: 'TAHAP 1', time: 'Menit 0–1', title: 'Ceritain Idemu', items: ['Tulis kebutuhan di chat', 'Sebut fitur yang kamu mau', 'Atau pakai hasil kuis di bawah'] },
  { n: 'TAHAP 2', time: 'Menit 1–5', title: 'AI Membangun', items: ['Rancangan halaman dibuat', 'Kode ditulis otomatis', 'Dicek sebelum selesai'] },
  { n: 'TAHAP 3', time: 'Menit 5–15', title: 'Coba & Revisi', items: ['Preview desktop & HP', 'Minta perubahan lewat chat', 'Ulangi sampai pas'] },
  { n: 'TAHAP 4', time: 'Hari ini', title: 'Online & Dipakai', items: ['Terbitkan 1 klik', 'Bagikan link ke tim/pelanggan', 'Bikin aplikasi berikutnya'] }
];

const compareRows: { k: string; kilat: string; dev: string; diy: string; luar: string }[] = [
  { k: 'Biaya', kilat: 'Rp110rb sekali bayar', dev: 'Rp3–10jt / aplikasi', diy: 'Gratis–Rp10jt (kursus)', luar: '$20+/bln langganan' },
  { k: 'Waktu sampai online', kilat: 'Hitungan menit', dev: '2–8 minggu', diy: 'Berbulan-bulan', luar: 'Cepat' },
  { k: 'Perlu bisa coding', kilat: 'Tidak', dev: 'Tidak', diy: 'Ya', luar: 'Kadang' },
  { k: 'Bahasa Indonesia', kilat: 'yes', dev: 'yes', diy: 'partial', luar: 'no' },
  { k: 'Bayar pakai rupiah', kilat: 'yes', dev: 'yes', diy: 'yes', luar: 'no' },
  { k: 'Revisi kapan aja', kilat: 'Lewat chat', dev: 'Biaya tambahan', diy: 'Kerjain sendiri', luar: 'yes' },
  { k: 'Hosting + SSL', kilat: 'Termasuk', dev: 'Bayar terpisah', diy: 'Urus sendiri', luar: 'Kadang' }
];

const personas = [
  { emoji: '🏪', t: 'Pemilik UMKM', d: 'Capek nyatet di buku. Pengen kasir & stok yang rapi tanpa sewa developer.' },
  { emoji: '🧑‍💻', t: 'Freelancer & Jasa', d: 'Mau nambah layanan "bikin aplikasi" buat klien, tanpa harus jago coding.' },
  { emoji: '🏢', t: 'Karyawan Kantor', d: 'Butuh tool internal kecil, absensi atau inventaris, tanpa nunggu tim IT.' },
  { emoji: '🏫', t: 'Guru & Pengurus', d: 'Rekap nilai, setoran hafalan, data santri. Semua bisa dibuka dari HP.' }
];

const fitList = [
  'Belum pernah bikin aplikasi sama sekali.',
  'Punya usaha atau komunitas yang masih ngandelin buku & Excel.',
  'Nggak mau langganan bulanan pakai dolar.',
  'Pengen hasil yang langsung bisa dipakai, bukan teori.',
  'Mau coba jual jasa pembuatan aplikasi ke UMKM sekitar.',
  'Bisa luangin 15–30 menit buat ngobrol sama AI.'
];

const faqs = [
  { q: 'Saya sama sekali nggak bisa coding, bisa pakai?', a: 'Bisa. Kilat Tools dibuat justru untuk yang nggak bisa coding. Kamu cukup jelasin aplikasi yang kamu mau pakai bahasa sehari-hari, AI yang ngerjain sisanya.' },
  { q: 'Bayarnya bulanan atau sekali?', a: 'Sekali bayar, tanpa langganan. Paket Basic Rp110.000 dan Pro Rp210.000. Kalau kredit AI habis, bisa top-up 100.000 kredit seharga Rp25.000.' },
  { q: 'Apa itu Kredit App dan Kredit AI?', a: 'Kredit App = jatah untuk menerbitkan 1 aplikasi online. Kredit AI = "bensin" untuk AI saat membuat & merevisi aplikasi. Setiap paket dapat 1 Kredit App + 100.000 Kredit AI.' },
  { q: 'Gimana cara bayarnya?', a: 'Daftar akun dulu, lalu transfer dan kirim bukti pembayaran ke WhatsApp admin. Setelah admin konfirmasi (ACC), akun kamu aktif dan kredit langsung masuk.' },
  { q: 'Aplikasinya bisa diubah setelah jadi?', a: 'Bisa. Buka lagi chat-nya dan minta perubahan, misalnya ganti warna, tambah menu, atau fitur baru. AI akan memperbarui aplikasimu.' },
  { q: 'Aplikasi saya bisa dilihat orang lain?', a: 'Aplikasi yang sudah kamu terbitkan bisa dibuka siapa saja lewat link-nya, jadi bisa langsung dibagikan ke pelanggan. Proyek setiap pengguna terpisah, jadi pengguna lain nggak bisa mengubah aplikasimu.' },
  { q: 'Bisa pakai domain sendiri?', a: 'Bisa di Paket Pro. Paket Basic memakai subdomain gratis namakamu.kilatstools.my.id.' },
  { q: 'Kalau akun nggak diaktifkan gimana?', a: 'Kalau pembayaran sudah dikonfirmasi tapi akun tidak diaktifkan admin dalam 2×24 jam, kamu bisa mengajukan refund. Detailnya ada di halaman Kebijakan Refund.' }
];

function CtaButton({ label = 'Mulai Sekarang', className = '' }: { label?: string; className?: string }) {
  return (
    <Link
      href={CTA_HREF}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-6 py-3.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:scale-[1.03] hover:shadow-amber-500/50 ${className}`}
    >
      {label} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-300">
      {children}
    </div>
  );
}

function StepBadge({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-slate-950 py-1 pl-1 pr-3 font-mono text-[11px] font-bold uppercase tracking-widest text-amber-200">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs text-slate-950">{n}</span>
      {children}
    </div>
  );
}

function Cell({ v, strong }: { v: string; strong?: boolean }) {
  if (v === 'yes') return <Check className={`mx-auto h-5 w-5 ${strong ? 'text-amber-300' : 'text-emerald-400'}`} />;
  if (v === 'no') return <X className="mx-auto h-5 w-5 text-rose-400/80" />;
  if (v === 'partial') return <Minus className="mx-auto h-5 w-5 text-slate-500" />;
  return <span className={strong ? 'font-bold text-amber-200' : 'text-slate-400'}>{v}</span>;
}

export default function LandingPage() {
  const youtubeId = getYouTubeId(DEMO_YOUTUBE_URL);
  const waLink = buildAdminWhatsAppLink('Halo Admin Kilat Tools, saya mau tanya-tanya soal paketnya.');

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#070a12] pb-24 text-slate-100">
      {/* Promo bar */}
      <div className="relative z-50 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-4 py-2 text-center text-xs font-bold text-slate-950">
        ⚡ Sekali bayar, tanpa langganan bulanan. Mulai <b>Rp110rb</b>, langsung bikin aplikasi pertamamu.{' '}
        <a href="#harga" className="underline">
          Lihat paket
        </a>
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
            <a href="#demo" className="hover:text-white">Demo</a>
            <a href="#cara-kerja" className="hover:text-white">Cara Kerja</a>
            <a href="#kenapa" className="hover:text-white">Kenapa Kilat</a>
            <a href="#harga" className="hover:text-white">Harga</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white">
              Masuk
            </Link>
            <Link href={CTA_HREF} className="hidden rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-amber-300 sm:inline-flex">
              Ambil Akses Rp110rb
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="kt-grid-bg pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] max-w-full -translate-x-1/2 bg-gradient-to-b from-amber-500/20 via-yellow-500/5 to-transparent blur-[100px]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-12 text-center sm:px-6 sm:pt-16">
          <SectionLabel>⚡ Ketik ide · AI bikinin · Online hari ini</SectionLabel>
          <h1 className="mt-6 text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
            Ini <span className="text-amber-300">tim AI</span> yang bikinin <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">aplikasi usahamu</span> cuma dari chat.
          </h1>

          <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-3">
            {[
              { n: 6, s: '', l: 'Peran AI kerja buat kamu' },
              { n: 0, s: '', l: 'Baris kode yang kamu tulis' },
              { n: 1, s: '×', l: 'Bayar, tanpa langganan' }
            ].map((s) => (
              <div key={s.l} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 backdrop-blur">
                <div className="font-mono text-3xl font-black text-amber-300 sm:text-4xl">
                  <CountUp to={s.n} suffix={s.s} />
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase leading-snug tracking-wider text-slate-400">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-left text-sm leading-relaxed text-slate-300">
            ✨ Kasir warung, booking salon, absensi, katalog toko. <b className="text-white">Ceritain aja maumu</b>. Kilat Tools merancang, menulis kode,
            mengetes, sampai menerbitkan aplikasinya ke <b className="text-amber-200">link milikmu sendiri</b>.
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400">
            Sewa developer mahal dan lama. Belajar coding makan waktu berbulan-bulan. Sekarang, cukup <b className="text-slate-200">ngobrol 15 menit</b>, aplikasi
            kamu udah bisa dibagikan ke pelanggan.
          </p>
        </div>
      </section>

      {/* Langkah 1 — video demo */}
      <section id="demo" className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-16 sm:px-6">
        <Reveal className="text-center">
          <StepBadge n={1}>Langkah 1 · Tonton dulu</StepBadge>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            {youtubeId ? (
              <>
                Tonton <span className="text-amber-300">video singkat ini</span> dulu sebelum scroll
              </>
            ) : (
              <>
                Lihat <span className="text-amber-300">dalam 26 detik</span> gimana aplikasi jadi
              </>
            )}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Dari ngetik ide, AI merancang, nulis kode, ngetes, sampai aplikasi kasir online. Habis ini, coba sendiri studionya di bawah.
          </p>
        </Reveal>
        <Reveal className="mt-8" delay={150}>
          {youtubeId ? <YouTubeDemo videoId={youtubeId} /> : <HeroVideoDemo />}
        </Reveal>
      </section>

      {/* Langkah 2 — studio */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <StepBadge n={2}>Langkah 2 · Coba sendiri</StepBadge>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Udah nonton? Sekarang <span className="text-amber-300">klik-klik sendiri</span> studionya 👇
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Ini tampilan studio Kilat Tools. Tap tab buat pindah fitur.</p>
        </Reveal>
        <Reveal className="mt-8" delay={150}>
          <AppStudioDemo />
        </Reveal>
        <Reveal className="mt-10 flex flex-col items-center gap-3">
          <CtaButton label="Ambil Akses Rp110rb" />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-slate-400">
            <span>✓ Sekali bayar</span>
            <span>✓ Link aplikasi sendiri</span>
            <span>✓ Revisi lewat chat</span>
            <span>✓ Kredit nggak hangus</span>
          </div>
        </Reveal>
      </section>

      {/* Tim AI */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>6 peran AI · kerja kapan aja</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Kamu Punya Ide. <span className="text-amber-300">Tim AI yang Eksekusi.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
            Biasanya 1 aplikasi butuh analis, desainer, programmer, sampai tester. Di Kilat Tools semua peran itu dijalankan AI dalam satu alur.
          </p>
        </Reveal>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {aiTeam.map((a, i) => (
            <Reveal key={a.code} delay={i * 80}>
              <div className="group h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:-translate-y-1 hover:border-amber-400/50">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-amber-300">
                    {a.code} · {a.role}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300 transition group-hover:bg-amber-400 group-hover:text-slate-950">
                    <a.icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">{a.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{a.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mx-auto mt-6 flex max-w-2xl items-center justify-between rounded-2xl border border-slate-800 bg-slate-950 px-5 py-4">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-rose-300">Cara lama · developer</div>
            <div className="font-mono text-xl font-black text-white sm:text-2xl">
              Rp 3–10jt<span className="text-xs text-slate-500">/app</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-amber-400" />
          <div className="text-right">
            <div className="font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-300">Kilat · 6 AI</div>
            <div className="font-mono text-xl font-black text-emerald-300 sm:text-2xl">Rp 110rb</div>
          </div>
        </Reveal>
      </section>

      {/* Real talk */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>⭐ Real talk</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Jujur Aja: Bikin Aplikasi Itu Mahal.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Pengen punya aplikasi sendiri. Tapi angkanya bikin mikir dua kali.</p>
        </Reveal>
        <div className="mt-12">
          <CostBars />
        </div>
        <Reveal className="mt-8 text-center text-sm text-slate-300">
          Bukan puluhan juta. Bukan langganan dolar tiap bulan. <b className="text-amber-300">Cuma Rp110rb sekali bayar</b>, dapat tim AI lengkap.
          <div className="mt-2 text-[11px] text-slate-500">Kisaran harga pasar yang umum, bisa beda tergantung kebutuhan.</div>
        </Reveal>
      </section>

      {/* Scroll story */}
      <ScrollStory />

      {/* Kalkulator */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <h2 className="text-2xl font-black text-white sm:text-4xl">Hitung sendiri, mending yang mana?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Geser angkanya. Semua dihitung di HP kamu, nggak ada data yang dikirim.</p>
        </Reveal>
        <Reveal className="mt-8" delay={100}>
          <CostCalculator />
        </Reveal>
      </section>

      {/* Dua orang */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-black text-white sm:text-4xl">Dua pemilik usaha, ide yang sama minggu ini.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-rose-300">Yang nyari developer dulu</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">Minta penawaran ke beberapa developer, nunggu balasan, bayar DP, nunggu revisi yang nggak kelar-kelar.</p>
              <div className="mt-5 border-t border-slate-800 pt-4 font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Sebulan kemudian</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">Aplikasinya masih “on progress”. Modal udah keluar, pelanggan belum bisa pakai apa-apa.</p>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <div className="h-full rounded-2xl border border-amber-400/40 bg-amber-400/5 p-6">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-amber-300">Yang ngetik idenya ke Kilat Tools</div>
              <p className="mt-3 text-sm leading-relaxed text-slate-200">Ceritain kebutuhannya ke AI, cek preview-nya, minta beberapa revisi lewat chat, lalu klik terbitkan.</p>
              <div className="mt-5 border-t border-amber-400/20 pt-4 font-mono text-xs font-bold uppercase tracking-widest text-amber-200/70">Hari itu juga</div>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Link aplikasinya udah dibagikan ke karyawan & pelanggan. Sisa budget dipakai buat promosi usahanya.</p>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-6 text-center text-sm font-semibold text-slate-300">
          Idenya sama, waktunya sama. Yang beda cuma <span className="text-amber-300">siapa yang ngerjain.</span>
          <div className="mt-1 text-[11px] font-normal text-slate-500">Gambaran situasi, bukan cerita pelanggan tertentu.</div>
        </Reveal>
      </section>

      {/* Fitur */}
      <section id="fitur" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>03 · Isi studionya</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Bukan Template. Bukan E-book. Studio AI Beneran.</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Login, buka chat, dan tim AI kamu langsung siap kerja. Ini isinya.</p>
        </Reveal>
        <div className="mt-12 space-y-6">
          {features.map((f, i) => (
            <Reveal key={f.tag}>
              <div className={`grid items-center gap-6 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-[#0b0f19] p-6 md:grid-cols-2 md:p-8 ${i % 2 ? 'md:[&>*:first-child]:order-2' : ''}`}>
                <div>
                  <div className="font-mono text-[11px] font-bold tracking-widest text-amber-300">{f.tag}</div>
                  <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">{f.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] text-slate-300">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> {f.chip}
                  </div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950 shadow-xl">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-rose-500" />
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="ml-2 font-mono text-[10px] text-slate-500">{f.url}</span>
                  </div>
                  <div className="flex h-44 items-center justify-center bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.12),transparent_65%)]">
                    <div className="kt-float flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-300 shadow-2xl shadow-amber-500/40">
                      <f.icon className="h-10 w-10 text-slate-950" />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
          <Reveal>
            <div className="rounded-3xl border border-violet-500/30 bg-violet-500/5 p-6 md:p-8">
              <div className="font-mono text-[11px] font-bold tracking-widest text-violet-300">05 · KHUSUS PAKET PRO</div>
              <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">Aplikasinya 100% milik kamu.</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {proPerks.map((p) => (
                  <div key={p.text} className="flex items-center gap-3 rounded-xl bg-slate-900/70 p-3 text-sm text-slate-200">
                    <p.icon className="h-4 w-4 shrink-0 text-violet-300" /> {p.text}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <Reveal className="mt-10 flex justify-center">
          <CtaButton label="Ambil Akses Rp110rb" />
        </Reveal>
      </section>

      {/* Marquee */}
      <section className="py-16">
        <Reveal className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <SectionLabel>● 100% dibikin AI · nol coding</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Aplikasi kayak gini, jadi dalam hitungan menit.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Nggak perlu sewa programmer. Nggak perlu urus hosting. Semua dari obrolan, langsung online & bisa dibuka di HP siapa aja.
          </p>
        </Reveal>
        <div className="mt-10">
          <AppMarquee />
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6">
          {[
            { n: 'Rp0', l: 'Biaya developer' },
            { n: '±5 mnt', l: 'Draft pertama jadi' },
            { n: '∞', l: 'Revisi lewat chat*' },
            { n: '24/7', l: 'Aplikasi online' }
          ].map((s) => (
            <Reveal key={s.l} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-center">
              <div className="font-mono text-2xl font-black text-amber-300">{s.n}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">{s.l}</div>
            </Reveal>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">*Selama Kredit AI masih ada. Waktu pembuatan tergantung kerumitan aplikasi.</p>
      </section>

      {/* Bedanya */}
      <section id="kenapa" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Bedanya sama yang lain</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Ini Studio Aplikasi, Bukan Sekadar Generator Halaman.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { t: 'Tim AI, bukan template', d: '6 peran AI ngerjain rancangan, desain, kode, tes, dan publikasi. Hasilnya aplikasi yang bisa dipakai, bukan cuma halaman statis.', chip: 'Kerja dari ide sampai online' },
            { t: 'Aset milikmu, bukan sewaan', d: 'Sekali bayar, aplikasimu tetap online di link sendiri. Paket Pro bisa download source code & pindah ke GitHub.', chip: 'Nggak ada tagihan bulanan' },
            { t: 'Bahasa & harga lokal', d: 'Ngobrol pakai bahasa Indonesia sehari-hari, bayar pakai rupiah, dibantu admin lewat WhatsApp.', chip: 'Dibuat buat UMKM Indonesia' }
          ].map((b, i) => (
            <Reveal key={b.t} delay={i * 120}>
              <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <BadgeCheck className="h-7 w-7 text-amber-300" />
                <h3 className="mt-3 text-lg font-bold text-white">{b.t}</h3>
                <p className="mt-2 text-sm text-slate-400">{b.d}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> {b.chip}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pipeline */}
      <section id="cara-kerja" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Cara kerja · online hari ini</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">
            Kamu Ceritain Sekali. <span className="text-amber-300">AI Rakit → Tes → Online.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Semua kerjaan tim AI nyatu ke satu tempat, lalu keluar jadi aplikasi yang langsung dipakai di HP.</p>
        </Reveal>
        <div className="mt-10">
          <PipelineFlow />
        </div>

        {/* Timeline */}
        <div className="relative mt-16 grid gap-4 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-0.5 bg-gradient-to-r from-amber-400 via-amber-400/50 to-emerald-400 md:block" />
          {stages.map((s, i) => (
            <Reveal key={s.n} delay={i * 150}>
              <div className="relative h-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
                <div className={`absolute -top-3 left-5 flex h-6 items-center rounded-full px-2.5 font-mono text-[10px] font-black ${i === 3 ? 'bg-emerald-400 text-slate-950' : 'bg-amber-400 text-slate-950'}`}>
                  {s.time}
                </div>
                <div className="mt-2 font-mono text-[10px] font-bold tracking-widest text-slate-500">{s.n}</div>
                <h3 className="mt-1 text-lg font-black text-white">{s.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
                  {s.items.map((it) => (
                    <li key={it} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Ide */}
      <section id="ide" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Butuh inspirasi?</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Jelajahi ide aplikasi.</h2>
        </Reveal>
        <div className="mt-8">
          <IdeasExplorer />
        </div>
        <p className="mt-6 text-center text-[11px] text-slate-500">Contoh ide untuk gambaran. Kamu bebas bikin aplikasi sesuai kebutuhanmu.</p>
      </section>

      {/* Tabel perbandingan */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Kenapa Kilat Tools</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Kenapa Nggak Sewa Developer Aja?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">Boleh banget. Tapi coba bandingin dulu dari sisi biaya, waktu, dan kerepotan.</p>
        </Reveal>
        <Reveal className="mt-8 overflow-x-auto rounded-2xl border border-slate-800" delay={100}>
          <table className="w-full min-w-[640px] text-center text-sm">
            <thead>
              <tr className="bg-slate-900">
                <th className="p-4 text-left font-mono text-[11px] uppercase tracking-widest text-slate-500">Kriteria</th>
                <th className="border-x-2 border-t-2 border-amber-400 bg-amber-400/10 p-4 text-amber-200">
                  ⚡ Kilat Tools
                </th>
                <th className="p-4 text-slate-300">Sewa developer</th>
                <th className="p-4 text-slate-300">Belajar coding</th>
                <th className="p-4 text-slate-300">AI builder luar</th>
              </tr>
            </thead>
            <tbody>
              {compareRows.map((r, i) => (
                <tr key={r.k} className="border-t border-slate-800">
                  <td className="p-4 text-left font-semibold text-slate-200">{r.k}</td>
                  <td className={`border-x-2 border-amber-400 bg-amber-400/5 p-4 ${i === compareRows.length - 1 ? 'border-b-2' : ''}`}>
                    <Cell v={r.kilat} strong />
                  </td>
                  <td className="p-4">
                    <Cell v={r.dev} />
                  </td>
                  <td className="p-4">
                    <Cell v={r.diy} />
                  </td>
                  <td className="p-4">
                    <Cell v={r.luar} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <Reveal className="mt-8 flex justify-center">
          <CtaButton label="Ambil Akses Rp110rb" />
        </Reveal>
      </section>

      {/* Cocok buat */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Cocok buat kamu yang…</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Kilat Tools Dibikin Buat Kamu.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">Kalau kamu relate sama salah satu ini, kamu di tempat yang tepat.</p>
        </Reveal>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6">
              <div className="font-mono text-xs font-bold uppercase tracking-widest text-emerald-300">✓ Pakai Kilat Tools kalau kamu:</div>
              <ul className="mt-4 space-y-3">
                {fitList.map((f) => (
                  <li key={f} className="flex gap-2.5 text-sm text-slate-200">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {personas.map((p, i) => (
              <Reveal key={p.t} delay={i * 100}>
                <div className="h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-400/40">
                  <div className="text-3xl">{p.emoji}</div>
                  <div className="mt-2 font-bold text-white">{p.t}</div>
                  <p className="mt-1 text-sm text-slate-400">{p.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Kuis */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <Reveal>
          <AppPlanQuiz />
        </Reveal>
      </section>

      {/* Harga */}
      <section id="harga" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal className="text-center">
          <SectionLabel>Harga</SectionLabel>
          <h2 className="mt-4 text-2xl font-black text-white sm:text-4xl">Sekali Bayar. Pilih yang Pas Buat Kamu.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/70 p-7">
              <div className="font-mono text-sm font-bold uppercase tracking-widest text-slate-400">Basic</div>
              <div className="mt-3 text-4xl font-black text-white">Rp110.000</div>
              <div className="text-xs text-slate-500">sekali bayar</div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
                {['1 Kredit App (terbitkan 1 aplikasi)', '100.000 Kredit AI untuk bikin & revisi', 'Subdomain namakamu.kilatstools.my.id + SSL', 'Preview desktop & mobile', 'Revisi lewat chat kapan aja'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {t}
                  </li>
                ))}
              </ul>
              <Link href={CTA_HREF} className="mt-8 rounded-xl bg-slate-800 py-3.5 text-center text-sm font-bold text-white hover:bg-slate-700">
                Pilih Basic
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative flex h-full flex-col rounded-3xl border-2 border-amber-400 bg-gradient-to-b from-amber-400/10 to-slate-900/80 p-7 shadow-2xl shadow-amber-500/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-extrabold uppercase text-slate-950">Paling lengkap</div>
              <div className="font-mono text-sm font-bold uppercase tracking-widest text-amber-300">Pro</div>
              <div className="mt-3 text-4xl font-black text-white">Rp210.000</div>
              <div className="text-xs text-slate-400">sekali bayar · sudah Basic? upgrade +Rp100rb</div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-200">
                {['Semua isi Paket Basic', 'Custom domain (domainkamu.com)', 'Download source code (.ZIP)', 'Export database SQL / CSV', 'Push ke GitHub', 'Storage pribadi 10GB', 'Prioritas support'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" /> {t}
                  </li>
                ))}
              </ul>
              <CtaButton label="Pilih Pro" className="mt-8 w-full" />
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-xs text-slate-400">
          Kredit AI habis? Top-up <b className="text-slate-200">100.000 Kredit AI cuma Rp25.000</b>. Kredit nggak hangus.
        </p>

        <Reveal className="mt-12">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7">
            <h3 className="text-center text-lg font-bold text-white">Cara aktivasi akun, cuma 3 langkah:</h3>
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
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 py-16 sm:px-6">
        <Reveal>
          <h2 className="text-center text-2xl font-black text-white sm:text-4xl">Pertanyaan yang Sering Ditanya</h2>
        </Reveal>
        <div className="mt-8 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition open:border-amber-400/40">
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
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-400/15 via-slate-900 to-slate-950 p-8 text-center sm:p-12">
            <div className="kt-grid-bg pointer-events-none absolute inset-0 opacity-50" />
            <Zap className="kt-float relative mx-auto h-12 w-12 fill-amber-300 text-amber-300" />
            <h2 className="relative mt-4 text-2xl font-black text-white sm:text-4xl">Idemu udah nunggu terlalu lama.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-sm text-slate-300">Daftar sekarang, ceritain aplikasi yang kamu mau, dan lihat tim AI merakitnya untukmu.</p>
            <CtaButton label="Mulai Bikin Aplikasi" className="relative mt-8" />
          </div>
        </Reveal>
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

      {/* Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800 bg-[#070a12]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="leading-tight">
            <div className="text-lg font-black text-white">
              Rp110.000 <span className="text-xs font-normal text-slate-400">sekali bayar</span>
            </div>
            <div className="text-[11px] text-amber-300">⚡ 1 aplikasi online + 100rb Kredit AI</div>
          </div>
          <Link
            href={CTA_HREF}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/30 transition hover:scale-[1.03] sm:px-6"
          >
            Ambil Akses<span className="hidden sm:inline"> Sekarang</span> <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
