import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listAdminUsers, type AdminUserRow } from "@/lib/admin-users";
import { APP_ROLES, ROLE_LABELS, ROLE_BADGE_VARIANTS, type AppRole } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/admin/users")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Users Management — Compass Crew Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UsersManagementPage,
});

const PAGE_SIZE = 25;

function UsersManagementPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listAdminUsers({
        search,
        role,
        status,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      });
      setRows(res.items);
      setTotal(res.total);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load users.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [search, role, status, page]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void loadUsers();
    }, 250);
    return () => window.clearTimeout(t);
  }, [loadUsers]);

  const resetFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
    setPage(1);
  };

  const hasActiveFilters = search.trim() !== "" || role !== "all" || status !== "all";
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const fromIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const toIndex = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Users Management
            </h1>
            <Badge variant="secondary" className="font-mono text-xs">
              {total} {total === 1 ? "Account" : "Accounts"}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Directory of all registered participants, organizers, judges, and administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      </header>

      {/* Filter & Search Bar */}
      <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by full name, username, or email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] text-xs">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {APP_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => loadUsers()} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <Card className="border-border/60 bg-card/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="border-border/60 bg-card/60 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">No users found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasActiveFilters
              ? "No accounts match your query or filter criteria. Try clearing your filters."
              : "No user accounts registered on the platform yet."}
          </p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4 text-xs">
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden rounded-xl border border-border/60 bg-card/60 md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border/60 bg-muted/30 font-medium text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3.5">
                      User
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Roles
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Joined
                    </th>
                    <th scope="col" className="px-4 py-3.5">
                      Last Seen
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {rows.map((u) => {
                    const primaryRole = (u.roles[0] || "participant") as AppRole;
                    const roleVariant =
                      ROLE_BADGE_VARIANTS[primaryRole] || ROLE_BADGE_VARIANTS.participant;

                    return (
                      <tr key={u.id} className="transition hover:bg-muted/20">
                        {/* User identity */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {u.avatar_url ? (
                                <AvatarImage src={u.avatar_url} alt={u.full_name ?? u.email} />
                              ) : null}
                              <AvatarFallback className="text-xs font-semibold">
                                {(u.full_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-foreground">
                                {u.full_name || u.username || u.email.split("@")[0]}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground font-mono">
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.length === 0 ? (
                              <Badge variant="outline" className="text-[10px]">
                                Participant
                              </Badge>
                            ) : (
                              u.roles.map((r) => {
                                const variant = ROLE_BADGE_VARIANTS[r as AppRole] || roleVariant;
                                return (
                                  <Badge
                                    key={r}
                                    variant="outline"
                                    className={`text-[10px] ${variant.bg} ${variant.text} ${variant.border}`}
                                  >
                                    {ROLE_LABELS[r as AppRole] || r}
                                  </Badge>
                                );
                              })
                            )}
                          </div>
                        </td>

                        {/* Account status */}
                        <td className="px-4 py-3.5">
                          {u.suspended_at ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Suspended
                            </Badge>
                          ) : !u.email_confirmed_at ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 text-amber-500 text-[10px]"
                            >
                              Unverified
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px]"
                            >
                              Active
                            </Badge>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {new Date(u.joined_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        {/* Last Seen */}
                        <td className="px-4 py-3.5 text-muted-foreground">
                          {u.last_sign_in_at ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground/60" />
                              {new Date(u.last_sign_in_at).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          ) : (
                            <span className="text-muted-foreground/60">Never</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2.5 text-xs"
                          >
                            <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                              <span>Inspect</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="grid gap-3 md:hidden">
            {rows.map((u) => (
              <Card key={u.id} className="border-border/60 bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      {u.avatar_url ? (
                        <AvatarImage src={u.avatar_url} alt={u.full_name ?? u.email} />
                      ) : null}
                      <AvatarFallback className="text-xs font-semibold">
                        {(u.full_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">
                        {u.full_name || u.username || u.email.split("@")[0]}
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  {u.suspended_at ? (
                    <Badge variant="destructive" className="text-[10px]">
                      Suspended
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-emerald-500/10 text-emerald-600 text-[10px]"
                    >
                      Active
                    </Badge>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3">
                  <div className="flex flex-wrap gap-1">
                    {u.roles.map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">
                        {ROLE_LABELS[r as AppRole] || r}
                      </Badge>
                    ))}
                  </div>
                  <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                    <Link to="/admin/users/$userId" params={{ userId: u.id }}>
                      Inspect Profile
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row text-xs text-muted-foreground">
            <span>
              Showing {fromIndex}–{toIndex} of {total} {total === 1 ? "user" : "users"}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <span className="font-mono text-foreground px-1">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="gap-1 text-xs"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
