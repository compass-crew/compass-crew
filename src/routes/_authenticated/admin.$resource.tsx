import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminList } from "@/components/admin/admin-list";
import { getResource } from "@/lib/admin-config";

import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/$resource")({
  beforeLoad: requireRole(["super_admin"]),
  component: ResourcePage,
  notFoundComponent: () => (
    <div className="rounded-xl border border-border bg-card p-8 text-center">
      <p className="font-display text-lg font-semibold">Unknown resource</p>
      <p className="mt-1 text-sm text-muted-foreground">This admin section doesn't exist.</p>
    </div>
  ),
});

function ResourcePage() {
  const { resource: key } = Route.useParams();
  const resource = getResource(key);
  if (!resource) throw notFound();
  return <AdminList resource={resource} />;
}
