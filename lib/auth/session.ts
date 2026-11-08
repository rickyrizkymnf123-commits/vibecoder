import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { UserProfile, AppRole } from '../types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'forge-session-secret-key-32bytes-len';
export const SESSION_COOKIE_NAME = 'forge_session';
export const IMPERSONATION_COOKIE_NAME = 'forge_impersonation';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  subdomain: string;
  role?: AppRole;
  exp: number;
  is_impersonating?: boolean;
  original_admin_id?: string;
  original_admin_email?: string;
  original_admin_username?: string;
}

export function signSession(payload: Omit<SessionPayload, 'exp'>, expiresInSeconds = 30 * 24 * 60 * 60): string {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const data = JSON.stringify({ ...payload, exp });
  const dataB64 = Buffer.from(data).toString('base64url');
  const signature = createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifySession(token: string): SessionPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const [dataB64, signature] = token.split('.');
    if (!dataB64 || !signature) return null;

    const expectedSignature = createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
    const isValid = timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    if (!isValid) return null;

    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf8');
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // expired
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getRealAdminUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const realUser = verifySession(token);
    if (!realUser) return null;
    const isRealAdmin =
      realUser.role === 'admin' ||
      realUser.username === 'demo' ||
      realUser.email === 'demo@vibecoder.app' ||
      realUser.email === 'rickyrizkymnf123@gmail.com' ||
      realUser.username === 'ricky' ||
      realUser.username === 'rickyrizky';
    if (!isRealAdmin) return null;
    return realUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const realUser = verifySession(token);
    if (!realUser) return null;

    const isRealAdmin =
      realUser.role === 'admin' ||
      realUser.username === 'demo' ||
      realUser.email === 'demo@vibecoder.app' ||
      realUser.email === 'rickyrizkymnf123@gmail.com' ||
      realUser.username === 'ricky' ||
      realUser.username === 'rickyrizky';

    if (isRealAdmin) {
      const impToken = cookieStore.get(IMPERSONATION_COOKIE_NAME)?.value;
      if (impToken) {
        const impUser = verifySession(impToken);
        if (impUser) {
          return {
            ...impUser,
            is_impersonating: true,
            original_admin_id: realUser.userId,
            original_admin_email: realUser.email,
            original_admin_username: realUser.username
          };
        }
      }
    }

    return realUser;
  } catch {
    return null;
  }
}
