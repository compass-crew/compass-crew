import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SectionId =
  | "hero"
  | "discover"
  | "build"
  | "learn"
  | "connect"
  | "compete"
  | "ship"
  | "grow"
  | "direction"
  | "cta"
  | "footer";

export type SectionPhase = "enter" | "active" | "exit" | "inactive";

export interface SectionConfig {
  id: SectionId;
  label: string;
  heightVh: number;
}

export const SECTION_CONFIGS: readonly SectionConfig[] = [
  { id: "hero",      label: "Compass Crew — For the Next Generation of Builders", heightVh: 140 },
  { id: "discover",  label: "Discover — Talent is Everywhere, Opportunity Isn't",  heightVh: 140 },
  { id: "build",     label: "Build — From Ideas to Working Systems",                heightVh: 140 },
  { id: "learn",     label: "Learn — Structured Knowledge, Real-World Craft",       heightVh: 140 },
  { id: "connect",   label: "Connect — Your Community, Your Network",              heightVh: 140 },
  { id: "compete",   label: "Compete — Rise in the Arena",                         heightVh: 140 },
  { id: "ship",      label: "Ship — Proof of Work",                                heightVh: 140 },
  { id: "grow",      label: "Grow — Opportunity and Impact",                       heightVh: 140 },
  { id: "direction", label: "Direction — Find What You Want to Build",             heightVh: 160 },
  { id: "cta",       label: "Join the Crew — Your Next Build Starts Here",         heightVh: 140 },
] as const;

export const TOTAL_SECTIONS_HEIGHT_VH = SECTION_CONFIGS.reduce(
  (sum, s) => sum + s.heightVh,
  0
);

export interface LandingScrollContextValue {
  /** Active primary section in viewport */
  activeSection: SectionId;
  /** Normalized progress across entire immersive journey (0 to 1) */
  globalProgress: number;
  /** Mapped progress for CompassWorld 3D engine chapters (0 to 1) */
  narrativeProgress: number;
  /** Per-section intra progress (0 to 1) */
  sectionProgress: Record<SectionId, number>;
  /** Per-section lifecycle phase */
  sectionPhase: Record<SectionId, SectionPhase>;
  /** Scroll direction */
  direction: "down" | "up" | "idle";
  /** Current scroll velocity */
  velocity: number;
  /** User preference for reduced motion */
  prefersReducedMotion: boolean;
  /** CTA button hover state for compass needle focus */
  isCtaHovered: boolean;
  setIsCtaHovered: (hovered: boolean) => void;
  /** Smooth navigation helper */
  scrollToSection: (id: SectionId) => void;
}

const LandingScrollContext = createContext<LandingScrollContextValue | null>(null);

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function computePhase(progress: number): SectionPhase {
  if (progress <= 0 || progress >= 1) return "inactive";
  if (progress < 0.22) return "enter";
  if (progress > 0.78) return "exit";
  return "active";
}

// ─────────────────────────────────────────────────────────────
// Map continuous scroll progress across the 10 sections + footer to CompassWorld
// ─────────────────────────────────────────────────────────────
// 3D Chapter allocation:
//   Hero:      0.00 – 0.14
//   Discover:  0.14 – 0.28
//   Build:     0.28 – 0.42
//   Learn:     0.42 – 0.56
//   Connect:   0.56 – 0.70
//   Compete:   0.70 – 0.84
//   Ship:      0.84 – 0.92
//   Grow:      0.92
//   Direction: 0.92 – 0.95
//   CTA:       0.95 – 0.98
//   Footer:    0.98 – 1.00
function mapProgressToCompass(
  sectionIndex: number,
  intraProgress: number,
  footerProgress: number
): number {
  if (footerProgress > 0) {
    return 0.98 + footerProgress * 0.02;
  }

  const p = clamp01(intraProgress);

  switch (sectionIndex) {
    case 0: // hero
      return p * 0.14;
    case 1: // discover
      return 0.14 + p * 0.14;
    case 2: // build
      return 0.28 + p * 0.14;
    case 3: // learn
      return 0.42 + p * 0.14;
    case 4: // connect
      return 0.56 + p * 0.14;
    case 5: // compete
      return 0.70 + p * 0.14;
    case 6: // ship
      return 0.84 + p * 0.08;
    case 7: // grow
      return 0.92;
    case 8: // direction
      return 0.92 + p * 0.03;
    case 9: // cta
      return 0.95 + p * 0.03;
    default:
      return 0;
  }
}

interface LandingScrollProviderProps {
  children: ReactNode;
}

export function LandingScrollProvider({ children }: LandingScrollProviderProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [globalProgress, setGlobalProgress] = useState(0);
  const [narrativeProgress, setNarrativeProgress] = useState(0);
  const [direction, setDirection] = useState<"down" | "up" | "idle">("idle");
  const [velocity, setVelocity] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  // Per-section progress maps
  const [sectionProgress, setSectionProgress] = useState<Record<SectionId, number>>(() => ({
    hero: 0,
    discover: 0,
    build: 0,
    learn: 0,
    connect: 0,
    compete: 0,
    ship: 0,
    grow: 0,
    direction: 0,
    cta: 0,
    footer: 0,
  }));

  const [sectionPhase, setSectionPhase] = useState<Record<SectionId, SectionPhase>>(() => ({
    hero: "active",
    discover: "inactive",
    build: "inactive",
    learn: "inactive",
    connect: "inactive",
    compete: "inactive",
    ship: "inactive",
    grow: "inactive",
    direction: "inactive",
    cta: "inactive",
    footer: "inactive",
  }));

  const lastScrollY = useRef(0);
  const lastTime = useRef(0);

  // Check reduced motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onMotion);
    return () => mq.removeEventListener("change", onMotion);
  }, []);

  // Central passive scroll controller with rAF ticking
  useEffect(() => {
    if (typeof window === "undefined") return;

    let rafId: number | null = null;
    let ticking = false;

    const computeScroll = () => {
      ticking = false;
      const now = performance.now();
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const dt = Math.max(now - lastTime.current, 1);
      const dy = scrollY - lastScrollY.current;

      const currentVelocity = (dy / dt) * 16.6;
      setVelocity(currentVelocity);
      if (Math.abs(dy) > 1) {
        setDirection(dy > 0 ? "down" : "up");
      }
      lastScrollY.current = scrollY;
      lastTime.current = now;

      // Track bounding rect of each section element
      const sectionElements = SECTION_CONFIGS.map((s) => document.getElementById(s.id));
      const footerElement = document.getElementById("footer");

      const windowH = window.innerHeight || 1;
      const newProgress: Record<SectionId, number> = {
        hero: 0,
        discover: 0,
        build: 0,
        learn: 0,
        connect: 0,
        compete: 0,
        ship: 0,
        grow: 0,
        direction: 0,
        cta: 0,
        footer: 0,
      };

      const newPhase: Record<SectionId, SectionPhase> = {
        hero: "inactive",
        discover: "inactive",
        build: "inactive",
        learn: "inactive",
        connect: "inactive",
        compete: "inactive",
        ship: "inactive",
        grow: "inactive",
        direction: "inactive",
        cta: "inactive",
        footer: "inactive",
      };

      let currentActive: SectionId = "hero";
      let activeIndex = 0;
      let activeIntraProgress = 0;

      for (let i = 0; i < SECTION_CONFIGS.length; i++) {
        const conf = SECTION_CONFIGS[i];
        const el = sectionElements[i];
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        const totalHeight = el.offsetHeight || 1;
        const scrollable = totalHeight - windowH;

        let p = 0;
        if (scrollable <= 0) {
          p = clamp01(-rect.top / totalHeight);
        } else {
          p = clamp01(-rect.top / scrollable);
        }

        newProgress[conf.id] = p;
        newPhase[conf.id] = computePhase(p);

        // Section is active if top is near or past top of viewport, but bottom is still visible
        if (rect.top <= windowH * 0.5 && rect.bottom > windowH * 0.3) {
          currentActive = conf.id;
          activeIndex = i;
          activeIntraProgress = p;
        }
      }

      // Check footer
      let footerP = 0;
      if (footerElement) {
        const fRect = footerElement.getBoundingClientRect();
        if (fRect.top <= windowH) {
          footerP = clamp01((windowH - fRect.top) / (footerElement.offsetHeight || 400));
          newProgress.footer = footerP;
          newPhase.footer = footerP > 0.1 ? "active" : "enter";
          if (fRect.top <= windowH * 0.6) {
            currentActive = "footer";
          }
        }
      }

      setActiveSection(currentActive);
      setSectionProgress(newProgress);
      setSectionPhase(newPhase);

      // Global total progress calculation
      const firstEl = sectionElements[0];
      const lastSectionEl = sectionElements[SECTION_CONFIGS.length - 1];
      if (firstEl && lastSectionEl) {
        const top = firstEl.offsetTop;
        const bottom = lastSectionEl.offsetTop + lastSectionEl.offsetHeight;
        const totalRange = Math.max(bottom - top - windowH, 1);
        const gRaw = clamp01((scrollY - top) / totalRange);
        setGlobalProgress(gRaw);
      }

      // Compute mapped 3D Compass narrative progress
      const targetNarrative = mapProgressToCompass(activeIndex, activeIntraProgress, footerP);
      setNarrativeProgress(targetNarrative);
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(computeScroll);
      }
    };

    lastTime.current = performance.now();
    lastScrollY.current = window.scrollY || 0;
    computeScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const scrollToSection = useCallback((id: SectionId) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const value = useMemo(
    () => ({
      activeSection,
      globalProgress,
      narrativeProgress,
      sectionProgress,
      sectionPhase,
      direction,
      velocity,
      prefersReducedMotion,
      isCtaHovered,
      setIsCtaHovered,
      scrollToSection,
    }),
    [
      activeSection,
      globalProgress,
      narrativeProgress,
      sectionProgress,
      sectionPhase,
      direction,
      velocity,
      prefersReducedMotion,
      isCtaHovered,
      scrollToSection,
    ]
  );

  return (
    <LandingScrollContext.Provider value={value}>
      {children}
    </LandingScrollContext.Provider>
  );
}

export function useLandingScroll(): LandingScrollContextValue {
  const context = useContext(LandingScrollContext);
  if (!context) {
    throw new Error("useLandingScroll must be used within a LandingScrollProvider");
  }
  return context;
}

export function useSectionScroll(id: SectionId) {
  const { sectionProgress, sectionPhase, activeSection, prefersReducedMotion } =
    useLandingScroll();
  return {
    progress: sectionProgress[id] ?? 0,
    phase: sectionPhase[id] ?? "inactive",
    isActive: activeSection === id,
    prefersReducedMotion,
  };
}
