import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug } from '@/lib/supabase/db';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const app = await getAppBySlug(slug);

  if (!app) {
    return new NextResponse('Aplikasi tidak ditemukan', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  const files: Record<string, string> = app.files || {};

  // 1. Cari berkas HTML utama
  const htmlKeys = ['public/index.html', 'index.html', 'public/home.html'];
  let htmlKey = htmlKeys.find((k) => files[k]);
  if (!htmlKey) {
    htmlKey = Object.keys(files).find((k) => k.endsWith('.html'));
  }

  if (!htmlKey || !files[htmlKey]) {
    const fileList = Object.keys(files)
      .map(
        (f) =>
          `<li><code>${f}</code> (${Buffer.byteLength(files[f], 'utf8')} bytes)</li>`
      )
      .join('');
    const fallbackHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>${app.name} · Live Preview</title>
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
    <h1>${app.name}</h1>
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

  // 2. Bundling inline CSS jika ada file style.css yang ditulis AI
  const cssKeys = ['public/style.css', 'style.css', 'public/styles.css', 'styles.css'];
  for (const ck of cssKeys) {
    if (files[ck]) {
      const cssInline = `<style>/* Inlined from ${ck} */\n${files[ck]}</style>`;
      if (htmlContent.includes('</head>')) {
        htmlContent = htmlContent.replace('</head>', `${cssInline}\n</head>`);
      } else {
        htmlContent = cssInline + htmlContent;
      }
    }
  }

  // 3. Bundling inline JS jika ada file app.js/script.js yang ditulis AI
  const jsKeys = ['public/app.js', 'app.js', 'public/script.js', 'script.js'];
  for (const jk of jsKeys) {
    if (files[jk]) {
      const jsInline = `<script>/* Inlined from ${jk} */\n${files[jk]}</script>`;
      if (htmlContent.includes('</body>')) {
        htmlContent = htmlContent.replace('</body>', `${jsInline}\n</body>`);
      } else {
        htmlContent += jsInline;
      }
    }
  }

  return new NextResponse(htmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN'
    }
  });
}
