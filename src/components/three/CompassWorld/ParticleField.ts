import * as THREE from "three";
import type { ParticleConfig, PointerState } from "./types";

interface ParticleData {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  speed: number;
  phase: number;
  scale: number;
}

export class ParticleField {
  public mesh: THREE.InstancedMesh;

  private maxCount = 2500;
  private activeCount = 1500;
  private particles: ParticleData[] = [];
  private dummy = new THREE.Object3D();
  private geometry: THREE.SphereGeometry;
  private material: THREE.MeshBasicMaterial;

  private currentSpeed = 0.2;
  private currentSpread: [number, number, number] = [14, 10, 8];
  private currentFlow: [number, number, number] = [0, 0.05, 0];
  private currentOpacity = 0.55;

  private targetSpeed = 0.2;
  private targetFlow: [number, number, number] = [0, 0.05, 0];
  private targetOpacity = 0.55;

  private lerpFactor = 0.05;

  constructor(maxCount = 2500) {
    this.maxCount = maxCount;
    this.activeCount = 1500;

    // Small, delicate low-poly sphere geometry for subtle ambient digital dust
    this.geometry = new THREE.SphereGeometry(0.018, 6, 6);

    this.material = new THREE.MeshBasicMaterial({
      color: 0x9d8cff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.maxCount);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.initParticles();
  }

  private initParticles(): void {
    this.particles = [];

    for (let i = 0; i < this.maxCount; i++) {
      const x = (Math.random() - 0.5) * this.currentSpread[0];
      const y = (Math.random() - 0.5) * this.currentSpread[1];
      const z = (Math.random() - 0.5) * this.currentSpread[2];

      this.particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        speed: 0.5 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2,
        scale: 0.4 + Math.random() * 0.8,
      });

      this.dummy.position.set(x, y, z);
      this.dummy.scale.setScalar(1);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  public setConfig(config: ParticleConfig, multiplier = 1.0): void {
    this.activeCount = Math.min(this.maxCount, Math.round(config.count * multiplier));
    this.targetSpeed = config.speed;
    this.targetFlow = config.flowDirection;
    this.targetOpacity = config.opacity;
    this.currentSpread = config.spread;
  }

  public update(elapsedTime: number, pointer?: PointerState): void {
    // Lerp dynamic parameters
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * this.lerpFactor;
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * this.lerpFactor;
    this.material.opacity = this.currentOpacity;

    const [spreadX, spreadY, spreadZ] = this.currentSpread;
    const halfX = spreadX / 2;
    const halfY = spreadY / 2;
    const halfZ = spreadZ / 2;

    const pointerInfluenceX = pointer && !pointer.isTouch ? pointer.smoothedX * 0.8 : 0;
    const pointerInfluenceY = pointer && !pointer.isTouch ? pointer.smoothedY * 0.8 : 0;

    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      if (!p) continue;

      // Update positions with flow and gentle sinusoidal drift
      p.x += (this.targetFlow[0] * this.currentSpeed + Math.sin(elapsedTime * 0.5 + p.phase) * 0.01);
      p.y += (this.targetFlow[1] * this.currentSpeed + Math.cos(elapsedTime * 0.4 + p.phase) * 0.01);
      p.z += (this.targetFlow[2] * this.currentSpeed);

      // Wrap boundaries
      if (p.x > halfX) p.x -= spreadX;
      if (p.x < -halfX) p.x += spreadX;
      if (p.y > halfY) p.y -= spreadY;
      if (p.y < -halfY) p.y += spreadY;
      if (p.z > halfZ) p.z -= spreadZ;
      if (p.z < -halfZ) p.z += spreadZ;

      // Subtle breathing scale
      const currentScale = p.scale * (0.8 + Math.sin(elapsedTime * 1.5 + p.phase) * 0.25);

      this.dummy.position.set(
        p.x + pointerInfluenceX * (0.3 + p.scale * 0.2),
        p.y + pointerInfluenceY * (0.3 + p.scale * 0.2),
        p.z
      );
      this.dummy.scale.setScalar(currentScale);
      this.dummy.updateMatrix();

      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    // Hide inactive instances
    for (let i = this.activeCount; i < this.maxCount; i++) {
      this.dummy.position.set(0, -999, 0);
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.mesh.instanceMatrix.needsUpdate = true;
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    this.mesh.dispose();
  }
}
