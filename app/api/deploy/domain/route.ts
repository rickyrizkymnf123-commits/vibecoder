import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, getAppByCustomDomain, updateApp, getUserProfile } from '@/lib/supabase/db';
import { VercelClient } from '@/lib/vercel/client';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Pro Guard (Hanya User Pro yang dapat menggunakan custom domain)
  const profile = await getUserProfile(user.userId);
  const isPro = Boolean(profile?.is_pro || user.role === 'admin' || user.username === 'demo');

  if (!isPro) {
    return NextResponse.json(
      {
        error: 'Fitur Custom Domain hanya tersedia untuk pengguna Pro Edition. Silakan upgrade ke Tier Pro.',
        is_pro: false
      },
      { status: 403 }
    );
  }

  const { appId, customDomain } = await req.json();
  if (!appId || !customDomain) {
    return NextResponse.json({ error: 'appId dan customDomain wajib diisi' }, { status: 400 });
  }

  const cleanDomain = customDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\s+/g, '');

  // Validasi format domain root
  if (!cleanDomain.includes('.') || cleanDomain.length < 4 || cleanDomain.startsWith('.') || cleanDomain.endsWith('.')) {
    return NextResponse.json(
      { error: 'Format domain tidak valid. Masukkan domain utuh (contoh: tokoku.com atau kasirku.id)' },
      { status: 400 }
    );
  }

  const app = await getAppById(appId);
  if (!app || (app.user_id !== user.userId && user.role !== 'admin' && user.username !== 'demo')) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan atau hak akses ditolak' }, { status: 404 });
  }

  // 2. Granularitas Per-App (Hanya untuk app yang sudah Published)
  if (app.status !== 'published') {
    return NextResponse.json(
      { error: 'Custom domain hanya dapat dihubungkan ke aplikasi yang telah dipublish (bukan draft)' },
      { status: 400 }
    );
  }

  // 3. Cek apakah domain sudah dipakai aplikasi lain
  const existingAppWithDomain = await getAppByCustomDomain(cleanDomain);
  if (existingAppWithDomain && existingAppWithDomain.id !== app.id) {
    return NextResponse.json(
      { error: `Domain ${cleanDomain} sudah terhubung ke aplikasi "${existingAppWithDomain.name}". Gunakan domain lain atau putuskan dari aplikasi tersebut terlebih dahulu.` },
      { status: 400 }
    );
  }

  // 4. TAHAP 1: Registrasikan domain ke Vercel REST API & dapatkan challenge TXT
  const vercel = new VercelClient();
  const assignResult = await vercel.assignCustomDomain(app.name, cleanDomain);

  const domainVerificationData = {
    txt_name: assignResult.txtRecord?.host || '_vercel',
    txt_value: assignResult.txtRecord?.value || `vc-domain-verify=${cleanDomain}`,
    a_name: assignResult.aRecord?.host || '@',
    a_value: assignResult.aRecord?.value || '76.76.21.21',
    verified_at: assignResult.verified ? new Date().toISOString() : null,
    raw: assignResult.rawData || null
  };

  // 5. Simpan challenge dan data verifikasi ke Supabase DB
  const updated = await updateApp(app.id, {
    custom_domain: cleanDomain,
    domain_status: assignResult.verified ? 'verified' : 'pending_verification',
    domain_verification: domainVerificationData
  });

  if (!updated) {
    return NextResponse.json(
      { error: 'Gagal menyimpan konfigurasi domain ke database' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    verified: assignResult.verified,
    app: updated,
    dnsRecords: {
      txtRecord: assignResult.txtRecord,
      aRecord: assignResult.aRecord
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
  const appId = searchParams.get('appId');
  const doVerify = searchParams.get('verify') === 'true';

  if (!domain && !appId) {
    return NextResponse.json({ error: 'domain atau appId parameter required' }, { status: 400 });
  }

  let targetApp = appId ? await getAppById(appId) : (domain ? await getAppByCustomDomain(domain) : null);
  const targetDomain = domain || targetApp?.custom_domain;

  if (!targetDomain) {
    return NextResponse.json({ error: 'Domain tidak ditemukan pada aplikasi ini' }, { status: 404 });
  }

  const vercel = new VercelClient();

  // TAHAP 2: Jika parameter verify=true, panggil endpoint POST .../verify Vercel
  if (doVerify) {
    const verifyResult = await vercel.verifyDomain(targetDomain);
    const newStatus = verifyResult.verified ? 'verified' : 'failed';

    let updatedApp = targetApp;
    if (targetApp) {
      const existingVerif = targetApp.domain_verification || {
        txt_name: '_vercel',
        txt_value: `vc-domain-verify=${targetDomain}`,
        a_name: '@',
        a_value: '76.76.21.21'
      };
      updatedApp = await updateApp(targetApp.id, {
        domain_status: newStatus,
        domain_verification: {
          ...existingVerif,
          verified_at: verifyResult.verified ? new Date().toISOString() : null
        }
      });
    }

    return NextResponse.json({
      success: true,
      verified: verifyResult.verified,
      status: newStatus,
      app: updatedApp,
      error: verifyResult.error
    });
  }

  // Status check biasa
  const statusResult = await vercel.checkDomainStatus(targetDomain);
  const currentStatus = statusResult.verified ? 'verified' : 'pending_verification';

  if (targetApp && targetApp.domain_status !== currentStatus) {
    targetApp = await updateApp(targetApp.id, {
      domain_status: currentStatus
    });
  }

  return NextResponse.json({
    domain: targetDomain,
    status: currentStatus,
    verified: statusResult.verified,
    verification: statusResult.verification,
    app: targetApp
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId } = await req.json().catch(() => ({}));
  if (!appId) {
    return NextResponse.json({ error: 'appId parameter is required' }, { status: 400 });
  }

  const app = await getAppById(appId);
  if (!app || (app.user_id !== user.userId && user.role !== 'admin' && user.username !== 'demo')) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan atau hak akses ditolak' }, { status: 404 });
  }

  // 1. Hapus dari Vercel Project Domains
  if (app.custom_domain) {
    const vercel = new VercelClient();
    await vercel.removeCustomDomain(app.custom_domain);
  }

  // 2. Bersihkan field custom domain di Supabase Postgres
  const updated = await updateApp(app.id, {
    custom_domain: null as any,
    domain_status: null as any,
    domain_verification: null as any
  });

  return NextResponse.json({
    success: true,
    message: 'Custom domain berhasil diputuskan dari aplikasi ini',
    app: updated
  });
}
