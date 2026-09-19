import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/audit-logger";

export type SettingsSection =
  | "general"
  | "platform"
  | "content"
  | "notifications"
  | "security"
  | "branding"
  | "homepage"
  | "navigation"
  | "footer"
  | "contact"
  | "social"
  | "seo"
  | "analytics";

export interface GeneralSettings {
  platform_name: string;
  tagline: string;
  description: string;
  contact_email: string;
}

export interface PlatformSectionSettings {
  maintenance_mode: boolean;
  maintenance_message: string;
  registration_open: boolean;
  features: {
    events: boolean;
    community: boolean;
    resources: boolean;
    hackathons: boolean;
  };
}

export interface ContentSectionSettings {
  announcement_banner_enabled: boolean;
  announcement_banner_text: string;
  announcement_banner_link: string;
}

export interface NotificationsSectionSettings {
  system_alerts_enabled: boolean;
  email_notifications_enabled: boolean;
  broadcast_to_all_users: boolean;
}

export interface SecuritySectionSettings {
  session_timeout_hours: number;
  enforce_email_verification: boolean;
  turnstile_protection: boolean;
  rate_limiting_enabled: boolean;
}

export interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  hero_background_url: string;
  primary_color: string;
  accent_color: string;
}

export interface HomepageStat {
  label: string;
  value: string;
}

export interface HomepageSettings {
  hero_title: string;
  hero_subtitle: string;
  cta_primary_label: string;
  cta_primary_url: string;
  cta_secondary_label: string;
  cta_secondary_url: string;
  stats: HomepageStat[];
}

export interface NavLink {
  label: string;
  href: string;
}

export interface NavigationSettings {
  links: NavLink[];
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface FooterSettings {
  tagline: string;
  columns: FooterColumn[];
  copyright: string;
}

export interface ContactSettings {
  support_email: string;
  press_email: string;
  phone: string;
  address: string;
}

export interface SocialSettings {
  linkedin: string;
  instagram: string;
  github: string;
  x: string;
  youtube: string;
}

export interface SeoSettings {
  default_title: string;
  default_description: string;
  og_image_url: string;
  twitter_handle: string;
}

export interface AnalyticsSettings {
  ga4_id: string;
  gtm_id: string;
  plausible_domain: string;
  posthog_key: string;
}

export interface SettingsMap {
  general: GeneralSettings;
  platform: PlatformSectionSettings;
  content: ContentSectionSettings;
  notifications: NotificationsSectionSettings;
  security: SecuritySectionSettings;
  branding: BrandingSettings;
  homepage: HomepageSettings;
  navigation: NavigationSettings;
  footer: FooterSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
  analytics: AnalyticsSettings;
}

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  platform_name: "Compass Crew",
  tagline: "An Entrepreneurship & Innovation Community",
  description:
    "A student-led community for AI, technology, innovation and startups — building hackathons, learning programs, and shipping real products with campuses across India.",
  contact_email: "compasscrewnetwork.team@gmail.com",
};

export const DEFAULT_PLATFORM_SETTINGS: PlatformSectionSettings = {
  maintenance_mode: false,
  maintenance_message:
    "Compass Crew is currently undergoing scheduled platform maintenance. We will be back online shortly. Thank you for your patience!",
  registration_open: true,
  features: {
    events: true,
    community: true,
    resources: true,
    hackathons: true,
  },
};

export const DEFAULT_CONTENT_SETTINGS: ContentSectionSettings = {
  announcement_banner_enabled: false,
  announcement_banner_text:
    "Welcome to the Compass Crew Platform! Explore upcoming hackathons and events.",
  announcement_banner_link: "/hackathons",
};

export const DEFAULT_NOTIFICATIONS_SETTINGS: NotificationsSectionSettings = {
  system_alerts_enabled: true,
  email_notifications_enabled: true,
  broadcast_to_all_users: true,
};

export const DEFAULT_SECURITY_SETTINGS: SecuritySectionSettings = {
  session_timeout_hours: 24,
  enforce_email_verification: true,
  turnstile_protection: true,
  rate_limiting_enabled: true,
};

export async function fetchAllSettings(): Promise<Partial<SettingsMap>> {
  const { data, error } = await supabase.from("platform_settings").select("section, data");
  if (error) throw new Error(error.message);
  const out: Record<string, unknown> = {};
  for (const row of data ?? []) out[row.section] = row.data;
  return out as Partial<SettingsMap>;
}

export async function fetchSettingsSection<K extends SettingsSection>(
  section: K,
): Promise<SettingsMap[K] | null> {
  const { data, error } = await supabase
    .from("platform_settings")
    .select("data")
    .eq("section", section)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data?.data as unknown as SettingsMap[K]) ?? null;
}

export async function updateSettingsSection<K extends SettingsSection>(
  section: K,
  data: SettingsMap[K],
): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("platform_settings")
    .upsert(
      { section, data: data as never, updated_by: userRes.user?.id ?? null },
      { onConflict: "section" },
    );
  if (error) throw new Error(error.message);

  // Security audit trail logging for settings updates
  try {
    let action = `platform.settings_${section}_updated`;
    if (section === "platform") {
      const pData = data as unknown as PlatformSectionSettings;
      if (typeof pData.maintenance_mode === "boolean") {
        action = pData.maintenance_mode
          ? "platform.maintenance_enabled"
          : "platform.maintenance_disabled";
      }
    }

    await logAdminAction({
      action,
      resourceType: "platform_settings",
      resourceId: section,
      meta: {
        section,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (auditErr) {
    console.warn("[platform-settings] Failed to write audit log for settings update:", auditErr);
  }
}
