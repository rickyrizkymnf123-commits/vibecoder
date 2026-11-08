import type { Metadata } from 'next';
import LegalPage, { LegalSection, AdminContact } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Kebijakan Refund — Kilat Tools' };

export default function KebijakanRefundPage() {
  return (
    <LegalPage
      title="Kebijakan Refund"
      intro="Kami ingin Anda puas menggunakan Kilat Tools. Halaman ini menjelaskan kapan pengembalian dana (refund) dapat diberikan dan bagaimana cara mengajukannya."
    >
      <LegalSection title="1. Refund Dapat Diajukan Jika">
        <ul className="list-disc space-y-2 pl-5">
          <li>Pembayaran sudah dikonfirmasi tetapi akun tidak diaktifkan oleh Admin dalam 2x24 jam.</li>
          <li>Terjadi pembayaran ganda (double transfer) untuk paket yang sama.</li>
          <li>
            Gangguan dari sisi Kilat Tools membuat Anda sama sekali tidak dapat membuat aplikasi, dan gangguan tersebut tidak dapat
            kami perbaiki dalam 7 hari sejak dilaporkan.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Refund Tidak Berlaku Jika">
        <ul className="list-disc space-y-2 pl-5">
          <li>Kredit App sudah digunakan untuk menerbitkan aplikasi, atau Kredit AI sudah terpakai lebih dari 20%.</li>
          <li>Ketidakpuasan atas desain/hasil AI yang masih dapat diperbaiki melalui revisi.</li>
          <li>Akun dinonaktifkan karena melanggar Syarat &amp; Ketentuan.</li>
          <li>Pengajuan dilakukan lebih dari 7 hari setelah pembayaran dikonfirmasi.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Cara Mengajukan Refund">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Hubungi <AdminContact /> dengan menyebutkan username, paket, tanggal, dan bukti transfer.</li>
          <li>Jelaskan alasan pengajuan refund.</li>
          <li>Admin meninjau pengajuan paling lambat 3 hari kerja.</li>
        </ol>
      </LegalSection>

      <LegalSection title="4. Proses Pengembalian Dana">
        <p>
          Refund yang disetujui ditransfer ke rekening pengirim awal paling lambat 7 hari kerja. Kredit pada akun Anda akan
          disesuaikan atau dinonaktifkan setelah refund diproses.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
