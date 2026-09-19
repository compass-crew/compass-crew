import { useState } from "react";
import {
  ArrowDown,
  CheckCircle2,
  Code2,
  ExternalLink,
  FileCheck,
  Layers,
  ShieldCheck,
} from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface ShipContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * ShipContent
 *
 * Foreground editorial & kinetic typography for the Ship / Proof of Work scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "SHIP." (confident, conclusive, crisp white #F7F8FC, weight 650, DepthText parallax)
 *   - Supporting: "Turn what you built into proof of what you can do." (#D6DCE8 with #00E5FF brand gradient accent)
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.40 -> 0.82)
 * - Strict 1 Primary Label ("06 // SHIP") + 1 Secondary Technical Label ("PROOF OF WORK") rule
 * - Architectural Proof of Work HUD surface labeled DEMO CONCEPT
 */
export function ShipContent({ progress }: ShipContentProps) {
  const [activeProofTab, setActiveProofTab] = useState<number | null>(null);

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
      aria-label="Compass Crew Ship Scene: Turn what you built into proof of what you can do."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Narrative Copy */}
          <div className="lg:col-span-7">
            {/* Eyebrow: Strict 1 Primary + 1 Secondary Label Rule */}
            <div
              style={{ opacity: headingAlpha }}
              className="mb-3 sm:mb-4 transition-opacity duration-150"
            >
              <SpatialLabel sceneNumber="06 // SHIP" pulse accent="mint">
                PROOF OF WORK
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
                <span className="block text-[#F5F2EA] text-[clamp(36px,5.5vw,76px)] leading-[0.94] drop-shadow-[0_2px_12px_rgba(9,9,11,0.85)]">
                  SHIP.
                </span>
                <span className="block text-[#B8B4B0] text-[clamp(20px,2.8vw,36px)] leading-[1.15] mt-2 sm:mt-3 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.85)]">
                  Turn what you built{" "}
                  <span className="text-[#7DD3A8] font-semibold">
                    into proof of what you can do.
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
              className="mt-5 sm:mt-6 max-w-xl text-sm leading-relaxed text-[#B8B4B0] sm:text-base font-cc-sans transition-transform duration-100 will-change-transform"
            >
              Building matters when it leaves the build room. Projects become opportunities when
              your work is visible, verifiable, and worth sharing. Compass Crew transforms raw code,
              live deployments, and hackathon submissions into verifiable proof that founders,
              recruiters, and collaborators respect.
            </p>

            {/* Outgoing Transition Hook toward GROW / DIRECTION */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-6 sm:mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-[#7DD3A8]/30 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(125,211,168,0.15)]">
                <span className="font-cc-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#7DD3A8]">
                  PROOF COMPILED // GROW HORIZON
                </span>
                <ArrowDown className="h-3 w-3 text-[#7DD3A8] animate-bounce" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Proof Core HUD Surface */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-5 sm:p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#7DD3A8]" />
                  <span className="text-[#F5F2EA] font-semibold tracking-wider">
                    PROOF CORE ARTIFACT
                  </span>
                </div>
                <span className="text-[10px] text-[#8C96AA] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  DEMO CONCEPT
                </span>
              </div>

              {/* 4 Proof Layers */}
              <div className="space-y-2.5 text-[11px]">
                {/* 1. Code Repository Layer */}
                <div
                  onMouseEnter={() => setActiveProofTab(0)}
                  onMouseLeave={() => setActiveProofTab(null)}
                  className={`rounded-lg border p-2.5 transition-all duration-200 ${
                    activeProofTab === 0
                      ? "border-[#7C5CFF]/60 bg-[#7C5CFF]/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#7C5CFF] font-semibold flex items-center gap-1.5">
                      <Code2 className="h-3.5 w-3.5 text-[#7C5CFF]" />
                      01 // CODE REPOSITORY
                    </span>
                    <span className="text-[10px] text-[#8C96AA]">SRC / BUILD</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#8C96AA]">
                    <span>Architecture & Clean Structure</span>
                    <span className="text-[#7C5CFF]">INSPECTABLE</span>
                  </div>
                </div>

                {/* 2. Live Shipped Demo Layer */}
                <div
                  onMouseEnter={() => setActiveProofTab(1)}
                  onMouseLeave={() => setActiveProofTab(null)}
                  className={`rounded-lg border p-2.5 transition-all duration-200 ${
                    activeProofTab === 1
                      ? "border-[#7DD3A8]/60 bg-[#7DD3A8]/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#7DD3A8] font-semibold flex items-center gap-1.5">
                      <ExternalLink className="h-3.5 w-3.5 text-[#7DD3A8]" />
                      02 // LIVE DEPLOYMENT
                    </span>
                    <span className="text-[10px] text-[#7DD3A8] font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7DD3A8] animate-pulse" />
                      v1.0 STABLE
                    </span>
                  </div>
                </div>

                {/* 3. Verifiable Peer & Judge Validation */}
                <div
                  onMouseEnter={() => setActiveProofTab(2)}
                  onMouseLeave={() => setActiveProofTab(null)}
                  className={`rounded-lg border p-2.5 transition-all duration-200 ${
                    activeProofTab === 2
                      ? "border-[#38BDF8]/60 bg-[#38BDF8]/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#38BDF8] font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-[#38BDF8]" />
                      03 // VERIFIED BADGE
                    </span>
                    <span className="text-[10px] text-[#38BDF8]">ON-CHAIN & HASHED</span>
                  </div>
                </div>

                {/* 4. Collaborative Authorship */}
                <div
                  onMouseEnter={() => setActiveProofTab(3)}
                  onMouseLeave={() => setActiveProofTab(null)}
                  className={`rounded-lg border p-2.5 transition-all duration-200 ${
                    activeProofTab === 3
                      ? "border-[#FF7A6B]/60 bg-[#FF7A6B]/10"
                      : "border-white/5 bg-white/[0.02] hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[#FF7A6B] font-semibold flex items-center gap-1.5">
                      <FileCheck className="h-3.5 w-3.5 text-[#FF7A6B]" />
                      04 // ATTRIBUTION
                    </span>
                    <span className="text-[10px] text-[#FF7A6B]">TEAM CO-AUTHORED</span>
                  </div>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C96AA] tracking-widest">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-[#7DD3A8]" />
                  PROOF LEDGER // SECURE
                </span>
                <span className="text-[#7DD3A8]">VERIFIED ASSET</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
