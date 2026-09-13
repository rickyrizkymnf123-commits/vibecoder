import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { getAiConfig, saveAiConfig, fetchModelsFromProvider } from '@/lib/ai/config';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const config = getAiConfig();
    const maskedKey = config.apiKey
      ? `${config.apiKey.substring(0, 7)}...${config.apiKey.substring(Math.max(0, config.apiKey.length - 4))}`
      : '';

    return NextResponse.json({
      success: true,
      config: {
        baseUrl: config.baseUrl,
        defaultModel: config.defaultModel,
        hasApiKey: Boolean(config.apiKey),
        maskedApiKey: maskedKey,
        updatedAt: config.updatedAt
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal mengambil konfigurasi AI' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { apiKey, baseUrl, defaultModel, testConnection } = body;

    // Test connection mode
    if (testConnection) {
      const current = getAiConfig();
      const testKey = apiKey !== undefined && apiKey !== '' ? apiKey : current.apiKey;
      const testUrl = (baseUrl || current.baseUrl || 'https://api.koboillm.com/v1').trim();

      if (!testKey) {
        return NextResponse.json({
          error: 'API Key KoboiLLM belum diatur atau kosong',
          connected: false
        }, { status: 400 });
      }

      const start = Date.now();
      try {
        const models = await fetchModelsFromProvider(testUrl, testKey);
        const latencyMs = Date.now() - start;

        return NextResponse.json({
          success: true,
          connected: true,
          latencyMs,
          message: `Koneksi berhasil! Terhubung ke KoboiLLM (${latencyMs}ms)`,
          modelsCount: models.length,
          models: models.slice(0, 15) // Top models
        });
      } catch (testErr: any) {
        const latencyMs = Date.now() - start;
        return NextResponse.json({
          success: false,
          connected: false,
          latencyMs,
          error: `Gagal terhubung ke provider: ${testErr.message}`
        }, { status: 400 });
      }
    }

    // Save mode
    const updates: Record<string, any> = {};
    if (apiKey !== undefined && apiKey.trim() !== '') updates.apiKey = apiKey.trim();
    if (baseUrl !== undefined) updates.baseUrl = baseUrl.trim();
    if (defaultModel !== undefined) updates.defaultModel = defaultModel.trim();

    const saved = saveAiConfig(updates);
    const maskedKey = saved.apiKey
      ? `${saved.apiKey.substring(0, 7)}...${saved.apiKey.substring(Math.max(0, saved.apiKey.length - 4))}`
      : '';

    return NextResponse.json({
      success: true,
      message: 'Konfigurasi AI KoboiLLM berhasil disimpan',
      config: {
        baseUrl: saved.baseUrl,
        defaultModel: saved.defaultModel,
        hasApiKey: Boolean(saved.apiKey),
        maskedApiKey: maskedKey,
        updatedAt: saved.updatedAt
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal menyimpan konfigurasi AI' }, { status: 500 });
  }
}
