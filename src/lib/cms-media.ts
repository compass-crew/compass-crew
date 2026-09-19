import { supabase } from "@/integrations/supabase/client";

export const CMS_BUCKET = "cms-media";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "svg"]);

/** Public URL served through our own proxy route (bucket is private). */
export function cmsMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/api/public/cms-media/")) return path;
  const clean = path.replace(/^\/+/, "");
  return `/api/public/cms-media/${clean}`;
}

export function extractCmsStoragePath(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = url.match(/\/api\/public\/cms-media\/(.+)$/);
  return m ? m[1] : null;
}

export async function uploadCmsImage(file: File, folder = "misc"): Promise<string> {
  // 1. File size validation
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("File exceeds maximum allowed size of 5 MB.");
  }

  // 2. MIME type validation
  const mimeType = file.type.toLowerCase().trim();
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error("Invalid file type. Only JPG, PNG, WebP, GIF, and SVG images are permitted.");
  }

  // 3. Extension validation
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    throw new Error("Invalid file extension. Only image files are permitted.");
  }

  // 4. Folder sanitization (prevent path traversal)
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "misc";

  // 5. Safe UUID-based name
  const name = `${safeFolder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from(CMS_BUCKET).upload(name, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: mimeType,
  });
  if (error) throw error;
  return `/api/public/cms-media/${name}`;
}

export async function removeCmsImage(url: string | null | undefined): Promise<void> {
  const path = extractCmsStoragePath(url);
  if (!path) return;
  await supabase.storage.from(CMS_BUCKET).remove([path]);
}
