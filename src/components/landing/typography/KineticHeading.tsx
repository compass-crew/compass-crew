import { LineReveal } from "./LineReveal";
import { WordReveal } from "./WordReveal";
import { DepthText } from "./DepthText";

interface KineticHeadingProps {
  lines: string[];
  as?: "h1" | "h2" | "h3" | "h4" | "div";
  variant?: "hero" | "scene" | "statement" | "supporting";
  revealMode?: "line" | "word";
  progress?: number;
  active?: boolean;
  className?: string;
  lineClassName?: string;
  enableDepth?: boolean;
  glowColor?: string;
  align?: "left" | "center" | "right";
}

/**
 * KineticHeading
 *
 * Primary display typography component for the Compass Crew immersive experience:
 * - Strict fluid type scale using clamp()
 * - Tight editorial line heights (0.90 - 0.96)
 * - Restrained negative tracking (-0.04em to -0.05em)
 * - Line-by-line or word-by-word mask reveals
 * - Optional 3D Depth perspective & pointer parallax
 * - Fully accessible semantic HTML
 */
export function KineticHeading({
  lines,
  as = "h2",
  variant = "scene",
  revealMode = "line",
  progress,
  active = true,
  className = "",
  lineClassName = "",
  enableDepth = true,
  glowColor,
  align = "left",
}: KineticHeadingProps) {
  const variantStyles = {
    hero: "text-[clamp(44px,12vw,72px)] sm:text-[clamp(64px,8vw,144px)] leading-[0.90] tracking-[-0.05em] font-extrabold font-cc-sans",
    scene: "text-[clamp(36px,10vw,54px)] sm:text-[clamp(54px,7vw,108px)] leading-[0.92] tracking-[-0.045em] font-extrabold font-cc-sans",
    statement: "text-[clamp(26px,7vw,40px)] sm:text-[clamp(36px,5vw,76px)] leading-[0.96] tracking-[-0.04em] font-bold font-cc-sans",
    supporting: "text-[clamp(18px,4.5vw,26px)] sm:text-[clamp(24px,3.5vw,36px)] leading-[1.05] tracking-[-0.035em] font-medium font-cc-sans",
  };

  const alignStyles = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const content =
    revealMode === "word" ? (
      <div className={`flex flex-col ${alignStyles[align]} ${variantStyles[variant]} ${className}`}>
        {lines.map((line, i) => (
          <WordReveal
            key={i}
            text={line}
            progress={progress}
            active={active}
            staggerMs={50}
            wordClassName={lineClassName}
            className="block"
          />
        ))}
      </div>
    ) : (
      <LineReveal
        lines={lines}
        as={as}
        progress={progress}
        active={active}
        staggerMs={75}
        className={`${alignStyles[align]} ${variantStyles[variant]} ${className}`}
        lineClassName={lineClassName}
      />
    );

  if (enableDepth) {
    return (
      <DepthText glowColor={glowColor} className="w-full">
        {content}
      </DepthText>
    );
  }

  return content;
}
