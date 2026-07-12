import { supabase } from "@/integrations/supabase/client";

export type EmailProvider = "lovable" | "zoho" | "resend" | "smtp";

export interface EmailProviderSettings {
  id: string;
  provider: EmailProvider;
  from_email: string;
  from_name: string;
  reply_to: string;
  config: Record<string, string>;
  is_active: boolean;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  subject: string;
  body_markdown: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchEmailProviderSettings(): Promise<EmailProviderSettings> {
  const { data, error } = await supabase
    .from("email_provider_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) {
    return {
      id: "default",
      provider: "lovable",
      from_email: "",
      from_name: "",
      reply_to: "",
      config: {},
      is_active: true,
      updated_at: new Date().toISOString(),
    };
  }
  return {
    ...data,
    provider: data.provider as EmailProvider,
    config: (data.config as Record<string, string>) ?? {},
  };
}

export async function updateEmailProviderSettings(
  patch: Partial<Omit<EmailProviderSettings, "id" | "updated_at">>,
): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const { error } = await supabase.from("email_provider_settings").upsert(
    {
      id: "default",
      ...patch,
      config: patch.config as never,
      updated_by: userRes.user?.id ?? null,
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);
}

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as EmailTemplate[];
}

export async function getEmailTemplate(id: string): Promise<EmailTemplate | null> {
  const { data, error } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as EmailTemplate | null;
}

export async function updateEmailTemplate(
  id: string,
  patch: Partial<Pick<EmailTemplate, "subject" | "body_markdown" | "is_active" | "name" | "description" | "variables">>,
): Promise<void> {
  const { data: userRes } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("email_templates")
    .update({ ...patch, updated_by: userRes.user?.id ?? null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export function renderTemplatePreview(
  body: string,
  variables: string[],
  values: Record<string, string> = {},
): string {
  let out = body;
  for (const key of variables) {
    const val = values[key] ?? `{{${key}}}`;
    out = out.replaceAll(`{{${key}}}`, val);
  }
  return out;
}

export const PROVIDER_OPTIONS: { value: EmailProvider; label: string; description: string; requiresSecrets: string[] }[] = [
  {
    value: "lovable",
    label: "Lovable Emails",
    description: "Managed sending via Lovable's built-in email infrastructure. Recommended.",
    requiresSecrets: [],
  },
  {
    value: "zoho",
    label: "Zoho Mail",
    description: "Send through Zoho Mail SMTP. Requires SMTP credentials once activated.",
    requiresSecrets: ["ZOHO_SMTP_HOST", "ZOHO_SMTP_USER", "ZOHO_SMTP_PASSWORD"],
  },
  {
    value: "resend",
    label: "Resend",
    description: "Send through Resend API. Requires an API key once activated.",
    requiresSecrets: ["RESEND_API_KEY"],
  },
  {
    value: "smtp",
    label: "Custom SMTP",
    description: "Any SMTP-compatible provider. Requires host, port, user, password.",
    requiresSecrets: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD"],
  },
];
