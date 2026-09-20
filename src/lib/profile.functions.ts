import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const uploadAvatarSchema = z.object({
  base64Data: z.string().min(10),
  mimeType: z.string().trim().toLowerCase(),
  fileName: z.string().trim().max(100),
  accessToken: z.string().min(10),
});

const removeAvatarSchema = z.object({
  accessToken: z.string().min(10),
});

export const uploadProfileAvatarFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => uploadAvatarSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { base64Data, mimeType, fileName, accessToken } = data;

      if (!ALLOWED_MIME_TYPES.has(mimeType)) {
        throw new Error("Invalid image type. Please upload a JPG, PNG, WebP, or GIF.");
      }

      // Verify user session via server admin client
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

      if (userError || !userData?.user) {
        throw new Error("Unauthorized. Please refresh and sign in again.");
      }

      const user = userData.user;

      // Extract raw base64 content
      const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      if (buffer.length > MAX_IMAGE_SIZE_BYTES) {
        throw new Error("File exceeds the maximum allowed size of 5 MB.");
      }

      // Determine safe extension
      const extMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);
      let ext = extMatch ? extMatch[1].toLowerCase() : "webp";
      if (ext === "jpeg") ext = "jpg";
      if (!["jpg", "png", "webp", "gif"].includes(ext)) {
        ext = mimeType.split("/")[1] || "webp";
      }

      // Storage path: avatars/{userId}-{timestamp}.{ext}
      const storageName = `avatars/${user.id}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from("cms-media")
        .upload(storageName, buffer, {
          contentType: mimeType,
          upsert: true,
          cacheControl: "3600",
        });

      if (uploadError) {
        console.error("[Avatar Upload Storage Error]", uploadError);
        throw new Error("Failed to upload avatar image to storage.");
      }

      const publicUrl = `/api/public/cms-media/${storageName}`;

      // Update public.profiles
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) {
        console.error("[Avatar Profile Update Error]", updateError);
        throw new Error("Failed to update profile avatar record.");
      }

      // Sync user metadata
      try {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            avatar_url: publicUrl,
          },
        });
      } catch (metaErr) {
        console.warn("[Avatar UserMetadata Sync Warn]", metaErr);
      }

      return { ok: true as const, avatarUrl: publicUrl };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to upload profile image.");
    }
  });

export const removeProfileAvatarFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => removeAvatarSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { accessToken } = data;
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken);

      if (userError || !userData?.user) {
        throw new Error("Unauthorized. Please sign in again.");
      }

      const user = userData.user;

      // Update public.profiles to null
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);

      if (updateError) {
        console.error("[Avatar Remove Profile Error]", updateError);
        throw new Error("Failed to remove profile avatar.");
      }

      // Sync user metadata
      try {
        await supabaseAdmin.auth.admin.updateUserById(user.id, {
          user_metadata: {
            ...user.user_metadata,
            avatar_url: null,
          },
        });
      } catch (metaErr) {
        console.warn("[Avatar Remove UserMetadata Warn]", metaErr);
      }

      return { ok: true as const };
    } catch (err) {
      if (err instanceof Error) throw err;
      throw new Error("Failed to remove avatar.");
    }
  });
