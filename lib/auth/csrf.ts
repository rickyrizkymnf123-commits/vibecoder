import { createHmac, timingSafeEqual } from 'node:crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'forge-default-csrf-secret-key-salt-9988';

export function generateCsrfToken(userIdOrSession: string): string {
  const timestamp = Date.now().toString();
  const signature = createHmac('sha256', CSRF_SECRET)
    .update(`${userIdOrSession}:${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifyCsrfToken(userIdOrSession: string, token: string, maxAgeMs = 24 * 60 * 60 * 1000): boolean {
  try {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;

    const [timestampStr, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > maxAgeMs) {
      return false; // Expired
    }

    const expectedSignature = createHmac('sha256', CSRF_SECRET)
      .update(`${userIdOrSession}:${timestampStr}`)
      .digest('hex');

    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  } catch {
    return false;
  }
}
