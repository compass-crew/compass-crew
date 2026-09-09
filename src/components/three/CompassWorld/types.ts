import type { ReactNode } from "react";

export type SceneName =
  | "hero"
  | "discover"
  | "build"
  | "learn"
  | "connect"
  | "compete"
  | "ship"
  | "grow"
  | "ecosystem"
  | "events"
  | "hackathons"
  | "howItWorks"
  | "community"
  | "matching"
  | "proof"
  | "direction"
  | "cta"
  | "footer";

export type QualityLevel = "ultra" | "high" | "medium" | "low";

export interface CameraConfig {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface LightingConfig {
  keyColor: number;
  keyIntensity: number;
  rimColor: number;
  rimIntensity: number;
  ambientColor: number;
  ambientIntensity: number;
  warmColor?: number;
  warmIntensity?: number;
}

export interface CompassTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  needleBearing: number;
  needleSweepSpeed: number;
  glowIntensity: number;
  ringExpansion: number;
}

export interface EnvironmentConfig {
  fogColor: number;
  fogNear: number;
  fogFar: number;
  bgGradientOpacity: number;
}

export interface ParticleConfig {
  count: number;
  speed: number;
  spread: [number, number, number];
  size: number;
  flowDirection: [number, number, number];
  opacity: number;
}

export interface GridConfig {
  visible: boolean;
  size: number;
  divisions: number;
  opacity: number;
  yOffset: number;
}

export interface SceneConfig {
  camera: CameraConfig;
  lighting: LightingConfig;
  compass: CompassTransform;
  environment: EnvironmentConfig;
  particles: ParticleConfig;
  grid: GridConfig;
  transitionDuration?: number;
}

export interface PointerState {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
  smoothedX: number;
  smoothedY: number;
  vx: number;
  vy: number;
  isDown: boolean;
  isTouch: boolean;
}

export interface ScrollState {
  progress: number;
  activeScene: SceneName;
  sceneProgress: number;
  velocity: number;
}

export interface PerformanceStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  quality: QualityLevel;
  dpr: number;
}

export interface CompassWorldContextValue {
  activeScene: SceneName;
  setActiveScene: (scene: SceneName) => void;
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
  quality: QualityLevel;
  setQuality: (quality: QualityLevel) => void;
  pointer: PointerState;
  stats: PerformanceStats;
  debug: boolean;
  setDebug: (debug: boolean) => void;
}

export interface CompassWorldProps {
  activeScene?: SceneName;
  transitionFrom?: SceneName;
  transitionTo?: SceneName;
  transitionProgress?: number;
  narrativeProgress?: number;
  scrollProgress?: number;
  quality?: QualityLevel;
  interactive?: boolean;
  debug?: boolean;
  className?: string;
  ctaHovered?: boolean;
  children?: ReactNode;
}
