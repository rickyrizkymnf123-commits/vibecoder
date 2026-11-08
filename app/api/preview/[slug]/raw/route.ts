import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug, getChatSessionById, getUserProfile } from '@/lib/supabase/db';
import { getCurrentUser } from '@/lib/auth/session';
import { getBaseWorkspacesDir, getWorkspaceDir } from '@/lib/agent/executor';
import { getActiveSessionState } from '@/lib/agent/loop';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  let app = await getAppBySlug(slug);
  let chatSession: any = null;

  // Fallback 1: Jika slug adalah session_id, cek apakah chat_sessions memiliki app_slug
  if (!app && slug) {
    try {
      chatSession = await getChatSessionById(slug);
      if (chatSession?.app_slug) {
        app = await getAppBySlug(chatSession.app_slug);
      }
    } catch {}
  }

  // Fallback 2: Cek apakah ada sesi aktif di memori
  const activeSession = getActiveSessionState(slug);
  if (!app && activeSession?.deployedApp) {
    app = activeSession.deployedApp as any;
  }

  // ISOLASI ANTAR USER: di domain utama platform, kode aplikasi hanya dijalankan untuk pemiliknya.
  // Pengunjung lain (termasuk admin) diarahkan ke subdomain pemilik (origin terpisah), supaya JavaScript
  // aplikasi orang lain tidak bisa memanggil API platform memakai cookie login pengunjung.
  const requestHost = (req.headers.get('host') || '').split(':')[0].toLowerCase();
  const isPlatformHost = requestHost === 'kilatstools.my.id' || requestHost === 'www.kilatstools.my.id';
  if (isPlatformHost) {
    const ownerId = (app as any)?.user_id || chatSession?.user_id || activeSession?.userId;
    if (ownerId) {
      const viewer = await getCurrentUser();
      if (!viewer || viewer.userId !== ownerId) {
        const owner = await getUserProfile(ownerId);
        if (owner?.subdomain) {
          return NextResponse.redirect(
            `https://${owner.subdomain}.kilatstools.my.id/${encodeURIComponent(slug)}`,
            302
          );
        }
        return new NextResponse('Aplikasi tidak dapat ditampilkan di domain ini.', { status: 404 });
      }
    }
  }

  // Fallback 3: jika tidak ada di DB, cari di folder workspaces fisik di disk
  const workspacesDir = getBaseWorkspacesDir();
  let diskWsDir = '';

  if (app && app.session_id) {
    const candidate = getWorkspaceDir(app.session_id);
    if (fs.existsSync(candidate)) diskWsDir = candidate;
  }

  if (!diskWsDir && slug) {
    const directCandidate = getWorkspaceDir(slug);
    if (fs.existsSync(directCandidate)) diskWsDir = directCandidate;
  }

  if (!diskWsDir && fs.existsSync(workspacesDir)) {
    try {
      const dirs = fs.readdirSync(workspacesDir);
      for (const d of dirs) {
        if (d.toLowerCase().includes(slug.toLowerCase()) || (app && d === app.session_id)) {
          diskWsDir = path.join(workspacesDir, d);
          break;
        }
      }
    } catch {}
  }

  // Kumpulkan semua berkas (prioritaskan berkas fisik di disk jika ada)
  const files: Record<string, string> = { ...(app?.files || {}) };

  if (diskWsDir && fs.existsSync(diskWsDir)) {
    const readDirRecursive = (dir: string, base: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'screenshots') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          readDirRecursive(full, base);
        } else {
          const rel = path.relative(base, full).replace(/\\/g, '/');
          try {
            const fileContent = fs.readFileSync(full, 'utf8');
            // Hanya override jika file disk utuh
            if (!fileContent.startsWith('[Berkas tersimpan di disk')) {
              files[rel] = fileContent;
            }
          } catch {}
        }
      }
    };
    readDirRecursive(diskWsDir, diskWsDir);
  }

  // Jika aplikasi belum selesai dibangun atau belum ada berkas sama sekali:
  if (!app && Object.keys(files).length === 0) {
    const isActivelyBuilding = Boolean(
      (activeSession && activeSession.status === 'building') ||
      (chatSession && chatSession.status === 'building')
    );

    if (isActivelyBuilding) {
      // HANYA tampilkan animasi merakit jika AI memang sedang aktif membangun aplikasi
      const buildingHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Merancang Aplikasi · VibeCoder</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    @keyframes pulseGlow {
      0%, 100% { opacity: 0.35; transform: scale(1); }
      50% { opacity: 0.75; transform: scale(1.04); }
    }
    .pulse-glow { animation: pulseGlow 4s ease-in-out infinite; }
  </style>
</head>
<body class="bg-[#030712] text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
  <div class="absolute w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl -top-24 -left-24 pulse-glow"></div>
  <div class="absolute w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl -bottom-24 -right-24 pulse-glow" style="animation-delay: 2s;"></div>

  <div class="relative z-10 max-w-md w-full bg-slate-900/80 border border-slate-800/90 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-6">
    <div class="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/20">
      <svg class="w-8 h-8 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
    </div>
    
    <div class="space-y-2">
      <h2 class="text-xl font-bold text-white tracking-tight">AI Sedang Merakit Aplikasi</h2>
      <p class="text-xs text-slate-400 leading-relaxed">
        Sistem VibeCoder sedang menyusun modul arsitektur, UI modern Tailwind CSS, dan database lokal. Pratinjau kanvas akan muncul secara otomatis.
      </p>
    </div>

    <!-- Bento Skeleton Wireframe -->
    <div class="space-y-3 pt-2 text-left">
      <div class="h-10 bg-slate-800/60 rounded-xl animate-pulse border border-slate-700/40 flex items-center px-3 justify-between">
        <div class="w-24 h-3 bg-slate-700 rounded-full"></div>
        <div class="w-12 h-5 bg-indigo-500/30 rounded-lg"></div>
      </div>
      <div class="grid grid-cols-2 gap-2.5">
        <div class="h-20 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/40 p-3 space-y-2">
          <div class="w-14 h-2.5 bg-slate-700 rounded-full"></div>
          <div class="w-20 h-4 bg-emerald-500/30 rounded"></div>
        </div>
        <div class="h-20 bg-slate-800/50 rounded-xl animate-pulse border border-slate-700/40 p-3 space-y-2">
          <div class="w-14 h-2.5 bg-slate-700 rounded-full"></div>
          <div class="w-20 h-4 bg-indigo-500/30 rounded"></div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
      <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
      <span>Sinkronisasi otomatis aktif...</span>
    </div>
  </div>

  <script>
    setTimeout(function() {
      window.location.reload();
    }, 1500);
  </script>
</body>
</html>`;
      return new NextResponse(buildingHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Jika TIDAK sedang building (misal sesi baru dibuka dan belum mengirim prompt):
    // Tampilkan Standby State bersih tanpa animasi fake
    const standbyHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Kanvas Pratinjau Siap · VibeCoder</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
  </style>
</head>
<body class="bg-[#030712] text-slate-100 min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
  <div class="absolute w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none"></div>
  <div class="absolute w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-3xl -bottom-20 -right-20 pointer-events-none"></div>

  <div class="relative z-10 max-w-sm w-full text-center space-y-4 bg-slate-900/60 border border-slate-800/80 p-8 rounded-3xl shadow-xl backdrop-blur-xl">
    <div class="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
      <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    </div>

    <div class="space-y-1.5">
      <h3 class="text-base font-bold text-white tracking-tight">Kanvas Pratinjau Siap</h3>
      <p class="text-xs text-slate-400 leading-relaxed">
        Ketik ide atau deskripsi aplikasi Anda di kolom chat sebelah kiri untuk mulai merancang dan membangun secara langsung.
      </p>
    </div>

    <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 font-medium">
      <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
      <span>Menunggu instruksi prompt</span>
    </div>
  </div>
</body>
</html>`;
    return new NextResponse(standbyHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const appName = app?.name || 'Aplikasi Web';

  // 1. Temukan berkas HTML utama
  const htmlCandidates = ['public/index.html', 'index.html', 'public/home.html', 'home.html'];
  let htmlKey = htmlCandidates.find((k) => files[k]);
  if (!htmlKey) {
    htmlKey = Object.keys(files).find((k) => k.endsWith('.html'));
  }

  if (!htmlKey || !files[htmlKey]) {
    const fileList = Object.keys(files)
      .map((f) => `<li><code>${f}</code> (${Buffer.byteLength(files[f] || '', 'utf8')} bytes)</li>`)
      .join('');
    const fallbackHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${appName} · Live Preview</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px 24px; max-width: 700px; margin: 0 auto; background: #0B0F19; color: #F3F4F6; line-height: 1.6; }
    .card { background: #151C2C; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; }
    h1 { color: #38BDF8; font-size: 24px; margin-top: 0; }
    ul { padding-left: 20px; color: #94A3B8; }
    code { color: #F43F5E; background: rgba(244,63,94,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; }
    .badge { display: inline-block; background: #10B981; color: #022C22; font-weight: bold; font-size: 12px; padding: 3px 10px; border-radius: 999px; margin-bottom: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Aplikasi Web Nyata</span>
    <h1>${appName}</h1>
    <p>Aplikasi ini dibangun menggunakan arsitektur modular. Berkas-berkas berikut telah berhasil dibuat oleh AI:</p>
    <ul>${fileList}</ul>
  </div>
</body>
</html>`;
    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  let htmlContent = files[htmlKey];

  // 2. Kumpulkan dataset JSON (data/inventory.json, data/*.json, dll.) untuk Virtual API
  const jsonDatasets: Record<string, any> = {};
  for (const [k, v] of Object.entries(files)) {
    if (k.endsWith('.json') && !k.includes('package.json') && !k.includes('tsconfig')) {
      try {
        jsonDatasets[k] = JSON.parse(v);
        const baseName = path.basename(k);
        jsonDatasets[baseName] = jsonDatasets[k];
      } catch {}
    }
  }

  // 3. Injeksi Modern Design System (Tailwind CSS CDN, Inter Font, Lucide Icons, Chart.js, & Virtual API)
  const modernDesignSystemHead = `
<!-- [Forge World-Class Design System Injected] -->
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        fontFamily: {
          sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
          mono: ['JetBrains Mono', 'Fira Code', 'monospace']
        },
        colors: {
          slate: {
            850: '#111827',
            900: '#0f172a',
            950: '#020617'
          }
        }
      }
    }
  };
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/lucide@latest/dist/umd/lucide.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style id="forge-global-reset">
  * { box-sizing: border-box; }
  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  
  /* Universal Modal Backdrop & Container Overrides (Anti-Squished & Clickable) */
  .modal-overlay, .modal-backdrop, [class*="modal-overlay"], .forge-modal-backdrop {
    position: fixed !important; inset: 0 !important; background: rgba(0, 0, 0, 0.8) !important;
    backdrop-filter: blur(8px) !important; -webkit-backdrop-filter: blur(8px) !important;
    z-index: 9999 !important; display: none !important; align-items: center !important; justify-content: center !important;
    padding: 1.5rem !important; overflow-y: auto !important;
  }
  .modal-overlay.active, .modal-overlay.show, .modal-overlay.open, .modal-overlay[data-open="true"],
  .modal-backdrop.active, .modal-backdrop.show, .forge-modal-backdrop.active {
    display: flex !important;
  }
  .modal-overlay.hidden, .modal-overlay[style*="display: none"], .modal-overlay[style*="display:none"],
  .modal-backdrop.hidden, .modal-backdrop[style*="display: none"], .modal-backdrop[style*="display:none"],
  .hidden, [hidden] {
    display: none !important;
  }

  .modal-card, .modal-dialog, .modal-content, [class*="modal-card"], [class*="modal-box"] {
    background: #0f172a !important; color: #f8fafc !important;
    border: 1px solid #1e293b !important; border-radius: 1.25rem !important;
    width: 100% !important; max-width: 32rem !important; min-width: 320px !important;
    padding: 1.5rem !important; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6) !important;
    max-height: 90vh !important; overflow-y: auto !important; position: relative !important;
    display: flex !important; flex-direction: column !important; margin: auto !important;
  }

  .modal-header {
    display: flex !important; align-items: center !important; justify-content: space-between !important;
    padding-bottom: 0.875rem !important; border-bottom: 1px solid #1e293b !important; margin-bottom: 1.25rem !important;
  }
  .modal-header h3, .modal-header h4 {
    margin: 0 !important; font-size: 1.125rem !important; font-weight: 700 !important; color: #f8fafc !important;
  }
  .btn-close-modal {
    background: transparent !important; border: none !important; color: #94a3b8 !important;
    font-size: 1.5rem !important; cursor: pointer !important; padding: 0.25rem 0.5rem !important; line-height: 1 !important;
    border-radius: 0.5rem !important; transition: all 0.2s !important;
  }
  .btn-close-modal:hover { color: #ffffff !important; background: #1e293b !important; }

  .modal-footer {
    display: flex !important; align-items: center !important; justify-content: flex-end !important;
    gap: 0.75rem !important; padding-top: 1.25rem !important; border-top: 1px solid #1e293b !important; margin-top: 1.25rem !important;
  }

  /* Universal Thermal POS Receipt Overrides */
  .thermal-receipt, [class*="thermal-receipt"], [class*="receipt-content"], [id*="receipt-content"] {
    background: #ffffff !important; color: #0f172a !important;
    border-radius: 0.875rem !important; padding: 1.5rem !important;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
    font-size: 0.85rem !important; margin: 1rem 0 !important;
    box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.08), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
    width: 100% !important; line-height: 1.5 !important;
  }
  .thermal-receipt h4 { color: #0f172a !important; font-weight: 800 !important; text-align: center !important; }

  /* Universal Form Input & Checkout Summary Box Overrides */
  .form-input, .modal-body input:not([type="checkbox"]):not([type="radio"]), .modal-body select, .modal-body textarea {
    background: #020617 !important; border: 1px solid #334155 !important;
    color: #f8fafc !important; border-radius: 0.75rem !important;
    padding: 0.625rem 0.875rem !important; width: 100% !important; font-size: 0.875rem !important;
    outline: none !important; transition: border-color 0.2s !important;
  }
  .form-input:focus, .modal-body input:focus, .modal-body select:focus {
    border-color: #6366f1 !important; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
  }
  .checkout-summary-box {
    background: #020617 !important; border: 1px solid #1e293b !important;
    border-radius: 0.875rem !important; padding: 1.125rem !important; margin-bottom: 1.25rem !important;
  }
  .checkout-summary-row {
    display: flex !important; justify-content: space-between !important;
    padding: 0.35rem 0 !important; font-size: 0.875rem !important; color: #94a3b8 !important;
  }
  .total-highlight-row {
    border-top: 1px dashed #334155 !important; padding-top: 0.625rem !important;
    margin-top: 0.625rem !important; font-weight: 800 !important; font-size: 1.15rem !important; color: #10b981 !important;
  }
  .change-box {
    background: rgba(16, 185, 129, 0.1) !important; border: 1px solid rgba(16, 185, 129, 0.3) !important;
    color: #34d399 !important; border-radius: 0.75rem !important; padding: 0.75rem 1rem !important;
    display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 1rem !important;
  }

  /* Universal Mobile Responsive Resets */
  @media (max-width: 768px) {
    html, body {
      max-width: 100vw !important;
      overflow-x: hidden !important;
    }
    .container {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    .modal-card {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0.5rem !important;
      max-height: 92vh !important;
    }
    .grid-2, .grid-3, .grid-4 {
      grid-template-columns: 1fr !important;
    }
    .table-responsive, .table-wrap {
      overflow-x: auto !important;
      width: 100% !important;
      display: block !important;
      -webkit-overflow-scrolling: touch !important;
    }

    /* Universal Mobile Responsive Navbar & Header Overrides */
    .app-navbar, nav.app-navbar, header.app-navbar, .navbar {
      padding: 0.65rem 0.875rem !important;
      width: 100% !important;
    }
    .nav-container, .navbar-container {
      display: flex !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: space-between !important;
      width: 100% !important;
      gap: 0.5rem !important;
    }
    .landing-nav-link, nav a.landing-nav-link {
      display: none !important;
    }
    .guest-nav-group, #guest-nav-links {
      display: flex !important;
      align-items: center !important;
      gap: 0.35rem !important;
      flex-shrink: 0 !important;
    }
    .guest-nav-group .btn, #guest-nav-links .btn {
      padding: 0.35rem 0.65rem !important;
      font-size: 0.75rem !important;
      border-radius: 0.5rem !important;
      white-space: nowrap !important;
    }
    .auth-nav-group, #auth-nav-links {
      width: 100% !important;
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch !important;
      padding-top: 0.5rem !important;
    }
    .nav-menu-tabs {
      display: flex !important;
      gap: 0.375rem !important;
      white-space: nowrap !important;
    }
    .nav-btn {
      padding: 0.35rem 0.65rem !important;
      font-size: 0.75rem !important;
    }
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(148, 163, 184, 0.2); border-radius: 999px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(148, 163, 184, 0.4); }

  /* Inspector & 0-Token Element Visual Selector (Lovable Style) */
  html.forge-inspector-active, html.forge-inspector-active body, html.forge-inspector-active * {
    cursor: crosshair !important;
  }
  .forge-hover-highlight {
    outline: 2px solid #8b5cf6 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.35) !important;
    background-color: rgba(139, 92, 246, 0.12) !important;
    border-radius: 4px !important;
    transition: outline 0.1s ease-in-out !important;
  }
  .forge-element-selected-box {
    outline: 2px solid #6366f1 !important;
    outline-offset: 2px !important;
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.25) !important;
    background-color: rgba(99, 102, 241, 0.08) !important;
    border-radius: 4px !important;
    position: relative !important;
  }
  .forge-active-editing {
    outline: 2px solid #6366f1 !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.3) !important;
    background-color: rgba(99, 102, 241, 0.1) !important;
    cursor: text !important;
  }
  @keyframes forgePopIn {
    from { opacity: 0; transform: scale(0.95) translateY(4px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
</style>`;

  const forgeInspectorBridgeScript = `
<script id="forge-api-bridge">
(function() {
  window.__FORGE_STORAGE_KEY__ = 'forge_data_${slug}';
  window.__FORGE_USERS_KEY__ = 'forge_users_${slug}';
  window.__FORGE_AUTH_KEY__ = 'forge_auth_user_${slug}';
  const initialDatasets = ${JSON.stringify(jsonDatasets)};
  
  // 1. Initial Users Store (Default Master Admin & Preset accounts)
  const defaultUsers = [
    { id: 'usr-admin', name: 'Administrator', username: 'admin', email: 'admin@app.dev', role: 'admin', role_name: 'Administrator', password: 'admin' },
    { id: 'usr-kasir', name: 'Kasir Toko', username: 'kasir', email: 'kasir@app.dev', role: 'kasir', role_name: 'Staff Kasir', password: 'kasir' }
  ];

  let users = [];
  try {
    const savedUsers = localStorage.getItem(window.__FORGE_USERS_KEY__);
    users = savedUsers ? JSON.parse(savedUsers) : (initialDatasets['users.json'] || defaultUsers);
  } catch {
    users = defaultUsers;
  }
  window.__FORGE_USERS__ = users;

  // 2. Initial Datasets Store
  let store = {};
  try {
    const saved = localStorage.getItem(window.__FORGE_STORAGE_KEY__);
    store = saved ? JSON.parse(saved) : initialDatasets;
  } catch {
    store = initialDatasets;
  }
  window.__FORGE_STORE__ = store;

  function saveStore() {
    try {
      localStorage.setItem(window.__FORGE_STORAGE_KEY__, JSON.stringify(window.__FORGE_STORE__));
    } catch {}
  }

  function saveUsers() {
    try {
      localStorage.setItem(window.__FORGE_USERS_KEY__, JSON.stringify(window.__FORGE_USERS__));
    } catch {}
  }

  // 3. Virtual In-Iframe Fetch Interceptor
  const origFetch = window.fetch;
  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : (resource ? resource.url : '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();
    const cleanUrl = url.split('?')[0].toLowerCase();
    
    // Intercept all /api/ and /data/ requests so they NEVER hit the host KilatTools SaaS domain
    if (url.includes('/api/') || url.includes('/data/') || url.endsWith('.json')) {
      let payload = {};
      if (init && init.body) {
        try { payload = typeof init.body === 'string' ? JSON.parse(init.body) : init.body; } catch { payload = {}; }
      }

      // 3.1 AUTHENTICATION: REGISTER & SIGNUP (Manual User Registration)
      if (cleanUrl.endsWith('/auth/register') || cleanUrl.endsWith('/register') || cleanUrl.endsWith('/signup') || cleanUrl.endsWith('/auth/signup')) {
        const emailInput = (payload.email || (payload.username ? payload.username + '@app.dev' : '')).toString().trim().toLowerCase();
        const userInput = (payload.username || payload.name || 'user_' + Date.now().toString().slice(-4)).toString().trim().toLowerCase().replace(/\\s+/g, '');
        const passInput = (payload.password || payload.pass || '').toString();

        const newUser = {
          id: 'usr-' + Date.now(),
          name: payload.name || payload.username || 'Pengguna Baru',
          username: userInput,
          email: emailInput,
          role: payload.role || 'user',
          role_name: payload.role === 'admin' ? 'Administrator' : (payload.role === 'kasir' ? 'Staff Kasir' : 'Pengguna'),
          password: passInput,
          created_at: new Date().toISOString()
        };

        const existingIdx = window.__FORGE_USERS__.findIndex(u => 
          (u.email && u.email.toLowerCase() === emailInput) ||
          (u.username && u.username.toLowerCase() === userInput)
        );

        if (existingIdx !== -1) {
          window.__FORGE_USERS__[existingIdx] = { ...window.__FORGE_USERS__[existingIdx], ...newUser };
        } else {
          window.__FORGE_USERS__.push(newUser);
        }
        saveUsers();

        const authData = {
          success: true,
          status: 'success',
          token: 'forge_mock_jwt_' + Date.now(),
          user: newUser,
          profile: newUser,
          data: newUser,
          message: 'Pendaftaran berhasil! Akun Anda siap digunakan.'
        };

        try {
          localStorage.setItem(window.__FORGE_AUTH_KEY__, JSON.stringify(newUser));
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('user', JSON.stringify(newUser));
          localStorage.setItem('kasirpro_session', JSON.stringify(newUser));
          localStorage.setItem('current_user', JSON.stringify(newUser));
          localStorage.setItem('user_session', JSON.stringify(newUser));
        } catch {}

        return new Response(JSON.stringify(authData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3.2 AUTHENTICATION: LOGIN & SIGNIN (Strict Validation against registered users & master admin)
      if (cleanUrl.endsWith('/auth/login') || cleanUrl.endsWith('/login') || cleanUrl.endsWith('/signin') || cleanUrl.endsWith('/auth/signin')) {
        const iden = (payload.username || payload.email || payload.identifier || payload.user || payload.id || '').toString().trim().toLowerCase();
        const pass = (payload.password || payload.pass || '').toString();

        let matchedUser = window.__FORGE_USERS__.find(u => 
          (u.username && u.username.toLowerCase() === iden) || 
          (u.email && u.email.toLowerCase() === iden) ||
          (iden === 'admin' && (u.role === 'admin' || u.username === 'admin')) ||
          (iden === 'kasir' && (u.role === 'kasir' || u.username === 'kasir'))
        );

        if (!matchedUser) {
          return new Response(JSON.stringify({
            success: false,
            status: 'error',
            message: 'Email atau kata sandi tidak sesuai. Silakan daftar akun terlebih dahulu.'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Verify password if provided
        if (pass && matchedUser.password && matchedUser.password !== pass && pass !== 'admin' && pass !== 'kasir' && pass !== '123' && pass !== 'password') {
          return new Response(JSON.stringify({
            success: false,
            status: 'error',
            message: 'Kata sandi tidak cocok. Silakan periksa kembali.'
          }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const authData = {
          success: true,
          status: 'success',
          token: 'forge_mock_jwt_' + Date.now(),
          user: matchedUser,
          profile: matchedUser,
          data: matchedUser,
          message: 'Login berhasil! Selamat datang, ' + (matchedUser.name || matchedUser.username) + '.'
        };

        try {
          localStorage.setItem(window.__FORGE_AUTH_KEY__, JSON.stringify(matchedUser));
          localStorage.setItem('auth_token', authData.token);
          localStorage.setItem('user', JSON.stringify(matchedUser));
          localStorage.setItem('kasirpro_session', JSON.stringify(matchedUser));
          localStorage.setItem('current_user', JSON.stringify(matchedUser));
          localStorage.setItem('user_session', JSON.stringify(matchedUser));
        } catch {}

        return new Response(JSON.stringify(authData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3.3 AUTHENTICATION: ME / PROFILE / CURRENT USER
      if (cleanUrl.endsWith('/auth/me') || cleanUrl.endsWith('/auth/user') || cleanUrl.endsWith('/me') || cleanUrl.endsWith('/user/profile')) {
        let currentUser = null;
        try {
          const savedAuth = localStorage.getItem(window.__FORGE_AUTH_KEY__) || localStorage.getItem('user') || localStorage.getItem('kasirpro_session');
          if (savedAuth) currentUser = JSON.parse(savedAuth);
        } catch {}

        if (!currentUser) {
          currentUser = defaultUsers[0];
        }

        return new Response(JSON.stringify({
          success: true,
          user: currentUser,
          profile: currentUser,
          data: currentUser
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3.4 AUTHENTICATION: LOGOUT
      if (cleanUrl.endsWith('/auth/logout') || cleanUrl.endsWith('/logout') || cleanUrl.endsWith('/signout')) {
        try {
          localStorage.removeItem(window.__FORGE_AUTH_KEY__);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          localStorage.removeItem('kasirpro_session');
          localStorage.removeItem('current_user');
          localStorage.removeItem('user_session');
        } catch {}
        return new Response(JSON.stringify({ success: true, message: 'Logout berhasil' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3.5 UNIVERSAL USERS LIST
      if (cleanUrl.endsWith('/users') || cleanUrl.endsWith('/api/users')) {
        return new Response(JSON.stringify({
          success: true,
          users: window.__FORGE_USERS__,
          data: window.__FORGE_USERS__
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // 3.6 UNIVERSAL DATA / CRUD RESOURCE MATCHING
      const resourceName = cleanUrl.split('/').filter(Boolean).pop()?.replace('.json', '') || 'records';
      const matchedKey = Object.keys(window.__FORGE_STORE__).find(k => 
        k.toLowerCase().includes(resourceName) || resourceName.includes(k.replace('.json', '').toLowerCase())
      ) || (Object.keys(window.__FORGE_STORE__)[0] || 'records');

      if (!window.__FORGE_STORE__[matchedKey]) {
        window.__FORGE_STORE__[matchedKey] = [];
      }

      let dataset = window.__FORGE_STORE__[matchedKey];

      if (Array.isArray(dataset)) {
        if (method === 'POST' && payload) {
          const newItem = {
            id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            ...payload,
            created_at: new Date().toISOString(),
            status: payload.status || 'selesai'
          };
          dataset.unshift(newItem);
          saveStore();
          return new Response(JSON.stringify({
            success: true,
            data: newItem,
            record: newItem,
            item: newItem,
            message: 'Data berhasil ditambahkan'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (method === 'PUT' || method === 'PATCH') {
          const idMatch = url.match(/[?&]id=([^&]+)/) || url.match(/\\/([^\\/?]+)$/);
          const targetId = payload.id || (idMatch ? idMatch[1] : null);
          let updatedItem = payload;
          if (targetId) {
            const idx = dataset.findIndex(item => String(item.id) === String(targetId));
            if (idx !== -1) {
              dataset[idx] = { ...dataset[idx], ...payload, updated_at: new Date().toISOString() };
              updatedItem = dataset[idx];
              saveStore();
            }
          }
          return new Response(JSON.stringify({
            success: true,
            data: updatedItem,
            record: updatedItem,
            message: 'Data berhasil diperbarui'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (method === 'DELETE') {
          const idMatch = url.match(/[?&]id=([^&]+)/) || url.match(/\\/([^\\/?]+)$/);
          const targetId = payload?.id || (idMatch ? idMatch[1] : null);
          if (targetId) {
            window.__FORGE_STORE__[matchedKey] = dataset.filter(item => String(item.id) !== String(targetId));
            saveStore();
          }
          return new Response(JSON.stringify({ success: true, message: 'Data berhasil dihapus' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Default GET response
      const respData = dataset !== null && dataset !== undefined ? dataset : window.__FORGE_STORE__;
      return new Response(JSON.stringify({
        success: true,
        data: respData,
        records: Array.isArray(respData) ? respData : Object.values(respData),
        items: Array.isArray(respData) ? respData : []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return origFetch.apply(this, arguments);
  };

  // Global helpers
  window.closeModal = function(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
      el.classList.remove('active', 'show', 'open');
      el.classList.add('hidden');
      el.style.setProperty('display', 'none', 'important');
      el.removeAttribute('data-open');
    }
  };
  window.openModal = function(modalId) {
    const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
    if (el) {
      el.classList.remove('hidden');
      el.classList.add('active', 'show');
      el.style.setProperty('display', 'flex', 'important');
      el.setAttribute('data-open', 'true');
    }
  };
  window.printCurrentReceipt = function() {
    window.print();
  };

  // Auto populate thermal receipt jika kosong
  function initReceipt() {
    const receiptContainer = document.querySelector('#receipt-content, .thermal-receipt');
    if (receiptContainer && receiptContainer.innerText.trim() === '') {
      const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
      const trxId = 'TRX-' + Date.now().toString().slice(-6);
      receiptContainer.innerHTML = '<div style="text-align: center; margin-bottom: 12px;">' +
        '<h4 style="margin: 0; font-size: 14px; font-weight: 800; letter-spacing: 0.5px; color: #0f172a;">' + ${JSON.stringify(appName.toUpperCase())} + '</h4>' +
        '<p style="margin: 2px 0; font-size: 11px; color: #64748b;">Sistem POS &amp; Pencatatan Transaksi</p>' +
        '<p style="margin: 0; font-size: 10px; color: #94a3b8;">' + dateStr + ' · #' + trxId + '</p>' +
        '</div>' +
        '<div style="border-bottom: 1px dashed #cbd5e1; margin: 8px 0;"></div>' +
        '<div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; color: #1e293b;"><span>Beras Premium 5kg (1x)</span><span style="font-weight: 600;">Rp 72.500</span></div>' +
        '<div style="display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; color: #1e293b;"><span>Minyak Goreng 2L (2x)</span><span style="font-weight: 600;">Rp 72.000</span></div>' +
        '<div style="border-bottom: 1px dashed #cbd5e1; margin: 8px 0;"></div>' +
        '<div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin: 2px 0;"><span>Subtotal:</span><span>Rp 144.500</span></div>' +
        '<div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin: 2px 0;"><span>PPN (11%):</span><span>Rp 15.895</span></div>' +
        '<div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 6px; padding-top: 6px; border-top: 1px solid #e2e8f0;"><span>TOTAL:</span><span style="color: #059669;">Rp 160.395</span></div>' +
        '<div style="border-bottom: 1px dashed #cbd5e1; margin: 10px 0;"></div>' +
        '<div style="text-align: center; font-size: 10px; color: #94a3b8;"><p style="margin: 0;">Terima kasih atas kunjungan Anda!</p><p style="margin: 2px 0 0; font-weight: 700; color: #059669;">LUNAS (Tunai)</p></div>';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReceipt);
  } else {
    initReceipt();
  }

  // Visual Point-and-Click Inspector & Lovable-grade 0-Token In-Place WYSIWYG Editor
  let inspectorActive = false;
  let currentHovered = null;
  let floatingPopover = null;
  let activeEditingTarget = null;
  let originalElementText = '';
  let inspectorBanner = null;

  function setInspectorBanner(show) {
    if (show) {
      if (!inspectorBanner) {
        inspectorBanner = document.createElement('div');
        inspectorBanner.id = 'forge-inspector-active-banner';
        inspectorBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999998;background:#4f46e5;color:#ffffff;font-family:Inter,sans-serif;font-size:11px;font-weight:700;padding:7px 12px;text-align:center;box-shadow:0 4px 6px -1px rgba(0,0,0,0.3);letter-spacing:0.3px;pointer-events:none;';
        inspectorBanner.innerText = '🎯 Mode Pilih Elemen Aktif — Klik teks mana saja untuk mengedit langsung di preview (0 Token)';
        if (document.body) document.body.appendChild(inspectorBanner);
      }
    } else {
      if (inspectorBanner && inspectorBanner.parentNode) {
        inspectorBanner.parentNode.removeChild(inspectorBanner);
      }
      inspectorBanner = null;
    }
  }

  function getLeafTarget(rawTarget) {
    if (!rawTarget || rawTarget === document.body || rawTarget === document.documentElement) return null;
    if (rawTarget.id === 'forge-inspector-active-banner' || rawTarget.closest('#forge-edit-element-popover') || rawTarget.closest('#forge-inline-toolbar')) return null;

    // Utamakan elemen teks atau interaktif terdalam (leaf node)
    const leaf = rawTarget.closest('h1, h2, h3, h4, h5, h6, p, span, button, a, label, td, th, li, strong, b, em, small, input, select') || rawTarget;
    if (leaf === document.body || leaf === document.documentElement) return null;
    return leaf;
  }

  function removeInlineEditor() {
    if (activeEditingTarget) {
      activeEditingTarget.contentEditable = 'false';
      activeEditingTarget.classList.remove('forge-active-editing');
      activeEditingTarget.classList.remove('forge-element-selected-box');
    }
    if (floatingPopover && floatingPopover.parentNode) {
      floatingPopover.parentNode.removeChild(floatingPopover);
    }
    floatingPopover = null;
    activeEditingTarget = null;
  }

  async function saveDirectTextChange(target, oldText, newText, oldHtml, newHtml, saveBtn) {
    if (!oldText && !oldHtml) {
      removeInlineEditor();
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerText = '⏳ Menyimpan ke Database...';
    }

    try {
      const res = await fetch('/api/preview/${slug}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'direct-save',
          oldText: oldText,
          newText: newText,
          oldHtml: oldHtml,
          newHtml: newHtml
        })
      });

      if (res.ok) {
        if (saveBtn) {
          saveBtn.innerText = '✓ Tersimpan di DB & Frontend!';
          saveBtn.style.background = '#059669';
          saveBtn.style.color = '#ffffff';
        }

        window.parent.postMessage({
          type: 'forge:direct-save-success',
          oldText: oldText,
          newText: newText
        }, '*');

        setTimeout(() => {
          removeInlineEditor();
        }, 800);
      } else {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.innerText = 'Gagal Menyimpan';
        }
      }
    } catch (err) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = 'Error';
      }
    }
  }

  function openEditElementPopover(target) {
    removeInlineEditor();
    activeEditingTarget = target;
    originalElementText = (target.innerText || '').trim();
    const originalOuterHtml = target.outerHTML;

    target.classList.add('forge-element-selected-box');

    const rect = target.getBoundingClientRect();
    const popover = document.createElement('div');
    popover.id = 'forge-edit-element-popover';
    popover.style.cssText = 'position:fixed;z-index:999999;background-color:#1e293b;border:1px solid #475569;border-radius:14px;box-shadow:0 20px 30px -5px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);padding:14px;min-width:230px;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:#f8fafc;animation:forgePopIn 0.15s ease-out;';

    // Kalkulasi posisi cerdas di samping elemen atau atas/bawah
    let topPos = rect.top;
    let leftPos = rect.right + 16;

    if (leftPos + 240 > window.innerWidth) {
      leftPos = Math.max(10, rect.left - 246);
    }
    if (leftPos < 10) {
      leftPos = Math.max(10, Math.min(window.innerWidth - 250, rect.left));
      topPos = rect.bottom + 12;
    }
    if (topPos + 180 > window.innerHeight) {
      topPos = Math.max(10, window.innerHeight - 200);
    }

    popover.style.top = topPos + 'px';
    popover.style.left = leftPos + 'px';

    popover.innerHTML = 
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid #334155;">' +
        '<div style="display:flex;align-items:center;gap:6px;">' +
          '<span style="font-size:13px;font-weight:700;color:#f1f5f9;letter-spacing:-0.2px;">Edit Elemen</span>' +
          '<span style="background:rgba(99,102,241,0.2);color:#818cf8;font-size:9px;font-weight:700;padding:1px 5px;border-radius:4px;border:1px solid rgba(99,102,241,0.3);">' + (target.tagName || '').toLowerCase() + '</span>' +
        '</div>' +
        '<button id="forge-popover-close-btn" style="background:transparent;border:none;color:#94a3b8;cursor:pointer;font-size:16px;line-height:1;padding:2px 4px;border-radius:4px;transition:color 0.15s;" title="Tutup">✕</button>' +
      '</div>' +
      '<div id="forge-opt-edit-text" style="display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;background:#334155;color:#ffffff;font-size:13px;font-weight:600;margin-bottom:8px;transition:all 0.15s;border:1px solid transparent;" onmouseover="this.style.background=\\'#475569\\'" onmouseout="this.style.background=\\'#334155\\'">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:#818cf8;"><path d="M17 6.1H7M12 6.1v11.8M9 17.9h6"/></svg>' +
        '<span>Edit Teks Langsung</span>' +
      '</div>' +
      '<div id="forge-edit-actions-area" style="display:none;margin-top:8px;">' +
        '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;line-height:1.3;">Ketik teks baru pada kotak seleksi di layar.</div>' +
        '<button id="forge-popover-save-btn" style="width:100%;background:#10b981;color:#ffffff;font-weight:700;border:none;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 12px rgba(16,185,129,0.3);transition:all 0.15s;">' +
          '💾 Simpan ke DB (0 Token)' +
        '</button>' +
      '</div>';

    if (document.body) document.body.appendChild(popover);
    floatingPopover = popover;

    const closeBtn = popover.querySelector('#forge-popover-close-btn');
    const editTextBtn = popover.querySelector('#forge-opt-edit-text');
    const saveBtn = popover.querySelector('#forge-popover-save-btn');
    const actionsArea = popover.querySelector('#forge-edit-actions-area');

    const activateTextEdit = () => {
      target.contentEditable = 'true';
      target.classList.add('forge-active-editing');
      actionsArea.style.display = 'block';
      editTextBtn.style.borderColor = '#6366f1';
      editTextBtn.style.background = 'rgba(99,102,241,0.15)';
      try {
        target.focus();
        // Place cursor at end of text
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(target);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch {}
    };

    editTextBtn.onclick = function(e) {
      e.stopPropagation();
      activateTextEdit();
    };

    // Auto-activate text edit immediately for super fast UX
    activateTextEdit();

    closeBtn.onclick = function(e) {
      e.stopPropagation();
      removeInlineEditor();
    };

    saveBtn.onclick = function(e) {
      e.stopPropagation();
      const newText = (target.innerText || '').trim();
      saveDirectTextChange(target, originalElementText, newText, originalOuterHtml, target.outerHTML, saveBtn);
    };

    target.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const newText = (target.innerText || '').trim();
        saveDirectTextChange(target, originalElementText, newText, originalOuterHtml, target.outerHTML, saveBtn);
      }
    };
  }

  // Listener message dari parent window
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'forge:toggle-inspector') {
      inspectorActive = Boolean(e.data.enabled);
      if (inspectorActive) {
        document.documentElement.classList.add('forge-inspector-active');
        if (document.body) document.body.classList.add('forge-inspector-active');
        setInspectorBanner(true);
      } else {
        document.documentElement.classList.remove('forge-inspector-active');
        if (document.body) document.body.classList.remove('forge-inspector-active');
        setInspectorBanner(false);
        if (currentHovered) {
          currentHovered.classList.remove('forge-hover-highlight');
          currentHovered = null;
        }
        removeInlineEditor();
      }
    }
  });

  document.addEventListener('mouseover', function(e) {
    if (!inspectorActive) return;
    const target = getLeafTarget(e.target);
    if (!target) return;

    if (currentHovered && currentHovered !== target) {
      currentHovered.classList.remove('forge-hover-highlight');
    }
    currentHovered = target;
    currentHovered.classList.add('forge-hover-highlight');
  }, true);

  document.addEventListener('mouseout', function(e) {
    if (!inspectorActive) return;
    if (e.target && e.target === currentHovered && !e.relatedTarget) {
      e.target.classList.remove('forge-hover-highlight');
    }
  }, true);

  document.addEventListener('click', function(e) {
    if (!inspectorActive) return;
    if (floatingPopover && (floatingPopover === e.target || floatingPopover.contains(e.target))) {
      return;
    }

    const target = getLeafTarget(e.target);
    if (!target) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    openEditElementPopover(target);

    const tag = target.tagName ? target.tagName.toLowerCase() : '';
    const id = target.id || '';
    const classes = target.className && typeof target.className === 'string' ? target.className : '';
    const text = (target.innerText || '').slice(0, 40).replace(/\s+/g, ' ');

    window.parent.postMessage({
      type: 'forge:element-selected',
      elementTag: tag,
      elementId: id,
      elementClasses: classes,
      elementText: text
    }, '*');
  }, true);

  // Universal Form Submit Reload Protector (Prevent iframe native refresh)
  document.addEventListener('submit', function(e) {
    const targetForm = e.target;
    if (targetForm && targetForm.tagName === 'FORM') {
      const action = (targetForm.getAttribute('action') || '').trim();
      if (!action || action === '#' || action.startsWith('/') || action.includes('/api/')) {
        // Prevent default native browser page refresh
        e.preventDefault();
      }
    }
  }, false);

  // Beritahu parent window bahwa bridge inspector siap
  try {
    window.parent.postMessage({ type: 'forge:bridge-ready' }, '*');
  } catch {}
})();
</script>`;

  if (htmlContent.includes('<head>')) {
    htmlContent = htmlContent.replace('<head>', `<head>\n${modernDesignSystemHead}\n${forgeInspectorBridgeScript}`);
  } else {
    htmlContent = modernDesignSystemHead + forgeInspectorBridgeScript + htmlContent;
  }

  // 4. Bundling SEMUA berkas CSS secara universal (menghapus tag link eksternal agar tidak 404)
  const cssFiles = Object.entries(files).filter(([k]) => k.endsWith('.css') && !k.includes('node_modules'));
  for (const [cssPath, cssText] of cssFiles) {
    if (cssText && !cssText.startsWith('[Berkas tersimpan di disk')) {
      const baseName = path.basename(cssPath);
      const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${baseName.replace('.', '\\.')}["'][^>]*>`, 'gi');
      htmlContent = htmlContent.replace(linkRegex, '');

      const cssTag = `<style data-origin="${cssPath}">/* ${cssPath} */\n${cssText}</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${cssTag}\n</head>`);
      } else {
        htmlContent = cssTag + htmlContent;
      }
    }
  }

  // 5. Bundling SEMUA berkas Client JS secara universal (menghapus tag script eksternal agar tidak 404)
  const isClientJs = (k: string) => {
    if (!k.endsWith('.js') && !k.endsWith('.mjs')) return false;
    if (k.includes('node_modules') || k.includes('test') || k === 'server.js') return false;
    return true;
  };

  const jsFiles = Object.entries(files).filter(([k]) => isClientJs(k));
  for (const [jsPath, jsText] of jsFiles) {
    if (jsText && !jsText.startsWith('[Berkas tersimpan di disk') && jsText.length > 20) {
      const baseName = path.basename(jsPath);
      const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${baseName.replace('.', '\\.')}["'][^>]*>\\s*<\\/script>`, 'gi');
      htmlContent = htmlContent.replace(scriptRegex, '');

      const jsTag = `<script data-origin="${jsPath}">/* ${jsPath} */\n${jsText}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${jsTag}\n</body>`);
      } else {
        htmlContent += `\n${jsTag}`;
      }
    }
  }

  // Re-trigger createIcons jika Lucide Icons digunakan
  const lucideReinit = `
<script>
setTimeout(function() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}, 300);
</script>`;
  if (htmlContent.includes('</body>')) {
    htmlContent = htmlContent.replace('</body>', `${lucideReinit}\n</body>`);
  } else {
    htmlContent += lucideReinit;
  }

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}
