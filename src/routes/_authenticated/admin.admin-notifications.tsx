import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import {
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  archiveAdminNotification,
  deleteAdminNotification,
  type AdminNotification,
} from "@/lib/admin-ops";

export const Route = createFileRoute("/_authenticated/admin/admin-notifications")({
  head: () => ({
    meta: [{ title: "Admin Notifications" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminNotificationsPage,
});

const CATEGORIES = ["all", "contact", "application", "certificate", "submission", "content", "system"];

const PRIORITY_STYLES: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-600 dark:text-red-400",
  high: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  normal: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

function AdminNotificationsPage() {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"unread" | "read" | "archived" | "all">("unread");
  const [category, setCategory] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listAdminNotifications(tab, category);
      setItems(rows);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, category]);

  const handleAllRead = async () => {
    try {
      await markAllAdminNotificationsRead();
      toast.success("Marked all as read");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Admin Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            New applications, contact messages, submissions, and certificates issued across the platform.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="read">Read</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c === "all" ? "All categories" : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid place-items-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title="You're all caught up" description="No notifications match the current view." />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={n.is_read ? "" : "border-primary/40 bg-primary/5"}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={PRIORITY_STYLES[n.priority] ?? PRIORITY_STYLES.normal}>{n.priority}</Badge>
                    <Badge variant="outline">{n.category}</Badge>
                    {!n.is_read && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <BellRing className="h-3 w-3" /> new
                      </span>
                    )}
                  </div>
                  <p className="mt-2 font-medium">{n.title}</p>
                  {n.body ? <p className="text-sm text-muted-foreground">{n.body}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  {n.link ? (
                    <Button variant="outline" size="sm" asChild>
                      <a href={n.link}><ExternalLink className="h-3.5 w-3.5" /></a>
                    </Button>
                  ) : null}
                  {!n.is_read && (
                    <Button variant="outline" size="sm" onClick={async () => { await markAdminNotificationRead(n.id, true); load(); }}>
                      <CheckCheck className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!n.is_archived && (
                    <Button variant="outline" size="sm" onClick={async () => { await archiveAdminNotification(n.id, true); load(); }}>
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (!confirm("Delete this notification?")) return;
                      await deleteAdminNotification(n.id);
                      load();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
