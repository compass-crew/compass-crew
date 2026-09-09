import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

/**
 * Server-owned submission pipeline for anonymous public forms.
 *
 * Flow:
 *   1. Validate input with Zod (strict length/format caps).
 *   2. Verify Cloudflare Turnstile token (skipped only if secret unset in dev).
 *   3. Enforce a simple per-IP rate limit (10 submissions / hour / form).
 *   4. Insert via supabaseAdmin (RLS bypassed on purpose — anonymous inserts
 *      are no longer allowed at the RLS layer; this is the only ingress).
 */

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(2).max(200),
  message: z.string().trim().min(5).max(4000),
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

async function guard(kind: FormKind, token: string | null | undefined) {
  const { verifyTurnstile, hashIp } = await import("./turnstile.server");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    getRequestIP({ xForwardedFor: true }) ??
    "0.0.0.0";
  const ipHash = await hashIp(ip);

  // Rate limit: 10 submissions per IP per form per hour.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: cErr } = await supabaseAdmin
    .from("public_form_events")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("form_kind", kind)
    .gte("created_at", since);
  if (cErr) throw new Error("Rate check failed.");
  if ((count ?? 0) >= 10) {
    throw new Error("Too many submissions from this network. Try again later.");
  }

  const verify = await verifyTurnstile(token ?? null, ip);
  if (!verify.ok) {
    throw new Error("Security check failed. Please refresh and try again.");
  }

  await supabaseAdmin
    .from("public_form_events")
    .insert({ ip_hash: ipHash, form_kind: kind });

  return { supabaseAdmin };
}

export const submitContactMessageFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const { turnstileToken, ...row } = data;
    const { supabaseAdmin } = await guard("contact", turnstileToken);
    const { error } = await supabaseAdmin.from("contact_messages").insert(row);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const submitPartnerApplicationFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => partnerSchema.parse(data))
  .handler(async ({ data }) => {
    const { turnstileToken, website, ...rest } = data;
    const { supabaseAdmin } = await guard("partner", turnstileToken);
    const { error } = await supabaseAdmin
      .from("partner_applications")
      .insert({ ...rest, website: website ?? null });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const subscribeNewsletterFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => newsletterSchema.parse(data))
  .handler(async ({ data }) => {
    const { turnstileToken, email, source } = data;
    const { supabaseAdmin } = await guard("newsletter", turnstileToken);
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase(), source });
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error(error.message);
    }
    return { ok: true as const };
  });

// Public site key exposure — public value, safe to return.
export const getTurnstileSiteKey = createServerFn({ method: "GET" }).handler(async () => {
  return { siteKey: process.env.TURNSTILE_SITE_KEY ?? null };
});
