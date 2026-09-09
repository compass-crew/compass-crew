import { useSectionScroll } from "../LandingScrollContext";
import { DirectionContent } from "../hero/DirectionContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * DirectionSection
 *
 * Independent landing page section for Direction:
 * - Semantic <section id="direction">
 * - Deliberate viewport scale: 160svh
 * - Owns culminating reflective experience before the Final CTA
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function DirectionSection() {
  const { progress, prefersReducedMotion } = useSectionScroll("direction");

  const effectiveProgress = prefersReducedMotion
    ? progress > 0.5 ? 0.85 : 0.4
    : progress;

  const opacity =
    progress > 0.04
      ? clamp01((progress - 0.04) / 0.14) * (1 - clamp01((progress - 0.82) / 0.14))
      : 0;

  return (
    <section
      id="direction"
      aria-label="Direction — Find What You Want to Build"
      className="relative w-full"
      style={{ height: "160vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
        <div
          style={{ opacity }}
          className="relative z-10 w-full h-full pointer-events-auto transition-opacity duration-200"
        >
          <DirectionContent progress={effectiveProgress} />
        </div>
      </div>
    </section>
  );
}
