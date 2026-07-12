import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Compass Crew home">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand shadow-elegant">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Compass<span className="text-gradient-brand">Crew</span>
      </span>
    </Link>
  );
}
