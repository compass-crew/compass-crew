import { createFileRoute, Link } from "@tanstack/react-router";
import { Compass, Target, Eye, HeartHandshake, Users, Route as RouteIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MISSION } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Compass Crew" },
      { name: "description", content: "Compass Crew is India's student-led community for AI, technology, innovation and startups. Read our mission, vision and roadmap." },
      { property: "og:title", content: "About Compass Crew" },
      { property: "og:description", content: "Student-led. India-first. Built for the next generation of builders." },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  { icon: Compass, eyebrow: "What we are", body: MISSION.what },
  { icon: Target, eyebrow: "Mission", body: MISSION.mission },
  { icon: Eye, eyebrow: "Vision", body: MISSION.vision },
  { icon: HeartHandshake, eyebrow: "Why we exist", body: MISSION.why },
  { icon: Users, eyebrow: "Who can join", body: MISSION.who },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={<>Built by students, <span className="text-gradient-brand">for students.</span></>}
        description="Compass Crew is India's student-led community for AI, technology, innovation and startups — an open, national platform for every student who wants to build."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/community">Join the crew</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/partner">Partner with us</Link>
        </Button>
      </PageHeader>

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.eyebrow} className="transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-4 p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                  <p.icon className="h-5 w-5" />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  {p.eyebrow}
                </p>
                <p className="text-sm leading-relaxed text-foreground/90">{p.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading
          eyebrow="Roadmap"
          title="What we're building next."
          description="A rolling roadmap of programs Compass Crew is preparing for the community. Timelines will be announced as each program opens."
        />
        <ol className="mt-10 space-y-6 border-l border-border pl-6">
          {MISSION.roadmap.map((step, i) => (
            <li key={step} className="relative">
              <span className="absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[10px] font-semibold text-white ring-4 ring-background">
                {i + 1}
              </span>
              <p className="font-display text-base font-semibold">{step}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Timeline announced soon — join the community to be first in line.
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
            <Link to="/community">Join the crew</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">
              <RouteIcon className="mr-1.5 h-4 w-4" /> Get in touch
            </Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
