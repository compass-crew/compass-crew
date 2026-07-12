import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Handshake } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — Compass Crew" },
      { name: "description", content: "Partner with Compass Crew to reach India's next generation of student builders through hackathons, workshops and campus programs." },
      { property: "og:title", content: "Sponsors — Compass Crew" },
      { property: "og:description", content: "Reach the next generation of Indian student builders." },
    ],
  }),
  component: SponsorsPage,
});

const partnerSlots = [
  "Your Logo Here",
  "Founding Partner",
  "Early Partner",
  "Talent Partner",
  "Community Partner",
  "Your Logo Here",
  "Become a Sponsor",
  "Your Logo Here",
];

const tiers = [
  {
    name: "Anchor",
    price: "Custom",
    tagline: "Title partner for a flagship program",
    perks: [
      "Title branding on a flagship hackathon or program",
      "Recruiting presence and speaker slot",
      "Access to the Compass Crew community",
      "Co-created bootcamp or workshop track",
    ],
  },
  {
    name: "Crew",
    price: "Custom",
    tagline: "Multi-program partner across the year",
    perks: [
      "Logo across event assets and channels",
      "Workshop slots at partner campuses",
      "Job and internship placements",
      "Mentor seats at hackathons",
    ],
  },
  {
    name: "Compass",
    price: "Custom",
    tagline: "Community-friendly single program",
    perks: [
      "Community-wide logo placement",
      "One virtual workshop",
      "Newsletter mention",
      "Community announcement",
    ],
  },
];

function SponsorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Reach the next generation of Indian builders."
        description="Compass Crew partners with companies who want to hire, teach or ship to India's student technologists. We're onboarding our founding cohort of partners now."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/partner">Become a sponsor</Link>
        </Button>
      </PageHeader>

      <Section>
        <SectionHeading
          eyebrow="Founding partner cohort"
          title="Early partners welcome."
          description="These slots are reserved for companies joining Compass Crew as founding partners."
          align="center"
        />
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
          {partnerSlots.map((label, i) => (
            <div
              key={i}
              className="grid h-24 place-items-center rounded-2xl border border-dashed border-border bg-card/60 px-3 text-center text-xs font-medium text-muted-foreground backdrop-blur transition hover:border-primary/50 hover:text-foreground"
            >
              {label}
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
            <Link to="/partner">
              <Handshake className="mr-1.5 h-4 w-4" /> Talk to us
            </Link>
          </Button>
        </div>
      </Section>

      <Section className="border-t border-border bg-muted/30">
        <SectionHeading eyebrow="Sponsorship tiers" title="Pick a partnership that fits." align="center" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t, i) => (
            <Card key={t.name} className={i === 0 ? "border-primary/50 shadow-elegant" : ""}>
              <CardContent className="space-y-6 p-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold">{t.name}</h3>
                  {i === 0 && <Badge className="bg-gradient-brand text-white">Flagship</Badge>}
                </div>
                <div>
                  <p className="font-display text-3xl font-semibold">{t.price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={i === 0 ? "default" : "outline"}>
                  <Link to="/partner">Talk to us</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
