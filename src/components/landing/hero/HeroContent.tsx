import { Compass } from "lucide-react";
import { PrimaryButton } from "@/components/landing/primitives/PrimaryButton";
import { HeroScrollAnchor } from "./HeroScrollAnchor";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface HeroContentProps {
  onExploreClick?: () => void;
}

/**
 * HeroContent
 *
 * Foreground HTML/CSS layer of the Compass Crew 3D Hero:
 * - Layer 2 Kinetic & Spatial Typography integration
 * - DepthText perspective and subtle pointer parallax
 * - 3-Beat Monumental Display Headline:
 *   Line 1: FOR THE NEXT (white)
 *   Line 2: GENERATION (brand gradient)
 *   Line 3: OF BUILDERS. (white)
 * - 100% semantic, accessible, and responsive
 */
export function HeroContent({ onExploreClick }: HeroContentProps) {
  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
      return;
    }
    const nextSection = document.getElementById("manifesto") || document.getElementById("discover");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <div className="relative flex min-h-[100vh] min-h-[720px] w-full flex-col justify-between px-6 pt-24 pb-10 sm:px-10 lg:px-16 xl:px-24">
      {/* Top Spacer */}
      <div className="h-4 sm:h-8" />

      {/* Main Editorial Hero Composition */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-center">
        <div className="max-w-3xl lg:max-w-4xl">
          {/* Eyebrow: Live Orientation Status */}
          <div className="hero-reveal-1 mb-6">
            <SpatialLabel sceneNumber="CREW // INDIA" pulse accent="ultraviolet">
              STUDENT INNOVATION PLATFORM
            </SpatialLabel>
          </div>

          {/* Monumental Headline: Layer 2 Spatial & Kinetic Typography */}
          <DepthText depth={22} className="w-full">
            <h1 className="flex flex-col font-cc-sans font-bold tracking-[-0.05em]">
              <span className="hero-reveal-2 block text-[#F5F2EA] text-[clamp(44px,11vw,68px)] sm:text-[clamp(64px,7.2vw,120px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                FOR THE NEXT
              </span>
              <span className="hero-reveal-3 block text-cc-brand-gradient text-[clamp(44px,11vw,68px)] sm:text-[clamp(64px,7.2vw,120px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                GENERATION
              </span>
              <span className="hero-reveal-4 block text-[#F5F2EA] text-[clamp(44px,11vw,68px)] sm:text-[clamp(64px,7.2vw,120px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                OF BUILDERS.
              </span>
            </h1>
          </DepthText>

          {/* Supporting Copy */}
          <p className="hero-reveal-5 mt-6 max-w-xl text-base leading-relaxed text-[#B8B4B0] sm:text-lg lg:text-xl font-cc-sans">
            A student-led ecosystem where ideas find people, opportunities, and direction.
          </p>

          {/* Action CTAs */}
          <div className="hero-reveal-5 mt-9 flex flex-wrap items-center gap-4">
            <PrimaryButton
              to="/auth"
              search={{ mode: "signup" }}
              size="lg"
              className="text-base px-8 py-3.5 shadow-[0_4px_24px_rgba(124,92,255,0.4)]"
            >
              Join the Crew
            </PrimaryButton>

            <button
              type="button"
              onClick={handleExplore}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-[#F5F2EA] backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] hover:-translate-y-0.5"
            >
              <span>Explore</span>
              <Compass className="h-4 w-4 text-[#7C5CFF] transition-transform duration-300 group-hover:rotate-45" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Directional Anchor */}
      <div className="hero-reveal-5 mx-auto flex w-full max-w-[1440px] items-center justify-between pt-8">
        <div className="hidden sm:flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-[#8C8882] font-cc-mono">
          <span>AI • HACKATHONS • OPEN SOURCE</span>
        </div>

        <div className="mx-auto sm:mx-0">
          <HeroScrollAnchor onClick={handleExplore} />
        </div>

        <div className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#737D95] font-cc-mono">
          <span>PAN-INDIA CAMPUSES</span>
        </div>
      </div>
    </div>
  );
}
