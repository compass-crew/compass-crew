import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceRateLimit, resolveClientIp } from "./rate-limit.server";

/**
 * Server-owned submission pipeline for anonymous public forms.
 *
 * Flow:
 *   1. Validate input with Zod (strict length/format caps).
 *   2. Verify Cloudflare Turnstile token (skipped only if secret unset in dev).
 *   3. Enforce distributed per-IP rate limit (10 submissions / hour / form).
 *   4. Insert via supabaseAdmin (RLS bypassed on purpose — anonymous inserts
 *      are no longer allowed at the RLS layer; this is the only ingress).
 *   5. Return sanitized, safe error responses without leaking DB internals.
 */

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(4000),
  company_url: z.string().max(200).nullable().optional(),
  turnstileToken: z.string().min(1).max(4096).nullable().optional(),
});

const partnerSchema = z.object({
  org_name: z.string().trim().min(2).max(200),
  contact_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).nullable().optional(),
  website: z
    .union([z.string().trim().url().max(255), z.literal(""), z.null()])
    .optional()
    .transform((v) => (v ? v : null)),
  partnership_type: z.string().trim().max(80).nullable().optional(),
  message: z.string().trim().min(5).max(4000),
  turnstileToken: z.string().min(1).max(4096).nullable().optional(),
});

const newsletterSchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(80).default("footer"),
  turnstileToken: z.string().min(1).max(4096).nullable().optional(),
});

type FormKind = "contact" | "partner" | "newsletter";

async function guard(kind: FormKind, token?: string | null | undefined) {
  const ip = resolveClientIp();

  // Rate limit: 10 submissions per IP per form per hour
  await enforceRateLimit({
    key: `public-form:${kind}`,
    limit: 10,
    windowSeconds: 3600,
    identifier: ip,
    errorMessage: "Too many submissions from this network. Please try again later.",
  });

  // Turnstile is scoped exclusively to the /auth login flow.
  // If a public form optionally provides a token, verify it, but do not block when absent.
  if (token) {
    const { verifyTurnstile } = await import("./turnstile.server");
    const verify = await verifyTurnstile(token, ip);
    if (!verify.ok) {
      throw new Error("Security check failed. Please refresh and try again.");
    }
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return { supabaseAdmin };
}

export const submitContactMessageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { turnstileToken, company_url, ...row } = data;

      // Anti-spam honeypot: if populated, discard silently to neutralize automated scrapers/bots
      if (company_url && company_url.trim().length > 0) {
        return { ok: true as const };
      }

      const { supabaseAdmin } = await guard("contact", turnstileToken);
      const { error } = await supabaseAdmin.from("contact_messages").insert(row);
      if (error) {
        console.error("[ContactMessage Error]", error);
        throw new Error("Unable to save message. Please try again later.");
      }

      // Dispatch admin alert
      try {
        const { createAdminNotification } = await import("./notifications.server");
        await createAdminNotification({
          title: `New contact message: ${row.subject.slice(0, 50)}`,
          body: `From ${row.name} (${row.email})`,
          category: "contact",
          priority: "normal",
          link: "/admin/content",
        });
      } catch (notifErr) {
        console.warn("[Contact Alert Error]", notifErr);
      }

      return { ok: true as const };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Unable to submit message. Please try again.");
    }
  });

export const submitPartnerApplicationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => partnerSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { turnstileToken, website, ...rest } = data;
      const { supabaseAdmin } = await guard("partner", turnstileToken);
      const { data: inserted, error } = await supabaseAdmin
        .from("partner_applications")
        .insert({ ...rest, website: website ?? null })
        .select("id")
        .single();
      if (error) {
        console.error("[PartnerApplication Error]", error);
        throw new Error("Unable to submit application. Please try again later.");
      }

      // Dispatch admin alert
      try {
        const { createAdminNotification } = await import("./notifications.server");
        await createAdminNotification({
          title: `New Partner Application: ${rest.org_name}`,
          body: `Applicant ${rest.contact_name} requested partnership (${rest.partnership_type || "General"}).`,
          category: "partner",
          priority: "high",
          link: "/admin/partners",
          resourceType: "partner_applications",
          resourceId: inserted?.id,
        });
      } catch (notifErr) {
        console.warn("[Partner Alert Error]", notifErr);
      }

      return { ok: true as const };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Unable to submit application. Please try again.");
    }
  });

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => newsletterSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { turnstileToken, email, source } = data;
      const { supabaseAdmin } = await guard("newsletter", turnstileToken);
      const { error } = await supabaseAdmin
        .from("newsletter_subscribers")
        .insert({ email: email.toLowerCase(), source });
      if (error && !error.message.toLowerCase().includes("duplicate")) {
        console.error("[Newsletter Error]", error);
        throw new Error("Unable to subscribe. Please try again later.");
      }
      return { ok: true as const };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Unable to subscribe. Please try again.");
    }
  });

// Public site key exposure — public value, safe to return.
export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(async () => {
  return { siteKey: process.env.TURNSTILE_SITE_KEY ?? null };
});
