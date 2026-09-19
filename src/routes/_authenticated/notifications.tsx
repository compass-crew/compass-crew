import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Trophy,
  Users,
  Award,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import {
  listMyNotificationsPaged,
  markAllRead,
  markRead,
  removeNotification,
  safeInternalLink,
  getNotificationCategory,
  type Notification,
  type NotificationType,
  type NotificationCategoryGroup,
} from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/notifications")({
  ssr: false,
  beforeLoad: ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
  },
  head: () => ({
    meta: [
      { title: "Inbox & Notifications — Compass Crew" },
      {
        name: "description",
        content: "Review notifications across hackathons, teams, and awards.",
      },
    ],
  }),
  component: NotificationsPage,
});

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "hackathon_started":
    case "results_published":
    case "submission_reminder":
    case "registration_approved":
    case "registration_rejected":
      return Trophy;
    case "invite_received":
    case "invite_accepted":
    case "invite_declined":
      return Users;
    case "certificate_ready":
      return Award;
    case "announcement":
      return Megaphone;
    case "generic":
    default:
      return Bell;
  }
}

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const [categoryGroup, setCategoryGroup] = useState<NotificationCategoryGroup>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const query = useQuery({
    queryKey: ["notifications", "inbox", user?.id, tab, categoryGroup, searchQuery, page],
    queryFn: () =>
      listMyNotificationsPaged(user!.id, {
        filter: tab,
        categoryGroup,
        search: searchQuery,
        page,
        pageSize,
      }),
    enabled: !!user,
  });

  const markAllMutation = useMutation({
    mutationFn: () => markAllRead(user!.id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = query.data?.data ?? [];
  const totalCount = query.data?.totalCount ?? 0;
  const unreadCount = query.data?.unreadCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleOpenLink = (n: Notification) => {
    if (!n.is_read) {
      markOneMutation.mutate(n.id);
    }
    if (n.link) {
      const destination = safeInternalLink(n.link);
      if (destination) {
        void navigate({ to: destination });
      }
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Live activity stream for hackathon registrations, team rosters, judging milestones, and certificate releases."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
            disabled={query.isFetching}
            className="h-9 gap-1.5 text-xs bg-card/60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllMutation.mutate()}
            disabled={unreadCount === 0 || markAllMutation.isPending}
            className="h-9 gap-1.5 text-xs"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all as read
          </Button>
        </div>
      </PageHeader>

      <Section>
        {/* Controls Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as typeof tab);
                setPage(1);
              }}
            >
              <TabsList className="bg-muted/60 h-9">
                <TabsTrigger value="all" className="text-xs">
                  All ({tab === "all" ? totalCount : "All"})
                </TabsTrigger>
                <TabsTrigger value="unread" className="text-xs">
                  Unread {unreadCount > 0 ? `(${unreadCount})` : ""}
                </TabsTrigger>
                <TabsTrigger value="read" className="text-xs">
                  Read
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Select
              value={categoryGroup}
              onValueChange={(v) => {
                setCategoryGroup(v as NotificationCategoryGroup);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-[150px] text-xs bg-card/60">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="hackathons">Hackathons</SelectItem>
                <SelectItem value="teams">Teams & Invites</SelectItem>
                <SelectItem value="certificates">Certificates</SelectItem>
                <SelectItem value="announcements">Announcements</SelectItem>
                <SelectItem value="system">Platform</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative min-w-[180px] flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="h-9 pl-8 text-xs bg-card/60"
              />
            </div>

            {(categoryGroup !== "all" || searchQuery || tab !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTab("all");
                  setCategoryGroup("all");
                  setSearchQuery("");
                  setPage(1);
                }}
                className="h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Notifications Stream */}
        {query.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={tab === "unread" ? CheckCircle2 : Bell}
            title={tab === "unread" ? "You're all caught up" : "No notifications found"}
            description={
              tab === "unread"
                ? "You have zero unread notifications. Check the 'All' tab to review previous messages."
                : "You'll receive updates about hackathon milestones, teams, and certificates here."
            }
          />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const Icon = getNotificationIcon(n.type);
              const categoryLabel = getNotificationCategory(n.type);
              const destination = safeInternalLink(n.link);

              return (
                <Card
                  key={n.id}
                  className={`transition border-border/60 ${
                    n.is_read
                      ? "bg-card/40 hover:bg-card/70"
                      : "border-primary/40 bg-primary/[0.03] shadow-sm hover:bg-primary/[0.05]"
                  }`}
                >
                  <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
                    <div
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        !n.is_read
                          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                          {categoryLabel}
                        </Badge>
                        {!n.is_read && (
                          <Badge className="text-[10px] bg-primary text-primary-foreground font-semibold">
                            New
                          </Badge>
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
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {n.body}
                        </p>
                      )}

                      {destination && (
                        <div className="mt-3">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleOpenLink(n)}
                            className="h-auto p-0 text-xs font-semibold text-primary gap-1"
                          >
                            <span>Open destination</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {!n.is_read && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markOneMutation.mutate(n.id)}
                          disabled={markOneMutation.isPending}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Mark as read"
                          aria-label="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteMutation.mutate(n.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Remove notification"
                        aria-label="Remove notification"
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

        {/* Pagination Controls */}
        {!query.isLoading && notifications.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 text-xs text-muted-foreground">
            <div>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount} notifications
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
      </Section>
    </>
  );
}
