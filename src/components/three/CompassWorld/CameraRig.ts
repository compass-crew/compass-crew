import * as THREE from "three";
import type { CameraConfig, PointerState } from "./types";

export class CameraRig {
  public camera: THREE.PerspectiveCamera;
  private currentTarget = new THREE.Vector3(0, 0, 0);
  private desiredPosition = new THREE.Vector3(0, 0, 8.5);
  private desiredTarget = new THREE.Vector3(0, 0, 0);
  private desiredFov = 40;
  private effectiveTargetPos = new THREE.Vector3();

  private parallaxStrength = 0.22;
  private lerpFactor = 0.065;
  private prefersReducedMotion = false;

  constructor(width: number, height: number) {
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    this.camera.position.set(0, 0, 8.5);
    this.currentTarget.set(0, 0, 0);

    if (typeof window !== "undefined") {
      this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
  }

  public setTargetConfig(config: CameraConfig, immediate = false): void {
    this.desiredPosition.set(...config.position);
    this.desiredTarget.set(...config.target);
    this.desiredFov = config.fov;

    if (immediate || this.prefersReducedMotion) {
      this.camera.position.copy(this.desiredPosition);
      this.currentTarget.copy(this.desiredTarget);
      this.camera.fov = this.desiredFov;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(this.currentTarget);
    }
  }

  public resize(width: number, height: number): void {
    if (width <= 0 || height <= 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  public update(pointer?: PointerState): void {
    if (this.prefersReducedMotion) {
      this.camera.lookAt(this.currentTarget);
      return;
    }

    // 1. Calculate subtle parallax offset from pointer
    let parallaxX = 0;
    let parallaxY = 0;

    if (pointer && !pointer.isTouch) {
      parallaxX = pointer.smoothedX * this.parallaxStrength;
      parallaxY = pointer.smoothedY * this.parallaxStrength;
    }

    // 2. Smoothly lerp camera position
    this.effectiveTargetPos.set(
      this.desiredPosition.x + parallaxX,
      this.desiredPosition.y + parallaxY,
      this.desiredPosition.z
    );

    this.camera.position.lerp(this.effectiveTargetPos, this.lerpFactor);

    // 3. Smoothly lerp lookAt target
    this.currentTarget.lerp(this.desiredTarget, this.lerpFactor);
    this.camera.lookAt(this.currentTarget);

    // 4. Smoothly lerp FOV if changed
    if (Math.abs(this.camera.fov - this.desiredFov) > 0.05) {
      this.camera.fov += (this.desiredFov - this.camera.fov) * this.lerpFactor;
      this.camera.updateProjectionMatrix();
    }
  }

  public setReducedMotion(reduced: boolean): void {
    this.prefersReducedMotion = reduced;
  }
}
