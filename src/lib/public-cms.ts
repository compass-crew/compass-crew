import { supabase } from "@/integrations/supabase/client";
import { cmsMediaUrl } from "@/lib/cms-media";

// All queries below hit tables with permissive anon SELECT policies
// scoped to (status = 'published' AND deleted_at IS NULL). Never call
// anything else here without a matching RLS policy.

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string;
  cover_url: string | null;
  category: string | null;
  tags: string[] | null;
  author_name: string | null;
  reading_minutes: number | null;
  featured: boolean;
  published_at: string | null;
  created_at: string;
};

export type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string | null;
  tags: string[] | null;
  cover_url: string | null;
  url: string | null;
  download_url: string | null;
  is_external: boolean | null;
  published_at: string | null;
};

export type SiteEvent = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  body_md?: string | null;
  banner_url: string | null;
  kind: string;
  mode: string;
  location: string | null;
  starts_at: string | null;
  ends_at: string | null;
  registration_url: string | null;
  featured: boolean;
  status?: string;
  published_at?: string | null;
};

export type Sponsor = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
  tier: string;
  blurb: string | null;
};

export type Partner = {
  id: string;
  name: string;
  logo_url: string | null;
  url: string | null;
  kind: string;
  blurb: string | null;
};

export type Mentor = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  avatar_url: string | null;
  bio: string | null;
  expertise: string[] | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
};

export type PublicJudge = {
  id: string;
  name: string;
  title: string | null;
  company: string | null;
  avatar_url: string | null;
  bio: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  event_label: string | null;
};

export type Career = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string | null;
  body_md: string | null;
  location: string | null;
  mode: string | null;
  apply_url: string | null;
};

export type SiteAnnouncement = {
  id: string;
  title: string;
  body: string | null;
  link_url: string | null;
  link_label: string | null;
  audience: string;
  pinned: boolean;
  published_at: string | null;
};

export type HomepageSection = {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  media_url: string | null;
  cta_label: string | null;
  cta_url: string | null;
  data: Record<string, unknown> | null;
  sort_order: number | null;
};

const rewriteMedia = <
  T extends {
    cover_url?: string | null;
    banner_url?: string | null;
    logo_url?: string | null;
    avatar_url?: string | null;
    media_url?: string | null;
  },
>(
  row: T,
): T => ({
  ...row,
  ...("cover_url" in row ? { cover_url: cmsMediaUrl(row.cover_url) } : {}),
  ...("banner_url" in row ? { banner_url: cmsMediaUrl(row.banner_url) } : {}),
  ...("logo_url" in row ? { logo_url: cmsMediaUrl(row.logo_url) } : {}),
  ...("avatar_url" in row ? { avatar_url: cmsMediaUrl(row.avatar_url) } : {}),
  ...("media_url" in row ? { media_url: cmsMediaUrl(row.media_url) } : {}),
});

// ---------- Blog ----------
export async function listBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,body_md,cover_url,category,tags,author_name,reading_minutes,featured,published_at,created_at",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as BlogPost[];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      "id,slug,title,excerpt,body_md,cover_url,category,tags,author_name,reading_minutes,featured,published_at,created_at",
    )
    .eq("status", "published")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return data ? (rewriteMedia(data) as BlogPost) : null;
}

// ---------- Resources ----------
export async function listResources(): Promise<ResourceItem[]> {
  const { data, error } = await supabase
    .from("resources")
    .select(
      "id,slug,title,description,category,tags,cover_url,url,download_url,is_external,published_at,sort_order",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as ResourceItem[];
}

export async function getResource(slugOrId: string): Promise<ResourceItem | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  let q = supabase
    .from("resources")
    .select(
      "id,slug,title,description,category,tags,cover_url,url,download_url,is_external,published_at,sort_order",
    )
    .eq("status", "published")
    .is("deleted_at", null);

  if (isUuid) {
    q = q.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
  } else {
    q = q.eq("slug", slugOrId);
  }

  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data ? (rewriteMedia(data) as ResourceItem) : null;
}

// ---------- Events ----------
export async function listEvents(): Promise<SiteEvent[]> {
  const { data, error } = await supabase
    .from("site_events")
    .select(
      "id,slug,title,description,banner_url,kind,mode,location,starts_at,ends_at,registration_url,featured",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("featured", { ascending: false })
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as SiteEvent[];
}

export async function getEvent(slugOrId: string): Promise<SiteEvent | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

  let q = supabase
    .from("site_events")
    .select(
      "id,slug,title,description,body_md,banner_url,kind,mode,location,starts_at,ends_at,registration_url,featured,status,published_at",
    )
    .is("deleted_at", null);

  if (isUuid) {
    q = q.or(`slug.eq.${slugOrId},id.eq.${slugOrId}`);
  } else {
    q = q.eq("slug", slugOrId);
  }

  const { data, error } = await q.maybeSingle();
  if (error) throw error;
  return data ? (rewriteMedia(data) as SiteEvent) : null;
}

// ---------- Sponsors ----------
export async function listSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from("sponsors")
    .select("id,name,logo_url,url,tier,blurb,sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as Sponsor[];
}

// ---------- Partners ----------
export async function listPartners(): Promise<Partner[]> {
  const { data, error } = await supabase
    .from("partners")
    .select("id,name,logo_url,url,kind,blurb,sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as Partner[];
}

// ---------- Mentors ----------
export async function listMentors(): Promise<Mentor[]> {
  const { data, error } = await supabase
    .from("mentors")
    .select(
      "id,name,title,company,avatar_url,bio,expertise,linkedin_url,twitter_url,website_url,sort_order",
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as Mentor[];
}

// ---------- Public Judges ----------
export async function listPublicJudges(): Promise<PublicJudge[]> {
  const { data, error } = await supabase
    .from("public_judges")
    .select("id,name,title,company,avatar_url,bio,linkedin_url,twitter_url,event_label,sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as PublicJudge[];
}

// ---------- Careers ----------
export async function listCareers(): Promise<Career[]> {
  const { data, error } = await supabase
    .from("careers")
    .select("id,slug,title,category,description,body_md,location,mode,apply_url,sort_order")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as Career[];
}

// ---------- Announcements ----------
export async function listAnnouncements(limit = 5): Promise<SiteAnnouncement[]> {
  const { data, error } = await supabase
    .from("site_announcements")
    .select("id,title,body,link_url,link_label,audience,pinned,published_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .in("audience", ["all"])
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as SiteAnnouncement[];
}

// ---------- Homepage / About CMS sections ----------
export async function listHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from("cms_homepage_sections")
    .select("id,key,title,subtitle,body,media_url,cta_label,cta_url,data,sort_order")
    .eq("enabled", true)
    .is("deleted_at", null)
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(rewriteMedia) as HomepageSection[];
}

export function findSection(sections: HomepageSection[], key: string): HomepageSection | undefined {
  return sections.find((s) => s.key === key);
}

// ---------- Form submissions ----------
// Anonymous public forms now flow through server functions that verify
// Cloudflare Turnstile and apply per-IP rate limits before writing.
import {
  submitContactMessageFn,
  submitPartnerApplicationFn,
  subscribeNewsletterFn,
} from "@/lib/public-forms.functions";

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  turnstileToken?: string | null;
}) {
  await submitContactMessageFn({ data: input });
}

export async function submitPartnerApplication(input: {
  org_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  partnership_type?: string | null;
  message: string;
  turnstileToken?: string | null;
}) {
  await submitPartnerApplicationFn({ data: input });
}

export async function subscribeNewsletter(
  email: string,
  source = "footer",
  turnstileToken?: string | null,
) {
  await subscribeNewsletterFn({
    data: { email: email.toLowerCase().trim(), source, turnstileToken: turnstileToken ?? null },
  });
}
