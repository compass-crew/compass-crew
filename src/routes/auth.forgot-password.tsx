import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthAlert } from "@/components/auth/auth-shell";
import { maskEmail } from "@/components/auth/auth-helpers";
import "@/components/auth/auth-shell.css";

/* ============================ Route ============================ */

export const Route = createFileRoute("/auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Compass Crew" },
      {
        name: "description",
        content: "Reset your Compass Crew account password securely.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

/* ============================ Schema ============================ */

const forgotSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address." })
    .max(255),
});

type ForgotValues = z.infer<typeof forgotSchema>;

const RESEND_COOLDOWN_SECONDS = 60;

/* ============================ Page Component ============================ */

function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Form submit handler
  async function onSubmit(values: ForgotValues) {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Send reset email with redirect to /auth/reset-password
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        // Enforce account enumeration protection:
        // Even if the provider returns an error that hints at missing email,
        // we show the generic success state so outsiders cannot probe user existence.
        // Only surface network/rate-limit errors.
        if (/rate limit|too many/i.test(error.message)) {
          setErrorMessage("Too many requests. Please wait a few minutes before trying again.");
          setSubmitting(false);
          return;
        }
      }

      // Transition to enumeration-safe success state
      setSubmittedEmail(values.email);
      setCountdown(RESEND_COOLDOWN_SECONDS);
      toast.success("Password reset instructions sent.");
    } catch {
      // Network or unexpected error
      setErrorMessage("We couldn't process your request right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Resend handler from success screen
  async function handleResend() {
    if (!submittedEmail || resending || countdown > 0) return;
    setResending(true);
    setErrorMessage(null);
    setResendSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(submittedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error && /rate limit|too many/i.test(error.message)) {
        setErrorMessage("Please wait before requesting another reset email.");
      } else {
        setResendSuccess("Reset instructions re-sent. Please check your inbox.");
        setCountdown(RESEND_COOLDOWN_SECONDS);
        toast.success("Reset link re-sent.");
      }
    } catch {
      setErrorMessage("We couldn't resend the email right now. Please try again.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthShell
      backTo="/auth"
      backLabel="Back to sign in"
      brandProps={{
        state: submittedEmail ? "success" : "forgot",
        subtitle: submittedEmail
          ? "Check your inbox for the recovery link."
          : "Secure password recovery.",
      }}
    >
      {submittedEmail ? (
        /* Dedicated Success State (Enumeration Protected) */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--brand">
              <Mail size={28} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--green">
              Link Sent
            </span>
            <h1 className="auth-status-card__title">Check your inbox</h1>
            <p className="auth-status-card__desc">
              If an account exists for that email, a password reset link has been sent. Click the link in that email to choose a new password.
            </p>

            <div className="auth-status-card__email-chip">
              <span>{maskEmail(submittedEmail)}</span>
            </div>
          </div>

          {resendSuccess && <AuthAlert variant="success" message={resendSuccess} />}
          {errorMessage && <AuthAlert variant="error" message={errorMessage} />}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              type="button"
              className="auth-btn-secondary"
              onClick={handleResend}
              disabled={resending || countdown > 0}
            >
              {resending && <Loader2 size={16} className="animate-spin" />}
              {countdown > 0
                ? `Resend in ${countdown}s`
                : resending
                  ? "Sending…"
                  : "Resend reset link"}
            </button>

            <Link to="/auth" className="auth-btn-ghost">
              <ArrowLeft size={15} />
              Back to sign in
            </Link>
          </div>

          <p className="auth-cooldown-text">
            Don't see the email? Check your spam folder or wait for the timer to resend.
          </p>
        </div>
      ) : (
        /* Form State */
        <div className="auth-entry">
          <h1 className="auth-welcome">Forgot your password?</h1>
          <p className="auth-welcome-sub">
            Enter your email and we'll send you a secure password reset link.
          </p>

          {errorMessage && <AuthAlert variant="error" message={errorMessage} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-field">
              <label htmlFor="fp-email" className="auth-label">
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                className={`auth-input ${errors.email ? "auth-input--error" : ""}`}
                placeholder="you@campus.edu"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "fp-email-error" : undefined}
                disabled={submitting}
                {...register("email")}
              />
              {errors.email && (
                <span id="fp-email-error" className="auth-error" role="alert">
                  {errors.email.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={submitting}
              style={{ marginTop: "0.75rem" }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Sending reset link…" : "Send reset link"}
            </button>

            <div style={{ marginTop: "1rem" }}>
              <Link to="/auth" className="auth-btn-ghost">
                <ArrowLeft size={15} />
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      )}
    </AuthShell>
  );
}
