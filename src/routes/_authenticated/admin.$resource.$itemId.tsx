import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminForm } from "@/components/admin/admin-form";
import { getResource } from "@/lib/admin-config";
import { getRow } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/$resource/$itemId")({
  component: EditResourcePage,
});

function EditResourcePage() {
  const { resource: key, itemId } = Route.useParams();
  const resource = getResource(key);
  if (!resource) throw notFound();

  const [initial, setInitial] = useState<Record<string, unknown> | null>(null);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getRow(resource, itemId)
      .then((r) => {
        if (cancelled) return;
        if (!r) setNotFoundState(true);
        else setInitial(r);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load."));
    return () => {
      cancelled = true;
    };
  }, [resource, itemId]);

  if (notFoundState) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="font-display text-lg font-semibold">Not found</p>
        <p className="mt-1 text-sm text-muted-foreground">This record doesn't exist or was deleted.</p>
        <Link
          to="/admin/$resource"
          params={{ resource: resource.key }}
          className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Back to {resource.plural}
        </Link>
      </div>
    );
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
        <h1 className="font-display text-2xl font-semibold">Edit {resource.singular}</h1>
      </header>
      {initial === null ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminForm resource={resource} initial={initial} id={itemId} />
      )}
    </div>
  );
}
