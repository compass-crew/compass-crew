import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, MapPin, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { listCareers } from "@/lib/public-cms";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers & Opportunities — Compass Crew" },
      { name: "description", content: "Open roles, internships, ambassador and organizer positions at Compass Crew." },
      { property: "og:title", content: "Careers — Compass Crew" },
      { property: "og:description", content: "Join the team building Compass Crew." },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
  component: CareersPage,
});

const CATEGORY_LABEL: Record<string, string> = {
  volunteer: "Volunteer",
  ambassador: "Ambassador",
  organizer: "Organizer",
  internship: "Internship",
  full_time: "Full-time",
  future: "Future openings",
};

function CareersPage() {
  const { data, isLoading } = useQuery({ queryKey: ["careers"], queryFn: listCareers });
  const openings = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Build Compass Crew with us."
        description="Open roles, internships, ambassador and organizer opportunities."
      />
      <Section>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : openings.length === 0 ? (
          <EmptyState icon={Briefcase} title="No openings currently available." description="Sign up for the newsletter to be notified when new roles open up." />
        ) : (
          <div className="space-y-4">
            {openings.map((c) => (
              <Card key={c.id}><CardContent className="flex flex-wrap items-start justify-between gap-6 p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{CATEGORY_LABEL[c.category] ?? c.category}</Badge>
                    {c.mode && <Badge variant="outline" className="capitalize">{c.mode.replace("_", " ")}</Badge>}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{c.title}</h3>
                  {c.description && <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>}
                  {c.location && <p className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{c.location}</p>}
                </div>
                {c.apply_url && (
                  <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                    <a href={c.apply_url} target="_blank" rel="noreferrer">Apply <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
                  </Button>
                )}
              </CardContent></Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
