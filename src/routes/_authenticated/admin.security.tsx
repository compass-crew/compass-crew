import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, ShieldCheck, ShieldAlert, UserX, MailWarning, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { fetchSecurityOverview, type SecurityOverview } from "@/lib/admin-search";

export const Route = createFileRoute("/_authenticated/admin/security")({
  head: () => ({ meta: [{ title: "Security — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  const [data, setData] = useState<SecurityOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSecurityOverview()
      .then(setData)
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load security overview."))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  const stats = [
    { icon: Users, label: "Total users", value: data.total_users },
    { icon: Activity, label: "Active sessions (7d)", value: data.active_sessions_7d },
    { icon: UserX, label: "Suspended", value: data.suspended_users },
    { icon: MailWarning, label: "Unverified", value: data.unverified_users },
    { icon: ShieldCheck, label: "Role changes (30d)", value: data.role_changes_30d },
    { icon: ShieldAlert, label: "High-impact events (7d)", value: data.suspicious_events_7d },
  ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Security Center</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track logins, role changes, and account status.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{s.label}</p>
                  <p className="mt-1 font-display text-3xl font-semibold">{s.value}</p>
                </div>
                <Icon className="h-6 w-6 text-primary" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Recent sign-ins</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.recent_logins.length === 0 ? (
              <EmptyState icon={Activity} title="No sign-ins yet" description="Recent user activity will appear here." />
            ) : data.recent_logins.map((l) => (
              <div key={l.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0">
                <span className="truncate">{l.email}</span>
                <span className="text-xs text-muted-foreground">{new Date(l.last_sign_in_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Recent role changes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.recent_role_changes.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No role changes" description="Grant or revoke roles from user detail pages." />
            ) : data.recent_role_changes.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0">
                <span className="flex items-center gap-2 truncate">
                  <Badge variant={a.action === "role.grant" ? "default" : "outline"}>{a.action.replace("role.", "")}</Badge>
                  <span className="truncate">{String(a.meta?.role ?? "—")}</span>
                  <span className="truncate text-xs text-muted-foreground">by {a.actor_email ?? "—"}</span>
                </span>
                <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Recent suspensions</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {data.recent_suspensions.length === 0 ? (
              <EmptyState icon={UserX} title="No suspensions" description="No accounts have been suspended recently." />
            ) : data.recent_suspensions.map((a) => (
              <div key={a.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-b-0">
                <span className="flex items-center gap-2 truncate">
                  <Badge variant={a.action === "user.suspend" ? "destructive" : "secondary"}>{a.action.replace("user.", "")}</Badge>
                  <span className="truncate text-xs text-muted-foreground">by {a.actor_email ?? "—"}</span>
                  {a.meta?.reason ? <span className="truncate text-xs">— {String(a.meta.reason)}</span> : null}
                </span>
                <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
