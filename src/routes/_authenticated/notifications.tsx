import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { listMyNotifications, markAllRead, markRead, removeNotification } from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/notifications")({
  ssr: false,
  beforeLoad: ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
  },
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => listMyNotifications(user!.id),
    enabled: !!user,
  });

  const mAll = useMutation({
    mutationFn: () => markAllRead(user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });
  const mOne = useMutation({
    mutationFn: (id: string) => markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });
  const del = useMutation({
    mutationFn: (id: string) => removeNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications", user?.id] }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Everything you need to know across your hackathons, teams and certificates."
      >
        <Button variant="outline" onClick={() => mAll.mutate()} disabled={!q.data?.some((n) => !n.is_read)}>
          <Check className="mr-2 h-4 w-4" /> Mark all read
        </Button>
      </PageHeader>
      <Section>
        {q.isLoading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : !q.data?.length ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll see updates about registrations, teams, judging and certificates here." />
        ) : (
          <div className="space-y-3">
            {q.data.map((n) => (
              <Card key={n.id} className={n.is_read ? "" : "border-primary/40 bg-primary/5"}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="mt-0.5">
                    <Bell className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="secondary" className="text-[10px]">New</Badge>}
                      <span className="ml-auto text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-IN")}</span>
                    </div>
                    {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                    {n.link && <a href={n.link} className="mt-1 inline-block text-xs font-medium text-primary hover:underline">Open</a>}
                  </div>
                  <div className="flex gap-1">
                    {!n.is_read && (
                      <Button size="icon" variant="ghost" onClick={() => mOne.mutate(n.id)} aria-label="Mark read">
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(n.id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
