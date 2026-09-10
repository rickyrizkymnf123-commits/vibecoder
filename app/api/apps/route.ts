import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getApps, deleteApp } from '@/lib/supabase/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apps = await getApps(user.userId);
  return NextResponse.json({ apps });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const appId = searchParams.get('id');

  if (!appId) {
    return NextResponse.json({ error: 'Parameter id aplikasi wajib diisi' }, { status: 400 });
  }

  const success = await deleteApp(appId, user.userId);
  if (!success) {
    return NextResponse.json({ error: 'Gagal menghapus aplikasi atau aplikasi tidak ditemukan' }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Aplikasi berhasil dihapus' });
}
