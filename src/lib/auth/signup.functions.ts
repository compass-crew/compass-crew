import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceRateLimit, resolveClientIp } from "@/lib/rate-limit.server";

const serverSignupSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Minimum 8 characters").max(128, "Maximum 128 characters"),
  newsletter: z.boolean().default(false),
  redirectTo: z.string().optional(),
});

export type ServerSignupInput = z.infer<typeof serverSignupSchema>;

export interface ServerSignupResult {
  ok: boolean;
  error?: string;
  isRepeatedSignup?: boolean;
  hasSession?: boolean;
  session?: {
    access_token: string;
    refresh_token: string;
  } | null;
}

export const signUpWithEmailFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => serverSignupSchema.parse(data))
  .handler(async ({ data }): Promise<ServerSignupResult> => {
    const ip = resolveClientIp();

    // Server-side abuse protection: 5 signups per IP per hour
    try {
      await enforceRateLimit({
        key: "auth:signup",
        limit: 5,
        windowSeconds: 3600,
        identifier: ip,
        errorMessage: "Too many signup attempts from this network. Please try again later.",
      });
    } catch (rateErr) {
      return {
        ok: false,
        error:
          rateErr instanceof Error
            ? rateErr.message
            : "Too many signup attempts from this network. Please try again later.",
      };
    }

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

      const { data: authData, error } = await supabaseAdmin.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: data.redirectTo,
          data: {
            full_name: data.full_name,
            newsletter_opt_in: data.newsletter,
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      // Check for user-enumeration protection (empty identities array)
      const isRepeatedSignup =
        Boolean(authData.user) &&
        Array.isArray(authData.user?.identities) &&
        authData.user.identities.length === 0;

      if (isRepeatedSignup) {
        return {
          ok: false,
          isRepeatedSignup: true,
          error:
            "This email is already registered. Try signing in, or reset your password if you\u2019ve forgotten it.",
        };
      }

      return {
        ok: true,
        hasSession: Boolean(authData.session),
        session: authData.session
          ? {
              access_token: authData.session.access_token,
              refresh_token: authData.session.refresh_token,
            }
          : null,
      };
    } catch (err) {
      console.error("[signUpWithEmailFn] Unexpected signup failure:", err);
      return {
        ok: false,
        error:
          err instanceof Error ? err.message : "Unable to create account. Please try again later.",
      };
    }
  });
