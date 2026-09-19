import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type AppRole, type Permission, hasPermission, hasAdminAccess } from "./roles";

function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (
      isNewSupabaseApiKey(supabaseKey) &&
      headers.get("Authorization") === `Bearer ${supabaseKey}`
    ) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

export interface ServerAuthContext {
  supabase: SupabaseClient<Database>;
  userId: string;
  userEmail: string | null;
  roles: AppRole[];
  isSuperAdmin: boolean;
}

/**
 * Validates the caller's server session token and resolves their verified database roles.
 * Browser-provided role values are strictly ignored.
 */
export async function resolveServerAuth(): Promise<ServerAuthContext> {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Server Configuration Error: Missing Supabase environment variables");
  }

  const request = getRequest();
  if (!request?.headers) {
    throw new Error("401 Unauthorized: No request headers available");
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("401 Unauthorized: Missing or invalid authorization header");
  }

  const token = authHeader.replace("Bearer ", "").trim();
  if (!token || token.split(".").length !== 3) {
    throw new Error("401 Unauthorized: Invalid token format");
  }

  const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    throw new Error("401 Unauthorized: Invalid or expired session");
  }

  const userId = claimsData.claims.sub;
  const userEmail = (claimsData.claims.email as string) ?? null;

  // Query verified database roles directly from user_roles
  const { data: rolesRows, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (rolesError) {
    console.error("[Auth ServerGuard] Failed to fetch roles:", rolesError.message);
    throw new Error("500 Internal Server Error: Failed to resolve authorization state");
  }

  const roles = (rolesRows ?? []).map((r) => r.role as AppRole);
  const isSuperAdmin = roles.includes("super_admin");

  return {
    supabase,
    userId,
    userEmail,
    roles,
    isSuperAdmin,
  };
}

/**
 * Server guard: Enforces that the caller has at least one of the allowed roles.
 * super_admin universally bypasses role checks.
 */
export function assertServerRole(roles: AppRole[], allowedRoles: AppRole[]): void {
  const authorized = roles.some((r) => allowedRoles.includes(r) || r === "super_admin");
  if (!authorized) {
    throw new Error("403 Forbidden: Insufficient role permissions for this operation");
  }
}

/**
 * Server guard: Enforces that the caller possesses a specific granular permission.
 */
export function assertServerPermission(roles: AppRole[], permission: Permission): void {
  if (!hasPermission(roles, permission)) {
    throw new Error(`403 Forbidden: Missing required permission: ${permission}`);
  }
}

/**
 * Reusable TanStack Start middleware for administrative createServerFn endpoints.
 * Automatically validates token, resolves database roles, and rejects non-admins with 403.
 */
export const requireAdminAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const authContext = await resolveServerAuth();

  if (!hasAdminAccess(authContext.roles)) {
    throw new Error("403 Forbidden: Administrative privileges required");
  }

  return next({
    context: {
      ...authContext,
    },
  });
});
