import * as THREE from "three";

/**
 * Factory for Compass Crew 3D Materials
 * Calibrated for dark-first atmosphere (#050816) with subtle anodized metal and emissive accents.
 */
export function createCompassMaterials() {
  // Outer Bezel: Matte Milled Dark Metal
  const bezel = new THREE.MeshStandardMaterial({
    color: 0x11162b,
    roughness: 0.65,
    metalness: 0.85,
    flatShading: false,
  });

  // Inner Gimbal Rings: Soft Anodized Titanium
  const gimbal = new THREE.MeshStandardMaterial({
    color: 0x1e2645,
    roughness: 0.40,
    metalness: 0.70,
  });

  // Coordinate Dial Face: Deepest Void Surface
  const dialFace = new THREE.MeshStandardMaterial({
    color: 0x070b18,
    roughness: 0.85,
    metalness: 0.20,
  });

  // North Needle: Electric Cyan with Controlled Emissive Aura
  const northNeedle = new THREE.MeshStandardMaterial({
    color: 0x00c8ff,
    emissive: 0x00c8ff,
    emissiveIntensity: 1.25,
    roughness: 0.20,
    metalness: 0.50,
  });

  // South Needle: Deep Brand Violet
  const southNeedle = new THREE.MeshStandardMaterial({
    color: 0x4f46ff,
    emissive: 0x4f46ff,
    emissiveIntensity: 0.85,
    roughness: 0.35,
    metalness: 0.40,
  });

  // Central Bearing Pivot: Subtle Gold Warm Accent (sparingly used)
  const goldBearing = new THREE.MeshStandardMaterial({
    color: 0xd6a74a,
    roughness: 0.35,
    metalness: 0.85,
  });

  // Tick Marks: Crisp White/Silver Instanced Markers
  const tickMark = new THREE.MeshBasicMaterial({
    color: 0xc8d2eb,
  });

  return {
    bezel,
    gimbal,
    dialFace,
    northNeedle,
    southNeedle,
    goldBearing,
    tickMark,
  };
}
