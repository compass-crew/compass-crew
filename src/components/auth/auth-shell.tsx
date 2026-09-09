import { useState, useEffect, lazy, Suspense, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { hasWebGL } from "./auth-helpers";
import "@/components/auth/auth-shell.css";

/* ============================ Lazy 3D Compass ============================ */

const Compass3D = lazy(() =>
  import("@/components/landing/canvas/Compass3D").then((m) => ({
    default: m.Compass3D,
  })),
);

/* ============================ Brand Visual ============================ */

export interface BrandVisualProps {
  state?: "default" | "verify" | "forgot" | "reset" | "success";
  statement?: { line1: string; line2: string; accent: string };
  subtitle?: string;
}

export function BrandVisual({ state = "default", statement, subtitle }: BrandVisualProps) {
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    setWebgl(hasWebGL());
  }, []);

  const defaultStatements: Record<
    NonNullable<BrandVisualProps["state"]>,
    { line1: string; line2: string; accent: string; sub: string }
  > = {
    default: {
      line1: "BUILD. LEARN.",
      line2: "CONNECT.",
      accent: "SHIP.",
      sub: "Your next build starts here.",
    },
    verify: {
      line1: "VERIFY. CONFIRM.",
      line2: "JOIN THE",
      accent: "CREW.",
      sub: "One step away from the community.",
    },
    forgot: {
      line1: "SECURE. RECOVER.",
      line2: "RESTORE",
      accent: "ACCESS.",
      sub: "Get back to building in moments.",
    },
    reset: {
      line1: "PROTECT. ENCRYPT.",
      line2: "SECURE.",
      accent: "SHIP.",
      sub: "Create a strong new password.",
    },
    success: {
      line1: "CONFIRMED. READY.",
      line2: "WELCOME",
      accent: "ABOARD.",
      sub: "You're all set to continue.",
    },
  };

  const active = defaultStatements[state];
  const sLine1 = statement?.line1 ?? active.line1;
  const sLine2 = statement?.line2 ?? active.line2;
  const sAccent = statement?.accent ?? active.accent;
  const sSub = subtitle ?? active.sub;

  return (
    <div className={`auth-visual auth-visual-entry auth-visual--${state}`}>
      {/* Orbital decorations */}
      <div className="auth-visual__orbit auth-visual__orbit--1" />
      <div className="auth-visual__orbit auth-visual__orbit--2" />
      <div className="auth-visual__orbit auth-visual__orbit--3" />

      {/* CSS Particles */}
      <div className="auth-visual__particles" aria-hidden="true">
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
            width={48}
            height={48}
          />
          <p className="auth-visual__brand-name">
            Compass<span>Crew</span>
          </p>
        </div>

        <div className="auth-visual__statement">
          {sLine1}
          <br />
          {sLine2} <span className="auth-visual__statement-accent">{sAccent}</span>
        </div>

        <p className="auth-visual__subtitle">{sSub}</p>

        {/* 3D Compass or static fallback */}
        <div className="auth-visual__compass" aria-hidden="true">
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

/* ============================ Shared Auth Shell ============================ */

export interface AuthShellProps {
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  brandProps?: BrandVisualProps;
}

export function AuthShell({
  children,
  backTo = "/",
  backLabel = "Back to home",
  brandProps,
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      {/* Left: Immersive Visual */}
      <BrandVisual {...brandProps} />

      {/* Right: Auth Panel */}
      <div className="auth-panel auth-entry">
        {/* Mobile Brand */}
        <div className="auth-panel__mobile-brand">
          <img
            src="/images/logo/compass-crew-logo.png"
            alt="Compass Crew"
            className="auth-panel__mobile-logo"
            loading="eager"
            width={32}
            height={32}
          />
          <span className="auth-panel__mobile-name">
            Compass<span>Crew</span>
          </span>
        </div>

        {/* Header */}
        <div className="auth-header">
          <Link to={backTo} className="auth-header__back">
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </div>

        {/* Form Area */}
        <div className="auth-form-area">{children}</div>

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

/* ============================ Auth Status / Alert ============================ */

export interface AuthAlertProps {
  variant?: "error" | "success" | "info" | "warning";
  message: ReactNode;
  id?: string;
  className?: string;
}

export function AuthAlert({
  variant = "error",
  message,
  id,
  className = "",
}: AuthAlertProps) {
  if (!message) return null;

  const icons = {
    error: <AlertCircle aria-hidden="true" />,
    success: <CheckCircle2 aria-hidden="true" />,
    info: <Info aria-hidden="true" />,
    warning: <AlertTriangle aria-hidden="true" />,
  };

  const classNames = {
    error: "auth-form-error",
    success: "auth-form-success",
    info: "auth-form-info",
    warning: "auth-form-warning",
  };

  return (
    <div
      id={id}
      className={`${classNames[variant]} ${className}`}
      role="alert"
      aria-live={variant === "error" ? "assertive" : "polite"}
    >
      {icons[variant]}
      <span>{message}</span>
    </div>
  );
}

export function PasswordPolicyChecklist({
  password,
  confirmPassword,
}: {
  password: string;
  confirmPassword?: string;
}) {
  const hasMin = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const matches =
    confirmPassword !== undefined ? confirmPassword.length > 0 && password === confirmPassword : true;

  const items = [
    { label: "8+ characters", met: hasMin },
    { label: "Uppercase letter", met: hasUpper },
    { label: "Lowercase letter", met: hasLower },
    { label: "At least 1 number", met: hasNumber },
    ...(confirmPassword !== undefined
      ? [{ label: "Passwords match", met: matches }]
      : []),
  ];

  return (
    <div className="auth-policy-checklist" aria-label="Password requirements">
      {items.map((item) => (
        <div
          key={item.label}
          className={`auth-policy-item ${item.met ? "auth-policy-item--met" : ""}`}
        >
          <Check size={13} aria-hidden="true" />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
