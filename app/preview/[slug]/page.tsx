'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  FileCode2,
  Play,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

export default function AppPreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    fetchApp();
  }, [slug]);

  const fetchApp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/preview/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setAppData(data.app);
        const files = data.app?.files || {};
        const fileKeys = Object.keys(files);
        if (fileKeys.length > 0) {
          const defaultFile = fileKeys.find(k => k.includes('index.html') || k.includes('server.js')) || fileKeys[0];
          setSelectedFile(defaultFile);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center text-white">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
        <p className="text-zinc-400 font-medium">Memuat live preview aplikasi...</p>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-[#131926] border border-white/10 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Aplikasi Tidak Ditemukan</h2>
          <p className="text-zinc-400 text-sm mb-6">Aplikasi dengan slug &quot;{slug}&quot; belum terdaftar atau masih dalam proses pembuatan.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const filesMap = appData.files || {};
  const fileKeys = Object.keys(filesMap);

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return 'max-w-[390px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'w-full';
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-[#0E131F]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition flex-shrink-0"
            title="Kembali ke Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate">{appData.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold tracking-wide uppercase flex-shrink-0">
                Live App
              </span>
            </div>
            <p className="text-xs text-zinc-400 truncate">slug: {appData.slug}</p>
          </div>
        </div>

        {/* Center: Tabs & Device Controls */}
        <div className="flex items-center gap-2">
          <div className="bg-[#151C2C] p-1 rounded-xl border border-white/10 flex items-center gap-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'preview'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Tampilan Live
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'code'
                  ? 'bg-cyan-500 text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              Berkas & Kode ({fileKeys.length})
            </button>
          </div>

          {activeTab === 'preview' && (
            <div className="hidden md:flex items-center bg-[#151C2C] p-1 rounded-xl border border-white/10 gap-1">
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceMode === 'desktop' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tampilan Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceMode === 'tablet' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tampilan Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  deviceMode === 'mobile' ? 'bg-white/15 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Tampilan Mobile (390px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'preview' && (
            <button
              onClick={() => setIframeKey(k => k + 1)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition"
              title="Muat ulang halaman"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <a
            href={`/api/preview/${slug}/raw`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-200 hover:text-white transition"
          >
            <span>Buka Tab Baru</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'preview' ? (
          <div className="flex-1 bg-[#05070D] p-2 sm:p-4 flex items-center justify-center overflow-auto">
            <div className={`w-full h-full min-h-[600px] transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-white ${getDeviceWidth()}`}>
              <iframe
                key={iframeKey}
                src={`/api/preview/${slug}/raw`}
                className="w-full h-full border-0"
                title={appData.name}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden bg-[#0A0E18]">
            {/* Left: File Tree */}
            <div className="w-64 sm:w-72 border-r border-white/10 bg-[#0E131F] flex flex-col flex-shrink-0">
              <div className="p-3.5 border-b border-white/10 text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-cyan-400" />
                Struktur Berkas Proyek
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {fileKeys.map((filePath) => {
                  const isSelected = selectedFile === filePath;
                  const ext = filePath.split('.').pop() || '';
                  return (
                    <button
                      key={filePath}
                      onClick={() => setSelectedFile(filePath)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between gap-2 transition ${
                        isSelected
                          ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      <span className="truncate">{filePath}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500 uppercase flex-shrink-0">
                        {ext}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Code Viewer */}
            <div className="flex-1 flex flex-col bg-[#07090F] overflow-hidden">
              <div className="h-11 border-b border-white/10 bg-[#0B0F19] px-4 flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-400 font-semibold">{selectedFile || 'Pilih berkas'}</span>
                {selectedFile && filesMap[selectedFile] && (
                  <button
                    onClick={() => handleCopyCode(filesMap[selectedFile])}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>
                )}
              </div>
              <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-300 leading-relaxed">
                {selectedFile && filesMap[selectedFile] ? (
                  <pre className="whitespace-pre overflow-x-auto selection:bg-cyan-500/30">
                    <code>{filesMap[selectedFile]}</code>
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-zinc-500">
                    Pilih berkas di samping untuk melihat isinya.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
