import { Link } from "@tanstack/react-router";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_LABELS, ROLE_BADGE_VARIANTS } from "@/lib/auth/roles";

interface ForbiddenStateProps {
  title?: string;
  message?: string;
  requiredRole?: string;
}

export function ForbiddenState({
  title = "Access Denied",
  message = "Administrative privileges are required to access this area. Your current account does not possess the necessary role authorization.",
  requiredRole,
}: ForbiddenStateProps) {
  const { primaryRole, user } = useAuth();
  const badge = ROLE_BADGE_VARIANTS[primaryRole];

  return (
    <div className="flex min-h-[65vh] w-full items-center justify-center p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-xl shadow-2xl">
        {/* Glow halo */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-red-500/15 blur-3xl" />

        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 shadow-inner">
          <ShieldAlert className="h-8 w-8" />
        </div>

        {/* Title & Description */}
        <h1 className="mb-2 font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{message}</p>

        {/* Current Role Indicator */}
        {user && (
          <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-border/40 bg-muted/40 px-3 py-2 text-xs">
            <span className="text-muted-foreground">Signed in as:</span>
            <span className="font-mono text-foreground font-medium truncate max-w-[150px]">
              {user.email}
            </span>
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {ROLE_LABELS[primaryRole] ?? primaryRole}
            </span>
          </div>
        )}

        {requiredRole && (
          <p className="mb-6 text-xs text-muted-foreground/80">
            Required role: <span className="font-semibold text-foreground">{requiredRole}</span>
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Button asChild variant="default" className="gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" /> Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
