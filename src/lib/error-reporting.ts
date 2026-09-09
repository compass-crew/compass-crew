/**
 * Safe error reporting and security diagnostics.
 *
 * Ensures errors logged during runtime do NOT expose sensitive user credentials,
 * access tokens, refresh tokens, passwords, or secret environment keys.
 */

type ErrorContext = Record<string, unknown>;

const SENSITIVE_KEYS = [
  "password",
  "token",
  "secret",
  "authorization",
  "apikey",
  "service_role",
  "access_token",
  "refresh_token",
  "cookie",
];

function sanitizeContext(context: ErrorContext): ErrorContext {
  const sanitized: ErrorContext = {};
  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeContext(value as ErrorContext);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function reportAppError(error: unknown, context: ErrorContext = {}): void {
  if (typeof window === "undefined") {
    // Server-side logging
    console.error("[AppError:Server]", error, sanitizeContext(context));
    return;
  }

  // Client-side logging (sanitized)
  const safeCtx = sanitizeContext({
    route: window.location.pathname,
    ...context,
  });

  if (process.env.NODE_ENV === "development") {
    console.error("[AppError:Client]", error, safeCtx);
  } else {
    // Production client log without leaking raw error internals to arbitrary third parties
    console.error(
      "[AppError]",
      error instanceof Error ? error.message : "An unexpected error occurred",
      safeCtx,
    );
  }
}
