import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Linkedin, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/public-cms";

type FooterColLink = {
  label: string;
  to?: string;
  badge?: string;
  disabled?: boolean;
};

const columns: { title: string; links: readonly FooterColLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Hackathons", to: "/hackathons" },
      { label: "Events", to: "/events" },
      { label: "Community", to: "/community" },
      { label: "Resources", to: "/resources" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Sponsors", to: "/sponsors" },
      { label: "Partners", to: "/partners" },
      { label: "Careers", to: "/careers" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Mentors", to: "/mentors" },
      { label: "Judges", to: "/judges" },
      { label: "Community Hub", to: "/community" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms of Service", to: "/terms" },
      { label: "Code of Conduct", to: "/code-of-conduct" },
    ],
  },
];

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/compasscrewindia" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/compasscrewnetwork" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email, "footer");
      toast.success("Subscribed. Welcome to the crew!");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-border/70 bg-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-9 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Brand & Newsletter */}
          <div className="space-y-3.5 lg:col-span-5">
            <Logo />
            <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
              A student-led community for AI, technology, innovation and startups — building
              hackathons, learning programs, and shipping real products with campuses across India.
            </p>

            <form
              className="mt-3 flex max-w-sm items-center gap-2"
              onSubmit={onSubscribe}
              aria-label="Newsletter signup"
            >
              <div className="relative flex-1">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@campus.edu"
                  className="h-8.5 pl-8.5 text-xs sm:text-sm"
                  aria-label="Email address"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                size="sm"
                className="h-8.5 shrink-0 bg-gradient-brand px-3 text-xs font-medium text-white hover:opacity-90 sm:px-3.5"
              >
                {submitting ? (
                  "…"
                ) : (
                  <span className="inline-flex items-center gap-1">
                    Subscribe <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </form>

            <div className="flex items-center gap-2 pt-0.5">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-7.5 w-7.5 place-items-center rounded-full border border-border/80 bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <s.icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-6 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-foreground sm:text-xs">
                  {col.title}
                </h4>
                <ul className="mt-2.5 space-y-1.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.disabled || !l.to ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 cursor-default select-none"
                          aria-disabled="true"
                          title={`${l.label} — Coming Soon`}
                        >
                          <span>{l.label}</span>
                          {l.badge && (
                            <span className="rounded border border-border/60 bg-muted/40 px-1 py-0.5 text-[9px] font-medium tracking-wider text-muted-foreground">
                              {l.badge}
                            </span>
                          )}
                        </span>
                      ) : (
                        <Link
                          to={l.to}
                          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
                        >
                          <span>{l.label}</span>
                          {l.badge && (
                            <span className="rounded bg-primary/10 px-1 py-0.5 text-[9px] font-medium text-primary">
                              {l.badge}
                            </span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-start justify-between gap-2.5 border-t border-border/60 pt-4 text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Compass Crew. Built by students, for students.</p>
          <a
            href="mailto:compasscrewnetwork.team@gmail.com"
            className="transition-colors hover:text-foreground"
          >
            compasscrewnetwork.team@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
