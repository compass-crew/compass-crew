import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Copy, Crown, Lock, LogOut, Mail, Send, Trash2, UserPlus, Users, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  getTeam, listTeamMembers, listTeamInvitations, inviteToTeam, updateTeam,
  removeMember, leaveTeam, transferOwnership, deleteTeam, revokeEmailInvitation,
} from "@/lib/teams";

export const Route = createFileRoute("/_authenticated/teams/$teamId")({
  ssr: false,
  component: TeamDetailPage,
});

function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  const teamQ = useQuery({ queryKey: ["team", teamId], queryFn: () => getTeam(teamId) });
  const membersQ = useQuery({ queryKey: ["team", teamId, "members"], queryFn: () => listTeamMembers(teamId) });
  const invitationsQ = useQuery({ queryKey: ["team", teamId, "invitations"], queryFn: () => listTeamInvitations(teamId) });

  const [inviteEmail, setInviteEmail] = useState("");
  const isLeader = teamQ.data?.leader_id === user?.id;
  const activeMembers = (membersQ.data ?? []).filter((m) => m.status === "active");
  const invitedMembers = (membersQ.data ?? []).filter((m) => m.status === "invited");
  const pendingInvites = (invitationsQ.data ?? []).filter((i) => i.status === "pending");
  const maxSize = teamQ.data?.hackathon?.max_team_size ?? 6;
  const canInviteMore = activeMembers.length + invitedMembers.length + pendingInvites.length < maxSize;

  const invite = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      return inviteToTeam({ team_id: teamId, email: inviteEmail, invited_by: user.id });
    },
    onSuccess: (r) => {
      setInviteEmail("");
      toast.success(r.kind === "direct" ? "Invite sent to registered user" : "Email invitation created");
      qc.invalidateQueries({ queryKey: ["team", teamId, "members"] });
      qc.invalidateQueries({ queryKey: ["team", teamId, "invitations"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Could not invite"),
  });

  const toggleOpen = useMutation({
    mutationFn: (is_open: boolean) => updateTeam(teamId, { is_open }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team", teamId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleLock = useMutation({
    mutationFn: (is_locked: boolean) => updateTeam(teamId, { is_locked }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["team", teamId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const kick = useMutation({
    mutationFn: (mid: string) => removeMember(mid),
    onSuccess: () => {
      toast.success("Member removed");
      qc.invalidateQueries({ queryKey: ["team", teamId, "members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const leave = useMutation({
    mutationFn: () => leaveTeam(teamId, user!.id),
    onSuccess: () => {
      toast.success("You left the team");
      router.navigate({ to: "/teams" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const transfer = useMutation({
    mutationFn: (newLeaderId: string) => transferOwnership(teamId, newLeaderId, user!.id),
    onSuccess: () => {
      toast.success("Ownership transferred");
      qc.invalidateQueries({ queryKey: ["team", teamId] });
      qc.invalidateQueries({ queryKey: ["team", teamId, "members"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const destroy = useMutation({
    mutationFn: () => deleteTeam(teamId),
    onSuccess: () => {
      toast.success("Team deleted");
      router.navigate({ to: "/teams" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revokeInv = useMutation({
    mutationFn: (id: string) => revokeEmailInvitation(id),
    onSuccess: () => {
      toast.success("Invitation revoked");
      qc.invalidateQueries({ queryKey: ["team", teamId, "invitations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (teamQ.isLoading) return <Section><Skeleton className="h-96 w-full" /></Section>;
  if (!teamQ.data) {
    return (
      <Section>
        <EmptyState
          icon={Users}
          title="Team not found"
          description="This team may have been deleted or you don't have access."
          action={<Button asChild variant="outline"><Link to="/teams"><ArrowLeft className="mr-2 h-4 w-4" />Back to teams</Link></Button>}
        />
      </Section>
    );
  }
  const t = teamQ.data;

  return (
    <>
      <PageHeader
        eyebrow={t.hackathon?.title ?? "Hackathon"}
        title={t.name}
        description={t.tagline ?? "Manage members, invitations, and submission."}
      >
        <Button asChild variant="outline">
          <Link to="/teams/$teamId/submission" params={{ teamId }}>Go to submission</Link>
        </Button>
      </PageHeader>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left: members & invitations */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold">Members</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeMembers.length} / {maxSize} active
                    </p>
                  </div>
                  <Badge variant={t.is_locked ? "destructive" : "outline"}>
                    {t.is_locked ? "Locked" : "Open to changes"}
                  </Badge>
                </div>

                {membersQ.isLoading ? (
                  <div className="mt-4 space-y-2">{[0, 1].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {activeMembers.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={m.profile?.avatar_url ?? undefined} />
                            <AvatarFallback>{(m.profile?.full_name ?? "U").slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {m.profile?.full_name ?? m.profile?.username ?? "Team member"}
                              {m.user_id === t.leader_id && (
                                <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />
                              )}
                            </p>
                            {m.profile?.username && <p className="text-xs text-muted-foreground">@{m.profile.username}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLeader && m.user_id !== user?.id && !t.is_locked && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost"><Crown className="mr-1 h-3.5 w-3.5" />Make leader</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Transfer ownership?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      You'll become a regular member and this person becomes the leader.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => transfer.mutate(m.user_id)}>Transfer</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button size="sm" variant="ghost" onClick={() => kick.mutate(m.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {(invitedMembers.length > 0 || pendingInvites.length > 0) && (
                  <>
                    <Separator className="my-4" />
                    <h4 className="text-sm font-semibold">Pending invitations</h4>
                    <ul className="mt-2 divide-y divide-border">
                      {invitedMembers.map((m) => (
                        <li key={m.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="truncate">
                            <Mail className="mr-2 inline h-3.5 w-3.5 text-muted-foreground" />
                            {m.invited_email ?? m.profile?.username ?? "Invited user"}
                          </span>
                          {isLeader && (
                            <Button size="sm" variant="ghost" onClick={() => kick.mutate(m.id)}>
                              Revoke
                            </Button>
                          )}
                        </li>
                      ))}
                      {pendingInvites.map((i) => (
                        <li key={i.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span className="truncate">
                            <Mail className="mr-2 inline h-3.5 w-3.5 text-muted-foreground" />
                            {i.email}
                          </span>
                          {isLeader && (
                            <Button size="sm" variant="ghost" onClick={() => revokeInv.mutate(i.id)}>Revoke</Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>

            {isLeader && !t.is_locked && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-display text-lg font-semibold">Invite a teammate</h3>
                  <p className="text-sm text-muted-foreground">By email. Registered users will see an invite instantly.</p>
                  <form
                    className="mt-4 flex flex-col gap-2 sm:flex-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!canInviteMore) return toast.error(`Team is at max size (${maxSize})`);
                      invite.mutate();
                    }}
                  >
                    <Input
                      type="email"
                      required
                      placeholder="teammate@campus.edu"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                    <Button type="submit" disabled={invite.isPending || !canInviteMore}>
                      <UserPlus className="mr-2 h-4 w-4" /> {invite.isPending ? "Sending…" : "Invite"}
                    </Button>
                  </form>
                  {!canInviteMore && (
                    <p className="mt-2 text-xs text-muted-foreground">Team has reached the maximum size.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: team settings */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold">Team invite code</h3>
                <p className="mt-1 text-sm text-muted-foreground">Share with teammates when open joining is on.</p>
                <div className="mt-3 flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 font-mono text-sm">{t.invite_code}</code>
                  <Button size="icon" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(t.invite_code);
                    toast.success("Copied");
                  }}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {isLeader && (
                  <>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2"><Globe className="h-4 w-4" /> Open joining</Label>
                        <p className="text-xs text-muted-foreground">Anyone with the code can join.</p>
                      </div>
                      <Switch checked={t.is_open} onCheckedChange={(v) => toggleOpen.mutate(v)} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <Label className="flex items-center gap-2"><Lock className="h-4 w-4" /> Lock team</Label>
                        <p className="text-xs text-muted-foreground">Freeze members and invitations.</p>
                      </div>
                      <Switch checked={t.is_locked} onCheckedChange={(v) => toggleLock.mutate(v)} />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-semibold">Danger zone</h3>
                <div className="mt-3 space-y-2">
                  {!isLeader && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="w-full"><LogOut className="mr-2 h-4 w-4" />Leave team</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Leave team?</AlertDialogTitle>
                          <AlertDialogDescription>You'll be removed from this team immediately.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => leave.mutate()}>Leave</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {isLeader && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full"><Trash2 className="mr-2 h-4 w-4" />Delete team</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this team?</AlertDialogTitle>
                          <AlertDialogDescription>
                            All members will be removed and any submission will be deleted. This can't be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => destroy.mutate()}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
