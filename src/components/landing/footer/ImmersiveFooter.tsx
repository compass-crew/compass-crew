import { BrandLogo } from "@/components/landing/primitives/BrandLogo";
import { FooterNavGroup, type FooterLinkItem } from "./FooterNavGroup";
import { FooterSocials } from "./FooterSocials";

const EXPLORE_LINKS: readonly FooterLinkItem[] = [
  { label: "Hackathons", to: "/hackathons" },
  { label: "Events", to: "/events" },
  { label: "Community", to: "/community" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
];

const COMPANY_LINKS: readonly FooterLinkItem[] = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Sponsors", to: "/sponsors" },
  { label: "Partners", to: "/partners" },
  { label: "Careers", to: "/careers" },
];

const COMMUNITY_LINKS: readonly FooterLinkItem[] = [
  { label: "Join the Crew", to: "/auth", search: { mode: "signup" } },
  { label: "Sign In", to: "/auth" },
  { label: "Mentors", to: "/mentors" },
  { label: "Judges", to: "/judges" },
];

const LEGAL_LINKS: readonly FooterLinkItem[] = [
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Service", to: "/terms" },
  { label: "Code of Conduct", to: "/code-of-conduct" },
];

/**
 * ImmersiveFooter
 *
 * The final quiet resting environment of the Compass Crew landing page.
 * Replaces legacy SaaS/light footers with a refined, atmosphere-grounded
 * composition that integrates seamlessly with the persistent 3D world.
 */
export function ImmersiveFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      role="contentinfo"
      aria-label="Compass Crew Site Footer"
      className="relative z-10 w-full border-t border-white/[0.08] bg-gradient-to-b from-transparent via-[#09090B]/95 to-[#09090B] text-[#F5F2EA] transition-colors duration-300"
    >
      {/* Subtle atmospheric depth wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,92,255,0.06),transparent_70%)]"
      />

      <div className="relative mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-20 xl:px-28 pt-16 pb-12">
        {/* Main Grid: Brand Column + Navigation Columns */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Identity Area */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            <BrandLogo size="md" />

            <div className="space-y-2">
              <p className="font-cc-sans text-base font-medium tracking-tight text-[#F5F2EA]">
                An Entrepreneurship & Innovation Community.
              </p>
              <p className="font-cc-sans text-sm leading-relaxed text-[#8C8882] max-w-sm">
                A student-led ecosystem where ideas find people, opportunities, and direction.
                Building hackathons, open-source craft, and real products across campuses in India.
              </p>
            </div>

            {/* Social channels row */}
            <div className="pt-2">
              <FooterSocials />
            </div>
          </div>

          {/* Navigation Columns (4 Columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
            <FooterNavGroup title="Explore" links={EXPLORE_LINKS} />
            <FooterNavGroup title="Company" links={COMPANY_LINKS} />
            <FooterNavGroup title="Community" links={COMMUNITY_LINKS} />
            <FooterNavGroup title="Legal" links={LEGAL_LINKS} />
          </div>
        </div>

        {/* Bottom Metadata Bar */}
        <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-cc-mono text-[#8C8882]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {currentYear} COMPASS CREW</span>
            <span className="text-[#3A3A40]">·</span>
            <span>BUILT BY STUDENTS, FOR STUDENTS</span>
          </div>

          <div className="flex items-center gap-2 text-[#7C5CFF]/80">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#7C5CFF]" aria-hidden="true" />
            <span>PAN-INDIA CAMPUSES // INNOVATION PLATFORM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
