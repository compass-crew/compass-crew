import * as THREE from "three";
import type { LightingConfig, PointerState } from "./types";

export class LightingRig {
  public group: THREE.Group;

  private keyLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private ambientLight: THREE.AmbientLight;
  private warmLight: THREE.PointLight;

  private targetKeyColor = new THREE.Color(0x7c5cff);
  private targetRimColor = new THREE.Color(0xb36bff);
  private targetAmbientColor = new THREE.Color(0x111116);
  private targetWarmColor = new THREE.Color(0xff7a6b);

  private targetKeyIntensity = 2.2;
  private targetRimIntensity = 1.8;
  private targetAmbientIntensity = 1.2;
  private targetWarmIntensity = 0;

  private lerpFactor = 0.08;

  constructor() {
    this.group = new THREE.Group();

    // 1. Key Light (Ultraviolet core)
    this.keyLight = new THREE.DirectionalLight(0x7c5cff, 2.2);
    this.keyLight.position.set(4.5, 5.0, 6.0);
    this.group.add(this.keyLight);

    // 2. Rim Light (Soft Violet edge)
    this.rimLight = new THREE.DirectionalLight(0xb36bff, 1.8);
    this.rimLight.position.set(-5.0, -4.0, 4.0);
    this.group.add(this.rimLight);

    // 3. Ambient Fill (Graphite subtle void)
    this.ambientLight = new THREE.AmbientLight(0x111116, 1.2);
    this.group.add(this.ambientLight);

    // 4. Warm Point Light (Restrained Coral highlight)
    this.warmLight = new THREE.PointLight(0xff7a6b, 0, 8);
    this.warmLight.position.set(0, 0, 2.0);
    this.group.add(this.warmLight);
  }

  public setConfig(config: LightingConfig, immediate = false): void {
    this.targetKeyColor.setHex(config.keyColor);
    this.targetKeyIntensity = config.keyIntensity;

    this.targetRimColor.setHex(config.rimColor);
    this.targetRimIntensity = config.rimIntensity;

    this.targetAmbientColor.setHex(config.ambientColor);
    this.targetAmbientIntensity = config.ambientIntensity;

    if (config.warmColor !== undefined && config.warmIntensity !== undefined) {
      this.targetWarmColor.setHex(config.warmColor);
      this.targetWarmIntensity = config.warmIntensity;
    } else {
      this.targetWarmIntensity = 0;
    }

    if (immediate) {
      this.keyLight.color.copy(this.targetKeyColor);
      this.keyLight.intensity = this.targetKeyIntensity;

      this.rimLight.color.copy(this.targetRimColor);
      this.rimLight.intensity = this.targetRimIntensity;

      this.ambientLight.color.copy(this.targetAmbientColor);
      this.ambientLight.intensity = this.targetAmbientIntensity;

      this.warmLight.color.copy(this.targetWarmColor);
      this.warmLight.intensity = this.targetWarmIntensity;
    }
  }

  public update(pointer?: PointerState): void {
    // Smoothly lerp light intensities and colors
    this.keyLight.color.lerp(this.targetKeyColor, this.lerpFactor);
    this.keyLight.intensity +=
      (this.targetKeyIntensity - this.keyLight.intensity) * this.lerpFactor;

    this.rimLight.color.lerp(this.targetRimColor, this.lerpFactor);
    this.rimLight.intensity +=
      (this.targetRimIntensity - this.rimLight.intensity) * this.lerpFactor;

    this.ambientLight.color.lerp(this.targetAmbientColor, this.lerpFactor);
    this.ambientLight.intensity +=
      (this.targetAmbientIntensity - this.ambientLight.intensity) * this.lerpFactor;

    this.warmLight.color.lerp(this.targetWarmColor, this.lerpFactor);
    this.warmLight.intensity +=
      (this.targetWarmIntensity - this.warmLight.intensity) * this.lerpFactor;

    // Pointer-driven subtle light movement
    if (pointer && !pointer.isTouch) {
      this.keyLight.position.x = 4.5 + pointer.smoothedX * 1.5;
      this.keyLight.position.y = 5.0 + pointer.smoothedY * 1.5;
    }
  }

  public dispose(): void {
    this.keyLight.dispose?.();
    this.rimLight.dispose?.();
    this.warmLight.dispose?.();
  }
}
