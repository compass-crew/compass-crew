import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "alt";
type Density = "default" | "compact" | "loose";

export function Section({
  children,
  className = "",
  id,
  tone = "default",
  density = "default",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: Tone;
  density?: Density;
  as?: "section" | "div";
}) {
  const pad =
    density === "compact"
      ? "py-14 sm:py-16 lg:py-20"
      : density === "loose"
        ? "py-24 sm:py-28 lg:py-32"
        : "py-20 sm:py-24 lg:py-28";

  if (tone === "alt") {
    return (
      <Tag id={id} className={cn("surface-alt", className)}>
        <div className={cn("mx-auto max-w-7xl px-5 sm:px-6 lg:px-8", pad)}>{children}</div>
      </Tag>
    );
  }

  return (
    <Tag id={id} className={cn("mx-auto max-w-7xl px-5 sm:px-6 lg:px-8", pad, className)}>
      {children}
    </Tag>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
          <span className="h-1 w-1 rounded-full bg-primary" />
          {eyebrow}
        </p>
      )}
      <h2 className="mt-4 font-display text-[28px] font-semibold leading-[1.1] tracking-tight sm:text-[36px] lg:text-[44px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-prose text-base leading-relaxed text-muted-foreground sm:text-[17px]">
          {description}
        </p>
      )}
    </div>
  );
}
