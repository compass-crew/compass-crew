-- ==============================================================================
-- Compass Crew — Security Foundation & Profile Synchronization Migration
-- ==============================================================================

-- 1. Enhance handle_new_user() trigger to populate extended profile fields
-- directly from auth.users.raw_user_meta_data without client-side race conditions.
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

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Enforce strict RLS verification on sensitive administrative tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_provider_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
