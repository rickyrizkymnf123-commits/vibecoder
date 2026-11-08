import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { deleteInvitation, updateInvitation } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const ok = await deleteInvitation(id);
    if (!ok) {
      return NextResponse.json({ error: 'Gagal menghapus undangan' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Undangan berhasil dihapus' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghapus undangan' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { email, role, notes } = body;

    const updated = await updateInvitation(id, {
      email: email ? email.trim().toLowerCase() : undefined,
      role,
      notes
    });

    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui undangan' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Undangan berhasil diperbarui',
      invitation: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui undangan' }, { status: 500 });
  }
}
