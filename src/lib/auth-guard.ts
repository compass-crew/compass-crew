import { redirect } from "@tanstack/react-router";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";
import type { AppRole } from "@/hooks/use-auth";

export interface RequireAuthOptions {
  /**
   * If true, checks whether profile.college is set. If missing, redirects to /auth/onboarding.
   * Default: true
   */
  requireOnboarding?: boolean;
  /**
   * Fallback path if unauthenticated redirect needs an internal destination
   */
  fallbackTo?: string;
}

/**
 * Reusable TanStack Router `beforeLoad` guard for authenticated routes.
 *
 * Enforces:
 * 1. Active session exists.
 * 2. Token is validated by Supabase Auth server (rejects revoked/expired tokens).
 * 3. Onboarding completion check (redirects to /auth/onboarding if incomplete).
 * 4. Safe destination encoding without redirect loops.
 */
export function requireAuth(options: RequireAuthOptions = { requireOnboarding: true }) {
  const requireOnboarding = options.requireOnboarding ?? true;

  return async ({ location }: { location: { pathname: string; searchStr?: string } }) => {
    // 1. Fast local session check
    const { data: sessionData } = await supabase.auth.getSession();
    const currentPath = location.pathname + (location.searchStr || "");
    const safeDest = safeRedirect(currentPath, "/dashboard");

    if (!sessionData.session) {
      throw redirect({
        to: "/auth",
        search:
          safeDest !== "/auth" && !safeDest.startsWith("/auth")
            ? { redirect: safeDest }
            : undefined,
      });
    }

    // 2. Validate token with Supabase server
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw redirect({
        to: "/auth",
        search:
          safeDest !== "/auth" && !safeDest.startsWith("/auth")
            ? { redirect: safeDest }
            : undefined,
      });
    }

    // 3. Onboarding check (exempt admin portals so admin access is never trapped)
    if (requireOnboarding) {
      const isVisitingAdmin = currentPath.startsWith("/admin");
      if (!isVisitingAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("college")
          .eq("id", userData.user.id)
          .maybeSingle();

        if (!profile?.college) {
          throw redirect({
            to: "/auth/onboarding",
          });
        }
      }
    }

    return { user: userData.user };
  };
}

export interface RequireRoleOptions {
  /**
   * Safe route to redirect unauthorized visitors. Default: "/dashboard"
   */
  fallbackTo?: string;
  /**
   * If true, non-authorized authenticated users do NOT get redirected away immediately;
   * instead, { isAuthorized: false, user, roles } is returned so the component or layout
   * can render a dedicated <ForbiddenState />.
   * Default: false
   */
  allowForbiddenState?: boolean;
}

/**
 * Reusable TanStack Router `beforeLoad` guard for role-protected subtrees
 * (e.g. Organizer, Judge, Admin).
 *
 * Enforces:
 * 1. Authenticated session (redirects unauthenticated users to /auth with safe redirect target).
 * 2. Role validation against user_roles table.
 * 3. super_admin has universal access across all privileged subtrees.
 * 4. Unauthorized users receive safe redirection or forbidden state without leaking internal routes.
 */
export function requireRole(allowedRoles: AppRole[], options: RequireRoleOptions = {}) {
  const fallbackTo = options.fallbackTo || "/dashboard";
  const allowForbiddenState = options.allowForbiddenState ?? false;

  return async ({
    context,
    location,
  }: {
    context?: unknown;
    location: { pathname: string; searchStr?: string };
  }) => {
    // If parent layout route has already verified role authorization in this navigation,
    // reuse context to prevent redundant network round-trips and hydration race conditions.
    const parentCtx = context as
      | {
          user?: User;
          roles?: AppRole[];
          isAuthorized?: boolean;
        }
      | undefined;
    if (parentCtx?.user && parentCtx.roles && parentCtx.isAuthorized !== undefined) {
      if (!parentCtx.isAuthorized) {
        if (allowForbiddenState) {
          return { user: parentCtx.user, roles: parentCtx.roles, isAuthorized: false };
        }
        throw redirect({ to: fallbackTo });
      }
      return { user: parentCtx.user, roles: parentCtx.roles, isAuthorized: true };
    }

    // Resolve user from parent context or check auth
    let user = parentCtx?.user;
    if (!user) {
      const { data: userData } = await supabase.auth.getUser();
      user = userData.user ?? undefined;
    }

    if (!user) {
      const currentPath = location.pathname + (location.searchStr || "");
      const safeDest = safeRedirect(currentPath, "/dashboard");
      throw redirect({
        to: "/auth",
        search:
          safeDest !== "/auth" && !safeDest.startsWith("/auth")
            ? { redirect: safeDest }
            : undefined,
      });
    }

    // Query user roles from Supabase
    const { data: rolesRows } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);

    const userRoles = (rolesRows ?? []).map((r) => r.role as AppRole);
    const isAuthorized = userRoles.some((r) => allowedRoles.includes(r) || r === "super_admin");

    if (!isAuthorized) {
      if (allowForbiddenState) {
        return { user, roles: userRoles, isAuthorized: false };
      }
      throw redirect({ to: fallbackTo });
    }

    return { user, roles: userRoles, isAuthorized: true };
  };
}

export interface RedirectIfAuthenticatedOptions {
  search?: { redirect?: string };
  fallbackTo?: string;
}

/**
 * Reusable TanStack Router `beforeLoad` guard for public auth pages (/auth, /auth/forgot-password, etc.).
 *
 * If user is already authenticated:
 * - If onboarding incomplete -> routes to /auth/onboarding
 * - If onboarding complete -> routes to search.redirect or /dashboard
 * Prevents login page flash for existing authenticated sessions.
 */
export async function redirectIfAuthenticated(options?: RedirectIfAuthenticatedOptions) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session?.user) return;

  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return;

  // Check onboarding
  const { data: profile } = await supabase
    .from("profiles")
    .select("college")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile?.college) {
    throw redirect({ to: "/auth/onboarding" });
  }

  const target = safeRedirect(options?.search?.redirect, options?.fallbackTo || "/dashboard");
  throw redirect({
    to: target.startsWith("/auth") ? "/dashboard" : target,
  });
}

/**
 * Helper to inspect if onboarding is completed for a user.
 */
export async function checkOnboardingCompleted(userId: string): Promise<boolean> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("college")
      .eq("id", userId)
      .maybeSingle();
    return Boolean(data?.college && data.college.trim().length > 0);
  } catch {
    return false;
  }
}
