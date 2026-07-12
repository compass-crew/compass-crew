import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Submission = Database["public"]["Tables"]["submissions"]["Row"];
type Score = Database["public"]["Tables"]["scores"]["Row"];
type Criterion = Database["public"]["Tables"]["scoring_criteria"]["Row"];

export interface LeaderboardEntry {
  submission_id: string;
  submission: Submission;
  team_name: string | null;
  track_id: string | null;
  track_name: string | null;
  weighted_score: number; // 0-100
  innovation_score: number; // raw avg of "innovation" criterion if present
  judge_count: number;
  submitted_at: string | null;
  rank: number;
}

/** Compute leaderboard for a hackathon using only finalized scores. Tie-break: weighted → innovation → earliest submission. */
export async function computeLeaderboard(hackathonId: string): Promise<LeaderboardEntry[]> {
  const [subsRes, critRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("*, team:teams(name), track:hackathon_tracks(id, name)")
      .eq("hackathon_id", hackathonId)
      .eq("status", "submitted"),
    supabase.from("scoring_criteria").select("*").eq("hackathon_id", hackathonId),
  ]);
  if (subsRes.error) throw subsRes.error;
  if (critRes.error) throw critRes.error;
  const submissions = subsRes.data ?? [];
  const criteria = (critRes.data ?? []) as Criterion[];
  if (!submissions.length) return [];

  const { data: scores, error: sErr } = await supabase
    .from("scores")
    .select("*")
    .in("submission_id", submissions.map((s) => s.id))
    .eq("is_final", true);
  if (sErr) throw sErr;

  return rankSubmissions(submissions as never, criteria, (scores ?? []) as Score[]);
}

export function rankSubmissions(
  submissions: (Submission & { team?: { name: string | null } | null; track?: { id: string; name: string } | null })[],
  criteria: Criterion[],
  scores: Score[],
): LeaderboardEntry[] {
  const critById = new Map(criteria.map((c) => [c.id, c]));
  const totalWeight = criteria.reduce((s, c) => s + Number(c.weight), 0) || 1;
  const innovationCrit = criteria.find((c) => /innovat/i.test(c.name));

  const entries: LeaderboardEntry[] = submissions.map((sub) => {
    const subScores = scores.filter((sc) => sc.submission_id === sub.id);
    // Group by judge
    const byJudge = new Map<string, Score[]>();
    for (const s of subScores) {
      const arr = byJudge.get(s.judge_id) ?? [];
      arr.push(s);
      byJudge.set(s.judge_id, arr);
    }
    let weightedSum = 0;
    let innovationSum = 0;
    let innovationCount = 0;
    for (const [, arr] of byJudge) {
      let jSum = 0;
      for (const e of arr) {
        const c = critById.get(e.criterion_id);
        if (!c) continue;
        const norm = (Number(e.score) / Number(c.max_score)) * Number(c.weight);
        jSum += norm;
        if (innovationCrit && e.criterion_id === innovationCrit.id) {
          innovationSum += Number(e.score);
          innovationCount += 1;
        }
      }
      weightedSum += (jSum / totalWeight) * 100;
    }
    const judgeCount = byJudge.size;
    const weighted = judgeCount > 0 ? weightedSum / judgeCount : 0;
    const innovation = innovationCount > 0 ? innovationSum / innovationCount : 0;

    return {
      submission_id: sub.id,
      submission: sub,
      team_name: sub.team?.name ?? null,
      track_id: sub.track?.id ?? sub.track_id ?? null,
      track_name: sub.track?.name ?? null,
      weighted_score: Math.round(weighted * 100) / 100,
      innovation_score: Math.round(innovation * 100) / 100,
      judge_count: judgeCount,
      submitted_at: sub.submitted_at,
      rank: 0,
    };
  });

  entries.sort((a, b) => {
    if (b.weighted_score !== a.weighted_score) return b.weighted_score - a.weighted_score;
    if (b.innovation_score !== a.innovation_score) return b.innovation_score - a.innovation_score;
    const at = a.submitted_at ? new Date(a.submitted_at).getTime() : Number.POSITIVE_INFINITY;
    const bt = b.submitted_at ? new Date(b.submitted_at).getTime() : Number.POSITIVE_INFINITY;
    return at - bt;
  });
  entries.forEach((e, i) => (e.rank = i + 1));
  return entries;
}

export function groupByTrack(entries: LeaderboardEntry[]): Map<string, LeaderboardEntry[]> {
  const map = new Map<string, LeaderboardEntry[]>();
  for (const e of entries) {
    const key = e.track_name ?? "General";
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }
  // Re-rank within each track
  for (const arr of map.values()) {
    arr.forEach((e, i) => (e.rank = i + 1));
  }
  return map;
}
