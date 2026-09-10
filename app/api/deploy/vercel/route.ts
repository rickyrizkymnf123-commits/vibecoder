import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, updateApp, getUserProfile, deductAppCredit } from '@/lib/supabase/db';
import { VercelClient } from '@/lib/vercel/client';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { appId } = await req.json();
  if (!appId) {
    return NextResponse.json({ error: 'appId wajib diisi' }, { status: 400 });
  }

  const app = await getAppById(appId);
  if (!app || app.user_id !== user.userId) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  // Check App Credit balance
  const profile = await getUserProfile(user.userId);
  if (!profile || profile.app_credits < 1) {
    return NextResponse.json(
      { error: 'Kredit App Anda tidak mencukupi (0). Silakan top up untuk publish aplikasi.' },
      { status: 402 }
    );
  }

  const vercel = new VercelClient();
  const deployResult = await vercel.deploy(app.name, app.files, profile.subdomain);

  if (deployResult.readyState === 'READY') {
    // Deduct exactly 1 App Credit
    const deductRes = await deductAppCredit(user.userId, `publish_app_${app.slug}`);
    if (!deductRes.success) {
      return NextResponse.json({ error: 'Gagal memotong kredit app' }, { status: 402 });
    }

    const updated = await updateApp(app.id, {
      status: 'published',
      vercel_id: deployResult.id,
      vercel_url: deployResult.url,
      published_at: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      app: updated,
      publicUrl: deployResult.publicUrl,
      remainingCredits: deductRes.balance
    });
  }

  return NextResponse.json({
    success: true,
    readyState: deployResult.readyState,
    app
  });
}
