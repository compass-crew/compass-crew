import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { safeInternalLink } from "./notifications";
import type { Database } from "@/integrations/supabase/types";

export type NotificationType = Database["public"]["Enums"]["notification_type"];

export interface CreateUserNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
  idempotencyKey?: string;
}

export interface CreateAdminNotificationParams {
  title: string;
  body?: string | null;
  category: string;
  priority?: "urgent" | "high" | "normal" | "low";
  link?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  meta?: Record<string, unknown>;
  idempotencyKey?: string;
}

/**
 * Server-side creation of in-app user notifications.
 * Enforces safe internal destination links and duplicate prevention.
 */
export async function createUserNotification(
  params: CreateUserNotificationParams,
): Promise<{ id: string | null; skipped?: boolean }> {
  try {
    const { userId, type, title, body, link, idempotencyKey } = params;

    // Validate internal destination
    const sanitizedLink = link ? safeInternalLink(link) : null;

    // Duplicate check: prevent duplicate notifications within 5 minutes if identical
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabaseAdmin
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("type", type)
      .eq("title", title)
      .gte("created_at", fiveMinutesAgo)
      .maybeSingle();

    if (existing) {
      // Duplicate event detected within cooldown window
      return { id: existing.id, skipped: true };
    }

    const { data, error } = await supabaseAdmin
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title: title.trim(),
        body: body ? body.trim() : null,
        link: sanitizedLink,
        is_read: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Notification Server Error] Failed to create user notification:", error);
      return { id: null };
    }

    return { id: data.id };
  } catch (err) {
    console.error("[Notification Server Error] Exception creating user notification:", err);
    return { id: null };
  }
}

/**
 * Server-side creation of administrative platform alerts.
 * Informs super-admins about high-value events (applications, inquiries, etc.)
 */
export async function createAdminNotification(
  params: CreateAdminNotificationParams,
): Promise<{ id: string | null; skipped?: boolean }> {
  try {
    const {
      title,
      body,
      category,
      priority = "normal",
      link,
      resourceType,
      resourceId,
      meta,
    } = params;

    const sanitizedLink = link ? safeInternalLink(link) : null;

    // Duplicate check: if resource_id & resource_type provided, prevent duplicate alerts
    if (resourceType && resourceId) {
      const { data: existing } = await supabaseAdmin
        .from("admin_notifications")
        .select("id")
        .eq("resource_type", resourceType)
        .eq("resource_id", resourceId)
        .eq("category", category)
        .maybeSingle();

      if (existing) {
        return { id: existing.id, skipped: true };
      }
    }

    const { data, error } = await supabaseAdmin
      .from("admin_notifications")
      .insert({
        title: title.trim(),
        body: body ? body.trim() : null,
        category: category.toLowerCase().trim(),
        priority,
        link: sanitizedLink,
        resource_type: resourceType ?? null,
        resource_id: resourceId ?? null,
        meta: (meta ?? {}) as never,
        is_read: false,
        is_archived: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Notification Server Error] Failed to create admin notification:", error);
      return { id: null };
    }

    return { id: data.id };
  } catch (err) {
    console.error("[Notification Server Error] Exception creating admin notification:", err);
    return { id: null };
  }
}
