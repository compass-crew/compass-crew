import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Trophy, Check, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/section";
import {
  STATS,
  FEATURES,
  HACKATHONS,
  EVENTS,
  BENEFITS,
  TESTIMONIALS,
} from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compass Crew — India's Student Innovation Platform" },
      {
        name: "description",
        content:
          "Compass Crew is India's student-led community for AI, technology, innovation and startups — with hackathons, bootcamps, open-source and research programs for student builders.",
      },
      { property: "og:title", content: "Compass Crew — India's Student Innovation Platform" },
      {
        property: "og:description",
        content:
          "Hackathons, AI workshops, open-source and startup programs for student builders across India.",
      },
    ],
  }),
  component: Home,
});

// Honest platform values — not achievements, not metrics.
const PLATFORM_VALUES = [
  "AI First",
  "Open Source Friendly",
  "Community Driven",
  "Built for Students",
  "Innovation Focused",
  "Real Projects",
];

function Home() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        {/* Subtle glow — no animated blobs, no fake illustrations */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-glow opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
        {/* Soft fade to background at the bottom of the hero */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-background"
        />

        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="mx-auto max-w-3xl text-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-elegant backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              India's student innovation platform
            </span>

            <h1 className="mt-7 font-display text-[2.75rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[4.5rem]">
              Build the future of India,
              <br className="hidden sm:block" />
              <span className="text-gradient-brand">one student team at a time.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Compass Crew is a student-led community for AI, technology, innovation and startups —
              a home for hackathons, workshops, open-source, research and startup programs across
              India.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:[&]:btn-premium-hover"
              >
                <Link to="/community">
                  Join Community <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-lg border-border/80 bg-card/60 px-5 text-sm font-semibold backdrop-blur transition hover:-translate-y-px hover:border-primary/40 hover:bg-card"
              >
                <Link to="/hackathons">Explore Hackathons</Link>
              </Button>
            </div>
          </div>

          {/* Trust strip — platform values, not fake metrics */}
          <div className="mx-auto mt-14 max-w-4xl">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              What we stand for
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
              {PLATFORM_VALUES.map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/70 px-3.5 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur transition hover:border-primary/40 hover:text-foreground"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Qualitative pillars — no fake numbers */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border/80 bg-card/70 p-5 text-center backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
              >
                <div className="font-display text-xl font-semibold text-gradient-brand sm:text-2xl">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Focus marquee */}
        <Marquee />
      </section>

      {/* ============================ FEATURES ============================ */}
      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="Everything a student builder needs — in one crew."
          description="From your first commit to your first users. Compass Crew is a home for the entire student builder journey."
          align="center"
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group border-border/80 bg-card transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <CardHeader className="space-y-5 p-7">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-border/80 bg-muted/60 text-primary transition duration-300 group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white">
                  <f.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight">{f.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ HACKATHONS ============================ */}
      <Section className="border-y border-border bg-muted/40">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
          <SectionHeading eyebrow="Hackathons" title="What's on the horizon." />
          <Button asChild variant="ghost" className="shrink-0">
            <Link to="/hackathons">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {HACKATHONS.map((h) => (
            <Card
              key={h.slug}
              className="group overflow-hidden border-border/80 transition duration-300 hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className={`relative h-28 bg-gradient-to-br ${h.color}`}>
                <div aria-hidden className="absolute inset-0 bg-grid opacity-50 mix-blend-overlay" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white backdrop-blur">
                  {h.tag}
                </Badge>
              </div>
              <CardContent className="space-y-5 p-6">
                <div>
                  <h3 className="font-display text-xl font-semibold tracking-tight">{h.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{h.theme}</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-background/60 p-3 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{h.status}</span>
                </div>
                <div className="border-t border-border pt-4">
                  <Link
                    to="/hackathons"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground transition group-hover:text-primary"
                  >
                    Learn more <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ EVENTS ============================ */}
      <Section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
          <SectionHeading eyebrow="Events" title="Workshops, meetups and AMAs." />
          <Button asChild variant="ghost" className="shrink-0">
            <Link to="/events">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e) => (
            <Card
              key={e.slug}
              className="group border-border/80 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{e.kind}</Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug tracking-tight">
                  {e.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{e.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ BENEFITS ============================ */}
      <Section className="border-y border-border bg-muted/40">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Community benefits"
              title="Perks that actually move the needle."
              description="Real mentorship, real invites, real opportunities — a national community for student builders."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:[&]:btn-premium-hover"
              >
                <Link to="/community">Join the crew</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/80">
                <Link to="/resources">Browse resources</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-border/80 bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition duration-300 group-hover:bg-gradient-brand group-hover:text-white">
                  <b.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-semibold tracking-tight">{b.title}</h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================ ABOUT / MISSION ============================ */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About Compass Crew"
              title={<>A compass for India's next generation of builders.</>}
              description="Compass Crew exists to give every student in India a real path into building — through hackathons, learning tracks, open-source, research and startup programs. Talent is everywhere. We're closing the gap on opportunity."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/80">
                <Link to="/about">Read our story</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-lg">
                <Link to="/partner">Partner with us</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MissionCard eyebrow="Mission" body="Give every student in India a real path into AI, technology and startups." />
            <MissionCard eyebrow="Vision" body="A generation of Indian students who ship, not just study." />
            <MissionCard eyebrow="Who can join" body="Any student in India — undergrad, grad or school — curious about building." />
            <MissionCard eyebrow="How to join" body="Free to join, open to every campus. Start with the community page." />
          </div>
        </div>
      </Section>

      {/* ============================ PARTNERS (honest empty state) ============================ */}
      <Section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-3xl text-center">
          <SectionHeading
            eyebrow="Partners"
            title="Partner with Compass Crew."
            description="We're onboarding our first cohort of partner companies. Bring your team, tools and talent programs to India's student builder community."
            align="center"
          />
        </div>
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
            <Compass className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm text-muted-foreground">
            Partner logos will appear here once our first partnerships go live. Until then, this
            space stays honest.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:[&]:btn-premium-hover"
            >
              <Link to="/partner">Partner with Compass Crew</Link>
            </Button>
            <Button asChild variant="outline" className="h-11 rounded-lg border-border/80">
              <Link to="/sponsors">Sponsorship details</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* ============================ TESTIMONIALS (conditional, honest) ============================ */}
      {TESTIMONIALS.length > 0 ? (
        <Section>
          <SectionHeading eyebrow="From the crew" title="Students building in public." align="center" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border/80">
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
      ) : (
        <Section>
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Community stories coming soon.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We're just getting started. As our crew ships, wins and grows, their stories will
              live here.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/80">
                <Link to="/community">Be one of the first</Link>
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* ============================ CTA ============================ */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-10 text-white shadow-glow sm:p-16">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-30 mix-blend-overlay" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                Ready to build something worth talking about?
              </h2>
              <p className="mt-4 max-w-xl text-white/85">
                Free to join. Open to every student in India. Bring an idea, or find one — the crew
                has the rest.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
                {["Hackathons & build seasons", "Mentorship & networking", "AI & open-source tracks", "Internship & career leads"].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Button
                asChild
                size="lg"
                className="h-11 rounded-lg bg-white px-5 text-sm font-semibold text-foreground shadow-elegant hover:-translate-y-px hover:bg-white"
              >
                <Link to="/community">Join Community</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 rounded-lg border-white/40 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
              >
                <Link to="/partner">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}

/* ============================ Sub-components ============================ */

function MissionCard({ eyebrow, body }: { eyebrow: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}

function Marquee() {
  const items = [
    "AI",
    "Hackathons",
    "Open Source",
    "Innovation",
    "Research",
    "Startups",
    "Community",
    "Workshops",
    "Bootcamps",
    "Career Growth",
  ];
  return (
    <div className="relative border-y border-border bg-card/40 py-4 backdrop-blur">
      <div className="marquee-mask flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {items.concat(items).map((label, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            >
              <span className="text-gradient-brand">◆</span>&nbsp;&nbsp;{label}
            </span>
          ))}
        </div>
        <div aria-hidden className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {items.concat(items).map((label, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            >
              <span className="text-gradient-brand">◆</span>&nbsp;&nbsp;{label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
