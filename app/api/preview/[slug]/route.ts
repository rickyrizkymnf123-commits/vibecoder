import { NextRequest, NextResponse } from 'next/server';
import { parseJsArrayLiteral } from '@/lib/safe-literal';
import fs from 'node:fs';
import path from 'node:path';
import { getAppBySlug, getChatSessionById, saveApp } from '@/lib/supabase/db';
import { getCurrentUser } from '@/lib/auth/session';
import { getBaseWorkspacesDir, getWorkspaceDir } from '@/lib/agent/executor';
import { getActiveSessionState } from '@/lib/agent/loop';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function extractRecords(app: any): any[] {
  if (!app || !app.files) return [];

  // 1. Direct JSON storage in files
  if (app.files['data/records.json']) {
    try {
      const parsed = JSON.parse(app.files['data/records.json']);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  if (app.files['records.json']) {
    try {
      const parsed = JSON.parse(app.files['records.json']);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  // 2. Parse from lib/db.js
  if (app.files['lib/db.js']) {
    try {
      const dbJs = app.files['lib/db.js'];
      const match = dbJs.match(/let\s+records\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        // Parse sebagai data murni — JANGAN mengeksekusi kode buatan AI di server
        const evaluated = parseJsArrayLiteral(match[1]);
        if (Array.isArray(evaluated)) return evaluated;
      }
    } catch {}
  }

  return [];
}

function extractUsers(app: any): any[] {
  if (!app || !app.files) return [];

  if (app.files['data/users.json']) {
    try {
      const parsed = JSON.parse(app.files['data/users.json']);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }

  if (app.files['lib/db.js']) {
    try {
      const dbJs = app.files['lib/db.js'];
      const match = dbJs.match(/let\s+users\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        // Parse sebagai data murni — JANGAN mengeksekusi kode buatan AI di server
        const evaluated = parseJsArrayLiteral(match[1]);
        if (Array.isArray(evaluated)) return evaluated;
      }
    } catch {}
  }

  return [
    { id: 'usr-1', username: 'admin', name: 'Administrator', role: 'Admin', status: 'aktif', email: 'admin@app.dev' },
    { id: 'usr-2', username: 'budi', name: 'Budi Santoso', role: 'User', status: 'aktif', email: 'budi@gmail.com' }
  ];
}

function syncRecordsToApp(app: any, records: any[]) {
  if (!app.files) app.files = {};
  app.files['data/records.json'] = JSON.stringify(records, null, 2);

  if (app.files['lib/db.js']) {
    const dbJs = app.files['lib/db.js'];
    if (/let\s+records\s*=\s*\[[\s\S]*?\];/.test(dbJs)) {
      app.files['lib/db.js'] = dbJs.replace(
        /let\s+records\s*=\s*\[[\s\S]*?\];/,
        `let records = ${JSON.stringify(records, null, 2)};`
      );
    }
  }

  if (app.session_id) {
    try {
      const wsDir = getWorkspaceDir(app.session_id);
      if (fs.existsSync(wsDir)) {
        const recDir = path.join(wsDir, 'data');
        if (!fs.existsSync(recDir)) fs.mkdirSync(recDir, { recursive: true });
        fs.writeFileSync(path.join(recDir, 'records.json'), JSON.stringify(records, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to sync mutated records to disk workspace:', err);
    }
  }
}

function syncUsersToApp(app: any, users: any[]) {
  if (!app.files) app.files = {};
  app.files['data/users.json'] = JSON.stringify(users, null, 2);

  if (app.files['lib/db.js']) {
    const dbJs = app.files['lib/db.js'];
    if (/let\s+users\s*=\s*\[[\s\S]*?\];/.test(dbJs)) {
      app.files['lib/db.js'] = dbJs.replace(
        /let\s+users\s*=\s*\[[\s\S]*?\];/,
        `let users = ${JSON.stringify(users, null, 2)};`
      );
    }
  }

  if (app.session_id) {
    try {
      const wsDir = getWorkspaceDir(app.session_id);
      if (fs.existsSync(wsDir)) {
        const recDir = path.join(wsDir, 'data');
        if (!fs.existsSync(recDir)) fs.mkdirSync(recDir, { recursive: true });
        fs.writeFileSync(path.join(recDir, 'users.json'), JSON.stringify(users, null, 2), 'utf8');
      }
    } catch (err) {
      console.warn('Failed to sync mutated users to disk workspace:', err);
    }
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  let app = await getAppBySlug(slug);

  // Fallback 1: Cek chat_sessions
  if (!app && slug) {
    try {
      const chatSession = await getChatSessionById(slug);
      if (chatSession?.app_slug) {
        app = await getAppBySlug(chatSession.app_slug);
      }
    } catch {}
  }

  // Fallback 2: Cek active session di memory
  const activeSession = getActiveSessionState(slug);
  if (!app && activeSession?.deployedApp) {
    app = activeSession.deployedApp as any;
  }

  // Fallback 3: Kumpulkan berkas fisik dari workspace di disk jika ada
  const workspacesDir = getBaseWorkspacesDir();
  let diskWsDir = '';

  if (app && app.session_id) {
    const candidate = getWorkspaceDir(app.session_id);
    if (fs.existsSync(candidate)) diskWsDir = candidate;
  }

  if (!diskWsDir && slug) {
    const directCandidate = getWorkspaceDir(slug);
    if (fs.existsSync(directCandidate)) diskWsDir = directCandidate;
  }

  if (!diskWsDir && fs.existsSync(workspacesDir)) {
    try {
      const dirs = fs.readdirSync(workspacesDir);
      for (const d of dirs) {
        if (d.toLowerCase().includes(slug.toLowerCase()) || (app && d === app.session_id)) {
          diskWsDir = path.join(workspacesDir, d);
          break;
        }
      }
    } catch {}
  }

  const files: Record<string, string> = { ...(app?.files || {}) };

  if (diskWsDir && fs.existsSync(diskWsDir)) {
    const readDirRecursive = (dir: string, base: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (e.name === 'node_modules' || e.name === '.git' || e.name === 'screenshots') continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          readDirRecursive(full, base);
        } else {
          const rel = path.relative(base, full).replace(/\\/g, '/');
          try {
            const fileContent = fs.readFileSync(full, 'utf8');
            if (!fileContent.startsWith('[Berkas tersimpan di disk')) {
              files[rel] = fileContent;
            }
          } catch {}
        }
      }
    };
    readDirRecursive(diskWsDir, diskWsDir);
  }

  if (!app && Object.keys(files).length === 0) {
    return NextResponse.json({ error: 'Aplikasi belum dibuat', app: null }, { status: 404 });
  }

  const virtualApp: any = app || {
    id: slug,
    name: 'Aplikasi Web',
    slug,
    status: 'published',
    published_at: new Date().toISOString()
  };

  virtualApp.files = files;
  const records = extractRecords(virtualApp);
  const users = extractUsers(virtualApp);

  return NextResponse.json({
    success: true,
    app: {
      id: virtualApp.id,
      name: virtualApp.name,
      slug: virtualApp.slug,
      status: virtualApp.status,
      published_at: virtualApp.published_at,
      records,
      users,
      files
    }
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const app = await getAppBySlug(slug);
  if (!app) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  const body = await req.json();

function findStringDiff(oldStr: string, newStr: string): { oldPart: string; newPart: string } {
  if (!oldStr || !newStr) return { oldPart: oldStr || '', newPart: newStr || '' };
  let start = 0;
  while (start < oldStr.length && start < newStr.length && oldStr[start] === newStr[start]) {
    start++;
  }
  let endOld = oldStr.length - 1;
  let endNew = newStr.length - 1;
  while (endOld >= start && endNew >= start && oldStr[endOld] === newStr[endNew]) {
    endOld--;
    endNew--;
  }
  const oldPart = oldStr.substring(start, endOld + 1).trim();
  const newPart = newStr.substring(start, endNew + 1).trim();
  return { oldPart, newPart };
}

  // 0. DIRECT VISUAL WYSIWYG SAVE (0 TOKEN - TANPA AI - INSTAN 0.1 DETIK)
  if (body.action === 'direct-save') {
    // Edit visual mengubah berkas aplikasi -> hanya pemilik aplikasi (atau admin) yang boleh
    const editor = await getCurrentUser();
    if (!editor || (editor.userId !== app.user_id && editor.role !== 'admin')) {
      return NextResponse.json({ error: 'Hanya pemilik aplikasi yang dapat mengedit tampilan' }, { status: 403 });
    }
    if (!app.files) app.files = {};
    const oldText = body.oldText ? String(body.oldText).trim() : '';
    const newText = body.newText !== undefined ? String(body.newText).trim() : '';
    let oldHtml = body.oldHtml ? String(body.oldHtml).trim() : '';
    let newHtml = body.newHtml ? String(body.newHtml).trim() : '';

    // Bersihkan kelas atau atribut inspector dari newHtml sebelum disimpan permanen
    const cleanForgeAttributes = (html: string) => {
      return html
        .replace(/class=["'][^"']*forge-[^"']*["']/gi, (match) => {
          const cleaned = match
            .replace(/forge-active-editing/g, '')
            .replace(/forge-element-selected-box/g, '')
            .replace(/forge-hover-highlight/g, '')
            .replace(/forge-inspector-active/g, '')
            .replace(/\s+/g, ' ')
            .replace(/class=["']\s*["']/, '');
          return cleaned;
        })
        .replace(/\s*contenteditable=["']true["']/gi, '')
        .replace(/\s*spellcheck=["'][^"']*["']/gi, '');
    };

    if (newHtml) newHtml = cleanForgeAttributes(newHtml);
    if (oldHtml) oldHtml = cleanForgeAttributes(oldHtml);

    let modifiedFiles: string[] = [];

    // Tier 1: Substring diffing (misal user hanya ubah "Barang Masuk" -> "barang jasa" dalam satu kalimat panjang)
    const { oldPart, newPart } = findStringDiff(oldText, newText);
    const searchTargets = [
      { from: oldPart, to: newPart },
      { from: oldText, to: newText },
      { from: oldHtml, to: newHtml }
    ].filter(item => item.from && item.to && item.from !== item.to);

    for (const target of searchTargets) {
      for (const [filePath, content] of Object.entries(app.files)) {
        if (typeof content !== 'string') continue;
        let fileText = content;
        let matched = false;

        if (fileText.includes(target.from)) {
          fileText = fileText.split(target.from).join(target.to);
          matched = true;
        }

        // Entity variants
        const entityFrom = target.from.replace(/&/g, '&amp;');
        const entityTo = target.to.replace(/&/g, '&amp;');
        if (!matched && fileText.includes(entityFrom)) {
          fileText = fileText.split(entityFrom).join(entityTo);
          matched = true;
        }

        if (matched) {
          app.files[filePath] = fileText;
          if (!modifiedFiles.includes(filePath)) modifiedFiles.push(filePath);
        }
      }
    }

    // Tier 2: Clean full HTML injection jika dikirim dari client
    if (body.cleanHtml) {
      const htmlTargetKey = app.files['public/index.html'] ? 'public/index.html' : (app.files['index.html'] ? 'index.html' : Object.keys(app.files).find(k => k.endsWith('.html')) || 'public/index.html');
      app.files[htmlTargetKey] = body.cleanHtml;
      if (!modifiedFiles.includes(htmlTargetKey)) modifiedFiles.push(htmlTargetKey);
    }

    if (body.targetFile && body.content) {
      app.files[body.targetFile] = body.content;
      if (!modifiedFiles.includes(body.targetFile)) modifiedFiles.push(body.targetFile);
    }

    if (body.cssAppend) {
      const cssKey = app.files['public/css/style.css'] ? 'public/css/style.css' : (app.files['css/style.css'] ? 'css/style.css' : (Object.keys(app.files).find(k => k.endsWith('.css')) || 'public/css/style.css'));
      app.files[cssKey] = (app.files[cssKey] || '') + `\n/* Direct User Visual Edit */\n${body.cssAppend}\n`;
      if (!modifiedFiles.includes(cssKey)) modifiedFiles.push(cssKey);
    }

    // Sinkronkan berkas yang berubah ke disk workspace fisik
    const targetSession = app.session_id || slug;
    try {
      const wsDir = getWorkspaceDir(targetSession);
      if (fs.existsSync(wsDir)) {
        for (const f of modifiedFiles) {
          const fullPath = path.join(wsDir, f);
          fs.mkdirSync(path.dirname(fullPath), { recursive: true });
          fs.writeFileSync(fullPath, app.files[f], 'utf8');
        }
      }
    } catch (wsErr) {
      console.warn('Failed saving direct edit to disk workspace:', wsErr);
    }

    await saveApp(app);
    return NextResponse.json({
      success: true,
      message: 'Perubahan teks berhasil disimpan permanen ke Frontend & Database (0 Token)',
      modifiedFiles
    });
  }

  // If adding user
  if (body.type === 'user') {
    const { name, username, email, role } = body;
    if (!name || !username) {
      return NextResponse.json({ error: 'Nama dan username wajib diisi' }, { status: 400 });
    }
    const users = extractUsers(app);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: String(name).trim(),
      username: String(username).trim().toLowerCase(),
      email: email || `${username}@example.com`,
      role: role || 'User',
      status: 'aktif'
    };
    users.push(newUser);
    syncUsersToApp(app, users);
    await saveApp(app);
    return NextResponse.json({ success: true, user: newUser });
  }

  // Otherwise adding transaction/record
  const { title, category, amount_cents, status, type } = body;
  if (!title) {
    return NextResponse.json({ error: 'Judul/Nama entitas wajib diisi' }, { status: 400 });
  }

  const records = extractRecords(app);

  const newRecord = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    user_id: 'u-user',
    title: String(title).trim(),
    category: category || 'Umum',
    amount_cents: Number(amount_cents) || 0,
    status: status || 'selesai',
    type: type || (category === 'Pemasukan' ? 'income' : 'expense'),
    created_at: new Date().toISOString()
  };

  records.unshift(newRecord);
  syncRecordsToApp(app, records);
  await saveApp(app);

  return NextResponse.json({ success: true, record: newRecord });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  const app = await getAppBySlug(slug);
  if (!app) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  const body = await req.json();
  const { id, type } = body;

  if (type === 'user') {
    let users = extractUsers(app);
    users = users.filter((u) => u.id !== id);
    syncUsersToApp(app, users);
    await saveApp(app);
    return NextResponse.json({ success: true });
  }

  let records = extractRecords(app);
  records = records.filter((r) => r.id !== id);
  syncRecordsToApp(app, records);
  await saveApp(app);

  return NextResponse.json({ success: true });
}