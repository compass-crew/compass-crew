import { CompassWorld } from "@/components/three/CompassWorld";
import { HeroContent } from "./HeroContent";

interface LandingHeroProps {
  onExploreClick?: () => void;
}

/**
 * LandingHero
 * Root Hero Section for the Compass Crew public landing page.
 *
 * Combines:
 * - 3D Compass World WebGL canvas (Background & Midground)
 * - Atmospheric fog, lighting, and GPU-instanced particles
 * - Physical procedural Compass3D with needle and gyroscopic gimbals
 * - Monumental editorial HTML typography & CTAs (Foreground)
 * - 100vh full-screen responsive viewport (min 720px desktop)
 */
export function LandingHero({ onExploreClick }: LandingHeroProps) {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[100vh] min-h-[720px] overflow-hidden bg-[#09090B]"
      aria-label="Compass Crew Hero"
    >
      {/* Subtle atmospheric vignette wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_65%_45%,rgba(124,92,255,0.14),transparent_65%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_80%,rgba(179,107,255,0.06),transparent_50%)]"
      />

      {/* 3D Compass World with foreground content */}
      <CompassWorld
        activeScene="hero"
        interactive={true}
        className="w-full min-h-[100vh] min-h-[720px]"
      >
        <HeroContent onExploreClick={onExploreClick} />
      </CompassWorld>

      {/* Bottom atmospheric transition hook */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-32 bg-gradient-to-t from-[#09090B] via-[#09090B]/70 to-transparent"
      />
    </section>
  );
}
