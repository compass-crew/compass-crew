import { BrandLogo } from "@/components/landing/primitives/BrandLogo";

interface WebGLFallbackProps {
  className?: string;
}

/**
 * WebGLFallback
 * Graceful fallback rendered if WebGL is unavailable or disabled.
 * Delivers a premium, editorial visual presentation without raw error banners.
 */
export function WebGLFallback({ className = "" }: WebGLFallbackProps) {
  return (
    <div
      className={`relative flex min-h-[460px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090B] p-8 ${className}`}
      role="region"
      aria-label="Compass Crew visual showcase"
    >
      {/* Ambient background washes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[rgba(124,92,255,0.12)] blur-[100px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[rgba(179,107,255,0.08)] blur-[100px]"
      />

      <div className="relative flex flex-col items-center text-center">
        {/* Handcrafted SVG Compass Motif */}
        <div className="relative mb-6 grid h-44 w-44 place-items-center rounded-full border border-white/10 bg-white/[0.02] shadow-[0_0_60px_rgba(124,92,255,0.2)]">
          <svg
            viewBox="0 0 100 100"
            className="h-32 w-32"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="38" stroke="rgba(124,92,255,0.3)" strokeWidth="1" />
            <circle cx="50" cy="50" r="3" fill="#D6A74A" stroke="none" />
            {/* North Blade (Ultraviolet) */}
            <polygon points="50,14 54,50 50,47 46,50" fill="#7C5CFF" stroke="none" />
            {/* South Blade (Soft Violet) */}
            <polygon points="50,86 54,50 50,53 46,50" fill="#9061F9" stroke="none" opacity="0.6" />
          </svg>
        </div>

        <BrandLogo size="lg" />
        <p className="mt-3 max-w-sm font-cc-sans text-sm text-[#B8B4B0]">
          Where India&apos;s next generation of builders find direction, people, and opportunities.
        </p>
      </div>
    </div>
  );
}
