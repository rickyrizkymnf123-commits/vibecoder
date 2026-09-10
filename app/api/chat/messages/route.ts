import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getChatSessionById, getChatMessages } from '@/lib/supabase/db';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId parameter required' }, { status: 400 });
  }

  const session = await getChatSessionById(sessionId);
  if (!session || session.user_id !== user.userId) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan atau akses ditolak' }, { status: 404 });
  }

  const messages = await getChatMessages(sessionId);
  return NextResponse.json({ session, messages });
}
