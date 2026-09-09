import type { ReactNode } from "react";

/**
 * ImmersiveSection
 *
 * A semantic full-page section in the Compass Crew landing narrative.
 *
 * Design: Each section occupies `heightVh` of scroll space. Content
 * is presented via a sticky inner container so it stays on screen
 * while the user scrolls through that section's scroll budget.
 *
 * The 3D world is rendered behind all sections via a fixed-position canvas.
 */

interface ImmersiveSectionProps {
  id: string;
  /** Total height of the scroll budget for this section (vh units, default 150) */
  heightVh?: number;
  children: ReactNode;
  /** Additional className for the outer scroll container */
  className?: string;
  /** aria-label for the section */
  label?: string;
}

export function ImmersiveSection({
  id,
  heightVh = 150,
  children,
  className = "",
  label,
}: ImmersiveSectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={`relative w-full ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      {/* Sticky content panel — stays visible during the section's scroll budget */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col pointer-events-none">
        {/* This z-10 layer ensures DOM content sits above the fixed canvas (z-0) */}
        <div className="relative z-10 w-full h-full pointer-events-auto">{children}</div>
      </div>
    </section>
  );
}
