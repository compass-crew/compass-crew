import * as THREE from "three";
import type { PointerState } from "./types";

interface ProofLayerConfig {
  id: string;
  name: string;
  spreadOffset: THREE.Vector3; // Position when layers unfold
  convergedOffset: THREE.Vector3; // Position when merged into unified proof artifact
  color: number;
  width: number;
  height: number;
}

/**
 * ShipProofCore
 *
 * Implements the 3D Ship / Proof of Work Scene for Compass Crew:
 * - Abstract Proof Core representing work becoming tangible evidence
 * - 4 Translucent Layered Proof Panels:
 *   - CODE: Repository architecture & source evidence (Sky Blue)
 *   - DEMO: Shipped preview & live deployment (Cyan)
 *   - VERIFICATION: Luminous credential shield & check glyph (Warm Gold/Amber)
 *   - PORTFOLIO: Shareable proof artifact & opportunity hook (Indigo)
 * - Concept progression: SUBMISSION -> EVIDENCE LAYERS -> VERIFIED -> PORTFOLIO ARTIFACT
 * - Smooth convergence (0.75 -> 0.92) into a single polished proof tablet
 * - Outgoing directional vector pointing toward GROW / DIRECTION
 */
export class ShipProofCore {
  public group: THREE.Group;

  // 1. Central Project Seed (Enters from Compete)
  private initialSeed: THREE.Mesh;
  private seedMaterial: THREE.MeshBasicMaterial;

  // 2. Layered Proof Panels
  private layersGroup: THREE.Group;
  private layerPlanes: THREE.Mesh[] = [];
  private layerBorders: THREE.LineSegments[] = [];
  private planeMaterials: THREE.MeshStandardMaterial[] = [];
  private borderMaterials: THREE.LineBasicMaterial[] = [];

  private layerConfigs: ProofLayerConfig[] = [
    {
      id: "code",
      name: "CODE / REPOSITORY",
      spreadOffset: new THREE.Vector3(-0.95, 0.58, 0.28),
      convergedOffset: new THREE.Vector3(0, 0.12, 0.06),
      color: 0xf5f2ea, // Warm Ivory
      width: 1.35,
      height: 0.86,
    },
    {
      id: "demo",
      name: "LIVE DEMO",
      spreadOffset: new THREE.Vector3(0.95, 0.52, 0.14),
      convergedOffset: new THREE.Vector3(0, 0.12, 0.04),
      color: 0x7dd3a8, // Mint
      width: 1.4,
      height: 0.88,
    },
    {
      id: "verification",
      name: "VERIFIED CREDENTIAL",
      spreadOffset: new THREE.Vector3(-0.9, -0.55, 0.2),
      convergedOffset: new THREE.Vector3(0, 0.12, 0.08),
      color: 0xfde68a, // Warm Gold Highlight
      width: 1.25,
      height: 0.82,
    },
    {
      id: "portfolio",
      name: "PUBLIC PORTFOLIO",
      spreadOffset: new THREE.Vector3(0.9, -0.52, 0.02),
      convergedOffset: new THREE.Vector3(0, 0.12, 0.02),
      color: 0x7dd3a8, // Mint Verified
      width: 1.32,
      height: 0.84,
    },
  ];

  // 3. Central Verification Shield & Check Glyph
  private shieldMesh: THREE.Mesh;
  private shieldMaterial: THREE.MeshBasicMaterial;
  private checkGlyph: THREE.Line;
  private checkMaterial: THREE.LineBasicMaterial;

  // 4. Outgoing Directional Trajectory toward GROW
  private outgoingTrajectory: THREE.Line;
  private outgoingMaterial: THREE.LineBasicMaterial;

  // State
  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;
  private hoveredLayerIndex: number | null = null;

  // Scratch objects to eliminate per-frame allocations
  private _scratchVec1 = new THREE.Vector3();
  private _scratchVec2 = new THREE.Vector3();
  private _scratchVec3 = new THREE.Vector3();
  private _scratchVec4 = new THREE.Vector3();
  private _origin = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.position.set(0, 0.15, -0.2);

    // 1. Initial Project Seed (Mint)
    const seedGeo = new THREE.OctahedronGeometry(0.24, 0);
    this.seedMaterial = new THREE.MeshBasicMaterial({
      color: 0x7dd3a8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.initialSeed = new THREE.Mesh(seedGeo, this.seedMaterial);
    this.group.add(this.initialSeed);

    // 2. Layered Proof Panels Group
    this.layersGroup = new THREE.Group();
    this.group.add(this.layersGroup);
    this.initProofLayers();

    // 3. Central Verification Shield & Glyph (Mint shield + Warm Ivory check)
    const shieldGeo = new THREE.CircleGeometry(0.3, 8);
    this.shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x7dd3a8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMaterial);
    this.shieldMesh.position.set(0, 0.12, 0.12);
    this.group.add(this.shieldMesh);

    // Check mark glyph points
    const checkPoints: THREE.Vector3[] = [
      new THREE.Vector3(-0.1, 0.12, 0.14),
      new THREE.Vector3(-0.02, 0.04, 0.14),
      new THREE.Vector3(0.12, 0.22, 0.14),
    ];
    const checkGeo = new THREE.BufferGeometry().setFromPoints(checkPoints);
    this.checkMaterial = new THREE.LineBasicMaterial({
      color: 0xf5f2ea,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });
    this.checkGlyph = new THREE.Line(checkGeo, this.checkMaterial);
    this.group.add(this.checkGlyph);

    // 4. Outgoing Trajectory toward GROW (Ultraviolet)
    const outgoingGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0.12, 0.1),
      new THREE.Vector3(1.2, -1.9, -1.0),
    ]);
    this.outgoingMaterial = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.outgoingTrajectory = new THREE.Line(outgoingGeo, this.outgoingMaterial);
    this.group.add(this.outgoingTrajectory);
  }

  /**
   * Initializes precision translucent proof panels
   */
  private initProofLayers(): void {
    this.layerConfigs.forEach((cfg) => {
      // Translucent panel surface (Graphite)
      const planeGeo = new THREE.PlaneGeometry(cfg.width, cfg.height);
      const planeMat = new THREE.MeshStandardMaterial({
        color: 0x18181f,
        emissive: cfg.color,
        emissiveIntensity: 0.35,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      this.layerPlanes.push(plane);
      this.planeMaterials.push(planeMat);
      this.layersGroup.add(plane);

      // Precision wireframe edge border
      const hw = cfg.width * 0.5;
      const hh = cfg.height * 0.5;
      const borderPoints: THREE.Vector3[] = [
        new THREE.Vector3(-hw, -hh, 0.002),
        new THREE.Vector3(hw, -hh, 0.002),
        new THREE.Vector3(hw, hh, 0.002),
        new THREE.Vector3(-hw, hh, 0.002),
        new THREE.Vector3(-hw, -hh, 0.002),
      ];
      const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPoints);
      const borderMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const border = new THREE.LineSegments(borderGeo, borderMat);
      this.layerBorders.push(border);
      this.borderMaterials.push(borderMat);
      this.layersGroup.add(border);
    });
  }

  /**
   * Updates normalized scene progress (0.00 to 1.00)
   */
  public setProgress(progress: number): void {
    this.targetProgress = THREE.MathUtils.clamp(progress, 0, 1);
  }

  /**
   * Sets hovered proof layer index
   */
  public setHoveredLayer(index: number | null): void {
    this.hoveredLayerIndex = index;
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

    // Hide if out of scene
    if (this.currentProgress <= 0.01) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Subtle pointer parallax
    if (pointer && !isMobile) {
      const targetRotY = pointer.smoothedX * 0.09;
      const targetRotX = -pointer.smoothedY * 0.06;
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetRotY, 0.06);
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, targetRotX, 0.06);
    }

    const scaleMult = isMobile ? 0.72 : 1.0;

    // =========================================================================
    // STAGE 1: INITIAL PROJECT SEED ENTERS & DISSOLVES INTO LAYERS (0.00 -> 0.35)
    // =========================================================================
    const seedEntrance = THREE.MathUtils.smoothstep(this.currentProgress, 0.02, 0.22);
    const seedFadeOut = 1 - THREE.MathUtils.smoothstep(this.currentProgress, 0.24, 0.45);
    this.seedMaterial.opacity = seedEntrance * seedFadeOut * 0.85;
    this.initialSeed.scale.setScalar(scaleMult * (1 + Math.sin(elapsedTime * 2.0) * 0.1));
    this.initialSeed.rotation.y = elapsedTime * 0.6;
    this.initialSeed.rotation.z = elapsedTime * 0.4;

    // =========================================================================
    // STAGE 2: EVIDENCE LAYERS UNFOLD & ORBIT (0.20 -> 0.65)
    // =========================================================================
    const layerEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.18, 0.52);

    // =========================================================================
    // STAGE 3: PORTFOLIO CONVERGENCE INTO UNIFIED ARTIFACT (0.70 -> 0.92)
    // =========================================================================
    const convergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.7, 0.9);

    this.layerConfigs.forEach((cfg, i) => {
      const plane = this.layerPlanes[i];
      const border = this.layerBorders[i];
      if (!plane || !border) return;

      // Zero-allocation vector interpolation
      this._scratchVec1.copy(cfg.spreadOffset).multiplyScalar(scaleMult);
      this._scratchVec2.copy(cfg.convergedOffset).multiplyScalar(scaleMult);
      this._scratchVec3.lerpVectors(this._origin, this._scratchVec1, layerEmergence);
      this._scratchVec4.lerpVectors(this._scratchVec3, this._scratchVec2, convergence);

      // Micro floating drift
      const floatY = Math.sin(elapsedTime * 1.1 + i * 1.2) * 0.02;
      const floatZ = Math.cos(elapsedTime * 0.8 + i * 0.9) * 0.015;

      // Hover response
      const isHovered = this.hoveredLayerIndex === i;
      const hoverZ = isHovered ? 0.06 : 0;
      const hoverScale = isHovered ? 1.03 : 1.0;

      plane.position.set(
        this._scratchVec4.x,
        this._scratchVec4.y + floatY,
        this._scratchVec4.z + floatZ + hoverZ,
      );
      border.position.copy(plane.position);

      plane.scale.setScalar(scaleMult * layerEmergence * hoverScale);
      border.scale.copy(plane.scale);

      // Tilt slightly when spread out, straighten when converged
      plane.rotation.y = (1 - convergence) * Math.sin(elapsedTime * 0.5 + i) * 0.08;
      plane.rotation.x = (1 - convergence) * Math.cos(elapsedTime * 0.4 + i) * 0.06;
      border.rotation.copy(plane.rotation);

      // Opacity
      const alpha = layerEmergence * (convergence > 0.85 ? 0.8 : 0.65);
      this.planeMaterials[i].opacity = alpha;
      this.planeMaterials[i].emissiveIntensity = 0.35 + (isHovered ? 0.35 : 0) + convergence * 0.25;
      this.borderMaterials[i].opacity = layerEmergence * (isHovered ? 0.95 : 0.6);
    });

    // =========================================================================
    // STAGE 4: VERIFICATION SHIELD & CHECK GLYPH (0.55 -> 0.85)
    // =========================================================================
    const shieldAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.55, 0.78);
    this.shieldMaterial.opacity = shieldAlpha * 0.75;
    this.checkMaterial.opacity = shieldAlpha * 0.95;

    const shieldPulse = 1 + Math.sin(elapsedTime * 1.8) * 0.06;
    this.shieldMesh.scale.setScalar(scaleMult * shieldAlpha * shieldPulse);
    this.checkGlyph.scale.copy(this.shieldMesh.scale);

    // =========================================================================
    // STAGE 5: OUTGOING TRAJECTORY TOWARD GROW (0.88 -> 1.00)
    // =========================================================================
    const outgoingAlpha = THREE.MathUtils.smoothstep(this.currentProgress, 0.88, 0.98);
    this.outgoingMaterial.opacity = outgoingAlpha * 0.75;
  }

  /**
   * Clean resource disposal
   */
  public dispose(): void {
    this.initialSeed.geometry.dispose();
    this.seedMaterial.dispose();

    this.layerPlanes.forEach((p) => p.geometry.dispose());
    this.planeMaterials.forEach((m) => m.dispose());

    this.layerBorders.forEach((b) => b.geometry.dispose());
    this.borderMaterials.forEach((m) => m.dispose());

    this.shieldMesh.geometry.dispose();
    this.shieldMaterial.dispose();

    this.checkGlyph.geometry.dispose();
    this.checkMaterial.dispose();

    this.outgoingTrajectory.geometry.dispose();
    this.outgoingMaterial.dispose();
  }
}
