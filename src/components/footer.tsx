import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Github, Instagram, Linkedin, Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "./logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { subscribeNewsletter } from "@/lib/public-cms";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "Hackathons", to: "/hackathons" as const },
      { label: "Events", to: "/events" as const },
      { label: "Community", to: "/community" as const },
      { label: "Resources", to: "/resources" as const },
      { label: "Blog", to: "/blog" as const },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" as const },
      { label: "Sponsors", to: "/sponsors" as const },
      { label: "Partners", to: "/partners" as const },
      { label: "Mentors", to: "/mentors" as const },
      { label: "Judges", to: "/judges" as const },
      { label: "Careers", to: "/careers" as const },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact", to: "/contact" as const },
      { label: "FAQs", to: "/faqs" as const },
      { label: "Privacy Policy", to: "/privacy" as const },
      { label: "Terms of Service", to: "/terms" as const },
      { label: "Code of Conduct", to: "/code-of-conduct" as const },
    ],
  },
] as const;

const socials = [
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/compasscrew" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/compasscrew" },
  { icon: Github, label: "GitHub", href: "https://github.com/compasscrew" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await subscribeNewsletter(email);
      toast.success("Subscribed. Welcome to the crew!");
      setEmail("");
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
              A student-led community for AI, technology, innovation and startups —
              building hackathons, learning programs, and shipping real products
              with campuses across India.
            </p>
            <form className="mt-6 flex max-w-md gap-2" onSubmit={onSubscribe} aria-label="Newsletter signup">
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
              <Button type="submit" disabled={submitting} className="bg-gradient-brand text-white hover:opacity-90">
                {submitting ? "…" : <>Subscribe <ArrowRight className="ml-1 h-4 w-4" /></>}
              </Button>
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

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-foreground">{col.title}</h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="text-sm text-muted-foreground transition hover:text-foreground">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Compass Crew. Built by students, for students.</p>
          <p>Made with ☕ across campuses in India.</p>
        </div>
      </div>
    </footer>
  );
}
