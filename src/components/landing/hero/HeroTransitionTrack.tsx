import { useEffect, useRef, useState } from "react";
import { CompassWorld } from "@/components/three/CompassWorld";
import { HeroContent } from "./HeroContent";
import { ManifestoContent } from "./ManifestoContent";
import { BuildContent } from "./BuildContent";
import { LearnContent } from "./LearnContent";
import { ConnectContent } from "./ConnectContent";
import { CompeteContent } from "./CompeteContent";
import { ShipContent } from "./ShipContent";
import { GrowContent } from "./GrowContent";

/**
 * HeroTransitionTrack / LandingNarrativeTrack
 *
 * Pinned continuous cinematic scroll track connecting:
 * HERO (0.00 -> 0.14)
 *   ↓
 * DISCOVER / MANIFESTO (0.14 -> 0.28)
 *   ↓
 * BUILD (0.28 -> 0.42)
 *   ↓
 * LEARN (0.42 -> 0.56)
 *   ↓
 * CONNECT (0.56 -> 0.70)
 *   ↓
 * COMPETE (0.70 -> 0.84)
 *   ↓
 * SHIP (0.84 -> 0.92)
 *   ↓
 * GROW (0.92 -> 1.00)
 *
 * All scenes, camera rigs, lighting, particles, 3D compass gimbals, builder network,
 * Idea Core construction, Knowledge Core synthesis, Connect Peer Network, Compete Arena Core,
 * Ship Proof Core, and Grow Opportunity Field derive from a single unified progress value.
 */
export function HeroTransitionTrack() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", onMotionChange);

    // Passive scroll progress observer
    let rafId: number | null = null;
    let ticking = false;

    const computeProgress = () => {
      ticking = false;
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const totalScrollable = track.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) {
        setProgress(0);
        return;
      }

      const currentScroll = -rect.top;
      const rawProgress = currentScroll / totalScrollable;
      const clamped = Math.min(Math.max(rawProgress, 0), 1);

      setProgress((prev) => (Math.abs(prev - clamped) > 0.001 ? clamped : prev));
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(computeProgress);
      }
    };

    computeProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  const handleExploreClick = () => {
    const track = trackRef.current;
    if (!track) return;

    // Scroll smoothly to Discover (~25% of total track)
    const totalScrollable = track.offsetHeight - window.innerHeight;
    const targetScrollY =
      window.scrollY + track.getBoundingClientRect().top + totalScrollable * 0.25;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  };

  // =========================================================================
  // NORMALIZED INTRA-SCENE PROGRESS MAPPING (8 CONTINUOUS CHAPTERS)
  // =========================================================================
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

  // 1. Hero Exit Easing (0.00 -> 0.14)
  const heroFade = clamp01((progress - 0.04) / 0.07);
  const heroOpacity = 1 - heroFade;
  const heroTranslateY = -heroFade * 36;

  // 2. Discover / Manifesto Easing (0.10 -> 0.28)
  const rawDiscoverT = clamp01((progress - 0.11) / 0.14);
  const discoverExit = clamp01((progress - 0.24) / 0.04);
  const discoverOpacity = (1 - discoverExit) * clamp01((progress - 0.1) / 0.03);

  // 3. Build Scene Easing (0.24 -> 0.42)
  const rawBuildT = clamp01((progress - 0.25) / 0.14);
  const buildExit = clamp01((progress - 0.38) / 0.04);
  const buildOpacity = (1 - buildExit) * clamp01((progress - 0.24) / 0.03);

  // 4. Learn Scene Easing (0.38 -> 0.56)
  const rawLearnT = clamp01((progress - 0.39) / 0.14);
  const learnExit = clamp01((progress - 0.52) / 0.04);
  const learnOpacity = (1 - learnExit) * clamp01((progress - 0.38) / 0.03);

  // 5. Connect Scene Easing (0.52 -> 0.70)
  const rawConnectT = clamp01((progress - 0.53) / 0.14);
  const connectExit = clamp01((progress - 0.66) / 0.04);
  const connectOpacity = (1 - connectExit) * clamp01((progress - 0.52) / 0.03);

  // 6. Compete Scene Easing (0.66 -> 0.84)
  const rawCompeteT = clamp01((progress - 0.67) / 0.14);
  const competeExit = clamp01((progress - 0.8) / 0.04);
  const competeOpacity = (1 - competeExit) * clamp01((progress - 0.66) / 0.03);

  // 7. Ship Scene Easing (0.80 -> 0.93)
  const rawShipT = clamp01((progress - 0.81) / 0.1);
  const shipExit = clamp01((progress - 0.89) / 0.03);
  const shipOpacity = (1 - shipExit) * clamp01((progress - 0.8) / 0.03);

  // 8. Grow Scene Easing (0.89 -> 1.00)
  const rawGrowT = clamp01((progress - 0.9) / 0.1);
  const growOpacity = clamp01((progress - 0.89) / 0.03);

  return (
    <div
      ref={trackRef}
      className="relative w-full h-[1200vh] bg-[#09090B]"
      aria-label="Compass Crew Narrative Journey: Hero to Discover to Build to Learn to Connect to Compete to Ship to Grow"
    >
      {/* Sticky Fullscreen 3D Stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#09090B]">
        {/* Atmosphere radial washes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_65%_45%,rgba(124,92,255,0.12),transparent_65%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_80%,rgba(179,107,255,0.06),transparent_50%)]"
        />

        {/* 3D WebGL Canvas Engine */}
        <CompassWorld
          narrativeProgress={
            prefersReducedMotion
              ? progress > 0.91
                ? 0.96
                : progress > 0.81
                  ? 0.86
                  : progress > 0.67
                    ? 0.74
                    : progress > 0.53
                      ? 0.6
                      : progress > 0.39
                        ? 0.46
                        : progress > 0.25
                          ? 0.32
                          : progress > 0.1
                            ? 0.18
                            : 0
              : progress
          }
          interactive={
            progress < 0.14 ||
            (progress > 0.24 && progress < 0.4) ||
            (progress > 0.38 && progress < 0.54) ||
            (progress > 0.52 && progress < 0.68) ||
            (progress > 0.66 && progress < 0.82) ||
            (progress > 0.8 && progress < 0.91) ||
            progress > 0.89
          }
          className="w-full h-full"
        >
          {/* Layer 1: Hero Foreground */}
          {progress < 0.14 && (
            <div
              style={{
                opacity: heroOpacity,
                transform: `translateY(${heroTranslateY}px)`,
                pointerEvents: progress > 0.11 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-all duration-100 will-change-transform"
            >
              <HeroContent onExploreClick={handleExploreClick} />
            </div>
          )}

          {/* Layer 2: Discover / Manifesto Foreground */}
          {progress >= 0.1 && progress <= 0.28 && (
            <div
              style={{
                opacity: discoverOpacity,
                pointerEvents: progress < 0.11 || progress > 0.25 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <ManifestoContent
                progress={prefersReducedMotion ? (progress > 0.18 ? 1 : 0) : rawDiscoverT}
              />
            </div>
          )}

          {/* Layer 3: Build Foreground */}
          {progress >= 0.24 && progress <= 0.42 && (
            <div
              style={{
                opacity: buildOpacity,
                pointerEvents: progress < 0.25 || progress > 0.39 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <BuildContent
                progress={prefersReducedMotion ? (progress > 0.32 ? 1 : 0) : rawBuildT}
              />
            </div>
          )}

          {/* Layer 4: Learn Foreground */}
          {progress >= 0.38 && progress <= 0.56 && (
            <div
              style={{
                opacity: learnOpacity,
                pointerEvents: progress < 0.39 || progress > 0.53 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <LearnContent
                progress={prefersReducedMotion ? (progress > 0.46 ? 1 : 0) : rawLearnT}
              />
            </div>
          )}

          {/* Layer 5: Connect Foreground */}
          {progress >= 0.52 && progress <= 0.7 && (
            <div
              style={{
                opacity: connectOpacity,
                pointerEvents: progress < 0.53 || progress > 0.67 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <ConnectContent
                progress={prefersReducedMotion ? (progress > 0.6 ? 1 : 0) : rawConnectT}
              />
            </div>
          )}

          {/* Layer 6: Compete Foreground */}
          {progress >= 0.66 && progress <= 0.84 && (
            <div
              style={{
                opacity: competeOpacity,
                pointerEvents: progress < 0.67 || progress > 0.81 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <CompeteContent
                progress={prefersReducedMotion ? (progress > 0.74 ? 1 : 0) : rawCompeteT}
              />
            </div>
          )}

          {/* Layer 7: Ship Foreground */}
          {progress >= 0.8 && progress <= 0.93 && (
            <div
              style={{
                opacity: shipOpacity,
                pointerEvents: progress < 0.81 || progress > 0.9 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <ShipContent progress={prefersReducedMotion ? (progress > 0.86 ? 1 : 0) : rawShipT} />
            </div>
          )}

          {/* Layer 8: Grow Foreground */}
          {progress >= 0.89 && (
            <div
              style={{
                opacity: growOpacity,
                pointerEvents: progress < 0.9 ? "none" : "auto",
              }}
              className="absolute inset-0 transition-opacity duration-150"
            >
              <GrowContent progress={prefersReducedMotion ? (progress > 0.94 ? 1 : 0) : rawGrowT} />
            </div>
          )}
        </CompassWorld>

        {/* Subtle bottom gradient to blend cleanly into future dark sections (DIRECTION / CTA / FOOTER) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-28 bg-gradient-to-t from-[#09090B] via-[#09090B]/80 to-transparent"
        />
      </div>
    </div>
  );
}
