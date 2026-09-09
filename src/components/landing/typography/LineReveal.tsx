import { useEffect, useState } from "react";

interface LineRevealProps {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "h4" | "div" | "p";
  className?: string;
  lineClassName?: string;
  progress?: number; // Normalized scroll progress (0..1)
  active?: boolean;
  staggerMs?: number;
  durationMs?: number;
  revealFrom?: "bottom" | "top";
  blur?: boolean;
}

/**
 * LineReveal
 *
 * Cinematic line-by-line editorial headline reveal:
 * - Each line is nested within an overflow: hidden clipping container
 * - Staggered translation, blur clearing, and opacity snapping
 * - Supports scroll progress derivation or trigger animation
 * - Uses cubic-bezier(0.16, 1, 0.3, 1)
 */
export function LineReveal({
  lines,
  as: Tag = "div",
  className = "",
  lineClassName = "",
  progress,
  active = true,
  staggerMs = 80,
  durationMs = 850,
  revealFrom = "bottom",
  blur = true,
}: LineRevealProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const fullText = lines.join(" ");

  if (reducedMotion) {
    return (
      <Tag className={className}>
        {lines.map((line, i) => (
          <span key={i} className={`block ${lineClassName}`}>
            {line}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag className={`flex flex-col select-none ${className}`} aria-label={fullText}>
      {lines.map((line, idx) => {
        let isRevealed = active;
        let lineTranslate = 0;
        let lineOpacity = 1;
        let lineBlur = 0;

        if (progress !== undefined) {
          const total = lines.length;
          const lineStart = (idx / total) * 0.45;
          const lineEnd = lineStart + 0.55;
          const clamped = Math.min(Math.max((progress - lineStart) / (lineEnd - lineStart), 0), 1);
          const easeT = clamped * clamped * (3 - 2 * clamped);

          lineOpacity = easeT;
          lineTranslate = (1 - easeT) * (revealFrom === "bottom" ? 54 : -54);
          lineBlur = (1 - easeT) * (blur ? 5 : 0);
          isRevealed = easeT > 0.05;
        }

        const transitionDelay = `${idx * staggerMs}ms`;
        const transitionDuration = `${durationMs}ms`;
        const easeBezier = "cubic-bezier(0.16, 1, 0.3, 1)";

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="block overflow-hidden"
          >
            <span
              style={
                progress !== undefined
                  ? {
                      transform: `translateY(${lineTranslate}px)`,
                      opacity: lineOpacity,
                      filter: lineBlur > 0.1 ? `blur(${lineBlur}px)` : "none",
                    }
                  : {
                      transform: isRevealed
                        ? "translateY(0)"
                        : `translateY(${revealFrom === "bottom" ? "110%" : "-110%"})`,
                      opacity: isRevealed ? 1 : 0,
                      filter: !isRevealed && blur ? "blur(5px)" : "none",
                      transitionProperty: "transform, opacity, filter",
                      transitionDuration,
                      transitionDelay,
                      transitionTimingFunction: easeBezier,
                    }
              }
              className={`block will-change-transform ${lineClassName}`}
            >
              {line}
            </span>
          </span>
        );
      })}
    </Tag>
  );
}
