/**
 * Production-ready security headers tailored for Compass Crew.
 * Compatible with Three.js (WebGL), Google Fonts, Supabase API / WebSockets, and Cloudflare Turnstile.
 */

export const BASE_SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME-sniffing
  "X-Content-Type-Options": "nosniff",

  // Clickjacking defense: only allow same-origin iframe embedding
  "X-Frame-Options": "SAMEORIGIN",

  // Referrer privacy: limit cross-origin leak
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict sensitive browser permissions
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",

  // Cross-Origin isolation: allow popups for OAuth while defending window references
  "Cross-Origin-Opener-Policy": "same-origin-allow-popups",

  // Content Security Policy tailored for Compass Crew integrations
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
    "frame-src 'self' https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; "),
};

/** Backwards-compatible alias */
export const SECURITY_HEADERS = BASE_SECURITY_HEADERS;

/**
 * Apply production security headers to an HTTP Response Headers object.
 */
export function applySecurityHeaders(
  headers: Headers,
  options: { isSensitive?: boolean } = {},
): void {
  for (const [key, value] of Object.entries(BASE_SECURITY_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  // Strict-Transport-Security: Enforce HTTPS in production environments
  if (process.env.NODE_ENV === "production" && !headers.has("Strict-Transport-Security")) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }

  // Sensitive authenticated data or server mutations: guarantee no public CDN/proxy caching
  if (options.isSensitive) {
    headers.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
    headers.set("Pragma", "no-cache");
  }
}
