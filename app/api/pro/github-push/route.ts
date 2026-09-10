import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAppById, getUserProfile } from '@/lib/supabase/db';
import { pushToGitHub } from '@/lib/builder/github';

import path from 'node:path';
import { collectAllFiles } from '@/lib/agent/executor';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getUserProfile(user.userId);
  if (!profile?.is_pro) {
    return NextResponse.json(
      { error: 'Fitur Push ke GitHub hanya tersedia untuk pengguna Tier Pro' },
      { status: 403 }
    );
  }

  const { appId, repoUrl, githubPat, commitMessage, branch } = await req.json();
  const pat = githubPat || process.env.GITHUB_PAT;

  if (!appId || !repoUrl || !pat) {
    return NextResponse.json(
      { error: 'appId, repoUrl, dan githubPat (atau konfigurasi GITHUB_PAT di server) wajib diisi' },
      { status: 400 }
    );
  }

  const app = await getAppById(appId);
  if (!app || app.user_id !== user.userId) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  if (app.status !== 'published') {
    return NextResponse.json(
      { error: 'Fitur Push ke GitHub hanya dapat digunakan untuk aplikasi yang sudah dipublish (bukan draft)' },
      { status: 400 }
    );
  }

  const wsDir = app.session_id ? path.join(process.cwd(), 'workspaces', app.session_id) : '';
  const diskFiles = wsDir ? collectAllFiles(wsDir) : {};
  const filesToPush = { ...(app.files || {}), ...diskFiles };

  const pushResult = await pushToGitHub({
    repoUrl,
    githubPat: pat,
    files: filesToPush,
    commitMessage,
    branch
  });

  if (!pushResult.success) {
    return NextResponse.json({ error: pushResult.error || 'Gagal push ke GitHub' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    commitSha: pushResult.commitSha,
    commitUrl: pushResult.commitUrl
  });
}
