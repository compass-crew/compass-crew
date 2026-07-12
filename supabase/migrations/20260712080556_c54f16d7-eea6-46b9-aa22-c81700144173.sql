
DO $$ BEGIN CREATE TYPE public.content_status AS ENUM ('draft','scheduled','published','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.event_kind AS ENUM ('workshop','webinar','hackathon','bootcamp','meetup','ama'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.event_mode AS ENUM ('online','hybrid','in_person'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.application_status AS ENUM ('pending','reviewing','approved','rejected','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.sponsor_tier AS ENUM ('title','platinum','gold','silver','bronze','community'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.partner_kind AS ENUM ('academic','community','media','ecosystem','technology'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.career_category AS ENUM ('volunteer','ambassador','organizer','internship','full_time','future'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_role(_user_id, 'super_admin'::public.app_role) $$;
REVOKE EXECUTE ON FUNCTION public.is_super_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_super_admin(uuid) TO authenticated, service_role;

CREATE TABLE public.cms_homepage_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE, title text, subtitle text, body text, media_url text,
  cta_label text, cta_url text, data jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0, enabled boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cms_homepage_sections TO authenticated;
GRANT SELECT ON public.cms_homepage_sections TO anon;
GRANT ALL ON public.cms_homepage_sections TO service_role;
ALTER TABLE public.cms_homepage_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hs_pub" ON public.cms_homepage_sections FOR SELECT USING (enabled AND deleted_at IS NULL);
CREATE POLICY "hs_adm" ON public.cms_homepage_sections FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_hs_upd BEFORE UPDATE ON public.cms_homepage_sections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL,
  excerpt text, body_md text NOT NULL DEFAULT '', cover_url text, category text,
  tags text[] NOT NULL DEFAULT '{}', author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text, reading_minutes int,
  status public.content_status NOT NULL DEFAULT 'draft', published_at timestamptz, scheduled_for timestamptz,
  featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX blog_posts_status_pub_idx ON public.blog_posts(status, published_at DESC);
CREATE INDEX blog_posts_category_idx ON public.blog_posts(category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT SELECT ON public.blog_posts TO anon;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bp_pub" ON public.blog_posts FOR SELECT USING (status='published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "bp_adm" ON public.blog_posts FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_bp_upd BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL,
  description text, category text NOT NULL, tags text[] NOT NULL DEFAULT '{}',
  url text, download_url text, cover_url text, is_external boolean NOT NULL DEFAULT true,
  status public.content_status NOT NULL DEFAULT 'draft', published_at timestamptz, scheduled_for timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX resources_category_idx ON public.resources(category);
CREATE INDEX resources_status_idx ON public.resources(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT SELECT ON public.resources TO anon;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res_pub" ON public.resources FOR SELECT USING (status='published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "res_adm" ON public.resources FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_res_upd BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.resource_bookmarks (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, resource_id)
);
GRANT SELECT, INSERT, DELETE ON public.resource_bookmarks TO authenticated;
GRANT ALL ON public.resource_bookmarks TO service_role;
ALTER TABLE public.resource_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rb_r" ON public.resource_bookmarks FOR SELECT TO authenticated USING (auth.uid()=user_id);
CREATE POLICY "rb_i" ON public.resource_bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid()=user_id);
CREATE POLICY "rb_d" ON public.resource_bookmarks FOR DELETE TO authenticated USING (auth.uid()=user_id);

CREATE TABLE public.site_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, title text NOT NULL,
  description text, body_md text, banner_url text,
  kind public.event_kind NOT NULL DEFAULT 'workshop', mode public.event_mode NOT NULL DEFAULT 'online',
  location text, starts_at timestamptz, ends_at timestamptz, registration_url text,
  speakers jsonb NOT NULL DEFAULT '[]'::jsonb, schedule jsonb NOT NULL DEFAULT '[]'::jsonb, resources jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.content_status NOT NULL DEFAULT 'draft', published_at timestamptz, scheduled_for timestamptz,
  featured boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX site_events_starts_idx ON public.site_events(starts_at);
CREATE INDEX site_events_status_idx ON public.site_events(status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_events TO authenticated;
GRANT SELECT ON public.site_events TO anon;
GRANT ALL ON public.site_events TO service_role;
ALTER TABLE public.site_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ev_pub" ON public.site_events FOR SELECT USING (status='published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "ev_adm" ON public.site_events FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_ev_upd BEFORE UPDATE ON public.site_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, body text NOT NULL,
  link_url text, link_label text, audience text NOT NULL DEFAULT 'all', pinned boolean NOT NULL DEFAULT false,
  status public.content_status NOT NULL DEFAULT 'draft', published_at timestamptz, scheduled_for timestamptz, expires_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_announcements TO authenticated;
GRANT SELECT ON public.site_announcements TO anon;
GRANT ALL ON public.site_announcements TO service_role;
ALTER TABLE public.site_announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sa_pub" ON public.site_announcements FOR SELECT USING (status='published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()) AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "sa_adm" ON public.site_announcements FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_sa_upd BEFORE UPDATE ON public.site_announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, logo_url text, url text,
  tier public.sponsor_tier NOT NULL DEFAULT 'community', blurb text,
  status public.content_status NOT NULL DEFAULT 'draft', sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT SELECT ON public.sponsors TO anon;
GRANT ALL ON public.sponsors TO service_role;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp_pub" ON public.sponsors FOR SELECT USING (status='published' AND deleted_at IS NULL);
CREATE POLICY "sp_adm" ON public.sponsors FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_sp_upd BEFORE UPDATE ON public.sponsors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, logo_url text, url text,
  kind public.partner_kind NOT NULL DEFAULT 'community', blurb text,
  status public.content_status NOT NULL DEFAULT 'draft', sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partners TO authenticated;
GRANT SELECT ON public.partners TO anon;
GRANT ALL ON public.partners TO service_role;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pt_pub" ON public.partners FOR SELECT USING (status='published' AND deleted_at IS NULL);
CREATE POLICY "pt_adm" ON public.partners FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_pt_upd BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_name text NOT NULL, contact_name text NOT NULL, email text NOT NULL, phone text, website text,
  partnership_type text, message text NOT NULL,
  status public.application_status NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT INSERT ON public.partner_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.partner_applications TO authenticated;
GRANT ALL ON public.partner_applications TO service_role;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_ins" ON public.partner_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "pa_sel" ON public.partner_applications FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "pa_upd" ON public.partner_applications FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "pa_del" ON public.partner_applications FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_pa_upd BEFORE UPDATE ON public.partner_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.public_judges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, title text, company text,
  avatar_url text, bio text, linkedin_url text, twitter_url text, event_label text,
  sort_order int NOT NULL DEFAULT 0, status public.content_status NOT NULL DEFAULT 'draft',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_judges TO authenticated;
GRANT SELECT ON public.public_judges TO anon;
GRANT ALL ON public.public_judges TO service_role;
ALTER TABLE public.public_judges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pj_pub" ON public.public_judges FOR SELECT USING (status='published' AND deleted_at IS NULL);
CREATE POLICY "pj_adm" ON public.public_judges FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_pj_upd BEFORE UPDATE ON public.public_judges FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mentors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, title text, company text,
  avatar_url text, bio text, expertise text[] NOT NULL DEFAULT '{}',
  linkedin_url text, twitter_url text, website_url text,
  status public.content_status NOT NULL DEFAULT 'draft', sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mentors TO authenticated;
GRANT SELECT ON public.mentors TO anon;
GRANT ALL ON public.mentors TO service_role;
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mn_pub" ON public.mentors FOR SELECT USING (status='published' AND deleted_at IS NULL);
CREATE POLICY "mn_adm" ON public.mentors FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_mn_upd BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.mentor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL, email text NOT NULL, phone text,
  job_title text, company text, linkedin_url text,
  expertise text[] NOT NULL DEFAULT '{}', years_experience int,
  motivation text NOT NULL, availability text,
  status public.application_status NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT INSERT ON public.mentor_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.mentor_applications TO authenticated;
GRANT ALL ON public.mentor_applications TO service_role;
ALTER TABLE public.mentor_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ma_ins" ON public.mentor_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ma_sel" ON public.mentor_applications FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "ma_upd" ON public.mentor_applications FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "ma_del" ON public.mentor_applications FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_ma_upd BEFORE UPDATE ON public.mentor_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ambassador_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL, email text NOT NULL, phone text, college text NOT NULL, branch text,
  year_of_study text, linkedin_url text, why_you text NOT NULL, prior_experience text,
  status public.application_status NOT NULL DEFAULT 'pending',
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT INSERT ON public.ambassador_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.ambassador_applications TO authenticated;
GRANT ALL ON public.ambassador_applications TO service_role;
ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aa_ins" ON public.ambassador_applications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "aa_sel" ON public.ambassador_applications FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "aa_upd" ON public.ambassador_applications FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "aa_del" ON public.ambassador_applications FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_aa_upd BEFORE UPDATE ON public.ambassador_applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ambassadors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL, college text, avatar_url text,
  referral_code text NOT NULL UNIQUE, points int NOT NULL DEFAULT 0, tier text,
  status public.content_status NOT NULL DEFAULT 'published',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE INDEX ambassadors_points_idx ON public.ambassadors(points DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassadors TO authenticated;
GRANT SELECT ON public.ambassadors TO anon;
GRANT ALL ON public.ambassadors TO service_role;
ALTER TABLE public.ambassadors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "am_pub" ON public.ambassadors FOR SELECT USING (status='published' AND deleted_at IS NULL);
CREATE POLICY "am_adm" ON public.ambassadors FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_am_upd BEFORE UPDATE ON public.ambassadors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ambassador_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id uuid NOT NULL REFERENCES public.ambassadors(id) ON DELETE CASCADE,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_email text, points_awarded int NOT NULL DEFAULT 0, note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX amb_ref_amb_idx ON public.ambassador_referrals(ambassador_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ambassador_referrals TO authenticated;
GRANT ALL ON public.ambassador_referrals TO service_role;
ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_adm" ON public.ambassador_referrals FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));

CREATE TABLE public.careers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL, slug text NOT NULL UNIQUE,
  category public.career_category NOT NULL DEFAULT 'volunteer',
  description text, body_md text, location text, mode public.event_mode, apply_url text,
  status public.content_status NOT NULL DEFAULT 'draft', published_at timestamptz, scheduled_for timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.careers TO authenticated;
GRANT SELECT ON public.careers TO anon;
GRANT ALL ON public.careers TO service_role;
ALTER TABLE public.careers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cr_pub" ON public.careers FOR SELECT USING (status='published' AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= now()));
CREATE POLICY "cr_adm" ON public.careers FOR ALL TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_cr_upd BEFORE UPDATE ON public.careers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, email text NOT NULL, subject text NOT NULL, message text NOT NULL,
  handled boolean NOT NULL DEFAULT false, admin_notes text,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm_ins" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "cm_sel" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "cm_upd" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "cm_del" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_cm_upd BEFORE UPDATE ON public.contact_messages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE, source text, unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.newsletter_subscribers TO authenticated;
GRANT ALL ON public.newsletter_subscribers TO service_role;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ns_ins" ON public.newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "ns_sel" ON public.newsletter_subscribers FOR SELECT TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE POLICY "ns_upd" ON public.newsletter_subscribers FOR UPDATE TO authenticated USING (public.is_super_admin(auth.uid())) WITH CHECK (public.is_super_admin(auth.uid()));
CREATE POLICY "ns_del" ON public.newsletter_subscribers FOR DELETE TO authenticated USING (public.is_super_admin(auth.uid()));
CREATE TRIGGER trg_ns_upd BEFORE UPDATE ON public.newsletter_subscribers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
