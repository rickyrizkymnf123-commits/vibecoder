import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { bulkExtendSubscriptions } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { userIds, days, mode, isFreeAccess, notes } = body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Daftar userIds wajib disertakan' }, { status: 400 });
    }

    const numDays = Number(days) || 30;
    const count = await bulkExtendSubscriptions(
      userIds,
      numDays,
      mode || 'smart',
      isFreeAccess,
      notes
    );

    return NextResponse.json({
      success: true,
      message: `Berhasil memperpanjang langganan untuk ${count} pengguna`,
      count
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal perpanjangan massal' }, { status: 500 });
  }
}
