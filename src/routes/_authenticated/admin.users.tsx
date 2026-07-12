import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Search, ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { listAdminUsers, type AdminUserRow } from "@/lib/admin-users";
import { ROLES } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsersPage,
});

const PAGE_SIZE = 25;

function UsersPage() {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    const t = window.setTimeout(async () => {
      try {
        const res = await listAdminUsers({ search, role, status, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE });
        if (ignore) return;
        setRows(res.items);
        setTotal(res.total);
      } catch (e) {
        if (!ignore) toast.error(e instanceof Error ? e.message : "Failed to load users.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 250);
    return () => {
      ignore = true;
      window.clearTimeout(t);
    };
  }, [search, role, status, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage accounts, roles and access.</p>
        </div>
        <Badge variant="outline">{total} total</Badge>
      </header>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, username, email…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPage(1); }}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {ROLES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No users match" description="Try clearing your filters." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {rows.map((u) => (
                <Link
                  key={u.id}
                  to="/admin/users/$userId"
                  params={{ userId: u.id }}
                  className="flex items-center gap-4 p-4 transition hover:bg-muted/40"
                >
                  <Avatar className="h-10 w-10">
                    {u.avatar_url ? <AvatarImage src={u.avatar_url} alt={u.full_name ?? u.email} /> : null}
                    <AvatarFallback>{(u.full_name ?? u.email ?? "?").charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{u.full_name || u.username || u.email}</p>
                      {u.suspended_at && <Badge variant="destructive">Suspended</Badge>}
                      {!u.email_confirmed_at && <Badge variant="secondary">Unverified</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{u.email} · Joined {new Date(u.joined_at).toLocaleDateString()}</p>
                  </div>
                  <div className="hidden flex-wrap justify-end gap-1 md:flex">
                    {u.roles.slice(0, 3).map((r) => (
                      <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
                    ))}
                  </div>
                  <div className="hidden text-right text-xs text-muted-foreground lg:block">
                    {u.last_sign_in_at ? `Last seen ${new Date(u.last_sign_in_at).toLocaleDateString()}` : "Never signed in"}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Page {page} of {totalPages}</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
