import { supabase } from "@/integrations/supabase/client";

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
  roles: string[];
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
  const { data, error } = await supabase.rpc("admin_list_users" as never, {
    _search: params.search ?? null,
    _role: params.role ?? null,
    _status: params.status ?? null,
    _limit: params.limit ?? 50,
    _offset: params.offset ?? 0,
  } as never);
  if (error) throw error;
  return (data as unknown as AdminUserListResult) ?? { total: 0, items: [] };
}

export interface AdminUserDetail extends AdminUserRow {
  profile: Record<string, unknown> | null;
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
  const { data, error } = await supabase.rpc("admin_get_user" as never, {
    _user_id: userId,
  } as never);
  if (error) throw error;
  return (data as unknown as AdminUserDetail) ?? null;
}

export async function setUserSuspended(userId: string, suspended: boolean, reason?: string): Promise<void> {
  const { error } = await supabase.rpc("admin_set_user_suspended" as never, {
    _user_id: userId,
    _suspended: suspended,
    _reason: reason ?? null,
  } as never);
  if (error) throw error;
}

export async function setUserRole(userId: string, role: string, grant: boolean): Promise<void> {
  const { error } = await supabase.rpc("admin_set_user_role" as never, {
    _user_id: userId,
    _role: role,
    _grant: grant,
  } as never);
  if (error) throw error;
}

export async function sendPasswordReset(email: string): Promise<void> {
  const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}
