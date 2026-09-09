import type { SceneConfig, SceneName } from "./types";

export const SCENE_ORDER: SceneName[] = [
  "hero",
  "discover",
  "build",
  "learn",
  "connect",
  "compete",
  "ship",
  "grow",
  "direction",
  "cta",
  "footer",
];

export const SCENE_CONFIGS: Record<SceneName, SceneConfig> = {
  hero: {
    camera: {
      position: [0, 0.3, 8.2],
      target: [0, 0, 0],
      fov: 40,
    },
    lighting: {
      keyColor: 0x7c5cff, // Ultraviolet
      keyIntensity: 2.4,
      rimColor: 0xb36bff, // Soft Violet
      rimIntensity: 1.8,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.2,
    },
    compass: {
      position: [1.8, 0, 0],
      rotation: [0.15, 0, 0],
      scale: [1, 1, 1],
      needleBearing: 0,
      needleSweepSpeed: 0.35,
      glowIntensity: 1.0,
      ringExpansion: 1.0,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 8,
      fogFar: 30,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 450,
      speed: 0.12,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0, 0.04, 0],
      opacity: 0.35,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.04,
      yOffset: -2.0,
    },
    transitionDuration: 1.2,
  },

  discover: {
    camera: {
      position: [0, 2.0, 7.2],
      target: [0, -0.05, 0],
      fov: 42,
    },
    lighting: {
      keyColor: 0x8b5cf6, // Violet
      keyIntensity: 2.6,
      rimColor: 0xb36bff, // Soft Violet
      rimIntensity: 2.0,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.1,
    },
    compass: {
      position: [0, -0.1, 0],
      rotation: [-0.22, 0, 0],
      scale: [1.02, 1.02, 1.02],
      needleBearing: 45,
      needleSweepSpeed: 1.6, // Directional searching sweep
      glowIntensity: 1.3,
      ringExpansion: 1.22,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 7,
      fogFar: 28,
      bgGradientOpacity: 0.55,
    },
    particles: {
      count: 550,
      speed: 0.18,
      spread: [16, 12, 8],
      size: 0.02,
      flowDirection: [0.05, 0.03, 0],
      opacity: 0.4,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.05,
      yOffset: -1.8,
    },
    transitionDuration: 1.4,
  },

  build: {
    camera: {
      position: [0, 1.4, 6.2],
      target: [0, 0.1, 0],
      fov: 44,
    },
    lighting: {
      keyColor: 0x7c5cff, // Violet
      keyIntensity: 2.7,
      rimColor: 0xff7a6b, // Restrained Coral
      rimIntensity: 2.0,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.15,
    },
    compass: {
      position: [0, -0.3, -2.0],
      rotation: [-0.15, 0, 0],
      scale: [0.82, 0.82, 0.82],
      needleBearing: 90,
      needleSweepSpeed: 0.8,
      glowIntensity: 1.1,
      ringExpansion: 1.15,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 26,
      bgGradientOpacity: 0.6,
    },
    particles: {
      count: 500,
      speed: 0.16,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0, -0.05, 0.06],
      opacity: 0.38,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.06,
      yOffset: -1.8,
    },
    transitionDuration: 1.2,
  },

  learn: {
    camera: {
      position: [0, 1.5, 6.4],
      target: [0, 0.05, 0],
      fov: 43,
    },
    lighting: {
      keyColor: 0xa78bfa, // Muted Violet
      keyIntensity: 2.6,
      rimColor: 0x8b5cf6, // Violet
      rimIntensity: 2.0,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.1,
    },
    compass: {
      position: [0, -0.5, -2.4],
      rotation: [-0.1, 0, 0],
      scale: [0.76, 0.76, 0.76],
      needleBearing: 135,
      needleSweepSpeed: 0.6,
      glowIntensity: 1.0,
      ringExpansion: 1.1,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 26,
      bgGradientOpacity: 0.6,
    },
    particles: {
      count: 450,
      speed: 0.12,
      spread: [14, 10, 8],
      size: 0.018,
      flowDirection: [0, 0.03, -0.03],
      opacity: 0.35,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.05,
      yOffset: -2.0,
    },
    transitionDuration: 1.2,
  },

  connect: {
    camera: {
      position: [0, 1.2, 7.0],
      target: [0, 0.05, 0],
      fov: 42,
    },
    lighting: {
      keyColor: 0xff7a6b, // Coral
      keyIntensity: 2.6,
      rimColor: 0xfda4af, // Soft Coral
      rimIntensity: 2.0,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.15,
      warmColor: 0xf5f2ea, // Warm Ivory
      warmIntensity: 0.8,
    },
    compass: {
      position: [0, -0.2, -1.2],
      rotation: [-0.12, 0.15, 0],
      scale: [0.88, 0.88, 0.88],
      needleBearing: 60,
      needleSweepSpeed: 0.45,
      glowIntensity: 1.15,
      ringExpansion: 1.2,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 28,
      bgGradientOpacity: 0.6,
    },
    particles: {
      count: 500,
      speed: 0.15,
      spread: [16, 12, 8],
      size: 0.02,
      flowDirection: [0.03, 0.02, 0.01],
      opacity: 0.38,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.05,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  compete: {
    camera: {
      position: [0, 1.3, 7.2],
      target: [0, 0.1, 0],
      fov: 42,
    },
    lighting: {
      keyColor: 0x7c5cff, // Ultraviolet
      keyIntensity: 2.8,
      rimColor: 0x9061f9, // Soft Violet
      rimIntensity: 2.4,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.2,
      warmColor: 0xff7a6b, // Coral accent
      warmIntensity: 0.65,
    },
    compass: {
      position: [0, -0.6, -1.6],
      rotation: [-0.18, 0, 0],
      scale: [1.05, 1.05, 1.05],
      needleBearing: 0,
      needleSweepSpeed: 0.5,
      glowIntensity: 1.25,
      ringExpansion: 1.3,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 28,
      bgGradientOpacity: 0.65,
    },
    particles: {
      count: 550,
      speed: 0.18,
      spread: [16, 12, 8],
      size: 0.02,
      flowDirection: [0.03, 0.03, 0.02],
      opacity: 0.4,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.06,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  ship: {
    camera: {
      position: [0, 1.1, 6.8],
      target: [0, 0.05, 0],
      fov: 42,
    },
    lighting: {
      keyColor: 0xf5f2ea, // Warm Ivory
      keyIntensity: 2.5,
      rimColor: 0x7dd3a8, // Mint
      rimIntensity: 2.2,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.2,
      warmColor: 0xfde68a, // Restrained warm highlight
      warmIntensity: 0.6,
    },
    compass: {
      position: [0, -0.4, -1.4],
      rotation: [-0.14, 0.12, 0],
      scale: [0.95, 0.95, 0.95],
      needleBearing: 45,
      needleSweepSpeed: 0.35,
      glowIntensity: 1.15,
      ringExpansion: 1.2,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 28,
      bgGradientOpacity: 0.6,
    },
    particles: {
      count: 400,
      speed: 0.1,
      spread: [16, 12, 8],
      size: 0.018,
      flowDirection: [0.02, 0.01, 0.01],
      opacity: 0.32,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.04,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  grow: {
    camera: {
      position: [0, 1.8, 8.0],
      target: [0, 0.3, 0],
      fov: 44,
    },
    lighting: {
      keyColor: 0x7c5cff, // Ultraviolet
      keyIntensity: 2.7,
      rimColor: 0xb36bff, // Soft Violet
      rimIntensity: 2.2,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 1.2,
      warmColor: 0xff7a6b, // Coral accent
      warmIntensity: 0.7,
    },
    compass: {
      position: [0, -0.4, -2.0],
      rotation: [-0.1, 0, 0],
      scale: [0.95, 0.95, 0.95],
      needleBearing: 0, // Points forward toward next direction
      needleSweepSpeed: 0.4,
      glowIntensity: 1.2,
      ringExpansion: 1.3,
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 30,
      bgGradientOpacity: 0.65,
    },
    particles: {
      count: 480,
      speed: 0.12,
      spread: [16, 12, 10],
      size: 0.02,
      flowDirection: [0, 0.04, -0.04],
      opacity: 0.36,
    },
    grid: {
      visible: true,
      size: 32,
      divisions: 32,
      opacity: 0.05,
      yOffset: -2.0,
    },
    transitionDuration: 1.4,
  },

  ecosystem: {
    camera: {
      position: [0, 0.8, 9.4],
      target: [0, 0, 0],
      fov: 44,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.2,
      rimColor: 0xb36bff,
      rimIntensity: 1.8,
      ambientColor: 0x111116,
      ambientIntensity: 1.1,
    },
    compass: {
      position: [0, 0, 0],
      rotation: [0.2, 0.35, 0],
      scale: [1.1, 1.1, 1.1],
      needleBearing: 0,
      needleSweepSpeed: 0.25,
      glowIntensity: 1.1,
      ringExpansion: 1.2,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 9,
      fogFar: 30,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0.02, 0.02, 0.01],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 28,
      divisions: 28,
      opacity: 0.03,
      yOffset: -2.2,
    },
    transitionDuration: 1.5,
  },

  events: {
    camera: {
      position: [3.4, 0.5, 7.6],
      target: [1.0, 0, 0],
      fov: 40,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.0,
      rimColor: 0xb36bff,
      rimIntensity: 1.6,
      ambientColor: 0x111116,
      ambientIntensity: 1.0,
    },
    compass: {
      position: [-2.2, 0.2, 0],
      rotation: [0.1, -0.4, -0.15],
      scale: [0.95, 0.95, 0.95],
      needleBearing: 90,
      needleSweepSpeed: 0.2,
      glowIntensity: 1.0,
      ringExpansion: 1.1,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [-0.04, 0.02, 0],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  hackathons: {
    camera: {
      position: [0, -1.8, 8.4],
      target: [0, 0.6, 0],
      fov: 46,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.2,
      rimColor: 0xff7a6b,
      rimIntensity: 1.8,
      ambientColor: 0x111116,
      ambientIntensity: 1.1,
    },
    compass: {
      position: [0, -1.4, -0.5],
      rotation: [-0.48, 0, 0],
      scale: [1.2, 1.2, 1.2],
      needleBearing: 0,
      needleSweepSpeed: 0.3,
      glowIntensity: 1.2,
      ringExpansion: 1.3,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 7,
      fogFar: 26,
      bgGradientOpacity: 0.5,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0, 0.05, 0],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 32,
      divisions: 32,
      opacity: 0.03,
      yOffset: -2.4,
    },
    transitionDuration: 1.4,
  },

  howItWorks: {
    camera: {
      position: [-2.4, 1.0, 7.2],
      target: [0, 0, 0],
      fov: 38,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.0,
      rimColor: 0xb36bff,
      rimIntensity: 1.6,
      ambientColor: 0x111116,
      ambientIntensity: 1.0,
    },
    compass: {
      position: [1.6, 0, 0],
      rotation: [0.25, 0.45, 0],
      scale: [0.95, 0.95, 0.95],
      needleBearing: 30,
      needleSweepSpeed: 0.2,
      glowIntensity: 1.0,
      ringExpansion: 1.1,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0.03, 0.03, 0],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  community: {
    camera: {
      position: [0, 0, 10.2],
      target: [0, 0, 0],
      fov: 48,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.0,
      rimColor: 0xff7a6b,
      rimIntensity: 1.6,
      ambientColor: 0x111116,
      ambientIntensity: 1.0,
    },
    compass: {
      position: [0, 0, -1.0],
      rotation: [0.1, 0.2, 0],
      scale: [0.85, 0.85, 0.85],
      needleBearing: 0,
      needleSweepSpeed: 0.2,
      glowIntensity: 0.95,
      ringExpansion: 1.1,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 8,
      fogFar: 30,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0.04, -0.02, 0.01],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.0,
    },
    transitionDuration: 1.4,
  },

  matching: {
    camera: {
      position: [0, 0.2, 7.2],
      target: [0, 0, 0],
      fov: 38,
    },
    lighting: {
      keyColor: 0x7c5cff,
      keyIntensity: 2.0,
      rimColor: 0xb36bff,
      rimIntensity: 1.6,
      ambientColor: 0x111116,
      ambientIntensity: 1.0,
      warmColor: 0xff7a6b,
      warmIntensity: 0.5,
    },
    compass: {
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1.0, 1.0, 1.0],
      needleBearing: 180,
      needleSweepSpeed: 0.3,
      glowIntensity: 1.1,
      ringExpansion: 1.0,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [14, 10, 8],
      size: 0.02,
      flowDirection: [0, 0, 0.05],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.0,
    },
    transitionDuration: 1.2,
  },

  proof: {
    camera: {
      position: [1.8, 0.4, 6.8],
      target: [-0.2, 0, 0],
      fov: 36,
    },
    lighting: {
      keyColor: 0xf5f2ea,
      keyIntensity: 2.0,
      rimColor: 0x7dd3a8,
      rimIntensity: 1.8,
      ambientColor: 0x111116,
      ambientIntensity: 1.0,
      warmColor: 0xff7a6b,
      warmIntensity: 0.4,
    },
    compass: {
      position: [-1.8, 0, 0],
      rotation: [0.3, -0.35, 0.1],
      scale: [0.9, 0.9, 0.9],
      needleBearing: 0,
      needleSweepSpeed: 0.2,
      glowIntensity: 1.1,
      ringExpansion: 1.05,
    },
    environment: {
      fogColor: 0x09090b,
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.45,
    },
    particles: {
      count: 200,
      speed: 0.08,
      spread: [12, 10, 8],
      size: 0.02,
      flowDirection: [0.02, 0.02, 0],
      opacity: 0.3,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.0,
    },
    transitionDuration: 1.3,
  },

  direction: {
    camera: {
      // Camera moves closer and centers — the culminating frontal view
      position: [0, 0.2, 6.4],
      target: [0, 0, 0],
      fov: 38,
    },
    lighting: {
      // Quiet: ultraviolet key + warm ivory rim — depth without spectacle
      keyColor: 0x7c5cff, // Ultraviolet (correct palette)
      keyIntensity: 2.2,
      rimColor: 0xf5f2ea, // Warm Ivory — gentle clarity
      rimIntensity: 1.4,
      ambientColor: 0x111116, // Graphite (correct palette)
      ambientIntensity: 1.0,
      warmColor: 0xff7a6b, // Very restrained coral
      warmIntensity: 0.35,
    },
    compass: {
      // Largest, most centered, calmest — the culmination
      position: [0, 0, 0],
      rotation: [0.05, 0, 0], // Slight upward tilt — faces the viewer
      scale: [1.25, 1.25, 1.25],
      needleBearing: 0, // True North — settled
      needleSweepSpeed: 0.08, // Almost still — settled direction
      glowIntensity: 1.1, // Soft, not intense
      ringExpansion: 0.95, // Slightly contracted — resolved
    },
    environment: {
      fogColor: 0x09090b, // Obsidian (correct palette)
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.55,
    },
    particles: {
      // Very sparse — the world becomes quiet
      count: 160,
      speed: 0.04,
      spread: [12, 8, 6],
      size: 0.016,
      flowDirection: [0, 0.01, 0], // Almost still
      opacity: 0.18,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.03,
      yOffset: -2.2,
    },
    transitionDuration: 1.8, // Slower, more cinematic transition
  },

  cta: {
    camera: {
      position: [0, 0.25, 7.0],
      target: [0, 0, 0],
      fov: 37,
    },
    lighting: {
      keyColor: 0x7c5cff, // Ultraviolet
      keyIntensity: 2.0,
      rimColor: 0xf5f2ea, // Warm Ivory
      rimIntensity: 1.3,
      ambientColor: 0x111116, // Graphite
      ambientIntensity: 0.95,
      warmColor: 0xff7a6b, // Restrained Coral
      warmIntensity: 0.3,
    },
    compass: {
      position: [0, 0, 0],
      rotation: [0.04, 0, 0], // Subtle upward tilt facing viewer directly
      scale: [1.2, 1.2, 1.2],
      needleBearing: 0, // True North settled
      needleSweepSpeed: 0.04, // Calm, stable
      glowIntensity: 1.0, // Controlled, premium
      ringExpansion: 0.95, // Settled resolved rings
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 8,
      fogFar: 28,
      bgGradientOpacity: 0.5,
    },
    particles: {
      count: 120, // Very low density
      speed: 0.025, // Minimal movement
      spread: [12, 8, 6],
      size: 0.015,
      flowDirection: [0, 0.01, 0], // Subtle slow convergence
      opacity: 0.14,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.02,
      yOffset: -2.2,
    },
    transitionDuration: 2.0, // Calm cinematic arrival
  },

  footer: {
    camera: {
      position: [0, 0.45, 9.2], // Camera slowly pulls back into wide, calm composition
      target: [0, 0, 0],
      fov: 35,
    },
    lighting: {
      keyColor: 0x7c5cff, // Ultraviolet
      keyIntensity: 1.2, // Darker and calmer than previous scenes
      rimColor: 0xf5f2ea, // Warm Ivory
      rimIntensity: 0.8,
      ambientColor: 0x09090b, // Obsidian
      ambientIntensity: 0.7,
      warmColor: 0xff7a6b, // Very restrained Coral
      warmIntensity: 0.15,
    },
    compass: {
      position: [0, 0.6, 0], // Subtle brand visual elevated above/behind footer content
      rotation: [0.02, 0, 0],
      scale: [0.65, 0.65, 0.65], // Scaled down, refined
      needleBearing: 0, // True North
      needleSweepSpeed: 0.01, // Almost completely still
      glowIntensity: 0.55, // Soft, non-distracting
      ringExpansion: 0.9, // Contracted and resolved
    },
    environment: {
      fogColor: 0x09090b, // Obsidian
      fogNear: 6,
      fogFar: 22,
      bgGradientOpacity: 0.35,
    },
    particles: {
      count: 60, // Ultra-sparse
      speed: 0.01, // Slow gentle drift then settled
      spread: [12, 8, 6],
      size: 0.012,
      flowDirection: [0, 0.005, 0],
      opacity: 0.08,
    },
    grid: {
      visible: false,
      size: 24,
      divisions: 24,
      opacity: 0.01,
      yOffset: -2.2,
    },
    transitionDuration: 2.2, // Visual exhale
  },
};
