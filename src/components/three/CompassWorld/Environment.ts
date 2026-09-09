import * as THREE from "three";
import type { EnvironmentConfig } from "./types";

export class Environment {
  public group: THREE.Group;
  public fog: THREE.Fog;

  private bgPlane: THREE.Mesh;
  private bgMaterial: THREE.ShaderMaterial;
  private bgGeometry: THREE.PlaneGeometry;

  private targetFogNear = 8;
  private targetFogFar = 30;
  private targetFogColor = new THREE.Color(0x09090b);
  private lerpFactor = 0.05;

  constructor() {
    this.group = new THREE.Group();

    // 1. Scene Fog (Obsidian atmospheric void)
    this.fog = new THREE.Fog(0x09090b, 8, 30);

    // 2. Atmospheric Depth Gradient Backdrop Plane
    this.bgGeometry = new THREE.PlaneGeometry(60, 45);

    this.bgMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColorVoid: { value: new THREE.Color(0x09090b) },
        uColorGraphite: { value: new THREE.Color(0x111116) },
        uColorViolet: { value: new THREE.Color(0x1a1233) },
        uTime: { value: 0 },
        uOpacity: { value: 0.5 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorVoid;
        uniform vec3 uColorGraphite;
        uniform vec3 uColorViolet;
        uniform float uTime;
        uniform float uOpacity;
        varying vec2 vUv;

        void main() {
          // Subtle radial gradient from center
          vec2 center = vec2(0.5, 0.45);
          float dist = distance(vUv, center);

          vec3 col = mix(uColorGraphite, uColorVoid, smoothstep(0.1, 0.85, dist));
          // Very faint ultraviolet ambient haze in upper quadrant
          float violetHaze = smoothstep(0.7, 0.0, distance(vUv, vec2(0.5, 0.65))) * 0.18;
          col = mix(col, uColorViolet, violetHaze);

          gl_FragColor = vec4(col, uOpacity);
        }
      `,
      depthWrite: false,
      depthTest: true,
      transparent: true,
    });

    this.bgPlane = new THREE.Mesh(this.bgGeometry, this.bgMaterial);
    this.bgPlane.position.set(0, 0, -15);
    this.group.add(this.bgPlane);
  }

  public setConfig(config: EnvironmentConfig, immediate = false): void {
    this.targetFogColor.setHex(config.fogColor);
    this.targetFogNear = config.fogNear;
    this.targetFogFar = config.fogFar;

    if (this.bgMaterial.uniforms.uOpacity) {
      this.bgMaterial.uniforms.uOpacity.value = config.bgGradientOpacity;
    }

    if (immediate) {
      this.fog.color.copy(this.targetFogColor);
      this.fog.near = this.targetFogNear;
      this.fog.far = this.targetFogFar;
    }
  }

  public update(elapsedTime: number): void {
    this.fog.near += (this.targetFogNear - this.fog.near) * this.lerpFactor;
    this.fog.far += (this.targetFogFar - this.fog.far) * this.lerpFactor;
    this.fog.color.lerp(this.targetFogColor, this.lerpFactor);

    if (this.bgMaterial.uniforms.uTime) {
      this.bgMaterial.uniforms.uTime.value = elapsedTime;
    }
  }

  public dispose(): void {
    this.bgGeometry.dispose();
    this.bgMaterial.dispose();
  }
}
