
-- P1: Lock down certificates table. Public listing/reading is removed.
DROP POLICY IF EXISTS "Public can verify certificates" ON public.certificates;

CREATE POLICY "Users view own certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin views all certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Organizer views own hackathon certificates"
  ON public.certificates FOR SELECT
  TO authenticated
  USING (hackathon_id IS NOT NULL AND public.is_hackathon_organizer(auth.uid(), hackathon_id));

-- Public verification: single-record lookup by exact code returning only fields
-- required to display a verification page. No listing, no PII beyond the
-- recipient's public display name that already appears on the printed
-- certificate/QR they chose to share.
CREATE OR REPLACE FUNCTION public.verify_certificate(_code text)
RETURNS TABLE (
  code text,
  recipient_name text,
  type public.certificate_type,
  subtitle text,
  issued_at timestamptz,
  hackathon_title text,
  hackathon_slug text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.code, c.recipient_name, c.type, c.subtitle, c.issued_at,
         h.title, h.slug
    FROM public.certificates c
    LEFT JOIN public.hackathons h ON h.id = c.hackathon_id
   WHERE c.code = _code
   LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.verify_certificate(text) TO anon, authenticated;

-- P2: Trigger-only SECURITY DEFINER functions never need direct EXECUTE.
REVOKE ALL ON FUNCTION public.handle_new_user()           FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_updated_at()            FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.tg_set_updated_at()         FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_score_delete()      FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_score_integrity()   FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_submission_deadline() FROM PUBLIC, anon, authenticated;

-- Admin RPCs and helpers self-check role, but anon should never call them.
REVOKE ALL ON FUNCTION public.admin_get_user(uuid)                          FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_global_search(text, integer)            FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_list_users(text, text, text, integer, integer) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_security_overview()                     FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_role(uuid, text, boolean)      FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_user_suspended(uuid, boolean, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_admin_activity(integer)                   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.find_user_id_by_email(text)                   FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_email()                          FROM PUBLIC, anon;

-- RLS-predicate helpers must remain callable by authenticated (policies use them).
-- Anon has no policies that need them, so keep anon revoked (already is).
