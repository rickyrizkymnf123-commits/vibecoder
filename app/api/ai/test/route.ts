import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getAiConfig } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const prompt = body.prompt?.trim();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Pesan chat uji coba wajib diisi' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const savedConfig = getAiConfig();
    const baseUrl = (body.baseUrl || savedConfig.baseUrl || 'https://api.koboillm.com/v1').replace(/\/+$/, '');
    const apiKey = body.apiKey || savedConfig.apiKey;
    const model = body.model || savedConfig.defaultModel || 'gemini-2.5-flash';

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'API Key belum diisi. Masukkan API Key Anda pada kolom di atas terlebih dahulu.'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const completionsUrl = `${baseUrl}/chat/completions`;
    const startTime = Date.now();

    const response = await fetch(completionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: AbortSignal.timeout(30000),
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Anda adalah AI assistant. Jawab pertanyaan pengguna secara lugas, informatif, dan sebutkan model Anda jika ditanya.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = `Provider error (${response.status})`;
      try {
        const errJson = JSON.parse(errText);
        errorMsg = errJson.error?.message || errJson.message || errorMsg;
      } catch {
        errorMsg = errText.substring(0, 200) || errorMsg;
      }
      return new Response(JSON.stringify({ success: false, error: errorMsg, latencyMs }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '(Tidak ada respons teks dari model)';
    const actualModel = data.model || model;
    const usage = data.usage || null;

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        model: actualModel,
        latencyMs,
        usage
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.name === 'TimeoutError' ? 'Koneksi ke AI Provider timeout (30s)' : (err.message || 'Gagal menghubungi AI Provider')
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
