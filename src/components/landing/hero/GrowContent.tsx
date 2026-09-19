import { useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Rocket,
  GitPullRequest,
  Sparkles,
  Users,
  Compass as CompassIcon,
} from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface GrowContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

interface OpportunityDestination {
  id: string;
  category: string;
  focus: string;
  icon: typeof Briefcase;
  accent: string;
  borderAccent: string;
  bgAccent: string;
}

const DESTINATIONS: OpportunityDestination[] = [
  {
    id: "internship",
    category: "INTERNSHIP",
    focus: "INDUSTRY STUDIOS",
    icon: Briefcase,
    accent: "text-[#7C5CFF]",
    borderAccent: "border-[#7C5CFF]/60",
    bgAccent: "bg-[#7C5CFF]/10",
  },
  {
    id: "research",
    category: "RESEARCH",
    focus: "DEEP TECH LABS",
    icon: GraduationCap,
    accent: "text-[#B36BFF]",
    borderAccent: "border-[#B36BFF]/60",
    bgAccent: "bg-[#B36BFF]/10",
  },
  {
    id: "startup",
    category: "STARTUP",
    focus: "FOUNDER TRACK",
    icon: Rocket,
    accent: "text-[#FF7A6B]",
    borderAccent: "border-[#FF7A6B]/60",
    bgAccent: "bg-[#FF7A6B]/10",
  },
  {
    id: "opensource",
    category: "OPEN SOURCE",
    focus: "GLOBAL ECOSYSTEM",
    icon: GitPullRequest,
    accent: "text-[#7DD3A8]",
    borderAccent: "border-[#7DD3A8]/60",
    bgAccent: "bg-[#7DD3A8]/10",
  },
  {
    id: "mentorship",
    category: "MENTORSHIP",
    focus: "SENIOR GUILD",
    icon: Sparkles,
    accent: "text-[#FDE68A]",
    borderAccent: "border-[#FDE68A]/60",
    bgAccent: "bg-[#FDE68A]/10",
  },
  {
    id: "community",
    category: "COMMUNITY",
    focus: "CHAPTER LEADERSHIP",
    icon: Users,
    accent: "text-[#FF7A6B]",
    borderAccent: "border-[#FF7A6B]/60",
    bgAccent: "bg-[#FF7A6B]/10",
  },
];

/**
 * GrowContent
 *
 * Foreground editorial & kinetic typography for the Grow / Opportunity & Impact scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Primary: "GROW." (optimistic, expansive, Warm Ivory #F5F2EA, weight 700, DepthText parallax)
 *   - Secondary: "LET YOUR WORK OPEN THE NEXT DOOR." (Warm Muted Stone #B8B4B0 with Coral/Ultraviolet accent)
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.40 -> 0.82)
 * - Strict 1 Primary Label ("07 // GROW") + 1 Secondary Technical Label ("OPPORTUNITY FIELD") rule
 * - Architectural Opportunity Matrix HUD surface labeled CONCEPTUAL PATHS
 */
export function GrowContent({ progress }: GrowContentProps) {
  const [activeDestination, setActiveDestination] = useState<string | null>(null);

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
      aria-label="Compass Crew Grow Scene: Let your work open the next door."
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
              <SpatialLabel sceneNumber="07 // GROW" pulse accent="ultraviolet">
                OPPORTUNITY FIELD
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
                  GROW.
                </span>
                <span className="block text-[#B8B4B0] text-[clamp(20px,2.8vw,36px)] leading-[1.15] mt-2 sm:mt-3 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.85)]">
                  Let your work{" "}
                  <span className="text-[#FF7A6B] font-semibold">open the next door.</span>
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
              Build meaningful work, make it visible, and create opportunities for what comes next.
              A verified project isn't just a submission—it's a launchpad for internships, research,
              startups, and community leadership.
            </p>

            {/* Outgoing Transition Hook toward DIRECTION */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-6 sm:mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-[#7C5CFF]/30 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                <CompassIcon
                  className="h-3.5 w-3.5 text-[#7C5CFF] animate-spin"
                  style={{ animationDuration: "12s" }}
                />
                <span className="font-cc-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C5CFF]">
                  OPPORTUNITY FIELD ESTABLISHED // COMPASS POINTS FORWARD
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Opportunity Matrix HUD Surface */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-5 sm:p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <CompassIcon className="h-4 w-4 text-[#7C5CFF]" />
                  <span className="text-[#F5F2EA] font-semibold tracking-wider">
                    OPPORTUNITY PATHS
                  </span>
                </div>
                <span className="text-[10px] text-[#8C96AA] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  CONCEPTUAL PATHS
                </span>
              </div>

              {/* 6 Clean Opportunity Destination Nodes */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {DESTINATIONS.map((dest) => {
                  const Icon = dest.icon;
                  const isHovered = activeDestination === dest.id;
                  return (
                    <div
                      key={dest.id}
                      onMouseEnter={() => setActiveDestination(dest.id)}
                      onMouseLeave={() => setActiveDestination(null)}
                      className={`rounded-lg border p-2.5 transition-all duration-200 cursor-pointer ${
                        isHovered
                          ? `${dest.borderAccent} ${dest.bgAccent}`
                          : "border-white/5 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`h-3.5 w-3.5 ${dest.accent}`} />
                        <span className={`text-[10px] font-semibold tracking-wider ${dest.accent}`}>
                          {dest.category}
                        </span>
                      </div>
                      <span className="text-[9.5px] text-[#8C96AA] block leading-tight truncate">
                        {dest.focus}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C96AA] tracking-widest">
                <span>PATHS // 06 DIVERGENT</span>
                <span className="text-[#7C5CFF]">DIRECTION UNIFIES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
