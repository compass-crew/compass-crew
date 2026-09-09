import { SCENE_ORDER } from "./sceneConfig";
import type { PerformanceStats, QualityLevel, SceneName } from "./types";

interface DebugOverlayProps {
  activeScene: SceneName;
  onSceneChange: (scene: SceneName) => void;
  quality: QualityLevel;
  onQualityChange: (quality: QualityLevel) => void;
  stats: PerformanceStats;
  scrollProgress: number;
}

/**
 * DebugOverlay
 * Development-only diagnostic HUD for inspecting 3D engine metrics and testing scenes.
 * Automatically suppressed in production builds.
 */
export function DebugOverlay({
  activeScene,
  onSceneChange,
  quality,
  onQualityChange,
  stats,
  scrollProgress,
}: DebugOverlayProps) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <aside
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 rounded-xl border border-white/10 bg-[#09090B]/95 p-3.5 text-xs text-white shadow-2xl backdrop-blur-lg font-cc-mono max-w-xs"
      aria-label="3D Engine Debug Controls"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-1.5 font-bold text-[#7C5CFF]">
        <span>COMPASS 3D HUD</span>
        <span className="text-[10px] text-white/50">DEV ONLY</span>
      </div>

      {/* Real-time Performance Metrics */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#B8B4B0]">
        <div>
          FPS: <span className="font-bold text-white">{stats.fps}</span>
        </div>
        <div>
          DPR: <span className="font-bold text-white">{stats.dpr}x</span>
        </div>
        <div>
          Draw Calls: <span className="font-bold text-white">{stats.drawCalls}</span>
        </div>
        <div>
          Scroll: <span className="font-bold text-white">{(scrollProgress * 100).toFixed(1)}%</span>
        </div>
      </div>

      {/* Scene Switcher */}
      <div className="mt-1">
        <label htmlFor="debug-scene-select" className="block text-[10px] text-white/60 mb-0.5">
          Scene State:
        </label>
        <select
          id="debug-scene-select"
          value={activeScene}
          onChange={(e) => onSceneChange(e.target.value as SceneName)}
          className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
        >
          {SCENE_ORDER.map((scene) => (
            <option key={scene} value={scene} className="bg-[#111116] text-white">
              {scene}
            </option>
          ))}
        </select>
      </div>

      {/* Quality Switcher */}
      <div>
        <label htmlFor="debug-quality-select" className="block text-[10px] text-white/60 mb-0.5">
          Quality Tier:
        </label>
        <select
          id="debug-quality-select"
          value={quality}
          onChange={(e) => onQualityChange(e.target.value as QualityLevel)}
          className="w-full rounded border border-white/20 bg-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#7C5CFF]"
        >
          <option value="ultra" className="bg-[#111116] text-white">Ultra (DPR 1.5, 2.5k pts)</option>
          <option value="high" className="bg-[#111116] text-white">High (DPR 1.25, 2.0k pts)</option>
          <option value="medium" className="bg-[#111116] text-white">Medium (DPR 1.0, 1.2k pts)</option>
          <option value="low" className="bg-[#111116] text-white">Low (DPR 1.0, 500 pts)</option>
        </select>
      </div>
    </aside>
  );
}
