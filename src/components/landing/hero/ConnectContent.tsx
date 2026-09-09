import { ArrowDown, Sparkles, Users } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface ConnectContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * ConnectContent
 *
 * Foreground editorial & kinetic typography for the Connect scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "CONNECT." (human, crisp white #F7F8FC, weight 650, DepthText parallax)
 *   - Supporting: "Find your people. Build together." (#D6DCE8 with #00E5FF brand gradient accent)
 *   - Editorial copy: "Find teammates, mentors, collaborators, and builders who share your curiosity and ambition."
 * - Generous breathing room and negative space
 * - Strict 1 Primary Label ("04 // CONNECT") + 1 Secondary Technical Label ("COMMUNITY MESH") rule
 * - Architectural Team Match HUD widget explicitly labeled DEMO CONCEPT
 * - Outgoing transition hook toward COMPETE
 */
export function ConnectContent({ progress }: ConnectContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // Scene choreography timings
  const headingAlpha = smoothstep(0.12, 0.32, progress);
  const headingY = (1 - headingAlpha) * 24;

  const bodyAlpha = smoothstep(0.34, 0.56, progress);
  const bodyY = (1 - bodyAlpha) * 18;

  const hudAlpha = smoothstep(0.48, 0.72, progress);
  const hookAlpha = smoothstep(0.82, 0.96, progress);

  if (progress < 0.06) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-24 pb-12 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Connect Scene: Find your people. Build together."
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
              <SpatialLabel sceneNumber="04 // CONNECT" pulse accent="coral">
                COMMUNITY MESH
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
                  CONNECT.
                </span>
                <span className="block text-[#F5F2EA] text-[clamp(22px,3vw,38px)] leading-[1.2] mt-3 sm:mt-4 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.75)]">
                  Find your people.{" "}
                  <span className="text-cc-brand-gradient font-semibold">
                    Build together.
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
              The right idea becomes unstoppable when the right people surround it.
              Find teammates, mentors, collaborators, and builders who share your curiosity and ambition.
              Compass Crew turns solitary exploration into a collaborative powerhouse.
            </p>

            {/* Outgoing Transition Hook toward COMPETE */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
                <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
                  TEAM ASSEMBLED // ENTER COMPETE ORBIT
                </span>
                <ArrowDown className="h-3 w-3 text-[#FF7A6B] animate-bounce" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Team Matching HUD Surface */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#FF7A6B]" />
                  <span className="text-[#F5F2EA] font-semibold tracking-wider">TEAM MATCH</span>
                </div>
                <span className="text-[10px] text-[#8C8882] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  DEMO CONCEPT
                </span>
              </div>

              {/* Spatial Matching Pipeline */}
              <div className="space-y-3 text-[11px]">
                <div className="flex items-center justify-between text-[#8C8882]">
                  <span>MATCHING PIPELINE</span>
                  <span className="text-[#FF7A6B] font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A6B] animate-pulse" />
                    CLUSTER CONVERGED
                  </span>
                </div>

                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF7A6B] font-semibold">AI ENGINEER</span>
                    <span className="text-[10px] text-[#8C8882]">PyTorch / Agents</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B36BFF] font-semibold">PRODUCT DESIGNER</span>
                    <span className="text-[10px] text-[#8C8882]">Systems &amp; UI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF8F82] font-semibold">FULL STACK BUILDER</span>
                    <span className="text-[10px] text-[#8C8882]">React / Rust</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C5CFF] font-semibold">ML RESEARCHER</span>
                    <span className="text-[10px] text-[#8C8882]">Evals / Fine-tuning</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[#8C8882] pt-1">
                  <span>SHARED OBJECTIVE</span>
                  <span className="text-[#F5F2EA]">AUTONOMOUS SYSTEM</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C8882] tracking-widest">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-[#FF7A6B]" />
                  COMMUNITY // CONVERGENCE
                </span>
                <span className="text-[#FF7A6B]">READY TO BUILD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
