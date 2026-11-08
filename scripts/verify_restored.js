const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkbieorezsifotmhavqa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verify() {
  const sessions = [
    'ses-gudangku-admin-1789300652191',
    'ses-pos-berkah-admin-1789300652474',
    'ses-1789038253459-z7fgt',
    'ses-1789662332029-u2s5n'
  ];

  console.log('=== VERIFYING RESTORED SESSIONS ===');
  for (const s of sessions) {
    const { data: msgs } = await supabase.from('chat_messages').select('id, role, content').eq('session_id', s);
    const { data: apps } = await supabase.from('apps').select('id, name, slug, files').eq('session_id', s);

    const app = apps && apps.length > 0 ? apps[0] : null;
    const fileCount = app && app.files ? Object.keys(app.files).length : 0;
    console.log(`[${s}]`);
    console.log(`  - Messages count: ${msgs ? msgs.length : 0}`);
    console.log(`  - App: ${app ? app.name : 'N/A'} (${fileCount} files)`);
  }
}

verify().catch(console.error);
