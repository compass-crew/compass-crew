// Server-only Cloudflare Turnstile verification helper.
// Do NOT import from client-reachable code.

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
  ok: boolean;
  reason?: string;
  hostname?: string;
}

/**
 * Verify a Turnstile response token against Cloudflare's siteverify endpoint.
 * If TURNSTILE_SECRET_KEY is not configured, verification is skipped and
 * returns ok=true (dev-friendly). In production the secret MUST be set.
 */
export async function verifyTurnstile(
  token: string | null | undefined,
  remoteIp?: string | null,
): Promise<TurnstileVerifyResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail open only when explicitly unconfigured — surfaced in server logs
    // so operators notice a missing secret before shipping to production.
    console.warn("[turnstile] TURNSTILE_SECRET_KEY not set; skipping verification");
    return { ok: true, reason: "unconfigured" };
  }
  if (!token) return { ok: false, reason: "missing-token" };

  try {
    const body = new URLSearchParams();
    body.set("secret", secret);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);

    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
    });
    if (!res.ok) return { ok: false, reason: `siteverify-http-${res.status}` };
    const data = (await res.json()) as {
      success: boolean;
      hostname?: string;
      "error-codes"?: string[];
    };
    if (!data.success) {
      return {
        ok: false,
        reason: (data["error-codes"] ?? []).join(",") || "siteverify-failed",
      };
    }
    return { ok: true, hostname: data.hostname };
  } catch (err) {
    return { ok: false, reason: `siteverify-exception:${(err as Error).message}` };
  }
}

// Hash IP addresses before storing to keep the ledger PII-lean.
export async function hashIp(ip: string): Promise<string> {
  const enc = new TextEncoder().encode(ip);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}
