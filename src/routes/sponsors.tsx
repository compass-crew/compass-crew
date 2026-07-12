import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SPONSORS } from "@/data/site";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — Compass Crew" },
      { name: "description", content: "Meet the companies powering the Compass Crew community, hackathons and bootcamps." },
      { property: "og:title", content: "Sponsors — Compass Crew" },
      { property: "og:description", content: "Companies powering student builders across India." },
    ],
  }),
  component: SponsorsPage,
});

const tiers = [
  {
    name: "Anchor",
    price: "₹10L+",
    perks: ["Title branding on flagship hackathon", "Recruiting booth + speaker slot", "Access to 12k+ student community", "Custom bootcamp co-creation"],
  },
  {
    name: "Crew",
    price: "₹3L+",
    perks: ["Logo on all event assets", "Workshop slot at 3 campuses", "Job board placements", "Mentor spots at hackathons"],
  },
  {
    name: "Compass",
    price: "₹75k+",
    perks: ["Community-wide logo placement", "One virtual workshop", "Newsletter mention", "Discord announcement"],
  },
];

function SponsorsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Reach the next generation of Indian builders."
        description="Compass Crew partners with companies who want to hire, teach or ship to India's top student technologists."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/partner">Become a sponsor</Link>
        </Button>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Current partners" title="Companies we work with." align="center" />
        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SPONSORS.map((s) => (
            <div key={s} className="grid h-20 place-items-center rounded-2xl border border-border bg-card text-base font-semibold text-muted-foreground transition hover:border-primary/40 hover:text-foreground">
              {s}
            </div>
          ))}
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
                  {i === 0 && <Badge className="bg-gradient-brand text-white">Popular</Badge>}
                </div>
                <p className="font-display text-3xl font-semibold">{t.price}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {t.perks.map((p) => (
                    <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-primary shrink-0" />{p}</li>
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
