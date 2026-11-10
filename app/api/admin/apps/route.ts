import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { adminListApps, adminDeleteApps } from '@/lib/supabase/db';
import { VercelClient } from '@/lib/vercel/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const apps = await adminListApps();
    return NextResponse.json({ success: true, apps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil daftar aplikasi' }, { status: 500 });
  }
}

/** Body: { appIds: string[] } — hapus satu atau banyak aplikasi sekaligus. */
export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const appIds: string[] = Array.isArray(body.appIds) ? body.appIds : [];
    if (appIds.length === 0) {
      return NextResponse.json({ error: 'Pilih minimal 1 aplikasi' }, { status: 400 });
    }

    const result = await adminDeleteApps(appIds);

    // Lepas custom domain dari project Vercel (best effort, tidak menggagalkan penghapusan)
    if (result.customDomains.length > 0) {
      const vercel = new VercelClient();
      await Promise.all(result.customDomains.map((d) => vercel.removeCustomDomain(d).catch(() => null)));
    }

    if (result.deletedCount === 0 && result.errors.length > 0) {
      return NextResponse.json({ error: result.errors.join('; '), ...result }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} aplikasi berhasil dihapus`,
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghapus aplikasi' }, { status: 500 });
  }
}
