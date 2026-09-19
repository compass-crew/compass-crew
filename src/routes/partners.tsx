import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Handshake,
  GraduationCap,
  Users,
  Building2,
  Cpu,
  Sparkles,
  ArrowRight,
  Mail,
  ExternalLink,
  Layers,
  Lightbulb,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPartners } from "@/lib/public-cms";
import { safeExternalUrl } from "@/lib/safe-redirect";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { title: "Ecosystem Partners — Compass Crew" },
      {
        name: "description",
        content:
          "Collaborate with Compass Crew as a college club, university innovation cell, startup, or technology partner to build for student technologists across India.",
      },
      { property: "og:title", content: "Partner with Compass Crew" },
      {
        property: "og:description",
        content: "Build the entrepreneurship and innovation ecosystem with us.",
      },
    ],
    links: [{ rel: "canonical", href: "/partners" }],
  }),
  component: PartnersPage,
});

const WHO_WE_PARTNER_WITH = [
  {
    icon: Users,
    title: "Student Tech Clubs & Communities",
    description:
      "Coding societies, AI clubs, design guilds, and developer circles looking to bring national-scale hackathons and challenges to their members.",
  },
  {
    icon: GraduationCap,
    title: "Colleges & Universities",
    description:
      "Academic institutions seeking hands-on industry exposure, project evaluation frameworks, and experiential build curricula for their students.",
  },
  {
    icon: Lightbulb,
    title: "Campus Innovation & E-Cells",
    description:
      "Entrepreneurship Development Cells and incubation hubs fostering early-stage student venture validation and prototype building.",
  },
  {
    icon: Building2,
    title: "Startups & Scaleups",
    description:
      "Fast-moving engineering teams seeking talented interns, junior developers, and early testers for their developer APIs and platforms.",
  },
  {
    icon: Cpu,
    title: "Developer Tooling & Cloud Platforms",
    description:
      "Platforms offering cloud compute, databases, APIs, and devtools who want authentic student developer adoption.",
  },
  {
    icon: Layers,
    title: "Open-Source & Research Labs",
    description:
      "Research pods and open-source foundations looking to onboard student contributors and build public goods together.",
  },
] as const;

const PARTNERSHIP_MODELS = [
  {
    title: "Community Partnership",
    description:
      "Co-host online and campus build events, share hackathon announcements across networks, and collaborate on cross-community sprints.",
    deliverables: [
      "Cross-community event co-hosting and amplification",
      "Shared mentorship and speaker exchanges",
      "Mutual community spotlight and feature stories",
    ],
  },
  {
    title: "Campus Chapter Partnership",
    description:
      "Establish an official Compass Crew chapter on your college campus with operational playbooks, speaker connections, and event sponsorship.",
    deliverables: [
      "Official campus chapter kit and organizer guidance",
      "Direct pipeline to national hackathons and prizes",
      "Priority access to guest mentors and workshop leads",
    ],
  },
  {
    title: "Innovation & Challenge Partnership",
    description:
      "Bring authentic industry problem statements to student hackathon tracks, complete with custom bounties and direct judging participation.",
    deliverables: [
      "Bespoke challenge prompt crafted with the core team",
      "Direct evaluation of finalist code and architecture",
      "Fast-track interview recommendations for standout teams",
    ],
  },
  {
    title: "Technology & Tooling Partnership",
    description:
      "Provide free developer tier access, API tokens, or compute resources to empower participants building during hackathons.",
    deliverables: [
      "Inclusion in official hackathon starter templates",
      "Direct technical feedback on SDK usability from builders",
      "Showcase during live kickoff and workshop sessions",
    ],
  },
  {
    title: "Program & Accelerator Partnership",
    description:
      "Connect winning hackathon teams with incubation programs, grant funding, and startup accelerators to take prototypes to market.",
    deliverables: [
      "Direct scouting pipeline for exceptional student prototypes",
      "Co-curated founder masterclasses and demo days",
      "Access to post-hackathon founder cohorts",
    ],
  },
] as const;

function PartnersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["partners"],
    queryFn: listPartners,
  });
  const partners = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Partnerships & Alliances"
        title="Build the Ecosystem With Us."
        description="Compass Crew collaborates with student clubs, universities, innovation cells, startups, and developer ecosystems to foster grassroots builder culture."
      >
        <Button
          asChild
          size="lg"
          className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
        >
          <a href="mailto:compasscrewnetwork.team@gmail.com">
            <Mail className="mr-2 h-4 w-4" /> Partner with Compass Crew
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Send an Inquiry</Link>
        </Button>
      </PageHeader>

      {/* Who We Partner With */}
      <Section className="py-12 md:py-16">
        <SectionHeading
          eyebrow="Collaboration"
          title="Who We Partner With"
          description="We work across the student and technology ecosystem to connect talent with opportunity."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHO_WE_PARTNER_WITH.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-border/60 bg-card/50 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <CardContent className="space-y-3.5 p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Partnership Models */}
      <Section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Frameworks"
          title="Partnership Models"
          description="Clear collaboration frameworks designed for mutual community value."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PARTNERSHIP_MODELS.map((model) => (
            <Card
              key={model.title}
              className="border-border/60 bg-card/70 transition hover:border-primary/40 hover:shadow-elegant"
            >
              <CardContent className="space-y-4 p-6 sm:p-8">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {model.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{model.description}</p>
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Core Outcomes
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {model.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Verified Database Partners */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="Current Allies"
          title="Ecosystem Partners"
          description="Active organizations and campus groups collaborating with Compass Crew."
        />
        {partners.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center max-w-xl mx-auto">
            <Handshake className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              No public partners yet
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              We collaborate with student tech clubs, colleges, E-cells, and developer tooling
              platforms.
            </p>
            <Button asChild size="sm" className="mt-4 bg-gradient-brand text-white">
              <a href="mailto:compasscrewnetwork.team@gmail.com">
                <Mail className="mr-1.5 h-3.5 w-3.5" /> Partner with Compass Crew →
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {partners.map((p) => (
              <Card
                key={p.id}
                className="border-border/60 bg-card/40 transition hover:border-primary/40"
              >
                <CardContent className="flex items-center gap-4 p-6">
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="h-10 w-10 rounded-lg object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 font-display font-bold text-primary">
                      {p.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-semibold text-foreground truncate">{p.name}</p>
                    {p.kind && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-normal capitalize mt-1"
                      >
                        {p.kind}
                      </Badge>
                    )}
                  </div>
                  {p.url && safeExternalUrl(p.url) && (
                    <a
                      href={safeExternalUrl(p.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                      aria-label={`Visit ${p.name}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Call to Action Banner */}
      <Section className="border-t border-border py-16">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card shadow-elegant">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Shape the Future
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Let&apos;s Build Together
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Whether you run a campus tech community, head a college entrepreneurship cell, or want
              to bring student builders into your accelerator—reach out to our partnership team.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
              >
                <a href="mailto:compasscrewnetwork.team@gmail.com">
                  <Mail className="mr-2 h-4 w-4" /> Email Partnership Team
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Use Contact Form</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
