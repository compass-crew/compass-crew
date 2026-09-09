import { useSectionScroll } from "../LandingScrollContext";
import { ConnectContent } from "../hero/ConnectContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function sectionOpacity(p: number, fadeInEnd = 0.12, fadeOutStart = 0.85, fadeOutEnd = 0.98) {
  return clamp01(p / fadeInEnd) * (1 - clamp01((p - fadeOutStart) / (fadeOutEnd - fadeOutStart)));
}

/**
 * ConnectSection
 *
 * Independent landing page section for Connect:
 * - Semantic <section id="connect">
 * - Deliberate viewport scale: 140svh
 * - Owns Connect typography, peer network mesh, and team collaboration matching
 * - Smooth enter/active/exit opacity based on intra-section progress
 */
export function ConnectSection() {
  const { progress, prefersReducedMotion } = useSectionScroll("connect");

  const effectiveProgress = prefersReducedMotion
    ? progress > 0.5 ? 1 : 0.5
    : progress;

  return (
    <section
      id="connect"
      aria-label="Connect — Your Community, Your Network"
      className="relative w-full"
      style={{ height: "140vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
        <div
          style={{ opacity: sectionOpacity(progress) }}
          className="relative z-10 w-full h-full pointer-events-auto transition-opacity duration-150"
        >
          <ConnectContent progress={effectiveProgress} />
        </div>
      </div>
    </section>
  );
}
