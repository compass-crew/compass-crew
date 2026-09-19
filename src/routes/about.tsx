import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  Target,
  Sparkles,
  Trophy,
  Users,
  Brain,
  Rocket,
  GraduationCap,
  Briefcase,
  Handshake,
  Gavel,
  Building2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listHomepageSections, findSection } from "@/lib/public-cms";
import { MISSION } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Compass Crew" },
      {
        name: "description",
        content:
          "Compass Crew is an entrepreneurship & innovation community. A student-led ecosystem where ideas find people, opportunities, and direction.",
      },
      { property: "og:title", content: "About Compass Crew" },
      {
        property: "og:description",
        content: "An Entrepreneurship & Innovation Community built by students, for students.",
      },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const WHAT_WE_DO = [
  {
    icon: Trophy,
    title: "Hackathons & Build Sprints",
    description:
      "Competitive, theme-driven build sprints where student teams ship functional software and hardware prototypes within focused timeframes.",
  },
  {
    icon: Brain,
    title: "Innovation Programs",
    description:
      "Applied challenges and hands-on tracks covering AI, open-source craft, systems architecture, and user-centric product engineering.",
  },
  {
    icon: Users,
    title: "Student Collaboration",
    description:
      "Cross-campus team formation pairing developers, designers, product managers, and researchers to turn early sparks into real projects.",
  },
  {
    icon: Rocket,
    title: "Entrepreneurship Ecosystem",
    description:
      "A structured pathway helping ambitious students validate problem statements, deploy MVPs to initial users, and prepare for startup ventures.",
  },
] as const;

const WHO_IT_IS_FOR = [
  {
    icon: Users,
    role: "Students & Builders",
    description:
      "Curious undergrads, graduates, and self-taught developers eager to move beyond theory and build production software.",
  },
  {
    icon: GraduationCap,
    role: "Campus Chapters",
    description:
      "Student leaders organizing local hack nights, paper reading circles, and workshops on their respective college campuses.",
  },
  {
    icon: Briefcase,
    role: "Mentors & Operators",
    description:
      "Founders, staff engineers, and tech leaders who provide 1:1 code reviews, architectural guidance, and career advice.",
  },
  {
    icon: Gavel,
    role: "Judges & Reviewers",
    description:
      "Industry specialists evaluating hackathon submissions objectively based on novelty, technical depth, design, and feasibility.",
  },
  {
    icon: Building2,
    role: "Sponsors",
    description:
      "Forward-thinking technology companies and tooling providers looking to discover top student talent and sponsor tracks.",
  },
  {
    icon: Handshake,
    role: "Ecosystem Partners",
    description:
      "Incubators, universities, student clubs, and tech communities collaborating to scale student entrepreneurship.",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "People",
    description:
      "Curious builders join Compass Crew from diverse colleges, backgrounds, and skill sets—from frontend coders to AI researchers.",
  },
  {
    step: "02",
    title: "Opportunities",
    description:
      "Members discover curated hackathon tracks, innovation prompts, mentor sessions, and real-world problem statements.",
  },
  {
    step: "03",
    title: "Teams",
    description:
      "Solo participants match with complementary teammates based on technical interests, working styles, and project goals.",
  },
  {
    step: "04",
    title: "Building",
    description:
      "Teams build with guidance from industry mentors, shipping code to public repositories and testing live demos.",
  },
  {
    step: "05",
    title: "Real-World Outcomes",
    description:
      "Projects demo to panels of judges, receive verifiable achievement credentials, and earn referrals, grants, or startup incubation.",
  },
] as const;

function AboutPage() {
  const { data } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: listHomepageSections,
  });
  const sections = data ?? [];
  const roadmapSection = findSection(sections, "about_roadmap");
  const roadmapItems =
    (roadmapSection?.data as { items?: string[] } | null)?.items ?? MISSION.roadmap;

  return (
    <>
      <PageHeader
        eyebrow="About Compass Crew"
        title={
          <>
            An Entrepreneurship &amp;{" "}
            <span className="text-gradient-brand">Innovation Community.</span>
          </>
        }
        description="A student-led ecosystem where ideas find people, opportunities, and direction. Building hackathons, open-source craft, and real products across campuses in India."
      >
        <Button
          asChild
          size="lg"
          className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
        >
          <Link to="/hackathons">Explore Hackathons</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/auth" search={{ mode: "signup" }}>
            Join the Crew
          </Link>
        </Button>
      </PageHeader>

      {/* Mission & Vision Section */}
      <Section className="py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-4 p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Our Mission
              </h2>
              <p className="leading-relaxed text-muted-foreground">{MISSION.mission}</p>
              <p className="leading-relaxed text-muted-foreground">{MISSION.why}</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
            <CardContent className="space-y-4 p-8">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Our Vision
              </h2>
              <p className="leading-relaxed text-muted-foreground">{MISSION.vision}</p>
              <p className="leading-relaxed text-muted-foreground">{MISSION.what}</p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* What We Do */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="Initiatives"
          title="What We Do"
          description="Programs designed to bridge the gap between textbook knowledge and shipping production-grade technology."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {WHAT_WE_DO.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                className="border-border/60 bg-card/40 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant"
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

      {/* Who It Is For */}
      <Section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Ecosystem"
          title="Who It Is For"
          description="Compass Crew brings together ambitious students with the mentors, tools, and institutions needed to succeed."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {WHO_IT_IS_FOR.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.role}
                className="border-border/60 bg-card/60 transition hover:border-primary/30"
              >
                <CardContent className="flex items-start gap-4 p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {item.role}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* How It Works */}
      <Section className="border-t border-border py-12 md:py-16">
        <SectionHeading
          eyebrow="The Pathway"
          title="How It Works"
          description="A continuous cycle transforming ideas into tangible, verified outcomes."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {HOW_IT_WORKS.map((stage) => (
            <Card
              key={stage.step}
              className="relative border-border/60 bg-card/40 transition hover:border-primary/40"
            >
              <CardContent className="space-y-3 p-6">
                <span className="font-mono text-2xl font-bold text-primary/60">{stage.step}</span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  {stage.title}
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{stage.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      {/* Roadmap Section */}
      <Section className="border-t border-border bg-muted/20 py-12 md:py-16">
        <SectionHeading
          eyebrow="Roadmap"
          title="What We Are Building Next"
          description="A rolling roadmap of programs and infrastructure Compass Crew is actively rolling out."
        />

        <div className="mt-10 max-w-2xl">
          <ol className="relative space-y-6 border-l border-border pl-6">
            {roadmapItems.map((step: string, i: number) => (
              <li key={step} className="relative">
                <span className="absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[10px] font-semibold text-white ring-4 ring-background shadow-sm">
                  {i + 1}
                </span>
                <p className="font-display text-base font-medium text-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* Call to Action Banner */}
      <Section className="border-t border-border py-16">
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-card shadow-elegant">
          <CardContent className="p-8 sm:p-12 text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Start Your Journey
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to build something that matters?
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Whether you are an aspiring student builder, an experienced mentor, or a potential
              partner—Compass Crew is your platform to collaborate, learn, and launch.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-brand text-white hover:opacity-90 shadow-elegant"
              >
                <Link to="/hackathons">
                  Explore Hackathons <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
