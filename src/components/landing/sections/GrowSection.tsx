import { useSectionScroll } from "../LandingScrollContext";
import { GrowContent } from "../hero/GrowContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function sectionOpacity(p: number, fadeInEnd = 0.16, fadeOutStart = 0.82, fadeOutEnd = 0.98) {
  return clamp01(p / fadeInEnd) * (1 - clamp01((p - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
}

/**
 * GrowSection
 *
 * Independent landing page section for Grow:
 * - Semantic <section id="grow">
 * - Deliberate viewport scale: 240vh (giving 140vh of pinned travel for 6 opportunity paths)
 * - Owns Grow typography, Opportunity Field matrix, and divergent paths
 * - Generous stable HOLD phase between 0.38 and 0.82 where content is 100% visible
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function GrowSection() {
  const { progress, prefersReducedMotion } = useSectionScroll("grow");

  const effectiveProgress = prefersReducedMotion ? (progress > 0.5 ? 0.6 : 0.2) : progress;

  return (
    <section
      id="grow"
      aria-label="Grow — Opportunity and Impact"
      className="relative w-full"
      style={{ height: "240vh" }}
    >
      <div className="sticky top-0 h-screen w-full flex flex-col pointer-events-none">
        <div
          style={{ opacity: sectionOpacity(progress) }}
          className="relative z-10 w-full h-full pointer-events-auto transition-opacity duration-150"
        >
          <GrowContent progress={effectiveProgress} />
        </div>
      </div>
    </section>
  );
}
