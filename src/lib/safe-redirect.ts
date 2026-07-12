/**
 * Same-origin redirect allowlist. Prevents open-redirect attacks by
 * rejecting anything that isn't a same-origin path (starts with a single
 * "/", not "//"). Protocol-relative URLs and full URLs — even those that
 * appear same-origin — are rejected.
 */
const DEFAULT_FALLBACK = "/dashboard";

export function safeRedirect(input?: string | null, fallback = DEFAULT_FALLBACK): string {
  if (!input || typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (trimmed.length === 0 || trimmed.length > 512) return fallback;
  // Reject protocol-relative and absolute URLs, and any control chars.
  if (trimmed.startsWith("//")) return fallback;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return fallback;
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f]/.test(trimmed)) return fallback;
  if (!trimmed.startsWith("/")) return fallback;
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
