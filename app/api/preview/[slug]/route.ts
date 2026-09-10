import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { getAppBySlug, saveApp } from '@/lib/supabase/db';

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
        const fn = new Function(`return ${match[1]};`);
        const evaluated = fn();
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
        const fn = new Function(`return ${match[1]};`);
        const evaluated = fn();
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
      const wsDir = path.join(process.cwd(), 'workspaces', app.session_id);
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
      const wsDir = path.join(process.cwd(), 'workspaces', app.session_id);
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
  const app = await getAppBySlug(slug);

  if (!app) {
    return NextResponse.json({ error: 'Aplikasi tidak ditemukan' }, { status: 404 });
  }

  const records = extractRecords(app);
  const users = extractUsers(app);

  return NextResponse.json({
    success: true,
    app: {
      id: app.id,
      name: app.name,
      slug: app.slug,
      status: app.status,
      published_at: app.published_at,
      records,
      users,
      files: Object.keys(app.files || {})
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