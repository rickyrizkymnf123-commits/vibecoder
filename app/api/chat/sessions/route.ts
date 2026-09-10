import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getChatSessions, createChatSession, deleteChatSession, deleteAllChatSessions } from '@/lib/supabase/db';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessions = await getChatSessions(session.userId);
  return NextResponse.json({ sessions });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { title, appSlug } = await req.json().catch(() => ({}));
  const sessionTitle = title || `Aplikasi Baru ${new Date().toLocaleDateString('id-ID')}`;

  const newSession = await createChatSession(user.userId, sessionTitle, appSlug);
  return NextResponse.json({ session: newSession });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const idFromQuery = searchParams.get('id');
  let idFromBody: string | undefined;
  let allParam = searchParams.get('all');

  if (!idFromQuery && !allParam) {
    try {
      const body = await req.json();
      idFromBody = body.id;
      if (body.all) allParam = 'true';
    } catch {
      // Body may be empty
    }
  }

  const targetId = idFromQuery || idFromBody;

  if (targetId) {
    const success = await deleteChatSession(targetId, user.userId);
    if (!success) {
      return NextResponse.json({ error: 'Sesi tidak ditemukan atau gagal dihapus' }, { status: 404 });
    }
    return NextResponse.json({ success: true, deletedId: targetId });
  }

  // If no specific id provided or all=true, wipe all sessions for user
  const count = await deleteAllChatSessions(user.userId);
  return NextResponse.json({ success: true, count });
}
