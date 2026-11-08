import { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/auth/admin-guard';
import { getAiConfig } from '@/lib/ai/config';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdminSession();
    if (!auth.authorized) {
      return new Response(JSON.stringify({ error: 'Akses ditolak. Fitur uji AI khusus Administrator.' }), {
        status: auth.status,
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
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const j = JSON.parse(errText);
        parsedErr = j.error?.message || j.error || j.message || errText;
      } catch {}

      return new Response(
        JSON.stringify({
          error: `Provider error (${response.status}): ${parsedErr}`,
          latencyMs
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '(Jawaban kosong dari model)';

    return new Response(
      JSON.stringify({
        success: true,
        reply,
        model: data.model || model,
        latencyMs,
        usage: data.usage
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: `Gagal menghubungi endpoint AI: ${err.message}`
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
