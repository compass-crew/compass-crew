import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { listEvents, type SiteEvent } from "@/lib/public-cms";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Compass Crew" },
      { name: "description", content: "Workshops, webinars, hackathons, bootcamps, meetups and AMAs for student builders across India." },
      { property: "og:title", content: "Events — Compass Crew" },
      { property: "og:description", content: "Workshops, meetups, AMAs and bootcamps for student builders." },
    ],
    links: [{ rel: "canonical", href: "/events" }],
  }),
  component: EventsPage,
});

function fmtDateTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function eventStatus(e: SiteEvent): { label: string; tone: "upcoming" | "live" | "past" } {
  const now = Date.now();
  const s = e.starts_at ? new Date(e.starts_at).getTime() : null;
  const en = e.ends_at ? new Date(e.ends_at).getTime() : null;
  if (s && s > now) return { label: "Upcoming", tone: "upcoming" };
  if (s && s <= now && (!en || en >= now)) return { label: "Live", tone: "live" };
  if (en && en < now) return { label: "Past", tone: "past" };
  return { label: "Scheduled", tone: "upcoming" };
}

function EventsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["site-events"], queryFn: listEvents });
  const events = data ?? [];
  const upcoming = events.filter((e) => eventStatus(e).tone !== "past");
  const past = events.filter((e) => eventStatus(e).tone === "past");

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Workshops, meetups & AMAs."
        description="Workshops, webinars, hackathons, bootcamps, meetups and AMAs for student builders across India."
      />
      <Section>
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-lg bg-muted" />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No events scheduled yet."
            description="Compass Crew events will be announced here. Join the community to be notified."
            action={<Button asChild className="bg-gradient-brand text-white hover:opacity-90"><Link to="/community">Get notified</Link></Button>}
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((e) => <EventCard key={e.id} e={e} />)}
              </div>
            )}
            {past.length > 0 && (
              <>
                <h2 className="mt-16 font-display text-2xl font-semibold">Past events</h2>
                <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((e) => <EventCard key={e.id} e={e} />)}
                </div>
              </>
            )}
          </>
        )}
      </Section>
    </>
  );
}

function EventCard({ e }: { e: SiteEvent }) {
  const status = eventStatus(e);
  return (
    <Card className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-elegant">
      {e.banner_url ? (
        <div className="h-36 overflow-hidden bg-muted">
          <img src={e.banner_url} alt="" loading="lazy" className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="h-36 bg-gradient-brand" />
      )}
      <CardContent className="flex flex-1 flex-col space-y-3 p-6">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="capitalize">{e.kind}</Badge>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${status.tone === "live" ? "text-green-600 dark:text-green-400" : status.tone === "past" ? "text-muted-foreground" : "text-primary"}`}>
            {status.label}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold leading-snug">{e.title}</h3>
        {e.description && <p className="line-clamp-3 text-sm text-muted-foreground">{e.description}</p>}
        <div className="space-y-1.5 text-xs text-muted-foreground">
          {e.starts_at && (
            <p className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{fmtDateTime(e.starts_at)}</p>
          )}
          {(e.location || e.mode) && (
            <p className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />
              {e.location ?? ""}{e.location && e.mode ? " · " : ""}{e.mode ? <span className="capitalize">{e.mode.replace("_", " ")}</span> : null}
            </p>
          )}
        </div>
        {e.registration_url && status.tone !== "past" ? (
          <Button asChild size="sm" className="mt-auto w-full bg-gradient-brand text-white hover:opacity-90">
            <a href={e.registration_url} target="_blank" rel="noreferrer">Register <ExternalLink className="ml-1 h-3.5 w-3.5" /></a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
