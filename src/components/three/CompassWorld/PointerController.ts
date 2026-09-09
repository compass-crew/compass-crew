import type { PointerState } from "./types";

export class PointerController {
  public state: PointerState = {
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
  };

  private prevX = 0;
  private prevY = 0;
  private isListening = false;
  private damping = 0.06;

  constructor(damping = 0.06) {
    this.damping = damping;
  }

  public init(targetElement?: HTMLElement): void {
    if (typeof window === "undefined" || this.isListening) return;

    this.state.isTouch = window.matchMedia("(pointer: coarse)").matches;

    // Center normalized values initially
    this.state.x = window.innerWidth / 2;
    this.state.y = window.innerHeight / 2;
    this.prevX = this.state.x;
    this.prevY = this.state.y;

    const target = targetElement || window;

    target.addEventListener("pointermove", this.handlePointerMove as EventListener, { passive: true });
    target.addEventListener("pointerdown", this.handlePointerDown as EventListener, { passive: true });
    target.addEventListener("pointerup", this.handlePointerUp as EventListener, { passive: true });
    target.addEventListener("pointerleave", this.handlePointerLeave as EventListener, { passive: true });

    this.isListening = true;
  }

  private handlePointerMove = (e: PointerEvent): void => {
    if (e.pointerType === "touch") {
      this.state.isTouch = true;
      return; // Do not apply pointer chase on touch devices
    }

    this.state.x = e.clientX;
    this.state.y = e.clientY;

    const w = window.innerWidth || 1;
    const h = window.innerHeight || 1;

    this.state.normalizedX = (e.clientX / w) * 2 - 1;
    this.state.normalizedY = -(e.clientY / h) * 2 + 1;

    this.state.vx = e.clientX - this.prevX;
    this.state.vy = e.clientY - this.prevY;
    this.prevX = e.clientX;
    this.prevY = e.clientY;
  };

  private handlePointerDown = (): void => {
    this.state.isDown = true;
  };

  private handlePointerUp = (): void => {
    this.state.isDown = false;
  };

  private handlePointerLeave = (): void => {
    this.state.normalizedX = 0;
    this.state.normalizedY = 0;
  };

  /**
   * Called on every animation frame to update spring-damped coordinates
   */
  public update(): void {
    if (this.state.isTouch) {
      // Keep smoothed values at center on touch devices
      this.state.smoothedX += (0 - this.state.smoothedX) * this.damping;
      this.state.smoothedY += (0 - this.state.smoothedY) * this.damping;
      return;
    }

    this.state.smoothedX += (this.state.normalizedX - this.state.smoothedX) * this.damping;
    this.state.smoothedY += (this.state.normalizedY - this.state.smoothedY) * this.damping;

    // Decay velocity
    this.state.vx *= 0.85;
    this.state.vy *= 0.85;
  }

  public dispose(targetElement?: HTMLElement): void {
    if (typeof window === "undefined" || !this.isListening) return;

    const target = targetElement || window;
    target.removeEventListener("pointermove", this.handlePointerMove as EventListener);
    target.removeEventListener("pointerdown", this.handlePointerDown as EventListener);
    target.removeEventListener("pointerup", this.handlePointerUp as EventListener);
    target.removeEventListener("pointerleave", this.handlePointerLeave as EventListener);

    this.isListening = false;
  }
}
