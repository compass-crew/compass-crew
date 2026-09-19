-- ==============================================================================
-- Migration: 20260917000000_provision_admin_accounts.sql
-- Description: Ensures authorized administrator accounts receive super_admin
-- in public.user_roles for Compass Crew internal operating system.
-- ==============================================================================

-- 1. Provision super_admin role for existing auth accounts matching the authorized admin emails
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role
FROM auth.users
WHERE lower(email) IN ('solankikamal55143@gmail.com', 'compasscrewnetwork.team@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Update handle_new_user() trigger function to automatically provision super_admin
-- when an authorized admin account registers in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    newsletter_opt_in,
    country,
    state,
    college,
    degree,
    year_of_study,
    branch,
    linkedin_url,
    github_url
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE((NEW.raw_user_meta_data->>'newsletter_opt_in')::boolean, false),
    NEW.raw_user_meta_data->>'country',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'degree',
    NEW.raw_user_meta_data->>'year_of_study',
    NEW.raw_user_meta_data->>'branch',
    NEW.raw_user_meta_data->>'linkedin_url',
    NEW.raw_user_meta_data->>'github_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    newsletter_opt_in = EXCLUDED.newsletter_opt_in;

  -- Assign participant role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'participant')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Automatically grant super_admin to designated platform administrative accounts
  IF lower(NEW.email) IN ('solankikamal55143@gmail.com', 'compasscrewnetwork.team@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;
