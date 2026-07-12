import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  acceptEmailInvitation, declineEmailInvitation,
  acceptDirectInvitation, declineDirectInvitation,
  listMyPendingInvitations,
} from "@/lib/teams";

export const Route = createFileRoute("/_authenticated/invitations")({
  ssr: false,
  component: InvitationsPage,
});

interface DirectInvite {
  id: string;
  team_id: string;
  team: { id: string; name: string; hackathon: { title: string; slug: string } | null } | null;
}

function InvitationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Email-based pending invitations
  const emailQ = useQuery({
    queryKey: ["invitations", "email", user?.id],
    queryFn: listMyPendingInvitations,
    enabled: !!user,
  });

  // Direct team_members with status='invited'
  const directQ = useQuery({
    queryKey: ["invitations", "direct", user?.id],
    queryFn: async (): Promise<DirectInvite[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("team_members")
        .select("id, team_id")
        .eq("user_id", user.id)
        .eq("status", "invited");
      if (error) throw error;
      const rows = data ?? [];
      if (!rows.length) return [];
      const { data: teams } = await supabase
        .from("teams")
        .select("id, name, hackathon:hackathons(title, slug)")
        .in("id", rows.map((r) => r.team_id));
      const map = new Map((teams ?? []).map((t) => [t.id, t]));
      return rows.map((r) => ({
        id: r.id,
        team_id: r.team_id,
        team: (map.get(r.team_id) ?? null) as DirectInvite["team"],
      }));
    },
    enabled: !!user,
  });

  const acceptDirect = useMutation({
    mutationFn: (id: string) => acceptDirectInvitation(id),
    onSuccess: () => {
      toast.success("Joined team");
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const declineDirect = useMutation({
    mutationFn: (id: string) => declineDirectInvitation(id),
    onSuccess: () => {
      toast.success("Invitation declined");
      qc.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const acceptEmail = useMutation({
    mutationFn: (id: string) => acceptEmailInvitation(id, user!.id),
    onSuccess: () => {
      toast.success("Joined team");
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["teams", "mine"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const declineEmail = useMutation({
    mutationFn: (id: string) => declineEmailInvitation(id),
    onSuccess: () => {
      toast.success("Invitation declined");
      qc.invalidateQueries({ queryKey: ["invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = emailQ.isLoading || directQ.isLoading;
  const empty = !loading && (emailQ.data ?? []).length === 0 && (directQ.data ?? []).length === 0;

  return (
    <>
      <PageHeader
        eyebrow="Invitations"
        title="Team invitations"
        description="Accept or decline invitations you've received to join hackathon teams."
      />
      <Section>
        {loading ? (
          <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        ) : empty ? (
          <EmptyState
            icon={Mail}
            title="No pending invitations"
            description="When someone invites you to their team you'll see it here."
            action={<Button asChild variant="outline"><Link to="/teams"><Users className="mr-2 h-4 w-4" />My teams</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {(directQ.data ?? []).map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <Badge variant="outline">{inv.team?.hackathon?.title ?? "Hackathon"}</Badge>
                    <h3 className="mt-2 font-display text-lg font-semibold">{inv.team?.name ?? "Team"}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => declineDirect.mutate(inv.id)}>
                      <X className="mr-1 h-4 w-4" />Decline
                    </Button>
                    <Button size="sm" onClick={() => acceptDirect.mutate(inv.id)}>
                      <Check className="mr-1 h-4 w-4" />Accept
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {(emailQ.data ?? []).map((inv) => (
              <Card key={inv.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <Badge variant="outline">{inv.team?.hackathon?.title ?? "Hackathon"}</Badge>
                    <h3 className="mt-2 font-display text-lg font-semibold">{inv.team?.name ?? "Team"}</h3>
                    <p className="text-xs text-muted-foreground">Invited as {inv.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => declineEmail.mutate(inv.id)}>
                      <X className="mr-1 h-4 w-4" />Decline
                    </Button>
                    <Button size="sm" onClick={() => acceptEmail.mutate(inv.id)}>
                      <Check className="mr-1 h-4 w-4" />Accept
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
