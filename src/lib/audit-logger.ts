import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface LogAdminActionParams {
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
}

const SENSITIVE_KEY_PATTERNS = [
  /pass(word)?/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /auth(orization)?/i,
  /cookie/i,
  /credential/i,
  /turnstile/i,
  /captcha/i,
  /service[_-]?role/i,
  /private[_-]?key/i,
  /access[_-]?key/i,
];

/**
 * Deeply sanitizes metadata before writing to audit_logs, ensuring zero secrets are persisted.
 */
export function sanitizeAuditMeta(value: unknown, depth = 0): unknown {
  if (depth > 5) return "[NESTING_LIMIT]";
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    // Redact JWT-like tokens
    if (value.startsWith("ey") && value.split(".").length === 3) {
      return "[REDACTED_JWT]";
    }
    // Redact long hex/base64 tokens and secrets
    if (value.length > 60 && !value.includes(" ") && !value.includes("/")) {
      return "[REDACTED_SECRET]";
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeAuditMeta(item, depth + 1));
  }

  if (typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(k));
      if (isSensitive) {
        sanitized[k] = "[REDACTED]";
      } else {
        sanitized[k] = sanitizeAuditMeta(v, depth + 1);
      }
    }
    return sanitized;
  }

  return value;
}

/**
 * Safely inserts an entry into public.audit_logs capturing the active admin user's identity.
 * Runs under RLS policies where authenticated admins have write access.
 */
export async function logAdminAction({
  action,
  resourceType,
  resourceId,
  meta = {},
}: LogAdminActionParams): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const cleanMeta = sanitizeAuditMeta(meta) as Record<string, unknown>;

    const { error } = await supabase.from("audit_logs" as never).insert({
      actor_id: user?.id ?? null,
      actor_email: user?.email ?? null,
      action,
      resource_type: resourceType ?? null,
      resource_id: resourceId ?? null,
      meta: cleanMeta as Json,
    } as never);

    if (error) {
      console.warn("[audit-logger] Failed to write audit log entry:", error.message);
    }
  } catch (err) {
    console.warn("[audit-logger] Unexpected error during audit log recording:", err);
  }
}
