/**
 * Notification Preferences Foundation
 *
 * Prepared as the architectural foundation for Step 28.12 Settings.
 * This establishes user preference typing and defaults for in-app
 * and future transactional email notifications without building an out-of-scope UI now.
 */

export interface NotificationPreferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  hackathon_updates: boolean;
  team_invites: boolean;
  community_announcements: boolean;
  certificate_alerts: boolean;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  in_app_enabled: true,
  email_enabled: false, // Default false until configured
  hackathon_updates: true,
  team_invites: true,
  community_announcements: true,
  certificate_alerts: true,
};

/**
 * Checks if a notification category is enabled for a given preference set.
 */
export function isNotificationCategoryEnabled(
  preferences: NotificationPreferences,
  category: "hackathon" | "teams" | "announcement" | "certificate" | "generic",
): boolean {
  if (!preferences.in_app_enabled) return false;

  switch (category) {
    case "hackathon":
      return preferences.hackathon_updates;
    case "teams":
      return preferences.team_invites;
    case "announcement":
      return preferences.community_announcements;
    case "certificate":
      return preferences.certificate_alerts;
    case "generic":
    default:
      return true;
  }
}
