import * as THREE from "three";

interface NetworkNode {
  position: THREE.Vector3;
  targetScale: number;
}

/**
 * DirectionalSystem
 * Generates and animates subtle directional visual lines, arcs, and network nodes
 * originating from the 3D Compass into the surrounding 3D digital space.
 *
 * Visually communicates: direction, movement, possibility, connection.
 */
export class DirectionalSystem {
  public group: THREE.Group;

  private linesGroup: THREE.Group;
  private nodesMesh: THREE.InstancedMesh;
  private lineMaterials: THREE.LineBasicMaterial[] = [];
  private nodeMaterial: THREE.MeshBasicMaterial;
  private nodeGeometry: THREE.SphereGeometry;

  private currentProgress = 0;
  private targetProgress = 0;
  private lerpFactor = 0.08;
  private maxNodes = 18;
  private dummy = new THREE.Object3D();
  private nodeData: NetworkNode[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.linesGroup = new THREE.Group();
    this.group.add(this.linesGroup);

    // 1. Line Materials (Ultraviolet & Soft Violet)
    const ultravioletLineMat = new THREE.LineBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    const softVioletLineMat = new THREE.LineBasicMaterial({
      color: 0xb36bff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.lineMaterials.push(ultravioletLineMat, softVioletLineMat);

    // 2. Generate Directional Arcs & Vector Paths originating from Compass
    this.initDirectionalLines();

    // 3. Network Destination Nodes (Instanced, Ultraviolet)
    this.nodeGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    this.nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0x7c5cff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
    this.nodesMesh = new THREE.InstancedMesh(this.nodeGeometry, this.nodeMaterial, this.maxNodes);
    this.nodesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.group.add(this.nodesMesh);

    this.initNetworkNodes();
  }

  private initDirectionalLines(): void {
    // 12 curved directional vectors radiating outward into space
    const vectorAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

    vectorAngles.forEach((angleDeg, index) => {
      const angleRad = (angleDeg * Math.PI) / 180;
      const startRadius = 2.1;
      const endRadius = 5.2 + (index % 3) * 1.4;
      const elevation = Math.sin(index * 1.5) * 1.8;

      const p0 = new THREE.Vector3(
        Math.sin(angleRad) * startRadius,
        Math.cos(angleRad) * startRadius,
        0
      );
      const pMid = new THREE.Vector3(
        Math.sin(angleRad + 0.18) * (startRadius + (endRadius - startRadius) * 0.5),
        Math.cos(angleRad + 0.18) * (startRadius + (endRadius - startRadius) * 0.5),
        elevation * 0.5
      );
      const pEnd = new THREE.Vector3(
        Math.sin(angleRad + 0.32) * endRadius,
        Math.cos(angleRad + 0.32) * endRadius,
        elevation
      );

      const curve = new THREE.QuadraticBezierCurve3(p0, pMid, pEnd);
      const points = curve.getPoints(24);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = this.lineMaterials[index % 2];
      const line = new THREE.Line(geometry, material);
      this.linesGroup.add(line);
    });
  }

  private initNetworkNodes(): void {
    this.nodeData = [];
    const vectorAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

    for (let i = 0; i < this.maxNodes; i++) {
      const angleRad = ((vectorAngles[i % vectorAngles.length] || 0) * Math.PI) / 180;
      const distance = 4.8 + (i % 4) * 1.2;
      const zOffset = Math.sin(i * 1.7) * 1.6;

      const pos = new THREE.Vector3(
        Math.sin(angleRad + 0.32) * distance,
        Math.cos(angleRad + 0.32) * distance,
        zOffset
      );

      this.nodeData.push({
        position: pos,
        targetScale: 0.6 + (i % 3) * 0.3,
      });

      this.dummy.position.copy(pos);
      this.dummy.scale.setScalar(0);
      this.dummy.updateMatrix();
      this.nodesMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.nodesMesh.instanceMatrix.needsUpdate = true;
  }

  /**
   * Updates directional network emergence based on transition progress (0.0 to 1.0)
   */
  public setTransitionProgress(progress: number): void {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public update(elapsedTime: number): void {
    if (this.currentProgress <= 0.005 && this.targetProgress <= 0.005) {
      if (this.group.visible) this.group.visible = false;
      return;
    }
    this.currentProgress += (this.targetProgress - this.currentProgress) * this.lerpFactor;

    // Transition curve: vectors start emerging after progress > 0.2
    const lineEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.2, 0.75);
    const lineScale = THREE.MathUtils.lerp(0.3, 1.0, lineEmergence);
    const lineOpacity = lineEmergence * 0.55;

    // Apply scale & rotation to lines group
    this.linesGroup.scale.set(lineScale, lineScale, lineScale);
    this.linesGroup.rotation.z = Math.sin(elapsedTime * 0.2) * 0.04;

    this.lineMaterials.forEach((mat) => {
      mat.opacity = lineOpacity;
    });

    // Animate Network Nodes (illuminate after progress > 0.45)
    const nodeEmergence = THREE.MathUtils.smoothstep(this.currentProgress, 0.45, 0.9);
    this.nodeMaterial.opacity = nodeEmergence * 0.85;

    for (let i = 0; i < this.nodeData.length; i++) {
      const node = this.nodeData[i];
      if (!node) continue;

      const pulse = 1 + Math.sin(elapsedTime * 2.0 + i) * 0.2;
      const scale = node.targetScale * nodeEmergence * pulse;

      this.dummy.position.copy(node.position);
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      this.nodesMesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.nodesMesh.instanceMatrix.needsUpdate = true;

    // Visibility toggle
    this.group.visible = this.currentProgress > 0.05;
  }

  public dispose(): void {
    this.linesGroup.children.forEach((child) => {
      if (child instanceof THREE.Line) {
        child.geometry.dispose();
      }
    });
    this.lineMaterials.forEach((m) => m.dispose());
    this.nodeGeometry.dispose();
    this.nodeMaterial.dispose();
    this.nodesMesh.dispose();
  }
}
