import { supabase } from "@/integrations/supabase/client";
import type { ResourceConfig } from "./admin-config";

// Generic admin CRUD helpers. All calls run as the signed-in user (RLS enforces super_admin).

type Row = Record<string, unknown>;

export interface ListParams {
  search?: string;
  filterValue?: string;
  page?: number;
  pageSize?: number;
  includeDeleted?: boolean;
}

export interface ListResult {
  rows: Row[];
  total: number;
}

export async function listRows(res: ResourceConfig, params: ListParams = {}): Promise<ListResult> {
  const { search, filterValue, page = 1, pageSize = 25, includeDeleted = false } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let q = supabase.from(res.table as never).select("*", { count: "exact" });

  if (res.softDelete && !includeDeleted) {
    q = q.is("deleted_at", null);
  }

  if (search && search.trim() && res.searchColumns.length) {
    const term = search.trim().replace(/[%,]/g, "");
    const or = res.searchColumns.map((c) => `${c}.ilike.%${term}%`).join(",");
    q = q.or(or);
  }

  if (filterValue && res.filterField) {
    q = q.eq(res.filterField.name, filterValue);
  }

  if (res.defaultOrder) {
    q = q.order(res.defaultOrder.column, { ascending: res.defaultOrder.ascending });
  } else {
    q = q.order("created_at", { ascending: false });
  }

  const { data, error, count } = await q.range(from, to);
  if (error) throw error;
  return { rows: (data ?? []) as Row[], total: count ?? 0 };
}

export async function getRow(res: ResourceConfig, id: string): Promise<Row | null> {
  const { data, error } = await supabase
    .from(res.table as never)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as Row | null) ?? null;
}

export async function createRow(res: ResourceConfig, values: Row): Promise<Row> {
  const { data: userData } = await supabase.auth.getUser();
  const payload: Row = { ...values };
  if (!("created_by" in payload) && userData.user) {
    payload.created_by = userData.user.id;
  }
  const { data, error } = await supabase
    .from(res.table as never)
    .insert(payload as never)
    .select()
    .single();
  if (error) throw error;
  return data as Row;
}

export async function updateRow(res: ResourceConfig, id: string, values: Row): Promise<Row> {
  const { data, error } = await supabase
    .from(res.table as never)
    .update(values as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Row;
}

export async function softDeleteRow(res: ResourceConfig, id: string): Promise<void> {
  if (!res.softDelete) {
    const { error } = await supabase.from(res.table as never).delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase
    .from(res.table as never)
    .update({ deleted_at: new Date().toISOString() } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function restoreRow(res: ResourceConfig, id: string): Promise<void> {
  if (!res.softDelete) return;
  const { error } = await supabase
    .from(res.table as never)
    .update({ deleted_at: null } as never)
    .eq("id", id);
  if (error) throw error;
}

export async function hardDeleteRow(res: ResourceConfig, id: string): Promise<void> {
  const { error } = await supabase.from(res.table as never).delete().eq("id", id);
  if (error) throw error;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

/** Get counts for all admin tables (used on the admin overview). */
export async function getAdminCounts(): Promise<Record<string, number>> {
  const tables = [
    "cms_homepage_sections",
    "blog_posts",
    "resources",
    "site_events",
    "site_announcements",
    "sponsors",
    "partners",
    "partner_applications",
    "public_judges",
    "mentors",
    "mentor_applications",
    "ambassador_applications",
    "ambassadors",
    "careers",
    "contact_messages",
    "newsletter_subscribers",
  ] as const;
  const results = await Promise.all(
    tables.map(async (t) => {
      const { count } = await supabase.from(t).select("*", { count: "exact", head: true });
      return [t, count ?? 0] as const;
    }),
  );
  return Object.fromEntries(results);
}
