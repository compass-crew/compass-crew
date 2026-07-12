-- =========================================================================
-- Critical Security Batch: C1, C2, C3, C10 + H4, H5
-- =========================================================================

-- ---------------------------------------------------------------
-- C1. Profile privacy: new profiles default to private.
-- (Existing rows are not modified — respects users' current choice.)
-- ---------------------------------------------------------------
ALTER TABLE public.profiles ALTER COLUMN is_public SET DEFAULT false;

-- ---------------------------------------------------------------
-- C2. cms-media bucket: read is admin-only.
--     Public-facing assets continue to be served via the signed
--     /api/public/cms-media/* route which uses supabaseAdmin.
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS cms_media_auth_read ON storage.objects;
CREATE POLICY cms_media_admin_read ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'cms-media' AND public.is_super_admin(auth.uid()));

-- ---------------------------------------------------------------
-- C3. Remove anon INSERT with WITH CHECK(true) on public forms.
--     All public form submissions now flow through a server
--     function that verifies Cloudflare Turnstile, applies basic
--     rate limits, and uses supabaseAdmin (bypasses RLS).
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "cm_ins" ON public.contact_messages;
DROP POLICY IF EXISTS "pa_ins" ON public.partner_applications;
DROP POLICY IF EXISTS "ma_ins" ON public.mentor_applications;
DROP POLICY IF EXISTS "aa_ins" ON public.ambassador_applications;
DROP POLICY IF EXISTS "ns_ins" ON public.newsletter_subscribers;

-- Basic per-IP rate limit ledger used by the public-form server fn.
CREATE TABLE IF NOT EXISTS public.public_form_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash text NOT NULL,
  form_kind text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pfe_ip_kind_time
  ON public.public_form_events (ip_hash, form_kind, created_at DESC);
GRANT ALL ON public.public_form_events TO service_role;
ALTER TABLE public.public_form_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_only_pfe" ON public.public_form_events;
CREATE POLICY "service_only_pfe" ON public.public_form_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------
-- C10. Revoke EXECUTE on SECURITY DEFINER functions from anon
--      and PUBLIC. Authenticated retained only where required by
--      RLS predicates or by legitimate client-side callers. All
--      admin_* functions internally verify has_role('super_admin').
-- ---------------------------------------------------------------
-- Fully lock down: admin RPCs (client passes bearer -> authenticated
-- role -> function checks super_admin internally; anon must not call).
REVOKE EXECUTE ON FUNCTION public.admin_get_user(uuid)                          FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_global_search(text, integer)            FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_list_users(text, text, text, integer, integer) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_security_overview()                     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text, boolean)      FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_set_user_suspended(uuid, boolean, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_activity(integer)                   FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.current_user_email()                          FROM PUBLIC, anon;

-- Predicate helpers used inside RLS policies. authenticated keeps EXECUTE.
REVOKE EXECUTE ON FUNCTION public.is_hackathon_judge(uuid, uuid)     FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_hackathon_organizer(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_team_leader(uuid, uuid)         FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid, uuid)         FROM PUBLIC, anon;

-- find_user_id_by_email: user-enumeration oracle. Add caller gating
-- and revoke anon EXECUTE. Only organizers, team leaders, and super
-- admins may resolve emails -> uids.
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF NOT (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR EXISTS (SELECT 1 FROM public.hackathons WHERE created_by = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teams     WHERE leader_id  = auth.uid())
  ) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN (SELECT id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1);
END;
$$;
REVOKE EXECUTE ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO authenticated;

-- ---------------------------------------------------------------
-- H4. Enforce submission deadline server-side.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_submission_deadline()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deadline timestamptz;
BEGIN
  -- Super admins can always edit / rescue submissions.
  IF public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  -- Block first-time submit (INSERT as submitted, or UPDATE draft->submitted)
  -- after the hackathon's submission_deadline.
  IF (TG_OP = 'INSERT' AND NEW.status = 'submitted'::public.submission_status)
     OR (TG_OP = 'UPDATE'
         AND NEW.status = 'submitted'::public.submission_status
         AND (OLD.status IS DISTINCT FROM NEW.status
              OR OLD.submitted_at IS DISTINCT FROM NEW.submitted_at))
  THEN
    SELECT submission_deadline INTO deadline
      FROM public.hackathons WHERE id = NEW.hackathon_id;
    IF deadline IS NOT NULL AND now() > deadline THEN
      RAISE EXCEPTION 'Submission deadline has passed for this hackathon.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  -- Block edits to content fields of an already-submitted row past deadline.
  IF TG_OP = 'UPDATE' AND OLD.status = 'submitted'::public.submission_status THEN
    SELECT submission_deadline INTO deadline
      FROM public.hackathons WHERE id = OLD.hackathon_id;
    IF deadline IS NOT NULL AND now() > deadline
       AND (NEW.name              IS DISTINCT FROM OLD.name
            OR NEW.tagline           IS DISTINCT FROM OLD.tagline
            OR NEW.description       IS DISTINCT FROM OLD.description
            OR NEW.problem_statement IS DISTINCT FROM OLD.problem_statement
            OR NEW.solution          IS DISTINCT FROM OLD.solution
            OR NEW.future_scope      IS DISTINCT FROM OLD.future_scope
            OR NEW.github_url        IS DISTINCT FROM OLD.github_url
            OR NEW.live_url          IS DISTINCT FROM OLD.live_url
            OR NEW.video_url         IS DISTINCT FROM OLD.video_url
            OR NEW.presentation_url  IS DISTINCT FROM OLD.presentation_url
            OR NEW.tech_stack        IS DISTINCT FROM OLD.tech_stack
            OR NEW.ai_models         IS DISTINCT FROM OLD.ai_models
            OR NEW.track_id          IS DISTINCT FROM OLD.track_id)
    THEN
      RAISE EXCEPTION 'Submission deadline has passed for this hackathon.'
        USING ERRCODE = 'check_violation';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_submission_deadline_tg ON public.submissions;
CREATE TRIGGER enforce_submission_deadline_tg
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.enforce_submission_deadline();

-- ---------------------------------------------------------------
-- H5. Scoring integrity: judge must be assigned, one row per
--     (submission, judge, criterion) already enforced by unique
--     index; block writes/deletes when leaderboard is frozen;
--     enforce judge_id = auth.uid(); enforce 0..100 range.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_score_integrity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  h_id uuid;
  frozen boolean;
  is_assigned boolean;
BEGIN
  IF public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RETURN NEW;
  END IF;

  IF TG_OP IN ('INSERT','UPDATE') AND NEW.judge_id <> auth.uid() THEN
    RAISE EXCEPTION 'Cannot score as another judge.';
  END IF;

  SELECT s.hackathon_id, COALESCE(h.leaderboard_frozen, false)
    INTO h_id, frozen
    FROM public.submissions s
    JOIN public.hackathons  h ON h.id = s.hackathon_id
   WHERE s.id = NEW.submission_id;

  IF h_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found.';
  END IF;

  IF frozen THEN
    RAISE EXCEPTION 'Leaderboard is frozen; scores are locked.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.judge_assignments ja
     WHERE ja.judge_id     = NEW.judge_id
       AND ja.hackathon_id = h_id
       AND (ja.submission_id IS NULL OR ja.submission_id = NEW.submission_id)
  ) INTO is_assigned;

  IF NOT is_assigned THEN
    RAISE EXCEPTION 'Judge is not assigned to this hackathon/submission.';
  END IF;

  IF NEW.score < 0 OR NEW.score > 100 THEN
    RAISE EXCEPTION 'Score must be between 0 and 100.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_score_integrity_tg ON public.scores;
CREATE TRIGGER enforce_score_integrity_tg
  BEFORE INSERT OR UPDATE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_score_integrity();

CREATE OR REPLACE FUNCTION public.enforce_score_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE frozen boolean;
BEGIN
  IF public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RETURN OLD;
  END IF;
  SELECT h.leaderboard_frozen INTO frozen
    FROM public.submissions s
    JOIN public.hackathons  h ON h.id = s.hackathon_id
   WHERE s.id = OLD.submission_id;
  IF COALESCE(frozen, false) THEN
    RAISE EXCEPTION 'Leaderboard is frozen; scores are locked.';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS enforce_score_delete_tg ON public.scores;
CREATE TRIGGER enforce_score_delete_tg
  BEFORE DELETE ON public.scores
  FOR EACH ROW EXECUTE FUNCTION public.enforce_score_delete();
