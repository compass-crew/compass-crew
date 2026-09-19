-- ==============================================================================
-- Migration: 20260917130000_admin_role_protection.sql
-- Description: Enforces critical final-admin safety in public.admin_set_user_role().
-- Prevents demoting or removing the only remaining super administrator on the platform.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role text, _grant boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  super_admin_count int;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  -- Critical protection: Prevent revoking the super_admin role if there is only one remaining
  IF _role = 'super_admin' AND NOT _grant THEN
    SELECT COUNT(DISTINCT user_id) INTO super_admin_count
    FROM public.user_roles
    WHERE role = 'super_admin';

    IF super_admin_count <= 1 THEN
      RAISE EXCEPTION 'Cannot revoke super_admin: platform must maintain at least one active super administrator.';
    END IF;
  END IF;

  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, _role::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;

    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'role.grant',
      'user_roles',
      _user_id::text,
      jsonb_build_object('role', _role)
    );
  ELSE
    DELETE FROM public.user_roles
    WHERE user_id = _user_id AND role = _role::public.app_role;

    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
    VALUES (
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid()),
      'role.revoke',
      'user_roles',
      _user_id::text,
      jsonb_build_object('role', _role)
    );
  END IF;
END;$$;
