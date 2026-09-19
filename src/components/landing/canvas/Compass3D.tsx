import { useEffect, useRef } from "react";
import * as THREE from "three";
import { createCompassMaterials } from "./materials";
import type { CompassProps } from "./CompassTypes";

/**
 * Compass3D
 * Reusable, procedural Three.js component embodying the Compass Crew visual motif.
 *
 * Performance features:
 * - 100% procedural geometry (Zero heavy external .gltf downloads)
 * - Clamped devicePixelRatio (max 1.5)
 * - Automatic resource disposal on unmount
 * - Respects prefers-reduced-motion
 * - Spring-damped interactive mouse parallax
 */
export function Compass3D({
  size = 420,
  mode = "hero",
  bearing = 0,
  interactive = true,
  glow = true,
  className = "",
}: CompassProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const width = container.clientWidth || (typeof size === "number" ? size : 420);
    const height = container.clientHeight || (typeof size === "number" ? size : 420);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Materials
    const materials = createCompassMaterials();

    // 4. Compass Assembly Group
    const compassGroup = new THREE.Group();
    scene.add(compassGroup);

    // A. Outer Milled Bezel
    const bezelGeo = new THREE.TorusGeometry(2.4, 0.18, 24, 64);
    const bezelMesh = new THREE.Mesh(bezelGeo, materials.bezel);
    compassGroup.add(bezelMesh);

    // B. Inner Gyroscopic Gimbal Ring
    const gimbalGeo = new THREE.TorusGeometry(2.1, 0.08, 16, 48);
    const gimbalMesh = new THREE.Mesh(gimbalGeo, materials.gimbal);
    compassGroup.add(gimbalMesh);

    // C. Dial Face (Subtle dark backing disc)
    const dialGeo = new THREE.CircleGeometry(2.0, 48);
    const dialMesh = new THREE.Mesh(dialGeo, materials.dialFace);
    dialMesh.position.z = -0.05;
    compassGroup.add(dialMesh);

    // D. Tick Marks (InstancedMesh for optimal single draw-call performance)
    const tickCount = 24;
    const tickGeo = new THREE.BoxGeometry(0.025, 0.18, 0.02);
    const tickInstanced = new THREE.InstancedMesh(tickGeo, materials.tickMark, tickCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < tickCount; i++) {
      const angle = (i * Math.PI * 2) / tickCount;
      const radius = 1.85;
      dummy.position.set(Math.sin(angle) * radius, Math.cos(angle) * radius, 0.01);
      dummy.rotation.z = -angle;
      dummy.scale.set(i % 6 === 0 ? 1.8 : 1.0, i % 6 === 0 ? 1.5 : 1.0, 1.0);
      dummy.updateMatrix();
      tickInstanced.setMatrixAt(i, dummy.matrix);
    }
    tickInstanced.instanceMatrix.needsUpdate = true;
    compassGroup.add(tickInstanced);

    // E. Magnetic Needle Assembly
    const needleGroup = new THREE.Group();
    compassGroup.add(needleGroup);

    // North Needle (Electric Cyan Tip)
    const northShape = new THREE.Shape();
    northShape.moveTo(0, 1.7);
    northShape.lineTo(0.24, 0);
    northShape.lineTo(0, -0.15);
    northShape.lineTo(-0.24, 0);
    northShape.closePath();

    const needleExtrudeSettings = {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
    };

    const northGeo = new THREE.ExtrudeGeometry(northShape, needleExtrudeSettings);
    const northMesh = new THREE.Mesh(northGeo, materials.northNeedle);
    northMesh.position.z = 0.02;
    needleGroup.add(northMesh);

    // South Needle (Brand Violet Tail)
    const southShape = new THREE.Shape();
    southShape.moveTo(0, -1.7);
    southShape.lineTo(0.22, 0);
    southShape.lineTo(0, 0.15);
    southShape.lineTo(-0.22, 0);
    southShape.closePath();

    const southGeo = new THREE.ExtrudeGeometry(southShape, needleExtrudeSettings);
    const southMesh = new THREE.Mesh(southGeo, materials.southNeedle);
    southMesh.position.z = 0.02;
    needleGroup.add(southMesh);

    // F. Central Pivot Bearing (Gold Accent)
    const pivotGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.18, 24);
    pivotGeo.rotateX(Math.PI / 2);
    const pivotMesh = new THREE.Mesh(pivotGeo, materials.goldBearing);
    pivotMesh.position.z = 0.08;
    needleGroup.add(pivotMesh);

    // 5. Lighting Setup
    // Cool Key Light
    const keyLight = new THREE.DirectionalLight(0x7c83ff, 2.2);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    // Cyan Edge Rim Light
    const rimLight = new THREE.DirectionalLight(0x00c8ff, 1.8);
    rimLight.position.set(-5, -4, 4);
    scene.add(rimLight);

    // Soft Ambient Fill
    const ambientLight = new THREE.AmbientLight(0x0d1426, 1.2);
    scene.add(ambientLight);

    // Optional Point Light on North needle for soft glow
    if (glow) {
      const needleLight = new THREE.PointLight(0x00c8ff, 1.5, 3.5);
      needleLight.position.set(0, 1.2, 0.3);
      needleGroup.add(needleLight);
    }

    // 6. Interactive Mouse Parallax
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handlePointerMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 0.45;
      targetRotX = -y * 0.45;
    };

    if (interactive && !prefersReducedMotion) {
      window.addEventListener("pointermove", handlePointerMove);
    }

    // 7. Responsive ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 8. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Smooth lerp for interactive parallax
        currentRotX += (targetRotX - currentRotX) * 0.08;
        currentRotY += (targetRotY - currentRotY) * 0.08;

        compassGroup.rotation.x = currentRotX;
        compassGroup.rotation.y = currentRotY;

        // Subtle gyroscopic gimbal oscillation
        gimbalMesh.rotation.x = Math.sin(elapsed * 0.6) * 0.08;
        gimbalMesh.rotation.y = Math.cos(elapsed * 0.5) * 0.08;

        // Needle orientation behavior by mode
        if (mode === "search") {
          needleGroup.rotation.z = Math.sin(elapsed * 2.5) * 0.85 + (bearing * Math.PI) / 180;
        } else {
          // Hero idle subtle breathing float
          needleGroup.rotation.z = (bearing * Math.PI) / 180 + Math.sin(elapsed * 1.2) * 0.04;
        }
      } else {
        needleGroup.rotation.z = (bearing * Math.PI) / 180;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Comprehensive Resource Cleanup
    return () => {
      cancelAnimationFrame(animId);
      if (interactive && !prefersReducedMotion) {
        window.removeEventListener("pointermove", handlePointerMove);
      }
      resizeObserver.disconnect();

      bezelGeo.dispose();
      gimbalGeo.dispose();
      dialGeo.dispose();
      tickGeo.dispose();
      northGeo.dispose();
      southGeo.dispose();
      pivotGeo.dispose();

      Object.values(materials).forEach((mat) => mat.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, mode, bearing, interactive, glow]);

  return (
    <div
      ref={mountRef}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        width: typeof size === "number" ? `${size}px` : size,
        height: typeof size === "number" ? `${size}px` : size,
      }}
      aria-hidden="true"
    />
  );
}
