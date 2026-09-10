import { NextRequest, NextResponse } from 'next/server';
import { getAiConfig, saveAiConfig } from '@/lib/ai/config';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const config = getAiConfig();
  const maskedKey = config.apiKey
    ? config.apiKey.length > 8
      ? `${config.apiKey.slice(0, 4)}••••••••${config.apiKey.slice(-4)}`
      : '••••••••'
    : '';

  return NextResponse.json({
    success: true,
    config: {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey, // sent so user can edit or toggle eye
      apiKeyMasked: maskedKey,
      hasKey: Boolean(config.apiKey),
      defaultModel: config.defaultModel,
      updatedAt: config.updatedAt
    }
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updated = saveAiConfig({
      baseUrl: body.baseUrl,
      apiKey: body.apiKey,
      defaultModel: body.defaultModel
    });

    return NextResponse.json({
      success: true,
      message: 'Pengaturan AI berhasil disimpan!',
      config: {
        baseUrl: updated.baseUrl,
        defaultModel: updated.defaultModel,
        hasKey: Boolean(updated.apiKey)
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan pengaturan AI' }, { status: 500 });
  }
}
