import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Compass,
  Check,
  Trophy,
  Zap,
  Users,
  Rocket,
  Github,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section, SectionHeading } from "@/components/section";
import { FEATURES, HACKATHONS, EVENTS, BENEFITS, TESTIMONIALS } from "@/data/site";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const PILLARS = [
  { label: "Community", value: "Growing", hint: "Student-led" },
  { label: "Access", value: "Pan-India", hint: "Every campus" },
  { label: "Programs", value: "Monthly", hint: "Year-round" },
  { label: "Tracks", value: "Multiple", hint: "Pick your path" },
];

const TAG_ROW = [
  "AI",
  "Hackathons",
  "Open Source",
  "Research",
  "Startups",
  "Community",
  "Workshops",
  "Bootcamps",
];

const ROADMAP = [
  { step: "01", title: "Join the crew", body: "Sign up in under a minute. Free, open to any student in India." },
  { step: "02", title: "Pick a track", body: "AI, hackathons, open-source, research or startup — start where you are." },
  { step: "03", title: "Ship in public", body: "Build with mentors and peers, then demo to founders and judges." },
  { step: "04", title: "Grow with us", body: "Certificates, referrals, campus roles, and a portfolio recruiters read." },
];

function Home() {
  return (
    <>
      {/* ============================ HERO — editorial ============================ */}
      <section className="relative overflow-hidden border-b border-border/60">
        {/* Mesh gradient + soft radial wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-70" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-glow opacity-50" />
        {/* Grid whisper + film noise */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-60" />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-noise opacity-[0.35] mix-blend-overlay" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-b from-transparent to-background"
        />


        <div className="relative mx-auto max-w-7xl px-5 pt-16 pb-10 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          {/* Eyebrow */}
          <div className="flex justify-center animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/70 px-3 py-1 text-[11px] font-medium tracking-wide text-muted-foreground shadow-elegant backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              India's student innovation platform
            </span>
          </div>

          {/* Editorial headline */}
          <h1
            className="mx-auto mt-8 max-w-5xl text-center font-display font-bold tracking-[-0.045em] text-[2.75rem] leading-[0.98] sm:text-[4.5rem] lg:text-[6rem] animate-fade-up"
            style={{ animationDelay: "60ms" }}
          >
            Bold Ideas That
            <br />
            <span className="italic font-light text-foreground/90">Start</span> With{" "}
            <span className="text-gradient-brand">Vision.</span>
          </h1>

          <p
            className="mx-auto mt-6 max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            Compass Crew helps India's student builders craft hackathons, AI, open-source and
            startup stories that inspire action — and ship real work.
          </p>

          <div
            className="mt-9 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
            style={{ animationDelay: "180ms" }}
          >
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-elegant hover:-translate-y-px hover:bg-foreground/90"
            >
              <Link to="/community">
                Join The Crew
                <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="h-12 rounded-full px-5 text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              <Link to="/hackathons">
                Explore hackathons <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Editorial imagery band — two compass symbols reaching, halftone feel via SVG */}
          <div
            aria-hidden
            className="relative mx-auto mt-14 grid max-w-6xl grid-cols-2 items-end gap-6 sm:gap-12 animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="relative flex h-40 items-end justify-end sm:h-56 lg:h-72">
              <HalftoneCompass className="h-full w-auto opacity-90 -scale-x-100" />
            </div>
            <div className="relative flex h-40 items-end justify-start sm:h-56 lg:h-72">
              <HalftoneCompass className="h-full w-auto opacity-90" glow />
            </div>
            {/* Center spark */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-16 w-16 rounded-full bg-gradient-brand opacity-40 blur-2xl sm:h-24 sm:w-24" />
            </div>
          </div>

          {/* Trusted-by strip */}
          <TrustedStrip />
        </div>
      </section>

      {/* ============================ BENTO / WHAT WE DO ============================ */}
      <Section>
        <SectionHeading
          eyebrow="What we do"
          title="A full stack for student builders."
          description="From your first pull request to your first pitch — one crew, many paths."
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-6 lg:grid-rows-2">
          {/* Large — Hackathons */}
          <BentoCard
            className="lg:col-span-3 lg:row-span-2"
            icon={Trophy}
            eyebrow="Flagship"
            title="Hackathons & build seasons"
            body="Weekend sprints and multi-week build seasons where student teams ship products with mentors and industry judges."
            to="/hackathons"
            cta="Browse hackathons"
            tall
          />
          <BentoCard
            className="lg:col-span-3"
            icon={Brain}
            eyebrow="AI"
            title="Applied AI tracks"
            body="Reading groups, agents, evals and small models — hands-on, not hand-wavy."
            to="/events"
            cta="See events"
          />
          <BentoCard
            className="lg:col-span-2"
            icon={Github}
            eyebrow="Open Source"
            title="OSS Labs"
            body="Land your first meaningful PR."
            to="/resources"
            cta="Resources"
          />
          <BentoCard
            className="lg:col-span-1"
            icon={Rocket}
            eyebrow="Studio"
            title="Startups"
            body="Idea → users."
            to="/community"
            cta="Join"
          />
        </div>

        {/* Secondary features row */}
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.slice(3).map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/70 bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-border/70 bg-muted/50 text-primary transition group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white">
                <f.icon className="h-[18px] w-[18px]" />
              </span>
              <h3 className="mt-5 font-display text-[16.5px] font-semibold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================ HOW IT WORKS ============================ */}
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="How it works"
              title="Four steps. No gatekeepers."
              description="Compass Crew is free and open. Come as you are — student, first-year, dropout, self-taught. We meet you where you are and give you a path forward."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
              >
                <Link to="/auth">Get started</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-lg text-sm">
                <Link to="/faqs">Read the FAQs</Link>
              </Button>
            </div>
          </div>
          <ol className="relative space-y-3">
            {ROADMAP.map((r, i) => (
              <li
                key={r.step}
                className="group relative flex gap-5 rounded-2xl border border-border/70 bg-card p-5 transition hover:border-primary/30 hover:shadow-elegant sm:p-6"
              >
                <div className="flex flex-col items-center">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand font-display text-[13px] font-semibold text-white shadow-elegant">
                    {r.step}
                  </span>
                  {i < ROADMAP.length - 1 && (
                    <span aria-hidden className="mt-2 h-full w-px bg-border/70" />
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <h3 className="font-display text-[16.5px] font-semibold tracking-tight">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {r.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ============================ HACKATHONS PREVIEW ============================ */}
      <Section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
          <SectionHeading eyebrow="Hackathons" title="What's on the horizon." />
          <Button asChild variant="ghost" className="shrink-0 text-sm">
            <Link to="/hackathons">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {HACKATHONS.map((h) => (
            <Card
              key={h.slug}
              className="group overflow-hidden border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
            >
              <div className={`relative h-24 bg-gradient-to-br ${h.color}`}>
                <div aria-hidden className="absolute inset-0 bg-grid opacity-40 mix-blend-overlay" />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-white/15 text-white shadow-elegant backdrop-blur-md">
                  {h.tag}
                </Badge>
              </div>
              <CardContent className="space-y-4 p-6">
                <div>
                  <h3 className="font-display text-[17.5px] font-semibold tracking-tight">
                    {h.title}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                    {h.theme}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-2.5 text-[12.5px] text-muted-foreground">
                  <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
                  <span className="truncate">{h.status}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border/70 pt-4">
                  <Link
                    to="/hackathons"
                    className="inline-flex items-center gap-1 text-sm font-medium text-foreground/80 transition group-hover:text-primary"
                  >
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ BENEFITS ============================ */}
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              eyebrow="Community benefits"
              title="Perks that move the needle."
              description="Real mentorship, real invites, real opportunities — a national community built for student builders."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-lg px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
              >
                <Link to="/community">Join the crew</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/70">
                <Link to="/resources">Browse resources</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="group rounded-2xl border border-border/70 bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary transition duration-300 group-hover:bg-gradient-brand group-hover:text-white">
                  <b.icon className="h-[18px] w-[18px]" />
                </span>
                <h4 className="mt-4 text-[14.5px] font-semibold tracking-tight">{b.title}</h4>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================ EVENTS ============================ */}
      <Section>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-6 sm:flex sm:flex-wrap sm:justify-between">
          <SectionHeading eyebrow="Events" title="Workshops, meetups and AMAs." />
          <Button asChild variant="ghost" className="shrink-0 text-sm">
            <Link to="/events">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {EVENTS.map((e) => (
            <Card
              key={e.slug}
              className="group border-border/70 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
            >
              <CardContent className="space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-medium">
                    {e.kind}
                  </Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/90">
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display text-[17px] font-semibold leading-snug tracking-tight">
                  {e.title}
                </h3>
                <p className="text-[13.5px] leading-relaxed text-muted-foreground">{e.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* ============================ MISSION ============================ */}
      <Section tone="alt">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="About Compass Crew"
              title={<>A compass for India's next generation of builders.</>}
              description="Compass Crew exists to give every student in India a real path into building — through hackathons, learning tracks, open-source, research and startup programs. Talent is everywhere. We're closing the gap on opportunity."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/70">
                <Link to="/about">Read our story</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-lg">
                <Link to="/partner">Partner with us</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <MissionCard
              eyebrow="Mission"
              body="Give every student in India a real path into AI, technology and startups."
            />
            <MissionCard
              eyebrow="Vision"
              body="A generation of Indian students who ship — not just study."
            />
            <MissionCard
              eyebrow="Who can join"
              body="Any student in India — undergrad, grad or school — curious about building."
            />
            <MissionCard
              eyebrow="How to join"
              body="Free to join, open to every campus. Start with the community page."
            />
          </div>
        </div>
      </Section>

      {/* ============================ TESTIMONIALS ============================ */}
      {TESTIMONIALS.length > 0 ? (
        <Section>
          <SectionHeading
            eyebrow="From the crew"
            title="Students building in public."
            align="center"
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name} className="border-border/70">
                <CardContent className="space-y-5 p-6">
                  <p className="text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="border-t border-border/70 pt-4">
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
              <Users className="h-5 w-5" />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">
              Community stories coming soon.
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We're just getting started. As our crew ships, wins and grows, their stories will
              live here.
            </p>
            <div className="mt-6">
              <Button asChild variant="outline" className="h-11 rounded-lg border-border/70">
                <Link to="/community">Be one of the first</Link>
              </Button>
            </div>
          </div>
        </Section>
      )}

      {/* ============================ CTA ============================ */}
      <Section density="compact">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-brand p-10 text-white shadow-glow sm:p-14">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-25 mix-blend-overlay" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[38px]">
                Ready to build something worth talking about?
              </h2>
              <p className="mt-4 max-w-xl text-[15px] text-white/85">
                Free to join. Open to every student in India. Bring an idea — or find one. The crew
                has the rest.
              </p>
              <ul className="mt-6 grid gap-2 text-[13.5px] text-white/90 sm:grid-cols-2">
                {[
                  "Hackathons & build seasons",
                  "Mentorship & networking",
                  "AI & open-source tracks",
                  "Internship & career leads",
                ].map((i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0" /> {i}
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

function BentoCard({
  className = "",
  icon: Icon,
  eyebrow,
  title,
  body,
  to,
  cta,
  tall = false,
}: {
  className?: string;
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  cta: string;
  tall?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant sm:p-7 ${className}`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 h-40 bg-gradient-brand opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20"
      />
      <div className="relative flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-xl border border-border/70 bg-muted/50 text-primary transition duration-300 group-hover:border-transparent group-hover:bg-gradient-brand group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </span>
      </div>
      <div className={`relative mt-6 ${tall ? "flex-1" : ""}`}>
        <h3 className="font-display text-[19px] font-semibold leading-snug tracking-tight sm:text-[22px]">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground sm:text-[14.5px]">
          {body}
        </p>
      </div>
      <div className="relative mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-foreground/80 transition group-hover:text-primary">
        {cta}
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function MissionCard({ eyebrow, body }: { eyebrow: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant">
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary">
        {eyebrow}
      </p>
      <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/90">{body}</p>
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
    <div className="relative border-t border-border/70 bg-card/30 py-3.5 backdrop-blur">
      <div className="marquee-mask flex overflow-hidden">
        <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {items.concat(items).map((label, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-[11.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/80"
            >
              <span className="text-gradient-brand">◆</span>&nbsp;&nbsp;{label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Halftone compass — editorial dotted illustration */
function HalftoneCompass({ className = "", glow = false }: { className?: string; glow?: boolean }) {
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <radialGradient id="hc-fade" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <pattern id="hc-dots" x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.4" cy="1.4" r="1.2" fill="currentColor" />
        </pattern>
        <mask id="hc-mask">
          <rect width="320" height="320" fill="url(#hc-fade)" />
        </mask>
      </defs>
      <g className="text-foreground">
        {/* Halftone disc */}
        <circle cx="160" cy="160" r="150" fill="url(#hc-dots)" mask="url(#hc-mask)" opacity="0.55" />
        {/* Compass ring */}
        <circle cx="160" cy="160" r="96" stroke="currentColor" strokeWidth="1.25" opacity="0.85" />
        <circle cx="160" cy="160" r="72" stroke="currentColor" strokeWidth="0.75" opacity="0.4" />
        {/* Compass needle */}
        <path
          d="M160 78 L178 160 L160 172 Z"
          fill="currentColor"
          opacity="0.95"
        />
        <path
          d="M160 242 L142 160 L160 148 Z"
          fill="currentColor"
          opacity="0.35"
        />
        <circle cx="160" cy="160" r="4.5" fill="currentColor" />
        {/* Tick marks */}
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i * Math.PI) / 12;
          const x1 = 160 + Math.cos(a) * 100;
          const y1 = 160 + Math.sin(a) * 100;
          const x2 = 160 + Math.cos(a) * (i % 6 === 0 ? 112 : 106);
          const y2 = 160 + Math.sin(a) * (i % 6 === 0 ? 112 : 106);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth={i % 6 === 0 ? 1.4 : 0.7}
              opacity={i % 6 === 0 ? 0.9 : 0.5}
            />
          );
        })}
      </g>
      {glow && (
        <circle cx="160" cy="160" r="6" className="text-primary" fill="currentColor">
          <animate attributeName="r" values="4;8;4" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

const PILLARS_STRIP = [
  { label: "Student-first", icon: "◆" },
  { label: "AI Innovation", icon: "✦" },
  { label: "Open Source", icon: "◇" },
  { label: "Hackathons", icon: "▲" },
  { label: "Research", icon: "◈" },
  { label: "Startup Ecosystem", icon: "★" },
] as const;

function TrustedStrip() {
  return (
    <div className="mt-16 border-t border-border/50 pt-8">
      <p className="text-center text-[10.5px] font-medium uppercase tracking-[0.3em] text-muted-foreground/80">
        What we stand for
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
        {PILLARS_STRIP.map((p) => (
          <span
            key={p.label}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-[12.5px] font-medium text-foreground/85 shadow-elegant backdrop-blur transition hover:-translate-y-px hover:border-primary/30 hover:text-foreground"
          >
            <span aria-hidden className="text-gradient-brand text-[13px]">
              {p.icon}
            </span>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}


