import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { getMaintenanceState, saveMaintenanceState } from '@/lib/maintenance/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ success: true, maintenance: await getMaintenanceState() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Field "enabled" wajib true/false' }, { status: 400 });
    }
    const s = auth.session!;
    const maintenance = await saveMaintenanceState({
      enabled: body.enabled,
      message: typeof body.message === 'string' ? body.message : undefined,
      updatedBy: s.email || s.username,
      userId: s.userId
    });
    return NextResponse.json({ success: true, maintenance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan status maintenance' }, { status: 500 });
  }
}
