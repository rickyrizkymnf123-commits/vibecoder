import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, updateApp } from '@/lib/supabase/db';
import { VercelClient } from '@/lib/vercel/client';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId, customDomain } = await req.json();
  if (!appId || !customDomain) {
    return NextResponse.json({ error: 'appId dan customDomain wajib diisi' }, { status: 400 });
  }

  const cleanDomain = customDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const app = await getAppById(appId);
  if (!app || app.user_id !== user.userId) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  if (app.status !== 'published') {
    return NextResponse.json(
      { error: 'Custom domain hanya dapat dihubungkan ke aplikasi yang telah dipublish (bukan draft)' },
      { status: 400 }
    );
  }

  const vercel = new VercelClient();
  const assignResult = await vercel.assignCustomDomain(app.name, cleanDomain);

  const updated = await updateApp(app.id, {
    custom_domain: cleanDomain,
    domain_status: 'pending_verification'
  });

  const isApex = cleanDomain.split('.').length <= 3 && !cleanDomain.startsWith('www.');
  const subdomainPart = cleanDomain.split('.')[0];

  return NextResponse.json({
    success: true,
    app: updated,
    dnsInstructions: {
      domain: cleanDomain,
      isApex,
      records: isApex ? [
        {
          type: 'A',
          host: '@',
          value: '76.76.21.21',
          desc: 'Untuk Domain Utama (Apex)'
        },
        {
          type: 'CNAME',
          host: 'www',
          value: 'cname.vercel-dns.com',
          desc: 'Untuk Subdomain www'
        }
      ] : [
        {
          type: 'CNAME',
          host: subdomainPart,
          value: 'cname.vercel-dns.com',
          desc: `Untuk Subdomain ${cleanDomain}`
        }
      ],
      type: isApex ? 'A' : 'CNAME',
      host: isApex ? '@' : subdomainPart,
      value: isApex ? '76.76.21.21' : 'cname.vercel-dns.com',
      ttl: 'Auto'
    }
  });
}

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');

  if (!domain) {
    return NextResponse.json({ error: 'domain parameter required' }, { status: 400 });
  }

  const vercel = new VercelClient();
  const statusResult = await vercel.checkDomainStatus(domain);

  return NextResponse.json({
    domain,
    status: statusResult.status,
    verified: statusResult.verified
  });
}
