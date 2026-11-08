import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import {
  getUserSubscription,
  upsertUserSubscription,
  extendUserSubscription
} from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Parameter userId wajib disertakan' }, { status: 400 });
    }

    const subscription = await getUserSubscription(userId);
    return NextResponse.json({ success: true, subscription });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil data langganan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { userId, days, mode, subscription_end, is_free_access, is_active, notes } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId wajib disertakan' }, { status: 400 });
    }

    let result;
    if (days !== undefined && Number(days) !== 0) {
      result = await extendUserSubscription(
        userId,
        Number(days),
        mode || 'smart',
        is_free_access,
        notes
      );
    } else {
      result = await upsertUserSubscription(userId, {
        subscription_end,
        is_free_access,
        is_active,
        notes
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Status langganan pengguna berhasil diperbarui',
      subscription: result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui langganan' }, { status: 500 });
  }
}
