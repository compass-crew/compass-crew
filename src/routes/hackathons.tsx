import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { HackathonCard } from "@/components/hackathon-card";
import { listPublicHackathons } from "@/lib/hackathons";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/hackathons")({
  head: () => ({
    meta: [
      { title: "Hackathons — Compass Crew" },
      { name: "description", content: "Browse upcoming and ongoing hackathons run by the Compass Crew community across India." },
      { property: "og:title", content: "Hackathons — Compass Crew" },
      { property: "og:description", content: "Flagship hackathons, weekend sprints and campus seasons across India." },
    ],
  }),
  component: HackathonsPage,
});

function HackathonsPage() {
  const { hasAnyRole } = useAuth();
  const canCreate = hasAnyRole(["organizer", "super_admin"]);

  const { data: hackathons, isLoading } = useQuery({
    queryKey: ["hackathons", "public"],
    queryFn: listPublicHackathons,
  });

  const upcoming = (hackathons ?? []).filter((h) =>
    ["published", "registrations_open", "ongoing"].includes(h.status),
  );
  const past = (hackathons ?? []).filter((h) => ["completed", "archived", "judging"].includes(h.status));

  return (
    <>
      <PageHeader
        eyebrow="Hackathons"
        title={<>Build in a weekend. <span className="text-gradient-brand">Ship in a season.</span></>}
        description="From short-form sprints to multi-week campus seasons — our hackathons pair students with mentors, real users and opportunities worth chasing."
      >
        {canCreate ? (
          <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
            <Link to="/organizer/hackathons/new"><Plus className="mr-2 h-4 w-4" /> Create hackathon</Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="bg-gradient-brand text-white hover:opacity-90">
            <Link to="/community">Join community</Link>
          </Button>
        )}
        <Button asChild size="lg" variant="outline">
          <Link to="/partner">Sponsor a hackathon</Link>
        </Button>
      </PageHeader>

      <Section>
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past hackathons</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-8">
            {isLoading ? (
              <SkeletonGrid />
            ) : upcoming.length === 0 ? (
              <EmptyState
                title="No hackathons available yet"
                body="We're planning the next season. Sign up to be notified the moment registrations open."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((h) => <HackathonCard key={h.id} h={h} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-8">
            {isLoading ? (
              <SkeletonGrid />
            ) : past.length === 0 ? (
              <EmptyState
                title="Recap coming soon"
                body="We'll publish recaps, winners and highlights here once the first season wraps."
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {past.map((h) => <HackathonCard key={h.id} h={h} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Section>
    </>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}><CardContent className="space-y-4 p-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent></Card>
      ))}
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 p-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </span>
        <h3 className="font-display text-xl font-semibold">{title}</h3>
        <p className="max-w-md text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
