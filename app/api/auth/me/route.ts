import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { getUserProfile } from '@/lib/supabase/db';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const impersonationInfo = session.is_impersonating ? {
    is_impersonating: true,
    original_admin: {
      id: session.original_admin_id,
      email: session.original_admin_email,
      username: session.original_admin_username
    }
  } : {};

  try {
    const profile = await getUserProfile(session.userId);
    if (profile) {
      return NextResponse.json({
        user: {
          ...profile,
          ...impersonationInfo
        }
      });
    }
  } catch (err) {
    console.warn('Could not fetch user profile from Supabase, using fallback session data:', err);
  }

  // Graceful fallback from verified session token so transient DB glitches don't cause sudden logout
  const fallbackProfile = {
    id: session.userId,
    email: session.email,
    username: session.username,
    subdomain: session.subdomain || session.username,
    app_credits: 1,
    ai_credits: 50000,
    is_pro: false,
    pro_until: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...impersonationInfo
  };

  return NextResponse.json({ user: fallbackProfile });
}
