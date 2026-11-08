// Kontak admin & mode pembayaran.
// Isi NEXT_PUBLIC_ADMIN_WHATSAPP di Vercel (format internasional tanpa +, mis. 6281234567890).
// Variabel NEXT_PUBLIC_* dibaca saat build, jadi redeploy setelah mengubahnya.

export const ADMIN_WHATSAPP = (process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '').replace(/\D/g, '');

/** Pembayaran online Midtrans hanya dipakai bila diaktifkan eksplisit. Default: konfirmasi manual via WhatsApp. */
export const ONLINE_PAYMENT_ENABLED = process.env.NEXT_PUBLIC_PAYMENT_MODE === 'midtrans';

export const PACKAGE_LABELS: Record<string, string> = {
  basic_110k: 'Paket Basic (Rp 110.000)',
  pro_210k: 'Paket Pro (Rp 210.000)',
  pro_upgrade_100k: 'Upgrade ke Pro (Rp 100.000)',
  ai_topup_100k: 'Top-Up 100.000 Kredit AI (Rp 25.000)'
};

/** Link wa.me ke admin dengan pesan terisi, atau null bila nomor admin belum diatur. */
export function buildAdminWhatsAppLink(message: string): string | null {
  if (!ADMIN_WHATSAPP) return null;
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function buildPaymentConfirmationMessage(opts: { username?: string; email?: string; packageId?: string }): string {
  const pkg = opts.packageId ? PACKAGE_LABELS[opts.packageId] || opts.packageId : 'Aktivasi akun';
  return [
    'Halo Admin Kilat Tools, saya ingin konfirmasi pembayaran.',
    '',
    `Username: ${opts.username || '-'}`,
    opts.email ? `Email: ${opts.email}` : '',
    `Paket: ${pkg}`,
    '',
    'Bukti transfer saya lampirkan di chat ini. Terima kasih!'
  ]
    .filter((l, i, arr) => !(l === '' && arr[i - 1] === ''))
    .join('\n');
}
