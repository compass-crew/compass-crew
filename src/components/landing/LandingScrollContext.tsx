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
  { id: "hero", label: "Compass Crew — For the Next Generation of Builders", heightVh: 180 },
  { id: "discover", label: "Discover — Talent is Everywhere, Opportunity Isn't", heightVh: 220 },
  { id: "build", label: "Build — From Ideas to Working Systems", heightVh: 220 },
  { id: "learn", label: "Learn — Structured Knowledge, Real-World Craft", heightVh: 220 },
  { id: "connect", label: "Connect — Your Community, Your Network", heightVh: 220 },
  { id: "compete", label: "Compete — Rise in the Arena", heightVh: 220 },
  { id: "ship", label: "Ship — Proof of Work", heightVh: 220 },
  { id: "grow", label: "Grow — Opportunity and Impact", heightVh: 240 },
  { id: "direction", label: "Direction — Find What You Want to Build", heightVh: 220 },
  { id: "cta", label: "Join the Crew — Your Next Build Starts Here", heightVh: 180 },
] as const;

export const TOTAL_SECTIONS_HEIGHT_VH = SECTION_CONFIGS.reduce((sum, s) => sum + s.heightVh, 0);

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
  /** Targeted subscription for per-section progress without global re-renders */
  subscribeSection: (
    id: SectionId,
    listener: (progress: number, phase: SectionPhase) => void,
  ) => () => void;
  /** Targeted subscription for 3D engine narrative progress */
  subscribeNarrative: (listener: (progress: number) => void) => () => void;
  /** Direct getter for latest section progress */
  getSectionProgress: (id: SectionId) => number;
  /** Direct getter for latest section phase */
  getSectionPhase: (id: SectionId) => SectionPhase;
  /** Direct getter for latest narrative progress */
  getNarrativeProgress: () => number;
}

const LandingScrollContext = createContext<LandingScrollContextValue | null>(null);

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

function computePhase(progress: number): SectionPhase {
  if (progress <= 0 || progress >= 1) return "inactive";
  if (progress < 0.2) return "enter";
  if (progress > 0.82) return "exit";
  return "active";
}

// ─────────────────────────────────────────────────────────────
// Map continuous scroll progress across the 10 sections + footer to CompassWorld
// Each section holds its designated 3D scene state during its active/hold phase (0.0 -> 0.75),
// and smoothly transitions to the next chapter during its exit phase (0.75 -> 1.0).
// ─────────────────────────────────────────────────────────────
function mapProgressToCompass(
  sectionIndex: number,
  intraProgress: number,
  footerProgress: number,
): number {
  if (footerProgress > 0) {
    return 0.98 + footerProgress * 0.02;
  }

  const p = clamp01(intraProgress);

  // Smooth transition during exit phase (p: 0.75 -> 1.0)
  const transitionStart = 0.75;
  const exitT = p > transitionStart ? (p - transitionStart) / (1 - transitionStart) : 0;
  const smoothExit = exitT * exitT * (3 - 2 * exitT);

  switch (sectionIndex) {
    case 0: // hero: holds at 0.00, then smoothly transitions to 0.14
      return smoothExit * 0.14;
    case 1: // discover: holds at 0.14 (100% Discover), then transitions to 0.28
      return 0.14 + smoothExit * 0.14;
    case 2: // build: holds at 0.28 (100% Build), then transitions to 0.42
      return 0.28 + smoothExit * 0.14;
    case 3: // learn: holds at 0.42 (100% Learn), then transitions to 0.56
      return 0.42 + smoothExit * 0.14;
    case 4: // connect: holds at 0.56 (100% Connect), then transitions to 0.70
      return 0.56 + smoothExit * 0.14;
    case 5: // compete: holds at 0.70 (100% Compete), then transitions to 0.84
      return 0.7 + smoothExit * 0.14;
    case 6: // ship: holds at 0.84 (100% Ship), then transitions to 0.92
      return 0.84 + smoothExit * 0.08;
    case 7: // grow: holds at 0.92 (100% Grow), then transitions to 0.95
      return 0.92 + smoothExit * 0.03;
    case 8: // direction: holds at 0.95 (100% Direction), then transitions to 0.98
      return 0.95 + smoothExit * 0.03;
    case 9: // cta: holds at 0.98 (100% CTA)
      return 0.98;
    default:
      return 0;
  }
}

interface LandingScrollProviderProps {
  children: ReactNode;
}

const INITIAL_SECTION_PROGRESS: Record<SectionId, number> = {
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

const INITIAL_SECTION_PHASE: Record<SectionId, SectionPhase> = {
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
};

export function LandingScrollProvider({ children }: LandingScrollProviderProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("hero");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isCtaHovered, setIsCtaHovered] = useState(false);

  // High-frequency continuous values stored in refs to avoid 60fps React DOM re-renders
  const activeSectionRef = useRef<SectionId>("hero");
  const globalProgressRef = useRef(0);
  const narrativeProgressRef = useRef(0);
  const directionRef = useRef<"down" | "up" | "idle">("idle");
  const velocityRef = useRef(0);
  const sectionProgressRef = useRef<Record<SectionId, number>>({ ...INITIAL_SECTION_PROGRESS });
  const sectionPhaseRef = useRef<Record<SectionId, SectionPhase>>({ ...INITIAL_SECTION_PHASE });

  // Dedicated pub/sub listeners for smooth per-section & 3D canvas updates
  type SectionListener = (progress: number, phase: SectionPhase) => void;
  type NarrativeListener = (progress: number) => void;

  const sectionListenersRef = useRef<Map<SectionId, Set<SectionListener>>>(new Map());
  const narrativeListenersRef = useRef<Set<NarrativeListener>>(new Set());

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

  const subscribeSection = useCallback((id: SectionId, listener: SectionListener) => {
    let set = sectionListenersRef.current.get(id);
    if (!set) {
      set = new Set();
      sectionListenersRef.current.set(id, set);
    }
    set.add(listener);
    // Immediately notify with current state
    listener(sectionProgressRef.current[id] ?? 0, sectionPhaseRef.current[id] ?? "inactive");
    return () => {
      set?.delete(listener);
    };
  }, []);

  const subscribeNarrative = useCallback((listener: NarrativeListener) => {
    narrativeListenersRef.current.add(listener);
    listener(narrativeProgressRef.current);
    return () => {
      narrativeListenersRef.current.delete(listener);
    };
  }, []);

  const getSectionProgress = useCallback(
    (id: SectionId) => sectionProgressRef.current[id] ?? 0,
    [],
  );

  const getSectionPhase = useCallback(
    (id: SectionId) => sectionPhaseRef.current[id] ?? "inactive",
    [],
  );

  const getNarrativeProgress = useCallback(() => narrativeProgressRef.current, []);

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
      velocityRef.current = currentVelocity;
      if (Math.abs(dy) > 1) {
        directionRef.current = dy > 0 ? "down" : "up";
      }
      lastScrollY.current = scrollY;
      lastTime.current = now;

      // Track bounding rect of each section element
      const sectionElements = SECTION_CONFIGS.map((s) => document.getElementById(s.id));
      const footerElement = document.getElementById("footer");

      const windowH = window.innerHeight || 1;
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

        const phase = computePhase(p);
        const oldP = sectionProgressRef.current[conf.id];
        const oldPhase = sectionPhaseRef.current[conf.id];

        sectionProgressRef.current[conf.id] = p;
        sectionPhaseRef.current[conf.id] = phase;

        // Targeted dispatch: only notify listeners for THIS section if changed
        if (Math.abs(p - oldP) > 0.002 || phase !== oldPhase) {
          const listeners = sectionListenersRef.current.get(conf.id);
          if (listeners) {
            listeners.forEach((fn) => fn(p, phase));
          }
        }

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
          const fPhase = footerP > 0.1 ? "active" : "enter";
          const oldFP = sectionProgressRef.current.footer;
          const oldFPhase = sectionPhaseRef.current.footer;

          sectionProgressRef.current.footer = footerP;
          sectionPhaseRef.current.footer = fPhase;

          if (Math.abs(footerP - oldFP) > 0.002 || fPhase !== oldFPhase) {
            const fListeners = sectionListenersRef.current.get("footer");
            if (fListeners) {
              fListeners.forEach((fn) => fn(footerP, fPhase));
            }
          }

          if (fRect.top <= windowH * 0.6) {
            currentActive = "footer";
          }
        }
      }

      // Only trigger React state update when the active section ID actually changes!
      if (currentActive !== activeSectionRef.current) {
        activeSectionRef.current = currentActive;
        setActiveSection(currentActive);
      }

      // Global total progress calculation
      const firstEl = sectionElements[0];
      const lastSectionEl = sectionElements[SECTION_CONFIGS.length - 1];
      if (firstEl && lastSectionEl) {
        const top = firstEl.offsetTop;
        const bottom = lastSectionEl.offsetTop + lastSectionEl.offsetHeight;
        const totalRange = Math.max(bottom - top - windowH, 1);
        globalProgressRef.current = clamp01((scrollY - top) / totalRange);
      }

      // Compute mapped 3D Compass narrative progress
      const targetNarrative = mapProgressToCompass(activeIndex, activeIntraProgress, footerP);
      const oldNarrative = narrativeProgressRef.current;
      narrativeProgressRef.current = targetNarrative;

      if (Math.abs(targetNarrative - oldNarrative) > 0.0005) {
        narrativeListenersRef.current.forEach((fn) => fn(targetNarrative));
      }
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

  const value = useMemo<LandingScrollContextValue>(
    () => ({
      activeSection,
      get globalProgress() {
        return globalProgressRef.current;
      },
      get narrativeProgress() {
        return narrativeProgressRef.current;
      },
      get sectionProgress() {
        return sectionProgressRef.current;
      },
      get sectionPhase() {
        return sectionPhaseRef.current;
      },
      get direction() {
        return directionRef.current;
      },
      get velocity() {
        return velocityRef.current;
      },
      prefersReducedMotion,
      isCtaHovered,
      setIsCtaHovered,
      scrollToSection,
      subscribeSection,
      subscribeNarrative,
      getSectionProgress,
      getSectionPhase,
      getNarrativeProgress,
    }),
    [
      activeSection,
      prefersReducedMotion,
      isCtaHovered,
      scrollToSection,
      subscribeSection,
      subscribeNarrative,
      getSectionProgress,
      getSectionPhase,
      getNarrativeProgress,
    ],
  );

  return <LandingScrollContext.Provider value={value}>{children}</LandingScrollContext.Provider>;
}

export function useLandingScroll(): LandingScrollContextValue {
  const context = useContext(LandingScrollContext);
  if (!context) {
    throw new Error("useLandingScroll must be used within a LandingScrollProvider");
  }
  return context;
}

/**
 * useSectionScroll
 * Subscribes only to changes for the specified section ID.
 * Non-visible sections do not re-render when other sections scroll.
 */
export function useSectionScroll(id: SectionId) {
  const context = useLandingScroll();
  const [state, setState] = useState(() => ({
    progress: context.getSectionProgress(id),
    phase: context.getSectionPhase(id),
  }));

  useEffect(() => {
    return context.subscribeSection(id, (progress, phase) => {
      setState((prev) => {
        if (prev.progress === progress && prev.phase === phase) return prev;
        return { progress, phase };
      });
    });
  }, [context, id]);

  return {
    progress: state.progress,
    phase: state.phase,
    isActive: context.activeSection === id,
    prefersReducedMotion: context.prefersReducedMotion,
  };
}

/**
 * useNarrativeProgress
 * Targeted hook for subscribing to continuous 3D engine narrative progress
 * without forcing top-level layout or section re-renders.
 */
export function useNarrativeProgress(): number {
  const context = useLandingScroll();
  const [progress, setProgress] = useState(() => context.getNarrativeProgress());

  useEffect(() => {
    return context.subscribeNarrative((p) => {
      setProgress((prev) => (Math.abs(prev - p) > 0.0005 ? p : prev));
    });
  }, [context]);

  return progress;
}
