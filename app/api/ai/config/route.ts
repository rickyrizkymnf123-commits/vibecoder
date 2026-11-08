import { NextRequest, NextResponse } from 'next/server';
import { getAiConfigAsync, saveAiConfigAsync } from '@/lib/ai/config';
import { requireAdminSession } from '@/lib/auth/admin-guard';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Akses ditolak. Pengaturan API khusus Administrator.' }, { status: auth.status });
  }

  const config = await getAiConfigAsync();
  const maskedKey = config.apiKey
    ? config.apiKey.length > 8
      ? `${config.apiKey.slice(0, 4)}••••••••${config.apiKey.slice(-4)}`
      : '••••••••'
    : '';

  return NextResponse.json({
    success: true,
    config: {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
      apiKeyMasked: maskedKey,
      hasKey: Boolean(config.apiKey),
      defaultModel: config.defaultModel,
      updatedAt: config.updatedAt
    }
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: 'Akses ditolak. Pengaturan API khusus Administrator.' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const updated = await saveAiConfigAsync({
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      defaultModel: body.defaultModel
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan AI berhasil disimpan!',
      config: {
        baseUrl: updated.baseUrl,
        apiKey: updated.apiKey,
        defaultModel: updated.defaultModel,
        hasKey: Boolean(updated.apiKey)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan pengaturan AI' }, { status: 500 });
  }
}
