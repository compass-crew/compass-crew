import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Mail, MapPin, Linkedin, Instagram, Github, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section, SectionHeading } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "sonner";
import { submitContactMessage, listHomepageSections, findSection } from "@/lib/public-cms";
import { FAQS } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Compass Crew" },
      { name: "description", content: "Get in touch with the Compass Crew team." },
      { property: "og:title", content: "Contact Compass Crew" },
      { property: "og:description", content: "Get in touch with the team." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

type FaqItem = { q: string; a: string };

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://linkedin.com/company/compasscrew" },
  { icon: Instagram, label: "Instagram", href: "https://instagram.com/compasscrew" },
  { icon: Github, label: "GitHub", href: "https://github.com/compasscrew" },
];

function ContactPage() {
  const { data: sections } = useQuery({ queryKey: ["homepage-sections"], queryFn: listHomepageSections });
  const faqCms = findSection(sections ?? [], "faq");
  const faqItems: FaqItem[] = ((faqCms?.data as { items?: FaqItem[] } | null)?.items) ?? FAQS;

  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await submitContactMessage({
        name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        subject: String(fd.get("subject") ?? "").trim(),
        message: String(fd.get("msg") ?? "").trim(),
      });
      toast.success("Message sent — we'll get back to you within 2 business days.");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hi." description="We reply to every message — usually within 2 business days." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {[
              { icon: Mail, title: "Email", body: "hello@compasscrew.in", href: "mailto:hello@compasscrew.in" },
              { icon: MapPin, title: "HQ", body: "Bengaluru, India" },
            ].map((c) => (
              <Card key={c.title}><CardContent className="flex gap-4 p-6">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></span>
                <div>
                  <p className="font-semibold">{c.title}</p>
                  {c.href ? <a href={c.href} className="text-sm text-muted-foreground hover:text-foreground">{c.body}</a> : <p className="text-sm text-muted-foreground">{c.body}</p>}
                </div>
              </CardContent></Card>
            ))}
            <Card><CardContent className="space-y-3 p-6">
              <p className="font-semibold">Follow us</p>
              <div className="flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:border-primary/40">
                    <s.icon className="h-3.5 w-3.5" /> {s.label} <ExternalLink className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </CardContent></Card>
          </div>

          <Card className="lg:col-span-2"><CardContent className="p-8">
            <form className="grid gap-5" onSubmit={onSubmit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" required placeholder="Your name" /></div>
                <div className="grid gap-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required placeholder="you@campus.edu" /></div>
              </div>
              <div className="grid gap-2"><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required placeholder="What's on your mind?" /></div>
              <div className="grid gap-2"><Label htmlFor="msg">Message</Label><Textarea id="msg" name="msg" rows={6} required placeholder="Tell us more…" /></div>
              <Button type="submit" disabled={submitting} size="lg" className="w-full bg-gradient-brand text-white hover:opacity-90 sm:w-fit">
                {submitting ? "Sending…" : "Send message"}
              </Button>
            </form>
          </CardContent></Card>
        </div>
      </Section>

      {faqItems.length > 0 && (
        <Section className="border-t border-border max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Frequently asked" />
          <Accordion type="single" collapsible className="mt-8 w-full">
            {faqItems.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-display text-base font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 text-sm text-muted-foreground">
            Have more questions? <Link to="/faqs" className="text-primary">See all FAQs →</Link>
          </div>
        </Section>
      )}
    </>
  );
}
