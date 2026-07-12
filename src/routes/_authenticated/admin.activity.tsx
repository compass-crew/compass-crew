import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  ClipboardList,
  UsersRound,
  UploadCloud,
  Award,
  Shield,
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { fetchActivity, type ActivityItem, type ActivityKind } from "@/lib/admin-ops";

export const Route = createFileRoute("/_authenticated/admin/activity")({
  head: () => ({
    meta: [{ title: "Activity Feed — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: ActivityPage,
});

const KIND_META: Record<ActivityKind, { icon: typeof ClipboardList; color: string; label: string }> = {
  registration: { icon: ClipboardList, color: "bg-blue-500/15 text-blue-600 dark:text-blue-400", label: "Registration" },
  team: { icon: UsersRound, color: "bg-purple-500/15 text-purple-600 dark:text-purple-400", label: "Team" },
  submission: { icon: UploadCloud, color: "bg-amber-500/15 text-amber-600 dark:text-amber-400", label: "Submission" },
  certificate: { icon: Award, color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", label: "Certificate" },
  audit: { icon: Shield, color: "bg-muted text-muted-foreground", label: "Audit" },
};

function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await fetchActivity(80));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Activity Feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time platform events — registrations, teams, submissions, certificates and audit entries.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </header>

      {loading && items.length === 0 ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Activity} title="No activity yet" description="Platform events will stream here as they happen." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <ol className="divide-y divide-border">
              {items.map((it, idx) => {
                const meta = KIND_META[it.kind] ?? KIND_META.audit;
                const Icon = meta.icon;
                return (
                  <li key={`${it.ref ?? ""}-${idx}`} className="flex items-start gap-3 p-4">
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${meta.color}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{it.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {meta.label} · {new Date(it.at).toLocaleString()}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
