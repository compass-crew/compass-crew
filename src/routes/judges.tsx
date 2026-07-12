import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gavel, Linkedin, Twitter } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listPublicJudges } from "@/lib/public-cms";

export const Route = createFileRoute("/judges")({
  head: () => ({
    meta: [
      { title: "Judges — Compass Crew" },
      { name: "description", content: "Industry leaders judging Compass Crew hackathons and programs." },
      { property: "og:title", content: "Judges — Compass Crew" },
      { property: "og:description", content: "Industry leaders judging our hackathons." },
    ],
    links: [{ rel: "canonical", href: "/judges" }],
  }),
  component: JudgesPage,
});

function JudgesPage() {
  const { data, isLoading } = useQuery({ queryKey: ["public-judges"], queryFn: listPublicJudges });
  const judges = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Judges"
        title="Judged by people who ship."
        description="Founders, engineers and investors who help us pick the strongest builds each season."
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : judges.length === 0 ? (
          <EmptyState icon={Gavel} title="Judges will be announced before each event." description="Follow along for our next hackathon's judging panel." />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {judges.map((j) => (
              <Card key={j.id}><CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  {j.avatar_url ? (
                    <img src={j.avatar_url} alt={j.name} loading="lazy" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-bold text-white">{j.name.charAt(0)}</span>
                  )}
                  <div>
                    <p className="font-display font-semibold">{j.name}</p>
                    {(j.title || j.company) && (
                      <p className="text-sm text-muted-foreground">{[j.title, j.company].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
                {j.event_label && <Badge variant="secondary" className="w-fit">{j.event_label}</Badge>}
                {j.bio && <p className="line-clamp-4 text-sm text-muted-foreground">{j.bio}</p>}
                <div className="flex gap-2 pt-1">
                  {j.linkedin_url && <a href={j.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>}
                  {j.twitter_url && <a href={j.twitter_url} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-4 w-4" /></a>}
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
