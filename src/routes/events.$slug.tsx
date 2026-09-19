import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Share2,
  Video,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Markdown } from "@/components/markdown";
import { getEvent, listEvents, type SiteEvent } from "@/lib/public-cms";

export const Route = createFileRoute("/events/$slug")({
  loader: async ({ params }) => {
    const event = await getEvent(params.slug);
    if (!event) throw notFound();
    return { event };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.event) {
      return {
        meta: [{ title: "Event Not Found — Compass Crew" }, { name: "robots", content: "noindex" }],
      };
    }
    const { event } = loaderData;
    return {
      meta: [
        { title: `${event.title} — Events — Compass Crew` },
        { name: "description", content: event.description ?? event.title },
        { property: "og:title", content: `${event.title} — Compass Crew` },
        { property: "og:description", content: event.description ?? "" },
        { property: "og:type", content: "website" },
        ...(event.banner_url ? [{ property: "og:image", content: event.banner_url }] : []),
      ],
      links: [{ rel: "canonical", href: `/events/${event.slug}` }],
    };
  },
  notFoundComponent: EventNotFound,
  errorComponent: ({ error }) => (
    <Section className="py-20 text-center">
      <h2 className="font-display text-2xl font-bold text-foreground">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link to="/events">Back to all events</Link>
      </Button>
    </Section>
  ),
  component: EventDetailPage,
});

function EventNotFound() {
  return (
    <Section className="py-24 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted/30">
          <Calendar className="h-8 w-8 text-muted-foreground/60" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Event Not Found
        </h1>
        <p className="text-sm text-muted-foreground">
          This event may have concluded, been rescheduled, or is currently unpublished.
        </p>
        <div className="pt-2">
          <Button asChild variant="outline">
            <Link to="/events">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to all events
            </Link>
          </Button>
        </div>
      </div>
    </Section>
  );
}

function fmtFullDate(iso: string | null) {
  if (!iso) return "Date to be announced";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EventDetailPage() {
  const { event } = Route.useLoaderData();
  const { data: allEvents } = useQuery({ queryKey: ["site-events"], queryFn: listEvents });

  const otherEvents = (allEvents ?? []).filter((e: SiteEvent) => e.id !== event.id).slice(0, 3);

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success("Event link copied to clipboard!");
    }
  };

  const isLive =
    event.starts_at &&
    new Date(event.starts_at).getTime() <= Date.now() &&
    (!event.ends_at || new Date(event.ends_at).getTime() >= Date.now());

  const isPast = event.ends_at && new Date(event.ends_at).getTime() < Date.now();

  return (
    <>
      <Section className="max-w-4xl pt-6 pb-16">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Events
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>

        {/* Hero Visual Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-elegant">
          {event.banner_url ? (
            <div className="aspect-[21/9] max-h-[360px] w-full overflow-hidden bg-muted">
              <img
                src={event.banner_url}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[21/9] max-h-[220px] w-full bg-gradient-to-br from-primary/20 via-primary/5 to-muted flex items-center justify-center p-8">
              <div className="flex flex-col items-center gap-2 text-center text-primary/60">
                <Calendar className="h-12 w-12" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Compass Crew Event
                </span>
              </div>
            </div>
          )}

          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="capitalize text-xs font-semibold">
                  {event.kind}
                </Badge>
                {event.mode && (
                  <Badge variant="outline" className="capitalize text-xs">
                    {event.mode.replace("_", " ")}
                  </Badge>
                )}
                {isLive && (
                  <Badge className="bg-emerald-500 text-white animate-pulse text-xs">
                    ● Happening Now
                  </Badge>
                )}
                {isPast && (
                  <Badge variant="outline" className="text-muted-foreground text-xs">
                    Concluded
                  </Badge>
                )}
              </div>
            </div>

            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl leading-tight">
              {event.title}
            </h1>

            {event.description && (
              <p className="text-base text-muted-foreground leading-relaxed">{event.description}</p>
            )}

            {/* Key Event Metadata Strip */}
            <div className="grid gap-3 rounded-xl border border-border/50 bg-muted/20 p-4 sm:grid-cols-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Date & Time</p>
                  <p className="text-muted-foreground">{fmtFullDate(event.starts_at)}</p>
                  {event.ends_at && (
                    <p className="text-[11px] text-muted-foreground/80">
                      Until {fmtTime(event.ends_at)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg border border-primary/20 bg-primary/10 p-2 text-primary">
                  {event.mode === "online" ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground">Format & Location</p>
                  <p className="capitalize text-muted-foreground">
                    {event.mode ? event.mode.replace("_", " ") : "Location"}
                  </p>
                  {event.location && (
                    <p className="text-[11px] text-muted-foreground/80 truncate max-w-xs">
                      {event.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            {event.registration_url && !isPast && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-brand text-white shadow-elegant hover:opacity-90"
                >
                  <a href={event.registration_url} target="_blank" rel="noreferrer">
                    Register for Event
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Free registration · Open to students & builders
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Body Content */}
        {event.body_md && (
          <div className="mt-10 rounded-2xl border border-border/60 bg-card/60 p-6 sm:p-10 backdrop-blur-sm">
            <h2 className="font-display text-xl font-bold tracking-tight text-foreground mb-6">
              About This Event
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              <Markdown>{event.body_md}</Markdown>
            </div>
          </div>
        )}
      </Section>

      {/* Other Upcoming Events */}
      {otherEvents.length > 0 && (
        <Section className="border-t border-border/60 bg-muted/20 py-16">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                More Events from Compass Crew
              </h2>
              <Button asChild variant="ghost" size="sm" className="text-xs">
                <Link to="/events">View all events →</Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {otherEvents.map((oe: SiteEvent) => (
                <Link
                  key={oe.id}
                  to="/events/$slug"
                  params={{ slug: oe.slug }}
                  className="group block rounded-xl border border-border/60 bg-card p-4 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {oe.kind}
                  </Badge>
                  <h3 className="mt-2 font-display text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {oe.title}
                  </h3>
                  {oe.starts_at && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(oe.starts_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </Section>
      )}
    </>
  );
}
