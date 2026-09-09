interface DiscoverSpatialLabelsProps {
  progress: number;
}

/**
 * DiscoverSpatialLabels
 *
 * Controlled per Step 9 Rule 29:
 * "Establish a strict rule: ONE PRIMARY LABEL + ONE SECONDARY TECHNICAL LABEL per major scene at a time.
 * Do not show ten competing metadata labels."
 *
 * Environmental annotations are handled directly via Layer 3 3D SpatialText3D in Three.js
 * to keep HTML foreground typography pristine and free of visual noise.
 */
export function DiscoverSpatialLabels(_props: DiscoverSpatialLabelsProps) {
  return null;
}
