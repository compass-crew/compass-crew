import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Calendar, MapPin, Trophy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/section";
import { STATS, FEATURES, HACKATHONS, EVENTS, BENEFITS, SPONSORS, TESTIMONIALS } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compass Crew — AI, Tech & Startup Community for Students" },
      {
        name: "description",
        content:
          "Join 12,000+ students across India building in AI, technology and startups. Hackathons, workshops, bootcamps and a mentor network — free to join.",
      },
      { property: "og:title", content: "Compass Crew — Where student builders find their crew" },
      {
        property: "og:description",
        content: "Hackathons, workshops, bootcamps and startup programs across India.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[1000px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Link
              to="/hackathons"
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur transition hover:border-primary/40 hover:text-foreground"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              BuildHack 2026 registrations are open
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>

            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Where student builders <br className="hidden sm:block" />
              <span className="text-gradient-brand">find their crew.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Compass Crew is a student-led community for AI, technology, innovation and
              startups — running hackathons, bootcamps and shipping programs across 48 campuses in India.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/community">
                  Join the crew <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/hackathons">Explore hackathons</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/70 p-5 text-center backdrop-blur"
              >
                <div className="font-display text-3xl font-semibold text-gradient-brand">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <Section>
        <SectionHeading
          eyebrow="Why Compass Crew"
          title="Everything you need to build, learn and ship."
          description="From your first commit to your first users — Compass Crew is a home for the entire student builder journey."
          align="center"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardHeader className="space-y-4">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* Hackathons */}
      <Section className="border-y border-border bg-muted/30">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="On the calendar" title="Upcoming hackathons" />
          <Button asChild variant="ghost">
            <Link to="/hackathons">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {HACKATHONS.map((h) => (
            <Card key={h.slug} className="group overflow-hidden">
              <div className={`h-28 bg-gradient-to-br ${h.color} relative`}>
                <div className="absolute inset-0 bg-grid opacity-30" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">
                  {h.tag}
                </Badge>
              </div>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h3 className="font-display text-xl font-semibold">{h.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{h.theme}</p>
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Calendar className="h-4 w-4" />{h.date}</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{h.location}</li>
                  <li className="flex items-center gap-2"><Trophy className="h-4 w-4" />{h.prize}</li>
                </ul>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-xs font-medium text-primary">{h.status}</span>
                  <Link to="/hackathons" className="text-sm font-medium text-foreground transition group-hover:text-primary">
                    Details →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Events */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="This month" title="Upcoming events" />
          <Button asChild variant="ghost">
            <Link to="/events">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e) => (
            <Card key={e.slug} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-3 p-6">
                <Badge variant="secondary">{e.kind}</Badge>
                <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>{e.date} · {e.time}</p>
                  <p>{e.mode}</p>
                  <p className="text-foreground/70">{e.host}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Community benefits */}
      <Section className="border-y border-border bg-muted/30">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Community benefits"
              title="Perks that actually move the needle."
              description="Real mentorship, real invites, real opportunities — not just a Discord server."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                <Link to="/community">Join the crew</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/resources">Browse resources</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div key={b.title} className="rounded-2xl border border-border bg-card p-5">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-semibold">{b.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Sponsors */}
      <Section>
        <SectionHeading
          eyebrow="Partners & sponsors"
          title="Backed by the companies you want to work at."
          align="center"
        />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {SPONSORS.map((s) => (
            <div
              key={s}
              className="grid h-16 place-items-center rounded-xl border border-border bg-card text-sm font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {s}
            </div>
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="border-y border-border bg-muted/30">
        <SectionHeading eyebrow="From the crew" title="Students building in public." align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name}>
              <CardContent className="space-y-5 p-6">
                <p className="text-sm leading-relaxed">"{t.quote}"</p>
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-10 text-white shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to build something worth talking about?
              </h2>
              <p className="mt-4 max-w-xl text-white/85">
                Free to join. Open to every student in India. Bring an idea, or find one — the crew has the rest.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
                {["Weekly build sessions", "Mentor introductions", "Hackathon invitations", "Job & internship leads"].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check className="h-4 w-4" /> {i}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                <Link to="/community">Join the crew</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">
                <Link to="/partner">Partner with us</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
