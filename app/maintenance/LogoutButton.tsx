'use client';

import { useState } from 'react';

/** Keluar lalu ke halaman login, supaya admin bisa masuk dengan akun admin. */
export function LogoutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } finally {
          window.location.href = '/login';
        }
      }}
      className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition disabled:opacity-60"
    >
      {busy ? 'Keluar…' : 'Masuk sebagai admin'}
    </button>
  );
}
