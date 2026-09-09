import { useEffect, useRef, useState, type ReactNode } from "react";
import { CompassWorld } from "@/components/three/CompassWorld";

/**
 * ImmersiveWorld
 *
 * The single persistent 3D canvas that renders the entire Compass Crew narrative world.
 * It is position:fixed so it covers the full viewport while sections scroll over it.
 *
 * Receives narrativeProgress (0 → 1) from LandingNarrativeController which
 * derives it from the total scroll position of all landing sections.
 */
interface ImmersiveWorldProps {
  narrativeProgress: number;
  /** True when the user is inside the immersive scroll track */
  active: boolean;
  /** Subtle primary CTA hover signal to enhance compass focus */
  ctaHovered?: boolean;
}

export function ImmersiveWorld({ narrativeProgress, active, ctaHovered }: ImmersiveWorldProps) {
  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ willChange: "transform" }}
    >
      {/* Atmosphere washes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(124,92,255,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(179,107,255,0.06),transparent_50%)]" />

      <CompassWorld
        narrativeProgress={narrativeProgress}
        interactive={false}
        ctaHovered={ctaHovered}
        className="w-full h-full"
      />
    </div>
  );
}
