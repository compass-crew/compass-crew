import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Palette,
  Code2,
  BookOpen,
  Handshake,
  Calendar,
  Sparkles,
  Mail,
  ExternalLink,
  Info,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listCareers } from "@/lib/public-cms";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Work With Us — Compass Crew" },
      {
        name: "description",
        content:
          "Build with Compass Crew. Explore student contributor tracks, campus ambassador roles, and opportunities across our entrepreneurship and innovation ecosystem.",
      },
      { property: "og:title", content: "Work With Compass Crew" },
      {
        property: "og:description",
        content: "We're building a student-led entrepreneurship and innovation ecosystem.",
      },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: CareersPage,
});

const CONTRIBUTION_AREAS = [
  {
    icon: Users,
    title: "Community & Campus Chapters",
    description:
      "Support student organizers, coordinate campus chapter lead cohorts, and build welcoming spaces for student builders.",
  },
  {
    icon: Palette,
    title: "Design & Visual Identity",
    description:
      "Craft UI/UX for the Compass Crew platform, design hackathon branding, 3D interactive assets, and social collateral.",
  },
  {
    icon: Code2,
    title: "Engineering & Platform",
    description:
      "Build and maintain our web application, hackathon submission engines, scoring portals, and open-source starter kits.",
  },
  {
    icon: BookOpen,
    title: "Content & Editorial",
    description:
      "Write builder guides, research paper teardowns, community spotlights, and documentation for student hackathon tracks.",
  },
  {
    icon: Handshake,
    title: "Partnerships & Outreach",
    description:
      "Connect with tech companies, sponsor mentors, university faculty, and startup incubators to bring opportunities to students.",
  },
  {
    icon: Calendar,
    title: "Hackathon Operations",
    description:
      "Plan and execute virtual and in-person hackathons, workshop livestreams, mentor office hours, and judging logistics.",
  },
  {
    icon: Sparkles,
    title: "Growth & Student Engagement",
    description:
      "Help expand Compass Crew to more campuses across India through social storytelling, AMAs, and campus ambassador networks.",
  },
] as const;

const WHAT_YOU_GAIN = [
  "Hands-on experience shipping production features and running national-scale initiatives",
  "Mentorship from experienced software engineers, startup founders, and designers",
  "A collaborative network of driven student builders across India",
  "Official verifiable recognition and recommendation letters for standout contributors",
] as const;

function CareersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["careers"],
    queryFn: listCareers,
  });
  const openings = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Work With Us"
        title="Build with Compass Crew."
        description="We are building a student-led entrepreneurship and innovation ecosystem. Discover contribution tracks, organizer opportunities, and ways to shape the platform."
      >
        <Button
          asChild
          size="lg"
          className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
        >
          <a href="mailto:compasscrewnetwork.team@gmail.com">
            <Mail className="mr-2 h-4 w-4" /> Want to Build with Us?
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/contact">Get in Touch</Link>
        </Button>
      </PageHeader>

      {/* Honest Status Notice Banner */}
      <Section className="py-8">
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="flex items-start gap-4 p-6 sm:p-8">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Info className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-semibold text-foreground">
                Community-Driven Organization
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compass Crew is an open, student-led ecosystem. Formal full-time positions will
                appear here as our platform expands. In the meantime, we actively welcome student
                contributors, campus chapter leads, and community volunteers who want to build with
                us.
              </p>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* Contribution Areas */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="Areas of Contribution"
          title="Where You Can Make an Impact"
          description="Explore the teams and focus areas that keep Compass Crew running and growing."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONTRIBUTION_AREAS.map((area) => {
            const Icon = area.icon;
            return (
              <Card
                key={area.title}
                className="border-border/60 bg-card/50 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
              >
                <CardContent className="space-y-3.5 p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {area.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {area.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Verified Openings (only if real rows exist in CMS) */}
      {openings.length > 0 && (
        <Section className="border-t border-border py-12 md:py-16">
          <SectionHeading
            eyebrow="Open Positions"
            title="Available Roles"
            description="Formal opportunities currently accepting applications."
          />
          <div className="mt-8 space-y-4">
            {openings.map((c) => (
              <Card key={c.id} className="border-border/60 bg-card/60">
                <CardContent className="flex flex-wrap items-start justify-between gap-6 p-6">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {c.category}
                      </Badge>
                      {c.mode && (
                        <Badge variant="outline" className="capitalize">
                          {c.mode.replace("_", " ")}
                        </Badge>
                      )}
                    </div>
                    <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {c.description}
                      </p>
                    )}
                  </div>
                  {c.apply_url && (
                    <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                      <a href={c.apply_url} target="_blank" rel="noreferrer">
                        Apply Now <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* What You Gain */}
      <Section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Benefits"
          title="Why Build With Compass Crew"
          description="We believe in treating every contributor with respect, real ownership, and meaningful learning."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {WHAT_YOU_GAIN.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-5 transition hover:border-primary/30"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
              <p className="text-sm font-medium text-foreground leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Call to Action */}
      <Section className="border-t border-border py-16">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card shadow-elegant">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Shape the Movement
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Want to build with us?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you are enthusiastic about technology, entrepreneurship, design, or community
              building—tell us what you would love to work on.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
              >
                <a href="mailto:compasscrewnetwork.team@gmail.com">
                  <Mail className="mr-2 h-4 w-4" /> Email our Core Team
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
