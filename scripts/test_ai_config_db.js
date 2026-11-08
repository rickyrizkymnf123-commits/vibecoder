const fs = require('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.substring(0, idx).trim();
    const v = line.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    env[k] = v;
  }
});
const { createClient } = require('@supabase/supabase-js');
const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testStorageFiles() {
  const config = {
    baseUrl: 'https://api.koboillm.com/v1',
    apiKey: 'sk-test123456',
    defaultModel: 'gemini-3.7-flash',
    updatedAt: new Date().toISOString()
  };

  // 1. Upsert into storage_files
  const row = {
    id: 'system_ai_config',
    user_id: '00000000-0000-0000-0000-000000000000', // wait, user_id might be a foreign key to profiles
    name: 'ai_config.json',
    size_bytes: Buffer.byteLength(JSON.stringify(config)),
    mime_type: 'application/json',
    url: JSON.stringify(config),
    created_at: new Date().toISOString()
  };

  // Let's get real admin profile ID first
  const { data: adminProf } = await client.from('profiles').select('id').eq('role', 'admin').limit(1).single();
  console.log('admin profile ID:', adminProf?.id);
  if (adminProf?.id) {
    row.user_id = adminProf.id;
  }

  const { data: upsertData, error: upsertErr } = await client
    .from('storage_files')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();

  console.log('storage_files upsert:', { upsertData, upsertErr });

  // Read back
  const { data: readData, error: readErr } = await client
    .from('storage_files')
    .select('*')
    .eq('id', 'system_ai_config')
    .single();

  console.log('storage_files read:', { readData: readData ? JSON.parse(readData.url) : null, readErr });
}

testStorageFiles();
