-- Platform settings: one row per section
CREATE TABLE public.platform_settings (
  section TEXT PRIMARY KEY,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings public read"
  ON public.platform_settings FOR SELECT
  USING (true);

CREATE POLICY "platform_settings super admin insert"
  ON public.platform_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "platform_settings super admin update"
  ON public.platform_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "platform_settings super admin delete"
  ON public.platform_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE TRIGGER platform_settings_set_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed empty sections so admin editor always has rows
INSERT INTO public.platform_settings (section, data) VALUES
  ('general', '{"platform_name":"Compass Crew","tagline":"","description":""}'::jsonb),
  ('branding', '{"logo_url":"","favicon_url":"","hero_background_url":"","primary_color":"","accent_color":""}'::jsonb),
  ('homepage', '{"hero_title":"","hero_subtitle":"","cta_primary_label":"","cta_primary_url":"","cta_secondary_label":"","cta_secondary_url":"","stats":[]}'::jsonb),
  ('navigation', '{"links":[]}'::jsonb),
  ('footer', '{"tagline":"","columns":[],"copyright":""}'::jsonb),
  ('contact', '{"support_email":"","press_email":"","phone":"","address":""}'::jsonb),
  ('social', '{"linkedin":"","instagram":"","github":"","x":"","youtube":""}'::jsonb),
  ('seo', '{"default_title":"","default_description":"","og_image_url":"","twitter_handle":""}'::jsonb),
  ('analytics', '{"ga4_id":"","gtm_id":"","plausible_domain":"","posthog_key":""}'::jsonb);

-- Email templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL DEFAULT '',
  body_markdown TEXT NOT NULL DEFAULT '',
  variables TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_templates super admin all"
  ON public.email_templates FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE TRIGGER email_templates_set_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed built-in templates
INSERT INTO public.email_templates (key, name, description, subject, body_markdown, variables) VALUES
  ('verification', 'Email Verification', 'Sent when a user verifies their email address.', 'Verify your email — {{platform_name}}', E'Hi {{user_name}},\n\nWelcome to {{platform_name}}. Please verify your email by clicking the link below:\n\n{{verification_url}}\n\nIf you did not sign up, you can ignore this message.', ARRAY['platform_name','user_name','verification_url']),
  ('password_reset', 'Password Reset', 'Sent when a user requests a password reset.', 'Reset your password — {{platform_name}}', E'Hi {{user_name}},\n\nWe received a request to reset your password. Use the link below to choose a new one:\n\n{{reset_url}}\n\nThis link expires in 1 hour. If you did not request this, you can ignore the email.', ARRAY['platform_name','user_name','reset_url']),
  ('registration', 'Registration Confirmation', 'Sent when a participant registers for a hackathon.', 'You are registered for {{hackathon_name}}', E'Hi {{user_name}},\n\nYour registration for **{{hackathon_name}}** is confirmed.\n\nKey dates:\n- Starts: {{start_date}}\n- Submission deadline: {{deadline}}\n\nOpen your dashboard: {{dashboard_url}}', ARRAY['user_name','hackathon_name','start_date','deadline','dashboard_url']),
  ('team_invitation', 'Team Invitation', 'Sent when a user is invited to join a team.', '{{inviter_name}} invited you to join {{team_name}}', E'Hi,\n\n{{inviter_name}} invited you to join **{{team_name}}** for {{hackathon_name}}.\n\nAccept the invitation: {{invitation_url}}', ARRAY['inviter_name','team_name','hackathon_name','invitation_url']),
  ('submission_confirmed', 'Submission Confirmed', 'Sent when a team submits their project.', 'Submission received — {{hackathon_name}}', E'Hi {{user_name}},\n\nWe received **{{project_title}}** from team **{{team_name}}** for {{hackathon_name}}.\n\nYou can view your submission any time: {{submission_url}}', ARRAY['user_name','team_name','project_title','hackathon_name','submission_url']),
  ('results_announced', 'Results Announced', 'Sent when hackathon results are published.', 'Results are in — {{hackathon_name}}', E'Hi {{user_name}},\n\nResults for {{hackathon_name}} are live. Congratulations to every team that submitted.\n\nView the leaderboard: {{leaderboard_url}}', ARRAY['user_name','hackathon_name','leaderboard_url']),
  ('certificate_issued', 'Certificate Issued', 'Sent when a participant receives a certificate.', 'Your certificate is ready — {{hackathon_name}}', E'Hi {{user_name}},\n\nYour certificate for {{hackathon_name}} is ready.\n\nDownload: {{certificate_url}}\nVerify: {{verify_url}}', ARRAY['user_name','hackathon_name','certificate_url','verify_url']),
  ('newsletter', 'Newsletter', 'General newsletter template.', '{{subject}}', E'{{body}}\n\n—\nYou are receiving this because you subscribed to {{platform_name}} updates.', ARRAY['subject','body','platform_name']);

-- Email provider settings singleton
CREATE TABLE public.email_provider_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  provider TEXT NOT NULL DEFAULT 'lovable',
  from_email TEXT NOT NULL DEFAULT '',
  from_name TEXT NOT NULL DEFAULT '',
  reply_to TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT email_provider_settings_singleton CHECK (id = 'default'),
  CONSTRAINT email_provider_valid CHECK (provider IN ('lovable','zoho','resend','smtp'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_provider_settings TO authenticated;
GRANT ALL ON public.email_provider_settings TO service_role;

ALTER TABLE public.email_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_provider_settings super admin all"
  ON public.email_provider_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE TRIGGER email_provider_settings_set_updated_at
  BEFORE UPDATE ON public.email_provider_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.email_provider_settings (id, provider, from_email, from_name)
  VALUES ('default', 'lovable', '', 'Compass Crew');
