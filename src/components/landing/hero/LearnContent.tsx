import { ArrowDown } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface LearnContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * LearnContent
 *
 * Foreground editorial typography for the Learn scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "LEARN." (calm, intellectual, crisp white #F7F8FC, weight 650)
 *   - Supporting: "Build. Break. Understand. Build better." (calm editorial rhythm, #D6DCE8 with #16C8FF accent)
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.40 -> 0.82)
 * - Generous breathing space and negative room without clipping on 1280x720
 * - Strict 1 Primary Label + 1 Secondary Technical Label rule
 */
export function LearnContent({ progress }: LearnContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // Phase A: Enter (0.06 -> 0.22)
  const headingAlpha = smoothstep(0.06, 0.22, progress);
  const headingY = (1 - headingAlpha) * 24;

  // Phase B: Reveal (0.18 -> 0.40)
  const bodyAlpha = smoothstep(0.18, 0.34, progress);
  const bodyY = (1 - bodyAlpha) * 16;

  const hudAlpha = smoothstep(0.24, 0.4, progress);
  const hookAlpha = smoothstep(0.34, 0.48, progress);

  // Phase C: HOLD (0.40 -> 0.82) - all elements remain 1.0 stationary

  if (progress < 0.02) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-16 sm:pt-20 pb-8 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Learn Scene: Build. Break. Understand. Build better."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7">
            {/* Eyebrow: Strict 1 Primary + 1 Secondary Label Rule */}
            <div
              style={{ opacity: headingAlpha }}
              className="mb-3 sm:mb-4 transition-opacity duration-150"
            >
              <SpatialLabel sceneNumber="03 // LEARN" pulse accent="violet">
                RESEARCH STUDIO
              </SpatialLabel>
            </div>

            {/* Monumental Headline with DepthText */}
            <DepthText depth={18} className="w-full">
              <h2
                style={{
                  opacity: headingAlpha,
                  transform: `translateY(${headingY}px)`,
                }}
                className="flex flex-col font-cc-sans font-bold tracking-[-0.04em] transition-transform duration-100 will-change-transform"
              >
                <span className="block text-[#F5F2EA] text-[clamp(36px,5.5vw,76px)] leading-[0.94] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  LEARN.
                </span>
                <span className="block text-[#F5F2EA] text-[clamp(20px,2.8vw,36px)] leading-[1.15] mt-2 sm:mt-3 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  Build. Break. Understand.{" "}
                  <span className="text-cc-brand-gradient font-semibold">Build better.</span>
                </span>
              </h2>
            </DepthText>

            {/* Supporting Copy */}
            <p
              style={{
                opacity: bodyAlpha,
                transform: `translateY(${bodyY}px)`,
              }}
              className="mt-5 sm:mt-6 max-w-xl text-sm leading-relaxed text-[#B8B4B0] sm:text-base font-cc-sans transition-transform duration-100 will-change-transform"
            >
              Every project is a lesson. Every failure is feedback. Every iteration makes you
              better. Compass Crew transforms solitary student struggles into a collaborative
              research studio where feedback accelerates craft.
            </p>

            {/* Outgoing Transition Hook toward CONNECT */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-6 sm:mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
                <span className="font-cc-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
                  KNOWLEDGE COMPILED // ENTER CONNECT ORBIT
                </span>
                <ArrowDown className="h-3 w-3 text-[#7C5CFF] animate-bounce" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Research Studio HUD */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-5 sm:p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#A78BFA] font-semibold">🔬 RESEARCH STUDIO</span>
                </div>
                <span className="text-[10px] text-[#8C8882] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  DEMO CONCEPT
                </span>
              </div>

              <div className="space-y-2.5 text-[11px]">
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>SYNTHESIS STATE</span>
                  <span className="text-[#A78BFA] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA] animate-pulse" />
                    KNOWLEDGE COMPILED
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>OPEN LABS &amp; MESH</span>
                  <span className="text-[#F5F2EA]">ACTIVE PEER LOOP</span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>MENTOR DIALOGUE</span>
                  <span className="text-[#F5F2EA]">CONTINUOUS REVIEW</span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>ITERATION CYCLE</span>
                  <span className="text-[#F5F2EA]">RAPID DEPLOYMENT</span>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C8882] tracking-widest">
                <span>KNOWLEDGE // ITERATION 02</span>
                <span className="text-[#A78BFA]">CRAFT → EXPERTISE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
