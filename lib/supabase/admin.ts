import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkbieorezsifotmhavqa.supabase.co';
// Wajib diisi lewat env (Vercel). Placeholder hanya agar build tidak gagal saat env tidak tersedia.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'missing-service-role-key';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
