import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, getUserProfile } from '@/lib/supabase/db';
import { zipAppSource } from '@/lib/builder/zipper';
import { collectAllFiles } from '@/lib/agent/executor';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.userId);
  if (!profile?.is_pro) {
    return NextResponse.json(
      { error: 'Fitur Download Source hanya tersedia untuk pengguna Tier Pro' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const appId = searchParams.get('appId');
  if (!appId) {
    return NextResponse.json({ error: 'appId parameter required' }, { status: 400 });
  }

  const app = await getAppById(appId);
  if (!app || app.user_id !== user.userId) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  if (app.status !== 'published') {
    return NextResponse.json(
      { error: 'Fitur Download Source hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft)' },
      { status: 400 }
    );
  }

  const wsDir = app.session_id ? path.join(process.cwd(), 'workspaces', app.session_id) : '';
  const diskFiles = wsDir ? collectAllFiles(wsDir) : {};
  const filesToZip = { ...(app.files || {}), ...diskFiles };

  const zipBuffer = await zipAppSource(filesToZip);

  return new Response(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${app.slug}-source.zip"`
    }
  });
}
