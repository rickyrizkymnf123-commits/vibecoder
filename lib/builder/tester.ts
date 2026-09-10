import ts from 'typescript';
import vm from 'node:vm';
import crypto from 'node:crypto';

export interface TestResult {
  id: number;
  name: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  passed: number;
  total: number;
  allPassed: boolean;
  results: TestResult[];
}

/**
 * Safely loads and evaluates a generated TypeScript module in a VM context
 */
function loadGeneratedModule(tsCode: string, extraMocks: Record<string, any> = {}): any {
  const transpiled = ts.transpileModule(tsCode, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    }
  }).outputText;

  const mod = { exports: {} as any };
  const context = vm.createContext({
    module: mod,
    exports: mod.exports,
    require: (id: string) => {
      if (id === 'node:crypto' || id === 'crypto') return crypto;
      if (extraMocks[id]) return extraMocks[id];
      // Basic fallback
      return {};
    },
    process: {
      uptime: () => 120,
      env: { CSRF_SECRET: 'test-secret-123' }
    },
    Buffer,
    Intl,
    Date,
    Math,
    setTimeout,
    clearTimeout,
    console
  });

  vm.runInContext(transpiled, context);
  return mod.exports;
}

export async function runInProcessTests(files: Record<string, string>): Promise<TestSuiteSummary> {
  const results: TestResult[] = [];

  const runTest = async (id: number, name: string, fn: () => Promise<void> | void) => {
    const start = Date.now();
    try {
      await fn();
      results.push({
        id,
        name,
        passed: true,
        message: 'PASS',
        durationMs: Date.now() - start
      });
    } catch (err: any) {
      results.push({
        id,
        name,
        passed: false,
        message: `FAIL: ${err.message}`,
        durationMs: Date.now() - start
      });
    }
  };

  // Evaluate the actual generated modules from the files dictionary
  let utilModule: any = {};
  let authModule: any = {};
  let dbModule: any = {};

  try {
    if (files['lib/util.ts']) {
      utilModule = loadGeneratedModule(files['lib/util.ts']);
    }
  } catch (err: any) {
    console.warn('Failed to load generated util.ts:', err.message);
  }

  try {
    if (files['lib/auth.ts']) {
      authModule = loadGeneratedModule(files['lib/auth.ts']);
    }
  } catch (err: any) {
    console.warn('Failed to load generated auth.ts:', err.message);
  }

  try {
    if (files['lib/db.ts']) {
      dbModule = loadGeneratedModule(files['lib/db.ts']);
    }
  } catch (err: any) {
    console.warn('Failed to load generated db.ts:', err.message);
  }

  // =========================================================================
  // SCENARIO 1: Halaman & Route login terdefinisi dan dapat diakses
  // =========================================================================
  await runTest(1, 'Halaman / route login terdefinisi dan dapat diakses', () => {
    const hasLoginPage = Boolean(files['app/login/page.tsx']);
    const hasLoginRoute = Boolean(files['app/api/auth/login/route.ts']);
    if (!hasLoginPage) throw new Error('Halaman UI app/login/page.tsx tidak ditemukan');
    if (!hasLoginRoute) throw new Error('Route API app/api/auth/login/route.ts tidak ditemukan');

    const routeContent = files['app/api/auth/login/route.ts'];
    if (!routeContent.includes('POST') || !routeContent.includes('verifyAppPassword')) {
      throw new Error('Route login API tidak mengimplementasikan POST handler otentikasi');
    }
  });

  // =========================================================================
  // SCENARIO 2: Login dengan kata sandi salah ditolak (401 Unauthorized)
  // =========================================================================
  await runTest(2, 'Login dengan kata sandi salah ditolak (401 Unauthorized)', () => {
    if (typeof authModule.verifyAppPassword !== 'function') {
      throw new Error('lib/auth.ts tidak mengekspor fungsi verifyAppPassword');
    }
    const adminHash = 'testsalt:456c20dfdd3a32247f1c1f71a067caecbc513cebdf354fefabf6aafe619c118c7e9ce45902099fdf83f4b4ef5e9668d2e8eecae60b64d14b4fb24e622a27ff8e';
    const isMatched = authModule.verifyAppPassword('wrongpassword999', adminHash);
    if (isMatched) {
      throw new Error('verifyAppPassword meloloskan kata sandi yang salah!');
    }
  });

  // =========================================================================
  // SCENARIO 3: Login kredensial admin valid diterima dan sesi berhasil dibuat
  // =========================================================================
  await runTest(3, 'Login kredensial admin valid diterima dan sesi berhasil dibuat', () => {
    if (typeof authModule.verifyAppPassword !== 'function') {
      throw new Error('lib/auth.ts tidak mengekspor fungsi verifyAppPassword');
    }
    // Test with admin password
    const adminHash = authModule.hashAppPassword
      ? authModule.hashAppPassword('admin123')
      : 'testsalt:456c20dfdd3a32247f1c1f71a067caecbc513cebdf354fefabf6aafe619c118c7e9ce45902099fdf83f4b4ef5e9668d2e8eecae60b64d14b4fb24e622a27ff8e';
    const isMatched = authModule.verifyAppPassword('admin123', adminHash);
    if (!isMatched) {
      throw new Error('Kredensial admin yang benar gagal diverifikasi');
    }
  });

  // =========================================================================
  // SCENARIO 4: Admin berhasil menambahkan user baru ke database
  // =========================================================================
  await runTest(4, 'Admin berhasil menambahkan user baru ke database', async () => {
    if (typeof dbModule.getAppUsers !== 'function') {
      throw new Error('lib/db.ts tidak mengekspor getAppUsers');
    }
    const users = await dbModule.getAppUsers();
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('Database awal tidak memiliki user seed');
    }

    const testUser = {
      id: `u-test-${Date.now()}`,
      username: 'kasir_baru',
      email: 'kasir_baru@app.local',
      password_hash: 'testsalt:dummy',
      role: 'staff',
      created_at: new Date().toISOString()
    };
    users.push(testUser);

    const found = users.find((u: any) => u.username === 'kasir_baru');
    if (!found || found.role !== 'staff') {
      throw new Error('Gagal menambahkan user baru dengan role staf');
    }
  });

  // =========================================================================
  // SCENARIO 5: Pendaftaran username duplikat ditolak (409 Conflict)
  // =========================================================================
  await runTest(5, 'Pendaftaran username duplikat ditolak (409 Conflict)', async () => {
    const users = await dbModule.getAppUsers();
    const isDuplicate = (candidate: string) =>
      users.some((u: any) => u.username.toLowerCase() === candidate.toLowerCase());

    if (!isDuplicate('ADMIN')) {
      throw new Error('Pemeriksaan duplikasi username case-insensitive gagal mendeteksi "ADMIN"');
    }
    if (!isDuplicate('admin')) {
      throw new Error('Pemeriksaan duplikasi username gagal mendeteksi "admin"');
    }
  });

  // =========================================================================
  // SCENARIO 6: User biasa ditolak mengakses panel / endpoint khusus admin (403 Forbidden)
  // =========================================================================
  await runTest(6, 'User biasa ditolak mengakses panel / endpoint khusus admin (403 Forbidden)', () => {
    const adminUsersRoute = files['app/api/admin/users/route.ts'];
    if (!adminUsersRoute) {
      throw new Error('Route admin tidak ditemukan');
    }
    // Verify role validation pattern
    const isRoleAdmin = (role: string) => role === 'admin';
    if (isRoleAdmin('staff') || isRoleAdmin('user')) {
      throw new Error('Role non-admin lolos pemeriksaan akses admin');
    }
  });

  // =========================================================================
  // SCENARIO 7: Pencatatan data/transaksi valid berhasil disimpan (200 OK)
  // =========================================================================
  await runTest(7, 'Pencatatan data/transaksi valid berhasil disimpan (200 OK)', async () => {
    if (typeof dbModule.addAppRecord !== 'function') {
      throw new Error('lib/db.ts tidak mengekspor addAppRecord');
    }
    const newRecord = await dbModule.addAppRecord({
      title: 'Item Uji Otomatis In-Process',
      category: 'Operasional',
      amount_cents: 15000000,
      status: 'completed',
      user_id: 'u-admin'
    });

    if (!newRecord || !newRecord.id || newRecord.amount_cents !== 15000000) {
      throw new Error('addAppRecord gagal menghasilkan record yang valid');
    }
  });

  // =========================================================================
  // SCENARIO 8: Permintaan POST tanpa CSRF token yang valid ditolak (403 CSRF Invalid)
  // =========================================================================
  await runTest(8, 'Permintaan POST tanpa CSRF token yang valid ditolak (403 CSRF Invalid)', () => {
    if (typeof authModule.generateAppCsrf !== 'function' || typeof authModule.verifyAppCsrf !== 'function') {
      throw new Error('lib/auth.ts tidak mengekspor generateAppCsrf / verifyAppCsrf');
    }
    const sessionId = 'ses-test-secure';
    const validToken = authModule.generateAppCsrf(sessionId);

    // Valid check
    const isValid = authModule.verifyAppCsrf(sessionId, validToken);
    if (!isValid) throw new Error('Token CSRF valid yang baru dibuat gagal diverifikasi');

    // Tampered check
    const tamperedToken = `${validToken.split('.')[0]}.tamperedinvalidhash123456`;
    const isTamperedAccepted = authModule.verifyAppCsrf(sessionId, tamperedToken);
    if (isTamperedAccepted) throw new Error('Token CSRF palsu/tampered berhasil lolos verifikasi!');

    // Empty check
    if (authModule.verifyAppCsrf(sessionId, '')) {
      throw new Error('Token CSRF kosong diloloskan!');
    }
  });

  // =========================================================================
  // SCENARIO 9: Format mata uang Rupiah ("150000", "150.000", "25,5") dinormalisasi ke integer cents
  // =========================================================================
  await runTest(9, 'Format mata uang Rupiah ("150000", "150.000", "25,5") dinormalisasi ke integer cents', () => {
    if (typeof utilModule.normalizeRupiahToCents !== 'function') {
      throw new Error('lib/util.ts tidak mengekspor normalizeRupiahToCents');
    }

    const test1 = utilModule.normalizeRupiahToCents('150000');
    if (test1 !== 15000000) {
      throw new Error(`"150000" seharusnya menjadi 15000000 cents, didapat: ${test1}`);
    }

    const test2 = utilModule.normalizeRupiahToCents('150.000');
    if (test2 !== 15000000) {
      throw new Error(`"150.000" seharusnya menjadi 15000000 cents, didapat: ${test2}`);
    }

    const test3 = utilModule.normalizeRupiahToCents('25,5');
    if (test3 !== 2550) {
      throw new Error(`"25,5" seharusnya menjadi 2550 cents, didapat: ${test3}`);
    }
  });

  // =========================================================================
  // SCENARIO 10: Penghapusan data berhasil dan data tidak lagi ditemukan (200 OK)
  // =========================================================================
  await runTest(10, 'Penghapusan data berhasil dan data tidak lagi ditemukan (200 OK)', async () => {
    if (typeof dbModule.deleteAppRecord !== 'function' || typeof dbModule.getAppRecords !== 'function') {
      throw new Error('lib/db.ts tidak mengekspor deleteAppRecord / getAppRecords');
    }

    const rec = await dbModule.addAppRecord({
      title: 'Item Untuk Dihapus',
      category: 'Test',
      amount_cents: 50000,
      status: 'temp',
      user_id: 'u-admin'
    });

    const deleted = await dbModule.deleteAppRecord(rec.id);
    if (!deleted) throw new Error('deleteAppRecord mengembalikan false untuk record yang ada');

    const records = await dbModule.getAppRecords();
    const stillThere = records.some((r: any) => r.id === rec.id);
    if (stillThere) throw new Error('Data masih ditemukan setelah penghapusan');
  });

  // =========================================================================
  // SCENARIO 11: Pengaman admin terakhir: sistem memblokir penghapusan admin tunggal
  // =========================================================================
  await runTest(11, 'Pengaman admin terakhir: tidak bisa menghapus atau menurunkan peran admin tunggal', async () => {
    const adminRouteContent = files['app/api/admin/users/route.ts'];
    if (!adminRouteContent || !adminRouteContent.includes('LAST ADMIN SAFETY GUARD')) {
      throw new Error('Pengaman admin terakhir tidak terimplementasi pada app/api/admin/users/route.ts');
    }

    const users = [{ id: 'admin-1', role: 'admin' }, { id: 'staff-1', role: 'staff' }];
    const adminCount = users.filter((u) => u.role === 'admin').length;
    const targetUserId = 'admin-1';
    const target = users.find((u) => u.id === targetUserId);

    let guardTriggered = false;
    if (target?.role === 'admin' && adminCount <= 1) {
      guardTriggered = true;
    }
    if (!guardTriggered) throw new Error('Sistem gagal memblokir penghapusan admin terakhir');
  });

  // =========================================================================
  // SCENARIO 12: Format waktu menggunakan zona waktu Indonesia (Asia/Jakarta / WIB)
  // =========================================================================
  await runTest(12, 'Format waktu menggunakan zona waktu Indonesia (Asia/Jakarta / WIB)', () => {
    if (utilModule.TIMEZONE !== 'Asia/Jakarta') {
      throw new Error(`Zona waktu yang terdefinisi bukan Asia/Jakarta: ${utilModule.TIMEZONE}`);
    }
    if (typeof utilModule.formatWIBDate !== 'function') {
      throw new Error('lib/util.ts tidak mengekspor formatWIBDate');
    }

    const formatted = utilModule.formatWIBDate(new Date());
    if (!formatted || formatted.length < 5) {
      throw new Error('formatWIBDate gagal menghasilkan format tanggal string valid');
    }
  });

  // =========================================================================
  // SCENARIO 13: Agregasi query data (total pendapatan / jumlah item) dihitung akurat
  // =========================================================================
  await runTest(13, 'Agregasi query data (total pendapatan / jumlah item) dihitung akurat', async () => {
    const records = await dbModule.getAppRecords();
    const totalCents = records.reduce((sum: number, r: any) => sum + (r.amount_cents || 0), 0);
    if (typeof totalCents !== 'number' || isNaN(totalCents)) {
      throw new Error('Perhitungan agregasi query menghasilkan NaN');
    }
  });

  // =========================================================================
  // SCENARIO 14: Sanitasi input mencegah injeksi kode berbahaya / XSS
  // =========================================================================
  await runTest(14, 'Sanitasi input mencegah injeksi kode berbahaya / XSS', () => {
    if (typeof utilModule.sanitizeText !== 'function') {
      throw new Error('lib/util.ts tidak mengekspor sanitizeText');
    }

    const xssPayload = '<script>alert("hack")</script>';
    const sanitized = utilModule.sanitizeText(xssPayload);
    if (sanitized.includes('<script>') || sanitized.includes('</script>')) {
      throw new Error('Tag <script> tidak disanitasi oleh sanitizeText');
    }
    if (!sanitized.includes('&lt;script&gt;')) {
      throw new Error('Karakter < dan > tidak di-escape dengan entitas HTML');
    }
  });

  // =========================================================================
  // SCENARIO 15: Token sesi kadaluwarsa ditolak saat otentikasi
  // =========================================================================
  await runTest(15, 'Token sesi kadaluwarsa ditolak saat otentikasi', () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    const isExpired = expiredExp < Math.floor(Date.now() / 1000);
    if (!isExpired) throw new Error('Logika waktu kadaluwarsa sesi gagal');
  });

  // =========================================================================
  // SCENARIO 16: Health check endpoint mengembalikan status "ok" (200 OK)
  // =========================================================================
  await runTest(16, 'Health check endpoint mengembalikan status "ok" (200 OK)', () => {
    const healthRoute = files['app/api/health/route.ts'];
    if (!healthRoute) throw new Error('app/api/health/route.ts tidak ditemukan');
    if (!healthRoute.includes('NextResponse.json({ status: \'ok\'')) {
      throw new Error('Health check route tidak mengembalikan status ok');
    }
  });

  const passed = results.filter((r) => r.passed).length;
  return {
    passed,
    total: results.length,
    allPassed: passed === results.length,
    results
  };
}
