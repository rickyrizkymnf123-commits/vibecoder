import fs from 'node:fs';
import path from 'node:path';
import { supabaseAdmin } from '../supabase/admin';

export interface AiConfig {
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  updatedAt?: string;
}

const CONFIG_FILE = path.join(process.cwd(), 'data', 'ai_config.json');

const DEFAULT_CONFIG: AiConfig = {
  baseUrl: process.env.AI_BASE_URL || 'https://api.koboillm.com/v1',
  apiKey: process.env.AI_API_KEY || '',
  defaultModel: process.env.AI_DEFAULT_MODEL || 'gemini-2.5-flash'
};

// In-memory cache for fast, seamless access across function invocations
let memoryConfigCache: AiConfig | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache

export function sanitizeApiKey(key: string): string {
  if (!key) return '';
  let cleaned = key.trim();
  // Detect accidental duplicate paste (e.g., sk-...sk-...)
  const secondSk = cleaned.indexOf('sk-', 2);
  if (secondSk !== -1) {
    cleaned = cleaned.substring(0, secondSk).trim();
  }
  return cleaned;
}

/**
 * Loads AI config from Supabase Postgres first, falling back to local file or defaults.
 * This guarantees persistence across serverless lambdas and browser refreshes.
 */
export async function getAiConfigAsync(): Promise<AiConfig> {
  const now = Date.now();
  if (memoryConfigCache && now - lastCacheTime < CACHE_TTL_MS) {
    return { ...memoryConfigCache };
  }

  // 1. Try fetching from Supabase database (storage_files table)
  try {
    const { data, error } = await supabaseAdmin
      .from('storage_files')
      .select('url, created_at')
      .eq('id', 'system_ai_config')
      .single();

    if (!error && data?.url) {
      try {
        const parsed = JSON.parse(data.url);
        const config: AiConfig = {
          baseUrl: parsed.baseUrl || DEFAULT_CONFIG.baseUrl,
          apiKey: sanitizeApiKey(parsed.apiKey || DEFAULT_CONFIG.apiKey),
          defaultModel: parsed.defaultModel || DEFAULT_CONFIG.defaultModel,
          updatedAt: parsed.updatedAt || data.created_at
        };

        memoryConfigCache = config;
        lastCacheTime = now;
        syncToProcessEnv(config);
        return config;
      } catch (_) {}
    }
  } catch (dbErr) {
    console.warn('Failed to fetch ai_config from Supabase, falling back to local file:', dbErr);
  }

  // 2. Fallback to local file
  const localConfig = getAiConfig();
  memoryConfigCache = localConfig;
  lastCacheTime = now;
  return localConfig;
}

/**
 * Synchronous getter (uses memory cache or local file)
 */
export function getAiConfig(): AiConfig {
  if (memoryConfigCache) {
    return { ...memoryConfigCache };
  }

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(data);
      const config: AiConfig = {
        baseUrl: parsed.baseUrl || DEFAULT_CONFIG.baseUrl,
        apiKey: sanitizeApiKey(parsed.apiKey || DEFAULT_CONFIG.apiKey),
        defaultModel: parsed.defaultModel || DEFAULT_CONFIG.defaultModel,
        updatedAt: parsed.updatedAt
      };
      memoryConfigCache = config;
      syncToProcessEnv(config);
      return config;
    }
  } catch (err) {
    console.warn('Failed to read ai_config.json, using default:', err);
  }

  const fallback = { ...DEFAULT_CONFIG, apiKey: sanitizeApiKey(DEFAULT_CONFIG.apiKey) };
  memoryConfigCache = fallback;
  return fallback;
}

/**
 * Saves AI config to Supabase Postgres (persistent across Vercel/serverless instances)
 * AND updates local file and memory cache.
 */
export async function saveAiConfigAsync(newConfig: Partial<AiConfig>): Promise<AiConfig> {
  const current = await getAiConfigAsync();
  const rawKey = newConfig.apiKey !== undefined ? newConfig.apiKey : current.apiKey;
  const cleanedKey = sanitizeApiKey(rawKey);

  const updated: AiConfig = {
    baseUrl: (newConfig.baseUrl !== undefined ? newConfig.baseUrl : current.baseUrl).trim(),
    apiKey: cleanedKey,
    defaultModel: (newConfig.defaultModel !== undefined ? newConfig.defaultModel : current.defaultModel).trim(),
    updatedAt: new Date().toISOString()
  };

  // 1. Update in-memory cache and process.env
  memoryConfigCache = updated;
  lastCacheTime = Date.now();
  syncToProcessEnv(updated);

  // 2. Persist to Supabase Database (storage_files table)
  try {
    let adminUserId = 'user-demo-1';
    try {
      const { data: adminProf } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('role', 'admin')
        .limit(1)
        .single();
      if (adminProf?.id) adminUserId = adminProf.id;
    } catch (_) {}

    const payload = JSON.stringify(updated);
    const row = {
      id: 'system_ai_config',
      user_id: adminUserId,
      name: 'ai_config.json',
      size_bytes: Buffer.byteLength(payload),
      mime_type: 'application/json',
      url: payload,
      created_at: updated.updatedAt
    };

    const { error } = await supabaseAdmin
      .from('storage_files')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Failed to persist ai_config to Supabase:', error.message);
    }
  } catch (dbErr) {
    console.error('Error saving ai_config to Supabase:', dbErr);
  }

  // 3. Persist to local disk if writable
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf8');
  } catch (err) {
    // Might fail on read-only serverless disk, but Supabase persistence covers it
  }

  return updated;
}

/**
 * Synchronous save (triggers async DB sync in background)
 */
export function saveAiConfig(newConfig: Partial<AiConfig>): AiConfig {
  const current = getAiConfig();
  const rawKey = newConfig.apiKey !== undefined ? newConfig.apiKey : current.apiKey;
  const cleanedKey = sanitizeApiKey(rawKey);

  const updated: AiConfig = {
    baseUrl: (newConfig.baseUrl !== undefined ? newConfig.baseUrl : current.baseUrl).trim(),
    apiKey: cleanedKey,
    defaultModel: (newConfig.defaultModel !== undefined ? newConfig.defaultModel : current.defaultModel).trim(),
    updatedAt: new Date().toISOString()
  };

  memoryConfigCache = updated;
  lastCacheTime = Date.now();
  syncToProcessEnv(updated);

  // Background async sync to Supabase
  saveAiConfigAsync(newConfig).catch((e) => console.error('saveAiConfig background sync failed:', e));

  return updated;
}

function syncToProcessEnv(config: AiConfig) {
  process.env.AI_BASE_URL = config.baseUrl;
  process.env.AI_API_KEY = config.apiKey;
  process.env.AI_DEFAULT_MODEL = config.defaultModel;
}

export async function fetchModelsFromProvider(baseUrl: string, apiKey: string): Promise<string[]> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/models`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const cleanKey = sanitizeApiKey(apiKey);
  if (cleanKey) {
    headers['Authorization'] = `Bearer ${cleanKey}`;
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Provider returned ${res.status}: ${errText}`);
    }

    const data = await res.json();
    let models: string[] = [];

    // Standard OpenAI format: { data: [{ id: "model-name" }] }
    if (Array.isArray(data.data)) {
      models = data.data.map((m: any) => m.id || m.name).filter(Boolean);
    } else if (Array.isArray(data.models)) {
      models = data.models.map((m: any) => m.id || m.name || m).filter(Boolean);
    } else if (Array.isArray(data)) {
      models = data.map((m: any) => m.id || m.name || m).filter(Boolean);
    }

    // Sort models cleanly
    models.sort((a, b) => a.localeCompare(b));
    return models;
  } catch (err: any) {
    console.error('fetchModelsFromProvider error:', err.message);
    throw err;
  }
}

/**
 * Resiliently parses AI model response text regardless of format.
 * Supports standard OpenAI JSON, SSE (Server-Sent Events streaming data: {...}), and plain text fallbacks.
 */
export function parseAiResponseText(rawText: string): { reply: string; rawData: any } {
  if (!rawText) return { reply: '', rawData: null };
  const trimmed = rawText.trim();

  // 1. Try parsing standard JSON first
  try {
    const data = JSON.parse(trimmed);
    const reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.delta?.content ||
      data.reply ||
      (typeof data === 'string' ? data : '');
    if (reply) return { reply: String(reply).trim(), rawData: data };
  } catch (_) {
    // Standard JSON parse failed, proceed to SSE / stream parsing
  }

  // 2. Handle Server-Sent Events (SSE) format: lines starting with data:
  if (trimmed.includes('data:')) {
    const lines = trimmed.split('\n');
    const chunks: string[] = [];
    let lastParsedObj: any = null;

    for (const line of lines) {
      const lineTrimmed = line.trim();
      if (lineTrimmed.startsWith('data:')) {
        const jsonStr = lineTrimmed.replace(/^data:\s*/, '').trim();
        if (jsonStr === '[DONE]') continue;
        try {
          const parsed = JSON.parse(jsonStr);
          lastParsedObj = parsed;
          const chunk =
            parsed.choices?.[0]?.delta?.content ||
            parsed.choices?.[0]?.message?.content ||
            '';
          if (chunk) chunks.push(chunk);
        } catch (_) {}
      }
    }

    if (chunks.length > 0) {
      return { reply: chunks.join('').trim(), rawData: lastParsedObj };
    }
  }

  // 3. Fallback: regex search for content field inside stringified payload
  const contentMatch = trimmed.match(/"content"\s*:\s*"([\s\S]*?)"\s*}/);
  if (contentMatch?.[1]) {
    const cleanContent = contentMatch[1]
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    return { reply: cleanContent.trim(), rawData: null };
  }

  return { reply: trimmed, rawData: null };
}
