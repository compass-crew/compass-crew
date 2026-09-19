import * as THREE from "three";
import type { PointerState } from "@/components/three/CompassWorld/types";

interface SpatialSignConfig {
  id: string;
  text: string;
  subtext?: string;
  position: THREE.Vector3;
  width: number;
  height: number;
  activeRange: [number, number]; // narrativeProgress min, max
  color?: string;
}

/**
 * SpatialText3D
 *
 * Implements Layer 3 Environmental Spatial Typography in Three.js:
 * - Renders crisp, high-resolution monospace environmental signage
 * - Sits in 3D world depth as restrained architectural coordinates
 * - Interacts with scene lighting, camera parallax, and scroll progression
 * - Restrained matte finish, low opacity, zero neon bloom
 * - Clean GPU disposal and zero DOM overhead
 */
export class SpatialText3D {
  public group: THREE.Group;
  private signMeshes: THREE.Mesh[] = [];
  private signMaterials: THREE.MeshBasicMaterial[] = [];
  private signTextures: THREE.CanvasTexture[] = [];

  private configs: SpatialSignConfig[] = [
    {
      id: "hero-north",
      text: "BEARING 000° // TRUE NORTH",
      position: new THREE.Vector3(1.8, -2.3, 0.4),
      width: 2.2,
      height: 0.35,
      activeRange: [0.0, 0.22],
      color: "#8C96AA",
    },
    {
      id: "discover-node",
      text: "SPATIAL GRID // 01 DISCOVER",
      position: new THREE.Vector3(1.0, -2.2, -1.2),
      width: 2.4,
      height: 0.35,
      activeRange: [0.24, 0.46],
      color: "#8C96AA",
    },
    {
      id: "build-node",
      text: "CONSTRUCTION MATRIX // 02 BUILD",
      position: new THREE.Vector3(0, -2.2, -1.2),
      width: 2.6,
      height: 0.35,
      activeRange: [0.48, 0.72],
      color: "#8C96AA",
    },
    {
      id: "learn-node",
      text: "KNOWLEDGE SYNTHESIS // 03 LEARN",
      position: new THREE.Vector3(0, -2.2, -1.2),
      width: 2.7,
      height: 0.35,
      activeRange: [0.74, 1.0],
      color: "#8C96AA",
    },
  ];

  private currentProgress = 0;
  private targetProgress = 0;

  constructor() {
    this.group = new THREE.Group();
    this.initSigns();
  }

  private createSignTexture(text: string, color: string = "#8C96AA"): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle hairline border bracket frame
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // High precision monospace typography
      ctx.font = "500 42px 'Geist Mono', 'IBM Plex Mono', monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Crisp matte finish without blur bloom
      ctx.fillStyle = color;
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    this.signTextures.push(texture);
    return texture;
  }

  private initSigns(): void {
    // Only execute if browser environment
    if (typeof document === "undefined") return;

    this.configs.forEach((cfg) => {
      const texture = this.createSignTexture(cfg.text, cfg.color);
      const geo = new THREE.PlaneGeometry(cfg.width, cfg.height);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      this.signMaterials.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(cfg.position);
      this.signMeshes.push(mesh);
      this.group.add(mesh);
    });
  }

  public setProgress(progress: number): void {
    this.targetProgress = Math.min(Math.max(progress, 0), 1);
  }

  public update(elapsedTime: number, pointer?: PointerState, isMobile: boolean = false): void {
    this.currentProgress += (this.targetProgress - this.currentProgress) * 0.1;

    // Mobile fallback: hide 3D environmental text on small screens to avoid clutter
    if (isMobile) {
      this.group.visible = false;
      return;
    }
    this.group.visible = true;

    // Pointer parallax
    if (pointer) {
      this.group.rotation.x = -pointer.smoothedY * 0.02;
      this.group.rotation.y = pointer.smoothedX * 0.03;
    }

    // Update each sign's visibility and gentle breath
    this.configs.forEach((cfg, idx) => {
      const mat = this.signMaterials[idx];
      const mesh = this.signMeshes[idx];
      if (!mat || !mesh) return;

      const [minP, maxP] = cfg.activeRange;
      const isActive = this.currentProgress >= minP && this.currentProgress <= maxP;

      if (isActive) {
        // Fade in & out at boundary edges
        const fadeIn = THREE.MathUtils.smoothstep(this.currentProgress, minP, minP + 0.06);
        const fadeOut = 1 - THREE.MathUtils.smoothstep(this.currentProgress, maxP - 0.06, maxP);
        const alpha = Math.min(fadeIn, fadeOut);

        // Restrained matte opacity
        mat.opacity = alpha * 0.4;
        mesh.visible = mat.opacity > 0.02;

        // Subtle architectural float
        mesh.position.y = cfg.position.y + Math.sin(elapsedTime * 1.2 + idx) * 0.015;
      } else {
        mat.opacity = 0;
        mesh.visible = false;
      }
    });
  }

  public dispose(): void {
    this.signMaterials.forEach((m) => m.dispose());
    this.signTextures.forEach((t) => t.dispose());
    this.signMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      this.group.remove(mesh);
    });
    this.signMeshes = [];
    this.signMaterials = [];
    this.signTextures = [];
  }
}
