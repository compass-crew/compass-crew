import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Trophy,
  Users,
  Award,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import {
  listMyNotifications,
  unreadCount,
  markRead,
  markAllRead,
  safeInternalLink,
  type Notification,
  type NotificationType,
} from "@/lib/notifications";

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

export function NotificationBell({ className }: { className?: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // Live unread count
  const countQuery = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: () => unreadCount(user!.id),
    enabled: !!user,
    refetchInterval: 15000, // Light background refresh every 15s
  });

  // Recent 5 notifications for dropdown
  const recentQuery = useQuery({
    queryKey: ["notifications", "recent", user?.id],
    queryFn: () => listMyNotifications(user!.id, { pageSize: 6 }),
    enabled: !!user && open,
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

  if (!user) return null;

  const count = countQuery.data ?? 0;
  const displayCount = count > 99 ? "99+" : count > 9 ? "9+" : count.toString();

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) {
      markOneMutation.mutate(n.id);
    }
    setOpen(false);

    if (n.link) {
      const target = safeInternalLink(n.link);
      if (target) {
        void navigate({ to: target });
      }
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-9 w-9 rounded-full text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary ${className ?? ""}`}
          aria-label={count > 0 ? `${count} unread notifications` : "Notifications"}
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in"
              aria-hidden="true"
            >
              {displayCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 shadow-xl border-border/70 bg-popover/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">Notifications</span>
            {count > 0 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {count} unread
              </Badge>
            )}
          </div>

          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllMutation.mutate()}
              disabled={markAllMutation.isPending}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </Button>
          )}
        </div>

        {/* List of Recent Items */}
        <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
          {recentQuery.isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !recentQuery.data || recentQuery.data.length === 0 ? (
            <div className="py-8 text-center px-4">
              <CheckCircle2 className="mx-auto h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">You're all caught up</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Updates regarding your registrations, teams, and awards will appear here.
              </p>
            </div>
          ) : (
            recentQuery.data.map((item) => {
              const Icon = getNotificationIcon(item.type);
              const destination = safeInternalLink(item.link);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleItemClick(item);
                    }
                  }}
                  className={`group relative flex items-start gap-3 p-3.5 text-xs transition cursor-pointer hover:bg-muted/40 ${
                    !item.is_read ? "bg-primary/[0.04]" : ""
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      !item.is_read
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`truncate text-xs ${
                          !item.is_read
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground/80"
                        }`}
                      >
                        {item.title}
                      </p>
                      {!item.is_read && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full bg-primary"
                          title="Unread notification"
                        />
                      )}
                    </div>

                    {item.body && (
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                        {item.body}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground/70">
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      {destination && (
                        <span className="flex items-center gap-0.5 text-primary group-hover:underline">
                          View details <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 p-2 text-center bg-muted/20">
          <Button
            asChild
            variant="ghost"
            size="sm"
            onClick={() => setOpen(false)}
            className="w-full h-7 text-xs font-medium text-primary hover:text-primary"
          >
            <Link to="/notifications">View all notifications</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
