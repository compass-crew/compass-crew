
-- =========================================================
-- ENUMS
-- =========================================================
DO $$ BEGIN CREATE TYPE public.hackathon_status AS ENUM ('draft','published','registrations_open','ongoing','judging','completed','archived'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.hackathon_mode AS ENUM ('online','hybrid','in_person'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.registration_status AS ENUM ('pending','approved','rejected','waitlist','withdrawn'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.team_member_status AS ENUM ('invited','active','left','removed','declined'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.team_member_role AS ENUM ('leader','member'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.submission_status AS ENUM ('draft','submitted','disqualified'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.certificate_type AS ENUM ('participation','winner','runner_up','mentor','judge','organizer','campus_ambassador'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.notification_type AS ENUM ('registration_approved','registration_rejected','invite_received','invite_accepted','invite_declined','submission_reminder','hackathon_started','results_published','certificate_ready','announcement','generic'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.announcement_audience AS ENUM ('all','participants','teams','judges','mentors'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Shared updated_at trigger fn
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================
-- TABLES (no policies yet; helpers created after)
-- =========================================================
CREATE TABLE public.hackathons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  tagline text,
  description text,
  theme text,
  mode public.hackathon_mode NOT NULL DEFAULT 'online',
  status public.hackathon_status NOT NULL DEFAULT 'draft',
  banner_url text,
  location text,
  eligibility text,
  rules text,
  prizes jsonb NOT NULL DEFAULT '[]'::jsonb,
  faqs jsonb NOT NULL DEFAULT '[]'::jsonb,
  sponsors_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  resources_content jsonb NOT NULL DEFAULT '[]'::jsonb,
  min_team_size int NOT NULL DEFAULT 1,
  max_team_size int NOT NULL DEFAULT 4,
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  starts_at timestamptz,
  ends_at timestamptz,
  submission_deadline timestamptz,
  results_at timestamptz,
  is_featured boolean NOT NULL DEFAULT false,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hackathons TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathons TO authenticated;
GRANT ALL ON public.hackathons TO service_role;
ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.hackathon_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.hackathon_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hackathon_tracks TO authenticated;
GRANT ALL ON public.hackathon_tracks TO service_role;
ALTER TABLE public.hackathon_tracks ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scoring_criteria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  max_score int NOT NULL DEFAULT 10,
  weight numeric(4,2) NOT NULL DEFAULT 1.00,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.scoring_criteria TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scoring_criteria TO authenticated;
GRANT ALL ON public.scoring_criteria TO service_role;
ALTER TABLE public.scoring_criteria ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'approved',
  motivation text,
  referral text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hackathon_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  name text NOT NULL,
  tagline text,
  invite_code text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
  leader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  track_id uuid REFERENCES public.hackathon_tracks(id) ON DELETE SET NULL,
  is_locked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hackathon_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.team_member_role NOT NULL DEFAULT 'member',
  status public.team_member_status NOT NULL DEFAULT 'invited',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  track_id uuid REFERENCES public.hackathon_tracks(id) ON DELETE SET NULL,
  name text NOT NULL,
  tagline text,
  description text,
  problem_statement text,
  solution text,
  future_scope text,
  github_url text,
  live_url text,
  video_url text,
  presentation_url text,
  tech_stack text[] NOT NULL DEFAULT '{}',
  ai_models text[] NOT NULL DEFAULT '{}',
  status public.submission_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.judge_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id uuid REFERENCES public.submissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hackathon_id, judge_id, submission_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.judge_assignments TO authenticated;
GRANT ALL ON public.judge_assignments TO service_role;
ALTER TABLE public.judge_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  judge_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  criterion_id uuid NOT NULL REFERENCES public.scoring_criteria(id) ON DELETE CASCADE,
  score numeric(5,2) NOT NULL,
  comment text,
  is_final boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (submission_id, judge_id, criterion_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scores TO authenticated;
GRANT ALL ON public.scores TO service_role;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hackathon_id uuid REFERENCES public.hackathons(id) ON DELETE SET NULL,
  type public.certificate_type NOT NULL DEFAULT 'participation',
  code text NOT NULL UNIQUE DEFAULT ('CC-' || upper(substring(encode(gen_random_bytes(6), 'hex'), 1, 10))),
  title text NOT NULL,
  subtitle text,
  recipient_name text NOT NULL,
  pdf_url text,
  issued_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certificates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL DEFAULT 'generic',
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id uuid NOT NULL REFERENCES public.hackathons(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL,
  body text NOT NULL,
  audience public.announcement_audience NOT NULL DEFAULT 'all',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- SECURITY DEFINER HELPERS (tables now exist)
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_hackathon_organizer(_user_id uuid, _hackathon_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.hackathons h WHERE h.id = _hackathon_id AND h.created_by = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_team_leader(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.teams t WHERE t.id = _team_id AND t.leader_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = _team_id AND tm.user_id = _user_id AND tm.status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.is_hackathon_judge(_user_id uuid, _hackathon_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.judge_assignments ja WHERE ja.hackathon_id = _hackathon_id AND ja.judge_id = _user_id);
$$;

-- =========================================================
-- POLICIES
-- =========================================================
-- hackathons
CREATE POLICY "Public views published hackathons" ON public.hackathons FOR SELECT TO anon, authenticated USING (status <> 'draft');
CREATE POLICY "Organizer views own hackathons" ON public.hackathons FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Super admin views hackathons" ON public.hackathons FOR SELECT TO authenticated USING (has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organizers create hackathons" ON public.hackathons FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by AND (has_role(auth.uid(), 'organizer') OR has_role(auth.uid(), 'super_admin')));
CREATE POLICY "Organizer updates own hackathon" ON public.hackathons FOR UPDATE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organizer deletes own hackathon" ON public.hackathons FOR DELETE TO authenticated
  USING (created_by = auth.uid() OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_hackathons_updated_at BEFORE UPDATE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- hackathon_tracks
CREATE POLICY "Public views tracks of public hackathons" ON public.hackathon_tracks FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.hackathons h WHERE h.id = hackathon_id AND h.status <> 'draft'));
CREATE POLICY "Organizer views own tracks" ON public.hackathon_tracks FOR SELECT TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organizer manages tracks" ON public.hackathon_tracks FOR ALL TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));

-- scoring_criteria
CREATE POLICY "Public views criteria of public hackathons" ON public.scoring_criteria FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.hackathons h WHERE h.id = hackathon_id AND h.status <> 'draft'));
CREATE POLICY "Organizer views own criteria" ON public.scoring_criteria FOR SELECT TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organizer manages criteria" ON public.scoring_criteria FOR ALL TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));

-- registrations
CREATE POLICY "User views own registration" ON public.registrations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Organizer views registrations" ON public.registrations FOR SELECT TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "User registers self" ON public.registrations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "User updates own registration" ON public.registrations FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Organizer updates registrations" ON public.registrations FOR UPDATE TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "User or organizer deletes registration" ON public.registrations FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_registrations_updated_at BEFORE UPDATE ON public.registrations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- teams
CREATE POLICY "Team viewable by involved parties" ON public.teams FOR SELECT TO authenticated
  USING (
    leader_id = auth.uid()
    OR public.is_team_member(auth.uid(), id)
    OR public.is_hackathon_organizer(auth.uid(), hackathon_id)
    OR public.is_hackathon_judge(auth.uid(), hackathon_id)
    OR has_role(auth.uid(), 'super_admin')
  );
CREATE POLICY "User creates team as leader" ON public.teams FOR INSERT TO authenticated WITH CHECK (leader_id = auth.uid());
CREATE POLICY "Leader updates team" ON public.teams FOR UPDATE TO authenticated
  USING (leader_id = auth.uid() OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (leader_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Leader deletes team" ON public.teams FOR DELETE TO authenticated
  USING (leader_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- team_members
CREATE POLICY "Member views own memberships" ON public.team_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_team_leader(auth.uid(), team_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Leader invites members" ON public.team_members FOR INSERT TO authenticated
  WITH CHECK (public.is_team_leader(auth.uid(), team_id) OR user_id = auth.uid());
CREATE POLICY "Self or leader updates membership" ON public.team_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_team_leader(auth.uid(), team_id))
  WITH CHECK (user_id = auth.uid() OR public.is_team_leader(auth.uid(), team_id));
CREATE POLICY "Self or leader removes membership" ON public.team_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.is_team_leader(auth.uid(), team_id) OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- submissions
CREATE POLICY "Team or organizer or judge views submission" ON public.submissions FOR SELECT TO authenticated
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR public.is_team_leader(auth.uid(), team_id)
    OR public.is_hackathon_organizer(auth.uid(), hackathon_id)
    OR has_role(auth.uid(), 'super_admin')
    OR (status = 'submitted' AND public.is_hackathon_judge(auth.uid(), hackathon_id))
  );
CREATE POLICY "Leader creates submission" ON public.submissions FOR INSERT TO authenticated
  WITH CHECK (public.is_team_leader(auth.uid(), team_id));
CREATE POLICY "Leader updates submission" ON public.submissions FOR UPDATE TO authenticated
  USING (public.is_team_leader(auth.uid(), team_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_team_leader(auth.uid(), team_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Leader deletes submission" ON public.submissions FOR DELETE TO authenticated
  USING (public.is_team_leader(auth.uid(), team_id) OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_submissions_updated_at BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- judge_assignments
CREATE POLICY "Judge or organizer views assignments" ON public.judge_assignments FOR SELECT TO authenticated
  USING (judge_id = auth.uid() OR public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Organizer manages assignments" ON public.judge_assignments FOR ALL TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));

-- scores
CREATE POLICY "Judge or organizer views scores" ON public.scores FOR SELECT TO authenticated
  USING (
    judge_id = auth.uid()
    OR has_role(auth.uid(), 'super_admin')
    OR EXISTS (SELECT 1 FROM public.submissions s WHERE s.id = submission_id AND public.is_hackathon_organizer(auth.uid(), s.hackathon_id))
  );
CREATE POLICY "Judge writes own scores" ON public.scores FOR INSERT TO authenticated WITH CHECK (judge_id = auth.uid());
CREATE POLICY "Judge updates own scores" ON public.scores FOR UPDATE TO authenticated USING (judge_id = auth.uid()) WITH CHECK (judge_id = auth.uid());
CREATE POLICY "Judge deletes own scores" ON public.scores FOR DELETE TO authenticated USING (judge_id = auth.uid() OR has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_scores_updated_at BEFORE UPDATE ON public.scores FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- certificates (public verification by code)
CREATE POLICY "Public can verify certificates" ON public.certificates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Organizer or admin issues certificates" ON public.certificates FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR (hackathon_id IS NOT NULL AND public.is_hackathon_organizer(auth.uid(), hackathon_id)));
CREATE POLICY "Organizer or admin updates certificates" ON public.certificates FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR (hackathon_id IS NOT NULL AND public.is_hackathon_organizer(auth.uid(), hackathon_id)))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR (hackathon_id IS NOT NULL AND public.is_hackathon_organizer(auth.uid(), hackathon_id)));
CREATE POLICY "Only super admin deletes certificates" ON public.certificates FOR DELETE TO authenticated USING (has_role(auth.uid(), 'super_admin'));

-- notifications
CREATE POLICY "User views own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "User updates own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "User deletes own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- announcements
CREATE POLICY "Public views announcements of public hackathons" ON public.announcements FOR SELECT TO anon, authenticated
  USING (EXISTS (SELECT 1 FROM public.hackathons h WHERE h.id = hackathon_id AND h.status <> 'draft'));
CREATE POLICY "Organizer manages announcements" ON public.announcements FOR ALL TO authenticated
  USING (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.is_hackathon_organizer(auth.uid(), hackathon_id) OR has_role(auth.uid(), 'super_admin'));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hackathons_status ON public.hackathons(status);
CREATE INDEX IF NOT EXISTS idx_hackathons_created_by ON public.hackathons(created_by);
CREATE INDEX IF NOT EXISTS idx_tracks_hackathon ON public.hackathon_tracks(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_criteria_hackathon ON public.scoring_criteria(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_hackathon ON public.registrations(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_hackathon ON public.teams(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_hackathon ON public.submissions(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON public.submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_ja_hackathon ON public.judge_assignments(hackathon_id);
CREATE INDEX IF NOT EXISTS idx_ja_judge ON public.judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_scores_submission ON public.scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_scores_judge ON public.scores(judge_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_code ON public.certificates(code);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_announcements_hackathon ON public.announcements(hackathon_id);
