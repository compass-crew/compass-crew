import { ArrowDown } from "lucide-react";
import { DiscoverSpatialLabels } from "./DiscoverSpatialLabels";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface ManifestoContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * ManifestoContent
 *
 * Foreground editorial typography for the Discover / Manifesto scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Beat 1: "TALENT IS EVERYWHERE." (crisp white #F7F8FC, high authority)
 *   - Beat 2: "OPPORTUNITY ISN'T." (white with #16C8FF cyan accent on ISN'T., zero glow bloom)
 * - Safe negative space zone on the left
 * - Single Primary Label (01 // DISCOVER) + Single Secondary Technical Label (DIRECTION OVER NOISE)
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.40 -> 0.82)
 * - Responsive typography scaling without vertical or horizontal clipping at 1280x720
 */
export function ManifestoContent({ progress }: ManifestoContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // 1. Eyebrow reveals early during Phase A Enter (0.04 -> 0.18)
  const eyebrowAlpha = smoothstep(0.04, 0.18, progress);

  // 2. Beat 1: "TALENT IS EVERYWHERE." (0.08 -> 0.24)
  const line1Alpha = smoothstep(0.08, 0.24, progress);
  const line1Y = (1 - line1Alpha) * 24;

  // 3. Beat 2: "OPPORTUNITY ISN'T." (0.18 -> 0.34)
  const line2Alpha = smoothstep(0.18, 0.34, progress);
  const line2Y = (1 - line2Alpha) * 24;

  // 4. Beat 3: Supporting copy (0.26 -> 0.40)
  const bodyAlpha = smoothstep(0.26, 0.4, progress);
  const bodyY = (1 - bodyAlpha) * 16;

  // 5. Outgoing hook (0.36 -> 0.50)
  const hookAlpha = smoothstep(0.36, 0.5, progress);

  if (progress < 0.02) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-16 sm:pt-20 pb-8 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Manifesto: Talent is everywhere. Opportunity isn't."
    >
      {/* 3D Environment Spatial Micro-Labels (Subdued Architectural Markers) */}
      <DiscoverSpatialLabels progress={progress} />

      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        {/* Dedicated negative space zone: max-w-2xl on desktop to never collide with 3D Compass */}
        <div className="max-w-2xl xl:max-w-3xl">
          {/* Eyebrow: Strict 1 Primary + 1 Secondary Label rule */}
          <div
            style={{ opacity: eyebrowAlpha }}
            className="mb-4 sm:mb-5 transition-opacity duration-150"
          >
            <SpatialLabel sceneNumber="01 // DISCOVER" pulse accent="violet">
              DIRECTION OVER NOISE
            </SpatialLabel>
          </div>

          {/* Monumental 2-Beat Headline with Spatial Depth */}
          <DepthText depth={18} className="w-full">
            <h2 className="flex flex-col font-cc-sans font-bold tracking-[-0.04em]">
              {/* Beat 1: "TALENT IS EVERYWHERE." */}
              <span
                style={{
                  opacity: line1Alpha,
                  transform: `translateY(${line1Y}px)`,
                }}
                className="block text-[#F5F2EA] text-[clamp(32px,5.2vw,76px)] leading-[0.96] transition-all duration-100 will-change-transform drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]"
              >
                TALENT IS EVERYWHERE.
              </span>

              {/* Beat 2: "OPPORTUNITY ISN'T." */}
              <span
                style={{
                  opacity: line2Alpha,
                  transform: `translateY(${line2Y}px)`,
                }}
                className="block text-[#F5F2EA] text-[clamp(32px,5.2vw,76px)] leading-[0.96] mt-2 sm:mt-3 transition-all duration-100 will-change-transform drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]"
              >
                OPPORTUNITY <span className="text-cc-brand-gradient">ISN&apos;T.</span>
              </span>
            </h2>
          </DepthText>

          {/* Beat 3: Concise Supporting Copy */}
          <p
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-5 sm:mt-7 max-w-xl text-sm leading-relaxed text-[#B8B4B0] sm:text-base lg:text-lg font-cc-sans transition-transform duration-100 will-change-transform"
          >
            Compass Crew brings people, opportunities, and direction together so students can move
            from ideas to real-world building.
          </p>

          {/* Beat 4: Outgoing Transition Hook */}
          <div
            style={{ opacity: hookAlpha }}
            className="mt-6 sm:mt-8 flex items-center gap-3 transition-opacity duration-200"
          >
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-cc-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
                DIRECTION CREATES MOMENTUM // LET&apos;S BUILD
              </span>
              <ArrowDown className="h-3 w-3 text-[#B36BFF] animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
