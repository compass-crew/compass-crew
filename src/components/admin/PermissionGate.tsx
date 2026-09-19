import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { type Permission, hasPermission } from "@/lib/auth/roles";

interface PermissionGateProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders child elements only if the authenticated user possesses
 * the required granular permission.
 * Note: Used solely for UX gating. Server guards MUST still enforce authorization.
 */
export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const { roles } = useAuth();

  if (!hasPermission(roles, permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
