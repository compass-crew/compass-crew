import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Trophy,
  Calendar,
  BookOpen,
  GraduationCap,
  Gavel,
  Handshake,
  Bell,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  Info,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  Mail,
  Megaphone,
  FolderOpen,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { downloadCsv, toCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"], { allowForbiddenState: true }),
  head: () => ({
    meta: [
      { title: "Analytics — Compass Crew Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAnalyticsPage,
});

type TimeRangeKey = "7d" | "30d" | "90d" | "12m" | "all";

interface TimeRangeOption {
  value: TimeRangeKey;
  label: string;
  days: number | null;
}

const TIME_RANGES: TimeRangeOption[] = [
  { value: "7d", label: "Last 7 Days", days: 7 },
  { value: "30d", label: "Last 30 Days", days: 30 },
  { value: "90d", label: "Last 90 Days", days: 90 },
  { value: "12m", label: "Last 12 Months", days: 365 },
  { value: "all", label: "All Time (Lifetime)", days: null },
];

const CHART_PALETTE = [
  "#6366f1", // Indigo
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#06b6d4", // Cyan
  "#ec4899", // Pink
  "#8b5cf6", // Violet
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#64748b", // Slate
];

interface GrowthDataPoint {
  date: string;
  label: string;
  count: number;
}

interface CategoryCount {
  name: string;
  count: number;
  [key: string]: string | number;
}

interface HackathonSummaryRow {
  id: string;
  title: string;
  status: string;
  startsAt: string | null;
  registrationsCount: number;
}

interface AnalyticsState {
  // Lifetime Totals
  totalUsers: number;
  totalHackathons: number;
  activeHackathons: number;
  totalRegistrations: number;
  totalEvents: number;
  upcomingEvents: number;
  totalMentors: number;
  totalJudges: number;
  totalSponsors: number;
  totalPartners: number;
  totalResources: number;
  totalAnnouncements: number;
  totalSubscribers: number;

  // Selected-Period Specific
  periodNewUsers: number;
  priorNewUsers: number | null;
  periodRegistrations: number;
  priorRegistrations: number | null;
  periodNotifications: number;
  unreadNotifications: number;

  // Pending Pipeline Queues
  pendingMentors: number;
  pendingPartners: number;

  // Chart Distributions
  userGrowthTimeline: GrowthDataPoint[];
  userRolesDistribution: CategoryCount[];
  hackathonsByStatus: CategoryCount[];
  eventsByKind: CategoryCount[];
  resourcesByCategory: CategoryCount[];
  sponsorsByTier: CategoryCount[];
  notificationsByCategory: CategoryCount[];

  // Supporting Tables
  topHackathons: HackathonSummaryRow[];
  resourcesByStatus: CategoryCount[];
}

function computeDelta(
  current: number,
  prior: number | null,
): { text: string; deltaType: "positive" | "negative" | "neutral" | "none" } {
  if (prior === null) {
    return { text: "Lifetime total", deltaType: "neutral" };
  }
  if (prior === 0 && current === 0) {
    return { text: "0% vs prior", deltaType: "neutral" };
  }
  if (prior === 0 && current > 0) {
    return { text: `+${current} new (no prior)`, deltaType: "positive" };
  }
  if (prior > 0) {
    const pct = ((current - prior) / prior) * 100;
    const sign = pct > 0 ? "+" : "";
    return {
      text: `${sign}${pct.toFixed(1)}% vs prior`,
      deltaType: pct > 0 ? "positive" : pct < 0 ? "negative" : "neutral",
    };
  }
  return { text: "No prior data", deltaType: "none" };
}

function AdminAnalyticsPage() {
  const [rangeKey, setRangeKey] = useState<TimeRangeKey>("30d");
  const [data, setData] = useState<AnalyticsState | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorCount, setErrorCount] = useState(0);

  const selectedRange = useMemo(
    () => TIME_RANGES.find((r) => r.value === rangeKey) ?? TIME_RANGES[1],
    [rangeKey],
  );

  const loadAnalytics = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      let errors = 0;
      const now = new Date();
      const nowIso = now.toISOString();

      let startIso: string | null = null;
      let priorStartIso: string | null = null;
      let priorEndIso: string | null = null;

      if (selectedRange.days !== null) {
        const msInDay = 86400000;
        const periodMs = selectedRange.days * msInDay;
        const startDate = new Date(now.getTime() - periodMs);
        startIso = startDate.toISOString();

        const priorStartDate = new Date(startDate.getTime() - periodMs);
        priorStartIso = priorStartDate.toISOString();
        priorEndIso = startDate.toISOString();
      }

      try {
        // Parallel batch 1: Counts & Lifetime Metrics
        const [
          totalUsersRes,
          periodUsersRes,
          priorUsersRes,
          usersTimelineRes,
          userRolesRes,
          totalHackathonsRes,
          activeHackathonsRes,
          allHackathonsRes,
          totalRegistrationsRes,
          periodRegistrationsRes,
          priorRegistrationsRes,
          allRegistrationsRes,
          totalEventsRes,
          upcomingEventsRes,
          allEventsRes,
          mentorsRes,
          pendingMentorsRes,
          judgesRes,
          sponsorsRes,
          partnersRes,
          pendingPartnersRes,
          totalResourcesRes,
          allResourcesRes,
          periodNotifsRes,
          unreadNotifsRes,
          allNotifsRes,
          announcementsRes,
          subscribersRes,
        ] = await Promise.all([
          // 1. Users
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          startIso
            ? supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .gte("created_at", startIso)
            : supabase.from("profiles").select("id", { count: "exact", head: true }),
          priorStartIso && priorEndIso
            ? supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .gte("created_at", priorStartIso)
                .lt("created_at", priorEndIso)
            : Promise.resolve({ count: null, error: null }),
          // Minimum payload for timeline: only created_at
          (startIso
            ? supabase.from("profiles").select("created_at").gte("created_at", startIso)
            : supabase.from("profiles").select("created_at")
          ).order("created_at", { ascending: true }),

          // 2. Roles
          supabase.from("user_roles").select("role"),

          // 3. Hackathons
          supabase.from("hackathons").select("id", { count: "exact", head: true }),
          supabase
            .from("hackathons")
            .select("id", { count: "exact", head: true })
            .in("status", ["ongoing", "registrations_open"]),
          supabase.from("hackathons").select("id, title, status, starts_at, created_at"),

          // 4. Registrations
          supabase.from("registrations").select("id", { count: "exact", head: true }),
          startIso
            ? supabase
                .from("registrations")
                .select("id", { count: "exact", head: true })
                .gte("created_at", startIso)
            : supabase.from("registrations").select("id", { count: "exact", head: true }),
          priorStartIso && priorEndIso
            ? supabase
                .from("registrations")
                .select("id", { count: "exact", head: true })
                .gte("created_at", priorStartIso)
                .lt("created_at", priorEndIso)
            : Promise.resolve({ count: null, error: null }),
          supabase.from("registrations").select("id, hackathon_id, status, created_at"),

          // 5. Events
          supabase.from("site_events").select("id", { count: "exact", head: true }),
          supabase
            .from("site_events")
            .select("id", { count: "exact", head: true })
            .gte("starts_at", nowIso),
          supabase.from("site_events").select("id, title, kind, starts_at, created_at"),

          // 6. Mentors
          supabase.from("mentors").select("id", { count: "exact", head: true }),
          supabase
            .from("mentor_applications")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

          // 7. Judges
          supabase.from("public_judges").select("id", { count: "exact", head: true }),

          // 8. Sponsors
          supabase.from("sponsors").select("id, name, tier, status"),

          // 9. Partners
          supabase.from("partners").select("id", { count: "exact", head: true }),
          supabase
            .from("partner_applications")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending"),

          // 10. Resources
          supabase.from("resources").select("id", { count: "exact", head: true }),
          supabase.from("resources").select("id, title, category, status, created_at"),

          // 11. Admin Notifications (28.9)
          startIso
            ? supabase
                .from("admin_notifications")
                .select("id", { count: "exact", head: true })
                .gte("created_at", startIso)
            : supabase.from("admin_notifications").select("id", { count: "exact", head: true }),
          supabase
            .from("admin_notifications")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false)
            .eq("is_archived", false),
          supabase
            .from("admin_notifications")
            .select("id, category, priority, is_read, created_at"),

          // 12. Community Signals
          supabase.from("site_announcements").select("id", { count: "exact", head: true }),
          supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
        ]);

        if (totalUsersRes.error) errors++;
        if (allHackathonsRes.error) errors++;
        if (allEventsRes.error) errors++;
        if (allResourcesRes.error) errors++;

        setErrorCount(errors);

        // --- Build User Growth Timeline ---
        const userDates = (usersTimelineRes.data ?? []).map((u) => u.created_at);
        const timeline: GrowthDataPoint[] = [];

        if (selectedRange.days === 7 || selectedRange.days === 30) {
          // Daily buckets
          const daysCount = selectedRange.days;
          const bucketMap = new Map<string, number>();

          for (let i = daysCount - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const key = d.toISOString().slice(0, 10);
            bucketMap.set(key, 0);
          }

          userDates.forEach((iso) => {
            const key = iso.slice(0, 10);
            if (bucketMap.has(key)) {
              bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
            }
          });

          bucketMap.forEach((count, key) => {
            const d = new Date(key);
            timeline.push({
              date: key,
              label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              count,
            });
          });
        } else if (selectedRange.days === 90) {
          // Weekly buckets (13 weeks)
          const bucketMap = new Map<string, number>();
          const weeksCount = 13;
          for (let w = weeksCount - 1; w >= 0; w--) {
            const d = new Date(now.getTime() - w * 7 * 86400000);
            const key = d.toISOString().slice(0, 10);
            bucketMap.set(key, 0);
          }

          const bucketKeys = Array.from(bucketMap.keys()).sort();
          userDates.forEach((iso) => {
            const dateStr = iso.slice(0, 10);
            // Find closest week start
            let assignedKey = bucketKeys[0];
            for (const bKey of bucketKeys) {
              if (dateStr >= bKey) assignedKey = bKey;
              else break;
            }
            if (assignedKey) {
              bucketMap.set(assignedKey, (bucketMap.get(assignedKey) ?? 0) + 1);
            }
          });

          bucketMap.forEach((count, key) => {
            const d = new Date(key);
            timeline.push({
              date: key,
              label: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
              count,
            });
          });
        } else {
          // Monthly buckets for 12m or all-time
          const bucketMap = new Map<string, number>();
          const monthsCount = selectedRange.days === 365 ? 12 : 12;

          for (let m = monthsCount - 1; m >= 0; m--) {
            const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            bucketMap.set(key, 0);
          }

          userDates.forEach((iso) => {
            const key = iso.slice(0, 7);
            if (bucketMap.has(key)) {
              bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
            } else if (selectedRange.value === "all") {
              bucketMap.set(key, (bucketMap.get(key) ?? 0) + 1);
            }
          });

          bucketMap.forEach((count, key) => {
            const [y, m] = key.split("-").map(Number);
            const d = new Date(y, m - 1, 1);
            timeline.push({
              date: key,
              label: d.toLocaleDateString(undefined, { month: "short", year: "2-digit" }),
              count,
            });
          });
        }

        // --- Build User Roles Distribution ---
        const rolesList = userRolesRes.data ?? [];
        const roleCountsMap = new Map<string, number>();
        rolesList.forEach((r) => {
          const roleKey = r.role ? r.role.replace("_", " ") : "participant";
          roleCountsMap.set(roleKey, (roleCountsMap.get(roleKey) ?? 0) + 1);
        });
        const userRolesDistribution: CategoryCount[] = Array.from(roleCountsMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );

        // --- Build Hackathons by Status ---
        const hackathons = allHackathonsRes.data ?? [];
        const statusMap = new Map<string, number>();
        hackathons.forEach((h) => {
          const s = h.status ?? "draft";
          statusMap.set(s, (statusMap.get(s) ?? 0) + 1);
        });
        const hackathonsByStatus: CategoryCount[] = Array.from(statusMap.entries()).map(
          ([name, count]) => ({
            name: name.replace("_", " ").toUpperCase(),
            count,
          }),
        );

        // --- Build Registrations per Hackathon ---
        const registrations = allRegistrationsRes.data ?? [];
        const regCountByHackathon = new Map<string, number>();
        registrations.forEach((r) => {
          regCountByHackathon.set(
            r.hackathon_id,
            (regCountByHackathon.get(r.hackathon_id) ?? 0) + 1,
          );
        });

        const topHackathons: HackathonSummaryRow[] = hackathons
          .map((h) => ({
            id: h.id,
            title: h.title,
            status: h.status,
            startsAt: h.starts_at,
            registrationsCount: regCountByHackathon.get(h.id) ?? 0,
          }))
          .sort((a, b) => b.registrationsCount - a.registrationsCount);

        // --- Build Events by Kind ---
        const events = allEventsRes.data ?? [];
        const eventKindMap = new Map<string, number>();
        events.forEach((e) => {
          const k = e.kind ?? "other";
          eventKindMap.set(k, (eventKindMap.get(k) ?? 0) + 1);
        });
        const eventsByKind: CategoryCount[] = Array.from(eventKindMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );

        // --- Build Sponsors by Tier ---
        const sponsors = sponsorsRes.data ?? [];
        const sponsorTierMap = new Map<string, number>();
        sponsors.forEach((s) => {
          const t = s.tier ?? "community";
          sponsorTierMap.set(t, (sponsorTierMap.get(t) ?? 0) + 1);
        });
        const sponsorsByTier: CategoryCount[] = Array.from(sponsorTierMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );

        // --- Build Resources by Category & Status ---
        const resources = allResourcesRes.data ?? [];
        const resourceCategoryMap = new Map<string, number>();
        const resourceStatusMap = new Map<string, number>();
        resources.forEach((r) => {
          const cat = r.category ?? "general";
          resourceCategoryMap.set(cat, (resourceCategoryMap.get(cat) ?? 0) + 1);
          const st = r.status ?? "draft";
          resourceStatusMap.set(st, (resourceStatusMap.get(st) ?? 0) + 1);
        });
        const resourcesByCategory: CategoryCount[] = Array.from(resourceCategoryMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );
        const resourcesByStatus: CategoryCount[] = Array.from(resourceStatusMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );

        // --- Build Notifications by Category ---
        const notifs = allNotifsRes.data ?? [];
        const notifCategoryMap = new Map<string, number>();
        notifs.forEach((n) => {
          const cat = n.category ?? "system";
          notifCategoryMap.set(cat, (notifCategoryMap.get(cat) ?? 0) + 1);
        });
        const notificationsByCategory: CategoryCount[] = Array.from(notifCategoryMap.entries()).map(
          ([name, count]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            count,
          }),
        );

        setData({
          totalUsers: totalUsersRes.count ?? 0,
          totalHackathons: totalHackathonsRes.count ?? 0,
          activeHackathons: activeHackathonsRes.count ?? 0,
          totalRegistrations: totalRegistrationsRes.count ?? 0,
          totalEvents: totalEventsRes.count ?? 0,
          upcomingEvents: upcomingEventsRes.count ?? 0,
          totalMentors: mentorsRes.count ?? 0,
          totalJudges: judgesRes.count ?? 0,
          totalSponsors: sponsors.length,
          totalPartners: partnersRes.count ?? 0,
          totalResources: totalResourcesRes.count ?? 0,
          totalAnnouncements: announcementsRes.count ?? 0,
          totalSubscribers: subscribersRes.count ?? 0,

          periodNewUsers: periodUsersRes.count ?? 0,
          priorNewUsers: priorUsersRes.count,
          periodRegistrations: periodRegistrationsRes.count ?? 0,
          priorRegistrations: priorRegistrationsRes.count,
          periodNotifications: periodNotifsRes.count ?? 0,
          unreadNotifications: unreadNotifsRes.count ?? 0,

          pendingMentors: pendingMentorsRes.count ?? 0,
          pendingPartners: pendingPartnersRes.count ?? 0,

          userGrowthTimeline: timeline,
          userRolesDistribution,
          hackathonsByStatus,
          eventsByKind,
          resourcesByCategory,
          sponsorsByTier,
          notificationsByCategory,
          topHackathons,
          resourcesByStatus,
        });
      } catch (err) {
        console.error("Admin Analytics load failure:", err);
        toast.error("Failed to load platform analytics. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedRange],
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleExportCsv = () => {
    if (!data) return;

    const rows = [
      { category: "Platform", metric: "Total Registered Users", value: data.totalUsers },
      {
        category: "Platform",
        metric: `New Users (${selectedRange.label})`,
        value: data.periodNewUsers,
      },
      { category: "Hackathons", metric: "Total Hackathons", value: data.totalHackathons },
      { category: "Hackathons", metric: "Active Hackathons", value: data.activeHackathons },
      { category: "Hackathons", metric: "Total Registrations", value: data.totalRegistrations },
      {
        category: "Hackathons",
        metric: `Registrations (${selectedRange.label})`,
        value: data.periodRegistrations,
      },
      { category: "Events", metric: "Total Events", value: data.totalEvents },
      { category: "Events", metric: "Upcoming Events", value: data.upcomingEvents },
      { category: "Mentors & Judges", metric: "Active Mentors", value: data.totalMentors },
      { category: "Mentors & Judges", metric: "Pending Mentors", value: data.pendingMentors },
      { category: "Mentors & Judges", metric: "Active Judges", value: data.totalJudges },
      { category: "Sponsors & Partners", metric: "Active Sponsors", value: data.totalSponsors },
      { category: "Sponsors & Partners", metric: "Active Partners", value: data.totalPartners },
      { category: "Sponsors & Partners", metric: "Pending Partners", value: data.pendingPartners },
      { category: "Content", metric: "Total Resources", value: data.totalResources },
      { category: "Community", metric: "Site Announcements", value: data.totalAnnouncements },
      { category: "Community", metric: "Newsletter Subscribers", value: data.totalSubscribers },
      {
        category: "Notifications",
        metric: `Alerts Created (${selectedRange.label})`,
        value: data.periodNotifications,
      },
      { category: "Notifications", metric: "Unread Alerts", value: data.unreadNotifications },
    ];

    const filename = `compass-crew-analytics-${selectedRange.value}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(
      filename,
      toCsv(rows, [
        { key: "category", header: "Category" },
        { key: "metric", header: "Metric" },
        { key: "value", header: "Value" },
      ]),
    );
    toast.success("Analytics CSV exported successfully.");
  };

  const userDelta = useMemo(
    () => (data ? computeDelta(data.periodNewUsers, data.priorNewUsers) : null),
    [data],
  );

  const regDelta = useMemo(
    () => (data ? computeDelta(data.periodRegistrations, data.priorRegistrations) : null),
    [data],
  );

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">Analytics</h1>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Live Database Telemetry
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Accurate, database-backed growth trends, ecosystem distributions, and platform activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Time Range Selector */}
          <Select
            value={rangeKey}
            onValueChange={(val) => setRangeKey(val as TimeRangeKey)}
            disabled={loading || refreshing}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              {TIME_RANGES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAnalytics(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Export CSV Button */}
          <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={loading || !data}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Timeframe Scope Notice */}
      <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-primary shrink-0" />
          <span>
            Displaying metrics for <strong>{selectedRange.label}</strong>. KPI cards clearly
            contrast <strong>Lifetime totals</strong> with <strong>Selected-period activity</strong>
            .
          </span>
        </div>
        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            {errorCount} metric source(s) experienced partial connectivity issues.
          </span>
        )}
      </div>

      {/* Primary KPI Overview Cards */}
      <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !data ? (
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : data ? (
          <>
            <KPICard
              title="Total Users"
              icon={Users}
              value={data.totalUsers}
              subLabel={`+${data.periodNewUsers.toLocaleString()} in ${selectedRange.label}`}
              delta={userDelta}
            />
            <KPICard
              title="Hackathons"
              icon={Trophy}
              value={data.totalHackathons}
              subLabel={`${data.activeHackathons} active/ongoing`}
              delta={{
                text: `${data.totalRegistrations} total registrations`,
                deltaType: "neutral",
              }}
            />
            <KPICard
              title="Events"
              icon={Calendar}
              value={data.totalEvents}
              subLabel={`${data.upcomingEvents} upcoming scheduled`}
              delta={{ text: "Ecosystem meetups & workshops", deltaType: "neutral" }}
            />
            <KPICard
              title="Resources"
              icon={BookOpen}
              value={data.totalResources}
              subLabel={`${data.resourcesByCategory.length} active categories`}
              delta={{ text: "Developer tools & guides", deltaType: "neutral" }}
            />
            <KPICard
              title="Mentors"
              icon={GraduationCap}
              value={data.totalMentors}
              subLabel={
                data.pendingMentors > 0 ? `${data.pendingMentors} pending review` : "Queue clear"
              }
              highlightSub={data.pendingMentors > 0}
            />
            <KPICard
              title="Judges"
              icon={Gavel}
              value={data.totalJudges}
              subLabel="Verified jury directory"
              delta={{ text: "Active evaluation roster", deltaType: "neutral" }}
            />
            <KPICard
              title="Sponsors & Partners"
              icon={Handshake}
              value={data.totalSponsors + data.totalPartners}
              subLabel={`${data.totalSponsors} sponsors · ${data.totalPartners} partners`}
              highlightSub={data.pendingPartners > 0}
              extraSub={
                data.pendingPartners > 0 ? `${data.pendingPartners} apps pending` : undefined
              }
            />
            <KPICard
              title="Admin Alerts"
              icon={Bell}
              value={data.periodNotifications}
              subLabel={
                data.unreadNotifications > 0
                  ? `${data.unreadNotifications} unread alerts`
                  : "All caught up"
              }
              highlightSub={data.unreadNotifications > 0}
              delta={{
                text: `${selectedRange.label} activity`,
                deltaType: "neutral",
              }}
            />
          </>
        ) : null}
      </section>

      {/* Main Analytics Content Tabs */}
      <Tabs defaultValue="growth" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="growth" className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> Growth
          </TabsTrigger>
          <TabsTrigger value="hackathons" className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" /> Hackathons
          </TabsTrigger>
          <TabsTrigger value="ecosystem" className="flex items-center gap-1.5">
            <Handshake className="h-3.5 w-3.5" /> Ecosystem
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> Content
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: GROWTH & USERS */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* User Growth Chart */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      New User Registrations Over Time
                    </CardTitle>
                    <CardDescription>
                      Actual accounts created on Compass Crew within {selectedRange.label}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="tabular-nums">
                    {data ? data.periodNewUsers : 0} users in period
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="h-[320px] pt-4">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.userGrowthTimeline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.userGrowthTimeline}>
                      <defs>
                        <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="label"
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="count"
                        name="New Users"
                        stroke="#6366f1"
                        strokeWidth={2}
                        fill="url(#userGrowthGrad)"
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No user registration events recorded in this period." />
                )}
              </CardContent>
            </Card>

            {/* Role Distribution Donut */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Ecosystem Role Breakdown</CardTitle>
                <CardDescription>
                  Distribution of assigned roles across user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[320px] pt-4 flex flex-col justify-center">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.userRolesDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.userRolesDistribution}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        {data.userRolesDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No role assignments found in database." />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Metrics Detail Strip */}
          {data && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="p-4 bg-card/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-500/10 p-2.5 text-indigo-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">New User Rate</p>
                    <p className="text-xl font-bold">
                      {selectedRange.days
                        ? (data.periodNewUsers / selectedRange.days).toFixed(1)
                        : (data.totalUsers / 365).toFixed(1)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ day</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Registrations Rate</p>
                    <p className="text-xl font-bold">
                      {selectedRange.days
                        ? (data.periodRegistrations / selectedRange.days).toFixed(1)
                        : (data.totalRegistrations / 365).toFixed(1)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">/ day</span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-cyan-500/10 p-2.5 text-cyan-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Newsletter Reach</p>
                    <p className="text-xl font-bold">{data.totalSubscribers.toLocaleString()}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-card/60">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/10 p-2.5 text-amber-500">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Site Announcements</p>
                    <p className="text-xl font-bold">{data.totalAnnouncements.toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: HACKATHONS & EVENTS */}
        <TabsContent value="hackathons" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Hackathons by Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hackathons by Status</CardTitle>
                <CardDescription>
                  Current lifecycle distribution of all hackathons in database
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.hackathonsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.hackathonsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" name="Hackathons" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No hackathon records found." />
                )}
              </CardContent>
            </Card>

            {/* Events by Kind */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Events by Kind</CardTitle>
                <CardDescription>
                  Categorization of platform events (workshops, webinars, meetups)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.eventsByKind.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.eventsByKind}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" name="Events" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No site events scheduled." />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Hackathons by Registrations Table */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">
                    Hackathons Roster & Registrations
                  </CardTitle>
                  <CardDescription>
                    Real participation counts based on verified registrations table records
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {data ? data.totalRegistrations.toLocaleString() : 0} Total Registrations
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              {loading && !data ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : data && data.topHackathons.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hackathon Title</TableHead>
                        <TableHead>Lifecycle Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead className="text-right">Registrations</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.topHackathons.map((h) => (
                        <TableRow key={h.id}>
                          <TableCell className="font-medium">{h.title}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                h.status === "ongoing" || h.status === "registrations_open"
                                  ? "default"
                                  : h.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="capitalize text-xs"
                            >
                              {h.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {h.startsAt
                              ? new Date(h.startsAt).toLocaleDateString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBD"}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">
                            {h.registrationsCount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No hackathons registered in database yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: ECOSYSTEM & PARTNERS */}
        <TabsContent value="ecosystem" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Sponsors by Tier */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Corporate Sponsors by Tier
                </CardTitle>
                <CardDescription>Active partners grouped by tier level</CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4 flex flex-col justify-center">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.sponsorsByTier.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.sponsorsByTier}
                        dataKey="count"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {data.sponsorsByTier.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_PALETTE[i % CHART_PALETTE.length]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No active sponsors recorded in database." />
                )}
              </CardContent>
            </Card>

            {/* Mentor & Partner Review Pipelines */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Ecosystem Review Pipelines
                </CardTitle>
                <CardDescription>
                  Status of inbound applications and active directories
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {data ? (
                  <>
                    <div className="rounded-lg border p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-primary" /> Mentor Network
                        </span>
                        <Badge variant={data.pendingMentors > 0 ? "secondary" : "outline"}>
                          {data.pendingMentors} Pending Review
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Active Mentors in Roster:</span>
                        <span className="font-semibold text-foreground">
                          {data.totalMentors.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <Handshake className="h-4 w-4 text-emerald-500" /> Partner Applications
                        </span>
                        <Badge variant={data.pendingPartners > 0 ? "secondary" : "outline"}>
                          {data.pendingPartners} Pending Review
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Approved Partner Organizations:</span>
                        <span className="font-semibold text-foreground">
                          {data.totalPartners.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-lg border p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm flex items-center gap-2">
                          <Gavel className="h-4 w-4 text-amber-500" /> Hackathon Judges
                        </span>
                        <Badge variant="outline">Directory Active</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground pt-1">
                        <span>Verified Public Judges:</span>
                        <span className="font-semibold text-foreground">
                          {data.totalJudges.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <Skeleton className="h-48 w-full" />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: CONTENT & SYSTEM TELEMETRY */}
        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Resources by Category */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Resources by Category</CardTitle>
                <CardDescription>
                  Developer guides, libraries, and learning resources distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.resourcesByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.resourcesByCategory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" name="Resources" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No resources cataloged yet." />
                )}
              </CardContent>
            </Card>

            {/* Notifications Telemetry (28.9) */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Admin Alert Telemetry ({selectedRange.label})
                </CardTitle>
                <CardDescription>
                  Automated system notifications and administrative dispatch volume
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[280px] pt-4">
                {loading && !data ? (
                  <Skeleton className="h-full w-full" />
                ) : data && data.notificationsByCategory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.notificationsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis
                        dataKey="name"
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        fontSize={11}
                        stroke="#888888"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="count" name="Alerts" fill="#ec4899" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChartMessage message="No admin notifications dispatched in this period." />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ------------------------------------------------------------------
// KPI Card Component
// ------------------------------------------------------------------
interface KPICardProps {
  title: string;
  icon: typeof Users;
  value: number;
  subLabel: string;
  highlightSub?: boolean;
  extraSub?: string;
  delta?: {
    text: string;
    deltaType: "positive" | "negative" | "neutral" | "none";
  } | null;
}

function KPICard({
  title,
  icon: Icon,
  value,
  subLabel,
  highlightSub,
  extraSub,
  delta,
}: KPICardProps) {
  return (
    <Card className="relative overflow-hidden transition-all hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <span className="rounded-md bg-primary/10 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </span>
        </div>

        <div className="mt-2">
          <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="mt-2 flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-xs">
            <span className={highlightSub ? "font-medium text-amber-500" : "text-muted-foreground"}>
              {subLabel}
            </span>
            {extraSub && (
              <span className="text-[10px] font-medium text-amber-500/90">{extraSub}</span>
            )}
          </div>

          {delta && delta.deltaType !== "none" && (
            <div className="flex items-center gap-1 text-[11px] font-medium">
              {delta.deltaType === "positive" && (
                <span className="flex items-center text-emerald-500">
                  <TrendingUp className="mr-0.5 h-3 w-3" />
                  {delta.text}
                </span>
              )}
              {delta.deltaType === "negative" && (
                <span className="flex items-center text-rose-500">
                  <TrendingDown className="mr-0.5 h-3 w-3" />
                  {delta.text}
                </span>
              )}
              {delta.deltaType === "neutral" && (
                <span className="text-muted-foreground">{delta.text}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyChartMessage({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground p-6">
      <BarChart3 className="h-8 w-8 stroke-[1.5] opacity-40 mb-2" />
      <p className="text-xs">{message}</p>
    </div>
  );
}
