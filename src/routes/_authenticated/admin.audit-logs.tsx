import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  Copy,
  Check,
  Calendar,
  Clock,
  User,
  Activity,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Sparkles,
  X,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAuditLogs, fetchAuditStats, type AuditLog, type AuditStats } from "@/lib/admin-ops";
import { requireRole } from "@/lib/auth-guard";
import { downloadCsv, toCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/audit-logs")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"], { allowForbiddenState: true }),
  head: () => ({
    meta: [
      { title: "Audit Logs — Compass Crew Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminAuditLogsPage,
});

const RESOURCE_TYPES = [
  { value: "all", label: "All Resources" },
  { value: "user", label: "Users" },
  { value: "user_roles", label: "User Roles" },
  { value: "hackathon", label: "Hackathons" },
  { value: "event", label: "Events" },
  { value: "mentor", label: "Mentors" },
  { value: "mentor_application", label: "Mentor Applications" },
  { value: "judge", label: "Judges" },
  { value: "sponsor", label: "Sponsors" },
  { value: "sponsor_inquiry", label: "Sponsor Inquiries" },
  { value: "partner", label: "Partners" },
  { value: "partner_application", label: "Partner Applications" },
  { value: "resource", label: "Resources" },
  { value: "content", label: "Content" },
  { value: "announcement", label: "Announcements" },
  { value: "notification", label: "Notifications" },
  { value: "settings", label: "Settings" },
];

const COMMON_ACTIONS = [
  { value: "all", label: "All Actions" },
  { value: "role.grant", label: "Role Grant" },
  { value: "role.revoke", label: "Role Revoke" },
  { value: "user.suspend", label: "User Suspend" },
  { value: "user.reactivate", label: "User Reactivate" },
  { value: "hackathon.create", label: "Hackathon Create" },
  { value: "hackathon.update", label: "Hackathon Update" },
  { value: "hackathon.publish", label: "Hackathon Publish" },
  { value: "hackathon.archive", label: "Hackathon Archive" },
  { value: "event.create", label: "Event Create" },
  { value: "mentor.create", label: "Mentor Create" },
  { value: "judge.create", label: "Judge Create" },
  { value: "sponsor.create", label: "Sponsor Create" },
  { value: "partner.create", label: "Partner Create" },
  { value: "resource.create", label: "Resource Create" },
];

function getActionBadgeVariant(action: string): {
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  className: string;
} {
  const a = action.toLowerCase();
  if (
    a.includes("delete") ||
    a.includes("revoke") ||
    a.includes("suspend") ||
    a.includes("reject") ||
    a.includes("fail")
  ) {
    return {
      badgeVariant: "destructive",
      className: "border-rose-500/30 bg-rose-500/10 text-rose-500",
    };
  }
  if (
    a.includes("publish") ||
    a.includes("grant") ||
    a.includes("approve") ||
    a.includes("reactivate") ||
    a.includes("start")
  ) {
    return {
      badgeVariant: "default",
      className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (a.includes("create") || a.includes("insert")) {
    return {
      badgeVariant: "secondary",
      className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-500",
    };
  }
  if (a.includes("update") || a.includes("status")) {
    return {
      badgeVariant: "outline",
      className: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }
  return {
    badgeVariant: "outline",
    className: "border-muted-foreground/30 text-muted-foreground",
  };
}

function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateRange, setDateRange] = useState<"all" | "today" | "7d" | "30d" | "custom">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Compute ISO date range
  const { fromIso, toIso } = useMemo(() => {
    const now = new Date();
    if (dateRange === "today") {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { fromIso: start.toISOString(), toIso: undefined };
    }
    if (dateRange === "7d") {
      const start = new Date(now.getTime() - 7 * 86400000);
      return { fromIso: start.toISOString(), toIso: undefined };
    }
    if (dateRange === "30d") {
      const start = new Date(now.getTime() - 30 * 86400000);
      return { fromIso: start.toISOString(), toIso: undefined };
    }
    if (dateRange === "custom") {
      return {
        fromIso: fromDate ? new Date(fromDate).toISOString() : undefined,
        toIso: toDate ? new Date(toDate).toISOString() : undefined,
      };
    }
    return { fromIso: undefined, toIso: undefined };
  }, [dateRange, fromDate, toDate]);

  const loadData = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      try {
        const [logsRes, statsRes] = await Promise.all([
          listAuditLogs({
            search: debouncedSearch,
            resourceType: resourceType === "all" ? undefined : resourceType,
            action: actionFilter === "all" ? undefined : actionFilter,
            from: fromIso,
            to: toIso,
            page,
            pageSize,
            sortOrder,
          }),
          fetchAuditStats(),
        ]);

        setLogs(logsRes.rows);
        setTotal(logsRes.total);
        setStats(statsRes);

        if (isManual) {
          toast.success("Audit trail refreshed");
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
        toast.error("Unable to load audit logs. Please check your connection.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, resourceType, actionFilter, fromIso, toIso, page, pageSize, sortOrder],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast.error("No audit records to export");
      return;
    }

    const rows = logs.map((log) => ({
      id: log.id,
      timestamp: log.created_at,
      actor_email: log.actor_email ?? "System",
      actor_id: log.actor_id ?? "N/A",
      action: log.action,
      resource_type: log.resource_type ?? "N/A",
      resource_id: log.resource_id ?? "N/A",
      metadata: JSON.stringify(log.meta),
    }));

    downloadCsv(
      `compass-crew-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(rows, [
        { key: "timestamp", header: "Timestamp" },
        { key: "actor_email", header: "Actor Email" },
        { key: "actor_id", header: "Actor ID" },
        { key: "action", header: "Action" },
        { key: "resource_type", header: "Resource Type" },
        { key: "resource_id", header: "Resource ID" },
        { key: "metadata", header: "Metadata JSON" },
      ]),
    );
    toast.success(`Exported ${logs.length} audit records to CSV.`);
  };

  const resetFilters = () => {
    setSearch("");
    setResourceType("all");
    setActionFilter("all");
    setDateRange("all");
    setFromDate("");
    setToDate("");
    setSortOrder("desc");
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize) || 1;
  const hasActiveFilters =
    search.trim() !== "" ||
    resourceType !== "all" ||
    actionFilter !== "all" ||
    dateRange !== "all" ||
    sortOrder !== "desc";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-bold tracking-tight">Audit Logs</h1>
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            >
              <Lock className="mr-1 h-3 w-3" /> Append-Only Trail
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Immutable administrative activity trail, authorization events, and operational security
            ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Trail
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            disabled={loading || logs.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </header>

      {/* Security & Activity Stats Strip */}
      <section className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {loading && !stats ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Audit Records
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {stats?.totalEvents.toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">All-time ledger events</p>
                </div>
                <span className="rounded-md bg-primary/10 p-2.5 text-primary">
                  <Database className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Past 24 Hours
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {stats?.events24h.toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Recent administrative events</p>
                </div>
                <span className="rounded-md bg-emerald-500/10 p-2.5 text-emerald-500">
                  <Activity className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Security Operations
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {stats?.securityEvents.toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Role changes, suspensions & deletes
                  </p>
                </div>
                <span className="rounded-md bg-amber-500/10 p-2.5 text-amber-500">
                  <ShieldCheck className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active Admin Actors
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold tabular-nums">
                    {stats?.uniqueActors.toLocaleString() ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Distinct administrators recorded</p>
                </div>
                <span className="rounded-md bg-cyan-500/10 p-2.5 text-cyan-500">
                  <User className="h-5 w-5" />
                </span>
              </CardContent>
            </Card>
          </>
        )}
      </section>

      {/* Filter and Query Controls */}
      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-3 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search action, actor, resource ID..."
                className="pl-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Resource Type Dropdown */}
            <Select
              value={resourceType}
              onValueChange={(val) => {
                setResourceType(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map((rt) => (
                  <SelectItem key={rt.value} value={rt.value} className="text-xs">
                    {rt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action Filter Dropdown */}
            <Select
              value={actionFilter}
              onValueChange={(val) => {
                setActionFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Action Type" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_ACTIONS.map((ac) => (
                  <SelectItem key={ac.value} value={ac.value} className="text-xs">
                    {ac.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Range Dropdown */}
            <Select
              value={dateRange}
              onValueChange={(val) => {
                setDateRange(val as typeof dateRange);
                setPage(1);
              }}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  All Time
                </SelectItem>
                <SelectItem value="today" className="text-xs">
                  Today (24h)
                </SelectItem>
                <SelectItem value="7d" className="text-xs">
                  Last 7 Days
                </SelectItem>
                <SelectItem value="30d" className="text-xs">
                  Last 30 Days
                </SelectItem>
                <SelectItem value="custom" className="text-xs">
                  Custom Dates...
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Inputs & Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/40">
            {dateRange === "custom" && (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">From:</span>
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(1);
                  }}
                />
                <span className="text-muted-foreground">To:</span>
                <Input
                  type="date"
                  className="h-8 w-36 text-xs"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 text-xs"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
              </Button>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="h-8 gap-1 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Clear Filters</span>
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              Found <strong>{total.toLocaleString()}</strong> event(s)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead className="w-[200px]">Actor</TableHead>
                  <TableHead className="w-[200px]">Action</TableHead>
                  <TableHead className="w-[130px]">Resource</TableHead>
                  <TableHead className="w-[120px]">Resource ID</TableHead>
                  <TableHead>Context / Details</TableHead>
                  <TableHead className="w-[80px] text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && logs.length === 0 ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-4 w-28" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-40" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-8 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <ShieldCheck className="h-8 w-8 opacity-40" />
                        <p className="text-sm font-medium">No audit activity found</p>
                        <p className="text-xs max-w-sm">
                          {hasActiveFilters
                            ? "No audit records match the current filter criteria. Try clearing search filters."
                            : "Administrative events will automatically append here as platform actions occur."}
                        </p>
                        {hasActiveFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetFilters}
                            className="mt-2 text-xs"
                          >
                            Reset Filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => {
                    const badge = getActionBadgeVariant(log.action);
                    const safeMetaKeys = Object.keys(log.meta || {}).slice(0, 3);
                    const contextPreview = safeMetaKeys
                      .map((k) => `${k}: ${String(log.meta[k])}`)
                      .join(", ");

                    return (
                      <TableRow key={log.id} className="transition-colors hover:bg-muted/30">
                        {/* Timestamp */}
                        <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>

                        {/* Actor */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 max-w-[190px]">
                            <span className="truncate font-medium text-xs text-foreground">
                              {log.actor_email ?? "System Task"}
                            </span>
                            {log.actor_id && (
                              <button
                                onClick={() => handleCopy(log.actor_id!, `actor-${log.id}`)}
                                title="Copy Actor User ID"
                                className="text-muted-foreground hover:text-foreground shrink-0"
                              >
                                {copiedField === `actor-${log.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            )}
                          </div>
                        </TableCell>

                        {/* Action Badge */}
                        <TableCell>
                          <Badge
                            variant={badge.badgeVariant}
                            className={`font-mono text-[10px] tracking-tight ${badge.className}`}
                          >
                            {log.action}
                          </Badge>
                        </TableCell>

                        {/* Resource */}
                        <TableCell>
                          <span className="inline-flex items-center text-xs font-medium capitalize text-muted-foreground">
                            {log.resource_type ?? "N/A"}
                          </span>
                        </TableCell>

                        {/* Resource ID */}
                        <TableCell className="font-mono text-xs">
                          {log.resource_id ? (
                            <div className="flex items-center gap-1">
                              <span className="truncate max-w-[80px]" title={log.resource_id}>
                                {log.resource_id.slice(0, 8)}...
                              </span>
                              <button
                                onClick={() => handleCopy(log.resource_id!, `res-${log.id}`)}
                                title="Copy Resource ID"
                                className="text-muted-foreground hover:text-foreground shrink-0"
                              >
                                {copiedField === `res-${log.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60">—</span>
                          )}
                        </TableCell>

                        {/* Context / Preview */}
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {contextPreview || "No context recorded"}
                        </TableCell>

                        {/* Inspect Button */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedLog(log)}
                            title="Inspect Audit Event"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border/40 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(val) => {
                  setPageSize(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-7 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25" className="text-xs">
                    25
                  </SelectItem>
                  <SelectItem value="50" className="text-xs">
                    50
                  </SelectItem>
                  <SelectItem value="100" className="text-xs">
                    100
                  </SelectItem>
                </SelectContent>
              </Select>
              <span>
                Showing {Math.min((page - 1) * pageSize + 1, total)} to{" "}
                {Math.min(page * pageSize, total)} of {total.toLocaleString()} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="mr-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Detail Inspection Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-5 w-5 text-primary" /> Audit Event Inspection
            </DialogTitle>
            <DialogDescription className="text-xs">
              Cryptographically timestamped operational record from public.audit_logs
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2 text-xs">
              {/* Event Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3">
                <div>
                  <span className="text-muted-foreground text-[11px] uppercase font-semibold">
                    Action
                  </span>
                  <div className="mt-1">
                    <Badge variant="outline" className="font-mono text-xs">
                      {selectedLog.action}
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] uppercase font-semibold">
                    Timestamp
                  </span>
                  <p className="mt-1 font-mono text-xs text-foreground">
                    {new Date(selectedLog.created_at).toISOString()}
                  </p>
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] uppercase font-semibold">
                    Actor
                  </span>
                  <p className="mt-1 font-medium text-xs text-foreground truncate">
                    {selectedLog.actor_email ?? "System Process"}
                  </p>
                  {selectedLog.actor_id && (
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      ID: {selectedLog.actor_id}
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-muted-foreground text-[11px] uppercase font-semibold">
                    Target Resource
                  </span>
                  <p className="mt-1 font-medium text-xs text-foreground capitalize">
                    {selectedLog.resource_type ?? "General Platform"}
                  </p>
                  {selectedLog.resource_id && (
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      ID: {selectedLog.resource_id}
                    </p>
                  )}
                </div>
              </div>

              {/* Sanitized Context / JSON Metadata Viewer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5 text-primary" /> Event Context & Metadata
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] gap-1"
                    onClick={() =>
                      handleCopy(JSON.stringify(selectedLog.meta, null, 2), "modal-json")
                    }
                  >
                    {copiedField === "modal-json" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>Copy JSON</span>
                  </Button>
                </div>

                <div className="max-h-56 overflow-auto rounded-lg border bg-muted/60 p-3 font-mono text-[11px]">
                  {Object.keys(selectedLog.meta || {}).length === 0 ? (
                    <span className="text-muted-foreground italic">No extra metadata payload.</span>
                  ) : (
                    <pre className="text-foreground/90 whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.meta, null, 2)}
                    </pre>
                  )}
                </div>
              </div>

              {/* Immutability Banner */}
              <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/20 px-3 py-2 text-[11px] text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>
                  This record is permanently sealed in the database. Audit entries cannot be
                  modified, redacted, or forged.
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
