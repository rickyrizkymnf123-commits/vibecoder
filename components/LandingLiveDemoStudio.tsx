'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Send,
  CheckCircle2,
  Code2,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Globe,
  ShoppingCart,
  Package,
  Plus,
  Minus,
  Receipt,
  Trash2,
  Search,
  RefreshCw,
  Laptop,
  Smartphone,
  Lock,
  ArrowRight,
  Boxes,
  Store
} from 'lucide-react';

interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

interface CartItem {
  product: ProductItem;
  qty: number;
}

export default function LandingLiveDemoStudio() {
  // Mode Tab: 'studio' | 'preview' | 'split'
  const [activeTab, setActiveTab] = useState<'studio' | 'preview' | 'split'>('split');
  const [expandedToolId, setExpandedToolId] = useState<string | null>('tool-1');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [promptInput, setPromptInput] = useState('');

  // Live Interactive Cashier State
  const [activeAppTab, setActiveAppTab] = useState<'pos' | 'inventory'>('pos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: {
        id: 'p1',
        name: 'Beras Pandan Wangi 5kg',
        category: 'Sembako',
        price: 72000,
        stock: 35,
        image: '🌾'
      },
      qty: 1
    },
    {
      product: {
        id: 'p2',
        name: 'Minyak Goreng Sania 2L',
        category: 'Sembako',
        price: 36000,
        stock: 18,
        image: '🍳'
      },
      qty: 2
    }
  ]);
  const [products, setProducts] = useState<ProductItem[]>([
    { id: 'p1', name: 'Beras Pandan Wangi 5kg', category: 'Sembako', price: 72000, stock: 35, image: '🌾' },
    { id: 'p2', name: 'Minyak Goreng Sania 2L', category: 'Sembako', price: 36000, stock: 18, image: '🍳' },
    { id: 'p3', name: 'Gula Pasir Gulaku 1kg', category: 'Sembako', price: 17500, stock: 42, image: '🍬' },
    { id: 'p4', name: 'Telur Ayam Negeri 1kg', category: 'Fresh', price: 28000, stock: 8, image: '🥚' },
    { id: 'p5', name: 'Kopi Kapal Api Spesial 165g', category: 'Minuman', price: 14000, stock: 25, image: '☕' },
    { id: 'p6', name: 'Mie Instan Goreng (Karton)', category: 'Makanan', price: 115000, stock: 12, image: '🍜' },
    { id: 'p7', name: 'Susu Kental Manis 370g', category: 'Minuman', price: 12000, stock: 4, image: '🥛' },
    { id: 'p8', name: 'Teh Celup Kotak 25s', category: 'Minuman', price: 6500, stock: 30, image: '🍵' },
  ]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Todo Items (Checklist 100% Lulus)
  const todoItems = [
    { id: 't1', title: 'Inisialisasi arsitektur project POS & database SQLite lokal', completed: true },
    { id: 't2', title: 'Rancang antarmuka kasir cepat dengan kartu produk responsif', completed: true },
    { id: 't3', title: 'Implementasikan kalkulasi subtotal, PPN 11%, dan diskon belanja', completed: true },
    { id: 't4', title: 'Buat sistem keranjang belanja multi-item & auto-decrement stok', completed: true },
    { id: 't5', title: 'Bangun modal cetak struk kasir profesional format thermal 58mm/80mm', completed: true },
    { id: 't6', title: 'Tambahkan modul pelacakan stok menipis (stock warning threshold)', completed: true },
    { id: 't7', title: 'Jalankan pengujian unit kalkulasi nominal rupiah & type safety', completed: true },
    { id: 't8', title: 'Deploy ke live hosting Vercel & hubungkan custom domain', completed: true },
  ];

  // Tool Calls Mock Real Data
  const sampleTools = [
    {
      id: 'tool-1',
      tool: 'write_file',
      title: 'Menulis berkas components/PosCashier.tsx',
      status: 'completed',
      filePath: 'components/PosCashier.tsx',
      lines: 142,
      sizeKb: 4.8,
      code: `// components/PosCashier.tsx - POS Engine by VibeCoder AI
import { useState, useMemo } from 'react';

export function PosCashier({ products, onCheckout }) {
  const [cart, setCart] = useState([]);
  
  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(i => i.id === product.id);
      if (exist) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Product Catalog & Real-Time Cart */}
    </div>
  );
}`
    },
    {
      id: 'tool-2',
      tool: 'bash',
      title: 'Menjalankan unit test kalkulasi kasir & validasi skema',
      status: 'completed',
      command: 'npm run test:pos-calculations && npx tsc --noEmit',
      stdout: `PASS tests/pos-calculations.test.ts
  ✓ kalkulasi subtotal rupiah presisi (2ms)
  ✓ kalkulasi PPN 11% pembulatan ke bawah (1ms)
  ✓ validasi pengurangan stok inventori saat checkout (3ms)
  ✓ validasi format struk thermal 58mm (1ms)

Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        0.842 s
TypeScript:  0 errors detected. Build ready.`
    },
    {
      id: 'tool-3',
      tool: 'browser_test',
      title: 'Verifikasi interaksi UI di Headless Google Chrome',
      status: 'completed',
      url: 'https://demo.vibecoder.co.id/pos-berkah',
      output: '✓ DOM rendered in 140ms. 0 console errors detected. Responsive viewport 375px to 1440px verified.'
    },
    {
      id: 'tool-4',
      tool: 'publish_app',
      title: 'Menerbitkan aplikasi ke Vercel Edge Network',
      status: 'completed',
      url: 'https://demo.vibecoder.co.id/pos-berkah'
    }
  ];

  // Helper Cart
  const addToCart = (product: ProductItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const handleRestock = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + 10 } : p))
    );
  };

  const handleCopyToolCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const triggerAuthNotice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowAuthModal(true);
  };

  return (
    <div className="w-full mt-12 rounded-2xl border border-slate-800 bg-[#0c101c] shadow-2xl overflow-hidden relative">
      {/* Top Navigation Bar of Studio */}
      <div className="bg-[#090d16] border-b border-slate-800/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 select-none">
        {/* Left: Window Dots & Title */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-300 font-semibold flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-violet-400" />
              ses-kasir-berkah / POS & Stok Toko Kelontong
            </span>
            <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE PROD
            </span>
          </div>
        </div>

        {/* Center / Right: Tabs & View Switcher */}
        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium text-slate-400">
            <button
              onClick={() => setActiveTab('studio')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'studio'
                  ? 'bg-violet-600 text-white shadow-sm font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Studio
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-violet-600 text-white shadow-sm font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Live App
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`hidden md:flex px-3 py-1 rounded-lg transition-all items-center gap-1.5 ${
                activeTab === 'split'
                  ? 'bg-violet-600 text-white shadow-sm font-semibold'
                  : 'hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              Split Screen (1:1)
            </button>
          </div>

          <button
            onClick={() => setShowAuthModal(true)}
            className="hidden sm:flex text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 items-center gap-1.5 font-medium transition-colors"
          >
            <Lock className="w-3 h-3 text-amber-400" />
            Mode Demo
          </button>
        </div>
      </div>

      {/* Main Container - Split or Single Tab */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[640px] max-h-[820px]">
        {/* ========================================================================= */}
        {/* PANEL KIRI: AI WORKSPACE STUDIO (ReAct Steps, Checklist, Details) */}
        {/* ========================================================================= */}
        <div
          className={`flex flex-col bg-[#0b0f19] border-r border-slate-800/80 ${
            activeTab === 'studio'
              ? 'md:col-span-12 block'
              : activeTab === 'preview'
              ? 'hidden'
              : 'md:col-span-6 flex'
          }`}
        >
          {/* Scrollable Conversation Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
            {/* User Prompt Bubble */}
            <div className="flex justify-end">
              <div className="max-w-[90%] rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-4 py-3 text-xs sm:text-sm font-medium shadow-md shadow-violet-900/20 leading-relaxed">
                "Buatkan aplikasi POS Kasir dan Manajemen Stok Toko Berkah lengkap dengan keranjang belanja, kalkulasi PPN 11%, cetak struk belanja, dan peringatan stok menipis."
              </div>
            </div>

            {/* AI Assistant Card (1:1 with Actual Studio) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 text-xs">
              {/* Badge Engine */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mode AI Riil (Live Autonomous ReAct Engine)</span>
                </div>
                <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/50">
                  12/12 Test Passed
                </span>
              </div>

              {/* Intro Text */}
              <p className="text-slate-300 leading-relaxed">
                Halo! Saya telah merancang dan membangun sistem <strong>Point of Sale (POS) & Manajemen Inventori Toko Kelontong Berkah</strong> secara menyeluruh. Aplikasi dilengkapi katalog produk ber-kategori, sistem keranjang reaktif dengan kalkulasi PPN 11%, modul cetak struk thermal, dan kontrol restock barang.
              </p>

              {/* Todo Checklist 100% Selesai */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Daftar Tugas & Checklist (8/8 Selesai)</span>
                  <span className="text-emerald-400 font-mono text-[11px]">100% SELESAI</span>
                </div>
                <div className="space-y-1.5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/90 font-sans">
                  {todoItems.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-start gap-2.5 text-slate-400 line-through decoration-slate-500 text-[11px] sm:text-xs leading-relaxed"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>{todo.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Granular Tool Execution Pills with CLICKABLE "detail" */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Aktivitas & Eksekusi Tool (Klik tombol "detail" untuk inspeksi)</span>
                  <span className="text-indigo-400 font-mono text-[10px]">4 Tools</span>
                </div>

                <div className="space-y-2">
                  {sampleTools.map((tool) => {
                    const isExpanded = expandedToolId === tool.id;
                    return (
                      <div
                        key={tool.id}
                        className="rounded-xl bg-slate-950 border border-slate-800/90 overflow-hidden transition-all text-xs"
                      >
                        {/* Tool Header Row */}
                        <div className="p-2.5 flex items-center justify-between">
                          <div className="flex items-center gap-2 truncate flex-1 min-w-0 mr-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                            <span className="font-mono text-slate-200 truncate">{tool.title}</span>
                            <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0">
                              {tool.tool}
                            </span>
                          </div>

                          <button
                            onClick={() => setExpandedToolId(isExpanded ? null : tool.id)}
                            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] text-violet-300 font-medium transition-colors flex items-center gap-1 shrink-0"
                          >
                            <span>detail</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>

                        {/* Expandable Detail Container */}
                        {isExpanded && (
                          <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2">
                            {tool.tool === 'write_file' && (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-[11px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                                  <div className="flex items-center gap-2 font-mono text-indigo-300 font-semibold truncate">
                                    <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                    <span>{tool.filePath}</span>
                                  </div>
                                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                                    <span>{tool.lines} baris</span>
                                    <span>({tool.sizeKb} KB)</span>
                                    <button
                                      onClick={() => handleCopyToolCode(tool.code || '')}
                                      className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                                    >
                                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                      <span>{copiedCode ? 'Tersalin' : 'Salin'}</span>
                                    </button>
                                  </div>
                                </div>
                                <pre className="p-3 font-mono text-[11px] leading-relaxed text-slate-300 bg-slate-950 rounded-lg border border-slate-800/80 overflow-x-auto max-h-[160px] overflow-y-auto">
                                  {tool.code}
                                </pre>
                              </div>
                            )}

                            {tool.tool === 'bash' && (
                              <div className="space-y-2 font-mono text-[11px]">
                                <div className="flex items-center gap-1.5 text-emerald-400">
                                  <Terminal className="w-3.5 h-3.5" />
                                  <span className="font-semibold">Terminal Command Execution</span>
                                </div>
                                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 space-y-1">
                                  <div className="text-violet-300">$ {tool.command}</div>
                                  <div className="text-slate-400 border-t border-slate-900 pt-1 text-[10px] whitespace-pre-line leading-relaxed">
                                    {tool.stdout}
                                  </div>
                                </div>
                              </div>
                            )}

                            {tool.tool === 'browser_test' && (
                              <div className="space-y-1 font-mono text-[11px]">
                                <div className="flex items-center gap-1.5 text-sky-400">
                                  <Globe className="w-3.5 h-3.5" />
                                  <span>Headless Chrome DOM Audit</span>
                                </div>
                                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-emerald-400 text-[10px]">
                                  {tool.output}
                                </div>
                              </div>
                            )}

                            {tool.tool === 'publish_app' && (
                              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px]">
                                <span className="font-mono text-emerald-400 truncate">{tool.url}</span>
                                <button
                                  onClick={() => setActiveTab('preview')}
                                  className="px-2.5 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium flex items-center gap-1 transition-colors text-xs"
                                >
                                  Buka Tab Preview
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Published Live Status Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-violet-950/50 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Aplikasi Siap Digunakan & Live Publik</span>
                </div>
                <button
                  onClick={() => setActiveTab('preview')}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  Coba Sekarang
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Chat Input Bar (Read-only / Demo with Clickable Action) */}
          <div className="p-3 bg-[#090d16] border-t border-slate-800/80">
            <form onSubmit={triggerAuthNotice} className="relative flex items-center">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                onClick={() => setShowAuthModal(true)}
                placeholder="Mode Demo Interaktif — Masuk atau Daftar untuk membuat aplikasi AI Anda sendiri..."
                className="w-full py-2.5 pl-3.5 pr-12 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1 transition-all shadow-md shadow-violet-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buat</span>
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL KANAN: LIVE APPLICATION INTERACTIVE PREVIEW (Aplikasi Kasir Nyata) */}
        {/* ========================================================================= */}
        <div
          className={`flex flex-col bg-[#0f172a] ${
            activeTab === 'preview'
              ? 'md:col-span-12 block'
              : activeTab === 'studio'
              ? 'hidden'
              : 'md:col-span-6 flex'
          }`}
        >
          {/* Mini Browser Address Bar */}
          <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => {
                  setCart([]);
                  setSelectedCategory('Semua');
                }}
                title="Reset Demo App"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 bg-slate-950 border border-slate-800 px-3 py-1 rounded-lg font-mono text-[11px] text-slate-300 truncate flex items-center justify-between">
                <span className="text-emerald-400 truncate">https://berkah-mart.vibecoder.co.id</span>
                <span className="text-[10px] text-slate-500">SSL 256-bit</span>
              </div>
            </div>

            {/* In-App Tab Switcher: Kasir POS vs Stok Inventori */}
            <div className="flex gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveAppTab('pos')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  activeAppTab === 'pos'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                POS Kasir
              </button>
              <button
                onClick={() => setActiveAppTab('inventory')}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  activeAppTab === 'inventory'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                Stok ({products.length})
              </button>
            </div>
          </div>

          {/* APP BODY: Interactive POS or Inventory */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeAppTab === 'pos' ? (
              /* POS Cashier View */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Product Catalog List (7 cols) */}
                <div className="lg:col-span-7 space-y-3">
                  {/* Search and Category Filter */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari barang sembako..."
                        className="w-full py-1.5 pl-8 pr-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {['Semua', 'Sembako', 'Fresh', 'Minuman', 'Makanan'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
                            selectedCategory === cat
                              ? 'bg-violet-600 text-white font-semibold'
                              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Grid of Products */}
                  <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                    {filteredProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-violet-500/50 transition-all cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xl p-1 bg-slate-950 rounded-lg border border-slate-800 group-hover:scale-110 transition-transform">
                            {p.image}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            p.stock <= 5
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-slate-950 text-slate-400'
                          }`}>
                            Stok: {p.stock}
                          </span>
                        </div>
                        <div className="mt-2">
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-violet-300">
                            {p.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs font-bold text-emerald-400 font-mono">
                              Rp {p.price.toLocaleString('id-ID')}
                            </span>
                            <span className="text-[10px] p-1 rounded-md bg-violet-600/20 text-violet-300 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-Time Cashier Cart (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-violet-400" />
                        Keranjang Kasir ({cart.reduce((a, b) => a + b.qty, 0)})
                      </span>
                      {cart.length > 0 && (
                        <button
                          onClick={clearCart}
                          className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                          Hapus
                        </button>
                      )}
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                      {cart.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          Keranjang kosong. Klik produk untuk menambahkan.
                        </div>
                      ) : (
                        cart.map((item) => (
                          <div
                            key={item.product.id}
                            className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 flex-1 mr-2">
                              <p className="text-slate-200 font-medium truncate">{item.product.name}</p>
                              <p className="text-emerald-400 font-mono text-[11px]">
                                Rp {(item.product.price * item.qty).toLocaleString('id-ID')}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 bg-slate-900 px-1.5 py-0.5 rounded-lg border border-slate-800">
                              <button
                                onClick={() => updateQty(item.product.id, -1)}
                                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="text-xs font-bold font-mono px-1 text-white">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.product.id, 1)}
                                className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Calculations & Checkout Button */}
                  <div className="border-t border-slate-800 pt-2 mt-3 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono">Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>PPN 11%:</span>
                      <span className="font-mono">Rp {tax.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-white font-bold text-sm pt-1 border-t border-slate-800/80">
                      <span>Total Bayar:</span>
                      <span className="font-mono text-emerald-400">Rp {total.toLocaleString('id-ID')}</span>
                    </div>

                    <button
                      disabled={cart.length === 0}
                      onClick={() => setShowReceiptModal(true)}
                      className={`w-full mt-2 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        cart.length > 0
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Bayar & Cetak Struk
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Inventory Management View */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Boxes className="w-4 h-4 text-violet-400" />
                    Manajemen Stok & Inventori Real-Time
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Total {products.length} SKU Barang
                  </span>
                </div>

                <div className="bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-2.5">Nama Produk</th>
                        <th className="p-2.5">Kategori</th>
                        <th className="p-2.5">Harga Satuan</th>
                        <th className="p-2.5 text-center">Stok</th>
                        <th className="p-2.5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-sans">
                      {products.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-medium text-slate-200 flex items-center gap-2">
                            <span>{item.image}</span>
                            <span className="truncate max-w-[130px]">{item.name}</span>
                          </td>
                          <td className="p-2.5 text-slate-400">{item.category}</td>
                          <td className="p-2.5 font-mono text-emerald-400">
                            Rp {item.price.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${
                              item.stock <= 5
                                ? 'bg-rose-950/80 text-rose-300 font-bold border border-rose-800'
                                : 'bg-slate-950 text-slate-300'
                            }`}>
                              {item.stock} unit
                            </span>
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => handleRestock(item.id)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-violet-600 text-slate-200 hover:text-white text-[10px] font-medium transition-colors"
                            >
                              +10 Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL CETAK STRUK PEMBAYARAN THERMAL KASIR (Interactive Experience) */}
      {/* ========================================================================= */}
      {showReceiptModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-xl p-5 max-w-sm w-full font-mono text-xs shadow-2xl space-y-3 animate-in zoom-in-95 duration-200">
            <div className="text-center border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-extrabold text-base tracking-wider uppercase">TOKO SEMBAKO BERKAH</h3>
              <p className="text-[10px] text-slate-500">Jl. Raya Pasar Induk No. 12, Jakarta</p>
              <p className="text-[10px] text-slate-500">Telp: 0812-8888-9999</p>
            </div>

            <div className="text-[10px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>No. Transaksi:</span>
                <span className="font-bold">#TRX-20260913-092</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span>Rina Kusuma</span>
              </div>
              <div className="flex justify-between">
                <span>Waktu:</span>
                <span>{new Date().toLocaleDateString('id-ID')} 14:32 WIB</span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
              {cart.map((item) => (
                <div key={item.product.id} className="text-[11px]">
                  <div className="font-medium text-slate-800">{item.product.name}</div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>{item.qty} x Rp {item.product.price.toLocaleString('id-ID')}</span>
                    <span className="font-bold text-slate-800">
                      Rp {(item.product.price * item.qty).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Receipt */}
            <div className="space-y-1 text-[11px] pt-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (11%):</span>
                <span>Rp {tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1">
              <p>Terima Kasih Telah Berbelanja</p>
              <p>Barang yang dibeli tidak dapat ditukar</p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  clearCart();
                }}
                className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
              >
                Selesai & Transaksi Baru
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="px-3 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL AJAKAN BUAT APLIKASI (Triggered when User tries to Generate in Demo) */}
      {/* ========================================================================= */}
      {showAuthModal && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-violet-500/40 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white">
                Mulai Buat Aplikasi Anda Sendiri
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Anda sedang melihat <strong>Live Demo Interaktif 1:1</strong>. Untuk mulai mengetik prompt dan menciptakan software siap pakai yang langsung terbit ke internet, silakan masuk atau daftarkan akun gratis.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gratis 1 Slot Aplikasi Terbit & 250 AI Credits</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10-Step ReAct Engine dengan auto testing & code inspector</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Hosting serverless otomatis & koneksi database instan</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link
                href="/register"
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-violet-600/30"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Daftar Akun Gratis
              </Link>
              <Link
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
              >
                Masuk
              </Link>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors pt-1"
            >
              Lanjutkan Eksplorasi Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
