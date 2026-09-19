import * as THREE from "three";
import type { PointerState } from "./types";

export interface OpportunityNodeConfig {
  id: string;
  category: string;
  subtitle: string;
  position: THREE.Vector3;
  color: number;
  glowColor: number;
  revealThreshold: number; // scene progress at which this node starts extending
}

/**
 * GrowOpportunityField
 *
 * Implements the 3D Grow / Opportunity & Impact Scene for Compass Crew:
 * - Proof Core Transformation:
 *   - Originates from the completed Proof Core from SHIP.
 *   - Luminous central core ascends and separates into an open directional aperture.
 * - Central Spatial Opportunity Field:
 *   - 6 Branching Curvilinear Opportunity Paths (Internship, Research, Startup, Open Source, Mentorship, Community).
 *   - Traveling signal pulses moving from Proof Core to destination nodes.
 *   - 6 Destination Opportunity Nodes with pulsing beacon rings and crystal lattices.
 * - Outgoing Directional Vector:
 *   - Emerging forward trajectory toward the horizon preparing for the DIRECTION scene.
 * - Zero GC allocations per frame with preallocated scratch vectors and proximity dormancy.
 */
export class GrowOpportunityField {
  public group: THREE.Group;

  // 1. Proof Core Aperture Transformation
  private originCoreGroup: THREE.Group;
  private coreCrystal: THREE.Mesh;
  private coreMaterial: THREE.MeshBasicMaterial;
  private apertureLeaves: THREE.Mesh[] = [];
  private leafMaterials: THREE.MeshStandardMaterial[] = [];

  // 2. Opportunity Nodes & Spline Paths
  private nodesGroup: THREE.Group;
  private nodeMeshes: {
    id: string;
    config: OpportunityNodeConfig;
    group: THREE.Group;
    ring: THREE.Mesh;
    crystal: THREE.Mesh;
    beacon: THREE.Line;
    ringMaterial: THREE.MeshBasicMaterial;
    crystalMaterial: THREE.MeshStandardMaterial;
    beaconMaterial: THREE.LineBasicMaterial;
  }[] = [];

  private pathLines: {
    config: OpportunityNodeConfig;
    line: THREE.Line;
    geometry: THREE.BufferGeometry;
    material: THREE.LineBasicMaterial;
    curve: THREE.CatmullRomCurve3;
    pointsCount: number;
  }[] = [];

  // Traveling Signal Pulses along Paths
  private signalPulses: {
    mesh: THREE.Mesh;
    material: THREE.MeshBasicMaterial;
    pathIndex: number;
    speed: number;
    offset: number;
  }[] = [];

  // 3. Outgoing Convergence Trajectory toward DIRECTION
  private outgoingTrajectory: THREE.Line;
  private outgoingMaterial: THREE.LineBasicMaterial;

  // Configurations for the 6 Conceptual Categories
  private nodeConfigs: OpportunityNodeConfig[] = [
    {
      id: "internship",
      category: "INTERNSHIP",
      subtitle: "INDUSTRY STUDIOS",
      position: new THREE.Vector3(2.2, 1.2, 0.4),
      color: 0x7c5cff, // Ultraviolet
      glowColor: 0xf5f2ea, // Warm Ivory
      revealThreshold: 0.18,
    },
    {
      id: "research",
      category: "RESEARCH",
      subtitle: "DEEP TECH LABS",
      position: new THREE.Vector3(-2.2, 1.35, 0.2),
      color: 0xb36bff, // Soft Violet
      glowColor: 0xa78bfa,
      revealThreshold: 0.26,
    },
    {
      id: "startup",
      category: "STARTUP",
      subtitle: "FOUNDER TRACK",
      position: new THREE.Vector3(2.35, -0.95, 0.5),
      color: 0xff7a6b, // Coral
      glowColor: 0xfda4af,
      revealThreshold: 0.36,
    },
    {
      id: "opensource",
      category: "OPEN SOURCE",
      subtitle: "GLOBAL ECOSYSTEM",
      position: new THREE.Vector3(-2.3, -1.05, 0.4),
      color: 0x7dd3a8, // Mint
      glowColor: 0xa7f3d0,
      revealThreshold: 0.45,
    },
    {
      id: "mentorship",
      category: "MENTORSHIP",
      subtitle: "SENIOR GUILD",
      position: new THREE.Vector3(0.0, 2.15, -0.5),
      color: 0xfde68a, // Warm Gold
      glowColor: 0xfef08a,
      revealThreshold: 0.55,
    },
    {
      id: "community",
      category: "COMMUNITY",
      subtitle: "CHAPTER LEADERSHIP",
      position: new THREE.Vector3(0.0, -1.85, -0.2),
      color: 0xff7a6b, // Coral
      glowColor: 0x7c5cff,
      revealThreshold: 0.65,
    },
  ];

  // State
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;
  private hoveredNodeId: string | null = null;

  // Scratch vectors to eliminate GC in animation loops
  private _scratchVec1 = new THREE.Vector3();
  private _scratchVec2 = new THREE.Vector3();
  private _scratchCurPos = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.2, -0.3);

    // 1. Proof Core Aperture (The transformed artifact from SHIP)
    this.originCoreGroup = new THREE.Group();
    this.group.add(this.originCoreGroup);

    const crystalGeo = new THREE.OctahedronGeometry(0.26, 0);
    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.coreCrystal = new THREE.Mesh(crystalGeo, this.coreMaterial);
    this.originCoreGroup.add(this.coreCrystal);

    // 4 Blooming Aperture Panels
    const leafGeo = new THREE.PlaneGeometry(0.38, 0.24);
    const leafRotations = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    for (let i = 0; i < 4; i++) {
      const mat = new THREE.MeshStandardMaterial({
        color: 0x111116,
        emissive: 0x7c5cff,
        emissiveIntensity: 0.2,
        roughness: 0.35,
        metalness: 0.75,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0,
      });
      const leaf = new THREE.Mesh(leafGeo, mat);
      leaf.rotation.z = leafRotations[i];
      this.apertureLeaves.push(leaf);
      this.leafMaterials.push(mat);
      this.originCoreGroup.add(leaf);
    }

    // 2. Nodes & Curved Branching Paths
    this.nodesGroup = new THREE.Group();
    this.group.add(this.nodesGroup);
    this.initOpportunityField();

    // 3. Outgoing Directional Trajectory toward DIRECTION
    const outgoingPoints = [
      new THREE.Vector3(0, 0.3, 0),
      new THREE.Vector3(0, 0.7, -1.8),
      new THREE.Vector3(0, 1.2, -4.5),
    ];
    const outgoingCurve = new THREE.CatmullRomCurve3(outgoingPoints);
    const outgoingGeo = new THREE.BufferGeometry().setFromPoints(outgoingCurve.getPoints(40));
    this.outgoingMaterial = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.outgoingTrajectory = new THREE.Line(outgoingGeo, this.outgoingMaterial);
    this.group.add(this.outgoingTrajectory);

    this.group.visible = false;
  }

  private initOpportunityField(): void {
    const originPoint = new THREE.Vector3(0, 0.1, 0);

    // Construct each path and node
    this.nodeConfigs.forEach((cfg, idx) => {
      // Create a smooth 3D curved trajectory from origin to node position
      const midPoint = new THREE.Vector3(
        cfg.position.x * 0.55 + (idx % 2 === 0 ? 0.2 : -0.2),
        cfg.position.y * 0.5 + 0.3,
        cfg.position.z * 0.5 + (idx % 2 === 0 ? 0.3 : -0.2),
      );
      const curve = new THREE.CatmullRomCurve3([originPoint, midPoint, cfg.position]);
      const points = curve.getPoints(48);
      const pathGeo = new THREE.BufferGeometry().setFromPoints(points);

      const pathMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const pathLine = new THREE.Line(pathGeo, pathMat);
      pathGeo.setDrawRange(0, 0); // hidden initially
      this.nodesGroup.add(pathLine);

      this.pathLines.push({
        config: cfg,
        line: pathLine,
        geometry: pathGeo,
        material: pathMat,
        curve,
        pointsCount: points.length,
      });

      // Construct Node
      const nodeSubGroup = new THREE.Group();
      nodeSubGroup.position.copy(cfg.position);

      // Node Ring
      const ringGeo = new THREE.RingGeometry(0.18, 0.22, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      nodeSubGroup.add(ring);

      // Node Central Crystal
      const crystalGeo = new THREE.OctahedronGeometry(0.12, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        emissive: cfg.glowColor,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      nodeSubGroup.add(crystal);

      // Vertical Beacon Line
      const beaconPoints = [new THREE.Vector3(0, -0.35, 0), new THREE.Vector3(0, 0.35, 0)];
      const beaconGeo = new THREE.BufferGeometry().setFromPoints(beaconPoints);
      const beaconMat = new THREE.LineBasicMaterial({
        color: cfg.glowColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const beacon = new THREE.Line(beaconGeo, beaconMat);
      nodeSubGroup.add(beacon);

      this.nodesGroup.add(nodeSubGroup);

      this.nodeMeshes.push({
        id: cfg.id,
        config: cfg,
        group: nodeSubGroup,
        ring,
        crystal,
        beacon,
        ringMaterial: ringMat,
        crystalMaterial: crystalMat,
        beaconMaterial: beaconMat,
      });

      // Traveling Signal Pulse on this path
      const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: cfg.glowColor,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      this.nodesGroup.add(pulseMesh);

      this.signalPulses.push({
        mesh: pulseMesh,
        material: pulseMat,
        pathIndex: idx,
        speed: 0.45 + (idx % 3) * 0.1,
        offset: idx * 0.22,
      });
    });
  }

  public setProgress(progress: number): void {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public setHoveredNode(id: string | null): void {
    this.hoveredNodeId = id;
  }

  public update(elapsedTime: number, pointer: PointerState, isMobile = false): void {
    // Smooth progress damping
    this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

    // Proximity dormancy check
    if (this.currentProgress <= 0.01 && this.targetProgress <= 0.01) {
      if (this.group.visible) this.group.visible = false;
      return;
    }
    if (!this.group.visible) this.group.visible = true;

    const p = this.currentProgress;

    // 1. Proof Core Aperture Ascension & Unfolding (0.00 -> 0.40)
    const coreAlpha = THREE.MathUtils.smoothstep(p, 0.02, 0.22);
    const coreLift = THREE.MathUtils.smoothstep(p, 0.1, 0.5) * 0.35;
    this.originCoreGroup.position.y = 0.1 + coreLift;

    this.coreMaterial.opacity = coreAlpha * 0.85;
    this.coreCrystal.rotation.y = elapsedTime * 0.8;
    this.coreCrystal.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2;

    const leafSpread = THREE.MathUtils.smoothstep(p, 0.08, 0.45);
    for (let i = 0; i < this.apertureLeaves.length; i++) {
      const leaf = this.apertureLeaves[i];
      const mat = this.leafMaterials[i];
      mat.opacity = coreAlpha * 0.75;
      const angle = (i * Math.PI) / 2;
      const dist = 0.18 + leafSpread * 0.22;
      leaf.position.x = Math.cos(angle) * dist;
      leaf.position.y = Math.sin(angle) * dist;
      leaf.rotation.z = angle + leafSpread * 0.4;
    }

    // 2. Curved Opportunity Paths Reveal & Node Activation (0.15 -> 0.85)
    this.pathLines.forEach((item, idx) => {
      const startT = item.config.revealThreshold;
      const endT = Math.min(startT + 0.26, 0.95);
      const pathT = THREE.MathUtils.smoothstep(p, startT, endT);

      // Draw range on curved path
      const drawCount = Math.floor(item.pointsCount * pathT);
      item.geometry.setDrawRange(0, drawCount);
      item.material.opacity = pathT * 0.65;

      // Corresponding Destination Node
      const node = this.nodeMeshes[idx];
      const nodeActiveT = THREE.MathUtils.smoothstep(p, endT - 0.08, 1.0);
      const isHovered = this.hoveredNodeId === node.id;
      const hoverScale = isHovered ? 1.25 : 1.0;

      node.ringMaterial.opacity = nodeActiveT * (isHovered ? 0.95 : 0.7);
      node.crystalMaterial.opacity = nodeActiveT * 0.9;
      node.beaconMaterial.opacity = nodeActiveT * (isHovered ? 0.8 : 0.45);

      const baseScale = nodeActiveT * hoverScale;
      node.group.scale.set(baseScale, baseScale, baseScale);

      // Subtle node rotation
      node.crystal.rotation.y = elapsedTime * (0.8 + idx * 0.1);
      node.ring.rotation.z = -elapsedTime * 0.5;

      // Pulse traveling along path
      const pulse = this.signalPulses[idx];
      if (pathT > 0.15 && nodeActiveT > 0.05) {
        pulse.material.opacity = 0.85;
        const pulseT = (elapsedTime * pulse.speed + pulse.offset) % 1.0;
        // Limit pulse to drawn portion of curve
        const effectiveT = pulseT * Math.min(pathT, 1.0);
        item.curve.getPointAt(effectiveT, this._scratchCurPos);
        pulse.mesh.position.copy(this._scratchCurPos);
      } else {
        pulse.material.opacity = 0;
      }
    });

    // 3. Outgoing Horizon Convergence Arc toward DIRECTION (0.75 -> 1.00)
    const outgoingT = THREE.MathUtils.smoothstep(p, 0.72, 0.98);
    this.outgoingMaterial.opacity = outgoingT * 0.75;

    // Subtle pointer parallax
    if (!isMobile) {
      this.group.rotation.y = pointer.normalizedX * 0.06;
      this.group.rotation.x = -pointer.normalizedY * 0.04;
    }
  }

  public dispose(): void {
    this.coreMaterial.dispose();
    this.coreCrystal.geometry.dispose();

    this.leafMaterials.forEach((m) => m.dispose());
    this.apertureLeaves.forEach((l) => l.geometry.dispose());

    this.pathLines.forEach((p) => {
      p.material.dispose();
      p.geometry.dispose();
    });

    this.nodeMeshes.forEach((n) => {
      n.ringMaterial.dispose();
      n.crystalMaterial.dispose();
      n.beaconMaterial.dispose();
      n.ring.geometry.dispose();
      n.crystal.geometry.dispose();
      n.beacon.geometry.dispose();
    });

    this.signalPulses.forEach((s) => {
      s.material.dispose();
      s.mesh.geometry.dispose();
    });

    this.outgoingMaterial.dispose();
    this.outgoingTrajectory.geometry.dispose();
  }
}
