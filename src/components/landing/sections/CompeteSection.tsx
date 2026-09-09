import { useSectionScroll } from "../LandingScrollContext";
import { CompeteContent } from "../hero/CompeteContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function sectionOpacity(p: number, fadeInEnd = 0.12, fadeOutStart = 0.85, fadeOutEnd = 0.98) {
  return clamp01(p / fadeInEnd) * (1 - clamp01((p - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
}

/**
 * CompeteSection
 *
 * Independent landing page section for Compete:
 * - Semantic <section id="compete">
 * - Deliberate viewport scale: 140svh
 * - Owns Compete typography, Challenge Arena core, and hackathon system
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function CompeteSection() {
  const { progress, prefersReducedMotion } = useSectionScroll("compete");

  const effectiveProgress = prefersReducedMotion
    ? progress > 0.5 ? 1 : 0.5
    : progress;

  return (
    <section
      id="compete"
      aria-label="Compete — Rise in the Arena"
      className="relative w-full"
      style={{ height: "140vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
        <div
          style={{ opacity: sectionOpacity(progress) }}
          className="relative z-10 w-full h-full pointer-events-auto transition-opacity duration-150"
        >
          <CompeteContent progress={effectiveProgress} />
        </div>
      </div>
    </section>
  );
}
