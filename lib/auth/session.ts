import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { UserProfile } from '../types';

const SESSION_SECRET = process.env.SESSION_SECRET || 'forge-session-secret-key-32bytes-len';
export const SESSION_COOKIE_NAME = 'forge_session';

export interface SessionPayload {
  userId: string;
  email: string;
  username: string;
  subdomain: string;
  exp: number;
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

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySession(token);
  } catch {
    return null;
  }
}
