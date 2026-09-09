import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

interface PrimaryButtonProps {
  children: ReactNode;
  to?: string;
  search?: Record<string, unknown>;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showArrow?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * PrimaryButton
 * Controlled brand gradient button with directional arrow.
 * Confident, not salesy. Elevated depth with subtle specular highlight.
 */
export function PrimaryButton({
  children,
  to,
  search,
  onClick,
  className = "",
  size = "md",
  showArrow = true,
  type = "button",
}: PrimaryButtonProps) {
  const sizeStyles = {
    sm: "h-9 px-4 text-xs gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const baseStyles =
    "group relative inline-flex items-center justify-center font-cc-sans font-semibold text-white rounded-[12px] bg-cc-brand-gradient shadow-[0_1px_2px_rgba(0,0,0,0.4),0_8px_24px_-4px_rgba(124,92,255,0.45)] transition-all duration-200 ease-out hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.5),0_14px_32px_-4px_rgba(124,92,255,0.65)] hover:brightness-[1.06] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]";

  const content = (
    <>
      {/* Specular hairline inner edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[12px] ring-1 ring-inset ring-white/20"
      />
      <span>{children}</span>
      {showArrow && (
        <ArrowUpRight
          className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} search={search} className={`${baseStyles} ${sizeStyles[size]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${className}`}
    >
      {content}
    </button>
  );
}
