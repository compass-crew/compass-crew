import * as THREE from "three";
import type { GridConfig } from "./types";

export class SpatialGrid {
  public group: THREE.Group;

  private gridHelper: THREE.GridHelper;
  private currentOpacity = 0;
  private targetOpacity = 0;
  private targetY = -2.0;
  private lerpFactor = 0.08;

  constructor(size = 32, divisions = 32) {
    this.group = new THREE.Group();

    // Center line in Ultraviolet, grid lines in subdued Graphite
    this.gridHelper = new THREE.GridHelper(size, divisions, 0x7c5cff, 0x22222a);
    this.gridHelper.position.y = -2.0;

    const mat = this.gridHelper.material as THREE.LineBasicMaterial;
    mat.transparent = true;
    mat.opacity = 0;
    mat.depthWrite = false;

    this.group.add(this.gridHelper);
  }

  public setConfig(config: GridConfig, immediate = false): void {
    this.targetOpacity = config.visible ? config.opacity : 0;
    this.targetY = config.yOffset;

    if (immediate) {
      this.currentOpacity = this.targetOpacity;
      (this.gridHelper.material as THREE.LineBasicMaterial).opacity = this.currentOpacity;
      this.gridHelper.position.y = this.targetY;
    }
  }

  public update(): void {
    this.currentOpacity += (this.targetOpacity - this.currentOpacity) * this.lerpFactor;
    (this.gridHelper.material as THREE.LineBasicMaterial).opacity = this.currentOpacity;

    this.gridHelper.position.y += (this.targetY - this.gridHelper.position.y) * this.lerpFactor;

    // Toggle visibility flag when completely faded out to save draw calls
    this.gridHelper.visible = this.currentOpacity > 0.005;
  }

  public dispose(): void {
    this.gridHelper.geometry.dispose();
    (this.gridHelper.material as THREE.Material).dispose();
  }
}
