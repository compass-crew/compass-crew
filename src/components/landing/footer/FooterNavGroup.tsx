import { Link } from "@tanstack/react-router";

export interface FooterLinkItem {
  label: string;
  to?: string;
  href?: string;
  search?: Record<string, unknown>;
  badge?: string;
  disabled?: boolean;
}

interface FooterNavGroupProps {
  title: string;
  links: readonly FooterLinkItem[];
}

/**
 * FooterNavGroup
 * Accessible, quiet navigation column for the Immersive Footer.
 * Adheres to Step 9 typography and Step 2 palette (Warm Ivory + Soft Stone + Ultraviolet hover).
 */
export function FooterNavGroup({ title, links }: FooterNavGroupProps) {
  return (
    <div className="flex flex-col space-y-3.5">
      <h3 className="font-cc-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C8882]">
        {title}
      </h3>
      <ul className="space-y-2.5">
        {links.map((link) => {
          const itemKey = `${link.label}-${link.to || link.href || ""}`;

          // Non-clickable Coming Soon item
          if (link.disabled || (!link.to && !link.href)) {
            return (
              <li key={itemKey}>
                <span
                  className="inline-flex items-center gap-2 py-1 min-h-[32px] font-cc-sans text-sm text-[#8C8882]/70 cursor-default select-none"
                  aria-disabled="true"
                  title={`${link.label} — Coming Soon`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-cc-mono text-[9px] font-medium tracking-wider text-[#8C8882]">
                      {link.badge}
                    </span>
                  )}
                </span>
              </li>
            );
          }

          const linkClasses =
            "group inline-flex items-center gap-1.5 py-1 min-h-[32px] font-cc-sans text-sm text-[#B8B4B0] transition-all duration-200 hover:text-[#F5F2EA] hover:translate-x-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B] rounded-sm";

          if (link.to) {
            return (
              <li key={itemKey}>
                <Link to={link.to} search={link.search} className={linkClasses}>
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded bg-[#7C5CFF]/15 px-1.5 py-0.5 font-cc-mono text-[10px] font-medium uppercase tracking-wider text-[#7C5CFF]">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          }

          return (
            <li key={itemKey}>
              <a href={link.href} target="_blank" rel="noreferrer" className={linkClasses}>
                <span>{link.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
