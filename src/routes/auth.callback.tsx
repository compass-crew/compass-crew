import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useRouter, useSearch, Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthShell, AuthAlert } from "@/components/auth/auth-shell";
import "@/components/auth/auth-shell.css";

/* ============================ Route ============================ */

type CallbackSearch = {
  code?: string;
  redirect?: string;
  error?: string;
  error_description?: string;
  error_code?: string;
};

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: typeof search.code === "string" ? search.code : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
    error_code: typeof search.error_code === "string" ? search.error_code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Authenticating — Compass Crew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthCallbackPage,
});

/* ============================ Helpers ============================ */

/**
 * Inspect whether a user's profile is incomplete (no college or onboarding done).
 * If incomplete, guide new users to onboarding rather than dropping them on empty dashboard.
 */
async function resolveTarget(userId: string, fallback: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("college")
      .eq("id", userId)
      .maybeSingle();

    if (!data?.college) {
      return "/auth/onboarding";
    }
  } catch {
    // Proceed to fallback on network or query error
  }
  return fallback;
}

/* ============================ Page Component ============================ */

function AuthCallbackPage() {
  const search = useSearch({ from: "/auth/callback" });
  const navigate = useNavigate();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleAuthCallback() {
      // 1. Check if OAuth error was returned in query params (e.g. user cancelled)
      if (search.error || search.error_description) {
        let msg = "Authentication failed. Please try signing in again.";
        if (search.error === "access_denied" || /denied|cancel/i.test(search.error_description || "")) {
          msg = "Google sign-in was cancelled.";
        } else if (search.error_description) {
          msg = search.error_description;
        }
        if (mounted) setErrorMessage(msg);
        toast.error(msg);
        return;
      }

      try {
        // 2. Resolve safe target destination
        let target = "/dashboard";
        try {
          const saved = sessionStorage.getItem("cc:post-auth-redirect");
          if (saved) {
            target = safeRedirect(saved, "/dashboard");
            sessionStorage.removeItem("cc:post-auth-redirect");
          } else if (search.redirect) {
            target = safeRedirect(search.redirect, "/dashboard");
          }
        } catch {
          target = "/dashboard";
        }

        // Guarantee destination is never /auth or /auth/callback to avoid redirect loops
        if (target.startsWith("/auth")) {
          target = "/dashboard";
        }

        // 3. Exchange PKCE code if present in URL search
        const code =
          search.code ||
          (typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("code")
            : null);

        if (code) {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            console.warn("[auth.callback] exchangeCode note:", exchangeErr.message);
          }
        }

        // 4. Clean up sensitive query params/hash from browser URL
        if (typeof window !== "undefined" && window.history?.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        // 5. Inspect active session
        let { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session) {
          // Brief pause for async storage token resolution
          await new Promise((r) => setTimeout(r, 400));
          const retry = await supabase.auth.getSession();
          sessionData = retry.data;
        }

        if (sessionData.session) {
          const { data: userRes, error: userErr } = await supabase.auth.getUser();
          if (userErr || !userRes.user) {
            throw new Error("Unable to verify authenticated identity.");
          }

          toast.success("Signed in successfully.");
          await router.invalidate();

          const finalTarget = await resolveTarget(userRes.user.id, target);
          if (mounted) {
            navigate({ to: finalTarget });
          }
          return;
        }

        // 6. Listen for auth change as fallback
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && newSession?.user) {
            subscription.unsubscribe();
            toast.success("Signed in successfully.");
            await router.invalidate();
            const finalTarget = await resolveTarget(newSession.user.id, target);
            if (mounted) {
              navigate({ to: finalTarget });
            }
          }
        });

        // 7. Safety timeout (6s)
        const timer = setTimeout(() => {
          subscription.unsubscribe();
          if (mounted) {
            setErrorMessage(
              "Authentication timed out. If your login succeeded, please return to sign in or refresh.",
            );
          }
        }, 6000);

        return () => {
          subscription.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication failed.";
        if (mounted) setErrorMessage(msg);
        toast.error(msg);
      }
    }

    void handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [search, navigate, router]);

  return (
    <AuthShell
      backTo="/auth"
      backLabel="Back to sign in"
      brandProps={{
        state: errorMessage ? "default" : "verify",
        subtitle: errorMessage
          ? "Authentication issue encountered."
          : "Completing secure sign-in…",
      }}
    >
      <div className="auth-entry">
        {errorMessage ? (
          /* Error State */
          <div>
            <div className="auth-status-card">
              <div className="auth-status-card__icon auth-status-card__icon--error">
                <AlertCircle size={32} aria-hidden="true" />
              </div>
              <span className="auth-status-card__badge auth-status-card__badge--coral">
                Sign-In Notice
              </span>
              <h1 className="auth-status-card__title">Authentication Issue</h1>
              <p className="auth-status-card__desc">{errorMessage}</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button
                type="button"
                className="auth-btn-primary"
                onClick={() => window.location.reload()}
              >
                <RefreshCw size={16} />
                Try again
              </button>

              <Link to="/auth" className="auth-btn-ghost">
                <ArrowLeft size={15} />
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          /* Loading / Verification in flight */
          <div className="auth-status-card" style={{ padding: "2.5rem 1.5rem" }}>
            <div className="auth-status-card__icon auth-status-card__icon--brand">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
            <h1 className="auth-status-card__title">Signing you in…</h1>
            <p className="auth-status-card__desc">
              Restoring your secure session and directing you to Compass Crew.
            </p>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                fontSize: "0.75rem",
                color: "#6b6966",
                marginTop: "0.5rem",
              }}
            >
              <ShieldCheck size={14} style={{ color: "#7c5cff" }} />
              Secured by Compass Crew
            </div>
          </div>
        )}
      </div>
    </AuthShell>
  );
}
