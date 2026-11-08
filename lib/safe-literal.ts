/**
 * Parse literal array/objek JavaScript sederhana (mis. `[{ id: 1, name: 'A' }]`) TANPA mengeksekusi kode.
 *
 * Sebelumnya dipakai `new Function('return ' + src)`, yang menjalankan kode buatan AI/pengguna di server
 * (akses penuh ke process.env & secret). Di sini sumber hanya diubah ke JSON lalu dibaca dengan JSON.parse,
 * jadi tidak ada kode yang pernah dijalankan. Literal yang mengandung ekspresi (fungsi, pemanggilan,
 * template string, variabel) ditolak dan menghasilkan null.
 */
export function parseJsLiteral(src: string): unknown | null {
  if (!src || src.length > 2_000_000) return null;

  let out = '';
  let i = 0;
  const n = src.length;

  while (i < n) {
    const ch = src[i];

    // String '...' atau "..." -> string JSON
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = '';
      i++;
      while (i < n && src[i] !== quote) {
        if (src[i] === '\\' && i + 1 < n) {
          const next = src[i + 1];
          const map: Record<string, string> = { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '\\': '\\', "'": "'", '"': '"', '/': '/' };
          if (next in map) {
            value += map[next];
            i += 2;
            continue;
          }
          if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(src.slice(i + 2, i + 6))) {
            value += String.fromCharCode(parseInt(src.slice(i + 2, i + 6), 16));
            i += 6;
            continue;
          }
          value += next;
          i += 2;
          continue;
        }
        if (src[i] === '\n') return null;
        value += src[i];
        i++;
      }
      if (i >= n) return null;
      i++; // tutup kutip
      out += JSON.stringify(value);
      continue;
    }

    // Komentar
    if (ch === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) return null;
      i = end + 2;
      continue;
    }

    // Tanda baca struktur JSON
    if ('[]{}:,'.includes(ch) || /\s/.test(ch)) {
      out += ch;
      i++;
      continue;
    }

    // Angka
    const num = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i, i + 64));
    if (num) {
      out += String(Number(num[0]));
      i += num[0].length;
      continue;
    }

    // Identifier: hanya kunci objek polos atau true/false/null yang diizinkan
    const ident = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(src.slice(i, i + 256));
    if (ident) {
      const word = ident[0];
      i += word.length;
      let j = i;
      while (j < n && /\s/.test(src[j])) j++;
      if (src[j] === ':') {
        out += JSON.stringify(word);
      } else if (word === 'true' || word === 'false' || word === 'null') {
        out += word;
      } else {
        return null; // variabel/fungsi/ekspresi -> tolak
      }
      continue;
    }

    // Karakter lain (backtick, kurung, operator, dll.) -> bukan literal data murni
    return null;
  }

  // Hapus koma gantung sebelum ] atau }
  const json = out.replace(/,(\s*[\]}])/g, '$1');
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function parseJsArrayLiteral(src: string): any[] | null {
  const value = parseJsLiteral(src);
  return Array.isArray(value) ? value : null;
}
