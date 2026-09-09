import { Compass } from "lucide-react";

interface HeroScrollAnchorProps {
  onClick?: () => void;
}

/**
 * HeroScrollAnchor
 * Minimal directional indicator at the base of the Hero scene.
 * Elegantly communicates orientation and the continuation of the Compass World narrative.
 */
export function HeroScrollAnchor({ onClick }: HeroScrollAnchorProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    const nextSection = document.getElementById("manifesto") || document.getElementById("discover");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col items-center gap-2 text-[#8C8882] transition-colors duration-300 hover:text-[#F5F2EA] focus:outline-none"
      aria-label="Scroll to discover the Compass Crew ecosystem"
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.25em] uppercase font-cc-mono">
        <Compass className="h-3 w-3 text-[#7C5CFF] transition-transform duration-500 group-hover:rotate-45" />
        <span>BEARING 000° • TRUE NORTH</span>
      </div>

      {/* Animated subtle vertical pulse hairline */}
      <div className="relative h-9 w-[1px] overflow-hidden bg-white/10">
        <div className="absolute inset-x-0 top-0 h-4 w-full bg-gradient-to-b from-[#7C5CFF] to-transparent animate-pulse" />
      </div>
    </button>
  );
}
