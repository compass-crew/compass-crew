import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef, type ElementType, type ReactNode } from "react";
import { EASE_OUT_SOFT } from "@/lib/motion";

/**
 * Editorial per-word mask reveal. Uses useInView on the container so the
 * reveal fires once the block enters the viewport, and drives child words
 * via a shared `animate` prop rather than per-word whileInView (which can
 * fail on small masked spans).
 */
export function TextReveal({
  children,
  as: Tag = "span",
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  amount = 0.15,
  once = true,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once, amount });

  const nodes = Array.isArray(children) ? children : [children];
  const words: { text: string; node?: ReactNode; key: string }[] = [];
  let idx = 0;
  nodes.forEach((n) => {
    if (typeof n === "string") {
      n.split(/\s+/)
        .filter(Boolean)
        .forEach((w) => words.push({ text: w, key: `w-${idx++}` }));
    } else {
      words.push({ text: "", node: n, key: `n-${idx++}` });
    }
  });

  if (reduce) {
    return <Tag className={className}>{children}</Tag>;
  }

  const TagAny = Tag as ElementType;
  return (
    <TagAny ref={ref} className={className}>
      {words.map((w, i) => (
        <span
          key={w.key}
          className="inline-block overflow-hidden align-baseline"
          style={{ paddingBottom: "0.08em", marginRight: w.node ? 0 : "0.28em" }}
        >
          <motion.span
            className={`inline-block ${wordClassName ?? ""}`}
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : { y: "110%", opacity: 0 }}
            transition={{
              duration: 0.85,
              ease: EASE_OUT_SOFT,
              delay: delay + i * stagger,
            }}
          >
            {w.node ?? w.text}
          </motion.span>
        </span>
      ))}
    </TagAny>
  );
}
