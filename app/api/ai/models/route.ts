import { NextRequest, NextResponse } from 'next/server';
import { fetchModelsFromProvider, getAiConfig } from '@/lib/ai/config';
import { getCurrentUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const currentConfig = getAiConfig();
    const baseUrl = body.baseUrl || currentConfig.baseUrl;
    const apiKey = body.apiKey !== undefined ? body.apiKey : currentConfig.apiKey;

    if (!baseUrl) {
      return NextResponse.json({ error: 'Base URL wajib diisi' }, { status: 400 });
    }

    const models = await fetchModelsFromProvider(baseUrl, apiKey);
    return NextResponse.json({
      success: true,
      count: models.length,
      models
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || 'Gagal mengambil daftar model dari penyedia AI. Pastikan URL dan API Key valid.'
      },
      { status: 502 }
    );
  }
}
