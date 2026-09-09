import { useState, useEffect, lazy, Suspense } from "react";
import {
  createFileRoute,
  Link,
  useNavigate,
  useRouter,
  useSearch,
  useRouterState,
  Outlet,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import "@/components/auth/auth-shell.css";

/* ============================ Lazy 3D Compass ============================ */

const Compass3D = lazy(() =>
  import("@/components/landing/canvas/Compass3D").then((m) => ({
    default: m.Compass3D,
  })),
);

/* ============================ Route ============================ */

type AuthSearch = { redirect?: string; mode?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect:
      typeof search.redirect === "string" ? search.redirect : undefined,
    mode:
      search.mode === "signup"
        ? "signup"
        : search.mode === "login"
          ? "login"
          : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Compass Crew" },
      {
        name: "description",
        content:
          "Sign in or create your Compass Crew account to join India's student innovation community.",
      },
    ],
  }),
  component: AuthRouteComponent,
});

function AuthRouteComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isExactAuth = pathname === "/auth" || pathname === "/auth/";

  if (isExactAuth) {
    return <AuthPage />;
  }

  return <Outlet />;
}

/* ============================ Schemas ============================ */

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address." }).max(255),
  password: z.string().min(1, { message: "Password is required." }).max(128),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email({ message: "Enter a valid email address." }).max(255),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm_password: z.string(),
    agree_terms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
    newsletter: z.boolean(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });
type SignupValues = z.infer<typeof signupSchema>;

/* ============================ Password Strength ============================ */

function passwordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Very weak", color: "#ff7a6b" },
    { label: "Weak", color: "#ff7a6b" },
    { label: "Fair", color: "#e8a838" },
    { label: "Good", color: "#7c5cff" },
    { label: "Strong", color: "#7dd3a8" },
    { label: "Excellent", color: "#7dd3a8" },
  ];
  return { score, ...map[score] };
}

/* ============================ Safe Redirect ============================ */

import { safeRedirect as _safeRedirect } from "@/lib/safe-redirect";
function safeRedirect(path?: string): string {
  return _safeRedirect(path, "/dashboard");
}

/* ============================ WebGL Detection ============================ */

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") || canvas.getContext("webgl")
    );
  } catch {
    return false;
  }
}

/* ============================ Auth Page ============================ */

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<"login" | "signup">(search.mode ?? "login");

  return (
    <div className="auth-shell">
      {/* Left: Immersive Visual */}
      <AuthVisual />

      {/* Right: Auth Panel */}
      <div className="auth-panel auth-entry">
        {/* Mobile Brand */}
        <div className="auth-panel__mobile-brand">
          <img
            src="/images/logo/compass-crew-logo.png"
            alt="Compass Crew"
            className="auth-panel__mobile-logo"
            loading="eager"
          />
          <span className="auth-panel__mobile-name">
            Compass<span>Crew</span>
          </span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <Link to="/" className="auth-header__back">
            <ArrowLeft />
            Back to home
          </Link>
        </div>

        {/* Form Area */}
        <div className="auth-form-area">
          {/* Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={tab === "login"}
              className={`auth-tab ${tab === "login" ? "auth-tab--active" : ""}`}
              onClick={() => setTab("login")}
              type="button"
            >
              Sign in
            </button>
            <button
              role="tab"
              aria-selected={tab === "signup"}
              className={`auth-tab ${tab === "signup" ? "auth-tab--active" : ""}`}
              onClick={() => setTab("signup")}
              type="button"
            >
              Create account
            </button>
          </div>

          {tab === "login" ? (
            <LoginForm redirect={search.redirect} onSwitchToSignup={() => setTab("signup")} />
          ) : (
            <SignupForm onDone={() => setTab("login")} />
          )}
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <span>© {new Date().getFullYear()} Compass Crew</span>
          <span className="auth-footer__sep">·</span>
          <Link to="/privacy">Privacy</Link>
          <span className="auth-footer__sep">·</span>
          <Link to="/terms">Terms</Link>
        </div>
      </div>
    </div>
  );
}

/* ============================ Auth Visual ============================ */

function AuthVisual() {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  return (
    <div className="auth-visual auth-visual-entry">
      {/* Orbital decorations */}
      <div className="auth-visual__orbit auth-visual__orbit--1" />
      <div className="auth-visual__orbit auth-visual__orbit--2" />
      <div className="auth-visual__orbit auth-visual__orbit--3" />

      {/* CSS Particles */}
      <div className="auth-visual__particles">
        <div className="auth-visual__particle" />
        <div className="auth-visual__particle" />
        <div className="auth-visual__particle" />
        <div className="auth-visual__particle" />
        <div className="auth-visual__particle" />
        <div className="auth-visual__particle" />
      </div>

      {/* Content */}
      <div className="auth-visual__content">
        <div>
          <img
            src="/images/logo/compass-crew-logo.png"
            alt="Compass Crew"
            className="auth-visual__logo"
            loading="eager"
          />
          <p className="auth-visual__brand-name">
            Compass<span>Crew</span>
          </p>
        </div>

        <div className="auth-visual__statement">
          BUILD. LEARN.
          <br />
          CONNECT. <span className="auth-visual__statement-accent">SHIP.</span>
        </div>

        <p className="auth-visual__subtitle">
          Your next build starts here.
        </p>

        {/* 3D Compass or static fallback */}
        <div className="auth-visual__compass">
          {webgl ? (
            <Suspense fallback={<div className="auth-visual__compass-fallback" />}>
              <Compass3D
                size={220}
                mode="hero"
                interactive={false}
                glow={true}
                className="auth-visual__compass"
              />
            </Suspense>
          ) : (
            <div className="auth-visual__compass-fallback" />
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ Login Form ============================ */

function LoginForm({
  redirect,
  onSwitchToSignup,
}: {
  redirect?: string;
  onSwitchToSignup: () => void;
}) {
  const navigate = useNavigate();
  const router = useRouter();

  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    setFormError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);
    if (error) {
      if (/email.*not.*confirm/i.test(error.message)) {
        setFormError("Please verify your email before signing in.");
        toast.error("Please verify your email before signing in.", {
          action: {
            label: "Resend",
            onClick: () => resendVerification(values.email),
          },
        });
      } else if (/invalid.*credentials/i.test(error.message)) {
        setFormError("Invalid email or password. Please try again.");
      } else {
        setFormError(error.message);
      }
      return;
    }
    await router.invalidate();
    // Full navigation so destinations carrying a query string (e.g. the OAuth
    // consent screen) are preserved exactly.
    window.location.assign(safeRedirect(redirect));

  }

  return (
    <div>
      <h1 className="auth-welcome">Welcome back.</h1>
      <p className="auth-welcome-sub">Continue where you left off.</p>

      {/* Form Error */}
      {formError && (
        <div className="auth-form-error" role="alert">
          <AlertCircle />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* Email */}
        <div className="auth-field">
          <label htmlFor="login-email" className="auth-label">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@campus.edu"
            className={`auth-input ${form.formState.errors.email ? "auth-input--error" : ""}`}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <div className="auth-error" role="alert">
              <AlertCircle />
              <span>{form.formState.errors.email.message}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="login-pw" className="auth-label" style={{ marginBottom: 0 }}>
              Password
            </label>
            <Link to="/auth/forgot-password" className="auth-forgot">
              Forgot password?
            </Link>
          </div>
          <div className="auth-input-wrap">
            <input
              id="login-pw"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`auth-input ${form.formState.errors.password ? "auth-input--error" : ""}`}
              style={{ paddingRight: "2.75rem" }}
              {...form.register("password")}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              className="auth-pw-toggle"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <div className="auth-error" role="alert">
              <AlertCircle />
              <span>{form.formState.errors.password.message}</span>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="auth-btn-primary"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Signing in\u2026" : "Sign in"}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span className="auth-divider__text">or</span>
      </div>

      {/* Google OAuth */}
      <GoogleButton redirect={redirect} />

      {/* Trust Badge */}
      <div className="auth-trust">
        <ShieldCheck />
        Secured by Compass Crew
      </div>

      {/* Switch to signup */}
      <div className="auth-switch">
        New to Compass Crew?{" "}
        <button type="button" onClick={onSwitchToSignup}>
          Create account
        </button>
      </div>
    </div>
  );
}

/* ============================ Signup Form ============================ */

function SignupForm({ onDone }: { onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      agree_terms: false,
      newsletter: true,
    },
  });

  const password = form.watch("password") ?? "";
  const strength = passwordStrength(password);

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);
    setFormError(null);
    const emailRedirectTo = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo,
        data: {
          full_name: values.full_name,
          newsletter_opt_in: values.newsletter,
        },
      },
    });

    if (error) {
      setSubmitting(false);
      setFormError(error.message);
      return;
    }

    // Supabase returns 200 with an empty `identities` array when the email is
    // already registered (user-enumeration protection).
    const identities = (data.user as { identities?: unknown[] } | null)
      ?.identities;
    const isRepeatedSignup =
      !!data.user &&
      !data.session &&
      Array.isArray(identities) &&
      identities.length === 0;

    if (isRepeatedSignup) {
      setSubmitting(false);
      setFormError(
        "This email is already registered. Try signing in, or reset your password if you\u2019ve forgotten it.",
      );
      return;
    }

    // Sync newsletter preference if session is established immediately
    if (data.session && data.user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          newsletter_opt_in: values.newsletter,
        })
        .eq("id", data.user.id);
      if (profileErr) {
        console.warn("[signup] profile update note:", profileErr.message);
      }
    }

    setSubmitting(false);
    if (data.session) {
      toast.success("Account created!");
      navigate({ to: "/auth/onboarding" });
    } else {
      toast.success("Account created. Check your email to verify.");
      navigate({
        to: "/auth/verify-email",
        search: { email: values.email },
      });
      onDone();
    }
  }

  return (
    <div>
      <h1 className="auth-welcome">Join the crew.</h1>
      <p className="auth-welcome-sub">
        Create your account in seconds.
      </p>

      {/* Form Error */}
      {formError && (
        <div className="auth-form-error" role="alert">
          <AlertCircle />
          <span>{formError}</span>
        </div>
      )}

      {/* Google first */}
      <GoogleButton />

      <div className="auth-divider">
        <span className="auth-divider__text">or sign up with email</span>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        {/* Full Name */}
        <AuthField
          id="signup-name"
          label="Full name"
          error={form.formState.errors.full_name?.message}
        >
          <input
            id="signup-name"
            autoComplete="name"
            placeholder="Ada Lovelace"
            className={`auth-input ${form.formState.errors.full_name ? "auth-input--error" : ""}`}
            {...form.register("full_name")}
          />
        </AuthField>

        {/* Email */}
        <AuthField
          id="signup-email"
          label="Email"
          error={form.formState.errors.email?.message}
        >
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@campus.edu"
            className={`auth-input ${form.formState.errors.email ? "auth-input--error" : ""}`}
            {...form.register("email")}
          />
        </AuthField>

        {/* Password */}
        <AuthField
          id="signup-pw"
          label="Password"
          error={form.formState.errors.password?.message}
        >
          <div className="auth-input-wrap">
            <input
              id="signup-pw"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`auth-input ${form.formState.errors.password ? "auth-input--error" : ""}`}
              style={{ paddingRight: "2.75rem" }}
              {...form.register("password")}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              className="auth-pw-toggle"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {password && (
            <div className="auth-pw-strength">
              <div className="auth-pw-strength__bar">
                <div
                  className="auth-pw-strength__fill"
                  style={{
                    width: `${(strength.score / 5) * 100}%`,
                    background: strength.color,
                  }}
                />
              </div>
              <span className="auth-pw-strength__label">
                {strength.label}
              </span>
            </div>
          )}
        </AuthField>

        {/* Confirm Password */}
        <AuthField
          id="signup-pw2"
          label="Confirm password"
          error={form.formState.errors.confirm_password?.message}
        >
          <input
            id="signup-pw2"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`auth-input ${form.formState.errors.confirm_password ? "auth-input--error" : ""}`}
            {...form.register("confirm_password")}
          />
        </AuthField>

        {/* Terms + Newsletter */}
        <div className="auth-consent-block">
          <label className="auth-checkbox-wrap">
            <Checkbox
              checked={form.watch("agree_terms")}
              onCheckedChange={(v) =>
                form.setValue("agree_terms", Boolean(v), {
                  shouldValidate: true,
                })
              }
            />
            <span>
              I agree to the{" "}
              <Link to="/terms">Terms</Link> and{" "}
              <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          {form.formState.errors.agree_terms && (
            <div className="auth-error" role="alert" style={{ paddingLeft: "1.5rem" }}>
              <span>{form.formState.errors.agree_terms.message}</span>
            </div>
          )}

          <label className="auth-checkbox-wrap" style={{ color: "#6b6966" }}>
            <Checkbox
              checked={form.watch("newsletter")}
              onCheckedChange={(v) => form.setValue("newsletter", Boolean(v))}
            />
            <span>Send me the Compass Crew newsletter (monthly).</span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="auth-btn-primary"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting ? "Creating account\u2026" : "Create account"}
        </button>
      </form>

      {/* Trust Badge */}
      <div className="auth-trust">
        <ShieldCheck />
        Secured by Compass Crew
      </div>

      {/* Switch to login */}
      <div className="auth-switch">
        Already have an account?{" "}
        <button type="button" onClick={onDone}>
          Sign in
        </button>
      </div>
    </div>
  );
}

/* ============================ Shared Components ============================ */

function AuthField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-field">
      <label htmlFor={id} className="auth-label">
        {label}
      </label>
      {children}
      {error && (
        <div className="auth-error" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

function GoogleButton({ redirect }: { redirect?: string }) {
  const [busy, setBusy] = useState(false);

  async function signInGoogle() {
    setBusy(true);
    if (redirect) {
      try {
        sessionStorage.setItem(
          "cc:post-auth-redirect",
          safeRedirect(redirect),
        );
      } catch {
        /* ignore */
      }
    }
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    setBusy(null);
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    // Popup path: session set — send them to dashboard (or saved destination).
    let target = "/dashboard";
    try {
      const saved = sessionStorage.getItem("cc:post-auth-redirect");
      if (saved) {
        target = saved;
        sessionStorage.removeItem("cc:post-auth-redirect");
      }
    } catch {
      /* ignore */
    }
    window.location.href = target;
  }

  function signInGithub() {
    setBusy("github");
    toast.info(
      "GitHub sign-in isn't enabled yet on Compass Crew. It'll go live once we finish the integration setup.",
    );
    setTimeout(() => setBusy(null), 400);
  }

  return (
    <button
      type="button"
      onClick={signInGoogle}
      disabled={busy}
      className="auth-btn-oauth"
    >
      {busy ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      Continue with Google
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.75-6-6.15S8.7 5.9 12 5.9c1.9 0 3.15.8 3.87 1.5L18.7 4.6C16.9 2.95 14.7 2 12 2 6.75 2 2.5 6.25 2.5 11.5S6.75 21 12 21c6.95 0 9.55-4.87 9.55-8.6 0-.6-.08-1.05-.16-1.5H12z"
      />
    </svg>
  );
}

async function resendVerification(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/verify-email`,
    },
  });
  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Verification email sent.");
  }
}

export const _resendVerification = resendVerification;
