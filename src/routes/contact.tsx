import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Mail,
  Linkedin,
  Instagram,
  ExternalLink,
  MessageSquare,
  Handshake,
  Trophy,
  Users,
  Send,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { submitContactMessage, listHomepageSections, findSection } from "@/lib/public-cms";
import { Turnstile } from "@/components/turnstile";
import { FAQS } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Compass Crew" },
      {
        name: "description",
        content:
          "Get in touch with the Compass Crew core team for partnerships, sponsorships, hackathons, and community inquiries.",
      },
      { property: "og:title", content: "Contact Compass Crew" },
      {
        property: "og:description",
        content: "Reach out to the Compass Crew team via compasscrewnetwork.team@gmail.com.",
      },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type FaqItem = { q: string; a: string };

const SOCIALS = [
  {
    icon: Linkedin,
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/compasscrewindia",
  },
  {
    icon: Instagram,
    label: "Instagram",
    href: "https://www.instagram.com/compasscrewnetwork",
  },
];

const INQUIRY_CATEGORIES = [
  {
    icon: MessageSquare,
    title: "General Inquiries",
    description: "Questions about Compass Crew programs, membership, or how to get started.",
  },
  {
    icon: Handshake,
    title: "Partnerships & Campuses",
    description: "Collaborations with student clubs, universities, colleges, and innovation cells.",
  },
  {
    icon: Trophy,
    title: "Sponsorships & Tracks",
    description: "Sponsor a hackathon track, provide bounties, or offer developer tooling.",
  },
  {
    icon: Users,
    title: "Mentorship & Judging",
    description: "Industry leaders interested in mentoring teams or evaluating submissions.",
  },
] as const;

function ContactPage() {
  const { data: sections } = useQuery({
    queryKey: ["homepage-sections"],
    queryFn: listHomepageSections,
  });
  const faqCms = findSection(sections ?? [], "faq");
  const faqItems: FaqItem[] = (faqCms?.data as { items?: FaqItem[] } | null)?.items ?? FAQS;

  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        subject: String(fd.get("subject") ?? "").trim(),
        message: String(fd.get("msg") ?? "").trim(),
        turnstileToken: captchaToken,
      });
      toast.success("Message sent — we will get back to you within 2 business days.");
      form.reset();
      setCaptchaToken(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please email us directly at compasscrewnetwork.team@gmail.com.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact the Crew"
        title="Say hi. We're here to help."
        description="Have a question, partnership idea, sponsorship inquiry, or community feedback? Send us a message or email us directly."
      />

      <Section className="py-10">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Left Column: Direct Email Card, Categories, Socials */}
          <div className="space-y-6 lg:col-span-5">
            {/* Primary Email Card */}
            <Card className="border-primary/30 bg-primary/[0.04] shadow-elegant">
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    Official Contact Email
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our team reviews and replies to all inquiries, typically within 2 business days.
                  </p>
                </div>
                <div className="pt-2">
                  <a
                    href="mailto:compasscrewnetwork.team@gmail.com"
                    className="inline-flex items-center gap-2 font-mono text-sm font-semibold text-primary transition hover:underline"
                  >
                    compasscrewnetwork.team@gmail.com
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Inquiry Categories */}
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-6 space-y-4">
                <h4 className="font-display text-sm font-semibold text-foreground uppercase tracking-wider">
                  How We Can Help
                </h4>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {INQUIRY_CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.title} className="flex items-start gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-foreground">{cat.title}</p>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {cat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Official Socials */}
            <Card className="border-border/60 bg-card/60">
              <CardContent className="p-6 space-y-3">
                <p className="font-display text-sm font-semibold text-foreground">
                  Follow the Community
                </p>
                <div className="flex flex-wrap gap-2">
                  {SOCIALS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      <s.icon className="h-3.5 w-3.5" /> {s.label}{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Active Message Form */}
          <Card className="border-border/60 bg-card/80 shadow-elegant lg:col-span-7">
            <CardContent className="p-6 sm:p-10">
              <div className="mb-6 space-y-1">
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Send a Message
                </h3>
                <p className="text-sm text-muted-foreground">
                  Fill out the form below and our team will get back to your email directly.
                </p>
              </div>

              <form className="grid gap-5" onSubmit={onSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Alex Sharma"
                      className="bg-background/50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@campus.edu"
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="e.g. Hackathon Track Sponsorship or Campus Chapter"
                    className="bg-background/50"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="msg">Message</Label>
                  <Textarea
                    id="msg"
                    name="msg"
                    rows={6}
                    required
                    placeholder="Tell us about your project, campus, team, or inquiry…"
                    className="bg-background/50 leading-relaxed"
                  />
                </div>

                <div className="pt-1">
                  <Turnstile onToken={setCaptchaToken} />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full bg-gradient-brand text-white hover:opacity-90 sm:w-fit"
                >
                  {submitting ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" /> Send message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Frequently Asked Questions */}
      {faqItems.length > 0 && (
        <Section className="border-t border-border max-w-4xl py-14">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Quick answers to common questions about Compass Crew programs and participation."
          />
          <Accordion type="single" collapsible className="mt-8 w-full">
            {faqItems.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-8 text-sm text-muted-foreground">
            Have more questions?{" "}
            <Link to="/faqs" className="text-primary hover:underline">
              See all FAQs →
            </Link>
          </div>
        </Section>
      )}
    </>
  );
}
