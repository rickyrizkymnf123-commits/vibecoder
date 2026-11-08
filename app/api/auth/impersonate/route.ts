import { NextRequest, NextResponse } from 'next/server';
import { getRealAdminUser, signSession, IMPERSONATION_COOKIE_NAME } from '@/lib/auth/session';
import { getUserProfile } from '@/lib/supabase/db';

export async function POST(req: NextRequest) {
  try {
    const adminUser = await getRealAdminUser();
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya administrator yang dapat menggunakan Mode Intip.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { targetUserId, userId, exit } = body;

    const isSecure = process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:';

    // Handle Exit Impersonation
    if (exit === true || body.action === 'exit') {
      const res = NextResponse.json({
        success: true,
        message: 'Berhasil keluar dari Mode Intip dan kembali ke Mode Admin.'
      });
      res.cookies.set(IMPERSONATION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
        maxAge: 0
      });
      return res;
    }

    // Handle Start Impersonation
    const targetId = targetUserId || userId;
    if (!targetId) {
      return NextResponse.json({ error: 'Target user ID diperlukan.' }, { status: 400 });
    }

    const targetProfile = await getUserProfile(targetId);
    if (!targetProfile) {
      return NextResponse.json({ error: 'Pengguna target tidak ditemukan.' }, { status: 404 });
    }

    const impersonationToken = signSession(
      {
        userId: targetProfile.id,
        email: targetProfile.email,
        username: targetProfile.username,
        subdomain: targetProfile.subdomain || targetProfile.username,
        role: targetProfile.role || 'user',
        is_impersonating: true,
        original_admin_id: adminUser.userId,
        original_admin_email: adminUser.email,
        original_admin_username: adminUser.username
      },
      24 * 60 * 60 // 24 hours
    );

    const res = NextResponse.json({
      success: true,
      message: `Mode Intip aktif untuk @${targetProfile.username}`,
      user: {
        ...targetProfile,
        is_impersonating: true,
        original_admin: {
          id: adminUser.userId,
          email: adminUser.email,
          username: adminUser.username
        }
      }
    });

    res.cookies.set(IMPERSONATION_COOKIE_NAME, impersonationToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60
    });

    return res;
  } catch (err: any) {
    console.error('Error in impersonate route:', err);
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
