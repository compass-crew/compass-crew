import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Inbox } from "lucide-react";
import type { ResourceConfig } from "@/lib/admin-config";
import { listRows } from "@/lib/admin-api";

const PAGE_SIZE = 25;

function fmt(value: unknown, type?: string): string {
  if (value === null || value === undefined || value === "") return "—";
  if (type === "date") {
    const d = new Date(value as string);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }
  if (type === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

const STATUS_VARIANT: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  published: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  archived: "bg-muted text-muted-foreground",
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  reviewing: "bg-primary/15 text-primary",
  approved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  rejected: "bg-destructive/15 text-destructive",
  withdrawn: "bg-muted text-muted-foreground",
};

export function AdminList({ resource }: { resource: ResourceConfig }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterValue, setFilterValue] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterValue, resource.key]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listRows(resource, {
      search: debouncedSearch,
      filterValue: filterValue === "all" ? undefined : filterValue,
      page,
      pageSize: PAGE_SIZE,
    })
      .then((r) => {
        if (cancelled) return;
        setRows(r.rows);
        setTotal(r.total);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : "Failed to load."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [resource, debouncedSearch, filterValue, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo(() => resource.listColumns, [resource]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">{resource.plural}</h1>
          <p className="text-sm text-muted-foreground">{total} total</p>
        </div>
        <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/admin/$resource/new" params={{ resource: resource.key }}>
            <Plus className="mr-1.5 h-4 w-4" /> New {resource.singular}
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${resource.plural.toLowerCase()}…`}
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {resource.filterField && (
          <Select value={filterValue} onValueChange={setFilterValue}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={resource.filterField.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {resource.filterField.label.toLowerCase()}</SelectItem>
              {resource.filterField.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">
                    {c.label}
                  </th>
                ))}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-6">
                    <EmptyState
                      icon={Inbox}
                      title={`No ${resource.plural.toLowerCase()} yet`}
                      description={`Create your first ${resource.singular.toLowerCase()} to get started.`}
                    />
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const rowId = row.id as string;
                  return (
                    <tr
                      key={rowId}
                      className="cursor-pointer border-t border-border transition hover:bg-muted/30"
                      onClick={() => navigate({ to: "/admin/$resource/$itemId", params: { resource: resource.key, itemId: rowId } })}
                    >
                      {columns.map((c) => {
                        const raw = row[c.key];
                        if (c.type === "status") {
                          const s = String(raw ?? "");
                          const cls = STATUS_VARIANT[s] ?? "bg-muted text-muted-foreground";
                          return (
                            <td key={c.key} className="px-4 py-3">
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}>
                                {s || "—"}
                              </span>
                            </td>
                          );
                        }
                        if (c.type === "badge") {
                          return (
                            <td key={c.key} className="px-4 py-3">
                              {raw ? <Badge variant="secondary" className="capitalize">{String(raw).replace(/_/g, " ")}</Badge> : "—"}
                            </td>
                          );
                        }
                        return (
                          <td key={c.key} className="px-4 py-3">
                            {fmt(raw, c.type)}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">Edit →</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
