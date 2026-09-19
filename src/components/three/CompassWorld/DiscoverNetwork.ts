import * as THREE from "three";
import type { PointerState } from "./types";

export interface CoreNodeInfo {
  id: string;
  label: string;
  sublabel: string;
  basePosition: THREE.Vector3;
  color: number;
  size: number;
  activationProgress: number; // when this node illuminates
}

export interface ProjectedNode {
  id: string;
  label: string;
  sublabel: string;
  x: number; // screen pixel X
  y: number; // screen pixel Y
  visible: boolean;
  opacity: number;
}

/**
 * DiscoverNetwork
 *
 * Implements the 3D Builder Network originating from the Compass:
 * - 5 Core Spatial Anchor Nodes: PEOPLE, IDEAS, SKILLS, OPPORTUNITIES, COMMUNITY
 * - 6 Auxiliary satellite nodes
 * - Progressive line drawing radiating from Compass center
 * - Inter-node connecting arcs
 * - Micro-label coordinate projection
 * - Outgoing forward vector hook ("Let's build")
 */
export class DiscoverNetwork {
  public group: THREE.Group;

  private coreNodes: CoreNodeInfo[] = [
    {
      id: "ideas",
      label: "IDEAS",
      sublabel: "ZERO TO SHIP",
      basePosition: new THREE.Vector3(0, 2.7, 0.4),
      color: 0xb36bff, // Soft Violet
      size: 0.11,
      activationProgress: 0.28,
    },
    {
      id: "people",
      label: "PEOPLE",
      sublabel: "BUILDERS & PEERS",
      basePosition: new THREE.Vector3(-3.4, 0.3, 0.3),
      color: 0x8b5cf6, // Violet
      size: 0.12,
      activationProgress: 0.32,
    },
    {
      id: "opportunities",
      label: "OPPORTUNITIES",
      sublabel: "HACKATHONS & VENTURE",
      basePosition: new THREE.Vector3(3.4, 0.3, 0.3),
      color: 0xb36bff, // Soft Violet
      size: 0.12,
      activationProgress: 0.58,
    },
    {
      id: "skills",
      label: "SKILLS",
      sublabel: "AI, CODE & SYSTEMS",
      basePosition: new THREE.Vector3(-2.2, 2.1, 0.5),
      color: 0x7c5cff, // Ultraviolet
      size: 0.1,
      activationProgress: 0.5,
    },
    {
      id: "community",
      label: "COMMUNITY",
      sublabel: "PAN-INDIA MESH",
      basePosition: new THREE.Vector3(0, -2.7, 0.4),
      color: 0x8b5cf6, // Violet
      size: 0.11,
      activationProgress: 0.65,
    },
  ];

  private satellitePositions: THREE.Vector3[] = [
    new THREE.Vector3(-3.8, -1.3, -0.2), // Founders
    new THREE.Vector3(-1.8, -2.4, 0.2), // Mentors
    new THREE.Vector3(2.3, 2.3, 0.4), // Hackathons
    new THREE.Vector3(-1.4, 2.9, -0.2), // Open Source
    new THREE.Vector3(3.7, -1.3, -0.2), // Venture
    new THREE.Vector3(2.4, -2.3, 0.2), // Research
  ];

  // Meshes
  private nodeMeshes: THREE.Mesh[] = [];
  private haloMeshes: THREE.Mesh[] = [];
  private satelliteMesh!: THREE.InstancedMesh;
  private dummy = new THREE.Object3D();

  // Lines
  private radialLinesGroup: THREE.Group;
  private interLinesGroup: THREE.Group;
  private outgoingBeam!: THREE.Line;
  private lineMaterials: THREE.LineBasicMaterial[] = [];

  // Animation state
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;

  constructor() {
    this.group = new THREE.Group();
    this.radialLinesGroup = new THREE.Group();
    this.interLinesGroup = new THREE.Group();
    this.group.add(this.radialLinesGroup);
    this.group.add(this.interLinesGroup);

    // 1. Core Node Meshes & Halos
    this.initCoreNodes();

    // 2. Satellite Nodes (Instanced)
    this.initSatelliteNodes();

    // 3. Directional Radial Lines (Compass -> Nodes)
    this.initRadialLines();

    // 4. Inter-Node Connection Arcs
    this.initInterConnections();

    // 5. Outgoing Build Vector Beam
    this.initOutgoingBeam();
  }

  private initCoreNodes(): void {
    const sphereGeo = new THREE.SphereGeometry(1, 16, 16);
    const ringGeo = new THREE.RingGeometry(1.4, 1.6, 24);

    this.coreNodes.forEach((node) => {
      // Core sphere
      const sphereMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.scale.setScalar(node.size);
      mesh.position.copy(node.basePosition);
      this.nodeMeshes.push(mesh);
      this.group.add(mesh);

      // Orbital pulse halo
      const haloMat = new THREE.MeshBasicMaterial({
        color: node.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Mesh(ringGeo, haloMat);
      halo.scale.setScalar(node.size * 1.5);
      halo.position.copy(node.basePosition);
      this.haloMeshes.push(halo);
      this.group.add(halo);
    });
  }

  private initSatelliteNodes(): void {
    const geo = new THREE.SphereGeometry(0.045, 8, 8);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xb36bff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.satelliteMesh = new THREE.InstancedMesh(geo, mat, this.satellitePositions.length);
    this.satelliteMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.satellitePositions.forEach((pos, idx) => {
      this.dummy.position.copy(pos);
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.satelliteMesh.setMatrixAt(idx, this.dummy.matrix);
    });
    this.satelliteMesh.instanceMatrix.needsUpdate = true;
    this.group.add(this.satelliteMesh);
  }

  private initRadialLines(): void {
    const violetMat = new THREE.LineBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const ultravioletMat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(violetMat, ultravioletMat);

    // Primary radial bus lines originating from Compass (0,0,0) to each core node
    this.coreNodes.forEach((node, i) => {
      const points: THREE.Vector3[] = [];
      const origin = new THREE.Vector3(0, 0, 0);
      const target = node.basePosition.clone();
      const mid = new THREE.Vector3().lerpVectors(origin, target, 0.5);
      mid.z += 0.2; // slight elevation arc

      const curve = new THREE.QuadraticBezierCurve3(origin, mid, target);
      points.push(...curve.getPoints(24));

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, i % 2 === 0 ? violetMat : ultravioletMat);
      this.radialLinesGroup.add(line);
    });
  }

  private initInterConnections(): void {
    const interMat = new THREE.LineBasicMaterial({
      color: 0x6d4fc7,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(interMat);

    // Inter-node pairs:
    // [Ideas <-> Opportunities], [Ideas <-> People], [People <-> Skills], [Community <-> Opportunities], [Skills <-> Community]
    const pairs: [number, number][] = [
      [0, 2], // Ideas <-> Opportunities
      [0, 1], // Ideas <-> People
      [1, 3], // People <-> Skills
      [4, 2], // Community <-> Opportunities
      [3, 4], // Skills <-> Community
    ];

    pairs.forEach(([fromIdx, toIdx]) => {
      const pA = this.coreNodes[fromIdx].basePosition;
      const pB = this.coreNodes[toIdx].basePosition;
      const mid = new THREE.Vector3().lerpVectors(pA, pB, 0.5);
      mid.z += 0.4; // arch outward

      const curve = new THREE.QuadraticBezierCurve3(pA, mid, pB);
      const points = curve.getPoints(20);

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, interMat);
      this.interLinesGroup.add(line);
    });
  }

  private initOutgoingBeam(): void {
    // A forward directional vector path that appears at the end of the scene (p > 0.88)
    const points: THREE.Vector3[] = [];
    const p0 = new THREE.Vector3(0, -2.5, 0.4);
    const p1 = new THREE.Vector3(0, -5.0, 1.2);
    const p2 = new THREE.Vector3(0, -8.0, 2.5);

    const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
    points.push(...curve.getPoints(24));

    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(mat);
    this.outgoingBeam = new THREE.Line(geo, mat);
    this.group.add(this.outgoingBeam);
  }

  public setTransitionProgress(progress: number): void {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public update(elapsedTime: number, pointer?: PointerState): void {
    this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

    // Visibility gate: don't compute if still fully in hero
    if (this.currentProgress < 0.12) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Subtle pointer parallax on the network
    if (pointer) {
      this.group.rotation.x = -pointer.smoothedY * 0.05;
      this.group.rotation.y = pointer.smoothedX * 0.05;
    }

    // 1. Update Core Nodes & Halos
    this.coreNodes.forEach((node, idx) => {
      const mesh = this.nodeMeshes[idx];
      const halo = this.haloMeshes[idx];
      if (!mesh || !halo) return;

      // Emergence curve
      const emergence = THREE.MathUtils.smoothstep(
        this.currentProgress,
        node.activationProgress - 0.12,
        node.activationProgress + 0.15,
      );

      // Subtle float & depth sway
      const floatY = Math.sin(elapsedTime * 1.2 + idx * 1.4) * 0.06;
      const floatZ = Math.cos(elapsedTime * 0.9 + idx * 1.2) * 0.04;

      mesh.position.set(
        node.basePosition.x,
        node.basePosition.y + floatY,
        node.basePosition.z + floatZ,
      );
      halo.position.copy(mesh.position);

      // Pulse
      const pulse = 1 + Math.sin(elapsedTime * 2.0 + idx) * 0.15;
      const scale = node.size * emergence * pulse;
      mesh.scale.setScalar(scale);

      const haloScale = node.size * 1.6 * emergence * (1 + Math.sin(elapsedTime * 1.5 + idx) * 0.2);
      halo.scale.setScalar(haloScale);
      halo.rotation.z = elapsedTime * 0.3 + idx;

      // Opacities
      (mesh.material as THREE.MeshBasicMaterial).opacity = emergence * 0.9;
      (halo.material as THREE.MeshBasicMaterial).opacity = emergence * 0.45;
    });

    // 2. Satellite Nodes
    const satelliteEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.45, 0.85);
    (this.satelliteMesh.material as THREE.MeshBasicMaterial).opacity = satelliteEmergence * 0.7;

    this.satellitePositions.forEach((pos, idx) => {
      const floatY = Math.sin(elapsedTime * 1.1 + idx * 1.3) * 0.05;
      this.dummy.position.set(pos.x, pos.y + floatY, pos.z);
      const pulse = 1 + Math.sin(elapsedTime * 2.5 + idx * 1.5) * 0.2;
      this.dummy.scale.setScalar(satelliteEmergence * pulse);
      this.dummy.updateMatrix();
      this.satelliteMesh.setMatrixAt(idx, this.dummy.matrix);
    });
    this.satelliteMesh.instanceMatrix.needsUpdate = true;

    // 3. Radial Lines (Compass -> Core Nodes)
    const radialEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.24, 0.7);
    this.lineMaterials[0].opacity = radialEmergence * 0.65; // cyan
    this.lineMaterials[1].opacity = radialEmergence * 0.5; // indigo

    // 4. Inter-Node Connection Arcs (Emerge between 0.55 and 0.88)
    const interEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.55, 0.85);
    this.lineMaterials[2].opacity = interEmergence * 0.45;

    // 5. Outgoing Build Beam (Emerge at the end, 0.88 to 1.0)
    const beamEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.88, 1.0);
    if (this.lineMaterials[3]) {
      this.lineMaterials[3].opacity = beamEmergence * 0.8;
    }
  }

  /**
   * Projects 3D node world coordinates to 2D screen pixels for crisp HTML micro-labels
   */
  public getProjectedNodes(camera: THREE.Camera, width: number, height: number): ProjectedNode[] {
    const results: ProjectedNode[] = [];
    const tempVec = new THREE.Vector3();

    this.coreNodes.forEach((node, idx) => {
      const mesh = this.nodeMeshes[idx];
      if (!mesh) return;

      mesh.getWorldPosition(tempVec);
      tempVec.project(camera);

      // Normalized coordinates (-1 to 1) to screen pixels
      const x = (tempVec.x * 0.5 + 0.5) * width;
      const y = (-tempVec.y * 0.5 + 0.5) * height;
      const inFront = tempVec.z < 1.0;

      const emergence = THREE.MathUtils.smoothstep(
        this.currentProgress,
        node.activationProgress - 0.05,
        node.activationProgress + 0.15,
      );

      results.push({
        id: node.id,
        label: node.label,
        sublabel: node.sublabel,
        x,
        y,
        visible: inFront && emergence > 0.05,
        opacity: emergence,
      });
    });

    return results;
  }

  public dispose(): void {
    this.nodeMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.haloMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.satelliteMesh.geometry.dispose();
    (this.satelliteMesh.material as THREE.Material).dispose();

    this.radialLinesGroup.children.forEach((c) => {
      if (c instanceof THREE.Line) c.geometry.dispose();
    });
    this.interLinesGroup.children.forEach((c) => {
      if (c instanceof THREE.Line) c.geometry.dispose();
    });
    if (this.outgoingBeam) {
      this.outgoingBeam.geometry.dispose();
    }
    this.lineMaterials.forEach((m) => m.dispose());
  }
}
