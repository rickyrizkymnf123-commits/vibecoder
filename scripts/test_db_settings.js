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

async function test() {
  const { data: sysData, error: sysError } = await client.from('system_settings').select('*').limit(1);
  console.log('system_settings:', { sysData, sysError });

  const { data: profData, error: profError } = await client.from('profiles').select('*').eq('role', 'admin').limit(1);
  console.log('admin profile columns:', Object.keys(profData?.[0] || {}));

  // Check if we can store ai config in profiles or create system_settings table via SQL API or RPC or store in app_settings or storage_files
  const { data: storeData, error: storeError } = await client.from('storage_files').select('*').limit(1);
  console.log('storage_files:', { storeData, storeError });
}
test();
