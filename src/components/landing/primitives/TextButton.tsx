import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface TextButtonProps {
  children: ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  showArrow?: boolean;
}

/**
 * TextButton
 * Minimal, confident inline action button.
 * Directional indicator shifts slightly on hover.
 */
export function TextButton({
  children,
  to,
  onClick,
  className = "",
  showArrow = true,
}: TextButtonProps) {
  const baseStyles =
    "group inline-flex items-center gap-1.5 font-cc-sans text-sm font-medium text-[#AAB2C5] transition-colors duration-200 hover:text-[#F7F8FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366FF] rounded";

  const content = (
    <>
      <span>{children}</span>
      {showArrow && (
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1 text-[#7C83FF]"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseStyles} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${baseStyles} ${className}`}>
      {content}
    </button>
  );
}
