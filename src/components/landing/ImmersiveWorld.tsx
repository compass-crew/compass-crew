import { lazy, Suspense, useEffect, useState } from "react";
import { useNarrativeProgress } from "./LandingScrollContext";

const LazyCompassWorld = lazy(() =>
  import("@/components/three/CompassWorld").then((m) => ({
    default: m.CompassWorld,
  })),
);

/**
 * ImmersiveWorld
 *
 * The single persistent 3D canvas that renders the entire Compass Crew narrative world.
 * It is position:fixed so it covers the full viewport while sections scroll over it.
 *
 * Progress is obtained via internal hook subscription to prevent triggering
 * parent layout re-renders during high-frequency 60Hz scrolling.
 */
interface ImmersiveWorldProps {
  narrativeProgress?: number;
  /** True when the user is inside the immersive scroll track */
  active: boolean;
  /** Subtle primary CTA hover signal to enhance compass focus */
  ctaHovered?: boolean;
}

export function ImmersiveWorld({
  narrativeProgress: propNarrativeProgress,
  active,
  ctaHovered,
}: ImmersiveWorldProps) {
  const contextNarrative = useNarrativeProgress();
  const narrativeProgress = propNarrativeProgress ?? contextNarrative;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
      style={{ willChange: "transform" }}
    >
      {/* Atmosphere washes - immediate background glow before WebGL initializes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_45%,rgba(124,92,255,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(179,107,255,0.06),transparent_50%)]" />

      {mounted && (
        <Suspense fallback={<div className="w-full h-full" />}>
          <LazyCompassWorld
            narrativeProgress={narrativeProgress}
            interactive={true}
            ctaHovered={ctaHovered}
            className="w-full h-full"
          />
        </Suspense>
      )}
    </div>
  );
}
