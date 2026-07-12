-- 1) audit_logs table (super-admin only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_actor_id_idx ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins read audit logs" ON public.audit_logs;
CREATE POLICY "Super admins read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- No INSERT/UPDATE/DELETE policies: writes only via SECURITY DEFINER functions or service_role.

-- 2) admin_notifications table (super-admin only)
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'normal',
  title text NOT NULL,
  body text,
  resource_type text,
  resource_id text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS admin_notifications_is_read_idx ON public.admin_notifications (is_read) WHERE is_archived = false;

GRANT SELECT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins read admin notifications" ON public.admin_notifications;
CREATE POLICY "Super admins read admin notifications" ON public.admin_notifications
  FOR SELECT TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins update admin notifications" ON public.admin_notifications;
CREATE POLICY "Super admins update admin notifications" ON public.admin_notifications
  FOR UPDATE TO authenticated
  USING (public.is_super_admin(auth.uid()))
  WITH CHECK (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admins delete admin notifications" ON public.admin_notifications;
CREATE POLICY "Super admins delete admin notifications" ON public.admin_notifications
  FOR DELETE TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 3) Teams: remove the permissive "open teams" SELECT policy that leaked invite_code,
--    and replace the join-by-invite-code path with a SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Open teams visible to authenticated users" ON public.teams;

CREATE OR REPLACE FUNCTION public.join_open_team_by_invite_code(_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  t record;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT id, is_open, is_locked, hackathon_id
    INTO t
    FROM public.teams
   WHERE invite_code = lower(trim(_code))
   LIMIT 1;

  IF t.id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code' USING ERRCODE = 'no_data_found';
  END IF;
  IF t.is_locked THEN
    RAISE EXCEPTION 'This team is locked' USING ERRCODE = 'check_violation';
  END IF;
  IF NOT t.is_open THEN
    RAISE EXCEPTION 'This team is not open for public joins' USING ERRCODE = 'check_violation';
  END IF;

  BEGIN
    INSERT INTO public.team_members (team_id, user_id, role, status)
    VALUES (t.id, uid, 'member', 'active');
  EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'You''re already on this team' USING ERRCODE = 'unique_violation';
  END;

  RETURN t.id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_open_team_by_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_open_team_by_invite_code(text) TO authenticated;

-- 4) Lock down verify_certificate: no longer callable by anon/authenticated;
--    the public /verify/$code page now goes through a server route using service role.
REVOKE EXECUTE ON FUNCTION public.verify_certificate(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.verify_certificate(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_certificate(text) FROM authenticated;