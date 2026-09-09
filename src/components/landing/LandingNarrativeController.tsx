import {
  LandingScrollProvider,
  useLandingScroll,
} from "./LandingScrollContext";
import { ImmersiveWorld } from "./ImmersiveWorld";
import { PublicHeader } from "./LandingHeader";
import {
  HeroSection,
  DiscoverSection,
  BuildSection,
  LearnSection,
  ConnectSection,
  CompeteSection,
  ShipSection,
  GrowSection,
  DirectionSection,
  FinalCTASection,
} from "./sections";
import { ImmersiveFooter } from "./footer";

/**
 * LandingNarrativeView
 *
 * Foreground presentation layer for the Compass Crew landing page.
 *
 * Architecture:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │ PublicHeader (fixed top-0, z-40)                                │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ ImmersiveWorld (fixed inset-0, z-0)                             │
 * │   Single persistent WebGL canvas rendering the Compass World.   │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ Independent Sibling HTML Sections (relative, z-10)              │
 * │   <HeroSection>       (id="hero",      140vh scroll)            │
 * │   <DiscoverSection>   (id="discover",  140vh scroll)            │
 * │   <BuildSection>      (id="build",     140vh scroll)            │
 * │   <LearnSection>      (id="learn",     140vh scroll)            │
 * │   <ConnectSection>    (id="connect",   140vh scroll)            │
 * │   <CompeteSection>    (id="compete",   140vh scroll)            │
 * │   <ShipSection>       (id="ship",      140vh scroll)            │
 * │   <GrowSection>       (id="grow",      140vh scroll)            │
 * │   <DirectionSection>  (id="direction", 160vh scroll)            │
 * │   <FinalCTASection>   (id="cta",       140vh scroll)            │
 * ├─────────────────────────────────────────────────────────────────┤
 * │ ImmersiveFooter (relative, z-10)                                │
 * └─────────────────────────────────────────────────────────────────┘
 */
function LandingNarrativeView() {
  const { narrativeProgress, isCtaHovered, activeSection } = useLandingScroll();

  // CTA hover forwarded only when CTA or Direction is active/nearby
  const activeCtaHovered =
    activeSection === "cta" || activeSection === "direction"
      ? isCtaHovered
      : false;

  return (
    <>
      {/* ── 1. Single Persistent Public Header (Shell-level) ─────── */}
      <PublicHeader />

      {/* ── 2. Layer B: Single Persistent 3D World (WebGL Canvas) ─── */}
      <ImmersiveWorld
        narrativeProgress={narrativeProgress}
        active={true}
        ctaHovered={activeCtaHovered}
      />

      {/* ── 3. Layer A: Independent HTML Semantic Sections ───────── */}
      <main className="relative w-full z-10">
        <HeroSection />
        <DiscoverSection />
        <BuildSection />
        <LearnSection />
        <ConnectSection />
        <CompeteSection />
        <ShipSection />
        <GrowSection />
        <DirectionSection />
        <FinalCTASection />
      </main>

      {/* ── 4. Immersive Footer ─────────────────────────────────── */}
      <ImmersiveFooter />
    </>
  );
}

/**
 * LandingNarrativeController
 *
 * Root orchestrator for the public landing page. Wraps the page in
 * the centralized LandingScrollProvider so all sibling sections share
 * one unified passive scroll observer and 3D world state.
 */
export function LandingNarrativeController() {
  return (
    <LandingScrollProvider>
      <LandingNarrativeView />
    </LandingScrollProvider>
  );
}

export { LandingNarrativeController as LandingPage };
