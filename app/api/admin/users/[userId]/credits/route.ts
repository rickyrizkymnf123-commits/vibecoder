import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { adminSetUserCredits } from '@/lib/supabase/db';

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
    const body = await req.json();
    const { appCredits, aiCredits, reason } = body;

    if (appCredits === undefined || aiCredits === undefined) {
      return NextResponse.json({ error: 'appCredits dan aiCredits wajib diisi' }, { status: 400 });
    }

    const result = await adminSetUserCredits(
      userId,
      Number(appCredits),
      Number(aiCredits),
      reason || 'Penyesuaian Kredit Manual oleh Admin'
    );

    if (!result.success) {
      return NextResponse.json({ error: 'Gagal memperbarui kredit pengguna' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Kredit pengguna berhasil diperbarui',
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengubah kredit' }, { status: 500 });
  }
}
