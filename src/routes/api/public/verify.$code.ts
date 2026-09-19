import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/verify/$code")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const code = String(params.code ?? "").trim();

        // Strict format verification: certificate codes are alphanumeric with dashes/underscores, max 64 chars
        if (!code || code.length > 64 || !/^[A-Za-z0-9_-]+$/.test(code)) {
          return new Response(JSON.stringify({ error: "invalid_code" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        // Rate limiting: 60 lookups / minute per IP to prevent scraping / brute-force
        try {
          const { enforceRateLimit } = await import("@/lib/rate-limit.server");
          await enforceRateLimit({
            key: "api:verify-certificate",
            limit: 60,
            windowSeconds: 60,
            errorMessage: "Rate limit exceeded. Please try again in a minute.",
          });
        } catch {
          return new Response(
            JSON.stringify({ error: "rate_limited", message: "Too many verification requests." }),
            {
              status: 429,
              headers: {
                "content-type": "application/json",
                "retry-after": "60",
              },
            },
          );
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: cert, error } = await supabaseAdmin
            .from("certificates")
            .select("code, recipient_name, type, subtitle, issued_at, hackathon_id")
            .eq("code", code)
            .maybeSingle();

          if (error || !cert) {
            return new Response(JSON.stringify({ found: false }), {
              status: 404,
              headers: { "content-type": "application/json" },
            });
          }

          let hackathon_title: string | null = null;
          let hackathon_slug: string | null = null;
          if (cert.hackathon_id) {
            const { data: h } = await supabaseAdmin
              .from("hackathons")
              .select("title, slug")
              .eq("id", cert.hackathon_id)
              .maybeSingle();
            hackathon_title = h?.title ?? null;
            hackathon_slug = h?.slug ?? null;
          }

          return new Response(
            JSON.stringify({
              found: true,
              certificate: {
                code: cert.code,
                recipient_name: cert.recipient_name,
                type: cert.type,
                subtitle: cert.subtitle,
                issued_at: cert.issued_at,
                hackathon_title,
                hackathon_slug,
              },
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json",
                "cache-control": "public, max-age=60",
              },
            },
          );
        } catch {
          return new Response(JSON.stringify({ error: "internal_error" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
