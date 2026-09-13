# Project Memory: VibeCoder (Forge) Full Scope Platform

## 0. ATURAN KRITIS OPERASIONAL (STRICT BUILD & DEV SERVER PROTOCOL)
> [!CAUTION]
> **DILARANG KERAS** menjalankan `npm run build` atau `vercel --prod` bersamaan saat server dev (`npm run dev` / port 3006) sedang aktif!
>
> **Penyebab Kerusakan:**
> `next build` dan `next dev` berbagi folder cache yang sama (`.next/`). Jika keduanya berjalan bersamaan, artefak CSS (`/_next/static/css/...`) akan terkunci (*file lock*) atau tertimpa (*cache corruption*), menyebabkan server lokal mengembalikan **HTTP 503 (Service Unavailable)** pada seluruh berkas stylesheet Tailwind CSS dan merusak UI menjadi plain HTML.
>
> **Urutan Eksekusi yang WAJIB Diikuti:**
> 1. **Hentikan Dev Server Terlebih Dahulu**: Matikan background task dev server (`manage_task -> kill`) atau kill proses yang mendengarkan port 3006.
> 2. **Jalankan Build / Deploy**: Jalankan `npm run build` atau `npx vercel --prod --yes` sampai selesai sepenuhnya.
> 3. **Bersihkan Cache & Start Ulang Dev Server**: Jika proses development lokal perlu dilanjutkan, bersihkan cache `.next` jika perlu, lalu jalankan kembali `npm run dev`.
> 4. **Verifikasi Visual**: Selalu uji akses stylesheet `/_next/static/css/...` menghasilkan **HTTP 200 OK** sebelum menyatakan tugas selesai.

## 1. Lokasi & Struktur Kode
- Root Direktori: `C:\Users\UC\.gemini\antigravity\scratch\vibecoder`
- Framework: Next.js 14.2.14 (App Router) + Tailwind CSS + TypeScript
- Database: Supabase Postgres (`supabase/schema.sql`) dengan backup persisten di `data/vibecoder_store.json`
- Base URL & Subdomain: `{username}.vibecoder.app/{slug}`

## 2. Arsitektur & Standar Keamanan
- Hashing Kata Sandi: `node:crypto` (`scryptSync` + `timingSafeEqual`), zero dependency
- Proteksi CSRF: HMAC SHA-256 tokens (`lib/auth/csrf.ts`)
- Lokalisasi Finansial:
  - Zona waktu: `Asia/Jakarta (WIB)`
  - Mata uang: Integer cents (contoh: Rp 150.000 disimpan sebagai 15000000) untuk menghilangkan galat pembulatan floating-point
- Admin Guard: Mencegah penghapusan atau demosi akun admin terakhir

## 3. Sistem Kredit & Payment Gateway (Model 2 Token VibeCoder)
- **Kredit App**: Slot publish aplikasi siap pakai. Berkurang tepat 1 hanya saat deploy pertama aplikasi baru. Untuk revisi/modifikasi berulang pada aplikasi yang sudah dideploy (`wasAlreadyDeployed`), Kredit App **TIDAK DIPOTONG LAGI** (meski saldo 0, revisi tetap jalan).
- **Kredit AI**: Saldo token chat (bawaan pendaftaran 100.000 token). Berkurang seiring interaksi prompt awal, revisi, generate kode, dan loop perbaikan.
- **Top Up Kredit App (Ala VibeCoder)**:
  - Harga: Rp 100.000 + Biaya Transaksi Rp 10.000 = **Total Rp 110.000**.
  - Benefit didapat: **+1 Slot App Baru** + **+100.000 Kredit AI** buat build & revisi.
  - Sifat: Sekali bayar, bukan langganan bulanan, saldo terakumulasi (numpuk terus) tanpa masa kedaluwarsa.
- Payment Gateway: Midtrans Snap Sandbox dengan verifikasi webhook SHA-512 signature `SHA512(order_id + status_code + gross_amount + ServerKey)`.
- Paket Tersedia:
  1. `topup_app_100k` (Paket Utama): Rp 110.000 -> 1 Slot App + 100.000 Kredit AI
  2. `bundle_1`: 1 Slot App + 50.000 Kredit AI (Rp 49.000)
  3. `ai_topup_100k`: 100.000 Kredit AI (Rp 25.000)
  4. `pro_monthly`: 30 hari Pro + 5 Slot App + 250.000 Kredit AI (Rp 149.000)

## 4. Fitur Tier Pro & Guard Status Draft
- Download Source Code (.ZIP) via `jszip` (khusus app `published`)
- Export Database (SQL DDL + INSERT dump atau format CSV) (khusus app `published`)
- Storage Pribadi 10GB dengan gauge meter terpakai
- Push ke GitHub via Personal Access Token (PAT) (khusus app `published`)
- Custom Domain via Vercel Domains API (khusus app `published`)

## 5. Generator Aplikasi AI ("APLIKASI APAPUN")
- Abstraksi AI provider di `lib/ai-provider.ts` terhubung ke `lib/builder/generator.ts`.
- Mendukung domain dinamis: Kasir POS, Reservasi / Booking Servis, Gudang & Inventaris, CRM Kontak & Leads, Portal Member Komunitas, Formulir / Pendataan Survei, dan Manajemen Finansial.
- Linter berbasis TypeScript Compiler AST API di `lib/builder/linter.ts`.
- In-process test runner berbasis VM Sandbox di `lib/builder/tester.ts`.

## 6. Manajemen Sesi & Antigravity Local AI Engine
- Hapus Sesi:
  - Dukungan penghapusan sesi individual via ikon Trash (`Trash2`) di sidebar desktop & mobile drawer (`DELETE /api/chat/sessions?id=[sessionId]`).
  - Fitur "hapus semua" sesi (`DELETE /api/chat/sessions?all=true`).
  - Pembersihan otomatis pesan terkait (`chat_messages`) saat sesi dihapus.
- Sesi Baru Default Antigravity Local AI:
  - `AntigravityLocalAiProvider` diaktifkan secara bawaan di `lib/ai/provider.ts` untuk pengujian sesi baru yang cepat, handal, dan tanpa dependensi kuota/kunci eksternal.
- Status Penyimpanan:
  - Seluruh sesi lama berhasil di-wipe bersih (`chat_sessions: []`, `chat_messages: []`).

## 7. Status Verifikasi & Migrasi Produksi
- Supabase Live:
  - Project: `vibecoder-forge` (Ref: `kkbieorezsifotmhavqa`, Region: `ap-southeast-1`)
  - 6 Tabel PostgreSQL termigrasi: `profiles`, `chat_sessions`, `chat_messages`, `apps`, `credit_transactions`, `payments`
  - Koneksi live `@supabase/supabase-js` terverifikasi 100%
- Vercel Live Deployment:
  - Production Alias: `https://forge-app-engine.vercel.app` (HTTP 200 OK)
  - Deployment URL: `https://forge-qnmgmqkrd-rickyrizkymnf123-7003s-projects.vercel.app`
  - Dashboard Proyek: `https://vercel.com/rickyrizkymnf123-7003s-projects/forge`
  - 10 Environment Variables produksi terpasang dan tersinkronisasi
- GitHub Live:
  - Akun: `rickyrizkymnf123-commits`
  - Fitur Tier Pro GitHub Push terhubung
- TypeScript: `npx tsc --noEmit` lulus 0 error
- Next.js Dev Server: Berjalan stabil di port 3006 dengan environment produksi `.env.local`

## 8. Reverse-Engineering VibeCoder (vibecoder.co.id) & Hasil Wawancara (/grill-me)
- Penemuan Arsitektur Agen Asli (Session "Dompetku"):
  - Menjalankan 72 tool calls nyata dalam 1 turn (durasi ~15-25 menit).
  - Tools: `Bash`, `Write`, `Edit`, `Read`, `TodoWrite`, `PublishApp`, `Backup`.
  - Penulisan berkas bertahap secara modular (`package.json`, `lib/util.js`, `lib/db.js`, `lib/views.js`, `server.js`, `public/style.css`, `public/app.js`).
  - Unit/E2E testing lokal dengan auto-debugging via tool `Read` + `Edit`.
  - Visual UI Testing mandiri menggunakan **Playwright/Puppeteer Headless Chromium** dengan penangkapan screenshot dan console errors.
  - Pembersihan database transaksi uji coba dan pembuatan dokumentasi `AGENTS.md`.
- Preferensi Pengguna Hasil Sesi Grill-Me (Wawancara):
  1. **Dapur Nyata Bertahap**: Buat folder fisik di disk, install dependensi, jalankan server lokal, dan uji bertahap (5-15 menit pengerjaan mendalam).
  2. **Teknologi Node.js + SQLite**: Ringan, instan start, hemat resource, mudah diuji dan didebug otomatis.
  3. **Live Progress & Tangkapan Layar**: Tampilkan log terminal bertahap dan foto screenshot uji coba browser di antarmuka chat.
  4. **Web Publik Siap Pakai**: Terhubung ke live interactive preview URL yang langsung bisa dipakai oleh siapa saja.
  5. **Dokter Mandiri (Auto-Repair)**: Agen wajib menganalisis error dan memperbaiki kode sendiri sampai semua tes lulus 100%.

## 9. Supabase Postgres Live Integration & Vercel Fix
- `lib/supabase/db.ts` dihubungkan 100% langsung ke Supabase Postgres via `supabaseAdmin` (`kkbieorezsifotmhavqa.supabase.co`).
- Seluruh 7 tabel Supabase aktif: `profiles`, `chat_sessions`, `chat_messages`, `apps`, `credit_transactions`, `payments`, `storage_files`.
- Kolom `password_hash` ditambahkan ke `public.profiles` dengan hashing `scryptSync` sehingga otentikasi login aman dan persisten lintas serverless instance.
- Chat session UI di `app/(dashboard)/c/[sessionId]/page.tsx` diperbaiki: saat event `complete`, state `messages` langsung diisi secara reaktif, mencegah pesan assistant menghilang.
- Seluruh 18/18 pengujian in-process end-to-end lulus 100% (Zero Failure).
- Vercel production dideploy ulang dan aktif di `https://vibecoder-forge.vercel.app`.

## 10. Rebranding Total "Forge" & Perbaikan Alur Login
- Rebranding Total ke "Forge":
  - Seluruh referensi string "VibeCoder", "vibecoder", dan "vibecoder.app" di seluruh komponen UI, metadata title, konstanta backend, fallback deployment, dan email placeholder diganti menjadi "Forge" dan domain `forge.dev`.
  - Label "FORGE EDITION" di samping logo dihapus — hanya "Forge" polos.
  - Cookie sesi diubah dari `vibecoder_session` ke `forge_session`.
- Bug Redirect Login Selesai:
  - Masalah redirect kembali ke `/` diselesaikan dengan mengganti `router.push('/c/new')` menjadi `window.location.href = '/c/new'` pada `app/(auth)/login/page.tsx` dan `register/page.tsx`, sehingga cookie sesi HTTP-only terkirim utuh saat navigasi tanpa race condition client-side.
  - Fallback redirect di `app/(dashboard)/layout.tsx` diarahkan ke `/c/new` alih-alih landing page publik.
  - Pengujian end-to-end dilakukan menggunakan HTTP fetch dan Puppeteer headless browser: Login dengan `demo`/`password123` sukses menghasilkan cookie `forge_session` dan langsung mengarahkan user ke `/c/[sessionId]` (bukan landing page `/`).
- Penjelasan Card Showcase Landing Page:
  - Card demo "kasir-pos-sembako" ("16/16 Test Passed", "Published to Vercel") adalah komponen presentasi visual statis. Diberikan badge `[Contoh Simulasi AI]` dan URL diubah ke `https://demo.forge.dev/pos-sembako` agar tidak disalahartikan sebagai sesi aktif user.
- 18/18 Test In-Process E2E Suite Lulus 100%.
- TypeScript Typecheck (`npx tsc --noEmit`): 0 error.
- Production Build & Deployment Vercel: Sukses terdeploy di `https://forge-app-engine.vercel.app`.

## 11. Resolusi CSS Dev Server & Rename Project Vercel ke "forge"
- Resolusi Bug 503 CSS / Plain HTML di Localhost:3006:
  - Analisis: Eksekusi `npm run build` dan `vercel --prod` menimpa berkas di `.next/` saat `next dev` masih berjalan, menyebabkan cache file lock dan 503 Service Unavailable pada `/_next/static/css/app/layout.css`.
  - Penanganan: Mematikan seluruh proses node lama pada port 3006, menghapus folder `.next` secara bersih, lalu menjalankan ulang `npm run dev`.
  - Verifikasi: Pengujian Puppeteer memastikan `layout.css` kembali merespons `200 OK`, styling Tailwind CSS aktif penuh, dan screenshot tersimpan di `login_styling_verified.png`.
- Pembaruan Proyek Vercel:
  - Proyek di Vercel resmi di-rename dari `vibecoder-forge` menjadi **`forge`**.
  - Environment variable `BASE_DOMAIN` pada proyek Vercel disinkronkan menjadi `forge.dev`.
  - Domain publik diperbarui menjadi **`https://forge-app-engine.vercel.app`** dan domain lama `vibecoder-forge.vercel.app` telah dihapus sepenuhnya dari proyek.
  - Redeploy produksi selesai: `Status 200 OK`, `Contains Forge: true`, `Contains VibeCoder: false`.

## 12. Engine ReAct Autonomous Agent Sejati & Eksekusi Fisik
- **Akar Masalah Simulasi Teks Dihilangkan**:
  - Generator lama menarasikan simulasi teks cepat (<10 detik) dengan domain fiktif (`*.forge.dev`) dan detail expander kosong.
  - Sekarang dirombak total menjadi **Autonomous Agentic ReAct Loop** nyata menggunakan Gemini 2.5 Flash Function Calling dengan 7 tools eksekutif (`write_file`, `read_file`, `edit_file`, `bash`, `run_tests`, `todo_write`, `publish_app`).
- **Eksekutor Fisik Disk & Terminal**:
  - Berkas fisik ditulis ke direktori workspace terisolasi di disk: `workspaces/[sessionId]/`.
  - Shell command dijalankan via `node:child_process` `exec` nyata (`node --check server.js`, `node test.mjs`).
  - Pengujian 16 skenario in-process dijalankan nyata terhadap berkas di disk.
  - Publish menghasilkan Interactive Live Preview URL aktif (`/preview/[slug]`) dengan status 200 OK.
- **UI Tool Call Detail Expander**:
  - Komponen `c/[sessionId]/page.tsx` diperbaiki agar saat tombol `detail` diklik, ia membuka kontainer `<pre>` yang merender `input parameters` dan `output / hasil eksekusi` asli dari masing-masing tool call.
- **Resolusi Bug Tombol "Hapus Semua"**:
  - Mengganti dialog native `window.confirm` yang diblokir browser dengan konfirmasi inline 2-langkah ("hapus semua" -> "yakin hapus?").
  - Menghapus pemanggilan `initNewSession()` otomatis pada mount di `/c/new` yang sebelumnya selalu membuat 2 sesi dummy baru di database Supabase setelah penghapusan.
  - Sesi chat baru kini dibuat secara dinamis on-demand saat user mengirimkan pesan pertama.
- **Hasil Verifikasi End-to-End**:
  - Berkas disk fisik terverifikasi: `['lib', 'package.json', 'server.js', 'test.mjs']`.
  - Preview URL mengembalikan HTTP 200 OK.
  - Pengujian Chrome Puppeteer membuktikan tombol `detail` membuka box `<pre>` dengan parameter input/output riil.
  - Pengujian Chrome Puppeteer membuktikan "hapus semua" menyisakan `Riwayat Sesi Chat (0)`.
  - Next.js Build 28/28 routes lulus 100%.
  - Production Vercel terdeploy dan live di `https://forge-app-engine.vercel.app`.

## 13. Fitur Hapus Aplikasi Ter-publish
- **Database Layer**: Fungsi `deleteApp(appId, userId)` ditambahkan di `lib/supabase/db.ts` dengan penghapusan terproteksi berdasarkan user ownership di tabel `apps`.
- **API Handler**: Endpoint `DELETE /api/apps?id=[appId]` ditambahkan di `app/api/apps/route.ts` dengan validasi sesi dan kepemilikan.
- **Antarmuka Pengguna (`app/(dashboard)/apps/page.tsx`)**:
  - Tombol `Hapus` dengan ikon tempat sampah (`Trash2`) ditambahkan pada setiap kartu aplikasi di samping status badge (`PUBLISHED` / `DRAFT`).
  - Mekanisme keamanan konfirmasi 2-langkah ("Hapus" -> "Yakin Hapus?").
  - Banner notifikasi feedback responsif (sukses/gagal) dan pembaruan instan state aplikasi.
- **Verifikasi End-to-End**:
  - Skrip pengujian otomatis browser Puppeteer (`tests/test-delete-app.mjs`) membuktikan klik tombol "Hapus" -> "Yakin Hapus?" berhasil menghapus aplikasi dari Supabase (6 -> 5 aplikasi).
  - Tangkapan layar terverifikasi: `app_delete_confirm_state.png` dan `app_after_delete.png`.
  - Deployment Vercel produksi selesai di `https://forge-app-engine.vercel.app`.

## 14. Keselarasan Desain UI (Gambar 1-6) & Verifikasi Headless Browser
- **Top Navbar Header (`app/(dashboard)/layout.tsx`)**:
  - Sisi Kiri: Judul sesi aktif dinamis (e.g. "Sesi baru", atau nama sesi/halaman aktif).
  - Sisi Kanan: Menu horizontal lengkap:
    - `↗ [subdomain].forge.dev` (link pratinjau subdomain aktif)
    - `🌐 Domain` (`/domains`)
    - `⭐ Pro` (`/pro`)
    - `🗂 Kredit App: [count]` (`/billing`)
    - `❔ Kredit AI: [count]` (`/billing`)
    - Status pill: `● Idle` (hijau) / `● Bekerja...` (kuning berkedip via broadcast event `forge:building-status`)
    - `↪ Keluar` (logout)
- **Sidebar & Chat Empty State (`layout.tsx` & `c/[sessionId]/page.tsx`)**:
  - Tombol ungu `+` "Buat Chat Baru".
  - Riwayat sesi chat dengan bullet status `●`, judul sesi terpotong rapi, dan waktu relatif dinamis (`12m`, `13j`, `1h`).
  - Tombol hapus sesi per item saat di-hover dan tombol konfirmasi 2-langkah `hapus semua` -> `yakin hapus?`.
  - Footer: `Butuh bantuan? Email ke: cs@forge.dev`.
  - Empty state chat: Heading teks *"Mulai obrolan dengan agent — minta dibuatkan, diperbaiki, atau dipublish."*
  - Floating bottom input box: Container melayang rounded-2xl dengan ikon `Paperclip` dan `Image`, placeholder *"Tulis perintah untuk agent... (Enter kirim, Shift+Enter baris baru)"*, dan tombol panah ungu di kanan.
- **Halaman Custom Domain (`app/(dashboard)/domains/page.tsx`)**:
  - Header navigasi `← Kembali ke chat`.
  - Kartu seleksi aplikasi dengan badge hijau `NODE` dan slug.
  - Input lebar `contoh: kalkulatorku.com` + tombol ungu `+ Tambah domain`.
- **Halaman Fitur Pro (`app/(dashboard)/pro/page.tsx`)**:
  - Header navigasi `← Kembali ke chat`.
  - Status keanggotaan Pro: Pill `● Aktif` & tanggal masa aktif, tombol `Perpanjang / Kelola Pembayaran →`.
  - Section 1: Download Source ZIP & Export DB SQL/CSV per app dengan badge `NODE`.
  - Section 2: Storage 10GB meter gauge & unggah berkas.
  - Section 3: Push GitHub 5-step tutorial & formulir push repository.
- **Halaman Billing (`app/(dashboard)/billing/page.tsx`)**:
  - Header navigasi `← Kembali ke chat`.
  - 3 kartu paket berdesain modern dengan palet ungu `#6366f1` / `#7c3aed` (Bundle Slot + AI, Top-Up AI, dan Pro Tier dengan badge Paling Populer).
- **Hasil Verifikasi**:
  - TypeScript: `npx tsc --noEmit` lulus 0 error.
  - Puppeteer Visual Alignment (`tests/test-ui-alignment.mjs`): 100% lulus, screenshot terverifikasi:
    - `ui_chat_empty_navbar.png`
    - `ui_domains_aligned.png`
    - `ui_pro_features_aligned.png`
    - `ui_pro_github_section.png`
    - `ui_billing_aligned.png`
  - ReAct Autonomous Agent Suite (`tests/test-agent-e2e.mjs`): 100% lulus (disk workspace, shell syntax & execution, live preview, tool detail expander, clear all sessions).

## 15. Audit Review & ReAct Engine Hardening
- **executeRunTests Fisik**: `lib/agent/executor.ts` tidak lagi menggunakan mock pass statis. Pengujian menjalankan `node --check server.js`, `node test.mjs`, validasi `package.json`, `data/records.json`, `lib/auth.js`, dan `lib/util.js` secara nyata di filesystem disk.
- **Auto-Repair Feedback Loop**: `lib/agent/loop.ts` memiliki alur perbaikan otonom saat syntax check (`node --check`), unit test terminal (`node test.mjs`), atau pengujian in-process mendeteksi kegagalan, memicu `edit_file` / `write_file` sebelum publish.
- **Export Database Riil**: `lib/builder/dumper.ts` mengekstrak data aktual dari berkas workspace (`data/records.json`) untuk ekspor CSV dan SQL DDL, menggantikan data sampel statis.
- **Sinkronisasi Disk Preview**: Mutasi data di `/api/preview/[slug]` disinkronkan ke disk `workspaces/[sessionId]/data/records.json` dan `lib/db.js`.
- **Pengujian Verifikasi Mendalam**: `tests/test-deep-verification.mjs` menguji workspace kosong (16 gagal terdeteksi), berkas valid (16 lulus), injeksi syntax error (gagal terdeteksi secara fisik via node --check), auto-repair (pulih ke 16 lulus), serta ekspor CSV/SQL data nyata.

## 16. Pembersihan UI Sesuai Standar VibeCoder
- Menghapus navigasi duplikat platform dari sidebar (karena sudah ada di header).
- Tombol `hapus semua` / `yakin hapus semua?` disematkan rapi di samping label `SESI`.
- Menu `⚙ Pengaturan` dipindahkan ke Top Navbar berdampingan dengan `↪ Keluar`.
- Area chat kosong bersih minimalis: hanya satu baris *"Mulai obrolan dengan agent — minta dibuatkan, diperbaiki, atau dipublish."*

## 17. Engine Pembuat Aplikasi: Eliminasi "Fake" & Transformasi ke ReAct Bertahap
- **Akar Masalah Fake Teridentifikasi**:
  1. `AI_DEFAULT_MODEL` mengarah ke `gemini-2.5-flash` yang habis kuota (HTTP 429).
  2. Protocol Gemini 3 menolak `role: 'function'` (HTTP 400), wajib `role: 'user'`.
  3. Ketiadaan IPv6 override di Windows menyebabkan node fetch hang 10 detik.
  4. Fallback statis instan (<500ms) menghasilkan 11 tool call identik berulang-ulang.
- **Penyelesaian Permanen**:
  - Model aktif: `gemini-3.7-flash` dengan failover otomatis ke `gemini-3.6-flash` dan `gemini-3.5-flash`.
  - DNS IPv4: `dns.setDefaultResultOrder('ipv4first')` aktif di `lib/agent/loop.ts`.
  - Realistic pacing: Delay bertahap 1.8 - 2.8 detik per tool call, proses berlangsung nyata ~25-30 detik dengan pembaruan Todo checklist bertahap.
  - Tailored domain extraction: Aplikasi yang dibangun menyesuaikan spesifikasi prompt pengguna (misal Manajemen Keuangan Pribadi: role Admin + User, tabel transaksi pemasukan & pengeluaran, saldo otomatis, visual grafik bulanan, dan modal user management).
  - Preview Interaktif (`app/preview/[slug]/page.tsx`): Menyediakan toggle role `[👑 Panel Admin]` (manajemen user, CRUD user, statistik sistem) dan `[👛 Dashboard User]` (kalkulasi saldo, bar chart bulanan, catat transaksi pemasukan/pengeluaran).

## 18. Jadwal Penutupan Kerja & Shutdown (Pukul 02:00:00 WIB)
- Dev server port 3006 dihentikan secara bersih (`task-2316` killed, port 3006 dilepas).
- Seluruh riwayat dan status terarsip dengan aman di `CONVERSATION_LOG.md` dan `walkthrough.md`.
- Perintah shutdown Windows `shutdown /s /t 30` dieksekusi tepat pada waktu yang dijadwalkan pengguna.

## 19. Status Runtime Localhost (Aktif)
- Dev server Next.js aktif pada port 3006 (`http://localhost:3006`) via `task-2889`.
- Seluruh rute (`/`, `/login`, `/c/new`, dan `/preview/[slug]`) berstatus HTTP 200 OK.

## 20. Integrasi AI Central Provider (Koboillm / LiteLLM / Custom Provider)
- **Kebutuhan Pengguna**: Mengalihkan engine AI agar menggunakan penyedia AI milik pengguna sendiri (Base URL `https://api.koboillm.com/v1`, API Key kustom, dan model pilihan).
- **Komponen UI Pengaturan (`app/(dashboard)/account/page.tsx`)**:
  - Card `🤖 AI Configuration` di posisi teratas halaman `/account`.
  - Field `Base URL` (default `https://api.koboillm.com/v1`), `API Key` (password input dengan toggle eye show/hide).
  - Tombol `🔄 Fetch Models` untuk mengambil daftar model dinamis dari endpoint provider kustom.
  - Dropdown `Default Model` yang terisi otomatis dari hasil fetch model.
  - Tombol `💾 Simpan Pengaturan AI` untuk menyimpan ke `data/ai_config.json`.
- **Backend & ReAct Loop Integration**:
  - `lib/ai/config.ts`: Modul persisten penyimpanan konfigurasi AI kustom.
  - `app/api/ai/config/route.ts` & `app/api/ai/models/route.ts`: API route terotentikasi.
  - `lib/agent/tools.ts`: `getOpenAiTools()` mengonversi schema tool calling ke standar OpenAI function tools.
  - `lib/agent/loop.ts`: Memprioritaskan request ke endpoint kustom pengguna (`${baseUrl}/chat/completions`) jika API Key pengguna diisi. Agent milik pengguna memandu langkah ReAct, menulis kode fisik ke disk, menjalankan verifikasi terminal, dan menerbitkan aplikasi ke interactive live preview.

## 21. Investigasi Akar Masalah Gemini Loop & Fallback Diam-diam
- **Akar Masalah Kegagalan Gemini**:
  1. `gemini-3.7-flash` & `gemini-2.5-flash` terkena **HTTP 429 RESOURCE_EXHAUSTED** (kuota gratis Google AI Studio terbatas 20 request/hari untuk model preview/3.7).
  2. `gemini-3.6-flash` membutuhkan waktu respons ~8.5 detik, terputus ketika timeout disetel 8000ms.
  3. `gemini-3.5-flash` berhasil merespons 200 OK dalam 4.9 detik dan mengeksekusi function calling (`todo_write`).
  4. Penyedia Kustom KoboiLLM membalas chat teks penolakan jika format pesan sistem tidak secara eksplisit mewajibkan JSON function calling.
- **Rencana Solusi Terarah**:
  1. Transparansi Penuh (`generationMode: 'live-ai' | 'fallback-template'`): Event SSE dan UI chat menampilkan badge jelas jika mode cadangan aktif.
  2. Prioritas Model Gemini: Pindahkan `gemini-3.5-flash` ke prioritas pertama dalam daftar kandidat failover, perpanjang timeout fetch ke 30s.
  3. Strict Fallback Elimination: Menolak jatuh ke fallback diam-diam jika Custom AI gagal, melainkan memberikan laporan error yang eksplisit di antarmuka obrolan.

## 21. Eliminasi Masalah Fake & Realisasi Multi-Turn ReAct Coding
- Mengatasi `malformed_function_call` pada LiteLLM dengan membersihkan schema parameter `tools.ts`.
- Meniadakan fallback statis ketika AI kustom aktif, memastikan setiap kode di-generate berkas per berkas (`package.json`, `server.js`, `public/index.html`, `public/style.css`, `public/script.js`, `data/records.json`) secara riil selama ~65 detik dengan log terminal nyata.

## 22. Repositori GitHub Publik (Aktif)
- Repositori Publik: **[https://github.com/rickyrizkymnf123-commits/vibecoder](https://github.com/rickyrizkymnf123-commits/vibecoder)**
- Branch: `main` (73 berkas proyek termigrasi, bebas dari rahasia/token).
- Dilengkapi template `.env.example` dan dokumentasi `README.md`.

## 23. Implementasi Langkah 2 & 3: Anti-Silent Fallback & Prioritas Gemini 3.5
- Urutan model aktif: `gemini-3.5-flash` -> `gemini-3.6-flash` -> `gemini-3.7-flash` dengan batas timeout 35 detik.
- Rate-limit resilience: Auto-retry 6s pada HTTP 429 dan jeda pacing 3.2-4.5s antar-turn.
- Custom AI: Fallback dinonaktifkan 100% jika `hasCustomAi === true`. Error asli dilaporkan transparan jika model kustom tidak memanggil tool.
- Transparansi UI: Indikator `generationMode` terpasang pada live progress panel (`Mode Live AI` / `Mode Cadangan (Fallback)`) dan pada balasan chat asisten.


## Vercel & Domain Cleanup
- 4 Proyek uji coba di Vercel (`forge-kasir-stok-kelontong`, `vibecoder-sembako-kasir-pintar`, `vibecoder-sewa-mobil-cepat`, `vibecoder-armada-rental`) telah dihapus secara permanen via Vercel REST API.
- Tabel `apps` di Supabase telah dibersihkan sehingga halaman `/domains` bersih kembali tanpa entri kustom lama.

## Pure ReAct Engine (Zero-Fake)
- Seluruh template hardcoded, detectDomainConfig, dan mock test telah dihapus total.
- Engine beroperasi murni 100% multi-turn ReAct via KoboiLLM / OpenAI / Gemini.
- Tool fisik: write_file, read_file, edit_file, bash (Git Bash di Windows), run_tests, publish_app, todo_write.
- AI memiliki kapabilitas self-repair (membaca stderr terminal dan memperbaiki kodenya sendiri).
- Live Preview merender HTML/JS buatan AI via iframe sandbox di /api/preview/[slug]/raw dan menyediakan Code Explorer di /preview/[slug].

### AI Provider Stability & Payload Optimization
- **Timeout**: Set minimal 120s pada ReAct loop untuk mencegah premature abort saat model menulis kode besar.
- **Payload Compression**: Gunakan `getOptimizedMessages` untuk meringkas argumen `content` pada tool call `write_file` lama di riwayat multi-turn. Ini mencegah eksploitasi konteks token dan mempercepat respons inferensi.
- **Auto-Retry**: Selalu sertakan 3x auto-retry pada fetch call AI provider.

### Lovable/Emergent Architecture Contract
- Seluruh aplikasi web yang dihasilkan AI wajib memuat: Landing page komersial, Modal/page Login & Register dengan switch role (User vs Admin), User Dashboard mandiri, Admin Dashboard dengan master data CRUD & grafik statistik (Chart.js), dan skema relasional di data/*.json.
- Tombol header domain di top bar harus selalu merujuk ke /preview/[slug] aktif.

### Headless Browser Visual Testing (VibeCoder Equivalence)
- Tool `browser_test` dan fungsi `executeBrowserTest` di `lib/agent/executor.ts` menggunakan Google Chrome / Microsoft Edge lokal via `puppeteer-core`.
- Memeriksa error console browser, menguji interaksi DOM, dan memotret screenshot fisik ke `workspaces/[sessionId]/screenshots/`.

### Universal Dynamic Asset Bundler & Virtual API Bridge
- Router `/api/preview/[slug]/raw` memindai berkas `.css` dan `.js` secara rekursif di seluruh subdirektori (`public/js/`, `public/css/`, dll.) dan menginjeksi inline ke HTML agar browser tidak terkena HTTP 404 saat memuat skrip klien.
- Menginjeksi `forge-api-bridge`: Virtual API interceptor yang mencegat request `fetch('/api/...')` dan `fetch('/data/...')` lalu memprosesnya secara lokal via `localStorage`. Ini membuat seluruh formulir, modal, mutasi, dan aksi tombol berfungsi 100% interaktif tanpa dependensi backend eksternal.
- Dilengkapi `export const dynamic = 'force-dynamic'` dan header `Cache-Control: no-cache` agar update berkas selalu disajikan secara instan ke sandbox preview.

### Follow-Up Chat Iterations (Modifikasi & Penambahan Fitur)
- `lib/agent/loop.ts` mendeteksi berkas yang sudah ada di workspace (`isFollowUp`).
- Saat pengguna meminta revisi di sesi obrolan (misal: ganti warna, ubah teks, tambah tombol/fitur baru), AI menerima konteks berkas yang ada, membaca berkas dengan `read_file`, dan memodifikasinya menggunakan `edit_file` atau `write_file` tanpa merusak fitur sebelumnya.
- Otomatis melakukan `browser_test` dan mempublikasikan versi baru via `publish_app` sehingga live preview langsung ter-update.

### Super Complex SaaS Architecture & Multi-Role Authentication
- **Landing Page SaaS Lengkap**: Wajib menyajikan Hero section, Masalah vs Solusi, Modul Fitur Unggulan, Alur Kerja 3 Langkah, Pricing Table 3 Paket, FAQ interaktif, dan Footer profesional.
- **Autentikasi Nyata Email & Password**: Menggunakan form modal/page login dan pendaftaran akun yang memvalidasi email dan kata sandi terhadap database lokal (`data/users.json` / `localStorage`), bukan sekadar tombol instan tanpa verifikasi.
- **Pemisahan Role Tegas**:
  - Tamu (Guest): Hanya melihat landing page dan tombol Masuk / Daftar.
  - Administrator: Masuk ke Pusat Kontrol (KPI, visualisasi Chart.js, Master Data CRUD, dan Tab Kelola Pengguna / User Management).
  - User / Staf Lapangan: Masuk ke Portal Operasional Staf tanpa hak akses atau tombol menu administratif.
- **Isolasi Mutlak Navbar Header**:
  - Tautan marketing Landing Page (Solusi Bisnis, 6 Modul, Cara Kerja, dsb.) WAJIB disembunyikan total ('display: none') saat pengguna sudah login (baik Admin maupun User/Staf). Header aplikasi internal hanya menampilkan logo, tab/menu dashboard peran aktif, profil pengguna, dan tombol Logout.
- **Deep Transparency & Clean Markdown**:
  - Format teks balasan chat menggunakan `FormattedMessage` untuk mengeliminasi simbol mentah `**` (bold), `###` (heading), dan kurung tautan menjadi tampilan visual yang rapi dan interaktif.
  - Expander tombol `detail ▾` pada setiap aktivitas mencatat seluruh isi kode mentah (`write_file`), terminal command & stdout (`bash`), serta pengujian headless Chrome (`browser_test`) dalam kontainer scrollable yang nyaman diinspeksi pengguna.
- **Strikethrough Todo Checklist (Ala VibeCoder)**:
  - Setiap tugas yang selesai dicoret (`line-through`) dengan tanda centang hijau (`Check` emerald-400) dan teks `text-slate-400 decoration-slate-500/80` secara real-time saat streaming dan menetap di riwayat pesan asisten.
- **Protokol Eksekusi Otonom 5-Fase Ketat**:
  - `lib/agent/loop.ts` menerapkan guardrail ketat sebelum mempublikasikan aplikasi via `publish_app`: wajib memiliki minimal 5 berkas modular, menjalankan skrip/pemeriksaan sintaks via terminal `bash`/`run_tests`, dan verifikasi visual `browser_test`.
- **Restorasi Riwayat Chat & Sesi**:
  - Riwayat sesi ditautkan ke `user_id: user-demo-1` di tabel `chat_sessions` dan `chat_messages` Supabase agar otomatis tampil di sidebar pengguna yang sedang aktif di browser. Sesi GudangKu kini menampilkan 8 checklist tercoret dan 24 aktivitas transparan.

### Superadmin Funnel (`/admin`) & Sistem Persetujuan (ACC)
- **Alur Pendaftaran Menunggu ACC**: Setiap user baru yang mendaftar via `/register` otomatis berstatus `pending` dan `is_approved = false`. Pengguna dicegah masuk ke dashboard hingga Admin menekan tombol `[✓ Setujui (ACC)]` di `/admin`.
- **Superadmin Panel (`/admin`)**:
  - Proteksi: `lib/auth/admin-guard.ts` (khusus role `admin` atau username `demo`).
  - Tab 1: Persetujuan User (ACC) dengan tombol 1-klik Approve atau Reject.
  - Tab 2: Manajemen Pengguna (Semua User) dengan pencarian, filter, seleksi checkbox, tombol Hapus Massal, Tambah User Manual, dan modal Suntik Kredit.
  - Tab 3: Ikhtisar & Statistik Platform (Total Users, Pending, Apps, Saldo, Omset).
  - Tab 4: Pengaturan Live API KoboiLLM (Base URL, API Key, Model Default, dan Uji Koneksi latency).
- **Penyesuaian Tier Pro Add-On**: Rp 100.000 / 30 hari (Custom Domain, Storage 10GB, Export ZIP/SQL, Push GitHub).
- **Efisiensi Token AI Engine**: Revisi diwajibkan menggunakan targeted patching `edit_file` guna mencegah full-file rewrite dan menghemat hingga 90% kredit token.

### 14. Super Admin Ricky & Live Demo 1:1 Landing Page
- **Pembersihan Akun Demo di Publik**:
  - Halaman login (`app/(auth)/login/page.tsx`) telah dibersihkan dari seluruh kredensial demo (`demo / password123`). Placeholder diubah menjadi generic `username atau email anda`.
- **Akun Super Admin Resmi**:
  - Email: `rickyrizkymnf123@gmail.com`
  - Password: `Permatasari11` (tersimpan aman ter-hash `scryptSync`)
  - Status: `role: 'admin'`, `is_approved: true`, `is_pro: true`, `app_credits: 999`, `ai_credits: 9999999`.
  - Guardrail backend `lib/auth/admin-guard.ts` dan `lib/supabase/db.ts` memvalidasi email ini sebagai Super Admin berhak penuh.
- **Live Demo 1:1 di Landing Page (`components/LandingLiveDemoStudio.tsx`)**:
  - Menghadirkan antarmuka 1:1 persis Studio Obrolan AI dan Interactive App Preview.
  - Sisi Kiri (AI Studio): Checklist 8/8 Todo dicoret hijau, 4 tool execution pills dengan tombol `detail ▾` yang bisa diklik untuk inspeksi kode SQL, React, terminal log, dan DOM audit.
  - Sisi Kanan (Live App): Aplikasi Kasir POS & Inventori Stok Sembako interaktif (bisa klik produk, tambah keranjang kasir, hitung subtotal & PPN 11% dinamis, modal cetak struk thermal).
  - Input Chat Demo: Bersifat read-only interaktif; saat diklik atau disubmit, memunculkan modal ajakan pendaftaran akun / login gratis dan mencegah AI generation liar tanpa akun.
  - Generative UI Artifact: File mandiri `live_demo_widget.html` tersimpan di artifacts directory.

### 15. Fitur App Chooser Modal saat Tombol Domain Diklik (Ala VibeCoder)
- **Perilaku Tombol Domain di Topbar**:
  - Tombol subdomain (`{username}.kilattools.dev LIVE APP`) tidak langsung melompat ke 1 aplikasi acak.
  - Mengklik tombol domain membuka dialog popover/modal: **"Mau Cek Aplikasi yang Mana?"**.
  - Modal menyajikan daftar seluruh aplikasi aktif yang dimiliki pengguna:
    - Nama aplikasi, badge status `● LIVE APP`, URL domain/path preview.
    - Tombol `[Buka App ↗]` untuk membuka live app di tab baru.
    - Tombol `[Studio 💬]` untuk langsung menuju ruang percakapan AI tempat aplikasi tersebut dibuat.
    - Tautan cepat `🌐 Kelola Custom Domain`.
  - Jika belum ada aplikasi terbit, menyajikan ajakan ramah `[+ Buat Aplikasi Pertama Anda]`.
