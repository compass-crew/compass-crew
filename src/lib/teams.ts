import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type TeamMember = Database["public"]["Tables"]["team_members"]["Row"];
export type TeamInvitation = Database["public"]["Tables"]["team_invitations"]["Row"];

export interface TeamWithHackathon extends Team {
  hackathon?: { id: string; slug: string; title: string; min_team_size: number; max_team_size: number } | null;
}

export interface TeamMemberWithProfile extends TeamMember {
  profile: { id: string; full_name: string | null; username: string | null; avatar_url: string | null } | null;
}

/* ------------------------------- Queries ------------------------------- */

export async function listMyTeams(userId: string): Promise<TeamWithHackathon[]> {
  const { data: memberships, error: mErr } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", userId)
    .eq("status", "active");
  if (mErr) throw mErr;
  const memberTeamIds = (memberships ?? []).map((r) => r.team_id);

  const { data, error } = await supabase
    .from("teams")
    .select("*, hackathon:hackathons(id, slug, title, min_team_size, max_team_size)")
    .or(
      memberTeamIds.length
        ? `leader_id.eq.${userId},id.in.(${memberTeamIds.join(",")})`
        : `leader_id.eq.${userId}`,
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TeamWithHackathon[];
}

export async function getTeam(teamId: string): Promise<TeamWithHackathon | null> {
  const { data, error } = await supabase
    .from("teams")
    .select("*, hackathon:hackathons(id, slug, title, min_team_size, max_team_size)")
    .eq("id", teamId)
    .maybeSingle();
  if (error) throw error;
  return data as TeamWithHackathon | null;
}

export async function listTeamMembers(teamId: string): Promise<TeamMemberWithProfile[]> {
  const { data, error } = await supabase
    .from("team_members")
    .select("*, profile:profiles(id, full_name, username, avatar_url)")
    .eq("team_id", teamId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TeamMemberWithProfile[];
}

export async function listTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", teamId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyPendingInvitations(): Promise<
  (TeamInvitation & { team: { id: string; name: string; hackathon_id: string; hackathon: { title: string; slug: string } | null } | null })[]
> {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("*, team:teams(id, name, hackathon_id, hackathon:hackathons(title, slug))")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as never;
}

/* ------------------------------ Mutations ------------------------------ */

export async function createTeam(input: {
  hackathon_id: string;
  name: string;
  tagline?: string;
  track_id?: string | null;
  is_open?: boolean;
  leader_id: string;
}) {
  const { data, error } = await supabase
    .from("teams")
    .insert({
      hackathon_id: input.hackathon_id,
      name: input.name,
      tagline: input.tagline ?? null,
      track_id: input.track_id ?? null,
      is_open: input.is_open ?? false,
      leader_id: input.leader_id,
    })
    .select()
    .single();
  if (error) throw error;
  // Add leader as active member
  const { error: mErr } = await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: input.leader_id,
    role: "leader",
    status: "active",
  });
  if (mErr) throw mErr;
  return data;
}

export async function updateTeam(teamId: string, patch: Partial<Pick<Team, "name" | "tagline" | "track_id" | "is_open" | "is_locked">>) {
  const { data, error } = await supabase.from("teams").update(patch).eq("id", teamId).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTeam(teamId: string) {
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw error;
}

export async function inviteToTeam(input: { team_id: string; email: string; invited_by: string }) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email");
  // Try to find an existing user
  const { data: existingId } = await supabase.rpc("find_user_id_by_email", { _email: email });
  if (existingId) {
    // Direct membership row
    const { error } = await supabase.from("team_members").insert({
      team_id: input.team_id,
      user_id: existingId,
      role: "member",
      status: "invited",
      invited_by: input.invited_by,
      invited_email: email,
    });
    if (error) {
      if (error.code === "23505") throw new Error("This person is already on the team or was already invited");
      throw error;
    }
    return { kind: "direct" as const, user_id: existingId };
  }
  const { data, error } = await supabase
    .from("team_invitations")
    .insert({ team_id: input.team_id, email, invited_by: input.invited_by })
    .select()
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("This email was already invited");
    throw error;
  }
  return { kind: "pending" as const, invitation: data };
}

export async function acceptDirectInvitation(teamMemberId: string) {
  const { error } = await supabase.from("team_members").update({ status: "active" }).eq("id", teamMemberId);
  if (error) throw error;
}

export async function declineDirectInvitation(teamMemberId: string) {
  const { error } = await supabase.from("team_members").delete().eq("id", teamMemberId);
  if (error) throw error;
}

export async function acceptEmailInvitation(invitationId: string, userId: string) {
  // Load invitation
  const { data: inv, error: invErr } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("id", invitationId)
    .maybeSingle();
  if (invErr) throw invErr;
  if (!inv) throw new Error("Invitation not found");
  if (inv.status !== "pending") throw new Error("Invitation already responded to");
  if (new Date(inv.expires_at).getTime() < Date.now()) throw new Error("Invitation expired");

  // Insert team_members row (idempotent-ish)
  const { error: mErr } = await supabase.from("team_members").insert({
    team_id: inv.team_id,
    user_id: userId,
    role: "member",
    status: "active",
    invited_by: inv.invited_by,
    invited_email: inv.email,
  });
  if (mErr && mErr.code !== "23505") throw mErr;

  const { error: uErr } = await supabase
    .from("team_invitations")
    .update({ status: "accepted", responded_at: new Date().toISOString() })
    .eq("id", invitationId);
  if (uErr) throw uErr;
}

export async function declineEmailInvitation(invitationId: string) {
  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "declined", responded_at: new Date().toISOString() })
    .eq("id", invitationId);
  if (error) throw error;
}

export async function revokeEmailInvitation(invitationId: string) {
  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "revoked", responded_at: new Date().toISOString() })
    .eq("id", invitationId);
  if (error) throw error;
}

export async function leaveTeam(teamId: string, userId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .eq("team_id", teamId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function removeMember(teamMemberId: string) {
  const { error } = await supabase.from("team_members").delete().eq("id", teamMemberId);
  if (error) throw error;
}

export async function transferOwnership(teamId: string, newLeaderId: string, oldLeaderId: string) {
  // Ensure new leader is an active member
  const { data: member, error: qErr } = await supabase
    .from("team_members")
    .select("id, status")
    .eq("team_id", teamId)
    .eq("user_id", newLeaderId)
    .maybeSingle();
  if (qErr) throw qErr;
  if (!member || member.status !== "active") throw new Error("New leader must be an active team member");

  const { error: tErr } = await supabase.from("teams").update({ leader_id: newLeaderId }).eq("id", teamId);
  if (tErr) throw tErr;

  // Downgrade old leader row, promote new leader row
  await supabase.from("team_members").update({ role: "member" }).eq("team_id", teamId).eq("user_id", oldLeaderId);
  await supabase.from("team_members").update({ role: "leader" }).eq("team_id", teamId).eq("user_id", newLeaderId);
}

export async function joinOpenTeam(inviteCode: string, userId: string) {
  const { data: team, error } = await supabase
    .from("teams")
    .select("id, is_open, is_locked, hackathon_id")
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .maybeSingle();
  if (error) throw error;
  if (!team) throw new Error("Invalid invite code");
  if (team.is_locked) throw new Error("This team is locked");
  if (!team.is_open) throw new Error("This team is not open for public joins");

  const { error: mErr } = await supabase.from("team_members").insert({
    team_id: team.id,
    user_id: userId,
    role: "member",
    status: "active",
  });
  if (mErr) {
    if (mErr.code === "23505") throw new Error("You're already on this team");
    throw mErr;
  }
  return team;
}
