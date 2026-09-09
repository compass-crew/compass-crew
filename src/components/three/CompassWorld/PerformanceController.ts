import type { PerformanceStats, QualityLevel } from "./types";

export class PerformanceController {
  public quality: QualityLevel = "high";
  public dpr = 1.0;

  private frameCount = 0;
  private lastTime = 0;
  private fpsBuffer: number[] = [];
  private currentFPS = 60;
  private lastDowngradeTime = 0;
  private autoAdjust = true;

  constructor(preferredQuality?: QualityLevel, autoAdjust = true) {
    this.autoAdjust = autoAdjust;
    this.quality = preferredQuality || this.detectOptimalQuality();
    this.updateDpr();
  }

  public detectOptimalQuality(): QualityLevel {
    if (typeof window === "undefined") return "medium";

    const isMobile = window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(pointer: coarse)").matches;
    const cores = navigator.hardwareConcurrency || 4;
    const isLowPower = cores <= 4 || isMobile;

    if (isLowPower) {
      return "medium";
    }

    if (cores >= 8 && window.innerWidth >= 1440) {
      return "ultra";
    }

    return "high";
  }

  public setQuality(quality: QualityLevel): void {
    this.quality = quality;
    this.updateDpr();
  }

  public updateDpr(): void {
    if (typeof window === "undefined") {
      this.dpr = 1.0;
      return;
    }

    const deviceDpr = window.devicePixelRatio || 1;

    switch (this.quality) {
      case "ultra":
        this.dpr = Math.min(deviceDpr, 1.5);
        break;
      case "high":
        this.dpr = Math.min(deviceDpr, 1.25);
        break;
      case "medium":
      case "low":
        this.dpr = 1.0;
        break;
    }
  }

  public getParticleMultiplier(): number {
    switch (this.quality) {
      case "ultra":
        return 1.2;
      case "high":
        return 1.0;
      case "medium":
        return 0.55;
      case "low":
        return 0.25;
    }
  }

  public getSegmentsMultiplier(): number {
    switch (this.quality) {
      case "ultra":
        return 1.2;
      case "high":
        return 1.0;
      case "medium":
        return 0.7;
      case "low":
        return 0.5;
    }
  }

  /**
   * Called on every animation frame to track FPS and apply adaptive degradation if needed.
   */
  public update(time: number, drawCalls = 0, triangles = 0): PerformanceStats {
    if (this.lastTime === 0) {
      this.lastTime = time;
      return this.getStats(drawCalls, triangles);
    }

    const delta = (time - this.lastTime) / 1000;
    this.lastTime = time;
    this.frameCount++;

    if (delta > 0) {
      const instantFPS = 1 / delta;
      this.fpsBuffer.push(instantFPS);
      if (this.fpsBuffer.length > 60) {
        this.fpsBuffer.shift();
      }
    }

    // Every 60 frames, evaluate moving average
    if (this.frameCount % 60 === 0 && this.fpsBuffer.length > 0) {
      const avgFPS = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length;
      this.currentFPS = Math.round(avgFPS);

      // Auto step-down if FPS is struggling (< 28 FPS) and not downgraded in last 6 seconds
      if (this.autoAdjust && avgFPS < 28 && time - this.lastDowngradeTime > 6000) {
        this.downgradeQuality();
        this.lastDowngradeTime = time;
      }
    }

    return this.getStats(drawCalls, triangles);
  }

  private downgradeQuality(): void {
    if (this.quality === "ultra") {
      this.setQuality("high");
    } else if (this.quality === "high") {
      this.setQuality("medium");
    } else if (this.quality === "medium") {
      this.setQuality("low");
    }
  }

  public getStats(drawCalls = 0, triangles = 0): PerformanceStats {
    return {
      fps: this.currentFPS,
      frameTime: this.currentFPS > 0 ? +(1000 / this.currentFPS).toFixed(1) : 16.6,
      drawCalls,
      triangles,
      quality: this.quality,
      dpr: this.dpr,
    };
  }
}
