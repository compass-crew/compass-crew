import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Compass Crew" },
      { name: "description", content: "Get in touch with the Compass Crew team." },
      { property: "og:title", content: "Contact Compass Crew" },
      { property: "og:description", content: "Get in touch with the team." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <PageHeader eyebrow="Contact" title="Say hi." description="We reply to every message — usually within 2 business days." />
      <Section>
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            {[
              { icon: Mail, title: "Email", body: "hello@compasscrew.in" },
              { icon: MessageCircle, title: "Discord", body: "discord.gg/compasscrew" },
              { icon: MapPin, title: "HQ", body: "Bengaluru, India" },
            ].map((c) => (
              <Card key={c.title}>
                <CardContent className="flex gap-4 p-6">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.body}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-2">
            <CardContent className="p-8">
              <form
                className="grid gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success("Message sent. Thanks for reaching out!");
                  (e.target as HTMLFormElement).reset();
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" required placeholder="Your name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@campus.edu" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" required placeholder="What's on your mind?" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="msg">Message</Label>
                  <Textarea id="msg" rows={6} required placeholder="Tell us more…" />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-brand text-white hover:opacity-90 sm:w-fit">
                  Send message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
