import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Loader2,
  Bell,
  BellRing,
  Archive,
  Trash2,
  CheckCheck,
  ExternalLink,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/empty-state";
import { requireRole } from "@/lib/auth-guard";
import { logAdminAction } from "@/lib/audit-logger";
import { safeInternalLink } from "@/lib/notifications";
import {
  listAdminNotificationsPaged,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  archiveAdminNotification,
  deleteAdminNotification,
  type AdminNotification,
} from "@/lib/admin-ops";

export const Route = createFileRoute("/_authenticated/admin/admin-notifications")({
  ssr: false,
  beforeLoad: requireRole(["super_admin"]),
  head: () => ({
    meta: [
      { title: "Admin Notifications — Admin Console — Compass Crew" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminNotificationsPage,
});

const CATEGORIES = [
  "all",
  "contact",
  "application",
  "sponsor",
  "partner",
  "mentor",
  "judge",
  "certificate",
  "submission",
  "content",
  "system",
];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  normal: "bg-primary/10 text-primary border-primary/20",
  low: "bg-muted text-muted-foreground border-border/40",
};

export function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [tab, setTab] = useState<"unread" | "read" | "archived" | "all">("unread");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AdminNotification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAdminNotificationsPaged(tab, category, searchQuery, page, pageSize);
      setItems(res.data);
      setTotalCount(res.totalCount);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [tab, category, searchQuery, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      await logAdminAction({
        action: "admin_notifications.mark_all_read",
        resourceType: "admin_notifications",
      });
      toast.success("Marked all admin alerts as read.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to mark all as read");
    }
  };

  const handleMarkOneRead = async (n: AdminNotification) => {
    try {
      await markAdminNotificationRead(n.id, true);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update notification");
    }
  };

  const handleArchive = async (n: AdminNotification) => {
    try {
      await archiveAdminNotification(n.id, true);
      toast.success("Notification archived.");
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to archive notification");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminNotification(deleteTarget.id);
      await logAdminAction({
        action: "admin_notifications.delete",
        resourceType: "admin_notifications",
        resourceId: deleteTarget.id,
        meta: { title: deleteTarget.title },
      });
      toast.success("Notification deleted.");
      setDeleteTarget(null);
      void load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete notification");
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Platform Notifications
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Administrative alerts covering sponsor inquiries, partner submissions, mentorship
            applications, and platform operations.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="h-8 gap-1.5 text-xs bg-card/60"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAllRead}
            className="h-8 gap-1.5 text-xs"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
      </header>

      {/* Controls Bar */}
      <Card className="border-border/60 bg-card/60 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as typeof tab);
              setPage(1);
            }}
          >
            <TabsList className="bg-muted/50 h-8">
              <TabsTrigger value="unread" className="text-xs">
                Unread
              </TabsTrigger>
              <TabsTrigger value="read" className="text-xs">
                Read
              </TabsTrigger>
              <TabsTrigger value="archived" className="text-xs">
                Archived
              </TabsTrigger>
              <TabsTrigger value="all" className="text-xs">
                All
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-8 pl-8 text-xs bg-background/60"
              />
            </div>

            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[150px] text-xs bg-background/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c === "all" ? "All categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery || category !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setCategory("all");
                  setPage(1);
                }}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert List */}
      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={tab === "unread" ? "You're all caught up" : "No platform notifications"}
          description={
            tab === "unread"
              ? "Zero unread platform alerts. Check other filters to inspect resolved notices."
              : "No platform alerts matched your selected category and status."
          }
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => {
            const internalTarget = safeInternalLink(n.link);

            return (
              <Card
                key={n.id}
                className={`transition border-border/60 ${
                  n.is_read
                    ? "bg-card/40 hover:bg-card/60"
                    : "border-primary/40 bg-primary/[0.03] shadow-sm hover:bg-primary/[0.05]"
                }`}
              >
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize font-medium ${
                          PRIORITY_STYLES[n.priority] ?? PRIORITY_STYLES.normal
                        }`}
                      >
                        {n.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {n.category}
                      </Badge>
                      {!n.is_read && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                          <BellRing className="h-3 w-3" /> unread
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground font-mono">
                        {new Date(n.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>

                    <h3
                      className={`mt-2 text-sm ${!n.is_read ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}
                    >
                      {n.title}
                    </h3>
                    {n.body && (
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    )}

                    {internalTarget && (
                      <div className="mt-2.5">
                        <Button
                          asChild
                          variant="link"
                          size="sm"
                          className="h-auto p-0 text-xs font-semibold text-primary gap-1"
                        >
                          <Link to={internalTarget}>
                            <span>Navigate to resource ({internalTarget})</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {!n.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkOneRead(n)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Mark read"
                        aria-label="Mark read"
                      >
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                    {!n.is_archived && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleArchive(n)}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Archive notification"
                        aria-label="Archive notification"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteTarget(n)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Delete notification"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && items.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 text-xs text-muted-foreground">
          <div>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
            {totalCount} alerts
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <span className="text-xs font-mono px-2">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="h-8 gap-1 text-xs bg-card/60"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Notification?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{deleteTarget?.title}"</strong>? This action
              permanently removes the alert from the administration console.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
