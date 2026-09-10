import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  let app = await getAppBySlug(slug);

  // Fallback: jika tidak ada di DB, cari di folder workspaces
  const workspacesDir = path.join(process.cwd(), 'workspaces');
  let diskWsDir = '';

  if (app && app.session_id) {
    const candidate = path.join(workspacesDir, app.session_id);
    if (fs.existsSync(candidate)) diskWsDir = candidate;
  }

  if (!diskWsDir && fs.existsSync(workspacesDir)) {
    const dirs = fs.readdirSync(workspacesDir);
    for (const d of dirs) {
      if (d.toLowerCase().includes(slug.toLowerCase()) || (app && d === app.session_id)) {
        diskWsDir = path.join(workspacesDir, d);
        break;
      }
    }
  }

  // Kumpulkan semua berkas (prioritaskan berkas fisik di disk jika ada)
  const files: Record<string, string> = { ...(app?.files || {}) };

  if (diskWsDir && fs.existsSync(diskWsDir)) {
    const readDirRecursive = (dir: string, base: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git') continue;
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

  if (!app && Object.keys(files).length === 0) {
    return new NextResponse('Aplikasi tidak ditemukan', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
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

  // 3. Injeksi Virtual API Interceptor (Mencegah 404 saat app.js melakukan fetch('/api/...') atau fetch('data/...'))
  const apiInterceptor = `
<script id="forge-api-bridge">
(function() {
  window.__FORGE_STORAGE_KEY__ = 'forge_data_${slug}';
  const initialDatasets = ${JSON.stringify(jsonDatasets)};
  
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

  // Intercept fetch untuk menangani request REST lokal dari client JS
  const origFetch = window.fetch;
  window.fetch = async function(resource, init) {
    const url = typeof resource === 'string' ? resource : (resource ? resource.url : '');
    const method = (init && init.method ? init.method : 'GET').toUpperCase();
    
    // Tangani request ke /api/... atau file .json lokal
    if (url.includes('/api/') || url.includes('/data/') || url.endsWith('.json')) {
      console.log('[Forge Virtual API]', method, url);
      let payload = null;
      if (init && init.body) {
        try { payload = JSON.parse(init.body); } catch { payload = init.body; }
      }

      // Cari dataset yang relevan
      const matchedKey = Object.keys(window.__FORGE_STORE__).find(k => url.toLowerCase().includes(k.replace('.json', '').toLowerCase())) || Object.keys(window.__FORGE_STORE__)[0];
      let dataset = matchedKey ? window.__FORGE_STORE__[matchedKey] : null;

      if (Array.isArray(dataset)) {
        if (method === 'POST' && payload) {
          const newItem = { id: 'item-' + Date.now(), ...payload, created_at: new Date().toISOString() };
          dataset.unshift(newItem);
          saveStore();
          return new Response(JSON.stringify({ success: true, data: newItem }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } else if (method === 'DELETE') {
          const idMatch = url.match(/[?&]id=([^&]+)/) || url.match(/\\/([^\\/?]+)$/);
          if (idMatch) {
            const targetId = idMatch[1];
            window.__FORGE_STORE__[matchedKey] = dataset.filter(item => String(item.id) !== targetId);
            saveStore();
          }
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      const respData = dataset !== null && dataset !== undefined ? dataset : window.__FORGE_STORE__;
      return new Response(JSON.stringify(respData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return origFetch.apply(this, arguments);
  };

  // Inisialisasi ikon Lucide secara otomatis setelah halaman selesai dimuat
  window.addEventListener('DOMContentLoaded', function() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  });
})();
</script>`;

  if (htmlContent.includes('<head>')) {
    htmlContent = htmlContent.replace('<head>', `<head>\n${apiInterceptor}`);
  } else {
    htmlContent = apiInterceptor + htmlContent;
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
