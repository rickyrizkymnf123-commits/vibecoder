import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [profilesRes, appsRes, paymentsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('id, status, is_approved, app_credits, ai_credits, is_pro'),
      supabaseAdmin.from('apps').select('id, status'),
      supabaseAdmin.from('payments').select('amount, status')
    ]);

    const profiles = profilesRes.data || [];
    const apps = appsRes.data || [];
    const payments = paymentsRes.data || [];

    const totalUsers = profiles.length;
    const pendingUsers = profiles.filter((p: any) => p.status === 'pending' || p.is_approved === false).length;
    const activeUsers = totalUsers - pendingUsers;
    const proUsers = profiles.filter((p: any) => p.is_pro).length;

    const totalApps = apps.length;
    const publishedApps = apps.filter((a: any) => a.status === 'published').length;

    const totalAppCredits = profiles.reduce((sum: number, p: any) => sum + (p.app_credits || 0), 0);
    const totalAiCredits = profiles.reduce((sum: number, p: any) => sum + (p.ai_credits || 0), 0);

    const totalRevenue = payments
      .filter((pay: any) => pay.status === 'settlement')
      .reduce((sum: number, pay: any) => sum + (pay.amount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        pendingUsers,
        activeUsers,
        proUsers,
        totalApps,
        publishedApps,
        totalAppCredits,
        totalAiCredits,
        totalRevenue
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memuat statistik' }, { status: 500 });
  }
}
