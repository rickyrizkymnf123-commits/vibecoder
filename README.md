# VibeCoder (Forge) — Autonomous AI Web Application Generator Platform

VibeCoder adalah platform pembuat aplikasi web otonom full-stack bertenaga AI yang mampu merancang, menulis kode, memvalidasi sintaks terminal, menjalankan unit testing, dan menerbitkan aplikasi ke Interactive Live Preview secara nyata melalui ReAct method loop.

---

## 🚀 Fitur Unggulan

- **Autonomous ReAct Agent Loop**: Agen cerdas yang mengeksekusi *tool calling* bertahap (`write_file`, `bash`, `run_tests`, `publish_app`) di disk fisik workspace secara transparan.
- **Custom AI Central Integration**: Mendukung integrasi dengan penyedia AI kustom (LiteLLM, Koboillm, atau OpenAI-compatible endpoint) dengan manajemen API Key terselubung dan pemilihan model dinamis via *Fetch Models*.
- **Interactive Multi-Role Live Preview**: Aplikasi yang dibangun menyertakan sistem multi-role interaktif (`👑 Panel Admin` & `👛 Dashboard User`), tabel data dinamis, form input, dan visual ringkasan grafik bulanan.
- **Billing & Token Credits**: Sistem kuota Kredit AI (token consumption) dan Kredit App (slot deployment publik) terintegrasi dengan Payment Gateway Midtrans Snap Sandbox.
- **Pro Tier Features**:
  - Export Database (SQL DDL dump & CSV).
  - Download Source Code (.ZIP).
  - Storage Pribadi 10GB.
  - Push langsung ke GitHub Repository.
  - Custom Domain binding via Vercel Domains API.

---

## 🛠️ Stack Teknologi

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, Server Actions & Route Handlers)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan palet modern dark theme
- **Database & Storage**: [Supabase PostgreSQL](https://supabase.com/) & Local JSON State Backup
- **Otentikasi & Keamanan**: Password Hashing `node:crypto` (`scryptSync` + `timingSafeEqual`), CSRF HMAC SHA-256 Tokens
- **AI Models Supported**: Google Gemini 2.5/3.7 Flash, Claude 3.5 Sonnet, GPT-4o via OpenAI/LiteLLM Standard Tool Calling

---

## 🏁 Memulai Proyek

### 1. Klon Repositori
```bash
git clone https://github.com/rickyrizkymnf123-commits/vibecoder.git
cd vibecoder
```

### 2. Pasang Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Salin berkas template `.env.example` menjadi `.env.local` dan sesuaikan kredensial Anda:
```bash
cp .env.example .env.local
```

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3006](http://localhost:3006) di peramban Anda.

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT.
