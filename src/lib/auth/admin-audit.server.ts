import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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
    // Redact Turnstile / secret-looking tokens
    if (value.length > 80 && !value.includes(" ") && !value.includes("/")) {
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

export interface AdminAuditEvent {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  resourceType?: string;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
  status?: "success" | "failure";
}

/**
 * Persists an administrative audit event to public.audit_logs with sanitized metadata.
 */
export async function logAdminAuditEvent(
  supabase: SupabaseClient<Database>,
  event: AdminAuditEvent,
): Promise<void> {
  const safeMeta = sanitizeAuditMeta({
    ...(event.meta ?? {}),
    ...(event.status ? { status: event.status } : {}),
  }) as Record<string, unknown>;

  try {
    const { error } = await supabase.from("audit_logs").insert({
      actor_id: event.actorId ?? null,
      actor_email: event.actorEmail ?? null,
      action: event.action,
      resource_type: event.resourceType ?? null,
      resource_id: event.resourceId ?? null,
      meta: safeMeta as never,
    });

    if (error) {
      console.error("[Admin Audit] Failed to record audit log:", error.message);
    }
  } catch (err) {
    console.error("[Admin Audit] Unexpected error recording audit log:", err);
  }
}
