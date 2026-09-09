import { ArrowDown } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface BuildContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * BuildContent
 *
 * Foreground editorial typography for the Build scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "BUILD." (crisp white #F7F8FC, authoritative weight 700)
 *   - Secondary: "Turn ideas into something real." (disciplined secondary display scale, white with #16C8FF accent)
 * - Restrained negative space without visual clutter
 * - Strict 1 Primary Label + 1 Secondary Technical Label rule
 */
export function BuildContent({ progress }: BuildContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // Scene choreography timings
  const headingAlpha = smoothstep(0.12, 0.32, progress);
  const headingY = (1 - headingAlpha) * 28;

  const bodyAlpha = smoothstep(0.36, 0.58, progress);
  const bodyY = (1 - bodyAlpha) * 20;

  const hudAlpha = smoothstep(0.48, 0.72, progress);
  const hookAlpha = smoothstep(0.82, 0.96, progress);

  if (progress < 0.08) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-20 sm:pt-24 pb-10 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Build Scene: Turn ideas into something real."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Copy */}
          <div className="lg:col-span-7">
            {/* Eyebrow: Strict 1 Primary + 1 Secondary Label Rule */}
            <div
              style={{ opacity: headingAlpha }}
              className="mb-4"
            >
              <SpatialLabel sceneNumber="02 // BUILD" pulse accent="violet">
                CONSTRUCTION ENGINE
              </SpatialLabel>
            </div>

            {/* Monumental Headline with DepthText */}
            <DepthText depth={20} className="w-full">
              <h2
                style={{
                  opacity: headingAlpha,
                  transform: `translateY(${headingY}px)`,
                }}
                className="flex flex-col font-cc-sans font-bold tracking-[-0.05em] transition-transform duration-100 will-change-transform"
              >
                <span className="block text-[#F5F2EA] text-[clamp(44px,7vw,88px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  BUILD.
                </span>
                <span className="block text-[#F5F2EA] text-[clamp(26px,3.8vw,48px)] leading-[1.05] mt-2 sm:mt-3 drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)] font-semibold tracking-[-0.03em]">
                  Turn ideas into{" "}
                  <span className="text-cc-brand-gradient">
                    something real.
                  </span>
                </span>
              </h2>
            </DepthText>

            {/* Supporting Copy */}
            <p
              style={{
                opacity: bodyAlpha,
                transform: `translateY(${bodyY}px)`,
              }}
              className="mt-6 max-w-xl text-base leading-relaxed text-[#B8B4B0] sm:text-lg font-cc-sans transition-transform duration-100 will-change-transform"
            >
              Compass Crew gives student builders a place to experiment, collaborate, and turn ideas
              into working projects. We provide the structure, feedback, and peers to take you from
              a raw spark to shipped software.
            </p>

            {/* Outgoing Transition Hook toward LEARN */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
                <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
                  PROTOTYPE STABILIZED // ENTER LEARN ORBIT
                </span>
                <ArrowDown className="h-3 w-3 text-[#7C5CFF] animate-bounce" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Prototype Matrix (Subdued Technical HUD) */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[#FF7A6B] font-semibold">⚡ PROTOTYPE MATRIX</span>
                </div>
                <span className="text-[10px] text-[#8C8882] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  DEMO CONCEPT
                </span>
              </div>

              <div className="space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>EXECUTION STATE</span>
                  <span className="text-[#FF7A6B] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A6B] animate-pulse" />
                    WORKING PROTOTYPE
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>LOGIC &amp; ENGINE</span>
                  <span className="text-[#F5F2EA]">CONNECTED [4/4]</span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>INTERFACE LAYER</span>
                  <span className="text-[#F5F2EA]">RENDERED 60 FPS</span>
                </div>
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>DATA &amp; RUNTIME</span>
                  <span className="text-[#F5F2EA]">VERIFIED DEPLOY</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C8882] tracking-widest">
                <span>BUILD ITERATION // 01</span>
                <span className="text-[#7C5CFF]">DIRECTION → ACTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
