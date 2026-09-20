import { Instagram, Linkedin } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    handle: "compasscrewindia",
    href: "https://www.linkedin.com/company/compasscrewindia",
  },
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@compasscrewnetwork",
    href: "https://www.instagram.com/compasscrewnetwork",
  },
] as const;

/**
 * FooterSocials
 * Clean, accessible social links for the verified official Compass Crew accounts.
 */
export function FooterSocials() {
  return (
    <div className="flex items-center gap-2.5" aria-label="Official Social Channels">
      {SOCIAL_LINKS.map((s) => {
        const Icon = s.icon;
        return (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.label} (${s.handle})`}
            className="group grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-[#B8B4B0] backdrop-blur-md transition-all duration-200 hover:border-[#7C5CFF]/40 hover:bg-[#7C5CFF]/10 hover:text-[#F5F2EA] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C5CFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090B]"
          >
            <Icon
              className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
              aria-hidden="true"
            />
          </a>
        );
      })}
    </div>
  );
}
