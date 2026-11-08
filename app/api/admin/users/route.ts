import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import {
  getAllUsers,
  createUserProfile,
  getUserProfile,
  getUserByEmailOrUsername,
  adminDeleteUser,
  adminBulkDeleteUsers,
  getUsersWithSubscriptions,
  updateUserProfile,
  upsertUserSubscription
} from '@/lib/supabase/db';
import { hashPassword } from '@/lib/auth/password';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const users = await getUsersWithSubscriptions();
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
    const { email, username, password, appCredits, aiCredits, role, isPro, package: pkg, phone_number, name } = body;

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

    let finalIsPaid = true;
    let finalIsPro = Boolean(isPro);
    let finalProUntil: string | null = isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;

    if (pkg === 'pro') {
      finalIsPaid = true;
      finalIsPro = true;
      finalProUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    } else if (pkg === 'basic') {
      finalIsPaid = true;
      finalIsPro = false;
      finalProUntil = null;
    } else if (pkg === 'free' || pkg === 'gratis') {
      finalIsPaid = false;
      finalIsPro = false;
      finalProUntil = null;
    }

    const newProfile = await createUserProfile(
      {
        id: userId,
        email: email.trim().toLowerCase(),
        username: cleanUsername,
        subdomain: cleanUsername,
        phone_number: phone_number || null,
        name: name || cleanUsername,
        app_credits: Number(appCredits) >= 0 ? Number(appCredits) : 1,
        ai_credits: Number(aiCredits) >= 0 ? Number(aiCredits) : 100000,
        is_pro: finalIsPro,
        is_paid: finalIsPaid,
        pro_until: finalProUntil,
        role: role === 'admin' ? 'admin' : (role === 'moderator' ? 'moderator' : 'user'),
        status: 'active',
        is_approved: true
      },
      passwordHash
    );

    // Create initial subscription for new user
    await upsertUserSubscription(userId, {
      subscription_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      is_free_access: role === 'admin' || finalIsPro,
      is_active: finalIsPaid,
      notes: `Initial registration by Admin (${pkg || (finalIsPro ? 'pro' : 'basic')})`
    });

    return NextResponse.json({
      success: true,
      message: 'User berhasil dibuat secara manual oleh Admin',
      user: newProfile
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal membuat user baru' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const {
      userId,
      role,
      is_approved,
      phone_number,
      name,
      notes,
      is_pro,
      is_paid,
      package: pkg,
      pro_until,
      app_credits,
      ai_credits
    } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId wajib disertakan' }, { status: 400 });
    }

    const updates: Record<string, any> = {};
    if (role !== undefined) updates.role = role;
    if (is_approved !== undefined) updates.is_approved = is_approved;
    if (phone_number !== undefined) updates.phone_number = phone_number;
    if (name !== undefined) updates.name = name;
    if (notes !== undefined) updates.notes = notes;
    if (is_pro !== undefined) updates.is_pro = is_pro;
    if (is_paid !== undefined) updates.is_paid = is_paid;
    if (pro_until !== undefined) updates.pro_until = pro_until;
    if (app_credits !== undefined) updates.app_credits = app_credits;
    if (ai_credits !== undefined) updates.ai_credits = ai_credits;

    if (pkg !== undefined) {
      if (pkg === 'pro') {
        updates.is_paid = true;
        updates.is_pro = true;
        updates.pro_until = pro_until || new Date(Date.now() + 365 * 86400000).toISOString();
        const u = await getUserProfile(userId);
        if (app_credits === undefined && u && u.app_credits < 1) {
          updates.app_credits = 1;
        }
        if (ai_credits === undefined && u && u.ai_credits < 100000) {
          updates.ai_credits = 100000;
        }
      } else if (pkg === 'basic') {
        updates.is_paid = true;
        updates.is_pro = false;
        updates.pro_until = null;
        const u = await getUserProfile(userId);
        if (app_credits === undefined && u && u.app_credits < 1) {
          updates.app_credits = 1;
        }
        if (ai_credits === undefined && u && u.ai_credits < 50000) {
          updates.ai_credits = 50000;
        }
      } else if (pkg === 'free' || pkg === 'gratis') {
        updates.is_paid = false;
        updates.is_pro = false;
        updates.pro_until = null;
      }
    }

    const updated = await updateUserProfile(userId, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Gagal memperbarui profil pengguna' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: pkg ? `Paket pengguna berhasil diubah menjadi ${pkg.toUpperCase()}` : 'Profil pengguna berhasil diperbarui',
      user: updated
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memperbarui user' }, { status: 500 });
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

