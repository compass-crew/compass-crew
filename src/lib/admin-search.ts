import { supabase } from "@/integrations/supabase/client";

export type SearchKind =
  | "user"
  | "hackathon"
  | "event"
  | "blog"
  | "resource"
  | "team"
  | "submission"
  | "sponsor"
  | "partner"
  | "mentor"
  | "judge"
  | "ambassador"
  | "partner_application"
  | "mentor_application"
  | "ambassador_application"
  | "contact_message"
  | "announcement";

export interface SearchHit {
  kind: SearchKind;
  id: string;
  title: string | null;
  subtitle: string | null;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  user: "User",
  hackathon: "Hackathon",
  event: "Event",
  blog: "Blog Post",
  resource: "Resource",
  team: "Team",
  submission: "Submission",
  sponsor: "Sponsor",
  partner: "Partner",
  mentor: "Mentor",
  judge: "Judge",
  ambassador: "Ambassador",
  partner_application: "Partner Application",
  mentor_application: "Mentor Application",
  ambassador_application: "Ambassador Application",
  contact_message: "Contact Message",
  announcement: "Announcement",
};

/** Resolve a hit to the best admin route. */
export function hitHref(hit: SearchHit): string {
  switch (hit.kind) {
    case "user":
      return `/admin/users/${hit.id}`;
    case "hackathon":
      return `/hackathons`;
    case "event":
      return `/admin/site-events/${hit.id}`;
    case "blog":
      return `/admin/blog-posts/${hit.id}`;
    case "resource":
      return `/admin/resources/${hit.id}`;
    case "sponsor":
      return `/admin/sponsors/${hit.id}`;
    case "partner":
      return `/admin/partners/${hit.id}`;
    case "mentor":
      return `/admin/mentors/${hit.id}`;
    case "judge":
      return `/admin/public-judges/${hit.id}`;
    case "ambassador":
      return `/admin/ambassadors/${hit.id}`;
    case "partner_application":
      return `/admin/partner-applications/${hit.id}`;
    case "mentor_application":
      return `/admin/mentor-applications/${hit.id}`;
    case "ambassador_application":
      return `/admin/ambassador-applications/${hit.id}`;
    case "contact_message":
      return `/admin/contact-messages/${hit.id}`;
    case "announcement":
      return `/admin/site-announcements/${hit.id}`;
    case "team":
    case "submission":
    default:
      return `/admin`;
  }
}

export async function globalSearch(q: string): Promise<SearchHit[]> {
  const term = q.trim();
  if (term.length < 1) return [];
  const { data, error } = await supabase.rpc("admin_global_search" as never, {
    _q: term,
    _limit: 6,
  } as never);
  if (error) throw error;
  return (data as unknown as SearchHit[]) ?? [];
}

export interface SecurityOverview {
  total_users: number;
  active_sessions_7d: number;
  suspended_users: number;
  unverified_users: number;
  role_changes_30d: number;
  suspicious_events_7d: number;
  recent_logins: Array<{ id: string; email: string; last_sign_in_at: string; created_at: string }>;
  recent_role_changes: Array<{ id: string; actor_email: string | null; action: string; resource_id: string | null; meta: Record<string, unknown>; created_at: string }>;
  recent_suspensions: Array<{ id: string; actor_email: string | null; action: string; resource_id: string | null; meta: Record<string, unknown>; created_at: string }>;
}

export async function fetchSecurityOverview(): Promise<SecurityOverview> {
  const { data, error } = await supabase.rpc("admin_security_overview" as never);
  if (error) throw error;
  return data as unknown as SecurityOverview;
}

// -----------------------------------------------------------------------------
// Recent searches (localStorage)
// -----------------------------------------------------------------------------
const KEY = "compass-admin-recent-search";
export function readRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, 6) : [];
  } catch {
    return [];
  }
}
export function pushRecentSearch(q: string) {
  if (typeof window === "undefined" || !q.trim()) return;
  const cur = readRecentSearches().filter((s) => s !== q);
  cur.unshift(q);
  window.localStorage.setItem(KEY, JSON.stringify(cur.slice(0, 6)));
}
