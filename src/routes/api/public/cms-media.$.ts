import { createFileRoute } from "@tanstack/react-router";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export const Route = createFileRoute("/api/public/cms-media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        let path = params._splat;
        if (!path) {
          return new Response("Not found", { status: 404 });
        }

        // URL decode to catch encoded traversal attempts
        try {
          path = decodeURIComponent(path);
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        // Block path traversal and invalid characters
        // eslint-disable-next-line no-control-regex
        if (path.includes("..") || path.includes("\\") || /[\x00-\x1f\x7f]/.test(path)) {
          return new Response("Not found", { status: 404 });
        }

        // Enforce safe media file path structure: folder/filename.ext
        if (!/^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\.[a-zA-Z0-9]+$/.test(path)) {
          return new Response("Not found", { status: 404 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.storage.from("cms-media").download(path);
          if (error || !data) {
            return new Response("Not found", { status: 404 });
          }

          const rawType = (data.type || "").toLowerCase().trim();
          // Safe MIME type check: never serve HTML, script, or executable types
          const contentType = ALLOWED_CONTENT_TYPES.has(rawType)
            ? rawType
            : "application/octet-stream";

          const buf = await data.arrayBuffer();
          return new Response(buf, {
            headers: {
              "content-type": contentType,
              "x-content-type-options": "nosniff",
              "content-disposition":
                contentType === "application/octet-stream" ? "attachment" : "inline",
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
