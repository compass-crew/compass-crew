import { useState, useEffect, useCallback } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Check, Compass } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/use-auth";
import { requireAuth } from "@/lib/auth-guard";
import { safeRedirect } from "@/lib/safe-redirect";
import "@/components/auth/auth-shell.css";

/* ============================ Route ============================ */

export const Route = createFileRoute("/auth/onboarding")({
  beforeLoad: async ({ location }) => {
    // 1. Require authenticated session, but allow incomplete onboarding
    const authCheck = requireAuth({ requireOnboarding: false });
    const { user } = await authCheck({ location });

    // 2. If user has already completed onboarding, route them to dashboard
    const { data: profile } = await supabase
      .from("profiles")
      .select("college")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.college && profile.college.trim().length > 0) {
      throw redirect({ to: "/dashboard" });
    }

    return { user };
  },
  head: () => ({
    meta: [
      { title: "Complete your profile — Compass Crew" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OnboardingPage,
});

/* ============================ Constants ============================ */

const DEGREE_OPTIONS = [
  "",
  "B.Tech",
  "B.E.",
  "BCA",
  "MCA",
  "B.Sc.",
  "M.Sc.",
  "MBA",
  "BBA",
  "B.Des",
  "M.Des",
  "Ph.D.",
  "Diploma",
  "Other",
];

const YEAR_OPTIONS = ["", "1st year", "2nd year", "3rd year", "4th year", "5th year+", "Graduated"];

const INTEREST_OPTIONS = [
  "AI / ML",
  "Web Development",
  "Mobile Development",
  "Hackathons",
  "Open Source",
  "Cybersecurity",
  "Data Science",
  "Design",
  "Product",
  "Startups",
  "Research",
  "Robotics",
  "Cloud / DevOps",
  "Blockchain",
  "Game Dev",
] as const;

const MAX_INTERESTS = 5;

/* ============================ Page ============================ */

function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <div className="onboarding-shell">
        <div className="onboarding-body" style={{ justifyContent: "center" }}>
          <Loader2 size={32} className="animate-spin" style={{ color: "#7c5cff" }} />
        </div>
      </div>
    );
  }

  return <OnboardingWizard userId={user.id} />;
}

/* ============================ Wizard ============================ */

type Step = "profile" | "interests" | "welcome";
const STEPS: Step[] = ["profile", "interests", "welcome"];

interface ProfileData {
  college: string;
  degree: string;
  year_of_study: string;
  branch: string;
  country: string;
  state: string;
}

function OnboardingWizard({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("profile");
  const [saving, setSaving] = useState(false);

  // Profile step state
  const [profile, setProfile] = useState<ProfileData>({
    college: "",
    degree: "",
    year_of_study: "",
    branch: "",
    country: "India",
    state: "",
  });

  // Interests step state
  const [interests, setInterests] = useState<string[]>([]);

  // Load existing profile data on mount (for refresh recovery)
  useEffect(() => {
    async function loadExisting() {
      const { data } = await supabase
        .from("profiles")
        .select("college, degree, year_of_study, branch, country, state, skills")
        .eq("id", userId)
        .maybeSingle();
      if (data) {
        setProfile((prev) => ({
          college: data.college || prev.college,
          degree: data.degree || prev.degree,
          year_of_study: data.year_of_study || prev.year_of_study,
          branch: data.branch || prev.branch,
          country: data.country || prev.country,
          state: data.state || prev.state,
        }));
        if (data.skills && data.skills.length > 0) {
          setInterests(data.skills);
        }
      }
    }
    void loadExisting();
  }, [userId]);

  const stepIndex = STEPS.indexOf(step);

  const goToDashboard = useCallback(() => {
    let target = "/dashboard";
    try {
      const saved = sessionStorage.getItem("cc:post-auth-redirect");
      if (saved) {
        target = safeRedirect(saved, "/dashboard");
        sessionStorage.removeItem("cc:post-auth-redirect");
      }
    } catch {
      /* ignore */
    }
    navigate({ to: target.startsWith("/auth") ? "/dashboard" : target });
  }, [navigate]);

  /* --- Save Profile --- */
  async function saveProfile() {
    setSaving(true);
    const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};
    // Only save non-empty values (patch-style, never overwrite with empty)
    if (profile.college.trim()) patch.college = profile.college.trim();
    if (profile.degree.trim()) patch.degree = profile.degree.trim();
    if (profile.year_of_study.trim()) patch.year_of_study = profile.year_of_study.trim();
    if (profile.branch.trim()) patch.branch = profile.branch.trim();
    if (profile.country.trim()) patch.country = profile.country.trim();
    if (profile.state.trim()) patch.state = profile.state.trim();

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (error) {
        toast.error("Couldn't save your profile. Please try again.");
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setStep("interests");
  }

  /* --- Save Interests --- */
  async function saveInterests() {
    setSaving(true);
    if (interests.length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update({ skills: interests })
        .eq("id", userId);
      if (error) {
        toast.error("Couldn't save your interests. Please try again.");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    setStep("welcome");
  }

  function toggleInterest(interest: string) {
    setInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= MAX_INTERESTS) return prev;
      return [...prev, interest];
    });
  }

  return (
    <div className="onboarding-shell">
      {/* Header */}
      <div className="onboarding-header">
        <Link to="/" className="onboarding-header__brand">
          <img
            src="/images/logo/compass-crew-logo.png"
            alt="Compass Crew"
            className="onboarding-header__logo"
            loading="eager"
          />
          <span className="onboarding-header__name">
            Compass<span>Crew</span>
          </span>
        </Link>
        {step !== "welcome" && (
          <button type="button" className="onboarding-header__skip" onClick={goToDashboard}>
            Skip for now
          </button>
        )}
      </div>

      {/* Body */}
      <div className="onboarding-body">
        {/* Progress */}
        {step !== "welcome" && (
          <div className="onboarding-progress">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`onboarding-progress__dot ${
                  i < stepIndex
                    ? "onboarding-progress__dot--done"
                    : i === stepIndex
                      ? "onboarding-progress__dot--active"
                      : ""
                }`}
              />
            ))}
            <div className="onboarding-progress__bar" />
            <span className="onboarding-progress__label">
              {stepIndex + 1} of {STEPS.length}
            </span>
          </div>
        )}

        {/* Steps */}
        {step === "profile" && (
          <ProfileStep
            data={profile}
            onChange={setProfile}
            onNext={saveProfile}
            onSkip={() => setStep("interests")}
            saving={saving}
          />
        )}

        {step === "interests" && (
          <InterestsStep
            selected={interests}
            onToggle={toggleInterest}
            onNext={saveInterests}
            onBack={() => setStep("profile")}
            onSkip={() => setStep("welcome")}
            saving={saving}
          />
        )}

        {step === "welcome" && <WelcomeStep onContinue={goToDashboard} />}
      </div>

      {/* Footer */}
      <div className="onboarding-footer">
        <span>© {new Date().getFullYear()} Compass Crew</span>
        <span className="onboarding-footer__sep">·</span>
        <Link to="/privacy">Privacy</Link>
        <span className="onboarding-footer__sep">·</span>
        <Link to="/terms">Terms</Link>
      </div>
    </div>
  );
}

/* ============================ Profile Step ============================ */

function ProfileStep({
  data,
  onChange,
  onNext,
  onSkip,
  saving,
}: {
  data: ProfileData;
  onChange: (d: ProfileData) => void;
  onNext: () => void;
  onSkip: () => void;
  saving: boolean;
}) {
  function set(key: keyof ProfileData, value: string) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="onboarding-step" key="profile">
      <h1 className="onboarding-step__title">Complete your profile</h1>
      <p className="onboarding-step__subtitle">Help us personalize your Compass Crew experience.</p>

      {/* College */}
      <div className="auth-field">
        <label htmlFor="ob-college" className="auth-label">
          College / University
        </label>
        <input
          id="ob-college"
          className="auth-input"
          placeholder="IIT Bombay"
          value={data.college}
          onChange={(e) => set("college", e.target.value)}
          maxLength={160}
        />
      </div>

      {/* Degree + Year */}
      <div className="auth-grid-2">
        <div className="auth-field">
          <label htmlFor="ob-degree" className="auth-label">
            Degree
          </label>
          <select
            id="ob-degree"
            className="auth-select"
            value={data.degree}
            onChange={(e) => set("degree", e.target.value)}
          >
            <option value="" disabled>
              Select degree
            </option>
            {DEGREE_OPTIONS.filter(Boolean).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="auth-field">
          <label htmlFor="ob-year" className="auth-label">
            Year
          </label>
          <select
            id="ob-year"
            className="auth-select"
            value={data.year_of_study}
            onChange={(e) => set("year_of_study", e.target.value)}
          >
            <option value="" disabled>
              Select year
            </option>
            {YEAR_OPTIONS.filter(Boolean).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Branch */}
      <div className="auth-field">
        <label htmlFor="ob-branch" className="auth-label">
          Branch / Field
        </label>
        <input
          id="ob-branch"
          className="auth-input"
          placeholder="CSE, AI/ML, ECE, Design…"
          value={data.branch}
          onChange={(e) => set("branch", e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Country + State */}
      <div className="auth-grid-2">
        <div className="auth-field">
          <label htmlFor="ob-country" className="auth-label">
            Country
          </label>
          <input
            id="ob-country"
            className="auth-input"
            placeholder="India"
            value={data.country}
            onChange={(e) => set("country", e.target.value)}
            maxLength={80}
          />
        </div>

        <div className="auth-field">
          <label htmlFor="ob-state" className="auth-label">
            State
          </label>
          <input
            id="ob-state"
            className="auth-input"
            placeholder="Karnataka"
            value={data.state}
            onChange={(e) => set("state", e.target.value)}
            maxLength={80}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="onboarding-actions">
        <button type="button" className="auth-btn-primary" onClick={onNext} disabled={saving}>
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>

      <button type="button" className="onboarding-skip-link" onClick={onSkip}>
        Skip for now
      </button>
    </div>
  );
}

/* ============================ Interests Step ============================ */

function InterestsStep({
  selected,
  onToggle,
  onNext,
  onBack,
  onSkip,
  saving,
}: {
  selected: string[];
  onToggle: (interest: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  saving: boolean;
}) {
  return (
    <div className="onboarding-step" key="interests">
      <h1 className="onboarding-step__title">What are you into?</h1>
      <p className="onboarding-step__subtitle">
        Pick up to {MAX_INTERESTS} interests to personalize your feed.
      </p>

      <p className="onboarding-chips-hint">
        {selected.length} of {MAX_INTERESTS} selected
      </p>

      <div className="onboarding-chips">
        {INTEREST_OPTIONS.map((interest) => {
          const isSelected = selected.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              className={`onboarding-chip ${isSelected ? "onboarding-chip--selected" : ""}`}
              onClick={() => onToggle(interest)}
              aria-pressed={isSelected}
            >
              {isSelected && <Check className="onboarding-chip__check" />}
              {interest}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="onboarding-actions">
        <button type="button" className="onboarding-btn-back" onClick={onBack}>
          <ArrowLeft size={16} />
          Back
        </button>
        <button type="button" className="auth-btn-primary" onClick={onNext} disabled={saving}>
          {saving && <Loader2 size={18} className="animate-spin" />}
          {saving ? "Saving…" : "Continue"}
        </button>
      </div>

      <button type="button" className="onboarding-skip-link" onClick={onSkip}>
        Skip for now
      </button>
    </div>
  );
}

/* ============================ Welcome Step ============================ */

function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="onboarding-step onboarding-welcome" key="welcome">
      <div className="onboarding-welcome__icon">
        <Compass size={32} style={{ color: "#7c5cff" }} />
      </div>
      <h1 className="onboarding-welcome__heading">You're in.</h1>
      <p className="onboarding-welcome__sub">
        Welcome to Compass Crew. Your next build starts here.
      </p>
      <button type="button" className="auth-btn-primary" onClick={onContinue}>
        Continue to Compass Crew
      </button>
    </div>
  );
}
