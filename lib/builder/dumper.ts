import { GeneratedApp } from '../types';

function extractRecordsFromApp(app: GeneratedApp): any[] {
  if (!app.files) return [];
  if (app.files['data/records.json']) {
    try {
      const parsed = JSON.parse(app.files['data/records.json']);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  if (app.files['records.json']) {
    try {
      const parsed = JSON.parse(app.files['records.json']);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {}
  }
  if (app.files['lib/db.js']) {
    try {
      const dbJs = app.files['lib/db.js'];
      const match = dbJs.match(/let\s+records\s*=\s*(\[[\s\S]*?\]);/);
      if (match) {
        const fn = new Function(`return ${match[1]};`);
        const evaluated = fn();
        if (Array.isArray(evaluated) && evaluated.length > 0) return evaluated;
      }
    } catch {}
  }
  return [];
}

export function dumpAppDatabase(app: GeneratedApp, format: 'sql' | 'csv' = 'sql'): string {
  const schema = app.db_schema_name || `app_${app.slug.replace(/-/g, '_')}`;
  const realRecords = extractRecordsFromApp(app);

  if (format === 'csv') {
    // Generate CSV export for items/transactions
    const csvHeader = 'id,title,category,amount_cents,status,created_at\n';
    if (realRecords.length > 0) {
      const rows = realRecords.map((r, idx) => {
        const id = r.id || String(idx + 1);
        const title = `"${String(r.title || '').replace(/"/g, '""')}"`;
        const category = `"${String(r.category || 'Umum').replace(/"/g, '""')}"`;
        const amount = Number(r.amount_cents) || 0;
        const status = r.status || 'selesai';
        const createdAt = r.created_at || new Date().toISOString();
        return `${id},${title},${category},${amount},${status},${createdAt}`;
      }).join('\n');
      return `${csvHeader}${rows}\n`;
    }

    const defaultRows = [
      `1,"Pemasukan Operasional Awal","Revenue",500000000,completed,${new Date().toISOString()}`,
      `2,"Pembelian Perlengkapan Kantor","Expense",125000000,completed,${new Date().toISOString()}`
    ].join('\n');
    return `${csvHeader}${defaultRows}\n`;
  }

  // SQL format
  const recordInserts = realRecords.length > 0
    ? realRecords.map((r, idx) => {
        const id = r.id ? `'${r.id}'` : `gen_random_uuid()`;
        const title = String(r.title || '').replace(/'/g, "''");
        const category = String(r.category || 'Umum').replace(/'/g, "''");
        const amount = Number(r.amount_cents) || 0;
        const status = String(r.status || 'selesai').replace(/'/g, "''");
        return `  ('a0000000-0000-0000-0000-000000000001', '${title}', '${category}', ${amount}, '${status}')`;
      }).join(',\n')
    : `  ('a0000000-0000-0000-0000-000000000001', 'Pemasukan Operasional Awal', 'Revenue', 500000000, 'completed'),
  ('a0000000-0000-0000-0000-000000000001', 'Pembelian Perlengkapan Kantor', 'Expense', 125000000, 'completed')`;

  return `-- =========================================================
-- Database Dump for App: ${app.name} (${app.slug})
-- Schema: ${schema}
-- Generated at: ${new Date().toISOString()}
-- =========================================================

CREATE SCHEMA IF NOT EXISTS "${schema}";

-- USERS TABLE
CREATE TABLE IF NOT EXISTS "${schema}"."users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ITEMS / RECORDS TABLE
CREATE TABLE IF NOT EXISTS "${schema}"."records" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES "${schema}"."users"(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount_cents BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SEED DATA
INSERT INTO "${schema}"."users" (id, email, username, password_hash, role)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@${app.slug}.local', 'admin', 'scrypt:admin123', 'admin'),
  ('a0000000-0000-0000-0000-000000000002', 'user@${app.slug}.local', 'member', 'scrypt:user123', 'user')
ON CONFLICT (username) DO NOTHING;

INSERT INTO "${schema}"."records" (user_id, title, category, amount_cents, status)
VALUES
${recordInserts}
ON CONFLICT DO NOTHING;
`;
}
