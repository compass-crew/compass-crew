import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Compass, Target, Eye, HeartHandshake, Users, Route as RouteIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { listHomepageSections, findSection } from "@/lib/public-cms";
import { MISSION } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Compass Crew" },
      { name: "description", content: "Compass Crew is India's student-led community for AI, technology, innovation and startups." },
      { property: "og:title", content: "About Compass Crew" },
      { property: "og:description", content: "Student-led. India-first. Built for the next generation of builders." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const PILLARS = [
  { key: "about_what", icon: Compass, eyebrow: "What we are", fallback: MISSION.what },
  { key: "about_mission", icon: Target, eyebrow: "Mission", fallback: MISSION.mission },
  { key: "about_vision", icon: Eye, eyebrow: "Vision", fallback: MISSION.vision },
  { key: "about_why", icon: HeartHandshake, eyebrow: "Why we exist", fallback: MISSION.why },
  { key: "about_who", icon: Users, eyebrow: "Who can join", fallback: MISSION.who },
] as const;

function AboutPage() {
  const { data } = useQuery({ queryKey: ["homepage-sections"], queryFn: listHomepageSections });
  const sections = data ?? [];
  const journey = findSection(sections, "about_journey");
  const roadmap = findSection(sections, "about_roadmap");
  const roadmapItems = (roadmap?.data as { items?: string[] } | null)?.items ?? MISSION.roadmap;

  return (
    <>
      <PageHeader
        eyebrow="About"
        title={<>Built by students, <span className="text-gradient-brand">for students.</span></>}
        description="Compass Crew is India's student-led community for AI, technology, innovation and startups — an open, national platform for every student who wants to build."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90"><Link to="/community">Join the crew</Link></Button>
        <Button asChild size="lg" variant="outline"><Link to="/partner">Partner with us</Link></Button>
      </PageHeader>

      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p) => {
            const s = findSection(sections, p.key);
            const body = s?.body || p.fallback;
            return (
              <Card key={p.key} className="transition hover:-translate-y-0.5 hover:shadow-elegant">
                <CardContent className="space-y-4 p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand text-white shadow-elegant">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{s?.title ?? p.eyebrow}</p>
                  <p className="text-sm leading-relaxed text-foreground/90">{body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </Section>

      {journey && (
        <Section className="border-t border-border">
          <SectionHeading eyebrow="Our journey" title={journey.title ?? "Our journey"} description={journey.subtitle ?? undefined} />
          {journey.body && <div className="mt-8 max-w-3xl"><Markdown>{journey.body}</Markdown></div>}
        </Section>
      )}

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading
          eyebrow="Roadmap"
          title={roadmap?.title ?? "What we're building next."}
          description={roadmap?.subtitle ?? "A rolling roadmap of programs Compass Crew is preparing for the community."}
        />
        <ol className="mt-10 space-y-6 border-l border-border pl-6">
          {roadmapItems.map((step: string, i: number) => (
            <li key={step} className="relative">
              <span className="absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full bg-gradient-brand text-[10px] font-semibold text-white ring-4 ring-background">
                {i + 1}
              </span>
              <p className="font-display text-base font-semibold">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/community">Join the crew</Link></Button>
          <Button asChild variant="outline"><Link to="/contact"><RouteIcon className="mr-1.5 h-4 w-4" /> Get in touch</Link></Button>
        </div>
      </Section>
    </>
  );
}
