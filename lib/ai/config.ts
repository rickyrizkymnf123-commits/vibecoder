import fs from 'node:fs';
import path from 'node:path';

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

export function getAiConfig(): AiConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf8');
      const parsed = JSON.parse(data);
      return {
        baseUrl: parsed.baseUrl || DEFAULT_CONFIG.baseUrl,
        apiKey: parsed.apiKey || DEFAULT_CONFIG.apiKey,
        defaultModel: parsed.defaultModel || DEFAULT_CONFIG.defaultModel,
        updatedAt: parsed.updatedAt
      };
    }
  } catch (err) {
    console.warn('Failed to read ai_config.json, using default:', err);
  }
  return { ...DEFAULT_CONFIG };
}

export function saveAiConfig(newConfig: Partial<AiConfig>): AiConfig {
  const current = getAiConfig();
  const updated: AiConfig = {
    baseUrl: (newConfig.baseUrl !== undefined ? newConfig.baseUrl : current.baseUrl).trim(),
    apiKey: (newConfig.apiKey !== undefined ? newConfig.apiKey : current.apiKey).trim(),
    defaultModel: (newConfig.defaultModel !== undefined ? newConfig.defaultModel : current.defaultModel).trim(),
    updatedAt: new Date().toISOString()
  };

  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf8');
    
    // Also update current process env for immediate sync
    process.env.AI_BASE_URL = updated.baseUrl;
    process.env.AI_API_KEY = updated.apiKey;
    process.env.AI_DEFAULT_MODEL = updated.defaultModel;
  } catch (err) {
    console.error('Failed to write ai_config.json:', err);
  }

  return updated;
}

export async function fetchModelsFromProvider(baseUrl: string, apiKey: string): Promise<string[]> {
  const cleanUrl = baseUrl.replace(/\/+$/, '');
  const url = `${cleanUrl}/models`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
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
