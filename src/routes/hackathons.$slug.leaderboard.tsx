import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Trophy, ArrowLeft, Medal } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { computeLeaderboard, groupByTrack } from "@/lib/leaderboard";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import { requireAuth } from "@/lib/auth-guard";

export const Route = createFileRoute("/hackathons/$slug/leaderboard")({
  beforeLoad: requireAuth({ requireOnboarding: false }),
  head: ({ params }) => ({
    meta: [
      { title: `Leaderboard — ${params.slug} — Compass Crew` },
      { name: "description", content: "Live leaderboard for the hackathon." },
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { slug } = Route.useParams();
  const hackQ = useQuery({
    queryKey: ["hackathon", slug, "for-leaderboard"],
    queryFn: async () => {
      const { data } = await supabase
        .from("hackathons")
        .select("id, title, tagline, results_published_at, leaderboard_frozen")
        .eq("slug", slug)
        .maybeSingle();
      return data;
    },
  });
  const lbQ = useQuery({
    queryKey: ["leaderboard", slug],
    queryFn: () => (hackQ.data ? computeLeaderboard(hackQ.data.id) : Promise.resolve([])),
    enabled: !!hackQ.data,
  });

  const byTrack = useMemo(
    () => (lbQ.data ? groupByTrack([...lbQ.data]) : new Map<string, LeaderboardEntry[]>()),
    [lbQ.data],
  );

  const published = !!hackQ.data?.results_published_at;

  return (
    <>
      <PageHeader
        eyebrow={published ? "Final results" : "Live leaderboard"}
        title={hackQ.data?.title ?? "Leaderboard"}
        description={
          published
            ? `Published ${new Date(hackQ.data!.results_published_at!).toLocaleDateString("en-IN")}`
            : (hackQ.data?.tagline ?? undefined)
        }
      >
        <Button asChild variant="outline">
          <Link to="/hackathons/$slug" params={{ slug }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Hackathon
          </Link>
        </Button>
      </PageHeader>
      <Section>
        {hackQ.isLoading || lbQ.isLoading ? (
          <Skeleton className="h-96 w-full" />
        ) : !hackQ.data ? (
          <EmptyState title="Hackathon not found" />
        ) : !published ? (
          <EmptyState
            icon={Trophy}
            title="Results not published yet"
            description="Once organizers publish results, the final leaderboard will appear here."
          />
        ) : !lbQ.data?.length ? (
          <EmptyState icon={Trophy} title="No submissions scored" />
        ) : (
          <Tabs defaultValue="overall">
            <TabsList>
              <TabsTrigger value="overall">Overall</TabsTrigger>
              <TabsTrigger value="by-track">By track</TabsTrigger>
            </TabsList>
            <TabsContent value="overall" className="mt-6">
              <LeaderboardTable entries={lbQ.data} />
            </TabsContent>
            <TabsContent value="by-track" className="mt-6 space-y-8">
              {[...byTrack.entries()].map(([track, rows]) => (
                <div key={track}>
                  <h3 className="mb-3 font-display text-lg font-semibold">{track}</h3>
                  <LeaderboardTable entries={rows} />
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </Section>
    </>
  );
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="space-y-2">
      {entries.map((e) => (
        <Card key={e.submission_id} className={e.rank <= 3 ? "border-primary/40" : ""}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-brand text-white font-display font-semibold">
              {e.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate font-display font-semibold">{e.submission.name}</p>
              <p className="text-xs text-muted-foreground">
                {e.team_name ?? "Team"}
                {e.track_name ? ` · ${e.track_name}` : ""}
                {e.judge_count > 0
                  ? ` · ${e.judge_count} judge${e.judge_count > 1 ? "s" : ""}`
                  : ""}
              </p>
            </div>
            {e.submission.award && (
              <Badge className="hidden sm:inline-flex">
                <Medal className="mr-1 h-3 w-3" />
                {e.submission.award}
              </Badge>
            )}
            <div className="text-right">
              <p className="font-display text-xl font-semibold text-primary">
                {e.weighted_score.toFixed(2)}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">weighted</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
