import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Trophy,
  Rocket,
  Users,
  ShieldCheck,
  Sparkles,
  Calendar,
  Gavel,
  Flag,
  GraduationCap,
  ArrowRight,
  Award,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth, ROLE_LABEL, type AppRole, profileCompletion } from "@/hooks/use-auth";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Compass Crew" },
      { name: "description", content: "Your Compass Crew dashboard." },
    ],
  }),
  component: DashboardPage,
});

/* ============================ Role content ============================ */

interface Widget {
  icon: LucideIcon;
  title: string;
  body: string;
  cta: { label: string; to: string };
}

const PARTICIPANT: Widget[] = [
  {
    icon: Trophy,
    title: "Hackathons",
    body: "Browse upcoming Compass Crew hackathons and register for the ones that fit you.",
    cta: { label: "Explore hackathons", to: "/hackathons" },
  },
  {
    icon: Users,
    title: "Your teams",
    body: "Create, manage or leave teams for every hackathon you've entered.",
    cta: { label: "Open teams", to: "/teams" },
  },
  {
    icon: Sparkles,
    title: "Invitations",
    body: "Accept team invitations from friends and organizers.",
    cta: { label: "View invitations", to: "/invitations" },
  },
  {
    icon: Award,
    title: "Certificates",
    body: "Download and share every certificate issued in your name.",
    cta: { label: "Open certificates", to: "/certificates" },
  },
  {
    icon: Bell,
    title: "Notifications",
    body: "Registrations, invitations, scores and certificates — all in one inbox.",
    cta: { label: "Open notifications", to: "/notifications" },
  },
  {
    icon: Calendar,
    title: "Events",
    body: "Workshops, AMAs and campus meetups — announced weekly.",
    cta: { label: "See events", to: "/events" },
  },
];

const ORGANIZER: Widget[] = [
  { icon: Trophy, title: "Your hackathons", body: "Create, publish and manage the hackathons you run.", cta: { label: "Open organizer console", to: "/organizer/hackathons" } },
  { icon: Sparkles, title: "New hackathon", body: "Ship a hackathon in minutes. Add tracks, prizes and judges as you go.", cta: { label: "Create hackathon", to: "/organizer/hackathons/new" } },
  { icon: Award, title: "Certificates & results", body: "Publish leaderboards and issue certificates from the organizer console.", cta: { label: "Open organizer console", to: "/organizer/hackathons" } },
  { icon: Users, title: "Community", body: "Grow campus chapters and community programs.", cta: { label: "Open community", to: "/community" } },
];

const JUDGE: Widget[] = [
  { icon: Gavel, title: "Judging queue", body: "Review and score submissions assigned to you.", cta: { label: "Open judge console", to: "/judge" } },
  { icon: Trophy, title: "Hackathons", body: "Explore the full slate of Compass Crew hackathons.", cta: { label: "Browse hackathons", to: "/hackathons" } },
  { icon: Award, title: "Certificates", body: "Your judge certificates land here after events wrap up.", cta: { label: "Open certificates", to: "/certificates" } },
];

const MENTOR: Widget[] = [
  { icon: Sparkles, title: "Mentorship sessions", body: "Set your availability and take office hours with student teams.", cta: { label: "Open community", to: "/community" } },
  { icon: Rocket, title: "Startup studio", body: "Coach teams in the Compass startup studio cohort.", cta: { label: "Explore", to: "/about" } },
];

const CAMPUS_AMBASSADOR: Widget[] = [
  { icon: Flag, title: "Your chapter", body: "Run meetups, promote hackathons and grow your campus crew.", cta: { label: "Chapter playbook", to: "/community" } },
  { icon: Users, title: "Ambassador community", body: "Connect with ambassadors across India.", cta: { label: "Open community", to: "/community" } },
];

const SUPER_ADMIN: Widget[] = [
  { icon: ShieldCheck, title: "Platform administration", body: "Manage users, roles, hackathons, events and content.", cta: { label: "Manage users", to: "/settings" } },
  { icon: Users, title: "User & role management", body: "Grant Organizer, Judge, Mentor or Ambassador roles.", cta: { label: "Open users", to: "/settings" } },
];

const GUEST: Widget[] = [
  { icon: GraduationCap, title: "Complete your profile", body: "Fill in your college, degree and skills to unlock full access.", cta: { label: "Edit profile", to: "/profile" } },
];

const WIDGETS: Record<AppRole, Widget[]> = {
  super_admin: SUPER_ADMIN,
  organizer: ORGANIZER,
  judge: JUDGE,
  mentor: MENTOR,
  campus_ambassador: CAMPUS_AMBASSADOR,
  participant: PARTICIPANT,
  guest: GUEST,
};

/* ============================ Page ============================ */

function DashboardPage() {
  const { user, profile, roles, primaryRole, loading } = useAuth();

  if (loading) {
    return (
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </Section>
    );
  }

  const widgets = WIDGETS[primaryRole];
  const completion = profileCompletion(profile);
  const firstName = (profile?.full_name ?? user?.email ?? "").split(" ")[0] || "there";

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {ROLE_LABEL[primaryRole]} dashboard
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Welcome back, <span className="text-gradient-brand">{firstName}</span>.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Everything the crew is building for you — hackathons, events, mentorship and open-source.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {roles.map((r) => (
                  <Badge key={r} variant="secondary">
                    {ROLE_LABEL[r]}
                  </Badge>
                ))}
              </div>
            </div>
            <Card className="w-full sm:w-80">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Profile completion</p>
                  <span className="text-sm font-semibold text-primary">{completion}%</span>
                </div>
                <Progress value={completion} className="h-2" />
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/profile">Complete profile</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Section>
        <SectionHeading eyebrow="Your dashboard" title="Where you go from here." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((w) => (
            <Card key={w.title} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                  <w.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
                </div>
                <Button asChild variant="ghost" className="px-0 text-primary">
                  <Link to={w.cta.to}>
                    {w.cta.label} <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
