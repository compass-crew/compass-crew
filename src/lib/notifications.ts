import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];

export type NotificationCategoryGroup =
  "all" | "hackathons" | "teams" | "certificates" | "announcements" | "system";

export interface NotificationQueryOptions {
  filter?: "all" | "unread" | "read";
  categoryGroup?: NotificationCategoryGroup;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedNotificationsResult {
  data: Notification[];
  totalCount: number;
  unreadCount: number;
}

/**
 * Validates that an action destination is a safe internal application path.
 * Rejects external URLs, protocol-relative URLs, javascript:, and data: URLs
 * to strictly prevent open redirect vulnerabilities.
 */
export function safeInternalLink(link: string | null | undefined): string | null {
  if (!link || typeof link !== "string") return null;
  const trimmed = link.trim();
  // Must start with a single slash and not double slashes (protocol-relative)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return null;
  // Disallow control characters or newlines
  if (/[\r\n\t]/.test(trimmed)) return null;
  return trimmed;
}

/**
 * Returns a human-friendly category label for a notification type.
 */
export function getNotificationCategory(type: NotificationType): string {
  switch (type) {
    case "registration_approved":
    case "registration_rejected":
      return "Registration";
    case "invite_received":
    case "invite_accepted":
    case "invite_declined":
      return "Teams & Invites";
    case "submission_reminder":
    case "hackathon_started":
    case "results_published":
      return "Hackathon";
    case "certificate_ready":
      return "Certificates";
    case "announcement":
      return "Announcement";
    case "generic":
    default:
      return "Platform";
  }
}

/**
 * Maps a category filter group to matching database enum notification types.
 */
export function getTypesForCategoryGroup(
  group: NotificationCategoryGroup,
): NotificationType[] | null {
  switch (group) {
    case "hackathons":
      return [
        "hackathon_started",
        "results_published",
        "submission_reminder",
        "registration_approved",
        "registration_rejected",
      ];
    case "teams":
      return ["invite_received", "invite_accepted", "invite_declined"];
    case "certificates":
      return ["certificate_ready"];
    case "announcements":
      return ["announcement"];
    case "system":
      return ["generic"];
    case "all":
    default:
      return null;
  }
}

/**
 * Fetch notifications for an authenticated user with optional pagination,
 * status filtering, category grouping, and search.
 */
export async function listMyNotifications(
  userId: string,
  options?: NotificationQueryOptions,
): Promise<Notification[]> {
  const paged = await listMyNotificationsPaged(userId, options);
  return paged.data;
}

/**
 * Fetch paged notifications with exact database counts.
 */
export async function listMyNotificationsPaged(
  userId: string,
  options?: NotificationQueryOptions,
): Promise<PagedNotificationsResult> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(50, options?.pageSize ?? 10));
  const filter = options?.filter ?? "all";
  const categoryGroup = options?.categoryGroup ?? "all";
  const search = options?.search?.trim();

  let query = supabase.from("notifications").select("*", { count: "exact" }).eq("user_id", userId);

  if (filter === "unread") {
    query = query.eq("is_read", false);
  } else if (filter === "read") {
    query = query.eq("is_read", true);
  }

  const groupTypes = getTypesForCategoryGroup(categoryGroup);
  if (groupTypes && groupTypes.length > 0) {
    query = query.in("type", groupTypes);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,body.ilike.%${search}%`);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const [{ data, error, count }, activeUnread] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    unreadCount(userId),
  ]);

  if (error) throw error;

  return {
    data: data ?? [],
    totalCount: count ?? 0,
    unreadCount: activeUnread,
  };
}

/**
 * High-efficiency head count query retrieving only the exact number
 * of unread notifications for a user without downloading records.
 */
export async function unreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
  return count ?? 0;
}

/**
 * Mark all unread notifications for a user as read.
 */
export async function markAllRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) throw error;
}

/**
 * Mark a specific notification as read.
 */
export async function markRead(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  if (error) throw error;
}

/**
 * Remove a notification from user history.
 */
export async function removeNotification(id: string): Promise<void> {
  const { error } = await supabase.from("notifications").delete().eq("id", id);
  if (error) throw error;
}
