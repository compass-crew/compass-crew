import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";
import { useAuth } from "@/hooks/use-auth";

interface FinalCTAContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
  onCtaHoverChange?: (hovered: boolean) => void;
}

/**
 * FinalCTAContent
 *
 * Foreground editorial typography for the Final Call to Action scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary Headline: "YOUR NEXT BUILD STARTS HERE."
 *   - Supporting copy: "Build with people who are curious enough to start and ambitious enough to ship."
 *   - Primary CTA: Dynamic based on auth -> /dashboard if logged in, /auth?mode=signup if logged out
 *   - Secondary CTA: "Explore the Ecosystem" -> /community
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.38 -> 1.00)
 * - Responsive typography scaling without vertical or horizontal clipping at 1280x720
 */
export function FinalCTAContent({ progress, onCtaHoverChange }: FinalCTAContentProps) {
  const { user } = useAuth();
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

  // Phase A: Enter (0.04 -> 0.20)
  const eyebrowAlpha = smoothstep(0.04, 0.18, progress);
  const journeyAlpha = smoothstep(0.08, 0.22, progress);

  // Phase B: Reveal (0.16 -> 0.38)
  const headingAlpha = smoothstep(0.14, 0.3, progress);
  const headingY = (1 - headingAlpha) * 24;

  const bodyAlpha = smoothstep(0.2, 0.36, progress);
  const bodyY = (1 - bodyAlpha) * 16;

  const ctaAlpha = smoothstep(0.26, 0.4, progress);
  const ctaY = (1 - ctaAlpha) * 14;

  // Phase C: HOLD (0.38 -> 1.00) - full stable interactive state

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
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

  const STAGES = ["DISCOVER", "BUILD", "LEARN", "CONNECT", "COMPETE", "SHIP", "GROW"];

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-16 sm:pt-20 pb-8 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Final Call to Action: Join the Crew and start building."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div
            style={{ opacity: eyebrowAlpha }}
            className="mb-4 sm:mb-5 transition-opacity duration-200"
          >
            <SpatialLabel pulse={false} accent="ultraviolet">
              YOUR NEXT MOVE
            </SpatialLabel>
          </div>

          {/* Journey Echo */}
          <div
            style={{ opacity: journeyAlpha * 0.4 }}
            className="mb-5 sm:mb-7 flex flex-wrap items-center gap-x-3 gap-y-1 transition-opacity duration-300"
            aria-hidden="true"
          >
            {STAGES.map((stage, idx) => (
              <span
                key={stage}
                className="font-cc-mono text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.22em] text-[#8C8882]"
              >
                {stage}
                {idx < STAGES.length - 1 && <span className="mx-1.5 text-[#3A3A40]">·</span>}
              </span>
            ))}
            <span className="mx-1 text-[#3A3A40]">→</span>
            <span className="font-cc-mono text-[9.5px] sm:text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#7C5CFF]">
              START
            </span>
          </div>

          {/* Primary Headline */}
          <DepthText depth={20} className="w-full">
            <h2
              style={{
                opacity: headingAlpha,
                transform: `translateY(${headingY}px)`,
              }}
              className="flex flex-col font-cc-sans font-bold tracking-[-0.04em] transition-all duration-100 will-change-transform"
            >
              <span className="block text-[#F5F2EA] text-[clamp(36px,5.8vw,80px)] leading-[0.92] drop-shadow-[0_2px_18px_rgba(9,9,11,0.9)]">
                YOUR NEXT
              </span>
              <span className="block text-cc-brand-gradient text-[clamp(36px,5.8vw,80px)] leading-[0.92] drop-shadow-[0_2px_18px_rgba(9,9,11,0.9)] mt-1 sm:mt-2">
                BUILD STARTS HERE.
              </span>
            </h2>
          </DepthText>

          {/* Supporting Statement */}
          <p
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-5 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed text-[#B8B4B0] font-cc-sans transition-all duration-100 will-change-transform"
          >
            Build with people who are curious enough to start and ambitious enough to ship.
            Hackathons, team matching, and verifiable credentials — built for the next generation of
            builders.
          </p>

          {/* Action CTAs */}
          <div
            style={{
              opacity: ctaAlpha,
              transform: `translateY(${ctaY}px)`,
            }}
            className="mt-8 sm:mt-9 flex flex-wrap items-center gap-4 transition-all duration-200"
          >
            <Link
              to={user ? "/dashboard" : "/auth"}
              search={user ? undefined : { mode: "signup" }}
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: prefersReducedMotion
                  ? "none"
                  : `translate(${magneticOffset.x}px, ${magneticOffset.y}px)`,
                transition: "transform 0.12s cubic-bezier(0.25, 1, 0.5, 1)",
              }}
              className="group relative inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] via-[#9061F9] to-[#B36BFF] px-8 py-3.5 font-cc-sans text-sm sm:text-base font-semibold text-[#F5F2EA] shadow-[0_4px_24px_rgba(124,92,255,0.4)] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(124,92,255,0.6)] hover:brightness-110 active:scale-[0.98]"
            >
              <span>{user ? "Open Dashboard" : "Join the Crew"}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
              <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100 pointer-events-none" />
            </Link>

            <Link
              to="/community"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-6 py-3.5 font-cc-sans text-sm sm:text-base font-medium text-[#B8B4B0] backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-white/[0.08] hover:text-[#F5F2EA]"
            >
              <Compass className="h-4 w-4 text-[#8C8882] transition-transform duration-300 group-hover:rotate-45" />
              <span>Explore the Ecosystem</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
