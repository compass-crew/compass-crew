import type { ReactNode } from "react";

interface SectionEyebrowProps {
  children: ReactNode;
  icon?: ReactNode;
  pulse?: boolean;
  className?: string;
}

/**
 * SectionEyebrow
 * Technical, authoritative monospace label used at the start of sections or feature blocks.
 * Uppercase, tracking 0.16em, 11px-12px.
 */
export function SectionEyebrow({
  children,
  icon,
  pulse = true,
  className = "",
}: SectionEyebrowProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[#8C8882] backdrop-blur-md transition-colors hover:border-white/20 hover:text-[#F5F2EA] ${className}`}
    >
      {icon ? (
        <span className="shrink-0 text-[#7C5CFF]">{icon}</span>
      ) : pulse ? (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7C5CFF] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
        </span>
      ) : (
        <span className="h-1 w-1 rounded-full bg-[#7C5CFF]" />
      )}
      <span className="font-cc-mono">{children}</span>
    </div>
  );
}
