import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getCreditTransactions } from '@/lib/supabase/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const transactions = await getCreditTransactions(user.userId);
  return NextResponse.json({ transactions });
}
