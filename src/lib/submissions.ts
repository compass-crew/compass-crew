import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Submission = Database["public"]["Tables"]["submissions"]["Row"];
export type SubmissionUpdate = Database["public"]["Tables"]["submissions"]["Update"];
export type SubmissionInsert = Database["public"]["Tables"]["submissions"]["Insert"];

export async function getTeamSubmission(teamId: string): Promise<Submission | null> {
  const { data, error } = await supabase.from("submissions").select("*").eq("team_id", teamId).maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDraft(input: {
  team_id: string;
  hackathon_id: string;
  patch: Partial<Submission>;
}): Promise<Submission> {
  const existing = await getTeamSubmission(input.team_id);
  if (existing) {
    if (existing.status === "submitted") return existing;
    const { data, error } = await supabase
      .from("submissions")
      .update({ ...input.patch })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const insertPayload: SubmissionInsert = {
    team_id: input.team_id,
    hackathon_id: input.hackathon_id,
    name: (input.patch.name as string) ?? "Untitled project",
    status: "draft",
    ...input.patch,
  };
  const { data, error } = await supabase.from("submissions").insert(insertPayload).select().single();
  if (error) throw error;
  return data;
}

export async function submitFinal(submissionId: string): Promise<Submission> {
  const { data, error } = await supabase
    .from("submissions")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", submissionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function withdrawSubmission(submissionId: string): Promise<Submission> {
  const { data, error } = await supabase
    .from("submissions")
    .update({ status: "draft", submitted_at: null })
    .eq("id", submissionId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Basic URL validation
export function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateForFinalSubmit(s: Partial<Submission>): string | null {
  if (!s.name?.trim()) return "Project name is required";
  if (!s.tagline?.trim()) return "Short tagline is required";
  if (!s.description?.trim()) return "Description is required";
  if (!s.problem_statement?.trim()) return "Problem statement is required";
  if (!s.solution?.trim()) return "Solution is required";
  if (!s.github_url?.trim()) return "GitHub repository URL is required";
  if (!isValidUrl(s.github_url)) return "GitHub URL is invalid";
  if (s.live_url && !isValidUrl(s.live_url)) return "Live demo URL is invalid";
  if (s.video_url && !isValidUrl(s.video_url)) return "Video URL is invalid";
  if (s.presentation_url && !isValidUrl(s.presentation_url)) return "Presentation URL is invalid";
  if (!s.tech_stack || s.tech_stack.length === 0) return "Add at least one technology";
  return null;
}
