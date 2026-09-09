import { useSectionScroll } from "../LandingScrollContext";
import { GrowContent } from "../hero/GrowContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function sectionOpacity(p: number, fadeInEnd = 0.12, fadeOutStart = 0.85, fadeOutEnd = 0.98) {
  return clamp01(p / fadeInEnd) * (1 - clamp01((p - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
}

/**
 * GrowSection
 *
 * Independent landing page section for Grow:
 * - Semantic <section id="grow">
 * - Deliberate viewport scale: 140svh
 * - Owns Grow typography, Opportunity Field (6 interactive opportunity paths:
 *   Internship, Research, Startup, Open Source, Mentorship, Community),
 *   and expansion visual from Step 13
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function GrowSection() {
  const { progress, prefersReducedMotion } = useSectionScroll("grow");

  const effectiveProgress = prefersReducedMotion
    ? progress > 0.5 ? 1 : 0.5
    : progress;

  return (
    <section
      id="grow"
      aria-label="Grow — Opportunity and Impact"
      className="relative w-full"
      style={{ height: "140vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
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
