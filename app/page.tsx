import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  Database,
  Terminal,
  CheckCircle2,
  Code2,
  ArrowRight,
  Boxes,
  Cpu,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0b0f19] text-slate-100 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-violet-600/20 via-fuchsia-600/10 to-transparent blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-lightning">
              <Zap className="w-5 h-5 text-slate-950 fill-slate-950" />
            </div>
            <span className="text-xl font-extrabold tracking-tight font-lightning">
              Kilat Tools
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur Unggulan</a>
            <a href="#workflow" className="hover:text-white transition-colors">10 Langkah AI</a>
            <a href="#pricing" className="hover:text-white transition-colors">Harga & Kredit</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-violet-600/25 transition-all flex items-center gap-1.5"
            >
              Coba Gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold mb-8">
          <Zap className="w-3.5 h-3.5 text-violet-400" />
          <span>Alur Kerja Terbukti: 16/16 Skenario Pengujian Lolos 100%</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
          Bangun & Publish <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300">
            Aplikasi Web Apapun
          </span>{' '}
          Lewat Chat AI
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
          Cukup ketik ide Anda dalam bahasa Indonesia sehari-hari. Forge merencanakan arsitektur, menyusun modul Next.js App Router, menghubungkan Supabase Postgres, menguji 16 skenario in-process, lalu mem-publish otomatis ke URL publik aktif.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white text-base font-bold shadow-xl shadow-violet-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Mulai Buat Aplikasi Sekarang
          </Link>
          <a
            href="#workflow"
            className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-base font-semibold border border-slate-800 transition-all flex items-center justify-center gap-2"
          >
            Lihat Cara Kerja AI
          </a>
        </div>

        {/* Live Chat Mockup Preview */}
        <div className="mt-16 text-left rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs text-slate-400 font-mono"><span className="text-violet-400 font-semibold">[Contoh Simulasi AI]</span> session: kasir-pos-sembako</span>
            </div>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Published to Vercel (Ready)
            </span>
          </div>

          <div className="space-y-4">
            {/* User message */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 text-sm">
              <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider block mb-1">Pengguna</span>
              "Buatkan aplikasi kasir POS dan stok toko sembako. Harus ada role admin dan kasir, cetak struk, kalkulasi nominal rupiah presisi, dan zona waktu WIB."
            </div>

            {/* AI message */}
            <div className="bg-slate-950/70 rounded-xl p-5 border border-violet-500/30 text-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-fuchsia-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Forge AI Engine
                </span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  16/16 Test Passed (100%)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>lib/util.ts (Asia/Jakarta + Rupiah cents)</span>
                  </span>
                  <span className="text-slate-400 font-mono">OK</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>lib/auth.ts (scryptSync + CSRF Token)</span>
                  </span>
                  <span className="text-slate-400 font-mono">OK</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <span>URL Publik: <b>https://demo.forge.dev/pos-sembako</b></span>
                <span className="text-emerald-400 font-bold">LIVE &bull; 1 Kredit App Terpakai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className="py-24 border-t border-slate-800/80 bg-slate-950/40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest">Arsitektur Tanpa Kompromi</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
              Bukan Sekadar Kode Dummy, Ini Sistem Siap Produksi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Vercel REST Auto-Deploy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Aplikasi di-deploy langsung ke infrastruktur serverless Vercel. Pengguna mendapatkan URL pribadi format <code className="text-violet-300">username.forge.dev/slug</code> dan dukungan Custom Domain.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Supabase Postgres Multi-Tenant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Tiap aplikasi memiliki skema tabel terisolasi di Supabase Postgres. Data persisten, aman, dan siap diekspor ke SQL atau CSV kapan saja di Tier Pro.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">16 In-Process E2E Tests</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sebelum publish, engine menjalankan 16 skenario pengujian: otentikasi role, validasi CSRF, perlindungan akun admin terakhir, hingga pembulatan uang rupiah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10-Step AI Workflow */}
      <section id="workflow" className="py-24 border-t border-slate-800/80 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest">Pola Wajib AI</h2>
            <p className="text-3xl font-extrabold text-white mt-2">
              10 Langkah Disiplin Pembuatan Aplikasi
            </p>
            <p className="text-slate-400 text-sm mt-2">
              Engine AI Forge mengikuti 10 fase terstruktur untuk menjamin keandalan sistem secara konsisten.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { num: '01', title: 'Klarifikasi Cerdas', desc: 'Mencegah asumsi salah saat kebutuhan ambigu atau belum lengkap.' },
              { num: '02', title: 'Rencana Arsitektur Tertulis', desc: 'Menjabarkan stack Next.js + Postgres, role, dan rancangan skema sebelum coding.' },
              { num: '03', title: 'Task Checklist (TodoWrite)', desc: 'Breakdown 6-8 tugas eksekusi dengan pelacakan status interaktif.' },
              { num: '04', title: 'Penulisan Berkas Berlapis', desc: 'Menulis file berurutan: util.ts -> db.ts -> auth.ts -> route handlers -> UI.' },
              { num: '05', title: 'Self-Review & Auto-Fix', desc: 'Audit otomatis untuk zona WIB, integer cents rupiah, CSRF token, dan admin guard.' },
              { num: '06', title: 'Type Check & Syntax Linter', desc: 'Verifikasi validitas sintaks TypeScript di lingkungan sandbox.' },
              { num: '07', title: '16 Skenario In-Process E2E', desc: 'Pengujian endpoint auth, role security, CRUD, dan agregasi data secara langsung.' },
              { num: '08', title: 'Looping Iteratif', desc: 'Memperbaiki kode secara otomatis sampai 16/16 tes lulus 100%.' },
              { num: '09', title: 'Deploy & Verifikasi Vercel', desc: 'Deploy ke Vercel dan memotong 1 Kredit App tepat saat status READY.' },
              { num: '10', title: 'Laporan Ringkasan Final', desc: 'Memberikan kredensial admin dan tautan langsung ke URL publik aktif.' }
            ].map((step) => (
              <div key={step.num} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-4">
                <span className="text-lg font-black text-violet-400 font-mono">{step.num}</span>
                <div>
                  <h4 className="text-base font-bold text-white">{step.title}</h4>
                  <p className="text-sm text-slate-400 mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 border-t border-slate-800/80 bg-slate-950/60 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-violet-400 uppercase tracking-widest">Transparan & Terjangkau</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Pilih Paket Sesuai Kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Trial */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter Trial</span>
                <div className="text-3xl font-extrabold text-white mt-4">Gratis</div>
                <p className="text-xs text-slate-500 mt-1">Diberikan otomatis untuk semua akun baru</p>
                <div className="my-6 border-t border-slate-800" />
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Slot Kredit App (Publish 1 Aplikasi)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50.000 Kuota Kredit AI
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Subdomain Pribadi <code className="text-violet-300 text-xs">user.forge.dev</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 16 In-Process E2E Test Suite
                  </li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors block text-sm"
              >
                Daftar Akun Baru
              </Link>
            </div>

            {/* App + AI Bundle */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-violet-950/40 to-slate-900 border-2 border-violet-500/50 flex flex-col justify-between relative shadow-xl shadow-violet-900/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Paling Populer
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-400">Bundle Slot Baru</span>
                <div className="text-3xl font-extrabold text-white mt-4">Rp 49.000</div>
                <p className="text-xs text-slate-400 mt-1">Sekali bayar via Midtrans Snap (QRIS, VA, E-Wallet)</p>
                <div className="my-6 border-t border-slate-800" />
                <ul className="space-y-3 text-sm text-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" /> <b>+1 Slot Kredit App</b> untuk publish
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" /> <b>+50.000 Kuota Kredit AI</b>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" /> Database Postgres Supabase Otomatis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" /> URL Publik Aktif Selamanya
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-8 w-full py-3 text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-95 text-white font-bold transition-all block text-sm shadow-lg shadow-violet-600/30"
              >
                Beli Slot Bundle
              </Link>
            </div>

            {/* Tier Pro */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-fuchsia-400">Forge Tier Pro</span>
                <div className="text-3xl font-extrabold text-white mt-4">Rp 149.000 <span className="text-sm font-normal text-slate-400">/ bulan</span></div>
                <p className="text-xs text-slate-500 mt-1">Akses penuh kode, database, dan repositori</p>
                <div className="my-6 border-t border-slate-800" />
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> <b>Download Source Code (.ZIP)</b>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> <b>Export Database (SQL / CSV Dump)</b>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> <b>Push ke GitHub</b> via Personal Token
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> <b>10GB Storage Pribadi</b> File Manager
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-fuchsia-400" /> Bonus 5 Slot App & 250k Kredit AI
                  </li>
                </ul>
              </div>
              <Link
                href="/login"
                className="mt-8 w-full py-3 text-center rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors block text-sm"
              >
                Upgrade ke Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-sm text-slate-500">
        <p>&copy; 2026 Forge. Built with Next.js App Router, Supabase Postgres, and Vercel.</p>
      </footer>
    </div>
  );
}
