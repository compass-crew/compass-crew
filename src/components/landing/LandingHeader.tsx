import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { BrandLogo } from "./primitives/BrandLogo";
import { PrimaryButton } from "./primitives/PrimaryButton";
import { SecondaryButton } from "./primitives/SecondaryButton";
import { useAuth } from "@/hooks/use-auth";

/**
 * LandingHeader
 * Minimal public header strictly adhering to the Public Header Rule:
 *
 * [Compass Crew logo]
 *                         Sign in
 *                         Join the Crew
 *
 * Full application navigation is reserved for authenticated dashboard experiences.
 */
export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [nearBottom, setNearBottom] = useState(false);
  const [inFooter, setInFooter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 12);
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const ratio = scrollY / docHeight;
        setNearBottom(ratio > 0.85);
        setInFooter(ratio > 0.95);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? "pt-3 sm:pt-4" : "pt-5 sm:pt-6"
      } ${
        inFooter
          ? "opacity-0 pointer-events-none -translate-y-2.5"
          : nearBottom
            ? "opacity-75 hover:opacity-100"
            : "opacity-100"
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-8 lg:px-12">
        <div
          className={`flex items-center justify-between rounded-full border px-4 py-2.5 transition-all duration-300 ${
            scrolled
              ? "border-white/10 bg-[#09090B]/80 shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl"
              : "border-white/[0.06] bg-[#09090B]/40 backdrop-blur-md"
          }`}
        >
          {/* Official Brand Logo */}
          <BrandLogo size="md" />

          {/* Unauthenticated Minimal Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <PrimaryButton to="/dashboard" size="sm" showArrow={false}>
                Open Dashboard
              </PrimaryButton>
            ) : (
              <>
                <SecondaryButton to="/auth" size="sm">
                  Sign in
                </SecondaryButton>
                <PrimaryButton to="/auth" search={{ mode: "signup" }} size="sm">
                  Join the Crew
                </PrimaryButton>
              </>
            )}
          </div>

          {/* Minimal Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFF]"
              aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-2 rounded-2xl border border-white/10 bg-[#111116]/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex flex-col gap-2.5">
              {user ? (
                <PrimaryButton
                  to="/dashboard"
                  size="md"
                  className="w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Open Dashboard
                </PrimaryButton>
              ) : (
                <>
                  <SecondaryButton
                    to="/auth"
                    size="md"
                    className="w-full justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </SecondaryButton>
                  <PrimaryButton
                    to="/auth"
                    search={{ mode: "signup" }}
                    size="md"
                    className="w-full justify-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Join the Crew
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export { LandingHeader as PublicHeader };
