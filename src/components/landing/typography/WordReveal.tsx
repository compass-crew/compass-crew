import { useEffect, useState } from "react";

interface WordRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
  progress?: number; // Normalized progress (0 to 1)
  active?: boolean; // Boolean trigger
  staggerMs?: number; // Stagger delay in ms
  durationMs?: number; // Duration in ms
  revealFrom?: "bottom" | "top";
  blur?: boolean;
}

/**
 * WordReveal
 *
 * Cinematic word-by-word reveal system:
 * - Wraps each word in a clipping container (overflow: hidden)
 * - Directly supports gradient backgrounds (bg-clip-text text-transparent)
 * - Accessible: parent contains aria-label with full sentence; children marked aria-hidden
 * - Driven by scroll progress (0..1) or boolean trigger
 * - Uses cubic-bezier(0.16, 1, 0.3, 1)
 */
export function WordReveal({
  text,
  className = "",
  wordClassName = "",
  progress,
  active = true,
  staggerMs = 50,
  durationMs = 750,
  revealFrom = "bottom",
  blur = true,
}: WordRevealProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const words = text.split(/\s+/).filter(Boolean);

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  // Detect gradient styling
  const isGradient =
    className.includes("text-cc-brand-gradient") || className.includes("bg-gradient");
  const gradientClass = isGradient ? "text-cc-brand-gradient bg-clip-text text-transparent" : "";

  return (
    <span className={`inline-flex flex-wrap select-none ${className}`} aria-label={text}>
      {words.map((word, idx) => {
        let isRevealed = active;
        let wordTranslate = 0;
        let wordOpacity = 1;
        let wordBlur = 0;

        if (progress !== undefined) {
          const totalWords = words.length;
          const wordStart = (idx / totalWords) * 0.45;
          const wordEnd = wordStart + 0.55;
          const clamped = Math.min(Math.max((progress - wordStart) / (wordEnd - wordStart), 0), 1);
          const easeT = clamped * clamped * (3 - 2 * clamped);

          wordOpacity = easeT;
          wordTranslate = (1 - easeT) * (revealFrom === "bottom" ? 36 : -36);
          wordBlur = (1 - easeT) * (blur ? 4 : 0);
          isRevealed = easeT > 0.04;
        }

        const transitionDelay = `${idx * staggerMs}ms`;
        const transitionDuration = `${durationMs}ms`;
        const easeBezier = "cubic-bezier(0.16, 1, 0.3, 1)";

        return (
          <span
            key={idx}
            aria-hidden="true"
            className="inline-block overflow-hidden align-top mr-[0.24em] last:mr-0 pb-[0.08em]"
          >
            <span
              style={
                progress !== undefined
                  ? {
                      transform: `translateY(${wordTranslate}px)`,
                      opacity: wordOpacity,
                      filter: wordBlur > 0.1 ? `blur(${wordBlur}px)` : "none",
                    }
                  : {
                      transform: isRevealed
                        ? "translateY(0)"
                        : `translateY(${revealFrom === "bottom" ? "110%" : "-110%"})`,
                      opacity: isRevealed ? 1 : 0,
                      filter: !isRevealed && blur ? "blur(4px)" : "none",
                      transitionProperty: "transform, opacity, filter",
                      transitionDuration,
                      transitionDelay,
                      transitionTimingFunction: easeBezier,
                    }
              }
              className={`inline-block will-change-transform ${gradientClass} ${wordClassName}`}
            >
              {word}
            </span>
          </span>
        );
      })}
    </span>
  );
}
