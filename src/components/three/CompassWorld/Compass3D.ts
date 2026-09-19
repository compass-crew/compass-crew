import * as THREE from "three";
import type { CompassTransform, PointerState } from "./types";

export class CompassObject3D {
  public group: THREE.Group;

  // Structural Meshes
  private bezelMesh: THREE.Mesh;
  private gimbalMesh: THREE.Mesh;
  private dialMesh: THREE.Mesh;
  private needleGroup: THREE.Group;
  private northMesh: THREE.Mesh;
  private southMesh: THREE.Mesh;
  private pivotMesh: THREE.Mesh;
  private tickInstanced: THREE.InstancedMesh;
  private needleLight: THREE.PointLight;

  // Materials
  private materials: {
    bezel: THREE.MeshStandardMaterial;
    gimbal: THREE.MeshStandardMaterial;
    dialFace: THREE.MeshStandardMaterial;
    northNeedle: THREE.MeshStandardMaterial;
    southNeedle: THREE.MeshStandardMaterial;
    goldBearing: THREE.MeshStandardMaterial;
    tickMark: THREE.MeshBasicMaterial;
  };

  // Transform Targets
  private targetPosition = new THREE.Vector3(0, 0, 0);
  private targetRotation = new THREE.Euler(0.15, 0, 0);
  private targetScale = new THREE.Vector3(1, 1, 1);
  private targetNeedleAngle = 0;
  private currentNeedleAngle = 0;
  private needleSweepSpeed = 0.35;
  private ringExpansion = 1.0;
  private targetRingExpansion = 1.0;
  private glowIntensity = 1.0;
  private targetGlowIntensity = 1.0;

  private lerpFactor = 0.065;
  private prefersReducedMotion = false;
  private _scratchScale = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();

    if (typeof window !== "undefined") {
      this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // 1. Initialize Materials (Obsidian, Graphite, Ultraviolet, Warm Ivory)
    this.materials = {
      bezel: new THREE.MeshStandardMaterial({
        color: 0x18181f,
        roughness: 0.55,
        metalness: 0.85,
      }),
      gimbal: new THREE.MeshStandardMaterial({
        color: 0x22222a,
        roughness: 0.4,
        metalness: 0.7,
      }),
      dialFace: new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.85,
        metalness: 0.2,
      }),
      northNeedle: new THREE.MeshStandardMaterial({
        color: 0x7c5cff,
        emissive: 0x7c5cff,
        emissiveIntensity: 1.25,
        roughness: 0.2,
        metalness: 0.5,
      }),
      southNeedle: new THREE.MeshStandardMaterial({
        color: 0x483a75,
        emissive: 0x483a75,
        emissiveIntensity: 0.65,
        roughness: 0.35,
        metalness: 0.4,
      }),
      goldBearing: new THREE.MeshStandardMaterial({
        color: 0xd6a74a,
        roughness: 0.35,
        metalness: 0.85,
      }),
      tickMark: new THREE.MeshBasicMaterial({
        color: 0xf5f2ea,
      }),
    };

    // 2. Build Outer Milled Bezel
    const bezelGeo = new THREE.TorusGeometry(2.4, 0.18, 24, 64);
    this.bezelMesh = new THREE.Mesh(bezelGeo, this.materials.bezel);
    this.group.add(this.bezelMesh);

    // 3. Build Inner Gyroscopic Gimbal Ring
    const gimbalGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 48);
    this.gimbalMesh = new THREE.Mesh(gimbalGeo, this.materials.gimbal);
    this.group.add(this.gimbalMesh);

    // 4. Build Dial Face Backing
    const dialGeo = new THREE.CircleGeometry(2.0, 48);
    this.dialMesh = new THREE.Mesh(dialGeo, this.materials.dialFace);
    this.dialMesh.position.z = -0.05;
    this.group.add(this.dialMesh);

    // 5. Build Instanced Tick Marks (Single Draw Call)
    const tickCount = 24;
    const tickGeo = new THREE.BoxGeometry(0.025, 0.18, 0.02);
    this.tickInstanced = new THREE.InstancedMesh(tickGeo, this.materials.tickMark, tickCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < tickCount; i++) {
      const angle = (i * Math.PI * 2) / tickCount;
      const radius = 1.85;
      dummy.position.set(Math.sin(angle) * radius, Math.cos(angle) * radius, 0.01);
      dummy.rotation.z = -angle;
      dummy.scale.set(i % 6 === 0 ? 1.8 : 1.0, i % 6 === 0 ? 1.5 : 1.0, 1.0);
      dummy.updateMatrix();
      this.tickInstanced.setMatrixAt(i, dummy.matrix);
    }
    this.tickInstanced.instanceMatrix.needsUpdate = true;
    this.group.add(this.tickInstanced);

    // 6. Build Magnetic Needle Assembly
    this.needleGroup = new THREE.Group();
    this.group.add(this.needleGroup);

    const needleExtrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    // North Needle Blade (Electric Cyan)
    const northShape = new THREE.Shape();
    northShape.moveTo(0, 1.7);
    northShape.lineTo(0.24, 0);
    northShape.lineTo(0, -0.15);
    northShape.lineTo(-0.24, 0);
    northShape.closePath();

    const northGeo = new THREE.ExtrudeGeometry(northShape, needleExtrudeSettings);
    this.northMesh = new THREE.Mesh(northGeo, this.materials.northNeedle);
    this.northMesh.position.z = 0.02;
    this.needleGroup.add(this.northMesh);

    // South Needle Tail (Brand Violet)
    const southShape = new THREE.Shape();
    southShape.moveTo(0, -1.7);
    southShape.lineTo(0.22, 0);
    southShape.lineTo(0, 0.15);
    southShape.lineTo(-0.22, 0);
    southShape.closePath();

    const southGeo = new THREE.ExtrudeGeometry(southShape, needleExtrudeSettings);
    this.southMesh = new THREE.Mesh(southGeo, this.materials.southNeedle);
    this.southMesh.position.z = 0.02;
    this.needleGroup.add(this.southMesh);

    // Central Gold Bearing Pivot
    const pivotGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.18, 24);
    pivotGeo.rotateX(Math.PI / 2);
    this.pivotMesh = new THREE.Mesh(pivotGeo, this.materials.goldBearing);
    this.pivotMesh.position.z = 0.08;
    this.needleGroup.add(this.pivotMesh);

    // Needle Tip Point Light (Ultraviolet)
    this.needleLight = new THREE.PointLight(0x7c5cff, 1.5, 4.0);
    this.needleLight.position.set(0, 1.3, 0.35);
    this.needleGroup.add(this.needleLight);
  }

  public setTransform(transform: CompassTransform, immediate = false): void {
    this.targetPosition.set(...transform.position);
    this.targetRotation.set(...transform.rotation);
    this.targetScale.set(...transform.scale);
    this.targetNeedleAngle = (transform.needleBearing * Math.PI) / 180;
    this.needleSweepSpeed = transform.needleSweepSpeed;
    this.targetRingExpansion = transform.ringExpansion;
    this.targetGlowIntensity = transform.glowIntensity;

    if (immediate || this.prefersReducedMotion) {
      this.group.position.copy(this.targetPosition);
      this.group.rotation.copy(this.targetRotation);
      this.group.scale.copy(this.targetScale);
      this.currentNeedleAngle = this.targetNeedleAngle;
      this.needleGroup.rotation.z = this.currentNeedleAngle;
      this.ringExpansion = this.targetRingExpansion;
      this.glowIntensity = this.targetGlowIntensity;
    }
  }

  public update(elapsedTime: number, pointer?: PointerState): void {
    if (this.prefersReducedMotion) {
      this.group.position.copy(this.targetPosition);
      this.group.scale.copy(this.targetScale);
      this.needleGroup.rotation.z = this.targetNeedleAngle;
      return;
    }

    // 1. Initial Emergence Easing (first 2.2s)
    const emergence = Math.min(elapsedTime / 2.0, 1.0);
    const easeEmergence = 1 - Math.pow(1 - emergence, 3);
    const initialTilt = (1 - easeEmergence) * 0.35;

    // 2. Pointer Parallax Torque (subtle ±4° = ~0.07 rad)
    let pointerRotX = 0;
    let pointerRotY = 0;

    if (pointer && !pointer.isTouch) {
      pointerRotX = -pointer.smoothedY * 0.08;
      pointerRotY = pointer.smoothedX * 0.08;
    }

    // 3. Position & Scale Lerping (with emergence scale)
    this._scratchScale.copy(this.targetScale).multiplyScalar(0.75 + 0.25 * easeEmergence);
    this.group.position.lerp(this.targetPosition, this.lerpFactor);
    this.group.scale.lerp(this._scratchScale, this.lerpFactor);

    // 4. Rotation Lerping with Pointer Offset & Initial Emergence
    this.group.rotation.x +=
      (this.targetRotation.x + pointerRotX + initialTilt - this.group.rotation.x) * this.lerpFactor;
    this.group.rotation.y +=
      (this.targetRotation.y + pointerRotY - this.group.rotation.y) * this.lerpFactor;
    this.group.rotation.z += (this.targetRotation.z - this.group.rotation.z) * this.lerpFactor;

    // 4. Ring Radial Expansion Animation
    this.ringExpansion += (this.targetRingExpansion - this.ringExpansion) * this.lerpFactor;
    this.bezelMesh.scale.set(this.ringExpansion, this.ringExpansion, 1.0);
    this.gimbalMesh.scale.set(this.ringExpansion * 0.95, this.ringExpansion * 0.95, 1.0);

    // 5. Gimbal Gyroscopic Opening Motion & Dial Depth Shift
    const separation = Math.max(0, this.ringExpansion - 1.0);
    this.gimbalMesh.rotation.x = Math.sin(elapsedTime * 0.5) * 0.06 + separation * 0.65;
    this.gimbalMesh.rotation.y = Math.cos(elapsedTime * 0.4) * 0.06 + separation * 0.45;
    this.dialMesh.position.z = -0.05 - separation * 0.35;

    // 6. Needle Bearing & Sweep Dynamics
    if (this.needleSweepSpeed > 1.0) {
      // Rapid searching radar sweep
      this.currentNeedleAngle =
        Math.sin(elapsedTime * this.needleSweepSpeed) * 0.85 + this.targetNeedleAngle;
    } else {
      // Standard calibrated target with subtle idle breathing
      const idleWobble = Math.sin(elapsedTime * 1.2) * 0.025;
      this.currentNeedleAngle +=
        (this.targetNeedleAngle + idleWobble - this.currentNeedleAngle) * this.lerpFactor;
    }
    this.needleGroup.rotation.z = this.currentNeedleAngle;

    // 7. Glow Intensity
    this.glowIntensity += (this.targetGlowIntensity - this.glowIntensity) * this.lerpFactor;
    this.materials.northNeedle.emissiveIntensity = 1.25 * this.glowIntensity;
    this.needleLight.intensity = 1.5 * this.glowIntensity;
  }

  public setReducedMotion(reduced: boolean): void {
    this.prefersReducedMotion = reduced;
  }

  public dispose(): void {
    this.bezelMesh.geometry.dispose();
    this.gimbalMesh.geometry.dispose();
    this.dialMesh.geometry.dispose();
    this.northMesh.geometry.dispose();
    this.southMesh.geometry.dispose();
    this.pivotMesh.geometry.dispose();
    this.tickInstanced.geometry.dispose();

    Object.values(this.materials).forEach((m) => m.dispose());
  }
}
