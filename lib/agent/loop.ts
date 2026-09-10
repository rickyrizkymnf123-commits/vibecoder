import dns from 'node:dns';
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

import fs from 'node:fs';
import path from 'node:path';
import { AGENT_TOOLS, getOpenAiTools } from './tools';
import { getAiConfig } from '../ai/config';
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
  onEvent: (event: AgentStepEvent) => Promise<void> | void;
}

export interface AgentRunResult {
  needsClarification?: boolean;
  clarificationMessage?: string;
  deployedApp?: GeneratedApp;
  toolCalls: ToolCallItem[];
  todoList: TodoItem[];
  planNarrative: string;
  summaryMessage: string;
  totalTokensUsed: number;
  generationMode: 'live-ai' | 'fallback-template';
  fallbackReason?: string;
}

const SYSTEM_PROMPT = `Anda adalah VibeCoder Autonomous Software Engineer — agen pengembang web full-stack otonom tingkat tinggi (standar Lovable / Emergent / Antigravity).
Tugas Anda adalah merancang, membangun, menguji, dan menerbitkan aplikasi web kelas enterprise yang BERKUALITAS TINGGI, LENGKAP, dan BERFUNGSI NYATA sesuai instruksi pengguna.

WAJIB MEMATUHI 5 PILAR ARSITEKTUR APLIKASI (LOVABLE / EMERGENT STANDARD):
Setiap aplikasi yang Anda bangun BUKAN sekadar halaman satu tampilan sederhana, melainkan aplikasi SaaS fungsional utuh dengan arsitektur:

1. **LANDING PAGE KOMERSIAL MODERN (Tampilan Publik/Tamu)**:
   - Hero Section: Headline tajam, deskripsi nilai jual (value proposition), badge status, dan tombol CTA ("Coba Aplikasi Sekarang", "Masuk Demo").
   - Showcase Fitur: Grid kartu interaktif dengan ikon Lucide untuk fitur-fitur unggulan.
   - Metrik & Social Proof: Ringkasan statistik pengguna, efisiensi waktu, atau perbandingan paket/manfaat.
   - Footer: Identitas aplikasi, navigasi cepat, hak cipta.

2. **SISTEM AUTENTIKASI & MULTI-ROLE (USER vs ADMIN)**:
   - Form/Modal Masuk (Login) dan Daftar (Register) yang berfungsi dengan validasi email dan kata sandi.
   - Tombol Cepat Quick-Login Demo: 1-klik untuk masuk sebagai "Administrator" atau "Pengguna Biasa (User)".
   - State sesi persisten (disimpan di localStorage/session) dengan informasi profil aktif di navbar dan tombol Keluar (Logout).
   - ATURAN ISOLASI NAVBAR HEADER MUTLAK: Menu tautan navigasi Landing Page publik (seperti "Solusi Bisnis", "Fitur", "Cara Kerja", "Harga", "FAQ") HANYA boleh tampil untuk Tamu/Guest di halaman Landing. Ketika pengguna telah LOGIN (baik sebagai Admin maupun User/Staf), tautan navigasi Landing Page publik WAJIB DISEMBUNYIKAN SECARA TOTAL ('display: none') agar tidak bercampur dengan header dashboard. Header aplikasi internal hanya boleh menampilkan logo brand, tab/menu dashboard yang relevan dengan peran aktif, indikator profil nama + badge peran pengguna, dan tombol Logout.

3. **PORTAL PENGGUNA (USER DASHBOARD)**:
   - Halaman khusus pengguna umum untuk melakukan transaksi/pengajuan/pencatatan mandiri.
   - Form penginputan data dengan validasi, riwayat aktivitas pribadi, dan kartu ringkasan status.

4. **PUSAT KONTROL ADMINISTRATOR (ADMIN DASHBOARD)**:
   - KPI Metrics Cards: Total data, nilai transaksi/aset (format Rupiah 'Rp'), peringatan batas kritis.
   - Visualisasi Grafik Statistik: Menggunakan Chart.js via CDN (https://cdn.jsdelivr.net/npm/chart.js) atau visual SVG interaktif yang dinamis.
   - Manajemen Master Data (CRUD Lengkap): Tabel interaktif dengan fitur Tambah Data Baru (modal form), Edit, Hapus data, Pencarian instan (search bar), dan Filter kategori.
   - Tombol Ekspor Simulasi (Download JSON / CSV).
   - Log Audit / Riwayat Aktivitas sistem.

5. **RELATIONAL DATA & PERSISTENSI NYATA**:
   - Struktur database yang dipikirkan matang di 'lib/db.js' atau 'lib/storage.js' atau 'data/*.json' dengan relasi antar tabel (Tabel Users/Pengguna, Tabel Master Entitas, Tabel Riwayat Transaksi, Tabel Audit Logs).
   - Sediakan Dataset Awal (Seed Data) yang realistis, bervariasi, berbahasa Indonesia, dan menggunakan mata uang Rupiah.

PROTOKOL EKSEKUSI OTONOM VIBECODER 5-FASE (STANDAR 50+ TOOL CALLS):
Anda WAJIB mengeksekusi pembuatan aplikasi secara berurutan melewati 5 FASE OTONOM. JANGAN PERNAH melompat langsung ke 'publish_app' sebelum menyelesaikan dan memvalidasi setiap fase!

FASE 1: DISCOVERY & INSPEKSI LINGKUNGAN AWAL (BASH & TODO_WRITE)
- Jalankan 'bash' untuk memeriksa direktori kerja dan lingkungan runtime: 'pwd && ls -la', 'node -v', 'npm -v'.
- Panggil 'todo_write' untuk menetapkan 7-9 item tugas pengerjaan terstruktur (Desain arsitektur & schema, Helper utils, REST backend API, CSS styling SaaS, JS client store & charts, HTML view switcher & forms, E2E tests, Headless browser visual verification, Deployment).

FASE 2: MODULAR GRANULAR SCAFFOLDING (WRITE_FILE BERKAS DEMI BERKAS)
- Bangun aplikasi secara modular, berkas demi berkas. JANGAN pernah menggabungkan seluruh kode menjadi satu file monolith raksasa!
- Tulis berkas-berkas berikut secara bertahap menggunakan 'write_file':
  1. 'package.json': Definisi metadata proyek dan start script.
  2. 'lib/util.js': Helper fungsi (format Rupiah 'Rp', sanitasi input, generator ID unik, filter tanggal).
  3. 'lib/db.js' atau 'lib/storage.js': Relational in-memory/JSON store dengan relasi tabel dan dataset awal Indonesia.
  4. 'server.js': REST API Express lengkap (endpoints auth, CRUD master data, statistik ringkasan, static file serving).
  5. 'public/css/style.css': Desain CSS modern berkelas SaaS (dark/light mode accents, glassmorphism, responsive layout).
  6. 'public/js/app.js': Logika aplikasi modular sisi klien (state store, auth session, view switcher, API caller, modal dialog handler, render tabel CRUD, render Chart.js).
  7. 'public/index.html': Antarmuka HTML modern lengkap dengan isolasi header mutlak (Landing Page publik untuk Tamu, Form/Modal Auth, User Dashboard, Admin Dashboard dengan KPI cards & Chart.js, form modal Tambah/Edit).
  8. 'test/e2e.js': Skrip uji fungsional otomatis untuk memeriksa integritas data dan endpoint backend.

FASE 3: TDD, SINTAKS & AUTO-REPAIR (BASH & EDIT_FILE)
- Jalankan 'bash': 'node --check server.js' untuk memastikan tidak ada kesalahan sintaks backend.
- Jalankan 'bash': 'node test/e2e.js' atau panggil tool 'run_tests' untuk memverifikasi logika bisnis dan API.
- MEKANISME AUTO-REPAIR: Jika ada test yang gagal atau ada error sintaks, baca pesan error, analisis akar masalahnya, gunakan 'edit_file' atau 'write_file' untuk memperbaikinya, dan jalankan ulang pengujian hingga SEMUA tes lolos (0 failed).

FASE 4: VERIFIKASI VISUAL HEADLESS BROWSER (BROWSER_TEST)
- Panggil tool 'browser_test' untuk membuka aplikasi web di browser fisik (Google Chrome).
- Lakukan interaksi klik tombol, verifikasi konsol JavaScript bersih (0 console error), dan pastikan navigasi Landing Page vs Dashboard terisolasi dengan rapi.

FASE 5: FINALISASI & PENERBITAN (PUBLISH_APP)
- Hanya setelah Fase 1 s/d 4 selesai dan terverifikasi sempurna, panggil tool 'publish_app' dengan 'appName' dan 'slug'.
- Berikan pesan ringkasan akhir yang ramah, profesional, dan bersih tanpa simbol markdown mentah yang berantakan.`;

function getNextStepGuidance(writtenFiles: string[], toolCallsHistory: ToolCallItem[]): string {
  const getCommand = (tc: ToolCallItem): string => {
    if (!tc.input) return '';
    if (typeof tc.input === 'string') return tc.input;
    if (typeof tc.input === 'object' && 'command' in tc.input) return String(tc.input.command || '');
    return '';
  };

  const hasTodo = toolCallsHistory.some((tc) => tc.tool === 'todo_write');
  const hasBashDiscovery = toolCallsHistory.some(
    (tc) =>
      tc.tool === 'bash' &&
      (getCommand(tc).includes('pwd') ||
        getCommand(tc).includes('node -v') ||
        getCommand(tc).includes('ls'))
  );
  const hasServer = writtenFiles.some((f) => f.includes('server.js'));
  const hasHtml = writtenFiles.some((f) => f.includes('index.html'));
  const hasJs = writtenFiles.some((f) => f.includes('app.js'));
  const hasCss = writtenFiles.some((f) => f.includes('style.css'));
  const hasDb = writtenFiles.some((f) => f.includes('db.js') || f.includes('storage.js') || f.includes('util.js'));
  const hasTestScript = writtenFiles.some((f) => f.includes('test'));
  const hasRunBashTest = toolCallsHistory.some(
    (tc) =>
      tc.tool === 'bash' &&
      (getCommand(tc).includes('node test') || getCommand(tc).includes('node --check'))
  );
  const hasBrowserTest = toolCallsHistory.some((tc) => tc.tool === 'browser_test');

  if (!hasBashDiscovery || !hasTodo) {
    return 'Lanjutkan ke Fase 1: Periksa lingkungan kerja dengan tool bash ("pwd && ls -la", "node -v") dan susun rencana tugas terstruktur menggunakan tool todo_write.';
  }

  if (!hasDb || !hasServer || !hasHtml || !hasJs || !hasCss) {
    const missing: string[] = [];
    if (!hasDb) missing.push('lib/util.js & lib/db.js');
    if (!hasServer) missing.push('server.js');
    if (!hasCss) missing.push('public/css/style.css');
    if (!hasJs) missing.push('public/js/app.js');
    if (!hasHtml) missing.push('public/index.html');
    return `Lanjutkan ke Fase 2: Tulis berkas modular berikutnya menggunakan write_file (${missing.join(', ')}). Pastikan setiap berkas berisi kode nyata yang lengkap dan fungsional.`;
  }

  if (!hasTestScript || !hasRunBashTest) {
    return 'Lanjutkan ke Fase 3: Buat berkas skrip pengujian "test/e2e.js" (jika belum ada), lalu jalankan "node --check server.js" dan "node test/e2e.js" via tool bash. Jika ada kesalahan, perbaiki kode dengan edit_file hingga lolos.';
  }

  if (!hasBrowserTest) {
    return 'Lanjutkan ke Fase 4: Jalankan verifikasi visual antarmuka web di Google Chrome menggunakan tool browser_test untuk memastikan tampilan responsif dan tidak ada error console JavaScript.';
  }

  return 'Semua fase pengembangan, pengujian, dan verifikasi visual telah selesai dengan sukses! Sekarang lanjutkan ke Fase 5: Terbitkan aplikasi menggunakan tool publish_app dan berikan ringkasan akhir yang bersih serta profesional.';
}

function getOptimizedMessages(rawMessages: any[]): any[] {
  return rawMessages.map((m, idx) => {
    // If it's an assistant message with tool calls older than the last 2 items
    if (m.role === 'assistant' && Array.isArray(m.tool_calls) && idx < rawMessages.length - 2) {
      const optimizedToolCalls = m.tool_calls.map((tc: any) => {
        if (tc.function?.name === 'write_file') {
          try {
            const parsed = JSON.parse(tc.function.arguments || '{}');
            if (parsed.content && parsed.content.length > 300) {
              return {
                ...tc,
                function: {
                  ...tc.function,
                  arguments: JSON.stringify({
                    path: parsed.path,
                    content: `[Berkas tersimpan di disk (${parsed.content.length} karakter). Gunakan read_file jika perlu menginspeksi isi]`
                  })
                }
              };
            }
          } catch {}
        }
        return tc;
      });
      return { ...m, tool_calls: optimizedToolCalls };
    }
    return m;
  });
}

export async function runAgenticLoop(options: RunAgentOptions): Promise<AgentRunResult> {
  const { userPrompt, userId, sessionId, hasAppCredit, onEvent } = options;

  // Inisialisasi workspace fisik di disk
  const wsDir = getWorkspaceDir(sessionId);

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

  const isFollowUp = existingFiles.length > 0;
  let formattedUserPrompt = userPrompt;

  if (isFollowUp) {
    formattedUserPrompt = `[MODE PEMBARUAN / ITERASI APLIKASI YANG SUDAH ADA]
Pengguna sedang menginspeksi aplikasi yang sebelumnya telah dibuat di sesi ini dan sekarang meminta perubahan / penambahan:
"${userPrompt}"

Berkas-berkas yang saat ini sudah ada di workspace:
${existingFiles.map((f) => `- ${f}`).join('\n')}

ATURAN WAJIB UNTUK PERUBAHAN / ITERASI:
1. Pahami bagian mana yang diminta oleh pengguna untuk diubah (misalnya mengganti palet warna di 'public/css/style.css' atau kelas Tailwind di 'public/index.html', menambahkan tombol/fitur baru, menambah kolom tabel, atau memperbaiki tata letak).
2. Gunakan tool 'read_file' untuk membaca berkas yang relevan sebelum mengubahnya.
3. Gunakan tool 'edit_file' (untuk mengubah baris/blok teks tertentu) atau 'write_file' untuk memperbarui berkas tersebut. JANGAN menghapus fitur-fitur yang sudah bekerja dengan baik, melainkan modifikasi atau tambahkan sesuai instruksi pengguna.
4. Lakukan verifikasi via 'browser_test' untuk memastikan perubahan tampil rapi dan tidak menimbulkan error console.
5. Panggil tool 'publish_app' untuk memperbarui status aplikasi di live preview agar pengguna dapat langsung melihat perubahannya.`;
  }

  // Klarifikasi jika prompt terlalu singkat atau kosong
  if (userPrompt.trim().length < 10) {
    const clarificationMessage = 'Halo! Permintaan Anda tampak sangat singkat. Mohon jelaskan lebih detail aplikasi apa yang ingin Anda bangun (misalnya: nama aplikasi, fitur utama, peran pengguna/admin, dan laporan atau data yang ingin dikelola).';
    await onEvent({ type: 'clarification', content: clarificationMessage, generationMode: 'live-ai' });
    return {
      needsClarification: true,
      clarificationMessage,
      toolCalls: [],
      todoList: [],
      planNarrative: '',
      summaryMessage: clarificationMessage,
      totalTokensUsed: 50,
      generationMode: 'live-ai'
    };
  }

  const toolCallsHistory: ToolCallItem[] = [];
  let todoList: TodoItem[] = [];
  let deployedApp: GeneratedApp | undefined;
  let planNarrative = '';
  let summaryMessage = '';
  let totalTokensUsed = 0;
  const writtenFiles: string[] = [];

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
      todoList = (args.todos || []).map((t: any, idx: number) => ({
        id: t.id || `todo-${idx + 1}`,
        title: t.title,
        completed: t.status === 'completed',
        active: t.status === 'in_progress' || (idx === 0 && t.status !== 'completed')
      }));
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

      const activeIdx = todoList.findIndex((t) => t.active);
      if (activeIdx !== -1) {
        todoList[activeIdx].completed = true;
        todoList[activeIdx].active = false;
        if (activeIdx + 1 < todoList.length) {
          todoList[activeIdx + 1].active = true;
        }
        await onEvent({ type: 'todo', todoList, generationMode: 'live-ai' });
      }
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
      await recordToolFinish(tc, resultOutput);
    } else if (name === 'bash') {
      const tc = await recordToolStart('bash', `Terminal Shell: ${args.command}`, args);
      resultOutput = await executeBash(sessionId, args.command);
      await recordToolFinish(tc, resultOutput, resultOutput.success ? 'completed' : 'failed');
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
        resultOutput = { success: false, error: e.message };
        await recordToolFinish(tc, resultOutput, 'failed');
      }
    } else if (name === 'run_tests') {
      const tc = await recordToolStart('run_tests', 'Menjalankan pengujian sintaks & skrip nyata di workspace', args);
      resultOutput = await executeRunTests(sessionId, args.test_type);
      await recordToolFinish(tc, resultOutput, resultOutput.status === 'passed' ? 'completed' : 'failed');
    } else if (name === 'publish_app') {
      if (writtenFiles.length < 3) {
        resultOutput = {
          success: false,
          error: `Aplikasi belum lengkap (baru ${writtenFiles.length} berkas dibuat). Harap selesaikan seluruh berkas modular di Fase 2, jalankan pengujian di Fase 3, dan verifikasi visual di Fase 4 sebelum memanggil publish_app.`
        };
        const tc = await recordToolStart('publish_app', `Validasi kelengkapan sebelum menerbitkan "${args.appName}"`, args);
        await recordToolFinish(tc, resultOutput, 'failed');
        return resultOutput;
      }
      const tc = await recordToolStart('publish_app', `Menerbitkan aplikasi "${args.appName}"`, args);
      const pub = await executePublishApp(sessionId, userId, args.appName, args.slug, hasAppCredit);
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

  const aiConfig = getAiConfig();
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

  // =========================================================================
  // 1. EKSEKUSI VIA OPENAI-COMPATIBLE API (KoboiLLM / OpenRouter / DeepSeek)
  // =========================================================================
  if (hasCustomAi) {
    const cleanBaseUrl = aiConfig.baseUrl.replace(/\/+$/, '');
    const completionsUrl = `${cleanBaseUrl}/chat/completions`;
    const openAiTools = getOpenAiTools();

    planNarrative = isFollowUp
      ? `Menganalisis instruksi perubahan pengguna: "${userPrompt}". Menginspeksi berkas yang sudah ada (${existingFiles.length} berkas) dan menerapkan modifikasi yang diminta.`
      : `Memulai perancangan aplikasi untuk: "${userPrompt}". Terhubung langsung ke AI (${aiConfig.defaultModel} di ${cleanBaseUrl}). Menjalankan alur otonom bertahap.`;
    await onEvent({ type: 'plan', content: planNarrative, generationMode: 'live-ai' });

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: formattedUserPrompt }
    ];

    let turn = 0;
    const MAX_TURNS = 60;

    while (turn < MAX_TURNS && !deployedApp) {
      turn++;

      let res: Response | null = null;
      let lastErrText = '';
      const MAX_RETRIES = 3;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const reqBody = {
            model: aiConfig.defaultModel || 'gemini-2.5-flash',
            messages: getOptimizedMessages(messages),
            tools: openAiTools,
            tool_choice: 'auto',
            temperature: 0.2
          };

          res = await fetch(completionsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${aiConfig.apiKey}`
            },
            signal: AbortSignal.timeout(120000),
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
                content: `Koneksi AI padat (${res.status}). Mengulang otomatis (percobaan ${attempt + 1}/${MAX_RETRIES})...`,
                generationMode: 'live-ai'
              });
              await new Promise((r) => setTimeout(r, 2000 * attempt));
              continue;
            }
            break;
          }
        } catch (fetchErr: any) {
          lastErrText = fetchErr.message;
          console.warn(`[AI Provider Fetch Error turn ${turn} attempt ${attempt}]:`, fetchErr.message);
          if (attempt < MAX_RETRIES) {
            await onEvent({
              type: 'plan',
              content: `Waktu respons AI melambat atau timeout (${fetchErr.message}). Mengulang otomatis (percobaan ${attempt + 1}/${MAX_RETRIES})...`,
              generationMode: 'live-ai'
            });
            await new Promise((r) => setTimeout(r, 2000 * attempt));
          }
        }
      }

      if (!res || !res.ok) {
        const errMsg = !res
          ? `Gagal terhubung ke penyedia AI (${cleanBaseUrl}): ${lastErrText}`
          : `AI Provider mengembalikan error (${res.status}): ${lastErrText.substring(0, 200)}`;

        console.error(`[Custom AI Fatal Error turn ${turn}]`, errMsg);

        if (writtenFiles.length > 0) {
          await onEvent({
            type: 'plan',
            content: `Terjadi kendala koneksi AI pada turn ${turn}, namun ${writtenFiles.length} berkas fisik telah berhasil dibuat. Melakukan finalisasi aplikasi...`,
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
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        const errMsg = `Format respons AI tidak valid JSON: ${jsonErr.message}`;
        await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
        break;
      }

      const choice = data.choices?.[0];
      if (!choice || !choice.message) {
        const errMsg = 'AI tidak mengembalikan pilihan respons yang valid.';
        await onEvent({ type: 'error', message: errMsg, generationMode: 'live-ai' });
        break;
      }

      totalTokensUsed += data.usage?.total_tokens || 1200;
      const msg = choice.message;
      messages.push(msg);

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
        if (!deployedApp) {
          const nextGuidance = getNextStepGuidance(writtenFiles, toolCallsHistory);
          messages.push({
            role: 'user',
            content: nextGuidance
          });
        } else {
          break;
        }
      }
    }

    // Auto-finalize jika model menulis berkas tapi lupa memanggil publish_app di akhir
    if (!deployedApp && writtenFiles.length > 0) {
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

  const contents: any[] = [
    {
      role: 'user',
      parts: [{ text: `${SYSTEM_PROMPT}\n\nPermintaan Pengguna:\n${formattedUserPrompt}` }]
    }
  ];

  let geminiTurn = 0;
  const MAX_GEMINI_TURNS = 60;

  while (geminiTurn < MAX_GEMINI_TURNS && !deployedApp) {
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
      if (!deployedApp) {
        const nextGuidance = getNextStepGuidance(writtenFiles, toolCallsHistory);
        contents.push({
          role: 'user',
          parts: [{ text: nextGuidance }]
        });
      } else {
        break;
      }
    }
  }

  // Auto-finalize jika Gemini menulis berkas tapi lupa publish_app
  if (!deployedApp && writtenFiles.length > 0) {
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
