import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { AdminForm } from "@/components/admin/admin-form";
import { getResource } from "@/lib/admin-config";

export const Route = createFileRoute("/_authenticated/admin/$resource/new")({
  component: NewResourcePage,
});

function NewResourcePage() {
  const { resource: key } = Route.useParams();
  const resource = getResource(key);
  if (!resource) throw notFound();

  // sensible defaults
  const initial: Record<string, unknown> = {};
  for (const f of resource.fields) {
    if (f.type === "boolean") initial[f.name] = false;
    else if (f.type === "tags") initial[f.name] = [];
    else if (f.name === "status" && resource.hasStatus) initial[f.name] = "draft";
    else if (f.name === "sort_order") initial[f.name] = 0;
    else if (f.type === "json") initial[f.name] = f.name === "data" ? {} : [];
  }

  return (
    <div className="space-y-6">
      <Link
        to="/admin/$resource"
        params={{ resource: resource.key }}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back to {resource.plural}
      </Link>
      <header>
        <h1 className="font-display text-2xl font-semibold">New {resource.singular}</h1>
      </header>
      <AdminForm resource={resource} initial={initial} />
    </div>
  );
}
