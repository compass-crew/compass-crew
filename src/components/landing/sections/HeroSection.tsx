import { useLandingScroll, useSectionScroll } from "../LandingScrollContext";
import { HeroContent } from "../hero/HeroContent";

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * HeroSection
 *
 * Independent landing page section for Hero:
 * - Semantic <section id="hero">
 * - Deliberate viewport scale: 100svh (min 720px)
 * - Owns monumental display typography, sole <h1> on the landing page,
 *   primary CTAs, and scroll anchor to Discover
 * - Coordinated smooth exit transition as scroll enters Discover
 */
export function HeroSection() {
  const { scrollToSection } = useLandingScroll();
  const { progress } = useSectionScroll("hero");

  // Hero fades out gently at the end of its scroll range
  const heroFade = clamp01((progress - 0.65) / 0.25);
  const heroOpacity = 1 - heroFade;
  const heroSlideY = -heroFade * 32;

  const handleExplore = () => {
    scrollToSection("discover");
  };

  return (
    <section
      id="hero"
      aria-label="Compass Crew — For the Next Generation of Builders"
      className="relative w-full min-h-[100svh] min-h-[720px] flex flex-col justify-between"
      style={{ height: "140vh" }}
    >
      {/* Sticky viewport content panel */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
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
