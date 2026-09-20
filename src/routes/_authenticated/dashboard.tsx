import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Users,
  Shield,
  Calendar,
  ArrowRight,
  Award,
  Bell,
  CheckCircle2,
  Sparkles,
  Inbox,
  Globe,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth, ROLE_LABEL, profileCompletion } from "@/hooks/use-auth";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { unreadCount, listMyNotifications } from "@/lib/notifications";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard — Compass Crew" },
      {
        name: "description",
        content: "Your Compass Crew home base for hackathons, teams, and achievements.",
      },
    ],
  }),
  component: DashboardPage,
});

/* ============================ Core Modules ============================ */

interface CoreModule {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  to: string;
  badge?: string;
}

const CORE_MODULES: CoreModule[] = [
  {
    id: "hackathons",
    icon: Trophy,
    title: "Hackathons",
    description:
      "Discover upcoming student hackathons, register your participation, and track submissions.",
    cta: "Explore hackathons",
    to: "/hackathons",
  },
  {
    id: "events",
    icon: Calendar,
    title: "Events & Workshops",
    description: "Participate in live builder workshops, technical AMAs, and campus tech meetups.",
    cta: "See all events",
    to: "/events",
  },
  {
    id: "teams",
    icon: Users,
    title: "My Teams",
    description: "Form squads, invite peers, and manage rosters for every hackathon you enter.",
    cta: "Manage teams",
    to: "/teams",
  },
  {
    id: "certificates",
    icon: Award,
    title: "Certificates",
    description:
      "Access and share verified cryptographic credentials and participation honors issued in your name.",
    cta: "View certificates",
    to: "/certificates",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description:
      "Team invitations, score releases, and platform announcements gathered in one inbox.",
    cta: "Open notifications",
    to: "/notifications",
  },
  {
    id: "community",
    icon: Globe,
    title: "Community Hub",
    description:
      "Connect with campus chapters, builder cohorts, and fellow innovators across India.",
    cta: "Visit community",
    to: "/community",
  },
];

/* ============================ Main Page ============================ */

function DashboardPage() {
  const { user, profile, roles, primaryRole, hasRole, loading } = useAuth();

  const { data: userUnreadCount = 0 } = useQuery({
    queryKey: ["notifications", "unread-count", user?.id],
    queryFn: () => (user?.id ? unreadCount(user.id) : 0),
    enabled: !!user?.id,
    refetchInterval: 20000,
  });

  const { data: recentNotifications = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["notifications", "recent-activity", user?.id],
    queryFn: () => (user?.id ? listMyNotifications(user.id, { pageSize: 4 }) : []),
    enabled: !!user?.id,
  });

  if (loading) {
    return (
      <Section className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </Section>
    );
  }

  const phoneValue = profile?.phone || (user?.user_metadata?.phone as string | undefined);
  const completion = profileCompletion(profile, phoneValue);
  const firstName = (profile?.full_name ?? user?.email ?? "").split(" ")[0] || "there";
  const isSuperAdmin = hasRole("super_admin");

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-muted/30 to-background">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-25" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[340px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {ROLE_LABEL[primaryRole]} Dashboard
                </span>
                {isSuperAdmin && (
                  <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
                    Admin Privileges
                  </Badge>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                Welcome back, <span className="text-gradient-brand">{firstName}</span>.
              </h1>
              <p className="max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Everything the crew is building with you — hackathons, events, teams, and innovation
                tracks.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary" className="text-[11px] font-medium">
                    {ROLE_LABEL[r]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Profile Completion Card */}
            <Card className="w-full shrink-0 border-border/60 shadow-sm sm:w-80 lg:w-88">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">Profile completion</span>
                  <span className="text-xs font-semibold text-primary">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
                <p className="text-[11px] text-muted-foreground">
                  {completion === 100
                    ? "Your profile is complete and verified for all events."
                    : "Complete your profile to unlock team invitations and mentorship."}
                </p>
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-gradient-brand font-medium text-white shadow-sm hover:opacity-90 text-xs"
                >
                  <Link to="/profile">
                    {completion === 100 ? "Edit profile" : "Complete profile"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
        {/* Admin Console Entry Banner for Super Admins */}
        {isSuperAdmin && (
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-r from-card via-card to-primary/[0.06] shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground sm:text-base">
                    Platform Administration
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Manage users, RBAC roles, hackathon submissions, platform settings, and view
                    security audit logs.
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="sm"
                className="shrink-0 bg-gradient-brand text-white hover:opacity-90"
              >
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                >
                  <span>Open Admin Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Next Actions Section */}
        <section aria-labelledby="next-actions-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="next-actions-heading"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Recommended Next Steps
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {completion < 100 && (
              <NextActionCard
                title="Complete your builder profile"
                description="Add your college, skills, photo, and mobile number to unlock hackathons."
                to="/profile"
                cta="Go to profile"
              />
            )}
            {userUnreadCount > 0 ? (
              <NextActionCard
                title={`You have ${userUnreadCount} unread notification${userUnreadCount > 1 ? "s" : ""}`}
                description="Review new team invitations, announcements, and results in your inbox."
                to="/notifications"
                cta="View inbox"
                badge={`${userUnreadCount} new`}
              />
            ) : (
              <NextActionCard
                title="Assemble or join a team"
                description="Find fellow hackers, invite collaborators, and build your hackathon team."
                to="/teams"
                cta="Open team manager"
              />
            )}
            <NextActionCard
              title="Explore active hackathons"
              description="Browse student challenges, solve real-world problems, and compete for prizes."
              to="/hackathons"
              cta="Browse competitions"
            />
          </div>
        </section>

        {/* Core Modules Grid */}
        <section aria-labelledby="core-modules-heading" className="space-y-4">
          <div className="space-y-1">
            <h2
              id="core-modules-heading"
              className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl"
            >
              Platform Destinations
            </h2>
            <p className="text-xs text-muted-foreground">
              Quick access to your innovation workspace, competitions, and credentials.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_MODULES.map((module) => {
              const hasUnread = module.id === "notifications" && userUnreadCount > 0;
              return (
                <Card
                  key={module.id}
                  className="group relative flex flex-col justify-between border-border/60 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-sm"
                >
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white shadow-xs">
                        <module.icon className="h-5 w-5" />
                      </div>
                      {hasUnread && (
                        <Badge className="bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {userUnreadCount} unread
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {module.title}
                      </h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {module.description}
                      </p>
                    </div>
                    <div className="pt-2">
                      <Link
                        to={module.to}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                      >
                        <span>{module.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Recent Activity Section */}
        <section aria-labelledby="activity-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2
                id="activity-heading"
                className="font-display text-lg font-bold tracking-tight text-foreground sm:text-xl"
              >
                Recent Activity
              </h2>
              <p className="text-xs text-muted-foreground">
                Your live participation log, invitations, and milestone notifications.
              </p>
            </div>
            {recentNotifications.length > 0 && (
              <Button asChild variant="ghost" size="sm" className="text-xs text-primary">
                <Link to="/notifications" className="inline-flex items-center gap-1">
                  <span>View all</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {loadingActivity ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : recentNotifications.length === 0 ? (
            <Card className="border-dashed border-border/70 bg-muted/15">
              <CardContent className="flex flex-col items-center justify-center p-5 text-center sm:p-6">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <Inbox className="h-4 w-4" />
                </div>
                <h3 className="mt-2 text-xs font-semibold text-foreground sm:text-sm">
                  No recent activity yet.
                </h3>
                <p className="mt-0.5 max-w-sm text-[11px] text-muted-foreground leading-relaxed">
                  Join a hackathon, accept a team invite, or earn a certificate to see updates here.
                </p>
                <Button asChild size="sm" variant="outline" className="mt-3 h-7.5 px-3 text-xs">
                  <Link to="/hackathons">Browse Hackathons</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card overflow-hidden">
              {recentNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{notif.body}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(notif.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

/* ============================ Helper Components ============================ */

function NextActionCard({
  title,
  description,
  to,
  cta,
  badge,
}: {
  title: string;
  description: string;
  to: string;
  cta: string;
  badge?: string;
}) {
  return (
    <Card className="group border-border/60 bg-card transition hover:border-primary/40 hover:shadow-xs">
      <CardContent className="flex flex-col justify-between p-4 space-y-2.5">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-semibold text-foreground">{title}</h4>
            {badge && (
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[9px] px-1.5 py-0">
                {badge}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
        </div>
        <Link
          to={to}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:underline"
        >
          <span>{cta}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
