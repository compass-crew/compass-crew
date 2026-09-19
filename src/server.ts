import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { applySecurityHeaders } from "./lib/security-headers";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

/**
 * Validate request origin for state-changing HTTP methods (POST, PUT, DELETE, PATCH).
 * Rejects cross-origin state-changing requests to protect against CSRF attacks.
 */
function isOriginAllowed(request: Request): boolean {
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return true;

  const origin = request.headers.get("origin");
  if (!origin) {
    const secFetchSite = request.headers.get("sec-fetch-site");
    if (secFetchSite === "cross-site") return false;
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(request.url);

    if (originUrl.host === requestUrl.host) return true;

    // In non-production environments, allow loopback variations
    if (
      process.env.NODE_ENV !== "production" &&
      (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1") &&
      (requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  const errRes = new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
  applySecurityHeaders(errRes.headers);
  return errRes;
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    // 1. Cross-Origin Mutation Defense
    if (!isOriginAllowed(request)) {
      const forbiddenRes = new Response(
        JSON.stringify({ error: "Cross-origin state-changing requests are forbidden." }),
        {
          status: 403,
          headers: {
            "content-type": "application/json",
          },
        },
      );
      applySecurityHeaders(forbiddenRes.headers);
      return forbiddenRes;
    }

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(rawResponse);

      // 2. Ensure security headers on every response passing through Nitro
      const isSensitive =
        request.url.includes("/_authenticated") ||
        request.url.includes("_serverFn") ||
        request.headers.has("authorization");

      const headers = new Headers(normalized.headers);
      applySecurityHeaders(headers, { isSensitive });

      return new Response(normalized.body, {
        status: normalized.status,
        statusText: normalized.statusText,
        headers,
      });
    } catch (error) {
      console.error(error);
      const fallbackRes = new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
      applySecurityHeaders(fallbackRes.headers);
      return fallbackRes;
    }
  },
};
