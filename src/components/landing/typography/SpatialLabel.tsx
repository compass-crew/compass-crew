import type { ReactNode } from "react";

interface SpatialLabelProps {
  children: ReactNode;
  sceneNumber?: string;
  className?: string;
  pulse?: boolean;
  align?: "left" | "center" | "right";
  accent?: "ultraviolet" | "violet" | "coral" | "mint" | "default";
}

/**
 * SpatialLabel
 *
 * Monospace architectural environmental label used for:
 * - Scene numbers: 01 // DISCOVER, 02 // BUILD, 03 // LEARN
 * - Spatial coordinate markers and technical indicators
 * - Strict adherence to: 1 Primary Label + 1 Secondary Technical Label per scene
 * - Muted technical styling: hairline border, subdued pulse, zero visual noise
 */
export function SpatialLabel({
  children,
  sceneNumber,
  className = "",
  pulse = true,
  align = "left",
  accent = "ultraviolet",
}: SpatialLabelProps) {
  const alignClasses = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  const accentColorClasses = {
    ultraviolet: "bg-[#7C5CFF] text-[#7C5CFF]",
    violet: "bg-[#B36BFF] text-[#B36BFF]",
    coral: "bg-[#FF7A6B] text-[#FF7A6B]",
    mint: "bg-[#7DD3A8] text-[#7DD3A8]",
    default: "bg-[#7C5CFF] text-[#7C5CFF]",
  };

  const pulseDotClasses = {
    ultraviolet: "bg-[#7C5CFF]",
    violet: "bg-[#B36BFF]",
    coral: "bg-[#FF7A6B]",
    mint: "bg-[#7DD3A8]",
    default: "bg-[#7C5CFF]",
  };

  const numColorClasses = {
    ultraviolet: "text-[#7C5CFF]",
    violet: "text-[#B36BFF]",
    coral: "text-[#FF7A6B]",
    mint: "text-[#7DD3A8]",
    default: "text-[#7C5CFF]",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#111116]/80 px-3 py-1 backdrop-blur-md font-cc-mono text-[11px] font-medium tracking-[0.16em] text-[#F5F2EA] select-none shadow-[0_2px_8px_rgba(0,0,0,0.4)] ${alignClasses[align]} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${pulseDotClasses[accent]} animate-pulse`} />
        </span>
      )}

      {sceneNumber && (
        <span className={`${numColorClasses[accent]} font-semibold`}>
          {sceneNumber}
        </span>
      )}

      <span className="uppercase text-[#B8B4B0] font-normal">
        {children}
      </span>
    </div>
  );
}
