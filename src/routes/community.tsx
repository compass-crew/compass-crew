import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Megaphone,
  Calendar,
  Sparkles,
  Users,
  Code2,
  Rocket,
  Handshake,
  GraduationCap,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Instagram,
  Linkedin,
  Compass,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { listAnnouncements, listEvents, type SiteEvent } from "@/lib/public-cms";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Compass Crew" },
      {
        name: "description",
        content:
          "Connect, build, and grow with a nationwide network of student developers, designers, mentors, and founders.",
      },
      { property: "og:title", content: "Community — Compass Crew" },
      {
        property: "og:description",
        content: "Build. Connect. Grow. Connect with student innovators across India.",
      },
    ],
    links: [{ rel: "canonical", href: "/community" }],
  }),
  component: CommunityPage,
});

const SOCIAL_LINKS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/compasscrewindia" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/compasscrewnetwork" },
];

const WHO_ITS_FOR = [
  {
    icon: Code2,
    title: "Student Builders",
    description:
      "Developers, engineers, and creators building real products and competing in premier hackathons.",
  },
  {
    icon: Sparkles,
    title: "Designers & Product Thinkers",
    description:
      "UI/UX architects, product managers, and problem solvers shaping intuitive digital experiences.",
  },
  {
    icon: Rocket,
    title: "Founders & Innovators",
    description:
      "Students launching tech ventures, seeking co-founders, and turning project ideas into startups.",
  },
  {
    icon: Handshake,
    title: "Mentors & Industry Guides",
    description:
      "Experienced engineers and tech leads sharing architectural wisdom and career guidance.",
  },
];

const WHAT_HAPPENS = [
  {
    number: "01",
    title: "High-Impact Hackathons",
    description:
      "Real-time team formations, mentor office hours, live demos, and national showcase stages.",
  },
  {
    number: "02",
    title: "Hands-on Masterclasses",
    description:
      "Workshops and AMAs covering generative AI, systems architecture, Web3, and cloud infrastructure.",
  },
  {
    number: "03",
    title: "Cross-Campus Collaboration",
    description:
      "Connect beyond your university boundaries with teammates and peers across top institutions.",
  },
  {
    number: "04",
    title: "Direct Opportunities",
    description:
      "Access curated internships, sponsor bounties, and leadership roles through the Campus Network.",
  },
];

function fmtDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CommunityPage() {
  const { user, profile, primaryRole } = useAuth();

  const announcementsQuery = useQuery({
    queryKey: ["site-announcements"],
    queryFn: () => listAnnouncements(10),
  });

  const eventsQuery = useQuery({
    queryKey: ["site-events"],
    queryFn: listEvents,
  });

  const announcements = announcementsQuery.data ?? [];
  const upcomingEvents = (eventsQuery.data ?? [])
    .filter((e) => !e.ends_at || new Date(e.ends_at).getTime() >= Date.now())
    .slice(0, 3);

  const memberDisplayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Builder";

  return (
    <>
      {/* Community Hero */}
      <PageHeader
        eyebrow="Compass Crew Community"
        title={
          <>
            Build. Connect. <span className="text-gradient-brand">Grow.</span>
          </>
        }
        description="A student-first ecosystem connecting builders, designers, and innovators across India to ship meaningful technology together."
      >
        {user ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
              <Link to="/dashboard">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/hackathons">Explore Hackathons</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
              <Link to="/auth" search={{ mode: "signup", redirect: "/community" }}>
                Join the Crew <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth" search={{ redirect: "/community" }}>
                Sign In
              </Link>
            </Button>
          </div>
        )}
      </PageHeader>

      {/* Authenticated Member Hub Card */}
      {user && (
        <Section className="py-4">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card/80 to-card p-6 shadow-sm backdrop-blur-md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/30 capitalize text-xs">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                    {primaryRole}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Authenticated Member</span>
                </div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Welcome to the Crew, {memberDisplayName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your active hub for campus initiatives, hackathons, and team collaborations.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link to="/dashboard">My Dashboard</Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="text-xs">
                  <Link to="/hackathons">Competitions</Link>
                </Button>
                <Button asChild size="sm" className="bg-gradient-brand text-white text-xs">
                  <Link to="/events">Explore Events</Link>
                </Button>
              </div>
            </div>
          </div>
        </Section>
      )}

      {/* Community Announcements */}
      <Section className="pt-8">
        <SectionHeading
          eyebrow="Announcements"
          title="What's happening in the network"
          description="Official updates, schedule notices, and platform opportunities from the Compass Crew team."
        />

        <div className="mt-8">
          {announcementsQuery.isLoading ? (
            <div className="grid gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl border border-border/40 bg-muted/40"
                />
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="grid gap-4">
              {announcements.map((a) => (
                <Card
                  key={a.id}
                  className={`transition-all duration-200 hover:border-primary/40 ${
                    a.pinned
                      ? "border-primary/40 bg-card/80 shadow-sm"
                      : "border-border/60 bg-card/50"
                  }`}
                >
                  <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.pinned && (
                          <Badge className="bg-gradient-brand text-white text-[10px] font-semibold">
                            Pinned
                          </Badge>
                        )}
                        <h3 className="font-display text-base font-bold text-foreground">
                          {a.title}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                        {a.body}
                      </p>
                      {a.published_at && (
                        <p className="text-[11px] text-muted-foreground/80 font-mono">
                          {fmtDate(a.published_at)}
                        </p>
                      )}
                    </div>

                    {a.link_url && (
                      <Button asChild size="sm" variant="outline" className="shrink-0 text-xs">
                        <a href={a.link_url} target="_blank" rel="noreferrer">
                          {a.link_label ?? "Details"}{" "}
                          <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Megaphone}
              title="No new community announcements."
              description="Platform broadcasts and major event announcements will be posted here."
            />
          )}
        </div>
      </Section>

      {/* Featured Real Events */}
      <Section className="border-t border-border/60 bg-muted/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Activities"
            title="Upcoming Community Events"
            description="Participate in live sessions, hackathons, and development sprints."
          />
          <Button asChild variant="ghost" size="sm" className="text-xs self-start sm:self-end">
            <Link to="/events">
              View all events <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="mt-8">
          {eventsQuery.isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl border border-border/40 bg-muted/40"
                />
              ))}
            </div>
          ) : upcomingEvents.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {upcomingEvents.map((e) => (
                <Card
                  key={e.id}
                  className="group flex flex-col justify-between overflow-hidden border-border/60 bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
                >
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize text-xs">
                        {e.kind}
                      </Badge>
                      {e.mode && (
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {e.mode.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {e.title}
                    </h3>
                    {e.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                        {e.description}
                      </p>
                    )}
                    {e.starts_at && (
                      <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 pt-1">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        {new Date(e.starts_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </CardContent>

                  <div className="border-t border-border/40 p-4 bg-muted/10">
                    <Button asChild variant="outline" size="sm" className="w-full text-xs">
                      <Link to="/events/$slug" params={{ slug: e.slug }}>
                        Event Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No upcoming community activities."
              description="New events are currently being scheduled. Check back soon or browse our hackathons."
              action={
                <Button asChild variant="outline" size="sm">
                  <Link to="/hackathons">Explore Hackathons</Link>
                </Button>
              }
            />
          )}
        </div>
      </Section>

      {/* Who It's For */}
      <Section>
        <SectionHeading
          eyebrow="Ecosystem"
          title="Who is Compass Crew for?"
          description="A cross-disciplinary network bringing diverse talents together under one roof."
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHO_ITS_FOR.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-border/60 bg-card/60 p-6 transition duration-200 hover:border-primary/40 hover:bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* What Happens Here */}
      <Section className="border-t border-border/60 bg-muted/20">
        <SectionHeading
          eyebrow="Experience"
          title="What happens inside the Crew"
          description="Everything we do is focused on helping students build tangible software, collaborate, and launch."
          align="center"
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_HAPPENS.map((item) => (
            <div
              key={item.number}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm space-y-3"
            >
              <span className="font-mono text-2xl font-bold text-primary/60">{item.number}</span>
              <h3 className="font-display text-base font-bold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Socials & Connect Channels */}
      <Section className="border-t border-border/60 bg-muted/20 py-12">
        <SectionHeading eyebrow="Connect" title="Follow the Compass Crew Network" align="center" />
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {SOCIAL_LINKS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-6 py-2.5 text-xs font-semibold text-foreground transition hover:border-primary/40 hover:shadow-sm"
            >
              <s.icon className="h-4 w-4 text-primary" /> {s.label}
            </a>
          ))}
        </div>
      </Section>
    </>
  );
}
