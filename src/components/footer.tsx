import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Instagram, Linkedin, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/public-cms";
import { Turnstile } from "@/components/turnstile";

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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email, "footer", captchaToken);
      toast.success("Subscribed. Welcome to the crew!");
      setEmail("");
      setCaptchaToken(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't subscribe. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A student-led community for AI, technology, innovation and startups — building
              hackathons, learning programs, and shipping real products with campuses across India.
            </p>
            <form
              className="mt-6 flex max-w-md flex-col gap-2"
              onSubmit={onSubscribe}
              aria-label="Newsletter signup"
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@campus.edu"
                    className="pl-9"
                    aria-label="Email address"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-brand text-white hover:opacity-90"
                >
                  {submitting ? (
                    "…"
                  ) : (
                    <>
                      Subscribe <ArrowRight className="ml-1 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              <Turnstile onToken={setCaptchaToken} size="compact" />
            </form>
            <div className="mt-6 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={s.label}
                  className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.disabled || !l.to ? (
                        <span
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground/60 cursor-default select-none"
                          aria-disabled="true"
                          title={`${l.label} — Coming Soon`}
                        >
                          <span>{l.label}</span>
                          {l.badge && (
                            <span className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-muted-foreground">
                              {l.badge}
                            </span>
                          )}
                        </span>
                      ) : (
                        <Link
                          to={l.to}
                          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                          <span>{l.label}</span>
                          {l.badge && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
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

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Compass Crew. Built by students, for students.</p>
          <a
            href="mailto:compasscrewnetwork.team@gmail.com"
            className="hover:text-foreground transition-colors"
          >
            compasscrewnetwork.team@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
