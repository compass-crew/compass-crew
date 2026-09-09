import * as THREE from "three";
import type { PointerState } from "./types";

interface ChallengeRingConfig {
  id: string;
  name: string;
  radius: number;
  tube: number;
  color: number;
  rotationSpeed: number;
  tilt: [number, number, number];
}

interface ProjectModuleConfig {
  id: string;
  name: string;
  initialOffset: THREE.Vector3; // Position coming from Connect team cluster
  lockedOffset: THREE.Vector3;  // Interlocking position in solved lattice
  color: number;
  size: number;
}

/**
 * CompeteArenaCore
 *
 * Implements the 3D Hackathon Arena & Challenge Core for Compass Crew:
 * - Sophisticated technological challenge frame (not an esports gaming arena)
 * - Concentric Challenge Rings representing problem domains:
 *   - Autonomous Systems & Agents (Cyan)
 *   - Open Systems & Infrastructure (Sky Blue)
 *   - Applied Research & Evals (Indigo)
 * - Modular Project Core that reorganizes under active challenge constraints
 * - Interlocking submission-ready crystal lattice
 * - Controlled system energy pulse confirming SUBMISSION READY
 * - Outgoing directional vector pointing toward SHIP
 */
export class CompeteArenaCore {
  public group: THREE.Group;

  // 1. Arena Perimeter & Boundary Frame
  private arenaBoundary: THREE.Mesh;
  private arenaBoundaryMaterial: THREE.MeshStandardMaterial;
  private perimeterTicks: THREE.LineSegments;

  // 2. Concentric Challenge Rings
  private ringsGroup: THREE.Group;
  private challengeRings: THREE.Mesh[] = [];
  private ringMaterials: THREE.MeshStandardMaterial[] = [];
  private ringConfigs: ChallengeRingConfig[] = [
    {
      id: "autonomous",
      name: "AUTONOMOUS SYSTEMS",
      radius: 1.85,
      tube: 0.016,
      color: 0x7c5cff, // Ultraviolet
      rotationSpeed: 0.22,
      tilt: [Math.PI * 0.2, 0, Math.PI * 0.05],
    },
    {
      id: "infrastructure",
      name: "OPEN SYSTEMS",
      radius: 1.4,
      tube: 0.014,
      color: 0x9061f9, // Bright Violet
      rotationSpeed: -0.28,
      tilt: [Math.PI * 0.35, Math.PI * 0.15, 0],
    },
    {
      id: "research",
      name: "APPLIED RESEARCH",
      radius: 0.98,
      tube: 0.012,
      color: 0xb36bff, // Soft Violet
      rotationSpeed: 0.35,
      tilt: [-Math.PI * 0.25, Math.PI * 0.1, Math.PI * 0.2],
    },
  ];

  // 3. Modular Project Core (Transforms from Connect team cluster)
  private modulesGroup: THREE.Group;
  private moduleMeshes: THREE.Mesh[] = [];
  private moduleHalos: THREE.Mesh[] = [];
  private moduleMaterials: THREE.MeshBasicMaterial[] = [];
  private haloMaterials: THREE.MeshBasicMaterial[] = [];
  private moduleConfigs: ProjectModuleConfig[] = [
    {
      id: "logic",
      name: "SYSTEM LOGIC",
      initialOffset: new THREE.Vector3(0.5, 0.7, 0.3),
      lockedOffset: new THREE.Vector3(0.32, 0.32, 0.1),
      color: 0x7c5cff, // Ultraviolet
      size: 0.09,
    },
    {
      id: "interface",
      name: "INTERFACE & UX",
      initialOffset: new THREE.Vector3(0.2, 0.35, 0.2),
      lockedOffset: new THREE.Vector3(-0.32, 0.32, 0.1),
      color: 0xb36bff, // Soft Violet
      size: 0.085,
    },
    {
      id: "agent",
      name: "AGENT CORE",
      initialOffset: new THREE.Vector3(0.9, 0.1, 0.25),
      lockedOffset: new THREE.Vector3(0.32, -0.32, 0.1),
      color: 0x9061f9, // Bright Violet
      size: 0.09,
    },
    {
      id: "eval",
      name: "EVAL & BENCHMARK",
      initialOffset: new THREE.Vector3(0.65, -0.25, 0.15),
      lockedOffset: new THREE.Vector3(-0.32, -0.32, 0.1),
      color: 0x7c5cff, // Ultraviolet
      size: 0.085,
    },
  ];

  // 4. Central Solution Lattice Crystal
  private centralCrystal: THREE.Mesh;
  private crystalMaterial: THREE.MeshBasicMaterial;
  private latticeFilaments: THREE.LineSegments;
  private filamentMaterial: THREE.LineBasicMaterial;

  // 5. Submission Energy Pulse & Confirmation Ring
  private submissionPulseRing: THREE.Mesh;
  private submissionPulseMaterial: THREE.MeshBasicMaterial;

  // 6. Outgoing Vector toward SHIP
  private outgoingVector: THREE.Line;
  private outgoingMaterial: THREE.LineBasicMaterial;

  // State
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;
  private hoveredRingIndex: number | null = null;
  private _scratchCurPos = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.1, -0.2);

    // 1. Arena Outer Boundary (Graphite + Ultraviolet)
    const boundaryGeo = new THREE.TorusGeometry(2.35, 0.015, 16, 64);
    this.arenaBoundaryMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181f,
      emissive: 0x7c5cff,
      emissiveIntensity: 0.4,
      metalness: 0.85,
      roughness: 0.2,
      transparent: true,
      opacity: 0,
    });
    this.arenaBoundary = new THREE.Mesh(boundaryGeo, this.arenaBoundaryMaterial);
    this.arenaBoundary.rotation.x = Math.PI * 0.45;
    this.group.add(this.arenaBoundary);

    // Perimeter Tick Marks (Ultraviolet)
    const tickPoints: THREE.Vector3[] = [];
    const tickCount = 32;
    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2;
      const rInner = 2.25;
      const rOuter = 2.45;
      tickPoints.push(
        new THREE.Vector3(Math.cos(angle) * rInner, Math.sin(angle) * rInner * 0.3, 0),
        new THREE.Vector3(Math.cos(angle) * rOuter, Math.sin(angle) * rOuter * 0.3, 0)
      );
    }
    const ticksGeo = new THREE.BufferGeometry().setFromPoints(tickPoints);
    const ticksMat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.perimeterTicks = new THREE.LineSegments(ticksGeo, ticksMat);
    this.group.add(this.perimeterTicks);

    // 2. Concentric Challenge Rings
    this.ringsGroup = new THREE.Group();
    this.group.add(this.ringsGroup);
    this.initChallengeRings();

    // 3. Project Core Modules
    this.modulesGroup = new THREE.Group();
    this.group.add(this.modulesGroup);
    this.initProjectModules();

    // 4. Central Solution Lattice Crystal (Ultraviolet)
    const crystalGeo = new THREE.OctahedronGeometry(0.22, 0);
    this.crystalMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.centralCrystal = new THREE.Mesh(crystalGeo, this.crystalMaterial);
    this.group.add(this.centralCrystal);

    // Interlocking Lattice Filaments (Ultraviolet)
    const filamentPoints: THREE.Vector3[] = [
      new THREE.Vector3(0.32, 0.32, 0.1),
      new THREE.Vector3(-0.32, 0.32, 0.1),

      new THREE.Vector3(-0.32, 0.32, 0.1),
      new THREE.Vector3(-0.32, -0.32, 0.1),

      new THREE.Vector3(-0.32, -0.32, 0.1),
      new THREE.Vector3(0.32, -0.32, 0.1),

      new THREE.Vector3(0.32, -0.32, 0.1),
      new THREE.Vector3(0.32, 0.32, 0.1),

      // Diagonal cross supports
      new THREE.Vector3(0.32, 0.32, 0.1),
      new THREE.Vector3(0, 0, 0),

      new THREE.Vector3(-0.32, 0.32, 0.1),
      new THREE.Vector3(0, 0, 0),

      new THREE.Vector3(-0.32, -0.32, 0.1),
      new THREE.Vector3(0, 0, 0),

      new THREE.Vector3(0.32, -0.32, 0.1),
      new THREE.Vector3(0, 0, 0),
    ];
    const filamentGeo = new THREE.BufferGeometry().setFromPoints(filamentPoints);
    this.filamentMaterial = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.latticeFilaments = new THREE.LineSegments(filamentGeo, this.filamentMaterial);
    this.group.add(this.latticeFilaments);

    // 5. Submission Confirmation Pulse Ring (Coral pulse)
    const pulseRingGeo = new THREE.RingGeometry(0.4, 0.44, 32);
    this.submissionPulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7a6b,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.submissionPulseRing = new THREE.Mesh(pulseRingGeo, this.submissionPulseMaterial);
    this.submissionPulseRing.rotation.x = Math.PI * 0.45;
    this.group.add(this.submissionPulseRing);

    // 6. Outgoing Vector toward SHIP (Mint)
    const outgoingGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -2.2, -1.2),
    ]);
    this.outgoingMaterial = new THREE.LineBasicMaterial({
      color: 0x7dd3a8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.outgoingVector = new THREE.Line(outgoingGeo, this.outgoingMaterial);
    this.group.add(this.outgoingVector);
  }

  /**
   * Initializes concentric challenge domain rings
   */
  private initChallengeRings(): void {
    this.ringConfigs.forEach((cfg) => {
      const ringGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 64);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x18181f,
        emissive: cfg.color,
        emissiveIntensity: 0.45,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0,
      });
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.rotation.set(...cfg.tilt);
      this.challengeRings.push(mesh);
      this.ringMaterials.push(ringMat);
      this.ringsGroup.add(mesh);
    });
  }

  /**
   * Initializes project build modules
   */
  private initProjectModules(): void {
    const modGeo = new THREE.BoxGeometry(1, 1, 1);
    const haloGeo = new THREE.RingGeometry(1.2, 1.45, 16);

    this.moduleConfigs.forEach((cfg) => {
      // Inner modular block
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(modGeo, mat);
      mesh.scale.setScalar(cfg.size);
      this.moduleMeshes.push(mesh);
      this.moduleMaterials.push(mat);
      this.modulesGroup.add(mesh);

      // Modular aura ring
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.scale.setScalar(cfg.size * 1.5);
      this.moduleHalos.push(halo);
      this.haloMaterials.push(haloMat);
      this.modulesGroup.add(halo);
    });
  }

  /**
   * Updates normalized scene progress (0.00 to 1.00)
   */
  public setProgress(progress: number): void {
    this.targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  /**
   * Sets hovered challenge ring index
   */
  public setHoveredRing(index: number | null): void {
    this.hoveredRingIndex = index;
  }

  /**
   * Frame update loop
   */
  public update(elapsedTime: number, pointer?: PointerState, isMobile = false): void {
    if (this.currentProgress <= 0.01 && this.targetProgress <= 0.01) {
      if (this.group.visible) this.group.visible = false;
      return;
    }

    this.currentProgress = THREE.MathUtils.lerp(
      this.currentProgress,
      this.targetProgress,
      this.lerpFactor
    );

    // Hide if out of scene
    if (this.currentProgress <= 0.01) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Subtle pointer parallax
    if (pointer && !isMobile) {
      const targetRotY = pointer.smoothedX * 0.1;
      const targetRotX = -pointer.smoothedY * 0.06;
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotY, 0.06);
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, targetRotX, 0.06);
    }

    const scaleMult = isMobile ? 0.75 : 1.0;

    // =========================================================================
    // STAGE 1: ARENA BOUNDARY & TICKS EMERGENCE (0.00 -> 0.35)
    // =========================================================================
    const arenaEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.04, 0.35);
    this.arenaBoundaryMaterial.opacity = arenaEmergence * 0.75;
    (this.perimeterTicks.material as THREE.LineBasicMaterial).opacity = arenaEmergence * 0.45;
    this.arenaBoundary.scale.setScalar(scaleMult * arenaEmergence);
    this.perimeterTicks.scale.setScalar(scaleMult * arenaEmergence);
    this.perimeterTicks.rotation.z = elapsedTime * 0.05;

    // =========================================================================
    // STAGE 2: CHALLENGE RINGS ROTATION & DOMAIN ACTIVATION (0.20 -> 0.60)
    // =========================================================================
    const ringsEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.18, 0.55);

    this.challengeRings.forEach((ring, i) => {
      const cfg = this.ringConfigs[i];
      const mat = this.ringMaterials[i];
      if (!ring || !cfg || !mat) return;

      const isHovered = this.hoveredRingIndex === i;
      const hoverScale = isHovered ? 1.03 : 1.0;

      ring.scale.setScalar(scaleMult * ringsEmergence * hoverScale);
      ring.rotation.z = cfg.tilt[2] + elapsedTime * cfg.rotationSpeed;
      ring.rotation.x = cfg.tilt[0] + Math.sin(elapsedTime * 0.5 + i) * 0.08;

      mat.opacity = ringsEmergence * (isHovered ? 0.95 : 0.65);
      mat.emissiveIntensity = 0.45 + (isHovered ? 0.35 : 0);
    });

    // =========================================================================
    // STAGE 3: PROJECT MODULES REORGANIZATION INTO LATTICE (0.35 -> 0.75)
    // =========================================================================
    const modularReorg = THREE.MathUtils.smoothstep(this.currentProgress, 0.35, 0.72);
    const modAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.12, 0.45);

    this.moduleConfigs.forEach((cfg, i) => {
      const mesh = this.moduleMeshes[i];
      const halo = this.moduleHalos[i];
      if (!mesh || !halo) return;

      // Migrate from initial Connect offset to locked build lattice with zero allocations
      this._scratchCurPos.lerpVectors(
        cfg.initialOffset,
        cfg.lockedOffset,
        modularReorg
      ).multiplyScalar(scaleMult);

      // Micro float
      const floatY = Math.sin(elapsedTime * 1.4 + i * 1.1) * 0.015;
      mesh.position.set(this._scratchCurPos.x, this._scratchCurPos.y + floatY, this._scratchCurPos.z);
      halo.position.copy(mesh.position);

      mesh.rotation.x = elapsedTime * 0.6 + i;
      mesh.rotation.y = elapsedTime * 0.4 + i;
      halo.rotation.z = elapsedTime * 0.3 + i;

      this.moduleMaterials[i].opacity = modAlpha * 0.9;
      this.haloMaterials[i].opacity = modAlpha * 0.4;
    });

    // =========================================================================
    // STAGE 4: CENTRAL CRYSTAL & INTERLOCKING FILAMENTS (0.50 -> 0.85)
    // =========================================================================
    const crystalAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.48, 0.75);
    this.crystalMaterial.opacity = crystalAlpha * 0.9;
    this.filamentMaterial.opacity = crystalAlpha * modularReorg * 0.75;

    const crystalPulse = 1 + Math.sin(elapsedTime * 2.5) * 0.12;
    this.centralCrystal.scale.setScalar(scaleMult * crystalAlpha * crystalPulse);
    this.centralCrystal.rotation.y = elapsedTime * 0.75;
    this.centralCrystal.rotation.z = elapsedTime * 0.5;

    this.latticeFilaments.scale.setScalar(scaleMult);

    // =========================================================================
    // STAGE 5: SUBMISSION ENERGY PULSE & STABILIZATION (0.75 -> 0.95)
    // =========================================================================
    const submissionState = THREE.MathUtils.smoothstep(this.currentProgress, 0.74, 0.90);
    const pulseSpeed = 1.8;
    const pulseT = (elapsedTime * pulseSpeed) % 1.0;
    const pulseExpansion = 1 + pulseT * 3.5;
    const pulseFade = (1 - pulseT) * submissionState;

    this.submissionPulseRing.scale.setScalar(scaleMult * pulseExpansion);
    this.submissionPulseMaterial.opacity = pulseFade * 0.7;

    // =========================================================================
    // STAGE 6: OUTGOING TRAJECTORY TOWARD SHIP (0.88 -> 1.00)
    // =========================================================================
    const outgoingAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.88, 0.98);
    this.outgoingMaterial.opacity = outgoingAlpha * 0.8;
  }

  /**
   * Clean resource disposal
   */
  public dispose(): void {
    this.arenaBoundary.geometry.dispose();
    this.arenaBoundaryMaterial.dispose();
    this.perimeterTicks.geometry.dispose();
    (this.perimeterTicks.material as THREE.Material).dispose();

    this.challengeRings.forEach((r) => r.geometry.dispose());
    this.ringMaterials.forEach((m) => m.dispose());

    this.moduleMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.moduleHalos.forEach((h) => {
      h.geometry.dispose();
      (h.material as THREE.Material).dispose();
    });

    this.centralCrystal.geometry.dispose();
    this.crystalMaterial.dispose();

    this.latticeFilaments.geometry.dispose();
    this.filamentMaterial.dispose();

    this.submissionPulseRing.geometry.dispose();
    this.submissionPulseMaterial.dispose();

    this.outgoingVector.geometry.dispose();
    this.outgoingMaterial.dispose();
  }
}
