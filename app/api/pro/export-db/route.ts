import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, getUserProfile } from '@/lib/supabase/db';
import { dumpAppDatabase } from '@/lib/builder/dumper';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.userId);
  if (!profile?.is_pro) {
    return NextResponse.json(
      { error: 'Fitur Export Database hanya tersedia untuk pengguna Tier Pro' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const appId = searchParams.get('appId');
  const format = (searchParams.get('format') || 'sql') as 'sql' | 'csv';

  if (!appId) {
    return NextResponse.json({ error: 'appId parameter required' }, { status: 400 });
  }

  const app = await getAppById(appId);
  if (!app || app.user_id !== user.userId) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  if (app.status !== 'published') {
    return NextResponse.json(
      { error: 'Fitur Export Database hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft)' },
      { status: 400 }
    );
  }

  const dumpContent = dumpAppDatabase(app, format);
  const contentType = format === 'csv' ? 'text/csv' : 'application/sql';
  const extension = format === 'csv' ? 'csv' : 'sql';

  return new Response(dumpContent, {
    status: 200,
    headers: {
      'Content-Type': `${contentType}; charset=utf-8`,
      'Content-Disposition': `attachment; filename="${app.slug}-database.${extension}"`
    }
  });
}
