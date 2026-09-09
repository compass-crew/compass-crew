import type { ReactNode } from "react";

interface BodyTextProps {
  children: ReactNode;
  as?: "p" | "span" | "div";
  size?: "lg" | "md" | "sm";
  level?: 2 | 3 | 4;
  className?: string;
  align?: "left" | "center" | "right";
}

/**
 * BodyText
 * Accessible, readable paragraph and supporting text.
 * Strictly adheres to text color hierarchy:
 * - level 2 (#D5DBE8): Important supporting copy
 * - level 3 (#AAB2C5): Standard body copy
 * - level 4 (#737D95): Metadata and secondary notes
 */
export function BodyText({
  children,
  as: Tag = "p",
  size = "md",
  level = 3,
  className = "",
  align = "left",
}: BodyTextProps) {
  const sizeStyles = {
    lg: "text-lg sm:text-[20px] leading-[1.6]",
    md: "text-[15px] sm:text-[16px] leading-[1.65]",
    sm: "text-[13.5px] sm:text-[14px] leading-[1.6]",
  };

  const levelStyles = {
    2: "text-[#D5DBE8]",
    3: "text-[#AAB2C5]",
    4: "text-[#737D95]",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <Tag
      className={`font-cc-sans tracking-[-0.01em] ${sizeStyles[size]} ${levelStyles[level]} ${alignStyles[align]} ${className}`}
    >
      {children}
    </Tag>
  );
}
