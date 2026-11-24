import { NextResponse } from 'next/server';
import { getMaintenanceState } from '@/lib/maintenance/store';

export const dynamic = 'force-dynamic';

// Publik: dipakai halaman /maintenance untuk menampilkan pesan.
export async function GET() {
  const s = await getMaintenanceState();
  return NextResponse.json({ enabled: s.enabled, message: s.message });
}
