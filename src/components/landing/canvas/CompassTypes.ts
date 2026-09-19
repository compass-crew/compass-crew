/**
 * COMPASS CREW — 3D COMPASS COMPONENT CONTRACT
 * Types, states, and material specifications for the central Compass motif.
 */

export type CompassMode =
  | "hero" // Primary majestic awakening; slow rotational drift and gentle mouse tilt
  | "search" // Directional scanner; needle sweeps rapidly across coordinate grid
  | "orbit" // Outer rings expand into 6 concentric capability nodes
  | "timeline" // Tilts to horizontal rail perspective for events
  | "arena" // Base geometry expands to form stadium ground plane
  | "network" // Disperses into particle network nodes
  | "convergence" // Inward magnetic pull back to True North
  | "cta"; // High-contrast vertical True North alignment with light beam

export interface CompassProps {
  /** Size in pixels (width and height of the canvas container) */
  size?: number | string;
  /** Visual narrative state */
  mode?: CompassMode;
  /** Active needle bearing angle in degrees (0 = North) */
  bearing?: number;
  /** Whether mouse pointer applies interactive physical parallax torque */
  interactive?: boolean;
  /** Intensity of ambient particle atmosphere and specular reflections (0.0 to 1.0) */
  intensity?: number;
  /** Whether the true north cyan emissive tip emits an environmental glow */
  glow?: boolean;
  /** Custom CSS class names for the container wrapper */
  className?: string;
  /** Callback fired when compass completes a narrative orientation transition */
  onTransitionComplete?: (mode: CompassMode) => void;
}

export interface CompassMaterialConfig {
  bezelColor: number;
  gimbalColor: number;
  northColor: number;
  southColor: number;
  goldAccentColor: number;
  roughness: number;
  metalness: number;
  emissiveIntensity: number;
}
