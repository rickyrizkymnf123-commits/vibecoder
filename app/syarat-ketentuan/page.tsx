import type { Metadata } from 'next';
import LegalPage, { LegalSection, AdminContact } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Syarat & Ketentuan — Kilat Tools' };

export default function SyaratKetentuanPage() {
  return (
    <LegalPage
      title="Syarat & Ketentuan"
      intro="Dengan mendaftar dan menggunakan Kilat Tools (kilatstools.my.id), Anda menyetujui Syarat & Ketentuan berikut. Jika Anda tidak setuju, mohon untuk tidak menggunakan layanan ini."
    >
      <LegalSection title="1. Tentang Layanan">
        <p>
          Kilat Tools adalah platform pembuat aplikasi web berbasis AI. Anda menuliskan kebutuhan aplikasi melalui chat, lalu AI
          menyusun kode dan menerbitkannya ke subdomain Anda (contoh: <code>username.kilatstools.my.id</code>).
        </p>
      </LegalSection>

      <LegalSection title="2. Akun & Aktivasi">
        <ul className="list-disc space-y-2 pl-5">
          <li>Anda wajib memberikan data pendaftaran yang benar dan menjaga kerahasiaan kata sandi akun Anda.</li>
          <li>Akun baru aktif setelah pembayaran dikonfirmasi dan disetujui (ACC) oleh Admin.</li>
          <li>Satu akun hanya untuk satu pengguna. Berbagi akun atau membuat akun ganda untuk menyalahgunakan kredit tidak diperbolehkan.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Kredit & Pembayaran">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <b>Kredit App</b> digunakan saat menerbitkan aplikasi baru (1 kredit per aplikasi). Revisi aplikasi yang sudah terbit tidak
            memotong Kredit App.
          </li>
          <li><b>Kredit AI</b> berkurang sesuai pemakaian token AI saat membuat dan merevisi aplikasi.</li>
          <li>
            Pembayaran dilakukan melalui transfer, lalu dikonfirmasi ke <AdminContact /> dengan menyertakan bukti transfer. Kredit
            ditambahkan oleh Admin setelah pembayaran terverifikasi.
          </li>
          <li>Kredit tidak memiliki masa kedaluwarsa, tidak dapat diuangkan, dan tidak dapat dipindahkan ke akun lain.</li>
          <li>Harga paket dapat berubah sewaktu-waktu. Perubahan tidak berlaku untuk pembayaran yang sudah dikonfirmasi.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Penggunaan yang Dilarang">
        <p>Anda dilarang menggunakan Kilat Tools untuk membuat atau menyebarkan:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Situs penipuan, phishing, atau halaman yang meniru brand/lembaga lain untuk mengelabui orang.</li>
          <li>Konten perjudian, pornografi, ujaran kebencian, atau konten lain yang melanggar hukum Republik Indonesia.</li>
          <li>Malware, spam, atau upaya meretas, membebani, maupun mengakali sistem Kilat Tools.</li>
          <li>Konten yang melanggar hak cipta atau hak kekayaan intelektual pihak lain.</li>
        </ul>
        <p>Pelanggaran dapat berakibat aplikasi diturunkan dan akun dinonaktifkan tanpa pengembalian dana.</p>
      </LegalSection>

      <LegalSection title="5. Hasil Kode & Kepemilikan">
        <p>
          Kode aplikasi yang dihasilkan untuk Anda dapat Anda gunakan untuk keperluan pribadi maupun komersial. Anda bertanggung
          jawab atas isi, data, dan penggunaan aplikasi yang Anda buat.
        </p>
        <p>
          Hasil AI dapat mengandung kesalahan. Periksa kembali aplikasi Anda sebelum digunakan untuk keperluan penting, terutama
          yang berkaitan dengan keuangan, kesehatan, atau data pribadi orang lain.
        </p>
      </LegalSection>

      <LegalSection title="6. Ketersediaan Layanan">
        <p>
          Kami berupaya menjaga layanan tetap berjalan, namun tidak menjamin layanan bebas gangguan. Layanan dapat terhenti sementara
          karena pemeliharaan atau gangguan pihak ketiga (penyedia AI, hosting, atau database).
        </p>
      </LegalSection>

      <LegalSection title="7. Batasan Tanggung Jawab">
        <p>
          Sejauh diizinkan hukum, Kilat Tools tidak bertanggung jawab atas kerugian tidak langsung yang timbul dari penggunaan
          layanan. Tanggung jawab kami maksimal sebesar jumlah yang Anda bayarkan dalam 3 bulan terakhir.
        </p>
      </LegalSection>

      <LegalSection title="8. Perubahan Ketentuan & Kontak">
        <p>
          Ketentuan ini dapat diperbarui sewaktu-waktu dan versi terbaru selalu tersedia di halaman ini. Pertanyaan dapat
          disampaikan melalui <AdminContact />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
