import { useLandingScroll, useSectionScroll } from "../LandingScrollContext";
import { HeroContent } from "../hero/HeroContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * HeroSection
 *
 * Independent landing page section for Hero:
 * - Semantic <section id="hero">
 * - Deliberate viewport scale: 180vh (giving 80vh of stable hero travel)
 * - Owns monumental display typography, sole <h1> on the landing page,
 *   primary CTAs, and scroll anchor to Discover
 * - Coordinated smooth exit transition as scroll reaches Phase D (0.75 -> 0.98)
 */
export function HeroSection() {
  const { scrollToSection } = useLandingScroll();
  const { progress } = useSectionScroll("hero");

  // Hero remains 100% visible throughout Phase A, B, C (0 -> 0.75), fading smoothly in Phase D
  const heroFade = clamp01((progress - 0.75) / 0.22);
  const heroOpacity = 1 - heroFade;
  const heroSlideY = -heroFade * 24;

  const handleExplore = () => {
    scrollToSection("discover");
  };

  return (
    <section
      id="hero"
      aria-label="Compass Crew — For the Next Generation of Builders"
      className="relative w-full min-h-[100svh] min-h-[720px] flex flex-col justify-between"
      style={{ height: "180vh" }}
    >
      {/* Sticky viewport content panel */}
      <div className="sticky top-0 h-screen w-full flex flex-col pointer-events-none">
        <div
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroSlideY}px)`,
          }}
          className="relative z-10 w-full h-full pointer-events-auto will-change-transform transition-all duration-75"
        >
          <HeroContent onExploreClick={handleExplore} />
        </div>
      </div>
    </section>
  );
}
