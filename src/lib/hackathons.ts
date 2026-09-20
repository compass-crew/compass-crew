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
  completed: "Past",
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
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (s && e) return `${fmt(s)} — ${fmt(e)}`;
  if (s) return `From ${fmt(s)}`;
  return `Until ${fmt(e!)}`;
}

// -------------------- CANONICAL HISTORICAL CHALLENGES --------------------

export const HISTORICAL_AI_CHALLENGE_2026: Hackathon = {
  id: "a1000000-0000-0000-0000-000000002026",
  slug: "compass-crew-ai-innovation-challenge-2026",
  title: "Compass Crew AI Innovation Challenge 2026",
  tagline:
    "A nationwide challenge empowering student innovators to turn real-world ideas into working AI prototypes.",
  description:
    "The Compass Crew AI Innovation Challenge 2026 was a premier national competition organized by Compass Crew in collaboration with Unstop, bringing together undergraduate and postgraduate student builders from across India to solve high-impact challenges using artificial intelligence and emerging technologies.\n\n" +
    "Key Event Structure:\n" +
    "• Round 1: Registration & Idea Submission\n" +
    "• Round 2: Submission & Working Prototype (GitHub repo, README, pitch deck PPT/PDF, 3–5 minute video demo, and live deployment link)\n\n" +
    "Evaluation Dimensions:\n" +
    "1. Innovation & Originality\n" +
    "2. Technical Implementation\n" +
    "3. AI Usage & Model Integration\n" +
    "4. Feasibility & Scalability\n" +
    "5. User Experience & Design\n" +
    "6. Presentation & Video Pitch",
  theme: "AI & Emerging Technologies across Education, Healthcare, Business, and Open Innovation",
  mode: "online",
  status: "completed",
  eligibility:
    "Open to undergraduate and postgraduate students across India from recognized colleges and universities. Participants from diverse academic backgrounds, freshers, and experienced developers welcomed.",
  rules:
    "1. Team size: 1–5 members (both individual and team participation allowed).\n" +
    "2. Inter-college and inter-specialization teams permitted.\n" +
    "3. Team changes after the registration deadline require organizer approval.\n" +
    "4. Round 2 submission deliverables: GitHub repository with detailed README, pitch deck (PPT/PDF), 3–5 minute demo video, and live deployment link.",
  min_team_size: 1,
  max_team_size: 5,
  registration_opens_at: "2026-06-15T00:00:00.000Z",
  registration_closes_at: "2026-07-28T18:29:00.000Z", // 28 July 2026, 11:59 PM IST
  starts_at: "2026-07-20T00:00:00.000Z",
  ends_at: "2026-07-31T18:29:00.000Z",
  submission_deadline: "2026-07-30T18:29:00.000Z",
  results_at: "2026-08-05T00:00:00.000Z",
  results_published_at: "2026-08-05T00:00:00.000Z",
  external_url:
    "https://unstop.com/p/compass-crew-ai-innovation-challenge-2026-compass-crew-1715679",
  banner_url: null,
  is_featured: false,
  leaderboard_frozen: true,
  location: "India (Unstop Platform)",
  prizes: [
    {
      title: "National Recognition & Certificates",
      amount: "Certificates for all valid submissions",
    },
    {
      title: "Mentorship & Network Access",
      amount: "Direct connection with industry mentors and student builders",
    },
  ],
  faqs: [
    {
      q: "Who was eligible to participate?",
      a: "Undergraduate and postgraduate students enrolled in recognized colleges and universities across India from any discipline.",
    },
    {
      q: "What were the team formation rules?",
      a: "Teams of 1 to 5 members were allowed. Individual participation, inter-college, and cross-discipline teams were fully permitted.",
    },
    {
      q: "What were the Round 2 deliverables?",
      a: "Round 2 required a GitHub repository with comprehensive README, pitch deck (PPT/PDF), a 3–5 minute video demonstration, and a working deployment link.",
    },
    {
      q: "Where was the competition administered?",
      a: "The challenge was hosted through Unstop at https://unstop.com/p/compass-crew-ai-innovation-challenge-2026-compass-crew-1715679.",
    },
  ],
  resources_content: [],
  sponsors_content: [],
  created_at: "2026-06-15T00:00:00.000Z",
  created_by: "compass-crew-admin",
  updated_at: "2026-08-05T00:00:00.000Z",
};

export const HISTORICAL_AI_CHALLENGE_TRACKS: HackathonTrack[] = [
  {
    id: "track-1-prod-edu",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Productivity & Education",
    description:
      "AI tools, learning assistants, automated synthesis, and academic workflows for students and educators.",
    sort_order: 1,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "track-2-health-social",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Healthcare & Social Impact",
    description:
      "Accessibility, patient assistance, diagnostics support, community health, and social welfare solutions.",
    sort_order: 2,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "track-3-biz-finance",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "AI for Business & Finance",
    description:
      "Operations automation, micro-business finance, smart auditing, and fraud prevention using intelligent models.",
    sort_order: 3,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "track-4-open-innovation",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Open Innovation Challenge",
    description:
      "Novel applications of generative AI, multi-agent systems, multimodal reasoning, and open-source models.",
    sort_order: 4,
    created_at: "2026-06-15T00:00:00.000Z",
  },
];

export const HISTORICAL_AI_CHALLENGE_CRITERIA: ScoringCriterion[] = [
  {
    id: "crit-1",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Innovation & Originality",
    description: "Novelty of approach and problem formulation.",
    weight: 20,
    max_score: 10,
    sort_order: 1,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "crit-2",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Technical Implementation",
    description: "Code quality, architecture robustness, and engineering craft.",
    weight: 20,
    max_score: 10,
    sort_order: 2,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "crit-3",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "AI Usage & Depth",
    description: "Appropriateness and depth of artificial intelligence integration.",
    weight: 20,
    max_score: 10,
    sort_order: 3,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "crit-4",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Feasibility & Scalability",
    description: "Practical viability and roadmap for real-world adoption.",
    weight: 15,
    max_score: 10,
    sort_order: 4,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "crit-5",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "UX & Product Polish",
    description: "Design clarity, intuitiveness, and attention to user experience.",
    weight: 15,
    max_score: 10,
    sort_order: 5,
    created_at: "2026-06-15T00:00:00.000Z",
  },
  {
    id: "crit-6",
    hackathon_id: "a1000000-0000-0000-0000-000000002026",
    name: "Presentation & Demo",
    description: "Clarity of documentation, pitch deck, and video demo.",
    weight: 10,
    max_score: 10,
    sort_order: 6,
    created_at: "2026-06-15T00:00:00.000Z",
  },
];

// -------------------- QUERIES (client-side; RLS enforces access) --------------------

export async function listPublicHackathons(): Promise<Hackathon[]> {
  try {
    const { data, error } = await supabase
      .from("hackathons")
      .select("*")
      .neq("status", "draft")
      .neq("status", "archived")
      .order("starts_at", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const dbList = data ?? [];
    const hasChallenge = dbList.some((h) => h.slug === HISTORICAL_AI_CHALLENGE_2026.slug);
    if (!hasChallenge) {
      return [...dbList, HISTORICAL_AI_CHALLENGE_2026];
    }
    return dbList;
  } catch {
    return [HISTORICAL_AI_CHALLENGE_2026];
  }
}

export async function getHackathonBySlug(slug: string): Promise<Hackathon | null> {
  if (slug === HISTORICAL_AI_CHALLENGE_2026.slug) {
    try {
      const { data } = await supabase.from("hackathons").select("*").eq("slug", slug).maybeSingle();
      if (data) return data;
    } catch {
      // Fall through
    }
    return HISTORICAL_AI_CHALLENGE_2026;
  }
  const { data, error } = await supabase
    .from("hackathons")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listHackathonTracks(hackathonId: string): Promise<HackathonTrack[]> {
  if (hackathonId === HISTORICAL_AI_CHALLENGE_2026.id) {
    try {
      const { data } = await supabase
        .from("hackathon_tracks")
        .select("*")
        .eq("hackathon_id", hackathonId)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) return data;
    } catch {
      // Fall through
    }
    return HISTORICAL_AI_CHALLENGE_TRACKS;
  }
  const { data, error } = await supabase
    .from("hackathon_tracks")
    .select("*")
    .eq("hackathon_id", hackathonId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listScoringCriteria(hackathonId: string): Promise<ScoringCriterion[]> {
  if (hackathonId === HISTORICAL_AI_CHALLENGE_2026.id) {
    try {
      const { data } = await supabase
        .from("scoring_criteria")
        .select("*")
        .eq("hackathon_id", hackathonId)
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) return data;
    } catch {
      // Fall through
    }
    return HISTORICAL_AI_CHALLENGE_CRITERIA;
  }
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

export async function registerForHackathon(
  hackathonId: string,
  userId: string,
  motivation?: string,
) {
  const { data, error } = await supabase
    .from("registrations")
    .insert({
      hackathon_id: hackathonId,
      user_id: userId,
      status: "approved",
      motivation: motivation ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
