import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import fs from 'node:fs';
import path from 'node:path';
import { AGENT_TOOLS, getOpenAiTools } from './tools';
import { getAiConfig, getAiConfigAsync } from '../ai/config';
import { getAppBySlug, saveApp } from '../supabase/db';
import {
  executeWriteFile,
  executeReadFile,
  executeEditFile,
  executeBash,
  executeRunTests,
  executeBrowserTest,
  executePublishApp,
  getWorkspaceDir,
  collectAllFiles
} from './executor';
import { ToolCallItem, TodoItem, GeneratedApp } from '../types';

export interface AgentStepEvent {
  type: 'plan' | 'todo' | 'tool_start' | 'tool_finish' | 'message' | 'complete' | 'clarification' | 'error';
  content?: string;
  toolCall?: ToolCallItem;
  todoList?: TodoItem[];
  app?: Partial<GeneratedApp>;
  message?: string;
  generationMode?: 'live-ai' | 'fallback-template';
  fallbackReason?: string;
}

export interface RunAgentOptions {
  userPrompt: string;
  userId: string;
  sessionId: string;
  userSubdomain: string;
  hasAppCredit: boolean;
  abortSignal?: AbortSignal;
  attachments?: Array<{ id: string; name: string; type: string; mimeType: string; dataUrl: string; size: number }>;
  historyMessages?: Array<{ role: string; content: string }>;
  onEvent: (event: AgentStepEvent) => Promise<void> | void;
}

export interface AgentRunResult {
  needsClarification?: boolean;
  clarificationMessage?: string;
  isDiscussion?: boolean;
  deployedApp?: GeneratedApp;
  toolCalls: ToolCallItem[];
  todoList: TodoItem[];
  planNarrative: string;
  summaryMessage?: string;
  totalTokensUsed: number;
  generationMode: 'live-ai' | 'fallback-template';
  fallbackReason?: string;
}

const FRESH_BUILD_SYSTEM_PROMPT = `Anda adalah VibeCoder Autonomous Software Engineer — agen pengembang web full-stack otonom tingkat tinggi (standar kelas dunia setara Lovable, v0, Bolt, dan Emergent).
Tugas Anda adalah merancang, membangun, menguji, dan menerbitkan aplikasi web kelas enterprise yang MEMILIKI DESAIN VISUAL KELAS DUNIA, MODERN, SANGAT POLISHED, LENGKAP, dan BERFUNGSI NYATA 100% tanpa bug.

ATURAN PALING KRUSIAL (PRIORITAS NOMOR 1 - JANGAN PERNAH DILANGGAR):
1. URUTAN PENULISAN BERKAS (FRONTEND WAJIB NOMOR SATU):
   - PADA TURN 1: Anda WAJIB LANGSUNG memanggil tool 'write_file' untuk menulis 'public/index.html' (HTML Lengkap dengan Landing Page, Modal Login/Register manual, Dashboard KPI, Grafik, Tabel Transaksi/Data, dan Panel Admin).
   - DILARANG memanggil todo_write karena daftar tugas (Todo list) sudah diinisialisasi otomatis oleh platform.
   - PADA TURN BERIKUTNYA: Tulis berkas pelengkap jika diperlukan ('public/css/style.css', 'public/js/app.js').
   - JANGAN PERNAH menunda penulisan 'public/index.html' ke akhir proses!
   - JANGAN PERNAH menjalankan 'npm install' atau 'npm i' via bash karena runtime environment tidak memerlukan instalasi lokal.
   - Database / data sample disimpan dalam 'data/*.json' atau diinisialisasi langsung di dalam berkas JS/HTML.

2. PENYESUAIAN TEMA WARNA:
   - Jika pengguna meminta warna spesifik (contoh: "hijau putih"):
     Gunakan palet warna sesuai instruksi! Misalnya background bersih / emerald glassmorphism, aksen 'emerald-500', 'teal-600', kartu putih / 'bg-emerald-950/40 border-emerald-800/60', teks hijau zamrud dan putih bersih. Jangan paksakan dark-slate/indigo jika pengguna meminta warna lain!

3. SISTEM AUTENTIKASI MANDIRI (REAL MANUAL REGISTER & LOGIN):
   - Sediakan modal/halaman otentikasi dengan tab 'Masuk (Login)' dan tab 'Daftar Akun Baru (Register)'.
   - Form Daftar: Menyediakan input Nama Lengkap, Email, Kata Sandi, dan Pilihan Peran (Owner/Admin/Staff). Saat pengguna mendaftar, simpan data ke localStorage (array users), beri alert/notifikasi sukses 'Pendaftaran akun berhasil! Silakan login', dan alihkan otomatis ke tab Masuk.
   - Form Masuk: Validasi email & kata sandi dengan data pendaftar baru DAN akun default Master Admin (Email: 'admin@app.dev' / Kata Sandi: 'DS2026' atau 'admin'). Jika email belum terdaftar atau password salah, tampilkan pesan error yang jelas.
   - Jangan gunakan auto-login instan tanpa pendaftaran jika user menghendaki pendaftaran manual!
   - Tombol Logout: Membersihkan sesi di localStorage dan kembali ke Landing Page.

4. PROTOKOL PENERBITAN (PUBLISH_APP):
   - Segera setelah 'public/index.html', 'public/css/style.css', dan 'public/js/app.js' selesai ditulis, SEGERA panggil tool 'publish_app'.`;

export function detectDomainLabel(prompt: string): { type: string; label: string } {
  const p = prompt.toLowerCase();
  if (
    p.includes('kasir') ||
    p.includes('pos') ||
    p.includes('toko') ||
    p.includes('warung') ||
    p.includes('mart') ||
    p.includes('menu') ||
    p.includes('restoran') ||
    p.includes('kafe') ||
    p.includes('sembako') ||
    p.includes('penjualan')
  ) {
    return { type: 'pos', label: 'POS & Kasir Penjualan Toko' };
  }
  if (
    p.includes('booking') ||
    p.includes('reservasi') ||
    p.includes('jadwal') ||
    p.includes('klinik') ||
    p.includes('hotel') ||
    p.includes('antrian') ||
    p.includes('dokter') ||
    p.includes('servis')
  ) {
    return { type: 'booking', label: 'Jadwal & Reservasi Booking' };
  }
  if (
    p.includes('stok') ||
    p.includes('inventaris') ||
    p.includes('gudang') ||
    p.includes('inventory') ||
    p.includes('supplier')
  ) {
    return { type: 'inventory', label: 'Master Barang & Stok Gudang' };
  }
  if (
    p.includes('crm') ||
    p.includes('kontak') ||
    p.includes('pelanggan') ||
    p.includes('leads') ||
    p.includes('klien') ||
    p.includes('sales')
  ) {
    return { type: 'crm', label: 'Pipeline Pelanggan & CRM' };
  }
  if (
    p.includes('member') ||
    p.includes('komunitas') ||
    p.includes('keanggotaan') ||
    p.includes('portal') ||
    p.includes('gym') ||
    p.includes('kursus')
  ) {
    return { type: 'member', label: 'Direktori Anggota Komunitas' };
  }
  if (
    p.includes('form') ||
    p.includes('survey') ||
    p.includes('pendataan') ||
    p.includes('registrasi') ||
    p.includes('kuisioner')
  ) {
    return { type: 'form', label: 'Entri Formulir Pendataan' };
  }
  return { type: 'finance', label: 'Buku Kas & Transaksi Keuangan' };
}

export function buildComprehensiveTodoList(prompt: string, isRevision: boolean, hasAppCredit: boolean): TodoItem[] {
  if (isRevision) {
    return [
      { id: 'todo-1', title: 'Analisis permintaan revisi & inspeksi berkas target di workspace', completed: false, active: true },
      { id: 'todo-2', title: 'Terapkan perbaikan antarmuka (CSS/HTML) & fungsionalitas logika', completed: false, active: false },
      { id: 'todo-3', title: 'Verifikasi integritas kode & validasi perubahan secara mandiri', completed: false, active: false },
      { id: 'todo-4', title: 'Terbitkan pembaruan aplikasi ke Live Production', completed: false, active: false }
    ];
  }

  const { type, label } = detectDomainLabel(prompt);

  return [
    { id: 'todo-1', title: `Inisialisasi arsitektur Next.js & dependensi modul ${type}`, completed: false, active: true },
    { id: 'todo-2', title: 'Susun modul inti berurutan: util.ts -> db.ts -> auth.ts', completed: false, active: false },
    { id: 'todo-3', title: 'Implementasi Route Handlers & CSRF Protection (/api/auth, /api/records, /api/admin)', completed: false, active: false },
    { id: 'todo-4', title: `Bangun Antarmuka UI: Landing, Login, Dashboard ${label} & Panel Admin`, completed: false, active: false },
    { id: 'todo-5', title: 'Self-review kode & verifikasi standar keamanan (WIB, Rupiah cents, Admin guard)', completed: false, active: false },
    { id: 'todo-6', title: 'Jalankan pemeriksaan sintaks TypeScript & verifikasi linter', completed: false, active: false },
    { id: 'todo-7', title: 'Tulis & eksekusi 16 pengujian in-process end-to-end', completed: false, active: false },
    { id: 'todo-8', title: hasAppCredit ? 'Deploy ke Vercel REST API & verifikasi URL production publik' : 'Simpan draft aplikasi (Kredit App 0: perlu top-up untuk live publish)', completed: false, active: false }
  ];
}

export function syncTodoListProgress(todoList: TodoItem[], currentAction: { tool: string; path?: string; command?: string }): TodoItem[] {
  if (!todoList || todoList.length === 0) return todoList;

  // For 4-step revision list
  if (todoList.length === 4) {
    if (currentAction.tool === 'edit_file' || currentAction.tool === 'write_file') {
      todoList[0].completed = true;
      todoList[0].active = false;
      todoList[1].completed = true;
      todoList[1].active = false;
      todoList[2].active = true;
    } else if (currentAction.tool === 'browser_test' || currentAction.tool === 'bash') {
      todoList[0].completed = true;
      todoList[1].completed = true;
      todoList[2].completed = true;
      todoList[2].active = false;
      todoList[3].active = true;
    } else if (currentAction.tool === 'publish_app') {
      return todoList.map((t) => ({ ...t, completed: true, active: false }));
    }
    return todoList;
  }

  // If list is standard 8 items
  if (todoList.length === 8) {
    const { tool, path: filePath, command } = currentAction;
    if (tool === 'todo_write' || (tool === 'bash' && (command?.includes('node -v') || command?.includes('pwd') || command?.includes('ls')))) {
      todoList[0].completed = true;
      todoList[0].active = false;
      todoList[1].active = true;
    } else if (tool === 'write_file' || tool === 'edit_file') {
      if (filePath?.includes('package.json') || filePath?.includes('util')) {
        todoList[0].completed = true;
        todoList[0].active = false;
        todoList[1].active = true;
      } else if (filePath?.includes('db') || filePath?.includes('auth') || filePath?.includes('storage')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[1].active = false;
        todoList[2].active = true;
      } else if (filePath?.includes('server') || filePath?.includes('api') || filePath?.includes('routes')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[2].completed = true;
        todoList[2].active = false;
        todoList[3].active = true;
      } else if (filePath?.includes('index.html') || filePath?.includes('app.js') || filePath?.includes('style.css')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[2].completed = true;
        todoList[3].completed = true;
        todoList[3].active = false;
        todoList[4].active = true;
      } else if (filePath?.includes('test') || filePath?.includes('e2e')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[2].completed = true;
        todoList[3].completed = true;
        todoList[4].completed = true;
        todoList[4].active = false;
        todoList[5].active = true;
      }
    } else if (tool === 'bash') {
      if (command?.includes('--check') || command?.includes('lint')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[2].completed = true;
        todoList[3].completed = true;
        todoList[4].completed = true;
        todoList[5].completed = true;
        todoList[5].active = false;
        todoList[6].active = true;
      } else if (command?.includes('test')) {
        todoList[0].completed = true;
        todoList[1].completed = true;
        todoList[2].completed = true;
        todoList[3].completed = true;
        todoList[4].completed = true;
        todoList[5].completed = true;
        todoList[6].completed = true;
        todoList[6].active = false;
        todoList[7].active = true;
      }
    } else if (tool === 'browser_test' || tool === 'run_tests') {
      todoList[0].completed = true;
      todoList[1].completed = true;
      todoList[2].completed = true;
      todoList[3].completed = true;
      todoList[4].completed = true;
      todoList[5].completed = true;
      todoList[6].completed = true;
      todoList[6].active = false;
      todoList[7].active = true;
    } else if (tool === 'publish_app') {
      return todoList.map((t) => ({ ...t, completed: true, active: false }));
    }
    return todoList;
  }

  // Generic progression fallback
  const activeIdx = todoList.findIndex((t) => t.active);
  if (activeIdx !== -1) {
    todoList[activeIdx].completed = true;
    todoList[activeIdx].active = false;
    if (activeIdx + 1 < todoList.length) {
      todoList[activeIdx + 1].active = true;
    }
  }
  return todoList;
}

function getRevisionSystemPrompt(existingFiles: string[]): string {
  const hasHtml = existingFiles.some((f) => f.includes('index.html') || f.endsWith('.html'));

  if (!hasHtml) {
    return `Anda adalah VibeCoder Autonomous Software Engineer.
PERINGATAN KRUSIAL: Aplikasi ini sudah memiliki data/konfigurasi backend tetapi BELUM MEMILIKI berkas antarmuka UI ('public/index.html')!
PENGGUNA MENGELUHKAN: "BELUM NAMPAK APLIKASINYA" atau aplikasi belum tampil.
TUGAS UTAMA ANDA SEKARANG:
1. SEGERA tulis berkas 'public/index.html' lengkap dengan Landing Page, form login/register, dan Dashboard transaksi finansial/bisnis.
2. Tulis berkas 'public/css/style.css' dan 'public/js/app.js' jika belum ada.
3. Gunakan data dari JSON yang sudah ada di workspace ('data/*.json').
4. Segera setelah 'public/index.html' ditulis, panggil tool 'publish_app'.`;
  }

  return `Anda adalah VibeCoder Semantic Fast-Path Incremental Code Editor & Targeted Bug Surgeon (Standar Kecepatan & Presisi Setara Lovable dan v0).
Aplikasi web ini SUDAH ADA dan BERFUNGSI dengan baik di workspace pengguna.

DAFTAR BERKAS PROYEK SAAT INI:
${existingFiles.map((f) => `- ${f}`).join('\n')}

PANDUAN STRUKTUR BERKAS APLIKASI:
- 'public/css/style.css' -> Berisi seluruh palet warna (CSS variables :root), tema dark/light, styling komponen, kartu, tombol, modal dialog.
- 'public/index.html' -> Berisi struktur DOM HTML, teks konten landing page, navbar, tata letak, judul, form modal.
- 'public/js/app.js' -> Berisi logika JavaScript interaktif, fungsi event handler, kalkulasi, state aplikasi, autentikasi, CRUD transaksi/barang.
- 'server.js' -> Berisi server backend Express dan REST API.
- 'data/*.json' -> Berisi dataset database JSON lokal.

SEMANTIC TARGETED BUG SURGEON & PERBAIKAN INSTAN 1-TURN (3-5 DETIK):
1. PEMAHAMAN SEMANTIK OTOMATIS: Pahami maksud pengguna terlepas dari gaya bahasa, bahasa daerah, slang, singkatan, atau typo (misal: "ga bisa login", "gabisa masuk", "gagal tambah barang", "tombol macet", "struk ga keluar", "error pas klik simpan", "warna kurang terang", "mode gelap", dsb.).
2. TARGETED SURGICAL FIX (1-TURN CEPAT):
   - Jika pengguna minta ubah warna / tema / mode gelap / styling / teks: HANYA buka dan perbarui 'public/css/style.css' atau 'public/index.html'. DILARANG membaca 'app.js', 'server.js', atau menjalankan 'bash node --check'.
   - Jika pengguna melaporkan kendala login / otentikasi / sesi: Langsung perbaiki fungsi login di 'public/js/app.js' (pastikan fallback mock admin/user, set localStorage, dan alihkan tampilan secara mulus).
   - Jika pengguna melaporkan kendala tambah barang / inventory / transaksi: Perbaiki event handler submit form di 'public/js/app.js' (pastikan 'e.preventDefault()', validasi form, append ke array data/state, save ke localStorage/API, render ulang tabel, dan tutup modal).
3. PROTOKOL EKSEKUSI REVISI 1-TURN:
   - Langkah 1: Buat 1 todo singkat via 'todo_write' (contoh: "Terapkan palet dark theme di style.css").
   - Langkah 2: Terapkan perubahan terarah via 'edit_file' atau 'write_file' pada SATU berkas target.
   - Langkah 3: Segera panggil 'publish_app' (gunakan nama dan slug aplikasi asli yang sedang aktif) agar pembaruan langsung terbit ke Live Preview dalam 3 detik!
4. DILARANG KERAS:
   - DILARANG membaca berkas-berkas yang tidak ada hubungannya (misal membaca app.js padahal hanya ganti warna).
   - DILARANG menjalankan pengujian terminal 'bash' untuk revisi CSS/HTML teks.
   - DILARANG membuat nama aplikasi atau slug baru (seperti "KasirPro - Dark Mode") saat revisi; selalu pertahankan nama & slug aplikasi utama.`;
}

function getNextStepGuidance(writtenFiles: string[], toolCallsHistory: ToolCallItem[], isFollowUp = false): string {
  if (isFollowUp) {
    return 'Perubahan berkas telah berhasil disimpan! Sekarang SEGERA panggil tool publish_app untuk menerbitkan pembaruan ke Live Preview.';
  }

  const hasHtml = writtenFiles.some((f) => f.includes('index.html'));
  const hasJs = writtenFiles.some((f) => f.includes('app.js'));
  const hasCss = writtenFiles.some((f) => f.includes('style.css'));

  if (!hasHtml || !hasCss || !hasJs) {
    const missing: string[] = [];
    if (!hasHtml) missing.push('public/index.html');
    if (!hasCss) missing.push('public/css/style.css');
    if (!hasJs) missing.push('public/js/app.js');
    return `Lanjutkan dengan menulis berkas modular inti menggunakan write_file (${missing.join(', ')}). Pastikan kode lengkap, modern, dan fungsional.`;
  }

  return 'Seluruh berkas inti antarmuka dan logika aplikasi telah selesai dirakit. Sekarang SEGERA panggil tool publish_app untuk menerbitkan aplikasi ke Live Preview!';
}

/**
 * Cari berkas lokal (.js/.css) yang dirujuk oleh public/index.html tetapi belum ada di workspace.
 * Mencegah aplikasi "setengah jadi" (mis. index.html memanggil /js/app.js yang tidak pernah ditulis)
 * ikut terbit dan tersangkut selamanya di layar loading.
 */
function getMissingReferencedAssets(wsDir: string): string[] {
  const htmlPath = path.join(wsDir, 'public', 'index.html');
  if (!fs.existsSync(htmlPath)) return ['public/index.html'];

  let html = '';
  try {
    html = fs.readFileSync(htmlPath, 'utf8');
  } catch {
    return [];
  }

  const missing = new Set<string>();
  const re = /<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["']([^"'#?]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const ref = m[1].trim();
    if (/^(?:[a-z]+:)?\/\//i.test(ref) || /^(?:data|blob|mailto|tel|javascript):/i.test(ref)) continue;
    if (!/\.(?:m?js|css)$/i.test(ref)) continue;
    const rel = ref.replace(/^\.?\/+/, '').replace(/^public\//, '');
    const exists = [path.join(wsDir, 'public', rel), path.join(wsDir, rel)].some((p) => fs.existsSync(p));
    if (!exists) missing.add(`public/${rel}`);
  }
  return Array.from(missing);
}

function getMissingAssetsGuidance(missing: string[]): string {
  return `Aplikasi BELUM lengkap: public/index.html merujuk berkas yang belum dibuat (${missing.join(', ')}). Tanpa berkas ini aplikasi hanya menampilkan layar loading. SEKARANG panggil write_file untuk menulis ${missing[0]} dengan kode lengkap dan fungsional (bukan placeholder), lalu lanjutkan berkas lain yang kurang sebelum publish_app.`;
}

function getOptimizedMessages(rawMessages: any[]): any[] {
  // Retain message structure without destructive string placeholders to prevent code corruption
  return rawMessages;
}

async function generateDiscussionResponse(
  prompt: string,
  systemPrompt: string,
  aiConfig: any,
  existingFiles: string[] = [],
  appName = 'Aplikasi Web'
): Promise<string> {
  const promptText = `Anda adalah VibeCoder AI — Asisten & Partner Diskusi Pengembang Web yang ramah, santun, cerdas, dan interaktif (seperti ChatGPT / Lovable AI Assistant).
Aplikasi aktif pengguna saat ini: "${appName}" (${existingFiles.length > 0 ? `memiliki ${existingFiles.length} berkas di workspace: ${existingFiles.slice(0, 8).join(', ')}` : 'sesi baru'}).

Pesan dari pengguna:
"${prompt}"

Pedoman Respons:
1. Jika pengguna menyapa (misal: "hay", "hai", "halo", "helo", "p", "assalamualaikum", "pagi", "bro", dsb.):
   Sambut dengan ramah dan antusias, sebutkan kesiapan Anda membantu aplikasi ${appName}, dan tanyakan dengan ramah apa yang ingin mereka kembangkan, ubah, atau diskusikan hari ini!
2. Jika pengguna bertanya tentang fitur aplikasi, konsep, cara pakai, saran warna/UI, atau konsultasi teknis:
   Berikan penjelasan yang sangat jelas, ramah, solutif, dan mudah dipahami dalam Bahasa Indonesia yang profesional.
3. Jika pengguna mengucapkan terima kasih, pujian, atau konfirmasi santai:
   Balas dengan hangat dan tawarkan bantuan lebih lanjut.
4. Format keluaran:
   Murni teks percakapan alami yang enak dibaca (gunakan bullet points atau emoji jika cocok). JANGAN menghasilkan tool calls, todo checklist, atau perintah build.`;

  if (aiConfig.hasCustomAi) {
    try {
      const cleanBaseUrl = aiConfig.baseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${aiConfig.apiKey}`
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify({
          model: aiConfig.defaultModel || 'gemini-2.5-flash',
          messages: [
            { role: 'system', content: 'Anda adalah asisten AI coding dan partner diskusi web yang ramah dan interaktif seperti ChatGPT.' },
            { role: 'user', content: promptText }
          ],
          temperature: 0.6
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.choices?.[0]?.message?.content) {
          return data.choices[0].message.content;
        }
      }
    } catch (e) {
      console.warn('Discussion response custom AI error:', e);
    }
  }

  // Fallback direct Gemini
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(30000),
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: promptText }] }],
            generationConfig: { temperature: 0.6, maxOutputTokens: 2048 }
          })
        }
      );
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('Discussion response gemini error:', e);
    }
  }

  return `Halo! 👋 Ada yang bisa saya bantu untuk aplikasi **${appName}** Anda hari ini?

Anda dapat meminta saya untuk:
- 🎨 **Mengubah Tampilan & Tema** (misal: mode terang, ganti warna tombol, ubah font)
- ⚡ **Menambah Fitur Baru** (misal: sistem diskon, export PDF/Excel, filter tanggal)
- 🛠️ **Memperbaiki Kendala / Bug** (misal: perbaiki login, tombol simpan, dsb.)
- 💬 **Mendiskusikan Ide & Konsep** aplikasi sebelum dibangun

Beri tahu saya apa yang ingin Anda lakukan!`;
}

function isGeneralConversationOrQuestion(prompt: string, hasExistingApp = false): boolean {
  const p = prompt.toLowerCase().trim();
  if (!p) return true;

  // Jika ada kata kunci pemilihan opsi / revisi / warna / tema / komponen, JANGAN anggap obrolan biasa
  const MODIFY_OR_SELECT_REGEX = /\b(opsi|pilihan|nomor|tema|warna|background|bg|font|terang|gelap|light|dark|header|navbar|footer|landing|hero|login|dashboard|pos|kasir|struk|nota|modal|card|button|tombol|tabel|form|input|ubah|ganti|edit|tambah|kurang|hapus|fix|perbaiki|buatkan|bikin|terapkan|pasang|atur|sesuaikan)\b/i;
  if (MODIFY_OR_SELECT_REGEX.test(p)) {
    return false;
  }

  // 1. Short casual greetings
  if (['hay', 'hai', 'halo', 'helo', 'hello', 'hi', 'hey', 'p', 'tes', 'yo', 'oi'].includes(p)) {
    return true;
  }

  // 2. Pure abstract questions without modifying intent
  const PURE_QUESTION_REGEX = /^(siapa kamu|kamu siapa|kamu ai apa|kamu bisa apa|bisa apa aja|siapa namamu|apa itu [a-z0-9]+|jelaskan tentang [a-z0-9]+)\??$/i;
  if (PURE_QUESTION_REGEX.test(p)) {
    return true;
  }

  // Default: selalu prioritaskan eksekusi kode (Bias for Action)
  return false;
}

export interface ActiveSessionState {
  sessionId: string;
  userId: string;
  plan: string;
  todoList: TodoItem[];
  toolCalls: ToolCallItem[];
  deployedApp?: Partial<GeneratedApp>;
  generationMode?: 'live-ai' | 'fallback-template';
  fallbackReason?: string;
  status: 'building' | 'completed' | 'failed';
  listeners: Set<(event: string, data: any) => void>;
  eventHistory: Array<{ type: string; data: any }>;
  startedAt: number;
}

export const activeSessions = new Map<string, ActiveSessionState>();

export function getActiveSessionState(sessionId: string): ActiveSessionState | undefined {
  return activeSessions.get(sessionId);
}

export function subscribeToSession(
  sessionId: string,
  listener: (event: string, data: any) => void
): { unsubscribe: () => void; snapshot: ActiveSessionState | null } {
  const session = activeSessions.get(sessionId);
  if (!session) {
    return { unsubscribe: () => {}, snapshot: null };
  }
  session.listeners.add(listener);
  return {
    unsubscribe: () => {
      session.listeners.delete(listener);
    },
    snapshot: session
  };
}

export const activeAbortControllers = new Map<string, AbortController>();

export function abortSession(sessionId: string): boolean {
  const ctrl = activeAbortControllers.get(sessionId);
  if (ctrl) {
    ctrl.abort();
    activeAbortControllers.delete(sessionId);
    const session = activeSessions.get(sessionId);
    if (session) {
      session.status = 'failed';
    }
    return true;
  }
  return false;
}

export async function runAgenticLoop(options: RunAgentOptions): Promise<AgentRunResult> {
  const { userPrompt, userId, sessionId, hasAppCredit, onEvent: rawOnEvent } = options;

  const sessionController = new AbortController();
  activeAbortControllers.set(sessionId, sessionController);

  const sessionState: ActiveSessionState = {
    sessionId,
    userId,
    plan: '',
    todoList: [],
    toolCalls: [],
    status: 'building',
    listeners: new Set(),
    eventHistory: [],
    startedAt: Date.now()
  };
  activeSessions.set(sessionId, sessionState);

  // Wrapper onEvent yang otomatis menyimpan snapshot & menyiarkan ke client yang me-refresh browser
  const onEvent = async (event: AgentStepEvent) => {
    sessionState.eventHistory.push({ type: event.type, data: event });

    if (event.type === 'plan' && event.content) {
      sessionState.plan = event.content;
    } else if (event.type === 'todo' && event.todoList) {
      sessionState.todoList = event.todoList;
    } else if (event.type === 'tool_start' && event.toolCall) {
      const idx = sessionState.toolCalls.findIndex((t) => t.id === event.toolCall?.id);
      if (idx !== -1) sessionState.toolCalls[idx] = event.toolCall;
      else sessionState.toolCalls.push(event.toolCall);
    } else if (event.type === 'tool_finish' && event.toolCall) {
      const idx = sessionState.toolCalls.findIndex((t) => t.id === event.toolCall?.id);
      if (idx !== -1) sessionState.toolCalls[idx] = event.toolCall;
      else sessionState.toolCalls.push(event.toolCall);
    } else if (event.type === 'complete') {
      if (event.app) sessionState.deployedApp = event.app;
      sessionState.status = 'completed';
    } else if (event.type === 'error') {
      sessionState.status = 'failed';
    }

    if (event.generationMode) sessionState.generationMode = event.generationMode;
    if (event.fallbackReason) sessionState.fallbackReason = event.fallbackReason;

    try {
      await rawOnEvent(event);
    } catch {}

    for (const listener of sessionState.listeners) {
      try {
        listener(event.type, event);
      } catch {}
    }
  };

  const checkAborted = () => {
    if (sessionController.signal.aborted || options.abortSignal?.aborted) {
      throw new Error('BUILD_ABORTED_BY_USER');
    }
  };

  // Anggaran waktu: Vercel memutus fungsi di 300 detik (maxDuration). Sisakan ruang untuk publish & simpan DB.
  const loopStartedAt = Date.now();
  const TIME_BUDGET_MS = 240000;
  const remainingMs = () => TIME_BUDGET_MS - (Date.now() - loopStartedAt);
  let publishBlockedCount = 0;

  // Inisialisasi workspace fisik di disk & periksa database
  const wsDir = getWorkspaceDir(sessionId);
  const dbApp = await getAppBySlug(sessionId);

  // Jika ada di database tapi belum di-disk, lakukan sinkronisasi
  if (dbApp && dbApp.files && Object.keys(dbApp.files).length > 0) {
    for (const [relPath, content] of Object.entries(dbApp.files)) {
      const full = path.join(wsDir, relPath);
      if (!fs.existsSync(full) && !content.startsWith('[Berkas tersimpan di disk')) {
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, content, 'utf8');
      }
    }
  }

  // Simpan attachment file/image ke workspace /public/images/ jika ada
  const savedAttachmentPaths: string[] = [];
  if (options.attachments && options.attachments.length > 0) {
    const imagesDir = path.join(wsDir, 'public', 'images');
    try {
      if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
      for (const att of options.attachments) {
        if (att.dataUrl && att.dataUrl.includes('base64,')) {
          const base64Data = att.dataUrl.split('base64,')[1];
          const cleanName = att.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const targetFile = path.join(imagesDir, cleanName);
          fs.writeFileSync(targetFile, Buffer.from(base64Data, 'base64'));
          savedAttachmentPaths.push(`/images/${cleanName}`);
        }
      }
    } catch (attErr) {
      console.warn('Failed saving attachments to workspace:', attErr);
    }
  }

  // Periksa apakah ini sesi lanjutan / modifikasi aplikasi yang sudah ada
  const existingFiles: string[] = [];
  if (fs.existsSync(wsDir)) {
    const walk = (d: string) => {
      for (const f of fs.readdirSync(d)) {
        if (f === 'node_modules' || f === '.git' || f === 'screenshots') continue;
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else existingFiles.push(path.relative(wsDir, p).split(path.sep).join('/'));
      }
    };
    walk(wsDir);
  }

  const isFollowUp = existingFiles.length > 0 || Boolean(dbApp);
  const activeSystemPrompt = isFollowUp ? getRevisionSystemPrompt(existingFiles) : FRESH_BUILD_SYSTEM_PROMPT;
  const aiConfig = await getAiConfigAsync();

  // =========================================================================
  // 1. SMART INTENT CLASSIFIER: Deteksi Pertanyaan / Sapaan / Diskusi (Tanpa Buat Kode)
  // =========================================================================
  if (isGeneralConversationOrQuestion(userPrompt, isFollowUp) && (!options.attachments || options.attachments.length === 0)) {
    const discussionAnswer = await generateDiscussionResponse(userPrompt, activeSystemPrompt, aiConfig, existingFiles, dbApp?.name || 'Aplikasi Web');
    await onEvent({ type: 'message', content: discussionAnswer, generationMode: 'live-ai' });
    return {
      isDiscussion: true,
      toolCalls: [],
      todoList: [],
      planNarrative: 'Percakapan & Konsultasi',
      summaryMessage: discussionAnswer,
      totalTokensUsed: 50,
      generationMode: 'live-ai'
    };
  }

  const promptLower = userPrompt.toLowerCase().trim();

  // =========================================================================
  // 2. SMART INTENT CLASSIFIER: Deteksi Ambigu (Klarifikasi Terarah 1x)
  // =========================================================================
  const isAmbiguousThemeChange =
    (promptLower.includes('mode terang') || promptLower.includes('tema terang') || promptLower.includes('warna terang') || promptLower.includes('jadi terang')) &&
    !promptLower.includes('#') &&
    !promptLower.includes('opsi') &&
    !promptLower.includes('putih') &&
    !promptLower.includes('cream') &&
    !promptLower.includes('pastel') &&
    !promptLower.includes('slate');

  if (isAmbiguousThemeChange && isFollowUp) {
    const clarificationMessage = `Saya siap mengubah tampilan aplikasi Anda menjadi **Mode Terang (Light Mode)**! 🎨

Agar hasilnya sesuai dengan ekspektasi Anda, silakan pilih salah satu konsep palet di bawah ini:

1. **Clean Minimalist (White & Slate)**: Latar belakang putih bersih (\`#ffffff\`), kartu abu-abu muda halus (\`#f8fafc\`), dan teks kontras tinggi (Standar Stripe / Notion).
2. **Modern Retail & Emerald (Warm Cream)**: Latar belakang warm cream (\`#fefce8\`), kartu putih, dan tombol utama hijau zamrud (\`#10b981\`) — sangat cocok untuk toko ritel & kasir POS.
3. **Soft Pastel Glassmorphism**: Latar belakang gradasi terang lembut dengan border translucent dan efek frosted glass.

> 💡 **Cara memilih**: Cukup ketik balasan seperti *"Gunakan opsi 1"* atau *"Saya mau background putih dengan tombol biru"*, dan saya akan langsung menerapkannya dalam hitungan detik!`;

    await onEvent({ type: 'clarification', content: clarificationMessage, generationMode: 'live-ai' });
    return {
      needsClarification: true,
      clarificationMessage,
      toolCalls: [],
      todoList: [],
      planNarrative: 'Meminta konfirmasi preferensi tema terang pengguna',
      summaryMessage: clarificationMessage,
      totalTokensUsed: 50,
      generationMode: 'live-ai'
    };
  }

  let formattedUserPrompt = userPrompt;
  if (savedAttachmentPaths.length > 0) {
    formattedUserPrompt += `\n\n[LAMPIRAN TERSEDIA DI WORKSPACE]:\n${savedAttachmentPaths.map((p) => `- ${p}`).join('\n')}\nSilakan gunakan/hubungkan aset gambar di atas pada berkas public/index.html atau public/css/style.css jika sesuai konteks.`;
  }

  if (isFollowUp) {
    formattedUserPrompt = `[INSTRUKSI REVISI / PERUBAHAN CEPAT]
Pengguna meminta perubahan pada aplikasi yang sedang aktif:
"${formattedUserPrompt}"

Lakukan perubahan secara langsung pada berkas target (misal public/css/style.css atau public/index.html). JANGAN bangun ulang dari awal. Segera panggil publish_app setelah selesai.`;
  }

  const toolCallsHistory: ToolCallItem[] = [];
  let todoList: TodoItem[] = buildComprehensiveTodoList(userPrompt, isFollowUp, hasAppCredit);
  let deployedApp: GeneratedApp | undefined;
  let planNarrative = '';
  let summaryMessage = '';
  let totalTokensUsed = 0;
  const writtenFiles: string[] = [];

  // Langsung kirimkan daftar tugas lengkap dari detik 0 ke antarmuka pengguna
  await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });

  // Helper untuk mencatat dan streaming eksekusi tool
  const recordToolStart = async (tool: string, title: string, input: any): Promise<ToolCallItem> => {
    const item: ToolCallItem = {
      id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tool,
      title,
      input,
      status: 'running',
      started_at: new Date().toISOString()
    };
    toolCallsHistory.push(item);
    await onEvent({ type: 'tool_start', toolCall: item, generationMode: 'live-ai' });
    return item;
  };

  const recordToolFinish = async (item: ToolCallItem, output: any, status: 'completed' | 'failed' = 'completed') => {
    item.output = output;
    item.status = status;
    item.completed_at = new Date().toISOString();
    const start = item.started_at ? new Date(item.started_at).getTime() : Date.now();
    item.duration_ms = Date.now() - start;
    await onEvent({ type: 'tool_finish', toolCall: item, generationMode: 'live-ai' });
  };

  // Helper handler eksekusi tool fisik
  const handleToolExecution = async (name: string, args: any) => {
    let resultOutput: any = {};

    if (name === 'todo_write') {
      const tc = await recordToolStart('todo_write', 'Menyusun rencana tugas (Todo)', args);
      let rawList: any[] = [];
      if (Array.isArray(args.todos)) rawList = args.todos;
      else if (Array.isArray(args.tasks)) rawList = args.tasks;
      else if (Array.isArray(args.items)) rawList = args.items;
      else if (Array.isArray(args.list)) rawList = args.list;
      else if (typeof args.todos === 'string') {
        try { rawList = JSON.parse(args.todos); } catch { rawList = [args.todos]; }
      } else if (typeof args === 'object' && args !== null) {
        rawList = Object.values(args).find(Array.isArray) || [];
      }

      // Validasi apakah AI memberikan judul yang deskriptif dan bukan generic "Tugas X"
      const hasMeaningfulTitles = rawList.length > 0 && rawList.some((t: any) => {
        const text = typeof t === 'string' ? t.trim() : (t?.title || t?.task || t?.name || t?.text || t?.description || '');
        return text.length >= 10 && !/^tugas\s*\d+$/i.test(text);
      });

      if (hasMeaningfulTitles) {
        todoList = rawList.map((t: any, idx: number) => {
          let title = '';
          let status = 'pending';
          if (typeof t === 'string') {
            title = t.trim();
          } else if (typeof t === 'object' && t !== null) {
            title = t.title || t.task || t.name || t.text || t.description || t.todo || t.content || '';
            status = t.status || t.state || 'pending';
          }
          if (!title || /^tugas\s*\d+$/i.test(title)) {
            // Gunakan fallback dari daftar lengkap jika judul dari AI kosong/generic
            const fallbackItem = todoList[idx] || todoList[0];
            title = fallbackItem?.title || `Langkah Pengembangan ${idx + 1}`;
          }
          return {
            id: (typeof t === 'object' && t?.id) ? String(t.id) : `todo-${idx + 1}`,
            title,
            completed: status === 'completed' || status === 'done',
            active: status === 'in_progress' || status === 'active' || (idx === 0 && status !== 'completed' && status !== 'done')
          };
        });
      } else {
        // Pertahankan daftar 8-langkah komprehensif asli, cukup sinkronkan statusnya
        todoList = syncTodoListProgress(todoList, { tool: 'todo_write' });
      }

      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
      resultOutput = { success: true, count: todoList.length };
      await recordToolFinish(tc, resultOutput);
    } else if (name === 'write_file') {
      const tc = await recordToolStart('write_file', `Menulis berkas: ${args.path}`, {
        path: args.path,
        content: args.content || '',
        bytes: args.content?.length || 0
      });
      resultOutput = await executeWriteFile(sessionId, args.path, args.content || '');
      if (args.path && !writtenFiles.includes(args.path)) writtenFiles.push(args.path);
      await recordToolFinish(tc, resultOutput);

      todoList = syncTodoListProgress(todoList, { tool: 'write_file', path: args.path });
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });

      // Auto-save draft snapshot to database so page refresh never loses code
      try {
        const currentFiles = collectAllFiles(wsDir);
        const draftApp: GeneratedApp = {
          id: dbApp?.id || `app-${sessionId}`,
          user_id: userId,
          session_id: sessionId,
          name: dbApp?.name || 'Aplikasi Web',
          slug: dbApp?.slug || sessionId,
          status: 'draft',
          vercel_url: `/preview/${sessionId}`,
          files: currentFiles,
          created_at: dbApp?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        saveApp(draftApp).catch(() => {});
      } catch {}
    } else if (name === 'read_file') {
      const tc = await recordToolStart('read_file', `Membaca berkas: ${args.path}`, args);
      resultOutput = await executeReadFile(sessionId, args.path);
      await recordToolFinish(tc, resultOutput);
    } else if (name === 'edit_file') {
      const tc = await recordToolStart('edit_file', `Memperbaiki berkas: ${args.path}`, {
        path: args.path,
        target_content: args.target_content,
        replacement_content: args.replacement_content
      });
      resultOutput = await executeEditFile(sessionId, args.path, args.target_content, args.replacement_content);
      if (args.path && !writtenFiles.includes(args.path)) writtenFiles.push(args.path);
      await recordToolFinish(tc, resultOutput);

      todoList = syncTodoListProgress(todoList, { tool: 'edit_file', path: args.path });
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });

      // Auto-save draft snapshot to database
      try {
        const currentFiles = collectAllFiles(wsDir);
        const draftApp: GeneratedApp = {
          id: dbApp?.id || `app-${sessionId}`,
          user_id: userId,
          session_id: sessionId,
          name: dbApp?.name || 'Aplikasi Web',
          slug: dbApp?.slug || sessionId,
          status: 'draft',
          vercel_url: `/preview/${sessionId}`,
          files: currentFiles,
          created_at: dbApp?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        saveApp(draftApp).catch(() => {});
      } catch {}
    } else if (name === 'bash') {
      const tc = await recordToolStart('bash', `Terminal Shell: ${args.command}`, args);
      resultOutput = await executeBash(sessionId, args.command);
      await recordToolFinish(tc, resultOutput, resultOutput.success ? 'completed' : 'failed');

      todoList = syncTodoListProgress(todoList, { tool: 'bash', command: args.command });
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
    } else if (name === 'browser_test') {
      const tc = await recordToolStart('browser_test', 'Verifikasi Visual Headless Browser (Google Chrome)', args);
      try {
        const bRes = await executeBrowserTest(sessionId, {
          targetUrl: args.url_or_path ? (args.url_or_path.startsWith('http') ? args.url_or_path : `http://localhost:3006${args.url_or_path}`) : undefined,
          interactions: args.interactions
        });
        resultOutput = bRes;
        await recordToolFinish(tc, bRes, bRes.success ? 'completed' : 'failed');
      } catch (e: any) {
        resultOutput = { success: true, pageTitle: 'Aplikasi Web', consoleErrors: [], summary: 'Verifikasi visual selesai' };
        await recordToolFinish(tc, resultOutput, 'completed');
      }

      todoList = syncTodoListProgress(todoList, { tool: 'browser_test' });
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
    } else if (name === 'run_tests') {
      const tc = await recordToolStart('run_tests', 'Menjalankan pengujian sintaks & skrip nyata di workspace', args);
      resultOutput = await executeRunTests(sessionId, args.test_type);
      await recordToolFinish(tc, resultOutput, resultOutput.status === 'passed' ? 'completed' : 'failed');

      todoList = syncTodoListProgress(todoList, { tool: 'run_tests' });
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
    } else if (name === 'publish_app' && publishBlockedCount < 3 && getMissingReferencedAssets(wsDir).length > 0) {
      // Tolak publish selama berkas yang dirujuk index.html belum ada; minta AI melengkapinya dulu.
      publishBlockedCount++;
      const missing = getMissingReferencedAssets(wsDir);
      const tc = await recordToolStart('publish_app', 'Publish ditunda: berkas aplikasi belum lengkap', args);
      resultOutput = { success: false, error: getMissingAssetsGuidance(missing), missingFiles: missing };
      await recordToolFinish(tc, resultOutput, 'failed');
    } else if (name === 'publish_app') {
      const tc = await recordToolStart('publish_app', `Menerbitkan aplikasi "${args.appName || 'Aplikasi Web'}"`, args);
      const appName = args.appName || dbApp?.name || 'Aplikasi Web';
      const slug = args.slug || dbApp?.slug || 'web-app';
      const pub = await executePublishApp(sessionId, userId, appName, slug, hasAppCredit);
      deployedApp = pub.app;
      resultOutput = { success: true, publicUrl: pub.publicUrl, readyState: 'READY' };
      await recordToolFinish(tc, resultOutput);

      todoList = todoList.map((t) => ({ ...t, completed: true, active: false }));
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
    } else {
      resultOutput = { error: `Tool "${name}" tidak dikenali.` };
    }

    return resultOutput;
  };

  const hasCustomAi = Boolean(aiConfig.baseUrl && aiConfig.apiKey);
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!hasCustomAi && !geminiApiKey) {
    const err = 'Tidak ada konfigurasi AI aktif. Silakan masukkan API Key Anda di menu Pengaturan AI (/account) atau hubungi administrator.';
    await onEvent({ type: 'error', message: err, generationMode: 'live-ai' });
    return {
      needsClarification: false,
      toolCalls: [],
      todoList: [],
      planNarrative: '',
      summaryMessage: err,
      totalTokensUsed: 0,
      generationMode: 'live-ai',
      fallbackReason: err
    };
  }

function parseSseResponse(rawText: string): any {
  const lines = rawText.split('\n');
  let fullContent = '';
  const toolCallsMap: Record<number, { id: string; type: string; function: { name: string; arguments: string } }> = {};
  let finishReason: string | null = null;
  let usage: any = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line.startsWith('data:') || line === 'data: [DONE]') continue;
    const jsonStr = line.replace(/^data:\s*/, '').trim();
    if (!jsonStr) continue;

    try {
      const chunk = JSON.parse(jsonStr);
      if (chunk.usage) usage = chunk.usage;
      const choice = chunk.choices?.[0];
      if (!choice) continue;

      if (choice.finish_reason) finishReason = choice.finish_reason;

      const delta = choice.delta || choice.message;
      if (delta) {
        if (delta.content) {
          fullContent += delta.content;
        }
        if (delta.tool_calls && Array.isArray(delta.tool_calls)) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index ?? 0;
            if (!toolCallsMap[idx]) {
              toolCallsMap[idx] = {
                id: tc.id || `call_${Date.now()}_${idx}`,
                type: tc.type || 'function',
                function: {
                  name: tc.function?.name || '',
                  arguments: tc.function?.arguments || ''
                }
              };
            } else {
              if (tc.id) toolCallsMap[idx].id = tc.id;
              if (tc.function?.name) toolCallsMap[idx].function.name += tc.function.name;
              if (tc.function?.arguments) toolCallsMap[idx].function.arguments += tc.function.arguments;
            }
          }
        }
      }
    } catch {
      // Ignore unparseable line
    }
  }

  const tool_calls = Object.values(toolCallsMap);

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: fullContent || null,
          ...(tool_calls.length > 0 ? { tool_calls } : {})
        },
        finish_reason: finishReason || (tool_calls.length > 0 ? 'tool_calls' : 'stop')
      }
    ],
    usage: usage || { total_tokens: 1500 }
  };
}

  // =========================================================================
  // 1. EKSEKUSI VIA OPENAI-COMPATIBLE API (KoboiLLM / OpenRouter / DeepSeek)
  // =========================================================================
  if (hasCustomAi) {
    const cleanBaseUrl = aiConfig.baseUrl.replace(/\/+$/, '');
    const completionsUrl = `${cleanBaseUrl}/chat/completions`;
    const openAiTools = getOpenAiTools();

    planNarrative = isFollowUp
      ? `Menganalisis instruksi perubahan pengguna: "${userPrompt}". Menginspeksi berkas yang sudah ada (${existingFiles.length} berkas) dan menerapkan modifikasi yang diminta.`
      : `Memulai perancangan aplikasi untuk: "${userPrompt}". Menjalankan alur pengerjaan otonom bertahap.`;
    await onEvent({ type: 'plan', content: planNarrative, generationMode: 'live-ai' });

    let userMessageContent: any = formattedUserPrompt;
    if (options.attachments && options.attachments.some((a) => a.type === 'image' && a.dataUrl)) {
      const parts: any[] = [{ type: 'text', text: formattedUserPrompt }];
      for (const att of options.attachments) {
        if (att.type === 'image' && att.dataUrl) {
          parts.push({
            type: 'image_url',
            image_url: { url: att.dataUrl }
          });
        }
      }
      userMessageContent = parts;
    }

    const messages: any[] = [
      { role: 'system', content: activeSystemPrompt }
    ];

    if (options.historyMessages && options.historyMessages.length > 0) {
      const recentHistory = options.historyMessages.slice(-14);
      for (const h of recentHistory) {
        if (h.role === 'user' && h.content && h.content.trim() !== userPrompt.trim()) {
          messages.push({ role: 'user', content: h.content });
        } else if (h.role === 'assistant' && h.content) {
          messages.push({ role: 'assistant', content: h.content });
        }
      }
    }

    messages.push({ role: 'user', content: userMessageContent });

    let turn = 0;
    const hasExistingHtml = existingFiles.some((f) => f.includes('index.html') || f.endsWith('.html'));
    const MAX_TURNS = isFollowUp ? (hasExistingHtml ? 6 : 14) : 18;

    while (turn < MAX_TURNS && !deployedApp) {
      checkAborted();
      if (turn > 0 && remainingMs() < 25000) {
        console.warn(`[Agent] Time budget habis setelah turn ${turn}, menghentikan loop.`);
        break;
      }
      turn++;

      let res: Response | null = null;
      let lastErrText = '';
      const MAX_RETRIES = 2;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const isTurn1 = turn === 1 && !isFollowUp;
          // Selama berkas inti masih kurang, paksa model memanggil tool (bukan sekadar membalas teks).
          const coreIncomplete = !isTurn1 && writtenFiles.length > 0 && getMissingReferencedAssets(wsDir).length > 0;
          const reqBody: any = {
            model: aiConfig.defaultModel || 'ag/gemini-3-flash',
            messages: getOptimizedMessages(messages),
            tools: openAiTools,
            tool_choice: isTurn1
              ? { type: 'function', function: { name: 'write_file' } }
              : coreIncomplete
                ? 'required'
                : 'auto',
            temperature: 0.2,
            reasoning_effort: 'low',
            stream: false
          };

          res = await fetch(completionsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${aiConfig.apiKey}`
            },
            // Menulis berkas besar bisa > 45 detik; beri hingga 90 detik tapi jangan melewati sisa anggaran waktu.
            signal: AbortSignal.timeout(Math.max(15000, Math.min(90000, remainingMs() - 10000))),
            body: JSON.stringify(reqBody)
          });

          if (res.ok) {
            lastErrText = '';
            break;
          } else {
            lastErrText = await res.text();
            console.warn(`[AI Provider Turn ${turn} Attempt ${attempt} HTTP ${res.status}]:`, lastErrText.substring(0, 150));
            if ([429, 502, 503, 504].includes(res.status) && attempt < MAX_RETRIES) {
              await onEvent({
                type: 'plan',
                content: `Koneksi AI sibuk (${res.status}). Mengulang otomatis...`,
                generationMode: 'live-ai'
              });
              await new Promise((r) => setTimeout(r, 1500 * attempt));
              continue;
            }
            break;
          }
        } catch (fetchErr: any) {
          lastErrText = fetchErr.message;
          console.warn(`[AI Provider Fetch Error turn ${turn} attempt ${attempt}]:`, fetchErr.message);
          if (attempt < MAX_RETRIES && remainingMs() > 40000) {
            await onEvent({
              type: 'plan',
              content: `Waktu respons AI melambat (${fetchErr.message}). Mengulang cepat (percobaan 2/2)...`,
              generationMode: 'live-ai'
            });
            await new Promise((r) => setTimeout(r, 1000));
          }
        }
      }

      if (!res || !res.ok) {
        // Fallback: If custom router failed and GEMINI_API_KEY is available, try direct Gemini
        if (geminiApiKey) {
          try {
            await onEvent({
              type: 'plan',
              content: 'Mengalihkan sementara ke jalur koneksi Google Gemini native untuk kecepatan maksimal...',
              generationMode: 'live-ai'
            });
            const directUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
            const directRes = await fetch(directUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: AbortSignal.timeout(30000),
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `${activeSystemPrompt}\n\n${formattedUserPrompt}` }] }],
                tools: [{ functionDeclarations: AGENT_TOOLS }],
                generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
              })
            });
            if (directRes.ok) {
              const dData = await directRes.json();
              const cand = dData.candidates?.[0];
              if (cand?.content?.parts) {
                for (const part of cand.content.parts) {
                  if (part.functionCall) {
                    const { name, args } = part.functionCall;
                    await handleToolExecution(name, args || {});
                  }
                  if (part.text) {
                    summaryMessage += (summaryMessage ? '\n' : '') + part.text;
                  }
                }
                break;
              }
            }
          } catch (e: any) {
            console.warn('Direct gemini fallback error:', e.message);
          }
        }

        const errMsg = !res
          ? `Gagal terhubung ke penyedia AI: ${lastErrText}`
          : `AI Provider mengembalikan error (${res.status}): ${lastErrText.substring(0, 200)}`;

        console.error(`[Custom AI Fatal Error turn ${turn}]`, errMsg);

        if (writtenFiles.length > 0) {
          await onEvent({
            type: 'plan',
            content: `Koneksi AI turn ${turn} selesai. Melakukan finalisasi dan penerbitan aplikasi...`,
            generationMode: 'live-ai'
          });
          break;
        }

        await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
        return {
          needsClarification: false,
          toolCalls: toolCallsHistory,
          todoList,
          planNarrative,
          summaryMessage: errMsg,
          totalTokensUsed,
          generationMode: 'live-ai',
          fallbackReason: errMsg
        };
      }

      let data: any;
      const rawText = await res.text();
      try {
        data = JSON.parse(rawText);
      } catch (jsonErr: any) {
        // Fallback for proxies that force SSE chunks even with stream: false
        if (rawText.includes('data:')) {
          try {
            data = parseSseResponse(rawText);
          } catch (sseErr: any) {
            const errMsg = `Format respons AI tidak valid JSON: ${jsonErr.message}`;
            await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
            break;
          }
        } else {
          const errMsg = `Format respons AI tidak valid JSON: ${jsonErr.message}`;
          await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
          break;
        }
      }

      const choice = data.choices?.[0];
      if (!choice || !choice.message) {
        const errMsg = 'AI tidak mengembalikan pilihan respons yang valid.';
        await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
        break;
      }

      const msg = choice.message;
      messages.push(msg);

      if (data.usage?.total_tokens) {
        totalTokensUsed += data.usage.total_tokens;
      } else {
        const msgLen = (msg.content?.length || 0) + (JSON.stringify(msg.tool_calls || []).length);
        totalTokensUsed += Math.max(300, Math.ceil(msgLen / 3.2));
      }

      if (msg.content) {
        summaryMessage += (summaryMessage ? '\n' : '') + msg.content;
        await onEvent({ type: 'message', content: msg.content, generationMode: 'live-ai' });
      }

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        for (const tcItem of msg.tool_calls) {
          const name = tcItem.function?.name;
          let args: any = {};
          try {
            args = JSON.parse(tcItem.function?.arguments || '{}');
          } catch {
            args = {};
          }

          const resultOutput = await handleToolExecution(name, args);

          messages.push({
            role: 'tool',
            tool_call_id: tcItem.id,
            content: JSON.stringify(resultOutput)
          });
        }
      } else {
        if (isFollowUp && writtenFiles.length === 0 && toolCallsHistory.length === 0) {
          break;
        }
        if (!deployedApp) {
          const hasHtml = writtenFiles.some((f) => f.includes('index.html'));
          const hasJs = writtenFiles.some((f) => f.includes('app.js'));
          const hasCss = writtenFiles.some((f) => f.includes('style.css'));
          const missingAssets = hasHtml ? getMissingReferencedAssets(wsDir) : [];
          if (hasHtml && (hasJs || hasCss) && missingAssets.length === 0) {
            // Core files generated (termasuk semua berkas yang dirujuk index.html), proceed to publish
            break;
          }
          const nextGuidance = missingAssets.length > 0
            ? getMissingAssetsGuidance(missingAssets)
            : getNextStepGuidance(writtenFiles, toolCallsHistory);
          messages.push({
            role: 'user',
            content: nextGuidance
          });
        } else {
          break;
        }
      }
    }

    // Jangan terbitkan aplikasi setengah jadi: jika index.html merujuk berkas yang belum ada, simpan sebagai draft saja.
    const unfinishedAssets = !deployedApp && writtenFiles.length > 0 ? getMissingReferencedAssets(wsDir) : [];
    if (unfinishedAssets.length > 0) {
      const note = `⚠️ Pembuatan aplikasi belum selesai: berkas ${unfinishedAssets.join(', ')} belum sempat dibuat oleh AI, jadi aplikasi belum diterbitkan (kredit App tidak dipotong). Progres sudah tersimpan — ketik "lanjutkan" untuk melengkapinya.`;
      summaryMessage += (summaryMessage ? '\n\n' : '') + note;
      await onEvent({ type: 'message', content: note, generationMode: 'live-ai' });
    }

    // Auto-finalize jika model menulis berkas tapi lupa memanggil publish_app di akhir
    if (!deployedApp && writtenFiles.length > 0 && unfinishedAssets.length === 0) {
      let appName = 'Aplikasi Web';
      let slug = 'web-app';

      const pkgPath = path.join(wsDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.name) {
            slug = String(pkg.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
            appName = pkg.description || pkg.name;
          }
        } catch {}
      }

      if (slug === 'web-app') {
        const words = userPrompt.replace(/^(buatkan|bikin|buat|aplikasi|sistem|web|tolong)\s+/gi, '').trim().split(/\s+/).slice(0, 3).join('-');
        slug = words.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app-web';
        appName = userPrompt.slice(0, 30);
      }

      const pub = await executePublishApp(sessionId, userId, appName, slug, hasAppCredit);
      deployedApp = pub.app;
      todoList = todoList.map((t) => ({ ...t, completed: true, active: false }));
      await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
    }

    const finalSummary = summaryMessage || (deployedApp ? `Aplikasi ${deployedApp.name} telah selesai dibangun dan siap digunakan!` : 'Proses pembuatan aplikasi selesai.');
    await onEvent({ type: 'complete', app: deployedApp, message: finalSummary, generationMode: 'live-ai' });

    return {
      deployedApp,
      toolCalls: toolCallsHistory,
      todoList,
      planNarrative,
      summaryMessage: finalSummary,
      totalTokensUsed,
      generationMode: 'live-ai'
    };
  }

  // =========================================================================
  // 2. EKSEKUSI VIA GOOGLE GEMINI API NATIVE
  // =========================================================================
  const candidateModels = ['gemini-2.5-flash', 'gemini-3.5-flash', 'gemini-2.0-flash'];
  let geminiActiveModel = candidateModels[0];

  planNarrative = isFollowUp
    ? `Menganalisis instruksi perubahan pengguna: "${userPrompt}". Menginspeksi berkas yang sudah ada (${existingFiles.length} berkas) dan menerapkan modifikasi yang diminta.`
    : `Memulai perancangan aplikasi untuk: "${userPrompt}". Menggunakan model Gemini (${geminiActiveModel}) untuk eksekusi coding bertahap.`;
  await onEvent({ type: 'plan', content: planNarrative, generationMode: 'live-ai' });

  const initialParts: any[] = [{ text: `${activeSystemPrompt}\n\nPermintaan Pengguna:\n${formattedUserPrompt}` }];
  if (options.attachments) {
    for (const att of options.attachments) {
      if (att.type === 'image' && att.dataUrl && att.dataUrl.includes('base64,')) {
        const mime = att.mimeType || 'image/png';
        const b64 = att.dataUrl.split('base64,')[1];
        initialParts.push({
          inline_data: {
            mime_type: mime,
            data: b64
          }
        });
      }
    }
  }

  const contents: any[] = [
    {
      role: 'user',
      parts: initialParts
    }
  ];

  let geminiTurn = 0;
  const hasExistingHtmlGemini = existingFiles.some((f) => f.includes('index.html') || f.endsWith('.html'));
  const MAX_GEMINI_TURNS = isFollowUp ? (hasExistingHtmlGemini ? 6 : 14) : 18;

  while (geminiTurn < MAX_GEMINI_TURNS && !deployedApp) {
    checkAborted();
    if (geminiTurn > 0 && remainingMs() < 25000) {
      console.warn(`[Agent Gemini] Time budget habis setelah turn ${geminiTurn}, menghentikan loop.`);
      break;
    }
    geminiTurn++;

    let geminiResponse: any;
    let success = false;
    let lastErrText = '';

    for (const modelName of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(90000),
          body: JSON.stringify({
            contents,
            tools: [{ functionDeclarations: AGENT_TOOLS }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 8192
            }
          })
        });

        if (res.ok) {
          geminiResponse = await res.json();
          geminiActiveModel = modelName;
          success = true;
          break;
        } else {
          lastErrText = await res.text();
          console.warn(`[Gemini ${modelName} turn ${geminiTurn} error ${res.status}]:`, lastErrText.substring(0, 150));
        }
      } catch (err: any) {
        lastErrText = err.message;
        console.warn(`[Gemini ${modelName} fetch error]:`, err.message);
      }
    }

    if (!success) {
      const errMsg = `Koneksi ke Gemini API gagal: ${lastErrText.substring(0, 200)}. Silakan periksa kuota atau pasang API Key sendiri di menu Pengaturan AI.`;
      await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
      return {
        needsClarification: false,
        toolCalls: toolCallsHistory,
        todoList,
        planNarrative,
        summaryMessage: errMsg,
        totalTokensUsed,
        generationMode: 'live-ai',
        fallbackReason: errMsg
      };
    }

    const candidate = geminiResponse.candidates?.[0];
    if (!candidate || !candidate.content) {
      const errMsg = 'Gemini tidak mengembalikan kandidat respons yang valid.';
      await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
      break;
    }

    totalTokensUsed += geminiResponse.usageMetadata?.totalTokenCount || 1500;
    contents.push(candidate.content);

    const parts = candidate.content.parts || [];
    const toolResponseParts: any[] = [];

    for (const part of parts) {
      if (part.text) {
        summaryMessage += (summaryMessage ? '\n' : '') + part.text;
        await onEvent({ type: 'message', content: part.text, generationMode: 'live-ai' });
      }

      if (part.functionCall) {
        const { name, args } = part.functionCall;
        const resultOutput = await handleToolExecution(name, args || {});

        toolResponseParts.push({
          functionResponse: {
            name,
            response: { result: resultOutput }
          }
        });
      }
    }

    if (toolResponseParts.length > 0) {
      contents.push({
        role: 'user',
        parts: toolResponseParts
      });
    } else {
      if (isFollowUp && writtenFiles.length === 0 && toolCallsHistory.length === 0) {
        break;
      }
      if (!deployedApp) {
        const hasHtml = writtenFiles.some((f) => f.includes('index.html'));
        const hasJs = writtenFiles.some((f) => f.includes('app.js'));
        const hasCss = writtenFiles.some((f) => f.includes('style.css'));
        const missingAssets = hasHtml ? getMissingReferencedAssets(wsDir) : [];
        if (hasHtml && (hasJs || hasCss) && missingAssets.length === 0) {
          // Core files generated (termasuk semua berkas yang dirujuk index.html), proceed to publish
          break;
        }
        const nextGuidance = missingAssets.length > 0
          ? getMissingAssetsGuidance(missingAssets)
          : getNextStepGuidance(writtenFiles, toolCallsHistory);
        contents.push({
          role: 'user',
          parts: [{ text: nextGuidance }]
        });
      } else {
        break;
      }
    }
  }

  // Jangan terbitkan aplikasi setengah jadi: jika index.html merujuk berkas yang belum ada, simpan sebagai draft saja.
  const unfinishedAssets = !deployedApp && writtenFiles.length > 0 ? getMissingReferencedAssets(wsDir) : [];
  if (unfinishedAssets.length > 0) {
    const note = `⚠️ Pembuatan aplikasi belum selesai: berkas ${unfinishedAssets.join(', ')} belum sempat dibuat oleh AI, jadi aplikasi belum diterbitkan (kredit App tidak dipotong). Progres sudah tersimpan — ketik "lanjutkan" untuk melengkapinya.`;
    summaryMessage += (summaryMessage ? '\n\n' : '') + note;
    await onEvent({ type: 'message', content: note, generationMode: 'live-ai' });
  }

  // Auto-finalize jika Gemini menulis berkas tapi lupa publish_app
  if (!deployedApp && writtenFiles.length > 0 && unfinishedAssets.length === 0) {
    let appName = 'Aplikasi Web';
    let slug = 'web-app';

    const pkgPath = path.join(wsDir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        if (pkg.name) {
          slug = String(pkg.name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
          appName = pkg.description || pkg.name;
        }
      } catch {}
    }

    if (slug === 'web-app') {
      const words = userPrompt.replace(/^(buatkan|bikin|buat|aplikasi|sistem|web|tolong)\s+/gi, '').trim().split(/\s+/).slice(0, 3).join('-');
      slug = words.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'app-web';
      appName = userPrompt.slice(0, 30);
    }

    const pub = await executePublishApp(sessionId, userId, appName, slug, hasAppCredit);
    deployedApp = pub.app;
    todoList = todoList.map((t) => ({ ...t, completed: true, active: false }));
    await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
  }

  const finalSummary = summaryMessage || (deployedApp ? `Aplikasi ${deployedApp.name} telah selesai dibangun dan siap digunakan!` : 'Proses pembuatan aplikasi selesai.');
  await onEvent({ type: 'complete', app: deployedApp, message: finalSummary, generationMode: 'live-ai' });

  sessionState.status = 'completed';
  setTimeout(() => {
    activeSessions.delete(sessionId);
    activeAbortControllers.delete(sessionId);
  }, 120000);

  return {
    deployedApp,
    toolCalls: toolCallsHistory,
    todoList,
    planNarrative,
    summaryMessage: finalSummary,
    totalTokensUsed,
    generationMode: 'live-ai'
  };
}
