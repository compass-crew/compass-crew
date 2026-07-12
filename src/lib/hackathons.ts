import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Hackathon = Database["public"]["Tables"]["hackathons"]["Row"];
export type HackathonInsert = Database["public"]["Tables"]["hackathons"]["Insert"];
export type HackathonTrack = Database["public"]["Tables"]["hackathon_tracks"]["Row"];
export type ScoringCriterion = Database["public"]["Tables"]["scoring_criteria"]["Row"];
export type HackathonStatus = Database["public"]["Enums"]["hackathon_status"];
export type HackathonMode = Database["public"]["Enums"]["hackathon_mode"];

export const HACKATHON_STATUS_LABEL: Record<HackathonStatus, string> = {
  draft: "Draft",
  published: "Published",
  registrations_open: "Registrations Open",
  ongoing: "Ongoing",
  judging: "Judging",
  completed: "Completed",
  archived: "Archived",
};

export const HACKATHON_MODE_LABEL: Record<HackathonMode, string> = {
  online: "Online",
  hybrid: "Hybrid",
  in_person: "In-person",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return "Dates TBA";
  const s = start ? new Date(start) : null;
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (s && e) return `${fmt(s)} — ${fmt(e)}`;
  if (s) return `From ${fmt(s)}`;
  return `Until ${fmt(e!)}`;
}

// -------------------- QUERIES (client-side; RLS enforces access) --------------------

export async function listPublicHackathons() {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .neq("status", "draft")
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getHackathonBySlug(slug: string) {
  const { data, error } = await supabase.from("hackathons").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listHackathonTracks(hackathonId: string) {
  const { data, error } = await supabase
    .from("hackathon_tracks")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listScoringCriteria(hackathonId: string) {
  const { data, error } = await supabase
    .from("scoring_criteria")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listMyHackathons(userId: string) {
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listMyRegistrations(userId: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("*, hackathon:hackathons(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function registerForHackathon(hackathonId: string, userId: string, motivation?: string) {
  const { data, error } = await supabase
    .from("registrations")
    .insert({ hackathon_id: hackathonId, user_id: userId, status: "approved", motivation: motivation ?? null })
    .select()
    .single();
  if (error) throw error;
  return data;
}
