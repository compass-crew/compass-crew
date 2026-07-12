import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gavel, ArrowRight, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { useAuth } from "@/hooks/use-auth";
import { listJudgeHackathons } from "@/lib/judging";
import { HACKATHON_STATUS_LABEL } from "@/lib/hackathons";

export const Route = createFileRoute("/_authenticated/judge")({
  ssr: false,
  beforeLoad: ({ context }) => {
    const user = (context as { user?: { id: string } }).user;
    if (!user) throw redirect({ to: "/auth" });
  },
  component: JudgePage,
});

function JudgePage() {
  const { user, hasAnyRole } = useAuth();
  const isJudge = hasAnyRole(["judge", "super_admin"]);

  const q = useQuery({
    queryKey: ["judge", "hackathons", user?.id],
    queryFn: () => listJudgeHackathons(user!.id),
    enabled: !!user,
  });

  return (
    <>
      <PageHeader
        eyebrow="Judge console"
        title="Score with confidence."
        description="Every hackathon you're assigned to, with the projects waiting for your feedback."
      />
      <Section>
        {!isJudge ? (
          <EmptyState
            icon={Gavel}
            title="You're not a judge yet"
            description="Organizers invite judges from the hackathon console. Once assigned, hackathons appear here."
          />
        ) : q.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 1].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
          </div>
        ) : !q.data?.length ? (
          <EmptyState
            icon={Trophy}
            title="No judging assignments yet"
            description="You'll see hackathons here when organizers assign you."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {q.data.map((h) => (
              <Card key={h.id} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{HACKATHON_STATUS_LABEL[h.status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {h.scored_count}/{h.submission_count} scored
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-tight">{h.title}</h3>
                  <Button asChild variant="ghost" className="px-0 text-primary">
                    <Link to="/judge/hackathons/$hackathonId" params={{ hackathonId: h.id }}>
                      Open queue <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
