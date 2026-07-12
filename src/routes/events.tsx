import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MapPin } from "lucide-react";
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
        title="Something to attend, every week."
        description="Workshops, AMAs, meetups and bootcamps — online and across campuses in India."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((e) => (
            <Card key={e.slug} className="group transition hover:-translate-y-0.5 hover:shadow-elegant">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{e.kind}</Badge>
                  <span className="text-xs text-muted-foreground">{e.mode}</span>
                </div>
                <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><Calendar className="h-4 w-4" />{e.date}</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4" />{e.time}</li>
                  <li className="flex items-center gap-2"><MapPin className="h-4 w-4" />{e.host}</li>
                </ul>
                <Button className="w-full" variant="outline">RSVP</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
