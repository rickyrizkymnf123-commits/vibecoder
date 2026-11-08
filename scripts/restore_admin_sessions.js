const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kkbieorezsifotmhavqa.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function collectAllFiles(dir, base = '') {
  const result = {};
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      Object.assign(result, collectAllFiles(fullPath, relPath));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const binaryExts = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.eot', '.pdf', '.zip'];
      if (binaryExts.includes(ext)) {
        try {
          const buf = fs.readFileSync(fullPath);
          const mime = ext === '.svg' ? 'image/svg+xml' : (ext === '.png' ? 'image/png' : (ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'application/octet-stream'));
          result[relPath] = `data:${mime};base64,${buf.toString('base64')}`;
        } catch (e) {
          console.warn(`Failed reading binary ${fullPath}:`, e.message);
        }
      } else {
        try {
          const text = fs.readFileSync(fullPath, 'utf8');
          const cleanText = text.replace(/\u0000/g, '');
          result[relPath] = cleanText;
        } catch (e) {
          console.warn(`Failed reading text ${fullPath}:`, e.message);
        }
      }
    }
  }
  return result;
}

async function restore() {
  console.log('--- Starting Admin Sessions Restoration ---');

  // 1. Target admin users
  const adminUsers = ['user-superadmin-ricky', 'user-1790095953569-i5rfe', 'user-demo-1'];

  // 2. Define sessions to restore
  const sessionsToRestore = [
    {
      id: 'ses-1789662332029-u2s5n',
      title: 'Aplikasi Kasir Uji Coba',
      app_slug: 'kasirpro-pos-stok',
      app_name: 'KasirPro - Sistem Kasir POS & Manajemen Stok Pintar',
      app_desc: 'Sistem Kasir Modern & Manajemen Stok Barang Masuk/Keluar dengan Alert Stok Minimum dan Cetak Struk.',
      workspace_dir: path.join(__dirname, '..', 'workspaces', 'ses-1789662332029-u2s5n'),
      created_at: '2026-09-17T16:25:32.029Z',
      updated_at: '2026-09-24T08:00:00.000Z'
    },
    {
      id: 'ses-gudangku-admin-1789300652191',
      title: 'GudangKu - Sistem Inventori & Stok Barang',
      app_slug: 'gudangku-inventori-stok',
      app_name: 'GudangKu Enterprise — Sistem Manajemen & Otomasi Operasional Gudang',
      app_desc: 'Sistem manajemen inventori stok gudang multi-gudang dengan pelacakan barang masuk/keluar, SKU barcode, dan reorder point.',
      workspace_dir: path.join(__dirname, '..', 'workspaces', 'ses-gudangku-admin-1789300652191'),
      created_at: '2026-09-13T10:57:32.191Z',
      updated_at: '2026-09-24T08:05:00.000Z',
      initial_user_msg: 'Buatkan saya aplikasi inventori stok barang gudang sederhana. Ada pencatatan barang masuk dan keluar, stok minimum, dan laporan mutasi.',
      initial_assistant_msg: `<!-- GENERATION_MODE: live-ai -->
Saya telah merancang, membangun, dan menerbitkan aplikasi web kelas enterprise **GudangKu — Sistem Manajemen Inventori & Stok Barang**.

### 🌟 Fitur Utama yang Telah Selesai:
1. **Pencatatan Barang Masuk & Keluar**: Formulir mutasi stok real-time dengan validasi SKU.
2. **Alert Stok Minimum**: Notifikasi otomatis saat stok mendekati batas aman.
3. **Katalog Master Barang & Barcode**: Pengelolaan SKU, kategori, dan lokasi rak.
4. **Laporan Mutasi & Kartu Stok**: Riwayat pergerakan stok lengkap dapat diekspor.
5. **Dashboard Analitik**: Ringkasan total nilai aset, perputaran barang, dan status operasional.

Aplikasi telah terbit dan siap digunakan langsung melalui Live Staging Canvas.`
    },
    {
      id: 'ses-pos-berkah-admin-1789300652474',
      title: 'POS Kasir & Stok Toko Berkah',
      app_slug: 'pos-berkah',
      app_name: 'Toko Berkah — POS Kasir Cepat & Manajemen Stok Sembako',
      app_desc: 'Point of Sale modern untuk toko kelontong & sembako dengan perhitungan PPN 11%, keranjang belanja, cetak struk thermal, dan audit stok.',
      workspace_dir: path.join(__dirname, '..', 'workspaces', 'ses-pos-berkah-admin-1789300652474'),
      created_at: '2026-09-13T11:27:32.474Z',
      updated_at: '2026-09-24T08:10:00.000Z',
      initial_user_msg: 'Buatkan aplikasi POS Kasir dan Manajemen Stok Toko Berkah lengkap dengan keranjang belanja, kalkulasi PPN 11%, cetak struk thermal, dan pencatatan kas harian.',
      initial_assistant_msg: `<!-- GENERATION_MODE: live-ai -->
Saya telah merancang, membangun, dan menerbitkan aplikasi web **POS Kasir & Manajemen Stok Toko Berkah**.

### 🌟 Fitur Unggulan yang Siap Digunakan:
1. **Kasir Cepat (Speed Checkout)**: Antarmuka POS responsif dengan tombol pintas dan keranjang dinamis.
2. **Kalkulasi Otomatis PPN 11% & Diskon**: Perhitungan akurat nilai subtotal, pajak, dan kembalian.
3. **Cetak Struk Thermal 58mm/80mm**: Format struk siap cetak dengan rincian item.
4. **Manajemen Stok Realtime**: Stok otomatis terpotong setiap transaksi berhasil.
5. **Laporan Kas Harian & Omset**: Rekapitulasi penjualan per kasir dan shift.`
    },
    {
      id: 'ses-1789038253459-z7fgt',
      title: 'FinAiLedger - Manajemen Keuangan & AI Advisor',
      app_slug: 'finailedger-telegram-finance',
      app_name: 'Smart Financial Management App with AI Advisor & Telegram Bot Integration',
      app_desc: 'Pencatatan keuangan cerdas dengan AI penasehat finansial, analitik arus kas, dan integrasi Telegram Bot.',
      workspace_dir: path.join(__dirname, '..', 'workspaces', 'ses-1789038253459-z7fgt'),
      created_at: '2026-09-10T11:04:13.459Z',
      updated_at: '2026-09-24T08:15:00.000Z',
      initial_user_msg: 'Tolong buatkan saya aplikasi untuk manajemen keuangan personal dan bisnis dengan AI advisor serta laporan pengeluaran.',
      initial_assistant_msg: `<!-- GENERATION_MODE: live-ai -->
Saya telah membangun aplikasi web **FinAiLedger — Smart Financial Management & AI Advisor**.

### 🌟 Fitur Utama:
1. **Pencatatan Arus Kas**: Pemasukan dan pengeluaran dengan kategori otomatis.
2. **AI Financial Advisor**: Rekomendasi penghematan dan analisis alokasi anggaran.
3. **Grafik Visual & Laporan**: Visualisasi tren pengeluaran bulanan.
4. **Integrasi Multi-Akun**: Kelola rekening bank, e-wallet, dan kas tunai.`
    }
  ];

  // 3. Process each session
  for (const session of sessionsToRestore) {
    console.log(`\nRestoring session [${session.id}] - "${session.title}"...`);

    const files = collectAllFiles(session.workspace_dir);
    console.log(`  Collected ${Object.keys(files).length} files from workspace: ${session.workspace_dir}`);

    // Create app record for each admin user
    for (const userId of adminUsers) {
      // Upsert Chat Session
      // If user is superadmin ricky, use base id, for other admins, keep or link
      const userSessionId = userId === 'user-superadmin-ricky' ? session.id : `${session.id}-${userId.substring(userId.length - 5)}`;

      const sessionPayload = {
        id: userSessionId,
        user_id: userId,
        title: session.title,
        app_slug: session.app_slug,
        status: 'deployed',
        created_at: session.created_at,
        updated_at: session.updated_at
      };

      const { error: sessErr } = await supabase.from('chat_sessions').upsert(sessionPayload);
      if (sessErr) {
        console.error(`  Error upserting chat_session for ${userId}:`, sessErr);
      } else {
        console.log(`  ✓ Chat session upserted for user ${userId} (ID: ${userSessionId})`);
      }

      // Upsert App Record
      const appId = `app-${session.app_slug}-${userId.substring(userId.length - 5)}`;
      const appPayload = {
        id: appId,
        user_id: userId,
        session_id: userSessionId,
        name: session.app_name,
        slug: session.app_slug,
        status: 'published',
        files: files,
        created_at: session.created_at,
        updated_at: session.updated_at
      };

      const { error: appErr } = await supabase.from('apps').upsert(appPayload);
      if (appErr) {
        console.error(`  Error upserting app for ${userId}:`, appErr);
      } else {
        console.log(`  ✓ App "${session.app_name}" upserted for user ${userId}`);
      }

      // Upsert Chat Messages if session has messages
      if (session.initial_user_msg && session.initial_assistant_msg) {
        const userMsgPayload = {
          id: `msg-${userSessionId}-user`,
          session_id: userSessionId,
          role: 'user',
          content: session.initial_user_msg,
          created_at: session.created_at
        };

        const assistantMsgPayload = {
          id: `msg-${userSessionId}-assistant`,
          session_id: userSessionId,
          role: 'assistant',
          content: session.initial_assistant_msg,
          created_at: session.updated_at
        };

        await supabase.from('chat_messages').upsert([userMsgPayload, assistantMsgPayload]);
        console.log(`  ✓ Chat messages upserted for session ${userSessionId}`);
      }
    }
  }

  console.log('\n--- Restoration Completed Successfully ---');
}

restore().catch(console.error);
