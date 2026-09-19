import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthShell, AuthAlert, PasswordPolicyChecklist } from "@/components/auth/auth-shell";
import { passwordStrength } from "@/components/auth/auth-helpers";
import "@/components/auth/auth-shell.css";

/* ============================ Route Definition ============================ */

type ResetSearch = {
  error?: string;
  error_description?: string;
  error_code?: string;
};

export const Route = createFileRoute("/auth/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetSearch => ({
    error: typeof search.error === "string" ? search.error : undefined,
    error_description:
      typeof search.error_description === "string" ? search.error_description : undefined,
    error_code: typeof search.error_code === "string" ? search.error_code : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Set a new password — Compass Crew" },
      {
        name: "description",
        content: "Set a secure new password for your Compass Crew account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

/* ============================ Schema ============================ */

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

type ResetValues = z.infer<typeof resetSchema>;

/* ============================ Page Component ============================ */

function ResetPasswordPage() {
  const search = useSearch({ from: "/auth/reset-password" });
  const navigate = useNavigate();

  // Recovery session state: "verifying" | "valid" | "expired" | "invalid"
  const [sessionStatus, setSessionStatus] = useState<"verifying" | "valid" | "expired" | "invalid">(
    "verifying",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm_password: "" },
  });

  const passwordVal = watch("password") || "";
  const confirmVal = watch("confirm_password") || "";
  const strength = passwordStrength(passwordVal);

  // Validate recovery session securely
  useEffect(() => {
    // 1. Check for URL error parameters from Supabase
    if (search.error_code === "otp_expired" || /expired/i.test(search.error_description || "")) {
      setSessionStatus("expired");
      return;
    }
    if (search.error || search.error_description) {
      setSessionStatus("invalid");
      return;
    }

    let isMounted = true;

    // 2. Listen for Supabase PASSWORD_RECOVERY or SIGNED_IN event
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setSessionStatus("valid");
      }
    });

    // 3. Inspect existing recovery session
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error || !data.session) {
        // Allow a small grace period for hash fragment exchange before marking invalid
        const timer = setTimeout(() => {
          if (isMounted) {
            setSessionStatus((prev) => (prev === "verifying" ? "expired" : prev));
          }
        }, 3500);
        return () => clearTimeout(timer);
      } else {
        setSessionStatus("valid");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [search]);

  // Form submit handler
  async function onSubmit(values: ResetValues) {
    if (submitting) return;
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        // Map error to sanitized user-facing messages
        if (/weak|requirements/i.test(error.message)) {
          setErrorMessage("Choose a stronger password that meets the requirements.");
        } else if (/expired|session/i.test(error.message)) {
          setErrorMessage("Your reset link has expired. Request a new one.");
          setSessionStatus("expired");
        } else if (/network|fetch/i.test(error.message)) {
          setErrorMessage("We couldn't update your password right now. Please try again.");
        } else {
          setErrorMessage(error.message || "Something went wrong. Please try again.");
        }
        return;
      }

      setIsDone(true);
      toast.success("Password updated successfully.");

      // Gentle auto-redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 2000);
    } catch {
      setErrorMessage("Something went wrong. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      backTo="/auth"
      backLabel="Back to sign in"
      brandProps={{
        state: isDone ? "success" : "reset",
        subtitle: isDone ? "Password updated successfully." : "Choose a secure new password.",
      }}
    >
      {/* 1. Success State */}
      {isDone ? (
        <div className="auth-status-card auth-entry">
          <div className="auth-status-card__icon auth-status-card__icon--success">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <span className="auth-status-card__badge auth-status-card__badge--green">Updated</span>
          <h1 className="auth-status-card__title">Password updated</h1>
          <p className="auth-status-card__desc">
            Your password has been changed successfully. You can now use your new password to sign
            in.
          </p>

          <button
            type="button"
            className="auth-btn-primary"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Continue to Dashboard
            <ArrowRight size={16} />
          </button>
        </div>
      ) : sessionStatus === "verifying" ? (
        /* 2. Verifying Recovery Session State */
        <div className="auth-status-card auth-entry" style={{ padding: "2.5rem 1.5rem" }}>
          <div className="auth-status-card__icon auth-status-card__icon--brand">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
          <h1 className="auth-status-card__title">Verifying reset link</h1>
          <p className="auth-status-card__desc">
            Please wait a moment while we verify your recovery session…
          </p>
        </div>
      ) : sessionStatus === "expired" ? (
        /* 3. Expired Recovery Session State */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--error">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--coral">
              Link Expired
            </span>
            <h1 className="auth-status-card__title">Reset link expired</h1>
            <p className="auth-status-card__desc">
              For your security, password reset links can only be used once and expire shortly after
              being requested.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link to="/auth/forgot-password" className="auth-btn-primary">
              Request a new reset link
              <ArrowRight size={16} />
            </Link>

            <Link to="/auth" className="auth-btn-ghost">
              <ArrowLeft size={15} />
              Back to sign in
            </Link>
          </div>
        </div>
      ) : sessionStatus === "invalid" ? (
        /* 4. Invalid Recovery Session State */
        <div className="auth-entry">
          <div className="auth-status-card">
            <div className="auth-status-card__icon auth-status-card__icon--error">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <span className="auth-status-card__badge auth-status-card__badge--coral">
              Invalid Link
            </span>
            <h1 className="auth-status-card__title">Invalid reset link</h1>
            <p className="auth-status-card__desc">
              This password reset link is no longer valid or has already been used. Please request a
              new link.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link to="/auth/forgot-password" className="auth-btn-primary">
              Request a new reset link
              <ArrowRight size={16} />
            </Link>

            <Link to="/auth" className="auth-btn-ghost">
              <ArrowLeft size={15} />
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        /* 5. Active Recovery Session: New Password Form */
        <div className="auth-entry">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
            }}
          >
            <ShieldCheck size={20} style={{ color: "#7c5cff" }} aria-hidden="true" />
            <h1 className="auth-welcome" style={{ margin: 0 }}>
              Set a new password
            </h1>
          </div>
          <p className="auth-welcome-sub">Choose a strong new password for your account.</p>

          {errorMessage && <AuthAlert variant="error" message={errorMessage} />}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* New Password Field */}
            <div className="auth-field">
              <label htmlFor="rp-password" className="auth-label">
                New password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="rp-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`auth-input ${errors.password ? "auth-input--error" : ""}`}
                  placeholder="••••••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "rp-password-error" : undefined}
                  disabled={submitting}
                  {...register("password")}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span id="rp-password-error" className="auth-error" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Password Strength Meter */}
            {passwordVal && (
              <div className="auth-strength" aria-live="polite">
                <div className="auth-strength-bar">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className="auth-strength-segment"
                      style={{
                        background:
                          level <= strength.score ? strength.color : "rgba(255, 255, 255, 0.08)",
                      }}
                    />
                  ))}
                </div>
                <span className="auth-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}

            {/* Password Requirements Checklist */}
            <PasswordPolicyChecklist password={passwordVal} confirmPassword={confirmVal} />

            {/* Confirm Password Field */}
            <div className="auth-field">
              <label htmlFor="rp-confirm" className="auth-label">
                Confirm new password
              </label>
              <div className="auth-input-wrapper">
                <input
                  id="rp-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  className={`auth-input ${errors.confirm_password ? "auth-input--error" : ""}`}
                  placeholder="••••••••••••"
                  aria-invalid={!!errors.confirm_password}
                  aria-describedby={errors.confirm_password ? "rp-confirm-error" : undefined}
                  disabled={submitting}
                  {...register("confirm_password")}
                />
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={0}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirm_password && (
                <span id="rp-confirm-error" className="auth-error" role="alert">
                  {errors.confirm_password.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={submitting}
              style={{ marginTop: "1rem" }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? "Updating password…" : "Update password"}
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
