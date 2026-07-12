import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitPartnerApplication } from "@/lib/public-cms";

export const Route = createFileRoute("/partner")({
  head: () => ({
    meta: [
      { title: "Partner With Us — Compass Crew" },
      { name: "description", content: "Sponsor a hackathon, start a chapter, or run a bootcamp with Compass Crew." },
      { property: "og:title", content: "Partner With Us — Compass Crew" },
      { property: "og:description", content: "Sponsor, mentor or co-create with Compass Crew." },
    ],
    links: [{ rel: "canonical", href: "/partner" }],
  }),
  component: PartnerPage,
});

function PartnerPage() {
  const [submitting, setSubmitting] = useState(false);
  const [interest, setInterest] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      await submitPartnerApplication({
        org_name: String(fd.get("company") ?? "").trim(),
        contact_name: String(fd.get("name") ?? "").trim(),
        email: String(fd.get("email") ?? "").trim(),
        website: (fd.get("website") ? String(fd.get("website")) : null) || null,
        partnership_type: interest || null,
        message: String(fd.get("message") ?? "").trim(),
      });
      toast.success("Thanks! We'll reach out within 2 business days.");
      e.currentTarget.reset();
      setInterest("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Partner with us"
        title="Let's build together."
        description="Whether you want to hire our members, run a workshop, sponsor a hackathon or start a chapter — start here."
      />
      <Section className="max-w-3xl">
        <Card><CardContent className="p-8">
          <form className="grid gap-5" onSubmit={onSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="name">Your name</Label><Input id="name" name="name" required placeholder="Priya Kapoor" /></div>
              <div className="grid gap-2"><Label htmlFor="company">Company / organization</Label><Input id="company" name="company" required placeholder="Acme Inc." /></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2"><Label htmlFor="email">Work email</Label><Input id="email" name="email" type="email" required placeholder="you@company.com" /></div>
              <div className="grid gap-2"><Label htmlFor="website">Website</Label><Input id="website" name="website" type="url" placeholder="https://…" /></div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="interest">I'm interested in</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger id="interest"><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsor">Sponsoring a hackathon</SelectItem>
                  <SelectItem value="workshop">Running a workshop</SelectItem>
                  <SelectItem value="hiring">Hiring from the community</SelectItem>
                  <SelectItem value="mentor">Mentoring students</SelectItem>
                  <SelectItem value="chapter">Starting a campus chapter</SelectItem>
                  <SelectItem value="other">Something else</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label htmlFor="message">Tell us more</Label><Textarea id="message" name="message" required rows={5} placeholder="What are you hoping to build with Compass Crew?" /></div>
            <Button type="submit" disabled={submitting} size="lg" className="w-full bg-gradient-brand text-white hover:opacity-90">
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        </CardContent></Card>
      </Section>
    </>
  );
}
