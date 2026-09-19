import { createFileRoute } from "@tanstack/react-router";
import { requireRole } from "@/lib/auth-guard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ForbiddenState } from "@/components/admin/ForbiddenState";
import { AdminErrorState } from "@/components/admin/AdminErrorState";
import { AdminLoadingState } from "@/components/admin/AdminLoadingState";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"], { allowForbiddenState: true }),
  errorComponent: AdminErrorState,
  pendingComponent: AdminLoadingState,
  head: () => ({
    meta: [
      { title: "Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const context = Route.useRouteContext() as { isAuthorized?: boolean } | undefined;

  // Render 403 Forbidden state if user lacks administrative roles
  if (context?.isAuthorized === false) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <ForbiddenState
          requiredRole="Super Admin"
          title="Administrative Access Restricted"
          message="This portal is strictly reserved for Compass Crew platform administrators. Your account does not currently hold the super_admin role."
        />
      </div>
    );
  }

  return <AdminShell />;
}
