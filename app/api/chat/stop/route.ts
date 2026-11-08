import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { updateChatSession, getChatSessionById } from '@/lib/supabase/db';
import { abortSession } from '@/lib/agent/loop';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await req.json().catch(() => ({}));
  if (!sessionId) {
    return NextResponse.json({ error: 'sessionId wajib diisi' }, { status: 400 });
  }

  // Isolasi: hanya pemilik sesi (atau admin) yang boleh menghentikan build
  const owned = await getChatSessionById(sessionId);
  if (!owned || (owned.user_id !== session.userId && session.role !== 'admin')) {
    return NextResponse.json({ error: 'Sesi tidak ditemukan atau akses ditolak' }, { status: 404 });
  }

  // 1. Abort in-memory running agentic loop
  const wasRunning = abortSession(sessionId);

  // 2. Set database status to active so polling stops immediately
  await updateChatSession(sessionId, { status: 'active' });

  return NextResponse.json({
    success: true,
    wasRunning,
    message: 'Proses AI berhasil dihentikan seketika'
  });
}
