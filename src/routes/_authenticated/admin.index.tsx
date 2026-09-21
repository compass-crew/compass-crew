import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Trophy,
  Calendar,
  UserCheck,
  Gavel,
  Award,
  Handshake,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BookOpen,
  Inbox,
  Lock,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { listAuditLogs, type AuditLog } from "@/lib/admin-ops";
import { requireRole } from "@/lib/auth-guard";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"], { allowForbiddenState: true }),
  head: () => ({
    meta: [
      { title: "Dashboard — Compass Crew Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminOverviewDashboard,
});

interface DashboardMetrics {
  totalUsers: number;
  activeHackathons: number;
  totalHackathons: number;
  upcomingEvents: number;
  totalEvents: number;
  totalMentors: number;
  totalJudges: number;
  totalSponsors: number;
  totalPartners: number;
  totalResources: number;
}

interface PendingAttentionMetrics {
  pendingMentors: number;
  pendingPartners: number;
}

type MetricKey =
  "users" | "hackathons" | "events" | "mentors" | "judges" | "sponsors" | "partners" | "resources";

function AdminOverviewDashboard() {
  const { user, profile } = useAuth();

  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pending, setPending] = useState<PendingAttentionMetrics | null>(null);
  const [recentAudit, setRecentAudit] = useState<AuditLog[]>([]);
  const [metricErrors, setMetricErrors] = useState<Partial<Record<MetricKey, boolean>>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    const errorsMap: Partial<Record<MetricKey, boolean>> = {};

    try {
      const nowIso = new Date().toISOString();

      // Parallel efficient count queries using head: true (zero row payload overhead)
      const [
        usersRes,
        totalHackathonsRes,
        activeHackathonsRes,
        totalEventsRes,
        upcomingEventsRes,
        mentorsRes,
        judgesRes,
        sponsorsRes,
        partnersRes,
        resourcesRes,
        pendingMentorsRes,
        pendingPartnersRes,
        auditRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("hackathons").select("id", { count: "exact", head: true }),
        supabase
          .from("hackathons")
          .select("id", { count: "exact", head: true })
          .in("status", ["ongoing", "registrations_open"]),
        supabase.from("site_events").select("id", { count: "exact", head: true }),
        supabase
          .from("site_events")
          .select("id", { count: "exact", head: true })
          .gte("starts_at", nowIso),
        supabase.from("mentors").select("id", { count: "exact", head: true }),
        supabase.from("public_judges").select("id", { count: "exact", head: true }),
        supabase.from("sponsors").select("id", { count: "exact", head: true }),
        supabase.from("partners").select("id", { count: "exact", head: true }),
        supabase.from("resources").select("id", { count: "exact", head: true }),
        supabase
          .from("mentor_applications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("partner_applications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        listAuditLogs({ pageSize: 8 }),
      ]);

      if (usersRes.error) errorsMap.users = true;
      if (totalHackathonsRes.error) errorsMap.hackathons = true;
      if (totalEventsRes.error) errorsMap.events = true;
      if (mentorsRes.error) errorsMap.mentors = true;
      if (judgesRes.error) errorsMap.judges = true;
      if (sponsorsRes.error) errorsMap.sponsors = true;
      if (partnersRes.error) errorsMap.partners = true;
      if (resourcesRes.error) errorsMap.resources = true;

      setMetricErrors(errorsMap);

      setMetrics({
        totalUsers: usersRes.count ?? 0,
        totalHackathons: totalHackathonsRes.count ?? 0,
        activeHackathons: activeHackathonsRes.count ?? 0,
        totalEvents: totalEventsRes.count ?? 0,
        upcomingEvents: upcomingEventsRes.count ?? 0,
        totalMentors: mentorsRes.count ?? 0,
        totalJudges: judgesRes.count ?? 0,
        totalSponsors: sponsorsRes.count ?? 0,
        totalPartners: partnersRes.count ?? 0,
        totalResources: resourcesRes.count ?? 0,
      });

      setPending({
        pendingMentors: pendingMentorsRes.count ?? 0,
        pendingPartners: pendingPartnersRes.count ?? 0,
      });

      setRecentAudit(auditRes.rows ?? []);

      if (isManual) {
        toast.success("Dashboard metrics refreshed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalPendingAttention = (pending?.pendingMentors ?? 0) + (pending?.pendingPartners ?? 0);

  const kpis: {
    key: MetricKey;
    title: string;
    value: number;
    subtext: string;
    icon: typeof Users;
    to: string;
    color: string;
    bg: string;
  }[] = [
    {
      key: "users",
      title: "Users",
      value: metrics?.totalUsers ?? 0,
      subtext: "Registered participants & profiles",
      icon: Users,
      to: "/admin/users",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      key: "hackathons",
      title: "Hackathons",
      value: metrics?.totalHackathons ?? 0,
      subtext: `${metrics?.activeHackathons ?? 0} active competitions`,
      icon: Trophy,
      to: "/admin/hackathons",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      key: "events",
      title: "Events",
      value: metrics?.totalEvents ?? 0,
      subtext: `${metrics?.upcomingEvents ?? 0} upcoming workshops & meets`,
      icon: Calendar,
      to: "/admin/events",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      key: "mentors",
      title: "Mentors",
      value: metrics?.totalMentors ?? 0,
      subtext: "Approved industry experts",
      icon: UserCheck,
      to: "/admin/mentors",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      key: "judges",
      title: "Judges",
      value: metrics?.totalJudges ?? 0,
      subtext: "Jury panel & evaluators",
      icon: Gavel,
      to: "/admin/judges",
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
    },
    {
      key: "sponsors",
      title: "Sponsors",
      value: metrics?.totalSponsors ?? 0,
      subtext: "Active corporate & title sponsors",
      icon: Award,
      to: "/admin/sponsors",
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
    {
      key: "partners",
      title: "Partners",
      value: metrics?.totalPartners ?? 0,
      subtext: "Community & ecosystem allies",
      icon: Handshake,
      to: "/admin/partners",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
    },
    {
      key: "resources",
      title: "Resources",
      value: metrics?.totalResources ?? 0,
      subtext: "Developer toolkits & documentation",
      icon: BookOpen,
      to: "/admin/resources",
      color: "text-teal-500",
      bg: "bg-teal-500/10",
    },
  ];

  // Resolve display name safely without leaking internal data
  const adminDisplayName =
    profile?.full_name?.trim() ||
    (user?.email ? user.email.split("@")[0] : undefined) ||
    "Administrator";

  return (
    <div className="space-y-8">
      {/* Admin Welcome & Identity Area */}
      <header className="rounded-2xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-muted/20 p-6 backdrop-blur-md">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Welcome back, {adminDisplayName}
              </h1>
              <Badge
                variant="secondary"
                className="gap-1 border-primary/30 bg-primary/10 text-primary text-xs font-semibold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Super Admin</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Compass Crew Administrative Console · Real-time operational database oversight
            </p>
            {user?.email && (
              <p className="font-mono text-xs text-muted-foreground/80">
                Connected as: <span className="text-foreground">{user.email}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-2 bg-background/80 text-xs shadow-sm hover:bg-muted"
            >
              <Link to="/admin/analytics">
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
                <span>View Analytics</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              disabled={loading || refreshing}
              className="gap-2 bg-background/80 text-xs shadow-sm hover:bg-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </Button>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>RLS Enforced</span>
            </div>
          </div>
        </div>
      </header>

      {/* Pending Items Requiring Attention */}
      <section>
        {loading ? (
          <Skeleton className="h-24 w-full rounded-xl" />
        ) : totalPendingAttention > 0 ? (
          <Card className="border-amber-500/40 bg-amber-500/5 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-base font-semibold text-foreground">
                    Items Requiring Administrative Attention
                  </CardTitle>
                </div>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 bg-amber-500/10 text-amber-500"
                >
                  {totalPendingAttention} Pending
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Inbound submissions awaiting approval or review in database queues.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              {pending?.pendingMentors ? (
                <Link
                  to="/admin/mentors"
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 p-3.5 transition hover:border-amber-500/40 hover:bg-card"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Mentor Applications</p>
                    <p className="text-[11px] text-muted-foreground">
                      Pending qualification review
                    </p>
                  </div>
                  <Badge className="bg-amber-500 text-white font-mono">
                    {pending.pendingMentors}
                  </Badge>
                </Link>
              ) : null}

              {pending?.pendingPartners ? (
                <Link
                  to="/admin/partners"
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/80 p-3.5 transition hover:border-amber-500/40 hover:bg-card"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">Partner Proposals</p>
                    <p className="text-[11px] text-muted-foreground">Pending partnership review</p>
                  </div>
                  <Badge className="bg-amber-500 text-white font-mono">
                    {pending.pendingPartners}
                  </Badge>
                </Link>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-5 py-3.5 text-xs text-muted-foreground backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-foreground">All Caught Up</span>
              <span className="hidden sm:inline">
                · No pending application approvals or review requests.
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Queue Zero</span>
          </div>
        )}
      </section>

      {/* KPI Cards Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Platform Metrics (Database-Derived)
          </h2>
          <span className="text-[11px] text-muted-foreground">Zero mock data</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            const hasError = metricErrors[kpi.key];

            return (
              <Link key={kpi.key} to={kpi.to} className="group block focus:outline-none">
                <Card className="h-full border-border/60 bg-card/60 transition duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bg}`}
                      >
                        <Icon className={`h-5 w-5 ${kpi.color}`} />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <div className="mt-4">
                      {loading ? (
                        <Skeleton className="h-8 w-20" />
                      ) : hasError ? (
                        <p className="text-xs font-medium text-destructive">Unable to load</p>
                      ) : (
                        <p className="font-display text-3xl font-bold tracking-tight text-foreground">
                          {kpi.value.toLocaleString()}
                        </p>
                      )}
                      <p className="mt-1 text-sm font-semibold text-foreground/90">{kpi.title}</p>
                      <p className="text-xs text-muted-foreground">{kpi.subtext}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick Operations Panel */}
      <section className="rounded-xl border border-border/60 bg-muted/20 p-5 backdrop-blur-sm">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Quick Operations
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Button
            asChild
            variant="outline"
            className="justify-start gap-2 bg-background/80 text-xs"
          >
            <Link to="/admin/hackathons">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Create Hackathon</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="justify-start gap-2 bg-background/80 text-xs"
          >
            <Link to="/admin/events">
              <Plus className="h-3.5 w-3.5 text-primary" />
              <span>Create Event</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="justify-start gap-2 bg-background/80 text-xs"
          >
            <Link to="/admin/users">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>Manage Users</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="justify-start gap-2 bg-background/80 text-xs"
          >
            <Link to="/admin/sponsors">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Manage Sponsors</span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="justify-start gap-2 bg-background/80 text-xs"
          >
            <Link to="/admin/partners">
              <Handshake className="h-3.5 w-3.5 text-primary" />
              <span>Manage Partners</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Bottom Grid: Recent Activity and System Health */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Audit Activity */}
        <Card className="border-border/60 bg-card/60 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">
                Recent Administrative Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Audited platform actions recorded in public.audit_logs
              </CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/admin/audit-logs">View All Logs →</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentAudit.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Inbox className="mb-2 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">No recent activity</p>
                <p className="text-xs">
                  Administrative actions will automatically appear here as operations occur.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                {recentAudit.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-4 p-4 text-xs transition hover:bg-muted/30"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {log.action}
                        </Badge>
                        <span className="truncate font-medium text-foreground">
                          {log.resource_type ? `${log.resource_type}` : "platform"}
                          {log.resource_id ? ` #${log.resource_id.slice(0, 8)}` : ""}
                        </span>
                      </div>
                      <p className="truncate text-muted-foreground">
                        Actor:{" "}
                        <span className="font-mono text-foreground/80">
                          {log.actor_email ?? "System"}
                        </span>
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security & System Readiness Card */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Security & Architecture</CardTitle>
            <CardDescription className="text-xs">
              Operating system parameters & database safeguards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <div>
                  <p className="font-medium text-foreground">Row-Level Security</p>
                  <p className="text-[11px] text-muted-foreground">Active across all tables</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 text-[10px]">
                Enforced
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-foreground">RBAC Authorization</p>
                  <p className="text-[11px] text-muted-foreground">Role verified from user_roles</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 text-[10px]">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-purple-500" />
                <div>
                  <p className="font-medium text-foreground">Audit Logging</p>
                  <p className="text-[11px] text-muted-foreground">Mutations tracked in DB</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-purple-500/10 text-purple-500 text-[10px]">
                Active
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/40 bg-muted/20 p-3">
              <div className="flex items-center gap-2.5">
                <Lock className="h-4 w-4 text-amber-500" />
                <div>
                  <p className="font-medium text-foreground">Service Role Key</p>
                  <p className="text-[11px] text-muted-foreground">Server-only isolation</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 text-[10px]">
                Isolated
              </Badge>
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full text-xs">
                <Link to="/admin/analytics">View Advanced Analytics →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
