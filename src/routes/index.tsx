import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Zap,
  Users,
  Rocket,
  Github,
  Brain,
  Award,
  MessageSquare,
  ShieldCheck,
  Search,
  Cpu,
  Code2,
  Handshake,
  ChevronDown,
} from "lucide-react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup } from "@/components/fx/reveal";
import { TextReveal } from "@/components/fx/text-reveal";
import { Magnetic } from "@/components/fx/magnetic";
import { AmbientOrbs } from "@/components/fx/ambient";
import { fadeUp } from "@/lib/motion";
import { FAQS } from "@/data/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Compass Crew — India's Student Innovation Platform" },
      {
        name: "description",
        content:
          "Compass Crew is India's AI-first student innovation platform — hackathons, team matching, verified certificates, mentorship and a builder community for the next generation.",
      },
      { property: "og:title", content: "Compass Crew — India's Student Innovation Platform" },
      {
        property: "og:description",
        content:
          "AI-first student community. Hackathons, teams, certificates, mentorship — for the next generation of Indian builders.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <Manifesto />
      <Bento />
      <HackathonsMagazine />
      <JourneyTimeline />
      <CommunitySplit />
      <TeamMatching />
      <Certificates />
      <SponsorsBand />
      <FaqSection />
      <FinalCta />
    </>
  );
}

/* ============================================================
   HERO — dark editorial stage, mask reveal + ambient orbs
============================================================ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[92vh] overflow-hidden border-b border-border/60"
    >
      <AmbientOrbs />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-noise opacity-[0.25] mix-blend-overlay" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-b from-transparent to-background"
      />

      <motion.div
        style={{ y, opacity }}
        className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-between px-5 pt-28 pb-14 sm:px-8 sm:pt-32 lg:px-12"
      >
        {/* top row — eyebrow + status */}
        <Reveal className="flex flex-wrap items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Est. 2024 · India · AI-First</span>
          </span>
          <span className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Applications open · Season 01
          </span>
        </Reveal>

        {/* editorial headline */}
        <div className="mt-16 sm:mt-20">
          <TextReveal
            as="h1"
            className="text-display block text-[13.5vw] leading-[0.92] tracking-[-0.045em] sm:text-[10vw] lg:text-[8.6vw]"
          >
            The compass for
          </TextReveal>
          <TextReveal
            as="h1"
            className="text-display mt-2 block text-[13.5vw] leading-[0.92] tracking-[-0.045em] sm:text-[10vw] lg:text-[8.6vw]"
            delay={0.15}
          >
            <span>India's next </span>
            <span className="italic font-light text-gradient-brand">builders.</span>
          </TextReveal>

          <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <Reveal delay={0.35}>
              <p className="max-w-xl text-[15px] leading-[1.7] text-muted-foreground sm:text-[17px]">
                An AI-first student innovation ecosystem. Ship hackathons, find your team, earn
                verified certificates, and grow into a founder — with a national community that
                actually builds.
              </p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Button
                    asChild
                    size="lg"
                    className="group h-12 rounded-full px-6 text-sm font-semibold btn-premium hover:btn-premium-hover"
                  >
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Join The Crew
                      <ArrowUpRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </Button>
                </Magnetic>
                <Button
                  asChild
                  variant="ghost"
                  size="lg"
                  className="group h-12 rounded-full px-5 text-sm font-semibold text-foreground/80 hover:text-foreground"
                >
                  <Link to="/hackathons">
                    Explore hackathons
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
            </Reveal>
          </div>
        </div>

        {/* footer strip — value pillars */}
        <Reveal delay={0.75} className="mt-16">
          <div className="hairline flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-5">
            {[
              "Student-First",
              "AI-Native",
              "Open Source",
              "Hackathons",
              "Research",
              "Startup Studio",
            ].map((p, i) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground/90"
              >
                <span className="text-gradient-brand text-[12px]">0{i + 1}</span>
                {p}
              </span>
            ))}
          </div>
        </Reveal>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </motion.div>
    </section>
  );
}

/* ============================================================
   MANIFESTO — one giant sentence, per-word reveal
============================================================ */
function Manifesto() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-40 lg:py-48">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hero-glow opacity-40" />
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            <span className="inline-block h-px w-6 translate-y-[-3px] bg-primary align-middle" />{" "}
            Manifesto
          </p>
        </Reveal>
        <TextReveal
          as="h2"
          className="text-display mt-8 block max-w-6xl text-[7vw] leading-[1] tracking-[-0.035em] sm:text-[5vw] lg:text-[4.2vw]"
          stagger={0.045}
        >
          Talent is everywhere. Opportunity isn't. We're building the platform that closes the gap —{" "}
        </TextReveal>
        <TextReveal
          as="h2"
          className="text-display mt-2 block max-w-6xl text-[7vw] leading-[1] tracking-[-0.035em] text-muted-foreground/70 sm:text-[5vw] lg:text-[4.2vw]"
          stagger={0.045}
          delay={0.2}
        >
          for every student in India who wants to build.
        </TextReveal>
      </div>
    </section>
  );
}

/* ============================================================
   BENTO — asymmetric, editorial. Five tiles, no repeated grid.
============================================================ */
function Bento() {
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              What we build
            </p>
            <h2 className="text-display mt-4 max-w-3xl text-[8vw] leading-[0.98] tracking-[-0.035em] sm:text-[5vw] lg:text-[3.6vw]">
              A full stack for
              <br />
              <span className="italic font-light text-muted-foreground/80">student builders.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              From your first pull request to your first pitch — one crew, five surfaces, and a
              path that adapts to you.
            </p>
          </Reveal>
        </div>

        <StaggerGroup className="mt-14 grid grid-cols-12 gap-4">
          <BentoTile
            className="col-span-12 lg:col-span-7 lg:row-span-2 min-h-[26rem]"
            eyebrow="01 · Flagship"
            title="Hackathons & build seasons"
            body="National-scale hackathons with mentors, judges, prizes and pilot opportunities from partner startups."
            to="/hackathons"
            visual={<BentoHackathonsVisual />}
          />
          <BentoTile
            className="col-span-12 sm:col-span-6 lg:col-span-5 min-h-[13rem]"
            eyebrow="02 · Matchmaking"
            title="Find your team in minutes"
            body="AI-native team matching by skills, availability and role."
            to="/teams"
            visual={<BentoMatchVisual />}
          />
          <BentoTile
            className="col-span-12 sm:col-span-6 lg:col-span-5 min-h-[13rem]"
            eyebrow="03 · Verified"
            title="Certificates that check out"
            body="Every certificate is signed, cryptographically verifiable, and portfolio-ready."
            to="/certificates"
            visual={<BentoCertVisual />}
          />
          <BentoTile
            className="col-span-12 sm:col-span-6 lg:col-span-4 min-h-[12rem]"
            eyebrow="04 · AI Labs"
            title="Applied AI tracks"
            body="Agents, evals, small models — hands-on."
            to="/resources"
            visual={<BentoAIVisual />}
          />
          <BentoTile
            className="col-span-12 sm:col-span-6 lg:col-span-4 min-h-[12rem]"
            eyebrow="05 · Open"
            title="OSS Labs"
            body="Land your first meaningful PR."
            to="/resources"
            visual={<BentoOssVisual />}
          />
          <BentoTile
            className="col-span-12 lg:col-span-4 min-h-[12rem]"
            eyebrow="06 · Studio"
            title="Startup studio"
            body="Idea → users → seed."
            to="/community"
            visual={<BentoStudioVisual />}
          />
        </StaggerGroup>
      </div>
    </section>
  );
}

function BentoTile({
  className,
  eyebrow,
  title,
  body,
  to,
  visual,
}: {
  className?: string;
  eyebrow: string;
  title: string;
  body: string;
  to: string;
  visual?: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp} className={className}>
      <Link
        to={to}
        className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-border/70 bg-card/60 p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:bg-card/80 hover:shadow-elegant sm:p-7 gradient-border-hover"
      >
        <div className="relative flex items-start justify-between gap-4">
          <p className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
          <ArrowUpRight className="h-4 w-4 -translate-y-0.5 text-muted-foreground/60 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-foreground" />
        </div>
        {visual && (
          <div className="relative my-6 flex-1 overflow-hidden rounded-2xl border border-border/50 bg-background/60">
            {visual}
          </div>
        )}
        <div className="relative">
          <h3 className="text-display text-[22px] leading-tight tracking-[-0.02em] sm:text-[26px]">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-[13.5px] leading-relaxed text-muted-foreground">
            {body}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function BentoHackathonsVisual() {
  return (
    <div className="relative h-full w-full">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-40" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 20% 30%, color-mix(in oklab, var(--color-primary) 40%, transparent) 0%, transparent 60%), radial-gradient(50% 60% at 80% 80%, color-mix(in oklab, var(--color-accent) 30%, transparent) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex h-full flex-col justify-end p-5">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live · Season 01
        </div>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
          <span className="text-display text-4xl sm:text-5xl">48h</span>
          <span className="text-sm text-muted-foreground">build window</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["Agents", "RAG", "DevTools", "OSS", "Social"].map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-background/70 px-2.5 py-1 text-[11px] font-medium text-foreground/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function BentoMatchVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative flex items-center gap-2">
        {["Design", "AI", "Backend"].map((r, i) => (
          <div
            key={r}
            className="flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3 py-1.5 text-[11px] font-medium backdrop-blur"
            style={{ transform: `translateY(${i % 2 === 0 ? -6 : 6}px)` }}
          >
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-brand text-[10px] font-bold text-white">
              {r[0]}
            </span>
            {r}
          </div>
        ))}
      </div>
      <div
        aria-hidden
        className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
    </div>
  );
}

function BentoCertVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 40%, color-mix(in oklab, var(--color-secondary) 25%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative rotate-[-6deg] rounded-lg border border-border/70 bg-card/90 px-5 py-4 shadow-elegant backdrop-blur">
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-primary" />
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Certificate of Completion
          </p>
        </div>
        <p className="mt-2 font-display text-[15px] tracking-tight">AI Sprint · 2026</p>
        <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-success" /> Verified · Signed
        </div>
      </div>
    </div>
  );
}

function BentoAIVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklab, var(--color-primary) 30%, transparent) 0%, transparent 60%)",
        }}
      />
      <Cpu className="h-14 w-14 text-foreground/70" strokeWidth={1} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden
          className="absolute rounded-full border border-primary/25"
          style={{
            width: `${60 + i * 30}%`,
            height: `${60 + i * 30}%`,
          }}
        />
      ))}
    </div>
  );
}

function BentoOssVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-grid opacity-25" />
      <div className="relative flex flex-col gap-1.5 font-mono text-[11px] text-muted-foreground">
        <div>
          <span className="text-success">+</span> merged: feat/agents-eval
        </div>
        <div>
          <span className="text-primary">◆</span> opened: pr #142
        </div>
        <div>
          <span className="text-accent">✦</span> starred: crew/rag-kit
        </div>
      </div>
    </div>
  );
}

function BentoStudioVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 18%, transparent), transparent 60%)",
        }}
      />
      <div className="relative flex items-center gap-3">
        <span className="text-display text-2xl">Idea</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <span className="text-display text-2xl">Ship</span>
        <ArrowRight className="h-4 w-4 text-primary" />
        <span className="text-display text-2xl text-gradient-brand">Scale</span>
      </div>
    </div>
  );
}

/* ============================================================
   HACKATHONS — magazine layout
============================================================ */
function HackathonsMagazine() {
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal className="flex items-end justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Hackathons
          </p>
          <Link
            to="/hackathons"
            className="hidden text-[13px] font-medium text-muted-foreground transition hover:text-foreground sm:inline-flex items-center gap-1"
          >
            View all seasons <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-8 sm:p-12">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(60% 80% at 10% 10%, color-mix(in oklab, var(--color-primary) 25%, transparent) 0%, transparent 60%), radial-gradient(50% 60% at 90% 90%, color-mix(in oklab, var(--color-accent) 20%, transparent) 0%, transparent 60%)",
                }}
              />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/30 bg-primary/10 text-primary">
                    Season 01 · Flagship
                  </Badge>
                  <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                    Registration opens soon
                  </span>
                </div>
                <h3 className="text-display mt-6 text-[9vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.4vw]">
                  Compass
                  <br />
                  <span className="text-gradient-brand">Nationals.</span>
                </h3>
                <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                  A national-scale build weekend for student teams across India. Mentors from
                  founding teams. Judges from product companies. Real pilot opportunities.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="h-11 rounded-full px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
                  >
                    <Link to="/hackathons">Learn more</Link>
                  </Button>
                  <Button asChild variant="ghost" className="h-11 rounded-full">
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Get notified
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>

          <StaggerGroup className="flex flex-col gap-4">
            {[
              {
                tag: "AI Sprint",
                theme: "Short-form sprint on agents, evals and small models.",
                status: "Q1 · 2026",
              },
              {
                tag: "Campus Season",
                theme: "Multi-campus season — student products meet real users.",
                status: "Q2 · 2026",
              },
              {
                tag: "Research Jam",
                theme: "Applied research pods with faculty collaborators.",
                status: "Q3 · 2026",
              },
            ].map((h) => (
              <motion.div key={h.tag} variants={fadeUp}>
                <Link
                  to="/hackathons"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/60 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elegant"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-primary">
                        {h.status}
                      </span>
                    </div>
                    <p className="text-display mt-1 truncate text-lg tracking-tight">{h.tag}</p>
                    <p className="mt-1 truncate text-[12.5px] text-muted-foreground">{h.theme}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                </Link>
              </motion.div>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   JOURNEY — editorial timeline (vertical rail with numbers)
============================================================ */
function JourneyTimeline() {
  const steps = [
    { n: "01", title: "Join the crew", body: "Free to join. Open to any student in India — one profile, all programs." },
    { n: "02", title: "Pick a track", body: "Hackathons, AI, open-source, research or startup studio. Start where you are." },
    { n: "03", title: "Find your team", body: "Match by skills, availability and role — with builders across India." },
    { n: "04", title: "Ship in public", body: "Build with mentors, demo to judges, get feedback from founders." },
    { n: "05", title: "Earn what you built", body: "Verified certificates, portfolio pieces, referrals, campus roles." },
  ];
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_1.5fr] lg:gap-24">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                The journey
              </p>
              <h2 className="text-display mt-4 text-[10vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.2vw]">
                Five steps.
                <br />
                <span className="italic font-light text-muted-foreground/80">No gatekeepers.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
                A clear path from your first login to your first shipped product. Free, open, and
                designed to move you forward.
              </p>
            </Reveal>
          </div>
          <StaggerGroup as="ol" className="relative border-l border-border/60 pl-8 sm:pl-12">
            {steps.map((s, i) => (
              <motion.li key={s.n} variants={fadeUp} className="relative pb-14 last:pb-0">
                <span className="absolute -left-[41px] top-0 grid h-8 w-8 place-items-center rounded-full border border-border/70 bg-background text-[11px] font-semibold text-primary sm:-left-[49px]">
                  {s.n}
                </span>
                <h3 className="text-display text-[26px] leading-tight tracking-[-0.025em] sm:text-[32px]">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-lg text-[14.5px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
                {i === steps.length - 1 && (
                  <Button
                    asChild
                    className="mt-6 h-11 rounded-full px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
                  >
                    <Link to="/auth" search={{ mode: "signup" }}>
                      Start now <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </motion.li>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   COMMUNITY — split screen with product mock
============================================================ */
function CommunitySplit() {
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24 lg:px-12">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            AI Community
          </p>
          <h2 className="text-display mt-4 text-[10vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.2vw]">
            A room full of
            <br />
            <span className="text-gradient-brand">builders.</span>
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            Discord for daily conversation, GitHub for the code, campus chapters for meetups.
            Mentors, engineers, founders and researchers — all shipping in public.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="outline" className="h-11 rounded-full">
              <Link to="/community">Join Discord</Link>
            </Button>
            <Button asChild variant="ghost" className="h-11 rounded-full">
              <a href="https://github.com/compasscrew" target="_blank" rel="noreferrer">
                <Github className="mr-1.5 h-4 w-4" /> GitHub
              </a>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-[24px] border border-border/70 bg-card/60 p-4 shadow-elegant backdrop-blur-sm sm:p-6">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(60% 70% at 90% 10%, color-mix(in oklab, var(--color-primary) 18%, transparent) 0%, transparent 60%)",
              }}
            />
            <div className="relative flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              </div>
              <span className="text-[10.5px] font-mono uppercase tracking-widest text-muted-foreground">
                compasscrew · #general
              </span>
            </div>
            <div className="relative mt-4 space-y-3">
              {[
                { role: "AI Engineer", msg: "Just landed a working eval harness — sharing docs in #ai-labs.", tag: "AI" },
                { role: "Designer", msg: "Anyone want a portfolio review before demo day?", tag: "Design" },
                { role: "Student Founder", msg: "Looking for a backend partner for a v0 — DMs open.", tag: "Studio" },
                { role: "OSS Maintainer", msg: "Good first issues just labeled on crew/rag-kit ✨", tag: "OSS" },
              ].map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="flex gap-3 rounded-xl border border-border/50 bg-background/60 p-3"
                >
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-brand text-[11px] font-bold text-white">
                    {m.role[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold">{m.role}</span>
                      <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9.5px] font-medium uppercase tracking-wider text-primary">
                        {m.tag}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{m.msg}</p>
                  </div>
                </motion.div>
              ))}
              <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2 text-[12px] text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5" />
                Say something…
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   TEAM MATCHING — realistic product surface
============================================================ */
function TeamMatching() {
  const cards = [
    { name: "Aarav", role: "Full-stack", skills: ["React", "TS", "Postgres"], match: 94, avail: "Weekends" },
    { name: "Meera", role: "ML / AI", skills: ["PyTorch", "RAG", "Evals"], match: 91, avail: "Evenings" },
    { name: "Kabir", role: "Product Designer", skills: ["Figma", "Motion", "UX"], match: 88, avail: "Flexible" },
    { name: "Ishita", role: "Backend", skills: ["Go", "Postgres", "gRPC"], match: 86, avail: "Weekends" },
  ];
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-mesh opacity-30" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.3fr] lg:items-center lg:gap-20">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Team Matching
            </p>
            <h2 className="text-display mt-4 text-[10vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.2vw]">
              Never
              <br />
              <span className="italic font-light">solo</span>{" "}
              <span className="text-gradient-brand">again.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Skills. Availability. Role. Compass matches you with student teammates who ship at
              your pace — for hackathons, side projects and startup ideas.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-full px-5 text-sm font-semibold btn-premium hover:btn-premium-hover"
              >
                <Link to="/teams">Find teammates</Link>
              </Button>
              <Button asChild variant="ghost" className="h-11 rounded-full">
                <Link to="/teams">How it works</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="relative overflow-hidden rounded-[24px] border border-border/70 bg-card/60 p-5 shadow-elegant backdrop-blur sm:p-6">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 text-[12px] font-medium">
                  <Search className="h-3.5 w-3.5 text-primary" />
                  <span>Looking for teammates · AI Sprint · 48h</span>
                </div>
                <span className="text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
                  4 matches
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {cards.map((c, i) => (
                  <motion.div
                    key={c.name}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-[13px] font-bold text-white">
                          {c.name[0]}
                        </div>
                        <div>
                          <p className="text-[13.5px] font-semibold">{c.name}</p>
                          <p className="text-[11.5px] text-muted-foreground">{c.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Match
                        </p>
                        <p className="text-display text-[18px] text-gradient-brand">{c.match}%</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-muted/60 px-2 py-0.5 text-[10.5px] font-medium text-foreground/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-2.5 text-[11px]">
                      <span className="text-muted-foreground">Avail · {c.avail}</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        Invite <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CERTIFICATES — 3D-tilted preview, verification input
============================================================ */
function Certificates() {
  const [code, setCode] = useState("");
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center lg:gap-24">
          <Reveal>
            <div
              className="relative mx-auto max-w-md"
              style={{ perspective: "1200px" }}
            >
              <motion.div
                initial={{ rotateX: 18, rotateY: -20, y: 20, opacity: 0 }}
                whileInView={{ rotateX: 10, rotateY: -12, y: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 1, ease: [0.2, 0.7, 0.2, 1] }}
                whileHover={{ rotateX: 4, rotateY: -4 }}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-8 shadow-elevated"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 15%, transparent), transparent 60%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                        Compass Crew
                      </span>
                    </div>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      #CC-2026-A47F
                    </span>
                  </div>
                  <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    Certificate of Completion
                  </p>
                  <p className="text-display mt-3 text-[28px] leading-tight tracking-tight">
                    AI Sprint · 2026
                  </p>
                  <p className="mt-6 text-[12.5px] text-muted-foreground">Awarded to</p>
                  <p className="text-display text-[22px] tracking-tight">Student Builder</p>
                  <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-success">
                      <ShieldCheck className="h-3.5 w-3.5" /> Signed · Verifiable
                    </div>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      compasscrew.in
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              Certificates
            </p>
            <h2 className="text-display mt-4 text-[10vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.2vw]">
              Proof, not
              <br />
              <span className="italic font-light text-muted-foreground/80">promises.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              Every Compass Crew certificate is signed and cryptographically verifiable. Employers
              and campuses can check authenticity with a single code — no accounts, no email
              exchange.
            </p>
            <form
              className="mt-8 flex max-w-md items-center gap-2 rounded-full border border-border/70 bg-card/60 p-1.5 backdrop-blur"
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) window.location.href = `/verify/${encodeURIComponent(code.trim())}`;
              }}
            >
              <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter certificate code"
                className="flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="sm" className="h-9 rounded-full btn-premium hover:btn-premium-hover">
                Verify
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Publicly verifiable
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Code2 className="h-3.5 w-3.5 text-primary" /> Portfolio-ready
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   SPONSORS — premium empty logo wall + CTA
============================================================ */
function SponsorsBand() {
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-32 surface-alt">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <Reveal className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Partners & Sponsors
          </p>
          <h2 className="text-display mx-auto mt-4 max-w-3xl text-[9vw] leading-[1] tracking-[-0.035em] sm:text-[5.5vw] lg:text-[3.8vw]">
            Back the next generation of Indian builders.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            We partner with founder-led companies to power hackathons, workshops and campus
            programs. Reach thousands of student builders across India.
          </p>
        </Reveal>

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/40 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group relative flex h-24 items-center justify-center bg-background/60 transition duration-300 hover:bg-card"
            >
              <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground/50 transition group-hover:text-foreground/80">
                Your Logo · 0{(i % 9) + 1}
              </span>
            </motion.div>
          ))}
        </StaggerGroup>

        <Reveal delay={0.2} className="mt-10 text-center">
          <Magnetic>
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-6 text-sm font-semibold btn-premium hover:btn-premium-hover"
            >
              <Link to="/partner">
                <Handshake className="mr-2 h-4 w-4" /> Partner with us
              </Link>
            </Button>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}

/* ============================================================
   FAQ — editorial accordion
============================================================ */
function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative border-t border-border/60 py-24 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <div>
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                FAQ
              </p>
              <h2 className="text-display mt-4 text-[10vw] leading-[0.95] tracking-[-0.035em] sm:text-[6vw] lg:text-[4.2vw]">
                Answered.
              </h2>
              <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                Everything students, campuses and partners ask us most. Still curious? Reach out
                any time.
              </p>
            </Reveal>
          </div>
          <ul className="divide-y divide-border/60 border-y border-border/60">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-start justify-between gap-6 py-6 text-left transition"
                  >
                    <span className="text-display text-[20px] leading-tight tracking-[-0.02em] text-foreground/90 group-hover:text-foreground sm:text-[26px]">
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/70 text-muted-foreground group-hover:border-primary/40 group-hover:text-foreground"
                    >
                      <span className="relative block h-3 w-3">
                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                      </span>
                    </motion.span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-2xl pb-6 pr-12 text-[14.5px] leading-relaxed text-muted-foreground">
                      {f.a}
                    </p>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   FINAL CTA — full-bleed statement
============================================================ */
function FinalCta() {
  return (
    <section className="relative isolate overflow-hidden border-t border-border/60 py-32 sm:py-48">
      <AmbientOrbs />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-noise opacity-[0.2] mix-blend-overlay" />
      <div className="relative mx-auto max-w-6xl px-5 text-center sm:px-8 lg:px-12">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            The Crew · Est. 2024
          </p>
        </Reveal>
        <TextReveal
          as="h2"
          className="text-display mt-8 block text-[14vw] leading-[0.9] tracking-[-0.045em] sm:text-[9vw] lg:text-[7.5vw]"
          stagger={0.05}
        >
          Build something
        </TextReveal>
        <TextReveal
          as="h2"
          className="text-display mt-2 block text-[14vw] leading-[0.9] tracking-[-0.045em] sm:text-[9vw] lg:text-[7.5vw]"
          stagger={0.05}
          delay={0.15}
        >
          <span>worth </span>
          <span className="italic font-light text-gradient-brand">remembering.</span>
        </TextReveal>
        <Reveal delay={0.5}>
          <p className="mx-auto mt-10 max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">
            Free to join. Open to every student in India. Bring an idea — or find one. The crew
            has the rest.
          </p>
        </Reveal>
        <Reveal delay={0.65}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 text-sm font-semibold btn-premium hover:btn-premium-hover"
              >
                <Link to="/auth" search={{ mode: "signup" }}>
                  Join The Crew <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
            <Button asChild variant="ghost" size="lg" className="h-12 rounded-full">
              <Link to="/about">Read our story</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
