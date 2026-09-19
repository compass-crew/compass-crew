import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Circle, Github, Globe, Video, FileText } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { listJudgeSubmissions } from "@/lib/judging";
import { useAuth } from "@/hooks/use-auth";
import { requireRole } from "@/lib/auth-guard";

export const Route = createFileRoute("/_authenticated/judge/hackathons/$hackathonId")({
  ssr: false,
  beforeLoad: requireRole(["judge", "super_admin"]),
  component: JudgeHackathonPage,
});

function JudgeHackathonPage() {
  const { hackathonId } = Route.useParams();
  const { user } = useAuth();

  const hackQ = useQuery({
    queryKey: ["judge", "hackathon", hackathonId],
    queryFn: async () => {
      const { data } = await supabase
        .from("hackathons")
        .select("id, title, tagline")
        .eq("id", hackathonId)
        .maybeSingle();
      return data;
    },
  });

  const subsQ = useQuery({
    queryKey: ["judge", "submissions", hackathonId],
    queryFn: () => listJudgeSubmissions(hackathonId),
  });

  const myScoresQ = useQuery({
    queryKey: ["judge", "myScores", hackathonId, user?.id],
    queryFn: async () => {
      if (!subsQ.data?.length || !user) return new Set<string>();
      const { data } = await supabase
        .from("scores")
        .select("submission_id, is_final")
        .in(
          "submission_id",
          subsQ.data.map((s) => s.id),
        )
        .eq("judge_id", user.id)
        .eq("is_final", true);
      return new Set((data ?? []).map((r) => r.submission_id));
    },
    enabled: !!subsQ.data && !!user,
  });

  return (
    <>
      <PageHeader
        eyebrow="Judging queue"
        title={hackQ.data?.title ?? "Loading…"}
        description={hackQ.data?.tagline ?? undefined}
      >
        <Button asChild variant="outline">
          <Link to="/judge">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </PageHeader>
      <Section>
        {subsQ.isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : !subsQ.data?.length ? (
          <EmptyState
            title="No submitted projects yet"
            description="Teams still have time to submit. Check back after the deadline."
          />
        ) : (
          <div className="space-y-4">
            {subsQ.data.map((s) => {
              const done = myScoresQ.data?.has(s.id);
              return (
                <Card key={s.id} className="transition hover:shadow-elegant">
                  <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className="font-display text-lg font-semibold truncate">{s.name}</h3>
                        {s.track?.name && <Badge variant="secondary">{s.track.name}</Badge>}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{s.tagline}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {s.team?.name && <span>Team: {s.team.name}</span>}
                        {s.github_url && (
                          <a
                            href={s.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <Github className="h-3.5 w-3.5" /> Repo
                          </a>
                        )}
                        {s.live_url && (
                          <a
                            href={s.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <Globe className="h-3.5 w-3.5" /> Demo
                          </a>
                        )}
                        {s.video_url && (
                          <a
                            href={s.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <Video className="h-3.5 w-3.5" /> Video
                          </a>
                        )}
                        {s.presentation_url && (
                          <a
                            href={s.presentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                          >
                            <FileText className="h-3.5 w-3.5" /> Deck
                          </a>
                        )}
                      </div>
                    </div>
                    <Button asChild>
                      <Link to="/judge/submissions/$submissionId" params={{ submissionId: s.id }}>
                        {done ? "View score" : "Score project"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
