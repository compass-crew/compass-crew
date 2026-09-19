import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { requireRole } from "@/lib/auth-guard";
import { HACKATHON_STATUS_LABEL, formatDateRange, type Hackathon } from "@/lib/hackathons";

export const Route = createFileRoute("/_authenticated/organizer/hackathons")({
  ssr: false,
  beforeLoad: requireRole(["organizer", "super_admin"]),
  component: MyHackathonsPage,
});

function MyHackathonsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["organizer", "hackathons", "mine"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .eq("created_by", userData.user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Hackathon[];
    },
  });

  return (
    <>
      <PageHeader
        eyebrow="Organizer"
        title="Your hackathons"
        description="Create, publish and manage every hackathon you run through Compass Crew."
      >
        <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
          <Link to="/organizer/hackathons/new">
            <Plus className="mr-2 h-4 w-4" /> New hackathon
          </Link>
        </Button>
      </PageHeader>

      <Section>
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (data ?? []).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-semibold">No hackathons yet</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Ship your first hackathon in under 5 minutes. Add tracks, rules, prizes and judging
                criteria as you go.
              </p>
              <Button asChild className="mt-2 bg-gradient-brand text-white hover:opacity-90">
                <Link to="/organizer/hackathons/new">
                  <Plus className="mr-2 h-4 w-4" /> Create first hackathon
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((h) => (
              <Card key={h.id} className="transition hover:shadow-elegant">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{HACKATHON_STATUS_LABEL[h.status]}</Badge>
                      {h.is_featured && (
                        <Badge className="bg-primary/15 text-primary">Featured</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold">{h.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDateRange(h.starts_at, h.ends_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {h.status !== "draft" && (
                      <Button asChild size="sm" variant="outline">
                        <Link to="/hackathons/$slug" params={{ slug: h.slug }}>
                          View public
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="sm">
                      <Link to="/organizer/hackathons/$hackathonId" params={{ hackathonId: h.id }}>
                        Manage
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
