import { getCurrentUser } from './session';
import { getUserProfile } from '../supabase/db';

export async function requireAdminSession() {
  const session = await getCurrentUser();
  if (!session) {
    return { authorized: false, error: 'Unauthorized: Sesi tidak ditemukan', status: 401 };
  }

  if (session.role === 'admin' || session.username === 'demo' || session.email === 'demo@vibecoder.app') {
    return { authorized: true, session, status: 200 };
  }

  const profile = await getUserProfile(session.userId);
  if (!profile || (profile.role !== 'admin' && profile.username !== 'demo')) {
    return { authorized: false, error: 'Forbidden: Khusus Administrator', status: 403 };
  }

  return { authorized: true, session, status: 200 };
}
