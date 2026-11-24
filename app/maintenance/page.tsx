import Link from 'next/link';
import { Wrench } from 'lucide-react';
import { KilatLogo } from '@/components/KilatLogo';
import { getMaintenanceState } from '@/lib/maintenance/store';
import { LogoutButton } from './LogoutButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sedang Maintenance — Kilat Tools', robots: { index: false } };

export default async function MaintenancePage() {
  const { message } = await getMaintenanceState();
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-center shadow-2xl shadow-indigo-950/40">
        <div className="flex justify-center mb-6">
          <KilatLogo size="md" />
        </div>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/30 bg-amber-400/10">
          <Wrench className="h-7 w-7 text-amber-300" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Sedang Maintenance</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 whitespace-pre-line">{message}</p>
        <p className="mt-2 text-xs text-slate-500">Data dan aplikasi yang sudah kamu publish tetap aman dan tetap bisa diakses.</p>
        <div className="mt-7 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition"
          >
            Kembali ke beranda
          </Link>
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
