import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Forge — Bangun & Publish Aplikasi Web Apapun Lewat Chat AI',
  description: 'Platform AI SaaS App Generator terunggul. Cukup deskripsikan aplikasi dalam bahasa natural, AI akan merencanakan, membangun modul, menguji 16 skenario in-process, dan mem-publish live ke URL publik secara instan.',
  keywords: ['ai app builder', 'forge', 'nextjs', 'supabase', 'vercel']
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
