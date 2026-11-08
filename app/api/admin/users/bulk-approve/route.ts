import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { updateUserProfile } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { userIds, is_approved } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Daftar userIds tidak boleh kosong' }, { status: 400 });
    }

    let count = 0;
    for (const uid of userIds) {
      try {
        await updateUserProfile(uid, { is_approved: is_approved !== false });
        count++;
      } catch (e) {
        console.error(`Failed to update approval for ${uid}:`, e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Status persetujuan ${count} pengguna berhasil diubah`,
      count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengubah persetujuan massal' }, { status: 500 });
  }
}
