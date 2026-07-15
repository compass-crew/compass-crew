import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp, stagger } from "@/lib/motion";

export function Reveal({
  children,
  className,
  delay = 0,
  variants,
  as = "div",
  once = true,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variants?: Variants;
  as?: "div" | "section" | "li" | "span" | "p" | "h2" | "h3";
  once?: boolean;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once, amount }}
      variants={variants ?? fadeUp}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

export function StaggerGroup({
  children,
  className,
  delayChildren = 0,
  stagger: staggerChildren = 0.08,
  amount = 0.1,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delayChildren?: number;
  stagger?: number;
  amount?: number;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const reduce = useReducedMotion();
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "show"}
      viewport={{ once: true, amount }}
      variants={stagger(delayChildren, staggerChildren)}
    >
      {children}
    </Comp>
  );
}
