import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getUserProfile,
  deductAiCredit,
  deductAppCredit,
  createChatMessage,
  saveApp,
  updateChatSession
} from '@/lib/supabase/db';
import { runAgenticLoop } from '@/lib/agent/loop';
import { estimateTokens, calculateAiCreditCost } from '@/lib/ai/token-counter';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { sessionId, prompt } = await req.json();
  if (!sessionId || !prompt) {
    return new Response(JSON.stringify({ error: 'sessionId dan prompt wajib diisi' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const user = await getUserProfile(session.userId);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Pengguna tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Check AI credits
  if (user.ai_credits <= 0) {
    return new Response(
      JSON.stringify({
        error: 'Kredit AI Anda telah habis (0). Silakan lakukan top up di halaman Billing untuk melanjutkan pembuatan aplikasi.'
      }),
      { status: 402, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Save user's message
  await createChatMessage({
    session_id: sessionId,
    role: 'user',
    content: prompt,
    tool_calls: [],
    todo_list: []
  });

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();
  let isClosed = false;

  const safeClose = async () => {
    if (!isClosed) {
      isClosed = true;
      try {
        await writer.close();
      } catch {}
    }
  };

  const sendEvent = async (event: string, data: any) => {
    if (isClosed) return;
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      await writer.write(encoder.encode(payload));
    } catch {
      isClosed = true;
    }
  };

  // Run generation asynchronously and stream chunks
  (async () => {
    try {
      await updateChatSession(sessionId, { status: 'building' });

      const hasAppCredit = (user.app_credits || 0) > 0;

      const genResult = await runAgenticLoop({
        userPrompt: prompt,
        userId: user.id,
        userSubdomain: user.subdomain,
        sessionId,
        hasAppCredit,
        onEvent: async (ev) => {
          await sendEvent(ev.type, ev);
        }
      });

      if (genResult.needsClarification) {
        await createChatMessage({
          session_id: sessionId,
          role: 'assistant',
          content: genResult.clarificationMessage || '',
          tool_calls: [],
          todo_list: []
        });
        await updateChatSession(sessionId, { status: 'active' });
        await sendEvent('done', { status: 'clarification' });
        await safeClose();
        return;
      }

      // If app generated (draft or published)
      if (genResult.deployedApp) {
        // Save app to database
        await saveApp(genResult.deployedApp);

        if (genResult.deployedApp.status === 'published') {
          // Deduct 1 App Credit EXACTLY when publish succeeds
          await deductAppCredit(user.id, `publish_app_${genResult.deployedApp.slug}`);
          await updateChatSession(sessionId, {
            status: 'deployed',
            app_slug: genResult.deployedApp.slug
          });
        } else {
          // Saved as draft
          await updateChatSession(sessionId, {
            status: 'draft_ready',
            app_slug: genResult.deployedApp.slug
          });
        }
      }

      // Deduct AI credits based on tokens used
      const aiCost = genResult.totalTokensUsed || 3500;
      await deductAiCredit(user.id, aiCost, `chat_generation_${sessionId}`);

      // Save assistant message to chat history
      await createChatMessage({
        session_id: sessionId,
        role: 'assistant',
        content: `${genResult.planNarrative}\n\n${genResult.summaryMessage}`,
        tool_calls: genResult.toolCalls,
        todo_list: genResult.todoList
      });

      await sendEvent('done', {
        status: 'success',
        aiCreditsUsed: aiCost,
        app: genResult.deployedApp
      });
    } catch (err: any) {
      console.error('Generation pipeline error:', err);
      await sendEvent('error', { message: err.message || 'Terjadi kesalahan internal' });
      await updateChatSession(sessionId, { status: 'failed' });
    } finally {
      await safeClose();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
