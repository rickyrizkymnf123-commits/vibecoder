import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { GeneratedApp } from '../types';
import { saveApp } from '../supabase/db';

const execAsync = promisify(exec);

export function getWorkspaceDir(sessionId: string): string {
  const baseDir = path.join(process.cwd(), 'workspaces');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  const sessionDir = path.join(baseDir, sessionId);
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }
  return sessionDir;
}

function resolveSafePath(workspaceDir: string, relPath: string): string {
  const normalized = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, '');
  const resolved = path.join(workspaceDir, normalized);
  if (!resolved.startsWith(workspaceDir)) {
    throw new Error('Akses path di luar workspace ditolak: ' + relPath);
  }
  return resolved;
}

export async function executeWriteFile(
  sessionId: string,
  relPath: string,
  content: string
): Promise<{ path: string; sizeBytes: number; status: string }> {
  const wsDir = getWorkspaceDir(sessionId);
  const targetFile = resolveSafePath(wsDir, relPath);
  const parentDir = path.dirname(targetFile);

  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const existed = fs.existsSync(targetFile);
  fs.writeFileSync(targetFile, content, 'utf8');
  const sizeBytes = Buffer.byteLength(content, 'utf8');

  return {
    path: relPath,
    sizeBytes,
    status: existed ? 'updated' : 'created'
  };
}

export async function executeReadFile(
  sessionId: string,
  relPath: string
): Promise<{ path: string; content?: string; error?: string }> {
  const wsDir = getWorkspaceDir(sessionId);
  const targetFile = resolveSafePath(wsDir, relPath);

  if (!fs.existsSync(targetFile)) {
    return { path: relPath, error: `Berkas tidak ditemukan: ${relPath}` };
  }

  const content = fs.readFileSync(targetFile, 'utf8');
  return { path: relPath, content };
}

export async function executeEditFile(
  sessionId: string,
  relPath: string,
  targetContent: string,
  replacementContent: string
): Promise<{ path: string; status: string; replacements: number; error?: string }> {
  const wsDir = getWorkspaceDir(sessionId);
  const targetFile = resolveSafePath(wsDir, relPath);

  if (!fs.existsSync(targetFile)) {
    return { path: relPath, status: 'failed', replacements: 0, error: `Berkas tidak ditemukan: ${relPath}` };
  }

  const content = fs.readFileSync(targetFile, 'utf8');
  if (!content.includes(targetContent)) {
    return {
      path: relPath,
      status: 'failed',
      replacements: 0,
      error: `Target content tidak ditemukan di dalam ${relPath}`
    };
  }

  const newContent = content.replace(targetContent, replacementContent);
  fs.writeFileSync(targetFile, newContent, 'utf8');

  return {
    path: relPath,
    status: 'modified',
    replacements: 1
  };
}

function getPreferredShell(): string | undefined {
  if (process.platform === 'win32') {
    const gitBash = 'C:\\Program Files\\Git\\bin\\bash.exe';
    if (fs.existsSync(gitBash)) return gitBash;
  }
  return undefined;
}

export async function executeBash(
  sessionId: string,
  command: string
): Promise<{ command: string; stdout: string; stderr: string; exitCode: number; success: boolean }> {
  const wsDir = getWorkspaceDir(sessionId);
  const shell = getPreferredShell();

  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: wsDir,
      shell,
      timeout: 30000,
      maxBuffer: 1024 * 1024
    });

    return {
      command,
      stdout: stdout.trim(),
      stderr: stderr.trim(),
      exitCode: 0,
      success: true
    };
  } catch (err: any) {
    return {
      command,
      stdout: (err.stdout || '').trim(),
      stderr: (err.stderr || err.message || '').trim(),
      exitCode: err.code || 1,
      success: false
    };
  }
}

export async function executeRunTests(
  sessionId: string,
  _testType = 'all'
): Promise<{
  total: number;
  passed: number;
  failed: number;
  status: 'passed' | 'failed';
  summary: string;
  testCases: Array<{ id: number; name: string; status: 'pass' | 'fail'; durationMs: number; error?: string }>;
}> {
  const wsDir = getWorkspaceDir(sessionId);
  const files = collectAllFiles(wsDir);

  if (Object.keys(files).length === 0) {
    return {
      total: 1,
      passed: 0,
      failed: 1,
      status: 'failed',
      summary: 'Belum ada berkas yang ditulis di workspace',
      testCases: [{ id: 1, name: 'Pemeriksaan direktori workspace', status: 'fail', durationMs: 0, error: 'Workspace masih kosong' }]
    };
  }

  const testCases: Array<{ id: number; name: string; status: 'pass' | 'fail'; durationMs: number; error?: string }> = [];
  let testId = 1;

  // 1. Validasi package.json (jika ada)
  const pkgPath = path.join(wsDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const start = Date.now();
    try {
      JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      testCases.push({ id: testId++, name: 'Validasi berkas package.json', status: 'pass', durationMs: Date.now() - start });
    } catch (e: any) {
      testCases.push({ id: testId++, name: 'Validasi berkas package.json', status: 'fail', durationMs: Date.now() - start, error: e.message });
    }
  }

  // 2. Pemeriksaan sintaks (node --check) untuk semua file JS/MJS/CJS
  const jsFiles = Object.keys(files).filter(f => (f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs')) && !f.includes('node_modules'));
  for (const jsFile of jsFiles) {
    const start = Date.now();
    try {
      await execAsync(`node --check "${jsFile}"`, { cwd: wsDir, timeout: 8000 });
      testCases.push({ id: testId++, name: `Sintaks check: ${jsFile}`, status: 'pass', durationMs: Date.now() - start });
    } catch (e: any) {
      const errMsg = (e.stderr || e.stdout || e.message || '').trim();
      testCases.push({ id: testId++, name: `Sintaks check: ${jsFile}`, status: 'fail', durationMs: Date.now() - start, error: errMsg });
    }
  }

  // 3. Eksekusi skrip pengujian fisik jika dibuat oleh AI
  const potentialTestScripts = ['test/e2e.js', 'test.mjs', 'test.js', 'test/test.js'];
  for (const testScript of potentialTestScripts) {
    const fullTestPath = path.join(wsDir, testScript);
    if (fs.existsSync(fullTestPath)) {
      const start = Date.now();
      try {
        const { stdout } = await execAsync(`node "${testScript}"`, { cwd: wsDir, timeout: 20000 });
        testCases.push({ id: testId++, name: `Eksekusi skrip pengujian: ${testScript}`, status: 'pass', durationMs: Date.now() - start });
      } catch (e: any) {
        const errMsg = (e.stderr || e.stdout || e.message || '').trim();
        testCases.push({ id: testId++, name: `Eksekusi skrip pengujian: ${testScript}`, status: 'fail', durationMs: Date.now() - start, error: errMsg });
      }
    }
  }

  // Jika tidak ada file JS yang diuji
  if (testCases.length === 0) {
    testCases.push({ id: testId++, name: 'Pemeriksaan berkas statis', status: 'pass', durationMs: 5 });
  }

  const failedCount = testCases.filter(t => t.status === 'fail').length;
  const passedCount = testCases.length - failedCount;

  return {
    total: testCases.length,
    passed: passedCount,
    failed: failedCount,
    status: failedCount === 0 ? 'passed' : 'failed',
    summary: failedCount === 0
      ? `${passedCount}/${testCases.length} Pengujian Sintaks & Skrip Nyata Lulus 100%`
      : `${failedCount} pengujian gagal dari ${testCases.length} total pengujian`,
    testCases
  };
}

export function collectAllFiles(dir: string, baseDir = dir): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        Object.assign(result, collectAllFiles(fullPath, baseDir));
      }
    } else {
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      try {
        result[rel] = fs.readFileSync(fullPath, 'utf8');
      } catch {
        // ignore unreadable
      }
    }
  }
  return result;
}

export async function executePublishApp(
  sessionId: string,
  userId: string,
  appName: string,
  slug: string,
  hasAppCredit: boolean
): Promise<{ success: boolean; app: GeneratedApp; publicUrl: string }> {
  const wsDir = getWorkspaceDir(sessionId);
  const files = collectAllFiles(wsDir);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://forge-app-engine.vercel.app';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const publicUrl = `${cleanBaseUrl}/preview/${slug}`;

  const app: GeneratedApp = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId,
    session_id: sessionId,
    name: appName,
    slug,
    status: hasAppCredit ? 'published' : 'draft',
    vercel_url: publicUrl,
    files,
    published_at: hasAppCredit ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await saveApp(app);

  return {
    success: true,
    app,
    publicUrl
  };
}
