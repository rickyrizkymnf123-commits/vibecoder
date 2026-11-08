import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrUsername, createUserProfile } from '@/lib/supabase/db';
import { hashPassword } from '@/lib/auth/password';

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
        // Kredit diberikan otomatis saat admin meng-ACC akun (100.000 Kredit AI + 1 Slot App)
        app_credits: 0,
        ai_credits: 0,
        is_pro: false,
        pro_until: null,
        role: 'user',
        status: 'pending',
        is_approved: false,
        is_paid: false
      },
      passwordHash
    );

    // Akun baru menunggu ACC admin (setelah konfirmasi pembayaran via WhatsApp) — belum login otomatis.
    return NextResponse.json({
      success: true,
      pendingApproval: true,
      message: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin.',
      user: { id: newProfile.id, username: newProfile.username, email: newProfile.email }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mendaftar' }, { status: 500 });
  }
}
