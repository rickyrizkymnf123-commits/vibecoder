import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { updateChatSession } from '@/lib/supabase/db';
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
