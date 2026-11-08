import type { Metadata } from 'next';
import LegalPage, { LegalSection, AdminContact } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Kebijakan Privasi — Kilat Tools' };

export default function KebijakanPrivasiPage() {
  return (
    <LegalPage
      title="Kebijakan Privasi"
      intro="Kebijakan ini menjelaskan data apa saja yang dikumpulkan Kilat Tools, bagaimana data tersebut digunakan, dan hak Anda atas data pribadi Anda, sejalan dengan UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi."
    >
      <LegalSection title="1. Data yang Kami Kumpulkan">
        <ul className="list-disc space-y-2 pl-5">
          <li><b>Data akun:</b> email, username, dan kata sandi (disimpan dalam bentuk hash, tidak dapat dibaca).</li>
          <li><b>Data penggunaan:</b> isi chat/prompt, berkas aplikasi yang dihasilkan, riwayat pemakaian kredit, dan waktu aktivitas.</li>
          <li><b>Data pembayaran:</b> paket yang dibeli dan bukti transfer yang Anda kirimkan ke Admin. Kami tidak menyimpan data kartu atau rekening bank Anda.</li>
          <li><b>Data teknis:</b> alamat IP dan informasi perangkat/peramban yang tercatat di log server.</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Penggunaan Data">
        <ul className="list-disc space-y-2 pl-5">
          <li>Menjalankan layanan: membuat, menyimpan, dan menerbitkan aplikasi Anda.</li>
          <li>Mengelola akun, kredit, dan verifikasi pembayaran.</li>
          <li>Menjaga keamanan, mencegah penyalahgunaan, dan memperbaiki gangguan.</li>
          <li>Menghubungi Anda terkait akun atau layanan.</li>
        </ul>
        <p>Kami tidak menjual data pribadi Anda kepada pihak mana pun.</p>
      </LegalSection>

      <LegalSection title="3. Pihak Ketiga">
        <p>Untuk menjalankan layanan, data diproses oleh penyedia berikut:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><b>Vercel</b> — hosting aplikasi dan server.</li>
          <li><b>Supabase</b> — database akun, chat, dan aplikasi.</li>
          <li><b>Penyedia model AI</b> — isi prompt dan kode dikirim ke model AI untuk menghasilkan aplikasi.</li>
          <li><b>WhatsApp</b> — saat Anda melakukan konfirmasi pembayaran ke Admin.</li>
        </ul>
        <p>Jangan memasukkan data sensitif (password, nomor kartu, data pribadi orang lain) ke dalam prompt.</p>
      </LegalSection>

      <LegalSection title="4. Penyimpanan & Keamanan">
        <p>
          Data disimpan selama akun Anda aktif atau selama diperlukan untuk keperluan hukum dan pembukuan. Kami menggunakan
          koneksi terenkripsi (HTTPS), hashing kata sandi, dan pembatasan akses untuk melindungi data Anda.
        </p>
      </LegalSection>

      <LegalSection title="5. Hak Anda">
        <p>
          Anda berhak meminta salinan, perbaikan, atau penghapusan data pribadi dan akun Anda. Ajukan permintaan melalui{' '}
          <AdminContact />. Permintaan diproses paling lambat 3x24 jam hari kerja.
        </p>
      </LegalSection>

      <LegalSection title="6. Cookie">
        <p>
          Kami hanya menggunakan cookie yang diperlukan untuk menjaga sesi login Anda. Kami tidak menggunakan cookie iklan.
        </p>
      </LegalSection>

      <LegalSection title="7. Perubahan Kebijakan">
        <p>Kebijakan ini dapat diperbarui sewaktu-waktu. Versi terbaru selalu tersedia di halaman ini.</p>
      </LegalSection>
    </LegalPage>
  );
}
