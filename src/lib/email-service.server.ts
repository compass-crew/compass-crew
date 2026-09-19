import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface SendEmailParams {
  to: string;
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  templateKey?: string;
  variables?: Record<string, string>;
}

export interface EmailDeliveryResult {
  sent: boolean;
  messageId?: string;
  provider?: string;
  reason?: string;
}

/**
 * Checks whether an active email provider is configured.
 * Safely inspects database provider settings and server environment.
 */
export async function getEmailProviderStatus(): Promise<{
  configured: boolean;
  provider: string;
  active: boolean;
  fromEmail: string;
}> {
  try {
    const { data } = await supabaseAdmin
      .from("email_provider_settings")
      .select("*")
      .eq("id", "default")
      .maybeSingle();

    const provider = data?.provider ?? "resend";
    const isActive = Boolean(data?.is_active);
    const fromEmail = data?.from_email || "";

    const hasResendEnv = Boolean(process.env.RESEND_API_KEY);
    const config = (data?.config as Record<string, string>) || {};
    const hasConfigKey = Boolean(config.api_key || config.apiKey || hasResendEnv);

    const configured = isActive && Boolean(fromEmail) && hasConfigKey;

    return {
      configured,
      provider,
      active: isActive,
      fromEmail,
    };
  } catch (err) {
    console.warn("[Email Service] Unable to read email settings:", err);
    return {
      configured: false,
      provider: "none",
      active: false,
      fromEmail: "",
    };
  }
}

/**
 * Clean server-side email delivery abstraction.
 * If provider is NOT configured, logs that email is disabled and returns sent: false.
 * NEVER fakes an email delivery success message.
 */
export async function sendEmailNotification(params: SendEmailParams): Promise<EmailDeliveryResult> {
  const status = await getEmailProviderStatus();

  if (!status.configured) {
    // Delivery is intentionally disabled when unconfigured.
    // In-app notifications continue to work seamlessly.
    console.info(
      `[Email Service] Email delivery skipped for "${params.to}". Provider "${status.provider}" is unconfigured or inactive.`,
    );
    return {
      sent: false,
      provider: status.provider,
      reason:
        "Email provider is unconfigured or inactive. Set up credentials in Admin -> Email Settings.",
    };
  }

  // If Resend API key is present, execute actual send
  if (status.provider === "resend") {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        return {
          sent: false,
          provider: "resend",
          reason: "RESEND_API_KEY not found in server environment.",
        };
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: status.fromEmail || "Compass Crew <no-reply@compasscrew.com>",
          to: [params.to],
          subject: params.subject,
          html: params.bodyHtml || `<p>${params.bodyText || ""}</p>`,
          text: params.bodyText,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[Email Service] Resend error:", errorText);
        return {
          sent: false,
          provider: "resend",
          reason: `Resend API rejected message: ${res.statusText}`,
        };
      }

      const data = (await res.json()) as { id?: string };
      return {
        sent: true,
        messageId: data.id,
        provider: "resend",
      };
    } catch (err) {
      console.error("[Email Service] Exception dispatching email:", err);
      return {
        sent: false,
        provider: "resend",
        reason: err instanceof Error ? err.message : "Internal transport error",
      };
    }
  }

  return {
    sent: false,
    provider: status.provider,
    reason: `Provider ${status.provider} transport not configured.`,
  };
}
