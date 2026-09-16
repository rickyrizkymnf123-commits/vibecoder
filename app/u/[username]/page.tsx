import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Globe, ExternalLink, Zap, ArrowRight, Shield, Layers } from 'lucide-react';

interface Props {
  params: { username: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const username = decodeURIComponent(params.username);
  return {
    title: `Aplikasi Publik ${username} — Kilat Tools`,
    description: `Daftar aplikasi web mandiri yang dibangun dan diterbitkan oleh ${username} menggunakan Kilat Tools.`
  };
}

export default async function UserSubdomainDirectoryPage({ params }: Props) {
  const username = decodeURIComponent(params.username);

  // 1. Fetch user profile from Supabase
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, username, subdomain, email, is_pro, created_at')
    .or(`username.eq.${username},subdomain.eq.${username}`)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#070a12] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/80 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto text-violet-400">
            <Globe className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white">Subdomain Tidak Ditemukan</h1>
          <p className="text-sm text-slate-400">
            Subdomain <span className="text-violet-400 font-mono font-semibold">{username}.kilatstools.my.id</span> belum terdaftar atau belum memiliki aplikasi aktif.
          </p>
          <div className="pt-2">
            <a
              href="https://www.kilatstools.my.id"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/25"
            >
              <span>Buka Kilat Tools</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Fetch published apps for this user
  const { data: apps } = await supabaseAdmin
    .from('apps')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  const publishedApps = apps || [];

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between selection:bg-violet-500 selection:text-white">
      {/* Top Header */}
      <header className="px-6 sm:px-12 py-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-amber-400 flex items-center justify-center font-black text-white text-base shadow-md shadow-violet-600/20">
            ⚡
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{profile.username || username}</span>
              {profile.is_pro && (
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              {profile.subdomain || username}.kilatstools.my.id
            </div>
          </div>
        </div>

        <a
          href="https://www.kilatstools.my.id"
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent hover:border-slate-800"
        >
          <span>Dibuat dengan Kilat Tools</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
      </header>

      {/* Main Content Area (VibeCoder Style Showcase) */}
      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-12 flex-1 space-y-8">
        <div className="space-y-2 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Katalog Aplikasi Web Mandiri</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            App milik {profile.username || username}
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Pilih salah satu aplikasi di bawah ini untuk membuka live app yang berjalan secara real-time dan terisolasi.
          </p>
        </div>

        {/* List of Apps */}
        {publishedApps.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Belum Ada Aplikasi Terbit</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Pengguna ini belum mempublikasikan aplikasi ke subdomain publik.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedApps.map((app) => (
              <div
                key={app.id}
                className="group p-5 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/90 hover:border-violet-500/50 transition-all duration-200 flex flex-col justify-between space-y-4 shadow-sm hover:shadow-xl hover:shadow-violet-600/5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                        {app.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 font-bold">
                      LIVE
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 font-mono truncate">
                    Path: <span className="text-indigo-300">/{app.slug}</span>
                  </p>

                  {app.custom_domain && (
                    <p className="text-xs text-amber-300 font-mono flex items-center gap-1.5 pt-1">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span>{app.custom_domain}</span>
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Runtime: Node.js / React
                  </span>
                  <a
                    href={`/preview/${app.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20"
                  >
                    <span>Buka App</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-400">
        <p>
          Diberdayakan oleh{' '}
          <a
            href="https://www.kilatstools.my.id"
            className="text-violet-400 hover:underline font-bold"
          >
            Kilat Tools (VibeCoder Engine)
          </a>{' '}
          — AI Application Builder Multi-Tenant SaaS.
        </p>
      </footer>
    </div>
  );
}
