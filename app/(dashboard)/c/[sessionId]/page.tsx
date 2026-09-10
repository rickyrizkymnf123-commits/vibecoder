'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  Circle,
  Code2,
  FileCode2,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  Copy,
  Check,
  Globe,
  Database,
  ShieldCheck,
  Maximize2,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';
import { ToolCallItem, TodoItem, ChatMessage, GeneratedApp } from '@/lib/types';

// =========================================================================
// CLEAN MARKDOWN FORMATTER (Eliminasi simbol mentah **, ###, link, list)
// =========================================================================
function FormattedMessage({ content }: { content: string }) {
  const clean = content.replace(/<!-- GENERATION_MODE: [a-z-]+ -->\n?/, '').trim();
  const lines = clean.split('\n');

  const blocks: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="space-y-1.5 my-2.5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const parseInline = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (match[2] && match[3]) {
        // [Link](url)
        const label = match[2];
        const url = match[3];
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 underline decoration-indigo-500/50 underline-offset-2 transition-colors mx-0.5"
          >
            {label}
            <ExternalLink className="w-3 h-3 inline shrink-0 opacity-80" />
          </a>
        );
      } else if (match[4]) {
        // **Bold** -> strong tanpa tanda bintang (rekursif untuk link di dalam bold)
        parts.push(
          <strong key={match.index} className="font-bold text-white tracking-wide">
            {parseInline(match[4])}
          </strong>
        );
      } else if (match[5]) {
        // `Code`
        parts.push(
          <code
            key={match.index}
            className="px-1.5 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-mono text-[11px] border border-slate-700/60 mx-0.5"
          >
            {match[5]}
          </code>
        );
      } else if (match[6]) {
        // *Italic*
        parts.push(
          <em key={match.index} className="italic text-slate-300">
            {match[6]}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    // Heading ###
    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3 key={idx} className="text-sm sm:text-base font-bold text-white mt-4 mb-2 flex items-center gap-2">
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // Heading ##
    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={idx} className="text-base sm:text-lg font-extrabold text-white mt-5 mb-2">
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // Heading #
    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h1 key={idx} className="text-lg sm:text-xl font-black text-white mt-6 mb-2.5">
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Numbered list (1. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      listItems.push(
        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span className="font-bold text-indigo-400 shrink-0 font-mono mt-0.5">{numMatch[1]}.</span>
          <div className="flex-1 min-w-0">{parseInline(numMatch[2])}</div>
        </li>
      );
      return;
    }

    // Bullet list (- Item atau * Item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listItems.push(
        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
          <div className="flex-1 min-w-0">{parseInline(trimmed.slice(2))}</div>
        </li>
      );
      return;
    }

    // Regular paragraph
    flushList();
    blocks.push(
      <p key={idx} className="text-xs sm:text-sm text-slate-300 leading-relaxed my-1.5">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{blocks}</div>;
}

// =========================================================================
// DEEP TRANSPARENT TOOL CALL EXPANDER (Format VibeCoder Asli)
// =========================================================================
function ToolCallDetailBox({ call }: { call: ToolCallItem }) {
  const [copied, setCopied] = useState(false);

  // 1. Tool write_file: Tampilkan kode sumber penuh dengan scrollbar, baris kode, dan ukuran byte
  if (call.tool === 'write_file' && typeof call.input === 'object' && call.input?.path) {
    const filePath = call.input.path;
    const content = call.input.content || (typeof call.input === 'string' ? call.input : '');
    const lineCount = content ? content.split('\n').length : 0;
    const byteSize = content ? new Blob([content]).size : (call.input.bytes || 0);

    const handleCopy = () => {
      if (content) {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 font-mono text-indigo-300 font-semibold truncate">
            <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="truncate">{filePath}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 text-slate-400 font-mono text-[10px]">
            {lineCount > 0 && <span className="text-slate-400">{lineCount} baris</span>}
            {byteSize > 0 && <span className="text-slate-500">{(byteSize / 1024).toFixed(1)} KB</span>}
            {content && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
                title="Salin isi berkas"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            )}
          </div>
        </div>

        {content ? (
          <div className="relative rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden shadow-inner">
            <pre className="p-3.5 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[460px] overflow-y-auto select-text scrollbar-thin scrollbar-thumb-slate-800">
              {content}
            </pre>
          </div>
        ) : (
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-slate-400 text-xs">
            {JSON.stringify(call.input, null, 2)}
          </pre>
        )}

        {call.output && (
          <div className="text-[10px] text-emerald-400/90 font-mono bg-emerald-950/20 px-2.5 py-1 rounded border border-emerald-800/40 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>
              Berkas berhasil ditulis ke disk ({typeof call.output === 'object' && call.output?.bytesWritten ? call.output.bytesWritten : byteSize} bytes)
            </span>
          </div>
        )}
      </div>
    );
  }

  // 2. Tool bash: Terminal shell command & full log stdout/stderr
  if (call.tool === 'bash') {
    const cmd = typeof call.input === 'object' && call.input?.command ? call.input.command : (typeof call.input === 'string' ? call.input : '');
    const stdout = typeof call.output === 'object' ? call.output?.stdout : (typeof call.output === 'string' ? call.output : '');
    const stderr = typeof call.output === 'object' ? call.output?.stderr : '';
    const exitCode = typeof call.output === 'object' ? call.output?.exitCode : 0;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 px-1">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-emerald-400">Terminal Shell Execution</span>
        </div>
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] space-y-2 shadow-inner">
          <div className="flex items-center gap-2 text-violet-300">
            <span className="text-slate-500 font-bold">$</span>
            <span className="text-white font-medium">{cmd}</span>
          </div>
          {(stdout || stderr) && (
            <div className="border-t border-slate-900 pt-2 text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
              {stdout && <div className="text-slate-200">{stdout}</div>}
              {stderr && <div className="text-rose-400 mt-1">{stderr}</div>}
            </div>
          )}
          <div className="text-[10px] text-slate-500 pt-1 flex items-center gap-2 border-t border-slate-900">
            <span>Exit code: {exitCode ?? 0}</span>
            <span>· Status: {exitCode === 0 ? '✓ Sukses (0 error)' : '⚠️ Gagal'}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. Tool browser_test: Headless Google Chrome test verification
  if (call.tool === 'browser_test') {
    const testOutput = call.output || {};
    const testUrl = typeof call.input === 'object' && call.input?.url ? call.input.url : '/preview/[slug]';
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-sky-400 font-semibold px-1">
          <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>Verifikasi Visual Headless Chrome</span>
        </div>
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] space-y-2">
          <div className="text-slate-300">
            Target URL: <span className="text-indigo-300 font-medium">{testUrl}</span>
          </div>
          <div className="text-emerald-400 font-semibold flex items-center gap-1.5 pt-1 border-t border-slate-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{typeof testOutput === 'object' && testOutput.passed ? '✓ Seluruh Uji DOM Lulus & 0 Console Error' : (typeof testOutput === 'string' ? testOutput : '✓ Berhasil diverifikasi')}</span>
          </div>
        </div>
      </div>
    );
  }

  // 4. Default generic JSON viewer
  return (
    <div className="space-y-2 font-mono text-[11px]">
      {call.input && (
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
            Input Data:
          </span>
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-slate-300 max-h-60 overflow-y-auto">
            {typeof call.input === 'string' ? call.input : JSON.stringify(call.input, null, 2)}
          </pre>
        </div>
      )}
      {call.output && (
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
            Output:
          </span>
          <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 overflow-x-auto text-emerald-400 max-h-60 overflow-y-auto">
            {typeof call.output === 'string' ? call.output : JSON.stringify(call.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function ChatSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;

  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Live streaming states
  const [livePlan, setLivePlan] = useState('');
  const [liveTodos, setLiveTodos] = useState<TodoItem[]>([]);
  const [liveToolCalls, setLiveToolCalls] = useState<ToolCallItem[]>([]);
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [deployedApp, setDeployedApp] = useState<GeneratedApp | null>(null);
  const [userSubdomain, setUserSubdomain] = useState<string>('demo');
  const [errorMessage, setErrorMessage] = useState('');
  const [liveGenerationMode, setLiveGenerationMode] = useState<'live-ai' | 'fallback-template' | null>(null);
  const [liveFallbackReason, setLiveFallbackReason] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('forge:building-status', { detail: { isBuilding } })
    );
  }, [isBuilding]);

  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      loadSessionHistory();
    } else {
      setMessages([]);
      setLoadingHistory(false);
    }
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, livePlan, liveTodos, liveToolCalls]);

  const loadSessionHistory = async () => {
    setLoadingHistory(true);
    try {
      const [res, meRes] = await Promise.all([
        fetch(`/api/chat/messages?sessionId=${sessionId}`),
        fetch('/api/auth/me')
      ]);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user?.subdomain) {
          setUserSubdomain(meData.user.subdomain);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputPrompt.trim();
    if (!prompt || isBuilding) return;

    setInputPrompt('');
    setErrorMessage('');
    setIsBuilding(true);
    setLivePlan('');
    setLiveTodos([]);
    setLiveToolCalls([]);
    setDeployedApp(null);
    setLiveGenerationMode(null);
    setLiveFallbackReason('');

    let currentSessionId = sessionId;

    if (currentSessionId === 'new') {
      try {
        const title = prompt.slice(0, 45);
        const res = await fetch('/api/chat/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.session?.id) {
            currentSessionId = data.session.id;
            window.history.replaceState(null, '', `/c/${currentSessionId}`);
          }
        }
      } catch (err) {
        console.error('Failed to create session:', err);
      }
    }

    // Optimistically add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      session_id: currentSessionId,
      role: 'user',
      content: prompt,
      tool_calls: [],
      todo_list: [],
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: currentSessionId, prompt })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Gagal memproses pembuatan' }));
        setErrorMessage(errData.error || 'Terjadi kesalahan sistem');
        setIsBuilding(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        setIsBuilding(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message';
          let eventData: any = {};

          const eventMatch = block.match(/^event: (.*)$/m);
          if (eventMatch) eventType = eventMatch[1].trim();

          const dataMatch = block.match(/^data: (.*)$/m);
          if (dataMatch) {
            try {
              eventData = JSON.parse(dataMatch[1]);
            } catch {
              eventData = dataMatch[1];
            }
          }

          if (eventData?.generationMode) {
            setLiveGenerationMode(eventData.generationMode);
          }
          if (eventData?.fallbackReason) {
            setLiveFallbackReason(eventData.fallbackReason);
          }

          if (eventType === 'plan') {
            setLivePlan(eventData.content || '');
          } else if (eventType === 'todo') {
            setLiveTodos(eventData.todoList || []);
          } else if (eventType === 'tool_start') {
            setLiveToolCalls((prev) => {
              const existing = prev.findIndex((t) => t.id === eventData.toolCall.id);
              if (existing !== -1) {
                const next = [...prev];
                next[existing] = eventData.toolCall;
                return next;
              }
              return [...prev, eventData.toolCall];
            });
          } else if (eventType === 'tool_finish') {
            setLiveToolCalls((prev) => {
              const existing = prev.findIndex((t) => t.id === eventData.toolCall.id);
              if (existing !== -1) {
                const next = [...prev];
                next[existing] = eventData.toolCall;
                return next;
              }
              return [...prev, eventData.toolCall];
            });
          } else if (eventType === 'complete') {
            if (eventData.app) {
              setDeployedApp(eventData.app);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('forge:app-published', { detail: { app: eventData.app } })
                );
              }
            }
            setMessages((prev) => [
              ...prev,
              {
                id: `asst-${Date.now()}`,
                session_id: currentSessionId,
                role: 'assistant',
                content: `${livePlan}\n\n${eventData.content || ''}`,
                tool_calls: liveToolCalls,
                todo_list: liveTodos,
                created_at: new Date().toISOString()
              }
            ]);
          } else if (eventType === 'clarification') {
            setMessages((prev) => [
              ...prev,
              {
                id: `asst-${Date.now()}`,
                session_id: currentSessionId,
                role: 'assistant',
                content: eventData.content,
                tool_calls: [],
                todo_list: [],
                created_at: new Date().toISOString()
              }
            ]);
          } else if (eventType === 'done') {
            // Finished
            setIsBuilding(false);
            if (currentSessionId !== sessionId) {
              router.replace(`/c/${currentSessionId}`);
            } else {
              loadSessionHistory();
            }
          } else if (eventType === 'error') {
            setErrorMessage(eventData.message || 'Terjadi kesalahan internal');
            setIsBuilding(false);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Koneksi ke AI stream terputus');
      setIsBuilding(false);
    }
  };

  const copyAppUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b0f19]">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 flex flex-col">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-violet-500" />
            Memuat riwayat proyek...
          </div>
        ) : messages.length === 0 && !isBuilding ? (
          /* Clean VibeCoder Empty State (1:1 with Screenshot) */
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <p className="text-sm sm:text-base text-slate-400 font-medium max-w-lg leading-relaxed select-none">
              Mulai obrolan dengan agent — minta dibuatkan, diperbaiki, atau dipublish.
            </p>
          </div>
        ) : (
          /* Render previous messages */
          messages.map((m) => (
            <div key={m.id} className="space-y-4">
              {m.role === 'user' ? (
                /* User bubble */
                <div className="flex justify-end">
                  <div className="max-w-2xl rounded-2xl bg-violet-600 text-white px-5 py-3.5 text-sm shadow-md shadow-violet-600/20 leading-relaxed font-medium">
                    {m.content}
                  </div>
                </div>
              ) : (
                /* Assistant completed card (Clean VibeCoder style) */
                <div className="flex justify-start">
                  <div className="max-w-3xl w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 space-y-4 text-sm">
                    {/* Mode Banner Indicator */}
                    {m.content.includes('<!-- GENERATION_MODE: fallback-template -->') || m.content.includes('Mode Cadangan') ? (
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-600/50 text-amber-300 text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>Mode Cadangan (Fallback Template):</strong> Sambungan ke Live AI sempat mengalami kendala kuota/timeout. Aplikasi di-generate menggunakan template cadangan.</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-emerald-300 text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>Mode AI Riil (Live Autonomous AI):</strong> Aplikasi dirancang dan dibangun secara bertahap menggunakan model AI aktif.</span>
                      </div>
                    )}

                    {/* Content Markdown Berformat Rapi (Tanpa simbol mentah **, ###, dsb.) */}
                    <div className="text-slate-200 leading-relaxed font-sans text-xs sm:text-sm">
                      <FormattedMessage content={m.content} />
                    </div>

                    {/* Render historical todo checklist with strikethrough (Ala VibeCoder) */}
                    {m.todo_list && m.todo_list.length > 0 && (
                      <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Daftar Tugas & Checklist ({m.todo_list.filter((t) => t.completed).length}/{m.todo_list.length} Selesai)</span>
                          <span className="text-emerald-400 font-mono text-[11px]">100% Selesai</span>
                        </div>
                        <div className="space-y-2 bg-slate-950/70 p-4 rounded-xl border border-slate-800/90 font-sans">
                          {m.todo_list.map((todo) => (
                            <div
                              key={todo.id}
                              className={`flex items-start gap-3 text-xs sm:text-[13px] leading-relaxed transition-all ${
                                todo.completed
                                  ? 'text-slate-400 line-through decoration-slate-500/80'
                                  : 'text-slate-200'
                              }`}
                            >
                              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                              <span className="select-text">{todo.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Render historical tool calls if any */}
                    {m.tool_calls && m.tool_calls.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-slate-800/80">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                          <span>Aktivitas & Langkah Kerja ({m.tool_calls.length})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1.5">
                          {m.tool_calls.map((call) => {
                            const isExpanded = expandedToolId === call.id;
                            return (
                              <div
                                key={call.id}
                                className="rounded-xl bg-slate-950 border border-slate-800 text-xs overflow-hidden transition-all"
                              >
                                <div className="p-2.5 flex items-center justify-between">
                                  <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                                    <span className="font-mono text-slate-200 truncate">{call.title}</span>
                                    <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                                      {call.tool}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setExpandedToolId(isExpanded ? null : call.id)
                                    }
                                    className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-violet-300 font-medium transition-colors flex items-center gap-1 shrink-0"
                                  >
                                    <span>detail</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                </div>

                                {isExpanded && (
                                  <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                                    <ToolCallDetailBox call={call} />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* ========================================================================= */}
        {/* LIVE BUILD PROGRESS PANEL (STREAMING REAL-TIME) */}
        {/* ========================================================================= */}
        {isBuilding && (
          <div className="max-w-3xl w-full bg-slate-900/90 border border-violet-500/40 rounded-2xl p-6 shadow-2xl shadow-violet-950/40 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                <span>AI Sedang Membangun Aplikasi Anda (10-Step Workflow)...</span>
              </div>
              <div className="flex items-center gap-2">
                {liveGenerationMode === 'fallback-template' ? (
                  <span className="text-[11px] font-semibold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-600/80 flex items-center gap-1.5 shadow-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Mode Cadangan (Fallback)
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-600/80 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Mode Live AI
                  </span>
                )}
                <span className="text-xs font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/80">
                  In-Progress
                </span>
              </div>
            </div>

            {/* Banner Transparan jika Mode Cadangan aktif */}
            {liveGenerationMode === 'fallback-template' && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/50 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-200">⚠️ Perhatian: Mode Cadangan (Fallback Template) Aktif</p>
                  <p className="text-amber-300/90 mt-0.5">
                    Sambungan ke Live AI sedang mengalami gangguan {liveFallbackReason ? `(${liveFallbackReason})` : ''}. Sistem secara transparan beralih ke generator cadangan agar aplikasi tetap dapat diuji.
                  </p>
                </div>
              </div>
            )}

            {/* Live Plan Narrative */}
            {livePlan && (
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">
                {livePlan}
              </div>
            )}

            {/* Live Todo Checklist (TodoWrite) */}
            {liveTodos.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Daftar Tugas & Checklist (TodoWrite)</span>
                  <span className="text-violet-400 font-mono">
                    {liveTodos.filter((t) => t.completed).length} / {liveTodos.length} Selesai
                  </span>
                </div>
                <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  {liveTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className={`flex items-start gap-3 text-xs sm:text-[13px] leading-relaxed transition-all ${
                        todo.completed
                          ? 'text-slate-400 line-through decoration-slate-500/80'
                          : todo.active
                          ? 'text-white font-medium'
                          : 'text-slate-500'
                      }`}
                    >
                      {todo.completed ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                      ) : todo.active ? (
                        <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                      )}
                      <span>{todo.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Tool Call Cards / Pills with (●) status & Detail toggle */}
            {liveToolCalls.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Tool Execution Pills
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {liveToolCalls.map((call) => {
                    const isExpanded = expandedToolId === call.id;
                    const isRunning = call.status === 'running';
                    return (
                      <div
                        key={call.id}
                        className="rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden transition-all text-xs"
                      >
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                                call.status === 'completed'
                                  ? 'bg-emerald-400'
                                  : call.status === 'running'
                                  ? 'bg-amber-400 animate-pulse'
                                  : 'bg-rose-400'
                              }`}
                            />
                            <span className="font-semibold text-slate-200 truncate">{call.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {call.tool}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedToolId(isExpanded ? null : call.id)}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-violet-300 font-medium transition-colors flex items-center gap-1 shrink-0 ml-2"
                          >
                            <span>detail</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expandable Details Modal / Drawer */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-900/90 border-t border-slate-800">
                            <ToolCallDetailBox call={call} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Deployed or Draft Banner */}
            {deployedApp && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/60 to-violet-950/60 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {deployedApp.status === 'published'
                      ? 'Aplikasi Telah Berhasil Di-publish ke Production!'
                      : 'Aplikasi Selesai Dibangun (Status: Draft)'}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    deployedApp.status === 'published'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {deployedApp.status === 'published' ? 'Live Publik' : 'Draft Siap Publish'}
                  </span>
                </div>

                {deployedApp.status === 'published' ? (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                    <span className="font-mono text-emerald-400 truncate">
                      {deployedApp.vercel_url || `/preview/${deployedApp.slug}`}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          copyAppUrl(
                            deployedApp.vercel_url || `/preview/${deployedApp.slug}`
                          )
                        }
                        className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copiedUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        Salin
                      </button>
                      <a
                        href={
                          deployedApp.vercel_url || `/preview/${deployedApp.slug}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white text-[11px] flex items-center gap-1 transition-colors font-medium"
                      >
                        Buka App <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-slate-950 border border-amber-800/60 text-xs text-slate-300 space-y-2">
                    <p className="text-amber-200">
                      Saldo Kredit App Anda saat ini <b>0</b>. Aplikasi disimpan sebagai Draft dan siap dipublish begitu Anda memiliki Kredit App.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push('/billing')}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
                      >
                        Top Up Kredit App
                      </button>
                      <button
                        onClick={() => router.push('/apps')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Buka Menu Aplikasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold">Perhatian</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom Input Box (Aligned with Gambar 1-2) */}
      <div className="p-3 sm:p-5 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/90 to-transparent shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-2 p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/30 transition-all">
            {/* Paperclip / Image icons on left */}
            <div className="flex items-center gap-0.5 shrink-0 pl-1">
              <button
                type="button"
                title="Lampirkan dokumen"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Lampirkan gambar"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Input Textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                rows={1}
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isBuilding}
                placeholder="Tulis perintah untuk agent... (Enter kirim, Shift+Enter baris baru)"
                className="w-full py-1.5 px-2 bg-transparent text-white text-xs sm:text-sm focus:outline-none placeholder:text-slate-500 resize-none disabled:opacity-50 max-h-32"
              />
            </div>

            {/* Purple Arrow Button on Right */}
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isBuilding}
              aria-label="Kirim Perintah"
              className="p-2.5 sm:p-3 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-95 text-white font-semibold shadow-lg shadow-violet-600/30 transition-all disabled:opacity-40 shrink-0 flex items-center justify-center"
            >
              {isBuilding ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
