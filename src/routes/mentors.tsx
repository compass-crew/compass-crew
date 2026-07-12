import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { UserRoundCog, Linkedin, Twitter, Globe } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listMentors } from "@/lib/public-cms";

export const Route = createFileRoute("/mentors")({
  head: () => ({
    meta: [
      { title: "Mentors — Compass Crew" },
      { name: "description", content: "Meet the operators, founders and engineers who mentor Compass Crew builders." },
      { property: "og:title", content: "Mentors — Compass Crew" },
      { property: "og:description", content: "Operators, founders and engineers mentoring the crew." },
    ],
    links: [{ rel: "canonical", href: "/mentors" }],
  }),
  component: MentorsPage,
});

function MentorsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["mentors"], queryFn: listMentors });
  const mentors = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Mentors"
        title="Learn from operators who shipped."
        description="Founders, engineers and product leaders who spend time each month with the Compass Crew community."
      >
        <Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/partner">Become a mentor</Link></Button>
      </PageHeader>
      <Section>
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : mentors.length === 0 ? (
          <EmptyState
            icon={UserRoundCog}
            title="Mentor applications are currently open."
            description="We're building our first cohort of mentors. If you'd like to give back, apply and we'll get in touch."
            action={<Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/partner">Apply to mentor</Link></Button>}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mentors.map((m) => (
              <Card key={m.id}><CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-4">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt={m.name} loading="lazy" className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-brand font-display text-lg font-bold text-white">{m.name.charAt(0)}</span>
                  )}
                  <div>
                    <p className="font-display font-semibold">{m.name}</p>
                    {(m.title || m.company) && (
                      <p className="text-sm text-muted-foreground">{[m.title, m.company].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                </div>
                {m.bio && <p className="line-clamp-4 text-sm text-muted-foreground">{m.bio}</p>}
                {m.expertise && m.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.expertise.slice(0, 5).map((e: string) => <Badge key={e} variant="outline" className="text-xs">{e}</Badge>)}
                  </div>
                )}
                <div className="flex gap-2 pt-1">
                  {m.linkedin_url && <a href={m.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-4 w-4" /></a>}
                  {m.twitter_url && <a href={m.twitter_url} target="_blank" rel="noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground"><Twitter className="h-4 w-4" /></a>}
                  {m.website_url && <a href={m.website_url} target="_blank" rel="noreferrer" aria-label="Website" className="text-muted-foreground hover:text-foreground"><Globe className="h-4 w-4" /></a>}
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
