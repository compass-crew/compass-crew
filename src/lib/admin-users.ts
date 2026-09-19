import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/auth/roles";

export interface AdminUserRow {
  id: string;
  email: string;
  joined_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  college: string | null;
  country: string | null;
  suspended_at: string | null;
  suspended_reason: string | null;
  roles: AppRole[];
}

export interface AdminUserListResult {
  total: number;
  items: AdminUserRow[];
}

export async function listAdminUsers(params: {
  search?: string;
  role?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminUserListResult> {
  const { data, error } = await supabase.rpc(
    "admin_list_users" as never,
    {
      _search: params.search?.trim() || null,
      _role: params.role && params.role !== "all" ? params.role : null,
      _status: params.status && params.status !== "all" ? params.status : null,
      _limit: params.limit ?? 25,
      _offset: params.offset ?? 0,
    } as never,
  );

  if (error) {
    console.error("[Admin Users] List query error:", error);
    throw new Error(
      error.message.includes("not authorized")
        ? "Unauthorized access"
        : "Failed to load users list",
    );
  }

  return (data as unknown as AdminUserListResult) ?? { total: 0, items: [] };
}

export interface AdminUserDetail extends AdminUserRow {
  profile: {
    id?: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    bio?: string | null;
    country?: string | null;
    state?: string | null;
    college?: string | null;
    degree?: string | null;
    year_of_study?: string | null;
    branch?: string | null;
    skills?: string[];
    github_url?: string | null;
    linkedin_url?: string | null;
    portfolio_url?: string | null;
    newsletter_opt_in?: boolean;
    created_at?: string;
    updated_at?: string;
  } | null;
  recent_audit: Array<{
    id: string;
    action: string;
    resource_type: string;
    resource_id: string | null;
    created_at: string;
    meta: Record<string, unknown>;
  }>;
}

export async function getAdminUser(userId: string): Promise<AdminUserDetail | null> {
  const { data, error } = await supabase.rpc(
    "admin_get_user" as never,
    {
      _user_id: userId,
    } as never,
  );

  if (error) {
    console.error("[Admin Users] Get user error:", error);
    throw new Error(
      error.message.includes("not authorized")
        ? "Unauthorized access"
        : "Failed to load user details",
    );
  }

  return (data as unknown as AdminUserDetail) ?? null;
}

export interface UserParticipationData {
  registrations: Array<{
    id: string;
    status: string;
    created_at: string;
    hackathons: { id: string; title: string; slug: string } | null;
  }>;
  certificates: Array<{
    id: string;
    title: string;
    type: string;
    recipient_name: string;
    issued_at: string;
    hackathons: { title: string } | null;
  }>;
  teams: Array<{
    id: string;
    role: string;
    created_at: string;
    teams: { id: string; name: string } | null;
  }>;
}

export async function getAdminUserParticipation(userId: string): Promise<UserParticipationData> {
  const [regsRes, certsRes, teamsRes] = await Promise.all([
    supabase
      .from("registrations")
      .select("id, status, created_at, hackathons(id, title, slug)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("certificates")
      .select("id, recipient_name, type, issued_at, title, hackathons(title)")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false })
      .limit(20),
    supabase
      .from("team_members")
      .select("id, role, created_at, teams(id, name)")
      .eq("user_id", userId)
      .limit(20),
  ]);

  return {
    registrations: (regsRes.data as unknown as UserParticipationData["registrations"]) ?? [],
    certificates: (certsRes.data as unknown as UserParticipationData["certificates"]) ?? [],
    teams: (teamsRes.data as unknown as UserParticipationData["teams"]) ?? [],
  };
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
  reason?: string,
): Promise<void> {
  const { error } = await supabase.rpc(
    "admin_set_user_suspended" as never,
    {
      _user_id: userId,
      _suspended: suspended,
      _reason: reason ?? null,
    } as never,
  );

  if (error) {
    console.error("[Admin Users] Suspend error:", error);
    throw new Error(error.message);
  }
}

export async function setUserRole(userId: string, role: string, grant: boolean): Promise<void> {
  // Client-side and server-side safeguard against removing the only remaining super_admin
  if (role === "super_admin" && !grant) {
    const { count, error: countErr } = await supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin");

    if (countErr) {
      throw new Error("Unable to verify administrator count. Action aborted.");
    }

    if ((count ?? 0) <= 1) {
      throw new Error(
        "Cannot revoke Super Admin role: The platform must maintain at least one active administrator.",
      );
    }
  }

  const { error } = await supabase.rpc(
    "admin_set_user_role" as never,
    {
      _user_id: userId,
      _role: role,
      _grant: grant,
    } as never,
  );

  if (error) {
    console.error("[Admin Users] Set role error:", error);
    throw new Error(error.message);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

export async function updateAdminUserProfile(
  userId: string,
  data: {
    full_name?: string | null;
    bio?: string | null;
    college?: string | null;
    country?: string | null;
  },
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: data.full_name,
      bio: data.bio,
      college: data.college,
      country: data.country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[Admin Users] Profile update error:", error);
    throw new Error(error.message);
  }
}
