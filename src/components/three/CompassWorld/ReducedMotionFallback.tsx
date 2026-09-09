import { BrandLogo } from "@/components/landing/primitives/BrandLogo";

interface ReducedMotionFallbackProps {
  className?: string;
}

/**
 * ReducedMotionFallback
 * Rendered when prefers-reduced-motion is active.
 * Dignified, high-fidelity static presentation with zero disorienting camera moves or particle sweeps.
 */
export function ReducedMotionFallback({ className = "" }: ReducedMotionFallbackProps) {
  return (
    <div
      className={`relative flex min-h-[480px] w-full items-center justify-center overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090B] p-8 ${className}`}
      aria-label="Compass Crew static visualization (motion reduced)"
    >
      {/* Soft atmospheric gradient wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,92,255,0.14),transparent_70%)]"
      />

      {/* Static Compass Halo */}
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-6 grid h-48 w-48 place-items-center rounded-full border border-white/10 bg-white/[0.02] shadow-[0_0_80px_rgba(124,92,255,0.2)]">
          {/* Static Gimbal Ring */}
          <div className="absolute inset-3 rounded-full border border-white/[0.08]" />
          {/* Static Needle Marker */}
          <div className="relative flex h-32 w-4 flex-col items-center justify-between">
            <div className="h-16 w-3 rounded-t-full bg-gradient-to-b from-[#7C5CFF] to-[#9061F9] shadow-[0_0_20px_rgba(124,92,255,0.6)]" />
            <div className="h-2 w-2 rounded-full bg-[#D6A74A]" />
            <div className="h-14 w-2.5 rounded-b-full bg-gradient-to-t from-[#9061F9] to-[#18181F] opacity-60" />
          </div>
        </div>

        <BrandLogo size="md" />
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-[#8C8882] font-cc-mono">
          Direction • Innovation • Community
        </p>
      </div>
    </div>
  );
}
