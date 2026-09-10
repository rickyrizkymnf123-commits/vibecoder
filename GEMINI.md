# Gemini Guidelines — VibeCoder Platform

- Proyek ini adalah implementasi lengkap dari AI App Generator Platform "VibeCoder" (Forge) berbasis Next.js 14 App Router, Supabase Postgres, Midtrans Snap Sandbox, dan Vercel Deployment REST API.
- Generator aplikasi mendukung kategori apapun (POS, Booking, Inventaris, CRM, Member, Form, Keuangan) dan terhubung via `lib/ai-provider.ts`.
- Seluruh 10 langkah wajib AI Engine terimplementasi di `lib/builder/generator.ts`.
- Validasi sintaks AST menggunakan `lib/builder/linter.ts` dan pengujian in-process nyata di `lib/builder/tester.ts`.
- Script pengujian `npm run build`, `npx tsc --noEmit`, `node tests/inprocess-test.mjs`, dan `node tests/test-engine-e2e.mjs` telah diverifikasi dan siap dieksekusi setiap saat.
- Mendukung integrasi AI Central Custom Provider (LiteLLM/Koboillm/OpenAI-compatible) melalui halaman Pengaturan Akun (`/account`), memungkinkan pengguna menggunakan API Key dan model pilihan mereka sendiri untuk memandu pembuatan aplikasi secara nyata via ReAct loop.
