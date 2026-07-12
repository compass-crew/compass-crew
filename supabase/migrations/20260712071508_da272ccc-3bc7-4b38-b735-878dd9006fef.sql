
-- Team invitations (email-based, before user must exist)
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  invited_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined','revoked','expired')),
  token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, email)
);
CREATE INDEX idx_team_invitations_team ON public.team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON public.team_invitations(lower(email));
CREATE UNIQUE INDEX idx_team_invitations_token ON public.team_invitations(token);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_invitations TO authenticated;
GRANT ALL ON public.team_invitations TO service_role;

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Helper: find user id by email (security definer, reads auth.users)
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(_email text)
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
  SELECT id FROM auth.users WHERE lower(email) = lower(_email) LIMIT 1;
$$;

-- Helper: email of current user (for RLS on invitations)
CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, auth
AS $$
  SELECT lower(email) FROM auth.users WHERE id = auth.uid();
$$;

-- RLS policies
CREATE POLICY "Leader manages invitations"
  ON public.team_invitations FOR ALL
  TO authenticated
  USING (public.is_team_leader(auth.uid(), team_id) OR public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.is_team_leader(auth.uid(), team_id) OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Invitee views own invitations"
  ON public.team_invitations FOR SELECT
  TO authenticated
  USING (lower(email) = public.current_user_email());

CREATE POLICY "Invitee updates own invitation status"
  ON public.team_invitations FOR UPDATE
  TO authenticated
  USING (lower(email) = public.current_user_email())
  WITH CHECK (lower(email) = public.current_user_email() AND status IN ('accepted','declined'));

CREATE TRIGGER trg_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Public join flag on teams
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS is_open boolean NOT NULL DEFAULT false;

-- Allow a signed-in user to view teams that are open (for the "join via code" surface)
-- and to view teams in hackathons they registered for.
CREATE POLICY "Open teams visible to authenticated users"
  ON public.teams FOR SELECT
  TO authenticated
  USING (is_open = true);
