
CREATE OR REPLACE FUNCTION public.get_admin_activity(_limit int DEFAULT 50)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'super_admin'::public.app_role) THEN
    RAISE EXCEPTION 'not authorized';
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(item ORDER BY (item->>'at') DESC)
    FROM (
      (SELECT jsonb_build_object('kind','registration','at',created_at,'title','New registration','ref',id::text) AS item
       FROM public.registrations ORDER BY created_at DESC LIMIT _limit)
      UNION ALL
      (SELECT jsonb_build_object('kind','team','at',created_at,'title','Team created: ' || COALESCE(name,''),'ref',id::text)
       FROM public.teams ORDER BY created_at DESC LIMIT _limit)
      UNION ALL
      (SELECT jsonb_build_object('kind','submission','at',COALESCE(submitted_at,created_at),'title','Submission: ' || COALESCE(name,'Untitled'),'ref',id::text)
       FROM public.submissions WHERE submitted_at IS NOT NULL ORDER BY submitted_at DESC LIMIT _limit)
      UNION ALL
      (SELECT jsonb_build_object('kind','certificate','at',issued_at,'title','Certificate issued','ref',id::text)
       FROM public.certificates ORDER BY issued_at DESC LIMIT _limit)
      UNION ALL
      (SELECT jsonb_build_object('kind','audit','at',created_at,'title',action,'ref',resource_id)
       FROM public.audit_logs ORDER BY created_at DESC LIMIT _limit)
    ) u
  ), '[]'::jsonb);
END;$$;
REVOKE ALL ON FUNCTION public.get_admin_activity(int) FROM public;
GRANT EXECUTE ON FUNCTION public.get_admin_activity(int) TO authenticated;
