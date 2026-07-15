import type { Variants } from "framer-motion";

export const EASE_OUT_SOFT = [0.2, 0.7, 0.2, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_SOFT },
  },
};

export const stagger = (delayChildren = 0, stagger = 0.08): Variants => ({
  hidden: {},
  show: {
    transition: { delayChildren, staggerChildren: stagger },
  },
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: EASE_OUT_SOFT },
  },
};

export const wordReveal: Variants = {
  hidden: { y: "110%", opacity: 0 },
  show: (i: number = 0) => ({
    y: "0%",
    opacity: 1,
    transition: { duration: 0.75, ease: EASE_OUT_SOFT, delay: 0.04 * i },
  }),
};
