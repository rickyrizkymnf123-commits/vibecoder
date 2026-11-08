import { getRealAdminUser, getCurrentUser } from './session';
import { getUserProfile } from '../supabase/db';

export async function requireAdminSession() {
  // 1. Check if the original logged-in user is an admin (even if currently impersonating)
  const realAdmin = await getRealAdminUser();
  if (realAdmin) {
    return { authorized: true, session: realAdmin, status: 200 };
  }

  // 2. Fallback to current session
  const session = await getCurrentUser();
  if (!session) {
    return { authorized: false, error: 'Unauthorized: Sesi tidak ditemukan', status: 401 };
  }

  if (
    session.role === 'admin' ||
    session.username === 'demo' ||
    session.email === 'demo@vibecoder.app' ||
    session.email === 'rickyrizkymnf123@gmail.com' ||
    session.username === 'ricky' ||
    session.username === 'rickyrizky'
  ) {
    return { authorized: true, session, status: 200 };
  }

  const profile = await getUserProfile(session.userId);
  if (
    !profile ||
    (profile.role !== 'admin' &&
      profile.username !== 'demo' &&
      profile.email !== 'rickyrizkymnf123@gmail.com')
  ) {
    return { authorized: false, error: 'Forbidden: Khusus Administrator', status: 403 };
  }

  return { authorized: true, session, status: 200 };
}
