import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { getAllInvitations, createInvitation } from '@/lib/supabase/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const invitations = await getAllInvitations();
    return NextResponse.json({ success: true, invitations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil daftar undangan' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { email, role, notes } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }

    const invitation = await createInvitation(
      email.trim().toLowerCase(),
      role === 'admin' ? 'admin' : (role === 'moderator' ? 'moderator' : 'user'),
      notes
    );

    return NextResponse.json({
      success: true,
      message: 'Undangan pra-persetujuan email berhasil dibuat',
      invitation
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membuat undangan' }, { status: 500 });
  }
}
