/* ============================ WebGL Detection ============================ */

export function hasWebGL(): boolean {
  try {
    if (typeof window === "undefined") return false;
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null)
    );
  } catch {
    return false;
  }
}

/* ============================ Mask Email ============================ */

export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) {
    return `${local[0]}***@${domain}`;
  }
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

/* ============================ Password Policy & Strength ============================ */

export function passwordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Very weak", color: "#ff7a6b" },
    { label: "Weak", color: "#ff7a6b" },
    { label: "Fair", color: "#e8a838" },
    { label: "Good", color: "#7dd3a8" },
    { label: "Strong", color: "#7c5cff" },
  ];
  const idx = Math.min(Math.max(score - 1, 0), 4);
  return { score, ...map[idx] };
}
