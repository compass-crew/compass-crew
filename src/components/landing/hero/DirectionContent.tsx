import { DepthText } from "@/components/landing/typography/DepthText";
import { SpatialLabel } from "@/components/landing/typography/SpatialLabel";

interface DirectionContentProps {
  /** Normalized scene progress 0.0 → 1.0 */
  progress: number;
}

/**
 * DirectionContent
 *
 * Foreground editorial layer for the DIRECTION scene — the culminating
 * reflective experience before the Final CTA.
 *
 * Emotional tone: reflective, confident, calm, cinematic, expansive.
 *
 * Typography choreography (scroll-driven):
 *   0.00 → 0.20  — eyebrow label fades in
 *   0.15 → 0.42  — journey echo lines appear (BUILD / LEARN / CONNECT...)
 *   0.35 → 0.60  — primary "DIRECTION." headline reveals
 *   0.52 → 0.76  — supporting statement appears
 *   0.72 → 0.92  — CTA transition hook appears
 *
 * Design rules:
 *   - Strict 1 primary label (08 // DIRECTION) + 1 secondary (COMPASS STATE)
 *   - Large negative space — this is the most minimal scene
 *   - Journey echo is faint, not a data dump
 *   - No interactive elements beyond pointer parallax
 */
export function DirectionContent({ progress }: DirectionContentProps) {
  const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
  const smoothstep = (min: number, max: number, v: number) => {
    const x = clamp01((v - min) / (max - min));
    return x * x * (3 - 2 * x);
  };

  // ── Scene entry guard ──────────────────────────────────────
  if (progress < 0.04) return null;

  // ── Timing calculations ───────────────────────────────────
  // 1. Eyebrow label
  const eyebrowAlpha  = smoothstep(0.06, 0.20, progress);

  // 2. Journey echo (the path taken — ultra-quiet)
  const echoAlpha     = smoothstep(0.14, 0.35, progress)
                      * (1 - smoothstep(0.70, 0.85, progress)); // fades as direction solidifies

  // 3. Primary headline "DIRECTION."
  const headingAlpha  = smoothstep(0.32, 0.56, progress);
  const headingY      = (1 - headingAlpha) * 28;

  // 4. Supporting statement
  const bodyAlpha     = smoothstep(0.50, 0.72, progress);
  const bodyY         = (1 - bodyAlpha) * 18;

  // 5. CTA transition hook
  const hookAlpha     = smoothstep(0.70, 0.90, progress);

  // ── Journey echo text: ultra-faint chronicle of chapters ──
  const JOURNEY_ECHOES = [
    { label: "BUILD",    bearing: "02" },
    { label: "LEARN",    bearing: "03" },
    { label: "CONNECT",  bearing: "04" },
    { label: "COMPETE",  bearing: "05" },
    { label: "SHIP",     bearing: "06" },
    { label: "GROW",     bearing: "07" },
  ];

  return (
    <div
      className="pointer-events-auto absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-20 xl:px-28 select-none"
      aria-label="Compass Crew Direction Scene: Find what you want to build, then build toward it."
    >
      <div className="relative z-20 mx-auto w-full max-w-[1440px]">
        <div className="max-w-3xl">

          {/* ── Eyebrow Label ─────────────────────────────── */}
          <div
            style={{ opacity: eyebrowAlpha }}
            className="mb-6 sm:mb-8 transition-opacity duration-200"
          >
            <SpatialLabel sceneNumber="08 // DIRECTION" pulse={false} accent="ultraviolet">
              COMPASS STATE
            </SpatialLabel>
          </div>

          {/* ── Journey Echo ──────────────────────────────── */}
          {/* Ultra-quiet reminder of all chapters traversed */}
          <div
            style={{ opacity: echoAlpha * 0.38 }}
            className="mb-8 sm:mb-10 flex flex-wrap items-center gap-x-4 gap-y-1 transition-opacity duration-300"
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
                {i < JOURNEY_ECHOES.length - 1 && (
                  <span className="mx-1.5 text-[#3A3A40]">·</span>
                )}
              </span>
            ))}
            <span className="font-cc-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#7C5CFF]/60">
              NOW: DIRECTION
            </span>
          </div>

          {/* ── Primary Monumental Headline ───────────────── */}
          <DepthText depth={24} className="w-full">
            <h2
              style={{
                opacity: headingAlpha,
                transform: `translateY(${headingY}px)`,
              }}
              className="flex flex-col font-cc-sans font-bold tracking-[-0.055em] transition-all duration-100 will-change-transform"
            >
              {/* Beat 1: "DIRECTION." — the culminating word */}
              <span className="block text-[#F5F2EA] text-[clamp(52px,10.5vw,130px)] sm:text-[clamp(72px,9vw,130px)] leading-[0.90] drop-shadow-[0_2px_16px_rgba(9,9,11,0.9)]">
                DIRECTION.
              </span>
            </h2>
          </DepthText>

          {/* ── Supporting Statement ──────────────────────── */}
          {/* One statement. Calm. Not a motivational poster. */}
          <div
            style={{
              opacity: bodyAlpha,
              transform: `translateY(${bodyY}px)`,
            }}
            className="mt-8 sm:mt-10 max-w-xl transition-all duration-100 will-change-transform"
          >
            <p className="text-[clamp(18px,2.2vw,28px)] font-cc-sans font-medium tracking-[-0.02em] leading-[1.35] text-[#B8B4B0]">
              Find what you want to build.{" "}
              <span className="text-[#F5F2EA]">
                Then build toward it.
              </span>
            </p>
            <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed text-[#6C6862] font-cc-sans">
              Your direction does not have to be perfect. It just has to give you somewhere meaningful to go.
            </p>
          </div>

          {/* ── Compass Orientation Visual ────────────────── */}
          {/* Minimal cardinal directions — open-ended, no mapped meanings */}
          <div
            style={{ opacity: headingAlpha * 0.55 }}
            className="mt-10 sm:mt-12 flex items-center gap-6 transition-opacity duration-300"
            aria-hidden="true"
          >
            {(["N", "E", "S", "W"] as const).map((cardinal) => (
              <span
                key={cardinal}
                className="font-cc-mono text-[11px] sm:text-[13px] font-semibold tracking-[0.3em] text-[#3A3640]"
                style={{
                  color: cardinal === "N" ? "#7C5CFF" : undefined,
                  opacity: cardinal === "N" ? 0.85 : 0.35,
                }}
              >
                {cardinal}
              </span>
            ))}
          </div>

          {/* ── CTA Transition Hook ───────────────────────── */}
          <div
            style={{ opacity: hookAlpha }}
            className="mt-10 sm:mt-12 flex items-center gap-3 transition-opacity duration-300"
          >
            <div className="inline-flex items-center gap-2.5 rounded-lg border border-[#7C5CFF]/25 bg-[#111116]/70 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(124,92,255,0.08)]">
              {/* Compass needle icon — the settled state */}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="flex-shrink-0"
              >
                <circle
                  cx="7"
                  cy="7"
                  r="6"
                  stroke="#7C5CFF"
                  strokeOpacity="0.5"
                  strokeWidth="1"
                />
                {/* Needle pointing north */}
                <polygon
                  points="7,1.5 5.5,7 8.5,7"
                  fill="#7C5CFF"
                  fillOpacity="0.85"
                />
                <polygon
                  points="7,12.5 5.5,7 8.5,7"
                  fill="#3A3640"
                />
                <circle cx="7" cy="7" r="1" fill="#F5F2EA" fillOpacity="0.7" />
              </svg>
              <span className="font-cc-mono text-[10.5px] sm:text-[11px] font-medium uppercase tracking-[0.16em] text-[#7C5CFF]">
                COMPASS SETTLED // TRUE NORTH
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
