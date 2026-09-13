import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import {
  getAllUsers,
  createUserProfile,
  getUserByEmailOrUsername,
  adminDeleteUser,
  adminBulkDeleteUsers
} from '@/lib/supabase/db';
import { hashPassword } from '@/lib/auth/password';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil daftar pengguna' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { email, username, password, appCredits, aiCredits, role, isPro } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Email, username, dan password wajib diisi' }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanUsername.length < 3) {
      return NextResponse.json({ error: 'Username minimal 3 karakter' }, { status: 400 });
    }

    const existing = await getUserByEmailOrUsername(cleanUsername);
    if (existing) {
      return NextResponse.json({ error: 'Username atau email sudah terdaftar' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newProfile = await createUserProfile(
      {
        id: userId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        subdomain: cleanUsername,
        app_credits: Number(appCredits) >= 0 ? Number(appCredits) : 1,
        ai_credits: Number(aiCredits) >= 0 ? Number(aiCredits) : 100000,
        is_pro: Boolean(isPro),
        pro_until: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null,
        role: role === 'admin' ? 'admin' : 'user',
        status: 'active',
        is_approved: true
      },
      passwordHash
    );

    return NextResponse.json({
      success: true,
      message: 'User berhasil dibuat secara manual oleh Admin',
      user: newProfile
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membuat user baru' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(req.url);
    const singleId = searchParams.get('id');

    if (singleId) {
      const ok = await adminDeleteUser(singleId);
      if (!ok) {
        return NextResponse.json({ error: 'Gagal menghapus user atau akun dilindungi' }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: 'User berhasil dihapus' });
    }

    // Bulk delete via JSON body
    const body = await req.json().catch(() => ({}));
    const userIds = Array.isArray(body.userIds) ? body.userIds : [];

    if (userIds.length === 0) {
      return NextResponse.json({ error: 'Daftar ID user tidak boleh kosong' }, { status: 400 });
    }

    const result = await adminBulkDeleteUsers(userIds);
    return NextResponse.json({
      success: true,
      message: `${result.deletedCount} user berhasil dihapus massal`,
      ...result
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menghapus user' }, { status: 500 });
  }
}
