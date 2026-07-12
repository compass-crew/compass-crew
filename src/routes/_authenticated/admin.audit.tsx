import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, Download, RefreshCw, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { listAuditLogs, type AuditLog } from "@/lib/admin-ops";
import { downloadCsv, toCsv } from "@/lib/csv";

export const Route = createFileRoute("/_authenticated/admin/audit")({
  head: () => ({
    meta: [{ title: "Audit Logs — Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: AuditPage,
});

const PAGE_SIZE = 50;

const RESOURCE_TYPES = [
  "all",
  "hackathons",
  "blog_posts",
  "site_events",
  "site_announcements",
  "certificates",
  "platform_settings",
  "sponsors",
  "partners",
  "resources",
  "careers",
];

function AuditPage() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actorEmail, setActorEmail] = useState("");
  const [resourceType, setResourceType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listAuditLogs({
        search,
        actorEmail,
        resourceType: resourceType === "all" ? undefined : resourceType,
        from: from || undefined,
        to: to || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(res.rows);
      setTotal(res.total);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, resourceType]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCsv = () => {
    downloadCsv(
      `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      toCsv(
        rows.map((r) => ({
          created_at: r.created_at,
          actor_email: r.actor_email ?? "",
          action: r.action,
          resource_type: r.resource_type,
          resource_id: r.resource_id ?? "",
          meta: JSON.stringify(r.meta ?? {}),
        })),
        [
          { key: "created_at", header: "Timestamp" },
          { key: "actor_email", header: "Actor" },
          { key: "action", header: "Action" },
          { key: "resource_type", header: "Resource Type" },
          { key: "resource_id", header: "Resource ID" },
          { key: "meta", header: "Meta" },
        ],
      ),
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Immutable timeline of platform changes. Only super admins can read this log.
        </p>
      </header>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search action, resource, actor…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  load();
                }
              }}
            />
          </div>
          <Input
            placeholder="Actor email"
            value={actorEmail}
            onChange={(e) => setActorEmail(e.target.value)}
          />
          <Select value={resourceType} onValueChange={setResourceType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t === "all" ? "All resources" : t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </CardContent>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">
            {loading ? "Loading…" : `${total.toLocaleString()} entries`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setPage(1); load(); }} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
              Apply
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        {rows.length === 0 && !loading ? (
          <EmptyState
            icon={Shield}
            title="No audit entries"
            description="Once admins act on content or platform settings, entries will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Actor</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Resource</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/70 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{r.actor_email ?? <span className="text-muted-foreground">system</span>}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.action}</td>
                    <td className="px-4 py-3"><Badge variant="outline">{r.resource_type}</Badge></td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {r.resource_id ? r.resource_id.slice(0, 8) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-border p-3">
          <p className="text-xs text-muted-foreground">Page {page} / {pages}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page >= pages || loading}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
