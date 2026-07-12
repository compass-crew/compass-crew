import { supabase } from "@/integrations/supabase/client";

export type SettingsSection =
  | "general"
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
  branding: BrandingSettings;
  homepage: HomepageSettings;
  navigation: NavigationSettings;
  footer: FooterSettings;
  contact: ContactSettings;
  social: SocialSettings;
  seo: SeoSettings;
  analytics: AnalyticsSettings;
}

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
  return (data?.data as SettingsMap[K]) ?? null;
}

export async function updateSettingsSection<K extends SettingsSection>(
  section: K,
  data: SettingsMap[K],
): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("platform_settings")
    .upsert(
      { section, data: data as unknown as Record<string, unknown>, updated_by: userRes.user?.id ?? null },
      { onConflict: "section" },
    );
  if (error) throw new Error(error.message);
}
