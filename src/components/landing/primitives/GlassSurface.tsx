import type { ReactNode } from "react";

interface GlassSurfaceProps {
  children: ReactNode;
  as?: "div" | "article" | "aside" | "section";
  elevated?: boolean;
  interactive?: boolean;
  glow?: "none" | "blue" | "cyan";
  radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
  id?: string;
}

/**
 * GlassSurface
 * Precision dark glass container. Layered translucent surface with hairline borders.
 * Replaces repetitive SaaS card blobs with architectural depth planes.
 */
export function GlassSurface({
  children,
  as: Tag = "div",
  elevated = false,
  interactive = false,
  glow = "none",
  radius = "xl",
  className = "",
  id,
}: GlassSurfaceProps) {
  const radiusStyles = {
    sm: "rounded-[8px]",
    md: "rounded-[12px]",
    lg: "rounded-[16px]",
    xl: "rounded-[20px]",
    "2xl": "rounded-[24px]",
    "3xl": "rounded-[32px]",
  };

  const baseSurface = elevated
    ? "bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.16)] backdrop-blur-xl"
    : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.09)] backdrop-blur-md";

  const interactiveStyles = interactive
    ? "transition-all duration-300 ease-out hover:-translate-y-[2px] hover:border-[rgba(255,255,255,0.20)] hover:bg-[rgba(255,255,255,0.07)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)]"
    : "";

  const glowStyles = {
    none: "",
    blue: "shadow-[0_0_80px_rgba(79,70,255,0.12)]",
    cyan: "shadow-[0_0_60px_rgba(0,200,255,0.12)]",
  };

  return (
    <Tag
      id={id}
      className={`relative border ${baseSurface} ${radiusStyles[radius]} ${interactiveStyles} ${glowStyles[glow]} ${className}`}
    >
      {/* Hairline subtle specular top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      {children}
    </Tag>
  );
}
