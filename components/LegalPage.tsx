import Link from 'next/link';
import type { ReactNode } from 'react';
import { buildAdminWhatsAppLink } from '@/lib/contact';

export const LEGAL_LAST_UPDATED = '9 November 2026';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-300">{children}</div>
    </section>
  );
}

export function AdminContact() {
  const link = buildAdminWhatsAppLink('Halo Admin Kilat Tools, saya ingin bertanya.');
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline hover:text-emerald-300">
      WhatsApp Admin Kilat Tools
    </a>
  ) : (
    <span className="text-white">WhatsApp Admin Kilat Tools</span>
  );
}

export default function LegalPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0b0f19] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-violet-400 hover:text-violet-300">
          ← Kembali ke Beranda
        </Link>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">{title}</h1>
        <p className="mt-2 text-xs text-slate-500">Terakhir diperbarui: {LEGAL_LAST_UPDATED}</p>
        <p className="mt-6 text-sm leading-relaxed text-slate-300">{intro}</p>
        <div className="mt-10 space-y-10">{children}</div>
        <nav className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-6 text-xs text-slate-400">
          <Link href="/syarat-ketentuan" className="hover:text-white">Syarat &amp; Ketentuan</Link>
          <Link href="/kebijakan-privasi" className="hover:text-white">Kebijakan Privasi</Link>
          <Link href="/kebijakan-refund" className="hover:text-white">Kebijakan Refund</Link>
        </nav>
      </div>
    </div>
  );
}
