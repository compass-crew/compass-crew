import { createServerFn } from "@tanstack/react-start";
import type { Database } from "@/integrations/supabase/types";

/**
 * Designated initial platform administrator accounts for Compass Crew.
 * Long-term authorization is strictly derived from public.user_roles in the database.
 */
export const AUTHORIZED_ADMIN_EMAILS = [
  "solankikamal55143@gmail.com",
  "compasscrewnetwork.team@gmail.com",
] as const;

export interface ProvisionAdminResult {
  provisioned: boolean;
  role: Database["public"]["Enums"]["app_role"] | null;
  error?: string;
}

/**
 * Validates whether the authenticated user's verified email is one of the
 * authorized platform administrators and ensures their `super_admin` role
 * is active in `public.user_roles`.
 */
export const ensureAdminAccountRole = createServerFn({ method: "POST" })
  .validator((input: { userId: string; userEmail: string }) => input)
  .handler(async ({ data }): Promise<ProvisionAdminResult> => {
    const email = data.userEmail.toLowerCase().trim();
    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.some(
      (adminEmail) => adminEmail.toLowerCase() === email,
    );

    if (!isAuthorized) {
      return { provisioned: false, role: null };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      // Verify the identity against auth.users
      const { data: userObj, error: userErr } = await supabaseAdmin.auth.admin.getUserById(
        data.userId,
      );

      if (userErr || !userObj?.user || userObj.user.email?.toLowerCase().trim() !== email) {
        return { provisioned: false, role: null, error: "Identity verification failed" };
      }

      // Check if user already holds super_admin in user_roles
      const { data: existingRoles, error: queryErr } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.userId)
        .eq("role", "super_admin");

      if (queryErr) {
        return { provisioned: false, role: null, error: queryErr.message };
      }

      if (existingRoles && existingRoles.length > 0) {
        return { provisioned: true, role: "super_admin" };
      }

      // Upsert super_admin role into user_roles
      const { error: insertErr } = await supabaseAdmin.from("user_roles").upsert(
        {
          user_id: data.userId,
          role: "super_admin",
        },
        { onConflict: "user_id,role" },
      );

      if (insertErr) {
        console.error("[Admin Provisioning] Failed to insert role:", insertErr);
        return { provisioned: false, role: null, error: insertErr.message };
      }

      return { provisioned: true, role: "super_admin" };
    } catch (err) {
      console.error("[Admin Provisioning] Unexpected error:", err);
      return {
        provisioned: false,
        role: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  });
