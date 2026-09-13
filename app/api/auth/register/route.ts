import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrUsername, createUserProfile } from '@/lib/supabase/db';
import { hashPassword } from '@/lib/auth/password';
import { signSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, dan password wajib diisi' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username minimal 3 karakter alfanumerik' }, { status: 400 });
    }

    // Check if email or username already taken
    const existing = await getUserByEmailOrUsername(cleanUsername);
    if (existing) {
      return NextResponse.json({ error: 'Username atau email sudah digunakan' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const subdomain = cleanUsername; // e.g. user.forge.dev

    const newProfile = await createUserProfile(
      {
        id: userId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        subdomain,
        app_credits: 1, // 1 App publish credit slot
        ai_credits: 100000, // 100.000 Kredit AI
        is_pro: false,
        pro_until: null,
        role: 'user',
        status: 'pending',
        is_approved: false
      },
      passwordHash
    );

    return NextResponse.json({
      success: true,
      pendingApproval: true,
      message: 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan (ACC) dari Admin sebelum dapat digunakan.',
      user: newProfile
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mendaftar' }, { status: 500 });
  }
}
