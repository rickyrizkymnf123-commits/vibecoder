import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserProfile, getStorageFiles, addStorageFile, deleteStorageFile } from '@/lib/supabase/db';

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.userId);
  if (!profile?.is_pro) {
    return NextResponse.json(
      { error: 'Storage pribadi 10GB hanya aktif untuk pengguna Tier Pro' },
      { status: 403 }
    );
  }

  const files = await getStorageFiles(user.userId);
  const totalUsedBytes = files.reduce((sum, f) => sum + f.size, 0);

  return NextResponse.json({
    files,
    usage: {
      usedBytes: totalUsedBytes,
      limitBytes: STORAGE_LIMIT_BYTES,
      percentage: Math.min(100, Math.round((totalUsedBytes / STORAGE_LIMIT_BYTES) * 100))
    }
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.userId);
  if (!profile?.is_pro) {
    return NextResponse.json(
      { error: 'Storage pribadi 10GB hanya aktif untuk pengguna Tier Pro' },
      { status: 403 }
    );
  }

  const { name, size, mimeType, contentBase64 } = await req.json();

  if (!name || !size) {
    return NextResponse.json({ error: 'Nama dan ukuran berkas wajib ada' }, { status: 400 });
  }

  const files = await getStorageFiles(user.userId);
  const totalUsedBytes = files.reduce((sum, f) => sum + f.size, 0);

  if (totalUsedBytes + size > STORAGE_LIMIT_BYTES) {
    return NextResponse.json({ error: 'Kapasitas penyimpanan 10GB telah penuh' }, { status: 400 });
  }

  const newFile = await addStorageFile(user.userId, {
    name,
    size,
    mime_type: mimeType || 'application/octet-stream',
    url: `/api/pro/storage/download?id=${Date.now()}`
  });

  return NextResponse.json({ success: true, file: newFile });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { fileId } = await req.json();
  if (!fileId) {
    return NextResponse.json({ error: 'fileId wajib diisi' }, { status: 400 });
  }

  const ok = await deleteStorageFile(user.userId, fileId);
  return NextResponse.json({ success: ok });
}
