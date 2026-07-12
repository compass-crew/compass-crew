import { supabase } from "@/integrations/supabase/client";

// ------------------------------------------------------------------
// Analytics
// ------------------------------------------------------------------
export interface AnalyticsTotals {
  total_users: number;
  verified_users: number;
  active_users_30d: number;
  new_users_7d: number;
  new_users_30d: number;
  hackathons: number;
  active_hackathons: number;
  registrations: number;
  teams: number;
  submissions: number;
  judges: number;
  mentors: number;
  ambassadors: number;
  certificates: number;
  blog_posts: number;
  resources: number;
  events: number;
  newsletter_subscribers: number;
  contact_messages: number;
  partner_applications: number;
  mentor_applications: number;
  ambassador_applications: number;
  sponsors: number;
}

export interface SeriesPoint {
  day: string;
  count: number;
}

export interface CertDistPoint {
  type: string;
  count: number;
}

export interface AnalyticsPayload {
  totals: AnalyticsTotals;
  user_growth: SeriesPoint[];
  registration_growth: SeriesPoint[];
  submission_growth: SeriesPoint[];
  certificate_distribution: CertDistPoint[];
}

export async function fetchAnalytics(): Promise<AnalyticsPayload> {
  const { data, error } = await supabase.rpc("get_admin_analytics" as never);
  if (error) throw error;
  return data as unknown as AnalyticsPayload;
}

// ------------------------------------------------------------------
// Activity
// ------------------------------------------------------------------
export type ActivityKind =
  | "registration"
  | "team"
  | "submission"
  | "certificate"
  | "audit";

export interface ActivityItem {
  kind: ActivityKind;
  at: string;
  title: string;
  ref: string | null;
}

export async function fetchActivity(limit = 50): Promise<ActivityItem[]> {
  const { data, error } = await supabase.rpc("get_admin_activity" as never, {
    _limit: limit,
  } as never);
  if (error) throw error;
  return (data as unknown as ActivityItem[]) ?? [];
}

// ------------------------------------------------------------------
// Audit Logs
// ------------------------------------------------------------------
export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilters {
  search?: string;
  actorEmail?: string;
  resourceType?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export async function listAuditLogs(
  filters: AuditFilters = {},
): Promise<{ rows: AuditLog[]; total: number }> {
  const {
    search,
    actorEmail,
    resourceType,
    from,
    to,
    page = 1,
    pageSize = 50,
  } = filters;
  let q = supabase
    .from("audit_logs" as never)
    .select("*", { count: "exact" });
  if (search && search.trim()) {
    const term = search.trim().replace(/[%,]/g, "");
    q = q.or(
      `action.ilike.%${term}%,resource_type.ilike.%${term}%,resource_id.ilike.%${term}%,actor_email.ilike.%${term}%`,
    );
  }
  if (actorEmail && actorEmail.trim()) {
    q = q.ilike("actor_email", `%${actorEmail.trim()}%`);
  }
  if (resourceType && resourceType.trim()) {
    q = q.eq("resource_type", resourceType.trim());
  }
  if (from) q = q.gte("created_at", from);
  if (to) q = q.lte("created_at", to);
  q = q.order("created_at", { ascending: false });
  const start = (page - 1) * pageSize;
  const { data, error, count } = await q.range(start, start + pageSize - 1);
  if (error) throw error;
  return {
    rows: (data as unknown as AuditLog[]) ?? [],
    total: count ?? 0,
  };
}

// ------------------------------------------------------------------
// Admin Notifications
// ------------------------------------------------------------------
export interface AdminNotification {
  id: string;
  category: string;
  priority: string;
  title: string;
  body: string | null;
  resource_type: string | null;
  resource_id: string | null;
  link: string | null;
  is_read: boolean;
  is_archived: boolean;
  meta: Record<string, unknown>;
  created_at: string;
}

export async function listAdminNotifications(
  filter: "unread" | "read" | "archived" | "all" = "all",
  category?: string,
): Promise<AdminNotification[]> {
  let q = supabase
    .from("admin_notifications" as never)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "unread") q = q.eq("is_read", false).eq("is_archived", false);
  else if (filter === "read") q = q.eq("is_read", true).eq("is_archived", false);
  else if (filter === "archived") q = q.eq("is_archived", true);
  if (category && category !== "all") q = q.eq("category", category);
  const { data, error } = await q;
  if (error) throw error;
  return (data as unknown as AdminNotification[]) ?? [];
}

export async function markAdminNotificationRead(id: string, read = true) {
  const { error } = await supabase
    .from("admin_notifications" as never)
    .update({ is_read: read } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function markAllAdminNotificationsRead() {
  const { error } = await supabase
    .from("admin_notifications" as never)
    .update({ is_read: true } as never)
    .eq("is_read", false);
  if (error) throw error;
}

export async function archiveAdminNotification(id: string, archived = true) {
  const { error } = await supabase
    .from("admin_notifications" as never)
    .update({ is_archived: archived, is_read: true } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function deleteAdminNotification(id: string) {
  const { error } = await supabase
    .from("admin_notifications" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// System Health
// ------------------------------------------------------------------
export interface HealthReport {
  database: { ok: boolean; latencyMs: number | null; error?: string };
  auth: { ok: boolean; signedIn: boolean; error?: string };
  storage: {
    ok: boolean;
    buckets: { name: string; ok: boolean; error?: string }[];
  };
  recentErrors: AuditLog[];
  env: {
    supabaseUrl: boolean;
    supabaseKey: boolean;
  };
  checkedAt: string;
}

export async function fetchHealthReport(): Promise<HealthReport> {
  const checkedAt = new Date().toISOString();
  const started = performance.now();
  const dbResult = await supabase
    .from("audit_logs" as never)
    .select("id", { count: "exact", head: true })
    .limit(1);
  const latencyMs = Math.round(performance.now() - started);
  const database = dbResult.error
    ? { ok: false, latencyMs, error: dbResult.error.message }
    : { ok: true, latencyMs };

  const authRes = await supabase.auth.getUser();
  const auth = authRes.error
    ? { ok: false, signedIn: false, error: authRes.error.message }
    : { ok: true, signedIn: !!authRes.data.user };

  const buckets: { name: string; ok: boolean; error?: string }[] = [];
  for (const name of ["cms-media", "certificates"]) {
    const { error } = await supabase.storage.from(name).list("", { limit: 1 });
    buckets.push(
      error ? { name, ok: false, error: error.message } : { name, ok: true },
    );
  }
  const storage = { ok: buckets.every((b) => b.ok), buckets };

  let recentErrors: AuditLog[] = [];
  try {
    const { data } = await supabase
      .from("audit_logs" as never)
      .select("*")
      .ilike("action", "%error%")
      .order("created_at", { ascending: false })
      .limit(10);
    recentErrors = (data as unknown as AuditLog[]) ?? [];
  } catch {
    recentErrors = [];
  }

  return {
    database,
    auth,
    storage,
    recentErrors,
    env: {
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    checkedAt,
  };
}
