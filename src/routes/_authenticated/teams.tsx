import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Plus, Trophy } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { listMyTeams } from "@/lib/teams";

export const Route = createFileRoute("/_authenticated/teams")({
  ssr: false,
  component: MyTeamsPage,
});

function MyTeamsPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["teams", "mine", user?.id],
    queryFn: () => (user ? listMyTeams(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  return (
    <>
      <PageHeader
        eyebrow="Teams"
        title="Your teams"
        description="Teams you lead or belong to across all Compass Crew hackathons."
      >
        <Button asChild variant="outline">
          <Link to="/invitations">
            <Users className="mr-2 h-4 w-4" /> Invitations
          </Link>
        </Button>
      </PageHeader>

      <Section>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="You're not on any team yet"
            description="Register for a hackathon and create or join a team to build your project."
            action={
              <Button asChild>
                <Link to="/hackathons">Browse hackathons</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {(data ?? []).map((t) => (
              <Card key={t.id} className="transition hover:shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline">{t.hackathon?.title ?? "Hackathon"}</Badge>
                    {t.leader_id === user?.id && (
                      <Badge className="bg-primary/15 text-primary">Leader</Badge>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-xl font-semibold">{t.name}</h3>
                  {t.tagline && <p className="mt-1 text-sm text-muted-foreground">{t.tagline}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link to="/teams/$teamId" params={{ teamId: t.id }}>
                        Manage team
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/teams/$teamId/submission" params={{ teamId: t.id }}>
                        Submission
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
