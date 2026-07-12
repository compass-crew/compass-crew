import { useState } from "react";
import { createFileRoute, Link, useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Github,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Logo } from "@/components/logo";

type AuthSearch = { redirect?: string; mode?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    mode: search.mode === "signup" ? "signup" : search.mode === "login" ? "login" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Compass Crew" },
      {
        name: "description",
        content: "Sign in or create your Compass Crew account to join India's student innovation community.",
      },
    ],
  }),
  component: AuthPage,
});

/* ============================ Schemas ============================ */

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
  password: z.string().min(1, { message: "Password is required" }).max(128),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof loginSchema>;

const signupSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email({ message: "Enter a valid email" }).max(255),
    password: z
      .string()
      .min(8, "Minimum 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(/[A-Z]/, "Add an uppercase letter")
      .regex(/[a-z]/, "Add a lowercase letter")
      .regex(/[0-9]/, "Add a number"),
    confirm_password: z.string(),
    country: z.string().trim().min(1, "Required").max(80),
    state: z.string().trim().min(1, "Required").max(80),
    college: z.string().trim().min(1, "Required").max(160),
    degree: z.string().trim().min(1, "Required").max(80),
    year_of_study: z.string().trim().min(1, "Required").max(20),
    branch: z.string().trim().min(1, "Required").max(80),
    linkedin_url: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Must be a URL"),
    github_url: z
      .string()
      .trim()
      .max(255)
      .optional()
      .or(z.literal(""))
      .refine((v) => !v || /^https?:\/\/.+/i.test(v), "Must be a URL"),
    agree_privacy: z.boolean().refine((v) => v === true, "You must agree"),
    agree_conduct: z.boolean().refine((v) => v === true, "You must agree"),
    newsletter: z.boolean(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
type SignupValues = z.infer<typeof signupSchema>;

/* ============================ Password strength ============================ */

function passwordStrength(pw: string): { score: number; label: string; tone: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Very weak", tone: "bg-destructive" },
    { label: "Weak", tone: "bg-destructive" },
    { label: "Fair", tone: "bg-warning" },
    { label: "Good", tone: "bg-primary" },
    { label: "Strong", tone: "bg-success" },
    { label: "Excellent", tone: "bg-success" },
  ];
  return { score, ...map[score] };
}

/* ============================ Sanitize redirect ============================ */

function safeRedirect(path?: string): string {
  if (!path || typeof path !== "string") return "/dashboard";
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

/* ============================ Component ============================ */

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const [tab, setTab] = useState<"login" | "signup">(search.mode ?? "login");

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-brand opacity-25 blur-3xl animate-blob" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-secondary/20 blur-3xl animate-blob [animation-delay:-8s]" />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-16">
        {/* Left column — pitch */}
        <div className="hidden lg:flex lg:flex-col lg:justify-center">
          <Logo />
          <h1 className="mt-8 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Join the crew building{" "}
            <span className="text-gradient-brand">India's tech future.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
            One account. Hackathons, AI workshops, research pods, open-source and startup programs
            — free for every student in India.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
            {[
              "Register for hackathons in one click",
              "Get matched with mentors and teams",
              "Build a verified portfolio",
              "Access exclusive workshops and drops",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* Right column — form card */}
        <div className="mx-auto w-full max-w-md">
          <Card className="border-border/70 bg-card/70 shadow-glow backdrop-blur-xl">
            <CardContent className="p-6 sm:p-8">
              <div className="lg:hidden mb-6 flex justify-center">
                <Logo />
              </div>
              <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Create account</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-6 animate-fade-in">
                  <LoginForm redirect={search.redirect} />
                </TabsContent>
                <TabsContent value="signup" className="mt-6 animate-fade-in">
                  <SignupForm onDone={() => setTab("login")} />
                </TabsContent>
              </Tabs>

              <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Secured by Lovable Cloud
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================ Login form ============================ */

function LoginForm({ redirect }: { redirect?: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  async function onSubmit(values: LoginValues) {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    setSubmitting(false);
    if (error) {
      if (/email.*not.*confirm/i.test(error.message)) {
        toast.error("Please verify your email before signing in.", {
          action: {
            label: "Resend",
            onClick: () => resendVerification(values.email),
          },
        });
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Welcome back!");
    await router.invalidate();
    navigate({ to: safeRedirect(redirect) });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <SocialButtons redirect={redirect} />

      <Divider />

      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" placeholder="you@campus.edu" {...form.register("email")} />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="login-pw">Password</Label>
          <Link
            to="/auth/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="login-pw"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          <button
            type="button"
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-foreground"
            onClick={() => setShowPw((s) => !s)}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <Checkbox
          checked={form.watch("remember")}
          onCheckedChange={(v) => form.setValue("remember", Boolean(v))}
        />
        Remember me on this device
      </label>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-brand text-white shadow-glow hover:opacity-90"
      >
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}

/* ============================ Signup form ============================ */

function SignupForm({ onDone }: { onDone: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      country: "India",
      state: "",
      college: "",
      degree: "",
      year_of_study: "",
      branch: "",
      linkedin_url: "",
      github_url: "",
      agree_privacy: false,
      agree_conduct: false,
      newsletter: true,
    },
  });

  const password = form.watch("password") ?? "";
  const strength = passwordStrength(password);

  async function onSubmit(values: SignupValues) {
    setSubmitting(true);
    const emailRedirectTo = `${window.location.origin}/auth/verify-email?email=${encodeURIComponent(values.email)}`;
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
      toast.error(error.message);
      return;
    }

    // Persist the extended profile fields once the row exists (created by trigger).
    if (data.user) {
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name,
          country: values.country,
          state: values.state,
          college: values.college,
          degree: values.degree,
          year_of_study: values.year_of_study,
          branch: values.branch,
          linkedin_url: values.linkedin_url || null,
          github_url: values.github_url || null,
          newsletter_opt_in: values.newsletter,
        })
        .eq("id", data.user.id);
      if (profileErr) {
        console.warn("[signup] profile update failed", profileErr.message);
      }
    }

    setSubmitting(false);
    toast.success("Account created. Check your email to verify.");
    if (data.session) {
      navigate({ to: "/dashboard" });
    } else {
      navigate({ to: "/auth/verify-email", search: { email: values.email } });
      onDone();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <SocialButtons />
      <Divider />

      <Field label="Full name" error={form.formState.errors.full_name?.message}>
        <Input autoComplete="name" placeholder="Ada Lovelace" {...form.register("full_name")} />
      </Field>

      <Field label="Email" error={form.formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@campus.edu" {...form.register("email")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Password" error={form.formState.errors.password?.message}>
          <div className="relative">
            <Input
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              {...form.register("password")}
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-2 grid place-items-center text-muted-foreground hover:text-foreground"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {password && (
            <div className="mt-1.5 space-y-1">
              <Progress value={(strength.score / 5) * 100} className="h-1.5" />
              <p className="text-[11px] text-muted-foreground">
                Password strength: <span className="font-medium text-foreground">{strength.label}</span>
              </p>
            </div>
          )}
        </Field>
        <Field label="Confirm password" error={form.formState.errors.confirm_password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("confirm_password")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Country" error={form.formState.errors.country?.message}>
          <Input placeholder="India" {...form.register("country")} />
        </Field>
        <Field label="State" error={form.formState.errors.state?.message}>
          <Input placeholder="Karnataka" {...form.register("state")} />
        </Field>
      </div>

      <Field label="College / University" error={form.formState.errors.college?.message}>
        <Input placeholder="IIT Bombay" {...form.register("college")} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Degree" error={form.formState.errors.degree?.message}>
          <Input placeholder="B.Tech" {...form.register("degree")} />
        </Field>
        <Field label="Year" error={form.formState.errors.year_of_study?.message}>
          <Input placeholder="3rd year" {...form.register("year_of_study")} />
        </Field>
        <Field label="Branch" error={form.formState.errors.branch?.message}>
          <Input placeholder="CSE" {...form.register("branch")} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="LinkedIn (optional)" error={form.formState.errors.linkedin_url?.message}>
          <Input placeholder="https://linkedin.com/in/you" {...form.register("linkedin_url")} />
        </Field>
        <Field label="GitHub (optional)" error={form.formState.errors.github_url?.message}>
          <Input placeholder="https://github.com/you" {...form.register("github_url")} />
        </Field>
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
        <label className="flex items-start gap-2 text-xs text-foreground">
          <Checkbox
            checked={form.watch("agree_privacy")}
            onCheckedChange={(v) => form.setValue("agree_privacy", Boolean(v), { shouldValidate: true })}
          />
          <span>
            I agree to the{" "}
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {form.formState.errors.agree_privacy && (
          <p className="pl-6 text-xs text-destructive">{form.formState.errors.agree_privacy.message}</p>
        )}
        <label className="flex items-start gap-2 text-xs text-foreground">
          <Checkbox
            checked={form.watch("agree_conduct")}
            onCheckedChange={(v) => form.setValue("agree_conduct", Boolean(v), { shouldValidate: true })}
          />
          <span>
            I agree to the{" "}
            <Link to="/code-of-conduct" className="text-primary hover:underline">
              Code of Conduct
            </Link>
            .
          </span>
        </label>
        {form.formState.errors.agree_conduct && (
          <p className="pl-6 text-xs text-destructive">{form.formState.errors.agree_conduct.message}</p>
        )}
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <Checkbox
            checked={form.watch("newsletter")}
            onCheckedChange={(v) => form.setValue("newsletter", Boolean(v))}
          />
          <span>Send me the Compass Crew newsletter (monthly).</span>
        </label>
      </div>

      <Button
        type="submit"
        disabled={submitting}
        className="w-full bg-gradient-brand text-white shadow-glow hover:opacity-90"
      >
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create account
      </Button>
    </form>
  );
}

/* ============================ Shared ============================ */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNodeSafe;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
type ReactNodeSafe = React.ReactNode;

function Divider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
        <span className="bg-card/70 px-2 text-muted-foreground">or continue with</span>
      </div>
    </div>
  );
}

function SocialButtons({ redirect }: { redirect?: string }) {
  const [busy, setBusy] = useState<null | "google" | "github">(null);

  async function signInGoogle() {
    setBusy("google");
    if (redirect) {
      try {
        sessionStorage.setItem("cc:post-auth-redirect", safeRedirect(redirect));
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
    <div className="grid gap-2 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        onClick={signInGoogle}
        disabled={busy !== null}
        className="w-full"
      >
        {busy === "google" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <GoogleIcon className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={signInGithub}
        disabled={busy !== null}
        className="w-full"
      >
        <Github className="mr-2 h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  );
}

function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
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
    options: { emailRedirectTo: `${window.location.origin}/auth/verify-email` },
  });
  if (error) {
    toast.error(error.message);
  } else {
    toast.success("Verification email sent.");
  }
}

export const _resendVerification = resendVerification;
