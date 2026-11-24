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

/** Keluar dari Mode Intip (cookie impersonasi dihapus) lalu kembali ke panel admin. */
export function ExitImpersonationButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch('/api/auth/impersonate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ exit: true })
          });
        } finally {
          window.location.href = '/admin';
        }
      }}
      className="px-3 py-1.5 rounded-lg bg-amber-300 text-slate-950 text-xs font-bold hover:bg-amber-200 transition disabled:opacity-60"
    >
      {busy ? 'Kembali…' : '← Kembali ke Mode Admin'}
    </button>
  );
}
