import { ArrowDown, Flame, Zap, ShieldCheck } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface CompeteContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * CompeteContent
 *
 * Foreground editorial & kinetic typography for the Compete / Hackathon Arena scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "COMPETE." (bold, technological, crisp white #F7F8FC, weight 650, DepthText parallax)
 *   - Supporting: "Build for something that matters." (#D6DCE8 with #00E5FF brand gradient accent)
 *   - Editorial copy: "People have connected. Now they build for a challenge. Compass Crew hackathons are where student teams turn collaboration into products that solve real problems, tested against real constraints."
 * - Generous breathing room and negative space
 * - Strict 1 Primary Label ("05 // COMPETE") + 1 Secondary Technical Label ("HACKATHON ARENA") rule
 * - Architectural Hackathon Sprint HUD widget explicitly labeled DEMO CONCEPT
 * - Outgoing transition hook toward SHIP
 */
export function CompeteContent({ progress }: CompeteContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // Scene choreography timings
  const headingAlpha = smoothstep(0.10, 0.28, progress);
  const headingY = (1 - headingAlpha) * 24;

  const bodyAlpha = smoothstep(0.26, 0.48, progress);
  const bodyY = (1 - bodyAlpha) * 18;

  const hudAlpha = smoothstep(0.38, 0.62, progress);
  const hookAlpha = smoothstep(0.58, 0.82, progress);

  if (progress < 0.05) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-24 pb-12 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Compete Scene: Build for something that matters."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Left Column: Editorial Headline & Narrative Copy */}
          <div className="lg:col-span-7">
            {/* Eyebrow: Strict 1 Primary + 1 Secondary Label Rule */}
            <div
              style={{ opacity: headingAlpha }}
              className="mb-4"
            >
              <SpatialLabel sceneNumber="05 // COMPETE" pulse accent="ultraviolet">
                HACKATHON ARENA
              </SpatialLabel>
            </div>

            {/* Monumental Headline with DepthText */}
            <DepthText depth={18} className="w-full">
              <h2
                style={{
                  opacity: headingAlpha,
                  transform: `translateY(${headingY}px)`,
                }}
                className="flex flex-col font-cc-sans font-bold tracking-[-0.05em] transition-transform duration-100 will-change-transform"
              >
                <span className="block text-[#F5F2EA] text-[clamp(44px,6.5vw,84px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  COMPETE.
                </span>
                <span className="block text-[#F5F2EA] text-[clamp(22px,3vw,38px)] leading-[1.2] mt-3 sm:mt-4 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  Build for something{" "}
                  <span className="text-cc-brand-gradient font-semibold">
                    that matters.
                  </span>
                </span>
              </h2>
            </DepthText>

            {/* Supporting Editorial Copy */}
            <p
              style={{
                opacity: bodyAlpha,
                transform: `translateY(${bodyY}px)`,
              }}
              className="mt-6 max-w-xl text-base leading-relaxed text-[#B8B4B0] sm:text-lg font-cc-sans transition-transform duration-100 will-change-transform"
            >
              People have connected. Now they build for a challenge. Compass Crew hackathons are where
              student teams turn collaboration into products that solve real problems, tested against
              real constraints and industry review.
            </p>

            {/* Outgoing Transition Hook toward SHIP */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-[#7C5CFF]/30 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C5CFF]">
                  SUBMISSION READY // ENTER SHIP ORBIT
                </span>
                <ArrowDown className="h-3 w-3 text-[#7C5CFF] animate-bounce" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Hackathon Sprint HUD Surface */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#7C5CFF]" />
                  <span className="text-[#F5F2EA] font-semibold tracking-wider">HACKATHON SPRINT</span>
                </div>
                <span className="text-[10px] text-[#8C8882] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  DEMO CONCEPT
                </span>
              </div>

              {/* Challenge Domains & Sprint Status */}
              <div className="space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>BUILD STATUS</span>
                  <span className="text-[#7C5CFF] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7C5CFF] animate-pulse" />
                    SUBMISSION READY
                  </span>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C5CFF] font-semibold">CHALLENGE 01</span>
                    <span className="text-[10px] text-[#8C8882]">Autonomous Systems</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#9061F9] font-semibold">CHALLENGE 02</span>
                    <span className="text-[10px] text-[#8C8882]">Open Infrastructure</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B36BFF] font-semibold">CHALLENGE 03</span>
                    <span className="text-[10px] text-[#8C8882]">Applied Student Research</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#8C8882] pt-1">
                  <span>DEPLOYED ARTIFACT</span>
                  <span className="text-[#7DD3A8] flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-[#7DD3A8]" />
                    VALIDATED SYSTEM
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C8882] tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-[#7DD3A8]" />
                  EVALUATION MATRIX
                </span>
                <span className="text-[#7DD3A8]">PASS // VERIFIED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
