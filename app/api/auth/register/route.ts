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
    const subdomain = cleanUsername; // e.g. user.kilatstools.my.id

    const newProfile = await createUserProfile(
      {
        id: userId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        subdomain,
        app_credits: 0, // 0 until package is purchased
        ai_credits: 0, // 0 until package is purchased
        is_pro: false,
        pro_until: null,
        role: 'user',
        status: 'active',
        is_approved: true,
        is_paid: false
      },
      passwordHash
    );

    // Sign session cookie so user is logged in and lands immediately on package checkout / dashboard paywall
    const token = signSession({
      userId: newProfile.id,
      email: newProfile.email,
      username: newProfile.username,
      subdomain: newProfile.subdomain,
      role: newProfile.role || 'user'
    });

    const response = NextResponse.json({
      success: true,
      pendingApproval: false,
      message: 'Pendaftaran berhasil! Silakan pilih paket aktivasi untuk memulai.',
      user: newProfile
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mendaftar' }, { status: 500 });
  }
}
