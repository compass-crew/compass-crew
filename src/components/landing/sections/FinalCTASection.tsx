import { useLandingScroll, useSectionScroll } from "../LandingScrollContext";
import { FinalCTAContent } from "../hero/FinalCTAContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * FinalCTASection
 *
 * Independent landing page section for Final CTA:
 * - Semantic <section id="cta">
 * - Deliberate viewport scale: 180vh
 * - Owns conversion headline, primary and secondary call-to-action buttons,
 *   and forwards hover state to the 3D Compass
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function FinalCTASection() {
  const { setIsCtaHovered } = useLandingScroll();
  const { progress, prefersReducedMotion } = useSectionScroll("cta");

  const effectiveProgress = prefersReducedMotion ? (progress > 0.5 ? 1 : 0.5) : progress;

  const opacity = progress > 0.04 ? clamp01((progress - 0.04) / 0.16) : 0;

  return (
    <section
      id="cta"
      aria-label="Join the Crew — Your Next Build Starts Here"
      className="relative w-full"
      style={{ height: "180vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
        <div
          style={{ opacity }}
          className="relative z-10 w-full h-full pointer-events-auto transition-opacity duration-200"
        >
          <FinalCTAContent progress={effectiveProgress} onCtaHoverChange={setIsCtaHovered} />
        </div>
      </div>
    </section>
  );
}
