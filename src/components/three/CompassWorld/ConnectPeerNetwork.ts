import * as THREE from "three";
import type { PointerState } from "./types";

interface RoleNodeConfig {
  id: string;
  role: string;
  targetOffset: THREE.Vector3;
  teamOffset: THREE.Vector3; // Position when converged into Team Cluster
  isTeamMember: boolean;
  color: number;
  size: number;
}

interface PeerConnection {
  nodeA: number;
  nodeB: number;
  isTeamLink: boolean;
}

/**
 * ConnectPeerNetwork
 *
 * Implements the 3D Connect / Community Scene for Compass Crew:
 * - Abstract human-centered role nodes (ENGINEER, DESIGNER, BUILDER, RESEARCHER, FOUNDER, MENTOR)
 * - Concentric halo rings & geometric identity markers (no cartoon heads, no generic avatar spheres)
 * - Thin laser-drawn connective filaments with traveling light pulses
 * - Concept progression: ISOLATED -> CONNECTED -> TEAM CLUSTER
 * - Spatial Team Matching convergence (0.70 -> 0.85): 4 complementary role nodes
 *   converge around a central project core
 * - Pointer hover interactions & smooth mobile-responsive adaptations
 */
export class ConnectPeerNetwork {
  public group: THREE.Group;

  // 1. Role Nodes
  private nodesGroup: THREE.Group;
  private nodeMeshes: THREE.Mesh[] = [];
  private nodeHalos: THREE.Mesh[] = [];
  private nodeOuterRings: THREE.Mesh[] = [];
  private nodeMaterials: THREE.MeshBasicMaterial[] = [];
  private haloMaterials: THREE.MeshBasicMaterial[] = [];
  private outerRingMaterials: THREE.MeshStandardMaterial[] = [];

  private roleConfigs: RoleNodeConfig[] = [
    {
      id: "engineer",
      role: "AI ENGINEER",
      targetOffset: new THREE.Vector3(1.7, 0.9, 0.2),
      teamOffset: new THREE.Vector3(0.5, 0.7, 0.3),
      isTeamMember: true,
      color: 0xff7a6b, // Coral
      size: 0.12,
    },
    {
      id: "designer",
      role: "PRODUCT DESIGNER",
      targetOffset: new THREE.Vector3(-1.8, 0.8, 0.3),
      teamOffset: new THREE.Vector3(0.2, 0.35, 0.2),
      isTeamMember: true,
      color: 0xb36bff, // Soft Violet
      size: 0.11,
    },
    {
      id: "builder",
      role: "FULL STACK BUILDER",
      targetOffset: new THREE.Vector3(1.6, -0.7, -0.1),
      teamOffset: new THREE.Vector3(0.9, 0.1, 0.25),
      isTeamMember: true,
      color: 0xff8f82, // Warm Coral
      size: 0.12,
    },
    {
      id: "researcher",
      role: "ML RESEARCHER",
      targetOffset: new THREE.Vector3(-1.7, -0.8, -0.2),
      teamOffset: new THREE.Vector3(0.65, -0.25, 0.15),
      isTeamMember: true,
      color: 0x7c5cff, // Ultraviolet
      size: 0.1,
    },
    {
      id: "founder",
      role: "FOUNDER",
      targetOffset: new THREE.Vector3(0.0, 1.9, 0.4),
      teamOffset: new THREE.Vector3(-1.2, 1.5, 0.2),
      isTeamMember: false,
      color: 0xff7a6b, // Coral
      size: 0.11,
    },
    {
      id: "mentor",
      role: "MENTOR / ADVISOR",
      targetOffset: new THREE.Vector3(0.0, -1.7, 0.1),
      teamOffset: new THREE.Vector3(-1.4, -1.2, 0.0),
      isTeamMember: false,
      color: 0x9d8cff, // Muted Violet
      size: 0.11,
    },
  ];

  // 2. Connective Filaments & Flow Pulses
  private linesGroup: THREE.Group;
  private lineObjects: THREE.Line[] = [];
  private lineMaterials: THREE.LineBasicMaterial[] = [];
  private pulsePoints: THREE.Mesh[] = [];
  private pulseMaterials: THREE.MeshBasicMaterial[] = [];
  private connections: PeerConnection[] = [
    // Intra-team links (Team Cluster Polygon)
    { nodeA: 0, nodeB: 1, isTeamLink: true }, // Engineer <-> Designer
    { nodeA: 1, nodeB: 3, isTeamLink: true }, // Designer <-> Researcher
    { nodeA: 3, nodeB: 2, isTeamLink: true }, // Researcher <-> Builder
    { nodeA: 2, nodeB: 0, isTeamLink: true }, // Builder <-> Engineer
    { nodeA: 0, nodeB: 3, isTeamLink: true }, // Cross diagonal: Engineer <-> Researcher
    { nodeA: 1, nodeB: 2, isTeamLink: true }, // Cross diagonal: Designer <-> Builder
    // Community & Mentorship links
    { nodeA: 4, nodeB: 0, isTeamLink: false }, // Founder <-> Engineer
    { nodeA: 4, nodeB: 1, isTeamLink: false }, // Founder <-> Designer
    { nodeA: 5, nodeB: 2, isTeamLink: false }, // Mentor <-> Builder
    { nodeA: 5, nodeB: 3, isTeamLink: false }, // Mentor <-> Researcher
  ];

  // 3. Central Project Core (Luminous nucleus that appears when Team Cluster converges)
  private projectCoreMesh: THREE.Mesh;
  private projectCoreMaterial: THREE.MeshBasicMaterial;
  private projectCoreRing: THREE.Mesh;
  private projectCoreRingMaterial: THREE.MeshStandardMaterial;

  // 4. Outgoing Directional Indicator toward COMPETE
  private outgoingVector: THREE.Line;
  private outgoingMaterial: THREE.LineBasicMaterial;

  // State
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;
  private hoveredNodeIndex: number | null = null;
  private raycaster = new THREE.Raycaster();

  // Scratch objects & cached positions to eliminate per-frame allocations
  private cachedNodePositions: THREE.Vector3[] = Array.from(
    { length: 6 },
    () => new THREE.Vector3(),
  );
  private _scratchVec1 = new THREE.Vector3();
  private _scratchVec2 = new THREE.Vector3();
  private _scratchVec3 = new THREE.Vector3();
  private _scratchVec4 = new THREE.Vector3();
  private _origin = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.2, -0.3);

    // 1. Role Nodes Group
    this.nodesGroup = new THREE.Group();
    this.group.add(this.nodesGroup);
    this.initRoleNodes();

    // 2. Connective Filaments & Pulses
    this.linesGroup = new THREE.Group();
    this.group.add(this.linesGroup);
    this.initConnections();

    // 3. Project Core for Team Cluster (Coral)
    const coreGeo = new THREE.IcosahedronGeometry(0.18, 1);
    this.projectCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff7a6b,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.projectCoreMesh = new THREE.Mesh(coreGeo, this.projectCoreMaterial);
    this.projectCoreMesh.position.set(0.56, 0.22, 0.22);
    this.group.add(this.projectCoreMesh);

    const ringGeo = new THREE.TorusGeometry(0.42, 0.012, 16, 48);
    this.projectCoreRingMaterial = new THREE.MeshStandardMaterial({
      color: 0x18181f,
      emissive: 0xff7a6b,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0,
    });
    this.projectCoreRing = new THREE.Mesh(ringGeo, this.projectCoreRingMaterial);
    this.projectCoreRing.position.copy(this.projectCoreMesh.position);
    this.projectCoreRing.rotation.x = Math.PI * 0.35;
    this.group.add(this.projectCoreRing);

    // 4. Outgoing Vector toward Compete Orbit (Ultraviolet)
    const outgoingGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0.56, 0.22, 0.22),
      new THREE.Vector3(1.4, -1.8, -1.0),
    ]);
    this.outgoingMaterial = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.outgoingVector = new THREE.Line(outgoingGeo, this.outgoingMaterial);
    this.group.add(this.outgoingVector);
  }

  /**
   * Initializes abstract human-centered role nodes
   */
  private initRoleNodes(): void {
    const nodeGeo = new THREE.SphereGeometry(1, 16, 16);
    const haloGeo = new THREE.RingGeometry(1.2, 1.45, 32);
    const outerRingGeo = new THREE.TorusGeometry(1.65, 0.04, 16, 32);

    this.roleConfigs.forEach((cfg) => {
      // Inner luminous core
      const mat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.scale.setScalar(cfg.size);
      this.nodeMeshes.push(mesh);
      this.nodeMaterials.push(mat);
      this.nodesGroup.add(mesh);

      // Atmospheric halo ring
      const haloMat = new THREE.MeshBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.scale.setScalar(cfg.size);
      this.nodeHalos.push(halo);
      this.haloMaterials.push(haloMat);
      this.nodesGroup.add(halo);

      // Geometric role marker ring
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x18181f,
        emissive: cfg.color,
        emissiveIntensity: 0.3,
        metalness: 0.85,
        roughness: 0.25,
        transparent: true,
        opacity: 0,
      });
      const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
      outerRing.scale.setScalar(cfg.size);
      this.nodeOuterRings.push(outerRing);
      this.outerRingMaterials.push(ringMat);
      this.nodesGroup.add(outerRing);
    });
  }

  /**
   * Initializes connecting filaments & traveling light pulses
   */
  private initConnections(): void {
    this.connections.forEach((conn) => {
      const cfgA = this.roleConfigs[conn.nodeA];
      const cfgB = this.roleConfigs[conn.nodeB];

      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        cfgA.targetOffset,
        cfgB.targetOffset,
      ]);

      const lineMat = new THREE.LineBasicMaterial({
        color: conn.isTeamLink ? 0xff7a6b : 0x8b5cf6,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });

      const line = new THREE.Line(lineGeo, lineMat);
      this.lineObjects.push(line);
      this.lineMaterials.push(lineMat);
      this.linesGroup.add(line);

      // Traveling light pulse (Coral for team, Soft Violet for community)
      const pulseGeo = new THREE.SphereGeometry(0.024, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: conn.isTeamLink ? 0xff7a6b : 0xb36bff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const pulse = new THREE.Mesh(pulseGeo, pulseMat);
      this.pulsePoints.push(pulse);
      this.pulseMaterials.push(pulseMat);
      this.linesGroup.add(pulse);
    });
  }

  /**
   * Updates normalized progress (0.00 to 1.00)
   */
  public setProgress(progress: number): void {
    this.targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  /**
   * Frame animation loop
   */
  public update(elapsedTime: number, pointer?: PointerState, isMobile = false): void {
    if (this.currentProgress <= 0.01 && this.targetProgress <= 0.01) {
      if (this.group.visible) this.group.visible = false;
      return;
    }

    this.currentProgress = THREE.MathUtils.lerp(
      this.currentProgress,
      this.targetProgress,
      this.lerpFactor,
    );

    // Hide everything when far outside scene
    if (this.currentProgress <= 0.01) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Subtle pointer parallax
    if (pointer && !isMobile) {
      const targetRotY = pointer.smoothedX * 0.12;
      const targetRotX = -pointer.smoothedY * 0.08;
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotY, 0.06);
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, targetRotX, 0.06);
    }

    const offsetMult = isMobile ? 0.72 : 1.0;

    // =========================================================================
    // STAGE 1: FIRST NODES EMERGE & DRIFT (0.00 -> 0.35)
    // =========================================================================
    const emergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.05, 0.38);

    // =========================================================================
    // STAGE 2: TEAM CLUSTER CONVERGENCE (0.65 -> 0.88)
    // =========================================================================
    const teamConvergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.65, 0.88);

    this.roleConfigs.forEach((cfg, i) => {
      const mesh = this.nodeMeshes[i];
      const halo = this.nodeHalos[i];
      const outerRing = this.nodeOuterRings[i];
      if (!mesh || !halo || !outerRing) return;

      // Zero-allocation vector interpolation
      this._scratchVec1.copy(cfg.targetOffset).multiplyScalar(offsetMult);
      this._scratchVec2.copy(cfg.teamOffset).multiplyScalar(offsetMult);
      this._scratchVec3.lerpVectors(this._origin, this._scratchVec1, emergence);
      this._scratchVec4.lerpVectors(
        this._scratchVec3,
        this._scratchVec2,
        cfg.isTeamMember ? teamConvergence : teamConvergence * 0.5,
      );

      // Subtle organic floating drift
      const floatY = Math.sin(elapsedTime * 1.15 + i * 1.25) * 0.035;
      const floatZ = Math.cos(elapsedTime * 0.85 + i * 1.1) * 0.025;
      const floatX = Math.sin(elapsedTime * 0.65 + i * 0.9) * 0.02;

      mesh.position.set(
        this._scratchVec4.x + floatX,
        this._scratchVec4.y + floatY,
        this._scratchVec4.z + floatZ,
      );
      halo.position.copy(mesh.position);
      outerRing.position.copy(mesh.position);
      this.cachedNodePositions[i].copy(mesh.position);

      // Slow halo and outer ring axial rotation
      halo.rotation.z = elapsedTime * 0.22 + i;
      outerRing.rotation.x = elapsedTime * 0.35 + i;
      outerRing.rotation.y = elapsedTime * 0.28 + i;

      // Hover check
      const isHovered = this.hoveredNodeIndex === i;
      const hoverScale = isHovered ? 1.04 : 1.0;

      // Pulsing and scaling
      const pulse = 1 + Math.sin(elapsedTime * 1.8 + i) * 0.12;
      const nodeScale = cfg.size * (isMobile ? 0.8 : 1.0) * emergence * pulse * hoverScale;
      mesh.scale.setScalar(nodeScale);

      const haloScale =
        cfg.size *
        1.55 *
        (isMobile ? 0.8 : 1.0) *
        emergence *
        (1 + Math.sin(elapsedTime * 1.3 + i) * 0.15) *
        hoverScale;
      halo.scale.setScalar(haloScale);

      const outerRingScale = cfg.size * 1.9 * (isMobile ? 0.8 : 1.0) * emergence * hoverScale;
      outerRing.scale.setScalar(outerRingScale);

      // Opacity
      const alpha = emergence * (cfg.isTeamMember ? 0.92 : 0.75);
      this.nodeMaterials[i].opacity = alpha;
      this.haloMaterials[i].opacity = alpha * (isHovered ? 0.65 : 0.42);
      this.outerRingMaterials[i].opacity = alpha * (isHovered ? 0.75 : 0.5);
    });

    // =========================================================================
    // STAGE 3: CONNECTIVE FILAMENTS & TRAVELING LIGHT PULSES (0.30 -> 0.68)
    // =========================================================================
    const connAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.28, 0.65);

    this.connections.forEach((conn, idx) => {
      const line = this.lineObjects[idx];
      const lineMat = this.lineMaterials[idx];
      const pulseMesh = this.pulsePoints[idx];
      const pulseMat = this.pulseMaterials[idx];
      if (!line || !lineMat || !pulseMesh || !pulseMat) return;

      const pA = this.cachedNodePositions[conn.nodeA];
      const pB = this.cachedNodePositions[conn.nodeB];
      if (!pA || !pB) return;

      // Dynamically update line segment vertices
      const posAttr = line.geometry.attributes.position as THREE.BufferAttribute;
      if (posAttr) {
        posAttr.setXYZ(0, pA.x, pA.y, pA.z);
        posAttr.setXYZ(1, pB.x, pB.y, pB.z);
        posAttr.needsUpdate = true;
      }

      // Highlighting when connected to hovered node or part of active team cluster
      const isHoveredLink =
        this.hoveredNodeIndex === conn.nodeA || this.hoveredNodeIndex === conn.nodeB;
      const teamHighlight = conn.isTeamLink ? 1 + teamConvergence * 0.6 : 1.0;

      lineMat.opacity =
        connAlpha * (conn.isTeamLink ? 0.65 : 0.35) * (isHoveredLink ? 1.3 : 1.0) * teamHighlight;

      // Traveling light pulse animation
      const speed = 0.55 + (idx % 3) * 0.18;
      const t = (elapsedTime * speed) % 1.0;
      pulseMesh.position.lerpVectors(pA, pB, t);
      pulseMat.opacity = connAlpha * (conn.isTeamLink ? 0.85 : 0.5) * (isHoveredLink ? 1.0 : 0.75);
    });

    // =========================================================================
    // STAGE 4: PROJECT NUCLEUS (TEAM CORE) EMERGENCE (0.70 -> 0.90)
    // =========================================================================
    const coreAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.7, 0.88);
    this.projectCoreMaterial.opacity = coreAlpha * 0.85;
    this.projectCoreRingMaterial.opacity = coreAlpha * 0.65;

    const corePulse = 1 + Math.sin(elapsedTime * 2.2) * 0.15;
    this.projectCoreMesh.scale.setScalar(coreAlpha * corePulse);
    this.projectCoreMesh.rotation.y = elapsedTime * 0.45;
    this.projectCoreMesh.rotation.z = elapsedTime * 0.3;

    this.projectCoreRing.scale.setScalar(coreAlpha * (1 + Math.sin(elapsedTime * 1.6) * 0.1));
    this.projectCoreRing.rotation.z = -elapsedTime * 0.35;

    // =========================================================================
    // STAGE 5: OUTGOING VECTOR TOWARD COMPETE (0.85 -> 1.00)
    // =========================================================================
    const outgoingAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.85, 0.98);
    this.outgoingMaterial.opacity = outgoingAlpha * 0.75;
  }

  /**
   * Sets node hover state from raycasting or pointer interaction
   */
  public setHoveredNode(index: number | null): void {
    this.hoveredNodeIndex = index;
  }

  /**
   * Clean Three.js resource disposal
   */
  public dispose(): void {
    this.nodeMeshes.forEach((m) => {
      m.geometry.dispose();
      (m.material as THREE.Material).dispose();
    });
    this.nodeHalos.forEach((h) => {
      h.geometry.dispose();
      (h.material as THREE.Material).dispose();
    });
    this.nodeOuterRings.forEach((r) => {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    });

    this.lineObjects.forEach((l) => l.geometry.dispose());
    this.lineMaterials.forEach((m) => m.dispose());

    this.pulsePoints.forEach((p) => p.geometry.dispose());
    this.pulseMaterials.forEach((m) => m.dispose());

    this.projectCoreMesh.geometry.dispose();
    this.projectCoreMaterial.dispose();
    this.projectCoreRing.geometry.dispose();
    this.projectCoreRingMaterial.dispose();

    this.outgoingVector.geometry.dispose();
    this.outgoingMaterial.dispose();
  }
}
