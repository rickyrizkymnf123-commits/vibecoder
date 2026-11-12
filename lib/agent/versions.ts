import { createHash } from 'node:crypto';
import { supabaseAdmin } from '../supabase/admin';
import { getChatMessages } from '../supabase/db';
import { applyTextEdit, isPlaceholderContent } from './executor';

/**
 * Riwayat versi aplikasi. Setiap kali aplikasi diterbitkan, salinan lengkap berkasnya disimpan ke
 * Supabase Storage (bucket privat `app-versions`, satu JSON per versi). Dengan ini AI bisa melihat dan
 * mengembalikan "versi awal" / "versi sebelumnya" alih-alih menebak dari ingatan percakapan.
 *
 * Aplikasi lama (dibuat sebelum fitur ini ada) direkonstruksi sekali dari riwayat tool call di chat_messages.
 */

const BUCKET = 'app-versions';
const MAX_VERSIONS_FROM_HISTORY = 40;

export interface AppVersionMeta {
  /** Nomor urut, 1 = versi paling awal. */
  number: number;
  objectName: string;
  createdAt: string;
  label: string;
}

export interface AppVersion extends AppVersionMeta {
  files: Record<string, string>;
}

let bucketReady = false;
async function ensureBucket(): Promise<void> {
  if (bucketReady) return;
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: false });
  if (error && !/exist|duplicate/i.test(error.message)) throw new Error(`Gagal menyiapkan bucket versi: ${error.message}`);
  bucketReady = true;
}

function hashFiles(files: Record<string, string>): string {
  const h = createHash('sha256');
  for (const key of Object.keys(files).sort()) {
    h.update(key);
    h.update('\0');
    h.update(files[key] ?? '');
    h.update('\0');
  }
  return h.digest('hex');
}

function cleanFiles(files: Record<string, string> | null | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(files || {})) {
    if (typeof v === 'string' && !isPlaceholderContent(v) && !k.startsWith('screenshots/')) out[k] = v;
  }
  return out;
}

function slugLabel(label: string): string {
  return (
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 50) || 'versi'
  );
}

function parseObjectName(name: string): { ts: number; label: string } | null {
  const m = name.match(/^(\d{10,})__(.*)\.json$/);
  if (!m) return null;
  return { ts: Number(m[1]), label: m[2].replace(/-/g, ' ') };
}

export async function listAppVersions(appKey: string): Promise<AppVersionMeta[]> {
  try {
    await ensureBucket();
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(appKey, { limit: 1000, sortBy: { column: 'name', order: 'asc' } });
    if (error || !data) return [];
    return data
      .map((o) => ({ o, p: parseObjectName(o.name) }))
      .filter((x): x is { o: (typeof data)[number]; p: { ts: number; label: string } } => Boolean(x.p))
      .sort((a, b) => a.p.ts - b.p.ts)
      .map((x, i) => ({ number: i + 1, objectName: x.o.name, createdAt: new Date(x.p.ts).toISOString(), label: x.p.label }));
  } catch (err) {
    console.warn('[Versions] listAppVersions gagal:', err);
    return [];
  }
}

export async function loadAppVersion(appKey: string, meta: AppVersionMeta): Promise<AppVersion | null> {
  try {
    await ensureBucket();
    const { data, error } = await supabaseAdmin.storage.from(BUCKET).download(`${appKey}/${meta.objectName}`);
    if (error || !data) return null;
    const parsed = JSON.parse(await data.text());
    return { ...meta, label: parsed.label || meta.label, files: cleanFiles(parsed.files) };
  } catch (err) {
    console.warn('[Versions] loadAppVersion gagal:', err);
    return null;
  }
}

/** Simpan versi baru. Dilewati jika isinya sama persis dengan versi terakhir. */
export async function saveAppVersion(
  appKey: string,
  files: Record<string, string> | null | undefined,
  label: string,
  opts: { createdAt?: number; skipIfSameAs?: Record<string, string> | null } = {}
): Promise<boolean> {
  const clean = cleanFiles(files);
  if (Object.keys(clean).length === 0) return false;
  try {
    await ensureBucket();
    let previous = opts.skipIfSameAs;
    if (previous === undefined) {
      const list = await listAppVersions(appKey);
      const last = list[list.length - 1];
      previous = last ? (await loadAppVersion(appKey, last))?.files || null : null;
    }
    if (previous && hashFiles(cleanFiles(previous)) === hashFiles(clean)) return false;

    const ts = opts.createdAt || Date.now();
    const body = JSON.stringify({ label, createdAt: new Date(ts).toISOString(), files: clean });
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(`${appKey}/${ts}__${slugLabel(label)}.json`, body, { contentType: 'application/json', upsert: true });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn('[Versions] saveAppVersion gagal:', err);
    return false;
  }
}

/**
 * Bangun ulang riwayat versi dari tool call yang tersimpan di chat (write_file / edit_file yang berhasil).
 * Menghasilkan satu snapshot per balasan AI yang mengubah berkas.
 */
export function reconstructVersionsFromMessages(
  messages: { role: string; content: string; tool_calls?: any[]; created_at: string }[]
): { files: Record<string, string>; label: string; createdAt: number }[] {
  const state: Record<string, string> = {};
  const snapshots: { files: Record<string, string>; label: string; createdAt: number }[] = [];
  let lastUserPrompt = 'versi awal';

  for (const m of messages) {
    if (m.role === 'user') {
      lastUserPrompt = (m.content || '').slice(0, 80) || lastUserPrompt;
      continue;
    }
    if (m.role !== 'assistant' || !Array.isArray(m.tool_calls)) continue;

    let changed = false;
    for (const tc of m.tool_calls) {
      if (!tc || tc.status === 'failed') continue;
      const input = typeof tc.input === 'object' && tc.input ? tc.input : {};
      const output = typeof tc.output === 'object' && tc.output ? tc.output : {};
      const p = typeof input.path === 'string' ? input.path.replace(/^\.?\//, '') : '';
      if (!p) continue;

      if (tc.tool === 'write_file' && typeof input.content === 'string') {
        if (output.status === 'preserved' || isPlaceholderContent(input.content)) continue;
        if (input.append && state[p] !== undefined) {
          const prev = state[p];
          state[p] = prev + (prev.endsWith('\n') ? '' : '\n') + input.content;
        } else {
          state[p] = input.content;
        }
        changed = true;
      } else if (tc.tool === 'edit_file' && state[p] !== undefined) {
        if (output.status && output.status !== 'modified') continue;
        const res = applyTextEdit(state[p], input.target_content, input.replacement_content);
        if (res.ok) {
          state[p] = res.content;
          changed = true;
        }
      }
    }

    if (changed) {
      snapshots.push({ files: { ...state }, label: snapshots.length === 0 ? `versi awal - ${lastUserPrompt}` : lastUserPrompt, createdAt: new Date(m.created_at).getTime() || Date.now() });
    }
  }
  return snapshots.slice(-MAX_VERSIONS_FROM_HISTORY);
}

/**
 * Pastikan aplikasi punya riwayat versi. Untuk aplikasi lama tanpa riwayat, rekonstruksi dari chat lalu
 * simpan juga versi saat ini (dari DB) bila berbeda. Mengembalikan daftar versi.
 */
export async function ensureVersionHistory(appKey: string, currentFiles: Record<string, string> | null | undefined): Promise<AppVersionMeta[]> {
  const existing = await listAppVersions(appKey);
  if (existing.length > 0) return existing;

  try {
    const messages = await getChatMessages(appKey);
    const snaps = reconstructVersionsFromMessages(messages as any);
    let prev: Record<string, string> | null = null;
    let lastTs = 0;
    for (const s of snaps) {
      const ts = Math.max(s.createdAt, lastTs + 1);
      if (await saveAppVersion(appKey, s.files, s.label, { createdAt: ts, skipIfSameAs: prev })) {
        prev = s.files;
        lastTs = ts;
      }
    }
    await saveAppVersion(appKey, currentFiles, 'versi saat ini', { createdAt: Math.max(Date.now(), lastTs + 1), skipIfSameAs: prev });
  } catch (err) {
    console.warn('[Versions] ensureVersionHistory gagal:', err);
  }
  return listAppVersions(appKey);
}

/** Tentukan versi yang dimaksud pengguna: "awal/pertama/asli" → versi 1; selain itu → versi sebelum yang sekarang. */
export function detectVersionReference(prompt: string): 'first' | 'previous' | null {
  const p = prompt.toLowerCase();
  if (/(versi|tampilan|desain|bentuk|model)\s*(yang\s*)?(paling\s*)?(awal|pertama|asli|original|semula)|seperti\s*(awal|semula)|kayak\s*(awal|semula)|kaya\s*(awal|semula)|dari\s*awal\s*(tadi|dulu)/.test(p)) return 'first';
  if (/versi\s*(sebelum(nya)?|lama|kemarin|tadi|terakhir)|balik(in|kan)?\b|kembali(kan)?\s*(ke|seperti|kayak)?|undo|rollback|batalkan\s*(revisi|perubahan)|seperti\s*(sebelum(nya)?|tadi)|kayak\s*(sebelum(nya)?|tadi)/.test(p)) return 'previous';
  return null;
}

export function pickReferencedVersion(versions: AppVersionMeta[], ref: 'first' | 'previous'): AppVersionMeta | null {
  if (versions.length === 0) return null;
  if (ref === 'first') return versions[0];
  return versions.length >= 2 ? versions[versions.length - 2] : versions[0];
}
