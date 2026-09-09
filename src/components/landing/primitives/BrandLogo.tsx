import { Link } from "@tanstack/react-router";

interface BrandLogoProps {
  className?: string;
  linkTo?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Official Compass Crew Brand Logo
 * Renders the authoritative Compass Crew official brand logo with verified geometry and typography.
 */
export function BrandLogo({ className = "", linkTo = "/", size = "md" }: BrandLogoProps) {
  const iconSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Authoritative Compass Icon Badge */}
      <span className="relative flex shrink-0 items-center justify-center">
        <img
          src="/images/logo/compass-crew-logo.png"
          alt="Compass Crew"
          className={`${iconSizes[size]} rounded-lg object-contain bg-white/95 p-0.5 shadow-[0_4px_16px_rgba(79,70,255,0.3)]`}
          loading="eager"
        />
      </span>

      {/* Official Typography */}
      <span
        className={`font-cc-sans font-semibold tracking-[-0.03em] text-[#F7F8FC] ${textSizes[size]}`}
      >
        Compass<span className="text-cc-brand-gradient">Crew</span>
      </span>
    </div>
  );

  if (!linkTo) return content;

  return (
    <Link
      to={linkTo}
      className="transition-opacity hover:opacity-95"
      aria-label="Compass Crew home"
    >
      {content}
    </Link>
  );
}
