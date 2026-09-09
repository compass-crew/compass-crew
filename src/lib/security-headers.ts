/**
 * Production-ready security headers tailored for Compass Crew.
 * Compatible with Three.js (WebGL), Google Fonts, Supabase API / WebSockets, and Cloudflare Turnstile.
 */

export const SECURITY_HEADERS: Record<string, string> = {
  // Prevent MIME-sniffing
  "X-Content-Type-Options": "nosniff",

  // Clickjacking defense: only allow same-origin iframe embedding
  "X-Frame-Options": "SAMEORIGIN",

  // Referrer privacy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict sensitive browser permissions
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",

  // Compatible Content Security Policy
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

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }
}
