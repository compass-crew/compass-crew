import { motion, useReducedMotion } from "framer-motion";

/**
 * Slow-drifting ambient orbs. Purely decorative.
 */
export function AmbientOrbs({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const orbs = [
    {
      style: {
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 55%, transparent), transparent 70%)",
      },
      pos: "top-[6%] left-[8%]",
      size: "h-[42rem] w-[42rem]",
      d: 22,
    },
    {
      style: {
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--color-secondary) 50%, transparent), transparent 70%)",
      },
      pos: "top-[28%] right-[-8%]",
      size: "h-[36rem] w-[36rem]",
      d: 28,
    },
    {
      style: {
        background:
          "radial-gradient(closest-side, color-mix(in oklab, var(--color-accent) 40%, transparent), transparent 70%)",
      },
      pos: "bottom-[-14%] left-[28%]",
      size: "h-[40rem] w-[40rem]",
      d: 34,
    },
  ] as const;
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className={`absolute ${o.pos} ${o.size} rounded-full opacity-60 mix-blend-screen blur-[80px]`}
          style={o.style}
          animate={reduce ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: o.d, ease: "easeInOut", repeat: Infinity }}
        />
      ))}
    </div>
  );
}
