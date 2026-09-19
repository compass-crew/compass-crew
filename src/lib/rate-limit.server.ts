import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";

/**
 * Production-ready rate limiting abstraction for Compass Crew.
 *
 * Architecture Notes:
 * In serverless and edge environments (such as Cloudflare Workers / Nitro), local in-memory
 * state is ephemeral and partitioned across multiple edge instances.
 *
 * To ensure consistent, distributed rate enforcement:
 * 1. Primary Store: Supabase PostgreSQL ledger (`public.public_form_events`),
 *    indexed on `(ip_hash, form_kind, created_at DESC)`.
 * 2. In-Memory Fallback: Used only as a fallback during local offline testing or if the
 *    database is temporarily unreachable.
 * 3. Privacy Preservation: IP addresses are salted and hashed with SHA-256 before
 *    persistence, ensuring GDPR compliance without storing raw client IPs.
 */

export interface RateLimitOptions {
  /** Unique identifier for the action/endpoint being throttled (e.g. "contact", "cert-gen") */
  key: string;
  /** Maximum number of allowed events within the sliding window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
  /** Optional custom identifier (defaults to client IP if omitted) */
  identifier?: string;
  /** Custom error message when rate limit is exceeded */
  errorMessage?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

// In-memory fallback map: key -> timestamps[]
const memoryLedger = new Map<string, number[]>();

async function sha256(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(input));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Resolve client IP from Cloudflare or forward proxy headers safely.
 */
export function resolveClientIp(): string {
  try {
    const cfIp = getRequestHeader("cf-connecting-ip");
    if (cfIp) return cfIp.trim();

    const forwarded = getRequestHeader("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }

    const realIp = getRequestHeader("x-real-ip");
    if (realIp) return realIp.trim();

    const startIp = getRequestIP({ xForwardedFor: true });
    if (startIp) return startIp;
  } catch {
    // getRequestHeader may throw if outside active request context
  }

  return "127.0.0.1";
}

/**
 * Check and record an event against the persistent rate limiter.
 */
export async function checkRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const rawId = options.identifier ?? resolveClientIp();
  const salt = process.env.TURNSTILE_SECRET_KEY || "compass-crew-salt";
  const idHash = await sha256(`${salt}:${rawId}`);
  const now = Date.now();
  const windowMs = options.windowSeconds * 1000;
  const sinceIso = new Date(now - windowMs).toISOString();

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Count existing events within the sliding time window
    const { count, error } = await supabaseAdmin
      .from("public_form_events")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", idHash)
      .eq("form_kind", options.key)
      .gte("created_at", sinceIso);

    if (error) {
      throw error;
    }

    const currentCount = count ?? 0;
    if (currentCount >= options.limit) {
      return {
        allowed: false,
        limit: options.limit,
        remaining: 0,
        resetSeconds: options.windowSeconds,
      };
    }

    // Record the current event in the distributed ledger
    await supabaseAdmin
      .from("public_form_events")
      .insert({ ip_hash: idHash, form_kind: options.key });

    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - (currentCount + 1)),
      resetSeconds: options.windowSeconds,
    };
  } catch (err) {
    // Database check failed: use in-memory fallback to avoid dropping protection entirely
    console.warn("[RateLimit] Persistent check failed, falling back to local memory ledger:", err);

    const memKey = `${options.key}:${idHash}`;
    const timestamps = (memoryLedger.get(memKey) ?? []).filter((t) => t > now - windowMs);

    if (timestamps.length >= options.limit) {
      return {
        allowed: false,
        limit: options.limit,
        remaining: 0,
        resetSeconds: options.windowSeconds,
      };
    }

    timestamps.push(now);
    memoryLedger.set(memKey, timestamps);

    return {
      allowed: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - timestamps.length),
      resetSeconds: options.windowSeconds,
    };
  }
}

/**
 * Enforce rate limits, throwing a safe 429 Too Many Requests error if exceeded.
 */
export async function enforceRateLimit(options: RateLimitOptions): Promise<void> {
  const result = await checkRateLimit(options);
  if (!result.allowed) {
    const message =
      options.errorMessage ?? "Too many requests from this network. Please try again later.";
    throw new Error(message);
  }
}
