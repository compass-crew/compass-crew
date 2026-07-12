import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/cms-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat;
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from("cms-media").download(path);
          if (error || !data) {
            return new Response("Not found", { status: 404 });
          }
          const buf = await data.arrayBuffer();
          const contentType = data.type || "application/octet-stream";
          return new Response(buf, {
            headers: {
              "content-type": contentType,
              "cache-control": "public, max-age=3600, s-maxage=86400",
            },
          });
        } catch {
          return new Response("Not found", { status: 404 });
        }
      },
    },
  },
});
