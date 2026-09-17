import { NextRequest, NextResponse } from 'next/server';
import { getAppByCustomDomain } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return new NextResponse('Custom domain parameter missing', { status: 400 });
  }

  const app = await getAppByCustomDomain(domain);
  if (!app) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Domain Belum Terhubung · Kilat Tools</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px 24px; max-width: 600px; margin: 0 auto; background: #0B0F19; color: #F3F4F6; text-align: center; }
    .card { background: #151C2C; border: 1px solid #1E293B; border-radius: 16px; padding: 36px 24px; margin-top: 40px; }
    h1 { color: #F59E0B; font-size: 22px; }
    p { color: #94A3B8; font-size: 14px; line-height: 1.6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌐 Domain Belum Terhubung</h1>
    <p>Domain <code>${domain}</code> belum dihubungkan ke aplikasi manapun atau sedang menunggu konfigurasi DNS di Kilat Tools.</p>
  </div>
</body>
</html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }

  const rawUrl = new URL(`/api/preview/${app.slug}/raw`, req.url);
  return NextResponse.rewrite(rawUrl);
}
