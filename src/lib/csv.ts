// CSV formula-injection prevention: values whose first char is =, +, -, @,
// TAB, or CR are treated as formulas by Excel/Sheets/Numbers. Prefix a single
// quote so the cell renders as literal text while remaining human-readable.
function neutralizeFormula(s: string): string {
  if (s.length === 0) return s;
  const first = s.charCodeAt(0);
  // = + - @ TAB CR
  if (first === 0x3d || first === 0x2b || first === 0x2d || first === 0x40 || first === 0x09 || first === 0x0d) {
    return "'" + s;
  }
  return s;
}

export function toCsv<T extends Record<string, unknown>>(rows: T[], columns: { key: keyof T & string; header: string }[]): string {
  const escape = (v: unknown): string => {
    if (v == null) return "";
    const raw = typeof v === "string" ? v : JSON.stringify(v);
    const s = neutralizeFormula(raw);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const header = columns.map((c) => escape(c.header)).join(",");
  const body = rows.map((r) => columns.map((c) => escape(r[c.key])).join(",")).join("\n");
  return `${header}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
