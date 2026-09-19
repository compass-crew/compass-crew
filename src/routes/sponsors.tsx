import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  Trophy,
  Users,
  Code2,
  Brain,
  Rocket,
  ArrowRight,
  Mail,
  CheckCircle2,
  ExternalLink,
  Award,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listSponsors } from "@/lib/public-cms";
import { safeExternalUrl } from "@/lib/safe-redirect";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors & Partners — Compass Crew" },
      {
        name: "description",
        content:
          "Sponsor Compass Crew hackathons, student challenges, and learning tracks. Connect with student developers, designers, and innovators across India.",
      },
      { property: "og:title", content: "Sponsor Compass Crew" },
      {
        property: "og:description",
        content: "Partner with Compass Crew to reach India's next generation of student builders.",
      },
    ],
    links: [{ rel: "canonical", href: "/sponsors" }],
  }),
  component: SponsorsPage,
});

const WHY_SPONSOR = [
  {
    icon: Users,
    title: "Direct Talent Discovery",
    description:
      "Engage with driven student builders, open-source contributors, and engineers who actively ship software rather than just study it.",
  },
  {
    icon: Trophy,
    title: "Hackathon Track Visibility",
    description:
      "Position your brand, API, SDK, or developer platform in front of hundreds of participants building functional prototypes.",
  },
  {
    icon: Brain,
    title: "Challenge Sponsorship",
    description:
      "Introduce real-world problem statements, evaluate novel solutions, and reward the most creative implementations with targeted bounties.",
  },
  {
    icon: Code2,
    title: "Tool & API Adoption",
    description:
      "Get developer tools, cloud infrastructure, and AI models directly into student projects where they gain authentic, hands-on traction.",
  },
  {
    icon: Rocket,
    title: "Grassroots Innovation",
    description:
      "Support the next wave of founders and product teams from campus level onward with meaningful mentorship and early validation.",
  },
] as const;

const COLLABORATION_FORMATS = [
  {
    title: "Hackathon Track Sponsor",
    tagline: "Drive dedicated hackathon challenges",
    description:
      "Headline a specific challenge track (e.g., Applied AI, Developer Tools, Open Web, Web3) and provide guidance and track-specific prizes.",
    benefits: [
      "Custom hackathon track prompt and scoring criteria",
      "Dedicated mentor presence during build hours",
      "Live product demo & keynote slot during kickoff",
      "Direct review of track submissions",
    ],
  },
  {
    title: "Innovation Challenge Sponsor",
    tagline: "Present concrete engineering problem statements",
    description:
      "Pose technical problems for student teams to solve over multi-week innovation sprints or hackathons with custom bounties.",
    benefits: [
      "Curated problem definition crafted with the core team",
      "Repository submissions directly visible to your engineers",
      "Targeted student interviews and talent shortlist",
      "Showcase top solutions across community channels",
    ],
  },
  {
    title: "Technical Workshop Sponsor",
    tagline: "Teach, demo, and engage directly",
    description:
      "Host hands-on technical masterclasses, live codelabs, or architectural teardowns led by your staff engineers or developer advocates.",
    benefits: [
      "Dedicated livestream or interactive workshop session",
      "Permanent distribution of recordings and starter repositories",
      "Direct technical Q&A with student participants",
      "Community newsletter and announcement feature",
    ],
  },
  {
    title: "Technology & Tooling Partner",
    tagline: "Empower builders with developer access",
    description:
      "Provide free developer tier access, API credits, or cloud compute vouchers to accelerate student prototypes during hackathons.",
    benefits: [
      "Prominent placement on hackathon starter guides",
      "Real-world feedback on SDK usability and documentation",
      "Dedicated tooling showcase in the event kickoff",
      "Recognition as an official technology enabler",
    ],
  },
  {
    title: "Community & Ecosystem Sponsor",
    tagline: "Support long-term student builder growth",
    description:
      "Support student community operations, hackathon prize pools, and campus chapter hack nights throughout the academic season.",
    benefits: [
      "Year-round logo visibility on platform and event pages",
      "Invitations to private demo days and pitch showcases",
      "Mentor and judging seats across major competitions",
      "Co-branded educational content and announcements",
    ],
  },
] as const;

const WHAT_YOU_CAN_SUPPORT = [
  "Student Hackathon Prize Pools & Build Bounties",
  "Cloud Compute, Server & GPU Hosting Credits",
  "Hardware Starter Kits & Microcontroller Components",
  "Student Travel & Accommodation Stipends for Finals",
  "Verifiable Digital Achievement Certificates",
  "Campus Chapter Hack Nights & Local Build Sprints",
] as const;

function SponsorsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sponsors"],
    queryFn: listSponsors,
  });
  const sponsors = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Sponsorships & Collaborations"
        title="Sponsor the Builders of Tomorrow."
        description="Compass Crew collaborates with forward-thinking technology companies, developer tools, and startups to empower India's student builders with mentorship, challenges, and opportunities."
      >
        <Button
          asChild
          size="lg"
          className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
        >
          <a href="mailto:compasscrewnetwork.team@gmail.com">
            <Mail className="mr-2 h-4 w-4" /> Become a Sponsor
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Contact Our Team</Link>
        </Button>
      </PageHeader>

      {/* Why Sponsor Compass Crew */}
      <Section className="py-12 md:py-16">
        <SectionHeading
          eyebrow="Value Proposition"
          title="Why Sponsor Compass Crew"
          description="A direct, high-signal connection to student builders who are actively shipping real code."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_SPONSOR.map((item) => {
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

      {/* Existing Sponsors Showcase */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="Current Partners"
          title="Backed by Technology Leaders"
          description="Organizations supporting our student hackathon tracks and build initiatives."
        />
        {sponsors.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border/80 bg-card/30 p-10 text-center max-w-xl mx-auto">
            <Award className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
            <h3 className="font-display text-lg font-semibold text-foreground">
              No public sponsors yet
            </h3>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Partner with Compass Crew to reach India&apos;s next generation of student builders
              and hackers.
            </p>
            <Button asChild size="sm" className="mt-4 bg-gradient-brand text-white">
              <a href="mailto:compasscrewnetwork.team@gmail.com">
                <Mail className="mr-1.5 h-3.5 w-3.5" /> Become a sponsor →
              </a>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((s) => (
              <Card
                key={s.id}
                className="border-border/60 bg-card/40 transition hover:border-primary/40"
              >
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  {s.logo_url ? (
                    <img
                      src={s.logo_url}
                      alt={s.name}
                      loading="lazy"
                      className="h-12 w-full object-contain"
                    />
                  ) : (
                    <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 font-display text-lg font-bold text-primary">
                      {s.name.charAt(0)}
                    </span>
                  )}
                  <p className="font-display font-semibold text-foreground">{s.name}</p>
                  {s.blurb && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{s.blurb}</p>
                  )}
                  {s.url && safeExternalUrl(s.url) && (
                    <a
                      href={safeExternalUrl(s.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Visit <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Collaboration Formats */}
      <Section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Formats"
          title="Collaboration Formats"
          description="Flexible sponsorship frameworks tailored to your technical objectives and timeline."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COLLABORATION_FORMATS.map((fmt) => (
            <Card
              key={fmt.title}
              className="border-border/60 bg-card/70 transition hover:border-primary/40 hover:shadow-elegant"
            >
              <CardContent className="space-y-4 p-6 sm:p-8">
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs font-normal">
                    {fmt.tagline}
                  </Badge>
                  <h3 className="font-display text-xl font-semibold text-foreground pt-1">
                    {fmt.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{fmt.description}</p>
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Included Benefits
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {fmt.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* What Sponsors Can Support */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="Impact"
          title="What Your Sponsorship Powers"
          description="Every contribution directly accelerates student project development and builds lasting community capacity."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WHAT_YOU_CAN_SUPPORT.map((area) => (
            <div
              key={area}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-4 transition hover:border-primary/30"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground">{area}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action Banner */}
      <Section className="border-t border-border py-16">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card shadow-elegant">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Direct Collaboration
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Partner with Compass Crew
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Let&apos;s build a custom sponsorship track that puts your technology in front of
              student builders and drives real innovation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
              >
                <a href="mailto:compasscrewnetwork.team@gmail.com">
                  <Mail className="mr-2 h-4 w-4" /> Email our Partnership Team
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
