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
  TRUST_BADGES,
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
        content: "Hackathons, AI workshops, open-source and startup programs for student builders across India.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        {/* Animated gradient blobs */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-30 blur-3xl animate-blob" />
          <div className="absolute top-40 -left-32 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl animate-blob [animation-delay:-6s]" />
          <div className="absolute -bottom-24 right-0 h-[420px] w-[420px] rounded-full bg-secondary/25 blur-3xl animate-blob [animation-delay:-12s]" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

        {/* Floating AI-themed glyphs */}
        <FloatingGlyphs />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              India's student innovation platform
            </span>

            <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Build the future of India,
              <br className="hidden sm:block" />
              <span className="text-gradient-brand">one student team at a time.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Compass Crew is a student-led community for AI, technology, innovation and startups —
              a home for hackathons, workshops, open-source, research and startup programs across
              India.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-gradient-brand text-white shadow-glow hover:opacity-90">
                <Link to="/community">
                  Join Community <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="backdrop-blur">
                <Link to="/hackathons">Explore Hackathons</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
              {TRUST_BADGES.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Qualitative pillars (no fake numbers) */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-border bg-card/70 p-5 text-center backdrop-blur transition hover:-translate-y-0.5 hover:border-primary/40"
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

      {/* ============================ HACKATHONS ============================ */}
      <Section className="border-y border-border bg-muted/30">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Hackathons" title="What's on the horizon." />
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
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-background/50 p-3 text-sm text-muted-foreground">
                  <Trophy className="h-4 w-4 text-primary" />
                  {h.status}
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
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Events" title="Workshops, meetups and AMAs." />
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
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{e.kind}</Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ BENEFITS ============================ */}
      <Section className="border-y border-border bg-muted/30">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <SectionHeading
              eyebrow="Community benefits"
              title="Perks that actually move the needle."
              description="Real mentorship, real invites, real opportunities — not just another Discord server."
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
              <div
                key={b.title}
                className="group rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-gradient-brand group-hover:text-white">
                  <b.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-semibold">{b.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================ ABOUT / MISSION ============================ */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="About Compass Crew"
              title={<>A compass for India's next generation of builders.</>}
              description="Compass Crew exists to give every student in India a real path into building — through hackathons, learning tracks, open-source, research and startup programs. Talent is everywhere. We're closing the gap on opportunity."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/about">Read our story</Link>
              </Button>
              <Button asChild variant="ghost">
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

      {/* ============================ SPONSORS / PARTNERS ============================ */}
      <Section className="border-t border-border bg-muted/30">
        <SectionHeading
          eyebrow="Partners"
          title="Partner with Compass Crew."
          description="We're onboarding our first cohort of partner companies. Bring your team, tools and talent programs to India's student builder community."
          align="center"
        />
        <div className="mx-auto mt-10 max-w-4xl">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              "Your Logo Here",
              "Early Partner",
              "Become a Sponsor",
              "Your Logo Here",
              "Founding Partner",
              "Talent Partner",
              "Community Partner",
              "Your Logo Here",
            ].map((label, i) => (
              <div
                key={i}
                className="grid h-20 place-items-center rounded-xl border border-dashed border-border bg-card/60 px-3 text-center text-xs font-medium text-muted-foreground backdrop-blur transition hover:border-primary/50 hover:text-foreground"
              >
                {label}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
              <Link to="/partner">Partner with Compass Crew</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/sponsors">Sponsorship details</Link>
            </Button>
          </div>
        </div>
      </Section>

      {/* ============================ TESTIMONIALS (conditional) ============================ */}
      {TESTIMONIALS.length > 0 ? (
        <Section>
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
      ) : (
        <Section>
          <div className="mx-auto max-w-2xl rounded-3xl border border-dashed border-border bg-card/60 p-10 text-center backdrop-blur">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold">
              Community stories coming soon.
            </h3>
            <p className="mt-3 text-sm text-muted-foreground">
              We're just getting started. As our crew ships, wins and grows, their stories will
              live here.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline">
                <Link to="/community">Be one of the first</Link>
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* ============================ CTA ============================ */}
      <Section>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-10 text-white shadow-glow sm:p-16">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                Ready to build something worth talking about?
              </h2>
              <p className="mt-4 max-w-xl text-white/85">
                Free to join. Open to every student in India. Bring an idea, or find one — the crew
                has the rest.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-white/90 sm:grid-cols-2">
                {["Hackathons & build seasons", "Mentorship & networking", "AI & open-source tracks", "Internship & career leads"].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4" /> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <Button asChild size="lg" className="bg-white text-foreground hover:bg-white/90">
                <Link to="/community">Join Community</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-white/40 bg-white/10 text-white hover:bg-white/20"
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
    <div className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elegant">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{body}</p>
    </div>
  );
}

function FloatingGlyphs() {
  const items = [
    { label: "AI", top: "18%", left: "6%", delay: "0s" },
    { label: "</>", top: "28%", left: "88%", delay: "-3s" },
    { label: "∑", top: "62%", left: "4%", delay: "-6s" },
    { label: "◎", top: "70%", left: "90%", delay: "-9s" },
    { label: "⚙", top: "10%", left: "78%", delay: "-4s" },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block">
      {items.map((g) => (
        <div
          key={g.label}
          className="absolute grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card/70 font-display text-sm font-semibold text-primary backdrop-blur animate-float"
          style={{ top: g.top, left: g.left, animationDelay: g.delay }}
        >
          {g.label}
        </div>
      ))}
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
        <div
          aria-hidden
          className="flex shrink-0 animate-marquee items-center gap-10 pr-10"
        >
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
