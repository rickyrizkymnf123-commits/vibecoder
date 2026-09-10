import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kilat Tools — Bangun & Publish Aplikasi Web Secepat Kilat Lewat Chat AI',
  description: 'Platform AI SaaS App Generator super cepat. Cukup deskripsikan aplikasi dalam bahasa natural, AI Kilat Tools akan merencanakan, membangun modul, menguji skenario in-process, dan mem-publish live ke URL publik secara instan.',
  keywords: ['kilat tools', 'ai app builder', 'vibecoder', 'nextjs', 'supabase', 'vercel']
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-violet-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
