import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserByEmailOrUsername, updateUserProfile } from '@/lib/supabase/db';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { oldPassword, newPassword } = await req.json();
  if (!oldPassword || !newPassword) {
    return NextResponse.json({ error: 'Password lama dan baru wajib diisi' }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'Password baru minimal 6 karakter' }, { status: 400 });
  }

  const record = await getUserByEmailOrUsername(user.username);
  if (!record || !record.passwordHash) {
    return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
  }

  const isOldValid = verifyPassword(oldPassword, record.passwordHash);
  if (!isOldValid) {
    return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
  }

  const newHash = hashPassword(newPassword);
  await updateUserProfile(user.userId, { passwordHash: newHash });

  return NextResponse.json({ success: true, message: 'Password berhasil diperbarui' });
}
