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
 */
export function ManifestoContent({ progress }: ManifestoContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // 1. Eyebrow reveals early (0.15 -> 0.30)
  const eyebrowAlpha = smoothstep(0.15, 0.30, progress);

  // 2. Beat 1: "TALENT IS EVERYWHERE." (0.22 -> 0.50)
  const line1Alpha = smoothstep(0.22, 0.44, progress);
  const line1Y = (1 - line1Alpha) * 32;

  // 3. Beat 2: "OPPORTUNITY ISN'T." (0.46 -> 0.74)
  const line2Alpha = smoothstep(0.46, 0.68, progress);
  const line2Y = (1 - line2Alpha) * 32;

  // 4. Beat 3: Supporting copy (0.64 -> 0.86)
  const bodyAlpha = smoothstep(0.64, 0.84, progress);
  const bodyY = (1 - bodyAlpha) * 20;

  // 5. Outgoing hook (0.86 -> 0.98)
  const hookAlpha = smoothstep(0.86, 0.98, progress);

  if (progress < 0.15) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-20 sm:pt-24 pb-10 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
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
            className="mb-5 sm:mb-6 transition-opacity duration-150"
          >
            <SpatialLabel sceneNumber="01 // DISCOVER" pulse accent="violet">
              DIRECTION OVER NOISE
            </SpatialLabel>
          </div>

          {/* Monumental 2-Beat Headline with Spatial Depth */}
          <DepthText depth={20} className="w-full">
            <h2 className="flex flex-col font-cc-sans font-bold tracking-[-0.05em]">
              {/* Beat 1: "TALENT IS EVERYWHERE." */}
              <span
                style={{
                  opacity: line1Alpha,
                  transform: `translateY(${line1Y}px)`,
                }}
                className="block text-[#F5F2EA] text-[clamp(38px,9.5vw,58px)] sm:text-[clamp(52px,6.2vw,96px)] leading-[0.94] transition-all duration-100 will-change-transform drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]"
              >
                TALENT IS EVERYWHERE.
              </span>

              {/* Beat 2: "OPPORTUNITY ISN'T." */}
              <span
                style={{
                  opacity: line2Alpha,
                  transform: `translateY(${line2Y}px)`,
                }}
                className="block text-[#F5F2EA] text-[clamp(38px,9.5vw,58px)] sm:text-[clamp(52px,6.2vw,96px)] leading-[0.94] mt-3 sm:mt-4 transition-all duration-100 will-change-transform drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]"
              >
                OPPORTUNITY{" "}
                <span className="text-cc-brand-gradient">
                  ISN&apos;T.
                </span>
              </span>
            </h2>
          </DepthText>

          {/* Beat 3: Concise Supporting Copy */}
          <p
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-6 sm:mt-8 max-w-xl text-base leading-relaxed text-[#B8B4B0] sm:text-lg lg:text-xl font-cc-sans transition-transform duration-100 will-change-transform"
          >
            Compass Crew brings people, opportunities, and direction together so students can move
            from ideas to real-world building.
          </p>

          {/* Beat 4: Outgoing Transition Hook */}
          <div
            style={{ opacity: hookAlpha }}
            className="mt-8 sm:mt-10 flex items-center gap-3 transition-opacity duration-200"
          >
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
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
