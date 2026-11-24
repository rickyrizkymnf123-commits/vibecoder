// Mode maintenance: dipakai bersama oleh middleware (Edge) dan route/server (Node).
// Status disimpan di Supabase tabel storage_files (id = system_maintenance), sama seperti ai_config.
// Edge-safe: hanya fetch + WebCrypto, tanpa node:crypto atau supabase-js.

export const MAINTENANCE_ROW_ID = 'system_maintenance';
export const DEFAULT_MAINTENANCE_MESSAGE =
  'Kilat Tools sedang dalam perawatan untuk peningkatan layanan. Silakan kembali beberapa saat lagi.';

export interface MaintenanceState {
  enabled: boolean;
  message: string;
  updatedAt?: string;
  updatedBy?: string;
}

/** Dipakai bila belum pernah ada baris di DB atau DB tidak bisa dibaca. Set MAINTENANCE_DEFAULT_ON=1 di env untuk default aktif. */
export function defaultMaintenanceState(): MaintenanceState {
  return {
    enabled: process.env.MAINTENANCE_DEFAULT_ON === '1',
    message: DEFAULT_MAINTENANCE_MESSAGE
  };
}

export function parseMaintenanceRow(raw: string | null | undefined): MaintenanceState | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw);
    return {
      enabled: Boolean(p.enabled),
      message: typeof p.message === 'string' && p.message.trim() ? p.message : DEFAULT_MAINTENANCE_MESSAGE,
      updatedAt: p.updatedAt,
      updatedBy: p.updatedBy
    };
  } catch {
    return null;
  }
}

const supabaseUrl = () => process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkbieorezsifotmhavqa.supabase.co';

let cache: { state: MaintenanceState; at: number } | null = null;
const CACHE_MS = 10_000;

/** Baca status lewat Supabase REST (Edge-safe). Cache 10 detik per instance agar tidak query tiap request. */
export async function readMaintenanceState(opts: { fresh?: boolean } = {}): Promise<MaintenanceState> {
  if (!opts.fresh && cache && Date.now() - cache.at < CACHE_MS) return cache.state;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let state = defaultMaintenanceState();
  if (key) {
    try {
      const res = await fetch(
        `${supabaseUrl()}/rest/v1/storage_files?id=eq.${MAINTENANCE_ROW_ID}&select=url`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: 'no-store', signal: AbortSignal.timeout(4000) }
      );
      if (res.ok) {
        const rows = (await res.json()) as { url?: string }[];
        state = parseMaintenanceRow(rows[0]?.url) ?? state;
      }
    } catch {
      // DB tidak terjangkau: pakai default env
    }
  }
  cache = { state, at: Date.now() };
  return state;
}

export function invalidateMaintenanceCache() {
  cache = null;
}

// ---- Cek admin dari cookie sesi (format sama dengan lib/auth/session.ts: base64url(json).base64url(hmac-sha256)) ----

const ADMIN_EMAILS = ['demo@vibecoder.app', 'rickyrizkymnf123@gmail.com'];
const ADMIN_USERNAMES = ['demo', 'ricky', 'rickyrizky'];

function b64urlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

/** True bila cookie sesi asli (bukan impersonasi) milik admin dan tanda tangannya valid. */
export async function isAdminSessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [dataB64, sigB64] = token.split('.');
  if (!dataB64 || !sigB64) return false;
  try {
    const secret = process.env.SESSION_SECRET || 'forge-session-secret-key-32bytes-len';
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(sigB64), new TextEncoder().encode(dataB64));
    if (!ok) return false;
    const p = JSON.parse(new TextDecoder().decode(b64urlToBytes(dataB64)));
    if (!p || typeof p.exp !== 'number' || p.exp < Math.floor(Date.now() / 1000)) return false;
    return p.role === 'admin' || ADMIN_EMAILS.includes(p.email) || ADMIN_USERNAMES.includes(p.username);
  } catch {
    return false;
  }
}

// ---- Path yang tetap terbuka saat maintenance ----

const OPEN_PAGES = ['/', '/login', '/maintenance', '/kebijakan-privasi', '/kebijakan-refund', '/syarat-ketentuan'];
const OPEN_PAGE_PREFIXES = ['/u/', '/preview/'];
// Login/logout/register, status maintenance, webhook pembayaran, dan runtime aplikasi user yang sudah publish.
const OPEN_API_PREFIXES = ['/api/auth', '/api/maintenance', '/api/payments/webhook', '/api/preview'];

export function isOpenDuringMaintenance(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p.startsWith('/api/')) return OPEN_API_PREFIXES.some((x) => p === x || p.startsWith(x + '/'));
  return OPEN_PAGES.includes(p) || OPEN_PAGE_PREFIXES.some((x) => p.startsWith(x));
}
