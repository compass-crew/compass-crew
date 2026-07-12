import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { STATS } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Compass Crew" },
      { name: "description", content: "The story, mission and team behind Compass Crew — India's student-led AI, tech and startup community." },
      { property: "og:title", content: "About Compass Crew" },
      { property: "og:description", content: "Student-led. India-first. Building since 2022." },
    ],
  }),
  component: AboutPage,
});

const team = [
  { name: "Aarav Mehta", role: "Founder", campus: "IIT Bombay" },
  { name: "Sana Iyer", role: "Head of Community", campus: "BITS Pilani" },
  { name: "Rohan Das", role: "Head of Hackathons", campus: "IIIT Hyderabad" },
  { name: "Kavya Shah", role: "Head of Learning", campus: "IIT Delhi" },
];

const timeline = [
  { year: "2022", body: "Started as a WhatsApp group of 40 students who wanted to build things together." },
  { year: "2023", body: "Ran our first flagship hackathon, BuildHack, with 300 hackers across 8 cities." },
  { year: "2024", body: "Crossed 5,000 members. Launched Compass Learn bootcamps and the mentor network." },
  { year: "2025", body: "48 campus chapters. Studio program helped 22 student startups reach first users." },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title={<>Built by students, <span className="text-gradient-brand">for students.</span></>}
        description="Compass Crew started in a hostel room in 2022. Today we're India's largest student-led community for AI, technology and startups — still run by students, still free to join."
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-6 text-center">
                <div className="font-display text-3xl font-semibold text-gradient-brand">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading eyebrow="Timeline" title="How we got here." />
        <ol className="mt-10 space-y-6 border-l border-border pl-6">
          {timeline.map((t) => (
            <li key={t.year} className="relative">
              <span className="absolute -left-[31px] top-1 grid h-4 w-4 place-items-center rounded-full bg-gradient-brand ring-4 ring-background" />
              <p className="font-display text-sm font-semibold text-primary">{t.year}</p>
              <p className="mt-1 text-base text-muted-foreground">{t.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <SectionHeading eyebrow="Core team" title="The people behind the crew." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <Card key={m.name}>
              <CardContent className="p-6">
                <div className="mb-4 h-16 w-16 rounded-full bg-gradient-brand" />
                <p className="font-display text-lg font-semibold">{m.name}</p>
                <p className="text-sm text-muted-foreground">{m.role}</p>
                <p className="mt-1 text-xs text-muted-foreground">{m.campus}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
