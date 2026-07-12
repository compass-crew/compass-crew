import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/verify/$code")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const code = String(params.code ?? "").trim();
        if (!code || code.length > 128) {
          return new Response(JSON.stringify({ error: "invalid_code" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
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
      },
    },
  },
});
