import { useState } from "react";
import { ArrowRight, Compass, Sparkles, Briefcase, GraduationCap, Rocket, GitPullRequest, Users, Compass as CompassIcon } from "lucide-react";
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
 *   - Supporting: "Build meaningful work, make it visible, and create opportunities for what comes next."
 * - Strict 1 Primary Label ("07 // GROW") + 1 Secondary Technical Label ("OPPORTUNITY FIELD") rule
 * - Architectural Opportunity Matrix HUD surface labeled CONCEPTUAL PATHS (no fake data or job boards)
 * - Outgoing transition hook preparing for DIRECTION
 */
export function GrowContent({ progress }: GrowContentProps) {
  const [activeDestination, setActiveDestination] = useState<string | null>(null);

  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // Scene choreography timings
  const headingAlpha = smoothstep(0.08, 0.26, progress);
  const headingY = (1 - headingAlpha) * 24;

  const bodyAlpha = smoothstep(0.24, 0.46, progress);
  const bodyY = (1 - bodyAlpha) * 18;

  const hudAlpha = smoothstep(0.36, 0.60, progress);
  const hookAlpha = smoothstep(0.68, 0.88, progress);

  if (progress < 0.04) return null;

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-24 pb-12 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Grow Scene: Let your work open the next door."
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
                className="flex flex-col font-cc-sans font-bold tracking-[-0.05em] transition-transform duration-100 will-change-transform"
              >
                <span className="block text-[#F5F2EA] text-[clamp(44px,6.5vw,84px)] leading-[0.92] drop-shadow-[0_2px_12px_rgba(9,9,11,0.85)]">
                  GROW.
                </span>
                <span className="block text-[#B8B4B0] text-[clamp(22px,3vw,38px)] leading-[1.2] mt-3 sm:mt-4 font-medium tracking-[-0.02em] drop-shadow-[0_2px_12px_rgba(9,9,11,0.85)]">
                  Let your work{" "}
                  <span className="text-[#FF7A6B] font-semibold">
                    open the next door.
                  </span>
                </span>
              </h2>
            </DepthText>

            {/* Supporting Editorial Copy: Exactly one supporting statement */}
            <p
              style={{
                opacity: bodyAlpha,
                transform: `translateY(${bodyY}px)`,
              }}
              className="mt-6 max-w-xl text-base leading-relaxed text-[#B8B4B0] sm:text-lg font-cc-sans transition-transform duration-100 will-change-transform"
            >
              Build meaningful work, make it visible, and create opportunities for what comes next.
              A verified project isn't just a submission—it's a launchpad for internships, research,
              startups, and community leadership.
            </p>

            {/* Outgoing Transition Hook toward DIRECTION */}
            <div
              style={{ opacity: hookAlpha }}
              className="mt-8 flex items-center gap-3 transition-opacity duration-200"
            >
              <div className="flex items-center gap-2 rounded-md border border-[#7C5CFF]/30 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(124,92,255,0.15)]">
                <CompassIcon className="h-3.5 w-3.5 text-[#7C5CFF] animate-spin" style={{ animationDuration: "12s" }} />
                <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C5CFF]">
                  OPPORTUNITY FIELD ESTABLISHED // COMPASS POINTS FORWARD
                </span>
                <ArrowRight className="h-3 w-3 text-[#7C5CFF]" />
              </div>
            </div>
          </div>

          {/* Right Column: Architectural Opportunity Matrix HUD Surface */}
          <div
            style={{ opacity: hudAlpha }}
            className="lg:col-span-5 transition-opacity duration-200"
          >
            <div className="rounded-xl border border-white/10 bg-[#111116]/80 p-6 backdrop-blur-md font-cc-mono text-xs shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#7C5CFF]" />
                  <span className="text-[#F5F2EA] font-semibold tracking-wider">OPPORTUNITY MATRIX</span>
                </div>
                <span className="text-[10px] text-[#8C96AA] tracking-widest border border-white/10 px-2 py-0.5 rounded">
                  CONCEPTUAL PATHS
                </span>
              </div>

              {/* 6 Opportunity Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                {DESTINATIONS.map((dest) => {
                  const Icon = dest.icon;
                  const isHovered = activeDestination === dest.id;
                  return (
                    <div
                      key={dest.id}
                      onMouseEnter={() => setActiveDestination(dest.id)}
                      onMouseLeave={() => setActiveDestination(null)}
                      className={`rounded-lg border p-3 transition-all duration-200 cursor-default ${
                        isHovered
                          ? `${dest.borderAccent} ${dest.bgAccent}`
                          : "border-white/5 bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold flex items-center gap-1.5 ${dest.accent}`}>
                          <Icon className={`h-3.5 w-3.5 ${dest.accent}`} />
                          {dest.category}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[9.5px] text-[#8C96AA]">
                        <span>{dest.focus}</span>
                        <span className={dest.accent}>PATH ACTIVE</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Footer */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-[#8C96AA] tracking-widest">
                <span className="flex items-center gap-1.5 text-[#F5F2EA]">
                  <Compass className="h-3.5 w-3.5 text-[#7C5CFF]" />
                  ONE PROJECT // MULTIPLE FUTURES
                </span>
                <span className="text-[#7C5CFF]">READY FOR DIRECTION →</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
