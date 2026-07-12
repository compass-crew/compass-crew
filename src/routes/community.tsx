import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BENEFITS } from "@/data/site";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — Compass Crew" },
      { name: "description", content: "Join a community of 12,000+ student builders in AI, tech and startups across India." },
      { property: "og:title", content: "Community — Compass Crew" },
      { property: "og:description", content: "12,000+ student builders across 48 campuses." },
    ],
  }),
  component: CommunityPage,
});

const chapters = [
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kharagpur", "IIT Kanpur", "IIT Hyderabad",
  "BITS Pilani", "IIIT Hyderabad", "NIT Trichy", "NIT Surathkal", "IIIT Delhi", "SRM Chennai",
  "DTU", "NSUT", "VIT Vellore", "Manipal", "Ashoka", "Krea",
];

function CommunityPage() {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title={<>A crew of <span className="text-gradient-brand">12,000+ builders.</span></>}
        description="Students shipping in AI, product, design and engineering — across 48 campus chapters and one very active Discord."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/contact">Apply to join</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link to="/partner">Start a chapter</Link>
        </Button>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Why join" title="Real perks. Real people. Real projects." align="center" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <Card key={b.title}>
              <CardContent className="space-y-4 p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <h4 className="font-semibold">{b.title}</h4>
                <p className="text-sm text-muted-foreground">{b.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading eyebrow="Campus chapters" title="48 campuses. One crew." />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {chapters.map((c) => (
            <div
              key={c}
              className="grid h-14 place-items-center rounded-xl border border-border bg-card text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              {c}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
