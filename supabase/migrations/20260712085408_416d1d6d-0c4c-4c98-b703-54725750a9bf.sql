
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended_at timestamptz,
  ADD COLUMN IF NOT EXISTS suspended_reason text;

CREATE OR REPLACE FUNCTION public.admin_list_users(
  _search text DEFAULT NULL,
  _role text DEFAULT NULL,
  _status text DEFAULT NULL,
  _limit int DEFAULT 50,
  _offset int DEFAULT 0
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth
AS $$
DECLARE total_count int; items jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  WITH base AS (
    SELECT u.id, u.email, u.created_at as joined_at, u.last_sign_in_at, u.email_confirmed_at, u.banned_until,
      p.full_name, p.username, p.avatar_url, p.college, p.country, p.suspended_at, p.suspended_reason,
      COALESCE((SELECT array_agg(role::text) FROM public.user_roles ur WHERE ur.user_id = u.id), ARRAY[]::text[]) AS roles
    FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
  ), filtered AS (
    SELECT * FROM base
    WHERE (_search IS NULL OR _search = '' OR email ILIKE '%'||_search||'%' OR COALESCE(full_name,'') ILIKE '%'||_search||'%' OR COALESCE(username,'') ILIKE '%'||_search||'%')
      AND (_role IS NULL OR _role = '' OR _role = 'all' OR _role = ANY(roles))
      AND (_status IS NULL OR _status = '' OR _status = 'all'
           OR (_status = 'suspended' AND suspended_at IS NOT NULL)
           OR (_status = 'active' AND suspended_at IS NULL AND email_confirmed_at IS NOT NULL)
           OR (_status = 'unverified' AND email_confirmed_at IS NULL))
  )
  SELECT COUNT(*) INTO total_count FROM filtered;
  SELECT COALESCE(jsonb_agg(to_jsonb(f) ORDER BY f.joined_at DESC), '[]'::jsonb) INTO items
  FROM (SELECT * FROM filtered ORDER BY joined_at DESC LIMIT _limit OFFSET _offset) f;
  RETURN jsonb_build_object('total', total_count, 'items', items);
END;$$;

CREATE OR REPLACE FUNCTION public.admin_get_user(_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_build_object(
    'id', u.id, 'email', u.email, 'joined_at', u.created_at,
    'last_sign_in_at', u.last_sign_in_at, 'email_confirmed_at', u.email_confirmed_at, 'banned_until', u.banned_until,
    'profile', to_jsonb(p),
    'roles', COALESCE((SELECT array_agg(role::text) FROM public.user_roles ur WHERE ur.user_id = u.id), ARRAY[]::text[]),
    'recent_audit', COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at DESC)
      FROM (SELECT * FROM public.audit_logs WHERE actor_id = u.id ORDER BY created_at DESC LIMIT 25) a), '[]'::jsonb)
  ) INTO result FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id WHERE u.id = _user_id;
  RETURN result;
END;$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_suspended(_user_id uuid, _suspended boolean, _reason text DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _suspended THEN
    UPDATE public.profiles SET suspended_at = now(), suspended_reason = _reason WHERE id = _user_id;
    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
      VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'user.suspend', 'users', _user_id::text, jsonb_build_object('reason', _reason));
  ELSE
    UPDATE public.profiles SET suspended_at = NULL, suspended_reason = NULL WHERE id = _user_id;
    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
      VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'user.reactivate', 'users', _user_id::text, '{}'::jsonb);
  END IF;
END;$$;

CREATE OR REPLACE FUNCTION public.admin_set_user_role(_user_id uuid, _role text, _grant boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _grant THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role::public.app_role) ON CONFLICT (user_id, role) DO NOTHING;
    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
      VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'role.grant', 'user_roles', _user_id::text, jsonb_build_object('role', _role));
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role::public.app_role;
    INSERT INTO public.audit_logs (actor_id, actor_email, action, resource_type, resource_id, meta)
      VALUES (auth.uid(), (SELECT email FROM auth.users WHERE id = auth.uid()), 'role.revoke', 'user_roles', _user_id::text, jsonb_build_object('role', _role));
  END IF;
END;$$;

CREATE OR REPLACE FUNCTION public.admin_global_search(_q text, _limit int DEFAULT 8)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE result jsonb; qq text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  IF _q IS NULL OR length(trim(_q)) < 1 THEN RETURN '[]'::jsonb; END IF;
  qq := '%'||_q||'%';
  SELECT COALESCE(jsonb_agg(row_to_json(x)), '[]'::jsonb) INTO result FROM (
    (SELECT 'user'::text AS kind, u.id::text AS id, COALESCE(p.full_name, u.email) AS title, u.email AS subtitle FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
      WHERE u.email ILIKE qq OR COALESCE(p.full_name,'') ILIKE qq OR COALESCE(p.username,'') ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'hackathon'::text, id::text, title, slug FROM public.hackathons WHERE title ILIKE qq OR slug ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'event'::text, id::text, title, kind::text FROM public.site_events WHERE title ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'blog'::text, id::text, title, slug FROM public.blog_posts WHERE title ILIKE qq OR slug ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'resource'::text, id::text, title, category FROM public.resources WHERE title ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'team'::text, id::text, name, NULL FROM public.teams WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'submission'::text, id::text, COALESCE(name,'Untitled'), NULL FROM public.submissions WHERE COALESCE(name,'') ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'sponsor'::text, id::text, name, tier FROM public.sponsors WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'partner'::text, id::text, name, NULL FROM public.partners WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'mentor'::text, id::text, name, expertise_area FROM public.mentors WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'judge'::text, id::text, name, expertise FROM public.public_judges WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'ambassador'::text, id::text, name, college FROM public.ambassadors WHERE name ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'partner_application'::text, id::text, org_name, contact_email FROM public.partner_applications WHERE org_name ILIKE qq OR contact_email ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'mentor_application'::text, id::text, full_name, email FROM public.mentor_applications WHERE full_name ILIKE qq OR email ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'ambassador_application'::text, id::text, full_name, email FROM public.ambassador_applications WHERE full_name ILIKE qq OR email ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'contact_message'::text, id::text, name, email FROM public.contact_messages WHERE name ILIKE qq OR email ILIKE qq OR subject ILIKE qq LIMIT _limit)
    UNION ALL (SELECT 'announcement'::text, id::text, title, NULL FROM public.site_announcements WHERE title ILIKE qq LIMIT _limit)
  ) x;
  RETURN result;
END;$$;

CREATE OR REPLACE FUNCTION public.admin_security_overview()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM auth.users),
    'active_sessions_7d', (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > now() - interval '7 days'),
    'suspended_users', (SELECT COUNT(*) FROM public.profiles WHERE suspended_at IS NOT NULL),
    'unverified_users', (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL),
    'role_changes_30d', (SELECT COUNT(*) FROM public.audit_logs WHERE action IN ('role.grant','role.revoke') AND created_at > now() - interval '30 days'),
    'suspicious_events_7d', (SELECT COUNT(*) FROM public.audit_logs WHERE (action LIKE '%suspend%' OR action LIKE '%delete%') AND created_at > now() - interval '7 days'),
    'recent_logins', COALESCE((SELECT jsonb_agg(row_to_json(l) ORDER BY l.last_sign_in_at DESC) FROM (
        SELECT u.id, u.email, u.last_sign_in_at, u.created_at FROM auth.users u
        WHERE u.last_sign_in_at IS NOT NULL ORDER BY u.last_sign_in_at DESC LIMIT 25) l), '[]'::jsonb),
    'recent_role_changes', COALESCE((SELECT jsonb_agg(row_to_json(a) ORDER BY a.created_at DESC) FROM (
        SELECT id, actor_email, action, resource_id, meta, created_at FROM public.audit_logs
        WHERE action IN ('role.grant','role.revoke') ORDER BY created_at DESC LIMIT 25) a), '[]'::jsonb),
    'recent_suspensions', COALESCE((SELECT jsonb_agg(row_to_json(a) ORDER BY a.created_at DESC) FROM (
        SELECT id, actor_email, action, resource_id, meta, created_at FROM public.audit_logs
        WHERE action IN ('user.suspend','user.reactivate') ORDER BY created_at DESC LIMIT 25) a), '[]'::jsonb)
  ) INTO result;
  RETURN result;
END;$$;
