import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { getAiConfigAsync, saveAiConfigAsync, fetchModelsFromProvider, parseAiResponseText } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const auth = await requireAdminSession();
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const config = await getAiConfigAsync();
    const maskedKey = config.apiKey
      ? `${config.apiKey.substring(0, 7)}...${config.apiKey.substring(Math.max(0, config.apiKey.length - 4))}`
      : '';

    return NextResponse.json({
      success: true,
      config: {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
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
    const { action, apiKey, baseUrl, defaultModel, prompt, model, testConnection } = body;

    const current = await getAiConfigAsync();
    const targetKey = (apiKey !== undefined && apiKey.trim() !== '' ? apiKey : current.apiKey || '').trim();
    const targetBaseUrl = (baseUrl || current.baseUrl || 'https://api.koboillm.com/v1').trim().replace(/\/+$/, '');
    const targetModel = (model || defaultModel || current.defaultModel || 'gemini-2.5-flash').trim();

    // 1. ACTION: FETCH MODELS
    if (action === 'fetch_models' || action === 'fetch') {
      if (!targetKey) {
        return NextResponse.json({ error: 'API Key wajib diisi untuk mengambil daftar model' }, { status: 400 });
      }

      const start = Date.now();
      try {
        const models = await fetchModelsFromProvider(targetBaseUrl, targetKey);
        const latencyMs = Date.now() - start;

        return NextResponse.json({
          success: true,
          count: models.length,
          models,
          latencyMs
        });
      } catch (err: any) {
        return NextResponse.json(
          {
            error: `Gagal mengambil model dari provider: ${err.message}`
          },
          { status: 502 }
        );
      }
    }

    // 2. ACTION: TEST AI CHAT / TEST CONNECTION
    if (action === 'test_ai' || action === 'test' || testConnection) {
      if (!targetKey) {
        return NextResponse.json({ error: 'API Key KoboiLLM belum diatur atau kosong' }, { status: 400 });
      }

      const testPrompt = prompt || 'Hai, perkenalkan dirimu sebagai Asisten AI Kilat Tools';
      const targetUrl = targetBaseUrl.endsWith('/chat/completions')
        ? targetBaseUrl
        : `${targetBaseUrl}/chat/completions`;

      const start = Date.now();

      try {
        const res = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${targetKey}`
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              {
                role: 'system',
                content: 'Anda adalah Asisten AI Kilat Tools yang ramah, profesional, dan siap membantu optimasi strategi pembuatan aplikasi web.'
              },
              {
                role: 'user',
                content: testPrompt
              }
            ],
            stream: false,
            max_tokens: 2000,
            temperature: 0.7
          }),
          signal: AbortSignal.timeout(30000)
        });

        const latencyMs = Date.now() - start;
        const rawText = await res.text().catch(() => '');

        if (!res.ok) {
          let parsedError = '';
          try {
            const errJson = JSON.parse(rawText);
            parsedError = errJson.error?.message || errJson.error || errJson.detail || '';
          } catch (_) {}

          return NextResponse.json(
            {
              success: false,
              latencyMs,
              error: `Provider API HTTP ${res.status}: ${parsedError || rawText.substring(0, 250) || 'Gagal melakukan inferensi AI'}`
            },
            { status: 400 }
          );
        }

        // Resilient parsing: handles JSON, SSE (data: {...}), text streams without crashing
        const { reply, rawData } = parseAiResponseText(rawText);
        const finalReply = reply || 'Respon berhasil diterima namun konten kosong.';

        return NextResponse.json({
          success: true,
          connected: true,
          latencyMs,
          message: 'Koneksi berhasil!',
          reply: finalReply,
          model: targetModel,
          raw: rawData || rawText.substring(0, 500)
        });
      } catch (testErr: any) {
        const latencyMs = Date.now() - start;
        return NextResponse.json(
          {
            success: false,
            connected: false,
            latencyMs,
            error: `Gagal mengirim prompt uji coba: ${testErr.message}`
          },
          { status: 400 }
        );
      }
    }

    // 3. ACTION: SAVE CONFIG
    const updates: Record<string, any> = {};
    if (apiKey !== undefined) updates.apiKey = apiKey.trim();
    if (baseUrl !== undefined) updates.baseUrl = baseUrl.trim();
    if (defaultModel !== undefined) updates.defaultModel = defaultModel.trim();

    const saved = await saveAiConfigAsync(updates);
    const maskedKey = saved.apiKey
      ? `${saved.apiKey.substring(0, 7)}...${saved.apiKey.substring(Math.max(0, saved.apiKey.length - 4))}`
      : '';

    return NextResponse.json({
      success: true,
      message: 'Pengaturan AI KoboiLLM berhasil disimpan!',
      config: {
        baseUrl: saved.baseUrl,
        apiKey: saved.apiKey,
        defaultModel: saved.defaultModel,
        hasApiKey: Boolean(saved.apiKey),
        maskedApiKey: maskedKey,
        updatedAt: saved.updatedAt
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Gagal memproses konfigurasi AI' }, { status: 500 });
  }
}
