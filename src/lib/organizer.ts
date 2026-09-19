import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type HackathonTrack = Database["public"]["Tables"]["hackathon_tracks"]["Row"];
export type ScoringCriterion = Database["public"]["Tables"]["scoring_criteria"]["Row"];
export type Registration = Database["public"]["Tables"]["registrations"]["Row"];
export type JudgeAssignment = Database["public"]["Tables"]["judge_assignments"]["Row"];
export type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export interface RegistrationWithProfile extends Registration {
  profile: {
    id: string;
    full_name: string | null;
    username: string | null;
    college: string | null;
    branch: string | null;
    year_of_study: string | null;
  } | null;
}

/* -------- Tracks -------- */
export async function upsertTrack(input: {
  id?: string;
  hackathon_id: string;
  name: string;
  description?: string | null;
  sort_order?: number;
}) {
  if (input.id) {
    const { data, error } = await supabase
      .from("hackathon_tracks")
      .update({
        name: input.name,
        description: input.description ?? null,
        sort_order: input.sort_order ?? 0,
      })
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("hackathon_tracks")
    .insert({
      hackathon_id: input.hackathon_id,
      name: input.name,
      description: input.description ?? null,
      sort_order: input.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteTrack(id: string) {
  const { error } = await supabase.from("hackathon_tracks").delete().eq("id", id);
  if (error) throw error;
}

/* -------- Criteria -------- */
export async function upsertCriterion(input: {
  id?: string;
  hackathon_id: string;
  name: string;
  description?: string | null;
  max_score: number;
  weight: number;
  sort_order?: number;
}) {
  const payload = {
    name: input.name,
    description: input.description ?? null,
    max_score: input.max_score,
    weight: input.weight,
    sort_order: input.sort_order ?? 0,
  };
  if (input.id) {
    const { data, error } = await supabase
      .from("scoring_criteria")
      .update(payload)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase
    .from("scoring_criteria")
    .insert({ ...payload, hackathon_id: input.hackathon_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteCriterion(id: string) {
  const { error } = await supabase.from("scoring_criteria").delete().eq("id", id);
  if (error) throw error;
}

/* -------- Prizes (stored in hackathons.prizes jsonb) -------- */
export interface Prize {
  id: string;
  title: string;
  amount?: string;
  description?: string;
  rank?: number;
}
export async function savePrizes(hackathonId: string, prizes: Prize[]) {
  const { error } = await supabase
    .from("hackathons")
    .update({ prizes: prizes as never })
    .eq("id", hackathonId);
  if (error) throw error;
}

/* -------- Registrations -------- */
export async function listRegistrations(hackathonId: string): Promise<RegistrationWithProfile[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name, username, college, branch, year_of_study")
    .in(
      "id",
      rows.map((r) => r.user_id),
    );
  const map = new Map((profs ?? []).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
}
export async function updateRegistrationStatus(
  id: string,
  status: Database["public"]["Enums"]["registration_status"],
) {
  const { error } = await supabase.from("registrations").update({ status }).eq("id", id);
  if (error) throw error;
}

/* -------- Judges -------- */
export interface JudgeAssignmentWithProfile extends JudgeAssignment {
  profile: {
    id: string;
    full_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}
export async function listJudgeAssignments(
  hackathonId: string,
): Promise<JudgeAssignmentWithProfile[]> {
  const { data, error } = await supabase
    .from("judge_assignments")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .is("submission_id", null);
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in(
      "id",
      rows.map((r) => r.judge_id),
    );
  const map = new Map((profs ?? []).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, profile: map.get(r.judge_id) ?? null }));
}
export async function assignJudgeByEmail(hackathonId: string, email: string) {
  const { data: userId } = await supabase.rpc("find_user_id_by_email", {
    _email: email.trim().toLowerCase(),
  });
  if (!userId) throw new Error("No user found with that email. Ask them to sign up first.");
  const { error } = await supabase
    .from("judge_assignments")
    .insert({ hackathon_id: hackathonId, judge_id: userId, submission_id: null });
  if (error) {
    if (error.code === "23505") throw new Error("This judge is already assigned");
    throw error;
  }
  // Grant judge role idempotently
  await supabase.from("user_roles").insert({ user_id: userId, role: "judge" });
  return userId;
}
export async function removeJudge(assignmentId: string) {
  const { error } = await supabase.from("judge_assignments").delete().eq("id", assignmentId);
  if (error) throw error;
}

/* -------- Announcements -------- */
export async function listAnnouncements(hackathonId: string) {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export async function createAnnouncement(input: {
  hackathon_id: string;
  author_id: string;
  title: string;
  body: string;
  audience?: Database["public"]["Enums"]["announcement_audience"];
}) {
  const { data, error } = await supabase
    .from("announcements")
    .insert({ ...input })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function deleteAnnouncement(id: string) {
  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) throw error;
}
