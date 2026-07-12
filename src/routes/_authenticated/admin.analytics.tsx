import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Download,
  Users,
  Trophy,
  ClipboardList,
  UsersRound,
  UploadCloud,
  Gavel,
  GraduationCap,
  Award,
  Newspaper,
  BookOpen,
  Calendar,
  MailPlus,
  Inbox,
  Handshake,
  UserRoundCog,
  Sparkles,
  CheckCircle2,
  Activity,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchAnalytics, type AnalyticsPayload } from "@/lib/admin-ops";
import { downloadCsv, toCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [{ title: "Analytics — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AnalyticsPage,
});

const REFRESH_OPTIONS = [
  { value: "0", label: "Off" },
  { value: "30", label: "30 s" },
  { value: "60", label: "1 min" },
  { value: "300", label: "5 min" },
];

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "14", label: "Last 14 days" },
  { value: "30", label: "Last 30 days" },
];

const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#06b6d4", "#8b5cf6"];

function fmtDay(d: string) {
  return new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState("0");
  const [range, setRange] = useState("30");

  const load = async () => {
    setLoading(true);
    try {
      const payload = await fetchAnalytics();
      setData(payload);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const sec = Number(refreshInterval);
    if (!sec) return;
    const id = setInterval(load, sec * 1000);
    return () => clearInterval(id);
  }, [refreshInterval]);

  const sliced = useMemo(() => {
    if (!data) return null;
    const days = Number(range);
    const tail = <T,>(a: T[]) => a.slice(Math.max(0, a.length - days));
    return {
      user_growth: tail(data.user_growth),
      registration_growth: tail(data.registration_growth),
      submission_growth: tail(data.submission_growth),
    };
  }, [data, range]);

  const exportCsv = () => {
    if (!data) return;
    const rows = Object.entries(data.totals).map(([k, v]) => ({
      metric: k,
      value: v,
    }));
    downloadCsv(
      `compass-analytics-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows, [
        { key: "metric", header: "Metric" },
        { key: "value", header: "Value" },
      ]),
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live platform metrics powered by real Supabase queries.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Auto refresh" /></SelectTrigger>
            <SelectContent>
              {REFRESH_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>Auto: {o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={!data}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </header>

      {loading && !data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : data ? (
        <>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric icon={Users} label="Total Users" value={data.totals.total_users} sub={`${data.totals.verified_users} verified`} />
            <Metric icon={CheckCircle2} label="Active (30d)" value={data.totals.active_users_30d} sub={`${data.totals.new_users_7d} new / 7d`} />
            <Metric icon={Trophy} label="Hackathons" value={data.totals.hackathons} sub={`${data.totals.active_hackathons} active`} />
            <Metric icon={ClipboardList} label="Registrations" value={data.totals.registrations} />
            <Metric icon={UsersRound} label="Teams" value={data.totals.teams} />
            <Metric icon={UploadCloud} label="Submissions" value={data.totals.submissions} />
            <Metric icon={Gavel} label="Judges" value={data.totals.judges} />
            <Metric icon={GraduationCap} label="Mentors" value={data.totals.mentors} />
            <Metric icon={UserRoundCog} label="Ambassadors" value={data.totals.ambassadors} />
            <Metric icon={Award} label="Certificates" value={data.totals.certificates} />
            <Metric icon={Newspaper} label="Blog Posts" value={data.totals.blog_posts} />
            <Metric icon={BookOpen} label="Resources" value={data.totals.resources} />
            <Metric icon={Calendar} label="Events" value={data.totals.events} />
            <Metric icon={MailPlus} label="Subscribers" value={data.totals.newsletter_subscribers} />
            <Metric icon={Inbox} label="Contact Messages" value={data.totals.contact_messages} />
            <Metric icon={Handshake} label="Sponsors" value={data.totals.sponsors} />
            <Metric icon={Handshake} label="Partner Apps" value={data.totals.partner_applications} />
            <Metric icon={GraduationCap} label="Mentor Apps" value={data.totals.mentor_applications} />
            <Metric icon={UserRoundCog} label="Ambassador Apps" value={data.totals.ambassador_applications} />
            <Metric icon={Sparkles} label="New Users (30d)" value={data.totals.new_users_30d} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="User Growth">
              <AreaChart data={sliced?.user_growth ?? []}>
                <defs>
                  <linearGradient id="gUser" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tickFormatter={fmtDay} fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#gUser)" />
              </AreaChart>
            </ChartCard>
            <ChartCard title="Registration Growth">
              <AreaChart data={sliced?.registration_growth ?? []}>
                <defs>
                  <linearGradient id="gReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tickFormatter={fmtDay} fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Area type="monotone" dataKey="count" stroke="#22c55e" fill="url(#gReg)" />
              </AreaChart>
            </ChartCard>
            <ChartCard title="Submission Trends">
              <BarChart data={sliced?.submission_growth ?? []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" tickFormatter={fmtDay} fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString()} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartCard>
            <ChartCard title="Certificate Distribution">
              {data.certificate_distribution.length === 0 ? (
                <EmptyChart label="No certificates issued yet" />
              ) : (
                <PieChart>
                  <Pie
                    data={data.certificate_distribution}
                    dataKey="count"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {data.certificate_distribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              )}
            </ChartCard>
          </section>
        </>
      ) : (
        <EmptyChart label="No data available" />
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className="mt-1 font-display text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
          {sub ? <p className="text-xs text-muted-foreground">{sub}</p> : null}
        </div>
        <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactElement }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      <Activity className="mr-2 h-4 w-4" />
      {label}
    </div>
  );
}
