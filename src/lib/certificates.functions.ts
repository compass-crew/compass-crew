import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHost } from "@tanstack/react-start/server";
import { enforceRateLimit } from "@/lib/rate-limit.server";
import type { Database } from "@/integrations/supabase/types";

type CertificateType = Database["public"]["Enums"]["certificate_type"];

const CERT_TYPES = [
  "participation",
  "winner",
  "runner_up",
  "special_mention",
  "judge",
  "mentor",
  "organizer",
  "campus_ambassador",
  "volunteer",
] as const;

const TITLE_BY_TYPE: Record<CertificateType, string> = {
  participation: "Certificate of Participation",
  winner: "Certificate of Achievement",
  runner_up: "Certificate of Achievement",
  special_mention: "Certificate of Special Mention",
  judge: "Certificate of Appreciation",
  mentor: "Certificate of Appreciation",
  organizer: "Certificate of Appreciation",
  campus_ambassador: "Certificate of Appreciation",
  volunteer: "Certificate of Appreciation",
};

const SUBTITLE_BY_TYPE: Record<CertificateType, string> = {
  participation: "for actively participating in",
  winner: "for winning",
  runner_up: "as the Runner-up of",
  special_mention: "for a Special Mention at",
  judge: "for judging at",
  mentor: "for mentoring at",
  organizer: "for organising",
  campus_ambassador: "for championing Compass Crew as Campus Ambassador at",
  volunteer: "for volunteering at",
};

function genCode(): string {
  // CC-XXXXXX-XXXX pattern
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `CC-${pick(6)}-${pick(4)}`;
}

async function verifyOrganizer(
  supabase: import("@supabase/supabase-js").SupabaseClient,
  userId: string,
  hackathonId: string | null,
) {
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "super_admin",
  });
  if (isAdmin) return;
  if (!hackathonId) throw new Error("Forbidden");
  const { data: ok } = await supabase.rpc("is_hackathon_organizer", {
    _user_id: userId,
    _hackathon_id: hackathonId,
  });
  if (!ok) throw new Error("Forbidden");
}

async function buildPdf(input: {
  code: string;
  title: string;
  subtitleLead: string;
  recipient: string;
  hackathonTitle: string | null;
  role: string;
  issueDate: string;
  verifyUrl: string;
  organizerName: string;
}): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  const QRCode = (await import("qrcode")).default;

  const pdf = await PDFDocument.create();
  // Landscape A4-ish
  const page = pdf.addPage([842, 595]);
  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const brand = rgb(0.09, 0.36, 0.93); // #1758ED-ish
  const ink = rgb(0.08, 0.09, 0.15);
  const muted = rgb(0.42, 0.44, 0.53);
  const soft = rgb(0.94, 0.96, 1);

  // Background frame
  page.drawRectangle({ x: 0, y: 0, width: 842, height: 595, color: rgb(1, 1, 1) });
  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: brand, borderWidth: 2 });
  page.drawRectangle({
    x: 32,
    y: 32,
    width: 778,
    height: 531,
    borderColor: brand,
    borderWidth: 0.5,
    opacity: 0.4,
  });

  // Accent corners
  page.drawRectangle({ x: 32, y: 501, width: 240, height: 62, color: soft });
  page.drawRectangle({ x: 570, y: 32, width: 240, height: 62, color: soft });

  // Brand
  page.drawText("COMPASS CREW", {
    x: 60,
    y: 528,
    size: 14,
    font: helvBold,
    color: brand,
  });
  page.drawText("India's student innovation platform", {
    x: 60,
    y: 512,
    size: 8,
    font: helv,
    color: muted,
  });

  // Title
  const title = input.title.toUpperCase();
  const titleWidth = helvBold.widthOfTextAtSize(title, 30);
  page.drawText(title, { x: (842 - titleWidth) / 2, y: 430, size: 30, font: helvBold, color: ink });

  page.drawLine({
    start: { x: 321, y: 415 },
    end: { x: 521, y: 415 },
    thickness: 1.2,
    color: brand,
  });

  const presented = "This certificate is proudly presented to";
  const pw = helv.widthOfTextAtSize(presented, 12);
  page.drawText(presented, { x: (842 - pw) / 2, y: 385, size: 12, font: helv, color: muted });

  // Recipient
  const recipient = input.recipient || "Recipient";
  const recW = helvBold.widthOfTextAtSize(recipient, 34);
  page.drawText(recipient, { x: (842 - recW) / 2, y: 335, size: 34, font: helvBold, color: brand });

  // Body
  const body = `${input.subtitleLead}${input.hackathonTitle ? ` ${input.hackathonTitle}` : ""}.`;
  const bw = italic.widthOfTextAtSize(body, 13);
  page.drawText(body, {
    x: (842 - Math.min(bw, 700)) / 2,
    y: 290,
    size: 13,
    font: italic,
    color: ink,
  });

  // Role line
  const roleLine = `Role: ${input.role}`;
  const rw = helv.widthOfTextAtSize(roleLine, 11);
  page.drawText(roleLine, { x: (842 - rw) / 2, y: 268, size: 11, font: helv, color: muted });

  // Left bottom: date + organizer signature line
  page.drawText("Issued on", { x: 80, y: 130, size: 9, font: helv, color: muted });
  page.drawText(input.issueDate, { x: 80, y: 112, size: 12, font: helvBold, color: ink });
  page.drawLine({
    start: { x: 80, y: 100 },
    end: { x: 240, y: 100 },
    thickness: 0.7,
    color: muted,
  });
  page.drawText("Issue Date", { x: 80, y: 86, size: 8, font: helv, color: muted });

  page.drawText(input.organizerName, { x: 300, y: 112, size: 12, font: helvBold, color: ink });
  page.drawLine({
    start: { x: 300, y: 100 },
    end: { x: 500, y: 100 },
    thickness: 0.7,
    color: muted,
  });
  page.drawText("Authorised Signatory · Compass Crew", {
    x: 300,
    y: 86,
    size: 8,
    font: helv,
    color: muted,
  });

  // QR code (right bottom)
  const qrData = await QRCode.toDataURL(input.verifyUrl, {
    margin: 0,
    width: 220,
    color: { dark: "#0E1226", light: "#FFFFFF" },
  });
  const qrBytes = Uint8Array.from(atob(qrData.split(",")[1]), (c) => c.charCodeAt(0));
  const qrImg = await pdf.embedPng(qrBytes);
  page.drawImage(qrImg, { x: 700, y: 70, width: 90, height: 90 });
  page.drawText("Verify authenticity", { x: 680, y: 55, size: 8, font: helv, color: muted });
  page.drawText(input.code, { x: 680, y: 42, size: 9, font: helvBold, color: ink });

  // Watermark
  page.drawText("COMPASS CREW", {
    x: 200,
    y: 250,
    size: 82,
    font: helvBold,
    color: brand,
    opacity: 0.04,
    rotate: degrees(-18),
  });

  return await pdf.save();
}

const generateCertSchema = z.object({
  hackathonId: z.string().trim().uuid(),
  userId: z.string().trim().uuid(),
  type: z.enum(CERT_TYPES),
  achievement: z.string().trim().max(120).optional(),
  recipientName: z.string().trim().max(120).optional(),
});

export const generateCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => generateCertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId: callerId } = context;

    await enforceRateLimit({
      key: "cert:generate",
      limit: 30,
      windowSeconds: 60,
      identifier: callerId,
      errorMessage: "Certificate generation limit reached. Please wait a minute.",
    });

    await verifyOrganizer(supabase, callerId, data.hackathonId ?? null);

    if ((data.type as string) === "campus_ambassador") {
      throw new Error(
        "The Campus Ambassador program has been retired. This certificate type can no longer be issued.",
      );
    }

    try {
      // Load hackathon + recipient profile + caller profile
      const [{ data: hack }, { data: recipient }, { data: caller }] = await Promise.all([
        supabase
          .from("hackathons")
          .select("id, title, results_at")
          .eq("id", data.hackathonId)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("id, full_name, username")
          .eq("id", data.userId)
          .maybeSingle(),
        supabase.from("profiles").select("id, full_name").eq("id", callerId).maybeSingle(),
      ]);
      if (!hack) throw new Error("Hackathon not found");

      const recipientName =
        data.recipientName?.trim() ||
        recipient?.full_name?.trim() ||
        recipient?.username?.trim() ||
        "Recipient";
      const organizerName = caller?.full_name?.trim() || "Compass Crew";

      // Generate unique code (retry on collision)
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      let code = genCode();
      for (let i = 0; i < 5; i++) {
        const { data: exists } = await supabaseAdmin
          .from("certificates")
          .select("id")
          .eq("code", code)
          .maybeSingle();
        if (!exists) break;
        code = genCode();
      }

      let host = "";
      try {
        host = getRequestHost();
      } catch {
        host = "";
      }
      const origin = host ? `https://${host}` : "";
      const verifyUrl = `${origin}/verify/${code}`;

      const title = TITLE_BY_TYPE[data.type];
      const subtitleLead = SUBTITLE_BY_TYPE[data.type];
      const roleLabel =
        data.achievement?.trim() ||
        {
          participation: "Participant",
          winner: "Winner",
          runner_up: "Runner-up",
          special_mention: "Special Mention",
          judge: "Judge",
          mentor: "Mentor",
          organizer: "Organizer",
          campus_ambassador: "Campus Ambassador",
          volunteer: "Volunteer",
        }[data.type];

      const issueDate = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const pdfBytes = await buildPdf({
        code,
        title,
        subtitleLead,
        recipient: recipientName,
        hackathonTitle: hack.title,
        role: roleLabel,
        issueDate,
        verifyUrl,
        organizerName,
      });

      const path = `${data.hackathonId}/${code}.pdf`;
      const { error: upErr } = await supabaseAdmin.storage
        .from("certificates")
        .upload(path, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) {
        console.error("[Cert Storage Error]", upErr);
        throw new Error("Failed to store certificate PDF.");
      }

      // Insert or update certificate row (unique on code)
      const { data: inserted, error: insErr } = await supabaseAdmin
        .from("certificates")
        .insert({
          code,
          user_id: data.userId,
          hackathon_id: data.hackathonId,
          type: data.type,
          title,
          subtitle: `${subtitleLead}${hack.title ? ` ${hack.title}` : ""}`,
          recipient_name: recipientName,
          pdf_url: path,
        })
        .select()
        .single();
      if (insErr) {
        console.error("[Cert Insert Error]", insErr);
        throw new Error("Failed to record certificate.");
      }

      await supabaseAdmin.from("notifications").insert({
        user_id: data.userId,
        type: "certificate_ready",
        title: "Your certificate is ready",
        body: `${title} for ${hack.title}`,
        link: `/certificates`,
      });

      return { id: inserted.id, code, path };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Certificate creation failed.");
    }
  });

const bulkGenerateSchema = z.object({
  hackathonId: z.string().trim().uuid(),
});

export const bulkGenerateParticipation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => bulkGenerateSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId: callerId } = context;

    await enforceRateLimit({
      key: "cert:bulk-generate",
      limit: 5,
      windowSeconds: 300,
      identifier: callerId,
      errorMessage: "Bulk certificate generation is throttled. Please wait before retrying.",
    });

    await verifyOrganizer(supabase, callerId, data.hackathonId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: regs, error } = await supabaseAdmin
      .from("registrations")
      .select("user_id")
      .eq("hackathon_id", data.hackathonId)
      .eq("status", "approved");
    if (error) {
      console.error("[Bulk Cert Fetch Error]", error);
      throw new Error("Failed to fetch registrations.");
    }
    const { data: existing } = await supabaseAdmin
      .from("certificates")
      .select("user_id, type")
      .eq("hackathon_id", data.hackathonId)
      .eq("type", "participation");
    const has = new Set((existing ?? []).map((c) => c.user_id));
    let issued = 0;
    for (const r of regs ?? []) {
      if (has.has(r.user_id)) continue;
      try {
        await generateCertificate({
          data: { hackathonId: data.hackathonId, userId: r.user_id, type: "participation" },
        });
        issued += 1;
      } catch (e) {
        console.error("cert gen failed for", r.user_id, e);
      }
    }
    return { issued, total: regs?.length ?? 0 };
  });

const publishResultsSchema = z.object({
  hackathonId: z.string().trim().uuid(),
  freeze: z.boolean().optional(),
});

export const publishResults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => publishResultsSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId: callerId } = context;

    await enforceRateLimit({
      key: "hackathon:publish-results",
      limit: 10,
      windowSeconds: 60,
      identifier: callerId,
      errorMessage: "Publishing is throttled. Please wait.",
    });

    await verifyOrganizer(supabase, callerId, data.hackathonId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Compute leaderboard using admin (server-side)
    const [{ data: subs }, { data: crit }] = await Promise.all([
      supabaseAdmin
        .from("submissions")
        .select("*")
        .eq("hackathon_id", data.hackathonId)
        .eq("status", "submitted"),
      supabaseAdmin.from("scoring_criteria").select("*").eq("hackathon_id", data.hackathonId),
    ]);
    const { data: scores } = await supabaseAdmin
      .from("scores")
      .select("*")
      .in(
        "submission_id",
        (subs ?? []).map((s) => s.id),
      )
      .eq("is_final", true);
    const { rankSubmissions } = await import("@/lib/leaderboard");
    const ranked = rankSubmissions(
      (subs ?? []) as never,
      (crit ?? []) as never,
      (scores ?? []) as never,
    );

    for (const entry of ranked) {
      let award: string | null = null;
      if (entry.rank === 1) award = "Winner";
      else if (entry.rank === 2) award = "Runner-up";
      else if (entry.rank === 3) award = "Second Runner-up";
      await supabaseAdmin
        .from("submissions")
        .update({ final_rank: entry.rank, award })
        .eq("id", entry.submission_id);
    }

    await supabaseAdmin
      .from("hackathons")
      .update({
        results_published_at: new Date().toISOString(),
        leaderboard_frozen: data.freeze ?? true,
      })
      .eq("id", data.hackathonId);

    // Notify all registered users
    const { data: regs } = await supabaseAdmin
      .from("registrations")
      .select("user_id")
      .eq("hackathon_id", data.hackathonId);
    if (regs?.length) {
      await supabaseAdmin.from("notifications").insert(
        regs.map((r) => ({
          user_id: r.user_id,
          type: "results_published" as const,
          title: "Results are live",
          body: "The final leaderboard has been published.",
          link: `/hackathons`,
        })),
      );
    }
    return { ok: true, ranked: ranked.length };
  });

const revokeCertSchema = z.object({
  certificateId: z.string().trim().uuid(),
});

export const revokeCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => revokeCertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId: callerId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: cert } = await supabaseAdmin
      .from("certificates")
      .select("*")
      .eq("id", data.certificateId)
      .maybeSingle();
    if (!cert) throw new Error("Not found");
    await verifyOrganizer(supabase, callerId, cert.hackathon_id);
    if (cert.pdf_url) {
      await supabaseAdmin.storage.from("certificates").remove([cert.pdf_url]);
    }
    await supabaseAdmin.from("certificates").delete().eq("id", data.certificateId);
    return { ok: true };
  });
