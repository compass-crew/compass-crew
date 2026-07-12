import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/certificates/$code")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const code = params.code.replace(/\.pdf$/i, "");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: cert, error } = await supabaseAdmin
          .from("certificates")
          .select("pdf_url, recipient_name")
          .eq("code", code)
          .maybeSingle();
        if (error || !cert || !cert.pdf_url) {
          return new Response("Certificate not found", { status: 404 });
        }
        const { data: file, error: dlErr } = await supabaseAdmin.storage
          .from("certificates")
          .download(cert.pdf_url);
        if (dlErr || !file) {
          return new Response("File missing", { status: 404 });
        }
        const buf = await file.arrayBuffer();
        return new Response(buf, {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `inline; filename="compass-crew-${code}.pdf"`,
            "cache-control": "public, max-age=300",
          },
        });
      },
    },
  },
});
