import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Handshake, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listSponsors } from "@/lib/public-cms";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title: "Sponsors — Compass Crew" },
      { name: "description", content: "Partner with Compass Crew to reach India's next generation of student builders through hackathons, workshops and campus programs." },
      { property: "og:title", content: "Sponsors — Compass Crew" },
      { property: "og:description", content: "Reach the next generation of Indian student builders." },
    ],
    links: [{ rel: "canonical", href: "/sponsors" }],
  }),
  component: SponsorsPage,
});

const TIER_ORDER = ["title", "platinum", "gold", "silver", "bronze", "community"] as const;
const TIER_LABEL: Record<string, string> = {
  title: "Title Sponsors",
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
  community: "Community Partners",
};

const tiers = [
  { name: "Anchor", price: "Custom", tagline: "Title partner for a flagship program", perks: ["Title branding on a flagship hackathon", "Recruiting presence and speaker slot", "Access to the Compass Crew community", "Co-created bootcamp or workshop track"] },
  { name: "Crew", price: "Custom", tagline: "Multi-program partner across the year", perks: ["Logo across event assets and channels", "Workshop slots at partner campuses", "Job and internship placements", "Mentor seats at hackathons"] },
  { name: "Compass", price: "Custom", tagline: "Community-friendly single program", perks: ["Community-wide logo placement", "One virtual workshop", "Newsletter mention", "Community announcement"] },
];

function SponsorsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["sponsors"], queryFn: listSponsors });
  const sponsors = data ?? [];
  const grouped = TIER_ORDER.map((t) => ({ tier: t, items: sponsors.filter((s) => s.tier === t) })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHeader
        eyebrow="Sponsors"
        title="Reach the next generation of Indian builders."
        description="Compass Crew partners with companies who want to hire, teach or ship to India's student technologists."
      >
        <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/partner">Become a sponsor</Link>
        </Button>
      </PageHeader>

      <Section>
        <SectionHeading eyebrow="Our sponsors" title="Backed by builders." align="center" />
        <div className="mt-12">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}
            </div>
          ) : sponsors.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Become our first sponsor."
              description="We're onboarding our founding cohort of partners now. Reach India's most driven student builders — start the conversation."
              action={<Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/partner"><Handshake className="mr-1.5 h-4 w-4" /> Talk to us</Link></Button>}
            />
          ) : (
            <div className="space-y-12">
              {grouped.map((g) => (
                <div key={g.tier}>
                  <h3 className="mb-4 text-center font-display text-lg font-semibold text-muted-foreground">{TIER_LABEL[g.tier]}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {g.items.map((s) => (
                      <a
                        key={s.id}
                        href={s.url ?? "#"}
                        target={s.url ? "_blank" : undefined}
                        rel="noreferrer"
                        className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/50 hover:shadow-elegant"
                      >
                        {s.logo_url ? (
                          <img src={s.logo_url} alt={s.name} loading="lazy" className="h-12 w-full object-contain" />
                        ) : (
                          <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 font-display text-lg font-bold text-primary">{s.name.charAt(0)}</span>
                        )}
                        <p className="text-sm font-semibold">{s.name}</p>
                        {s.blurb && <p className="line-clamp-2 text-center text-xs text-muted-foreground">{s.blurb}</p>}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  {t.perks.map((p) => <li key={p} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{p}</li>)}
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
