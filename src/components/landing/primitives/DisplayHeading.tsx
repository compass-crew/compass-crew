import type { ReactNode } from "react";

interface DisplayHeadingProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  variant?: "hero" | "hero-supporting" | "section" | "subsection";
  className?: string;
  align?: "left" | "center" | "right";
}

/**
 * DisplayHeading
 * High-authority, tightly tracked editorial display typography.
 * Follows strict type scale:
 * - hero: clamp(64px, 8vw, 144px) with line-height 0.90
 * - hero-supporting: clamp(40px, 5vw, 80px) with line-height 0.98
 * - section: clamp(42px, 5vw, 88px) with line-height 0.96
 * - subsection: clamp(28px, 3.5vw, 44px) with line-height 1.05
 */
export function DisplayHeading({
  children,
  as: Tag = "h2",
  variant = "section",
  className = "",
  align = "left",
}: DisplayHeadingProps) {
  const variantStyles = {
    hero: "text-[clamp(48px,14vw,72px)] sm:text-[clamp(64px,8vw,144px)] leading-[0.90] tracking-[-0.05em] font-bold",
    "hero-supporting": "text-[clamp(32px,8vw,52px)] sm:text-[clamp(40px,5vw,80px)] leading-[0.98] tracking-[-0.04em] font-semibold",
    section: "text-[clamp(36px,10vw,56px)] sm:text-[clamp(42px,5vw,88px)] leading-[0.95] tracking-[-0.045em] font-bold",
    subsection: "text-[clamp(24px,6vw,36px)] sm:text-[clamp(28px,3.5vw,44px)] leading-[1.05] tracking-[-0.035em] font-semibold",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag
      className={`font-cc-sans text-[#F7F8FC] ${variantStyles[variant]} ${alignStyles[align]} ${className}`}
    >
      {children}
    </Tag>
  );
}
