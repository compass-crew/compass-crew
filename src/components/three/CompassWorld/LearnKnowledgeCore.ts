import * as THREE from "three";
import type { PointerState } from "./types";

interface KnowledgeNodeConfig {
  id: string;
  name: string;
  targetOffset: THREE.Vector3;
  color: number;
  size: number;
}

/**
 * LearnKnowledgeCore
 *
 * Implements the 3D Knowledge Core & Spatial Learning Network:
 * - Abstract multi-layered transparent geometry & concentric information rings
 * - Inner illuminated knowledge seed
 * - 5 Spatial Knowledge Nodes: RESEARCH, MENTORSHIP, EXPERIMENTATION, OPEN SOURCE, PRACTICE
 * - Thin laser connection filaments with traveling knowledge-flow pulses
 * - Concept progression: FRAGMENTED -> CONNECTED -> UNDERSTOOD
 * - Outgoing directional vector beam toward CONNECT
 */
export class LearnKnowledgeCore {
  public group: THREE.Group;

  // 1. Central Core Elements
  private seedMesh: THREE.Mesh;
  private ring1: THREE.Mesh;
  private ring2: THREE.Mesh;
  private ring3: THREE.Mesh;
  private seedMaterial: THREE.MeshBasicMaterial;
  private ringMaterials: THREE.MeshStandardMaterial[] = [];

  // 2. Spatial Knowledge Nodes
  private nodesGroup: THREE.Group;
  private nodeMeshes: THREE.Mesh[] = [];
  private nodeHalos: THREE.Mesh[] = [];
  private nodeConfigs: KnowledgeNodeConfig[] = [
    {
      id: "research",
      name: "RESEARCH",
      targetOffset: new THREE.Vector3(-1.9, 1.1, 0.3),
      color: 0xa78bfa, // Muted Violet
      size: 0.11,
    },
    {
      id: "mentorship",
      name: "MENTORSHIP",
      targetOffset: new THREE.Vector3(1.9, 1.0, 0.2),
      color: 0x8b5cf6, // Violet
      size: 0.12,
    },
    {
      id: "experimentation",
      name: "EXPERIMENTATION",
      targetOffset: new THREE.Vector3(-1.9, -0.8, -0.1),
      color: 0xb36bff, // Soft Violet
      size: 0.10,
    },
    {
      id: "opensource",
      name: "OPEN SOURCE",
      targetOffset: new THREE.Vector3(1.9, -0.8, -0.2),
      color: 0x7c5cff, // Ultraviolet
      size: 0.11,
    },
    {
      id: "practice",
      name: "PRACTICE",
      targetOffset: new THREE.Vector3(0.0, 2.1, 0.4),
      color: 0xa78bfa, // Muted Violet
      size: 0.11,
    },
  ];

  // 3. Filaments & Knowledge Flow Pulses
  private linesGroup: THREE.Group;
  private lineMaterials: THREE.LineBasicMaterial[] = [];
  private pulsePoints: THREE.Mesh[] = [];
  private pulseMaterials: THREE.MeshBasicMaterial[] = [];
  private outgoingVector: THREE.Line;

  // State
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;

  // Scratch vectors to eliminate GC allocations
  private _scratchVec1 = new THREE.Vector3();
  private _scratchVec2 = new THREE.Vector3();
  private _scratchVec3 = new THREE.Vector3();
  private _scratchVec4 = new THREE.Vector3();
  private _origin = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.2, -0.4);

    // 1. Central Knowledge Seed (Luminous inner core - Muted Violet)
    const seedGeo = new THREE.IcosahedronGeometry(0.32, 1);
    this.seedMaterial = new THREE.MeshBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.seedMesh = new THREE.Mesh(seedGeo, this.seedMaterial);
    this.group.add(this.seedMesh);

    // Concentric Layered Information Rings (Graphite metal + Violet emissive edge)
    const ringGeo1 = new THREE.TorusGeometry(0.85, 0.02, 16, 64);
    const ringGeo2 = new THREE.TorusGeometry(1.15, 0.016, 16, 64);
    const ringGeo3 = new THREE.TorusGeometry(1.45, 0.014, 16, 64);

    const makeRingMat = (emissiveCol: number) =>
      new THREE.MeshStandardMaterial({
        color: 0x18181f,
        emissive: emissiveCol,
        emissiveIntensity: 0.35,
        metalness: 0.85,
        roughness: 0.3,
        transparent: true,
        opacity: 0,
      });

    const mat1 = makeRingMat(0xa78bfa);
    const mat2 = makeRingMat(0x8b5cf6);
    const mat3 = makeRingMat(0x7c5cff);
    this.ringMaterials.push(mat1, mat2, mat3);

    this.ring1 = new THREE.Mesh(ringGeo1, mat1);
    this.ring2 = new THREE.Mesh(ringGeo2, mat2);
    this.ring3 = new THREE.Mesh(ringGeo3, mat3);

    this.ring1.rotation.x = Math.PI * 0.25;
    this.ring2.rotation.y = Math.PI * 0.35;
    this.ring3.rotation.z = Math.PI * 0.15;

    this.group.add(this.ring1, this.ring2, this.ring3);

    // 2. Spatial Knowledge Nodes
    this.nodesGroup = new THREE.Group();
    this.group.add(this.nodesGroup);
    this.initNodes();

    // 3. Connective Filaments & Flow Pulses
    this.linesGroup = new THREE.Group();
    this.group.add(this.linesGroup);
    this.initConnections();

    // 4. Outgoing Forward Path toward CONNECT
    const beamPts = [
      new THREE.Vector3(0, -1.8, 0.2),
      new THREE.Vector3(0, -4.2, 1.0),
      new THREE.Vector3(0, -7.5, 2.2),
    ];
    const beamCurve = new THREE.CatmullRomCurve3(beamPts);
    const beamGeo = new THREE.BufferGeometry().setFromPoints(beamCurve.getPoints(24));
    const beamMat = new THREE.LineBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(beamMat);
    this.outgoingVector = new THREE.Line(beamGeo, beamMat);
    this.group.add(this.outgoingVector);
  }

  private initNodes(): void {
    const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    const haloGeo = new THREE.RingGeometry(1.3, 1.5, 24);

    this.nodeConfigs.forEach((cfg) => {
      // Node core
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.scale.setScalar(cfg.size);
      this.nodeMeshes.push(mesh);
      this.nodesGroup.add(mesh);

      // Node halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.scale.setScalar(cfg.size * 1.5);
      this.nodeHalos.push(halo);
      this.nodesGroup.add(halo);
    });
  }

  private initConnections(): void {
    const violetMat = new THREE.LineBasicMaterial({
      color: 0xa78bfa,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const softVioletMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(violetMat, softVioletMat);

    // Spoke filaments (Center Core -> 5 Nodes)
    this.nodeConfigs.forEach((cfg, i) => {
      const pts = [new THREE.Vector3(0, 0, 0), cfg.targetOffset.clone()];
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, i % 2 === 0 ? violetMat : softVioletMat);
      this.linesGroup.add(line);
    });

    // Inter-node flow arcs:
    // Research <-> Experimentation, Mentorship <-> Practice, OpenSource <-> Research
    const interPairs = [
      [0, 2], // Research <-> Experimentation
      [1, 4], // Mentorship <-> Practice
      [3, 0], // OpenSource <-> Research
      [2, 3], // Experimentation <-> OpenSource
    ];

    interPairs.forEach(([fromIdx, toIdx]) => {
      const pA = this.nodeConfigs[fromIdx].targetOffset;
      const pB = this.nodeConfigs[toIdx].targetOffset;
      const mid = new THREE.Vector3().lerpVectors(pA, pB, 0.5);
      mid.z += 0.25;

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const pts = curve.getPoints(20);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const line = new THREE.Line(geo, softVioletMat);
      this.linesGroup.add(line);

      // Traveling knowledge-flow pulse
      const pulseGeo = new THREE.SphereGeometry(0.032, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xa78bfa,
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

    // Dormant gate
    if (this.currentProgress < 0.04) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Position deeper on mobile to guarantee typography legibility
    this.group.position.set(0, isMobile ? 0.5 : 0.2, isMobile ? -1.1 : -0.4);

    // Subtle pointer parallax (desktop only)
    if (pointer && !isMobile) {
      this.group.rotation.x = -pointer.smoothedY * 0.05;
      this.group.rotation.y = pointer.smoothedX * 0.06;
    }

    // =========================================================================
    // STAGE 1: KNOWLEDGE CORE EMERGENCE & ROTATION (0.08 -> 0.40)
    // =========================================================================
    const coreAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.10, 0.38);
    const coreScale = THREE.MathUtils.lerp(0.2, isMobile ? 0.75 : 1.0, coreAlpha);

    this.seedMesh.scale.setScalar(coreScale * (1 + Math.sin(elapsedTime * 2.0) * 0.1));
    this.seedMesh.rotation.y = elapsedTime * 0.5;
    this.seedMaterial.opacity = coreAlpha * 0.95;

    // Gimbal ring counter-rotations
    this.ring1.rotation.x = Math.PI * 0.25 + elapsedTime * 0.25;
    this.ring1.rotation.y = Math.sin(elapsedTime * 0.2) * 0.2;
    this.ring2.rotation.y = Math.PI * 0.35 - elapsedTime * 0.3;
    this.ring3.rotation.z = Math.PI * 0.15 + elapsedTime * 0.2;

    this.ring1.scale.setScalar(coreScale);
    this.ring2.scale.setScalar(coreScale);
    this.ring3.scale.setScalar(coreScale);

    this.ringMaterials.forEach((m) => {
      m.opacity = coreAlpha * 0.85;
    });

    // =========================================================================
    // STAGE 2: KNOWLEDGE NODES SEPARATION (0.35 -> 0.72)
    // =========================================================================
    const nodeEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.32, 0.68);
    const offsetMult = isMobile ? 0.70 : 1.0;

    this.nodeConfigs.forEach((cfg, i) => {
      const mesh = this.nodeMeshes[i];
      const halo = this.nodeHalos[i];
      if (!mesh || !halo) return;

      // Zero-allocation vector interpolation
      this._scratchVec1.copy(cfg.targetOffset).multiplyScalar(offsetMult);
      this._scratchVec2.lerpVectors(this._origin, this._scratchVec1, nodeEmergence);

      // Gentle floating motion
      const floatY = Math.sin(elapsedTime * 1.1 + i * 1.3) * 0.04;
      const floatZ = Math.cos(elapsedTime * 0.8 + i * 1.1) * 0.03;

      mesh.position.set(this._scratchVec2.x, this._scratchVec2.y + floatY, this._scratchVec2.z + floatZ);
      halo.position.copy(mesh.position);

      const pulse = 1 + Math.sin(elapsedTime * 1.8 + i) * 0.14;
      const nodeScale = cfg.size * (isMobile ? 0.75 : 1.0) * nodeEmergence * pulse;
      mesh.scale.setScalar(nodeScale);

      const haloScale = cfg.size * 1.6 * (isMobile ? 0.75 : 1.0) * nodeEmergence * (1 + Math.sin(elapsedTime * 1.4 + i) * 0.18);
      halo.scale.setScalar(haloScale);
      halo.rotation.z = elapsedTime * 0.25 + i;

      (mesh.material as THREE.MeshBasicMaterial).opacity = nodeEmergence * 0.9;
      (halo.material as THREE.MeshBasicMaterial).opacity = nodeEmergence * 0.45;
    });

    // =========================================================================
    // STAGE 3: FILAMENTS & TRAVELING KNOWLEDGE PULSES (0.55 -> 0.85)
    // =========================================================================
    const connAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.55, 0.82);
    this.lineMaterials[0].opacity = connAlpha * 0.6;
    this.lineMaterials[1].opacity = connAlpha * 0.5;

    const interPairs = [
      [0, 2],
      [1, 4],
      [3, 0],
      [2, 3],
    ];

    this.pulsePoints.forEach((pulseMesh, idx) => {
      const pair = interPairs[idx];
      if (!pair) return;
      this._scratchVec3.copy(this.nodeConfigs[pair[0]].targetOffset).multiplyScalar(offsetMult);
      this._scratchVec4.copy(this.nodeConfigs[pair[1]].targetOffset).multiplyScalar(offsetMult);

      const speed = 0.65 + idx * 0.15;
      const t = (elapsedTime * speed) % 1.0;
      pulseMesh.position.lerpVectors(this._scratchVec3, this._scratchVec4, t);

      const pMat = this.pulseMaterials[idx];
      if (pMat) {
        pMat.opacity = connAlpha * 0.85;
      }
    });

    // =========================================================================
    // STAGE 4: OUTGOING BEAM TOWARD CONNECT (0.85 -> 1.00)
    // =========================================================================
    const beamAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.85, 0.98);
    const beamMat = this.lineMaterials[this.lineMaterials.length - 1];
    if (beamMat) {
      beamMat.opacity = beamAlpha * 0.8;
    }
  }

  public dispose(): void {
    this.seedMesh.geometry.dispose();
    this.seedMaterial.dispose();
    this.ring1.geometry.dispose();
    this.ring2.geometry.dispose();
    this.ring3.geometry.dispose();
    this.ringMaterials.forEach((m) => m.dispose());

    this.nodeMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.nodeHalos.forEach((h) => {
      h.geometry.dispose();
      (h.material as THREE.Material).dispose();
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
