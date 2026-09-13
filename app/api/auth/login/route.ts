import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmailOrUsername } from '@/lib/supabase/db';
import { verifyPassword } from '@/lib/auth/password';
import { signSession, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email dan password wajib diisi' }, { status: 400 });
    }

    const record = await getUserByEmailOrUsername(identifier);
    if (!record || !record.passwordHash) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    const isValid = verifyPassword(password, record.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 });
    }

    // Check account status & admin approval
    if (record.profile.status === 'pending' || record.profile.is_approved === false) {
      return NextResponse.json({
        error: 'Akun Anda masih menunggu persetujuan (ACC) dari Admin. Silakan hubungi admin untuk aktivasi akun.',
        pendingApproval: true
      }, { status: 403 });
    }

    if (record.profile.status === 'rejected' || record.profile.status === 'suspended') {
      return NextResponse.json({
        error: 'Akun Anda telah dinonaktifkan atau ditolak oleh Administrator.',
        suspended: true
      }, { status: 403 });
    }

    const sessionToken = signSession({
      userId: record.profile.id,
      email: record.profile.email,
      username: record.profile.username,
      subdomain: record.profile.subdomain,
      role: record.profile.role || (record.profile.username === 'demo' ? 'admin' : 'user')
    });

    const isSecure = process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:';
    const res = NextResponse.json({ success: true, user: record.profile });
    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal login' }, { status: 500 });
  }
}
