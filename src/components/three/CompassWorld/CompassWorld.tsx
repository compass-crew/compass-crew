import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { SCENE_CONFIGS } from "./sceneConfig";
import { CameraRig } from "./CameraRig";
import { LightingRig } from "./LightingRig";
import { Environment } from "./Environment";
import { ParticleField } from "./ParticleField";
import { SpatialGrid } from "./SpatialGrid";
import { CompassObject3D } from "./Compass3D";
import { PointerController } from "./PointerController";
import { ScrollController } from "./ScrollController";
import { PerformanceController } from "./PerformanceController";
import { SceneTransition } from "./SceneTransition";
import { DirectionalSystem } from "./DirectionalSystem";
import { DiscoverNetwork } from "./DiscoverNetwork";
import { BuildIdeaCore } from "./BuildIdeaCore";
import { LearnKnowledgeCore } from "./LearnKnowledgeCore";
import { ConnectPeerNetwork } from "./ConnectPeerNetwork";
import { CompeteArenaCore } from "./CompeteArenaCore";
import { ShipProofCore } from "./ShipProofCore";
import { GrowOpportunityField } from "./GrowOpportunityField";
import { SpatialText3D } from "@/components/landing/typography/SpatialText3D";
import { ReducedMotionFallback } from "./ReducedMotionFallback";
import { WebGLFallback } from "./WebGLFallback";
import { DebugOverlay } from "./DebugOverlay";
import { CompassWorldContext } from "./CompassWorldContext";
import type { CompassWorldProps, PerformanceStats, QualityLevel, SceneName } from "./types";

/**
 * CompassWorld
 * Root 3D Canvas Engine for the Compass Crew immersive experience.
 *
 * Capabilities:
 * - Single persistent WebGL context for zero context recreation overhead
 * - Declarative scene configurations & smooth continuous interpolation
 * - CameraRig with spring-damped pointer parallax
 * - Procedural Compass3D with dynamic gimbals and needle sweep
 * - Instanced GPU ParticleField & atmospheric digital depth
 * - Quality tier management & DPR clamping
 * - 100% SSR hydration safe & clean resource disposal
 */
export function CompassWorld({
  activeScene: initialScene = "hero",
  transitionFrom,
  transitionTo,
  transitionProgress,
  narrativeProgress,
  scrollProgress: manualScrollProgress,
  quality: initialQuality,
  interactive = true,
  debug: initialDebug = false,
  className = "",
  ctaHovered = false,
  children,
}: CompassWorldProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const ctaHoveredRef = useRef(ctaHovered);
  useEffect(() => {
    ctaHoveredRef.current = ctaHovered;
  }, [ctaHovered]);

  // Client-side detection & fallbacks
  const [mounted, setMounted] = useState(false);
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // State
  const [activeScene, setActiveScene] = useState<SceneName>(initialScene);
  const [scrollProgress, setScrollProgress] = useState(manualScrollProgress ?? 0);
  const [quality, setQualityState] = useState<QualityLevel>(initialQuality || "high");
  const [debug, setDebug] = useState(initialDebug);
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 60,
    frameTime: 16.6,
    drawCalls: 0,
    triangles: 0,
    quality: "high",
    dpr: 1.0,
  });

  // Check client environment
  useEffect(() => {
    setMounted(true);

    // Test WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (!gl) setWebGLSupported(false);
    } catch {
      setWebGLSupported(false);
    }

    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleMotionChange);
    return () => mediaQuery.removeEventListener("change", handleMotionChange);
  }, []);

  // WebGL Engine Lifecycle
  useEffect(() => {
    if (!mounted || !webGLSupported || reducedMotion) return;

    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Performance Init
    const scene = new THREE.Scene();
    const performanceController = new PerformanceController(quality);
    setQualityState(performanceController.quality);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Camera Rig
    const cameraRig = new CameraRig(width, height);
    cameraRig.setTargetConfig(SCENE_CONFIGS[activeScene].camera, true);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: performanceController.quality !== "low",
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(performanceController.dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const lightingRig = new LightingRig();
    lightingRig.setConfig(SCENE_CONFIGS[activeScene].lighting, true);
    scene.add(lightingRig.group);

    // 5. Environment
    const environment = new Environment();
    environment.setConfig(SCENE_CONFIGS[activeScene].environment, true);
    scene.fog = environment.fog;
    scene.add(environment.group);

    // 6. Particle Field (Instanced)
    const particleField = new ParticleField(2500);
    particleField.setConfig(
      SCENE_CONFIGS[activeScene].particles,
      performanceController.getParticleMultiplier()
    );
    scene.add(particleField.mesh);

    // 7. Spatial Grid
    const spatialGrid = new SpatialGrid(32, 32);
    spatialGrid.setConfig(SCENE_CONFIGS[activeScene].grid, true);
    scene.add(spatialGrid.group);

    // 8. Procedural Compass 3D
    const compass = new CompassObject3D();
    compass.setTransform(SCENE_CONFIGS[activeScene].compass, true);
    scene.add(compass.group);

    // 9. Directional Network System (Vectors & connection nodes)
    const directionalSystem = new DirectionalSystem();
    scene.add(directionalSystem.group);

    // 10. Discover Spatial Builder Network (Core nodes, arcs & annotations)
    const discoverNetwork = new DiscoverNetwork();
    scene.add(discoverNetwork.group);

    // 11. Build Idea Core & Construction System
    const buildIdeaCore = new BuildIdeaCore();
    scene.add(buildIdeaCore.group);

    // 12. Learn Knowledge Core & Spatial Learning Network
    const learnKnowledgeCore = new LearnKnowledgeCore();
    scene.add(learnKnowledgeCore.group);

    // 13. Connect Peer Network & Community Mesh
    const connectPeerNetwork = new ConnectPeerNetwork();
    scene.add(connectPeerNetwork.group);

    // 14. Compete Challenge Arena Core
    const competeArenaCore = new CompeteArenaCore();
    scene.add(competeArenaCore.group);

    // 15. Ship Proof of Work Core
    const shipProofCore = new ShipProofCore();
    scene.add(shipProofCore.group);

    // 16. Grow Opportunity Field Core
    const growOpportunityField = new GrowOpportunityField();
    scene.add(growOpportunityField.group);

    // 17. Layer 3 Environmental Spatial Typography
    const spatialText3D = new SpatialText3D();
    scene.add(spatialText3D.group);

    // 14. Interaction & Scroll Controllers
    const pointerController = new PointerController(0.06);
    if (interactive) pointerController.init(container);

    const scrollController = new ScrollController();
    scrollController.init();

    // 10. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          cameraRig.resize(w, h);
          performanceController.updateDpr();
          renderer.setPixelRatio(performanceController.dpr);
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 11. Animation & Scene Choreography Loop
    let animId: number;
    let lastStatsTime = 0;
    const clock = new THREE.Clock();
    let currentConfig = { ...SCENE_CONFIGS[activeScene] };

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      const elapsedTime = clock.getElapsedTime();

      // Update pointer & scroll state
      pointerController.update();
      const pointer = pointerController.state;

      // Handle manual or scroll-driven progression
      if (manualScrollProgress !== undefined) {
        scrollController.setProgressManually(manualScrollProgress);
      }
      const scroll = scrollController.state;
      // Note: React setScrollProgress removed from 60Hz loop to avoid React re-renders

      // Determine Target Config & Directional Network State
      let targetConfig: typeof currentConfig;

      if (narrativeProgress !== undefined) {
        spatialText3D.setProgress(narrativeProgress);
        if (narrativeProgress <= 0.14) {
          // Chapter 1: Hero -> Discover
          const u = narrativeProgress / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.hero,
            SCENE_CONFIGS.discover,
            u
          );
          const isDesktop = container.clientWidth >= 1024;
          const heroX = isDesktop ? 1.8 : 0;
          const discoverX = isDesktop ? 1.0 : 0;
          targetConfig = {
            ...rawTargetConfig,
            compass: {
              ...rawTargetConfig.compass,
              position: [
                THREE.MathUtils.lerp(heroX, discoverX, u),
                rawTargetConfig.compass.position[1],
                rawTargetConfig.compass.position[2],
              ],
            },
          };

          directionalSystem.setTransitionProgress(u);
          discoverNetwork.setTransitionProgress(u);
          discoverNetwork.group.position.x = THREE.MathUtils.lerp(0, discoverX, u);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.28) {
          // Chapter 2: Discover -> Build
          const v = (narrativeProgress - 0.14) / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.discover,
            SCENE_CONFIGS.build,
            v
          );
          const isDesktop = container.clientWidth >= 1024;
          const discoverX = isDesktop ? 1.0 : 0;
          targetConfig = {
            ...rawTargetConfig,
            compass: {
              ...rawTargetConfig.compass,
              position: [
                THREE.MathUtils.lerp(discoverX, 0, v),
                rawTargetConfig.compass.position[1],
                rawTargetConfig.compass.position[2],
              ],
            },
          };

          directionalSystem.setTransitionProgress(Math.max(0, 1 - v * 0.8));
          discoverNetwork.setTransitionProgress(Math.max(0, 1 - v * 0.95));
          buildIdeaCore.setProgress(v);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.42) {
          // Chapter 3: Build -> Learn
          const w = (narrativeProgress - 0.28) / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.build,
            SCENE_CONFIGS.learn,
            w
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(Math.max(0, 1 - w * 0.95));
          learnKnowledgeCore.setProgress(w);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.56) {
          // Chapter 4: Learn -> Connect
          const k = (narrativeProgress - 0.42) / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.learn,
            SCENE_CONFIGS.connect,
            k
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(Math.max(0, 1 - k * 1.5));
          connectPeerNetwork.setProgress(k);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.70) {
          // Chapter 5: Connect -> Compete
          const m = (narrativeProgress - 0.56) / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.connect,
            SCENE_CONFIGS.compete,
            m
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(Math.max(0, 1 - m * 1.6));
          competeArenaCore.setProgress(m);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.84) {
          // Chapter 6: Compete -> Ship
          const s = (narrativeProgress - 0.70) / 0.14;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.compete,
            SCENE_CONFIGS.ship,
            s
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(Math.max(0, 1 - s * 1.6));
          shipProofCore.setProgress(s);
          growOpportunityField.setProgress(0);
        } else if (narrativeProgress <= 0.92) {
          // Chapter 7: Ship -> Grow (0.70 -> 0.92)
          const g = (narrativeProgress - 0.84) / 0.08;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.ship,
            SCENE_CONFIGS.grow,
            g
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(Math.max(0, 1 - g * 1.5));
          growOpportunityField.setProgress(g);
        } else if (narrativeProgress <= 0.95) {
          // Chapter 8: Grow -> Direction (0.92 -> 0.95)
          // Opportunity paths collapse into focus — many paths become one direction
          const d = (narrativeProgress - 0.92) / 0.03;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.grow,
            SCENE_CONFIGS.direction,
            d
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          // Opportunity field collapses as direction emerges
          growOpportunityField.setProgress(Math.max(0, 1 - d * 1.8));
        } else if (narrativeProgress <= 0.98) {
          // Chapter 9: Direction -> CTA (0.95 -> 0.98)
          // The resolved CTA state: calm, confident, centered
          const c = (narrativeProgress - 0.95) / 0.03;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.direction,
            SCENE_CONFIGS.cta,
            c
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);

          // Mobile sizing adjustment for CTA scene (stacking accommodation)
          const isMobile = container.clientWidth < 768;
          if (isMobile) {
            targetConfig.compass.scale = [0.85, 0.85, 0.85];
            targetConfig.compass.position = [0, -0.55, -0.2];
          }

          // Restrained CTA button hover reaction (Requirement 14):
          if (ctaHoveredRef.current) {
            targetConfig.compass.glowIntensity = targetConfig.compass.glowIntensity * 1.25;
            targetConfig.compass.needleSweepSpeed = 0.01;
            targetConfig.lighting.keyIntensity = targetConfig.lighting.keyIntensity * 1.15;
          }
        } else {
          // Chapter 10: CTA -> Footer (0.98 -> 1.00)
          // Visual exhale: camera pulls back, compass scales down to subtle brand visual,
          // environment reaches final calm resting state
          const f = (narrativeProgress - 0.98) / 0.02;
          const rawTargetConfig = SceneTransition.interpolateScenes(
            SCENE_CONFIGS.cta,
            SCENE_CONFIGS.footer,
            f
          );
          targetConfig = {
            ...rawTargetConfig,
            compass: { ...rawTargetConfig.compass },
          };

          directionalSystem.setTransitionProgress(0);
          discoverNetwork.setTransitionProgress(0);
          buildIdeaCore.setProgress(0);
          learnKnowledgeCore.setProgress(0);
          connectPeerNetwork.setProgress(0);
          competeArenaCore.setProgress(0);
          shipProofCore.setProgress(0);
          growOpportunityField.setProgress(0);

          const isMobile = container.clientWidth < 768;
          if (isMobile) {
            targetConfig.compass.scale = [0.55, 0.55, 0.55];
            targetConfig.compass.position = [0, 0.4, 0];
          }
        }
      } else if (transitionFrom && transitionTo && transitionProgress !== undefined) {
        const fromConf = SCENE_CONFIGS[transitionFrom];
        const toConf = SCENE_CONFIGS[transitionTo];
        const rawTargetConfig = SceneTransition.interpolateScenes(fromConf, toConf, transitionProgress);
        targetConfig = {
          ...rawTargetConfig,
          compass: { ...rawTargetConfig.compass },
        };

        // Desktop offset handling during transition
        if (transitionFrom === "hero" && transitionTo === "discover") {
          const isDesktop = container.clientWidth >= 1024;
          const heroX = isDesktop ? 1.8 : 0;
          const discoverX = 0;
          targetConfig.compass.position[0] = THREE.MathUtils.lerp(heroX, discoverX, transitionProgress);
        }

        directionalSystem.setTransitionProgress(transitionProgress);
        discoverNetwork.setTransitionProgress(transitionProgress);
        if (transitionTo === "build") {
          buildIdeaCore.setProgress(transitionProgress);
        } else {
          buildIdeaCore.setProgress(0);
        }
      } else {
        const targetScene = scroll.activeScene;
        if (targetScene !== activeScene) {
          setActiveScene(targetScene);
        }
        const rawTargetConfig = SCENE_CONFIGS[targetScene];
        targetConfig = {
          ...rawTargetConfig,
          compass: { ...rawTargetConfig.compass },
        };

        // Responsive positioning for Hero scene
        if (targetScene === "hero") {
          const isDesktop = container.clientWidth >= 1024;
          targetConfig.compass.position = isDesktop ? [1.8, 0, 0] : [0, -0.85, -0.5];
          targetConfig.compass.scale = isDesktop ? [1.0, 1.0, 1.0] : [0.78, 0.78, 0.78];
        }

        const transProg = scroll.activeScene === "hero" ? scroll.sceneProgress : 1.0;
        directionalSystem.setTransitionProgress(transProg);
        discoverNetwork.setTransitionProgress(transProg);
      }

      // Interpolate scenes smoothly with adaptive velocity-aware factor for fast-scroll catchup
      const scrollVel = Math.abs(scroll.velocity || 0);
      const adaptiveLerp = Math.min(0.24, 0.08 + scrollVel * 0.0015);
      currentConfig = SceneTransition.interpolateScenes(currentConfig, targetConfig, adaptiveLerp);

      // Apply to Rigs
      cameraRig.setTargetConfig(currentConfig.camera);
      cameraRig.update(pointer);

      lightingRig.setConfig(currentConfig.lighting);
      lightingRig.update(pointer);

      environment.setConfig(currentConfig.environment);
      environment.update(elapsedTime);

      particleField.setConfig(
        currentConfig.particles,
        performanceController.getParticleMultiplier()
      );
      particleField.update(elapsedTime, pointer);

      spatialGrid.setConfig(currentConfig.grid);
      spatialGrid.update();

      const isMobile = container.clientWidth < 768;
      directionalSystem.update(elapsedTime);
      discoverNetwork.update(elapsedTime, pointer);
      buildIdeaCore.update(elapsedTime, pointer, isMobile);
      learnKnowledgeCore.update(elapsedTime, pointer, isMobile);
      connectPeerNetwork.update(elapsedTime, pointer, isMobile);
      competeArenaCore.update(elapsedTime, pointer, isMobile);
      shipProofCore.update(elapsedTime, pointer, isMobile);
      growOpportunityField.update(elapsedTime, pointer, isMobile);
      spatialText3D.update(elapsedTime, pointer, isMobile);

      compass.setTransform(currentConfig.compass);
      compass.update(elapsedTime, pointer);

      // Render Scene
      renderer.render(scene, cameraRig.camera);

      // Track Performance Stats (internal tracker; dispatch to React only if debug is enabled)
      const frameStats = performanceController.update(
        time,
        renderer.info.render.calls,
        renderer.info.render.triangles
      );

      if (debug && time - lastStatsTime > 500) {
        lastStatsTime = time;
        setStats(frameStats);
        setScrollProgress(scroll.progress);
      }
    };

    animId = requestAnimationFrame(renderLoop);

    // 12. Complete Resource Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      pointerController.dispose(container);
      scrollController.dispose();

      directionalSystem.dispose();
      discoverNetwork.dispose();
      buildIdeaCore.dispose();
      learnKnowledgeCore.dispose();
      connectPeerNetwork.dispose();
      competeArenaCore.dispose();
      shipProofCore.dispose();
      growOpportunityField.dispose();
      spatialText3D.dispose();
      lightingRig.dispose();
      environment.dispose();
      particleField.dispose();
      spatialGrid.dispose();
      compass.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted, webGLSupported, reducedMotion, quality, manualScrollProgress, interactive]);

  // Context value for child components
  const contextValue = {
    activeScene,
    setActiveScene,
    scrollProgress,
    setScrollProgress,
    quality,
    setQuality: (q: QualityLevel) => setQualityState(q),
    pointer: {
      x: 0,
      y: 0,
      normalizedX: 0,
      normalizedY: 0,
      smoothedX: 0,
      smoothedY: 0,
      vx: 0,
      vy: 0,
      isDown: false,
      isTouch: false,
    },
    stats,
    debug,
    setDebug,
  };

  // SSR or non-WebGL Fallback
  if (!mounted) {
    return <div className={`relative min-h-[460px] w-full bg-[#09090B] ${className}`} />;
  }

  if (!webGLSupported) {
    return <WebGLFallback className={className} />;
  }

  if (reducedMotion) {
    return <ReducedMotionFallback className={className} />;
  }

  return (
    <CompassWorldContext.Provider value={contextValue}>
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        {/* WebGL Canvas Container */}
        <div
          ref={mountRef}
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* DOM Layer (Semantic Content & Child Views) */}
        <div className="relative z-10 w-full h-full">
          {children}
        </div>

        {/* Optional Development Debug HUD */}
        {debug && (
          <DebugOverlay
            activeScene={activeScene}
            onSceneChange={(s) => setActiveScene(s)}
            quality={quality}
            onQualityChange={(q) => setQualityState(q)}
            stats={stats}
            scrollProgress={scrollProgress}
          />
        )}
      </div>
    </CompassWorldContext.Provider>
  );
}
