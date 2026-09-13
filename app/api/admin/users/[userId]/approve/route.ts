import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { adminApproveUser, adminRejectUser } from '@/lib/supabase/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { userId } = params;
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'approve';

    if (action === 'approve') {
      const ok = await adminApproveUser(userId);
      if (!ok) return NextResponse.json({ error: 'Gagal menyetujui user' }, { status: 400 });
      return NextResponse.json({ success: true, message: 'Akun user berhasil disetujui (di-ACC)' });
    } else if (action === 'reject') {
      const ok = await adminRejectUser(userId);
      if (!ok) return NextResponse.json({ error: 'Gagal menolak user' }, { status: 400 });
      return NextResponse.json({ success: true, message: 'Akun user berhasil ditolak' });
    } else {
      return NextResponse.json({ error: 'Action harus "approve" atau "reject"' }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memproses persetujuan' }, { status: 500 });
  }
}
