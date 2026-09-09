import { Link } from "@tanstack/react-router";

export function Logo({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 ${className}`} aria-label="Compass Crew">
      <span className="relative flex shrink-0 items-center justify-center">
        <img
          src="/images/logo/compass-crew-logo.png"
          alt="Compass Crew"
          className="h-9 w-9 rounded-lg object-contain bg-white/95 p-0.5 shadow-sm"
          loading="eager"
        />
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-tight">
          Compass<span className="text-gradient-brand">Crew</span>
        </span>
      )}
    </Link>
  );
}
