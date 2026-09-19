import { ArrowDown } from "lucide-react";
import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface DirectionContentProps {
  progress: number; // 0.0 to 1.0 representing normalized scene progress
}

/**
 * DirectionContent
 *
 * Foreground editorial typography for the Direction / Culminating Focus scene:
 * - Layer 2 Kinetic & Spatial Typography:
 *   - Monumental word: "DIRECTION."
 *   - Subtitle: "Find what you want to build, then build toward it."
 * - Calibrated 4-phase lifecycle with generous HOLD phase (0.40 -> 0.82)
 * - Strict 1 primary label (08 // DIRECTION) + 1 secondary (COMPASS STATE)
 * - Restrained negative space without clipping on 1280x720
 */
export function DirectionContent({ progress }: DirectionContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  if (progress < 0.02) return null;

  // Phase A: Enter (0.06 -> 0.22)
  const eyebrowAlpha = smoothstep(0.06, 0.2, progress);
  const echoAlpha = smoothstep(0.12, 0.3, progress) * (1 - smoothstep(0.75, 0.9, progress));

  // Phase B: Reveal (0.18 -> 0.40)
  const headingAlpha = smoothstep(0.18, 0.34, progress);
  const headingY = (1 - headingAlpha) * 24;

  const bodyAlpha = smoothstep(0.24, 0.4, progress);
  const bodyY = (1 - bodyAlpha) * 16;

  const hookAlpha = smoothstep(0.34, 0.48, progress);

  // Phase C: HOLD (0.40 -> 0.82) - all elements remain 1.0 stationary

  const JOURNEY_ECHOES = [
    { label: "BUILD", bearing: "02" },
    { label: "LEARN", bearing: "03" },
    { label: "CONNECT", bearing: "04" },
    { label: "COMPETE", bearing: "05" },
    { label: "SHIP", bearing: "06" },
    { label: "GROW", bearing: "07" },
  ];

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center pt-16 sm:pt-20 pb-8 px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Direction Scene: Find what you want to build, then build toward it."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="max-w-3xl">
          {/* Eyebrow Label */}
          <div
            style={{ opacity: eyebrowAlpha }}
            className="mb-4 sm:mb-6 transition-opacity duration-200"
          >
            <SpatialLabel sceneNumber="08 // DIRECTION" pulse={false} accent="ultraviolet">
              COMPASS STATE
            </SpatialLabel>
          </div>

          {/* Journey Echo */}
          <div
            style={{ opacity: echoAlpha * 0.38 }}
            className="mb-5 sm:mb-7 flex flex-wrap items-center gap-x-4 gap-y-1 transition-opacity duration-300"
            aria-hidden="true"
          >
            {JOURNEY_ECHOES.map((echo, i) => (
              <span
                key={echo.label}
                className="font-cc-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#8C8882]"
                style={{
                  opacity: clamp01((echoAlpha - i * 0.08) / 0.4),
                  transitionDelay: `${i * 40}ms`,
                }}
              >
                {echo.label}
                {i < JOURNEY_ECHOES.length - 1 && <span className="mx-1.5 text-[#3A3A40]">·</span>}
              </span>
            ))}
            <span className="font-cc-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#7C5CFF]/60">
              NOW: DIRECTION
            </span>
          </div>

          {/* Primary Monumental Headline */}
          <DepthText depth={20} className="w-full">
            <h2
              style={{
                opacity: headingAlpha,
                transform: `translateY(${headingY}px)`,
              }}
              className="flex flex-col font-cc-sans font-bold tracking-[-0.04em] transition-all duration-100 will-change-transform"
            >
              <span className="block text-[#F5F2EA] text-[clamp(44px,7.5vw,96px)] leading-[0.92] drop-shadow-[0_2px_16px_rgba(9,9,11,0.9)]">
                DIRECTION.
              </span>
            </h2>
          </DepthText>

          {/* Supporting Statement */}
          <p
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed tracking-[-0.015em] text-[#E0DDD5] font-cc-sans transition-all duration-100 will-change-transform"
          >
            Find what you want to build,{" "}
            <span className="text-cc-brand-gradient font-semibold">then build toward it.</span>
          </p>

          <p
            style={{ opacity: bodyAlpha }}
            className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm text-[#8C8882] font-cc-mono leading-relaxed"
          >
            A platform where scattered talent becomes focused trajectory.
          </p>

          {/* Outgoing CTA Transition Hook */}
          <div
            style={{ opacity: hookAlpha }}
            className="mt-6 sm:mt-8 flex items-center gap-3 transition-opacity duration-200"
          >
            <div className="flex items-center gap-2 rounded-md border border-white/10 bg-[#111116]/80 px-3.5 py-1.5 backdrop-blur-md">
              <span className="font-cc-mono text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#F5F2EA]">
                ORIENTATION COMPLETE // PROCEED TO CREW
              </span>
              <ArrowDown className="h-3 w-3 text-[#7C5CFF] animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
