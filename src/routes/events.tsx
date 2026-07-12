import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EVENTS } from "@/data/site";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Compass Crew" },
      { name: "description", content: "Workshops, meetups, AMAs and bootcamps for student builders across India." },
      { property: "og:title", content: "Events — Compass Crew" },
      { property: "og:description", content: "Workshops, meetups, AMAs and bootcamps for student builders." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Workshops, meetups & AMAs."
        description="Compass Crew events are announced here — workshops, AMAs, meetups and bootcamps for student builders across India."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((e) => (
            <Card key={e.slug} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{e.kind}</Badge>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {e.status}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
                <p className="text-sm text-muted-foreground">{e.body}</p>
                <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Details announced soon
                </div>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/community">Get notified</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
