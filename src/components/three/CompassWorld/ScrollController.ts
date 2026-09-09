import { SCENE_ORDER } from "./sceneConfig";
import type { SceneName, ScrollState } from "./types";

export type ScrollListener = (state: ScrollState) => void;

export class ScrollController {
  public state: ScrollState = {
    progress: 0,
    activeScene: "hero",
    sceneProgress: 0,
    velocity: 0,
  };

  private listeners: Set<ScrollListener> = new Set();
  private isListening = false;
  private prevScrollY = 0;
  private maxScroll = 1;
  private rafId: number | null = null;
  private isTicking = false;

  public init(): void {
    if (typeof window === "undefined" || this.isListening) return;

    this.updateMaxScroll();
    this.updateScroll();

    window.addEventListener("scroll", this.handleScroll, { passive: true });
    window.addEventListener("resize", this.handleResize, { passive: true });
    this.isListening = true;
  }

  private handleResize = (): void => {
    this.updateMaxScroll();
    this.handleScroll();
  };

  private updateMaxScroll(): void {
    if (typeof document === "undefined") return;
    const docHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
    const winHeight = window.innerHeight || 1;
    this.maxScroll = Math.max(1, docHeight - winHeight);
  }

  private handleScroll = (): void => {
    if (!this.isTicking) {
      this.isTicking = true;
      this.rafId = requestAnimationFrame(this.onTick);
    }
  };

  private onTick = (): void => {
    this.isTicking = false;
    this.updateScroll();
  };

  private updateScroll(): void {
    if (typeof window === "undefined") return;

    const currentScrollY = window.scrollY || window.pageYOffset || 0;
    const rawProgress = currentScrollY / this.maxScroll;
    const clampedProgress = Math.min(Math.max(rawProgress, 0), 1);

    this.state.velocity = currentScrollY - this.prevScrollY;
    this.prevScrollY = currentScrollY;
    this.state.progress = clampedProgress;

    // Calculate active scene and intra-scene progress
    const totalScenes = SCENE_ORDER.length;
    const sceneIndexFloat = clampedProgress * (totalScenes - 1);
    const lowerIndex = Math.floor(sceneIndexFloat);
    const upperIndex = Math.min(lowerIndex + 1, totalScenes - 1);

    this.state.activeScene = SCENE_ORDER[lowerIndex] || "hero";
    this.state.sceneProgress = sceneIndexFloat - lowerIndex;

    this.notifyListeners();
  }

  public setProgressManually(progress: number): void {
    this.state.progress = Math.min(Math.max(progress, 0), 1);

    const totalScenes = SCENE_ORDER.length;
    const sceneIndexFloat = this.state.progress * (totalScenes - 1);
    const lowerIndex = Math.floor(sceneIndexFloat);

    this.state.activeScene = SCENE_ORDER[lowerIndex] || "hero";
    this.state.sceneProgress = sceneIndexFloat - lowerIndex;

    this.notifyListeners();
  }

  public subscribe(listener: ScrollListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  public dispose(): void {
    if (typeof window === "undefined" || !this.isListening) return;

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
    this.listeners.clear();
    this.isListening = false;
  }
}
