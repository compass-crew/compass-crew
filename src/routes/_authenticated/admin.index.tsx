import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RESOURCES } from "@/lib/admin-config";
import { getAdminCounts } from "@/lib/admin-api";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    getAdminCounts()
      .then(setCounts)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load counts."));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Admin Console</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage every piece of content on Compass Crew. Changes go live immediately when published.
        </p>
      </header>

      {counts === null ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((r) => (
            <Link
              key={r.key}
              to="/admin/$resource"
              params={{ resource: r.key }}
              className="group"
            >
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:shadow-elegant">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {r.plural}
                    </p>
                    <p className="mt-1 font-display text-2xl font-semibold">
                      {counts[r.table] ?? 0}
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Manage →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
