import * as THREE from "three";
import type { CameraConfig, CompassTransform, LightingConfig, SceneConfig } from "./types";

export class SceneTransition {
  public static lerpCamera(a: CameraConfig, b: CameraConfig, t: number): CameraConfig {
    return {
      position: [
        THREE.MathUtils.lerp(a.position[0], b.position[0], t),
        THREE.MathUtils.lerp(a.position[1], b.position[1], t),
        THREE.MathUtils.lerp(a.position[2], b.position[2], t),
      ],
      target: [
        THREE.MathUtils.lerp(a.target[0], b.target[0], t),
        THREE.MathUtils.lerp(a.target[1], b.target[1], t),
        THREE.MathUtils.lerp(a.target[2], b.target[2], t),
      ],
      fov: THREE.MathUtils.lerp(a.fov, b.fov, t),
    };
  }

  public static lerpCompass(a: CompassTransform, b: CompassTransform, t: number): CompassTransform {
    return {
      position: [
        THREE.MathUtils.lerp(a.position[0], b.position[0], t),
        THREE.MathUtils.lerp(a.position[1], b.position[1], t),
        THREE.MathUtils.lerp(a.position[2], b.position[2], t),
      ],
      rotation: [
        THREE.MathUtils.lerp(a.rotation[0], b.rotation[0], t),
        THREE.MathUtils.lerp(a.rotation[1], b.rotation[1], t),
        THREE.MathUtils.lerp(a.rotation[2], b.rotation[2], t),
      ],
      scale: [
        THREE.MathUtils.lerp(a.scale[0], b.scale[0], t),
        THREE.MathUtils.lerp(a.scale[1], b.scale[1], t),
        THREE.MathUtils.lerp(a.scale[2], b.scale[2], t),
      ],
      needleBearing: THREE.MathUtils.lerp(a.needleBearing, b.needleBearing, t),
      needleSweepSpeed: THREE.MathUtils.lerp(a.needleSweepSpeed, b.needleSweepSpeed, t),
      glowIntensity: THREE.MathUtils.lerp(a.glowIntensity, b.glowIntensity, t),
      ringExpansion: THREE.MathUtils.lerp(a.ringExpansion, b.ringExpansion, t),
    };
  }

  public static lerpLighting(a: LightingConfig, b: LightingConfig, t: number): LightingConfig {
    const colA = new THREE.Color(a.keyColor);
    const colB = new THREE.Color(b.keyColor);
    const keyCol = colA.lerp(colB, t).getHex();

    const rimA = new THREE.Color(a.rimColor);
    const rimB = new THREE.Color(b.rimColor);
    const rimCol = rimA.lerp(rimB, t).getHex();

    return {
      keyColor: keyCol,
      keyIntensity: THREE.MathUtils.lerp(a.keyIntensity, b.keyIntensity, t),
      rimColor: rimCol,
      rimIntensity: THREE.MathUtils.lerp(a.rimIntensity, b.rimIntensity, t),
      ambientColor: a.ambientColor,
      ambientIntensity: THREE.MathUtils.lerp(a.ambientIntensity, b.ambientIntensity, t),
    };
  }

  public static interpolateScenes(from: SceneConfig, to: SceneConfig, progress: number): SceneConfig {
    // Standard cubic-bezier smoothstep easing
    const t = THREE.MathUtils.smoothstep(progress, 0, 1);

    return {
      camera: this.lerpCamera(from.camera, to.camera, t),
      lighting: this.lerpLighting(from.lighting, to.lighting, t),
      compass: this.lerpCompass(from.compass, to.compass, t),
      environment: {
        fogColor: from.environment.fogColor,
        fogNear: THREE.MathUtils.lerp(from.environment.fogNear, to.environment.fogNear, t),
        fogFar: THREE.MathUtils.lerp(from.environment.fogFar, to.environment.fogFar, t),
        bgGradientOpacity: THREE.MathUtils.lerp(from.environment.bgGradientOpacity, to.environment.bgGradientOpacity, t),
      },
      particles: {
        count: Math.round(THREE.MathUtils.lerp(from.particles.count, to.particles.count, t)),
        speed: THREE.MathUtils.lerp(from.particles.speed, to.particles.speed, t),
        spread: [
          THREE.MathUtils.lerp(from.particles.spread[0], to.particles.spread[0], t),
          THREE.MathUtils.lerp(from.particles.spread[1], to.particles.spread[1], t),
          THREE.MathUtils.lerp(from.particles.spread[2], to.particles.spread[2], t),
        ],
        size: THREE.MathUtils.lerp(from.particles.size, to.particles.size, t),
        flowDirection: [
          THREE.MathUtils.lerp(from.particles.flowDirection[0], to.particles.flowDirection[0], t),
          THREE.MathUtils.lerp(from.particles.flowDirection[1], to.particles.flowDirection[1], t),
          THREE.MathUtils.lerp(from.particles.flowDirection[2], to.particles.flowDirection[2], t),
        ],
        opacity: THREE.MathUtils.lerp(from.particles.opacity, to.particles.opacity, t),
      },
      grid: {
        visible: to.grid.visible || from.grid.visible,
        size: to.grid.size,
        divisions: to.grid.divisions,
        opacity: to.grid.visible ? THREE.MathUtils.lerp(0, to.grid.opacity, t) : THREE.MathUtils.lerp(from.grid.opacity, 0, t),
        yOffset: THREE.MathUtils.lerp(from.grid.yOffset, to.grid.yOffset, t),
      },
    };
  }
}
