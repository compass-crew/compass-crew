/**
 * Same-origin redirect allowlist. Prevents open-redirect attacks by
 * strictly enforcing that destination paths are relative to the current origin.
 *
 * It rejects:
 *  - Full URLs (http:, https:, etc.)
 *  - Pseudo-protocols (javascript:, data:, vbscript:)
 *  - Protocol-relative URLs (//evil.example)
 *  - Backslash escapes (/\\evil.example, \\\\evil.example)
 *  - URL-encoded scheme bypasses (%2f%2fevil.com, %5cevil.com)
 *  - Control characters and null bytes
 */
const DEFAULT_FALLBACK = "/dashboard";

export function safeRedirect(input?: string | null, fallback = DEFAULT_FALLBACK): string {
  if (!input || typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 512) return fallback;

  // Reject control characters and null bytes
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(trimmed)) return fallback;

  // Reject backslashes anywhere in the path (browsers like Chrome/Safari can normalize \ to /)
  if (trimmed.includes("\\")) return fallback;

  // Reject protocol-relative URLs
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\")) return fallback;

  // Reject any explicit protocol scheme (e.g. http:, https:, javascript:, data:, vbscript:)
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;

  // Must strictly start with a single '/' followed by not another slash
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;

  // Attempt URL decoding to detect encoded protocol or slash bypasses
  try {
    const decoded = decodeURIComponent(trimmed);
    if (
      decoded.includes("\\") ||
      decoded.startsWith("//") ||
      decoded.startsWith("/\\") ||
      /^[a-z][a-z0-9+.-]*:/i.test(decoded) ||
      // eslint-disable-next-line no-control-regex
      /[\x00-\x1f\x7f]/.test(decoded)
    ) {
      return fallback;
    }
  } catch {
    // Malformed URI encoding is treated as malicious
    return fallback;
  }

  return trimmed;
}

/**
 * Build a same-origin redirect URL for OAuth providers. Never accepts
 * arbitrary user input — always resolves against window.location.origin.
 */
export function sameOriginRedirectUrl(path = "/auth/callback"): string {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${safeRedirect(path, "/auth/callback")}`;
}
