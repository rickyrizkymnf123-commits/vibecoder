import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import {
  getUserProfile,
  deductAiCredit,
  deductAppCredit,
  createChatMessage,
  saveApp,
  updateChatSession,
  getChatSessionById,
  getChatMessages,
  getAppBySlug
} from '@/lib/supabase/db';
import { runAgenticLoop, getActiveSessionState, subscribeToSession } from '@/lib/agent/loop';
import { estimateTokens, calculateAiCreditCost } from '@/lib/ai/token-counter';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (!sessionId) {
    return new Response(JSON.stringify({ error: 'sessionId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Isolasi: hanya pemilik sesi (atau admin) yang boleh melihat progres build
  const ownedSession = await getChatSessionById(sessionId);
  if (!ownedSession || (ownedSession.user_id !== session.userId && session.role !== 'admin')) {
    return new Response(JSON.stringify({ error: 'Sesi tidak ditemukan atau akses ditolak' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const activeState = getActiveSessionState(sessionId);
  if (!activeState || activeState.status !== 'building') {
    // If DB session was marked 'building' but no live worker in RAM exists (e.g. cold start/refresh after completion), sync DB status
    try {
      const chatSession = await getChatSessionById(sessionId);
      if (chatSession && chatSession.status === 'building') {
        const app = await getAppBySlug(sessionId);
        if (app) {
          await updateChatSession(sessionId, {
            status: app.status === 'published' ? 'deployed' : 'draft_ready',
            app_slug: app.slug
          });
        } else {
          await updateChatSession(sessionId, { status: 'active' });
        }
      }
    } catch {}

    return new Response(JSON.stringify({ active: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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

  // 1. Replay historical events to immediately catch up state on client!
  for (const hist of activeState.eventHistory) {
    await sendEvent(hist.type, hist.data);
  }

  // 2. Subscribe to subsequent live events
  const { unsubscribe } = subscribeToSession(sessionId, async (event, data) => {
    await sendEvent(event, data);
    if (event === 'complete' || event === 'done' || event === 'error') {
      await safeClose();
    }
  });

  req.signal.addEventListener('abort', () => {
    unsubscribe();
    safeClose();
  });

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}

export async function POST(req: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const { sessionId, prompt, attachments } = await req.json();
  if (!sessionId || (!prompt && (!attachments || attachments.length === 0))) {
    return new Response(JSON.stringify({ error: 'sessionId dan prompt/attachments wajib diisi' }), {
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

  // Isolasi: sesi chat (dan aplikasi/workspace-nya) hanya boleh dipakai pemiliknya.
  // Tanpa ini, siapa pun yang tahu sessionId (= slug app publik) bisa menimpa aplikasi orang lain.
  const ownedSession = await getChatSessionById(sessionId);
  if (!ownedSession || ownedSession.user_id !== user.id) {
    return new Response(JSON.stringify({ error: 'Sesi tidak ditemukan atau akses ditolak' }), {
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

  // Load prior messages before saving current one for historical context memory
  const previousMessages = await getChatMessages(sessionId);

  // Format saved user message
  let savedUserPrompt = prompt || '';
  if (attachments && attachments.length > 0) {
    const attNames = attachments.map((a: any) => `📎 [${a.name}]`).join(' ');
    savedUserPrompt = savedUserPrompt ? `${savedUserPrompt}\n\n${attNames}` : attNames;
  }

  // Save user's message
  await createChatMessage({
    session_id: sessionId,
    role: 'user',
    content: savedUserPrompt,
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

      const chatSession = await getChatSessionById(sessionId);
      const wasAlreadyDeployed = Boolean(chatSession?.app_slug || chatSession?.status === 'deployed');
      const hasAppCredit = wasAlreadyDeployed ? true : (user.app_credits || 0) > 0;

      const genResult = await runAgenticLoop({
        userPrompt: prompt || '',
        userId: user.id,
        userSubdomain: user.subdomain,
        sessionId,
        hasAppCredit,
        attachments,
        historyMessages: previousMessages,
        onEvent: async (ev) => {
          await sendEvent(ev.type, ev);
        }
      });

      if (genResult.needsClarification || genResult.isDiscussion) {
        const responseContent = genResult.clarificationMessage || genResult.summaryMessage || '';
        await createChatMessage({
          session_id: sessionId,
          role: 'assistant',
          content: responseContent,
          tool_calls: [],
          todo_list: []
        });
        await updateChatSession(sessionId, { status: 'active' });
        await sendEvent('done', {
          status: genResult.needsClarification ? 'clarification' : 'discussion',
          content: responseContent
        });
        await safeClose();
        return;
      }

      // If app generated (draft or published)
      if (genResult.deployedApp) {
        // Save app to database
        await saveApp(genResult.deployedApp);

        if (genResult.deployedApp.status === 'published') {
          // Deduct 1 App Credit ONLY when publishing a brand new app for the first time
          if (!wasAlreadyDeployed) {
            await deductAppCredit(user.id, `publish_app_${genResult.deployedApp.slug}`);
          }
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

      // Save assistant message to chat history with clear generation mode marker
      let finalContent = `${genResult.planNarrative}\n\n${genResult.summaryMessage}`;
      if (genResult.generationMode === 'fallback-template') {
        finalContent = `<!-- GENERATION_MODE: fallback-template -->\n> ⚠️ **Peringatan Mode Cadangan (Fallback Template)**: Sambungan ke Live AI mengalami kendala (${genResult.fallbackReason || 'Quota limit / High Demand'}). Aplikasi ini disiapkan menggunakan template cadangan agar tetap dapat diuji.\n\n${finalContent}`;
      } else {
        finalContent = `<!-- GENERATION_MODE: live-ai -->\n${finalContent}`;
      }

      await createChatMessage({
        session_id: sessionId,
        role: 'assistant',
        content: finalContent,
        tool_calls: genResult.toolCalls,
        todo_list: genResult.todoList
      });

      await sendEvent('done', {
        status: 'success',
        generationMode: genResult.generationMode,
        fallbackReason: genResult.fallbackReason,
        aiCreditsUsed: aiCost,
        app: genResult.deployedApp
      });
    } catch (err: any) {
      console.error('Generation pipeline error:', err);
      const isAborted = req.signal.aborted || err.message === 'BUILD_ABORTED_BY_USER' || err.name === 'AbortError';
      if (isAborted) {
        await sendEvent('error', { message: 'Proses dibatalkan oleh pengguna.' });
      } else {
        await sendEvent('error', { message: err.message || 'Terjadi kesalahan internal' });
      }
      await updateChatSession(sessionId, { status: isAborted ? 'active' : 'failed' });
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
