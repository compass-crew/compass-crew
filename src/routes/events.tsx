import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { listEvents, type SiteEvent } from "@/lib/public-cms";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events — Compass Crew" },
      {
        name: "description",
        content:
          "Workshops, webinars, hackathons, bootcamps, meetups and AMAs for student builders across India.",
      },
      { property: "og:title", content: "Events — Compass Crew" },
      {
        property: "og:description",
        content: "Workshops, meetups, AMAs and bootcamps for student builders.",
      },
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
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["site-events"],
    queryFn: listEvents,
  });

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");

  const events = useMemo(() => data ?? [], [data]);

  // Filter events based on search, kind, and format
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = e.title.toLowerCase().includes(q);
        const matchDesc = e.description?.toLowerCase().includes(q) ?? false;
        const matchLoc = e.location?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc && !matchLoc) return false;
      }
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (modeFilter !== "all" && e.mode !== modeFilter) return false;
      return true;
    });
  }, [events, search, kindFilter, modeFilter]);

  const upcoming = filteredEvents.filter((e) => eventStatus(e).tone !== "past");
  const past = filteredEvents.filter((e) => eventStatus(e).tone === "past");

  return (
    <>
      <PageHeader
        eyebrow="Events"
        title="Workshops, meetups & AMAs."
        description="Hands-on masterclasses, industry AMAs, hackathon info sessions and developer meetups for student innovators."
      />

      <Section className="pt-2">
        {/* Search & Filter Toolbar */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events by title or topic..."
              className="pl-9 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select value={kindFilter} onValueChange={setKindFilter}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workshop">Workshops</SelectItem>
                <SelectItem value="webinar">Webinars</SelectItem>
                <SelectItem value="hackathon">Hackathons</SelectItem>
                <SelectItem value="bootcamp">Bootcamps</SelectItem>
                <SelectItem value="meetup">Meetups</SelectItem>
                <SelectItem value="ama">AMAs</SelectItem>
              </SelectContent>
            </Select>

            <Select value={modeFilter} onValueChange={setModeFilter}>
              <SelectTrigger className="w-[140px] text-xs">
                <SelectValue placeholder="Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="in_person">In-Person</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>

            {(search || kindFilter !== "all" || modeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setKindFilter("all");
                  setModeFilter("all");
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-xl border border-border/40 bg-muted/40"
              />
            ))}
          </div>
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
              Unable to load events
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              {error instanceof Error
                ? error.message
                : "A connection error occurred while retrieving event records."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              className="mt-5 gap-2"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        ) : events.length === 0 ? (
          /* Empty Platform State */
          <EmptyState
            icon={Calendar}
            title="No upcoming events yet."
            description="Our upcoming workshops, webinars, and campus meetups will be listed here as registrations open."
            action={
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="bg-gradient-brand text-white hover:opacity-90">
                  <Link to="/hackathons">Explore Hackathons</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/contact">Contact Team</Link>
                </Button>
              </div>
            }
          />
        ) : filteredEvents.length === 0 ? (
          /* No filter match */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-muted/20 p-12 text-center">
            <Search className="h-8 w-8 text-muted-foreground/60" />
            <h3 className="mt-3 font-display text-base font-semibold text-foreground">
              No matching events found
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your search criteria or resetting filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setKindFilter("all");
                setModeFilter("all");
              }}
              className="mt-4 text-xs"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          /* Events Grid */
          <>
            {upcoming.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Upcoming & Live Events
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    {upcoming.length} {upcoming.length === 1 ? "event" : "events"}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((e) => (
                    <EventCard key={e.id} e={e} />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div className="mt-16 space-y-4">
                <div className="flex items-center justify-between border-t border-border/60 pt-10">
                  <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                    Past Events & Recordings
                  </h2>
                  <span className="text-xs text-muted-foreground font-mono">
                    {past.length} {past.length === 1 ? "event" : "events"}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {past.map((e) => (
                    <EventCard key={e.id} e={e} isPast />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}

function EventCard({ e, isPast }: { e: SiteEvent; isPast?: boolean }) {
  const status = eventStatus(e);

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-border/60 bg-card/70 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <Link to="/events/$slug" params={{ slug: e.slug }} className="block overflow-hidden">
        {e.banner_url ? (
          <div className="h-44 overflow-hidden bg-muted">
            <img
              src={e.banner_url}
              alt={e.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center p-6 text-center">
            <Calendar className="h-10 w-10 text-primary/40" />
          </div>
        )}
      </Link>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Badge variant="secondary" className="capitalize text-[11px] font-semibold">
                {e.kind}
              </Badge>
              {e.mode && (
                <Badge variant="outline" className="capitalize text-[10px] text-muted-foreground">
                  {e.mode.replace("_", " ")}
                </Badge>
              )}
            </div>

            <span
              className={`text-[10px] font-semibold uppercase tracking-wider ${
                status.tone === "live"
                  ? "text-emerald-500 font-bold animate-pulse"
                  : status.tone === "past"
                    ? "text-muted-foreground"
                    : "text-primary"
              }`}
            >
              {status.label}
            </span>
          </div>

          <Link
            to="/events/$slug"
            params={{ slug: e.slug }}
            className="block group-hover:text-primary transition-colors"
          >
            <h3 className="font-display text-base font-bold leading-snug text-foreground">
              {e.title}
            </h3>
          </Link>

          {e.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
              {e.description}
            </p>
          )}

          <div className="space-y-1.5 text-xs text-muted-foreground/90">
            {e.starts_at && (
              <p className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span>{fmtDateTime(e.starts_at)}</span>
              </p>
            )}
            {e.location && (
              <p className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                <span className="truncate">{e.location}</span>
              </p>
            )}
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="flex-1 text-xs">
            <Link to="/events/$slug" params={{ slug: e.slug }}>
              Details
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>

          {e.registration_url && !isPast && (
            <Button
              asChild
              size="sm"
              className="bg-gradient-brand text-white text-xs hover:opacity-90"
            >
              <a href={e.registration_url} target="_blank" rel="noreferrer">
                Register
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
