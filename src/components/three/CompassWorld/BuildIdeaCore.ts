import * as THREE from "three";
import type { PointerState } from "./types";

interface ModuleConfig {
  id: string;
  name: string;
  targetOffset: THREE.Vector3;
  color: number;
  size: [number, number, number];
}

/**
 * BuildIdeaCore
 *
 * Implements the 3D physical transformation for the BUILD scene:
 * 1. IDEA: Single abstract central core (translucent dark metallic / glass with inner glowing seed).
 * 2. PROBLEM: Form gains directional constraints.
 * 3. PROTOTYPE: Form separates physically into 4 structured modules.
 * 4. BUILD: Laser connection vectors draw between modules with traveling light pulses.
 * 5. SHIP: Prototype structure stabilizes into a complete modular system.
 */
export class BuildIdeaCore {
  public group: THREE.Group;

  // 1. Central Idea Core Elements
  private coreMesh: THREE.Mesh;
  private coreInnerGlow: THREE.Mesh;
  private coreRing: THREE.Mesh;
  private coreMaterial: THREE.MeshStandardMaterial;
  private coreInnerMaterial: THREE.MeshBasicMaterial;
  private coreRingMaterial: THREE.MeshBasicMaterial;

  // 2. Structured Modules
  private modulesGroup: THREE.Group;
  private moduleMeshes: THREE.Group[] = [];
  private moduleConfigs: ModuleConfig[] = [
    {
      id: "logic",
      name: "LOGIC",
      targetOffset: new THREE.Vector3(-1.3, 0.85, 0.2),
      color: 0x7c5cff, // Ultraviolet
      size: [0.75, 0.5, 0.15],
    },
    {
      id: "interface",
      name: "INTERFACE",
      targetOffset: new THREE.Vector3(1.3, 0.85, 0.2),
      color: 0xff7a6b, // Coral
      size: [0.75, 0.5, 0.15],
    },
    {
      id: "data",
      name: "DATA",
      targetOffset: new THREE.Vector3(-1.3, -0.85, 0.0),
      color: 0x8b5cf6, // Violet
      size: [0.75, 0.5, 0.15],
    },
    {
      id: "infra",
      name: "INFRASTRUCTURE",
      targetOffset: new THREE.Vector3(1.3, -0.85, 0.0),
      color: 0x7c5cff, // Ultraviolet
      size: [0.75, 0.5, 0.15],
    },
  ];

  // 3. Connective Vectors & Traveling Light Pulses
  private linesGroup: THREE.Group;
  private lineMaterials: THREE.LineBasicMaterial[] = [];
  private pulsePoints: THREE.Mesh[] = [];
  private pulseMaterials: THREE.MeshBasicMaterial[] = [];
  private outgoingVector: THREE.Line;

  // Animation & Transition Progress
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;

  // Scratch objects to eliminate per-frame GC allocations
  private _scratchVec1 = new THREE.Vector3();
  private _scratchVec2 = new THREE.Vector3();
  private _origin = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.2, 0);

    // 1. Initialize Central Idea Core (Graphite + Ultraviolet)
    const coreGeo = new THREE.OctahedronGeometry(0.55, 0);
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181f,
      metalness: 0.85,
      roughness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0,
    });
    this.coreMesh = new THREE.Mesh(coreGeo, this.coreMaterial);
    this.group.add(this.coreMesh);

    // Inner Glowing Seed (Ultraviolet)
    const seedGeo = new THREE.SphereGeometry(0.24, 16, 16);
    this.coreInnerMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.coreInnerGlow = new THREE.Mesh(seedGeo, this.coreInnerMaterial);
    this.group.add(this.coreInnerGlow);

    // Outer Ideation Ring (Soft Violet)
    const ringGeo = new THREE.TorusGeometry(0.9, 0.018, 16, 48);
    this.coreRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xb36bff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.coreRing = new THREE.Mesh(ringGeo, this.coreRingMaterial);
    this.coreRing.rotation.x = Math.PI * 0.35;
    this.group.add(this.coreRing);

    // 2. Initialize 4 Structured Modules
    this.modulesGroup = new THREE.Group();
    this.group.add(this.modulesGroup);
    this.initModules();

    // 3. Connection Lines & Pulses
    this.linesGroup = new THREE.Group();
    this.group.add(this.linesGroup);
    this.initConnections();

    // 4. Outgoing Forward Path toward LEARN (Ultraviolet)
    const beamPoints = [
      new THREE.Vector3(0, -1.8, 0.2),
      new THREE.Vector3(0, -4.0, 1.0),
      new THREE.Vector3(0, -7.5, 2.2),
    ];
    const beamCurve = new THREE.CatmullRomCurve3(beamPoints);
    const beamGeo = new THREE.BufferGeometry().setFromPoints(beamCurve.getPoints(24));
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(beamMat);
    this.outgoingVector = new THREE.Line(beamGeo, beamMat);
    this.group.add(this.outgoingVector);
  }

  private initModules(): void {
    this.moduleConfigs.forEach((cfg) => {
      const modGroup = new THREE.Group();

      // Module Box Chassis (Graphite metal)
      const boxGeo = new THREE.BoxGeometry(...cfg.size);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0x111116,
        metalness: 0.9,
        roughness: 0.25,
        transparent: true,
        opacity: 0,
      });
      const boxMesh = new THREE.Mesh(boxGeo, boxMat);
      modGroup.add(boxMesh);

      // Edge Wireframe Outline
      const edgesGeo = new THREE.EdgesGeometry(boxGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      this.lineMaterials.push(edgeMat);
      const edgesLine = new THREE.LineSegments(edgesGeo, edgeMat);
      modGroup.add(edgesLine);

      // Glowing Center Port Node
      const portGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const portMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      this.pulseMaterials.push(portMat);
      const portMesh = new THREE.Mesh(portGeo, portMat);
      modGroup.add(portMesh);

      this.moduleMeshes.push(modGroup);
      this.modulesGroup.add(modGroup);
    });
  }

  private initConnections(): void {
    // Laser line materials (Ultraviolet, Soft Violet & Coral)
    const violetMat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const softVioletMat = new THREE.LineBasicMaterial({
      color: 0xb36bff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const coralMat = new THREE.LineBasicMaterial({
      color: 0xff7a6b,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(violetMat, softVioletMat, coralMat);

    // 1. Spoke lines (Center -> 4 Modules)
    this.moduleConfigs.forEach((cfg, i) => {
      const pts = [new THREE.Vector3(0, 0, 0), cfg.targetOffset.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, i % 2 === 0 ? violetMat : softVioletMat);
      this.linesGroup.add(line);
    });

    // 2. Perimeter lines (Module to Module)
    const perimPairs = [
      [0, 1], // Logic <-> Interface (Coral highlight)
      [1, 3], // Interface <-> Infra
      [3, 2], // Infra <-> Data
      [2, 0], // Data <-> Logic
    ];

    perimPairs.forEach(([fromIdx, toIdx], pairIdx) => {
      const pA = this.moduleConfigs[fromIdx].targetOffset;
      const pB = this.moduleConfigs[toIdx].targetOffset;
      const pts = [pA.clone(), pB.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, pairIdx === 0 ? coralMat : violetMat);
      this.linesGroup.add(line);

      // Add a traveling pulse light point
      const pulseGeo = new THREE.SphereGeometry(0.035, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: pairIdx === 0 ? 0xff7a6b : 0x7c5cff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      this.pulseMaterials.push(pulseMat);
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      this.pulsePoints.push(pulseMesh);
      this.group.add(pulseMesh);
    });
  }

  public setProgress(progress: number): void {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public update(elapsedTime: number, pointer?: PointerState, isMobile: boolean = false): void {
    if (this.currentProgress <= 0.01 && this.targetProgress <= 0.01) {
      if (this.group.visible) this.group.visible = false;
      return;
    }

    this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

    // Visibility gate: Dormant if progress is near 0
    if (this.currentProgress < 0.04) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Position group slightly deeper to avoid any text collision
    this.group.position.set(0, isMobile ? 0.6 : 0.2, isMobile ? -1.0 : -0.5);

    // Subtle pointer parallax on entire construct (desktop only)
    if (pointer && !isMobile) {
      this.group.rotation.x = -pointer.smoothedY * 0.06;
      this.group.rotation.y = pointer.smoothedX * 0.08;
    }

    // =========================================================================
    // STAGE 1: IDEA CORE EMERGENCE (0.10 -> 0.40)
    // =========================================================================
    const coreAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.12, 0.38);
    const coreScale = THREE.MathUtils.lerp(0.2, isMobile ? 0.75 : 1.0, coreAlpha);

    this.coreMesh.scale.setScalar(coreScale);
    this.coreInnerGlow.scale.setScalar(coreScale * (1 + Math.sin(elapsedTime * 2.5) * 0.12));
    this.coreRing.scale.setScalar(coreScale * (1 + Math.sin(elapsedTime * 1.5) * 0.08));

    this.coreMesh.rotation.y = elapsedTime * 0.4;
    this.coreMesh.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
    this.coreRing.rotation.z = elapsedTime * 0.5;

    this.coreMaterial.opacity = coreAlpha * 0.9;
    this.coreInnerMaterial.opacity = coreAlpha * 0.95;
    this.coreRingMaterial.opacity = coreAlpha * 0.6;

    // =========================================================================
    // STAGE 2: MODULE SEPARATION & GLIDE (0.35 -> 0.70)
    // =========================================================================
    const separationProgress = THREE.MathUtils.smoothstep(this.currentProgress, 0.35, 0.68);
    const offsetMult = isMobile ? 0.72 : 1.0;

    this.moduleMeshes.forEach((modGroup, i) => {
      const cfg = this.moduleConfigs[i];
      // Zero allocation vector interpolation
      this._scratchVec1.copy(cfg.targetOffset).multiplyScalar(offsetMult);
      this._scratchVec2.lerpVectors(this._origin, this._scratchVec1, separationProgress);

      // Subtle breathing float on each module
      const floatY = Math.sin(elapsedTime * 1.2 + i * 1.5) * 0.035;
      const floatZ = Math.cos(elapsedTime * 0.9 + i * 1.2) * 0.025;
      modGroup.position.set(this._scratchVec2.x, this._scratchVec2.y + floatY, this._scratchVec2.z + floatZ);

      // Module scale
      const modScale = THREE.MathUtils.lerp(0.3, isMobile ? 0.65 : 1.0, separationProgress);
      modGroup.scale.setScalar(modScale);

      // Module mesh opacity
      const boxMesh = modGroup.children[0] as THREE.Mesh;
      if (boxMesh && boxMesh.material instanceof THREE.Material) {
        (boxMesh.material as THREE.MeshStandardMaterial).opacity = separationProgress * 0.82;
      }
    });

    // =========================================================================
    // STAGE 3: CONNECTIONS DRAW & TRAVELING PULSES (0.60 -> 0.88)
    // =========================================================================
    const connAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.58, 0.85);
    this.lineMaterials.forEach((mat) => {
      mat.opacity = connAlpha * 0.65;
    });

    // Traveling light pulses along the 4 perimeter lines
    const perimPairs = [
      [0, 1],
      [1, 3],
      [3, 2],
      [2, 0],
    ];

    this.pulsePoints.forEach((pulseMesh, idx) => {
      const pair = perimPairs[idx];
      if (!pair) return;
      const pA = this.moduleConfigs[pair[0]].targetOffset;
      const pB = this.moduleConfigs[pair[1]].targetOffset;

      // Traversal parameter (0 -> 1 loop based on time)
      const speed = 0.8 + idx * 0.2;
      const t = (elapsedTime * speed) % 1.0;
      pulseMesh.position.lerpVectors(pA, pB, t);

      // Pulse opacity
      const pMat = this.pulseMaterials[idx];
      if (pMat) {
        pMat.opacity = connAlpha * 0.85;
      }
    });

    // =========================================================================
    // STAGE 4: PROTOTYPE STABILIZATION & OUTGOING BEAM (0.85 -> 1.00)
    // =========================================================================
    const outgoingAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.85, 0.98);
    const beamMat = this.lineMaterials[this.lineMaterials.length - 1];
    if (beamMat) {
      beamMat.opacity = outgoingAlpha * 0.8;
    }
  }

  public dispose(): void {
    this.coreMesh.geometry.dispose();
    this.coreMaterial.dispose();
    this.coreInnerGlow.geometry.dispose();
    this.coreInnerMaterial.dispose();
    this.coreRing.geometry.dispose();
    this.coreRingMaterial.dispose();

    this.moduleMeshes.forEach((mod) => {
      mod.children.forEach((c) => {
        if (c instanceof THREE.Mesh) {
          c.geometry.dispose();
          if (c.material instanceof THREE.Material) c.material.dispose();
        } else if (c instanceof THREE.LineSegments) {
          c.geometry.dispose();
          if (c.material instanceof THREE.Material) c.material.dispose();
        }
      });
    });

    this.linesGroup.children.forEach((c) => {
      if (c instanceof THREE.Line) c.geometry.dispose();
    });
    this.pulsePoints.forEach((p) => p.geometry.dispose());
    this.lineMaterials.forEach((m) => m.dispose());
    this.pulseMaterials.forEach((m) => m.dispose());
    this.outgoingVector.geometry.dispose();
  }
}
