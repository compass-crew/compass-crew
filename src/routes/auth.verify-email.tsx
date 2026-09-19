import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Mail, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { safeRedirect } from "@/lib/safe-redirect";
import { AuthShell, AuthAlert } from "@/components/auth/auth-shell";
import { maskEmail } from "@/components/auth/auth-helpers";
import "@/components/auth/auth-shell.css";

/* ============================ Route Definition ============================ */

type VerifySearch = {
  email?: string;
  redirect?: string;
  error?: string;
  error_description?: string;
  error_code?: string;
};

export const Route = createFileRoute("/auth/verify-email")({
  validateSearch: (search: Record<string, unknown>): VerifySearch => ({
    email: typeof search.email === "string" ? search.email : undefined,
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
    error_code: typeof search.error_code === "string" ? search.error_code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Verify your email — Compass Crew" },
      {
        name: "description",
        content: "Verify your Compass Crew account email to continue.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmailPage,
});

/* ============================ Page Component ============================ */

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailPage() {
  const search = useSearch({ from: "/auth/verify-email" });
  const navigate = useNavigate();

  const [inputEmail, setInputEmail] = useState(search.email ?? "");
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    variant: "success" | "error" | "info" | "warning";
    text: string;
  } | null>(null);

  const isExpired =
    search.error_code === "otp_expired" ||
    (search.error_description && /expired/i.test(search.error_description));
  const isInvalid =
    !isExpired &&
    (search.error || (search.error_description && /invalid|token/i.test(search.error_description)));

  const [isVerified, setIsVerified] = useState(false);

  // Safe redirect destination
  const targetDestination = safeRedirect(search.redirect, "/dashboard");

  // Check if current user is already confirmed
  const verifyCurrentState = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user?.email_confirmed_at) {
        setIsVerified(true);
        return true;
      }
    } catch {
      // Ignore background check failure
    }
    return false;
  }, []);

  useEffect(() => {
    void verifyCurrentState();
  }, [verifyCurrentState]);

  // Handle countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Explicit check verification button
  async function handleCheckStatus() {
    setChecking(true);
    setStatusMessage(null);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setStatusMessage({
          variant: "info",
          text: "Still waiting for verification. Check your inbox and click the verification link.",
        });
      } else if (data.user.email_confirmed_at) {
        setIsVerified(true);
        setStatusMessage({
          variant: "success",
          text: "Your email has been verified! You're ready to proceed.",
        });
      } else {
        setStatusMessage({
          variant: "info",
          text: "Verification pending. Please open the link sent to your email.",
        });
      }
    } catch {
      setStatusMessage({
        variant: "error",
        text: "Could not check verification status right now. Please try again.",
      });
    } finally {
      setChecking(false);
    }
  }

  // Resend verification email
  async function handleResend() {
    const emailToUse = inputEmail.trim() || search.email?.trim();
    if (!emailToUse || !emailToUse.includes("@")) {
      setStatusMessage({
        variant: "error",
        text: "Please provide a valid email address to resend the verification link.",
      });
      return;
    }

    setResending(true);
    setStatusMessage(null);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        // Map error to human-friendly message without leaking server internals
        if (/rate limit|too many/i.test(error.message)) {
          setStatusMessage({
            variant: "warning",
            text: "Too many requests. Please wait a couple minutes before requesting another email.",
          });
        } else {
          setStatusMessage({
            variant: "error",
            text: "We couldn't send the verification email right now. Please try again.",
          });
        }
      } else {
        setStatusMessage({
          variant: "success",
          text: "Verification email sent. Check your inbox and spam folders.",
        });
        setCountdown(RESEND_COOLDOWN_SECONDS);
        toast.success("Verification email sent.");
      }
    } catch {
      setStatusMessage({
        variant: "error",
        text: "We couldn't send the verification email right now. Please try again.",
      });
    } finally {
      setResending(false);
    }
  }

  // Determine masked email to show
  const displayEmail = inputEmail.trim() || search.email?.trim();
  const masked = maskEmail(displayEmail);

  return (
    <AuthShell
      backTo="/auth"
      backLabel="Back to sign in"
      brandProps={{
        state: isVerified ? "success" : "verify",
        subtitle: isVerified ? "Account verified and active." : "Verify your email to continue.",
      }}
    >
      {/* 1. Already Verified State */}
      {isVerified ? (
        <div className="auth-status-card auth-entry">
          <div className="auth-status-card__icon auth-status-card__icon--success">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <span className="auth-status-card__badge auth-status-card__badge--green">Verified</span>
          <h1 className="auth-status-card__title">Email Verified</h1>
          <p className="auth-status-card__desc">
            Your email is confirmed and your Compass Crew account is active. You're all set.
          </p>

          <button
            type="button"
            className="auth-btn-primary"
            onClick={() => navigate({ to: targetDestination })}
          >
            Continue to Compass Crew
            <ArrowRight size={16} />
          </button>
        </div>
      ) : isExpired ? (
        /* 2. Expired Verification Link State */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--error">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--coral">
              Link Expired
            </span>
            <h1 className="auth-status-card__title">Verification link expired</h1>
            <p className="auth-status-card__desc">
              That verification link has expired for your security. Enter your email below to
              receive a fresh verification link.
            </p>
          </div>

          {statusMessage && (
            <AuthAlert variant={statusMessage.variant} message={statusMessage.text} />
          )}

          <div className="auth-field">
            <label htmlFor="verify-email-input" className="auth-label">
              Your email address
            </label>
            <input
              id="verify-email-input"
              type="email"
              autoComplete="email"
              className="auth-input"
              placeholder="you@campus.edu"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              disabled={resending || countdown > 0}
            />
          </div>

          <button
            type="button"
            className="auth-btn-primary"
            onClick={handleResend}
            disabled={resending || countdown > 0}
          >
            {resending && <Loader2 size={16} className="animate-spin" />}
            {countdown > 0
              ? `Resend in ${countdown}s`
              : resending
                ? "Sending link…"
                : "Send new verification link"}
          </button>

          <div style={{ marginTop: "1rem" }}>
            <Link to="/auth" className="auth-btn-ghost">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : isInvalid ? (
        /* 3. Invalid Verification Link State */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--error">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--coral">
              Invalid Link
            </span>
            <h1 className="auth-status-card__title">Invalid verification link</h1>
            <p className="auth-status-card__desc">
              This verification link is no longer valid or has already been used. Please request a
              new verification email.
            </p>
          </div>

          {statusMessage && (
            <AuthAlert variant={statusMessage.variant} message={statusMessage.text} />
          )}

          <div className="auth-field">
            <label htmlFor="verify-email-input" className="auth-label">
              Your email address
            </label>
            <input
              id="verify-email-input"
              type="email"
              autoComplete="email"
              className="auth-input"
              placeholder="you@campus.edu"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              disabled={resending || countdown > 0}
            />
          </div>

          <button
            type="button"
            className="auth-btn-primary"
            onClick={handleResend}
            disabled={resending || countdown > 0}
          >
            {resending && <Loader2 size={16} className="animate-spin" />}
            {countdown > 0
              ? `Resend in ${countdown}s`
              : resending
                ? "Sending…"
                : "Request new verification email"}
          </button>

          <div style={{ marginTop: "1rem" }}>
            <Link to="/auth" className="auth-btn-ghost">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        /* 4. Normal Check Inbox / Verification Pending State */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--brand">
              <Mail size={28} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--amber">
              Verification Required
            </span>
            <h1 className="auth-status-card__title">Check your inbox</h1>
            <p className="auth-status-card__desc">
              We sent a secure verification link to your email. Click the link to verify your
              account and join the crew.
            </p>

            {masked ? (
              <div className="auth-status-card__email-chip">
                <span>{masked}</span>
              </div>
            ) : null}
          </div>

          {/* In-content status message */}
          {statusMessage && (
            <AuthAlert variant={statusMessage.variant} message={statusMessage.text} />
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {/* Primary Action: Resend */}
            <button
              type="button"
              className="auth-btn-primary"
              onClick={handleResend}
              disabled={resending || countdown > 0}
            >
              {resending && <Loader2 size={16} className="animate-spin" />}
              {countdown > 0
                ? `Resend verification in ${countdown}s`
                : resending
                  ? "Sending verification…"
                  : "Resend verification email"}
            </button>

            {/* Check status button */}
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={handleCheckStatus}
              disabled={checking}
            >
              {checking ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={15} />}
              {checking ? "Checking status…" : "I've verified my email"}
            </button>

            {/* Secondary: Back to sign in */}
            <Link to="/auth" className="auth-btn-ghost">
              Back to sign in
            </Link>
          </div>

          {countdown > 0 && (
            <p className="auth-cooldown-text">
              Didn't receive the email? Check spam or resend in {countdown}s.
            </p>
          )}
        </div>
      )}
    </AuthShell>
  );
}
