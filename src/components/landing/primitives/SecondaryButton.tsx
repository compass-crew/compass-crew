import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface SecondaryButtonProps {
  children: ReactNode;
  to?: string;
  search?: Record<string, unknown>;
  onClick?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  type?: "button" | "submit" | "reset";
}

/**
 * SecondaryButton
 * Dark translucent surface button with hairline border.
 * Elevates slightly on hover with subtle border brightening.
 */
export function SecondaryButton({
  children,
  to,
  search,
  onClick,
  className = "",
  size = "md",
  icon,
  type = "button",
}: SecondaryButtonProps) {
  const sizeStyles = {
    sm: "h-9 px-4 text-xs gap-1.5",
    md: "h-11 px-5 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
  };

  const baseStyles =
    "group inline-flex items-center justify-center font-cc-sans font-medium text-[#F5F2EA] rounded-[12px] border border-white/[0.09] bg-white/[0.04] backdrop-blur-md transition-all duration-200 ease-out hover:-translate-y-[1px] hover:border-white/20 hover:bg-white/[0.08] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]";

  const content = (
    <>
      {icon && <span className="shrink-0 text-[#8C8882] transition-colors group-hover:text-[#F5F2EA]">{icon}</span>}
      <span>{children}</span>
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
