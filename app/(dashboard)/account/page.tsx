'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Globe,
  Coins,
  Cpu,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bot,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  MessageSquare,
  Clock,
  Terminal,
  User as UserIcon
} from 'lucide-react';
import { UserProfile, CreditTransaction } from '@/lib/types';

interface TestChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  latencyMs?: number;
  model?: string;
  timestamp: string;
  error?: boolean;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Configuration state (Matching Custom Provider)
  const [baseUrl, setBaseUrl] = useState('https://api.koboillm.com/v1');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [models, setModels] = useState<string[]>([
    'gemini-2.5-flash',
    'gemini-3.7-flash',
    'gemini-3.6-flash',
    'claude-3-5-sonnet-20241022',
    'gpt-4o',
    'gpt-4o-mini'
  ]);
  const [defaultModel, setDefaultModel] = useState('gemini-2.5-flash');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [saveAiLoading, setSaveAiLoading] = useState(false);
  const [aiNotice, setAiNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Test Chat state
  const [testPrompt, setTestPrompt] = useState('');
  const [testMessages, setTestMessages] = useState<TestChatMessage[]>([]);
  const [testLoading, setTestLoading] = useState(false);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [meRes, txRes, aiRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/account/transactions'),
        fetch('/api/ai/config')
      ]);

      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData.config) {
          if (aiData.config.baseUrl) setBaseUrl(aiData.config.baseUrl);
          if (aiData.config.apiKey) setApiKey(aiData.config.apiKey);
          if (aiData.config.defaultModel) setDefaultModel(aiData.config.defaultModel);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchModels = async () => {
    setFetchLoading(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey })
      });
      const data = await res.json();
      if (res.ok && data.models?.length) {
        setModels(data.models);
        if (!data.models.includes(defaultModel)) {
          setDefaultModel(data.models[0]);
        }
        setAiNotice({ type: 'success', message: `Berhasil mengambil ${data.models.length} model dari penyedia AI!` });
      } else {
        setAiNotice({ type: 'error', message: data.error || 'Gagal mengambil model. Periksa Base URL dan API Key Anda.' });
      }
    } catch {
      setAiNotice({ type: 'error', message: 'Koneksi ke endpoint penyedia AI gagal.' });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSaveAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAiLoading(true);
    setAiNotice(null);
    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl, apiKey, defaultModel })
      });
      const data = await res.json();
      if (res.ok) {
        setAiNotice({ type: 'success', message: 'Pengaturan AI central berhasil disimpan! Agent akan menggunakan penyedia AI ini.' });
      } else {
        setAiNotice({ type: 'error', message: data.error || 'Gagal menyimpan pengaturan AI' });
      }
    } catch {
      setAiNotice({ type: 'error', message: 'Terjadi kesalahan sistem saat menyimpan pengaturan AI.' });
    } finally {
      setSaveAiLoading(false);
    }
  };

  const handleSendTestChat = async (presetText?: string) => {
    const query = (presetText || testPrompt).trim();
    if (!query || testLoading) return;

    const userMsg: TestChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setTestMessages((prev) => [...prev, userMsg]);
    setTestPrompt('');
    setTestLoading(true);

    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          baseUrl,
          apiKey,
          model: defaultModel
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            latencyMs: data.latencyMs,
            model: data.model || defaultModel,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
      } else {
        setTestMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: data.error || 'Gagal menerima respons dari model.',
            error: true,
            latencyMs: data.latencyMs,
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
      }
    } catch (err: any) {
      setTestMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: err.message || 'Koneksi jaringan ke endpoint penyedia gagal.',
          error: true,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ]);
    } finally {
      setTestLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok' });
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordNotice({ type: 'error', message: data.error || 'Gagal mengubah kata sandi' });
      } else {
        setPasswordNotice({ type: 'success', message: 'Kata sandi berhasil diperbarui!' });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordNotice({ type: 'error', message: 'Terjadi kesalahan sistem' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-violet-400" /> Pengaturan Akun & Konfigurasi AI
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Konfigurasikan penyedia AI Anda sendiri, kelola profil, dan pantau catatan audit sistem.
        </p>
      </div>

      {/* 🤖 AI Configuration Card (Exact match with user specification) */}
      <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">AI Configuration</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Konfigurasi AI central untuk semua edge function. API key dan model dipilih di sini — user biasa tidak bisa mengubah.
          </p>
        </div>

        {aiNotice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              aiNotice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
            }`}
          >
            {aiNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{aiNotice.message}</span>
          </div>
        )}

        <form onSubmit={handleSaveAi} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.koboillm.com/v1"
              className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-violet-500 transition-colors"
              required
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              LiteLLM compatible API URL (contoh: api.koboillm.com/v1)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">API Key</label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Masukkan API Key Anda..."
                className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white font-mono pr-10 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                title={showApiKey ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleFetchModels}
              disabled={fetchLoading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetchLoading ? 'animate-spin' : ''}`} />
              {fetchLoading ? 'Mengambil Model...' : 'Fetch Models'}
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">Default Model</label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Model yang dipilih akan digunakan oleh semua AI edge functions
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saveAiLoading}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-violet-600/30"
            >
              <Save className="w-3.5 h-3.5" />
              {saveAiLoading ? 'Menyimpan...' : 'Simpan Pengaturan AI'}
            </button>
          </div>

          {/* Test Live Chat Section */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Test Live Chat AI
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-violet-500/10 text-violet-300 border border-violet-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {defaultModel}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kirim pesan uji coba untuk memverifikasi apakah endpoint dan model AI kustom Anda merespons secara langsung dan aktif.
            </p>

            {/* Quick Prompts Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleSendTestChat('Halo! Apakah koneksi AI kamu aktif dan siap digunakan?')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> Tes Koneksi
              </button>
              <button
                type="button"
                onClick={() => handleSendTestChat('Sebutkan nama model AI yang sedang berjalan ini.')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
              >
                <Terminal className="w-3 h-3 text-cyan-400" /> Cek Nama Model
              </button>
              <button
                type="button"
                onClick={() => handleSendTestChat('Tuliskan 1 baris kode JavaScript untuk menghitung diskon 20% dari 50000.')}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-emerald-400" /> Tes Coding Cepat
              </button>
            </div>

            {/* Messages Display Box */}
            <div className="min-h-[120px] max-h-[280px] overflow-y-auto p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 space-y-2.5 text-xs">
              {testMessages.length === 0 ? (
                <div className="h-24 flex flex-col items-center justify-center text-slate-500 text-center gap-1">
                  <MessageSquare className="w-5 h-5 text-slate-600" />
                  <span>Belum ada pesan uji coba. Ketik pertanyaan di bawah untuk mengetes respons AI Anda.</span>
                </div>
              ) : (
                testMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 px-1">
                      {msg.role === 'user' ? (
                        <>
                          <span>Anda</span>
                          <UserIcon className="w-3 h-3 text-violet-400" />
                        </>
                      ) : (
                        <>
                          <Bot className="w-3 h-3 text-cyan-400" />
                          <span className="font-mono text-cyan-300">{msg.model || 'AI'}</span>
                          {msg.latencyMs && (
                            <span className="text-[10px] text-amber-300 font-mono">
                              ⚡ {(msg.latencyMs / 1000).toFixed(2)}s
                            </span>
                          )}
                        </>
                      )}
                      <span>• {msg.timestamp}</span>
                    </div>
                    <div
                      className={`max-w-[85%] rounded-xl px-3.5 py-2 whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-violet-600/30 border border-violet-500/30 text-violet-100'
                          : msg.error
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 font-mono text-[11px]'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {testLoading && (
                <div className="flex items-center gap-2 text-violet-400 py-2 px-1 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI sedang memproses jawaban langsung dari endpoint...</span>
                </div>
              )}
            </div>

            {/* Input & Send Button */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendTestChat();
                  }
                }}
                disabled={testLoading}
                placeholder="Ketik pesan tes, misal: Halo! Apakah kamu sudah terhubung?"
                className="flex-1 px-4 py-2 bg-slate-950/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => handleSendTestChat()}
                disabled={testLoading || !testPrompt.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/20"
              >
                {testLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Kirim</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Details */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Shield className="w-4 h-4 text-violet-400" /> Informasi Pengguna
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Username
              </span>
              <span className="text-white font-medium text-sm">{user?.username}</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Email
              </span>
              <span className="text-white font-medium text-sm">{user?.email}</span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Subdomain Pribadi
              </span>
              <div className="flex items-center gap-2 font-mono text-violet-300 mt-0.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>{user?.subdomain}.kilatstools.my.id</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-semibold text-[10px]">
                Status Tier
              </span>
              <span className="text-white font-medium text-sm">
                {user?.is_pro ? (
                  <span className="text-amber-400 font-bold">Pro Edition</span>
                ) : (
                  'Free Starter Plan'
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <Key className="w-4 h-4 text-violet-400" /> Ganti Kata Sandi
          </div>

          {passwordNotice && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordNotice.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
              }`}
            >
              {passwordNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordNotice.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kata Sandi Lama</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {passwordLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Perbarui Kata Sandi'}
            </button>
          </form>
        </div>
      </div>

      {/* Credit Transactions Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-violet-400" /> Riwayat Audit Mutasi Kredit
          </h2>
          <span className="text-xs text-slate-500">{transactions.length} entri audit</span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">Memuat riwayat transaksi...</div>
        ) : transactions.length === 0 ? (
          <div className="p-8 rounded-xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-500">
            Belum ada catatan mutasi kredit pada akun ini.
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Tanggal</th>
                  <th className="px-6 py-3.5">Tipe Kredit</th>
                  <th className="px-6 py-3.5">Jumlah Mutasi</th>
                  <th className="px-6 py-3.5">Keterangan / Alasan</th>
                  <th className="px-6 py-3.5 text-right">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40">
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(tx.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {tx.type === 'app_credit' ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1 w-fit">
                          <Coins className="w-3 h-3" /> Kredit App
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1 w-fit">
                          <Cpu className="w-3 h-3" /> Kredit AI
                        </span>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 font-mono font-bold ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString('id-ID')}` : tx.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-slate-300">{tx.reason}</td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
                      {tx.balance_after.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
