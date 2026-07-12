import { supabase } from "@/integrations/supabase/client";

export const CMS_BUCKET = "cms-media";

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
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const name = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const { error } = await supabase.storage.from(CMS_BUCKET).upload(name, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return `/api/public/cms-media/${name}`;
}

export async function removeCmsImage(url: string | null | undefined): Promise<void> {
  const path = extractCmsStoragePath(url);
  if (!path) return;
  await supabase.storage.from(CMS_BUCKET).remove([path]);
}
