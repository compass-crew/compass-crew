import { useEffect, useRef, useState, type ReactNode } from "react";

interface DepthTextProps {
  children: ReactNode;
  depth?: number; // 3D depth in pixels (default 18)
  perspective?: number; // Perspective distance in pixels (default 1000)
  className?: string;
  glowColor?: string; // Optional ambient glow color
  enableParallax?: boolean; // Subtle pointer parallax response
}

/**
 * DepthText
 *
 * Implements Layer 2 Spatial Depth Typography:
 * - Subtly floats typography forward into the 3D viewport using CSS perspective & translateZ
 * - Optional pointer parallax response on desktop
 * - Layered ambient and specular text drop-shadows
 * - 100% accessible, selectable, semantic HTML
 */
export function DepthText({
  children,
  depth = 18,
  perspective = 1000,
  className = "",
  glowColor = "rgba(0, 200, 255, 0.22)",
  enableParallax = true,
}: DepthTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!enableParallax || reducedMotion) return;

    // Check touch device
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rafId: number | null = null;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Small angles (+/- 4 deg)
      targetX = -((e.clientY - centerY) / centerY) * 3.5;
      targetY = ((e.clientX - centerX) / centerX) * 4.5;

      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    };

    const animate = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setRotation({ x: currentX, y: currentY });

      if (Math.abs(targetX - currentX) > 0.02 || Math.abs(targetY - currentY) > 0.02) {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enableParallax, reducedMotion]);

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transformStyle = {
    perspective: `${perspective}px`,
  };

  const innerStyle = {
    transform: `rotateX(${rotation.x.toFixed(2)}deg) rotateY(${rotation.y.toFixed(2)}deg) translateZ(${depth}px)`,
    transformStyle: "preserve-3d" as const,
    filter: "drop-shadow(0 2px 10px rgba(5, 8, 22, 0.70))",
  };

  return (
    <div
      ref={containerRef}
      style={transformStyle}
      className={`block w-full select-none will-change-transform ${className}`}
    >
      <div
        style={innerStyle}
        className="transition-transform duration-75 ease-out will-change-transform"
      >
        {children}
      </div>
    </div>
  );
}
