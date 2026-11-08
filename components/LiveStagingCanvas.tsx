'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RotateCw,
  ExternalLink,
  Sparkles,
  Layers,
  Loader2,
  Maximize2,
  Minimize2,
  FileCode2
} from 'lucide-react';
import { GeneratedApp, ToolCallItem } from '@/lib/types';

interface LiveStagingCanvasProps {
  sessionId: string;
  isBuilding: boolean;
  deployedApp: GeneratedApp | null;
  liveToolCalls?: ToolCallItem[];
  latestWrittenFile?: string;
  className?: string;
}

export default function LiveStagingCanvas({
  sessionId,
  isBuilding,
  deployedApp,
  liveToolCalls = [],
  latestWrittenFile,
  className = ''
}: LiveStagingCanvasProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [iframeLoading, setIframeLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [stitchingStage, setStitchingStage] = useState<string>('Standby');
  const [hasRenderedApp, setHasRenderedApp] = useState<boolean>(false);

  // Files state
  const [files, setFiles] = useState<Record<string, string>>({});

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset state when switching to a new empty session
  useEffect(() => {
    if (sessionId === 'new') {
      setFiles({});
      setHasRenderedApp(false);
    } else if (sessionId) {
      loadAppFiles();
    }
  }, [sessionId]);

  // Real-time dynamic stage deduction based on live tool execution
  useEffect(() => {
    if (!isBuilding) {
      if (deployedApp || Object.keys(files).length > 0 || hasRenderedApp) {
        setStitchingStage('Aplikasi Siap & Interaktif');
      } else {
        setStitchingStage('Kanvas Siap');
      }
      return;
    }

    if (liveToolCalls.length === 0) {
      setStitchingStage('Menyiapkan Fondasi Arsitektur...');
      return;
    }

    const lastCall = liveToolCalls[liveToolCalls.length - 1];
    if (lastCall.tool === 'todo_write') {
      setStitchingStage('Menyusun Blueprint Arsitektur...');
    } else if (lastCall.tool === 'write_file' || lastCall.tool === 'edit_file') {
      const pathStr = typeof lastCall.input === 'object' ? lastCall.input?.path || '' : '';
      if (pathStr.includes('index.html')) {
        setStitchingStage('Merakit Komponen & Layout HTML5...');
      } else if (pathStr.includes('style.css')) {
        setStitchingStage('Menyuntikkan Tema Tailwind & Glassmorphism...');
      } else if (pathStr.includes('app.js')) {
        setStitchingStage('Menghubungkan Interaktivitas & Logika...');
      } else if (pathStr.includes('.json')) {
        setStitchingStage('Mengintegrasikan Virtual Database...');
      } else {
        setStitchingStage('Menyimpan Berkas: ' + (pathStr || 'Sistem'));
      }
    } else if (lastCall.tool === 'bash') {
      setStitchingStage('Menjalankan Diagnostik & TDD...');
    } else if (lastCall.tool === 'browser_test') {
      setStitchingStage('Uji Visual Headless Chrome (Quality Gate)...');
    } else if (lastCall.tool === 'publish_app') {
      setStitchingStage('Menerbitkan Aplikasi ke Live Production...');
    }
  }, [isBuilding, liveToolCalls, deployedApp, files, hasRenderedApp]);

  // Trigger preview reload when code is written or app is deployed
  useEffect(() => {
    if (latestWrittenFile || deployedApp) {
      setHasRenderedApp(true);
      const timer = setTimeout(() => {
        setIframeKey(Date.now());
        loadAppFiles();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [latestWrittenFile, deployedApp]);

  const loadAppFiles = async () => {
    if (!sessionId || sessionId === 'new') return;
    try {
      const res = await fetch(`/api/preview/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.app?.files && Object.keys(data.app.files).length > 0) {
          setFiles(data.app.files);
          setHasRenderedApp(true);
        }
      }
    } catch (e) {
      console.error('Failed loading app preview metadata:', e);
    }
  };

  const handleRefresh = () => {
    setIframeLoading(true);
    setIframeKey(Date.now());
    loadAppFiles();
  };

  const currentToolCall = liveToolCalls.length > 0 ? liveToolCalls[liveToolCalls.length - 1] : null;
  const currentFilePath =
    currentToolCall && typeof currentToolCall.input === 'object' && currentToolCall.input?.path
      ? currentToolCall.input.path
      : '';

  // Calculate target preview URL
  const targetId = sessionId && sessionId !== 'new' ? sessionId : 'default';
  const previewUrl = `/api/preview/${targetId}/raw?t=${iframeKey}`;
  const publicUrl = deployedApp
    ? deployedApp.custom_domain
      ? `https://${deployedApp.custom_domain}`
      : `https://${(deployedApp as any).user_subdomain || 'demo'}.kilattools.my.id/${deployedApp.slug}`
    : previewUrl;

  const hasActualFiles =
    Boolean(deployedApp?.files && Object.keys(deployedApp.files).length > 0) ||
    Object.keys(files).length > 0;

  const isAppReadyToDisplay = hasActualFiles || hasRenderedApp;

  return (
    <div
      className={`flex flex-col h-full bg-[#020617] border-l border-slate-800/80 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#020617]' : 'relative'
      } ${className}`}
    >
      {/* TOP CANVAS TOOLBAR */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 shrink-0 backdrop-blur-md gap-2 flex-wrap">
        {/* Left: Dynamic Real-time Status Badge */}
        <div className="flex items-center gap-2">
          {isBuilding ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-violet-950/60 border border-violet-500/40 text-violet-300 shadow-sm shadow-violet-900/30">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin" />
              <span className="text-xs font-bold tracking-wide animate-pulse">
                {isAppReadyToDisplay ? 'Sinkronisasi Real-Time...' : 'Merakit Aplikasi...'}
              </span>
            </div>
          ) : isAppReadyToDisplay ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white tracking-wide">Pratinjau Live Aktif</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-slate-600"></span>
              <span className="text-xs font-medium tracking-wide">Kanvas Standby</span>
            </div>
          )}
        </div>

        {/* Center: Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/90 shadow-inner">
          <button
            onClick={() => setViewport('desktop')}
            title="Tampilan Desktop (100% Lebar)"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              viewport === 'desktop'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Desktop</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            title="Tampilan Tablet (768px)"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              viewport === 'tablet'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Tablet</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            title="Tampilan Mobile (375px)"
            className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
              viewport === 'mobile'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px]">Mobile</span>
          </button>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleRefresh}
            title="Refresh tampilan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCw className={`w-3.5 h-3.5 ${iframeLoading ? 'animate-spin text-violet-400' : ''}`} />
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Buka di tab baru"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* TOP GLOWING PROGRESS BAR (Active during live updates while app remains visible) */}
      {isBuilding && isAppReadyToDisplay && (
        <div className="w-full h-1 bg-slate-900 overflow-hidden relative z-20">
          <div className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400 w-full animate-pulse" />
        </div>
      )}

      {/* MAIN CANVAS BODY */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-2 sm:p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-[#020617]">
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Container Viewport Frame */}
        <div
          className={`h-full flex flex-col transition-all duration-300 relative z-10 ${
            viewport === 'desktop'
              ? 'w-full rounded-xl'
              : viewport === 'tablet'
              ? 'w-[768px] max-w-full rounded-2xl shadow-2xl shadow-black/80 border border-slate-800 bg-slate-950 my-auto h-[95%]'
              : 'w-[375px] max-w-full rounded-3xl shadow-2xl shadow-black/90 border-2 border-slate-700 bg-slate-950 my-auto h-[92%]'
          } overflow-hidden border border-slate-800/80 bg-slate-950`}
        >
          {/* Mobile Mockup Top Notch */}
          {viewport === 'mobile' && (
            <div className="w-full bg-slate-900 py-1.5 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
              <span className="text-[10px] font-mono text-slate-400">9:41</span>
              <div className="w-16 h-3 bg-slate-950 rounded-full border border-slate-800" />
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-[9px] font-mono text-slate-400">5G</span>
              </div>
            </div>
          )}

          {/* MAIN VIEWPORT CONTENT (Clean 3-State Model) */}
          <div className="relative flex-1 w-full h-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
            {isAppReadyToDisplay ? (
              /* STATE 1: INTERACTIVE LIVE APP RUNTIME (Aplikasi Siap & Terlihat) */
              <div className="relative w-full h-full">
                {iframeLoading && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-xs space-y-2">
                    <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />
                    <p className="text-[11px] text-slate-400 font-medium">Memperbarui antarmuka kanvas...</p>
                  </div>
                )}

                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={previewUrl}
                  onLoad={() => {
                    setIframeLoading(false);
                  }}
                  onError={() => {
                    setIframeLoading(false);
                  }}
                  title="Live Staging Preview Canvas"
                  className="w-full h-full border-0 bg-slate-950"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-downloads"
                />
              </div>
            ) : isBuilding ? (
              /* STATE 2: LUXURY REAL-TIME AI COMPILING STAGE (HANYA saat tombol kirim diklik & proses merakit sedang berlangsung) */
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 text-center max-w-md mx-auto space-y-6 select-none relative z-10">
                {/* Glowing Orbital Ring */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-20 h-20 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/30 via-violet-600/20 to-emerald-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20 relative">
                    <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                  </div>
                </div>

                {/* Real-time Dynamic Stage Header */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {stitchingStage}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                    AI Autonomous Engine sedang merakit modul aplikasi Anda secara real-time. Begitu komponen pertama siap, pratinjau live akan langsung tampil.
                  </p>
                </div>

                {/* Live Executing Tool Ticker */}
                {currentFilePath && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-indigo-300 shadow-inner">
                    <FileCode2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[260px]">{currentFilePath}</span>
                  </div>
                )}

                {/* Bento Wireframe Shimmer Skeleton */}
                <div className="w-full space-y-2.5 pt-1 text-left opacity-80">
                  <div className="h-8 bg-slate-900/80 rounded-xl animate-pulse border border-slate-800/80 flex items-center px-3 justify-between">
                    <div className="w-20 h-2.5 bg-slate-800 rounded-full" />
                    <div className="w-10 h-4 bg-indigo-500/30 rounded-md" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-16 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800/60 p-2.5 space-y-2">
                      <div className="w-12 h-2 bg-slate-800 rounded-full" />
                      <div className="w-16 h-3 bg-emerald-500/20 rounded" />
                    </div>
                    <div className="h-16 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800/60 p-2.5 space-y-2">
                      <div className="w-12 h-2 bg-slate-800 rounded-full" />
                      <div className="w-16 h-3 bg-indigo-500/20 rounded" />
                    </div>
                  </div>
                </div>

                {/* Live Synthesis Status Indicator */}
                <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Sintesis AI Real-Time Aktif</span>
                </div>
              </div>
            ) : (
              /* STATE 3: STANDBY STATE (Tampil HANYA saat sesi belum mengirim prompt apapun) */
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto space-y-4 select-none">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/10">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white tracking-tight">Kanvas Pratinjau Siap</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Ketik ide atau deskripsi aplikasi Anda di kolom chat sebelah kiri untuk mulai merancang dan membangun secara langsung.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Menunggu instruksi prompt</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
