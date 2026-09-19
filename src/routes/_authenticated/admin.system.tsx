import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Database,
  Shield,
  HardDrive,
  Server,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchHealthReport, type HealthReport } from "@/lib/admin-ops";

import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/system")({
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [{ title: "System Health — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: SystemHealthPage,
});

function SystemHealthPage() {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setReport(await fetchHealthReport());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to run health check");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">System Health</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live status of the database, auth, storage and platform services.
            {report ? ` Last checked ${new Date(report.checkedAt).toLocaleTimeString()}.` : ""}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </header>

      {!report && loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : report ? (
        <div className="grid gap-4 md:grid-cols-2">
          <StatusCard
            icon={Database}
            title="Database"
            ok={report.database.ok}
            details={
              report.database.ok
                ? `Reachable · ${report.database.latencyMs}ms`
                : report.database.error
            }
          />
          <StatusCard
            icon={Shield}
            title="Authentication"
            ok={report.auth.ok}
            details={
              report.auth.ok
                ? report.auth.signedIn
                  ? "Session active"
                  : "No session"
                : report.auth.error
            }
          />
          <StatusCard
            icon={HardDrive}
            title="Storage"
            ok={report.storage.ok}
            details={
              <div className="space-y-1">
                {report.storage.buckets.map((b) => (
                  <div key={b.name} className="flex items-center gap-2 text-xs">
                    {b.ok ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-500" />
                    )}
                    <span className="font-mono">{b.name}</span>
                    {b.error ? <span className="text-muted-foreground">— {b.error}</span> : null}
                  </div>
                ))}
              </div>
            }
          />
          <StatusCard
            icon={Server}
            title="Environment"
            ok={report.env.supabaseUrl && report.env.supabaseKey}
            details={
              <div className="text-xs">
                <div>Supabase URL: {report.env.supabaseUrl ? "configured" : "missing"}</div>
                <div>Publishable key: {report.env.supabaseKey ? "configured" : "missing"}</div>
              </div>
            }
          />

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4" /> Recent errors
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {report.recentErrors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent error entries in the audit log.
                </p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {report.recentErrors.map((e) => (
                    <li
                      key={e.id}
                      className="flex justify-between gap-4 border-b border-border/60 py-1 last:border-0"
                    >
                      <span className="font-mono text-xs">{e.action}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(e.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Background jobs</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">
              No scheduled jobs registered. Cron infrastructure is available and will be surfaced
              here once jobs are configured.
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({
  icon: Icon,
  title,
  ok,
  details,
}: {
  icon: typeof Database;
  title: string;
  ok: boolean;
  details: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4" /> {title}
        </CardTitle>
        <Badge
          className={
            ok
              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
              : "bg-red-500/15 text-red-600 dark:text-red-400"
          }
        >
          {ok ? "Operational" : "Degraded"}
        </Badge>
      </CardHeader>
      <CardContent className="pt-0 text-sm text-muted-foreground">{details}</CardContent>
    </Card>
  );
}
