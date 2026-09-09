import type { ReactNode } from "react";

interface SectionContainerProps {
  children: ReactNode;
  id?: string;
  className?: string;
  density?: "compact" | "default" | "loose";
  as?: "section" | "div";
}

/**
 * SectionContainer
 * Consistent spatial container adhering to the 12-column grid system.
 * Maximum width 1440px with responsive page gutters (32px-64px).
 */
export function SectionContainer({
  children,
  id,
  className = "",
  density = "default",
  as: Tag = "section",
}: SectionContainerProps) {
  const densityStyles = {
    compact: "py-16 sm:py-20 lg:py-24",
    default: "py-24 sm:py-32 lg:py-36",
    loose: "py-32 sm:py-40 lg:py-48",
  };

  return (
    <Tag
      id={id}
      className={`relative mx-auto w-full max-w-[1440px] px-6 sm:px-8 lg:px-12 xl:px-16 ${densityStyles[density]} ${className}`}
    >
      {children}
    </Tag>
  );
}
