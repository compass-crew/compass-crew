import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Compass } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface FinalCTAContentProps {
  /** Normalized scene progress 0.0 → 1.0 */
  progress: number;
  /** Callback to notify 3D engine of primary CTA hover state */
  onCtaHoverChange?: (hovered: boolean) => void;
}

/**
 * FinalCTAContent
 *
 * Foreground conversion layer for the FINAL CTA scene — the emotional
 * and narrative culmination of the Compass Crew landing page.
 *
 * Typography & Choreography:
 *   - Eyebrow: SpatialLabel "COMPASS CREW" // "YOUR NEXT MOVE"
 *   - Primary Headline: "YOUR NEXT \n BUILD STARTS HERE."
 *   - Supporting copy: "Build with people who are curious enough to start and ambitious enough to ship."
 *   - Primary CTA: "Join the Crew" -> /auth?mode=signup (magnetic hover, warm ivory/ultraviolet)
 *   - Secondary CTA: "Explore the Ecosystem" -> /community (restrained dark surface)
 *   - Subtle accumulated journey traces: DISCOVER · BUILD · LEARN · CONNECT · COMPETE · SHIP · GROW
 *
 * Aesthetics:
 *   - Deep Obsidian, Graphite, Warm Ivory, Ultraviolet
 *   - Zero fake metrics, zero cards, zero aggressive salesy badges
 *   - Wide negative space allowing the settled Compass to serve as visual center
 */
export function FinalCTAContent({ progress, onCtaHoverChange }: FinalCTAContentProps) {
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // ── Timing choreography ─────────────────────────────────────
  // 1. Eyebrow label
  const eyebrowAlpha  = smoothstep(0.04, 0.22, progress);
  // 2. Accumulated journey traces (subtle in distance)
  const journeyAlpha  = smoothstep(0.12, 0.32, progress);
  // 3. Primary headline "YOUR NEXT BUILD STARTS HERE."
  const headingAlpha  = smoothstep(0.20, 0.48, progress);
  const headingY      = (1 - headingAlpha) * 24;
  // 4. Supporting statement
  const bodyAlpha     = smoothstep(0.38, 0.62, progress);
  const bodyY         = (1 - bodyAlpha) * 16;
  // 5. Action CTAs
  const ctaAlpha      = smoothstep(0.50, 0.76, progress);
  const ctaY          = (1 - ctaAlpha) * 14;

  // ── Magnetic CTA Hover Handler (Desktop Only) ───────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Restrained attraction (scale ~1.01-1.03 equivalent displacement)
    const deltaX = (e.clientX - centerX) * 0.16;
    const deltaY = (e.clientY - centerY) * 0.16;
    setMagneticOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseEnter = () => {
    onCtaHoverChange?.(true);
  };

  const handleMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
    onCtaHoverChange?.(false);
  };

  // ── Journey stages traces (subtle directional echo) ────────
  const STAGES = ["DISCOVER", "BUILD", "LEARN", "CONNECT", "COMPETE", "SHIP", "GROW"];

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-20 sm:pt-24 pb-8 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Final Call to Action: Join the Crew and start building."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="max-w-3xl">

          {/* ── 1. Eyebrow (Single subtle title) ───────────── */}
          <div
            style={{ opacity: eyebrowAlpha }}
            className="mb-5 sm:mb-6 transition-opacity duration-200"
          >
            <SpatialLabel pulse={false} accent="ultraviolet">
              YOUR NEXT MOVE
            </SpatialLabel>
          </div>

          {/* ── 2. Subtle Accumulated Journey Echo ──────────── */}
          <div
            style={{ opacity: journeyAlpha * 0.4 }}
            className="mb-6 sm:mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 transition-opacity duration-300"
            aria-hidden="true"
          >
            {STAGES.map((stage, idx) => (
              <span
                key={stage}
                className="font-cc-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#8C8882]"
              >
                {stage}
                {idx < STAGES.length - 1 && (
                  <span className="mx-1.5 text-[#3A3A40]">·</span>
                )}
              </span>
            ))}
            <span className="mx-1 text-[#3A3A40]">→</span>
            <span className="font-cc-mono text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#7C5CFF]">
              START
            </span>
          </div>

          {/* ── 3. Primary Headline ─────────────────────────── */}
          <DepthText depth={28} className="w-full">
            <h2
              style={{
                opacity: headingAlpha,
                transform: `translateY(${headingY}px)`,
              }}
              className="flex flex-col font-cc-sans font-bold tracking-[-0.055em] transition-all duration-100 will-change-transform"
            >
              <span className="block text-[#F5F2EA] text-[clamp(44px,9vw,96px)] sm:text-[clamp(56px,7.5vw,104px)] leading-[0.92] drop-shadow-[0_2px_18px_rgba(9,9,11,0.9)]">
                YOUR NEXT
              </span>
              <span className="block text-[#F5F2EA] text-[clamp(44px,9vw,96px)] sm:text-[clamp(56px,7.5vw,104px)] leading-[0.92] drop-shadow-[0_2px_18px_rgba(9,9,11,0.9)]">
                BUILD <span className="text-[#7C5CFF]">STARTS HERE.</span>
              </span>
            </h2>
          </DepthText>

          {/* ── 4. Concise Supporting Message ──────────────── */}
          <div
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-6 sm:mt-8 max-w-xl transition-all duration-100 will-change-transform"
          >
            <p className="text-[clamp(16px,2vw,22px)] font-cc-sans font-normal leading-relaxed text-[#B8B4B0]">
              Build with people who are curious enough to start and ambitious enough to ship.
            </p>
          </div>

          {/* ── 5. Action CTAs ─────────────────────────────── */}
          <div
            style={{
              opacity: ctaAlpha,
              transform: `translateY(${ctaY}px)`,
            }}
            className="mt-9 sm:mt-11 flex flex-wrap items-center gap-4 sm:gap-5 transition-all duration-100 will-change-transform"
          >
            {/* Primary CTA: "Join the Crew" */}
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: prefersReducedMotion
                  ? "none"
                  : `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
                transition: "transform 0.15s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease, background-color 0.2s ease",
              }}
              className="group relative inline-flex min-h-[50px] sm:min-h-[54px] items-center justify-center gap-3 rounded-xl bg-[#7C5CFF] px-8 py-3.5 font-cc-sans text-base font-semibold text-[#F5F2EA] shadow-[0_2px_12px_rgba(124,92,255,0.35),0_12px_32px_-4px_rgba(124,92,255,0.45)] outline-none transition-all duration-200 hover:bg-[#8B6EFF] hover:shadow-[0_4px_20px_rgba(124,92,255,0.5),0_16px_40px_-4px_rgba(124,92,255,0.6)] active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
            >
              {/* Hairline inner specular edge */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25"
              />
              <span className="tracking-[-0.01em]">Join the Crew</span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-[#F5F2EA] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>

            {/* Secondary CTA: "Explore the Ecosystem" */}
            <Link
              to="/community"
              className="group inline-flex min-h-[50px] sm:min-h-[54px] items-center justify-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.03] px-7 py-3.5 font-cc-sans text-sm sm:text-base font-medium text-[#F5F2EA] backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
            >
              <span>Explore the Ecosystem</span>
              <Compass className="h-4 w-4 text-[#7C5CFF] transition-transform duration-300 group-hover:rotate-45" />
            </Link>
          </div>

          {/* ── 6. Bottom Settled Orientation Anchor ───────── */}
          <div
            style={{ opacity: ctaAlpha * 0.55 }}
            className="mt-12 sm:mt-16 flex items-center gap-6 transition-opacity duration-300"
            aria-hidden="true"
          >
            <div className="flex items-center gap-2 text-[10.5px] sm:text-[11px] uppercase tracking-[0.22em] text-[#8C8882] font-cc-mono">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" />
              <span>COMPASS CREW // INDIA</span>
            </div>
            <span className="text-[#3A3A40]">·</span>
            <div className="text-[10.5px] sm:text-[11px] uppercase tracking-[0.22em] text-[#8C8882] font-cc-mono">
              <span>FOR STUDENT INNOVATORS</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
