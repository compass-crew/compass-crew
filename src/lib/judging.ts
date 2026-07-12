import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type Score = Database["public"]["Tables"]["scores"]["Row"];
export type ScoringCriterion = Database["public"]["Tables"]["scoring_criteria"]["Row"];

export interface JudgeHackathon {
  id: string;
  title: string;
  slug: string;
  status: Database["public"]["Enums"]["hackathon_status"];
  starts_at: string | null;
  ends_at: string | null;
  submission_count: number;
  scored_count: number;
}

/** All hackathons a judge is assigned to (assignment.submission_id may be null = hackathon-wide). */
export async function listJudgeHackathons(judgeId: string): Promise<JudgeHackathon[]> {
  const { data: assignments, error } = await supabase
    .from("judge_assignments")
    .select("hackathon_id")
    .eq("judge_id", judgeId);
  if (error) throw error;
  const ids = Array.from(new Set((assignments ?? []).map((a) => a.hackathon_id)));
  if (!ids.length) return [];

  const { data: hacks, error: hErr } = await supabase
    .from("hackathons")
    .select("id, title, slug, status, starts_at, ends_at")
    .in("id", ids);
  if (hErr) throw hErr;

  // For each hackathon, count submissions I can judge & scores I've submitted (finalized)
  const results: JudgeHackathon[] = [];
  for (const h of hacks ?? []) {
    const [subs, myScores] = await Promise.all([
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("hackathon_id", h.id).eq("status", "submitted"),
      supabase.from("scores").select("submission_id").eq("judge_id", judgeId).eq("is_final", true),
    ]);
    const subIds = new Set<string>();
    // subs count returns count only; we don't have submission ids here. For scored_count we count distinct submitted subs I've finalized.
    const { data: allSubs } = await supabase
      .from("submissions")
      .select("id")
      .eq("hackathon_id", h.id)
      .eq("status", "submitted");
    (allSubs ?? []).forEach((s) => subIds.add(s.id));
    const scored = (myScores.data ?? []).filter((s) => subIds.has(s.submission_id));
    const distinctScored = new Set(scored.map((s) => s.submission_id));
    results.push({
      ...h,
      submission_count: subs.count ?? 0,
      scored_count: distinctScored.size,
    });
  }
  return results;
}

/** Submissions a judge can score for a hackathon (RLS enforces access). */
export async function listJudgeSubmissions(hackathonId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, team:teams(id, name), track:hackathon_tracks(id, name)")
    .eq("hackathon_id", hackathonId)
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getSubmissionForJudge(submissionId: string) {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, team:teams(id, name, hackathon_id), track:hackathon_tracks(id, name)")
    .eq("id", submissionId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listTeamMembers(teamId: string) {
  const { data, error } = await supabase
    .from("team_members")
    .select("user_id, role, status")
    .eq("team_id", teamId)
    .eq("status", "active");
  if (error) throw error;
  const rows = data ?? [];
  if (!rows.length) return [];
  const { data: profs } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, college")
    .in("id", rows.map((r) => r.user_id));
  const map = new Map((profs ?? []).map((p) => [p.id, p]));
  return rows.map((r) => ({ ...r, profile: map.get(r.user_id) ?? null }));
}

export async function getMyScores(submissionId: string, judgeId: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("submission_id", submissionId)
    .eq("judge_id", judgeId);
  if (error) throw error;
  return data ?? [];
}

export async function saveDraftScores(input: {
  submission_id: string;
  judge_id: string;
  entries: { criterion_id: string; score: number; comment: string }[];
}) {
  const payload = input.entries.map((e) => ({
    submission_id: input.submission_id,
    judge_id: input.judge_id,
    criterion_id: e.criterion_id,
    score: e.score,
    comment: e.comment || null,
    is_final: false,
  }));
  const { error } = await supabase
    .from("scores")
    .upsert(payload, { onConflict: "submission_id,judge_id,criterion_id" });
  if (error) throw error;
}

export async function finalizeScores(input: {
  submission_id: string;
  judge_id: string;
  entries: { criterion_id: string; score: number; comment: string }[];
}) {
  const payload = input.entries.map((e) => ({
    submission_id: input.submission_id,
    judge_id: input.judge_id,
    criterion_id: e.criterion_id,
    score: e.score,
    comment: e.comment || null,
    is_final: true,
  }));
  const { error } = await supabase
    .from("scores")
    .upsert(payload, { onConflict: "submission_id,judge_id,criterion_id" });
  if (error) throw error;
}

export function computeWeighted(
  entries: { criterion_id: string; score: number }[],
  criteria: ScoringCriterion[],
): number {
  const byId = new Map(criteria.map((c) => [c.id, c]));
  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight), 0) || 1;
  let sum = 0;
  for (const e of entries) {
    const c = byId.get(e.criterion_id);
    if (!c) continue;
    const norm = (e.score / Number(c.max_score)) * Number(c.weight);
    sum += norm;
  }
  return Math.round((sum / totalWeight) * 10000) / 100; // 0-100 with 2 decimals
}
